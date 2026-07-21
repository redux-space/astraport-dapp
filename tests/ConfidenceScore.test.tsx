import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfidenceScore } from '@/components/ai/ConfidenceScore';

describe('ConfidenceScore', () => {
  it('renders a meter with the confidence percentage', () => {
    render(<ConfidenceScore value={87} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '87');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('exposes a screen-reader-friendly level + percentage', () => {
    render(<ConfidenceScore value={87} />);
    expect(screen.getByRole('meter')).toHaveAttribute(
      'aria-valuetext',
      'High confidence, 87 percent',
    );
  });

  it('labels medium and low confidence correctly', () => {
    const { rerender } = render(<ConfidenceScore value={60} />);
    expect(screen.getByRole('meter')).toHaveAttribute(
      'aria-valuetext',
      'Medium confidence, 60 percent',
    );
    rerender(<ConfidenceScore value={20} />);
    expect(screen.getByRole('meter')).toHaveAttribute(
      'aria-valuetext',
      'Low confidence, 20 percent',
    );
  });

  it('clamps out-of-range values', () => {
    render(<ConfidenceScore value={150} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
  });

  it('supports the circular variant', () => {
    render(<ConfidenceScore value={87} variant="circle" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '87');
  });
});
