'use client';

import React from 'react';
import { useDashboardStore } from '@/store';

export const RiskScoreDisplay: React.FC = () => {
  const { riskScore } = useDashboardStore();

  if (!riskScore) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Risk Assessment</h2>
        <p className="text-gray-500">No risk data available</p>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Risk Assessment</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <p className="text-gray-600 mb-2">Overall Risk</p>
          <p className={`text-4xl font-bold ${getRiskColor(riskScore.overall)}`}>
            {riskScore.overall.toFixed(1)}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-gray-600 mb-2">Volatility</p>
          <p className={`text-3xl font-bold ${getRiskColor(riskScore.volatility)}`}>
            {riskScore.volatility.toFixed(1)}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-gray-600 mb-2">Concentration</p>
          <p className={`text-3xl font-bold ${getRiskColor(riskScore.concentration)}`}>
            {riskScore.concentration.toFixed(1)}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-gray-600 mb-2">Counterparty</p>
          <p className={`text-3xl font-bold ${getRiskColor(riskScore.counterpartyRisk)}`}>
            {riskScore.counterpartyRisk.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskScoreDisplay;
