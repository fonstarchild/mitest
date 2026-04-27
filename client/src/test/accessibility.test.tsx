import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from './renderWithProviders'
import { FundsTable } from '@/features/funds/FundsTable'
import { PortfolioView } from '@/features/portfolio/PortfolioView'
import { BuyDialog } from '@/features/funds/BuyDialog'
import { mockFunds } from './msw/fixtures'
import axe from 'axe-core'

async function runAxe(container: HTMLElement) {
  const results = await axe.run(container)
  return results.violations
}

describe('Accesibilidad (axe-core)', () => {
  it('FundsTable no tiene violaciones de accesibilidad', async () => {
    const { container } = renderWithProviders(<FundsTable />)
    await waitFor(() => screen.getByRole('table'))
    const violations = await runAxe(container)
    expect(violations).toHaveLength(0)
  })

  it('PortfolioView no tiene violaciones de accesibilidad', async () => {
    const { container } = renderWithProviders(<PortfolioView />)
    await waitFor(() => screen.getByRole('tablist'))
    const violations = await runAxe(container)
    expect(violations).toHaveLength(0)
  })

  it('BuyDialog no tiene violaciones cuando está abierto', async () => {
    const { container } = renderWithProviders(
      <BuyDialog fund={mockFunds[0]!} isOpen onClose={() => {}} />
    )
    await waitFor(() => screen.getByRole('dialog'))
    const violations = await runAxe(container)
    expect(violations).toHaveLength(0)
  })
})
