/**
 * Theme constants — the Keep Playing tokens in React Native form.
 * Mirrors packages/ui/src/tokens.ts (which itself derives from Piqabu's
 * Theme.ts). Same vocabulary on every surface of the practice.
 */

export const THEME = {
  // Layered paper
  bg: '#060709',
  paper: '#0F1114',
  paper2: '#0B0D10',

  // Cream ink ladder
  ink: 'rgba(245, 243, 235, 0.92)',
  inkStrong: 'rgba(245, 243, 235, 1.0)',
  mutedStrong: 'rgba(245, 243, 235, 0.78)',
  muted: 'rgba(245, 243, 235, 0.62)',
  faint: 'rgba(245, 243, 235, 0.38)',

  // Edges
  edge: 'rgba(245, 243, 235, 0.10)',
  edgeSoft: 'rgba(245, 243, 235, 0.06)',
  hairline: 'rgba(245, 243, 235, 0.18)',
  hairlineStrong: 'rgba(245, 243, 235, 0.42)',

  // Live
  live: 'rgba(245, 243, 235, 0.85)',

  // Radius (Piqabu's generous 22)
  r: 22,
  rSm: 8,
} as const;

export const PENCIL = {
  fontFamily: 'SpaceMono',
  textTransform: 'uppercase' as const,
  fontWeight: '700' as const,
  fontSize: 10,
  letterSpacing: 1.8,
  color: THEME.mutedStrong,
};

export const PENCIL_FAINT = {
  ...PENCIL,
  color: THEME.faint,
};

export const DASHED_BORDER = {
  borderWidth: 1,
  borderStyle: 'dashed' as const,
  borderColor: THEME.edge,
};

export const CARD = {
  backgroundColor: THEME.paper2,
  borderWidth: 1,
  borderColor: THEME.edge,
  borderRadius: THEME.rSm,
};
