'use client';

import React, { useState } from 'react';
import { DryRunResult, STRATEGY_META } from '@/types/rebalancing';
import { formatDuration, formatUsd } from '@/utils/rebalancing';

interface ExecutionConfirmationProps {
  result: DryRunResult;
  executed: boolean;
  onExecute: () => void;
  onReset: () => void;
}

/**
 * Final review screen: restates the chosen strategy and every final metric,
 * then runs a mock execution. There is no execution backend, so "executing"
 * is a simulated delay that resolves to a success state.
 */
export const ExecutionConfirmation: React.FC<ExecutionConfirmationProps> = ({
  result,
  executed,
  onExecute,
  onReset,
}) => {
  const [running, setRunning] = useState(false);
  const { plan, portfolioValue, costPercent } = result;

  const handleExecute = async () => {
    setRunning(true);
    // Simulated settlement — mirrors the plan's estimated time, capped so the
    // UI never hangs. Replace with a real submit-and-poll against the network.
    await new Promise((resolve) => setTimeout(resolve, Math.min(1500, plan.estimatedSeconds * 200)));
    setRunning(false);
    onExecute();
  };

  if (executed) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-brand-teal/15 dark:bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg className="w-10 h-10 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rebalance Complete</h2>
        <p className="text-gray-600 dark:text-slate-400 max-w-md mx-auto mb-6">
          {plan.tradeCount} {plan.tradeCount === 1 ? 'leg' : 'legs'} settled via the{' '}
          {STRATEGY_META[plan.strategy].label} strategy for {formatUsd(plan.totalFees)} in fees.
        </p>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-lg bg-brand-navy hover:bg-stellar-700 dark:bg-brand-teal dark:hover:bg-stellar-400 text-white dark:text-brand-navy font-semibold transition-colors"
        >
          Plan Another Rebalance
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Confirm Rebalance</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Review the final summary before executing. This is the last step before funds move.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 divide-y divide-gray-200 dark:divide-white/10">
        <SummaryRow label="Strategy" value={STRATEGY_META[plan.strategy].label} />
        <SummaryRow label="Trades" value={`${plan.tradeCount} ${plan.tradeCount === 1 ? 'leg' : 'legs'}`} />
        <SummaryRow label="Total volume" value={formatUsd(plan.totalTradeValue)} />
        <SummaryRow label="Total fees" value={formatUsd(plan.totalFees)} accent />
        <SummaryRow label="Cost of portfolio" value={`${costPercent.toFixed(2)}%`} />
        <SummaryRow label="Slippage tolerance" value={`${(result.slippage.toleranceBps / 100).toFixed(2)}%`} />
        <SummaryRow label="Estimated time" value={formatDuration(plan.estimatedSeconds)} />
        <SummaryRow label="Portfolio value" value={formatUsd(portfolioValue)} />
      </div>

      <button
        onClick={handleExecute}
        disabled={running || plan.tradeCount === 0}
        className="w-full px-6 py-4 rounded-xl bg-brand-navy hover:bg-stellar-700 dark:bg-brand-teal dark:hover:bg-stellar-400 text-white dark:text-brand-navy font-semibold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {running ? (
          <>
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            Executing…
          </>
        ) : (
          `Execute Rebalance · ${formatUsd(plan.totalFees)} fees`
        )}
      </button>
      <p className="text-center text-xs text-gray-400 dark:text-slate-500">
        Simulated execution — no on-chain transaction is submitted in this build.
      </p>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="flex items-center justify-between px-5 py-3">
    <span className="text-gray-500 dark:text-slate-400">{label}</span>
    <span className={`font-semibold ${accent ? 'text-brand-teal' : 'text-gray-900 dark:text-white'}`}>{value}</span>
  </div>
);

export default ExecutionConfirmation;
