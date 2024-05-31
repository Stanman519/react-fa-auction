import { Button, ButtonGroup, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bid, Lot } from "../../redux/reducers/LotReducer";
import { RootState } from "../../store";
import { BidForm } from "./bidForm";
import { PlayerCard } from "./playerCard";
import { Timer } from "./timer";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { PlayerBio } from "../../redux/reducers/FreeAgentReducer";
import { lastYear } from "../../services/Common";
import { updateBidHistory, updatePlayerBio, updateUI } from "../../redux/actions/UiActions";

interface LotProps {
  lot: Lot
}

export const LotBody = ({lot}: LotProps): JSX.Element => {
  const dateProp = lot.bid?.expires ? lot.bid.expires : undefined
  const bidMode = !lot.newNom;
  const theme = useTheme();
  const dispatch = useDispatch()

  const [bidTabExtended, setBidTabExtended] = useState<boolean>(false)



  return (
        <div
        className="rounded mt-1 mb-1 pb-1 relative h-fit overflow-hidden" 
        style={{ 
        backgroundColor: theme.palette.background.paper, 
        borderStyle: lot.isFresh ? 'ridge' : 'none',
        borderWidth: 4,
        borderColor: 'green'}}>
            <PlayerCard lot={lot}/>
            <ButtonGroup sx={{ display: 'flex', width: '100%'}} className="px-4 pb-4" aria-label="small button group">
                    <Button  sx={{ flex: 1 }} onClick={() => dispatch(updatePlayerBio(lot.bid))}>Bio</Button>
                    {lot.bid?.expires && <Button sx={{ flex: 2, lineHeight: '14px' }} onClick={() => dispatch(updateBidHistory(lot?.bid))}>Bid History</Button>}
                    <Button onClick={() => setBidTabExtended(!bidTabExtended)} className="w-2/3">{bidTabExtended ? 'Close' : 'Open'} Offer Sheet</Button>
                </ButtonGroup>
            <Timer endTime={dateProp} lot={lot}/>
             <BidForm  bidTabExtended={bidTabExtended} bidMode={bidMode} lot={lot} />
        </div>
  
    );
  
  
  }
  