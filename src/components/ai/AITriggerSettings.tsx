'use client';

import React, { useEffect, useState } from 'react';
import { useAISettings } from '@/hooks/useAISettings';
import {
  RECOMMENDATION_CATEGORIES,
  categoryLabel,
} from '@/utils/ai';
import { Modal } from './Modal';
import type {
  AlertFrequency,
  AITriggerPreferences,
  RecommendationCategory,
  TriggerConditions,
} from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FREQUENCY_OPTIONS: { value: AlertFrequency; label: string }[] = [
  { value: 'realtime', label: 'Real-time' },
  { value: 'hourly', label: 'Hourly digest' },
  { value: 'daily', label: 'Daily digest' },
];

const TRIGGER_LABELS: Record<keyof TriggerConditions, string> = {
  portfolioChange: 'Significant portfolio change',
  marketVolatility: 'Elevated market volatility',
  riskThreshold: 'Risk score crosses threshold',
  scheduled: 'Scheduled periodic analysis',
};

const Toggle: React.FC<{
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
    <span>
      <span className="block text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </span>
      {description && (
        <span className="block text-xs text-gray-500 dark:text-gray-400">
          {description}
        </span>
      )}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-brand-teal' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  </label>
);

/**
 * Settings modal for configuring AI trigger and notification preferences:
 * master notification toggle, alert frequency, trigger conditions, per-category
 * enablement, and a minimum-confidence threshold. Edits are held in a local
 * draft and only persisted (via the settings mechanism) on Save.
 */
export const AITriggerSettings: React.FC<Props> = ({ open, onClose }) => {
  const { settings, setSettings } = useAISettings();
  const [draft, setDraft] = useState<AITriggerPreferences>(settings);

  // Reset the draft to the persisted settings each time the modal opens.
  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);

  const patch = (p: Partial<AITriggerPreferences>) =>
    setDraft((d) => ({ ...d, ...p }));

  const toggleCategory = (category: RecommendationCategory) => {
    setDraft((d) => {
      const enabled = d.enabledCategories.includes(category);
      return {
        ...d,
        enabledCategories: enabled
          ? d.enabledCategories.filter((c) => c !== category)
          : [...d.enabledCategories, category],
      };
    });
  };

  const handleSave = () => {
    setSettings(draft);
    onClose();
  };

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSave}
        className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-stellar-400"
      >
        Save preferences
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="AI analysis settings"
      titleId="ai-settings-title"
      footer={footer}
      maxWidthClass="max-w-lg"
    >
      <fieldset className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-700">
        <Toggle
          checked={draft.notificationsEnabled}
          onChange={(v) => patch({ notificationsEnabled: v })}
          label="AI notifications"
          description="Receive alerts when new AI analyses are generated."
        />
      </fieldset>

      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          Alert frequency
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={draft.alertFrequency === opt.value}
              onClick={() => patch({ alertFrequency: opt.value })}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                draft.alertFrequency === opt.value
                  ? 'border-brand-teal bg-teal-50 text-brand-teal dark:bg-teal-900/20'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
          Trigger conditions
        </legend>
        {(Object.keys(TRIGGER_LABELS) as (keyof TriggerConditions)[]).map(
          (key) => (
            <Toggle
              key={key}
              checked={draft.triggerConditions[key]}
              onChange={(v) =>
                patch({
                  triggerConditions: { ...draft.triggerConditions, [key]: v },
                })
              }
              label={TRIGGER_LABELS[key]}
            />
          ),
        )}
      </fieldset>

      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          Recommendation categories
        </legend>
        <div className="flex flex-wrap gap-2">
          {RECOMMENDATION_CATEGORIES.map((category) => {
            const enabled = draft.enabledCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                role="checkbox"
                aria-checked={enabled}
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  enabled
                    ? 'border-brand-teal bg-teal-50 text-brand-teal dark:bg-teal-900/20'
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {categoryLabel(category)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <label
          htmlFor="min-confidence"
          className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
        >
          Minimum confidence to alert
          <span className="font-bold text-brand-teal">{draft.minConfidence}%</span>
        </label>
        <input
          id="min-confidence"
          type="range"
          min={0}
          max={100}
          step={5}
          value={draft.minConfidence}
          onChange={(e) => patch({ minConfidence: Number(e.target.value) })}
          className="w-full accent-brand-teal"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Only recommendations at or above this confidence will notify you.
        </p>
      </fieldset>
    </Modal>
  );
};

export default AITriggerSettings;
