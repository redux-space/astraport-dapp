'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { AssetAllocation } from '@/types/rebalancing';
import { formatPercent } from '@/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

/** Brand-aligned palette cycled across assets. */
const PALETTE = [
  '#12C6B2', // brand teal
  '#0F2747', // brand navy
  '#2dd0bf',
  '#4cd9cc',
  '#0c1d36',
  '#b2eae5',
];

const colorAt = (index: number): string => PALETTE[index % PALETTE.length];

interface Props {
  allocations: AssetAllocation[];
}

const buildData = (
  allocations: AssetAllocation[],
  key: 'currentPercent' | 'targetPercent',
) => ({
  labels: allocations.map((a) => a.code),
  datasets: [
    {
      data: allocations.map((a) => Math.max(0, a[key])),
      backgroundColor: allocations.map((_, i) => colorAt(i)),
      borderColor: 'rgba(255,255,255,0.6)',
      borderWidth: 1,
    },
  ],
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { label: string; parsed: number }) =>
          `${ctx.label}: ${formatPercent(ctx.parsed)}`,
      },
    },
  },
  cutout: '62%',
};

export const AllocationVisualization: React.FC<Props> = ({ allocations }) => {
  const visible = allocations.filter((a) => a.currentPercent > 0 || a.targetPercent > 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="flex flex-col items-center">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Current</p>
        <div className="relative w-44 h-44">
          <Doughnut data={buildData(visible, 'currentPercent')} options={doughnutOptions} />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Target</p>
        <div className="relative w-44 h-44">
          <Doughnut data={buildData(visible, 'targetPercent')} options={doughnutOptions} />
        </div>
      </div>

      {/* Shared legend */}
      <div className="sm:col-span-2 flex flex-wrap justify-center gap-x-5 gap-y-2 pt-2">
        {visible.map((a, i) => (
          <div key={a.code} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: colorAt(i) }}
            />
            <span className="text-gray-700 dark:text-slate-300 font-medium">{a.code}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllocationVisualization;
