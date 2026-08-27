import { useDispatch } from "react-redux";
import { FranchiseWinTotal } from "../../../redux/reducers/OverUnderReducer";
import { Box, Typography } from "@mui/material";
import { OverUnderPick } from "../../../services/GeneralApiSvc";
import { selectALine } from "../../../redux/actions/OverUnderActions";
import OverUnderProgressBar from "./OverUnderProgressBar";
import { getPickProgress } from "./pickStatus";
import { terminal as T, fontStacks } from "../../../../theme";

const microLabel = {
  fontFamily: fontStacks.mono,
  fontSize: 9,
  letterSpacing: "0.08em",
  color: T.textMute,
} as const;

const statValue = {
  fontFamily: fontStacks.mono,
  fontSize: 13,
  fontWeight: 700,
  color: T.text,
  fontVariantNumeric: "tabular-nums",
} as const;

export const InSeasonOUTeamRow = ({
  franchise,
  userPick,
  isSelected = false,
}: {
  franchise: FranchiseWinTotal;
  userPick: OverUnderPick;
  isSelected?: boolean;
}): JSX.Element => {
  const dispatch = useDispatch();
  const isPass = userPick.isOver !== true && userPick.isOver !== false;

  const progress = getPickProgress({
    overUnder: franchise.overUnder,
    lineAdjustment: userPick.lineAdjustment,
    isOver: userPick.isOver,
    realWins: franchise.realWins,
    gamesRemaining: franchise.gamesRemaining,
  });
  const { status, effLine, isDouble } = progress;

  const accent = isPass
    ? "transparent"
    : status === "WIN"
      ? T.lime
      : status === "LOSS"
        ? T.red
        : isDouble
          ? T.amber
          : "transparent";

  return (
    <Box
      onClick={() => dispatch(selectALine(franchise.id))}
      sx={{
        background: isSelected ? T.panel2 : T.panel,
        borderLeft: `2px solid ${accent}`,
        // Selection is a UI state, not a result — so it deliberately avoids the
        // semantic colours (lime hit / red miss / amber double-down) and uses a
        // neutral outline. The faint hover outline doubles as the hint that
        // these cards are clickable at all.
        outline: `1px solid ${isSelected ? T.text : "transparent"}`,
        outlineOffset: "-1px",
        minHeight: 96,
        p: 1.25,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        cursor: "pointer",
        position: "relative",
        transition: "outline-color 0.15s ease, background 0.15s ease",
        "&:hover": {
          background: T.panel2,
          outlineColor: isSelected ? T.text : T.lineBold,
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={franchise.franchise.logo}
          alt={`${franchise.franchise.city} ${franchise.franchise.name} logo`}
          style={{
            // Dim passed teams, but keep them legible — desaturating made them ghosts.
            opacity: isPass ? 0.45 : 1,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          loading="lazy"
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
        }}
      >
        <Typography
          sx={{
            fontFamily: fontStacks.sans,
            fontSize: 13,
            fontWeight: 600,
            color: isPass ? T.textDim : T.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {franchise.franchise.city} {franchise.franchise.name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {isDouble && !isPass && (
            <Box
              component="span"
              sx={{
                fontFamily: fontStacks.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                background: T.amber,
                color: "#000",
                px: 0.5,
                flexShrink: 0,
              }}
            >
              2X
            </Box>
          )}
          <Typography
            sx={{
              fontFamily: fontStacks.mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              // In-season, lime/red mean won/lost — not over/under. Direction is
              // carried by the word and the arrow so one colour has one meaning.
              color: isPass
                ? T.textMute
                : status === "WIN"
                  ? T.lime
                  : status === "LOSS"
                    ? T.red
                    : T.textDim,
            }}
          >
            {isPass
              ? "PASS"
              : `${userPick.isOver ? "▲ OVER" : "▼ UNDER"} ${effLine}`}
          </Typography>
        </Box>

        {!isPass && (
          <OverUnderProgressBar
            status={status}
            pct={progress.pct}
            current={progress.current}
            target={progress.target}
            isOver={userPick.isOver === true}
            isDouble={isDouble}
            onPace={progress.onPace}
          />
        )}
      </Box>

      {/* Fixed width so the meter can never collide with these numbers. */}
      <Box
        sx={{
          width: 64,
          flexShrink: 0,
          alignSelf: "stretch",
          borderLeft: `1px solid ${T.line}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box sx={microLabel}>W-L</Box>
          <Box sx={statValue}>
            {franchise.realWins}-{progress.losses}
          </Box>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Box sx={microLabel}>GMS</Box>
          <Box sx={statValue}>{franchise.gamesRemaining}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InSeasonOUTeamRow;
