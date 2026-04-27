import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import { getFunds } from '@/api/funds'
import { ActionsMenu } from '@/components/ActionsMenu'
import { ProfitabilityCell } from '@/components/ProfitabilityCell'
import { FundsTableRowSkeleton } from '@/components/Skeleton'
import { Button } from '@/components/Button'
import { BuyDialog } from './BuyDialog'
import { useSortState } from '@/hooks/useSortState'
import { useDisclosure } from '@/hooks/useDisclosure'
import type { Fund, SortField } from '@/types'

const PAGE_SIZE = 10

const fmt = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type SortButtonProps = {
  field: SortField
  label: string
  currentField?: SortField
  direction?: 'asc' | 'desc' | null
  onClick: (field: SortField) => void
}

function SortButton({ field, label, currentField, direction, onClick }: SortButtonProps) {
  const active = currentField === field
  const ariaSort = active ? (direction === 'asc' ? 'ascending' : 'descending') : undefined

  return (
    <SortBtn
      type="button"
      onClick={() => onClick(field)}
      aria-sort={ariaSort}
      $active={active}
    >
      {label}
      <SortIcon aria-hidden="true">
        {!active ? '↕' : direction === 'asc' ? '↑' : '↓'}
      </SortIcon>
    </SortBtn>
  )
}

export function FundsTable() {
  const [page, setPage] = useState(1)
  const [activeFund, setActiveFund] = useState<Fund | null>(null)
  const buyDisclosure = useDisclosure()
  const { sort, toggle } = useSortState()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['funds', page, sort],
    queryFn: () =>
      getFunds({
        page,
        limit: PAGE_SIZE,
        sort: sort?.field,
        direction: sort?.direction,
      }),
    placeholderData: (prev) => prev,
  })

  if (isError) {
    return <ErrorMsg role="alert">No se han podido cargar los fondos. Inténtalo de nuevo.</ErrorMsg>
  }

  const funds = data?.data ?? []
  const pagination = data?.pagination

  return (
    <Wrapper>
      <TableScroll>
        <Table aria-label="Listado de fondos de inversión">
          <thead>
            <tr>
              <Th scope="col">
                <SortButton
                  field="name"
                  label="Nombre"
                  currentField={sort?.field}
                  direction={sort?.direction}
                  onClick={toggle}
                />
              </Th>
              <Th scope="col">
                <SortButton
                  field="category"
                  label="Categoría"
                  currentField={sort?.field}
                  direction={sort?.direction}
                  onClick={toggle}
                />
              </Th>
              <Th scope="col" $numeric>
                <SortButton
                  field="value"
                  label="Valor liquidativo"
                  currentField={sort?.field}
                  direction={sort?.direction}
                  onClick={toggle}
                />
              </Th>
              <Th scope="col" $numeric>
                <SortButton
                  field="profitability.YTD"
                  label="YTD"
                  currentField={sort?.field}
                  direction={sort?.direction}
                  onClick={toggle}
                />
              </Th>
              <Th scope="col" $numeric>
                <SortButton
                  field="profitability.oneYear"
                  label="1A"
                  currentField={sort?.field}
                  direction={sort?.direction}
                  onClick={toggle}
                />
              </Th>
              <Th scope="col" $numeric>
                <SortButton
                  field="profitability.threeYears"
                  label="3A"
                  currentField={sort?.field}
                  direction={sort?.direction}
                  onClick={toggle}
                />
              </Th>
              <Th scope="col" $numeric>
                <SortButton
                  field="profitability.fiveYears"
                  label="5A"
                  currentField={sort?.field}
                  direction={sort?.direction}
                  onClick={toggle}
                />
              </Th>
              <Th scope="col">
                <span className="sr-only">Acciones</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <FundsTableRowSkeleton key={i} />
            ))}
            {funds.map((fund) => (
              <Row key={fund.id}>
                <Td>
                  <FundName>{fund.name}</FundName>
                  <FundSymbol>{fund.symbol}</FundSymbol>
                </Td>
                <Td>
                  <CategoryBadge $category={fund.category}>{fund.category}</CategoryBadge>
                </Td>
                <Td $numeric>
                  <Mono>
                    {fmt.format(fund.value.amount)} {fund.value.currency}
                  </Mono>
                </Td>
                <Td $numeric>
                  <ProfitabilityCell value={fund.profitability.YTD} />
                </Td>
                <Td $numeric>
                  <ProfitabilityCell value={fund.profitability.oneYear} />
                </Td>
                <Td $numeric>
                  <ProfitabilityCell value={fund.profitability.threeYears} />
                </Td>
                <Td $numeric>
                  <ProfitabilityCell value={fund.profitability.fiveYears} />
                </Td>
                <Td>
                  <ActionsMenu
                    triggerLabel={`Acciones para ${fund.name}`}
                    items={[
                      {
                        label: 'Comprar',
                        icon: '→',
                        onClick: () => {
                          setActiveFund(fund)
                          buyDisclosure.open()
                        },
                      },
                    ]}
                  />
                </Td>
              </Row>
            ))}
          </tbody>
        </Table>
      </TableScroll>

      {pagination && pagination.totalPages > 1 && (
        <Pagination aria-label="Paginación">
          <PaginationInfo aria-live="polite">
            Página {pagination.page} de {pagination.totalPages}
          </PaginationInfo>
          <PaginationButtons>
            <Button
              size="sm"
              variant="ghost"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Página anterior"
            >
              ← Anterior
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Página siguiente"
            >
              Siguiente →
            </Button>
          </PaginationButtons>
        </Pagination>
      )}

      {activeFund && (
        <BuyDialog
          fund={activeFund}
          isOpen={buyDisclosure.isOpen}
          onClose={() => {
            buyDisclosure.close()
            setActiveFund(null)
          }}
        />
      )}
    </Wrapper>
  )
}

