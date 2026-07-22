'use client';

import React, { useState } from 'react';
import {
  ScheduledRebalance,
  ScheduleFrequency,
  RebalanceStrategy,
  AllocationTarget,
  STRATEGY_META,
} from '@/types/rebalancing';
import { formatPercent } from '@/utils';

const FREQUENCY_OPTIONS: { value: ScheduleFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ScheduledRebalancingProps {
  schedules: ScheduledRebalance[];
  defaultTargets: AllocationTarget[];
  onCreate: (schedule: ScheduledRebalance) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}

export const ScheduledRebalancing: React.FC<ScheduledRebalancingProps> = ({
  schedules,
  defaultTargets,
  onCreate,
  onToggle,
  onDelete,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [strategy, setStrategy] = useState<RebalanceStrategy>('balanced');
  const [slippageBps, setSlippageBps] = useState(100);

  const resetForm = () => {
    setName('');
    setFrequency('weekly');
    setDayOfWeek(1);
    setDayOfMonth(1);
    setTimeOfDay('09:00');
    setStrategy('balanced');
    setSlippageBps(100);
    setIsCreating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schedule: ScheduledRebalance = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      timeOfDay,
      targets: defaultTargets,
      strategy,
      slippageBps,
      enabled: true,
      createdAt: Date.now(),
    };
    onCreate(schedule);
    resetForm();
  };

  const formatScheduleDescription = (schedule: ScheduledRebalance) => {
    const time = schedule.timeOfDay;
    if (schedule.frequency === 'daily') {
      return `Every day at ${time}`;
    }
    if (schedule.frequency === 'weekly') {
      return `Every ${DAY_NAMES[schedule.dayOfWeek ?? 0]} at ${time}`;
    }
    return `Day ${schedule.dayOfMonth} of each month at ${time}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scheduled Rebalancing</h2>
          <p className="mt-1 text-gray-600 dark:text-slate-400">
            Automate your portfolio rebalancing on a recurring schedule.
          </p>
        </div>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-xl bg-brand-teal text-brand-navy font-semibold hover:bg-stellar-400 transition-colors"
          >
            + New Schedule
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Schedule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly BTC/ETH Rebalance"
              required
              className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/10 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
                className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/10 px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/10 px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  {DAY_NAMES.map((day, i) => (
                    <option key={i} value={i}>{day}</option>
                  ))}
                </select>
              </div>
            )}

            {frequency === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Day of Month</label>
                <select
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/10 px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Time (UTC)</label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/10 px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as RebalanceStrategy)}
                className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/10 px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                {(Object.keys(STRATEGY_META) as RebalanceStrategy[]).map((s) => (
                  <option key={s} value={s}>{STRATEGY_META[s].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Slippage Tolerance (bps)</label>
              <input
                type="number"
                value={slippageBps}
                onChange={(e) => setSlippageBps(Number(e.target.value))}
                min={10}
                max={500}
                className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/10 px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/15 text-gray-700 dark:text-slate-200 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name}
              className="px-5 py-2 rounded-xl bg-brand-navy dark:bg-brand-teal text-white dark:text-brand-navy font-semibold hover:bg-stellar-700 dark:hover:bg-stellar-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Create Schedule
            </button>
          </div>
        </form>
      )}

      {schedules.length === 0 && !isCreating && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/15 p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400">No scheduled rebalances yet. Create one to automate your portfolio.</p>
        </div>
      )}

      {schedules.length > 0 && (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`rounded-2xl border p-5 transition-colors ${
                schedule.enabled
                  ? 'border-brand-teal/30 bg-brand-teal/5 dark:bg-brand-teal/10'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{schedule.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{formatScheduleDescription(schedule)}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-500">
                    <span>Strategy: {STRATEGY_META[schedule.strategy].label}</span>
                    <span>·</span>
                    <span>Slippage: {schedule.slippageBps} bps</span>
                    <span>·</span>
                    <span>Assets: {schedule.targets.length}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggle(schedule.id, !schedule.enabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      schedule.enabled ? 'bg-brand-teal' : 'bg-gray-300 dark:bg-white/20'
                    }`}
                    aria-label={schedule.enabled ? 'Disable schedule' : 'Enable schedule'}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        schedule.enabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(schedule.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    aria-label="Delete schedule"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledRebalancing;
