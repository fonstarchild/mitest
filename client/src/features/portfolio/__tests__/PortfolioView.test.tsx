import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { PortfolioView } from '../PortfolioView'

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('PortfolioView', () => {
  it('renders the "Fondos" tab as active by default', async () => {
    renderWithProviders(<PortfolioView />)
    const tab = screen.getByRole('tab', { name: /fondos/i })
    expect(tab).toHaveAttribute('aria-selected', 'true')
  })

  it('renders portfolio items with fund names', async () => {
    renderWithProviders(<PortfolioView />)
    await waitFor(() => {
      expect(screen.getByText('Global Equity Fund')).toBeInTheDocument()
    })
    expect(screen.getByText('Tech Growth Fund')).toBeInTheDocument()
  })

  it('shows total value for each position', async () => {
    renderWithProviders(<PortfolioView />)
    await waitFor(() => screen.getByText('Global Equity Fund'))
    expect(screen.getByText(/602,25/)).toBeInTheDocument()
  })

  it('groups items by category', async () => {
    renderWithProviders(<PortfolioView />)
    await waitFor(() => screen.getByText('Global Equity Fund'))
    // Comprobamos que aparecen los headers de categoría (h3)
    const headers = screen.getAllByRole('heading', { level: 2 })
    expect(headers.length).toBeGreaterThanOrEqual(1)
  })

  it('opens sell dialog when "Vender" action is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioView />)
    await waitFor(() => screen.getAllByRole('button', { name: /acciones/i }))
    await user.click(screen.getAllByRole('button', { name: /acciones/i })[0]!)
    await user.click(screen.getByRole('menuitem', { name: /vender/i }))
    expect(screen.getByRole('dialog', { name: /vender/i })).toBeInTheDocument()
  })

  it('opens transfer dialog when "Traspasar" action is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioView />)
    await waitFor(() => screen.getAllByRole('button', { name: /acciones/i }))
    await user.click(screen.getAllByRole('button', { name: /acciones/i })[0]!)
    await user.click(screen.getByRole('menuitem', { name: /traspasar/i }))
    expect(screen.getByRole('dialog', { name: /traspasar/i })).toBeInTheDocument()
  })

  it('registra una venta en el historial de órdenes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioView />)
    await waitFor(() => screen.getAllByRole('button', { name: /acciones/i }))

    // Abrir menú y vender
    await user.click(screen.getAllByRole('button', { name: /acciones/i })[0]!)
    await user.click(screen.getByRole('menuitem', { name: /vender/i }))
    await user.type(screen.getByLabelText(/importe/i), '1')
    await user.click(screen.getByRole('button', { name: /confirmar venta/i }))

    // Navegar al tab Órdenes
    await user.click(screen.getByRole('tab', { name: /órdenes/i }))
    await waitFor(() => {
      expect(screen.getByText('Venta')).toBeInTheDocument()
      expect(screen.getByText('Global Equity Fund')).toBeInTheDocument()
    })
  })

  it('registra un traspaso en el historial de órdenes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioView />)
    await waitFor(() => screen.getAllByRole('button', { name: /acciones/i }))

    // Abrir menú y traspasar
    await user.click(screen.getAllByRole('button', { name: /acciones/i })[0]!)
    await user.click(screen.getByRole('menuitem', { name: /traspasar/i }))
    await user.selectOptions(screen.getByRole('combobox'), '2')
    await user.type(screen.getByLabelText(/importe/i), '1')
    await user.click(screen.getByRole('button', { name: /confirmar traspaso/i }))

    // Navegar al tab Órdenes
    await user.click(screen.getByRole('tab', { name: /órdenes/i }))
    await waitFor(() => {
      expect(screen.getByText('Traspaso')).toBeInTheDocument()
      // La orden debe mostrar el fondo origen
      expect(screen.getByText('Global Equity Fund')).toBeInTheDocument()
    })
  })

  it('el tab Órdenes muestra empty state si no se ha operado', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioView />)
    await user.click(screen.getByRole('tab', { name: /órdenes/i }))
    expect(screen.getByText(/sin órdenes todavía/i)).toBeInTheDocument()
  })

  it('shows empty state when portfolio has no items', async () => {
    // Override MSW handler to return empty portfolio
    const { server } = await import('@/test/msw/server')
    const { http, HttpResponse } = await import('msw')
    server.use(
      http.get('/api/portfolio', () => HttpResponse.json({ data: [] }))
    )
    renderWithProviders(<PortfolioView />)
    await waitFor(() => {
      expect(screen.getByText(/no tienes posiciones/i)).toBeInTheDocument()
    })
  })
})
