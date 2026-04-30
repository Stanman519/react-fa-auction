import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState, useAppThunkDispatch } from "../../store";
import { turnOnNominationModeForThisOwnersLot } from "../../redux/actions/LotActions";
import { terminal, fontStacks } from "../../../theme";
import { dfs } from "../nonAuction/terminal/tokens";

export const NominateBottomButton = () => {
  const dispatch = useAppThunkDispatch();
  const { owner, currentLeagueId } = useSelector((s: RootState) => s.profile);
  const currentLeague = owner.leagues.find(
    (l) => l.league.leagueId === currentLeagueId,
  );
  const lots = useSelector((s: RootState) =>
    s.lots.filter((l) => l.leagueId === currentLeague?.league.leagueId),
  );

  if (lots.some((l) => l.newNom)) return null;

  const openSlots = lots.filter((l) => !l.bid).length;
  const myNoms = lots.filter(
    (l) => l.nominatedBy === currentLeague?.leagueownerid,
  ).length;

  const maxedOut = myNoms >= 3;
  const noSlots = openSlots === 0;
  const disabled = maxedOut || noSlots || !owner.ownername;

  const label = maxedOut
    ? "3/3 NOMS USED"
    : noSlots
      ? "NO OPEN SLOTS"
      : `+ NOMINATE PLAYER · ${openSlots} SLOT${openSlots === 1 ? "" : "S"} OPEN`;

  return (
    <Box
      sx={{
        p: "14px",
        textAlign: "center",
        borderBottom: `1px solid ${terminal.line}`,
      }}
    >
      <Box
        component="button"
        disabled={disabled}
        onClick={() => dispatch(turnOnNominationModeForThisOwnersLot())}
        sx={{
          background: "transparent",
          border: `1px dashed ${disabled ? terminal.line : terminal.lineBold}`,
          color: disabled ? terminal.textMute : terminal.textDim,
          px: "16px",
          py: "10px",
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: fontStacks.mono,
          fontSize: dfs(11),
          letterSpacing: "0.08em",
          borderRadius: "2px",
          transition: "color 150ms, border-color 150ms",
          "&:hover:not(:disabled)": {
            color: terminal.lime,
            borderColor: terminal.lime,
          },
        }}
      >
        {label}
      </Box>
    </Box>
  );
};
