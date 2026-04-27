export const theme = {
  colors: {
    // Blancos y fondos — cal y yeso andaluz
    white: '#FAFAF7',
    surface: '#F5F3EE',
    surfaceRaised: '#FFFFFF',
    border: '#E2DDD5',
    borderStrong: '#C8C1B5',

    // Azul Albaicín — azulejos sevillanos
    primary: '#1A4F8A',
    primaryHover: '#15407A',
    primaryLight: '#EBF1FA',
    primaryMid: '#4A7BB5',

    // Terracota / almagra — tierra roja de Ronda
    danger: '#C0392B',
    dangerLight: '#FBEAE8',
    dangerHover: '#A93226',

    // Amarillo albero — arena de la Giralda
    warning: '#C9842A',
    warningLight: '#FDF3E3',

    // Verde aceituna — olivares de Jaén
    success: '#2E7D52',
    successLight: '#E8F5EE',

    // Texto
    textPrimary: '#1A1714',
    textSecondary: '#6B6259',
    textDisabled: '#A89F96',
    textInverse: '#FAFAF7',
  },

  typography: {
    fontDisplay: "'Lora', Georgia, serif",
    fontBody: "'Inter', system-ui, sans-serif",
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",

    sizeXs: '0.75rem',
    sizeSm: '0.875rem',
    sizeMd: '1rem',
    sizeLg: '1.125rem',
    sizeXl: '1.25rem',
    size2xl: '1.5rem',
    size3xl: '1.875rem',

    weightRegular: 400,
    weightMedium: 500,
    weightSemibold: 600,
    weightBold: 700,

    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
  },

  spacing: {
    px: '1px',
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
  },

  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 3px rgba(26, 23, 20, 0.08)',
    md: '0 4px 12px rgba(26, 23, 20, 0.10)',
    lg: '0 8px 24px rgba(26, 23, 20, 0.14)',
    // Sombra con toque cálido, como sombra en cal blanca
    warm: '0 4px 16px rgba(192, 57, 43, 0.08)',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '400ms ease',
  },
} as const

export type Theme = typeof theme
