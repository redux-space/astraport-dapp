'use client';

import React from 'react';
import { DryRunResult } from '@/types/rebalancing';
import { STRATEGY_META } from '@/types/rebalancing';
import { formatDuration, formatUsd } from '@/utils/rebalancing';

interface DryRunPreviewProps {
  open: boolean;
  result: DryRunResult | null;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Modal showing the full simulated execution for the chosen strategy: every
 * leg with its route, trade value, fees and time, plus aggregate totals.
 */
export const DryRunPreview: React.FC<DryRunPreviewProps> = ({ open, result, onClose, onConfirm }) => {
  if (!open || !result) return null;

  const { plan, slippage, portfolioValue, costPercent, warnings } = result;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Dry-run execution preview"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-white/10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dry-run Preview</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Simulated {STRATEGY_META[plan.strategy].label} execution — no funds move
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryTile label="Legs" value={String(plan.tradeCount)} />
            <SummaryTile label="Volume" value={formatUsd(plan.totalTradeValue)} />
            <SummaryTile label="Total fees" value={formatUsd(plan.totalFees)} accent />
            <SummaryTile label="Est. time" value={formatDuration(plan.estimatedSeconds)} />
          </div>

          {warnings.length > 0 && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-500/10 p-4">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">Warnings</p>
              <ul className="list-disc list-inside space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-700 dark:text-amber-300/90">{w}</li>
                ))}
              </ul>
            </div>
          )}

          {plan.tradeCount === 0 ? (
            <p className="text-center text-gray-500 dark:text-slate-400 py-8">
              No trades required — your allocations already match the targets.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 text-left text-gray-500 dark:text-slate-400">
                    <th className="px-4 py-3 font-medium">Leg</th>
                    <th className="px-4 py-3 font-medium">Route</th>
                    <th className="px-4 py-3 font-medium text-right">Value</th>
                    <th className="px-4 py-3 font-medium text-right">Fee</th>
                    <th className="px-4 py-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {plan.fees.map((leg, i) => (
                    <tr key={leg.code}>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 dark:text-slate-500 mr-2">{i + 1}.</span>
                        <span
                          className={`font-semibold uppercase text-xs mr-1 ${
                            leg.action === 'buy'
                              ? 'text-brand-teal'
                              : 'text-brand-navy dark:text-stellar-300'
                          }`}
                        >
                          {leg.action}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">{leg.code}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{leg.route}</td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatUsd(leg.tradeValue)}</td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatUsd(leg.totalFee)}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">{formatDuration(leg.estimatedSeconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-slate-400">
            <span>Portfolio value: {formatUsd(portfolioValue)}</span>
            <span>Slippage tolerance: {(slippage.toleranceBps / 100).toFixed(2)}%</span>
            <span>Cost: {costPercent.toFixed(2)}% of portfolio</span>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-white/15 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium"
          >
            Back
          </button>
          <button
            onClick={onConfirm}
            disabled={plan.tradeCount === 0}
            className="px-5 py-2.5 rounded-lg bg-brand-navy hover:bg-stellar-700 dark:bg-brand-teal dark:hover:bg-stellar-400 text-white dark:text-brand-navy font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Proceed to Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryTile: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1">{label}</p>
    <p className={`text-lg font-bold ${accent ? 'text-brand-teal' : 'text-gray-900 dark:text-white'}`}>{value}</p>
  </div>
);

export default DryRunPreview;
