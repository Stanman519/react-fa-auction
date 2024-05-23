import { useTheme } from "@mui/material";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Lot } from "../../redux/reducers/LotReducer";
import { RootState } from "../../store";
import { BidForm } from "./bidForm";
import { PlayerCard } from "./playerCard";
import { Timer } from "./timer";

interface LotProps {
  lot: Lot
}

export const LotBody = ({lot}: LotProps): JSX.Element => {
  const dateProp = lot.bid?.expires ? lot.bid.expires : undefined
  const bidMode = !lot.newNom;
  const theme = useTheme();

  useEffect(() => {
}, [lot.isFresh])

  return (
        <div
        className="rounded mt-1 mb-1 pb-1"
        style={{ 
        backgroundColor: theme.palette.background.paper, 
        borderStyle: lot.isFresh ? 'ridge' : 'none',
        borderWidth: 4,
        borderColor: 'green'}}>
            <PlayerCard lot={lot}/>
            <Timer endTime={dateProp} lot={lot}/>
            <BidForm bidMode={bidMode} lot={lot} />
        </div>
  
    );
  
  
  }
  