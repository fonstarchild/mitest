import { useRef, useEffect, useState, type ReactNode } from 'react'
import styled from 'styled-components'

type MenuItem = {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
}

type Props = {
  items: MenuItem[]
  triggerLabel: string
}

export function ActionsMenu({ items, triggerLabel }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <Container ref={containerRef}>
      <Trigger
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Dot /><Dot /><Dot />
      </Trigger>
      {open && (
        <Menu role="menu">
          {items.map((item) => (
            <MenuItem
              key={item.label}
              role="menuitem"
              $variant={item.variant ?? 'default'}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  display: inline-flex;
`

const Trigger = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: ${({ theme }) => theme.spacing['2']};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.primary};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const Dot = styled.span`
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: currentColor;
`

const Menu = styled.ul`
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 50;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  min-width: 180px;
  list-style: none;
  padding: ${({ theme }) => theme.spacing['2']} 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const MenuItem = styled.li<{ $variant: 'default' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['5']}`};
  font-size: ${({ theme }) => theme.typography.sizeMd};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  color: ${({ theme, $variant }) =>
    $variant === 'danger' ? theme.colors.danger : theme.colors.primary};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme, $variant }) =>
      $variant === 'danger' ? theme.colors.dangerLight : theme.colors.primaryLight};
  }
`
