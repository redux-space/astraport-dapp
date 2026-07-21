import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecommendationCard } from '@/components/ai/RecommendationCard';
import { makeRecommendation } from './aiFixtures';

describe('RecommendationCard', () => {
  const setup = (props: Partial<React.ComponentProps<typeof RecommendationCard>> = {}) => {
    const recommendation = props.recommendation ?? makeRecommendation();
    const onOpen = jest.fn();
    const onExecute = jest.fn();
    render(
      <RecommendationCard
        recommendation={recommendation}
        onOpen={onOpen}
        onExecute={onExecute}
        executingActionId={props.executingActionId ?? null}
        result={props.result}
      />,
    );
    return { recommendation, onOpen, onExecute };
  };

  it('renders the summary, suggested action, and confidence', () => {
    setup();
    expect(screen.getByText(/reduce usdc concentration/i)).toBeInTheDocument();
    expect(screen.getByText(/usdc is 53.6%/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply plan/i })).toBeInTheDocument();
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '87');
  });

  it('marks unread recommendations as new', () => {
    setup();
    expect(screen.getByLabelText(/new, unread recommendation/i)).toBeInTheDocument();
  });

  it('opens the full analysis when the title is clicked', () => {
    const { onOpen, recommendation } = setup();
    fireEvent.click(screen.getByText(/reduce usdc concentration/i));
    expect(onOpen).toHaveBeenCalledWith(recommendation);
  });

  it('executes an actionable suggestion', () => {
    const { onExecute, recommendation } = setup();
    fireEvent.click(screen.getByRole('button', { name: /apply plan/i }));
    expect(onExecute).toHaveBeenCalledWith(recommendation, recommendation.actions[0]);
  });

  it('renders navigational actions as links', () => {
    setup();
    expect(screen.getByRole('link', { name: /open rebalancer/i })).toHaveAttribute(
      'href',
      '/rebalance',
    );
  });

  it('disables actions and shows loading while executing (dedup)', () => {
    setup({ executingActionId: 'apply' });
    const button = screen.getByRole('button', { name: /working/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('shows a success result banner', () => {
    setup({ result: { success: true, message: 'Rebalance queued' } });
    expect(screen.getByRole('status')).toHaveTextContent(/rebalance queued/i);
  });
});
