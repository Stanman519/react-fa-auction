import { terminal, fontStacks } from "../../../../theme";

export const A = {
  ...terminal,
  sans: fontStacks.sans,
  mono: fontStacks.mono,
} as const;

export type AToken = typeof A;

// Flip to 1 to revert all desktop font sizes back to baseline.
export const TERMINAL_FONT_SCALE = 1.2;

// Returns a responsive fontSize: mobile keeps n, desktop scales it up.
export const dfs = (n: number): { xs: number; md: number } => ({
  xs: n,
  md: Math.round(n * TERMINAL_FONT_SCALE),
});
