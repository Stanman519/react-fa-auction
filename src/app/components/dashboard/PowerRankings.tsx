import { Box, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/reducers/RootReducer";
import {
  FranchiseStandings,
  SeasonFranchiseStanding,
} from "../../redux/reducers/TransactionReducer";
import { lastYear } from "../../services/Common";
import { terminal, fontStacks } from "../../../theme";

const label = {
  fontFamily: fontStacks.mono,
  fontSize: 10,
  color: terminal.textMute,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const numSx = {
  fontFamily: fontStacks.mono,
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums" as const,
};

interface Row {
  franchiseId: number;
  team: string;
  wins: number;
  losses: number;
  pointsFor: number;
  current: SeasonFranchiseStanding | undefined;
}

export default function PowerRankings() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const ownerList = useSelector((s: RootState) => s.deadCap.deadCap);
  const leagueId = useSelector((s: RootState) => s.profile.currentLeagueId);
  const [standings, setStandings] = useState<FranchiseStandings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const thisYear = lastYear + 1;

  useEffect(() => {
    if (!leagueId) return;
    setIsLoading(true);
    setStandings([]);
    axios
      .get(
        `${process.env.REACT_APP_BOT_API_URL}/Mfl/leagues/${leagueId}/years/${thisYear}/standings`,
      )
      .then((res) => setStandings(res.data ?? []))
      .catch(() => setStandings([]))
      .finally(() => setIsLoading(false));
  }, [leagueId, thisYear]);

  const rows: Row[] = standings
    .map((s) => {
      const current = s.teamStandings.find((t) => t.year === thisYear);
      const wins = current?.h2hWins ?? 0;
      const losses = current?.h2hLosses ?? 0;
      const pointsFor = current?.pointsFor ?? 0;
      const team =
        ownerList.find((o) => o.franchiseId === s.franchiseId)?.team ?? "—";
      return {
        franchiseId: s.franchiseId,
        team,
        wins,
        losses,
        pointsFor,
        current,
      };
    })
    .sort((a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor);

  const maxWins = Math.max(1, ...rows.map((r) => r.wins));
  const noGames = rows.every((r) => r.pointsFor === 0 && r.wins === 0);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: terminal.bg,
        color: terminal.text,
        p: 2,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={label}>Power Rankings</Box>
        <Box
          sx={{
            fontFamily: fontStacks.sans,
            fontSize: 18,
            fontWeight: 700,
            color: terminal.text,
          }}
        >
          {thisYear} Season
        </Box>
      </Box>

      {noGames && (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            color: terminal.textMute,
            fontFamily: fontStacks.mono,
            fontSize: 12,
            background: terminal.panel,
            border: `1px solid ${terminal.line}`,
            borderRadius: "3px",
          }}
        >
          Rankings will appear once the season begins.
        </Box>
      )}

      {!noGames && !mobile && (
        <Box
          sx={{
            background: terminal.panel,
            border: `1px solid ${terminal.line}`,
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "40px minmax(0, 2fr) 70px 70px 1fr",
              gap: 1.25,
              alignItems: "center",
              px: 1.75,
              py: 1,
              background: terminal.panel2,
              borderBottom: `1px solid ${terminal.lineBold}`,
            }}
          >
            <Box sx={label}>#</Box>
            <Box sx={label}>Team</Box>
            <Box sx={{ ...label, textAlign: "right" }}>W-L</Box>
            <Box sx={{ ...label, textAlign: "right" }}>Pts For</Box>
            <Box sx={label}>Strength</Box>
          </Box>
          {rows.map((r, i) => (
            <Box
              key={r.franchiseId}
              sx={{
                display: "grid",
                gridTemplateColumns: "40px minmax(0, 2fr) 70px 70px 1fr",
                gap: 1.25,
                alignItems: "center",
                px: 1.75,
                py: 1,
                borderBottom: `1px solid ${terminal.line}`,
                fontFamily: fontStacks.mono,
                fontSize: 12,
                "&:hover": { background: terminal.panel2 },
              }}
            >
              <Box
                sx={{
                  ...numSx,
                  fontSize: 14,
                  color: i < 3 ? terminal.lime : terminal.textDim,
                }}
              >
                {i + 1}
              </Box>
              <Box sx={{ color: terminal.text, fontWeight: 600 }}>{r.team}</Box>
              <Box sx={{ ...numSx, textAlign: "right" }}>
                {r.wins}-{r.losses}
              </Box>
              <Box
                sx={{ ...numSx, textAlign: "right", color: terminal.textDim }}
              >
                {r.pointsFor.toFixed(0)}
              </Box>
              <Box
                sx={{
                  height: 6,
                  background: terminal.panel2,
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${(r.wins / maxWins) * 100}%`,
                    background: terminal.lime,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {!noGames && mobile && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {rows.map((r, i) => (
            <Box
              key={r.franchiseId}
              sx={{
                p: 1.5,
                background: terminal.panel,
                border: `1px solid ${terminal.line}`,
                borderRadius: "3px",
                display: "grid",
                gridTemplateColumns: "32px 1fr auto",
                gap: 1.25,
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  ...numSx,
                  fontSize: 18,
                  color: i < 3 ? terminal.lime : terminal.textDim,
                }}
              >
                {i + 1}
              </Box>
              <Box>
                <Box
                  sx={{
                    fontFamily: fontStacks.sans,
                    fontSize: 13,
                    fontWeight: 700,
                    color: terminal.text,
                  }}
                >
                  {r.team}
                </Box>
                <Box
                  sx={{
                    height: 4,
                    background: terminal.panel2,
                    borderRadius: "2px",
                    overflow: "hidden",
                    mt: 0.75,
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${(r.wins / maxWins) * 100}%`,
                      background: terminal.lime,
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Box sx={{ ...numSx, fontSize: 13, color: terminal.text }}>
                  {r.wins}-{r.losses}
                </Box>
                <Box
                  sx={{
                    ...numSx,
                    fontSize: 10,
                    color: terminal.textDim,
                  }}
                >
                  {r.pointsFor.toFixed(0)} pf
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
