'use client';

import React from 'react';
import WalletConnect from '@/components/wallet/WalletConnect';
import ThemeToggle from '../../components/ThemeToggle';
import { RebalancingWizard } from '@/components/rebalancing/RebalancingWizard';

export default function RebalancePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/AstraPort_logo.svg" alt="AstraPort Logo" className="w-56 h-14 object-contain" />
          </a>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Wizard Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-brand-teal transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </a>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">Rebalancing Planner</h1>
          <p className="mt-1 text-gray-600 dark:text-slate-400">
            Plan a multi-asset rebalance, compare execution strategies, and preview costs before anything moves.
          </p>
        </div>

        <RebalancingWizard />
      </div>
    </main>
  );
}
