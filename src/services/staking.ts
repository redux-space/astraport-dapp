import axios from 'axios';
import {
  StakingPortfolio,
  StakingAssetInfo,
  OptimizationRecommendation,
  YieldProjection,
  ComparisonData,
  StakingStats,
  MultiAssetStakingTransaction,
  StakedAsset,
  ProjectionDataPoint,
} from '@/types/staking';

const API_BASE =
  process.env.NEXT_PUBLIC_ASTRAPORT_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// ─── Mock data generators (used as fallback when API is unavailable) ──────────

function generateMockPositions(): StakedAsset[] {
  const assets = [
    { code: 'XLM', issuer: 'native', apy: 5.2 },
    { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', apy: 8.1 },
    { code: 'yXLM', issuer: 'PANSQR6EM3K6KPBW7EPEZ3SJZZW3ZXKE5CPQHPOB3A7WUFLRR3A4JWM', apy: 12.4 },
    { code: 'AQUA', issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA', apy: 18.7 },
  ];

  return assets.map((asset, i) => ({
    id: `position-${i + 1}`,
    code: asset.code,
    issuer: asset.issuer,
    amount: String((Math.random() * 10000 + 1000).toFixed(2)),
    apy: asset.apy,
    yieldRate: asset.apy / 365,
    lockupDate: Date.now() + (30 + i * 15) * 24 * 60 * 60 * 1000,
    startDate: Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000,
    currentValue: Math.random() * 5000 + 500,
    rewardsEarned: String((Math.random() * 200).toFixed(4)),
    status: i === 1 ? 'unlocking' : 'active',
    performance: Array.from({ length: 30 }, (_, day) => ({
      date: new Date(Date.now() - (29 - day) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      value: 1000 + day * (asset.apy / 365) * 10 + Math.random() * 50,
      apy: asset.apy + (Math.random() - 0.5) * 0.5,
      rewards: day * (asset.apy / 365) * 10,
    })),
  })) as StakedAsset[];
}

function generateMockPortfolio(): StakingPortfolio {
  const positions = generateMockPositions();
  const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
  const weightedApy =
    positions.reduce((sum, p) => sum + p.apy * p.currentValue, 0) /
    totalValue;

  return {
    totalValue,
    baseCurrency: 'USD',
    averageApy: weightedApy,
    totalRewards: positions.reduce(
      (sum, p) => sum + parseFloat(p.rewardsEarned),
      0
    ),
    aggregateYield: (totalValue * weightedApy) / 100 / 365,
    positions,
    lastUpdated: Date.now(),
    change24h: (Math.random() - 0.3) * 2,
    change7d: (Math.random() - 0.2) * 5,
  };
}

function generateMockAvailableAssets(): StakingAssetInfo[] {
  return [
    {
      code: 'XLM',
      issuer: 'native',
      name: 'Stellar Lumens',
      minStake: '100',
      maxStake: '1000000',
      availableBalance: '5000',
      totalStaked: '125000000',
      apyTiers: [
        { lockupDays: 30, apy: 4.5 },
        { lockupDays: 90, apy: 5.2 },
        { lockupDays: 180, apy: 6.0 },
        { lockupDays: 365, apy: 7.5 },
      ],
    },
    {
      code: 'USDC',
      issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      name: 'USD Coin',
      minStake: '10',
      maxStake: '500000',
      availableBalance: '2000',
      totalStaked: '45000000',
      apyTiers: [
        { lockupDays: 30, apy: 6.0 },
        { lockupDays: 90, apy: 8.1 },
        { lockupDays: 180, apy: 9.5 },
        { lockupDays: 365, apy: 11.0 },
      ],
    },
    {
      code: 'yXLM',
      issuer: 'PANSQR6EM3K6KPBW7EPEZ3SJZZW3ZXKE5CPQHPOB3A7WUFLRR3A4JWM',
      name: 'Yield XLM',
      minStake: '500',
      maxStake: '2000000',
      availableBalance: '10000',
      totalStaked: '8000000',
      apyTiers: [
        { lockupDays: 30, apy: 9.0 },
        { lockupDays: 90, apy: 12.4 },
        { lockupDays: 180, apy: 15.0 },
        { lockupDays: 365, apy: 18.0 },
      ],
    },
    {
      code: 'AQUA',
      issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
      name: 'Aquarius',
      minStake: '1000',
      maxStake: '5000000',
      availableBalance: '50000',
      totalStaked: '3200000',
      apyTiers: [
        { lockupDays: 30, apy: 12.0 },
        { lockupDays: 90, apy: 18.7 },
        { lockupDays: 180, apy: 22.0 },
        { lockupDays: 365, apy: 28.0 },
      ],
    },
  ];
}

function generateMockRecommendations(): OptimizationRecommendation[] {
  return [
    {
      id: 'rec-1',
      title: 'Diversify into AQUA for higher yields',
      description:
        'Allocating 20% of your XLM position to AQUA could increase your average APY by 3.5%.',
      priority: 'high',
      impact: { apyIncrease: 3.5, riskChange: 1.2, additionalYield: 245 },
      strategyType: 'diversify',
      timestamp: Date.now(),
      actions: [
        { type: 'unstake', assetCode: 'XLM', amount: '500' },
        { type: 'stake', assetCode: 'AQUA', amount: '500', newLockupPeriod: 90 },
      ],
    },
    {
      id: 'rec-2',
      title: 'Extend USDC lockup period',
      description:
        'Extending your USDC lockup from 30 to 90 days increases APY from 6.0% to 8.1%.',
      priority: 'medium',
      impact: { apyIncrease: 2.1, riskChange: 0.5, additionalYield: 105 },
      strategyType: 'extend_lockup',
      timestamp: Date.now(),
      actions: [
        { type: 'restake', assetCode: 'USDC', amount: '2000', newLockupPeriod: 90 },
      ],
    },
    {
      id: 'rec-3',
      title: 'Compound yXLM rewards',
      description:
        'Auto-compounding your yXLM rewards could boost effective APY to 14.1%.',
      priority: 'low',
      impact: { apyIncrease: 1.7, riskChange: 0, additionalYield: 68 },
      strategyType: 'compound',
      timestamp: Date.now(),
      actions: [
        { type: 'compound', assetCode: 'yXLM', amount: '0' },
      ],
    },
  ];
}

// ─── StakingService ───────────────────────────────────────────────────────────

export class StakingService {
  /**
   * Fetch the user's staking portfolio
   */
  static async getStakingPortfolio(publicKey: string): Promise<StakingPortfolio> {
    try {
      const { data } = await apiClient.get(`/staking/portfolio/${publicKey}`);
      return data;
    } catch {
      // Return mock data when API is not available
      return generateMockPortfolio();
    }
  }

  /**
   * Fetch available assets for staking
   */
  static async getAvailableAssets(publicKey?: string): Promise<StakingAssetInfo[]> {
    try {
      const url = publicKey
        ? `/staking/assets?publicKey=${publicKey}`
        : '/staking/assets';
      const { data } = await apiClient.get(url);
      return data;
    } catch {
      return generateMockAvailableAssets();
    }
  }

  /**
   * Fetch optimization recommendations for the user
   */
  static async getRecommendations(
    publicKey: string
  ): Promise<OptimizationRecommendation[]> {
    try {
      const { data } = await apiClient.get(
        `/staking/recommendations/${publicKey}`
      );
      return data;
    } catch {
      return generateMockRecommendations();
    }
  }

  /**
   * Submit a multi-asset staking transaction
   */
  static async submitStakingTransaction(
    publicKey: string,
    transaction: MultiAssetStakingTransaction
  ): Promise<{ txHash: string; status: string }> {
    const { data } = await apiClient.post(`/staking/stake/${publicKey}`, transaction);
    return data;
  }

  /**
   * Unstake an asset position
   */
  static async unstake(
    publicKey: string,
    positionId: string
  ): Promise<{ txHash: string; status: string }> {
    const { data } = await apiClient.post(`/staking/unstake/${publicKey}`, {
      positionId,
    });
    return data;
  }

  /**
   * Apply an optimization recommendation
   */
  static async applyRecommendation(
    publicKey: string,
    recommendationId: string
  ): Promise<{ txHash: string; status: string }> {
    const { data } = await apiClient.post(
      `/staking/recommendations/${recommendationId}/apply`,
      { publicKey }
    );
    return data;
  }

  /**
   * Calculate yield projection for given parameters
   */
  static async calculateYieldProjection(params: {
    assetCode: string;
    amount: number;
    lockupDays: number;
    compoundingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    apy: number;
  }): Promise<YieldProjection> {
    try {
      const { data } = await apiClient.post('/staking/yield-projection', params);
      return data;
    } catch {
      return StakingService.calculateProjectionLocally(params);
    }
  }

  /**
   * Local yield projection calculation (no API needed)
   */
  static calculateProjectionLocally(params: {
    assetCode: string;
    amount: number;
    lockupDays: number;
    compoundingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    apy: number;
  }): YieldProjection {
    const { amount, lockupDays, compoundingFrequency, apy, assetCode } = params;
    const compoundingMap = { daily: 365, weekly: 52, monthly: 12, quarterly: 4 };
    const n = compoundingMap[compoundingFrequency];
    const rate = apy / 100;

    const projectionData: ProjectionDataPoint[] = Array.from(
      { length: lockupDays + 1 },
      (_, day) => {
        const fraction = day / 365;
        const value = amount * Math.pow(1 + rate / n, n * fraction);
        return {
          day,
          value,
          rewards: value - amount,
          apy: apy,
        };
      }
    );

    const finalValue = projectionData[projectionData.length - 1].value;

    return {
      scenario: `${assetCode} — ${lockupDays}d lockup (${compoundingFrequency} compounding)`,
      initialAmount: amount,
      projectionDays: lockupDays,
      apy,
      compoundingFrequency,
      projectionData,
      finalValue,
      totalRewards: finalValue - amount,
    };
  }

  /**
   * Fetch comparison data between current and recommended allocations
   */
  static async getComparisonData(publicKey: string): Promise<ComparisonData> {
    try {
      const { data } = await apiClient.get(
        `/staking/comparison/${publicKey}`
      );
      return data;
    } catch {
      const portfolio = generateMockPortfolio();
      const totalValue = portfolio.totalValue;

      const current = portfolio.positions.map((p) => ({
        code: p.code,
        percentage: (p.currentValue / totalValue) * 100,
        value: p.currentValue,
        apy: p.apy,
        riskScore: Math.round(p.apy / 4),
      }));

      const recommended = [
        { code: 'XLM', percentage: 30, value: totalValue * 0.3, apy: 5.2, riskScore: 2 },
        { code: 'USDC', percentage: 25, value: totalValue * 0.25, apy: 8.1, riskScore: 1 },
        { code: 'yXLM', percentage: 25, value: totalValue * 0.25, apy: 12.4, riskScore: 3 },
        { code: 'AQUA', percentage: 20, value: totalValue * 0.2, apy: 18.7, riskScore: 5 },
      ];

      const currentAvgApy =
        current.reduce((s, a) => s + a.apy * a.percentage, 0) / 100;
      const recommendedAvgApy =
        recommended.reduce((s, a) => s + a.apy * a.percentage, 0) / 100;

      return {
        current,
        recommended,
        metrics: {
          apyDifference: recommendedAvgApy - currentAvgApy,
          riskDifference: 0.4,
          diversificationScore: 82,
        },
      };
    }
  }

  /**
   * Fetch platform-wide staking statistics
   */
  static async getStakingStats(): Promise<StakingStats> {
    try {
      const { data } = await apiClient.get('/staking/stats');
      return data;
    } catch {
      return {
        totalValueLocked: 182_500_000,
        activeStakers: 14_320,
        averageApy: 9.3,
        topPerformer: { code: 'AQUA', apy: 18.7 },
        totalRewardsDistributed: 3_450_000,
      };
    }
  }
}

export default StakingService;
