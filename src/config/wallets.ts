/**
 * Static configuration for the guided wallet-connection flow: the two Stellar
 * networks the user can pick, and per-wallet metadata used to score
 * recommendations. Detection of what is actually installed happens at runtime
 * in the wallet-kit service; this file only holds the fixed data.
 */

import { StellarNetwork } from '@/types';

export interface NetworkOption {
  id: StellarNetwork;
  /** User-facing label. Mainnet is the public network. */
  label: string;
  description: string;
}

/** Testnet is listed first and used as the safe default. */
export const NETWORKS: NetworkOption[] = [
  {
    id: 'testnet',
    label: 'Testnet',
    description: 'Test network with free funds. Use this to explore safely.',
  },
  {
    id: 'public',
    label: 'Mainnet',
    description: 'Live network with real assets. Transactions move real funds.',
  },
];

export const DEFAULT_NETWORK: StellarNetwork = 'testnet';

/**
 * Recommendation weights per wallet, independent of runtime availability.
 * `popularity` and `security` are 0-1 ratings; `mobileFriendly` flags wallets
 * that work well on mobile browsers. The recommendation logic combines these
 * with device type and previous-usage history — see utils/walletRecommendation.
 */
export interface WalletWeights {
  id: string;
  popularity: number;
  security: number;
  mobileFriendly: boolean;
}

export const WALLET_WEIGHTS: Record<string, WalletWeights> = {
  freighter: { id: 'freighter', popularity: 0.9, security: 0.9, mobileFriendly: false },
  xbull: { id: 'xbull', popularity: 0.7, security: 0.8, mobileFriendly: true },
  albedo: { id: 'albedo', popularity: 0.6, security: 0.7, mobileFriendly: true },
  rabet: { id: 'rabet', popularity: 0.5, security: 0.7, mobileFriendly: false },
  lobstr: { id: 'lobstr', popularity: 0.8, security: 0.85, mobileFriendly: true },
};

/** Fallback weights for a wallet the kit reports that we have no rating for. */
export const DEFAULT_WEIGHTS: Omit<WalletWeights, 'id'> = {
  popularity: 0.3,
  security: 0.5,
  mobileFriendly: false,
};

/** localStorage key holding the id of the last wallet the user connected with. */
export const LAST_WALLET_KEY = 'astraport.lastWalletId';
