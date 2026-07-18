/**
 * Pure, deterministic logic for the rebalancing planner.
 *
 * There is no price feed or execution backend in this app, so prices and
 * route characteristics are modeled with the constants below. This module is
 * the single seam where a real price service and routing engine would plug in:
 * replace ASSET_PRICES with a live feed and estimateLeg() with quotes from a
 * router, and the rest of the wizard keeps working unchanged.
 */

import { Asset, Portfolio } from '@/types';
import {
  AllocationTarget,
  AssetAllocation,
  DryRunResult,
  FeeLineItem,
  RebalanceAction,
  RebalancePlan,
  RebalanceStrategy,
  SlippageConfig,
} from '@/types/rebalancing';

/** Mock spot prices in USD, keyed by asset code. Native XLM plus common assets. */
export const ASSET_PRICES: Record<string, number> = {
  XLM: 0.11,
  USDC: 1.0,
  BTC: 64200,
  ETH: 3350,
  yXLM: 0.112,
  AQUA: 0.0045,
};

/** Fallback price for assets not in the table, so the planner never divides by nothing. */
const DEFAULT_PRICE = 1.0;

/** Warning thresholds. */
export const WARNING_COST_PERCENT = 1.5; // total cost > 1.5% of portfolio
export const WARNING_SLIPPAGE_BPS = 300; // tolerance above 3%
export const MIN_SLIPPAGE_BPS = 50; // below 0.5% risks failed fills

export const DEFAULT_SLIPPAGE_BPS = 100; // 1%

export const getPrice = (code: string): number =>
  ASSET_PRICES[code] ?? DEFAULT_PRICE;

/** USD value of a single asset holding. */
export const assetValue = (asset: Asset): number =>
  parseFloat(asset.balance || '0') * getPrice(asset.code);

/**
 * Per-strategy multipliers. Min-cost trades cheaper but slower routes;
 * min-time pays up for speed; balanced sits between them.
 */
const STRATEGY_PROFILE: Record<
  RebalanceStrategy,
  { feeMultiplier: number; slippageMultiplier: number; speedMultiplier: number; parallel: boolean }
> = {
  'min-cost': { feeMultiplier: 0.8, slippageMultiplier: 0.85, speedMultiplier: 1.6, parallel: false },
  'min-time': { feeMultiplier: 1.35, slippageMultiplier: 1.3, speedMultiplier: 0.6, parallel: true },
  balanced: { feeMultiplier: 1.0, slippageMultiplier: 1.0, speedMultiplier: 1.0, parallel: false },
};

/** Base route fee rate (fraction of trade value) by asset code. Deeper liquidity = cheaper. */
const BASE_ROUTE_RATE: Record<string, number> = {
  USDC: 0.0006,
  XLM: 0.0008,
  BTC: 0.001,
  ETH: 0.001,
  yXLM: 0.0015,
  AQUA: 0.0025,
};

const routeRate = (code: string): number => BASE_ROUTE_RATE[code] ?? 0.002;

/** Human-readable route label for a leg. */
const routeFor = (code: string, strategy: RebalanceStrategy): string => {
  if (code === 'XLM') return 'Stellar DEX (direct)';
  if (strategy === 'min-cost') return `XLM → ${code} (via SDEX)`;
  if (strategy === 'min-time') return `${code} (aggregated pools)`;
  return `XLM → ${code} (path payment)`;
};

const actionFor = (deltaValue: number): RebalanceAction => {
  if (deltaValue > 0.01) return 'buy';
  if (deltaValue < -0.01) return 'sell';
  return 'hold';
};

/**
 * Derive current allocations from the portfolio and merge with target weights.
 * Assets present in either the portfolio or the targets list are included.
 */
