'use client';

import React from 'react';
import { formatRelativeTime } from '@/utils/formatters';
import { ConfidenceScore } from './ConfidenceScore';
import { CategoryBadge } from './Badges';
import type { AIRecommendation } from '@/types';

interface Props {
  analyses: AIRecommendation[];
  /** Open the full analysis for a historical entry. */
  onSelect: (recommendation: AIRecommendation) => void;
}

/**
 * Chronological history of AI analyses, newest first. Each entry shows a
 * summary, timestamp, category, and confidence, and can be opened. Rendered as
 * an ordered list with a connecting rail for a clear timeline read.
 */
export const AnalysisTimeline: React.FC<Props> = ({ analyses, onSelect }) => {
  const ordered = [...analyses].sort((a, b) => b.createdAt - a.createdAt);

  if (ordered.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Analysis history
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No historical analyses yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
        Analysis history
      </h2>
      <ol className="relative space-y-1 border-l border-gray-200 dark:border-gray-700">
        {ordered.map((rec) => (
          <li key={rec.id} className="ml-4">
            <span
              className="absolute -left-[5px] mt-2 h-2.5 w-2.5 rounded-full bg-brand-teal"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => onSelect(rec)}
              className="w-full rounded-lg px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
              aria-label={`Open analysis: ${rec.title}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {rec.title}
                </span>
                <time
                  dateTime={new Date(rec.createdAt).toISOString()}
                  className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500"
                >
                  {formatRelativeTime(rec.createdAt)}
                </time>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {rec.summary}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <CategoryBadge category={rec.category} />
                <span className="w-28">
                  <ConfidenceScore
                    value={rec.confidence}
                    size="sm"
                    showLabel={false}
                  />
                </span>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default AnalysisTimeline;
