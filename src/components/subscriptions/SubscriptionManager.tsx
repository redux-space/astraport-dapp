'use client';

import React from 'react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { EventTypeTree } from './EventTypeTree';
import { SubscriptionCard } from './SubscriptionCard';
import { EditSubscriptionModal } from './EditSubscriptionModal';

export const SubscriptionManager: React.FC = () => {
  const { eventTypes, subscriptions } = useSubscriptionStore();

  const activeSubscriptions = Object.values(subscriptions).filter(
    (sub) => sub.enabled,
  );

  const findEventTypeName = (id: string): string => {
    for (const eventType of eventTypes) {
      if (eventType.id === id) return eventType.name;
      if (eventType.children) {
        for (const child of eventType.children) {
          if (child.id === id) return child.name;
        }
      }
    }
    return id;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Event Subscriptions
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure which events you want to receive notifications for and how
          you want to receive them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Event Types
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Select the events you want to subscribe to.
          </p>
          <EventTypeTree eventTypes={eventTypes} />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Active Subscriptions
          </h2>
          {activeSubscriptions.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                No active subscriptions. Enable some event types to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSubscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  eventTypeName={findEventTypeName(sub.eventTypeId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EditSubscriptionModal />
    </div>
  );
};
