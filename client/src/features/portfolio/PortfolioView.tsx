import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import { getPortfolio, getFund } from '@/api/funds'
import { ActionsMenu } from '@/components/ActionsMenu'
import { PortfolioRowSkeleton } from '@/components/Skeleton'
import { BuyDialog } from '@/features/funds/BuyDialog'
import { SellDialog } from './SellDialog'
import { TransferDialog } from './TransferDialog'
import { PortfolioChart } from './PortfolioChart'
import { OrdersTab } from './OrdersTab'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useOrderHistory } from '@/hooks/useOrderHistory'
import type { PortfolioItem, Category } from '@/types'

const CATEGORY_LABELS: Record<Category, string> = {
  GLOBAL: 'Global',
  TECH: 'Tecnología',
  HEALTH: 'Salud',
  MONEY_MARKET: 'Mercado monetario',
}

const TABS = ['Fondos', 'Gráficos', 'Órdenes'] as const
type Tab = (typeof TABS)[number]

const fmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export function PortfolioView() {
  const [activeTab, setActiveTab] = useState<Tab>('Fondos')
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null)
  const [buyFundId, setBuyFundId] = useState<string | null>(null)
  const sellDisclosure = useDisclosure()
  const transferDisclosure = useDisclosure()
  const buyDisclosure = useDisclosure()

  const { orders, addOrder, clearOrders } = useOrderHistory()

  const { data: buyFundData } = useQuery({
    queryKey: ['fund', buyFundId],
    queryFn: () => getFund(buyFundId!),
    enabled: buyFundId !== null,
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolio,
  })

  const items = data?.data ?? []

  // Agrupar por categoría (usamos el nombre del fondo como proxy; en producción
  // el backend devolvería la categoría. Aquí la simulamos por id)
  const grouped = items.reduce<Record<string, PortfolioItem[]>>((acc, item) => {
    // El backend no devuelve categoría en /portfolio, así que agrupamos por inicial del nombre
    const key = item.name.includes('Tech')
      ? 'TECH'
      : item.name.includes('Health')
        ? 'HEALTH'
        : item.name.includes('Money') || item.name.includes('Market')
          ? 'MONEY_MARKET'
          : 'GLOBAL'
    acc[key] = [...(acc[key] ?? []), item]
    return acc
  }, {})

  return (
    <Wrapper>
      <TabList role="tablist" aria-label="Secciones de la cartera">
        {TABS.map((tab) => (
          <Tab
            key={tab}
            role="tab"
            id={`tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            $active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Tab>
        ))}
      </TabList>

      <TabPanel
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTab === 'Fondos' && (
          <>
            {isLoading && Array.from({ length: 4 }).map((_, i) => (
              <PortfolioRowSkeleton key={i} />
            ))}
            {isError && (
              <ErrorMsg role="alert">No se ha podido cargar la cartera.</ErrorMsg>
            )}
            {!isLoading && !isError && items.length === 0 && (
              <EmptyState>
                <EmptyIcon aria-hidden="true">📭</EmptyIcon>
                <p>No tienes posiciones en tu cartera todavía.</p>
              </EmptyState>
            )}
            {Object.entries(grouped).map(([category, groupItems]) => (
              <CategoryGroup key={category}>
                <CategoryHeader>
                  {CATEGORY_LABELS[category as Category] ?? category}
                </CategoryHeader>
                {groupItems.map((item) => (
                  <PortfolioRow key={item.id}>
                    <FundIcon aria-hidden="true">
                      <ChartIcon />
                    </FundIcon>
                    <FundInfo>
                      <FundName>{item.name}</FundName>
                      <FundMeta>
                        {fmt.format(item.totalValue.amount / item.quantity)} · {item.quantity} part.
                      </FundMeta>
                    </FundInfo>
                    <FundValue>
                      <TotalValue>{fmt.format(item.totalValue.amount)}</TotalValue>
                    </FundValue>
                    <ActionsMenu
                      triggerLabel={`Acciones para ${item.name}`}
                      items={[
                        {
                          label: 'Comprar más',
                          icon: '→',
                          onClick: () => {
                            setBuyFundId(item.id)
                            buyDisclosure.open()
                          },
                        },
                        {
                          label: 'Vender',
                          icon: '←',
                          onClick: () => {
                            setActiveItem(item)
                            sellDisclosure.open()
                          },
                          variant: 'danger',
                        },
                        {
                          label: 'Traspasar',
                          icon: '⇄',
                          onClick: () => {
                            setActiveItem(item)
                            transferDisclosure.open()
                          },
                        },
                      ]}
                    />
                  </PortfolioRow>
                ))}
              </CategoryGroup>
            ))}
          </>
        )}

        {activeTab === 'Gráficos' && (
          <PortfolioChart items={items} />
        )}

        {activeTab === 'Órdenes' && (
          <OrdersTab orders={orders} onClear={clearOrders} />
        )}
      </TabPanel>

      {buyFundData?.data && (
        <BuyDialog
          fund={buyFundData.data}
          isOpen={buyDisclosure.isOpen}
          onClose={() => {
            buyDisclosure.close()
            setBuyFundId(null)
          }}
          onSuccess={(amount) =>
            addOrder({ type: 'buy', fundName: buyFundData.data.name, amount, currency: buyFundData.data.value.currency })
          }
        />
      )}

      {activeItem && (
        <>
          <SellDialog
            item={activeItem}
            isOpen={sellDisclosure.isOpen}
            onClose={() => {
              sellDisclosure.close()
              setActiveItem(null)
            }}
            onSuccess={(amount) =>
              addOrder({ type: 'sell', fundName: activeItem.name, amount, currency: activeItem.totalValue.currency })
            }
          />
          <TransferDialog
            item={activeItem}
            portfolioItems={items}
            isOpen={transferDisclosure.isOpen}
            onClose={() => {
              transferDisclosure.close()
              setActiveItem(null)
            }}
            onSuccess={(amount, destFundName) =>
              addOrder({ type: 'transfer', fundName: activeItem.name, amount, currency: activeItem.totalValue.currency, destFundName })
            }
          />
        </>
      )}
    </Wrapper>
  )
}

function ChartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 17l5-5 4 4 5-6 4 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Styled components ─────────────────────────────────────────────────────────

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const TabList = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing['6']};
`

const Tab = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['5']}`};
  font-size: ${({ theme }) => theme.typography.sizeMd};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  background: none;
  border: none;
  border-bottom: 2px solid ${({ theme, $active }) => ($active ? theme.colors.primary : 'transparent')};
  margin-bottom: -2px;
  cursor: pointer;
  transition:
    color ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const TabPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  &:focus-visible {
    outline: none;
  }
`

const CategoryHeader = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => `${theme.spacing['2']} ${theme.spacing['4']}`};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.sm};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing['1']};
`

const CategoryGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: ${({ theme }) => theme.spacing['4']};
`

const PortfolioRow = styled.article`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['4']};
  padding: ${({ theme }) => `${theme.spacing['4']} ${theme.spacing['3']}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
  }

  &:last-child {
    border-bottom: none;
  }
`

const FundIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const FundInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const FundName = styled.p`
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const FundMeta = styled.p`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
  font-family: ${({ theme }) => theme.typography.fontMono};
`

const FundValue = styled.div`
  text-align: right;
  flex-shrink: 0;
`

const TotalValue = styled.p`
  font-weight: ${({ theme }) => theme.typography.weightBold};
  font-family: ${({ theme }) => theme.typography.fontMono};
  font-size: ${({ theme }) => theme.typography.sizeLg};
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => theme.spacing['16']};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sizeMd};
`

const EmptyIcon = styled.span`
  font-size: 2.5rem;
`

const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  padding: ${({ theme }) => theme.spacing['4']};
`
