import { Typography } from "@mui/material";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";

export const TradeListItemHeader = ({
  mflId,
  playerDetails,
}: {
  mflId: string;
  playerDetails: PlayerDTO;
}) => {
  return (
    <div>
      <Typography>{playerDetails.fullName}</Typography>
      {!mflId.startsWith("FP_") && !mflId.startsWith("DP_") && (
        <div>
          <Typography>{playerDetails.team}</Typography>
          <Typography>{playerDetails.position}</Typography>
          <Typography>${playerDetails.salary}/</Typography>
          <Typography>{playerDetails.length} yr</Typography>
        </div>
      )}
    </div>
  );
};
