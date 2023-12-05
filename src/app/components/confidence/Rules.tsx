
import { ListItem, ListItemAvatar, Avatar, ListItemText, List, Button, ButtonGroup, Drawer, Container, Typography, TableCell, Table, TableBody, TableContainer, TableHead, TableRow, Card, CardMedia, CardContent, useTheme, Divider, Skeleton, Dialog, Slide, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlayerBio } from "../../redux/reducers/FreeAgentReducer";
import { Bid } from "../../redux/reducers/LotReducer";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { getRankStringSuffix, lastYear, ownerMap, tmColorMap } from "../../services/Common";
import { RootState } from "../../store";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";
import { updateUI } from "../../redux/actions/UiActions";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  
export const Rules = (): JSX.Element => {
    const {modal} = useSelector((state: RootState) => state.ui)
    const dispatch = useDispatch()
    const rulesText = `Before the first game starts each weekend of the playoffs, you'll submit your list of who you think will win each game. The list will be in order of your confidence in your picks, from most confident to least confident.

    Pick the winner of each game, then drag and drop the games in order. The number next to each game is how many points you'll get if you pick the correct winner.

    Each week has a different set of points for the games, so the games become more pivotal as you go.

    Week 1 (6 games): 6, 5, 4, 3, 2, 1
    Week 2 (4 games): 7, 6, 5, 4
    Week 3 (2 games): 8, 7
    Week 4 (Super Bowl): 9

    You must submit all of your picks before the first game each week. All picks will lock at the start of the first game.  You can make a change to your picks, but it has to be before the first game. 

    Each week will have a bonus prop question that will be used at the end for tiebreaker purposes.

    Standings are tracked live here on this page.
    
    Good luck! Have fun!`
    return (

        <Dialog
          open={modal === 'confidence-rules'}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => dispatch(updateUI({modal: undefined}))}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{"How it works"}</DialogTitle>
          <DialogContent>
            <div style={{whiteSpace: 'pre-line'}} id="alert-dialog-slide-description">
                {rulesText}
            </div>
          </DialogContent>
          <DialogActions>

            <Button onClick={() => dispatch(updateUI({modal: undefined}))}>OKAY</Button>
          </DialogActions>
        </Dialog>

    );
}

