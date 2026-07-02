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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 opacity-0 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <AnimatedLogo />
          </a>
          <WalletConnect />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-stellar-50/50 to-teal-50/50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-navy/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-brand-teal/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight opacity-0 animate-fade-in-up">
              Unlock the Power of
              <span className="block bg-gradient-to-r from-brand-navy to-brand-teal bg-clip-text text-transparent mt-2">
                Stellar Portfolio Intelligence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-in-up delay-200">
              Connect your Stellar wallet and gain AI-driven insights, risk analysis, and beautiful portfolio visualization for your digital assets.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0 animate-fade-in-up delay-400">
              <div className="w-64">
                <WalletConnect />
              </div>
              <a href="#features" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium">
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 opacity-0 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Stellar Investors</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to manage, analyze, and optimize your Stellar portfolio in one elegant platform.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up delay-100">
            <div className="w-14 h-14 bg-stellar-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Portfolio Tracking</h3>
            <p className="text-gray-600 leading-relaxed">Monitor your Stellar assets with live price updates, total value calculations, and comprehensive holdings overview.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up delay-300">
            <div className="w-14 h-14 bg-stellar-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Risk Analysis</h3>
            <p className="text-gray-600 leading-relaxed">Advanced risk scoring algorithms evaluate your portfolio&apos;s exposure and provide actionable recommendations.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up delay-500">
            <div className="w-14 h-14 bg-stellar-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Intelligent Insights</h3>
            <p className="text-gray-600 leading-relaxed">Get personalized insights and market analysis to help you make informed investment decisions on Stellar.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="opacity-0 animate-fade-in-up delay-100">
              <p className="text-4xl font-bold text-white mb-2 transform transition-transform duration-300 hover:scale-110">Free</p>
              <p className="text-teal-100">Always Free to Use</p>
            </div>
            <div className="opacity-0 animate-fade-in-up delay-200">
              <p className="text-4xl font-bold text-white mb-2 transform transition-transform duration-300 hover:scale-110">Open</p>
              <p className="text-teal-100">Built on Stellar Network</p>
            </div>
            <div className="opacity-0 animate-fade-in-up delay-300">
              <p className="text-4xl font-bold text-white mb-2 transform transition-transform duration-300 hover:scale-110">Secure</p>
              <p className="text-teal-100">Non-custodial Design</p>
            </div>
            <div className="opacity-0 animate-fade-in-up delay-400">
              <p className="text-4xl font-bold text-white mb-2 transform transition-transform duration-300 hover:scale-110">Smart</p>
              <p className="text-teal-100">AI-Powered Analysis</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="opacity-0 animate-fade-in-up delay-100">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Connect your Stellar wallet today and unlock the full potential of your portfolio.</p>
          <div className="flex justify-center">
            <div className="w-64">
              <WalletConnect />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
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