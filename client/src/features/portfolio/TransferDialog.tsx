import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import { Dialog } from '@/components/Dialog'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Button } from '@/components/Button'
import { useToast } from '@/components/Toast'
import { transferFund } from '@/api/funds'
import type { PortfolioItem } from '@/types'

type Props = {
  item: PortfolioItem
  portfolioItems: PortfolioItem[]
  isOpen: boolean
  onClose: () => void
  onSuccess?: (amount: number, destFundName: string) => void
}

const fmtCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)

export function TransferDialog({ item, portfolioItems, isOpen, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const selectId = useId()

  const destinations = portfolioItems.filter((p) => p.id !== item.id)

  const schema = z.object({
    toFundId: z.string().min(1, 'Selecciona un fondo destino'),
    amount: z
      .number({ invalid_type_error: 'Introduce un importe válido' })
      .positive('El importe debe ser mayor que 0')
      .max(
        item.totalValue.amount,
        `No puedes traspasar más de ${fmtCurrency(item.totalValue.amount, item.totalValue.currency)}`
      ),
  })

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<{ toFundId: string; amount: number }>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const mutation = useMutation({
    mutationFn: ({ toFundId, amount }: { toFundId: string; amount: number }) => {
      const unitValue = item.totalValue.amount / item.quantity
      const units = amount / unitValue
      return transferFund(item.id, toFundId, units)
    },
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      const destName = portfolioItems.find((p) => p.id === vars.toFundId)?.name ?? 'destino'
      toast.show({ type: 'success', message: `Traspaso de ${item.name} a ${destName} completado` })
      onSuccess?.(vars.amount, destName)
      reset()
      onClose()
    },
    onError: (err: Error) => {
      setServerError(err.message)
      toast.show({ type: 'error', message: err.message })
    },
  })

  const handleClose = () => {
    reset()
    setServerError(null)
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title={`Traspasar · ${item.name}`} aria-label="Traspasar fondo">
      <form
        onSubmit={handleSubmit((data) => {
          setServerError(null)
          mutation.mutate(data)
        })}
        noValidate
      >
        <PositionInfo>
          <InfoRow>
            <InfoLabel>Posición actual</InfoLabel>
            <InfoValue>{fmtCurrency(item.totalValue.amount, item.totalValue.currency)}</InfoValue>
          </InfoRow>
        </PositionInfo>

        <FieldWrapper>
          <SelectLabel htmlFor={selectId}>Fondo destino</SelectLabel>
          <Select
            id={selectId}
            {...register('toFundId')}
            aria-invalid={!!errors.toFundId}
            $hasError={!!errors.toFundId}
          >
            <option value="">Selecciona un fondo…</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          {errors.toFundId && (
            <ErrorText role="alert">{errors.toFundId.message}</ErrorText>
          )}
        </FieldWrapper>

        <FieldWrapper>
          <CurrencyInput
            label="Importe a traspasar"
            name="amount"
            max={item.totalValue.amount}
            error={errors.amount?.message}
            onValueChange={(val) => setValue('amount', val, { shouldValidate: true })}
          />
        </FieldWrapper>

        {serverError && <ServerError role="alert">{serverError}</ServerError>}

        <Actions>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? 'Procesando…' : 'Confirmar traspaso'}
          </Button>
        </Actions>
      </form>
    </Dialog>
  )
}

const PositionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2']};
  padding: ${({ theme }) => theme.spacing['4']};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing['5']};
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
`

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const InfoValue = styled.span`
  font-weight: ${({ theme }) => theme.typography.weightSemibold};
  font-family: ${({ theme }) => theme.typography.fontMono};
`

const FieldWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['5']};
`

const SelectLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizeSm};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing['1']};
`

const Select = styled.select<{ $hasError: boolean }>`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
  border: 1.5px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizeMd};
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const ErrorText = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.danger};
  margin-top: ${({ theme }) => theme.spacing['1']};
`

const ServerError = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.sizeSm};
  margin-bottom: ${({ theme }) => theme.spacing['4']};
`

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['3']};
  justify-content: flex-end;
`
