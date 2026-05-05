import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { A, dfs, TERMINAL_FONT_SCALE } from "./tokens";
import TLabel from "./TLabel";
import { LEAGUE_CAP_MAX } from "../../dashboard/rosterMath";
import { lastYear, tytFor } from "../../../services/Common";

const Stat = ({
  label,
  value,
  sub,
  tone = "text",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "text" | "lime" | "amber" | "red";
}) => {
  const valueColor = { text: A.text, lime: A.lime, amber: A.amber, red: A.red }[tone];
  return (
    <Box sx={{ minWidth: 100 }}>
      <TLabel size={9}>{label}</TLabel>
      <Box
        sx={{
          fontFamily: A.mono,
          fontSize: { xs: 22, md: Math.round(28 * TERMINAL_FONT_SCALE) },
          fontWeight: 800,
          color: valueColor,
          lineHeight: 1,
          mt: "4px",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </Box>
      {sub && (
        <Box sx={{ fontFamily: A.mono, fontSize: dfs(10), color: A.textDim, mt: "4px" }}>
          {sub}
        </Box>
      )}
    </Box>
  );
};

export default function MyTeamStatStrip() {
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find((l) => l.league.leagueId === s.profile.currentLeagueId),
  );
  const ownerName = useSelector((s: RootState) => s.profile.owner.ownername);
  const deadCapList = useSelector((s: RootState) => s.deadCap.deadCap);
  const leagueId = useSelector((s: RootState) => s.profile.currentLeagueId);
  const standings = useSelector((s: RootState) =>
    leagueId ? s.triYearStandings.byLeague[leagueId]?.data ?? [] : [],
  );

  if (!currentLeague) return null;

  const capRoom = currentLeague.capRoom ?? 0;
  const capUsed = LEAGUE_CAP_MAX - capRoom;
  const yearsLeft = currentLeague.yearsLeft ?? 0;
  const myDeadCap = deadCapList.find((d) => d.franchiseId === currentLeague.mflfranchiseid);
  const futureYears = myDeadCap
    ? Object.entries(myDeadCap.amount)
        .map(([y, v]) => ({ y: Number(y), v }))
        .filter((e) => e.y >= new Date().getFullYear())
    : [];
  const deadCapTotal = futureYears.reduce((s, e) => s + e.v, 0);
  const deadCapThruYear = futureYears.length
    ? Math.max(...futureYears.map((e) => e.y))
    : new Date().getFullYear();

  const thisYear = lastYear + 1;
  const myFranchiseId = currentLeague.mflfranchiseid;
  const sortedByTyt = [...standings].sort((a, b) => tytFor(b) - tytFor(a));
  const myIdx = sortedByTyt.findIndex((s) => s.franchiseId === myFranchiseId);
  const me = sortedByTyt.find((s) => s.franchiseId === myFranchiseId);
  const triYearPts = me ? tytFor(me) : undefined;
  const triYearRank =
    myIdx >= 0 && sortedByTyt.length > 0
      ? { rank: myIdx + 1, total: sortedByTyt.length }
      : undefined;
  const currentSeason = me?.teamStandings.find((t) => t.year === thisYear);
  const record = currentSeason
    ? { wins: currentSeason.h2hWins, losses: currentSeason.h2hLosses }
    : undefined;

  const winPct = record && record.wins + record.losses > 0
    ? record.wins / (record.wins + record.losses)
    : null;
  const capPct = Math.min(100, Math.max(0, (capUsed / LEAGUE_CAP_MAX) * 100));

  return (
    <Box sx={{ background: A.panel, border: `1px solid ${A.line}`, borderRadius: "3px" }}>
      <Box
        sx={{
          padding: { xs: "12px 14px", md: "14px 18px" },
          borderBottom: `1px solid ${A.line}`,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ width: 8, height: 8, background: A.lime }} />
        <TLabel size={9}>MY TEAM</TLabel>
        <Box
          sx={{
            fontSize: { xs: 16, md: Math.round(18 * TERMINAL_FONT_SCALE) },
            fontWeight: 700,
            color: A.text,
            fontFamily: A.sans,
          }}
        >
          {currentLeague.teamName}
        </Box>
        <Box sx={{ fontFamily: A.mono, fontSize: dfs(11), color: A.textDim }}>
          @{ownerName}
          {record && ` · ${record.wins}-${record.losses}`}
        </Box>
      </Box>
      <Box
        sx={{
          padding: { xs: "14px", md: "18px" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" },
          gap: { xs: "16px", md: "20px" },
        }}
      >
        <Stat
          label="CAP USED"
          value={`$${capUsed.toFixed(1)}M`}
          sub={`of $${LEAGUE_CAP_MAX}M`}
          tone={capUsed > LEAGUE_CAP_MAX ? "red" : "lime"}
        />
        <Stat label="YEARS" value={`${yearsLeft}`} sub="of 75 max" />
        <Stat
          label="DEAD CAP"
          value={`$${deadCapTotal.toFixed(1)}M`}
          sub={`thru ${deadCapThruYear}`}
          tone="amber"
        />
        {record && (
          <Stat
            label="RECORD"
            value={`${record.wins}-${record.losses}`}
            sub={winPct != null ? winPct.toFixed(3).replace(/^0/, "") : undefined}
          />
        )}
        {triYearPts != null && (
          <Stat
            label="TRI-YEAR PTS"
            value={triYearPts.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            sub={triYearRank ? `#${triYearRank.rank} of ${triYearRank.total}` : undefined}
          />
        )}
      </Box>
      <Box sx={{ px: { xs: "14px", md: "18px" }, pb: { xs: "14px", md: "18px" } }}>
        <Box
          sx={{
            height: 4,
            background: A.panel2,
            borderRadius: "2px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${capPct}%`,
              background: capUsed > LEAGUE_CAP_MAX ? A.red : A.lime,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
