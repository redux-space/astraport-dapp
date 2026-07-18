/**
 * Pure logic that picks the "best" wallet to recommend from the set the device
 * actually has available. Scoring combines four signals:
 *
 *   - previous usage  (strongest — people want the wallet they already use)
 *   - popularity      (from config weights)
 *   - security rating (from config weights)
 *   - device fit      (mobile-friendly wallets score higher on mobile)
 *
 * Everything here is deterministic given its inputs, so it is unit-tested in
 * isolation. Availability detection and localStorage reads happen in the caller;
 * this module takes them as plain arguments.
 */

import { WalletInfo, WalletRecommendation } from '@/types';
import { WALLET_WEIGHTS, DEFAULT_WEIGHTS } from '@/config/wallets';

export type DeviceType = 'mobile' | 'desktop';

/** Signal weights. Previous usage dominates; the rest break ties. */
const WEIGHT_PREVIOUS = 1.0;
const WEIGHT_POPULARITY = 0.4;
const WEIGHT_SECURITY = 0.4;
const WEIGHT_DEVICE_FIT = 0.3;

const weightsFor = (id: string) => WALLET_WEIGHTS[id] ?? { id, ...DEFAULT_WEIGHTS };

/**
 * Score a single wallet for the given device and history. Not exported as part
 * of the public surface, but kept named for readable tests.
 */
export const scoreWallet = (
  wallet: WalletInfo,
  device: DeviceType,
  lastWalletId: string | null,
): number => {
  const w = weightsFor(wallet.id);
  let score = 0;
  if (lastWalletId && wallet.id === lastWalletId) score += WEIGHT_PREVIOUS;
  score += w.popularity * WEIGHT_POPULARITY;
  score += w.security * WEIGHT_SECURITY;
  if (device === 'mobile' && w.mobileFriendly) score += WEIGHT_DEVICE_FIT;
  // On desktop, extension-style wallets (not mobileFriendly) get the fit bonus.
  if (device === 'desktop' && !w.mobileFriendly) score += WEIGHT_DEVICE_FIT;
  return score;
};

const reasonFor = (
  wallet: WalletInfo,
  device: DeviceType,
  lastWalletId: string | null,
): string => {
  if (lastWalletId && wallet.id === lastWalletId) {
    return 'You used this wallet last time.';
  }
  const w = weightsFor(wallet.id);
  if (device === 'mobile' && w.mobileFriendly) {
    return 'Works well on mobile and is widely trusted.';
  }
  if (w.popularity >= 0.8) return 'Popular, well-supported Stellar wallet.';
  if (w.security >= 0.85) return 'Strong security track record.';
  return 'Compatible with your device.';
};

/**
 * Recommend one wallet from those available. Returns null when nothing is
 * available (the UI then shows install prompts instead of a recommendation).
 * Ties are broken by the config order via a stable sort on score.
 */
export const recommendWallet = (
  available: WalletInfo[],
  device: DeviceType,
  lastWalletId: string | null = null,
): WalletRecommendation | null => {
  const installed = available.filter((w) => w.available);
  if (installed.length === 0) return null;

  let best = installed[0];
  let bestScore = scoreWallet(best, device, lastWalletId);
  for (let i = 1; i < installed.length; i++) {
    const s = scoreWallet(installed[i], device, lastWalletId);
    if (s > bestScore) {
      best = installed[i];
      bestScore = s;
    }
  }

  return { walletId: best.id, reason: reasonFor(best, device, lastWalletId) };
};

/** Detect device type from a user-agent string. Safe to call with ''. */
export const detectDeviceType = (userAgent: string): DeviceType =>
  /android|iphone|ipad|ipod|mobile/i.test(userAgent) ? 'mobile' : 'desktop';
