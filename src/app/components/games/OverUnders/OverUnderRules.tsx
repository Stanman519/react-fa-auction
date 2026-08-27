import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { RootState } from "../../../redux/reducers/RootReducer";
import { updateUI } from "../../../redux/actions/UiActions";
import { terminal as T, fontStacks } from "../../../../theme";
import { NFL_TEAMS, REQUIRED_DOUBLES, REQUIRED_PICKS } from "./pickStatus";

export const OverUnderRules = (): JSX.Element => {
  const dispatch = useDispatch();
  const { modal } = useSelector((state: RootState) => state.ui);
  const { currentPool } = useSelector((state: RootState) => state.overUnders);

  const handleClose = () => dispatch(updateUI({ modal: undefined }));

  const heading = (text: string) => (
    <Typography
      variant="h6"
      gutterBottom
      sx={{
        fontFamily: fontStacks.mono,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: T.lime,
      }}
    >
      {text}
    </Typography>
  );

  return (
    <Dialog
      open={modal === "ou-rules"}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          background: T.panel,
          backgroundImage: "none",
          border: `1px solid ${T.lineBold}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: fontStacks.mono,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: T.text,
        }}
      >
        {currentPool?.year ?? ""} OVER/UNDER RULES
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: T.line }}>
        <Box sx={{ p: 2, color: T.text }}>
          {heading("HOW TO PLAY")}
          <Typography paragraph>
            Every NFL team has a projected win total for the season. For each
            team you pick, you're calling whether they'll finish <b>over</b> or{" "}
            <b>under</b> that number. Lines always end in .5, so there are no
            ties.
          </Typography>

          <Divider sx={{ my: 2, borderColor: T.line }} />

          {heading("MAKING YOUR PICKS")}
          <Typography paragraph>
            1. Tap <b>UNDER</b> or <b>OVER</b> on a team to make a pick.
          </Typography>
          <Typography paragraph>
            2. You must pick exactly <b>{REQUIRED_PICKS}</b> of the {NFL_TEAMS}{" "}
            teams. The other {NFL_TEAMS - REQUIRED_PICKS} are passes.
          </Typography>
          <Typography paragraph>
            3. To turn a pick into a <b>double down</b>, click it and then{" "}
            <b>keep holding</b>, it has to already be selected. You must use
            exactly {REQUIRED_DOUBLES}.
          </Typography>
          <Typography paragraph>
            4. Use the SAVE PICKS button to submit. You can re-submit your picks
            as many times as you want before the season starts.
          </Typography>

          <Divider sx={{ my: 2, borderColor: T.line }} />

          {heading("DOUBLE DOWNS")}
          <Typography paragraph>
            A double down moves the line a full win <b>against</b> you and pays{" "}
            <b>2 points</b> instead of 1 if it hits.
          </Typography>
          <Typography paragraph>
            • Doubling an <b>OVER</b> raises the line by 1 (over 9.5 becomes
            over 10.5)
          </Typography>
          <Typography paragraph>
            • Doubling an <b>UNDER</b> lowers it by 1 (under 9.5 becomes under
            8.5)
          </Typography>

          <Divider sx={{ my: 2, borderColor: T.line }} />

          {heading("SCORING")}
          <Typography paragraph>
            • A correct pick is worth <b>1 point</b>, or <b>2</b> if you doubled
            down
          </Typography>
          <Typography paragraph>
            • Wrong picks are worth zero, no penalty
          </Typography>
          <Typography paragraph>
            • A pick settles the moment it's mathematically decided, win or
            lose. Until then it counts as <b>TBD</b>
          </Typography>
          <Typography paragraph>
            • Standings are ranked by points and show your record as{" "}
            <b>W-L-TBD</b>
          </Typography>

          <Divider sx={{ my: 2, borderColor: T.line }} />

          {heading("TIEBREAKERS")}
          <Typography paragraph>
            1. <b>2X</b>: double-downs hit. Whoever cashed more of their{" "}
            {REQUIRED_DOUBLES} finishes ahead.
          </Typography>
          <Typography paragraph>
            2. <b>EDGE</b>: contrarian credit for being right about teams the
            rest of the pool wasn't on. Every win earns a fraction based on how
            many owners took that same side: a call nobody else made is worth
            close to a full point, one that everybody made is worth almost
            nothing.
          </Typography>

          <Divider sx={{ my: 2, borderColor: T.line }} />

          {heading("DURING THE SEASON")}
          <Typography paragraph>
            • Picks are final once the season starts
          </Typography>
          <Typography paragraph>
            • Tap any team to see how the whole pool picked it, and tap
            someone's avatar to view their full card
          </Typography>
          <Typography paragraph>
            • You must pay before the season starts or you will be disqualified
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            fontFamily: fontStacks.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            background: T.lime,
            color: "#000",
            "&:hover": { background: T.lime },
          }}
        >
          GOT IT.
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OverUnderRules;
