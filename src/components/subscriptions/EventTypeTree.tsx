'use client';

import React, { useState } from 'react';
import { EventType } from '@/types/subscriptions';
import { useSubscriptionStore } from '@/store/subscriptionStore';

interface EventTypeTreeProps {
  eventTypes: EventType[];
  level?: number;
}

export const EventTypeTree: React.FC<EventTypeTreeProps> = ({
  eventTypes,
  level = 0,
}) => {
  return (
    <div className={`${level > 0 ? 'ml-4' : ''}`}>
      {eventTypes.map((eventType) => (
        <EventTypeNode key={eventType.id} eventType={eventType} level={level} />
      ))}
    </div>
  );
};

interface EventTypeNodeProps {
  eventType: EventType;
  level: number;
}

const EventTypeNode: React.FC<EventTypeNodeProps> = ({ eventType, level }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { getSubscription, toggleSubscription } = useSubscriptionStore();
  const subscription = getSubscription(eventType.id);
  const hasChildren = eventType.children && eventType.children.length > 0;

  const handleToggle = () => {
    toggleSubscription(eventType.id);
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-lg">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="w-5 mr-2" />}

        <input
          type="checkbox"
          checked={subscription?.enabled ?? false}
          onChange={handleToggle}
          className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />

        <div className="flex-1">
          <span className="text-sm font-medium text-gray-900">
            {eventType.name}
          </span>
          {eventType.description && (
            <span className="ml-2 text-xs text-gray-500">
              {eventType.description}
            </span>
          )}
        </div>

        {subscription && (
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
        )}
      </div>

      {hasChildren && isExpanded && (
        <EventTypeTree eventTypes={eventType.children!} level={level + 1} />
      )}
    </div>
  );
};
