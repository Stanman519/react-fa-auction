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
import { RootState } from "../../redux/reducers/RootReducer";
import { updateUI } from "../../redux/actions/UiActions";

export const Rules = (): JSX.Element => {
  const dispatch = useDispatch();
  const { modal } = useSelector((state: RootState) => state.ui);

  const handleClose = () => {
    dispatch(updateUI({ modal: undefined }));
  };

  return (
    <Dialog
      open={modal === "confidence-rules"}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>Confidence Pool Rules</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            How to Play
          </Typography>
          <Typography paragraph>
            Pick the winner of each NFL game for the week. Rank your picks from
            most to least confident. The more confident you are, the more points
            that game is worth.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Scoring
          </Typography>
          <Typography paragraph>
            • Games are worth points equal to their position in your rankings
            (top game = most points)
          </Typography>
          <Typography paragraph>
            • If you pick correctly, you earn those points
          </Typography>
          <Typography paragraph>
            • If you pick incorrectly, you get zero points for that game
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Making Your Picks
          </Typography>
          <Typography paragraph>
            1. Click on the team you think will win each game
          </Typography>
          <Typography paragraph>
            2. Drag and drop games to reorder them by confidence (most confident
            at top)
          </Typography>
          <Typography paragraph>
            3. Answer the tiebreaker question(s) at the bottom
          </Typography>
          <Typography paragraph>
            4. Submit your picks before the first game of the week starts
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Important Notes
          </Typography>
          <Typography paragraph>
            • You can change your picks any time before the first game locks
          </Typography>
          <Typography paragraph>
            • Once the first game starts, you can't change picks for any games that week
          </Typography>
          <Typography paragraph>
            • If on mobile, press and hold for a moment before dragging games
          </Typography>
          <Typography paragraph>
            • You must pay before the first game starts or you will be disqualified
          </Typography>
          <Divider sx={{ my: 2 }} />


        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Got It.
        </Button>
      </DialogActions>
    </Dialog>
  );
};
