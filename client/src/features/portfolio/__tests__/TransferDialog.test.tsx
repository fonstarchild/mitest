import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { TransferDialog } from '../TransferDialog'
import { mockPortfolio } from '@/test/msw/fixtures'

const item = mockPortfolio[0]!

describe('TransferDialog', () => {
  it('renders dialog with fund name', () => {
    renderWithProviders(
      <TransferDialog item={item} portfolioItems={mockPortfolio} isOpen onClose={vi.fn()} />
    )
    expect(screen.getByRole('dialog', { name: /traspasar/i })).toBeInTheDocument()
  })

  it('lists only other funds in portfolio as destination options', async () => {
    renderWithProviders(
      <TransferDialog item={item} portfolioItems={mockPortfolio} isOpen onClose={vi.fn()} />
    )
    const select = screen.getByRole('combobox', { name: /destino/i })
    expect(select).toBeInTheDocument()
    // Tech Growth Fund debería aparecer, no Global Equity Fund (el origen)
    expect(screen.getByRole('option', { name: /tech growth fund/i })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /global equity fund/i })).not.toBeInTheDocument()
  })

  it('shows error when amount exceeds position', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <TransferDialog item={item} portfolioItems={mockPortfolio} isOpen onClose={vi.fn()} />
    )
    const input = screen.getByLabelText(/importe/i)
    await user.type(input, '9999')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('shows error for negative values', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <TransferDialog item={item} portfolioItems={mockPortfolio} isOpen onClose={vi.fn()} />
    )
    const input = screen.getByLabelText(/importe/i)
    await user.type(input, '-10')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('confirm button is disabled when no destination is selected', () => {
    renderWithProviders(
      <TransferDialog item={item} portfolioItems={mockPortfolio} isOpen onClose={vi.fn()} />
    )
    // Sin seleccionar destino ni importe, el botón de confirmar está deshabilitado
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled()
  })

  it('submits with valid data and calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <TransferDialog item={item} portfolioItems={mockPortfolio} isOpen onClose={onClose} />
    )
    // Seleccionar destino
    const select = screen.getByRole('combobox', { name: /destino/i })
    await user.selectOptions(select, mockPortfolio[1]!.id)
    const input = screen.getByLabelText(/importe/i)
    await user.type(input, '100')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
  })
})
