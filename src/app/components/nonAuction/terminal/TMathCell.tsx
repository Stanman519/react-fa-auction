import { Box } from "@mui/material";
import { A, dfs } from "./tokens";
import TLabel from "./TLabel";

type Tone = "text" | "lime" | "red" | "amber";

const toneColor: Record<Tone, string> = {
  text: A.text,
  lime: A.lime,
  red: A.red,
  amber: A.amber,
};

export default function TMathCell({
  label,
  value,
  tone = "text",
}: {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <Box>
      <TLabel>{label}</TLabel>
      <Box
        sx={{
          fontFamily: A.mono,
          fontSize: dfs(13),
          fontWeight: 700,
          color: toneColor[tone],
          fontVariantNumeric: "tabular-nums",
          mt: "2px",
        }}
      >
        {value}
      </Box>
    </Box>
  );
}