export const computeAllocations = (
  portfolio: Portfolio | null,
  targets: AllocationTarget[],
): { allocations: AssetAllocation[]; portfolioValue: number } => {
  const assets = portfolio?.assets ?? [];
  const valueByCode = new Map<string, number>();

  for (const asset of assets) {
    valueByCode.set(asset.code, (valueByCode.get(asset.code) ?? 0) + assetValue(asset));
  }

  const targetByCode = new Map(targets.map((t) => [t.code, t.targetPercent]));

  // Union of codes so a target for an asset not yet held still shows as a buy.
  const codes = new Set<string>([...valueByCode.keys(), ...targetByCode.keys()]);

  const portfolioValue = Array.from(valueByCode.values()).reduce((a, b) => a + b, 0);

  const allocations: AssetAllocation[] = Array.from(codes).map((code) => {
    const currentValue = valueByCode.get(code) ?? 0;
    const currentPercent = portfolioValue > 0 ? (currentValue / portfolioValue) * 100 : 0;
    const targetPercent = targetByCode.get(code) ?? 0;
    const deltaPercent = targetPercent - currentPercent;
    const targetValue = (targetPercent / 100) * portfolioValue;
    const tradeValue = targetValue - currentValue;
    return {
      code,
      currentValue,
      currentPercent,
      targetPercent,
      deltaPercent,
      tradeValue,
      action: actionFor(tradeValue),
    };
  });

  // Stable ordering: largest current holding first, then alphabetical.
  allocations.sort((a, b) => b.currentValue - a.currentValue || a.code.localeCompare(b.code));

  return { allocations, portfolioValue };
};

/** Estimate the fee line item for a single asset leg under a strategy. */
const estimateLeg = (
  alloc: AssetAllocation,
  strategy: RebalanceStrategy,
  slippage: SlippageConfig,
): FeeLineItem => {
  const profile = STRATEGY_PROFILE[strategy];
  const tradeValue = Math.abs(alloc.tradeValue);

  const networkFee = tradeValue > 0 ? 0.02 * profile.feeMultiplier : 0; // ~2 cents base network fee
  const routeFee = tradeValue * routeRate(alloc.code) * profile.feeMultiplier;
  const slippageCost =
    tradeValue * (slippage.toleranceBps / 10000) * profile.slippageMultiplier;

  // Base ~4s settlement per leg on Stellar, scaled by strategy speed.
  const estimatedSeconds = tradeValue > 0 ? Math.round(4 * profile.speedMultiplier * 10) / 10 : 0;

  return {
    code: alloc.code,
    action: alloc.action,
    tradeValue,
    route: routeFor(alloc.code, strategy),
    networkFee,
    routeFee,
    slippageCost,
    totalFee: networkFee + routeFee + slippageCost,
    estimatedSeconds,
  };
};

/** Build a fully-costed plan for one strategy. */
export const buildPlan = (
  allocations: AssetAllocation[],
  strategy: RebalanceStrategy,
  slippage: SlippageConfig,
): RebalancePlan => {
  const profile = STRATEGY_PROFILE[strategy];
  const trading = allocations.filter((a) => a.action !== 'hold');
  const fees = trading.map((a) => estimateLeg(a, strategy, slippage));

  const totalFees = fees.reduce((sum, f) => sum + f.totalFee, 0);
  const totalTradeValue = fees.reduce((sum, f) => sum + f.tradeValue, 0);

  // Parallel strategies run legs concurrently (wall-clock = slowest leg);
  // sequential strategies sum the legs.
  const legTimes = fees.map((f) => f.estimatedSeconds);
  const estimatedSeconds = profile.parallel
    ? legTimes.reduce((max, t) => Math.max(max, t), 0)
    : legTimes.reduce((a, b) => a + b, 0);

  return {
    strategy,
    fees,
    totalFees,
    totalTradeValue,
    estimatedSeconds,
    tradeCount: trading.length,
  };
};

