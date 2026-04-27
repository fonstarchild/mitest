import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import { Dialog } from '@/components/Dialog'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Button } from '@/components/Button'
import { useToast } from '@/components/Toast'
import { sellFund } from '@/api/funds'
import type { PortfolioItem } from '@/types'

type Props = {
  item: PortfolioItem
  isOpen: boolean
  onClose: () => void
}

const fmtCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)

export function SellDialog({ item, isOpen, onClose }: Props) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = z.object({
    amount: z
      .number({ invalid_type_error: 'Introduce un importe válido' })
      .positive('El importe debe ser mayor que 0')
      .max(
        item.totalValue.amount,
        `No puedes vender más de ${fmtCurrency(item.totalValue.amount, item.totalValue.currency)}`
      ),
  })

  const {
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<{ amount: number }>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const mutation = useMutation({
    mutationFn: (amount: number) => {
      const unitValue = item.totalValue.amount / item.quantity
      const units = amount / unitValue
      return sellFund(item.id, units)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      toast.show({ type: 'success', message: `Venta de ${item.name} realizada con éxito` })
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
    <Dialog isOpen={isOpen} onClose={handleClose} title={`Vender · ${item.name}`} aria-label="Vender fondo">
      <form
        onSubmit={handleSubmit((data) => {
          setServerError(null)
          mutation.mutate(data.amount)
        })}
        noValidate
      >
        <PositionInfo>
          <InfoRow>
            <InfoLabel>Posición actual</InfoLabel>
            <InfoValue>{fmtCurrency(item.totalValue.amount, item.totalValue.currency)}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Participaciones</InfoLabel>
            <InfoValue>{item.quantity}</InfoValue>
          </InfoRow>
        </PositionInfo>

        <FieldWrapper>
          <CurrencyInput
            label="Importe a vender"
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
          <Button type="submit" variant="danger" disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? 'Procesando…' : 'Confirmar venta'}
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
