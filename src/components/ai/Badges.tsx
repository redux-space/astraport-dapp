'use client';

import React from 'react';
import { categoryLabel } from '@/utils/ai';
import type { RecommendationCategory, RecommendationSeverity } from '@/types';

const CATEGORY_STYLES: Record<RecommendationCategory, string> = {
  rebalance: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  risk: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  opportunity:
    'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  security:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  market: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
};

const SEVERITY_STYLES: Record<
  RecommendationSeverity,
  { className: string; label: string }
> = {
  info: {
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    label: 'Info',
  },
  warning: {
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    label: 'Warning',
  },
  critical: {
    className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    label: 'Critical',
  },
};

export const CategoryBadge: React.FC<{ category: RecommendationCategory }> = ({
  category,
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_STYLES[category]}`}
  >
    {categoryLabel(category)}
  </span>
);

export const SeverityBadge: React.FC<{ severity: RecommendationSeverity }> = ({
  severity,
}) => {
  const { className, label } = SEVERITY_STYLES[severity];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
};