/** Build plans for every strategy (used to compare and recommend). */
export const buildAllPlans = (
  allocations: AssetAllocation[],
  slippage: SlippageConfig,
): Record<RebalanceStrategy, RebalancePlan> => ({
  'min-cost': buildPlan(allocations, 'min-cost', slippage),
  'min-time': buildPlan(allocations, 'min-time', slippage),
  balanced: buildPlan(allocations, 'balanced', slippage),
});

/**
 * Recommend a strategy: min-cost when fees dominate (large portfolio moves),
 * min-time when the cost gap is small, balanced otherwise. Returns the strategy
 * plus a short justification string.
 */
export const recommendStrategy = (
  plans: Record<RebalanceStrategy, RebalancePlan>,
  portfolioValue: number,
): { strategy: RebalanceStrategy; reason: string } => {
  const cost = plans['min-cost'];
  const time = plans['min-time'];

  if (cost.tradeCount === 0) {
    return { strategy: 'balanced', reason: 'No trades needed — allocations already match targets.' };
  }

  const feeSpread = time.totalFees - cost.totalFees;
  const feeSpreadPercent = portfolioValue > 0 ? (feeSpread / portfolioValue) * 100 : 0;
  const timeSaved = cost.estimatedSeconds - time.estimatedSeconds;

  // If choosing speed costs less than 0.1% of the portfolio extra, it's worth it.
  if (feeSpreadPercent < 0.1 && timeSaved > 0) {
    return {
      strategy: 'min-time',
      reason: `Speed costs only ${formatUsd(feeSpread)} more (${feeSpreadPercent.toFixed(2)}% of portfolio) while saving ~${timeSaved.toFixed(1)}s.`,
    };
  }

  // If fees are a meaningful share of the move, prioritize cost.
  if (feeSpreadPercent >= 0.25) {
    return {
      strategy: 'min-cost',
      reason: `Min Cost saves ${formatUsd(feeSpread)} vs. Min Time (${feeSpreadPercent.toFixed(2)}% of portfolio).`,
    };
  }

  return {
    strategy: 'balanced',
    reason: `Balanced sits between ${formatUsd(cost.totalFees)} cost and ~${time.estimatedSeconds.toFixed(1)}s speed with no dimension dominating.`,
  };
};

/** Assemble the dry-run result for a chosen strategy, including warnings. */
export const buildDryRun = (
  allocations: AssetAllocation[],
  strategy: RebalanceStrategy,
  slippage: SlippageConfig,
  portfolioValue: number,
): DryRunResult => {
  const plan = buildPlan(allocations, strategy, slippage);
  const costPercent = portfolioValue > 0 ? (plan.totalFees / portfolioValue) * 100 : 0;

  const warnings: string[] = [];
  if (costPercent > WARNING_COST_PERCENT) {
    warnings.push(
      `Estimated cost is ${costPercent.toFixed(2)}% of portfolio value, above the ${WARNING_COST_PERCENT}% comfort threshold.`,
    );
  }
  if (slippage.toleranceBps > WARNING_SLIPPAGE_BPS) {
    warnings.push(
      `Slippage tolerance of ${(slippage.toleranceBps / 100).toFixed(2)}% is high and may lead to unfavorable fills.`,
    );
  }
  if (slippage.toleranceBps < MIN_SLIPPAGE_BPS) {
    warnings.push(
      `Slippage tolerance of ${(slippage.toleranceBps / 100).toFixed(2)}% is very tight and trades may fail to fill.`,
    );
  }

  return {
    plan,
    allocations,
    slippage,
    portfolioValue,
    costPercent,
    hasWarnings: warnings.length > 0,
    warnings,
  };
};

/** Sum of all target weights (used for the 100% validation). */
export const sumTargets = (targets: AllocationTarget[]): number =>
  targets.reduce((sum, t) => sum + (Number.isFinite(t.targetPercent) ? t.targetPercent : 0), 0);

/** Local USD formatter kept dependency-free for use inside justification strings. */
export const formatUsd = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

/** Format a seconds duration compactly (e.g. "6.4s" or "1m 12s"). */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
};
