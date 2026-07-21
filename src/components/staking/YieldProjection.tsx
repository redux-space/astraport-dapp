'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { YieldProjection } from '@/types/staking';
import { StakingService } from '@/services/staking';
import { Calculator, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface YieldProjectionProps {
  availableAssets?: Array<{ code: string; apyTiers: Array<{ lockupDays: number; apy: number }> }>;
  defaultAsset?: string;
}

type CompoundingFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

const LOCKUP_OPTIONS = [
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '180 days', value: 180 },
  { label: '1 year', value: 365 },
];

const COMPOUNDING_OPTIONS: { label: string; value: CompoundingFrequency }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
];

export const YieldProjectionCalculator: React.FC<YieldProjectionProps> = ({
  defaultAsset = 'XLM',
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [apy, setApy] = useState<number>(5.2);
  const [lockupDays, setLockupDays] = useState<number>(90);
  const [compounding, setCompounding] = useState<CompoundingFrequency>('daily');
  const [selectedAsset, _setSelectedAsset] = useState<string>(defaultAsset); // _setSelectedAsset reserved for future asset selector UI // eslint-disable-line @typescript-eslint/no-unused-vars
  const [projection, setProjection] = useState<YieldProjection | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = useCallback(async () => {
    if (!amount || amount <= 0) return;
    setIsCalculating(true);
    try {
      const result = await StakingService.calculateYieldProjection({
        assetCode: selectedAsset,
        amount,
        lockupDays,
        compoundingFrequency: compounding,
        apy,
      });
      setProjection(result);
    } finally {
      setIsCalculating(false);
    }
  }, [amount, apy, lockupDays, compounding, selectedAsset]);

  // Auto-calculate on param change
  useEffect(() => {
    const timer = setTimeout(calculate, 300);
    return () => clearTimeout(timer);
  }, [calculate]);

  // Sample every 5 days for chart readability
  const chartLabels =
    projection?.projectionData
      .filter((_, i) => i % 5 === 0)
      .map((p) => `Day ${p.day}`) ?? [];

  const chartValues =
    projection?.projectionData
      .filter((_, i) => i % 5 === 0)
      .map((p) => p.value) ?? [];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Portfolio Value ($)',
        data: chartValues,
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) =>
            ` $${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number | string) =>
            `$${Number(value).toLocaleString()}`,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Yield Projection Calculator
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estimate your earnings across different scenarios
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stake Amount ($)
          </label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* APY */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            APY (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={apy}
            onChange={(e) => setApy(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Lockup period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lockup Period
          </label>
          <select
            value={lockupDays}
            onChange={(e) => setLockupDays(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LOCKUP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Compounding */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Compounding
          </label>
          <select
            value={compounding}
            onChange={(e) => setCompounding(e.target.value as CompoundingFrequency)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {COMPOUNDING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      {projection && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Final Value</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              ${projection.finalValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Rewards</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              +${projection.totalRewards.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Return %</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              +{((projection.totalRewards / amount) * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {isCalculating ? (
        <div className="h-48 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Calculating projection...</span>
          </div>
        </div>
      ) : (
        projection && (
          <div className="h-48 relative">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Growth Over {lockupDays} Days
              </span>
            </div>
            <Line data={chartData} options={chartOptions as never} />
          </div>
        )
      )}
    </div>
  );
};

export default YieldProjectionCalculator;
