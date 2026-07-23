'use client';

import React from 'react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { FilterBuilder } from './FilterBuilder';
import { DeliveryPreferences } from './DeliveryPreferences';

export const EditSubscriptionModal: React.FC = () => {
  const {
    isEditModalOpen,
    closeEditModal,
    selectedSubscriptionId,
    getSubscription,
    updateFilters,
    updateDeliveryPreferences,
    eventTypes,
  } = useSubscriptionStore();

  if (!isEditModalOpen || !selectedSubscriptionId) return null;

  const subscription = getSubscription(selectedSubscriptionId);
  if (!subscription) return null;

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={closeEditModal}
        />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Subscription: {findEventTypeName(selectedSubscriptionId)}
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <FilterBuilder
                filters={subscription.filters}
                onChange={(filters) =>
                  updateFilters(selectedSubscriptionId, filters)
                }
              />

              <DeliveryPreferences
                preferences={subscription.deliveryPreferences}
                onChange={(prefs) =>
                  updateDeliveryPreferences(selectedSubscriptionId, prefs)
                }
              />
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={closeEditModal}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={closeEditModal}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
