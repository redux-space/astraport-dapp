'use client';

import React from 'react';
import WalletConnect from '@/components/wallet/WalletConnect';
import ThemeToggle from '../../components/ThemeToggle';
import { StakingDashboard } from '@/components/staking/StakingDashboard';
import { useWalletStore } from '@/store';

export default function StakingPage() {
  const { account } = useWalletStore();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/AstraPort_logo.svg"
              alt="AstraPort Logo"
              className="w-56 h-14 object-contain"
            />
          </a>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to dashboard
          </a>
        </div>

        {/* Staking Dashboard */}
        <StakingDashboard publicKey={account?.publicKey} />
      </div>
    </main>
  );
}
