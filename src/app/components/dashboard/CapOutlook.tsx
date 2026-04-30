import { useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RootState } from "../../store";
import { terminal, fontStacks } from "../../../theme";
import {
  capHitsBySegment,
  CapSegKey,
  LEAGUE_CAP_MAX,
  YEARS_SHOWN,
} from "./rosterMath";

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

interface YearRow {
  year: number;
  qb: number;
  rb: number;
  wr: number;
  te: number;
  taxi: number;
  ir: number;
  dead: number;
  active: number; // qb+rb+wr+te+taxi+ir
  total: number;
  overCap: boolean;
}

const SEG: Record<CapSegKey | "dead", string> = {
  qb:   "#e8538a",
  rb:   "#2ca579",
  wr:   "#4a90e2",
  te:   "#c47a2b",
  taxi: "#d4b84a",
  ir:   "#9b59b6",
  dead: "#666688",
};

type SegDef = { key: keyof YearRow; label: string; color: string };

const SEGS_ORDERED: SegDef[] = [
  { key: "qb",   label: "QB",   color: SEG.qb },
  { key: "rb",   label: "RB",   color: SEG.rb },
  { key: "wr",   label: "WR",   color: SEG.wr },
  { key: "te",   label: "TE",   color: SEG.te },
  { key: "taxi", label: "Taxi", color: SEG.taxi },
  { key: "ir",   label: "IR",   color: SEG.ir },
  { key: "dead", label: "Dead", color: SEG.dead },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as YearRow;
  const headroom = LEAGUE_CAP_MAX - d.total;
  return (
    <Box
      sx={{
        background: terminal.panel,
        border: `1px solid ${terminal.lineBold}`,
        p: 1.25,
        fontFamily: fontStacks.mono,
        fontSize: 11,
        color: terminal.text,
        minWidth: 180,
      }}
    >
      <Box sx={{ ...label, fontSize: 10, mb: 0.5 }}>{d.year}</Box>
      {SEGS_ORDERED.filter((s) => (d[s.key] as number) > 0).map((s) => (
        <Row key={s.key} k={s.label} v={`$${d[s.key]}M`} c={s.color} />
      ))}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pt: 0.5,
          mt: 0.5,
          borderTop: `1px solid ${terminal.line}`,
        }}
      >
        <Box>TOTAL</Box>
        <Box sx={numSx}>${d.total}M</Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ color: terminal.textDim }}>vs $500 cap</Box>
        <Box
          sx={{
            ...numSx,
            color: headroom < 0 ? terminal.red : terminal.lime,
          }}
        >
          {headroom >= 0 ? `+$${headroom}M` : `-$${Math.abs(headroom)}M`}
        </Box>
      </Box>
    </Box>
  );
};

const Row = ({ k, v, c }: { k: string; v: string; c: string }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ width: 8, height: 8, background: c, borderRadius: "1px" }} />
      <Box>{k}</Box>
    </Box>
    <Box sx={numSx}>{v}</Box>
  </Box>
);

const LegendSwatch = ({
  color,
  name,
}: {
  color: string;
  name: string;
}) => (
  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
    <Box sx={{ width: 10, height: 10, background: color, borderRadius: "1px" }} />
    <Box sx={{ ...label, fontSize: 10, color: terminal.textDim }}>{name}</Box>
  </Box>
);

