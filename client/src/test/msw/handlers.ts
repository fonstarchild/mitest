import { http, HttpResponse } from 'msw'
import { mockFunds, mockPortfolio } from './fixtures'

export const handlers = [
  http.get('/api/funds', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 10)
    const start = (page - 1) * limit
    const data = mockFunds.slice(start, start + limit)

    return HttpResponse.json({
      pagination: {
        page,
        limit,
        totalFunds: mockFunds.length,
        totalPages: Math.ceil(mockFunds.length / limit),
      },
      data,
    })
  }),

  http.get('/api/funds/:id', ({ params }) => {
    const fund = mockFunds.find((f) => f.id === params['id'])
    if (!fund) return HttpResponse.json({ error: 'Fund not found' }, { status: 404 })
    return HttpResponse.json({ data: fund })
  }),

  http.post('/api/funds/:id/buy', () => {
    return HttpResponse.json({ message: 'Purchase successful' })
  }),

  http.post('/api/funds/:id/sell', () => {
    return HttpResponse.json({ message: 'Sale successful' })
  }),

  http.post('/api/funds/transfer', () => {
    return HttpResponse.json({ message: 'Transfer successful' })
  }),

  http.get('/api/portfolio', () => {
    return HttpResponse.json({ data: mockPortfolio })
  }),
]
