import {
  Button,
  Dialog,
  Slide,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";
import { updateUI } from "../../redux/actions/UiActions";
import { useLocation } from "react-router-dom";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const Rules = (): JSX.Element => {
  const location = useLocation();
  const { modal } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const confidenceRulesText = `Before the first game starts each weekend of the playoffs, you'll submit your list of who you think will win each game. The list will be in order of your confidence in your picks, from most confident to least confident.

    Pick the winner of each game, then drag and drop the games in order. The number next to each game is how many points you'll get if you pick the correct winner.

    Each week has a different set of points for the games, so the games become more pivotal as you go.

    Week 1 (6 games): 6, 5, 4, 3, 2, 1 points
    Week 2 (4 games): 7, 6, 5, 4 points
    Week 3 (2 games): 8, 7 points
    Week 4 (Super Bowl): 9 points
 
    You must submit all of your picks before the first game each week. All picks will lock at the start of the first game.  You can make a change to your picks, but it has to be before the first game. 

    Each week will have a bonus prop question that will be used at the end for tiebreaker purposes.

    Standings are tracked live here on this page.
    
    Good luck! Have fun!`;

  const overUndersRulesText = `Select whether you think each team will win OVER or UNDER the amount of wins displayed on each card. 
    
    You must make a selection for 24 teams, so you can pass on some teams that you are unsure about.
    
    Additionally, 2 of those selections must be a "double down".  In this case you will still pick over or under but you'll have to move the expected wins +1 or -1, respectively, to make it more difficult.  Do this by making your selection and then holding down on your choice a second time.
    
    1 point for every team that you guess correctly and 2 points for every correct double down.
    
    You can edit your picks in the preseason. Once the season starts, your picks will be locked in and you'll be able to view everyone else's picks.

    Prizes: If you tie the winner without tiebreakers, you'll be given your money back at minimum.  2nd place will get $50. 1st place will get the remaining money.

    Tie-breaker #1: Total correct picks

    Tie-breaker #2: Total amount of people who picked the other side of your correct picks. (Teams where you went against the crowd are worth more)
    
    Good luck! Have fun!`;

  return (
    <Dialog
      open={modal === "confidence-rules"}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => dispatch(updateUI({ modal: undefined }))}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"How it works"}</DialogTitle>
      <DialogContent>
        <div
          style={{ whiteSpace: "pre-line" }}
          id="alert-dialog-slide-description"
        >
          {location.pathname === "/confidence"
            ? confidenceRulesText
            : overUndersRulesText}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(updateUI({ modal: undefined }))}>
          OKAY
        </Button>
      </DialogActions>
    </Dialog>
  );
};
