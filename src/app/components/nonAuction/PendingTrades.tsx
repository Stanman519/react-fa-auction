import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  Card,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { axiosInstance } from "../../services/axiosInstance";
import {
  PendingTradeResponse,
  TradeOfferAsset,
  TradeRequest,
} from "../../models/MflModels";
import { URL } from "../../services/AuctionApiSvc";
import { TradeListItemHeader } from "./TradeListItemHeader";
import { replyToTrade } from "../../redux/actions/TransactionActions";
const PendingTrades = () => {
  const [pendingTrades, setPendingTrades] = useState<TradeRequest[]>([]);
  const { currentLeagueId } = useSelector((state: RootState) => state.profile);
  const currentLeague = useSelector((state: RootState) =>
    state.profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    ),
  );
  const { deadCap } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const isPick = (asset: TradeOfferAsset) => {
    return asset.mflId.startsWith("DP_") || asset.mflId.startsWith("FP_");
  };

  useEffect(() => {
    const fetchPendingTrades = async () => {
      const response = axiosInstance
        .get(
          `${URL}/dashboard/league/${currentLeague?.league.leagueId}/owners/${currentLeague?.leagueownerid}/mfl/${currentLeague?.mflfranchiseid}/pending-trades`,
          {
            headers: {
              contentType: "application/json",
            },
          },
        )
        .then((res) => {
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
            <Card sx={{ padding: 1, margin: 1 }}>
              <div>
                {
                  deadCap.deadCap.find((d) => d.franchiseId === p.senderId)
                    ?.team
                }{" "}
                sends:
              </div>
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

                    <div>
                      <div style={{ width: "100%", textAlign: "center" }}>
                        Salary Retained
                      </div>
                      <List style={{ flexDirection: "row", display: "flex" }}>
                        {s.capEats.map((c) => (
                          <ListItem
                            key={c.year}
                            style={{ flexDirection: "column" }}
                          >
                            <Typography>{c.year}</Typography>
                            <Typography>${c.amount}</Typography>
                          </ListItem>
                        ))}
                      </List>
                    </div>
                  </ListItem>
                ))}
              </List>
              {
                deadCap.deadCap.find((d) => d.franchiseId === p.receiverId)
                  ?.team
              }{" "}
              sends:
              <List>
                {p.receivingAssets.map((s) => (
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
                    <div>
                      {s.capEats.length > 0 && (
                        <div style={{ width: "100%", textAlign: "center" }}>
                          Salary Retained
                        </div>
                      )}
                      <List style={{ flexDirection: "row", display: "flex" }}>
                        {s.capEats.map((c) => (
                          <ListItem
                            key={c.year}
                            style={{ flexDirection: "column" }}
                          >
                            <Typography>{c.year}</Typography>
                            <Typography>${c.amount}</Typography>
                          </ListItem>
                        ))}
                      </List>
                    </div>
                  </ListItem>
                ))}
              </List>
              {p.senderId === currentLeague?.mflfranchiseid ? (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    onClick={() => dispatch(replyToTrade(+p.tradeId, "revoke"))}
                    color="warning"
                    variant="contained"
                    style={{ width: "50%" }}
                  >
                    REVOKE
                  </Button>
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-around",
                  }}
                >
                  <Button
                    onClick={() => dispatch(replyToTrade(+p.tradeId, "reject"))}
                    color="warning"
                    variant="contained"
                    style={{ maxWidth: "50%", flex: 2 }}
                  >
                    REJECT
                  </Button>
                  <Button
                    onClick={() => dispatch(replyToTrade(+p.tradeId, "accept"))}
                    color="success"
                    variant="contained"
                    style={{ maxWidth: "30%", flex: 1 }}
                  >
                    ACCEPT
                  </Button>
                </div>
              )}
            </Card>
          );
        })
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, px: 2 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 360 }}>
            <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
              No Pending Trades
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You have no incoming or outgoing trade offers right now.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PendingTrades;
