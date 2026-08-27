import { Box, Drawer } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useMemo } from "react";
import { updateUI } from "../../../redux/actions/UiActions";
import { RootState } from "../../../redux/reducers/RootReducer";
import StandingsRow, { STANDINGS_COLUMNS } from "./StandingsRow";
import { buildLineSides, PickTally, tallyPicks } from "./pickStatus";
import { terminal as T, fontStacks } from "../../../../theme";

export const OverUnderStandingsSlab = (): JSX.Element => {
  const users = useSelector((state: RootState) => state.overUnders.otherUsers);
  const dispatch = useDispatch();
  const openSlab = useSelector(
    (state: RootState) => state.ui.modal === "ou-standings",
  );
  const { franchiseWinTotals } = useSelector(
    (state: RootState) => state.overUnders,
  );

  const close = () => dispatch(updateUI({ modal: undefined }));

  const ranked = useMemo(() => {
    const lines = franchiseWinTotals.map((f) => ({
      id: f.id,
      overUnder: f.overUnder,
      realWins: f.realWins,
      gamesRemaining: f.gamesRemaining,
    }));
    const sides = buildLineSides(users.flatMap((u) => u.picks ?? []));
    return users
      .map((u) => ({
        user: u,
        tally: tallyPicks(u.picks ?? [], lines, sides, users.length),
      }))
      .sort(
        (a, b) =>
          // wins are implied by pts − doublesHit, so they add nothing here
          b.tally.pts - a.tally.pts ||
          b.tally.doublesHit - a.tally.doublesHit ||
          b.tally.contrarian - a.tally.contrarian ||
          a.user.owner.displayName.localeCompare(b.user.owner.displayName),
      );
  }, [users, franchiseWinTotals]);

  const header = (text: string, align: "left" | "right" = "left") => (
    <span
      style={{
        fontFamily: fontStacks.mono,
        fontSize: 9,
        letterSpacing: "0.08em",
        color: T.textMute,
        display: "block",
        width: "100%",
        textAlign: align,
      }}
    >
      {text}
    </span>
  );

  return (
    <Drawer
      anchor="left"
      open={openSlab}
      onClose={close}
      PaperProps={{
        sx: {
          background: T.bg,
          borderRight: `1px solid ${T.lineBold}`,
          backgroundImage: "none",
        },
      }}
    >
      {/* No onClick here — it used to swallow every row click and close the drawer. */}
      <Box sx={{ width: { xs: "100vw", sm: 420 }, height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.25,
            height: 40,
            borderBottom: `1px solid ${T.lineBold}`,
            background: T.panel,
          }}
        >
          <span
            style={{
              fontFamily: fontStacks.mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: T.text,
            }}
          >
            STANDINGS
          </span>
          <span
            onClick={close}
            style={{
              fontFamily: fontStacks.mono,
              fontSize: 13,
              color: T.textDim,
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            ✕
          </span>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: STANDINGS_COLUMNS,
            alignItems: "center",
            gap: 1,
            px: 1.25,
            py: 0.5,
            borderBottom: `1px solid ${T.line}`,
            background: T.panel,
          }}
        >
          {header("#")}
          <span />
          {header("OWNER")}
          {header("W-L-TBD")}
          {header("2X", "right")}
          {header("EDGE", "right")}
        </Box>

        <Box sx={{ overflowY: "auto", height: "calc(100% - 92px)" }}>
          {ranked.map(({ user, tally }, i) => (
            <StandingsRow
              key={user.id}
              user={user}
              rank={i + 1}
              tally={tally as PickTally}
            />
          ))}
        </Box>

        <Box
          sx={{
            px: 1.25,
            height: 24,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderTop: `1px solid ${T.line}`,
            background: T.panel,
            fontFamily: fontStacks.mono,
            fontSize: 8,
            letterSpacing: "0.06em",
            color: T.textMute,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <span>TIEBREAK — 2X: DOUBLES HIT</span>
          <span>EDGE: WINS THE POOL FADED</span>
        </Box>
      </Box>
    </Drawer>
  );
};