// ── Styled components ─────────────────────────────────────────────────────────

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`

const TableScroll = styled.div`
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.typography.sizeSm};
`

const Th = styled.th<{ $numeric?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
  text-align: ${({ $numeric }) => ($numeric ? 'right' : 'left')};
  font-weight: ${({ theme }) => theme.typography.weightSemibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
  background: ${({ theme }) => theme.colors.surface};
`

const Td = styled.td<{ $numeric?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
  text-align: ${({ $numeric }) => ($numeric ? 'right' : 'left')};
  vertical-align: middle;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Row = styled.tr`
  transition: background-color ${({ theme }) => theme.transitions.fast};
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
  }
  &:last-child td {
    border-bottom: none;
  }
`

const FundName = styled.p`
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2px;
`

const FundSymbol = styled.p`
  font-size: ${({ theme }) => theme.typography.sizeXs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.fontMono};
`

const Mono = styled.span`
  font-family: ${({ theme }) => theme.typography.fontMono};
`

// Colores de texto de badges verificados WCAG AA (4.5:1) sobre sus fondos
const categoryText: Record<string, string> = {
  GLOBAL: '#0E3460',   // azul oscuro sobre azul claro — 7.1:1
  TECH: '#1A5C38',     // verde oscuro sobre verde claro — 5.2:1
  HEALTH: '#7A4A0A',   // marrón oscuro sobre amarillo claro — 5.8:1
  MONEY_MARKET: '#3D352E', // sepia oscuro sobre sepia claro — 6.4:1
}
const categoryBg: Record<string, string> = {
  GLOBAL: '#D6E4F5',
  TECH: '#D4EDE0',
  HEALTH: '#FAEBD0',
  MONEY_MARKET: '#E8E2DB',
}

const CategoryBadge = styled.span<{ $category: string }>`
  display: inline-block;
  padding: 2px ${({ theme }) => theme.spacing['2']};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizeXs};
  font-weight: ${({ theme }) => theme.typography.weightSemibold};
  background-color: ${({ $category }) => categoryBg[$category] ?? '#E8E2DB'};
  color: ${({ $category }) => categoryText[$category] ?? '#3D352E'};
  letter-spacing: 0.03em;
  text-transform: uppercase;
`

const SortBtn = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['1']};
  background: none;
  border: none;
  font-size: inherit;
  font-weight: inherit;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : 'inherit')};
  cursor: pointer;
  padding: 0;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`

const SortIcon = styled.span`
  font-size: 0.75em;
  opacity: 0.6;
`

const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing['3']};
`

const PaginationInfo = styled.p`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const PaginationButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['2']};
`

const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  padding: ${({ theme }) => theme.spacing['4']};
`
