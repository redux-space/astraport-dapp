'use client';

import React from 'react';
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
import { StakedAsset } from '@/types/staking';
import { ArrowLeft, Lock, TrendingUp, Clock, DollarSign, Award } from 'lucide-react';
import { formatDistanceToNow } from '@/utils/formatters';

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

interface AssetDetailPageProps {
  asset: StakedAsset;
  onBack?: () => void;
  onUnstake?: (assetId: string) => void;
  onCompound?: (assetId: string) => void;
}

export const AssetDetailPage: React.FC<AssetDetailPageProps> = ({
  asset,
  onBack,
  onUnstake,
  onCompound,
}) => {
  const performance = asset.performance ?? [];
  const chartLabels = performance.map((p) => p.date);
  const chartValues = performance.map((p) => p.value);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Value ($)',
        data: chartValues,
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
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
        ticks: { callback: (v: number | string) => `$${Number(v).toFixed(0)}` },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 6,
        },
      },
    },
  };

  const daysUntilUnlock = Math.ceil(
    (asset.lockupDate - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const canUnstake = daysUntilUnlock <= 0 || asset.status === 'unlocking';

  const firstValue = performance[0]?.value ?? asset.currentValue;
  const perfChange = ((asset.currentValue - firstValue) / firstValue) * 100;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      )}

      {/* Header card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {asset.code.substring(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{asset.code}</h1>
              <p className="text-blue-200 text-sm">
                Started {formatDistanceToNow(asset.startDate)} ago
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              asset.status === 'active'
                ? 'bg-green-400/30 text-green-100'
                : asset.status === 'unlocking'
                ? 'bg-yellow-400/30 text-yellow-100'
                : 'bg-gray-400/30 text-gray-100'
            }`}
          >
            {asset.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-200 text-xs mb-1">Staked Amount</p>
            <p className="text-xl font-bold">
              {parseFloat(asset.amount).toLocaleString()} {asset.code}
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">Current Value</p>
            <p className="text-xl font-bold">${asset.currentValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">APY</p>
            <p className="text-xl font-bold text-green-300">{asset.apy.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">Total Rewards</p>
            <p className="text-xl font-bold">
              {parseFloat(asset.rewardsEarned).toFixed(4)} {asset.code}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            30-day Performance
          </div>
          <p className={`text-lg font-bold ${perfChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {perfChange >= 0 ? '+' : ''}{perfChange.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
            <Clock className="w-3 h-3" />
            Daily Yield
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ${(asset.currentValue * asset.yieldRate / 100).toFixed(4)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
            <Lock className="w-3 h-3" />
            Unlocks In
          </div>
          <p className={`text-lg font-bold ${daysUntilUnlock <= 7 ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>
            {daysUntilUnlock > 0 ? `${daysUntilUnlock} days` : 'Now'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
            <Award className="w-3 h-3" />
            Annual Reward
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            ${(asset.currentValue * asset.apy / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Historical performance chart */}
      {performance.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Historical Performance
            </h3>
          </div>
          <div className="h-56">
            <Line data={chartData} options={chartOptions as never} />
          </div>
        </div>
      )}

      {/* Lockup timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Lockup Timeline</h3>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  ((Date.now() - asset.startDate) /
                    (asset.lockupDate - asset.startDate)) *
                    100
                )}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Started: {new Date(asset.startDate).toLocaleDateString()}</span>
            <span>Unlocks: {new Date(asset.lockupDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {onCompound && (
          <button
            onClick={() => onCompound(asset.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            Compound Rewards
          </button>
        )}
        {onUnstake && (
          <button
            onClick={() => onUnstake(asset.id)}
            disabled={!canUnstake}
            className="flex-1 border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            {canUnstake ? 'Unstake' : `Locked (${daysUntilUnlock}d)`}
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetDetailPage;
