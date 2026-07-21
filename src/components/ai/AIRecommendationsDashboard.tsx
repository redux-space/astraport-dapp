'use client';

import React, { useMemo, useState } from 'react';
import {
  useAIRecommendations,
  useAIRealtime,
  useAIActions,
  useAISettings,
} from '@/hooks';
import { RecommendationCard } from './RecommendationCard';
import { RecommendationDetails } from './RecommendationDetails';
import { AnalysisTimeline } from './AnalysisTimeline';
import { AITriggerSettings } from './AITriggerSettings';
import type { AIRecommendation } from '@/types';

const CardSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
    <div className="mb-3 flex gap-2">
      <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>
    <div className="mb-2 h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="mb-4 h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
  </div>
);

/**
 * Main AI Analysis Results Dashboard. Fetches and streams recommendations,
 * renders the feed alongside the historical timeline, wires one-click actions,
 * and hosts the details and settings modals. Recommendations are filtered by the
 * user's enabled categories. Handles loading, empty, and error states.
 */
export const AIRecommendationsDashboard: React.FC = () => {
  const { recommendations, loading, error, refetch } = useAIRecommendations();
  const { connected } = useAIRealtime();
  const { execute, executingActionId, resultFor } = useAIActions();
  const { settings } = useAISettings();

  const [selected, setSelected] = useState<AIRecommendation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const visible = useMemo(
    () =>
      recommendations.filter((r) =>
        settings.enabledCategories.includes(r.category),
      ),
    [recommendations, settings.enabledCategories],
  );

  const openDetails = (recommendation: AIRecommendation) => {
    setSelected(recommendation);
    setDetailsOpen(true);
  };

  return (
    <section aria-label="AI analysis results">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Analysis Results
          </h2>
          <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? 'bg-green-500' : 'bg-gray-400'
              }`}
              aria-hidden="true"
            />
            {connected ? 'Live updates on' : 'Live updates offline'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          AI settings
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Feed */}
        <div className="lg:col-span-2">
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-900/20"
            >
              <p className="mb-3 text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                type="button"
                onClick={refetch}
                className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-stellar-400"
              >
                Retry
              </button>
            </div>
          ) : loading && recommendations.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-600 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                No recommendations to show
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {recommendations.length > 0
                  ? 'All categories are filtered out. Adjust your AI settings to see more.'
                  : 'New AI analyses will appear here as they are generated.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visible.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onOpen={openDetails}
                  onExecute={execute}
                  executingActionId={executingActionId(rec.id)}
                  result={resultFor(rec.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-1">
          <AnalysisTimeline analyses={recommendations} onSelect={openDetails} />
        </div>
      </div>

      <RecommendationDetails
        recommendation={selected}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onExecute={execute}
        executingActionId={selected ? executingActionId(selected.id) : null}
        result={selected ? resultFor(selected.id) : undefined}
      />

      <AITriggerSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </section>
  );
};

export default AIRecommendationsDashboard;
