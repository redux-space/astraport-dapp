import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalysisTimeline } from '@/components/ai/AnalysisTimeline';
import { makeRecommendation } from './aiFixtures';

describe('AnalysisTimeline', () => {
  it('renders an empty state with no analyses', () => {
    render(<AnalysisTimeline analyses={[]} onSelect={jest.fn()} />);
    expect(screen.getByText(/no historical analyses yet/i)).toBeInTheDocument();
  });

  it('lists analyses newest first', () => {
    const older = makeRecommendation({
      id: 'old',
      title: 'Older analysis',
      createdAt: 1_000,
    });
    const newer = makeRecommendation({
      id: 'new',
      title: 'Newer analysis',
      createdAt: 2_000,
    });
    render(<AnalysisTimeline analyses={[older, newer]} onSelect={jest.fn()} />);

    const items = screen.getAllByRole('button');
    expect(items[0]).toHaveTextContent(/newer analysis/i);
    expect(items[1]).toHaveTextContent(/older analysis/i);
  });

  it('opens a historical analysis on click', () => {
    const rec = makeRecommendation({ id: 'x', title: 'Pick me' });
    const onSelect = jest.fn();
    render(<AnalysisTimeline analyses={[rec]} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /open analysis: pick me/i }));
    expect(onSelect).toHaveBeenCalledWith(rec);
  });
});
