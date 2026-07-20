import { useCallback } from 'react';
import { useAIStore } from '@/store';
import type { AITriggerPreferences } from '@/types';

/**
 * Read and update AI trigger preferences. Updates are persisted through the
 * store's settings mechanism (localStorage-backed), so they survive reloads.
 * `update` accepts a partial patch and merges it over the current settings.
 */
export const useAISettings = () => {
  const settings = useAIStore((s) => s.settings);
  const setSettings = useAIStore((s) => s.setSettings);

  const update = useCallback(
    (patch: Partial<AITriggerPreferences>) => {
      setSettings({ ...settings, ...patch });
    },
    [settings, setSettings],
  );

  return { settings, setSettings, update };
};

export default useAISettings;
