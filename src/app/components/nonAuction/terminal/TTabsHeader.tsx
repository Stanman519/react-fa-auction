import { Box } from "@mui/material";
import { A, dfs } from "./tokens";
import { DashboardTab } from "../DashboardTabNav";

export default function TTabsHeader({
  tabs,
  currentValue,
  onChange,
}: {
  tabs: DashboardTab[];
  currentValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        background: A.panel,
        borderBottom: `1px solid ${A.lineBold}`,
        padding: "0 20px",
        gap: "2px",
        overflowX: "auto",
        position: "sticky",
        top: 64,
        zIndex: 10,
        "&::-webkit-scrollbar": { height: 4 },
        "&::-webkit-scrollbar-thumb": { background: A.lineBold },
      }}
    >
      {tabs.map((t) => {
        const active = t.value === currentValue;
        const labelText =
          t.badge && t.badge > 0 ? `${t.label} · ${t.badge}` : t.label;
        return (
          <Box
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            sx={{
              padding: "12px 14px",
              fontFamily: A.mono,
              fontSize: dfs(11),
              letterSpacing: "0.06em",
              color: active ? A.lime : A.textDim,
              borderBottom: `2px solid ${active ? A.lime : "transparent"}`,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "color 120ms ease",
              "&:hover": { color: active ? A.lime : A.text },
            }}
          >
            {labelText}
          </Box>
        );
      })}
    </Box>
  );
}
