import { Avatar, Typography } from "@mui/material";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";

export const TradeListItemHeader = ({
  mflId,
  playerDetails,
}: {
  mflId: string;
  playerDetails: PlayerDTO;
}) => {
  return (
    <div style={{ flex: 1 }}>
      {/* {playerDetails.headshot && <Avatar src={playerDetails.headshot} />} */}
      <Typography>{playerDetails.fullName}</Typography>
      {/* {!mflId.startsWith("FP_") && !mflId.startsWith("DP_") && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <Typography>{playerDetails.team}</Typography>
          <Typography>{playerDetails.position}</Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Typography>${playerDetails.salary}/</Typography>
            <Typography>{playerDetails.length} yr</Typography>
          </div>
        </div>
      )} */}
    </div>
  );
};
