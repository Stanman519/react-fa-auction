import { Box, IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useDispatch } from "react-redux";
import { Lot } from "../../redux/reducers/LotReducer";
import { BidForm } from "./bidForm";
import { PlayerCard } from "./playerCard";
import { PlayerBio } from "./playerBio";
import { BidInfo } from "./bidInfo";
import { updateBidHistory } from "../../redux/actions/UiActions";
import { terminal } from "../../../theme";
import { QuoteButton } from "../auction/QuoteButton";

interface LotProps {
  lot: Lot;
  starred?: boolean;
  onToggleStar?: (mflId: number) => void;
}

export const LotBody = ({ lot, starred, onToggleStar }: LotProps): JSX.Element => {
  const bidMode = !lot.newNom;
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const player = lot.bid?.player;
  const showStarQuote =
    isMobile &&
    !!player?.mflId &&
    !!onToggleStar;

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
      {(bidMode && (lot.bid?.expires || showStarQuote)) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderTop: `1px solid ${terminal.line}`,
            background: terminal.panel2,
          }}
        >
          {showStarQuote && player?.mflId != null && (
            <>
              <IconButton
                size="small"
                onClick={() => onToggleStar!(player.mflId)}
                sx={{ color: starred ? terminal.amber : terminal.textMute }}
              >
                {starred ? (
                  <StarIcon fontSize="small" />
                ) : (
                  <StarBorderIcon fontSize="small" />
                )}
              </IconButton>
              {player.firstName != null && (
                <QuoteButton
                  playerMflId={player.mflId}
                  playerName={`${player.firstName ?? ""} ${player.lastName ?? ""}`.trim()}
                />
              )}
            </>
          )}
          {lot.bid?.expires && (
            <Tooltip title="Bid history">
              <IconButton
                size="small"
                onClick={() => dispatch(updateBidHistory(lot.bid))}
                sx={{ color: terminal.textDim }}
              >
                <HistoryIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};
