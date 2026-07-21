/**
 * Helpers shared across the AI Analysis dashboard: confidence bucketing,
 * category/severity presentation, and default preferences.
 */

import type {
  AITriggerPreferences,
  ConfidenceLevel,
  RecommendationCategory,
} from '@/types';

/** Score at or above which confidence is considered "high". */
export const CONFIDENCE_HIGH = 75;
/** Score at or above which confidence is considered "medium". */
export const CONFIDENCE_MEDIUM = 50;

/** Bucket a 0–100 confidence score into a level. */
export const getConfidenceLevel = (score: number): ConfidenceLevel => {
  if (score >= CONFIDENCE_HIGH) return 'high';
  if (score >= CONFIDENCE_MEDIUM) return 'medium';
  return 'low';
};

/** Human-readable label for a confidence level. */
export const confidenceLabel = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'high':
      return 'High confidence';
    case 'medium':
      return 'Medium confidence';
    case 'low':
      return 'Low confidence';
  }
};

/** All recommendation categories in display order. */
export const RECOMMENDATION_CATEGORIES: RecommendationCategory[] = [
  'rebalance',
  'risk',
  'opportunity',
  'security',
  'market',
];

/** Title-cased label for a category. */
export const categoryLabel = (category: RecommendationCategory): string => {
  const labels: Record<RecommendationCategory, string> = {
    rebalance: 'Rebalance',
    risk: 'Risk',
    opportunity: 'Opportunity',
    security: 'Security',
    market: 'Market',
  };
  return labels[category];
};

/** Sensible defaults applied when the user has never configured AI triggers. */
export const DEFAULT_AI_PREFERENCES: AITriggerPreferences = {
  notificationsEnabled: true,
  alertFrequency: 'realtime',
  triggerConditions: {
    portfolioChange: true,
    marketVolatility: true,
    riskThreshold: true,
    scheduled: false,
  },
  enabledCategories: [...RECOMMENDATION_CATEGORIES],
  minConfidence: 50,
};
