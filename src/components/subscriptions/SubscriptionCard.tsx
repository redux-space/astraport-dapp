'use client';

import React from 'react';
import { EventSubscription } from '@/types/subscriptions';
import { useSubscriptionStore } from '@/store/subscriptionStore';

interface SubscriptionCardProps {
  subscription: EventSubscription;
  eventTypeName: string;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  eventTypeName,
}) => {
  const { toggleSubscription, selectSubscription, openEditModal, testNotification } =
    useSubscriptionStore();

  const handleEdit = () => {
    selectSubscription(subscription.eventTypeId);
    openEditModal();
  };

  const handleTest = () => {
    testNotification(subscription.eventTypeId);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">{eventTypeName}</h3>
          <p className="mt-1 text-xs text-gray-500">
            {subscription.deliveryPreferences.frequency} •{' '}
            {subscription.deliveryPreferences.channels.join(', ')}
          </p>
        </div>

        <span
          className={`px-2 py-1 text-xs rounded-full ${
            subscription.status === 'active'
              ? 'bg-green-100 text-green-800'
              : subscription.status === 'paused'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {subscription.status}
        </span>
      </div>

      {subscription.filters.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            {subscription.filters.length} filter(s) applied
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => toggleSubscription(subscription.eventTypeId)}
          className={`px-3 py-1.5 text-xs rounded ${
            subscription.enabled
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {subscription.enabled ? 'Disable' : 'Enable'}
        </button>

        <button
          onClick={handleEdit}
          className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          Edit
        </button>

        <button
          onClick={handleTest}
          className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
        >
          Test
        </button>
      </div>
    </div>
  );
};
