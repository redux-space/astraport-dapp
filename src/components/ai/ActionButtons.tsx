'use client';

import React from 'react';
import type { SuggestedAction } from '@/types';

interface Props {
  actions: SuggestedAction[];
  /** Action id currently executing, if any (drives loading + dedup). */
  executingActionId: string | null;
  onExecute: (action: SuggestedAction) => void;
}

const Spinner: React.FC = () => (
  <svg
    className="h-4 w-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

/**
 * Renders a recommendation's suggested actions. Executable actions are buttons
 * that fire the one-click executor — they show a spinner while running and are
 * disabled whenever any action for the recommendation is in flight, preventing
 * duplicate submissions. Navigational (non-executable) actions render as links.
 */
export const ActionButtons: React.FC<Props> = ({
  actions,
  executingActionId,
  onExecute,
}) => {
  const anyExecuting = executingActionId !== null;

  return (
    <>
      {actions.map((action) => {
        if (!action.executable) {
          return (
            <a
              key={action.id}
              href={action.href || '#'}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {action.label}
            </a>
          );
        }

        const isRunning = executingActionId === action.id;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onExecute(action)}
            disabled={anyExecuting}
            aria-busy={isRunning}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-teal px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-stellar-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning && <Spinner />}
            {isRunning ? 'Working…' : action.label}
          </button>
        );
      })}
    </>
  );
};

export default ActionButtons;
