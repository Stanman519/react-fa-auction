import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Slider } from "@mui/material";
import axios from "axios";
import { axiosInstance } from "../../services/axiosInstance";
import {
  DashboardTradeLeagueDTO,
  MflFranchise,
  PendingTradeResponse,
  TradeBaitDTO,
  TradeOfferAsset,
  TradeRequest,
} from "../../models/MflModels";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import { URL } from "../../services/AuctionApiSvc";
import { submitTradeRequest } from "../../redux/actions/TransactionActions";
import { RootState } from "../../redux/reducers/RootReducer";
import {
  A,
  dfs,
  TPanel,
  TLabel,
  TMathCell,
  TPosBadge,
  TActionButton,
  useIsMobile,
} from "./terminal";

const isPickId = (id: string) => id.startsWith("DP_") || id.startsWith("FP_");

function PartnerPill({
  franchise,
  active,
  onClick,
}: {
  franchise: MflFranchise;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      role="button"
      onClick={onClick}
      sx={{
        padding: "6px 10px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: active ? A.panel2 : "transparent",
        border: `1px solid ${active ? A.lime : A.line}`,
        color: active ? A.text : A.textDim,
        fontFamily: A.mono,
        fontSize: dfs(11),
        cursor: "pointer",
        borderRadius: "2px",
        whiteSpace: "nowrap",
        "&:hover": { borderColor: A.lineBold, color: A.text },
      }}
    >
      <Box
        sx={{ width: 6, height: 6, background: active ? A.lime : A.textDim }}
      />
      {franchise.name}
    </Box>
  );
}

