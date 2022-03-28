import { useTheme } from "@mui/material";
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
  const dateProp = lot.bid?.expires ? new Date(lot.bid.expires) : undefined
  const bidMode = !lot.newNom;
  const theme = useTheme();
  const getUTC = (endTime?: Date): Date | undefined => {
    console.log('enntering func', endTime)
    if (endTime){
      return new Date(
        endTime.getFullYear(), endTime.getUTCMonth(), endTime.getUTCDate(),
      endTime.getUTCHours(), endTime.getUTCMinutes(), endTime.getUTCSeconds(), 10);
    }
  }

  return (
        <div className="lot-frame" style={{ minHeight: bidMode ? 325 : 0, backgroundColor: theme.palette.background.paper}}>
            <PlayerCard lotId={lot.lotId} player={lot.bid?.player ?? undefined} bidInfo={lot.bid}/>
            <Timer endTime={getUTC(dateProp)} lot={lot}/>
            <BidForm bidMode={bidMode} lot={lot} />
        </div>
  
    );
  
  
  }
  