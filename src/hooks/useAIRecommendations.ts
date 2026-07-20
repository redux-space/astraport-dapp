import { useCallback, useEffect } from 'react';
import { AIAnalysisService } from '@/services/aiAnalysis';
import { useAIStore, useWalletStore } from '@/store';

/**
 * Loads AI recommendations for the connected wallet and syncs them into the AI
 * store. Recommendations are re-fetched whenever the connected account changes.
 * Returns the current feed plus loading/error state and a manual refetch.
 */
export const useAIRecommendations = () => {
  const account = useWalletStore((s) => s.account);
  const recommendations = useAIStore((s) => s.recommendations);
  const loading = useAIStore((s) => s.loading);
  const error = useAIStore((s) => s.error);
  const setRecommendations = useAIStore((s) => s.setRecommendations);
  const setLoading = useAIStore((s) => s.setLoading);
  const setError = useAIStore((s) => s.setError);

  const publicKey = account?.publicKey ?? null;

  const fetchRecommendations = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    try {
      const data = await AIAnalysisService.getRecommendations(publicKey);
      setRecommendations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load recommendations',
      );
    } finally {
      setLoading(false);
    }
  }, [publicKey, setRecommendations, setLoading, setError]);

  useEffect(() => {
    if (publicKey) {
      fetchRecommendations();
    }
  }, [publicKey, fetchRecommendations]);

  const unreadCount = recommendations.filter((r) => !r.read).length;

  return {
    recommendations,
    loading,
    error,
    unreadCount,
    refetch: fetchRecommendations,
  };
};

export default useAIRecommendations;
