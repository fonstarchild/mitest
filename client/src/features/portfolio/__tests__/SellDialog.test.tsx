import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { SellDialog } from '../SellDialog'
import { mockPortfolio } from '@/test/msw/fixtures'

const item = mockPortfolio[0]!

describe('SellDialog', () => {
  it('renders dialog with fund name', () => {
    renderWithProviders(<SellDialog item={item} isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: /vender/i })).toBeInTheDocument()
    expect(screen.getByText(/Global Equity Fund/i)).toBeInTheDocument()
  })

  it('shows current position quantity', () => {
    renderWithProviders(<SellDialog item={item} isOpen onClose={vi.fn()} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows error when amount exceeds position', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SellDialog item={item} isOpen onClose={vi.fn()} />)
    const input = screen.getByLabelText(/importe/i)
    await user.type(input, '9999')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('shows error for negative values', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SellDialog item={item} isOpen onClose={vi.fn()} />)
    const input = screen.getByLabelText(/importe/i)
    await user.type(input, '-10')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('submits successfully with valid amount', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<SellDialog item={item} isOpen onClose={onClose} />)
    const input = screen.getByLabelText(/importe/i)
    await user.type(input, '100')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
  })
})
