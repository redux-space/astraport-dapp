'use client';

import React from 'react';
import WalletConnect from '@/components/wallet/WalletConnect';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import PortfolioChart from '@/components/dashboard/PortfolioChart';
import RiskScoreDisplay from '@/components/risk/RiskScoreDisplay';
import InsightsList from '@/components/insights/InsightsList';
import { useWalletStore } from '@/store';

export default function Home() {
  const { connected } = useWalletStore();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <img src="/AstraPort_logo.svg" alt="AstraPort Logo" className="w-56 h-14 object-contain" />
          </a>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!connected ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Welcome to AstraPort</h2>
            <p className="text-gray-600 mb-8">
              Connect your Stellar wallet to view your portfolio and get AI-driven insights.
            </p>
            <div className="flex justify-center">
              <div className="w-64">
                <WalletConnect />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Portfolio Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Portfolio Overview</h2>
              <PortfolioOverview />
            </section>

            {/* Charts and Risk */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PortfolioChart />
              </div>
              <div>
                <RiskScoreDisplay />
              </div>
            </div>

            {/* Insights */}
            <section>
              <InsightsList />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}