// Shared design tokens for spacing, colors, radii, and typography.
export const theme = {
  colors: {
    background: '#06070c',
    surface: '#0c0f18',
    panel: '#111627',
    panelAlt: '#0b1020',
    accent: '#62b7ff', // lighter Carolina blue
    accentSoft: '#9cd4ff',
    accentMuted: '#2f7fc0',
    text: '#f7f9fb',
    muted: '#a7b0c2',
    line: 'rgba(255,255,255,0.08)',
    success: '#5dd39e',
    warning: '#f6c453',
    danger: '#e23d3d', // vivid red accent
    white: '#ffffff',
    offWhite: '#f6f7fb',
    slate300: '#cbd5f5',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1f2937',
    slate900: '#0f172a',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  radius: {
    sm: '8px',
    md: '14px',
    lg: '18px',
    pill: '999px',
  },
  shadow: {
    soft: '0 12px 32px rgba(0,0,0,0.25)',
    strong: '0 20px 60px rgba(0,0,0,0.45)',
  },
  layout: {
    maxWidth: '1200px',
    contentWidth: '1080px',
  },
  typography: {
    display: '"Oswald", "Space Grotesk", "Inter", system-ui, -apple-system, sans-serif',
    body: '"Outfit", "Manrope", "Inter", system-ui, -apple-system, sans-serif',
  },
} as const
