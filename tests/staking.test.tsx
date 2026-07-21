import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssetCard } from '@/components/staking/AssetCard';
import { PortfolioSummary } from '@/components/staking/PortfolioSummary';
import { OptimizationRecommendations } from '@/components/staking/OptimizationRecommendations';
import { ComparisonTools } from '@/components/staking/ComparisonTools';
import { StakingService } from '@/services/staking';
import { StakedAsset, StakingPortfolio, OptimizationRecommendation, ComparisonData } from '@/types/staking';

// ─── Mock Chart.js to avoid canvas errors in jsdom ───────────────────────────
jest.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="chart-mock" />,
  Bar: () => <canvas data-testid="chart-mock" />,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAsset: StakedAsset = {
  id: 'pos-1',
  code: 'XLM',
  issuer: 'native',
  amount: '5000',
  apy: 5.2,
  yieldRate: 5.2 / 365,
  lockupDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
  startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
  currentValue: 1250.00,
  rewardsEarned: '12.5432',
  status: 'active',
  performance: [
    { date: '2026-07-01', value: 1200, apy: 5.0, rewards: 0 },
    { date: '2026-07-15', value: 1225, apy: 5.1, rewards: 6 },
    { date: '2026-07-21', value: 1250, apy: 5.2, rewards: 12.5 },
  ],
};

const mockPortfolio: StakingPortfolio = {
  totalValue: 5000,
  baseCurrency: 'USD',
  averageApy: 8.5,
  totalRewards: 125.5,
  aggregateYield: 1.16,
  positions: [mockAsset],
  lastUpdated: Date.now(),
  change24h: 1.2,
  change7d: 3.5,
};

const mockRecommendations: OptimizationRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Diversify into AQUA',
    description: 'Moving 20% of XLM to AQUA increases APY by 3.5%',
    priority: 'high',
    strategyType: 'diversify',
    timestamp: Date.now(),
    impact: { apyIncrease: 3.5, riskChange: 1.2, additionalYield: 245 },
    actions: [
      { type: 'unstake', assetCode: 'XLM', amount: '500' },
      { type: 'stake', assetCode: 'AQUA', amount: '500', newLockupPeriod: 90 },
    ],
  },
];

const mockComparisonData: ComparisonData = {
  current: [
    { code: 'XLM', percentage: 100, value: 5000, apy: 5.2, riskScore: 2 },
  ],
  recommended: [
    { code: 'XLM', percentage: 60, value: 3000, apy: 5.2, riskScore: 2 },
    { code: 'AQUA', percentage: 40, value: 2000, apy: 18.7, riskScore: 5 },
  ],
  metrics: { apyDifference: 3.5, riskDifference: 0.8, diversificationScore: 75 },
};

// ─── AssetCard Tests ──────────────────────────────────────────────────────────

