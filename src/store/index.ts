import { create } from 'zustand';
import { WalletAccount, Portfolio, RiskScore, AIInsight } from '@/types';
import {
  AllocationTarget,
  DryRunResult,
  RebalanceStrategy,
} from '@/types/rebalancing';
import {
  StakingPortfolio,
  StakedAsset,
  OptimizationRecommendation,
  StakingAssetInfo,
  YieldProjection,
  ComparisonData,
  StakingStats,
} from '@/types/staking';
import { DEFAULT_SLIPPAGE_BPS } from '@/utils/rebalancing';

interface WalletState {
  connected: boolean;
  account: WalletAccount | null;
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  connect: (account: WalletAccount) => void;
  disconnect: () => void;
  setPortfolio: (portfolio: Portfolio) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  connected: false,
  account: null,
  portfolio: null,
  loading: false,
  error: null,
  connect: (account) => set({ connected: true, account, error: null }),
  disconnect: () => set({ connected: false, account: null, portfolio: null }),
  setPortfolio: (portfolio) => set({ portfolio }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

interface DashboardState {
  riskScore: RiskScore | null;
  insights: AIInsight[];
  selectedAsset: string | null;
  setRiskScore: (score: RiskScore) => void;
  setInsights: (insights: AIInsight[]) => void;
  setSelectedAsset: (asset: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  riskScore: null,
  insights: [],
  selectedAsset: null,
  setRiskScore: (score) => set({ riskScore: score }),
  setInsights: (insights) => set({ insights }),
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
}));

/** Wizard steps for the rebalancing planner. */
export type RebalanceStep = 0 | 1 | 2 | 3;

interface RebalanceState {
  step: RebalanceStep;
  targets: AllocationTarget[];
  strategy: RebalanceStrategy;
  slippageBps: number;
  dryRun: DryRunResult | null;
  executed: boolean;
  setStep: (step: RebalanceStep) => void;
  setTargets: (targets: AllocationTarget[]) => void;
  setTargetPercent: (code: string, percent: number) => void;
  setStrategy: (strategy: RebalanceStrategy) => void;
  setSlippageBps: (bps: number) => void;
  setDryRun: (result: DryRunResult | null) => void;
  setExecuted: (executed: boolean) => void;
  reset: () => void;
}

export const useRebalanceStore = create<RebalanceState>((set) => ({
  step: 0,
  targets: [],
  strategy: 'balanced',
  slippageBps: DEFAULT_SLIPPAGE_BPS,
  dryRun: null,
  executed: false,
  setStep: (step) => set({ step }),
  setTargets: (targets) => set({ targets }),
  setTargetPercent: (code, percent) =>
    set((state) => {
      const exists = state.targets.some((t) => t.code === code);
      const targets = exists
        ? state.targets.map((t) => (t.code === code ? { ...t, targetPercent: percent } : t))
        : [...state.targets, { code, targetPercent: percent }];
      return { targets };
    }),
  setStrategy: (strategy) => set({ strategy }),
  setSlippageBps: (slippageBps) => set({ slippageBps }),
  setDryRun: (dryRun) => set({ dryRun }),
  setExecuted: (executed) => set({ executed }),
  reset: () =>
    set({
      step: 0,
      strategy: 'balanced',
      slippageBps: DEFAULT_SLIPPAGE_BPS,
      dryRun: null,
      executed: false,
    }),
}));

// ─── Staking State ───────────────────────────────────────────────────────────

interface StakingState {
  /** Aggregated staking portfolio */
  stakingPortfolio: StakingPortfolio | null;
  /** List of available stakeable assets */
  availableAssets: StakingAssetInfo[];
  /** Optimization recommendations */
  recommendations: OptimizationRecommendation[];
  /** Active yield projection */
  yieldProjection: YieldProjection | null;
  /** Comparison data between current and recommended allocations */
  comparisonData: ComparisonData | null;
  /** Platform-wide staking statistics */
  stakingStats: StakingStats | null;
  /** Currently selected asset for detail view */
  selectedAssetId: string | null;
  /** Loading states per action */
  loading: {
    portfolio: boolean;
    recommendations: boolean;
    projection: boolean;
    transaction: boolean;
  };
  /** Error messages per action */
  errors: {
    portfolio: string | null;
    recommendations: string | null;
    projection: string | null;
    transaction: string | null;
  };
  /** Last fetch timestamp for caching */
  lastFetched: number | null;

