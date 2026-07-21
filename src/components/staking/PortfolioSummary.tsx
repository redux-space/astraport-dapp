'use client';

import React from 'react';
import { StakingPortfolio } from '@/types/staking';
import { TrendingUp, TrendingDown, DollarSign, Percent, Award, Activity } from 'lucide-react';

interface PortfolioSummaryProps {
  portfolio: StakingPortfolio;
  isLoading?: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  highlight?: boolean;
}> = ({ title, value, subtitle, icon, trend, highlight }) => (
  <div
    className={`rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
      highlight
        ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white'
        : 'bg-white dark:bg-gray-800'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span
        className={`text-sm font-medium ${
          highlight ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {title}
      </span>
      <div
        className={`p-2 rounded-lg ${
          highlight ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/30'
        }`}
      >
        <span className={highlight ? 'text-white' : 'text-blue-600 dark:text-blue-400'}>
          {icon}
        </span>
      </div>
    </div>
    <p
      className={`text-3xl font-bold mb-1 ${
        highlight ? 'text-white' : 'text-gray-900 dark:text-white'
      }`}
    >
      {value}
    </p>
    {subtitle && (
      <p
        className={`text-sm ${
          highlight ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {subtitle}
      </p>
    )}
    {trend !== undefined && (
      <div className="flex items-center gap-1 mt-2">
        {trend >= 0 ? (
          <TrendingUp className={`w-4 h-4 ${highlight ? 'text-green-300' : 'text-green-500'}`} />
        ) : (
          <TrendingDown className={`w-4 h-4 ${highlight ? 'text-red-300' : 'text-red-500'}`} />
        )}
        <span
          className={`text-sm font-medium ${
            trend >= 0
              ? highlight ? 'text-green-300' : 'text-green-600 dark:text-green-400'
              : highlight ? 'text-red-300' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {trend >= 0 ? '+' : ''}{trend.toFixed(2)}% (24h)
        </span>
      </div>
    )}
  </div>
);

const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
  </div>
);

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolio,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const dailyYield = portfolio.aggregateYield;
  const positionCount = portfolio.positions.length;
  const activePositions = portfolio.positions.filter((p) => p.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={`$${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${positionCount} position${positionCount !== 1 ? 's' : ''} (${activePositions} active)`}
          icon={<DollarSign className="w-5 h-5" />}
          trend={portfolio.change24h}
          highlight
        />
        <StatCard
          title="Average APY"
          value={`${portfolio.averageApy.toFixed(2)}%`}
          subtitle="Weighted across all positions"
          icon={<Percent className="w-5 h-5" />}
        />
        <StatCard
          title="Total Rewards"
          value={`$${portfolio.totalRewards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Earned to date"
          icon={<Award className="w-5 h-5" />}
        />
        <StatCard
          title="Daily Yield"
          value={`$${dailyYield.toFixed(2)}`}
          subtitle="Estimated per day"
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      {/* Asset allocation mini-bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Portfolio Allocation
        </h3>
        <div className="flex rounded-full overflow-hidden h-3 mb-3">
          {portfolio.positions.map((position, i) => {
            const pct = (position.currentValue / portfolio.totalValue) * 100;
            const colors = [
              'bg-blue-500', 'bg-purple-500', 'bg-green-500',
              'bg-yellow-500', 'bg-red-500', 'bg-pink-500',
            ];
            return (
              <div
                key={position.id}
                className={`${colors[i % colors.length]} transition-all duration-300`}
                style={{ width: `${pct}%` }}
                title={`${position.code}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3">
          {portfolio.positions.map((position, i) => {
            const pct = (position.currentValue / portfolio.totalValue) * 100;
            const colors = [
              'bg-blue-500', 'bg-purple-500', 'bg-green-500',
              'bg-yellow-500', 'bg-red-500', 'bg-pink-500',
            ];
            return (
              <div key={position.id} className="flex items-center gap-1.5 text-xs">
                <div className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
                <span className="text-gray-700 dark:text-gray-300">
                  {position.code} ({pct.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
