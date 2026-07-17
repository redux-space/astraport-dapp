'use client';

import React from 'react';
import {
  MIN_SLIPPAGE_BPS,
  WARNING_SLIPPAGE_BPS,
} from '@/utils/rebalancing';

interface Props {
  toleranceBps: number;
  onChange: (bps: number) => void;
}

const PRESETS = [50, 100, 200, 500];

export const SlippageWarning: React.FC<Props> = ({ toleranceBps, onChange }) => {
  const percent = toleranceBps / 100;
  const tooHigh = toleranceBps > WARNING_SLIPPAGE_BPS;
  const tooLow = toleranceBps < MIN_SLIPPAGE_BPS;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value)) {
      onChange(0);
      return;
    }
    // Input is in percent; store as bps. Clamp to a sane range.
    const bps = Math.round(Math.min(Math.max(value, 0), 50) * 100);
    onChange(bps);
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Slippage tolerance</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Maximum price movement you&apos;ll accept before a leg is rejected.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={percent}
              onChange={handleInput}
              aria-label="Slippage tolerance percent"
              className="w-24 rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 pr-8 text-right text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
              %
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((bps) => (
          <button
            key={bps}
            type="button"
            onClick={() => onChange(bps)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              toleranceBps === bps
                ? 'bg-brand-teal text-brand-navy'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            {bps / 100}%
          </button>
        ))}
      </div>

      {tooHigh && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            {percent.toFixed(2)}% is a high tolerance. Trades will fill more reliably but you may
            receive an unfavorable price.
          </span>
        </div>
      )}

      {tooLow && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            {percent.toFixed(2)}% is very tight. Legs may fail to fill if the market moves during
            execution.
          </span>
        </div>
      )}
    </div>
  );
};

export default SlippageWarning;
