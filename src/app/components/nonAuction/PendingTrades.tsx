import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  Card,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  PendingTradeResponse,
  TradeOfferAsset,
  TradeRequest,
} from "../../models/MflModels";
import { URL } from "../../services/AuctionApiSvc";
import { TradeListItemHeader } from "./TradeListItemHeader";
const PendingTrades = () => {
  const [pendingTrades, setPendingTrades] = useState<TradeRequest[]>([]);
  const { currentLeague } = useSelector((state: RootState) => state.profile);
  const isPick = (asset: TradeOfferAsset) => {
    return asset.mflId.startsWith("DP_") || asset.mflId.startsWith("FP_");
  };
  useEffect(() => {
    const fetchPendingTrades = async () => {
      const response = axios
        .get(
          `${URL}/dashboard/league/${currentLeague?.league.leagueId}/owners/${currentLeague?.leagueownerid}/mfl/${currentLeague?.mflfranchiseid}/pending-trades`,
          {
            headers: {
              contentType: "application/json",
            },
          },
        )
        .then((res) => {
          console.log("other", res.data);

          const data = res.data as PendingTradeResponse;
          setPendingTrades(data.tradeRequests);
        })
        .catch((err) => {
          console.log("error", err);
        });
    };
    fetchPendingTrades();
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      {pendingTrades.length > 0 ? (
        pendingTrades.map((p) => {
          return (
            <Card>
              <List>
                {p.sendingAssets.map((s) => (
                  <ListItem key={s.mflId}>
                    <ListItemAvatar>
                      <Avatar src={s.playerDetails?.headshot ?? ""}></Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <TradeListItemHeader
                          mflId={s.mflId}
                          playerDetails={s.playerDetails}
                        />
                      }
                      secondary={
                        !isPick(s) &&
                        `${s.playerDetails?.team} ${s.playerDetails?.position} - $${s.playerDetails?.salary}/${s.playerDetails?.length} yr`
                      }
                    />
                    {s.capEats.map((c) => (
                      <List>
                        <ListItem>
                          {c.year} - ${c.amount}
                        </ListItem>
                      </List>
                    ))}
                  </ListItem>
                ))}
              </List>
              <div>{p.receivingAssets.map((a) => a.mflId)}</div>
              <div>{p.sendingAssets.map((a) => a.mflId)}</div>
            </Card>
          );
        })
      ) : (
        <Card>
          <div>You have no pending trades.</div>
        </Card>
      )}
    </Box>
  );
};

export default PendingTrades;
