import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { A, dfs } from "./tokens";
import TLabel from "./TLabel";
import TActionButton from "./TActionButton";

type ActionKind = "HOLDOUT" | "TAG" | "WAIVER" | "BUYOUT";

interface Item {
  kind: ActionKind;
  title: string;
  detail: string;
  tab: string;
  tone: "lime" | "amber" | "red";
}

const kindTone: Record<ActionKind, "lime" | "amber" | "red"> = {
  HOLDOUT: "red",
  TAG: "amber",
  WAIVER: "amber",
  BUYOUT: "amber",
};

interface Props {
  onNavigateTab: (tab: string) => void;
}

const ItemCard = ({ item, onReview }: { item: Item; onReview: () => void }) => {
  const toneColor = { lime: A.lime, amber: A.amber, red: A.red }[item.tone];
  return (
    <Box
      sx={{
        background: A.panel,
        border: `1px solid ${A.line}`,
        borderLeft: `3px solid ${toneColor}`,
        p: "12px 14px",
        mb: "10px",
      }}
    >
      <Box
        sx={{
          fontFamily: A.mono,
          fontSize: dfs(9),
          fontWeight: 700,
          color: toneColor,
          letterSpacing: "0.08em",
          mb: "6px",
        }}
      >
        {item.kind}
      </Box>
      <Box
        sx={{ fontSize: dfs(13), fontWeight: 700, color: A.text, mb: "4px" }}
      >
        {item.title}
      </Box>
      <Box
        sx={{
          fontSize: dfs(11),
          color: A.textDim,
          fontFamily: A.sans,
          mb: "10px",
          lineHeight: 1.4,
        }}
      >
        {item.detail}
      </Box>
      <TActionButton variant="lime" dense onClick={onReview}>
        REVIEW
      </TActionButton>
    </Box>
  );
};

export default function ActionQueueRail({ onNavigateTab }: Props) {
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find(
      (l) => l.league.leagueId === s.profile.currentLeagueId,
    ),
  );
  const recentMovesAll = useSelector((s: RootState) => s.recentMoves);
  const ownerList = useSelector((s: RootState) => s.deadCap.deadCap);

  if (!currentLeague) return null;

  const items: Item[] = [];

  (currentLeague.holdoutCandidates ?? [])
    .filter((h) => h.status === "Pending")
    .forEach((h) => {
      const raise = h.holdoutSalary - h.originalSalary;
      items.push({
        kind: "HOLDOUT",
        title: `${h.player.fullName} holding out`,
        detail: `Demands $${h.holdoutSalary}M (+$${raise.toFixed(0)}M raise) or sits.`,
        tab: "holdouts",
        tone: kindTone.HOLDOUT,
      });
    });

  const tagCount = currentLeague.tagCandidates?.length ?? 0;
  if (tagCount > 0) {
    const sample = currentLeague
      .tagCandidates!.slice(0, 2)
      .map((t) => `${t.player.fullName} ($${t.tagAmount}M)`)
      .join(", ");
    items.push({
      kind: "TAG",
      title: "Franchise tag window open",
      detail: `${tagCount} eligible — ${sample}${tagCount > 2 ? "…" : ""}`,
      tab: "tags",
      tone: kindTone.TAG,
    });
  }

  (currentLeague.waiverExtensionPlayers ?? []).forEach((p) => {
    items.push({
      kind: "WAIVER",
      title: `Waiver extension: ${p.fullName}`,
      detail: `Extend at $${p.salary ?? 0}M/yr or release to FA.`,
      tab: "waiver",
      tone: kindTone.WAIVER,
    });
  });

  (currentLeague.cutCandidates ?? []).forEach((p) => {
    items.push({
      kind: "BUYOUT",
      title: `Buyout candidate: ${p.fullName}`,
      detail: `${p.position} · $${p.salary ?? 0}M × ${p.length ?? 0}YR`,
      tab: "buyouts",
      tone: kindTone.BUYOUT,
    });
  });

  const recentMoves = [...recentMovesAll]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 6);

  const teamFor = (franchiseId: number) =>
    ownerList.find((o) => o.franchiseId === franchiseId)?.team ??
    `#${franchiseId}`;

  const moveText = (t: (typeof recentMoves)[number]) => {
    if (t.action === "DROP") return `cut ${t.playerName}`;
    const salary = t.salary != null ? `$${t.salary}M` : "—";
    const yrs = t.years != null ? `${t.years}YR` : "—";
    return `signed ${t.playerName} · ${salary} × ${yrs}`;
  };

  const moveAge = (timestamp: Date | string) => {
    const ms = Date.now() - new Date(timestamp).getTime();
    const days = Math.floor(ms / 86400000);
    if (days < 1) {
      const hrs = Math.floor(ms / 3600000);
      return hrs <= 0 ? "just now" : `${hrs}h ago`;
    }
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  return (
    <Box>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "10px" }}
      >
        <Box
          sx={{ width: 6, height: 6, background: A.lime, borderRadius: "50%" }}
        />
        <TLabel size={10}>YOUR ACTION QUEUE</TLabel>
        <Box
          sx={{
            ml: "auto",
            background: items.length > 0 ? A.lime : A.line,
            color: items.length > 0 ? "#000" : A.textDim,
            fontFamily: A.mono,
            fontSize: dfs(10),
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: "2px",
          }}
        >
          {items.length}
        </Box>
      </Box>

      {items.length === 0 ? (
        <Box
          sx={{
            background: A.panel,
            border: `1px solid ${A.line}`,
            p: "16px 14px",
            mb: "16px",
            fontFamily: A.mono,
            fontSize: dfs(11),
            color: A.textMute,
            textAlign: "center",
          }}
        >
          NO ACTIONS PENDING
        </Box>
      ) : (
        items.map((it, i) => (
          <ItemCard key={i} item={it} onReview={() => onNavigateTab(it.tab)} />
        ))
      )}

      <Box sx={{ mt: "20px" }}>
        <TLabel size={10}>RECENT LEAGUE MOVES</TLabel>
        <Box
          sx={{
            mt: "8px",
            background: A.panel,
            border: `1px solid ${A.line}`,
          }}
        >
          {recentMoves.length === 0 ? (
            <Box
              sx={{
                p: "12px 14px",
                fontFamily: A.mono,
                fontSize: dfs(11),
                color: A.textMute,
              }}
            >
              no recent activity
            </Box>
          ) : (
            recentMoves.map((t, i) => (
              <Box
                key={`move-${i}-${t.mflPlayerId}-${t.timestamp}`}
                sx={{
                  p: "10px 14px",
                  borderBottom:
                    i === recentMoves.length - 1
                      ? "none"
                      : `1px solid ${A.line}`,
                  fontFamily: A.mono,
                  fontSize: dfs(11),
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ color: A.lime }}>{teamFor(t.franchiseId)}</Box>
                  <Box
                    sx={{
                      color: A.textDim,
                      fontSize: dfs(10),
                      mt: "2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {moveText(t)}
                  </Box>
                </Box>
                <Box
                  sx={{
                    color: A.textMute,
                    fontSize: dfs(10),
                    whiteSpace: "nowrap",
                  }}
                >
                  {moveAge(t.timestamp)}
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
}
