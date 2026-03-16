import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme, useMediaQuery } from "@mui/material";
import React from "react";

export interface DashboardTab {
  label: string;
  value: string;
  /** Show a numeric badge on this tab when > 0 */
  badge?: number;
}

export default function DashboardTabNav({
  onChange,
  tabs,
  currentValue,
}: {
  tabs: DashboardTab[];
  onChange: (value: string) => void;
  currentValue: string;
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
        position: "sticky",
        top: 64,
        zIndex: 10,
      }}
    >
      <Tabs
        variant={isDesktop ? "standard" : "scrollable"}
        scrollButtons="auto"
        allowScrollButtonsMobile
        value={currentValue}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          "& .MuiTab-root": {
            minWidth: { xs: "auto", sm: 120, md: 140 },
            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.875rem" },
            fontWeight: 600,
            letterSpacing: { xs: 0, sm: "0.05em" },
            px: { xs: 1, sm: 2, md: 3 },
          },
        }}
      >
        {tabs.map((t) => (
          <Tab
            key={t.value}
            value={t.value}
            label={
              t.badge && t.badge > 0 ? (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {t.label}
                  <Chip
                    label={t.badge}
                    color="error"
                    size="small"
                    sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 } }}
                  />
                </span>
              ) : (
                t.label
              )
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}
