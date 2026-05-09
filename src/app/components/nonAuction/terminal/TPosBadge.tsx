import { Box } from "@mui/material";
import { A, dfs } from "./tokens";
import { POS_COLORS } from "../../../constants/positionColors";

export default function TPosBadge({ pos, color }: { pos: string; color?: string }) {
  const tone = color ?? POS_COLORS[pos.toUpperCase()] ?? A.text;
  return (
    <Box
      component="span"
      sx={{
        fontFamily: A.mono,
        fontSize: dfs(9),
        fontWeight: 700,
        color: tone,
        border: `1px solid ${tone}`,
        borderRadius: "2px",
        padding: "2px 5px",
        letterSpacing: "0.06em",
        minWidth: 32,
        display: "inline-block",
        textAlign: "center",
      }}
    >
      {pos}
    </Box>
  );
}
