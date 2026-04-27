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
import { buyFund } from '@/api/funds'
import type { Fund } from '@/types'

const schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Introduce un importe válido' })
    .positive('El importe debe ser mayor que 0')
    .max(10000, 'No se pueden realizar compras superiores a 10.000 €'),
})

type FormValues = z.infer<typeof schema>

type Props = {
  fund: Fund
  isOpen: boolean
  onClose: () => void
}

const fmtCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)

export function BuyDialog({ fund, isOpen, onClose }: Props) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const mutation = useMutation({
    mutationFn: (amount: number) => {
      const units = amount / fund.value.amount
      return buyFund(fund.id, units)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      toast.show({ type: 'success', message: `Compra de ${fund.name} realizada con éxito` })
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
    <Dialog isOpen={isOpen} onClose={handleClose} title={`Comprar · ${fund.name}`} aria-label="Comprar fondo">
      <form
        onSubmit={handleSubmit((data) => {
          setServerError(null)
          mutation.mutate(data.amount)
        })}
        noValidate
      >
        <FundInfo>
          <InfoRow>
            <InfoLabel>Valor liquidativo</InfoLabel>
            <InfoValue>{fmtCurrency(fund.value.amount, fund.value.currency)}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Categoría</InfoLabel>
            <InfoValue>{fund.category}</InfoValue>
          </InfoRow>
        </FundInfo>

        <FieldWrapper>
          <CurrencyInput
            label="Importe"
            name="amount"
            max={10000}
            error={errors.amount?.message}
            onValueChange={(val) => {
              setValue('amount', val, { shouldValidate: true })
            }}
          />
        </FieldWrapper>

        {serverError && <ServerError role="alert">{serverError}</ServerError>}

        <Actions>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending ? 'Procesando…' : 'Confirmar compra'}
          </Button>
        </Actions>
      </form>
    </Dialog>
  )
}

const FundInfo = styled.div`
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
  align-items: center;
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
