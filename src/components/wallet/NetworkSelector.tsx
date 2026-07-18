'use client';

import React from 'react';
import { StellarNetwork } from '@/types';
import { NETWORKS } from '@/config/wallets';

interface Props {
  selected: StellarNetwork;
  onSelect: (network: StellarNetwork) => void;
}

/**
 * Radio-group of the two Stellar networks. Uses roving semantics via native
 * radio inputs (visually hidden) so keyboard and screen-reader users get the
 * expected arrow-key behaviour for free.
 */
export const NetworkSelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div role="radiogroup" aria-label="Select network" className="space-y-3">
      {NETWORKS.map((net) => {
        const isSelected = selected === net.id;
        const isMainnet = net.id === 'public';
        return (
          <label
            key={net.id}
            className={`block cursor-pointer rounded-lg border-2 p-4 transition-colors ${
              isSelected
                ? 'border-stellar-500 bg-stellar-50'
                : 'border-gray-200 hover:border-stellar-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="network"
                value={net.id}
                checked={isSelected}
                onChange={() => onSelect(net.id)}
                className="sr-only"
              />
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? 'border-stellar-500' : 'border-gray-400'
                }`}
                aria-hidden="true"
              >
                {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-stellar-500" />}
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{net.label}</span>
                  {isMainnet && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Real funds
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-sm text-gray-500">{net.description}</span>
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
};

export default NetworkSelector;
