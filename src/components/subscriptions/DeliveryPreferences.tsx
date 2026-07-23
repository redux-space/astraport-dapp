'use client';

import React from 'react';
import { DeliveryPreferences as DeliveryPrefs } from '@/types/subscriptions';

interface DeliveryPreferencesProps {
  preferences: DeliveryPrefs;
  onChange: (prefs: DeliveryPrefs) => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Summary' },
];

const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push Notification' },
  { value: 'in_app', label: 'In-App' },
];

export const DeliveryPreferences: React.FC<DeliveryPreferencesProps> = ({
  preferences,
  onChange,
}) => {
  const handleChannelToggle = (channel: 'email' | 'push' | 'in_app') => {
    const channels = preferences.channels.includes(channel)
      ? preferences.channels.filter((c) => c !== channel)
      : [...preferences.channels, channel];
    onChange({ ...preferences, channels });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700">Delivery Preferences</h4>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Frequency</label>
        <div className="flex gap-2">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onChange({
                  ...preferences,
                  frequency: opt.value as DeliveryPrefs['frequency'],
                })
              }
              className={`px-3 py-2 text-sm rounded border ${
                preferences.frequency === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Channels</label>
        <div className="flex gap-4">
          {CHANNEL_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={preferences.channels.includes(
                  opt.value as 'email' | 'push' | 'in_app',
                )}
                onChange={() =>
                  handleChannelToggle(opt.value as 'email' | 'push' | 'in_app')
                }
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Quiet Hours Start
          </label>
          <input
            type="time"
            value={preferences.quietHoursStart || ''}
            onChange={(e) =>
              onChange({ ...preferences, quietHoursStart: e.target.value })
            }
            className="block w-full rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Quiet Hours End
          </label>
          <input
            type="time"
            value={preferences.quietHoursEnd || ''}
            onChange={(e) =>
              onChange({ ...preferences, quietHoursEnd: e.target.value })
            }
            className="block w-full rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
