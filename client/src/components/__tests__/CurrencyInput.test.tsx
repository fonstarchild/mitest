import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CurrencyInput } from '../CurrencyInput'

describe('CurrencyInput', () => {
  it('renders with an accessible label', () => {
    renderWithProviders(<CurrencyInput label="Importe" name="amount" />)
    expect(screen.getByLabelText('Importe')).toBeInTheDocument()
  })

  it('formats value as currency on blur', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CurrencyInput label="Importe" name="amount" />)
    const input = screen.getByLabelText('Importe')
    await user.type(input, '1055')
    fireEvent.blur(input)
    // El valor formateado debe contener el número y el símbolo de euro
    expect((input as HTMLInputElement).value).toMatch(/1[\s.]?055/)
    expect((input as HTMLInputElement).value).toMatch(/€/)
  })

  it('strips formatting and returns numeric value on change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<CurrencyInput label="Importe" name="amount" onValueChange={onChange} />)
    const input = screen.getByLabelText('Importe')
    await user.type(input, '500')
    expect(onChange).toHaveBeenCalledWith(500)
  })

  it('shows error message when provided', () => {
    renderWithProviders(
      <CurrencyInput label="Importe" name="amount" error="El importe es obligatorio" />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('El importe es obligatorio')
  })

  it('marks input as invalid when error is present', () => {
    renderWithProviders(
      <CurrencyInput label="Importe" name="amount" error="Campo requerido" />
    )
    expect(screen.getByLabelText('Importe')).toHaveAttribute('aria-invalid', 'true')
  })

  it('emits the typed value allowing the form to validate against max', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(
      <CurrencyInput label="Importe" name="amount" max={10000} onValueChange={onValueChange} />
    )
    const input = screen.getByLabelText('Importe')
    await user.type(input, '15000')
    fireEvent.blur(input)
    // El valor emitido es el real para que Zod pueda validar el límite
    const lastCall = onValueChange.mock.calls.at(-1)?.[0] as number
    expect(lastCall).toBe(15000)
  })

  it('does not allow negative values', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(<CurrencyInput label="Importe" name="amount" onValueChange={onValueChange} />)
    const input = screen.getByLabelText('Importe')
    await user.type(input, '-100')
    fireEvent.blur(input)
    const lastCall = onValueChange.mock.calls.at(-1)?.[0] as number | undefined
    if (lastCall !== undefined) {
      expect(lastCall).toBeGreaterThanOrEqual(0)
    }
  })
})
