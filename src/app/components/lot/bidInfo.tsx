import { Box, useTheme } from "@mui/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { makeThisLotStale } from "../../redux/actions/LotActions";
import { Lot } from "../../redux/reducers/LotReducer";
import "./styles/lot.css";
import { playNotificationSound } from "../../services/SoundUtils";
import { Timer } from "./timer";
import { terminal, fontStacks } from "../../../theme";
import { dfs } from "../nonAuction/terminal/tokens";

interface BidInfoProps {
  lot: Lot;
}

// Terminal-style two-column header: HIGH BID | CLOSES IN
export const BidInfo = ({ lot }: BidInfoProps): JSX.Element => {
  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    let timer: any;
    if (lot?.isFresh) {
      playNotificationSound();
      timer = setTimeout(() => {
        dispatch(makeThisLotStale(lot?.lotId));
      }, 10000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [lot?.isFresh, dispatch, lot?.lotId]);

  const bid = lot.bid;
  const highBid = bid?.bidSalary;
  const bidder = bid?.ownername;
  const years = bid?.bidLength;
  const labelSx = {
    fontFamily: fontStacks.mono,
    fontSize: dfs(10),
    letterSpacing: "0.08em",
    color: terminal.textMute,
    textTransform: "uppercase" as const,
  };

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: `1px solid ${terminal.line}`,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
        backgroundColor: lot.isFresh ? terminal.limeDim : "transparent",
        transition: "background-color 900ms ease-out",
      }}
    >
      <Box>
        <Box sx={labelSx}>High Bid</Box>
        <Box
          sx={{
            fontFamily: fontStacks.mono,
            fontSize: dfs(36),
            fontWeight: 800,
            lineHeight: 1,
            color: theme.palette.primary.main,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {highBid != null ? `$${highBid}` : "—"}
          {highBid != null && (
            <Box
              component="span"
              sx={{ fontSize: dfs(16), color: terminal.textDim, ml: 0.5 }}
            >
              M
            </Box>
          )}
        </Box>
        <Box
          sx={{
            mt: 0.75,
            fontFamily: fontStacks.mono,
            fontSize: dfs(11),
            color: terminal.textDim,
          }}
        >
          {bidder ? `@${bidder}` : "NO BIDS"}
          {years != null && (
            <Box component="span" sx={{ color: terminal.textMute, ml: 1 }}>
              · {years}YR
            </Box>
          )}
        </Box>
      </Box>
      <Box>
        <Box sx={labelSx}>Closes In</Box>
        <Timer endTime={bid?.expires} lot={lot} />
      </Box>
    </Box>
  );
};
