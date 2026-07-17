'use client';

import React from 'react';
import { AssetAllocation } from '@/types/rebalancing';
import { formatCurrency, formatPercent } from '@/utils';

interface Props {
  allocations: AssetAllocation[];
  /** Called when a target weight is edited. */
  onTargetChange: (code: string, percent: number) => void;
}

const actionBadge = (action: AssetAllocation['action']) => {
  switch (action) {
    case 'buy':
      return 'bg-brand-teal/15 text-brand-teal';
    case 'sell':
      return 'bg-red-500/15 text-red-500 dark:text-red-400';
    default:
      return 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-slate-400';
  }
};

/** A dual bar showing current (muted) vs target (teal) weight. */
const AllocationBar: React.FC<{ current: number; target: number }> = ({ current, target }) => (
  <div className="space-y-1.5 min-w-[120px]">
    <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-brand-navy dark:bg-slate-400"
        style={{ width: `${Math.min(100, current)}%` }}
      />
    </div>
    <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-brand-teal"
        style={{ width: `${Math.min(100, target)}%` }}
      />
    </div>
  </div>
);

export const AssetAllocationComparison: React.FC<Props> = ({ allocations, onTargetChange }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-white/10">
            <th className="py-3 pr-4 font-medium">Asset</th>
            <th className="py-3 px-4 font-medium">Current</th>
            <th className="py-3 px-4 font-medium">Target</th>
            <th className="py-3 px-4 font-medium hidden md:table-cell">
              <span className="flex flex-col leading-tight">
                <span>Allocation</span>
                <span className="text-[10px] font-normal">navy = current · teal = target</span>
              </span>
            </th>
            <th className="py-3 px-4 font-medium text-right">Δ</th>
            <th className="py-3 pl-4 font-medium text-right">Trade</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((a) => (
            <tr
              key={a.code}
              className="border-b border-gray-100 dark:border-white/5 last:border-0"
            >
              <td className="py-3 pr-4">
                <span className="font-semibold text-gray-900 dark:text-white">{a.code}</span>
                <span className="block text-xs text-gray-400 dark:text-slate-500">
                  {formatCurrency(a.currentValue)}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-700 dark:text-slate-300">
                {formatPercent(a.currentPercent)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={Number.isFinite(a.targetPercent) ? a.targetPercent : 0}
                    onChange={(e) => onTargetChange(a.code, parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/15 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all"
                    aria-label={`Target percent for ${a.code}`}
                  />
                  <span className="text-gray-400 dark:text-slate-500">%</span>
                </div>
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <AllocationBar current={a.currentPercent} target={a.targetPercent} />
              </td>
              <td className="py-3 px-4 text-right font-medium">
                <span
                  className={
                    a.deltaPercent > 0.05
                      ? 'text-brand-teal'
                      : a.deltaPercent < -0.05
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-gray-400 dark:text-slate-500'
                  }
                >
                  {a.deltaPercent >= 0 ? '+' : ''}
                  {formatPercent(a.deltaPercent)}
                </span>
              </td>
              <td className="py-3 pl-4 text-right">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase ${actionBadge(
                    a.action,
                  )}`}
                >
                  {a.action === 'hold' ? 'Hold' : `${a.action} ${formatCurrency(Math.abs(a.tradeValue))}`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetAllocationComparison;
