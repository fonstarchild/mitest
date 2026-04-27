import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, act, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { ToastProvider, useToast } from '../Toast'

function Trigger({ type }: { type: 'success' | 'error' }) {
  const toast = useToast()
  return (
    <button
      onClick={() =>
        toast.show({
          type,
          message: type === 'success' ? 'Compra realizada' : 'Algo salió mal',
        })
      }
    >
      disparar
    </button>
  )
}

function Setup({ type = 'success' }: { type?: 'success' | 'error' }) {
  return (
    <ToastProvider>
      <Trigger type={type} />
    </ToastProvider>
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('Toast', () => {
  it('muestra el mensaje tras llamar a show()', () => {
    vi.useFakeTimers()
    renderWithProviders(<Setup />)
    fireEvent.click(screen.getByRole('button', { name: /disparar/i }))
    expect(screen.getByRole('status')).toHaveTextContent('Compra realizada')
  })

  it('usa role="alert" para errores', () => {
    vi.useFakeTimers()
    renderWithProviders(<Setup type="error" />)
    fireEvent.click(screen.getByRole('button', { name: /disparar/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
  })

  it('tiene aria-live="polite" en éxito y "assertive" en error', () => {
    vi.useFakeTimers()

    const { unmount } = renderWithProviders(<Setup />)
    fireEvent.click(screen.getByRole('button', { name: /disparar/i }))
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    unmount()

    renderWithProviders(<Setup type="error" />)
    fireEvent.click(screen.getByRole('button', { name: /disparar/i }))
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })

  it('se puede cerrar manualmente', () => {
    vi.useFakeTimers()
    renderWithProviders(<Setup />)
    fireEvent.click(screen.getByRole('button', { name: /disparar/i }))
    expect(screen.getByRole('status')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))
    // Avanzar el timer de la animación de salida (280ms)
    act(() => vi.advanceTimersByTime(300))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('desaparece solo tras el timeout', () => {
    vi.useFakeTimers()
    renderWithProviders(<Setup />)
    fireEvent.click(screen.getByRole('button', { name: /disparar/i }))
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Avanzar hasta que el dismiss se dispare + animación de salida
    act(() => vi.advanceTimersByTime(4500 + 300))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('apila varios toasts', () => {
    vi.useFakeTimers()
    renderWithProviders(<Setup />)
    fireEvent.click(screen.getByRole('button', { name: /disparar/i }))
    fireEvent.click(screen.getByRole('button', { name: /disparar/i }))
    expect(screen.getAllByRole('status')).toHaveLength(2)
  })
})
