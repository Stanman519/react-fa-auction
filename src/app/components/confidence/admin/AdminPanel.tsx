import { Box, SxProps, Theme, Typography } from "@mui/material";

// Shared themed wrapper for admin console panels — replaces the old raw
// `border border-black` / hardcoded white-bg divs so panels pick up the
// active MUI theme (dark "terminal" theme included) instead of clashing with it.
export function AdminPanel({
  title,
  children,
  sx,
}: {
  title?: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        color: "text.primary",
        p: 2,
        mt: 3,
        ...sx,
      }}
    >
      {title && (
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
}
