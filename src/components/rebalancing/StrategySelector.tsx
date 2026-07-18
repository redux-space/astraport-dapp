'use client';

import React from 'react';
import { RebalancePlan, RebalanceStrategy, STRATEGY_META } from '@/types/rebalancing';
import { formatUsd, formatDuration } from '@/utils/rebalancing';

interface Props {
  selected: RebalanceStrategy;
  plans: Record<RebalanceStrategy, RebalancePlan>;
  recommended: { strategy: RebalanceStrategy; reason: string };
  onSelect: (strategy: RebalanceStrategy) => void;
}

const ORDER: RebalanceStrategy[] = ['min-cost', 'balanced', 'min-time'];

export const StrategySelector: React.FC<Props> = ({ selected, plans, recommended, onSelect }) => {
  return (
    <div role="radiogroup" aria-label="Execution strategy" className="space-y-4">
      {ORDER.map((strategy) => {
        const meta = STRATEGY_META[strategy];
        const plan = plans[strategy];
        const isSelected = selected === strategy;
        const isRecommended = recommended.strategy === strategy;

        return (
          <label
            key={strategy}
            className={`block cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${
              isSelected
                ? 'border-brand-teal bg-brand-teal/5 dark:bg-brand-teal/10'
                : 'border-gray-200 dark:border-white/10 hover:border-brand-teal/40 bg-white dark:bg-white/5'
            }`}
          >
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="strategy"
                value={strategy}
                checked={isSelected}
                onChange={() => onSelect(strategy)}
                className="sr-only"
              />
              {/* Custom radio dot */}
              <span
                className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected ? 'border-brand-teal' : 'border-gray-400 dark:border-slate-500'
                }`}
                aria-hidden="true"
              >
                {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-brand-teal" />}
              </span>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {meta.label}
                  </span>
                  {isRecommended && (
                    <span className="rounded-full bg-brand-teal px-2 py-0.5 text-xs font-bold text-brand-navy">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                  {meta.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span className="text-gray-500 dark:text-slate-400">
                    Est. fees{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatUsd(plan.totalFees)}
                    </span>
                  </span>
                  <span className="text-gray-500 dark:text-slate-400">
                    Est. time{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatDuration(plan.estimatedSeconds)}
                    </span>
                  </span>
                  <span className="text-gray-500 dark:text-slate-400">
                    Trades{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {plan.tradeCount}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </label>
        );
      })}

      <div className="rounded-xl bg-brand-navy/5 dark:bg-white/5 border border-brand-navy/10 dark:border-white/10 p-4">
        <p className="text-sm text-gray-700 dark:text-slate-300">
          <span className="font-semibold text-brand-navy dark:text-brand-teal">Why {STRATEGY_META[recommended.strategy].label}? </span>
          {recommended.reason}
        </p>
      </div>
    </div>
  );
};

export default StrategySelector;
