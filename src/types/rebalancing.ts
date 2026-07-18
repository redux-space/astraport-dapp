/**
 * Types for the multi-asset rebalancing planner.
 */

export type RebalanceStrategy = 'min-cost' | 'min-time' | 'balanced';

export type RebalanceAction = 'buy' | 'sell' | 'hold';

/** A user-defined target weight for a single asset (percentage, 0-100). */
export interface AllocationTarget {
  code: string;
  targetPercent: number;
}

/** Current vs target allocation for one asset, with the derived delta. */
export interface AssetAllocation {
  code: string;
  /** USD value currently held. */
  currentValue: number;
  /** Current weight as a percentage of the portfolio (0-100). */
  currentPercent: number;
  /** Desired weight as a percentage (0-100). */
  targetPercent: number;
  /** targetPercent - currentPercent, in percentage points. */
  deltaPercent: number;
  /** Signed USD amount to trade to reach the target (positive = buy). */
  tradeValue: number;
  action: RebalanceAction;
}

/** A single fee entry for one asset's swap along a chosen route. */
export interface FeeLineItem {
  code: string;
  action: RebalanceAction;
  /** Absolute USD value being traded. */
  tradeValue: number;
  route: string;
  /** Network/protocol fee in USD. */
  networkFee: number;
  /** Route/DEX fee in USD. */
  routeFee: number;
  /** Estimated slippage cost in USD at the configured tolerance. */
  slippageCost: number;
  /** networkFee + routeFee + slippageCost. */
  totalFee: number;
  /** Estimated time for this leg, in seconds. */
  estimatedSeconds: number;
}

export interface SlippageConfig {
  /** Tolerance in basis points (100 bps = 1%). */
  toleranceBps: number;
}

/** A fully-costed plan for a single strategy. */
export interface RebalancePlan {
  strategy: RebalanceStrategy;
  fees: FeeLineItem[];
  totalFees: number;
  totalTradeValue: number;
  /** Wall-clock estimate assuming legs execute per this strategy. */
  estimatedSeconds: number;
  /** Number of assets that require a trade. */
  tradeCount: number;
}

/** Simulated execution output shown in the dry-run preview. */
export interface DryRunResult {
  plan: RebalancePlan;
  allocations: AssetAllocation[];
  slippage: SlippageConfig;
  /** Portfolio value the plan was computed against. */
  portfolioValue: number;
  /** Net cost as a share of portfolio value (percentage). */
  costPercent: number;
  /** True if estimated slippage/cost crosses the warning threshold. */
  hasWarnings: boolean;
  warnings: string[];
}

export const STRATEGY_META: Record<
  RebalanceStrategy,
  { label: string; description: string }
> = {
  'min-cost': {
    label: 'Min Cost',
    description:
      'Routes trades to minimize total fees. Prefers deeper-liquidity pairs and may batch legs, trading speed for lower cost.',
  },
  'min-time': {
    label: 'Min Time',
    description:
      'Executes legs in parallel across the fastest available routes. Completes quickest but pays a premium on fees and slippage.',
  },
  balanced: {
    label: 'Balanced',
    description:
      'Weighs cost against speed for a sensible default. Good when no single dimension dominates your priorities.',
  },
};
