import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { BuyDialog } from '../BuyDialog'
import { mockFunds } from '@/test/msw/fixtures'

const fund = mockFunds[0]!

describe('BuyDialog', () => {
  it('renders dialog with fund name in title', () => {
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Global Equity Fund/i)).toBeInTheDocument()
  })

  it('has an accessible dialog label', () => {
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: /comprar/i })).toBeInTheDocument()
  })

  it('submit button is disabled when amount is empty', () => {
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled()
  })

  it('shows validation error when amount exceeds 10.000 €', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    const input = screen.getByLabelText(/importe/i)
    await user.type(input, '15000')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/10.000/i)
  })

  it('shows validation error for negative values', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    const input = screen.getByLabelText(/importe/i)
    await user.type(input, '-50')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('submits successfully with valid amount and calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={onClose} />)
    const input = screen.getByLabelText(/importe/i)
    await user.type(input, '500')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
  })

  it('shows fund current value as reference', () => {
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={vi.fn()} />)
    expect(screen.getByText(/120,45/)).toBeInTheDocument()
  })

  it('close button is accessible via keyboard', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<BuyDialog fund={fund} isOpen onClose={onClose} />)
    // Clicar el botón de cierre es accesible con teclado (Tab + Enter)
    const closeBtn = screen.getByRole('button', { name: /cerrar/i })
    closeBtn.focus()
    await user.keyboard('{Enter}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
