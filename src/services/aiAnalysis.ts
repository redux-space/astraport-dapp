import axios from 'axios';
import type {
  ActionExecutionResult,
  AIRealtimeMessage,
  AIRecommendation,
  AITriggerPreferences,
} from '@/types';
import { DEFAULT_AI_PREFERENCES } from '@/utils/ai';

const API_BASE =
  process.env.NEXT_PUBLIC_ASTRAPORT_API_URL || 'http://localhost:3001';

const WS_BASE =
  process.env.NEXT_PUBLIC_ASTRAPORT_WS_URL ||
  API_BASE.replace(/^http/, 'ws') + '/ai/stream';

/** localStorage key under which AI trigger preferences are persisted. */
const SETTINGS_KEY = 'astraport.ai.preferences';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

/**
 * Deterministic sample analyses used when no backend is reachable so the
 * dashboard is fully demonstrable in development. Timestamps are computed
 * relative to `now` at call time.
 */
const buildMockRecommendations = (now: number): AIRecommendation[] => [
  {
    id: 'ai-rec-001',
    title: 'Reduce USDC concentration',
    summary:
      'USDC makes up 53.6% of your portfolio — trimming it would materially lower concentration risk.',
    analysis:
      'Your portfolio is heavily weighted toward USDC, which currently represents 53.6% of total value. While USDC is a stable asset, a single-asset concentration above 50% leaves the portfolio exposed to issuer and de-peg risk. Reallocating a portion into XLM and EUROC would improve diversification without significantly changing the risk-adjusted return profile.',
    reasoning:
      'Concentration score is 48.7/100 and rising. Historically, portfolios that reduced a single stable-asset position from >50% to ~35% saw a 12% reduction in concentration risk with negligible volatility impact.',
    confidenceExplanation:
      'High confidence: the concentration figure is derived directly from on-chain balances, and the recommended target range is well established by the portfolio risk model.',
    confidence: 87,
    category: 'rebalance',
    severity: 'warning',
    type: 'Concentration analysis',
    actions: [
      { id: 'act-rebalance', label: 'Apply rebalance plan', type: 'rebalance', executable: true },
      { id: 'act-open-rebalancer', label: 'Open rebalancer', type: 'navigate', href: '/rebalance', executable: false },
    ],
    evidence: [
      { label: 'USDC allocation', value: '53.6%', detail: 'Target: 35–40%' },
      { label: 'Concentration score', value: '48.7 / 100' },
      { label: 'Assets held', value: '3' },
    ],
    createdAt: now - 1000 * 60 * 12,
    read: false,
  },
  {
    id: 'ai-rec-002',
    title: 'Favourable EUR rebalancing window',
    summary:
      'Current EUR/USD rates create an opportunity to rebalance EUROC exposure efficiently.',
    analysis:
      'Market conditions over the past 48 hours show reduced spreads on EUROC pairs and a favourable EUR/USD rate. Rebalancing part of your USDC position into EUROC now would capture the rate while spreads are tight, lowering execution cost versus the trailing 30-day average.',
    reasoning:
      'Spread compression of ~18% versus the 30-day mean, combined with a stable EUR/USD trend, lowers expected slippage on the rebalance path.',
    confidenceExplanation:
      'Medium confidence: rate and spread signals are strong, but FX timing carries inherent uncertainty, so the window may shift within hours.',
    confidence: 64,
    category: 'opportunity',
    severity: 'info',
    type: 'Market timing',
    actions: [
      { id: 'act-apply-strategy', label: 'Apply strategy', type: 'rebalance', executable: true },
      { id: 'act-see-strategy', label: 'See strategy', type: 'navigate', href: '/rebalance', executable: false },
    ],
    evidence: [
      { label: 'EUROC spread', value: '-18% vs 30d avg' },
      { label: 'EUR/USD trend', value: 'Stable' },
    ],
    createdAt: now - 1000 * 60 * 60 * 3,
    read: false,
  },
  {
    id: 'ai-rec-003',
    title: 'Issuer security posture improved',
    summary:
      'A new audit for one of your asset issuers reports strengthened security controls.',
    analysis:
      'The issuer GBBD47UZ… published updated audit results indicating improved key-management and operational security. This lowers the counterparty risk contribution of the associated holding.',
    reasoning:
      'Counterparty risk sub-score for this issuer decreased following independent audit confirmation of improved controls.',
    confidenceExplanation:
      'Medium confidence: based on a published third-party audit; the underlying report is credible but external to on-chain data.',
    confidence: 58,
    category: 'security',
    severity: 'info',
    type: 'Counterparty update',
    actions: [
      { id: 'act-report', label: 'View audit report', type: 'navigate', href: '#', executable: false },
      { id: 'act-dismiss', label: 'Dismiss', type: 'dismiss', executable: true },
    ],
    createdAt: now - 1000 * 60 * 60 * 26,
    read: true,
  },
];

