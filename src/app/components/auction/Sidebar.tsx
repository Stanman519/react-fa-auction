import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { terminal, fontStacks } from "../../../theme";
import { dfs, TERMINAL_FONT_SCALE } from "../nonAuction/terminal/tokens";
import { ActivityItem } from "../../redux/reducers/ActivityReducer";
import { LEAGUE_CAP_MAX } from "../dashboard/rosterMath";

const label = {
  fontFamily: fontStacks.mono,
  fontSize: { xs: 10, md: Math.round(10 * TERMINAL_FONT_SCALE) },
  color: terminal.textMute,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  mb: 1,
};

const relTime = (at: number): string => {
  const diff = Date.now() - at;
  if (diff < 60_000) return `${Math.max(1, Math.floor(diff / 1000))}s`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
};

const entryLine = (a: ActivityItem) => {
  if (a.kind === "bid")
    return `bid $${a.bidSalary}M × ${a.bidLength}YR on ${a.playerName}`;
  if (a.kind === "win")
    return `won ${a.playerName}`;
  return `nominated ${a.playerName}`;
};

interface SidebarProps {
  sortBy: string | undefined;
  onSort: (v: string) => void;
  watchCount: number;
}

export const Sidebar = ({ sortBy, onSort, watchCount }: SidebarProps) => {
  const { owner, currentLeagueId } = useSelector(
    (s: RootState) => s.profile,
  );
  const owners = useSelector((s: RootState) => s.owners);
  const lots = useSelector((s: RootState) => s.lots);
  const activity = useSelector((s: RootState) => s.activity.items);

  const currentLeague = owner.leagues.find(
    (l) => l.league.leagueId === currentLeagueId,
  );
  const myCap = currentLeague?.capRoom ?? 0;
  const myOpenBids = lots.filter(
    (l) => l.bid?.ownerId === currentLeague?.leagueownerid,
  ).length;
  const myNoms = lots.filter(
    (l) => l.nominatedBy === currentLeague?.leagueownerid,
  ).length;
  const capPct = Math.max(
    0,
    Math.min(100, ((LEAGUE_CAP_MAX - myCap) / LEAGUE_CAP_MAX) * 100),
  );

  const leagueOwners = owners.filter((o) => o.leagueownerid !== undefined);

  return (
    <Box
      sx={{
        background: terminal.panel,
        borderRight: `1px solid ${terminal.lineBold}`,
        overflowY: "auto",
        height: "100%",
      }}
    >
      {/* My position */}
      <Box sx={{ p: "14px 16px", borderBottom: `1px solid ${terminal.line}` }}>
        <Box sx={label}>My Position · {currentLeague?.teamName ?? "—"}</Box>
        <Box
          sx={{
            fontFamily: fontStacks.mono,
            fontSize: dfs(24),
            fontWeight: 800,
            color: terminal.text,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ${myCap}
          <Box component="span" sx={{ fontSize: dfs(12), color: terminal.textDim }}>
            M / ${LEAGUE_CAP_MAX}M
          </Box>
        </Box>
        <Box
          sx={{
            mt: 1,
            height: 4,
            background: terminal.panel2,
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${capPct}%`,
              height: "100%",
              background:
                capPct > 95
                  ? terminal.red
                  : capPct > 85
                    ? terminal.amber
                    : terminal.lime,
            }}
          />
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
            mt: 1.25,
            fontFamily: fontStacks.mono,
            fontSize: dfs(10),
          }}
        >
          <Box>
            <Box sx={{ color: terminal.textMute }}>NOMS</Box>
            <Box
              sx={{
                color: terminal.lime,
                fontSize: dfs(13),
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {myNoms}
            </Box>
          </Box>
          <Box>
            <Box sx={{ color: terminal.textMute }}>OPEN BIDS</Box>
            <Box
              sx={{
                color: terminal.text,
                fontSize: dfs(13),
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {myOpenBids}
            </Box>
          </Box>
          <Box>
            <Box sx={{ color: terminal.textMute }}>WATCH</Box>
            <Box
              sx={{
                color: terminal.text,
                fontSize: dfs(13),
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {watchCount}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Sort */}
      <Box sx={{ p: "14px 16px", borderBottom: `1px solid ${terminal.line}` }}>
        <Box sx={label}>Sort</Box>
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          size="small"
          onChange={(_e, v) => v && onSort(v)}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0.5,
            "& .MuiToggleButton-root": {
              fontFamily: fontStacks.mono,
              fontSize: 10,
              py: 0.5,
              px: 1,
              border: `1px solid ${terminal.line}`,
              color: terminal.textDim,
              borderRadius: "2px",
              "&.Mui-selected": {
                background: terminal.limeDim,
                color: terminal.lime,
                borderColor: terminal.lime,
              },
            },
          }}
        >
          <ToggleButton value="time">TIME</ToggleButton>
          <ToggleButton value="salary">$</ToggleButton>
          <ToggleButton value="position">POS</ToggleButton>
          <ToggleButton value="bids">MY BIDS</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* League caps */}
      {leagueOwners.length > 0 && (
        <Box
          sx={{ p: "14px 16px", borderBottom: `1px solid ${terminal.line}` }}
        >
          <Box sx={label}>League Caps</Box>
          {leagueOwners.map((o) => {
            const pct = Math.max(
              0,
              Math.min(
                100,
                ((LEAGUE_CAP_MAX - (o.capRoom ?? 0)) / LEAGUE_CAP_MAX) * 100,
              ),
            );
            return (
              <Box
                key={o.leagueownerid}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.5,
                  fontFamily: fontStacks.mono,
                  fontSize: dfs(11),
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: terminal.text,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {o.ownerName}
                </Box>
                <Box
                  sx={{ width: 50, height: 3, background: terminal.panel2 }}
                >
                  <Box
                    sx={{
                      width: `${pct}%`,
                      height: "100%",
                      background:
                        pct > 95
                          ? terminal.red
                          : pct > 85
                            ? terminal.amber
                            : terminal.lime,
                    }}
                  />
                </Box>
                <Box
                  component="span"
                  sx={{
                    color: terminal.textDim,
                    width: 36,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ${o.capRoom ?? 0}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Feed */}
      <Box sx={{ p: "14px 16px" }}>
        <Box sx={label}>Live Bids</Box>
        {activity.length === 0 && (
          <Box
            sx={{
              fontFamily: fontStacks.mono,
              fontSize: dfs(11),
              color: terminal.textMute,
              fontStyle: "italic",
            }}
          >
            no bids yet
          </Box>
        )}
        {activity.slice(0, 8).map((a) => (
          <Box
            key={a.id}
            sx={{
              py: 0.75,
              borderBottom: `1px solid ${terminal.line}`,
              fontSize: dfs(11),
              lineHeight: 1.4,
            }}
          >
            <Box
              sx={{ display: "flex", gap: 0.75, alignItems: "baseline" }}
            >
              <Box
                component="span"
                sx={{
                  color: terminal.text,
                  fontWeight: 600,
                  fontFamily: fontStacks.mono,
                }}
              >
                @{a.ownername}
              </Box>
              <Box
                component="span"
                sx={{
                  color: terminal.textMute,
                  fontFamily: fontStacks.mono,
                  fontSize: dfs(9),
                  ml: "auto",
                }}
              >
                {relTime(a.at)}
              </Box>
            </Box>
            <Box
              component="span"
              sx={{ color: terminal.textDim, fontFamily: fontStacks.sans }}
            >
              {entryLine(a)}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
