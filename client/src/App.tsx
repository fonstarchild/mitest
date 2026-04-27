import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'styled-components'
import styled from 'styled-components'
import { theme } from './styles/theme'
import { GlobalStyle } from './styles/global'
import { ToastProvider } from './components/Toast'
import { FundsTable } from './features/funds/FundsTable'
import { PortfolioView } from './features/portfolio/PortfolioView'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

type View = 'funds' | 'portfolio'

function AppShell() {
  const [view, setView] = useState<View>('funds')

  return (
    <Layout>
      <Header>
        <HeaderInner>
          <Logo aria-label="MyInvestor">
            <LogoMark aria-hidden="true">◈</LogoMark>
            <LogoText>MyInvestor</LogoText>
          </Logo>
          <Nav aria-label="Navegación principal">
            <NavButton
              type="button"
              $active={view === 'funds'}
              onClick={() => setView('funds')}
              aria-current={view === 'funds' ? 'page' : undefined}
            >
              Fondos
            </NavButton>
            <NavButton
              type="button"
              $active={view === 'portfolio'}
              onClick={() => setView('portfolio')}
              aria-current={view === 'portfolio' ? 'page' : undefined}
            >
              Mi cartera
            </NavButton>
          </Nav>
        </HeaderInner>
      </Header>

      <Main>
        <Container>
          {view === 'funds' && (
            <>
              <PageHeader>
                <PageTitle>Fondos de inversión</PageTitle>
                <PageSubtitle>Explora y compra fondos disponibles en nuestra plataforma</PageSubtitle>
              </PageHeader>
              <FundsTable />
            </>
          )}
          {view === 'portfolio' && (
            <>
              <PageHeader>
                <PageTitle>Mi cartera</PageTitle>
                <PageSubtitle>Gestiona tus posiciones, vende o traspasa fondos</PageSubtitle>
              </PageHeader>
              <PortfolioView />
            </>
          )}
        </Container>
      </Main>

      <Footer>
        <FooterInner>
          <FooterText>fon workshop 2026</FooterText>
        </FooterInner>
      </Footer>
    </Layout>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// ── Styled components ─────────────────────────────────────────────────────────

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
`

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

const HeaderInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing['6']};
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing['6']};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 ${({ theme }) => theme.spacing['4']};
  }
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2']};
`

const LogoMark = styled.span`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1;
`

const LogoText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontDisplay};
  font-size: ${({ theme }) => theme.typography.sizeXl};
  font-weight: ${({ theme }) => theme.typography.weightBold};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: -0.02em;
`

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
`

const NavButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => `${theme.spacing['2']} ${theme.spacing['4']}`};
  font-size: ${({ theme }) => theme.typography.sizeSm};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryLight : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const Main = styled.main`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing['8']} 0`};
`

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing['6']};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 ${({ theme }) => theme.spacing['4']};
  }
`

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['6']};
`

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.size2xl};
  font-weight: ${({ theme }) => theme.typography.weightBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing['1']};
`

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Footer = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  margin-top: auto;
`

const FooterInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing['4']} ${theme.spacing['6']}`};
`

const FooterText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizeXs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-style: italic;
`
