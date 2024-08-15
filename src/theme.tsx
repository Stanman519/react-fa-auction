import {
  alpha,
  getContrastRatio,
  PaletteOptions,
  responsiveFontSizes,
  ThemeOptions,
} from "@mui/material/styles";
import { createTheme } from "@mui/material";

declare module "@mui/material/styles" {
  interface Theme {
    extras: {
      slabBackground: string;
    };
  }
  interface Palette {
    green: Palette["primary"];
  }
  interface PaletteOptions {
    green?: PaletteOptions["primary"];
  }

  interface ThemeOptions {
    extras?: {
      slabBackground?: string;
    };
  }
}
const greenBase = "#0d7511";
const greenMain = alpha(greenBase, 0.8);
export const themeOptions: ThemeOptions = {
  extras: {
    slabBackground: "#8E8D8A",
  },
  palette: {
    background: {
      default: "#E3E2DF",
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
      //contrastText: getContrastRatio(greenMain, "#fff") > 4.5 ? "#fff" : "#111",
    },
  },
  typography: {
    h1: {
      fontSize: "6rem",
      margin: "0px",
    },
    h2: {
      fontSize: "3.5rem",
      margin: "0px",
    },
    h3: {
      fontSize: "3rem",
      margin: "0px",
    },
    h4: {
      fontSize: "2.1rem",
      margin: "0px",
    },
    h6: {
      fontSize: "1.2rem",
      margin: "0px",
    },
  },
};

let theme = createTheme(themeOptions);
theme = createTheme(theme, {
  // Custom colors created with augmentColor go here
  palette: {
    salmon: theme.palette.augmentColor({
      color: {
        main: "#e04726",
      },
      name: "salmon",
    }),
  },
});
export const myTheme = responsiveFontSizes(theme);
