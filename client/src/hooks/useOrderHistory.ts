import { useCallback, useState } from 'react'
import type { Order, OrderType } from '@/types'

const STORAGE_KEY = 'myinvestor_orders'

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

type AddOrderParams = {
  type: OrderType
  fundName: string
  amount: number
  currency: string
  destFundName?: string
}

export function useOrderHistory() {
  const [orders, setOrders] = useState<Order[]>(loadOrders)

  const addOrder = useCallback((params: AddOrderParams) => {
    const order: Order = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...params,
    }
    setOrders((prev) => {
      const next = [order, ...prev]
      saveOrders(next)
      return next
    })
  }, [])

  const clearOrders = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setOrders([])
  }, [])

  return { orders, addOrder, clearOrders }
}
