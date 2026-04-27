import styled, { css } from 'styled-components'

type Variant = 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type Props = {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const sizeStyles = {
  sm: css`
    padding: ${({ theme }) => `${theme.spacing['1']} ${theme.spacing['3']}`};
    font-size: ${({ theme }) => theme.typography.sizeSm};
  `,
  md: css`
    padding: ${({ theme }) => `${theme.spacing['2']} ${theme.spacing['5']}`};
    font-size: ${({ theme }) => theme.typography.sizeMd};
  `,
  lg: css`
    padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['6']}`};
    font-size: ${({ theme }) => theme.typography.sizeLg};
  `,
}

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.textInverse};
    border: none;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryHover};
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 1.5px solid ${({ theme }) => theme.colors.primary};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryLight};
    }
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.textInverse};
    border: none;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.dangerHover};
    }
  `,
}

export const Button = styled.button<Props>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['2']};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.transitions.fast},
    opacity ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  text-decoration: none;

  ${({ size = 'md' }) => sizeStyles[size]}
  ${({ variant = 'primary' }) => variantStyles[variant]}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`
