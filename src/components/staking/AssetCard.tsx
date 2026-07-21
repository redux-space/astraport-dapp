'use client';

import React from 'react';
import { StakedAsset } from '@/types/staking';
import { formatDistanceToNow } from '@/utils/formatters';
import { TrendingUp, Lock, Calendar, DollarSign } from 'lucide-react';

interface AssetCardProps {
  asset: StakedAsset;
  onClick?: () => void;
  showDetails?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onClick,
  showDetails = true,
}) => {
  const isUnlocking = asset.status === 'unlocking';
  const isActive = asset.status === 'active';
  const daysUntilUnlock = Math.ceil(
    (asset.lockupDate - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const statusColor = {
    active: 'bg-green-100 text-green-800',
    unlocking: 'bg-yellow-100 text-yellow-800',
    unstaked: 'bg-gray-100 text-gray-800',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {asset.code.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {asset.code}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {asset.amount} staked
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[asset.status]}`}
        >
          {asset.status}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Current Value */}
        <div>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
            <DollarSign className="w-3 h-3" />
            <span>Current Value</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ${asset.currentValue.toFixed(2)}
          </p>
        </div>

        {/* APY */}
        <div>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>APY</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {asset.apy.toFixed(2)}%
          </p>
        </div>

        {/* Rewards Earned */}
        <div>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>Rewards</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {parseFloat(asset.rewardsEarned).toFixed(4)} {asset.code}
          </p>
        </div>

        {/* Lockup */}
        <div>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
            {isActive ? <Lock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            <span>Lockup</span>
          </div>
          <p
            className={`text-lg font-semibold ${
              daysUntilUnlock > 7
                ? 'text-gray-900 dark:text-white'
                : 'text-orange-600 dark:text-orange-400'
            }`}
          >
            {daysUntilUnlock > 0 ? `${daysUntilUnlock}d left` : 'Unlocked'}
          </p>
        </div>
      </div>

      {/* Additional Details */}
      {showDetails && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Started {formatDistanceToNow(asset.startDate)} ago
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Daily yield: ${(asset.currentValue * asset.yieldRate / 100).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Status indicator bar */}
      {isUnlocking && (
        <div className="mt-4 pt-2 border-t border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
              Unlocking in progress
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">
              {new Date(asset.lockupDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetCard;
