'use client';

import React from 'react';
import { WalletInfo, WalletRecommendation } from '@/types';

interface Props {
  wallets: WalletInfo[];
  recommendation: WalletRecommendation | null;
  loading: boolean;
  /** True while a connection attempt is in flight; disables the buttons. */
  connecting?: boolean;
  onSelect: (walletId: string) => void;
}

/**
 * Lists detected wallets. Available wallets are actionable connect buttons;
 * unavailable ones link out to their install page. The recommended wallet is
 * sorted first and badged.
 */
export const WalletList: React.FC<Props> = ({
  wallets,
  recommendation,
  loading,
  connecting = false,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500" aria-live="polite">
        Detecting wallets…
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No supported wallets found on this device.
      </div>
    );
  }

  // Recommended first, then available, then the rest — stable within groups.
  const sorted = [...wallets].sort((a, b) => {
    const aRec = recommendation?.walletId === a.id ? 1 : 0;
    const bRec = recommendation?.walletId === b.id ? 1 : 0;
    if (aRec !== bRec) return bRec - aRec;
    return Number(b.available) - Number(a.available);
  });

  return (
    <ul className="space-y-2" aria-busy={connecting}>
      {sorted.map((w) => {
        const isRecommended = recommendation?.walletId === w.id;
        return (
          <li key={w.id}>
            {w.available ? (
              <button
                type="button"
                onClick={() => onSelect(w.id)}
                disabled={connecting}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-stellar-50 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isRecommended ? 'border-stellar-500 bg-stellar-50' : 'border-gray-200'
                }`}
              >
                <WalletIcon icon={w.icon} name={w.name} />
                <span className="flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{w.name}</span>
                    {isRecommended && (
                      <span className="rounded-full bg-stellar-500 px-2 py-0.5 text-xs font-medium text-white">
                        Recommended
                      </span>
                    )}
                  </span>
                  {isRecommended && recommendation && (
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {recommendation.reason}
                    </span>
                  )}
                </span>
                <span className="text-sm font-medium text-stellar-600">Connect</span>
              </button>
            ) : (
              <a
                href={w.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-lg border border-dashed border-gray-200 p-3 text-left opacity-75 transition-opacity hover:opacity-100"
              >
                <WalletIcon icon={w.icon} name={w.name} />
                <span className="flex-1 font-medium text-gray-500">{w.name}</span>
                <span className="text-sm font-medium text-stellar-600">Install</span>
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const WalletIcon: React.FC<{ icon: string; name: string }> = ({ icon, name }) =>
  icon ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={icon} alt="" aria-hidden="true" className="h-8 w-8 rounded" />
  ) : (
    <span
      className="flex h-8 w-8 items-center justify-center rounded bg-stellar-100 text-sm font-semibold text-stellar-700"
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );

export default WalletList;
