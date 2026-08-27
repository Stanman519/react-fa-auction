import { Box } from "@mui/material";
import { terminal as T, fontStacks } from "../../../../theme";
import { PickStatus } from "./pickStatus";

interface ProgressBarProps {
  status: PickStatus;
  /** 0..1 */
  pct: number;
  current: number;
  target: number;
  isOver: boolean;
  isDouble: boolean;
  onPace?: boolean;
}

const statusChip = (
  status: PickStatus,
  onPace?: boolean,
): { label: string; color: string } => {
  if (status === "WIN") return { label: "CLINCHED", color: T.lime };
  if (status === "LOSS") return { label: "BUSTED", color: T.red };
  if (onPace === true) return { label: "ON PACE", color: T.lime };
  if (onPace === false) return { label: "OFF PACE", color: T.red };
  return { label: "", color: T.textMute };
};

const fillColor = (
  status: PickStatus,
  isDouble: boolean,
  onPace?: boolean,
): string => {
  if (status === "WIN") return T.lime;
  if (status === "LOSS") return T.red;
  if (isDouble) return T.amber;
  return onPace === false ? T.redDim : T.limeDim;
};

export const OverUnderProgressBar: React.FC<ProgressBarProps> = ({
  status,
  pct,
  current,
  target,
  isOver,
  isDouble,
  onPace,
}) => {
  const chip = statusChip(status, onPace);
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          fontFamily: fontStacks.mono,
          fontSize: 9,
          letterSpacing: "0.08em",
          color: T.textMute,
          mb: 0.5,
        }}
      >
        <span>{isOver ? "WINS" : "LOSSES"}</span>
        {chip.label && (
          <span style={{ color: chip.color, fontWeight: 700 }}>
            {chip.label}
          </span>
        )}
        <span style={{ color: T.textDim, fontVariantNumeric: "tabular-nums" }}>
          {/* Clamped — overshooting the target reads as a typo, not progress. */}
          {Math.min(current, target)}/{target}
        </span>
      </Box>
      {/* Rail spans exactly the target, so the fill can never overflow the card
          and there's no marker label to clip. */}
      <Box
        sx={{
          position: "relative",
          height: 6,
          width: "100%",
          background: T.line,
          borderRadius: "1px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${pct * 100}%`,
            background: fillColor(status, isDouble, onPace),
            transition: "width 0.3s ease-in-out",
          }}
        />
      </Box>
    </Box>
  );
};

export default OverUnderProgressBar;
