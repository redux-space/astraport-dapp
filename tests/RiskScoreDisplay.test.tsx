import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import RiskScoreDisplay from '@/components/risk/RiskScoreDisplay';
import { useDashboardStore } from '@/store';

describe('RiskScoreDisplay Component', () => {
  afterEach(() => {
    useDashboardStore.setState({ riskScore: null });
  });

  it('shows an empty state when no risk data is available', () => {
    render(<RiskScoreDisplay />);
    expect(screen.getByText(/no risk data available/i)).toBeInTheDocument();
  });

  it('renders risk score display when data is present', () => {
    useDashboardStore.setState({
      riskScore: {
        overall: 42.5,
        volatility: 35.2,
        concentration: 48.7,
        counterpartyRisk: 39.1,
      },
    });
    render(<RiskScoreDisplay />);
    expect(screen.getByText(/risk assessment/i)).toBeInTheDocument();
  });
});
