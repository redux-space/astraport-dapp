import React from 'react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/PayCraft_logo.svg" alt="AstraPort Logo" className="w-12 h-12 object-contain" />
          <span className="text-3xl font-bold text-stellar-600">AstraPort</span>
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