export class AIAnalysisService {
  /** Recent AI recommendations, newest first. Falls back to demo data. */
  static async getRecommendations(publicKey: string): Promise<AIRecommendation[]> {
    try {
      const { data } = await apiClient.get<AIRecommendation[]>(
        `/ai/recommendations/${publicKey}`,
      );
      return [...data].sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return buildMockRecommendations(Date.now());
    }
  }

  /** Historical AI analyses, newest first. */
  static async getAnalysisHistory(publicKey: string): Promise<AIRecommendation[]> {
    try {
      const { data } = await apiClient.get<AIRecommendation[]>(
        `/ai/history/${publicKey}`,
      );
      return [...data].sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return buildMockRecommendations(Date.now());
    }
  }

  /**
   * Execute a one-click action for a recommendation. Throws on failure so the
   * caller can surface an error state.
   */
  static async executeAction(
    recommendationId: string,
    actionId: string,
  ): Promise<ActionExecutionResult> {
    try {
      const { data } = await apiClient.post<ActionExecutionResult>(
        `/ai/recommendations/${recommendationId}/actions/${actionId}`,
      );
      return data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to execute action',
      );
    }
  }

  /** Load persisted AI preferences from localStorage, merged over defaults. */
  static loadSettings(): AITriggerPreferences {
    if (typeof window === 'undefined') return DEFAULT_AI_PREFERENCES;
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_AI_PREFERENCES;
      const parsed = JSON.parse(raw) as Partial<AITriggerPreferences>;
      return {
        ...DEFAULT_AI_PREFERENCES,
        ...parsed,
        triggerConditions: {
          ...DEFAULT_AI_PREFERENCES.triggerConditions,
          ...parsed.triggerConditions,
        },
      };
    } catch {
      return DEFAULT_AI_PREFERENCES;
    }
  }

  /** Persist AI preferences to localStorage. */
  static saveSettings(settings: AITriggerPreferences): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable (private mode / quota) — non-fatal */
    }
  }
}

/**
 * Open a WebSocket for streamed AI analyses. Returns a disposer that closes the
 * socket. No-ops (returning a noop disposer) when WebSocket is unavailable, so
 * the caller never has to guard for SSR or test environments.
 */
export const createAISocket = (
  publicKey: string,
  onMessage: (message: AIRealtimeMessage) => void,
  onStatusChange?: (connected: boolean) => void,
): (() => void) => {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
    return () => {};
  }

  let socket: WebSocket;
  try {
    socket = new WebSocket(`${WS_BASE}?account=${encodeURIComponent(publicKey)}`);
  } catch {
    return () => {};
  }

  socket.onopen = () => onStatusChange?.(true);
  socket.onclose = () => onStatusChange?.(false);
  socket.onerror = () => onStatusChange?.(false);
  socket.onmessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data as string) as AIRealtimeMessage;
      if (message && message.type === 'recommendation') {
        onMessage(message);
      }
    } catch {
      /* ignore malformed frames */
    }
  };

  return () => {
    socket.onopen = null;
    socket.onclose = null;
    socket.onerror = null;
    socket.onmessage = null;
    socket.close();
  };
};

export default AIAnalysisService;
