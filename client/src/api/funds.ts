import { api } from './client'
import type { Fund, FundsResponse, PortfolioResponse, SortField, SortDirection } from '@/types'

type GetFundsParams = {
  page?: number
  limit?: number
  sort?: SortField
  direction?: SortDirection
}

export function getFunds({ page = 1, limit = 10, sort, direction }: GetFundsParams = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (sort) params.set('sort', direction ? `${sort}:${direction}` : sort)
  return api.get<FundsResponse>(`/funds?${params}`)
}

export function getFund(id: string) {
  return api.get<{ data: Fund }>(`/funds/${id}`)
}

export function buyFund(id: string, quantity: number) {
  return api.post<{ message: string }>(`/funds/${id}/buy`, { quantity })
}

export function sellFund(id: string, quantity: number) {
  return api.post<{ message: string }>(`/funds/${id}/sell`, { quantity })
}

export function transferFund(fromFundId: string, toFundId: string, quantity: number) {
  return api.post<{ message: string }>('/funds/transfer', { fromFundId, toFundId, quantity })
}

export function getPortfolio() {
  return api.get<PortfolioResponse>('/portfolio')
}
