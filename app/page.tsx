'use client';

import React from 'react';
import WalletConnect from '@/components/wallet/WalletConnect';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedLogo from '@/components/AnimatedLogo';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import PortfolioChart from '@/components/dashboard/PortfolioChart';
import RiskScoreDisplay from '@/components/risk/RiskScoreDisplay';
import InsightsList from '@/components/insights/InsightsList';
import { useWalletStore } from '@/store';

export default function Home() {
  const { connected } = useWalletStore();

  if (connected) {
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
              <a
                href="/rebalance"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-navy dark:bg-brand-teal text-white dark:text-brand-navy text-sm font-semibold hover:bg-stellar-700 dark:hover:bg-stellar-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rebalance
              </a>
              <ThemeToggle />
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Portfolio Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Portfolio Overview</h2>
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
        </div>
      </main>
    );
  }

  // Elegant landing page for disconnected users
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10 sticky top-0 z-50 opacity-0 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <AnimatedLogo />
          </a>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-stellar-50/60 via-transparent to-teal-50/40 dark:from-brand-teal/5 dark:via-transparent dark:to-brand-navy/20"></div>
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
          }}
        ></div>
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-brand-teal/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-pulse-soft animate-float"></div>
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-brand-navy/20 dark:bg-brand-navy/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-pulse-soft animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-brand-teal/30 bg-brand-teal/5 dark:bg-brand-teal/10 text-sm font-medium text-brand-teal opacity-0 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
              </span>
              Non-custodial · Powered by the Stellar Network
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight opacity-0 animate-fade-in-up delay-100">
              Unlock the Power of
              <span className="block bg-gradient-to-r from-brand-navy via-brand-teal to-brand-navy dark:from-brand-teal dark:via-teal-300 dark:to-brand-teal bg-clip-text text-transparent mt-2 animate-gradient">
                Stellar Portfolio Intelligence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-in-up delay-200">
              Connect your Stellar wallet and gain AI-driven insights, risk analysis, and beautiful portfolio visualization for your digital assets.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0 animate-fade-in-up delay-400">
              <div className="w-64">
                <WalletConnect />
              </div>
              <a href="#features" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-white/15 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-white/10 hover:border-brand-teal/40 transition-all duration-200 font-medium backdrop-blur-sm">
                Explore Features
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center mb-16 opacity-0 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Stellar Investors</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Everything you need to manage, analyze, and optimize your Stellar portfolio in one elegant platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Real-time Portfolio Tracking',
              body: 'Monitor your Stellar assets with live price updates, total value calculations, and comprehensive holdings overview.',
              delay: 'delay-100',
              path: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
            },
            {
              title: 'AI-Powered Risk Analysis',
              body: "Advanced risk scoring algorithms evaluate your portfolio's exposure and provide actionable recommendations.",
              delay: 'delay-300',
              path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            },
            {
              title: 'Intelligent Insights',
              body: 'Get personalized insights and market analysis to help you make informed investment decisions on Stellar.',
              delay: 'delay-500',
              path: 'M13 10V3L4 14h7v7l9-11h-7z',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`group relative bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-xl hover:shadow-brand-teal/10 hover:border-brand-teal/30 transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up ${feature.delay}`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-stellar-50 to-teal-100 dark:from-brand-teal/20 dark:to-brand-navy/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.path} />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden bg-brand-navy py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy to-brand-teal/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 'Free', label: 'Always Free to Use', delay: 'delay-100' },
              { value: 'Open', label: 'Built on Stellar Network', delay: 'delay-200' },
              { value: 'Secure', label: 'Non-custodial Design', delay: 'delay-300' },
              { value: 'Smart', label: 'AI-Powered Analysis', delay: 'delay-400' },
            ].map((stat) => (
              <div key={stat.value} className={`opacity-0 animate-fade-in-up ${stat.delay}`}>
                <p className="text-4xl font-bold text-white mb-2 transform transition-transform duration-300 hover:scale-110">{stat.value}</p>
                <p className="text-teal-100/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10 bg-gradient-to-br from-stellar-50 to-white dark:from-white/5 dark:to-transparent px-6 py-16 opacity-0 animate-fade-in-up delay-100">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-teal/10 rounded-full filter blur-3xl"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">Connect your Stellar wallet today and unlock the full potential of your portfolio.</p>
            <div className="flex justify-center">
              <div className="w-64">
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p>&copy; 2024 AstraPort. Built for the Stellar community.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}