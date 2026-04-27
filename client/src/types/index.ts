export type Currency = 'EUR' | 'USD'

export type Amount = {
  amount: number
  currency: Currency
}

export type Category = 'GLOBAL' | 'TECH' | 'HEALTH' | 'MONEY_MARKET'

export type Profitability = {
  YTD: number
  oneYear: number
  threeYears: number
  fiveYears: number
}

export type Fund = {
  id: string
  name: string
  symbol: string
  value: Amount
  category: Category
  profitability: Profitability
}

export type PortfolioItem = {
  id: string
  name: string
  quantity: number
  totalValue: Amount
}

export type SortField =
  | 'name'
  | 'currency'
  | 'value'
  | 'category'
  | 'profitability.YTD'
  | 'profitability.oneYear'
  | 'profitability.threeYears'
  | 'profitability.fiveYears'

export type SortDirection = 'asc' | 'desc'

export type SortState = {
  field: SortField
  direction: SortDirection
}

export type Pagination = {
  page: number
  limit: number
  totalFunds: number
  totalPages: number
}

export type FundsResponse = {
  pagination: Pagination
  data: Fund[]
}

export type PortfolioResponse = {
  data: PortfolioItem[]
}
