import { Box, IconButton, Tooltip } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { useDispatch } from "react-redux";
import { Lot } from "../../redux/reducers/LotReducer";
import { BidForm } from "./bidForm";
import { PlayerCard } from "./playerCard";
import { PlayerBio } from "./playerBio";
import { BidInfo } from "./bidInfo";
import { updateBidHistory } from "../../redux/actions/UiActions";
import { terminal } from "../../../theme";

interface LotProps {
  lot: Lot;
}

export const LotBody = ({ lot }: LotProps): JSX.Element => {
  const bidMode = !lot.newNom;
  const dispatch = useDispatch();

  return (
    <Box
      className="mt-1 mb-1 mr-1 relative w-full"
      sx={{
        background: terminal.panel,
        border: `1px solid ${lot.isFresh ? terminal.lime : terminal.line}`,
        borderRadius: "3px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "border-color 900ms ease-out",
      }}
    >
      <PlayerCard lot={lot} />
      {lot.bid?.player && <PlayerBio lot={lot} />}
      {bidMode && <BidInfo lot={lot} />}
      <BidForm bidMode={bidMode} lot={lot} />
      {bidMode && lot.bid?.expires && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderTop: `1px solid ${terminal.line}`,
            background: terminal.panel2,
          }}
        >
          <Tooltip title="Bid history">
            <IconButton
              size="small"
              onClick={() => dispatch(updateBidHistory(lot.bid))}
              sx={{ color: terminal.textDim }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};
