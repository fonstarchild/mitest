import { useEffect, useRef, useState, type ReactNode } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { Button } from './Button'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  'aria-label'?: string
}

const ANIMATION_MS = 220

export function Dialog({ isOpen, onClose, title, children, 'aria-label': ariaLabel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  // `visible` se mantiene true durante la animación de salida
  const [visible, setVisible] = useState(isOpen)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (isOpen) {
      setVisible(true)
      if (!dialog.open) dialog.showModal()
    } else {
      // Dejar que la animación de salida termine antes de cerrar el nativo
      const timer = setTimeout(() => {
        if (dialog.open) dialog.close()
        setVisible(false)
      }, ANIMATION_MS)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handler = () => onClose()
    dialog.addEventListener('close', handler)
    return () => dialog.removeEventListener('close', handler)
  }, [onClose])

  if (!visible) return null

  return (
    <StyledDialog
      ref={ref}
      aria-label={ariaLabel ?? title}
      aria-modal="true"
      $closing={!isOpen}
    >
      <Header>
        <Title>{title}</Title>
        <CloseButton
          type="button"
          aria-label="Cerrar diálogo"
          onClick={onClose}
          variant="ghost"
          size="sm"
        >
          ✕
        </CloseButton>
      </Header>
      <Body>{children}</Body>
    </StyledDialog>
  )
}

// ── Animaciones ───────────────────────────────────────────────────────────────

const fadeScaleIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`

const fadeScaleOut = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
`

const backdropIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const backdropOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`

// ── Styled components ─────────────────────────────────────────────────────────

const StyledDialog = styled.dialog<{ $closing: boolean }>`
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-width: min(90vw, 480px);
  width: 100%;
  background: ${({ theme }) => theme.colors.surfaceRaised};

  /* Centrado absoluto — anula el posicionamiento por defecto del navegador */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;

  /* Animación entrada / salida */
  animation: ${({ $closing }) =>
    $closing
      ? css`${fadeScaleOut} ${ANIMATION_MS}ms ease forwards`
      : css`${fadeScaleIn} ${ANIMATION_MS}ms ease forwards`};

  &::backdrop {
    background-color: rgba(26, 23, 20, 0.5);
    backdrop-filter: blur(2px);
    animation: ${({ $closing }) =>
      $closing
        ? css`${backdropOut} ${ANIMATION_MS}ms ease forwards`
        : css`${backdropIn} ${ANIMATION_MS}ms ease forwards`};
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing['5']} ${theme.spacing['6']}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Title = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontDisplay};
  font-size: ${({ theme }) => theme.typography.sizeXl};
  font-weight: ${({ theme }) => theme.typography.weightSemibold};
  color: ${({ theme }) => theme.colors.textPrimary};
`

const CloseButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing['1']};
  min-width: 32px;
  min-height: 32px;
`

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing['6']};
`
