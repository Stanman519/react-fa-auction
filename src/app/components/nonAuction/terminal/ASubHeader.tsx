import React from "react";
import { Box } from "@mui/material";
import { A, dfs } from "./tokens";

interface Props {
  title: string;
  sub?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export default function ASubHeader({ title, sub, onBack, action }: Props) {
  return (
    <Box
      sx={{
        px: "12px",
        py: "10px",
        background: A.panel,
        borderBottom: `1px solid ${A.lineBold}`,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexShrink: 0,
      }}
    >
      {onBack && (
        <Box
          component="span"
          onClick={onBack}
          sx={{
            color: A.textDim,
            fontFamily: A.mono,
            fontSize: dfs(18),
            cursor: "pointer",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          ‹
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            fontSize: dfs(14),
            color: A.text,
            fontWeight: 700,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Box>
        {sub && (
          <Box
            sx={{
              fontSize: dfs(9),
              color: A.textMute,
              fontFamily: A.mono,
              letterSpacing: "0.08em",
              mt: "2px",
            }}
          >
            {sub}
          </Box>
        )}
      </Box>
      {action}
    </Box>
  );
}
