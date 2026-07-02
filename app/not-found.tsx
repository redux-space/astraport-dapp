import React from 'react';
import ThemeToggle from '../components/ThemeToggle';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="text-center">
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/AstraPort_logo.svg" alt="AstraPort Logo" className="w-96 h-34 object-contain" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a
          href="/"
          className="px-6 py-3 bg-stellar-600 text-white rounded-lg hover:bg-stellar-700 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}