  // Actions
  setStakingPortfolio: (portfolio: StakingPortfolio) => void;
  setAvailableAssets: (assets: StakingAssetInfo[]) => void;
  setRecommendations: (recs: OptimizationRecommendation[]) => void;
  setYieldProjection: (projection: YieldProjection | null) => void;
  setComparisonData: (data: ComparisonData | null) => void;
  setStakingStats: (stats: StakingStats) => void;
  setSelectedAssetId: (id: string | null) => void;
  updateStakedPosition: (assetId: string, updates: Partial<StakedAsset>) => void;
  removeStakedPosition: (assetId: string) => void;
  addStakedPosition: (position: StakedAsset) => void;
  setLoading: (key: keyof StakingState['loading'], value: boolean) => void;
  setError: (key: keyof StakingState['errors'], value: string | null) => void;
  dismissRecommendation: (id: string) => void;
  resetStaking: () => void;
}

const initialStakingState = {
  stakingPortfolio: null,
  availableAssets: [],
  recommendations: [],
  yieldProjection: null,
  comparisonData: null,
  stakingStats: null,
  selectedAssetId: null,
  loading: {
    portfolio: false,
    recommendations: false,
    projection: false,
    transaction: false,
  },
  errors: {
    portfolio: null,
    recommendations: null,
    projection: null,
    transaction: null,
  },
  lastFetched: null,
};

export const useStakingStore = create<StakingState>((set) => ({
  ...initialStakingState,

  setStakingPortfolio: (portfolio) =>
    set({ stakingPortfolio: portfolio, lastFetched: Date.now() }),

  setAvailableAssets: (assets) => set({ availableAssets: assets }),

  setRecommendations: (recommendations) => set({ recommendations }),

  setYieldProjection: (yieldProjection) => set({ yieldProjection }),

  setComparisonData: (comparisonData) => set({ comparisonData }),

  setStakingStats: (stakingStats) => set({ stakingStats }),

  setSelectedAssetId: (selectedAssetId) => set({ selectedAssetId }),

  updateStakedPosition: (assetId, updates) =>
    set((state) => {
      if (!state.stakingPortfolio) return state;
      const positions = state.stakingPortfolio.positions.map((p) =>
        p.id === assetId ? { ...p, ...updates } : p
      );
      return {
        stakingPortfolio: {
          ...state.stakingPortfolio,
          positions,
        },
      };
    }),

  removeStakedPosition: (assetId) =>
    set((state) => {
      if (!state.stakingPortfolio) return state;
      const positions = state.stakingPortfolio.positions.filter(
        (p) => p.id !== assetId
      );
      return {
        stakingPortfolio: {
          ...state.stakingPortfolio,
          positions,
        },
      };
    }),

  addStakedPosition: (position) =>
    set((state) => {
      if (!state.stakingPortfolio) return state;
      return {
        stakingPortfolio: {
          ...state.stakingPortfolio,
          positions: [...state.stakingPortfolio.positions, position],
        },
      };
    }),

  setLoading: (key, value) =>
    set((state) => ({ loading: { ...state.loading, [key]: value } })),

  setError: (key, value) =>
    set((state) => ({ errors: { ...state.errors, [key]: value } })),

  dismissRecommendation: (id) =>
    set((state) => ({
      recommendations: state.recommendations.filter((r) => r.id !== id),
    })),

  resetStaking: () => set(initialStakingState),
}));
