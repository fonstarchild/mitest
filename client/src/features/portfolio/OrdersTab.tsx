import styled from 'styled-components'
import type { Order } from '@/types'

type Props = {
  orders: Order[]
  onClear: () => void
}

const TYPE_LABEL: Record<Order['type'], string> = {
  buy: 'Compra',
  sell: 'Venta',
  transfer: 'Traspaso',
}

const TYPE_COLOR: Record<Order['type'], 'success' | 'danger' | 'primary'> = {
  buy: 'success',
  sell: 'danger',
  transfer: 'primary',
}

const fmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function OrdersTab({ orders, onClear }: Props) {
  if (orders.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon aria-hidden="true">📋</EmptyIcon>
        <EmptyTitle>Sin órdenes todavía</EmptyTitle>
        <EmptyText>Cuando realices una compra, venta o traspaso aparecerá aquí el historial.</EmptyText>
      </EmptyState>
    )
  }

  return (
    <Wrapper>
      <Header>
        <Title>Historial de órdenes</Title>
        <ClearButton type="button" onClick={onClear} aria-label="Borrar historial de órdenes">
          Limpiar historial
        </ClearButton>
      </Header>

      <OrderList aria-label="Historial de órdenes">
        {orders.map((order) => (
          <OrderItem key={order.id}>
            <OrderBadge $variant={TYPE_COLOR[order.type]}>
              {TYPE_LABEL[order.type]}
            </OrderBadge>
            <OrderInfo>
              <OrderFund>
                {order.fundName}
                {order.destFundName && (
                  <OrderDest> → {order.destFundName}</OrderDest>
                )}
              </OrderFund>
              <OrderDate>{formatDate(order.createdAt)}</OrderDate>
            </OrderInfo>
            <OrderAmount>{fmt.format(order.amount)}</OrderAmount>
          </OrderItem>
        ))}
      </OrderList>
    </Wrapper>
  )
}

// ── Styled components ─────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing['3']};
`

const Title = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontDisplay};
  font-size: ${({ theme }) => theme.typography.sizeLg};
  font-weight: ${({ theme }) => theme.typography.weightSemibold};
  color: ${({ theme }) => theme.colors.textPrimary};
`

const ClearButton = styled.button`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 0;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`

const OrderList = styled.ul`
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
`

const OrderItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['4']};
  padding: ${({ theme }) => `${theme.spacing['4']} ${theme.spacing['4']}`};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`

const OrderBadge = styled.span<{ $variant: 'success' | 'danger' | 'primary' }>`
  flex-shrink: 0;
  display: inline-block;
  padding: 3px ${({ theme }) => theme.spacing['2']};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizeXs};
  font-weight: ${({ theme }) => theme.typography.weightSemibold};
  letter-spacing: 0.03em;
  min-width: 64px;
  text-align: center;

  ${({ theme, $variant }) => {
    const map = {
      success: `background: ${theme.colors.successLight}; color: ${theme.colors.success};`,
      danger:  `background: ${theme.colors.dangerLight}; color: ${theme.colors.danger};`,
      primary: `background: ${theme.colors.primaryLight}; color: ${theme.colors.primary};`,
    }
    return map[$variant]
  }}
`

const OrderInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const OrderFund = styled.p`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const OrderDest = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.weightRegular};
`

const OrderDate = styled.p`
  font-size: ${({ theme }) => theme.typography.sizeXs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
  font-family: ${({ theme }) => theme.typography.fontMono};
`

const OrderAmount = styled.span`
  flex-shrink: 0;
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
  max-width: 280px;
  line-height: ${({ theme }) => theme.typography.lineHeightRelaxed};
`
