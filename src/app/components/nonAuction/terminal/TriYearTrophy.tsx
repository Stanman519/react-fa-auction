import { Box, CircularProgress } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/reducers/RootReducer";
import { tytFor } from "../../../services/Common";
import { loadTriYearStandings } from "../../../redux/actions/TriYearStandingsActions";
import { ThunkAppDispatch } from "../../../store";
import { A, dfs, TERMINAL_FONT_SCALE } from "./tokens";
import TLabel from "./TLabel";

export default function TriYearTrophyTerminal() {
  const dispatch = useDispatch<ThunkAppDispatch>();
  const ownerList = useSelector((s: RootState) => s.deadCap.deadCap);
  const leagueId = useSelector((s: RootState) => s.profile.currentLeagueId);
  const myFranchiseId = useSelector(
    (s: RootState) =>
      s.profile.owner.leagues.find(
        (l) => l.league.leagueId === s.profile.currentLeagueId,
      )?.mflfranchiseid,
  );
  const entry = useSelector((s: RootState) =>
    leagueId ? s.triYearStandings.byLeague[leagueId] : undefined,
  );
  const standings = entry?.data ?? [];
  const isLoading = !entry || entry.status === "loading";
  const years =
    standings.length > 0 ? standings[0].teamStandings.map((t) => t.year) : [];

  useEffect(() => {
    if (!leagueId) return;
    dispatch(loadTriYearStandings());
  }, [leagueId, dispatch]);

  const hasData = standings.some((s) =>
    s.teamStandings.some((t) => t.pointsFor > 0),
  );
  const maxTyt = Math.max(1, ...standings.map(tytFor));

  return (
    <Box
      sx={{
        background: A.panel,
        border: `1px solid ${A.line}`,
        borderRadius: "3px",
      }}
    >
      <Box
        sx={{
          padding: { xs: "12px 14px", md: "14px 18px" },
          borderBottom: `1px solid ${A.line}`,
          display: "flex",
          alignItems: "baseline",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            fontSize: { xs: 16, md: Math.round(18 * TERMINAL_FONT_SCALE) },
            fontWeight: 700,
            color: A.text,
          }}
        >
          TRI-YEAR TROPHY
        </Box>
        <Box
          sx={{
            fontFamily: A.mono,
            fontSize: dfs(10),
            color: A.lime,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          presented by Taco Bell ™
        </Box>
      </Box>
      {isLoading ? (
        <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} sx={{ color: A.lime }} />
        </Box>
      ) : !hasData ? (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            color: A.textDim,
            fontFamily: A.mono,
            fontSize: dfs(12),
          }}
        >
          standings appear when next cycle begins
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: A.mono,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <thead>
              <Box
                component="tr"
                sx={{ borderBottom: `1px solid ${A.lineBold}` }}
              >
                <Box
                  component="th"
                  sx={{ p: "10px 14px", textAlign: "left" }}
                />
                {years.map((y) => (
                  <Box
                    key={y}
                    component="th"
                    colSpan={3}
                    sx={{
                      p: "10px 14px",
                      fontSize: dfs(11),
                      fontWeight: 700,
                      color: A.lime,
                      letterSpacing: "0.08em",
                      borderLeft: `1px solid ${A.line}`,
                      textAlign: "center",
                    }}
                  >
                    {y}
                  </Box>
                ))}
              </Box>
              <Box component="tr" sx={{ borderBottom: `1px solid ${A.line}` }}>
                <Box component="th" />
                {years.map((y) => (
                  <React.Fragment key={y}>
                    <Box
                      component="th"
                      sx={{
                        p: "6px 10px",
                        fontSize: dfs(9),
                        color: A.textMute,
                        letterSpacing: "0.08em",
                        borderLeft: `1px solid ${A.line}`,
                        textAlign: "right",
                      }}
                    >
                      W
                    </Box>
                    <Box
                      component="th"
                      sx={{
                        p: "6px 10px",
                        fontSize: dfs(9),
                        color: A.textMute,
                        letterSpacing: "0.08em",
                        textAlign: "right",
                      }}
                    >
                      {y % 100}-PF
                    </Box>
                    <Box
                      component="th"
                      sx={{
                        p: "6px 10px",
                        fontSize: dfs(9),
                        color: A.textMute,
                        letterSpacing: "0.08em",
                        textAlign: "right",
                      }}
                    >
                      TYT
                    </Box>
                  </React.Fragment>
                ))}
              </Box>
            </thead>
            <tbody>
              {standings.map((row) => {
                const tyt = tytFor(row);
                const isMe = row.franchiseId === myFranchiseId;
                const team =
                  ownerList.find((o) => o.franchiseId === row.franchiseId)
                    ?.team ?? `#${row.franchiseId}`;
                return (
                  <Box
                    component="tr"
                    key={row.franchiseId}
                    sx={{
                      borderBottom: `1px solid ${A.line}`,
                      background: isMe
                        ? "rgba(132, 204, 22, 0.05)"
                        : "transparent",
                    }}
                  >
                    <Box
                      component="td"
                      sx={{
                        p: "10px 14px",
                        minWidth: 160,
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: dfs(13),
                          fontWeight: 700,
                          color: isMe ? A.lime : A.text,
                          fontFamily: A.sans,
                        }}
                      >
                        {team}
                      </Box>
                      <Box
                        sx={{
                          fontSize: dfs(10),
                          color: A.textDim,
                          mt: "2px",
                        }}
                      >
                        {tyt.toFixed(1)} pts
                      </Box>
                      <Box
                        sx={{
                          mt: "4px",
                          height: 2,
                          background: A.panel2,
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
                            width: `${(tyt / maxTyt) * 100}%`,
                            background: isMe ? A.lime : A.textDim,
                          }}
                        />
                      </Box>
                    </Box>
                    {row.teamStandings.map((tm, i) => {
                      const cellTyt = tm.h2hWins * 10 + tm.pointsFor;
                      return (
                        <React.Fragment key={i}>
                          <Box
                            component="td"
                            sx={{
                              p: "10px",
                              fontSize: dfs(12),
                              color: A.textDim,
                              textAlign: "right",
                              borderLeft: `1px solid ${A.line}`,
                            }}
                          >
                            {tm.h2hWins ?? 0}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: "10px",
                              fontSize: dfs(12),
                              color: A.textDim,
                              textAlign: "right",
                            }}
                          >
                            {(tm.pointsFor ?? 0).toFixed(1)}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: "10px",
                              fontSize: dfs(12),
                              fontWeight: 700,
                              color: A.lime,
                              textAlign: "right",
                            }}
                          >
                            {cellTyt.toFixed(1)}
                          </Box>
                        </React.Fragment>
                      );
                    })}
                  </Box>
                );
              })}
            </tbody>
          </Box>
        </Box>
      )}
    </Box>
  );
}
