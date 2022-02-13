import { createTheme } from "@mui/material";
import { deepOrange } from "@mui/material/colors";


const ryTheme = createTheme({
    palette: {
        primary: {
            light: '#39796b',
            main: '#004d40',
            dark: '#00251a',
            contrastText: '#fff',
        },
        secondary: {
            light: '#439889',
            main: '#00695c',
            dark: '#003d33',
            contrastText: '#000',
        },
        warning: {
            main: deepOrange[500],
        },
        // TODO Bruno: what about accent? should be blue-grey 500,900
    },
    typography: {
        // dangerous: lets you modify typography for all variants (h1, h2, h3, etc)
        // allVariants: {
        //     color: '#fff',
        // }
        fontFamily: 'Roboto',
        // body2: {
        //     color: '#fff'
        // }
    }
});

export const MaterialStyleSvc = { ryTheme }
