import styled, { keyframes, css } from 'styled-components'

const shimmer = keyframes`
  from { background-position: -400px 0; }
  to   { background-position:  400px 0; }
`

const shimmerAnimation = css`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.border} 25%,
    ${({ theme }) => theme.colors.surface} 50%,
    ${({ theme }) => theme.colors.border} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: ${({ theme }) => theme.colors.border};
  }
`

export const Skeleton = styled.span<{ $width?: string; $height?: string; $radius?: string }>`
  display: inline-block;
  width: ${({ $width }) => $width ?? '100%'};
  height: ${({ $height }) => $height ?? '1em'};
  border-radius: ${({ theme, $radius }) => $radius ?? theme.radii.sm};
  ${shimmerAnimation}
`

// Fila de tabla de fondos — imita nombre + símbolo | badge | 5 cols numéricas | acción
export function FundsTableRowSkeleton() {
  return (
    <tr aria-hidden="true">
      <SkeletonTd>
        <Skeleton $width="140px" $height="14px" />
        <Skeleton $width="60px" $height="11px" style={{ marginTop: 4, display: 'block' }} />
      </SkeletonTd>
      <SkeletonTd>
        <Skeleton $width="72px" $height="20px" $radius="9999px" />
      </SkeletonTd>
      <SkeletonTd $numeric>
        <Skeleton $width="72px" $height="14px" />
      </SkeletonTd>
      <SkeletonTd $numeric>
        <Skeleton $width="44px" $height="14px" />
      </SkeletonTd>
      <SkeletonTd $numeric>
        <Skeleton $width="44px" $height="14px" />
      </SkeletonTd>
      <SkeletonTd $numeric>
        <Skeleton $width="44px" $height="14px" />
      </SkeletonTd>
      <SkeletonTd $numeric>
        <Skeleton $width="44px" $height="14px" />
      </SkeletonTd>
      <SkeletonTd />
    </tr>
  )
}

// Fila de cartera — imita icono + nombre + valor + menú
export function PortfolioRowSkeleton() {
  return (
    <PortfolioSkeletonRow aria-hidden="true">
      <Skeleton $width="44px" $height="44px" $radius="9999px" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton $width="160px" $height="14px" />
        <Skeleton $width="100px" $height="12px" />
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <Skeleton $width="80px" $height="16px" />
      </div>
      <Skeleton $width="28px" $height="28px" $radius="8px" style={{ flexShrink: 0 }} />
    </PortfolioSkeletonRow>
  )
}

const SkeletonTd = styled.td<{ $numeric?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
  text-align: ${({ $numeric }) => ($numeric ? 'right' : 'left')};
  vertical-align: middle;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const PortfolioSkeletonRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['4']};
  padding: ${({ theme }) => `${theme.spacing['4']} ${theme.spacing['3']}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`
