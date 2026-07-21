'use client';

import React from 'react';
import { getConfidenceLevel, confidenceLabel } from '@/utils/ai';
import type { ConfidenceLevel } from '@/types';

interface Props {
  /** Confidence as a 0–100 percentage. */
  value: number;
  /** Visual style. Defaults to a horizontal bar. */
  variant?: 'bar' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  /** Show the textual "High/Medium/Low · NN%" label. Defaults to true. */
  showLabel?: boolean;
  className?: string;
}

const LEVEL_STYLES: Record<
  ConfidenceLevel,
  { bar: string; text: string; ring: string }
> = {
  high: {
    bar: 'bg-green-500',
    text: 'text-green-700 dark:text-green-400',
    ring: 'text-green-500',
  },
  medium: {
    bar: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
    ring: 'text-yellow-500',
  },
  low: {
    bar: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
    ring: 'text-red-500',
  },
};

const BAR_HEIGHT: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

const CIRCLE_SIZE: Record<NonNullable<Props['size']>, number> = {
  sm: 48,
  md: 72,
  lg: 96,
};

/**
 * Reusable confidence visualisation. Communicates the AI's confidence both
 * visually (bar or circular gauge, colour-coded by level) and to assistive tech
 * via `role="meter"` with an `aria-valuetext` that spells out the level and
 * percentage — so screen-reader users get "High confidence, 87 percent" rather
 * than a bare number.
 */
export const ConfidenceScore: React.FC<Props> = ({
  value,
  variant = 'bar',
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const level = getConfidenceLevel(clamped);
  const styles = LEVEL_STYLES[level];
  const valueText = `${confidenceLabel(level)}, ${clamped} percent`;

  const meterProps = {
    role: 'meter' as const,
    'aria-valuenow': clamped,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuetext': valueText,
    'aria-label': 'AI confidence',
  };

  if (variant === 'circle') {
    const dimension = CIRCLE_SIZE[size];
    const stroke = size === 'sm' ? 4 : 6;
    const radius = (dimension - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - clamped / 100);

    return (
      <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
        <div
          {...meterProps}
          className="relative"
          style={{ width: dimension, height: dimension }}
        >
          <svg
            width={dimension}
            height={dimension}
            viewBox={`0 0 ${dimension} ${dimension}`}
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              className="text-gray-200 dark:text-gray-700"
              stroke="currentColor"
            />
            <circle
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              className={styles.ring}
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <span
            className={`absolute inset-0 flex items-center justify-center font-bold ${styles.text} ${
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-base'
            }`}
            aria-hidden="true"
          >
            {clamped}%
          </span>
        </div>
        {showLabel && (
          <span className={`text-xs font-medium ${styles.text}`} aria-hidden="true">
            {confidenceLabel(level)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className={`font-semibold ${styles.text}`} aria-hidden="true">
            {confidenceLabel(level)}
          </span>
          <span className="font-medium text-gray-500 dark:text-gray-400" aria-hidden="true">
            {clamped}%
          </span>
        </div>
      )}
      <div
        {...meterProps}
        className={`w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${BAR_HEIGHT[size]}`}
      >
        <div
          className={`${BAR_HEIGHT[size]} rounded-full ${styles.bar}`}
          style={{ width: `${clamped}%`, transition: 'width 0.5s ease' }}
        />
      </div>
    </div>
  );
};

export default ConfidenceScore;
