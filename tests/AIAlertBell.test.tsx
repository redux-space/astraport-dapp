import '@testing-library/jest-dom';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { AIAlertBell } from '@/components/ai/AIAlertBell';
import { useAIStore } from '@/store';
import { makeRecommendation } from './aiFixtures';

const seed = (unreadCount: number) => {
  const recs = [
    makeRecommendation({ id: 'r1', title: 'First', read: unreadCount < 1 }),
    makeRecommendation({ id: 'r2', title: 'Second', read: unreadCount < 2 }),
  ];
  act(() => useAIStore.setState({ recommendations: recs }));
  return recs;
};

describe('AIAlertBell', () => {
  afterEach(() => {
    act(() => useAIStore.setState({ recommendations: [] }));
  });

  it('shows the unread badge count', () => {
    seed(2);
    render(<AIAlertBell onOpenRecommendation={jest.fn()} />);
    expect(
      screen.getByRole('button', { name: /ai alerts, 2 unread/i }),
    ).toBeInTheDocument();
  });

  it('opens a dropdown of the latest analyses', () => {
    seed(2);
    render(<AIAlertBell onOpenRecommendation={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /ai alerts/i }));
    const menu = screen.getByRole('menu', { name: /latest ai analyses/i });
    expect(within(menu).getByText('First')).toBeInTheDocument();
    expect(within(menu).getByText('Second')).toBeInTheDocument();
  });

  it('marks a recommendation read and opens it on select', () => {
    seed(2);
    const onOpen = jest.fn();
    render(<AIAlertBell onOpenRecommendation={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /ai alerts/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /first/i }));

    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'r1' }),
    );
    expect(
      useAIStore.getState().recommendations.find((r) => r.id === 'r1')?.read,
    ).toBe(true);
  });

  it('clears all notifications with mark all read', () => {
    seed(2);
    render(<AIAlertBell onOpenRecommendation={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /ai alerts/i }));
    fireEvent.click(screen.getByRole('button', { name: /mark all read/i }));

    expect(
      useAIStore.getState().recommendations.every((r) => r.read),
    ).toBe(true);
  });
});
