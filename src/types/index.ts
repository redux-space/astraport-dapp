export interface WalletAccount {
  publicKey: string;
  accountId: string;
  network: 'public' | 'testnet';
}

/** Stellar network the user connects against. Maps to WalletAccount['network']. */
export type StellarNetwork = 'public' | 'testnet';

/** Static metadata describing a supported Stellar wallet. */
export interface WalletInfo {
  /** Stable id from the wallet kit (e.g. 'freighter', 'xbull'). */
  id: string;
  name: string;
  /** Icon URL or data URI supplied by the kit. */
  icon: string;
  /** True when the wallet is installed/available on this device. */
  available: boolean;
  /** Deep link / install page shown when the wallet is not available. */
  url?: string;
}

/** A wallet paired with the reason it was recommended, if any. */
export interface WalletRecommendation {
  walletId: string;
  reason: string;
}

export interface Asset {
  code: string;
  issuer: string;
  balance: string;
  native: boolean;
}

export interface Portfolio {
  totalBalance: string;
  baseCurrency: string;
  assets: Asset[];
  lastUpdated: number;
}

export interface RiskScore {
  overall: number;
  volatility: number;
  concentration: number;
  counterpartyRisk: number;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  action?: string;
  timestamp: number;
}

export interface DashboardData {
  portfolio: Portfolio;
  riskScore: RiskScore;
  insights: AIInsight[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

// Export staking types
export * from './staking';
export * from './ai';
export * from './subscriptions';
