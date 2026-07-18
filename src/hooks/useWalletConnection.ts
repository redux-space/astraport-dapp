/**
 * Orchestrates the guided connect-wallet flow as a small state machine:
 *
 *   idle → network → wallet → connecting → done
 *                                   ↘ error (recoverable, back to wallet)
 *
 * The hook owns the flow's transient state (current step, chosen network,
 * detected wallets, recommendation, errors) and commits the final account to
 * the global wallet store. UI components stay presentational and drive the
 * flow through the returned actions.
 */

import { useCallback, useEffect, useState } from 'react';
import { useWalletStore } from '@/store';
import { StellarNetwork, WalletInfo, WalletRecommendation } from '@/types';
import { DEFAULT_NETWORK, LAST_WALLET_KEY } from '@/config/wallets';
import {
  detectDeviceType,
  recommendWallet,
} from '@/utils/walletRecommendation';
import { getAvailableWallets, connectWallet } from '@/services/walletKit';

export type ConnectStep = 'network' | 'wallet' | 'connecting' | 'done';

const readLastWallet = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LAST_WALLET_KEY);
  } catch {
    return null;
  }
};

const writeLastWallet = (id: string): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_WALLET_KEY, id);
  } catch {
    // Ignore storage failures (private mode, disabled storage).
  }
};

export interface UseWalletConnection {
  step: ConnectStep;
  network: StellarNetwork;
  wallets: WalletInfo[];
  recommendation: WalletRecommendation | null;
  loadingWallets: boolean;
  error: string | null;
  selectNetwork: (network: StellarNetwork) => void;
  proceedToWallets: () => void;
  chooseWallet: (walletId: string) => Promise<void>;
  back: () => void;
  reset: () => void;
}

export const useWalletConnection = (): UseWalletConnection => {
  const connect = useWalletStore((s) => s.connect);

  const [step, setStep] = useState<ConnectStep>('network');
  const [network, setNetwork] = useState<StellarNetwork>(DEFAULT_NETWORK);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [recommendation, setRecommendation] =
    useState<WalletRecommendation | null>(null);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The network wallets were last detected for. Guards against re-detecting
  // (and clearing a connection error) when returning to the wallet step after
  // a failed connect. Reset on network change so a switch triggers a refetch.
  const [detectedNetwork, setDetectedNetwork] = useState<StellarNetwork | null>(
    null,
  );

  // Detect wallets when entering the wallet step for a network we haven't
  // detected yet, since availability can differ per network config. Returning
  // to an already-detected step (e.g. after a connection error) is a no-op so
  // the error stays visible.
  useEffect(() => {
    if (step !== 'wallet' || detectedNetwork === network) return;
    let cancelled = false;

    setLoadingWallets(true);
    setError(null);
    getAvailableWallets(network)
      .then((detected) => {
        if (cancelled) return;
        setWallets(detected);
        setDetectedNetwork(network);
        const device = detectDeviceType(
          typeof navigator !== 'undefined' ? navigator.userAgent : '',
        );
        setRecommendation(recommendWallet(detected, device, readLastWallet()));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Could not detect wallets.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingWallets(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, network, detectedNetwork]);

  const selectNetwork = useCallback((next: StellarNetwork) => {
    setNetwork(next);
  }, []);

  const proceedToWallets = useCallback(() => {
    setError(null);
    setStep('wallet');
  }, []);

  const chooseWallet = useCallback(
    async (walletId: string) => {
      setStep('connecting');
      setError(null);
      try {
        const result = await connectWallet(walletId, network);
        writeLastWallet(walletId);
        connect({
          publicKey: result.publicKey,
          accountId: result.publicKey,
          network: result.network,
        });
        setStep('done');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Wallet connection failed.',
        );
        // Return to wallet selection so the user can retry or pick another.
        setStep('wallet');
      }
    },
    [network, connect],
  );

  const back = useCallback(() => {
    setError(null);
    setStep((current) => (current === 'wallet' ? 'network' : current));
  }, []);

  const reset = useCallback(() => {
    setStep('network');
    setNetwork(DEFAULT_NETWORK);
    setWallets([]);
    setRecommendation(null);
    setError(null);
    setDetectedNetwork(null);
  }, []);

  return {
    step,
    network,
    wallets,
    recommendation,
    loadingWallets,
    error,
    selectNetwork,
    proceedToWallets,
    chooseWallet,
    back,
    reset,
  };
};

export default useWalletConnection;
