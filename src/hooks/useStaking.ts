import { useEffect, useCallback } from 'react';
import { useStakingStore } from '@/store';
import { StakingService } from '@/services/staking';
import { MultiAssetStakingTransaction } from '@/types/staking';

/**
 * Hook to fetch and manage staking portfolio data
 */
export const useStakingPortfolio = (publicKey?: string) => {
  const {
    stakingPortfolio,
    loading,
    errors,
    lastFetched,
    setStakingPortfolio,
    setLoading,
    setError,
  } = useStakingStore();

  const fetchPortfolio = useCallback(async (forceRefresh = false) => {
    if (!publicKey) return;

    // Skip if recently fetched (within 30 seconds) and not forcing refresh
    const now = Date.now();
    if (!forceRefresh && lastFetched && now - lastFetched < 30000) {
      return;
    }

    setLoading('portfolio', true);
    setError('portfolio', null);

    try {
      const portfolio = await StakingService.getStakingPortfolio(publicKey);
      setStakingPortfolio(portfolio);
    } catch (err) {
      setError('portfolio', err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setLoading('portfolio', false);
    }
  }, [publicKey, lastFetched, setStakingPortfolio, setLoading, setError]);

  useEffect(() => {
    fetchPortfolio();
  }, [publicKey]);

  return {
    portfolio: stakingPortfolio,
    isLoading: loading.portfolio,
    error: errors.portfolio,
    refetch: fetchPortfolio,
  };
};

/**
 * Hook to fetch and manage available staking assets
 */
export const useAvailableAssets = (publicKey?: string) => {
  const { availableAssets, setAvailableAssets } = useStakingStore();

  const fetchAssets = useCallback(async () => {
    try {
      const assets = await StakingService.getAvailableAssets(publicKey);
      setAvailableAssets(assets);
    } catch (err) {
      console.error('Failed to fetch available assets:', err);
    }
  }, [publicKey, setAvailableAssets]);

  useEffect(() => {
    if (availableAssets.length === 0) {
      fetchAssets();
    }
  }, [publicKey]);

  return {
    assets: availableAssets,
    refetch: fetchAssets,
  };
};

/**
 * Hook to fetch and manage optimization recommendations
 */
export const useOptimizationRecommendations = (publicKey?: string) => {
  const {
    recommendations,
    loading,
    errors,
    setRecommendations,
    setLoading,
    setError,
    dismissRecommendation,
  } = useStakingStore();

  const fetchRecommendations = useCallback(async () => {
    if (!publicKey) return;

    setLoading('recommendations', true);
    setError('recommendations', null);

    try {
      const recs = await StakingService.getRecommendations(publicKey);
      setRecommendations(recs);
    } catch (err) {
      setError(
        'recommendations',
        err instanceof Error ? err.message : 'Failed to fetch recommendations'
      );
    } finally {
      setLoading('recommendations', false);
    }
  }, [publicKey, setRecommendations, setLoading, setError]);

  const applyRecommendation = useCallback(
    async (recommendationId: string) => {
      if (!publicKey) return;

      setLoading('transaction', true);
      setError('transaction', null);

      try {
        await StakingService.applyRecommendation(publicKey, recommendationId);
        await fetchRecommendations();
      } catch (err) {
        setError(
          'transaction',
          err instanceof Error ? err.message : 'Failed to apply recommendation'
        );
        throw err;
      } finally {
        setLoading('transaction', false);
      }
    },
    [publicKey, fetchRecommendations, setLoading, setError]
  );

  useEffect(() => {
    fetchRecommendations();
  }, [publicKey]);

  return {
    recommendations,
    isLoading: loading.recommendations,
    error: errors.recommendations,
    refetch: fetchRecommendations,
    apply: applyRecommendation,
    dismiss: dismissRecommendation,
  };
};

/**
 * Hook to manage staking transactions
 */
export const useStakingTransactions = (publicKey?: string) => {
  const { loading, errors, setLoading, setError } = useStakingStore();

  const submitStake = useCallback(
    async (transaction: MultiAssetStakingTransaction) => {
      if (!publicKey) throw new Error('No public key provided');

      setLoading('transaction', true);
      setError('transaction', null);

      try {
        const result = await StakingService.submitStakingTransaction(
          publicKey,
          transaction
        );
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Transaction failed';
        setError('transaction', message);
        throw new Error(message);
      } finally {
        setLoading('transaction', false);
      }
    },
    [publicKey, setLoading, setError]
  );

  const unstake = useCallback(
    async (positionId: string) => {
      if (!publicKey) throw new Error('No public key provided');

      setLoading('transaction', true);
      setError('transaction', null);

      try {
        const result = await StakingService.unstake(publicKey, positionId);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unstake failed';
        setError('transaction', message);
        throw new Error(message);
      } finally {
        setLoading('transaction', false);
      }
    },
    [publicKey, setLoading, setError]
  );

  return {
    submitStake,
    unstake,
    isSubmitting: loading.transaction,
    error: errors.transaction,
  };
};

/**
 * Hook to calculate and manage yield projections
 */
export const useYieldProjection = () => {
  const { yieldProjection, setYieldProjection, setLoading } = useStakingStore();

  const calculateProjection = useCallback(
    async (params: {
      assetCode: string;
      amount: number;
      lockupDays: number;
      compoundingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      apy: number;
    }) => {
      setLoading('projection', true);

      try {
        const projection = await StakingService.calculateYieldProjection(params);
        setYieldProjection(projection);
        return projection;
      } catch (err) {
        console.error('Failed to calculate projection:', err);
        throw err;
      } finally {
        setLoading('projection', false);
      }
    },
    [setYieldProjection, setLoading]
  );

  const clearProjection = useCallback(() => {
    setYieldProjection(null);
  }, [setYieldProjection]);

  return {
    projection: yieldProjection,
    calculate: calculateProjection,
    clear: clearProjection,
  };
};

/**
 * Hook to fetch and manage comparison data
 */
export const useComparisonData = (publicKey?: string) => {
  const { comparisonData, loading, setComparisonData, setLoading } = useStakingStore();

  const fetchComparison = useCallback(async () => {
    if (!publicKey) return;

    setLoading('portfolio', true);

    try {
      const data = await StakingService.getComparisonData(publicKey);
      setComparisonData(data);
    } catch (err) {
      console.error('Failed to fetch comparison data:', err);
    } finally {
      setLoading('portfolio', false);
    }
  }, [publicKey, setComparisonData, setLoading]);

  useEffect(() => {
    fetchComparison();
  }, [publicKey]);

  return {
    comparisonData,
    isLoading: loading.portfolio,
    refetch: fetchComparison,
  };
};

/**
 * Hook to fetch platform-wide staking statistics
 */
export const useStakingStats = () => {
  const { stakingStats, setStakingStats } = useStakingStore();

  const fetchStats = useCallback(async () => {
    try {
      const stats = await StakingService.getStakingStats();
      setStakingStats(stats);
    } catch (err) {
      console.error('Failed to fetch staking stats:', err);
    }
  }, [setStakingStats]);

  useEffect(() => {
    if (!stakingStats) {
      fetchStats();
    }
  }, []);

  return {
    stats: stakingStats,
    refetch: fetchStats,
  };
};

/**
 * Comprehensive hook that combines all staking functionality
 */
export const useStakingData = (publicKey?: string) => {
  const portfolio = useStakingPortfolio(publicKey);
  const assets = useAvailableAssets(publicKey);
  const recommendations = useOptimizationRecommendations(publicKey);
  const transactions = useStakingTransactions(publicKey);
  const projection = useYieldProjection();
  const comparison = useComparisonData(publicKey);
  const stats = useStakingStats();

  const refetchAll = useCallback(async () => {
    await Promise.all([
      portfolio.refetch(true),
      assets.refetch(),
      recommendations.refetch(),
      comparison.refetch(),
      stats.refetch(),
    ]);
  }, [portfolio, assets, recommendations, comparison, stats]);

  return {
    portfolio,
    assets,
    recommendations,
    transactions,
    projection,
    comparison,
    stats,
    refetchAll,
  };
};
