import {
  alpha,
  PaletteOptions,
  responsiveFontSizes,
  ThemeOptions,
} from "@mui/material/styles";
import { createTheme } from "@mui/material";

// Terminal design tokens — from design_handoff_terminal/shared/direction-a.jsx `const A`.
// Use via theme.palette.terminal.<token>. Values final; do not tweak without design sign-off.
export const terminal = {
  bg: "#0a0d10",
  panel: "#11161b",
  panel2: "#161c22",
  line: "rgba(255,255,255,0.06)",
  lineBold: "rgba(255,255,255,0.10)",
  text: "rgba(255,255,255,0.92)",
  textDim: "rgba(255,255,255,0.56)",
  textMute: "rgba(255,255,255,0.36)",
  lime: "oklch(0.85 0.18 130)",
  limeDim: "oklch(0.85 0.18 130 / 0.18)",
  red: "oklch(0.68 0.19 25)",
  redDim: "oklch(0.68 0.19 25 / 0.18)",
  amber: "oklch(0.80 0.16 75)",
} as const;

export const fontStacks = {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

export type TerminalPalette = typeof terminal;

declare module "@mui/material/styles" {
  interface Theme {
    extras: {
      slabBackground: string;
    };
  }
  interface Palette {
    green: Palette["primary"];
    terminal: TerminalPalette;
  }
  interface PaletteOptions {
    green?: PaletteOptions["primary"];
    terminal?: TerminalPalette;
  }

  interface ThemeOptions {
    extras?: {
      slabBackground?: string;
    };
  }

  interface TypographyVariants {
    mono: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    mono?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    mono: true;
  }
}

const greenBase = "#0d7511";

// Legacy (pre-terminal) theme — kept intact for gated rollout.
const legacyThemeOptions: ThemeOptions = {
  extras: {
    slabBackground: "#8E8D8A",
  },
  palette: {
    background: {
      default: "#F0F2F5",
      paper: "white",
    },
    primary: {
      main: "#2F4454",
      light: "#4F5565",
      dark: "#1E3343",
    },
    secondary: {
      main: "#53900F",
    },
    text: {
      primary: "rgba(16,16,16,0.87)",
      secondary: "rgba(0,0,0,0.54)",
    },
    error: {
      main: "#ff2d2d",
    },
    green: {
      main: greenBase,
      light: alpha(greenBase, 0.5),
      dark: "#0c5e0f",
    },
    terminal,
  },
  typography: {
    h1: { fontSize: "6rem", margin: "0px" },
    h2: { fontSize: "3.5rem", margin: "0px" },
    h3: { fontSize: "3rem", margin: "0px" },
    h4: { fontSize: "2.1rem", margin: "0px" },
    h6: { fontSize: "1.2rem", margin: "0px" },
    mono: {
      fontFamily: fontStacks.mono,
      fontVariantNumeric: "tabular-nums",
    },
  },
};

// Hex approximations of the oklch accents. Needed because MUI's colorManipulator
// (lighten/darken/augmentColor) doesn't parse oklch() strings. Use these for palette
// slots; continue to use the raw oklch tokens (terminal.lime/red/amber) in `sx` /
// CSS, which browsers render natively.
const terminalHex = {
  lime: "#c3e846", // ≈ oklch(0.85 0.18 130)
  red: "#e25b40", // ≈ oklch(0.68 0.19 25)
  amber: "#e0a642", // ≈ oklch(0.80 0.16 75)
} as const;

// Terminal (Bloomberg-style) theme — dark, Inter + JetBrains Mono.
const terminalThemeOptions: ThemeOptions = {
  extras: {
    slabBackground: terminal.panel2,
  },
  palette: {
    mode: "dark",
    background: {
      default: terminal.bg,
      paper: terminal.panel,
    },
    primary: {
      main: terminalHex.lime,
      contrastText: "#000",
    },
    secondary: {
      main: terminalHex.amber,
    },
    error: {
      main: terminalHex.red,
    },
    text: {
      primary: terminal.text,
      secondary: terminal.textDim,
      disabled: terminal.textMute,
    },
    divider: terminal.line,
    green: {
      main: greenBase,
      light: alpha(greenBase, 0.5),
      dark: "#0c5e0f",
    },
    terminal,
  },
  typography: {
    fontFamily: fontStacks.sans,
    h1: { fontSize: "6rem", margin: "0px" },
    h2: { fontSize: "3.5rem", margin: "0px" },
    h3: { fontSize: "3rem", margin: "0px" },
    h4: { fontSize: "2.1rem", margin: "0px" },
    h6: { fontSize: "1.2rem", margin: "0px" },
    mono: {
      fontFamily: fontStacks.mono,
      fontVariantNumeric: "tabular-nums",
    },
  },
  shape: {
    borderRadius: 3,
  },
};

// Feature flag — flip to terminal theme when REACT_APP_TERMINAL_UI=1.
// Default: legacy. PR 2+ will migrate components; each can check the flag itself if needed.
export const TERMINAL_UI_ENABLED = process.env.REACT_APP_TERMINAL_UI === "1";

const baseOptions: ThemeOptions = TERMINAL_UI_ENABLED
  ? terminalThemeOptions
  : legacyThemeOptions;

let theme = createTheme(baseOptions);
theme = createTheme(theme, {
  palette: {
    salmon: theme.palette.augmentColor({
      color: { main: "#e04726" },
      name: "salmon",
    }),
  },
});
export const myTheme = responsiveFontSizes(theme);
