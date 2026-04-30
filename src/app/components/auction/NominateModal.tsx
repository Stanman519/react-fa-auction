import {
  Autocomplete,
  Box,
  Dialog,
  IconButton,
  InputBase,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Cancel } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import {
  cancelNomination,
  makeNewNomination,
  selectPlayerToNominate,
} from "../../redux/actions/LotActions";
import { checkValidity } from "../../services/Common";
import { terminal, fontStacks } from "../../../theme";
import { dfs, TERMINAL_FONT_SCALE } from "../nonAuction/terminal/tokens";

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
  fontSize: { xs: 10, md: Math.round(10 * TERMINAL_FONT_SCALE) },
  color: terminal.textMute,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

export const NominateModal = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { owner, currentLeagueId } = useSelector(
    (s: RootState) => s.profile,
  );
  const currentLeague = owner.leagues.find(
    (l) => l.league.leagueId === currentLeagueId,
  );
  const lots = useSelector((s: RootState) => s.lots);
  const freeAgents = useSelector((s: RootState) => s.freeAgents);
  const newNomLot = useMemo(() => lots.find((l) => l.newNom), [lots]);

  const highBidsOnTheBoard = useSelector((state: RootState) =>
    state.lots
      .filter((l) => l.bid?.ownerId === currentLeague?.leagueownerid)
      .map((b) => b.bid?.bidSalary)
      .reduce((prev, curr) => (prev ?? 0) + (curr ?? 0), 0),
  );

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDTO | null>(null);
  const [bidSalary, setBidSalary] = useState<number>(1);
  const [bidYears, setBidYears] = useState<number>(1);
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    // reset form when modal opens fresh
    if (newNomLot && !newNomLot.bid?.player) {
      setSelectedPlayer(null);
      setBidSalary(1);
      setBidYears(1);
      setPosFilter("ALL");
      setSearch("");
    }
  }, [newNomLot?.lotId]);

  const filteredFreeAgents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return freeAgents.filter((fa) => {
      if (posFilter !== "ALL" && fa.position !== posFilter) return false;
      if (!q) return true;
      return (
        fa.fullName?.toLowerCase().includes(q) ||
        fa.team?.toLowerCase().includes(q) ||
        fa.position?.toLowerCase().includes(q)
      );
    });
  }, [freeAgents, posFilter, search]);

  const onPickPlayer = (p: PlayerDTO | null) => {
    setSelectedPlayer(p);
    dispatch(selectPlayerToNominate(p));
  };

  const validity = useMemo(() => {
    if (!currentLeague || !selectedPlayer) {
      return {
        isValid: false,
        violations: ["Pick a player to continue."],
      };
    }
    return checkValidity(
      currentLeague,
      bidSalary,
      bidYears,
      selectedPlayer.mflId,
      0,
      0,
      highBidsOnTheBoard ?? 0,
    );
  }, [currentLeague, selectedPlayer, bidSalary, bidYears, highBidsOnTheBoard]);

  const handleSubmit = () => {
    if (
      !currentLeague ||
      !newNomLot ||
      !selectedPlayer ||
      !validity.isValid
    )
      return;
    const payload = {
      leagueId: currentLeague.league.leagueId,
      ownerId: currentLeague.leagueownerid,
      ownername: owner.ownername,
      bidSalary,
      bidLength: bidYears,
      lotId: newNomLot.lotId,
      player: selectedPlayer,
    };
    dispatch(cancelNomination());
    dispatch(makeNewNomination(payload));
  };

  const open = !!newNomLot;
  const onClose = () => dispatch(cancelNomination());

  const capRoom = currentLeague?.capRoom ?? 0;
  const capHit = bidSalary;
  const apy = bidYears > 0 ? bidSalary / bidYears : 0;
  const total = bidSalary * bidYears;
  const rem = capRoom - (highBidsOnTheBoard ?? 0) - bidSalary;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: fullScreen ? "100%" : 760,
          maxWidth: "100%",
          height: fullScreen ? "100%" : "auto",
          background: terminal.panel,
          color: terminal.text,
          border: `1px solid ${terminal.lineBold}`,
          borderRadius: fullScreen ? 0 : "3px",
          display: "flex",
          flexDirection: "column",
          m: fullScreen ? 0 : undefined,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${terminal.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            fontFamily: fontStacks.mono,
            fontWeight: 800,
            fontSize: dfs(13),
            letterSpacing: "0.12em",
            color: terminal.lime,
          }}
        >
          NOMINATE PLAYER
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: terminal.textDim }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {fullScreen && (
        <>
          {/* Search */}
          <Box
            sx={{
              px: "12px",
              py: "10px",
              borderBottom: `1px solid ${terminal.line}`,
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Box
              component="span"
              sx={{ color: terminal.textMute, fontFamily: fontStacks.mono }}
            >
              ⌕
            </Box>
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search free agents…"
              sx={{
                flex: 1,
                color: terminal.text,
                fontSize: dfs(13),
                fontFamily: fontStacks.sans,
              }}
            />
          </Box>
          {/* Pos pill row */}
          <Box
            sx={{
              px: "12px",
              py: "8px",
              display: "flex",
              gap: "4px",
              overflowX: "auto",
              flexShrink: 0,
              borderBottom: `1px solid ${terminal.line}`,
            }}
          >
            {["ALL", "QB", "RB", "WR", "TE"].map((p) => {
              const on = p === posFilter;
              return (
                <Box
                  key={p}
                  component="button"
                  onClick={() => setPosFilter(p)}
                  sx={{
                    px: "10px",
                    py: "4px",
                    fontFamily: fontStacks.mono,
                    fontSize: dfs(10),
                    fontWeight: 700,
                    border: `1px solid ${on ? terminal.lime : terminal.line}`,
                    color: on ? terminal.lime : terminal.textDim,
                    background: on ? terminal.limeDim : "transparent",
                    borderRadius: "2px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {p}
                </Box>
              );
            })}
          </Box>
          {/* FA list */}
          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {filteredFreeAgents.slice(0, 200).map((fa) => {
              const sel = selectedPlayer?.mflId === fa.mflId;
              return (
                <Box
                  key={fa.mflId}
                  onClick={() => onPickPlayer(fa)}
                  sx={{
                    px: "12px",
                    py: "10px",
                    borderBottom: `1px solid ${terminal.line}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: sel ? terminal.panel2 : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 22,
                      minWidth: 22,
                      px: 0.75,
                      borderRadius: "2px",
                      background: POS_COLORS[fa.position ?? ""] ?? "#666",
                      color: "#fff",
                      fontFamily: fontStacks.mono,
                      fontWeight: 700,
                      fontSize: 10,
                    }}
                  >
                    {fa.position}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        fontSize: dfs(13),
                        fontWeight: 600,
                        color: terminal.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {fa.fullName}
                    </Box>
                    <Box
                      sx={{
                        fontSize: dfs(10),
                        color: terminal.textDim,
                        fontFamily: fontStacks.mono,
                        mt: "1px",
                      }}
                    >
                      {fa.team?.toUpperCase()}
                      {fa.age ? ` · AGE ${fa.age}` : ""}
                    </Box>
                  </Box>
                </Box>
              );
            })}
            {filteredFreeAgents.length === 0 && (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  color: terminal.textMute,
                  fontFamily: fontStacks.mono,
                  fontSize: dfs(11),
                }}
              >
                NO MATCHES
              </Box>
            )}
          </Box>
          {/* Sticky footer: stepper + math + submit */}
          <Box
            sx={{
              flexShrink: 0,
              borderTop: `1px solid ${terminal.lineBold}`,
              background: terminal.panel,
              p: "12px",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "stretch" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "stretch",
                  border: `1px solid ${terminal.lineBold}`,
                  borderRadius: "3px",
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1,
                    background: terminal.panel2,
                    color: terminal.textDim,
                    fontFamily: fontStacks.mono,
                    fontSize: dfs(13),
                  }}
                >
                  $
                </Box>
                <InputBase
                  value={bidSalary}
                  onChange={(e) => {
                    const v = Number.parseInt(e.target.value, 10);
                    setBidSalary(Number.isNaN(v) ? 0 : v);
                  }}
                  type="number"
                  inputProps={{ min: 1, max: 500, inputMode: "numeric" }}
                  sx={{
                    flex: 1,
                    color: terminal.text,
                    fontFamily: fontStacks.mono,
                    fontSize: dfs(18),
                    fontWeight: 700,
                    px: 1,
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1,
                    background: terminal.panel2,
                    color: terminal.textDim,
                    fontFamily: fontStacks.mono,
                    fontSize: dfs(11),
                  }}
                >
                  M
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
              {[1, 2, 3, 4, 5].map((y) => {
                const active = y === bidYears;
                return (
                  <Box
                    key={y}
                    component="button"
                    onClick={() => setBidYears(y)}
                    sx={{
                      flex: 1,
                      py: "8px",
                      background: active ? terminal.lime : terminal.panel2,
                      border: `1px solid ${active ? terminal.lime : terminal.line}`,
                      color: active ? "#000" : terminal.text,
                      fontFamily: fontStacks.mono,
                      fontSize: dfs(12),
                      fontWeight: 700,
                      cursor: "pointer",
                      borderRadius: "2px",
                    }}
                  >
                    {y}
                    <Box
                      component="span"
                      sx={{
                        fontSize: 8,
                        fontWeight: 500,
                        ml: 0.25,
                        opacity: 0.7,
                      }}
                    >
                      YR
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box
              sx={{
                mt: 1,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: "6px",
                fontFamily: fontStacks.mono,
                fontSize: dfs(9),
                color: terminal.textDim,
              }}
            >
              {[
                { l: "CAP HIT", v: `$${capHit}M`, c: terminal.text },
                { l: "APY", v: `$${apy.toFixed(1)}M`, c: terminal.text },
                { l: "TOTAL", v: `$${total.toFixed(0)}M`, c: terminal.text },
                {
                  l: "REM",
                  v: `$${rem.toFixed(1)}M`,
                  c: rem < 0 ? theme.palette.error.main : terminal.lime,
                },
              ].map((m) => (
                <Box key={m.l}>
                  {m.l}
                  <Box
                    sx={{
                      color: m.c,
                      fontSize: dfs(12),
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {m.v}
                  </Box>
                </Box>
              ))}
            </Box>
            <Box
              component="button"
              onClick={handleSubmit}
              disabled={!validity.isValid}
              sx={{
                width: "100%",
                mt: 1.5,
                py: 1.25,
                background: validity.isValid ? terminal.lime : terminal.panel2,
                color: validity.isValid ? "#000" : terminal.textMute,
                border: validity.isValid
                  ? "none"
                  : `1px solid ${terminal.line}`,
                cursor: validity.isValid ? "pointer" : "not-allowed",
                fontFamily: fontStacks.sans,
                fontWeight: 700,
                fontSize: dfs(13),
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: "2px",
              }}
            >
              {selectedPlayer
                ? `Nominate ${selectedPlayer.fullName} · $${bidSalary}M × ${bidYears}YR`
                : "Pick a player"}
            </Box>
            {!validity.isValid && validity.violations.length > 0 && (
              <Box
                sx={{
                  mt: 0.75,
                  fontFamily: fontStacks.mono,
                  fontSize: dfs(9),
                  color: theme.palette.error.main,
                  textAlign: "center",
                }}
              >
                {validity.violations[0]}
              </Box>
            )}
          </Box>
        </>
      )}
      {!fullScreen && (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 420,
        }}
      >
        {/* Left: search */}
        <Box
          sx={{
            p: 2,
            borderRight: `1px solid ${terminal.line}`,
          }}
        >
          <Box sx={{ ...label, mb: 1 }}>Player Search</Box>
          <Autocomplete
            isOptionEqualToValue={(o, v) => o.mflId === v.mflId}
            options={freeAgents}
            value={selectedPlayer}
            onChange={(_e, v) => onPickPlayer(v)}
            getOptionLabel={(o) =>
              `${o.position ?? ""} ${o.fullName ?? ""}`.trim()
            }
            renderOption={(props, o) => (
              <Box
                component="li"
                {...props}
                key={o.mflId}
                sx={{
                  fontFamily: fontStacks.sans,
                  fontSize: 13,
                  display: "flex !important",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 18,
                    minWidth: 18,
                    px: 0.5,
                    borderRadius: "2px",
                    background: POS_COLORS[o.position ?? ""] ?? "#666",
                    color: "#fff",
                    fontFamily: fontStacks.mono,
                    fontWeight: 700,
                    fontSize: 9,
                  }}
                >
                  {o.position}
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {o.fullName}
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontFamily: fontStacks.mono,
                    fontSize: 10,
                    color: terminal.textMute,
                  }}
                >
                  {o.team}
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Name, team, position…"
                size="small"
                autoFocus
              />
            )}
          />
          {selectedPlayer && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                background: terminal.panel2,
                border: `1px solid ${terminal.line}`,
                borderRadius: "2px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 22,
                    minWidth: 22,
                    px: 0.75,
                    borderRadius: "2px",
                    background:
                      POS_COLORS[selectedPlayer.position ?? ""] ?? "#666",
                    color: "#fff",
                    fontFamily: fontStacks.mono,
                    fontWeight: 700,
                    fontSize: 10,
                  }}
                >
                  {selectedPlayer.position}
                </Box>
                <Box
                  sx={{
                    fontSize: dfs(16),
                    fontWeight: 700,
                    color: terminal.text,
                  }}
                >
                  {selectedPlayer.fullName}
                </Box>
              </Box>
              <Box
                sx={{
                  mt: 0.5,
                  fontFamily: fontStacks.mono,
                  fontSize: dfs(11),
                  color: terminal.textDim,
                }}
              >
                {selectedPlayer.team?.toUpperCase()}
                {selectedPlayer.age ? ` · AGE ${selectedPlayer.age}` : ""}
              </Box>
            </Box>
          )}
        </Box>

        {/* Right: bid builder */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ ...label, mb: 1 }}>Opening Bid</Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "stretch",
              border: `1px solid ${terminal.lineBold}`,
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                background: terminal.panel2,
                color: terminal.textDim,
                fontFamily: fontStacks.mono,
                fontSize: dfs(14),
              }}
            >
              $
            </Box>
            <InputBase
              value={bidSalary}
              onChange={(e) => {
                const v = Number.parseInt(e.target.value, 10);
                setBidSalary(Number.isNaN(v) ? 0 : v);
              }}
              type="number"
              inputProps={{ min: 1, max: 500, inputMode: "numeric" }}
              sx={{
                flex: 1,
                color: terminal.text,
                fontFamily: fontStacks.mono,
                fontSize: dfs(20),
                fontWeight: 700,
                px: 1,
                py: 1,
                "& input": { py: 0 },
              }}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                background: terminal.panel2,
                color: terminal.textDim,
                fontFamily: fontStacks.mono,
                fontSize: dfs(11),
              }}
            >
              M
            </Box>
          </Box>

          <Box sx={{ ...label, mt: 2, mb: 0.5 }}>Minimum Years</Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {[1, 2, 3, 4, 5].map((y) => {
              const active = y === bidYears;
              return (
                <Box
                  key={y}
                  component="button"
                  onClick={() => setBidYears(y)}
                  sx={{
                    flex: 1,
                    py: 1,
                    background: active ? terminal.lime : terminal.panel2,
                    border: `1px solid ${active ? terminal.lime : terminal.line}`,
                    color: active ? "#000" : terminal.text,
                    fontFamily: fontStacks.mono,
                    fontSize: dfs(13),
                    fontWeight: 700,
                    cursor: "pointer",
                    borderRadius: "2px",
                  }}
                >
                  {y}
                  <Box
                    component="span"
                    sx={{
                      fontSize: 9,
                      fontWeight: 500,
                      ml: 0.25,
                      opacity: 0.7,
                    }}
                  >
                    YR
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Tooltip
            title={
              validity.violations.length
                ? validity.violations.map((v) => (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                      key={v}
                    >
                      <Cancel fontSize="small" color="warning" />
                      <span>{v}</span>
                    </Box>
                  ))
                : ""
            }
            arrow
            placement="bottom"
          >
            <Box
              component="button"
              onClick={handleSubmit}
              disabled={!validity.isValid}
              sx={{
                width: "100%",
                mt: 2,
                py: 1.5,
                background: validity.isValid ? terminal.lime : terminal.panel2,
                color: validity.isValid ? "#000" : terminal.textMute,
                border: validity.isValid
                  ? "none"
                  : `1px solid ${terminal.line}`,
                cursor: validity.isValid ? "pointer" : "not-allowed",
                fontFamily: fontStacks.sans,
                fontWeight: 700,
                fontSize: dfs(13),
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: "2px",
              }}
            >
              Nominate · ${bidSalary}M × {bidYears}YR
            </Box>
          </Tooltip>

          <Box
            sx={{
              mt: 1.5,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 0.75,
              fontFamily: fontStacks.mono,
              fontSize: dfs(10),
              color: terminal.textDim,
            }}
          >
            <Box>
              CAP HIT
              <Box
                sx={{
                  color: terminal.text,
                  fontSize: dfs(13),
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ${capHit}M
              </Box>
            </Box>
            <Box>
              APY
              <Box
                sx={{
                  color: terminal.text,
                  fontSize: dfs(13),
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ${apy.toFixed(1)}M
              </Box>
            </Box>
            <Box>
              TOTAL
              <Box
                sx={{
                  color: terminal.text,
                  fontSize: dfs(13),
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ${total.toFixed(0)}M
              </Box>
            </Box>
            <Box>
              REM
              <Box
                sx={{
                  color: rem < 0 ? theme.palette.error.main : terminal.lime,
                  fontSize: dfs(13),
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ${rem.toFixed(1)}M
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      )}
    </Dialog>
  );
};
