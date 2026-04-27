import { forwardRef, useId, useState, useCallback } from 'react'
import styled from 'styled-components'

type Props = {
  label: string
  name: string
  value?: number
  /** Usado por el form para validación; no clampea el valor emitido */
  max?: number
  error?: string
  onValueChange?: (value: number) => void
  placeholder?: string
  disabled?: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + ' €'
}

function parseAmount(raw: string): number {
  const clean = raw.replace(/[^\d,.-]/g, '').replace(',', '.')
  const n = parseFloat(clean)
  return isNaN(n) ? 0 : n
}

export const CurrencyInput = forwardRef<HTMLInputElement, Props>(function CurrencyInput(
  { label, name, value, error, onValueChange, placeholder = '0,00 €', disabled },
  ref
) {
  const id = useId()
  const errorId = `${id}-error`
  const [display, setDisplay] = useState(value !== undefined ? formatCurrency(value) : '')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d,.-]/g, '')
      setDisplay(raw)
      const numeric = parseAmount(raw)
      // Emitimos el valor tal cual (sin clampear) para que Zod pueda validar
      if (!isNaN(numeric) && numeric >= 0) {
        onValueChange?.(numeric)
      }
    },
    [onValueChange]
  )

  const handleBlur = useCallback(() => {
    const numeric = parseAmount(display)
    if (display === '' || isNaN(numeric) || numeric < 0) {
      setDisplay('')
      return
    }
    setDisplay(formatCurrency(numeric))
    onValueChange?.(numeric)
  }, [display, onValueChange])

  return (
    <Wrapper>
      <Label htmlFor={id}>{label}</Label>
      <Input
        ref={ref}
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onFocus={(e) => {
          // Quitar formato al enfocar para edición limpia
          const numeric = parseAmount(e.target.value)
          if (numeric > 0) setDisplay(String(numeric).replace('.', ','))
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        $hasError={!!error}
      />
      {error && (
        <ErrorText id={errorId} role="alert">
          {error}
        </ErrorText>
      )}
    </Wrapper>
  )
})

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
`

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Input = styled.input<{ $hasError: boolean }>`
  padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
  border: 1.5px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizeLg};
  font-family: ${({ theme }) => theme.typography.fontMono};
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  transition: border-color ${({ theme }) => theme.transitions.fast};
  width: 100%;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.danger};
`
