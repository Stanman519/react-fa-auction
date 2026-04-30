import { Box, BoxProps } from "@mui/material";
import { A } from "./tokens";

interface TPanelProps extends BoxProps {
  nested?: boolean;
  bordered?: boolean;
}

export default function TPanel({ nested, bordered = true, sx, children, ...rest }: TPanelProps) {
  return (
    <Box
      {...rest}
      sx={{
        background: nested ? A.panel2 : A.panel,
        border: bordered ? `1px solid ${A.line}` : "none",
        borderRadius: "3px",
        p: { xs: "14px", md: "18px" },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
