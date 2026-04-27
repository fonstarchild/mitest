import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to { transform: rotate(360deg); }
`

export const Spinner = styled.span.attrs({ role: 'status', 'aria-label': 'Cargando' })`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2.5px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`

export const SpinnerOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['12']};
  width: 100%;
`
