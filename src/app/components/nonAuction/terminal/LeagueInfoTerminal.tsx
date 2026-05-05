import { Box } from "@mui/material";
import MyTeamStatStrip from "./MyTeamStatStrip";
import TriYearTrophyTerminal from "./TriYearTrophy";
import ActionQueueRail from "./ActionQueueRail";

interface Props {
  onNavigateTab: (tab: string) => void;
}

export default function LeagueInfoTerminal({ onNavigateTab }: Props) {
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
        <MyTeamStatStrip />
        <TriYearTrophyTerminal />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <ActionQueueRail onNavigateTab={onNavigateTab} />
      </Box>
    </Box>
  );
}
