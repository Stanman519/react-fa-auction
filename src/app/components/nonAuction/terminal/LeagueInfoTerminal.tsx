import { Box } from "@mui/material";
import { useState } from "react";
import MyTeamStatStrip from "./MyTeamStatStrip";
import TriYearTrophyTerminal from "./TriYearTrophy";
import ActionQueueRail from "./ActionQueueRail";

interface Props {
  onNavigateTab: (tab: string) => void;
}

export default function LeagueInfoTerminal({ onNavigateTab }: Props) {
  const [tytInfo, setTytInfo] = useState<{
    rank?: number;
    total?: number;
    pts?: number;
    wins?: number;
    losses?: number;
  }>({});

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" },
        gap: { xs: "16px", md: "18px" },
        p: { xs: "14px", md: "18px" },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "16px", md: "18px" }, minWidth: 0 }}>
        <MyTeamStatStrip
          record={
            tytInfo.wins != null && tytInfo.losses != null
              ? { wins: tytInfo.wins, losses: tytInfo.losses }
              : undefined
          }
          triYearPts={tytInfo.pts}
          triYearRank={
            tytInfo.rank && tytInfo.total
              ? { rank: tytInfo.rank, total: tytInfo.total }
              : undefined
          }
        />
        <TriYearTrophyTerminal
          onLoaded={({ myFranchiseId, rows, currentSeason }) => {
            const sorted = [...rows].sort((a, b) => b.tytPts - a.tytPts);
            const idx = sorted.findIndex((r) => r.franchiseId === myFranchiseId);
            const me = rows.find((r) => r.franchiseId === myFranchiseId);
            setTytInfo({
              rank: idx >= 0 ? idx + 1 : undefined,
              total: rows.length,
              pts: me?.tytPts,
              wins: currentSeason?.h2hWins,
              losses: currentSeason?.h2hLosses,
            });
          }}
        />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <ActionQueueRail onNavigateTab={onNavigateTab} />
      </Box>
    </Box>
  );
}
