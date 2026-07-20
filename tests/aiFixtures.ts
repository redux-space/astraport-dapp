import type { AIRecommendation } from '@/types';

/** Build a recommendation fixture with sensible defaults and overrides. */
export const makeRecommendation = (
  overrides: Partial<AIRecommendation> = {},
): AIRecommendation => ({
  id: 'rec-1',
  title: 'Reduce USDC concentration',
  summary: 'USDC is 53.6% of your portfolio.',
  analysis: 'Full analysis text.',
  reasoning: 'Detailed reasoning text.',
  confidenceExplanation: 'Why the confidence is high.',
  confidence: 87,
  category: 'rebalance',
  severity: 'warning',
  type: 'Concentration analysis',
  actions: [
    { id: 'apply', label: 'Apply plan', type: 'rebalance', executable: true },
    {
      id: 'open',
      label: 'Open rebalancer',
      type: 'navigate',
      href: '/rebalance',
      executable: false,
    },
  ],
  evidence: [{ label: 'USDC allocation', value: '53.6%' }],
  createdAt: 1_700_000_000_000,
  read: false,
  ...overrides,
});
