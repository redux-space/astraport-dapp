/**
 * Utility functions for formatting and validation
 */

export const formatCurrency = (value: string | number, decimals: number = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercent = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

export const truncateAddress = (address: string, length: number = 8): string => {
  if (address.length <= length * 2) return address;
  return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
};

export const percentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const isValidStellarAddress = (address: string): boolean => {
  return /^G[A-Z2-7]{55}$/.test(address);
};

export const calculateRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score < 33) return 'low';
  if (score < 66) return 'medium';
  return 'high';
};

/**
 * Compact "time ago" label for an epoch-millis timestamp, e.g. "just now",
 * "5m ago", "3h ago", "2d ago". Falls back to an absolute date past a week.
 */
export const formatRelativeTime = (
  timestamp: number,
  now: number = Date.now(),
): string => {
  const diff = Math.max(0, now - timestamp);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

/** Full, readable date and time for an epoch-millis timestamp. */
export const formatDateTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
