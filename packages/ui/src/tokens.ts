/**
 * Design tokens for Keep Playing.
 *
 * Synthesis of AhTohMoh's website taste and Piqabu's app taste:
 *
 *   - Monochrome. Brightness encodes meaning. No chromatic accent.
 *   - Cream ink (#F5F3EB) over near-black paper. Warmer than pure #fff on #000.
 *   - Layered paper for depth (bg / paper / paper2 — Piqabu's vocabulary).
 *   - Hairline edges AND dashed edges (Piqabu draft/active texture).
 *   - Generous radius (22) on cards; hairline frames stay square.
 *   - Three type families: Bricolage Grotesque (voice), Cormorant Garamond
 *     italic (editorial), Ink Free (signature), Space Mono (metadata/status).
 *   - Code-editor sensibilities: monospaced labels for time, IDs, counts.
 */

export const tokens = {
  colors: {
    // Layered paper (Piqabu): bg sits behind, paper is the surface, paper2 is
    // the lift. All three are near-black variants.
    bg: '#060709',
    paper: '#0F1114',
    paper2: '#0B0D10',

    // Cream ink — Piqabu's #F5F3EB at varying opacities. Warmer than #fff.
    ink: 'rgba(245, 243, 235, 0.92)',
    'ink-strong': 'rgba(245, 243, 235, 1.0)',
    muted: 'rgba(245, 243, 235, 0.62)',
    'muted-strong': 'rgba(245, 243, 235, 0.78)',
    faint: 'rgba(245, 243, 235, 0.38)',

    // Edges (Piqabu vocabulary). Hairlines remain the primary border idiom.
    edge: 'rgba(245, 243, 235, 0.10)',
    'edge-soft': 'rgba(245, 243, 235, 0.06)',
    hairline: 'rgba(245, 243, 235, 0.18)',
    'hairline-strong': 'rgba(245, 243, 235, 0.42)',

    // Accent is ink itself — meaning carried by brightness, not hue.
    accent: 'rgba(245, 243, 235, 0.92)',

    // Frame surface — translucent paper for the AhTohMoh frame primitive.
    'frame-bg': 'rgba(0, 0, 0, 0.35)',
    // Glass surface — Piqabu LiveGlassPanel style: a lifted paper.
    'glass-bg': 'rgba(15, 17, 20, 0.72)',

    // Functional states — quiet, brightness-encoded.
    live: 'rgba(245, 243, 235, 0.85)',
    success: 'rgba(245, 243, 235, 0.92)',
    warning: 'rgba(245, 243, 235, 0.62)',
    danger: 'rgba(245, 243, 235, 0.62)',
    info: 'rgba(245, 243, 235, 0.92)',
  },
  fonts: {
    sans: '"Bricolage Grotesque", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    serif: '"Cormorant Garamond", Georgia, serif',
    ink: '"Ink Free", "Bradley Hand", cursive',
    mono: '"Space Mono", ui-monospace, SFMono-Regular, "JetBrains Mono", monospace',
  },
  fontSizes: {
    xs: '0.6875rem',
    sm: '0.8125rem',
    base: '0.875rem',
    lg: '1rem',
    xl: '1.125rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': 'clamp(28px, 3vw, 44px)',
    '5xl': 'clamp(34px, 3.6vw, 56px)',
  },
  tracking: {
    eyebrow: '0.22em',
    'eyebrow-wide': '0.28em',
    pencil: '0.18em',
  },
  radii: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '8px',
    '2xl': '16px',
    glass: '22px', // Piqabu radius
    full: '9999px',
  },
  shadows: {
    sm: 'none',
    md: '0 8px 18px -2px rgb(0 0 0 / 0.45)',
    lg: '0 16px 40px -6px rgb(0 0 0 / 0.6)',
  },
  spacing: {
    gap: 'clamp(10px, 1vw, 16px)',
    pad: 'clamp(18px, 2vw, 32px)',
  },
  motion: {
    instant: '120ms',
    quick: '180ms',
    base: '320ms',
    slow: '550ms',
    breathe: '2600ms',
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      emphasized: 'cubic-bezier(0.2, 0, 0, 1.05)',
      breathe: 'ease-in-out',
    },
  },
} as const;

export type Tokens = typeof tokens;
