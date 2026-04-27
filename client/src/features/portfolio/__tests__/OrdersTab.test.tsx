import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { OrdersTab } from '../OrdersTab'
import type { Order } from '@/types'

const mockOrders: Order[] = [
  {
    id: '1',
    type: 'buy',
    fundName: 'Global Equity Fund',
    amount: 500,
    currency: 'EUR',
    createdAt: '2026-04-27T10:00:00.000Z',
  },
  {
    id: '2',
    type: 'sell',
    fundName: 'Tech Growth Fund',
    amount: 300,
    currency: 'EUR',
    createdAt: '2026-04-27T11:30:00.000Z',
  },
  {
    id: '3',
    type: 'transfer',
    fundName: 'Health Innovation Fund',
    amount: 200,
    currency: 'EUR',
    destFundName: 'Money Market Plus',
    createdAt: '2026-04-27T12:00:00.000Z',
  },
]

describe('OrdersTab', () => {
  it('muestra empty state cuando no hay órdenes', () => {
    renderWithProviders(<OrdersTab orders={[]} onClear={vi.fn()} />)
    expect(screen.getByText(/sin órdenes todavía/i)).toBeInTheDocument()
  })

  it('el empty state explica para qué sirve el tab', () => {
    renderWithProviders(<OrdersTab orders={[]} onClear={vi.fn()} />)
    expect(screen.getByText(/compra, venta o traspaso/i)).toBeInTheDocument()
  })

  it('renderiza todas las órdenes recibidas', () => {
    renderWithProviders(<OrdersTab orders={mockOrders} onClear={vi.fn()} />)
    expect(screen.getByText('Global Equity Fund')).toBeInTheDocument()
    expect(screen.getByText('Tech Growth Fund')).toBeInTheDocument()
    expect(screen.getByText('Health Innovation Fund')).toBeInTheDocument()
  })

  it('muestra el badge correcto por tipo de orden', () => {
    renderWithProviders(<OrdersTab orders={mockOrders} onClear={vi.fn()} />)
    expect(screen.getByText('Compra')).toBeInTheDocument()
    expect(screen.getByText('Venta')).toBeInTheDocument()
    expect(screen.getByText('Traspaso')).toBeInTheDocument()
  })

  it('muestra el fondo destino en los traspasos', () => {
    renderWithProviders(<OrdersTab orders={mockOrders} onClear={vi.fn()} />)
    expect(screen.getByText(/Money Market Plus/i)).toBeInTheDocument()
  })

  it('muestra el importe formateado en euros', () => {
    renderWithProviders(<OrdersTab orders={mockOrders} onClear={vi.fn()} />)
    expect(screen.getByText('500,00 €')).toBeInTheDocument()
    expect(screen.getByText('300,00 €')).toBeInTheDocument()
  })

  it('llama a onClear al hacer click en el botón de borrar', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    renderWithProviders(<OrdersTab orders={mockOrders} onClear={onClear} />)
    await user.click(screen.getByRole('button', { name: /borrar historial/i }))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('la lista tiene aria-label accesible', () => {
    renderWithProviders(<OrdersTab orders={mockOrders} onClear={vi.fn()} />)
    expect(screen.getByRole('list', { name: /historial de órdenes/i })).toBeInTheDocument()
  })
})