function AssetRow({
  label,
  sub,
  pos,
  selected,
  onToggle,
}: {
  label: string;
  sub?: string;
  pos?: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 8px",
        cursor: "pointer",
        background: selected ? A.panel2 : "transparent",
        border: `1px solid ${selected ? A.lime : "transparent"}`,
        borderRadius: "2px",
        "&:hover": { background: A.panel2 },
      }}
    >
      <Box
        sx={{
          width: 12,
          height: 12,
          border: `1px solid ${selected ? A.lime : A.lineBold}`,
          background: selected ? A.lime : "transparent",
          flexShrink: 0,
        }}
      />
      {pos && <TPosBadge pos={pos} />}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            fontSize: dfs(12),
            color: A.text,
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Box>
        {sub && (
          <Box sx={{ fontSize: dfs(10), color: A.textDim, fontFamily: A.mono }}>
            {sub}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function SidePanel({
  title,
  accent,
  franchiseName,
  players,
  picks,
  selected,
  onToggle,
  estValue,
  mobile,
}: {
  title: string;
  accent: string;
  franchiseName: string;
  players: PlayerDTO[];
  picks: { pick: string; description: string }[];
  selected: TradeOfferAsset[];
  onToggle: (assetId: string, checked: boolean) => void;
  estValue: number;
  mobile: boolean;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        background: A.panel,
        border: `1px solid ${A.line}`,
        padding: mobile ? "12px" : "14px",
        display: "flex",
        flexDirection: "column",
        minHeight: 320,
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "10px" }}
      >
        <Box sx={{ width: 8, height: 8, background: accent }} />
        <TLabel>{title}</TLabel>
      </Box>
      <Box
        sx={{
          fontSize: mobile ? 14 : dfs(16),
          fontWeight: 700,
          color: A.text,
          mb: "10px",
        }}
      >
        {franchiseName || "—"}
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          maxHeight: 360,
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {players.map((p) => {
          const id = p.mflId.toString();
          return (
            <AssetRow
              key={id}
              pos={p.position}
              label={p.fullName || `MFL #${id}`}
              sub={`${p.team ?? "—"} · $${p.salary ?? 0}M × ${p.length ?? 0}YR`}
              selected={!!selected.find((s) => s.mflId === id)}
              onToggle={() =>
                onToggle(id, !selected.find((s) => s.mflId === id))
              }
            />
          );
        })}
        {picks.map((dp) => (
          <AssetRow
            key={dp.pick}
            pos="PICK"
            label={dp.description}
            selected={!!selected.find((s) => s.mflId === dp.pick)}
            onToggle={() =>
              onToggle(dp.pick, !selected.find((s) => s.mflId === dp.pick))
            }
          />
        ))}
      </Box>
      <Box
        sx={{
          borderTop: `1px solid ${A.line}`,
          mt: "10px",
          pt: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <TLabel>
          EST VALUE · {selected.length} ASSET{selected.length === 1 ? "" : "S"}
        </TLabel>
        <Box
          sx={{
            fontFamily: A.mono,
            fontWeight: 700,
            fontSize: dfs(13),
            color: A.text,
          }}
        >
          ${estValue.toFixed(0)}M
        </Box>
      </Box>
    </Box>
  );
}

function CapEatsBlock({
  assets,
  onSliderChange,
  retainerLabel,
}: {
  assets: TradeOfferAsset[];
  onSliderChange: (assetIdx: number, capEatIdx: number, value: number) => void;
  retainerLabel: string;
}) {
  const playersWithEats = assets.filter(
    (a) => !isPickId(a.mflId) && a.capEats && a.capEats.length > 0,
  );
  if (playersWithEats.length === 0) return null;
  return (
    <TPanel sx={{ mb: "14px" }}>
      <TLabel>SALARY RETAINED BY {retainerLabel.toUpperCase()}</TLabel>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          mt: "10px",
        }}
      >
        {assets.map((a, assetIdx) => {
          if (isPickId(a.mflId) || !a.capEats?.length) return null;
          const max = a.playerDetails?.salary ?? 0;
          return (
            <Box key={a.mflId}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  mb: "6px",
                }}
              >
                {a.playerDetails?.position && (
                  <TPosBadge pos={a.playerDetails.position} />
                )}
                <Box sx={{ fontSize: dfs(12), color: A.text, fontWeight: 600 }}>
                  {a.playerDetails?.fullName ?? a.mflId}
                </Box>
                <Box
                  sx={{
                    fontSize: dfs(10),
                    color: A.textDim,
                    fontFamily: A.mono,
                  }}
                >
                  · max ${max}M
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  pl: "8px",
                }}
              >
                {a.capEats.map((ce, capEatIdx) => (
                  <Box
                    key={ce.year}
                    sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <Box
                      sx={{
                        fontFamily: A.mono,
                        fontSize: dfs(11),
                        color: A.textDim,
                        minWidth: 40,
                      }}
                    >
                      {ce.year}
                    </Box>
                    <Slider
                      size="small"
                      value={ce.amount}
                      max={max}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `$${v}M`}
                      onChange={(_, v) =>
                        onSliderChange(assetIdx, capEatIdx, v as number)
                      }
                      sx={{
                        color: A.amber,
                        flex: 1,
                        "& .MuiSlider-thumb": { borderRadius: "2px" },
                      }}
                    />
                    <Box
                      sx={{
                        fontFamily: A.mono,
                        fontSize: dfs(11),
                        color: A.amber,
                        minWidth: 40,
                        textAlign: "right",
                      }}
                    >
                      ${ce.amount}M
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </TPanel>
  );
}

export default function AdvancedContractTradesTerminal() {
  const dispatch = useDispatch();
  const mobile = useIsMobile();
  const { currentLeagueId } = useSelector((s: RootState) => s.profile);
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find((l) => l.league.leagueId === currentLeagueId),
  );
  const { deadCap } = useSelector((s: RootState) => s.deadCap);

  const [mflLeagueRoot, setMflLeagueRoot] = useState<
    DashboardTradeLeagueDTO | undefined
  >(undefined);
  const [franchises, setFranchises] = useState<MflFranchise[]>([]);
  const [tradeTeamId, setTradeTeamId] = useState<string>("");
  const [tradeBait, setTradeBait] = useState<TradeBaitDTO[]>([]);
  const [pendingTrades, setPendingTrades] = useState<TradeRequest[]>([]);
  const [mySelected, setMySelected] = useState<TradeOfferAsset[]>([]);
  const [otherSelected, setOtherSelected] = useState<TradeOfferAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const myFranchiseIdStr = `${currentLeague?.mflfranchiseid ?? ""}`.padStart(
    4,
    "0",
  );

  useEffect(() => {
    if (!currentLeague) return;
    const year = new Date().getFullYear();
    const fetchData = axiosInstance
      .get<DashboardTradeLeagueDTO>(
        `${URL}/dashboard/leagues/${currentLeague.league.leagueId}/years/${year}/franchises/${currentLeague.mflfranchiseid}/full-mfl-league`,
      )
      .then((res) => {
        setMflLeagueRoot(res.data);
        setFranchises(res.data.franchises);
      })
      .catch((err) => console.error("Error fetching league:", err));

    const fetchPending = axiosInstance
      .get(
        `${URL}/dashboard/league/${currentLeague.league.leagueId}/owners/${currentLeague.leagueownerid}/mfl/${currentLeague.mflfranchiseid}/pending-trades`,
        { headers: { contentType: "application/json" } },
      )
      .then((res) =>
        setPendingTrades((res.data as PendingTradeResponse).tradeRequests),
      )
      .catch(() => undefined);

    const fetchBait = axiosInstance
      .get<TradeBaitDTO[]>(
        `${URL}/dashboard/leagues/${currentLeague.league.leagueId}/trade-bait`,
      )
      .then((res) => setTradeBait(res.data))
      .catch(() => undefined);

    Promise.all([fetchData, fetchPending, fetchBait]).finally(() =>
      setIsLoading(false),
    );
  }, []);

  // Hydrate partner roster names on partner change
  useEffect(() => {
    if (!mflLeagueRoot || !tradeTeamId) return;
    const newTeam = mflLeagueRoot.franchises.find((t) => t.id === tradeTeamId);
    if (!newTeam) return;
    if (
      !newTeam.assets.players ||
      newTeam.assets.players.some((p) => !p.fullName)
    ) {
      const playerIds = newTeam.assets.players.map((p) => p.mflId).join(",");
      const year = new Date().getFullYear();
      axiosInstance
        .get<PlayerDTO[]>(
          `${URL}/dashboard/leagues/${currentLeague?.league.leagueId}/years/${year}/playerIds/${playerIds}`,
        )
        .then((res) => {
          const data = res.data;
          newTeam.assets.players.forEach((a) => {
            const fp = data.find((d) => d.mflId == a.mflId);
            if (fp) {
              a.fullName = fp.fullName;
              a.age = fp.age;
              a.position = fp.position;
              a.team = fp.team;
            }
          });
          const idx = mflLeagueRoot.franchises.findIndex(
            (t) => t.id === tradeTeamId,
          );
          const newLeague = { ...mflLeagueRoot };
          if (idx >= 0) newLeague.franchises[idx] = newTeam;
          setMflLeagueRoot(newLeague);
        })
        .catch((err) => console.log("error", err));
    }
  }, [tradeTeamId]);

  const myFranchise = franchises.find((f) => f.id === myFranchiseIdStr);
  const partnerFranchise = franchises.find((f) => f.id === tradeTeamId);

  const myPlayers = useMemo(
    () =>
      [...(myFranchise?.assets.players ?? [])].sort((a, b) =>
        (a.position ?? "").localeCompare(b.position ?? ""),
      ),
    [myFranchise],
  );
  const myPicks = useMemo(
    () => [
      ...(myFranchise?.assets.currentYearDraftPicks ?? []),
      ...(myFranchise?.assets.futureYearDraftPicks ?? []),
    ],
    [myFranchise],
  );
  const partnerPlayers = useMemo(
    () =>
      [...(partnerFranchise?.assets.players ?? [])].sort((a, b) =>
        (a.position ?? "").localeCompare(b.position ?? ""),
      ),
    [partnerFranchise],
  );
  const partnerPicks = useMemo(
    () => [
      ...(partnerFranchise?.assets.currentYearDraftPicks ?? []),
      ...(partnerFranchise?.assets.futureYearDraftPicks ?? []),
    ],
    [partnerFranchise],
  );

  const toggleAsset = (
    side: "mine" | "other",
    assetId: string,
    checked: boolean,
  ) => {
    const sourceFranchiseId = side === "mine" ? myFranchiseIdStr : tradeTeamId;
    const sourceFranchise = franchises.find((f) => f.id === sourceFranchiseId);
    const setSelected = side === "mine" ? setMySelected : setOtherSelected;
    const eaterId =
      side === "mine" ? (currentLeague?.mflfranchiseid ?? 0) : +tradeTeamId;
    const receiverId =
      side === "mine" ? +tradeTeamId : (currentLeague?.mflfranchiseid ?? 0);

    if (!checked) {
      setSelected((prev) => prev.filter((a) => a.mflId !== assetId));
      return;
    }
    if (!sourceFranchise) return;

    if (isPickId(assetId)) {
      const pk = [
        ...sourceFranchise.assets.currentYearDraftPicks,
        ...sourceFranchise.assets.futureYearDraftPicks,
      ].find((p) => p.pick === assetId);
      const newPick = {
        mflId: pk?.pick ?? assetId,
        playerDetails: { fullName: pk?.description } as PlayerDTO,
        capEats: [],
      } as unknown as TradeOfferAsset;
      setSelected((prev) => [...prev, newPick]);
      return;
    }

    const np = sourceFranchise.assets.players.find((p) => p.mflId === +assetId);
    if (!np) return;
    const year = new Date().getFullYear();
    const years = Array.from({ length: np.length ?? 0 }, (_, i) => year + i);
    const npAsset: TradeOfferAsset = {
      mflId: np.mflId.toString(),
      playerDetails: np,
      capEats: years.map((y) => ({
        amount: 0,
        eaterId,
        receiverId,
        year: y,
        mflId: np.mflId,
      })),
    };
    setSelected((prev) => [...prev, npAsset]);
  };

  const handleSliderChange = (
    side: "mine" | "other",
    assetIdx: number,
    capEatIdx: number,
    value: number,
  ) => {
    const setter = side === "mine" ? setMySelected : setOtherSelected;
    setter((prev) => {
      const updated = [...prev];
      const newCapEats = [...updated[assetIdx].capEats];
      newCapEats[capEatIdx] = { ...newCapEats[capEatIdx], amount: value };
      updated[assetIdx] = { ...updated[assetIdx], capEats: newCapEats };
      return updated;
    });
  };

  const myCapInfo = deadCap.find(
    (d) => d.franchiseId === currentLeague?.mflfranchiseid,
  );
  const capRoom = myCapInfo?.capRoom ?? 0;
  const myOutgoingSalary = mySelected
    .filter((a) => !isPickId(a.mflId))
    .reduce((s, a) => s + (a.playerDetails?.salary ?? 0), 0);
  const myIncomingSalary = otherSelected
    .filter((a) => !isPickId(a.mflId))
    .reduce((s, a) => s + (a.playerDetails?.salary ?? 0), 0);
  const capDelta = myIncomingSalary - myOutgoingSalary;
  const newCap = capRoom - capDelta;

  const submit = () => {
    if (!currentLeague) return;
    dispatch(
      submitTradeRequest({
        leagueId: currentLeague.league.leagueId,
        receiverId: Number(tradeTeamId),
        senderId: currentLeague.mflfranchiseid,
        sendingAssets: mySelected,
        receivingAssets: otherSelected,
        senderTeamName: currentLeague.teamName ?? "",
        receiverTeamName: partnerFranchise?.name ?? "",
        expires: 0,
        tradeId: "",
      }) as any,
    );
    setMySelected([]);
    setOtherSelected([]);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 8,
          background: A.bg,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const tradablePartners = franchises.filter(
    (f) => +f.id !== currentLeague?.mflfranchiseid,
  );
  const canSubmit =
    !!tradeTeamId && (mySelected.length > 0 || otherSelected.length > 0);

  return (
    <Box
      sx={{
        background: A.bg,
        padding: mobile ? "12px" : "18px",
        color: A.text,
        minHeight: "100%",
      }}
    >
      <Box
        sx={{
          mb: "14px",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <Box>
          <TLabel>NEW TRADE PROPOSAL</TLabel>
          <Box
            sx={{
              fontSize: mobile ? 20 : dfs(24),
              fontWeight: 800,
              color: A.text,
              letterSpacing: "-0.02em",
            }}
          >
            Build a deal
          </Box>
        </Box>
        <Box sx={{ fontFamily: A.mono, fontSize: dfs(10), color: A.textDim }}>
          {pendingTrades.length} PENDING · DRAFT MODE
        </Box>
      </Box>

      <TPanel sx={{ mb: "14px" }}>
        <TLabel>TRADE WITH</TLabel>
        <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap", mt: "8px" }}>
          {tradablePartners.length === 0 && (
            <Box
              sx={{ color: A.textDim, fontFamily: A.mono, fontSize: dfs(11) }}
            >
              No partners available.
            </Box>
          )}
          {tradablePartners.map((f) => (
            <PartnerPill
              key={f.id}
              franchise={f}
              active={tradeTeamId === f.id}
              onClick={() => {
                setTradeTeamId(f.id);
                setOtherSelected([]);
              }}
            />
          ))}
        </Box>
        {tradeTeamId &&
          (() => {
            const bait = tradeBait.find((tb) => tb.franchiseId === tradeTeamId);
            if (!bait) return null;
            return (
              <Box
                sx={{
                  mt: "10px",
                  fontFamily: A.mono,
                  fontSize: dfs(11),
                  color: A.textDim,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {bait.willGiveUp && (
                  <Box>
                    <Box component="span" sx={{ color: A.amber, mr: "6px" }}>
                      OFFERING
                    </Box>
                    {bait.willGiveUp}
                  </Box>
                )}
                {bait.inExchangeFor && (
                  <Box>
                    <Box component="span" sx={{ color: A.lime, mr: "6px" }}>
                      WANTS
                    </Box>
                    {bait.inExchangeFor}
                  </Box>
                )}
              </Box>
            );
          })()}
      </TPanel>

      <Box
        sx={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          gap: "12px",
          mb: "14px",
        }}
      >
        <SidePanel
          title="YOU SEND"
          accent={A.amber}
          franchiseName={currentLeague?.teamName ?? myFranchise?.name ?? ""}
          players={myPlayers}
          picks={myPicks}
          selected={mySelected}
          onToggle={(id, checked) => toggleAsset("mine", id, checked)}
          estValue={0}
          mobile={mobile}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: A.lime,
            fontSize: dfs(24),
            fontWeight: 700,
            padding: mobile ? "8px 0" : "0 8px",
          }}
        >
          {mobile ? "↕" : "⇄"}
        </Box>
        <SidePanel
          title="YOU RECEIVE"
          accent={A.lime}
          franchiseName={partnerFranchise?.name ?? "—"}
          players={partnerPlayers}
          picks={partnerPicks}
          selected={otherSelected}
          onToggle={(id, checked) => toggleAsset("other", id, checked)}
          estValue={0}
          mobile={mobile}
        />
      </Box>

      <TPanel sx={{ mb: "14px" }}>
        <TLabel>CAP IMPACT · YOU</TLabel>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: "12px",
            mt: "10px",
          }}
        >
          <TMathCell label="CAP ROOM" value={`$${capRoom.toFixed(0)}M`} />
          <TMathCell
            label="AFTER TRADE"
            value={`$${newCap.toFixed(0)}M`}
            tone={newCap < 0 ? "red" : capDelta > 0 ? "amber" : "lime"}
          />
          <TMathCell
            label="DELTA"
            value={`${capDelta > 0 ? "+" : ""}$${capDelta.toFixed(1)}M`}
            tone={capDelta === 0 ? "text" : capDelta > 0 ? "amber" : "lime"}
          />
          <TMathCell
            label="ROSTER Δ"
            value={`${otherSelected.filter((a) => !isPickId(a.mflId)).length - mySelected.filter((a) => !isPickId(a.mflId)).length}`}
          />
        </Box>
      </TPanel>

      <CapEatsBlock
        assets={mySelected}
        onSliderChange={(i, j, v) => handleSliderChange("mine", i, j, v)}
        retainerLabel={currentLeague?.teamName ?? "YOU"}
      />
      <CapEatsBlock
        assets={otherSelected}
        onSliderChange={(i, j, v) => handleSliderChange("other", i, j, v)}
        retainerLabel={partnerFranchise?.name ?? "PARTNER"}
      />

      <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", mb: "24px" }}>
        <TActionButton
          variant="lime"
          onClick={submit}
          disabled={!canSubmit}
          fullWidth={mobile}
          sx={{ flex: mobile ? "1 1 100%" : "0 0 auto" }}
        >
          SEND PROPOSAL →
        </TActionButton>
        <TActionButton
          variant="ghost"
          onClick={() => {
            setMySelected([]);
            setOtherSelected([]);
            setTradeTeamId("");
          }}
          sx={{ color: A.red, borderColor: A.line }}
        >
          DISCARD
        </TActionButton>
      </Box>

      {tradeBait.length > 0 && (
        <Box>
          <TLabel sx={{ display: "block", mb: "8px" }}>
            LEAGUE TRADE BLOCK · {tradeBait.length} LISTED
          </TLabel>
          <Box sx={{ background: A.panel, border: `1px solid ${A.line}` }}>
            {tradeBait.map((b, i) => {
              const f = franchises.find((fr) => fr.id === b.franchiseId);
              return (
                <Box
                  key={`${b.franchiseId}-${i}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr" : "1.2fr 1.5fr 1.5fr",
                    gap: "10px",
                    padding: "10px 12px",
                    borderBottom:
                      i === tradeBait.length - 1
                        ? "none"
                        : `1px solid ${A.line}`,
                    fontFamily: A.mono,
                    fontSize: dfs(11),
                    alignItems: "start",
                  }}
                >
                  <Box sx={{ color: A.text, fontWeight: 600 }}>
                    {f?.name ?? `#${b.franchiseId}`}
                  </Box>
                  <Box>
                    <Box
                      sx={{
                        color: A.amber,
                        fontSize: dfs(9),
                        letterSpacing: "0.08em",
                      }}
                    >
                      OFFERING
                    </Box>
                    <Box sx={{ color: A.textDim }}>{b.willGiveUp || "—"}</Box>
                  </Box>
                  <Box>
                    <Box
                      sx={{
                        color: A.lime,
                        fontSize: dfs(9),
                        letterSpacing: "0.08em",
                      }}
                    >
                      WANTS
                    </Box>
                    <Box sx={{ color: A.textDim }}>
                      {b.inExchangeFor || "—"}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
