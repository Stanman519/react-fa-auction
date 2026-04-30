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
import { RootState } from "../../store";
import { terminal, fontStacks } from "../../../theme";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import { capHitForYear, deadCapIfCut, YEARS_SHOWN } from "./rosterMath";
import { Transaction } from "../../redux/reducers/TransactionReducer";

const POS_COLORS: Record<string, string> = {
  QB: "#e8538a",
  RB: "#2ca579",
  WR: "#4a90e2",
  TE: "#c47a2b",
  K: "#8888aa",
  DEF: "#6b6b6b",
  PK: "#8888aa",
};

const label = {
  fontFamily: fontStacks.mono,
  fontSize: 10,
  color: terminal.textMute,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const numSx = {
  fontFamily: fontStacks.mono,
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums" as const,
};

// Grid template: POS | PLAYER | TEAM | AGE | LEN | year×4 | CUT $
const GRID = `38px minmax(0, 1.6fr) 44px 60px 44px ${Array(YEARS_SHOWN).fill("54px").join(" ")} 64px`;

interface RowProps {
  p: PlayerDTO;
  currentYear: number;
  mobile?: boolean;
}

const PosBadge = ({ pos }: { pos: string }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: 20,
      minWidth: 20,
      px: 0.5,
      borderRadius: "2px",
      background: POS_COLORS[pos] ?? "#666",
      color: "#fff",
      fontWeight: 700,
      fontSize: 9,
      fontFamily: fontStacks.mono,
      width: "fit-content",
    }}
  >
    {pos}
  </Box>
);

const DesktopRow = ({ p, currentYear }: RowProps) => {
  const pos = p.position ?? "—";
  const isTaxi = p.rosterStatus === "TAXI_SQUAD";
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: GRID,
        gap: 1.25,
        alignItems: "center",
        px: 1.75,
        py: 0.75,
        borderBottom: `1px solid ${terminal.line}`,
        fontFamily: fontStacks.mono,
        fontSize: 12,
        "&:hover": { background: terminal.panel2 },
      }}
    >
      <PosBadge pos={pos} />
      <Box
        sx={{
          color: terminal.text,
          fontSize: 15,
          fontWeight: 600,
          fontFamily: fontStacks.sans,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {p.firstName} {p.lastName}
      </Box>
      <Box sx={{ ...numSx, color: terminal.textDim }}>
        {p.team?.toUpperCase() ?? "—"}
      </Box>
      <Box sx={{ ...numSx, color: terminal.textDim, textAlign: "right" }}>
        {p.age ?? "—"}
      </Box>
      <Box sx={{ ...numSx, color: terminal.textDim, textAlign: "right" }}>
        {p.length ?? 0}YR
      </Box>
      {Array.from({ length: YEARS_SHOWN }, (_, offset) => {
        const hit = capHitForYear(p, offset);
        return (
          <Box
            key={offset}
            sx={{
              ...numSx,
              color: hit > 0 ? terminal.text : terminal.textMute,
              fontWeight: 700,
              textAlign: "right",
            }}
          >
            {hit > 0 ? `$${hit}` : "—"}
          </Box>
        );
      })}
      <Box
        sx={{
          ...numSx,
          color: isTaxi ? terminal.textMute : terminal.red,
          textAlign: "right",
        }}
      >
        {isTaxi ? "$0" : `$${deadCapIfCut(p)}`}
      </Box>
    </Box>
  );
};

const DesktopHeader = ({ currentYear }: { currentYear: number }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: GRID,
      gap: 1.25,
      px: 1.75,
      py: 1,
      background: terminal.panel,
      borderBottom: `1px solid ${terminal.lineBold}`,
      fontFamily: fontStacks.mono,
      fontSize: 9,
      color: terminal.textMute,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}
  >
    <span>POS</span>
    <span>PLAYER</span>
    <span>TEAM</span>
    <span style={{ textAlign: "right" }}>AGE</span>
    <span style={{ textAlign: "right" }}>LEN</span>
    {Array.from({ length: YEARS_SHOWN }, (_, i) => (
      <span key={i} style={{ textAlign: "right" }}>{currentYear + i}</span>
    ))}
    <span style={{ textAlign: "right" }}>CUT $</span>
  </Box>
);

