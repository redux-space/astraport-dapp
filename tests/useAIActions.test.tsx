import '@testing-library/jest-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAIActions } from '@/hooks/useAIActions';
import { useAIStore } from '@/store';
import { AIAnalysisService } from '@/services/aiAnalysis';
import { makeRecommendation } from './aiFixtures';

describe('useAIActions', () => {
  const recommendation = makeRecommendation();
  const action = recommendation.actions[0];

  beforeEach(() => {
    useAIStore.setState({
      recommendations: [recommendation],
      executing: {},
      actionResults: {},
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('executes an action and records a success result', async () => {
    jest
      .spyOn(AIAnalysisService, 'executeAction')
      .mockResolvedValue({ success: true, message: 'Done' });

    const { result } = renderHook(() => useAIActions());

    await act(async () => {
      await result.current.execute(recommendation, action);
    });

    expect(AIAnalysisService.executeAction).toHaveBeenCalledWith(
      recommendation.id,
      action.id,
    );
    expect(useAIStore.getState().actionResults[recommendation.id]).toEqual({
      success: true,
      message: 'Done',
    });
    // Executing a successful action marks the recommendation read.
    expect(
      useAIStore.getState().recommendations[0].read,
    ).toBe(true);
  });

  it('records an error result when execution fails', async () => {
    jest
      .spyOn(AIAnalysisService, 'executeAction')
      .mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useAIActions());

    await act(async () => {
      await result.current.execute(recommendation, action);
    });

    expect(useAIStore.getState().actionResults[recommendation.id]).toEqual({
      success: false,
      message: 'network down',
    });
  });

  it('prevents duplicate submissions while an action is in flight', async () => {
    const spy = jest
      .spyOn(AIAnalysisService, 'executeAction')
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, message: 'ok' }), 20),
          ),
      );

    const { result } = renderHook(() => useAIActions());

    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.execute(recommendation, action);
      // Second call while the first is still pending should be ignored.
      void result.current.execute(recommendation, action);
    });

    await act(async () => {
      await first;
    });

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
  });
});
