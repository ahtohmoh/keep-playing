import type { Config } from 'tailwindcss';
import { tokens } from './tokens';

const preset = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        // Paper layers
        bg: tokens.colors.bg,
        paper: tokens.colors.paper,
        paper2: tokens.colors.paper2,

        // Ink ladder
        ink: tokens.colors.ink,
        'ink-strong': tokens.colors['ink-strong'],
        'muted-strong': tokens.colors['muted-strong'],
        muted: tokens.colors.muted,
        faint: tokens.colors.faint,

        // Edges
        edge: tokens.colors.edge,
        'edge-soft': tokens.colors['edge-soft'],
        hairline: tokens.colors.hairline,
        'hairline-strong': tokens.colors['hairline-strong'],

        accent: tokens.colors.accent,
        'frame-bg': tokens.colors['frame-bg'],
        'glass-bg': tokens.colors['glass-bg'],

        live: tokens.colors.live,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        danger: tokens.colors.danger,
        info: tokens.colors.info,
      },
      fontFamily: {
        sans: tokens.fonts.sans.split(/,\s*/),
        serif: tokens.fonts.serif.split(/,\s*/),
        ink: tokens.fonts.ink.split(/,\s*/),
        mono: tokens.fonts.mono.split(/,\s*/),
      },
      fontSize: tokens.fontSizes,
      letterSpacing: {
        eyebrow: tokens.tracking.eyebrow,
        'eyebrow-wide': tokens.tracking['eyebrow-wide'],
        pencil: tokens.tracking.pencil,
      },
      borderRadius: tokens.radii,
      borderWidth: {
        hairline: '1px',
        frame: '1.5px',
      },
      backdropBlur: {
        frame: '2px',
        glass: '14px',
        toggle: '6px',
      },
      transitionTimingFunction: {
        standard: tokens.motion.easing.standard,
        emphasized: tokens.motion.easing.emphasized,
        breathe: tokens.motion.easing.breathe,
      },
      transitionDuration: {
        instant: tokens.motion.instant,
        quick: tokens.motion.quick,
        DEFAULT: tokens.motion.base,
        slow: tokens.motion.slow,
      },
      spacing: {
        gap: tokens.spacing.gap,
        pad: tokens.spacing.pad,
      },
      animation: {
        'fade-up': 'fade-up 320ms cubic-bezier(0.2, 0, 0, 1) both',
        breathe: 'breathe 2600ms ease-in-out infinite',
        pulse: 'pulse-dot 1800ms ease-in-out infinite',
        'pulse-loud': 'pulse-loud 1300ms ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.92' },
          '50%': { transform: 'scale(1.04)', opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'pulse-loud': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.18)', opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>;

export default preset;
