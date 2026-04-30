import { Box, BoxProps } from "@mui/material";
import { A, TERMINAL_FONT_SCALE } from "./tokens";

type Tone = "mute" | "dim" | "text" | "lime" | "red" | "amber";

interface TLabelProps extends BoxProps {
  tone?: Tone;
  size?: number;
}

const toneColor: Record<Tone, string> = {
  mute: A.textMute,
  dim: A.textDim,
  text: A.text,
  lime: A.lime,
  red: A.red,
  amber: A.amber,
};

export default function TLabel({ tone = "mute", size = 10, sx, children, ...rest }: TLabelProps) {
  return (
    <Box
      component="span"
      {...rest}
      sx={{
        fontFamily: A.mono,
        fontSize: { xs: size, md: Math.round(size * TERMINAL_FONT_SCALE) },
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: toneColor[tone],
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
