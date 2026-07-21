'use client';

import React, { useState } from 'react';
import { OptimizationRecommendation } from '@/types/staking';
import { Lightbulb, TrendingUp, AlertCircle, X, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface OptimizationRecommendationsProps {
  recommendations: OptimizationRecommendation[];
  onApply?: (recommendationId: string) => void;
  onDismiss?: (recommendationId: string) => void;
  isLoading?: boolean;
}

const PriorityBadge: React.FC<{ priority: 'low' | 'medium' | 'high' }> = ({
  priority,
}) => {
  const styles = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const StrategyIcon: React.FC<{ type: OptimizationRecommendation['strategyType'] }> = ({
  type,
}) => {
  const icons: Record<string, React.ReactNode> = {
    diversify: <TrendingUp className="w-5 h-5" />,
    concentrate: <Zap className="w-5 h-5" />,
    rebalance: <AlertCircle className="w-5 h-5" />,
    extend_lockup: <AlertCircle className="w-5 h-5" />,
    compound: <TrendingUp className="w-5 h-5" />,
  };
  return <>{icons[type] || <Lightbulb className="w-5 h-5" />}</>;
};

const RecommendationCard: React.FC<{
  recommendation: OptimizationRecommendation;
  onApply?: (id: string) => void;
  onDismiss?: (id: string) => void;
}> = ({ recommendation, onApply, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!onApply) return;
    setApplying(true);
    try {
      await onApply(recommendation.id);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
            <StrategyIcon type={recommendation.strategyType} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {recommendation.title}
              </h3>
              <PriorityBadge priority={recommendation.priority} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {recommendation.description}
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(recommendation.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
              aria-label="Dismiss recommendation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Impact metrics */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">APY Boost</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              +{recommendation.impact.apyIncrease.toFixed(1)}%
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Extra Yield</p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
              +${recommendation.impact.additionalYield.toFixed(0)}/yr
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Risk Δ</p>
            <p className={`text-sm font-bold ${
              recommendation.impact.riskChange > 0
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-green-600 dark:text-green-400'
            }`}>
              {recommendation.impact.riskChange > 0 ? '+' : ''}
              {recommendation.impact.riskChange.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable actions */}
      <div className="border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <span>{recommendation.actions.length} action{recommendation.actions.length !== 1 ? 's' : ''} required</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expanded && (
          <div className="px-4 pb-3 space-y-1">
            {recommendation.actions.map((action, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    action.type === 'stake' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    action.type === 'unstake' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}
                >
                  {action.type}
                </span>
                <span>
                  {action.amount !== '0' ? `${action.amount} ` : ''}{action.assetCode}
                  {action.targetAsset ? ` → ${action.targetAsset}` : ''}
                  {action.newLockupPeriod ? ` (${action.newLockupPeriod}d lockup)` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply button */}
      {onApply && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {applying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Apply Recommendation
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export const OptimizationRecommendations: React.FC<OptimizationRecommendationsProps> = ({
  recommendations,
  onApply,
  onDismiss,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Portfolio Optimized!
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Your portfolio is currently well-optimized. We&apos;ll notify you when new
          opportunities arise.
        </p>
      </div>
    );
  }

  const highPriority = recommendations.filter((r) => r.priority === 'high');

  return (
    <div className="space-y-4">
      {/* Header summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {recommendations.length} Recommendation{recommendations.length !== 1 ? 's' : ''}
          </h2>
          {highPriority.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold">
              {highPriority.length} high priority
            </span>
          )}
        </div>
      </div>

      {/* Recommendation cards */}
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onApply={onApply}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
};

export default OptimizationRecommendations;
