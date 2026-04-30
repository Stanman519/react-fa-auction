import { Box, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dfs } from "../nonAuction/terminal/tokens";
import { submitWin } from "../../redux/actions/LotActions";
import { Lot } from "../../redux/reducers/LotReducer";
import { RootState } from "../../redux/reducers/RootReducer";

export interface ExpirationObj {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

const calculateTimeLeft = (endTime?: Date): ExpirationObj | undefined => {
  if (!endTime) return;
  const now = new Date();
  const utcNow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds(),
  );
  const utcEnd = Date.UTC(
    endTime.getUTCFullYear(),
    endTime.getUTCMonth(),
    endTime.getUTCDate(),
    endTime.getUTCHours(),
    endTime.getUTCMinutes(),
    endTime.getUTCSeconds(),
    now.getUTCMilliseconds(),
  );
  const difference = utcEnd - utcNow;
  if (difference <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60) + 1,
    totalMs: difference,
  };
};

const formatTime = (r: ExpirationObj): string => {
  if (r.days > 0) return `${r.days}d ${r.hours}:${String(r.minutes).padStart(2, "0")}`;
  if (r.hours > 0)
    return `${r.hours}:${String(r.minutes).padStart(2, "0")}:${String(r.seconds).padStart(2, "0")}`;
  return `${r.minutes}:${String(r.seconds).padStart(2, "0")}`;
};

export const Timer = ({
  endTime,
  lot,
  size = "lg",
}: {
  endTime?: Date;
  lot: Lot;
  size?: "sm" | "md" | "lg";
}): JSX.Element => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [remaining, setRemaining] = useState<ExpirationObj | undefined>(() =>
    calculateTimeLeft(endTime),
  );
  const [preventClockTick, setPreventClockTick] = useState(false);
  const { isConnected } = useSelector((state: RootState) => state.signalR);

  useEffect(() => {
    const id = setInterval(() => {
      if (!endTime || preventClockTick) return;
      const next = calculateTimeLeft(endTime);
      setRemaining(next);
      if (next && next.totalMs <= 0 && isConnected && !preventClockTick) {
        setPreventClockTick(true);
        if (lot.bid) dispatch(submitWin(lot.bid));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endTime, preventClockTick, lot, dispatch, isConnected]);

  const fontSize = size === "sm" ? dfs(14) : size === "md" ? dfs(22) : dfs(36);
  const urgent = !!remaining && remaining.totalMs < 60_000 && remaining.totalMs > 0;
  const critical = !!remaining && remaining.totalMs < 10_000 && remaining.totalMs > 0;

  return (
    <Box
      sx={{
        fontFamily: theme.palette.terminal
          ? '"JetBrains Mono", ui-monospace, monospace'
          : "monospace",
        fontWeight: 800,
        fontSize,
        lineHeight: 1,
        color: urgent
          ? theme.palette.error.main
          : theme.palette.text.primary,
        fontVariantNumeric: "tabular-nums",
        animation: critical ? "timerPulse 1s ease-in-out infinite" : "none",
        "@keyframes timerPulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      }}
    >
      {endTime && remaining ? formatTime(remaining) : "—:—"}
    </Box>
  );
};
