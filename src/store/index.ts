import { create } from 'zustand';
import { WalletAccount, Portfolio, RiskScore, AIInsight } from '@/types';
import {
  AllocationTarget,
  DryRunResult,
  RebalanceStrategy,
} from '@/types/rebalancing';
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
