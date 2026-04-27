import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import styled, { useTheme } from 'styled-components'
import type { PortfolioItem } from '@/types'

type Props = {
  items: PortfolioItem[]
}

const CATEGORY_LABELS: Record<string, string> = {
  GLOBAL: 'Global',
  TECH: 'Tecnología',
  HEALTH: 'Salud',
  MONEY_MARKET: 'Monetario',
}

function inferCategory(name: string): string {
  if (name.includes('Tech')) return 'TECH'
  if (name.includes('Health')) return 'HEALTH'
  if (name.includes('Money') || name.includes('Market')) return 'MONEY_MARKET'
  return 'GLOBAL'
}

const fmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <TooltipBox>
      <TooltipLabel>{name}</TooltipLabel>
      <TooltipValue>{fmt.format(value)}</TooltipValue>
    </TooltipBox>
  )
}

export function PortfolioChart({ items }: Props) {
  const theme = useTheme()

  const PALETTE = [
    theme.colors.primary,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.primaryMid,
    theme.colors.danger,
  ]

  if (items.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon aria-hidden="true">🌱</EmptyIcon>
        <EmptyTitle>Aún no tienes inversiones</EmptyTitle>
        <EmptyText>Anímate a invertir y aquí verás cómo crece tu cartera.</EmptyText>
      </EmptyState>
    )
  }

  // Agrupar por fondo individual para el pie
  const byFund = items.map((item, i) => ({
    name: item.name,
    value: item.totalValue.amount,
    color: PALETTE[i % PALETTE.length],
  }))

  // Agrupar por categoría para el resumen
  const byCategory = items.reduce<Record<string, number>>((acc, item) => {
    const cat = inferCategory(item.name)
    acc[cat] = (acc[cat] ?? 0) + item.totalValue.amount
    return acc
  }, {})

  const total = items.reduce((sum, i) => sum + i.totalValue.amount, 0)

  return (
    <Wrapper>
      <ChartTitle>Distribución de la cartera</ChartTitle>

      <ChartArea>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={byFund}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              aria-label="Gráfico de distribución de fondos"
            >
              {byFund.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <LegendLabel>{value}</LegendLabel>
              )}
              iconType="circle"
              iconSize={10}
            />
          </PieChart>
        </ResponsiveContainer>

        <DonutCenter>
          <DonutTotal>{fmt.format(total)}</DonutTotal>
          <DonutLabel>Total cartera</DonutLabel>
        </DonutCenter>
      </ChartArea>

      <Breakdown>
        {Object.entries(byCategory).map(([cat, value], i) => (
          <BreakdownRow key={cat}>
            <ColorDot $color={PALETTE[i % PALETTE.length]} />
            <BreakdownName>{CATEGORY_LABELS[cat] ?? cat}</BreakdownName>
            <BreakdownValue>{fmt.format(value)}</BreakdownValue>
            <BreakdownPct>{((value / total) * 100).toFixed(1)}%</BreakdownPct>
          </BreakdownRow>
        ))}
      </Breakdown>
    </Wrapper>
  )
}

// ── Styled components ─────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['6']};
`

const ChartTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontDisplay};
  font-size: ${({ theme }) => theme.typography.sizeLg};
  font-weight: ${({ theme }) => theme.typography.weightSemibold};
  color: ${({ theme }) => theme.colors.textPrimary};
`

const ChartArea = styled.div`
  position: relative;
`

const DonutCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -62%);
  text-align: center;
  pointer-events: none;
`

const DonutTotal = styled.p`
  font-family: ${({ theme }) => theme.typography.fontMono};
  font-size: ${({ theme }) => theme.typography.sizeLg};
  font-weight: ${({ theme }) => theme.typography.weightBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.2;
`

const DonutLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.sizeXs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`

const Breakdown = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
`

const BreakdownRow = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`

const ColorDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

const BreakdownName = styled.span`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.sizeSm};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  color: ${({ theme }) => theme.colors.textPrimary};
`

const BreakdownValue = styled.span`
  font-family: ${({ theme }) => theme.typography.fontMono};
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const BreakdownPct = styled.span`
  font-family: ${({ theme }) => theme.typography.fontMono};
  font-size: ${({ theme }) => theme.typography.sizeSm};
  font-weight: ${({ theme }) => theme.typography.weightSemibold};
  color: ${({ theme }) => theme.colors.primary};
  min-width: 44px;
  text-align: right;
`

const TooltipBox = styled.div`
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => `${theme.spacing['2']} ${theme.spacing['3']}`};
  box-shadow: ${({ theme }) => theme.shadows.md};
`

const TooltipLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2px;
`

const TooltipValue = styled.p`
  font-family: ${({ theme }) => theme.typography.fontMono};
  font-size: ${({ theme }) => theme.typography.sizeSm};
  font-weight: ${({ theme }) => theme.typography.weightSemibold};
  color: ${({ theme }) => theme.colors.textPrimary};
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => theme.spacing['16']};
  text-align: center;
`

const EmptyIcon = styled.span`
  font-size: 2.5rem;
`

const EmptyTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontDisplay};
  font-size: ${({ theme }) => theme.typography.sizeLg};
  font-weight: ${({ theme }) => theme.typography.weightSemibold};
  color: ${({ theme }) => theme.colors.textPrimary};
`

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 260px;
  line-height: ${({ theme }) => theme.typography.lineHeightRelaxed};
`

const LegendLabel = styled.span`
  font-size: 0.8rem;
  color: #1A1714;
`
