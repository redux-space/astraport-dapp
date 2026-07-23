import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  EventSubscription,
  EventType,
  SubscriptionFilter,
  DeliveryPreferences,
  SubscriptionStatus,
} from '@/types/subscriptions';

const DEFAULT_EVENT_TYPES: EventType[] = [
  {
    id: 'portfolio',
    name: 'Portfolio Events',
    children: [
      { id: 'balance_changed', name: 'Balance Changed' },
      { id: 'asset_added', name: 'Asset Added' },
      { id: 'asset_removed', name: 'Asset Removed' },
    ],
  },
  {
    id: 'transactions',
    name: 'Transaction Events',
    children: [
      { id: 'payment_received', name: 'Payment Received' },
      { id: 'payment_sent', name: 'Payment Sent' },
      { id: 'trade_executed', name: 'Trade Executed' },
    ],
  },
  {
    id: 'security',
    name: 'Security Events',
    children: [
      { id: 'login_detected', name: 'Login Detected' },
      { id: 'password_changed', name: 'Password Changed' },
      { id: 'mfa_enabled', name: 'MFA Enabled' },
    ],
  },
  {
    id: 'staking',
    name: 'Staking Events',
    children: [
      { id: 'stake_completed', name: 'Stake Completed' },
      { id: 'unstake_completed', name: 'Unstake Completed' },
      { id: 'reward_received', name: 'Reward Received' },
    ],
  },
];

interface SubscriptionState {
  subscriptions: Record<string, EventSubscription>;
  eventTypes: EventType[];
  selectedSubscriptionId: string | null;
  isEditModalOpen: boolean;

  getSubscription: (eventTypeId: string) => EventSubscription | undefined;
  toggleSubscription: (eventTypeId: string) => void;
  updateFilters: (eventTypeId: string, filters: SubscriptionFilter[]) => void;
  updateDeliveryPreferences: (
    eventTypeId: string,
    prefs: DeliveryPreferences,
  ) => void;
  setSubscriptionStatus: (eventTypeId: string, status: SubscriptionStatus) => void;
  selectSubscription: (id: string | null) => void;
  openEditModal: () => void;
  closeEditModal: () => void;
  testNotification: (eventTypeId: string) => void;
}

const createDefaultSubscription = (eventTypeId: string): EventSubscription => ({
  id: `sub_${eventTypeId}_${Date.now()}`,
  eventTypeId,
  enabled: true,
  status: 'active',
  filters: [],
  deliveryPreferences: {
    frequency: 'immediate',
    channels: ['in_app'],
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: {},
      eventTypes: DEFAULT_EVENT_TYPES,
      selectedSubscriptionId: null,
      isEditModalOpen: false,

      getSubscription: (eventTypeId) => get().subscriptions[eventTypeId],

      toggleSubscription: (eventTypeId) =>
        set((state) => {
          const existing = state.subscriptions[eventTypeId];
          if (existing) {
            return {
              subscriptions: {
                ...state.subscriptions,
                [eventTypeId]: {
                  ...existing,
                  enabled: !existing.enabled,
                  status: !existing.enabled ? 'active' : 'paused',
                  updatedAt: Date.now(),
                },
              },
            };
          }
          return {
            subscriptions: {
              ...state.subscriptions,
              [eventTypeId]: createDefaultSubscription(eventTypeId),
            },
          };
        }),

      updateFilters: (eventTypeId, filters) =>
        set((state) => {
          const existing = state.subscriptions[eventTypeId];
          if (!existing) return state;
          return {
            subscriptions: {
              ...state.subscriptions,
              [eventTypeId]: {
                ...existing,
                filters,
                updatedAt: Date.now(),
              },
            },
          };
        }),

      updateDeliveryPreferences: (eventTypeId, prefs) =>
        set((state) => {
          const existing = state.subscriptions[eventTypeId];
          if (!existing) return state;
          return {
            subscriptions: {
              ...state.subscriptions,
              [eventTypeId]: {
                ...existing,
                deliveryPreferences: prefs,
                updatedAt: Date.now(),
              },
            },
          };
        }),

      setSubscriptionStatus: (eventTypeId, status) =>
        set((state) => {
          const existing = state.subscriptions[eventTypeId];
          if (!existing) return state;
          return {
            subscriptions: {
              ...state.subscriptions,
              [eventTypeId]: {
                ...existing,
                status,
                updatedAt: Date.now(),
              },
            },
          };
        }),

      selectSubscription: (id) => set({ selectedSubscriptionId: id }),

      openEditModal: () => set({ isEditModalOpen: true }),

      closeEditModal: () => set({ isEditModalOpen: false, selectedSubscriptionId: null }),

      testNotification: (eventTypeId) => {
        const state = get();
        const subscription = state.subscriptions[eventTypeId];
        if (!subscription) return;

        console.log(`[Test Notification] Sending test for ${eventTypeId}`, {
          channels: subscription.deliveryPreferences.channels,
          frequency: subscription.deliveryPreferences.frequency,
        });

        alert(`Test notification sent for ${eventTypeId}!`);
      },
    }),
    {
      name: 'astraport-subscriptions',
    },
  ),
);
