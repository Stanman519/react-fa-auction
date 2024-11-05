import { Box, Drawer, List, Paper, Typography, useTheme } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { updateUI } from "../../../redux/actions/UiActions";
import { RootState } from "../../../redux/reducers/RootReducer";
import StandingsRow from "./StandingsRow";
import { PoolUser } from "../../../redux/reducers/OwnerReducer";

export const OverUnderStandingsSlab = (): JSX.Element => {
  const users = useSelector((state: RootState) => state.overUnders.otherUsers);
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const { currentPool } = useSelector((state: RootState) => state.overUnders);
  const openSlab = useSelector(
    (state: RootState) => state.ui.modal === "ou-standings",
  );
  const { franchiseWinTotals } = useSelector(
    (state: RootState) => state.overUnders,
  );

  const getPointsForUser = (user: PoolUser): number => {
    const scoringLines = user.picks.filter((p) => {
      const foundLine = franchiseWinTotals.find((f) => f.id == p.lineId);
      return (
        (p.isOver &&
          (foundLine?.realWins ?? 0) >
            (foundLine?.overUnder ?? 0 + p.lineAdjustment)) ||
        (p.isOver === false &&
          17 - ((foundLine?.gamesRemaining ?? 0) + (foundLine?.realWins ?? 0)) >
            17.5 - ((foundLine?.overUnder ?? 0) + p.lineAdjustment))
      );
    });
    {
      return scoringLines.reduce(
        (prev, curr) => prev + (curr.lineAdjustment === 0 ? 1 : 2),
        0,
      );
    }
  };

  const scoredAndSorted = users
    .map((u) => {
      if (!u.score) u.score = getPointsForUser(u);
      return u;
    })
    .sort(
      (a, b) =>
        (b?.score ?? 0) - (a?.score ?? 0) ||
        a.owner.displayName.localeCompare(b.owner.displayName),
    );

  return (
    <Drawer
      anchor={"left"}
      open={openSlab}
      onClose={() => dispatch(updateUI({ modal: undefined }))}
    >
      <Box
        sx={{ width: 250, height: "100%" }}
        role="presentation"
        onClick={() => dispatch(updateUI({ modal: undefined }))}
        bgcolor={palette.background.default}
      >
        {/* <Paper>
          <Box className="flex flex-row justify-end">
            <Typography>Pts</Typography>
            <Typography>Misses</Typography>
          </Box>
        </Paper> */}

        <List>
          {scoredAndSorted.map((o, index) => (
            <StandingsRow
              key={o.id}
              user={o}
              currentPool={currentPool?.id}
              score={o.score ?? 0}
            />
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
