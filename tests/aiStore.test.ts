import { useAIStore } from '@/store';
import { makeRecommendation } from './aiFixtures';

describe('useAIStore real-time updates', () => {
  beforeEach(() => {
    useAIStore.setState({ recommendations: [] });
  });

  it('prepends a streamed recommendation and keeps newest-first order', () => {
    const first = makeRecommendation({ id: 'a', createdAt: 1_000 });
    const streamed = makeRecommendation({ id: 'b', createdAt: 5_000 });

    useAIStore.getState().setRecommendations([first]);
    useAIStore.getState().addRecommendation(streamed);

    const ids = useAIStore.getState().recommendations.map((r) => r.id);
    expect(ids).toEqual(['b', 'a']);
  });

  it('ignores duplicate recommendations by id', () => {
    const rec = makeRecommendation({ id: 'dup' });
    useAIStore.getState().addRecommendation(rec);
    useAIStore.getState().addRecommendation(rec);
    expect(useAIStore.getState().recommendations).toHaveLength(1);
  });

  it('marks all recommendations read', () => {
    useAIStore
      .getState()
      .setRecommendations([
        makeRecommendation({ id: '1', read: false }),
        makeRecommendation({ id: '2', read: false }),
      ]);
    useAIStore.getState().markAllRead();
    expect(useAIStore.getState().recommendations.every((r) => r.read)).toBe(true);
  });
});