describe('AssetCard', () => {
  it('renders asset code and amount', () => {
    render(<AssetCard asset={mockAsset} />);
    expect(screen.getByText('XLM')).toBeInTheDocument();
    expect(screen.getByText('5000 staked')).toBeInTheDocument();
  });

  it('displays APY correctly', () => {
    render(<AssetCard asset={mockAsset} />);
    expect(screen.getByText('5.20%')).toBeInTheDocument();
  });

  it('shows current value', () => {
    render(<AssetCard asset={mockAsset} />);
    expect(screen.getByText('$1250.00')).toBeInTheDocument();
  });

  it('shows active status badge', () => {
    render(<AssetCard asset={mockAsset} />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('shows unlocking status badge for unlocking asset', () => {
    const unlockingAsset = { ...mockAsset, status: 'unlocking' as const };
    render(<AssetCard asset={unlockingAsset} />);
    expect(screen.getByText('unlocking')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<AssetCard asset={mockAsset} onClick={onClick} />);
    fireEvent.click(screen.getByText('XLM'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('displays rewards earned', () => {
    render(<AssetCard asset={mockAsset} />);
    expect(screen.getByText(/12.5432 XLM/)).toBeInTheDocument();
  });
});

// ─── PortfolioSummary Tests ───────────────────────────────────────────────────

describe('PortfolioSummary', () => {
  it('renders total portfolio value', () => {
    render(<PortfolioSummary portfolio={mockPortfolio} />);
    expect(screen.getByText(/\$5,000\.00/)).toBeInTheDocument();
  });

  it('renders average APY', () => {
    render(<PortfolioSummary portfolio={mockPortfolio} />);
    expect(screen.getByText('8.50%')).toBeInTheDocument();
  });

  it('shows skeleton loaders when loading', () => {
    const { container } = render(
      <PortfolioSummary portfolio={mockPortfolio} isLoading={true} />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows 24h change indicator', () => {
    render(<PortfolioSummary portfolio={mockPortfolio} />);
    expect(screen.getByText(/\+1\.20% \(24h\)/)).toBeInTheDocument();
  });

  it('shows allocation bar with asset labels', () => {
    render(<PortfolioSummary portfolio={mockPortfolio} />);
    expect(screen.getByText(/XLM/)).toBeInTheDocument();
    expect(screen.getByText(/25\.0%/)).toBeInTheDocument();
  });
});

// ─── OptimizationRecommendations Tests ───────────────────────────────────────

describe('OptimizationRecommendations', () => {
  it('renders recommendation title', () => {
    render(
      <OptimizationRecommendations
        recommendations={mockRecommendations}
        onApply={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    expect(screen.getByText('Diversify into AQUA')).toBeInTheDocument();
  });

  it('shows high priority badge', () => {
    render(
      <OptimizationRecommendations
        recommendations={mockRecommendations}
        onApply={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('calls onDismiss when X is clicked', () => {
    const onDismiss = jest.fn();
    render(
      <OptimizationRecommendations
        recommendations={mockRecommendations}
        onApply={jest.fn()}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByLabelText('Dismiss recommendation'));
    expect(onDismiss).toHaveBeenCalledWith('rec-1');
  });

  it('calls onApply when apply button is clicked', async () => {
    const onApply = jest.fn().mockResolvedValue(undefined);
    render(
      <OptimizationRecommendations
        recommendations={mockRecommendations}
        onApply={onApply}
        onDismiss={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('Apply Recommendation'));
    await waitFor(() => expect(onApply).toHaveBeenCalledWith('rec-1'));
  });

  it('shows empty state when no recommendations', () => {
    render(
      <OptimizationRecommendations
        recommendations={[]}
        onApply={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    expect(screen.getByText('Portfolio Optimized!')).toBeInTheDocument();
  });

  it('shows skeleton loaders when loading', () => {
    const { container } = render(
      <OptimizationRecommendations
        recommendations={[]}
        isLoading={true}
        onApply={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('expands action details on toggle', () => {
    render(
      <OptimizationRecommendations
        recommendations={mockRecommendations}
        onApply={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText(/2 actions required/));
    expect(screen.getAllByText(/AQUA/).length).toBeGreaterThan(0);
  });

  it('shows APY impact metric', () => {
    render(
      <OptimizationRecommendations
        recommendations={mockRecommendations}
        onApply={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    expect(screen.getByText('+3.5%')).toBeInTheDocument();
  });
});

// ─── ComparisonTools Tests ────────────────────────────────────────────────────

describe('ComparisonTools', () => {
  it('renders current allocation by default', () => {
    render(<ComparisonTools comparisonData={mockComparisonData} />);
    expect(screen.getByText('Current Allocation')).toBeInTheDocument();
  });

  it('switches to recommended allocation view', () => {
    render(<ComparisonTools comparisonData={mockComparisonData} />);
    fireEvent.click(screen.getByText('Recommended'));
    expect(screen.getByText('AQUA')).toBeInTheDocument();
  });

  it('shows APY difference metric', () => {
    render(<ComparisonTools comparisonData={mockComparisonData} />);
    expect(screen.getByText('+3.50%')).toBeInTheDocument();
  });

  it('shows diversification score', () => {
    render(<ComparisonTools comparisonData={mockComparisonData} />);
    expect(screen.getByText('75/100')).toBeInTheDocument();
  });
});

// ─── StakingService Tests ─────────────────────────────────────────────────────

describe('StakingService', () => {
  it('calculateProjectionLocally returns correct final value', () => {
    const result = StakingService.calculateProjectionLocally({
      assetCode: 'XLM',
      amount: 1000,
      lockupDays: 365,
      compoundingFrequency: 'daily',
      apy: 10,
    });

    expect(result.initialAmount).toBe(1000);
    expect(result.projectionDays).toBe(365);
    expect(result.finalValue).toBeGreaterThan(1000);
    // Daily compounding 10% APY ≈ 10.52% effective, so ~$1105
    expect(result.finalValue).toBeCloseTo(1105.16, 0);
    expect(result.totalRewards).toBeCloseTo(105.16, 0);
  });

  it('calculateProjectionLocally handles 0 days', () => {
    const result = StakingService.calculateProjectionLocally({
      assetCode: 'XLM',
      amount: 1000,
      lockupDays: 0,
      compoundingFrequency: 'monthly',
      apy: 5,
    });
    expect(result.finalValue).toBeCloseTo(1000, 1);
  });

  it('getAvailableAssets returns mock data when API unavailable', async () => {
    const assets = await StakingService.getAvailableAssets();
    expect(assets.length).toBeGreaterThan(0);
    expect(assets[0]).toHaveProperty('code');
    expect(assets[0]).toHaveProperty('apyTiers');
  });

  it('getStakingStats returns valid mock stats', async () => {
    const stats = await StakingService.getStakingStats();
    expect(stats).toHaveProperty('totalValueLocked');
    expect(stats).toHaveProperty('averageApy');
    expect(stats.averageApy).toBeGreaterThan(0);
  });

  it('getStakingPortfolio returns portfolio with positions', async () => {
    const portfolio = await StakingService.getStakingPortfolio('GTEST');
    expect(portfolio).toHaveProperty('positions');
    expect(Array.isArray(portfolio.positions)).toBe(true);
    expect(portfolio.totalValue).toBeGreaterThan(0);
  });

  it('getRecommendations returns array of recommendations', async () => {
    const recs = await StakingService.getRecommendations('GTEST');
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0]).toHaveProperty('id');
    expect(recs[0]).toHaveProperty('priority');
  });
});
