import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import styled, { keyframes, css } from 'styled-components'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error'

type ToastItem = {
  id: string
  type: ToastType
  message: string
}

type ShowOptions = {
  type: ToastType
  message: string
  /** ms antes de desaparecer. Por defecto 4500 */
  duration?: number
}

type ToastContextValue = {
  show: (options: ShowOptions) => void
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(({ type, message, duration = 4500 }: ShowOptions) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastRegion role="region" aria-label="Notificaciones">
        {toasts.map((t) => (
          <ToastNotification key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </ToastRegion>
    </ToastContext.Provider>
  )
}

// ── Componente individual ─────────────────────────────────────────────────────

function ToastNotification({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: string) => void
}) {
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleDismiss = useCallback(() => {
    setExiting(true)
    timerRef.current = setTimeout(() => onDismiss(toast.id), 280)
  }, [onDismiss, toast.id])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const isError = toast.type === 'error'

  return (
    <ToastEl
      // Semántica de accesibilidad: status (polite) para éxito, alert (assertive) para error
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      $type={toast.type}
      $exiting={exiting}
    >
      <IconWrapper aria-hidden="true">
        {isError ? <ErrorIcon /> : <SuccessIcon />}
      </IconWrapper>
      <Message>{toast.message}</Message>
      <DismissButton
        type="button"
        aria-label="Cerrar notificación"
        onClick={handleDismiss}
      >
        ✕
      </DismissButton>
    </ToastEl>
  )
}

// ── Iconos SVG (esto lo ha tirado la IA, se ven guay) ────────────────────────────────────────────────────────────────

function SuccessIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5.5v4M9 12.5v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

// ── Animaciones ───────────────────────────────────────────────────────────────

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(110%); }
  to   { opacity: 1; transform: translateX(0); }
`

const slideOut = keyframes`
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(110%); }
`

// ── Styled components ─────────────────────────────────────────────────────────

const ToastRegion = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing['6']};
  right: ${({ theme }) => theme.spacing['6']};
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['3']};
  max-width: min(90vw, 380px);
  pointer-events: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    bottom: ${({ theme }) => theme.spacing['4']};
    right: ${({ theme }) => theme.spacing['4']};
    left: ${({ theme }) => theme.spacing['4']};
    max-width: 100%;
  }
`

const ToastEl = styled.div<{ $type: ToastType; $exiting: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => `${theme.spacing['4']} ${theme.spacing['4']}`};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  pointer-events: all;
  min-width: 260px;

  background: ${({ theme, $type }) =>
    $type === 'error' ? theme.colors.dangerLight : theme.colors.successLight};
  border-left: 4px solid ${({ theme, $type }) =>
    $type === 'error' ? theme.colors.danger : theme.colors.success};
  color: ${({ theme, $type }) =>
    $type === 'error' ? theme.colors.danger : theme.colors.success};

  animation: ${({ $exiting }) =>
    $exiting
      ? css`${slideOut} 280ms ease forwards`
      : css`${slideIn} 320ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`};
`

const IconWrapper = styled.span`
  flex-shrink: 0;
  margin-top: 1px;
`

const Message = styled.p`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.sizeSm};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  line-height: ${({ theme }) => theme.typography.lineHeightNormal};
  color: ${({ theme }) => theme.colors.textPrimary};
`

const DismissButton = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover { opacity: 1; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`
