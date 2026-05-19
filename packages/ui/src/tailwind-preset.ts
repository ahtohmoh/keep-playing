/**
 * Tailwind preset.
 *
 * Apps consume this preset so the design tokens become Tailwind utility classes:
 *   bg-background, text-foreground, border-border, text-accent, etc.
 */
import type { Config } from 'tailwindcss';
import { tokens } from './tokens';

const preset = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        background: tokens.colors.background,
        surface: tokens.colors.surface,
        'surface-elevated': tokens.colors.surfaceElevated,
        foreground: tokens.colors.foreground,
        'foreground-muted': tokens.colors.foregroundMuted,
        'foreground-subtle': tokens.colors.foregroundSubtle,
        accent: tokens.colors.accent,
        'accent-muted': tokens.colors.accentMuted,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        danger: tokens.colors.danger,
        info: tokens.colors.info,
        border: tokens.colors.border,
        'border-emphasis': tokens.colors.borderEmphasis,
      },
      fontFamily: {
        sans: tokens.fonts.sans.split(', '),
        serif: tokens.fonts.serif.split(', '),
        mono: tokens.fonts.mono.split(', '),
      },
      fontSize: tokens.fontSizes,
      borderRadius: tokens.radii,
      boxShadow: tokens.shadows,
      transitionTimingFunction: {
        standard: tokens.motion.easing.standard,
        emphasized: tokens.motion.easing.emphasized,
      },
      transitionDuration: {
        quick: tokens.motion.quick,
        DEFAULT: tokens.motion.base,
        slow: tokens.motion.slow,
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>;

export default preset;
