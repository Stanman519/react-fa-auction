import { useTheme, useMediaQuery } from "@mui/material";

export function useIsMobile(): boolean {
  const theme = useTheme();
  return !useMediaQuery(theme.breakpoints.up("md"));
}
