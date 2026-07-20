'use client';

import React from 'react';
import { formatRelativeTime } from '@/utils/formatters';
import { ConfidenceScore } from './ConfidenceScore';
import { CategoryBadge, SeverityBadge } from './Badges';
import { ActionButtons } from './ActionButtons';
import type {
  ActionExecutionResult,
  AIRecommendation,
  SuggestedAction,
} from '@/types';

interface Props {
  recommendation: AIRecommendation;
  /** Open the full-analysis modal for this recommendation. */
  onOpen: (recommendation: AIRecommendation) => void;
  /** Execute a one-click action. */
  onExecute: (recommendation: AIRecommendation, action: SuggestedAction) => void;
  /** Action id currently executing for this recommendation, if any. */
  executingActionId: string | null;
  /** Latest action result for this recommendation, if any. */
  result?: ActionExecutionResult;
}

/**
 * Summary card for a single AI recommendation. Surfaces the title, insight,
 * confidence, category/severity, timestamp, and suggested actions, and lets the
 * user open the full analysis. Unread recommendations show a marker dot.
 */
export const RecommendationCard: React.FC<Props> = ({
  recommendation,
  onOpen,
  onExecute,
  executingActionId,
  result,
}) => {
  const { title, summary, confidence, category, severity, createdAt, read } =
    recommendation;

  return (
    <article
      className="relative flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      aria-labelledby={`rec-title-${recommendation.id}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={category} />
        <SeverityBadge severity={severity} />
        {!read && (
          <span
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-brand-teal"
            aria-label="New, unread recommendation"
          >
            <span className="h-2 w-2 rounded-full bg-brand-teal" aria-hidden="true" />
            New
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpen(recommendation)}
        className="mb-1 text-left"
      >
        <h3
          id={`rec-title-${recommendation.id}`}
          className="text-lg font-semibold text-gray-900 hover:text-brand-teal dark:text-white dark:hover:text-brand-teal"
        >
          {title}
        </h3>
      </button>

      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{summary}</p>

      <div className="mb-4">
        <ConfidenceScore value={confidence} size="sm" />
      </div>

      {result && (
        <div
          role="status"
          className={`mb-3 rounded-lg px-3 py-2 text-sm ${
            result.success
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {result.message}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
        <time
          dateTime={new Date(createdAt).toISOString()}
          className="text-xs text-gray-400 dark:text-gray-500"
        >
          {formatRelativeTime(createdAt)}
        </time>
        <div className="flex flex-wrap items-center gap-2">
          <ActionButtons
            actions={recommendation.actions}
            executingActionId={executingActionId}
            onExecute={(action) => onExecute(recommendation, action)}
          />
          <button
            type="button"
            onClick={() => onOpen(recommendation)}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-teal hover:bg-teal-50 dark:hover:bg-teal-900/20"
            aria-label={`View full analysis for ${title}`}
          >
            View analysis
          </button>
        </div>
      </div>
    </article>
  );
};

export default RecommendationCard;
