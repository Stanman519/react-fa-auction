import { ThemeOptions } from "@mui/material/styles";
import { createTheme } from "@mui/material";


export const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#255828',
    },
    secondary: {
      main: '#c34820',
    },
    background: {
      default: '#efefef',
      paper: '#f7f7f7',
    },
    text: {
      primary: 'rgba(16,16,16,0.87)',
      secondary: 'rgba(0,0,0,0.54)',
    },
    error: {
      main: '#ff2d2d',
    },
  },
  typography: {
    h1: {
      fontSize: '6rem',
      margin: '0px'
    },
    h2: {
      fontSize: '3.5rem',
      margin: '0px'
    },
    h3: {
      fontSize: '3rem',
      margin: '0px'
    },
    h4: {
      fontSize: '2.1rem',
      margin: '0px'
    },
    h6: {
      fontSize: '1.2rem',
      margin: '0px'
    },
  },
};


export const theme = createTheme(themeOptions);
  