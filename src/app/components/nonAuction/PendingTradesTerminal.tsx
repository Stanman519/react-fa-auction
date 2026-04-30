import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { RootState } from "../../store";
import { axiosInstance } from "../../services/axiosInstance";
import {
  PendingTradeResponse,
  TradeOfferAsset,
  TradeRequest,
} from "../../models/MflModels";
import { URL } from "../../services/AuctionApiSvc";
import { replyToTrade } from "../../redux/actions/TransactionActions";
import {
  A,
  dfs,
  TPanel,
  TLabel,
  TAssetChip,
  TActionButton,
  useIsMobile,
  TAsset,
} from "./terminal";

const isPickAsset = (a: TradeOfferAsset) =>
  a.mflId.startsWith("DP_") || a.mflId.startsWith("FP_");

const toAsset = (a: TradeOfferAsset): TAsset => {
  const p = a.playerDetails;
  const displayName = p?.fullName || [p?.firstName, p?.lastName].filter(Boolean).join(" ") || a.mflId;
  if (isPickAsset(a)) {
    return { kind: "pick", name: displayName, note: p?.team ?? undefined };
  }
  return {
    kind: "player",
    name: displayName,
    pos: p?.position ?? "POS",
    team: p?.team,
    apy: p?.salary,
    years: p?.length,
  };
};

function CapEatsRow({ asset }: { asset: TradeOfferAsset }) {
  if (!asset.capEats?.length) return null;
  return (
    <Box sx={{ pl: "10px", display: "flex", gap: "10px", flexWrap: "wrap", mt: "4px" }}>
      <TLabel>SALARY RETAINED</TLabel>
      {asset.capEats.map((c) => (
        <Box
          key={`${c.year}-${c.mflId}`}
          sx={{ fontFamily: A.mono, fontSize: dfs(10), color: A.amber }}
        >
          {c.year}: ${c.amount}
        </Box>
      ))}
    </Box>
  );
}

function TradeCard({
  trade,
  myFranchiseId,
  senderTeam,
  receiverTeam,
  mobile,
  onReply,
}: {
  trade: TradeRequest;
  myFranchiseId: number | undefined;
  senderTeam: string;
  receiverTeam: string;
  mobile: boolean;
  onReply: (action: "accept" | "reject" | "revoke") => void;
}) {
  const iAmSender = trade.senderId === myFranchiseId;
  const expires = trade.expires
    ? new Date(trade.expires * 1000).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <Box sx={{ background: A.panel, border: `1px solid ${A.line}`, mb: "14px" }}>
      <Box
        sx={{
          padding: mobile ? "10px 12px" : "12px 16px",
          borderBottom: `1px solid ${A.line}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <TLabel size={9}>TRADE #{trade.tradeId}</TLabel>
          {iAmSender && (
            <Box sx={{ fontFamily: A.mono, fontSize: dfs(10), color: A.amber, letterSpacing: "0.06em" }}>
              · OUTGOING
            </Box>
          )}
        </Box>
        {expires && (
          <Box sx={{ fontFamily: A.mono, fontSize: dfs(11), color: A.amber }}>
            EXPIRES {expires}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1fr 60px 1fr",
          padding: mobile ? "12px" : "16px",
          gap: "12px",
        }}
      >
        {[
          { label: senderTeam, assets: trade.sendingAssets, side: "TEAM A" },
          { label: receiverTeam, assets: trade.receivingAssets, side: "TEAM B" },
        ].map((side, idx) => (
          <Box key={side.side} sx={{ display: "contents" }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "8px" }}>
                <Box sx={{ width: 6, height: 6, background: idx === 0 ? A.amber : A.lime }} />
                <TLabel>
                  {side.side} · {side.label || `FRANCHISE ${idx === 0 ? trade.senderId : trade.receiverId}`}
                </TLabel>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {side.assets.map((a) => (
                  <Box key={a.mflId}>
                    <TAssetChip asset={toAsset(a)} mobile={mobile} />
                    <CapEatsRow asset={a} />
                  </Box>
                ))}
              </Box>
            </Box>
            {idx === 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: A.lime,
                  fontSize: mobile ? 18 : dfs(22),
                  fontWeight: 700,
                }}
              >
                {mobile ? "↕" : "⇄"}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          padding: mobile ? "10px 12px 12px" : "12px 16px",
          borderTop: `1px solid ${A.line}`,
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {iAmSender ? (
          <TActionButton variant="amber" onClick={() => onReply("revoke")} fullWidth={mobile}>
            ✗ REVOKE
          </TActionButton>
        ) : (
          <>
            <TActionButton variant="lime" onClick={() => onReply("accept")} fullWidth={mobile}>
              ✓ ACCEPT
            </TActionButton>
            <TActionButton variant="ghost" onClick={() => onReply("reject")} fullWidth={mobile}
              sx={{ color: A.red, borderColor: A.red }}
            >
              ✗ REJECT
            </TActionButton>
          </>
        )}
      </Box>
    </Box>
  );
}

export default function PendingTradesTerminal() {
  const dispatch = useDispatch();
  const mobile = useIsMobile();
  const { currentLeagueId } = useSelector((s: RootState) => s.profile);
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find((l) => l.league.leagueId === currentLeagueId),
  );
  const { deadCap } = useSelector((s: RootState) => s.deadCap);
  const [trades, setTrades] = useState<TradeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentLeague) return;
    axiosInstance
      .get(
        `${URL}/dashboard/league/${currentLeague.league.leagueId}/owners/${currentLeague.leagueownerid}/mfl/${currentLeague.mflfranchiseid}/pending-trades`,
        { headers: { contentType: "application/json" } },
      )
      .then((res) => setTrades((res.data as PendingTradeResponse).tradeRequests))
      .catch((err) => console.log("error", err))
      .finally(() => setIsLoading(false));
  }, []);

  const teamFor = (franchiseId: number) =>
    deadCap.find((d) => d.franchiseId === franchiseId)?.team ?? "";

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8, background: A.bg }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ background: A.bg, padding: mobile ? "12px" : "18px", color: A.text, minHeight: "100%" }}>
      <Box sx={{ mb: "14px" }}>
        <TLabel>PENDING TRADES</TLabel>
        <Box
          sx={{
            fontSize: mobile ? 20 : dfs(24),
            fontWeight: 800,
            color: A.text,
            letterSpacing: "-0.02em",
            fontFamily: A.sans,
          }}
        >
          Review the queue
        </Box>
        <Box sx={{ fontSize: dfs(12), color: A.textDim, mt: "4px" }}>
          {trades.length} active proposal{trades.length === 1 ? "" : "s"}.
        </Box>
      </Box>

      {trades.length > 0 ? (
        trades.map((t) => (
          <TradeCard
            key={t.tradeId}
            trade={t}
            myFranchiseId={currentLeague?.mflfranchiseid}
            senderTeam={teamFor(t.senderId) || t.senderTeamName}
            receiverTeam={teamFor(t.receiverId) || t.receiverTeamName}
            mobile={mobile}
            onReply={(action) => dispatch(replyToTrade(+t.tradeId, action) as any)}
          />
        ))
      ) : (
        <TPanel sx={{ textAlign: "center", py: 6 }}>
          <TLabel>NO PENDING TRADES</TLabel>
          <Box sx={{ mt: "8px", color: A.textDim, fontSize: dfs(13) }}>
            No incoming or outgoing offers right now.
          </Box>
        </TPanel>
      )}
    </Box>
  );
}
