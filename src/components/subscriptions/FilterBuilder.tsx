'use client';

import React, { useState } from 'react';
import { SubscriptionFilter } from '@/types/subscriptions';

interface FilterBuilderProps {
  filters: SubscriptionFilter[];
  onChange: (filters: SubscriptionFilter[]) => void;
}

const FIELD_OPTIONS = [
  { value: 'amount', label: 'Amount' },
  { value: 'asset', label: 'Asset' },
  { value: 'source', label: 'Source' },
  { value: 'destination', label: 'Destination' },
  { value: 'memo', label: 'Memo' },
];

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
];

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  filters,
  onChange,
}) => {
  const [newFilter, setNewFilter] = useState<Partial<SubscriptionFilter>>({
    field: 'amount',
    operator: 'greater_than',
    value: '',
  });

  const addFilter = () => {
    if (!newFilter.field || !newFilter.operator || !newFilter.value) return;
    onChange([...filters, newFilter as SubscriptionFilter]);
    setNewFilter({ field: 'amount', operator: 'greater_than', value: '' });
  };

  const removeFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Custom Filters</h4>

      {filters.length === 0 && (
        <p className="text-sm text-gray-500">No filters configured</p>
      )}

      {filters.map((filter, index) => (
        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-700">
            {filter.field} {filter.operator} "{filter.value}"
          </span>
          <button
            onClick={() => removeFilter(index)}
            className="ml-auto text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Field</label>
          <select
            value={newFilter.field}
            onChange={(e) =>
              setNewFilter({ ...newFilter, field: e.target.value })
            }
            className="block w-full rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {FIELD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Operator</label>
          <select
            value={newFilter.operator}
            onChange={(e) =>
              setNewFilter({
                ...newFilter,
                operator: e.target.value as SubscriptionFilter['operator'],
              })
            }
            className="block w-full rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {OPERATOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Value</label>
          <input
            type="text"
            value={newFilter.value}
            onChange={(e) =>
              setNewFilter({ ...newFilter, value: e.target.value })
            }
            className="block w-full rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Value"
          />
        </div>

        <button
          onClick={addFilter}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  );
};
