
import { useTheme } from "@mui/material";
import { Lot } from "../../redux/reducers/LotReducer";
import { BidForm } from "./bidForm";
import { PlayerCard } from "./playerCard";
import { Timer } from "./timer";

interface LotProps {
  lot: Lot,
  screenWidth: number
}

export const LotBody = ({lot, screenWidth}: LotProps): JSX.Element => {
  const dateProp = lot.bid?.expires ? new Date(lot.bid.expires) : undefined
  const bidMode = !lot.newNom;
  const theme = useTheme();
  return (
        <div className="lot-frame" style={{ minHeight: bidMode ? 325 : 0, backgroundColor: theme.palette.background.paper}}>
            <PlayerCard screenWidth={screenWidth} lotId={lot.lotId} player={lot.bid?.player ?? undefined} bidInfo={lot.bid}/>
            <Timer endTime={dateProp} lotId={lot.lotId}/>
            <BidForm bidMode={bidMode} lot={lot} />
        </div>
  
    );
  
  
  }
  