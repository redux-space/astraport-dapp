import { useCallback } from 'react';
import { AIAnalysisService } from '@/services/aiAnalysis';
import { useAIStore } from '@/store';
import type { AIRecommendation, SuggestedAction } from '@/types';

/**
 * Executes one-click actions for AI recommendations. Guards against duplicate
 * submissions (a second call for a recommendation already mid-flight is
 * ignored), tracks per-recommendation loading, and records success/error
 * results in the store.
 */
export const useAIActions = () => {
  const executing = useAIStore((s) => s.executing);
  const actionResults = useAIStore((s) => s.actionResults);
  const setExecuting = useAIStore((s) => s.setExecuting);
  const setActionResult = useAIStore((s) => s.setActionResult);
  const markRead = useAIStore((s) => s.markRead);

  const execute = useCallback(
    async (recommendation: AIRecommendation, action: SuggestedAction) => {
      // Prevent duplicate submissions while an action for this recommendation
      // is still in flight.
      if (useAIStore.getState().executing[recommendation.id]) return;

      setExecuting(recommendation.id, action.id);
      try {
        const result = await AIAnalysisService.executeAction(
          recommendation.id,
          action.id,
        );
        setActionResult(recommendation.id, result);
        markRead(recommendation.id);
      } catch (err) {
        setActionResult(recommendation.id, {
          success: false,
          message:
            err instanceof Error ? err.message : 'Action failed. Please retry.',
        });
      } finally {
        setExecuting(recommendation.id, null);
      }
    },
    [setExecuting, setActionResult, markRead],
  );

  return {
    execute,
    /** Action id currently executing for a recommendation, if any. */
    executingActionId: (recommendationId: string): string | null =>
      executing[recommendationId] ?? null,
    /** Most recent execution result for a recommendation, if any. */
    resultFor: (recommendationId: string) => actionResults[recommendationId],
  };
};

export default useAIActions;
