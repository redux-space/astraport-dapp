'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { NETWORKS } from '@/config/wallets';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { NetworkSelector } from './NetworkSelector';
import { WalletList } from './WalletList';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Selectors for the focusable elements a focus-trap needs to consider. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Guided connect-wallet modal. Step 1 picks a network, step 2 lists detected
 * wallets with a recommendation, then connection resolves against the store.
 * Establishes the app's first dialog: focus is trapped, Esc closes, and the
 * backdrop is click-dismissable.
 */
export const ConnectWalletModal: React.FC<Props> = ({ open, onClose }) => {
  const {
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
  } = useWalletConnection();

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on success, and reset the flow whenever the modal is dismissed so it
  // reopens at the network step.
  useEffect(() => {
    if (step === 'done') onClose();
  }, [step, onClose]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Esc to close + focus trap while open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (open && panelRef.current) {
      const target = panelRef.current.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    }
  }, [open, step]);

  if (!open) return null;

  const networkLabel =
    NETWORKS.find((n) => n.id === network)?.label ?? network;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-wallet-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            {step === 'wallet' && (
              <button
                type="button"
                onClick={back}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Back to network selection"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 id="connect-wallet-title" className="text-lg font-bold text-gray-900">
              {step === 'network' ? 'Select a network' : 'Choose a wallet'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {step === 'network' && (
            <>
              <p className="mb-4 text-sm text-gray-500">
                Choose which Stellar network to connect to. You can switch later by
                reconnecting.
              </p>
              <NetworkSelector selected={network} onSelect={selectNetwork} />
            </>
          )}

          {(step === 'wallet' || step === 'connecting') && (
            <>
              <p className="mb-4 text-sm text-gray-500">
                Connecting on{' '}
                <span className="font-medium text-gray-700">{networkLabel}</span>.
                Pick a wallet installed on this device.
              </p>
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}
              <WalletList
                wallets={wallets}
                recommendation={recommendation}
                loading={loadingWallets}
                connecting={step === 'connecting'}
                onSelect={chooseWallet}
              />
            </>
          )}
        </div>

        {/* Footer */}
        {step === 'network' && (
          <div className="border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={proceedToWallets}
              className="w-full rounded-lg bg-stellar-600 px-4 py-2.5 font-semibold text-white hover:bg-stellar-700"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectWalletModal;
