import styled from 'styled-components'

type Props = {
  value: number
}

const fmt = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function ProfitabilityCell({ value }: Props) {
  const isPositive = value > 0
  const isNegative = value < 0
  const formatted = fmt.format(value * 100) + '%'

  return (
    <Cell $positive={isPositive} $negative={isNegative} aria-label={`${formatted} rentabilidad`}>
      {isPositive && <Arrow aria-hidden="true">↑</Arrow>}
      {isNegative && <Arrow aria-hidden="true">↓</Arrow>}
      {formatted}
    </Cell>
  )
}

const Cell = styled.span<{ $positive: boolean; $negative: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  font-family: ${({ theme }) => theme.typography.fontMono};
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme, $positive, $negative }) =>
    $positive
      ? theme.colors.success
      : $negative
        ? theme.colors.danger
        : theme.colors.textSecondary};
`

const Arrow = styled.span`
  font-size: 0.7em;
`
