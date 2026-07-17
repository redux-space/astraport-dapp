'use client';

import React from 'react';
import { RebalancePlan } from '@/types/rebalancing';
import { formatUsd } from '@/utils/rebalancing';

interface Props {
  plan: RebalancePlan;
}

const actionBadge = (action: string) => {
  if (action === 'buy') return 'bg-brand-teal/15 text-brand-teal';
  if (action === 'sell') return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
  return 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-slate-300';
};

export const FeeBreakdown: React.FC<Props> = ({ plan }) => {
  if (plan.fees.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 text-center text-gray-500 dark:text-slate-400">
        No trades required — nothing to cost out.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 text-left text-gray-500 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Asset</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium text-right">Trade</th>
              <th className="px-4 py-3 font-medium text-right">Network</th>
              <th className="px-4 py-3 font-medium text-right">Route fee</th>
              <th className="px-4 py-3 font-medium text-right">Slippage</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {plan.fees.map((fee) => (
              <tr
                key={fee.code}
                className="border-b border-gray-100 dark:border-white/5 last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{fee.code}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${actionBadge(fee.action)}`}>
                      {fee.action}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{fee.route}</td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                  {formatUsd(fee.tradeValue)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">
                  {formatUsd(fee.networkFee)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">
                  {formatUsd(fee.routeFee)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">
                  {formatUsd(fee.slippageCost)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                  {formatUsd(fee.totalFee)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 dark:bg-white/5 font-semibold text-gray-900 dark:text-white">
              <td className="px-4 py-3" colSpan={2}>
                Total
              </td>
              <td className="px-4 py-3 text-right">{formatUsd(plan.totalTradeValue)}</td>
              <td className="px-4 py-3" colSpan={3} />
              <td className="px-4 py-3 text-right text-brand-teal">{formatUsd(plan.totalFees)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default FeeBreakdown;
