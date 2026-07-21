'use client';

import React, { useState } from 'react';
import { ComparisonData } from '@/types/staking';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ComparisonToolsProps {
  comparisonData: ComparisonData;
  isLoading?: boolean;
}

export const ComparisonTools: React.FC<ComparisonToolsProps> = ({
  comparisonData,
  isLoading = false,
}) => {
  const [view, setView] = useState<'current' | 'recommended'>('current');

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const dataToShow = view === 'current' ? comparisonData.current : comparisonData.recommended;
  const totalValue = dataToShow.reduce((sum, a) => sum + a.value, 0);
  const avgApy = dataToShow.reduce((sum, a) => sum + a.apy * a.percentage, 0) / 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Allocation Comparison
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Compare current vs recommended allocation
            </p>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        <button
          onClick={() => setView('current')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'current'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Current Allocation
        </button>
        <button
          onClick={() => setView('recommended')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'recommended'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Recommended
        </button>
      </div>

      {/* Metrics comparison */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">APY Difference</p>
          <p className={`text-lg font-bold ${
            comparisonData.metrics.apyDifference >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {comparisonData.metrics.apyDifference >= 0 ? '+' : ''}
            {comparisonData.metrics.apyDifference.toFixed(2)}%
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risk Change</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {comparisonData.metrics.riskDifference >= 0 ? '+' : ''}
            {comparisonData.metrics.riskDifference.toFixed(1)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Diversity Score</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {comparisonData.metrics.diversificationScore}/100
          </p>
        </div>
      </div>

      {/* Allocation bars */}
      <div className="space-y-3">
        {dataToShow.map((asset) => (
          <div key={asset.code} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {asset.code}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {asset.apy.toFixed(1)}% APY
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {asset.percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ${asset.value.toFixed(0)}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  asset.riskScore <= 2
                    ? 'bg-green-500'
                    : asset.riskScore <= 4
                    ? 'bg-blue-500'
                    : 'bg-yellow-500'
                }`}
                style={{ width: `${asset.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Portfolio Value</span>
          <span className="font-bold text-gray-900 dark:text-white">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600 dark:text-gray-400">Weighted Average APY</span>
          <span className="font-bold text-green-600 dark:text-green-400">
            {avgApy.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Action hint */}
      {view === 'recommended' && comparisonData.metrics.apyDifference > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Optimize Your Portfolio
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Following this allocation could increase your APY by{' '}
                <span className="font-semibold text-green-600 dark:text-green-400">
                  +{comparisonData.metrics.apyDifference.toFixed(2)}%
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTools;
