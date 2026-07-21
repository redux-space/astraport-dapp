import { formatRelativeTime } from '@/utils/formatters';
import { getConfidenceLevel } from '@/utils/ai';

describe('formatRelativeTime', () => {
  const now = 1_700_000_000_000;

  it('reports recent times as "just now"', () => {
    expect(formatRelativeTime(now - 10_000, now)).toBe('just now');
  });

  it('reports minutes, hours, and days', () => {
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe('5m ago');
    expect(formatRelativeTime(now - 3 * 3_600_000, now)).toBe('3h ago');
    expect(formatRelativeTime(now - 2 * 86_400_000, now)).toBe('2d ago');
  });
});

describe('getConfidenceLevel', () => {
  it('buckets scores into levels', () => {
    expect(getConfidenceLevel(90)).toBe('high');
    expect(getConfidenceLevel(60)).toBe('medium');
    expect(getConfidenceLevel(20)).toBe('low');
  });
});
