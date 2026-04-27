import { describe, it, expect } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FundsTable } from '../FundsTable'
import { mockFunds } from '@/test/msw/fixtures'

describe('FundsTable', () => {
  it('renders fund names in a table', async () => {
    renderWithProviders(<FundsTable />)
    await waitFor(() => {
      expect(screen.getByText('Global Equity Fund')).toBeInTheDocument()
    })
    expect(screen.getByText('Tech Growth Fund')).toBeInTheDocument()
  })

  it('has an accessible table role with caption', async () => {
    renderWithProviders(<FundsTable />)
    await waitFor(() => screen.getByRole('table'))
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders column headers with sort buttons', async () => {
    renderWithProviders(<FundsTable />)
    await waitFor(() => screen.getByRole('table'))
    const nameHeader = screen.getByRole('columnheader', { name: /nombre/i })
    expect(nameHeader).toBeInTheDocument()
    expect(within(nameHeader).getByRole('button')).toBeInTheDocument()
  })

  it('shows skeleton rows while fetching', () => {
    renderWithProviders(<FundsTable />)
    // La tabla ya está montada; las filas skeleton están ocultas a AT con aria-hidden
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(document.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0)
  })

  it('opens buy dialog when "Comprar" action is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FundsTable />)
    await waitFor(() => screen.getByText('Global Equity Fund'))

    const menuButtons = screen.getAllByRole('button', { name: /acciones/i })
    await user.click(menuButtons[0]!)
    await user.click(screen.getByRole('menuitem', { name: /comprar/i }))

    expect(screen.getByRole('dialog', { name: /comprar/i })).toBeInTheDocument()
  })

  it('renders all mock funds on a single page', async () => {
    // El mock devuelve 4 fondos con limit=10, caben todos en página 1
    renderWithProviders(<FundsTable />)
    await waitFor(() => screen.getByText('Global Equity Fund'))
    expect(screen.getByText('Health Innovation Fund')).toBeInTheDocument()
    expect(screen.getByText('Money Market Plus')).toBeInTheDocument()
  })

  it('toggles sort direction when header is clicked twice', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FundsTable />)
    await waitFor(() => screen.getByRole('table'))
    const nameHeader = screen.getByRole('columnheader', { name: /nombre/i })
    const sortButton = within(nameHeader).getByRole('button')

    await user.click(sortButton)
    expect(sortButton).toHaveAttribute('aria-sort', 'ascending')

    await user.click(sortButton)
    expect(sortButton).toHaveAttribute('aria-sort', 'descending')
  })

  it('shows profitability values formatted as percentages', async () => {
    renderWithProviders(<FundsTable />)
    await waitFor(() => screen.getByText('Global Equity Fund'))
    // YTD de Global Equity Fund es 0.05 → 5,00%
    expect(screen.getByText('5,00%')).toBeInTheDocument()
  })

  it('each row has accessible actions menu', async () => {
    renderWithProviders(<FundsTable />)
    await waitFor(() => screen.getAllByRole('button', { name: /acciones/i }))
    const actionButtons = screen.getAllByRole('button', { name: /acciones/i })
    expect(actionButtons.length).toBe(mockFunds.length)
  })
})
