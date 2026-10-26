import { mockDashboardData } from './mockData';

/**
 * Example of using the mock data in components
 * This demonstrates how the dashboard would look with sample portfolio data
 */

export function renderMockDashboard() {
  const { portfolio, riskScore, insights } = mockDashboardData;



  insights.forEach((insight) => {
  });
}

// Example: Using mock data in a test
export function createTestPortfolioState() {
  return {
    ...mockDashboardData,
    portfolio: {
      ...mockDashboardData.portfolio,
      totalBalance: '20000.00', // Override for testing
    },
  };
}
