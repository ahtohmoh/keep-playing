/**
 * Design tokens for Keep Playing.
 *
 * Dark mode is the default and primary mode. Light mode is Stage 2.
 * Zest yellow accent is Krasumashi's lime ritual, expressed in interface.
 *
 * See build spec §18 for aesthetic constraints. No marketing gradients, no
 * glass morphism, no neon. Generous whitespace. Sentences over icons.
 */

export const tokens = {
  colors: {
    // Core
    background: '#0A0A0A',
    surface: '#141414',
    surfaceElevated: '#1F1F1F',
    foreground: '#F5F5F5',
    foregroundMuted: '#A8A8A8',
    foregroundSubtle: '#6E6E6E',

    // Accent — the zest
    accent: '#E8C547',
    accentMuted: '#A89030',

    // Functional
    success: '#5BB85B',
    warning: '#E89C3D',
    danger: '#D14545',
    info: '#5BA8D1',

    // Borders
    border: '#2A2A2A',
    borderEmphasis: '#3A3A3A',
  },
  fonts: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    serif: 'Fraunces, Newsreader, Georgia, serif',
    mono: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  radii: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  shadows: {
    // Used sparingly — the aesthetic is flat and considered.
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.4)',
    md: '0 4px 12px -2px rgb(0 0 0 / 0.5)',
    lg: '0 12px 32px -4px rgb(0 0 0 / 0.55)',
  },
  motion: {
    quick: '120ms',
    base: '200ms',
    slow: '320ms',
    easing: {
      // Default ease for most transitions — quick, considered.
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      emphasized: 'cubic-bezier(0.2, 0, 0, 1.05)',
    },
  },
} as const;

export type Tokens = typeof tokens;