export const CapOutlook = () => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const { currentLeagueId, owner } = useSelector((s: RootState) => s.profile);
  const { deadCap } = useSelector((s: RootState) => s.deadCap);
  const rostersState = useSelector((s: RootState) => s.rosters);
  const rosters = rostersState.data;
  const loading = rosters === null;

  const currentLeague = owner.leagues.find(
    (l) => l.league.leagueId === currentLeagueId,
  );
  const myFranchiseId = currentLeague?.mflfranchiseid;

  const [selectedFranchise, setSelectedFranchise] = useState<number | null>(null);

  const defaultFranchise = useMemo(() => {
    if (!rosters) return null;
    if (myFranchiseId) {
      const mine = rosters.find((r) => r.mflfranchiseid === myFranchiseId);
      return mine?.mflfranchiseid ?? rosters[0]?.mflfranchiseid ?? null;
    }
    return rosters[0]?.mflfranchiseid ?? null;
  }, [rosters, myFranchiseId]);

  const effectiveFranchise = selectedFranchise ?? defaultFranchise;

  const selected = useMemo(
    () => rosters?.find((r) => r.mflfranchiseid === effectiveFranchise) ?? null,
    [rosters, effectiveFranchise],
  );

  const currentYear = new Date().getFullYear();

  const yearData: YearRow[] = useMemo(() => {
    if (!selected) return [];
    const deadRow = deadCap.find(
      (d) => d.franchiseId === selected.mflfranchiseid,
    );
    return Array.from({ length: YEARS_SHOWN }, (_, offset) => {
      const year = currentYear + offset;
      const acc: Record<CapSegKey, number> = { qb: 0, rb: 0, wr: 0, te: 0, taxi: 0, ir: 0 };
      for (const p of selected.players ?? []) {
        const hits = capHitsBySegment(p, offset);
        for (const [k, v] of Object.entries(hits) as [CapSegKey, number][]) {
          acc[k] += v;
        }
      }
      const qb   = Math.round(acc.qb);
      const rb   = Math.round(acc.rb);
      const wr   = Math.round(acc.wr);
      const te   = Math.round(acc.te);
      const taxi = Math.round(acc.taxi);
      const ir   = Math.round(acc.ir);
      const active = qb + rb + wr + te + taxi + ir;
      const dead = Math.round(deadRow?.amount?.[year.toString()] ?? 0);
      const total = active + dead;
      return { year, qb, rb, wr, te, taxi, ir, active, dead, total, overCap: total > LEAGUE_CAP_MAX };
    });
  }, [selected, deadCap, currentYear]);

  return (
    <Box sx={{ background: terminal.bg, color: terminal.text, p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Box sx={label}>Cap Outlook</Box>
          <Box
            sx={{
              fontFamily: fontStacks.sans,
              fontSize: 18,
              fontWeight: 700,
              color: terminal.text,
            }}
          >
            {selected?.teamName ?? "—"}
          </Box>
        </Box>
        {rosters && rosters.length > 1 && (
          <Select
            size="small"
            value={effectiveFranchise ?? ""}
            onChange={(e) =>
              setSelectedFranchise(
                typeof e.target.value === "number"
                  ? e.target.value
                  : Number(e.target.value),
              )
            }
            sx={{
              ml: "auto",
              minWidth: 200,
              fontFamily: fontStacks.mono,
              fontSize: 12,
              color: terminal.text,
              background: terminal.panel,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: terminal.line,
              },
            }}
          >
            {rosters.map((r) => (
              <MenuItem key={r.mflfranchiseid} value={r.mflfranchiseid}>
                {r.teamName} — {r.ownerName}
              </MenuItem>
            ))}
          </Select>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {/* Mobile */}
      {!loading && selected && yearData.length > 0 && mobile && (
        <Box
          sx={{
            background: terminal.panel,
            border: `1px solid ${terminal.line}`,
            borderRadius: "3px",
            p: 1.5,
            mb: 2,
          }}
        >
          <Box sx={{ ...label, mb: 1 }}>Future Cap Position</Box>
          {yearData.map((d) => {
            const max = Math.max(LEAGUE_CAP_MAX * 1.2, d.total);
            const ceilingPct = (LEAGUE_CAP_MAX / max) * 100;
            const headroom = LEAGUE_CAP_MAX - d.total;
            return (
              <Box
                key={d.year}
                sx={{
                  py: 1,
                  borderBottom: `1px solid ${terminal.line}`,
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ ...label, fontSize: 10, color: terminal.textDim }}>
                    {d.year}
                  </Box>
                  <Box
                    sx={{
                      ...numSx,
                      fontSize: 13,
                      color: d.overCap ? terminal.red : terminal.text,
                    }}
                  >
                    ${d.total}M
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: "relative",
                    height: 12,
                    background: terminal.panel2,
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  {(() => {
                    let left = 0;
                    return SEGS_ORDERED.map((s) => {
                      const val = d[s.key] as number;
                      if (!val) return null;
                      const pct = (val / max) * 100;
                      const segLeft = left;
                      left += pct;
                      return (
                        <Box
                          key={s.key}
                          sx={{
                            position: "absolute",
                            left: `${segLeft}%`,
                            top: 0,
                            height: "100%",
                            width: `${pct}%`,
                            background: s.color,
                          }}
                        />
                      );
                    });
                  })()}
                  <Box
                    sx={{
                      position: "absolute",
                      left: `${ceilingPct}%`,
                      top: -2,
                      bottom: -2,
                      width: 0,
                      borderLeft: `2px dashed ${terminal.red}`,
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    mt: 0.5,
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: fontStacks.mono,
                    fontSize: 9,
                    color: terminal.textDim,
                  }}
                >
                  <Box component="span">
                    ACT ${d.active}M · DEAD ${d.dead}M
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      color:
                        headroom < 0
                          ? terminal.red
                          : headroom / LEAGUE_CAP_MAX < 0.2
                            ? terminal.amber
                            : terminal.lime,
                    }}
                  >
                    {headroom >= 0
                      ? `+$${headroom}M`
                      : `-$${Math.abs(headroom)}M`}
                  </Box>
                </Box>
              </Box>
            );
          })}
          <Box
            sx={{
              mt: 1,
              pt: 1,
              borderTop: `1px solid ${terminal.line}`,
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            {SEGS_ORDERED.map((s) => (
              <LegendSwatch key={s.key} color={s.color} name={s.label} />
            ))}
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 0, height: 12, borderLeft: `2px dashed ${terminal.red}` }} />
              <Box sx={{ ...label, fontSize: 10, color: terminal.textDim }}>
                Ceiling ${LEAGUE_CAP_MAX}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Desktop */}
      {!loading && selected && yearData.length > 0 && !mobile && (
        <>
          <Box
            sx={{
              background: terminal.panel,
              border: `1px solid ${terminal.line}`,
              borderRadius: "3px",
              p: 2,
              mb: 2,
            }}
          >
            <Box sx={{ ...label, mb: 1 }}>Future Cap Position</Box>
            <Box sx={{ width: "100%", height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={yearData}
                  margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid stroke={terminal.line} vertical={false} />
                  <XAxis
                    dataKey="year"
                    stroke={terminal.textMute}
                    tick={{
                      fill: terminal.textDim,
                      fontFamily: fontStacks.mono,
                      fontSize: 11,
                    }}
                    tickLine={false}
                    axisLine={{ stroke: terminal.line }}
                  />
                  <YAxis
                    domain={[0, 600]}
                    stroke={terminal.textMute}
                    tick={{
                      fill: terminal.textDim,
                      fontFamily: fontStacks.mono,
                      fontSize: 10,
                    }}
                    tickFormatter={(v) => `$${v}`}
                    tickLine={false}
                    axisLine={{ stroke: terminal.line }}
                    width={48}
                  />
                  <Tooltip
                    cursor={{ fill: terminal.panel2 }}
                    content={<CustomTooltip />}
                  />
                  {SEGS_ORDERED.map((s) => (
                    <Bar key={s.key} dataKey={s.key} stackId="a" fill={s.color} />
                  ))}
                  <ReferenceLine
                    y={LEAGUE_CAP_MAX}
                    stroke={terminal.red}
                    strokeDasharray="4 4"
                    label={{
                      value: `$${LEAGUE_CAP_MAX} cap`,
                      position: "right",
                      fill: terminal.red,
                      fontFamily: fontStacks.mono,
                      fontSize: 10,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Legend */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                mt: 1.5,
                pt: 1.5,
                borderTop: `1px solid ${terminal.line}`,
              }}
            >
              {SEGS_ORDERED.map((s) => (
                <LegendSwatch key={s.key} color={s.color} name={s.label} />
              ))}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  ml: "auto",
                }}
              >
                <Box
                  sx={{
                    width: 14,
                    height: 0,
                    borderTop: `2px dashed ${terminal.red}`,
                  }}
                />
                <Box sx={{ ...label, fontSize: 10, color: terminal.textDim }}>
                  Ceiling ${LEAGUE_CAP_MAX}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Per-year summary cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 1,
            }}
          >
            {yearData.map((d) => {
              const headroom = LEAGUE_CAP_MAX - d.total;
              const pctHeadroom = headroom / LEAGUE_CAP_MAX;
              const headroomColor =
                headroom < 0
                  ? terminal.red
                  : pctHeadroom < 0.2
                    ? terminal.amber
                    : terminal.lime;
              return (
                <Box
                  key={d.year}
                  sx={{
                    p: 1.5,
                    background: terminal.panel,
                    border: `1px solid ${terminal.line}`,
                    borderRadius: "3px",
                  }}
                >
                  <Box sx={label}>{d.year}</Box>
                  <Box
                    sx={{
                      ...numSx,
                      fontSize: 20,
                      color: terminal.text,
                      mt: 0.25,
                    }}
                  >
                    ${d.total}M
                  </Box>
                  <Box
                    sx={{
                      ...label,
                      fontSize: 9,
                      color: terminal.textDim,
                      mt: 0.5,
                    }}
                  >
                    ${d.active}M active · ${d.dead}M dead
                  </Box>
                  <Box
                    sx={{
                      ...numSx,
                      fontSize: 12,
                      color: headroomColor,
                      mt: 0.5,
                    }}
                  >
                    {headroom >= 0
                      ? `$${headroom}M headroom`
                      : `$${Math.abs(headroom)}M over`}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </>
      )}

      {!loading && selected && yearData.length === 0 && (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            color: terminal.textMute,
            fontFamily: fontStacks.mono,
            fontSize: 12,
          }}
        >
          No contract data for this team.
        </Box>
      )}
    </Box>
  );
};

export default CapOutlook;
