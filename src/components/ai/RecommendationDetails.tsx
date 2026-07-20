'use client';

import React from 'react';
import { formatDateTime } from '@/utils/formatters';
import { Modal } from './Modal';
import { ConfidenceScore } from './ConfidenceScore';
import { CategoryBadge, SeverityBadge } from './Badges';
import { ActionButtons } from './ActionButtons';
import type {
  ActionExecutionResult,
  AIRecommendation,
  SuggestedAction,
} from '@/types';

interface Props {
  recommendation: AIRecommendation | null;
  open: boolean;
  onClose: () => void;
  onExecute: (recommendation: AIRecommendation, action: SuggestedAction) => void;
  executingActionId: string | null;
  result?: ActionExecutionResult;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="mb-5">
    <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {title}
    </h3>
    {children}
  </section>
);

/**
 * Modal presenting the complete AI analysis: full narrative, reasoning,
 * confidence with its explanation, supporting evidence, suggested actions, and
 * metadata (type + creation time). Actions are executable inline.
 */
export const RecommendationDetails: React.FC<Props> = ({
  recommendation,
  open,
  onClose,
  onExecute,
  executingActionId,
  result,
}) => {
  if (!recommendation) return null;

  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ActionButtons
        actions={recommendation.actions}
        executingActionId={executingActionId}
        onExecute={(action) => onExecute(recommendation, action)}
      />
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={recommendation.title}
      titleId={`rec-details-${recommendation.id}`}
      footer={footer}
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <CategoryBadge category={recommendation.category} />
        <SeverityBadge severity={recommendation.severity} />
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {recommendation.type}
        </span>
      </div>

      {result && (
        <div
          role="status"
          className={`mb-5 rounded-lg px-3 py-2 text-sm ${
            result.success
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {result.message}
        </div>
      )}

      <Section title="Analysis">
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
          {recommendation.analysis}
        </p>
      </Section>

      <Section title="Detailed reasoning">
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
          {recommendation.reasoning}
        </p>
      </Section>

      <Section title="Confidence">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40">
          <ConfidenceScore value={recommendation.confidence} size="md" />
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {recommendation.confidenceExplanation}
          </p>
        </div>
      </Section>

      {recommendation.evidence && recommendation.evidence.length > 0 && (
        <Section title="Supporting evidence">
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 dark:divide-gray-700 dark:border-gray-700">
            {recommendation.evidence.map((item, i) => (
              <li
                key={`${item.label}-${i}`}
                className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
              >
                <span className="text-gray-600 dark:text-gray-300">
                  {item.label}
                  {item.detail && (
                    <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                      {item.detail}
                    </span>
                  )}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Details">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Type</dt>
            <dd className="font-medium text-gray-900 dark:text-white">
              {recommendation.type}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Created</dt>
            <dd className="font-medium text-gray-900 dark:text-white">
              {formatDateTime(recommendation.createdAt)}
            </dd>
          </div>
        </dl>
      </Section>
    </Modal>
  );
};

export default RecommendationDetails;