const SectionHeader = ({ label: text }: { label: string }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: GRID,
      gap: 1.25,
      px: 1.75,
      py: 0.6,
      background: terminal.panel2,
      borderTop: `1px solid ${terminal.lineBold}`,
      borderBottom: `1px solid ${terminal.line}`,
      fontFamily: fontStacks.mono,
      fontSize: 9,
      color: terminal.textDim,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    }}
  >
    <Box sx={{ gridColumn: `1 / -1` }}>{text}</Box>
  </Box>
);

const SubtotalRow = ({
  players,
  rowLabel,
  sublabel,
  accent = terminal.lime,
  grand = false,
}: {
  players: PlayerDTO[];
  rowLabel: string;
  sublabel?: string;
  accent?: string;
  grand?: boolean;
}) => {
  const totals = useMemo(() => {
    const t = Array(YEARS_SHOWN).fill(0);
    players.forEach((p) => {
      for (let i = 0; i < YEARS_SHOWN; i++) t[i] += capHitForYear(p, i);
    });
    return t;
  }, [players]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: GRID,
        gap: 1.25,
        px: 1.75,
        py: grand ? 1.25 : 0.75,
        background: grand ? terminal.panel2 : "transparent",
        borderTop: `1px solid ${grand ? terminal.lineBold : terminal.line}`,
        fontFamily: fontStacks.mono,
        fontSize: 11,
        color: terminal.text,
      }}
    >
      <Box />
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Box sx={{ ...label, fontSize: grand ? 10 : 9, color: terminal.textDim }}>
          {rowLabel}
        </Box>
        {sublabel && (
          <Box sx={{ fontSize: 9, color: terminal.textMute, fontFamily: fontStacks.mono }}>
            {sublabel}
          </Box>
        )}
      </Box>
      <Box /><Box /><Box />
      {totals.map((t, i) => (
        <Box
          key={i}
          sx={{
            ...numSx,
            fontSize: grand ? 13 : 11,
            fontWeight: 700,
            textAlign: "right",
            color: t > 0 ? accent : terminal.textMute,
          }}
        >
          {t > 0 ? `$${t}` : "—"}
        </Box>
      ))}
      <Box />
    </Box>
  );
};

