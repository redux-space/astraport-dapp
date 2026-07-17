'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useWalletStore, useRebalanceStore, RebalanceStep } from '@/store';
import { Portfolio } from '@/types';
import { AllocationTarget } from '@/types/rebalancing';
import {
  buildAllPlans,
  buildDryRun,
  computeAllocations,
  recommendStrategy,
  sumTargets,
} from '@/utils/rebalancing';
import { formatPercent } from '@/utils';
import { AllocationVisualization } from './AllocationVisualization';
import { AssetAllocationComparison } from './AssetAllocationComparison';
import { StrategySelector } from './StrategySelector';
import { FeeBreakdown } from './FeeBreakdown';
import { SlippageWarning } from './SlippageWarning';
import { DryRunPreview } from './DryRunPreview';
import { ExecutionConfirmation } from './ExecutionConfirmation';

/**
 * Sample portfolio used when no wallet is connected, so the planner is fully
 * explorable. Real holdings from the wallet store take precedence.
 */
const SAMPLE_PORTFOLIO: Portfolio = {
  totalBalance: '0',
  baseCurrency: 'USD',
  lastUpdated: 0,
  assets: [
    { code: 'XLM', issuer: '', balance: '45000', native: true },
    { code: 'USDC', issuer: 'GA5Z', balance: '3200', native: false },
    { code: 'BTC', issuer: 'GBTC', balance: '0.12', native: false },
    { code: 'ETH', issuer: 'GETH', balance: '1.4', native: false },
  ],
};

const STEP_LABELS = ['Allocations', 'Strategy', 'Fees & Slippage', 'Review'];

/** Seed target weights from current allocations rounded to whole percents. */
const seedTargets = (portfolio: Portfolio): AllocationTarget[] => {
  const { allocations } = computeAllocations(portfolio, []);
  return allocations.map((a) => ({
    code: a.code,
    targetPercent: Math.round(a.currentPercent),
  }));
};

