import { create } from 'zustand';
import {
  WalletAccount,
  Portfolio,
  RiskScore,
  AIInsight,
  AIRecommendation,
  AITriggerPreferences,
  ActionExecutionResult,
} from '@/types';
import {
  AllocationTarget,
  DryRunResult,
  RebalanceStrategy,
} from '@/types/rebalancing';
import { DEFAULT_SLIPPAGE_BPS } from '@/utils/rebalancing';
import { AIAnalysisService } from '@/services/aiAnalysis';

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

interface AIState {
  recommendations: AIRecommendation[];
  loading: boolean;
  error: string | null;
  settings: AITriggerPreferences;
  wsConnected: boolean;
  /** Per-recommendation id → the action id currently executing (or null). */
  executing: Record<string, string | null>;
  /** Per-recommendation id → the most recent action execution result. */
  actionResults: Record<string, ActionExecutionResult>;
  setRecommendations: (recommendations: AIRecommendation[]) => void;
  /** Prepend a newly streamed recommendation (deduped by id). */
  addRecommendation: (recommendation: AIRecommendation) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setWsConnected: (connected: boolean) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setSettings: (settings: AITriggerPreferences) => void;
  setExecuting: (id: string, actionId: string | null) => void;
  setActionResult: (id: string, result: ActionExecutionResult) => void;
}

export const useAIStore = create<AIState>((set) => ({
  recommendations: [],
  loading: false,
  error: null,
  settings: AIAnalysisService.loadSettings(),
  wsConnected: false,
  executing: {},
  actionResults: {},
  setRecommendations: (recommendations) =>
    set({
      recommendations: [...recommendations].sort(
        (a, b) => b.createdAt - a.createdAt,
      ),
    }),
  addRecommendation: (recommendation) =>
    set((state) => {
      if (state.recommendations.some((r) => r.id === recommendation.id)) {
        return state;
      }
      return {
        recommendations: [recommendation, ...state.recommendations].sort(
          (a, b) => b.createdAt - a.createdAt,
        ),
      };
    }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
  markRead: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((r) =>
        r.id === id ? { ...r, read: true } : r,
      ),
    })),
  markAllRead: () =>
    set((state) => ({
      recommendations: state.recommendations.map((r) => ({ ...r, read: true })),
    })),
  setSettings: (settings) => {
    AIAnalysisService.saveSettings(settings);
    set({ settings });
  },
  setExecuting: (id, actionId) =>
    set((state) => ({ executing: { ...state.executing, [id]: actionId } })),
  setActionResult: (id, result) =>
    set((state) => ({
      actionResults: { ...state.actionResults, [id]: result },
    })),
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
