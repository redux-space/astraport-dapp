'use client';

import React, { useState } from 'react';
import { useWalletStore } from '@/store';
import { ConnectWalletModal } from './ConnectWalletModal';

/**
 * Entry point for wallet connection. When disconnected it renders a button that
 * opens the guided modal (network → wallet → connect). When connected it shows
 * a compact account summary with a disconnect action.
 */
export const WalletConnect: React.FC = () => {
  const { connected, account, disconnect } = useWalletStore();
  const [modalOpen, setModalOpen] = useState(false);

  if (connected && account) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <p className="font-semibold">{account.publicKey.substring(0, 8)}…</p>
          <p className="text-xs text-gray-500">
            {account.network === 'public' ? 'Mainnet' : 'Testnet'}
          </p>
        </div>
        <button
          onClick={disconnect}
          className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="rounded-lg bg-stellar-600 px-4 py-2 text-white hover:bg-stellar-700"
      >
        Connect Wallet
      </button>
      <ConnectWalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default WalletConnect;
