// Design tokens — shared across FPLogo, LoadingScreen, and menubar.

export const tokens = {
  bg:       '#0a0d10',
  panel:    '#11161b',
  panel2:   '#161c22',
  line:     'rgba(255,255,255,0.06)',
  lineBold: 'rgba(255,255,255,0.10)',
  text:     'rgba(255,255,255,0.92)',
  textDim:  'rgba(255,255,255,0.56)',
  textMute: 'rgba(255,255,255,0.36)',
  lime:     'oklch(0.85 0.18 130)',
  limeDim:  'oklch(0.85 0.18 130 / 0.18)',
  red:      'oklch(0.68 0.19 25)',
  redDim:   'oklch(0.68 0.19 25 / 0.18)',
  amber:    'oklch(0.80 0.16 75)',
  sans:     'Inter, -apple-system, system-ui, sans-serif',
  mono:     '"JetBrains Mono", ui-monospace, monospace',
} as const;

export type Tokens = typeof tokens;