const MobileCard = ({ p, currentYear }: RowProps) => {
  const pos = p.position ?? "—";
  const isTaxi = p.rosterStatus === "TAXI_SQUAD";
  return (
    <Box sx={{ p: 1.5, borderBottom: `1px solid ${terminal.line}` }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
        <PosBadge pos={pos} />
        <Box sx={{ flex: 1, fontSize: 14, fontWeight: 600, color: terminal.text }}>
          {p.firstName} {p.lastName}
        </Box>
        <Box sx={{ ...numSx, fontSize: 11, color: terminal.textDim }}>
          {p.team?.toUpperCase()}
          {p.age ? ` · ${p.age}` : ""}
        </Box>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${YEARS_SHOWN + 2}, 1fr)`,
          gap: 0.5,
          fontFamily: fontStacks.mono,
          fontSize: 10,
          color: terminal.textDim,
        }}
      >
        <Box>
          <Box sx={{ color: terminal.textMute, fontSize: 9 }}>LEN</Box>
          <Box sx={{ color: terminal.text, fontSize: 12, fontWeight: 700 }}>
            {p.length ?? 0}YR
          </Box>
        </Box>
        {Array.from({ length: YEARS_SHOWN }, (_, offset) => {
          const hit = capHitForYear(p, offset);
          return (
            <Box key={offset}>
              <Box sx={{ color: terminal.textMute, fontSize: 9 }}>
                {currentYear + offset}
              </Box>
              <Box
                sx={{
                  color: hit > 0 ? terminal.text : terminal.textMute,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {hit > 0 ? `$${hit}` : "—"}
              </Box>
            </Box>
          );
        })}
        <Box>
          <Box sx={{ color: terminal.textMute, fontSize: 9 }}>CUT</Box>
          <Box sx={{ color: isTaxi ? terminal.textMute : terminal.red, fontSize: 12, fontWeight: 700 }}>
            {isTaxi ? "$0" : `$${deadCapIfCut(p)}`}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AdjustmentRow = ({
  t,
  currentYear,
}: {
  t: Transaction;
  currentYear: number;
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: GRID,
        gap: 1.25,
        alignItems: "center",
        px: 1.75,
        py: 0.75,
        borderBottom: `1px solid ${terminal.line}`,
        fontFamily: fontStacks.mono,
        fontSize: 12,
        "&:hover": { background: terminal.panel2 },
      }}
    >
      <Box sx={{ color: terminal.textMute, fontSize: 9 }}>{t.position}</Box>
      <Box
        sx={{
          color: terminal.textDim,
          fontSize: 14,
          fontFamily: fontStacks.sans,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {t.playerName}
      </Box>
      <Box /><Box /><Box />
      {Array.from({ length: YEARS_SHOWN }, (_, i) => {
        const year = currentYear + i;
        const active = t.yearOfTransaction <= year && t.yearOfTransaction + t.years > year;
        return (
          <Box
            key={i}
            sx={{
              ...numSx,
              color: active ? terminal.amber : terminal.textMute,
              textAlign: "right",
            }}
          >
            {active ? `$${t.amount}` : "—"}
          </Box>
        );
      })}
      <Box />
    </Box>
  );
};

export const RosterContracts = () => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const { currentLeagueId, owner } = useSelector((s: RootState) => s.profile);
  const rostersState = useSelector((s: RootState) => s.rosters);
  const rosters = rostersState.data;
  const transactions = useSelector((s: RootState) => s.transactions);
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

  const { active, taxi, ir } = useMemo(() => {
    const players = selected?.players ?? [];
    return {
      active: players.filter(
        (p) => p.rosterStatus !== "TAXI_SQUAD" && p.rosterStatus !== "INJURED_RESERVE",
      ),
      taxi: players.filter((p) => p.rosterStatus === "TAXI_SQUAD"),
      ir: players.filter((p) => p.rosterStatus === "INJURED_RESERVE"),
    };
  }, [selected]);

  const taxiTotals = useMemo(() => {
    const t = Array(YEARS_SHOWN).fill(0);
    taxi.forEach((p) => {
      for (let i = 0; i < YEARS_SHOWN; i++) t[i] += capHitForYear(p, i);
    });
    return t;
  }, [taxi]);

  const irTotals = useMemo(() => {
    const t = Array(YEARS_SHOWN).fill(0);
    ir.forEach((p) => {
      for (let i = 0; i < YEARS_SHOWN; i++) t[i] += capHitForYear(p, i);
    });
    return t;
  }, [ir]);

  const totalDead = useMemo(
    () => active.reduce((acc, p) => acc + deadCapIfCut(p), 0),
    [active],
  );

  const activeTotals = useMemo(() => {
    const t = Array(YEARS_SHOWN).fill(0);
    active.forEach((p) => {
      for (let i = 0; i < YEARS_SHOWN; i++) t[i] += capHitForYear(p, i);
    });
    return t;
  }, [active]);

  const myAdjustments = useMemo(() => {
    if (!selected) return [];
    const lastDisplayed = currentYear + YEARS_SHOWN - 1;
    const relevant = transactions.filter((t) => {
      if (t.franchiseId !== selected.mflfranchiseid) return false;
      // Spans into at least one displayed year
      return t.yearOfTransaction <= lastDisplayed && t.yearOfTransaction + t.years > currentYear;
    });
    // Drop cancellation pairs (offsetting +/- amounts for same player)
    return relevant.filter(
      (t) => !relevant.some((e) => e.amount === -t.amount && e.playerName === t.playerName),
    );
  }, [transactions, selected, currentYear]);

  return (
    <Box sx={{ background: terminal.bg, color: terminal.text, p: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box>
          <Box sx={label}>Roster · Contracts</Box>
          <Box sx={{ fontFamily: fontStacks.sans, fontSize: 18, fontWeight: 700, color: terminal.text }}>
            {selected?.teamName ?? (loading ? "Loading…" : "—")}
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
              "& .MuiOutlinedInput-notchedOutline": { borderColor: terminal.line },
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

      {!loading && selected && (
        <>
          {/* Cap summary */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 1,
              mb: 2,
              p: 1.5,
              background: terminal.panel,
              border: `1px solid ${terminal.line}`,
              borderRadius: "3px",
            }}
          >
            <Box>
              <Box sx={label}>Cap Room</Box>
              <Box
                sx={{
                  ...numSx,
                  fontSize: 22,
                  fontWeight: 800,
                  color: selected.capRoom >= 0 ? terminal.lime : terminal.red,
                }}
              >
                ${selected.capRoom}M
              </Box>
            </Box>
            {Array.from({ length: YEARS_SHOWN }, (_, offset) => {
              const total =
                activeTotals[offset] + taxiTotals[offset] + irTotals[offset];
              return (
                <Box key={offset}>
                  <Box sx={label}>{currentYear + offset} COMMITTED</Box>
                  <Box sx={{ ...numSx, fontSize: 20, fontWeight: 700, color: terminal.text }}>
                    ${total}M
                  </Box>
                </Box>
              );
            })}
            <Box>
              <Box sx={label}>Roster Guaranteed $</Box>
              <Box sx={{ ...numSx, fontSize: 20, fontWeight: 700, color: terminal.red }}>
                ${totalDead}M
              </Box>
            </Box>
          </Box>

          {/* Roster table */}
          <Box
            sx={{
              background: terminal.panel,
              border: `1px solid ${terminal.line}`,
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            {!mobile && <DesktopHeader currentYear={currentYear} />}

            {/* Active roster */}
            {active.length > 0 && (
              <>
                {!mobile && <SectionHeader label="Active Roster" />}
                {active.map((p) =>
                  mobile ? (
                    <MobileCard key={p.mflId} p={p} currentYear={currentYear} mobile />
                  ) : (
                    <DesktopRow key={p.mflId} p={p} currentYear={currentYear} />
                  ),
                )}
                {!mobile && (
                  <SubtotalRow
                    players={active}
                    rowLabel={`Active subtotal · ${active.length} players`}
                    accent={terminal.lime}
                  />
                )}
              </>
            )}

            {/* Taxi squad */}
            {taxi.length > 0 && (
              <>
                <SectionHeader label="Taxi Squad — 20% cap hit" />
                {taxi.map((p) =>
                  mobile ? (
                    <MobileCard key={p.mflId} p={p} currentYear={currentYear} mobile />
                  ) : (
                    <DesktopRow key={p.mflId} p={p} currentYear={currentYear} />
                  ),
                )}
                {!mobile && (
                  <SubtotalRow
                    players={taxi}
                    rowLabel={`Taxi subtotal · ${taxi.length} players`}
                    sublabel="full salary × 20%"
                    accent={terminal.amber}
                  />
                )}
              </>
            )}

            {/* Injured Reserve */}
            {ir.length > 0 && (
              <>
                <SectionHeader label="Injured Reserve — 50% cap hit" />
                {ir.map((p) =>
                  mobile ? (
                    <MobileCard key={p.mflId} p={p} currentYear={currentYear} mobile />
                  ) : (
                    <DesktopRow key={p.mflId} p={p} currentYear={currentYear} />
                  ),
                )}
                {!mobile && (
                  <SubtotalRow
                    players={ir}
                    rowLabel={`IR subtotal · ${ir.length} players`}
                    sublabel="full salary × 50%"
                    accent={terminal.amber}
                  />
                )}
              </>
            )}

            {/* Salary adjustments (prior-cut dead cap) */}
            {myAdjustments.length > 0 && !mobile && (
              <>
                <SectionHeader label="Salary Adjustments — prior cuts" />
                {myAdjustments.map((t, i) => (
                  <AdjustmentRow key={i} t={t} currentYear={currentYear} />
                ))}
              </>
            )}

            {(selected.players ?? []).length === 0 && (
              <Box sx={{ p: 3, textAlign: "center", color: terminal.textMute }}>
                No players on roster.
              </Box>
            )}

            {/* Grand total row (desktop) */}
            {!mobile && (selected.players ?? []).length > 0 && (
              <SubtotalRow
                players={selected.players ?? []}
                rowLabel="Grand total"
                sublabel={`${(selected.players ?? []).length} players`}
                accent={terminal.lime}
                grand
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};
