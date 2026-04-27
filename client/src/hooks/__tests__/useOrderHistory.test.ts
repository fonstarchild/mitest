import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOrderHistory } from '../useOrderHistory'

const STORAGE_KEY = 'myinvestor_orders'

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('useOrderHistory', () => {
  it('empieza con lista vacía si no hay nada en localStorage', () => {
    const { result } = renderHook(() => useOrderHistory())
    expect(result.current.orders).toHaveLength(0)
  })

  it('addOrder añade una orden al principio de la lista', () => {
    const { result } = renderHook(() => useOrderHistory())

    act(() => {
      result.current.addOrder({
        type: 'buy',
        fundName: 'Global Equity Fund',
        amount: 500,
        currency: 'EUR',
      })
    })

    expect(result.current.orders).toHaveLength(1)
    expect(result.current.orders[0]).toMatchObject({
      type: 'buy',
      fundName: 'Global Equity Fund',
      amount: 500,
      currency: 'EUR',
    })
  })

  it('las órdenes nuevas se insertan al principio (más reciente primero)', () => {
    const { result } = renderHook(() => useOrderHistory())

    act(() => {
      result.current.addOrder({ type: 'buy', fundName: 'Fondo A', amount: 100, currency: 'EUR' })
    })
    act(() => {
      result.current.addOrder({ type: 'sell', fundName: 'Fondo B', amount: 200, currency: 'EUR' })
    })

    expect(result.current.orders[0]!.fundName).toBe('Fondo B')
    expect(result.current.orders[1]!.fundName).toBe('Fondo A')
  })

  it('persiste las órdenes en localStorage', () => {
    const { result } = renderHook(() => useOrderHistory())

    act(() => {
      result.current.addOrder({ type: 'sell', fundName: 'Tech Growth Fund', amount: 300, currency: 'EUR' })
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored).toHaveLength(1)
    expect(stored[0].fundName).toBe('Tech Growth Fund')
  })

  it('carga las órdenes guardadas al montar', () => {
    const existing = [
      { id: 'abc', type: 'buy', fundName: 'Health Fund', amount: 150, currency: 'EUR', createdAt: new Date().toISOString() },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

    const { result } = renderHook(() => useOrderHistory())
    expect(result.current.orders).toHaveLength(1)
    expect(result.current.orders[0]!.fundName).toBe('Health Fund')
  })

  it('clearOrders vacía la lista y el localStorage', () => {
    const { result } = renderHook(() => useOrderHistory())

    act(() => {
      result.current.addOrder({ type: 'buy', fundName: 'Fondo A', amount: 100, currency: 'EUR' })
    })
    act(() => {
      result.current.clearOrders()
    })

    expect(result.current.orders).toHaveLength(0)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('cada orden tiene un id único', () => {
    const { result } = renderHook(() => useOrderHistory())

    act(() => {
      result.current.addOrder({ type: 'buy', fundName: 'A', amount: 100, currency: 'EUR' })
      result.current.addOrder({ type: 'buy', fundName: 'B', amount: 200, currency: 'EUR' })
    })

    const ids = result.current.orders.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('los traspasos guardan el fondo destino', () => {
    const { result } = renderHook(() => useOrderHistory())

    act(() => {
      result.current.addOrder({
        type: 'transfer',
        fundName: 'Fondo Origen',
        amount: 400,
        currency: 'EUR',
        destFundName: 'Fondo Destino',
      })
    })

    expect(result.current.orders[0]!.destFundName).toBe('Fondo Destino')
  })
})
