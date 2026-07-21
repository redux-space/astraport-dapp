'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAIStore } from '@/store';
import { formatRelativeTime } from '@/utils/formatters';
import { ConfidenceScore } from './ConfidenceScore';
import type { AIRecommendation } from '@/types';

interface Props {
  /** Open the full analysis for a chosen recommendation. */
  onOpenRecommendation: (recommendation: AIRecommendation) => void;
  /** Optional: jump to the full recommendations feed. */
  onViewAll?: () => void;
}

/**
 * Notification bell for AI analyses. Shows the unread count as a badge, updates
 * in real time as new recommendations stream into the store, and opens a
 * dropdown of the latest analyses. Selecting one opens its analysis and marks it
 * read; "Mark all read" clears the badge. New-alert counts are announced to
 * screen readers via a polite live region.
 */
export const AIAlertBell: React.FC<Props> = ({
  onOpenRecommendation,
  onViewAll,
}) => {
  const recommendations = useAIStore((s) => s.recommendations);
  const markRead = useAIStore((s) => s.markRead);
  const markAllRead = useAIStore((s) => s.markAllRead);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unread = recommendations.filter((r) => !r.read);
  const unreadCount = unread.length;
  const latest = recommendations.slice(0, 5);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleSelect = (recommendation: AIRecommendation) => {
    markRead(recommendation.id);
    setOpen(false);
    onOpenRecommendation(recommendation);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label={
          unreadCount > 0
            ? `AI alerts, ${unreadCount} unread`
            : 'AI alerts, none unread'
        }
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[0.65rem] font-bold text-white"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Screen-reader announcement of new alerts. */}
      <span className="sr-only" role="status" aria-live="polite">
        {unreadCount > 0
          ? `${unreadCount} new AI ${unreadCount === 1 ? 'analysis' : 'analyses'}`
          : ''}
      </span>

      {open && (
        <div
          role="menu"
          aria-label="Latest AI analyses"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              AI analyses
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-brand-teal hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {latest.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No AI analyses yet.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
              {latest.map((rec) => (
                <li key={rec.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelect(rec)}
                    className={`flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      rec.read ? '' : 'bg-teal-50/50 dark:bg-teal-900/10'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!rec.read && (
                        <span
                          className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-teal"
                          aria-hidden="true"
                        />
                      )}
                      <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {rec.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {rec.summary}
                    </span>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="w-24">
                        <ConfidenceScore
                          value={rec.confidence}
                          size="sm"
                          showLabel={false}
                        />
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatRelativeTime(rec.createdAt)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {onViewAll && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onViewAll();
              }}
              className="block w-full border-t border-gray-100 px-4 py-3 text-center text-sm font-semibold text-brand-teal hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
            >
              View all recommendations
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAlertBell;
