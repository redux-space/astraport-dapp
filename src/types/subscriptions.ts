export type SubscriptionStatus = 'active' | 'paused' | 'error';

export type DeliveryFrequency = 'immediate' | 'daily' | 'weekly';

export interface EventType {
  id: string;
  name: string;
  description?: string;
  children?: EventType[];
}

export interface SubscriptionFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

export interface DeliveryPreferences {
  frequency: DeliveryFrequency;
  channels: ('email' | 'push' | 'in_app')[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface EventSubscription {
  id: string;
  eventTypeId: string;
  enabled: boolean;
  status: SubscriptionStatus;
  filters: SubscriptionFilter[];
  deliveryPreferences: DeliveryPreferences;
  createdAt: number;
  updatedAt: number;
}