export const RebalancingWizard: React.FC = () => {
  const portfolioFromStore = useWalletStore((s) => s.portfolio);
  const portfolio = portfolioFromStore ?? SAMPLE_PORTFOLIO;
  const usingSample = !portfolioFromStore;

  const {
    step,
    targets,
    strategy,
    slippageBps,
    dryRun,
    executed,
    setStep,
    setTargets,
    setTargetPercent,
    setStrategy,
    setSlippageBps,
    setDryRun,
    setExecuted,
    reset,
  } = useRebalanceStore();

  const [showDryRun, setShowDryRun] = useState(false);

  // Seed targets once from the active portfolio if none are set yet.
  useEffect(() => {
    if (targets.length === 0) {
      setTargets(seedTargets(portfolio));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Everything below recomputes synchronously from targets/strategy/slippage.
  const { allocations, portfolioValue } = useMemo(
    () => computeAllocations(portfolio, targets),
    [portfolio, targets],
  );

  const slippage = useMemo(() => ({ toleranceBps: slippageBps }), [slippageBps]);

  const plans = useMemo(
    () => buildAllPlans(allocations, slippage),
    [allocations, slippage],
  );

  const recommended = useMemo(
    () => recommendStrategy(plans, portfolioValue),
    [plans, portfolioValue],
  );

  const targetsSum = sumTargets(targets);
  const targetsValid = Math.abs(targetsSum - 100) < 0.5;

  const goNext = () => setStep(Math.min(3, step + 1) as RebalanceStep);
  const goBack = () => setStep(Math.max(0, step - 1) as RebalanceStep);

  const handleDryRun = () => {
    setDryRun(buildDryRun(allocations, strategy, slippage, portfolioValue));
    setShowDryRun(true);
  };

  const confirmDryRun = () => {
    setShowDryRun(false);
    setStep(3);
  };

  const handleExecute = () => setExecuted(true);

  const handleReset = () => {
    reset();
    setTargets(seedTargets(portfolio));
  };

  // Ensure the review step always has a fresh dry-run to display.
  const reviewResult = useMemo(
    () => dryRun ?? buildDryRun(allocations, strategy, slippage, portfolioValue),
    [dryRun, allocations, strategy, slippage, portfolioValue],
  );

  return (
    <div className="space-y-8">
      {usingSample && (
        <div className="rounded-xl border border-brand-teal/30 bg-brand-teal/5 dark:bg-brand-teal/10 px-4 py-3 text-sm text-gray-700 dark:text-slate-300">
          No wallet connected — showing a sample portfolio so you can explore the planner.
        </div>
      )}

      {/* Step indicator */}
      <nav aria-label="Progress" className="flex items-center">
        {STEP_LABELS.map((label, i) => {
          const state = i < step ? 'done' : i === step ? 'active' : 'todo';
          return (
            <React.Fragment key={label}>
              <button
                type="button"
                onClick={() => i < step && setStep(i as RebalanceStep)}
                disabled={i > step}
                className="flex items-center gap-2 group"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    state === 'active'
                      ? 'bg-brand-teal text-brand-navy'
                      : state === 'done'
                        ? 'bg-brand-navy text-white dark:bg-brand-teal/30 dark:text-brand-teal'
                        : 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-slate-400'
                  }`}
                >
                  {state === 'done' ? '✓' : i + 1}
                </span>
                <span
                  className={`hidden sm:block text-sm font-medium ${
                    state === 'active'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </button>
              {i < STEP_LABELS.length - 1 && (
                <span className="mx-3 h-px flex-1 bg-gray-200 dark:bg-white/10" />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Step body */}
      <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 md:p-8 shadow-sm">
        {step === 0 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set target allocations</h2>
              <p className="mt-1 text-gray-600 dark:text-slate-400">
                Adjust the target weight for each asset. Targets must sum to 100%.
              </p>
            </div>
            <AllocationVisualization allocations={allocations} />
            <AssetAllocationComparison allocations={allocations} onTargetChange={setTargetPercent} />
            <div
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
                targetsValid
                  ? 'bg-brand-teal/10 text-brand-teal'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              <span>Target total</span>
              <span>
                {formatPercent(targetsSum)} {targetsValid ? '· balanced' : '· must equal 100%'}
              </span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose a strategy</h2>
              <p className="mt-1 text-gray-600 dark:text-slate-400">
                Each strategy trades off cost against speed. Estimates update with your slippage tolerance.
              </p>
            </div>
            <StrategySelector
              selected={strategy}
              plans={plans}
              recommended={recommended}
              onSelect={setStrategy}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fees & slippage</h2>
              <p className="mt-1 text-gray-600 dark:text-slate-400">
                Review the per-asset cost breakdown and configure your slippage tolerance.
              </p>
            </div>
            <SlippageWarning toleranceBps={slippageBps} onChange={setSlippageBps} />
            <FeeBreakdown plan={plans[strategy]} />
          </div>
        )}

        {step === 3 && (
          <ExecutionConfirmation
            result={reviewResult}
            executed={executed}
            onExecute={handleExecute}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Footer controls */}
      {!(step === 3 && executed) && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-gray-700 dark:text-slate-200 font-medium hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>

          {step === 0 && (
            <button
              type="button"
              onClick={goNext}
              disabled={!targetsValid}
              className="px-6 py-2.5 rounded-xl bg-brand-navy dark:bg-brand-teal text-white dark:text-brand-navy font-semibold hover:bg-stellar-700 dark:hover:bg-stellar-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue to strategy
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-2.5 rounded-xl bg-brand-navy dark:bg-brand-teal text-white dark:text-brand-navy font-semibold hover:bg-stellar-700 dark:hover:bg-stellar-400 transition-colors"
            >
              Continue to fees
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleDryRun}
              className="px-6 py-2.5 rounded-xl bg-brand-navy dark:bg-brand-teal text-white dark:text-brand-navy font-semibold hover:bg-stellar-700 dark:hover:bg-stellar-400 transition-colors"
            >
              Run dry-run preview
            </button>
          )}
        </div>
      )}

      <DryRunPreview
        open={showDryRun}
        result={dryRun}
        onClose={() => setShowDryRun(false)}
        onConfirm={confirmDryRun}
      />
    </div>
  );
};

export default RebalancingWizard;
