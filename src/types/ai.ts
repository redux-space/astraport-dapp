/**
 * Domain model for the AI Analysis Results Dashboard.
 *
 * These types describe the AI-generated recommendations surfaced from portfolio
 * events and market conditions, the actions users can take on them, the
 * historical analysis feed, and the user-configurable trigger preferences.
 */

/** Bucketed confidence used for colour/labelling. Derived from the 0–100 score. */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/** Broad grouping used for filtering and iconography. */
export type RecommendationCategory =
  | 'rebalance'
  | 'risk'
  | 'opportunity'
  | 'security'
  | 'market';

/** How urgently the user should look at a recommendation. */
export type RecommendationSeverity = 'info' | 'warning' | 'critical';

/** Kind of a suggested action, which decides how it is executed. */
export type SuggestedActionType =
  | 'rebalance'
  | 'review'
  | 'dismiss'
  | 'navigate'
  | 'custom';

/** A single action the user can take in response to a recommendation. */
export interface SuggestedAction {
  id: string;
  label: string;
  type: SuggestedActionType;
  /** Route or URL for navigational actions. */
  href?: string;
  /**
   * True when the action can be triggered directly from the dashboard in one
   * click (fires through the AI action executor). Navigational actions are
   * usually links and set this to false.
   */
  executable: boolean;
}

/** A supporting data point backing the AI's reasoning. */
export interface EvidenceItem {
  label: string;
  value: string;
  detail?: string;
}

/** A complete AI-generated recommendation. */
export interface AIRecommendation {
  id: string;
  title: string;
  /** One-line insight shown on the card. */
  summary: string;
  /** Full narrative analysis shown in the details modal. */
  analysis: string;
  /** Step-by-step reasoning behind the recommendation. */
  reasoning: string;
  /** Plain-language explanation of why the confidence score is what it is. */
  confidenceExplanation: string;
  /** Confidence as a 0–100 percentage. */
  confidence: number;
  category: RecommendationCategory;
  severity: RecommendationSeverity;
  actions: SuggestedAction[];
  evidence?: EvidenceItem[];
  /** Human-readable recommendation type, e.g. "Concentration analysis". */
  type: string;
  /** Epoch millis the analysis was created. */
  createdAt: number;
  /** Whether the user has seen this recommendation. */
  read: boolean;
}

/** Result returned after executing a one-click action. */
export interface ActionExecutionResult {
  success: boolean;
  message: string;
}

/** How often the user wants to be alerted about new analyses. */
export type AlertFrequency = 'realtime' | 'hourly' | 'daily';

/** Conditions that can trigger a fresh AI analysis. */
export interface TriggerConditions {
  /** Significant change in portfolio value or allocation. */
  portfolioChange: boolean;
  /** Elevated market volatility. */
  marketVolatility: boolean;
  /** Risk score crossing a configured threshold. */
  riskThreshold: boolean;
  /** Periodic scheduled analysis. */
  scheduled: boolean;
}

/** User-configurable AI trigger and notification preferences. */
export interface AITriggerPreferences {
  /** Master switch for AI notifications. */
  notificationsEnabled: boolean;
  /** How frequently alerts are delivered. */
  alertFrequency: AlertFrequency;
  /** Which events are allowed to trigger an analysis. */
  triggerConditions: TriggerConditions;
  /** Categories the user wants to receive. */
  enabledCategories: RecommendationCategory[];
  /** Only surface recommendations at or above this confidence (0–100). */
  minConfidence: number;
}

/**
 * Shape of a real-time message pushed over the WebSocket. Currently only new
 * recommendations are streamed, but the discriminated union leaves room to grow.
 */
export type AIRealtimeMessage = {
  type: 'recommendation';
  recommendation: AIRecommendation;
};
