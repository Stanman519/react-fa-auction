import { Box } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { updateUI } from "../../redux/actions/UiActions";
import { playNotificationSound } from "../../services/SoundUtils";
import { terminal, fontStacks } from "../../../theme";
import { dfs } from "../nonAuction/terminal/tokens";

const DISMISS_MS = 3000;

export const SoldMoment = () => {
  const bid = useSelector((s: RootState) => s.ui.soldMoment);
  const audioOn = useSelector((s: RootState) => s.ui.audioOn);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!bid) return;
    if (audioOn !== false) {
      try {
        playNotificationSound();
      } catch {
        /* noop */
      }
    }
    const t = setTimeout(
      () => dispatch(updateUI({ soldMoment: undefined })),
      DISMISS_MS,
    );
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")
        dispatch(updateUI({ soldMoment: undefined }));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [bid, audioOn, dispatch]);

  if (!bid) return null;
  const player = bid.player;

  return (
    <Box
      onClick={() => dispatch(updateUI({ soldMoment: undefined }))}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(6px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        animation: "soldFadeIn 220ms ease-out",
        "@keyframes soldFadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          fontFamily: fontStacks.mono,
          fontWeight: 800,
          fontSize: { xs: 96, sm: 140, md: 180 },
          lineHeight: 1,
          color: terminal.lime,
          letterSpacing: "0.04em",
          textShadow: `0 0 48px ${terminal.limeDim}`,
          animation: "soldPop 320ms cubic-bezier(0.2, 1.1, 0.4, 1)",
          "@keyframes soldPop": {
            "0%": { transform: "scale(0.6)", opacity: 0 },
            "100%": { transform: "scale(1)", opacity: 1 },
          },
        }}
      >
        SOLD
      </Box>
      <Box
        sx={{
          mt: 3,
          height: 3,
          width: 240,
          background: terminal.lime,
          boxShadow: `0 0 12px ${terminal.lime}`,
        }}
      />
      <Box
        sx={{
          mt: 3,
          fontFamily: fontStacks.sans,
          fontSize: { xs: 22, sm: 28 },
          fontWeight: 700,
          color: terminal.text,
          textAlign: "center",
          px: 2,
        }}
      >
        {player?.firstName} {player?.lastName}
      </Box>
      <Box
        sx={{
          mt: 1,
          fontFamily: fontStacks.mono,
          fontSize: { xs: 14, sm: 18 },
          color: terminal.textDim,
          letterSpacing: "0.08em",
        }}
      >
        @{bid.ownername} · ${bid.bidSalary}M × {bid.bidLength}YR
      </Box>
      <Box
        sx={{
          mt: 4,
          fontFamily: fontStacks.mono,
          fontSize: dfs(10),
          color: terminal.textMute,
          letterSpacing: "0.08em",
        }}
      >
        TAP OR PRESS ESC TO DISMISS
      </Box>
    </Box>
  );
};
