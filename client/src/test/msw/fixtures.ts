import type { Fund, PortfolioItem } from '@/types'

export const mockFunds: Fund[] = [
  {
    id: '1',
    name: 'Global Equity Fund',
    symbol: 'GEF',
    value: { amount: 120.45, currency: 'EUR' },
    category: 'GLOBAL',
    profitability: { YTD: 0.05, oneYear: 0.12, threeYears: 0.35, fiveYears: 0.5 },
  },
  {
    id: '2',
    name: 'Tech Growth Fund',
    symbol: 'TGF',
    value: { amount: 210.32, currency: 'EUR' },
    category: 'TECH',
    profitability: { YTD: 0.08, oneYear: 0.18, threeYears: 0.42, fiveYears: 0.65 },
  },
  {
    id: '3',
    name: 'Health Innovation Fund',
    symbol: 'HIF',
    value: { amount: 98.75, currency: 'EUR' },
    category: 'HEALTH',
    profitability: { YTD: -0.02, oneYear: 0.08, threeYears: 0.22, fiveYears: 0.38 },
  },
  {
    id: '4',
    name: 'Money Market Plus',
    symbol: 'MMP',
    value: { amount: 1001.0, currency: 'EUR' },
    category: 'MONEY_MARKET',
    profitability: { YTD: 0.03, oneYear: 0.04, threeYears: 0.12, fiveYears: 0.2 },
  },
]

export const mockPortfolio: PortfolioItem[] = [
  {
    id: '1',
    name: 'Global Equity Fund',
    quantity: 5,
    totalValue: { amount: 602.25, currency: 'EUR' },
  },
  {
    id: '2',
    name: 'Tech Growth Fund',
    quantity: 3,
    totalValue: { amount: 630.96, currency: 'EUR' },
  },
]
