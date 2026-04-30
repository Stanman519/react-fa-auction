import { useState } from "react";
import { Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { A } from "./tokens";
import { useIsMobile } from "./useIsMobile";
import { RootState } from "../../../store";
import { updateCurrentLeague } from "../../../redux/actions/LoginActions";
import { LEAGUE_PREF_KEY } from "../../menu/LeagueSwitchMenu";

type TabId = "auction" | "league" | "rules" | "games" | "leagues";

const HIDE_ON_PATHS = ["/landing", "/auth-callback", "/demo"];

function activeFromPath(pathname: string): TabId | null {
  if (pathname.startsWith("/auction")) return "auction";
  if (pathname.startsWith("/league-home")) return "league";
  if (pathname.startsWith("/games")) return "games";
  return null;
}

export default function AMobileBottomNav() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth0();

  const { currentLeagueId } = useSelector((s: RootState) => s.profile);
  const leagues = useSelector((s: RootState) => s.profile.owner.leagues);
  const currentLeague = leagues.find((l) => l.league.leagueId === currentLeagueId);
  const isAuctioning = currentLeague?.league.isAuctioning ?? false;

  const [leaguePickerOpen, setLeaguePickerOpen] = useState(false);

  if (!isMobile) return null;
  if (HIDE_ON_PATHS.some((p) => pathname.startsWith(p))) return null;

  const active = activeFromPath(pathname);

  const handleLeagueSwitch = (leagueId: number) => {
    if (user) {
      localStorage.setItem(LEAGUE_PREF_KEY, String(leagueId));
      dispatch(updateCurrentLeague(leagueId, pathname, user) as any);
    }
    setLeaguePickerOpen(false);
  };

  const TABS: { id: TabId; label: string; glyph: string; enabled: boolean; action: () => void }[] = [
    {
      id: "auction",
      label: "AUCTION",
      glyph: "◉",
      enabled: isAuctioning,
      action: () => navigate("/auction"),
    },
    {
      id: "league",
      label: "LEAGUE",
      glyph: "◎",
      enabled: true,
      action: () => navigate("/league-home"),
    },
    {
      id: "rules",
      label: "RULES",
      glyph: "≡",
      enabled: true,
      action: () => navigate("/league-home", { state: { tab: "rules" } }),
    },
    {
      id: "games",
      label: "GAMES",
      glyph: "⊕",
      enabled: true,
      action: () => navigate("/games"),
    },
    {
      id: "leagues",
      label: "LEAGUES",
      glyph: "⊞",
      enabled: leagues.length > 1,
      action: () => setLeaguePickerOpen((v) => !v),
    },
  ];

  return (
    <>
      {leaguePickerOpen && (
        <>
          <Box
            onClick={() => setLeaguePickerOpen(false)}
            sx={{
              position: "fixed",
              inset: 0,
              bottom: 56,
              zIndex: (t) => t.zIndex.appBar,
              background: "rgba(0,0,0,0.45)",
            }}
          />
          <Box
            sx={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 56,
              zIndex: (t) => t.zIndex.appBar + 1,
              background: A.panel,
              borderTop: `1px solid ${A.lineBold}`,
            }}
          >
            <Box
              sx={{
                fontFamily: A.mono,
                fontSize: 9,
                color: A.textMute,
                letterSpacing: "0.08em",
                padding: "10px 14px 6px",
              }}
            >
              SWITCH LEAGUE
            </Box>
            {leagues.map((l) => {
              const isCurrent = l.league.leagueId === currentLeagueId;
              return (
                <Box
                  key={l.league.leagueId}
                  onClick={() => !isCurrent && handleLeagueSwitch(l.league.leagueId)}
                  sx={{
                    padding: "12px 14px",
                    borderTop: `1px solid ${A.line}`,
                    background: isCurrent ? A.panel2 : "transparent",
                    cursor: isCurrent ? "default" : "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      fontFamily: A.mono,
                      fontSize: 13,
                      fontWeight: 700,
                      color: isCurrent ? A.lime : A.text,
                    }}
                  >
                    {l.league.name}
                  </Box>
                  {isCurrent && (
                    <Box
                      sx={{
                        fontFamily: A.mono,
                        fontSize: 9,
                        color: A.lime,
                        letterSpacing: "0.08em",
                      }}
                    >
                      ACTIVE
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </>
      )}

      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (t) => t.zIndex.appBar,
          height: 56,
          background: A.panel,
          borderTop: `1px solid ${A.lineBold}`,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
        }}
      >
        {TABS.map((t) => {
          const on = t.id === active || (t.id === "leagues" && leaguePickerOpen);
          return (
            <Box
              key={t.id}
              onClick={t.enabled ? t.action : undefined}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                color: on ? A.lime : t.enabled ? A.textDim : A.textMute,
                borderTop: on ? `2px solid ${A.lime}` : "2px solid transparent",
                cursor: t.enabled ? "pointer" : "default",
                userSelect: "none",
              }}
            >
              <Box component="span" sx={{ fontFamily: A.mono, fontSize: 18, lineHeight: 1 }}>
                {t.glyph}
              </Box>
              <Box
                component="span"
                sx={{
                  fontFamily: A.mono,
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                {t.label}
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
}

export const MOBILE_BOTTOM_NAV_HEIGHT = 56;
