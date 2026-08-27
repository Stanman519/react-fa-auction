import { Fragment, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { RootState, useAppThunkDispatch } from "../store";
import { turnOnNominationModeForThisOwnersLot } from "../redux/actions/LotActions";
import { updateUI } from "../redux/actions/UiActions";
import { updateCurrentLeague } from "../redux/actions/LoginActions";
import { LEAGUE_PREF_KEY } from "./menu/LeagueSwitchMenu";
import { FAChatWindow } from "./chat";
import { ChatClient } from "../services/ChatUtils";
import { setChatConnected } from "../redux/reducers/ChatReducer";
import { useIsMobile } from "../hooks";
import { terminal as T, fontStacks } from "../../theme";

type Page = "league-home" | "rosters" | "auction" | "games" | "other";

function pageFromPath(path: string): Page {
  if (path === "/league-home") return "league-home";
  if (path === "/rosters") return "rosters";
  if (path === "/auction") return "auction";
  if (path === "/games") return "games";
  return "other";
}

const STAN_SUB = "118311468702754688467";

function Wordmark({
  size = "desktop",
  onClick,
}: {
  size?: "desktop" | "mobile";
  onClick?: () => void;
}) {
  const square = size === "desktop" ? 24 : 22;
  const fontSize = size === "desktop" ? 13 : 12;
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          width: square,
          height: square,
          borderRadius: 2,
          background: T.lime,
          alignItems: "center",
          justifyContent: "center",
          color: "#000",
          fontFamily: fontStacks.mono,
          fontSize,
          fontWeight: 800,
        }}
      >
        F
      </span>
      <span
        style={{
          fontFamily: fontStacks.mono,
          fontSize: size === "desktop" ? 13 : 11,
          fontWeight: 600,
          color: T.text,
          letterSpacing: "0.05em",
        }}
      >
        FANPOOLS<span style={{ color: T.lime }}>.</span>
      </span>
    </div>
  );
}

function NavLink({
  active,
  label,
  sub,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  label: string;
  sub?: string | null;
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        position: "relative",
        padding: "0 16px",
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        color: active ? T.text : disabled ? T.textMute : T.textDim,
      }}
    >
      <span
        style={{
          fontFamily: fontStacks.sans,
          fontSize: 13,
          fontWeight: active ? 700 : 500,
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: fontStacks.mono,
            fontSize: 9,
            color: T.textMute,
            letterSpacing: "0.06em",
          }}
        >
          {sub}
        </span>
      )}
      {children}
      {active && (
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 0,
            height: 2,
            background: T.lime,
          }}
        />
      )}
    </div>
  );
}

export function MenuBar() {
  const { user, logout: auth0Logout } = useAuth0();
  const isMobile = useIsMobile(720);

  const logout = async () => {
    try {
      await ChatClient.disconnect();
      dispatch(setChatConnected(false));
    } catch {}
    auth0Logout();
  };

  const { owner, currentLeagueId } = useSelector((s: RootState) => s.profile);
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find((l) => l.league.leagueId === currentLeagueId),
  );
  const lots = useSelector((s: RootState) =>
    s.lots.filter((l) => l.leagueId === currentLeague?.league.leagueId),
  );
  const { modal } = useSelector((s: RootState) => s.ui);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppThunkDispatch();

  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The Over/Under page has its own chat button wired to that pool's channel.
  // This one opens the league channel, so showing both is two chats side by
  // side pointing at different rooms.
  const hideChat = location.pathname === "/over-unders";

  const hasLeague = !!owner?.leagues && owner.leagues.length > 0;
  const multiLeague = hasLeague && owner.leagues.length > 1;
  const leagueName = currentLeague?.league.name || "League";
  const onAuctionPage = location.pathname === "/auction";
  const page = pageFromPath(location.pathname);
  const liveAuction = !!currentLeague?.league.isAuctioning;
  const freeAgentsOpen = modal === "free-agent-grid";

  const myNominations = lots.filter(
    (l) => l.nominatedBy === currentLeague?.leagueownerid,
  ).length;
  const openLots = lots.filter((l) => !l.bid).length;
  const canNominate = !!owner.ownername && openLots > 0 && myNominations < 3;

  const goToSmartHome = () => navigate(hasLeague ? "/league-home" : "/games");

  const switchLeague = (leagueId: number) => {
    if (user) {
      localStorage.setItem(LEAGUE_PREF_KEY, String(leagueId));
      dispatch(updateCurrentLeague(leagueId, location.pathname, user));
    }
  };

  if (isMobile) {
    return (
      <Fragment>
        {/* width:100% — parents that use `items-center` would otherwise shrink
            this to content width and let page content show through beside it. */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            flexShrink: 0,
            width: "100%",
          }}
        >
          <div
            style={{
              height: 52,
              background: T.panel,
              borderBottom: `1px solid ${T.lineBold}`,
              display: "flex",
              alignItems: "center",
              fontFamily: fontStacks.sans,
            }}
          >
            <div
              onClick={() => setDrawerOpen(true)}
              style={{
                width: 52,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRight: `1px solid ${T.line}`,
                color: drawerOpen ? T.lime : T.textDim,
                background: drawerOpen ? T.limeDim : "transparent",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <span style={{ height: 2, background: "currentColor" }} />
                <span style={{ height: 2, background: "currentColor" }} />
                <span style={{ height: 2, background: "currentColor" }} />
              </div>
            </div>

            <div
              onClick={goToSmartHome}
              style={{
                flex: 1,
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  width: 22,
                  height: 22,
                  borderRadius: 2,
                  background: T.lime,
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000",
                  fontFamily: fontStacks.mono,
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                F
              </span>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: fontStacks.mono,
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.text,
                    letterSpacing: "0.04em",
                    lineHeight: 1.1,
                  }}
                >
                  FANPOOLS<span style={{ color: T.lime }}>.</span>
                </div>
                {hasLeague && (
                  <div
                    style={{
                      fontSize: 10,
                      color: T.textDim,
                      lineHeight: 1.1,
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    ● {leagueName}
                  </div>
                )}
              </div>
            </div>

            {liveAuction && !onAuctionPage && (
              <div
                onClick={() => navigate("/auction")}
                style={{
                  padding: "0 12px",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  borderLeft: `1px solid ${T.line}`,
                  color: T.red,
                  fontFamily: fontStacks.mono,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: T.red,
                    animation: "a-pulse-red 1.2s infinite",
                  }}
                />
                <span>LIVE</span>
              </div>
            )}

            <div
              style={{
                width: 52,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderLeft: `1px solid ${T.line}`,
                cursor: "pointer",
              }}
            >
              <img
                src={user?.picture}
                referrerPolicy="no-referrer"
                alt={user?.name || ""}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
            </div>
          </div>

        </div>

        {drawerOpen && (
          <MobileDrawer
            page={page}
            leagueName={leagueName}
            hasLeague={hasLeague}
            multiLeague={multiLeague}
            leagues={owner.leagues}
            currentLeagueId={currentLeagueId}
            liveAuction={liveAuction}
            isAdmin={!!user?.sub?.includes(STAN_SUB)}
            user={user}
            onClose={() => setDrawerOpen(false)}
            onNavigate={(p) => {
              setDrawerOpen(false);
              navigate(p);
            }}
            onOpenChat={
              hideChat
                ? undefined
                : () => {
                    setDrawerOpen(false);
                    setChatOpen(true);
                  }
            }
            onSwitchLeague={(id) => {
              switchLeague(id);
              setDrawerOpen(false);
            }}
            onLogout={() => {
              setDrawerOpen(false);
              logout();
            }}
          />
        )}

        <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
      </Fragment>
    );
  }

  return (
    <Fragment>
      {/* width:100% — see note in the mobile branch above. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          flexShrink: 0,
          width: "100%",
        }}
      >
        <div
          style={{
            height: 56,
            background: T.panel,
            borderBottom: `1px solid ${T.lineBold}`,
            display: "flex",
            alignItems: "stretch",
            fontFamily: fontStacks.sans,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              borderRight: `1px solid ${T.line}`,
            }}
          >
            <Wordmark size="desktop" onClick={goToSmartHome} />
          </div>

          {hasLeague && (
            <div
              onClick={
                multiLeague ? () => setShowSwitcher((v) => !v) : undefined
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 14px",
                borderRight: `1px solid ${T.line}`,
                cursor: multiLeague ? "pointer" : "default",
                background: showSwitcher ? T.panel2 : "transparent",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: T.lime,
                  borderRadius: 1,
                }}
              />
              <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>
                {leagueName}
              </span>
              {multiLeague && (
                <span
                  style={{
                    color: T.textDim,
                    fontFamily: fontStacks.mono,
                    fontSize: 10,
                    marginLeft: 2,
                  }}
                >
                  ▾
                </span>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "stretch" }}>
            {hasLeague && (
              <NavLink
                active={page === "league-home"}
                label="Dashboard"
                onClick={() => navigate("/league-home")}
              />
            )}
            <div style={{ position: "relative" }}>
              <NavLink
                active={page === "auction"}
                label="Auction"
                sub={liveAuction ? "LIVE" : null}
                disabled={!liveAuction}
                onClick={() => navigate("/auction")}
              />
              {liveAuction && (
                <span
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 6,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: T.red,
                    boxShadow: `0 0 0 0 ${T.red}`,
                    animation: "a-pulse-red 1.2s infinite",
                  }}
                />
              )}
            </div>
            <NavLink
              active={page === "games"}
              label="Games"
              onClick={() => navigate("/games")}
            />
          </div>

          <div style={{ flex: 1 }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 12px",
            }}
          >
            {!hideChat && (
              <div
                onClick={() => setChatOpen((v) => !v)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 2,
                  border: `1px solid ${chatOpen ? T.lime : T.line}`,
                  background: chatOpen ? T.limeDim : "transparent",
                  color: chatOpen ? T.lime : T.textDim,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: fontStacks.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                }}
              >
                <span>◎</span>
                <span>{chatOpen ? "CLOSE CHAT" : "CHAT"}</span>
              </div>
            )}

            <div
              onClick={() => setShowAvatarMenu((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 8px 4px 4px",
                borderRadius: 2,
                border: `1px solid ${showAvatarMenu ? T.lime : T.line}`,
                background: showAvatarMenu ? T.panel2 : "transparent",
                cursor: "pointer",
              }}
            >
              <img
                src={user?.picture}
                alt={user?.name || ""}
                referrerPolicy="no-referrer"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: T.text,
                    fontWeight: 600,
                    lineHeight: 1.1,
                  }}
                >
                  {owner?.ownername || user?.name || "Owner"}
                </span>
                {currentLeague?.leagueownerid != null && (
                  <span
                    style={{
                      fontSize: 9,
                      color: T.textMute,
                      fontFamily: fontStacks.mono,
                      lineHeight: 1.1,
                      marginTop: 1,
                    }}
                  >
                    @
                    {owner?.ownername?.toLowerCase().replace(/\s+/g, "") ||
                      "owner"}
                  </span>
                )}
              </div>
              <span
                style={{
                  color: T.textDim,
                  fontFamily: fontStacks.mono,
                  fontSize: 10,
                  marginLeft: 2,
                }}
              >
                ▾
              </span>
            </div>
          </div>
        </div>

        {onAuctionPage && (
          <div
            style={{
              height: 40,
              background: "#000",
              borderBottom: `1px solid ${T.lineBold}`,
              display: "flex",
              alignItems: "stretch",
              fontFamily: fontStacks.sans,
            }}
          >
            <div
              style={{
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRight: `1px solid ${T.line}`,
                fontFamily: fontStacks.mono,
                fontSize: 10,
                fontWeight: 700,
                color: T.lime,
                letterSpacing: "0.1em",
              }}
            >
              ● AUCTION ROOM
            </div>
            <SubBarButton
              glyph="◇"
              label={freeAgentsOpen ? "Close Free Agents" : "Free Agents"}
              active={freeAgentsOpen}
              onClick={() =>
                dispatch(
                  updateUI({
                    modal: freeAgentsOpen ? undefined : "free-agent-grid",
                  }),
                )
              }
            />
            {canNominate && (
              <SubBarButton
                glyph="+"
                label="Nominate Player"
                active={false}
                primary
                onClick={() => dispatch(turnOnNominationModeForThisOwnersLot())}
              />
            )}

            <div style={{ flex: 1 }} />
            <div
              style={{
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderLeft: `1px solid ${T.line}`,
                fontFamily: fontStacks.mono,
                fontSize: 10,
                color: T.textDim,
                letterSpacing: "0.06em",
              }}
            >
              <span>
                SLOTS:{" "}
                <span style={{ color: T.lime, fontWeight: 700 }}>
                  {myNominations}/3
                </span>
              </span>
              <span>
                OPEN LOTS:{" "}
                <span style={{ color: T.text, fontWeight: 700 }}>
                  {openLots}
                </span>
              </span>
            </div>
          </div>
        )}

        {showSwitcher && multiLeague && (
          <div
            style={{
              position: "absolute",
              top: 56,
              left: 220,
              zIndex: 20,
              width: 280,
              background: T.panel,
              border: `1px solid ${T.lineBold}`,
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              fontFamily: fontStacks.sans,
            }}
          >
            <div
              style={{
                zIndex: 50,
                padding: "10px 14px",
                borderBottom: `1px solid ${T.line}`,
                fontSize: 9,
                color: T.textMute,
                fontFamily: fontStacks.mono,
                letterSpacing: "0.1em",
                fontWeight: 700,
              }}
            >
              ● YOUR LEAGUES · {owner.leagues.length}
            </div>
            {owner.leagues.map((l) => {
              const active = l.league.leagueId === currentLeagueId;
              return (
                <div
                  key={l.league.leagueId}
                  onClick={() => {
                    switchLeague(l.league.leagueId);
                    setShowSwitcher(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    borderBottom: `1px solid ${T.line}`,
                    cursor: "pointer",
                    background: active ? T.panel2 : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      background: active ? T.lime : T.textMute,
                      borderRadius: 1,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: T.text }}
                    >
                      {l.league.name}
                    </div>
                  </div>
                  {active && (
                    <span
                      style={{
                        fontFamily: fontStacks.mono,
                        fontSize: 9,
                        color: T.lime,
                        letterSpacing: "0.1em",
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showAvatarMenu && (
          <div
            style={{
              position: "absolute",
              top: 56,
              right: 12,
              zIndex: 20,
              width: 240,
              background: T.panel,
              border: `1px solid ${T.lineBold}`,
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              fontFamily: fontStacks.sans,
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderBottom: `1px solid ${T.line}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <img
                src={user?.picture}
                referrerPolicy="no-referrer"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                  {owner?.ownername || user?.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: T.textDim,
                    fontFamily: fontStacks.mono,
                  }}
                >
                  {user?.email}
                </div>
              </div>
            </div>
            {user?.sub?.includes(STAN_SUB) && (
              <AvatarItem
                glyph="◈"
                label="Admin console"
                sub="STAN"
                onClick={() => {
                  setShowAvatarMenu(false);
                  navigate("/admin");
                }}
              />
            )}
            <AvatarItem
              glyph="☕"
              label="Buy me a coffee"
              sub="EXTERNAL"
              sep={!user?.sub?.includes(STAN_SUB)}
              onClick={() => {
                window.open(
                  "https://www.buymeacoffee.com/ryanstanley",
                  "_blank",
                );
                setShowAvatarMenu(false);
              }}
            />
            <AvatarItem
              glyph="⏻"
              label="Log out"
              danger
              sep
              onClick={() => {
                setShowAvatarMenu(false);
                logout();
              }}
            />
          </div>
        )}
      </div>

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </Fragment>
  );
}

function SubBarButton({
  glyph,
  label,
  active,
  primary,
  onClick,
}: {
  glyph: string;
  label: string;
  active?: boolean;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "0 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        borderRight: `1px solid ${T.line}`,
        color: primary ? T.lime : active ? T.lime : T.textDim,
        background: active ? T.limeDim : "transparent",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <span style={{ fontFamily: fontStacks.mono, fontSize: 13 }}>{glyph}</span>
      <span>{label}</span>
    </div>
  );
}

function AvatarItem({
  glyph,
  label,
  sub,
  danger,
  sep,
  onClick,
}: {
  glyph: string;
  label: string;
  sub?: string;
  danger?: boolean;
  sep?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px 14px",
        cursor: "pointer",
        borderTop: sep ? `1px solid ${T.line}` : "none",
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: danger ? T.red : T.text,
        fontSize: 12,
      }}
    >
      <span
        style={{
          fontFamily: fontStacks.mono,
          color: danger ? T.red : T.textDim,
          fontSize: 14,
          width: 16,
          textAlign: "center",
        }}
      >
        {glyph}
      </span>
      <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
      {sub && (
        <span
          style={{
            fontFamily: fontStacks.mono,
            fontSize: 9,
            color: T.textMute,
            letterSpacing: "0.08em",
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function MobileDrawer({
  page,
  leagueName,
  hasLeague,
  multiLeague,
  leagues,
  currentLeagueId,
  liveAuction,
  isAdmin,
  user,
  onClose,
  onNavigate,
  onOpenChat,
  onSwitchLeague,
  onLogout,
}: {
  page: Page;
  leagueName: string;
  hasLeague: boolean;
  multiLeague: boolean;
  leagues: any[];
  currentLeagueId: number | undefined;
  liveAuction: boolean;
  isAdmin: boolean;
  user: any;
  onClose: () => void;
  onNavigate: (path: string) => void;
  /** Omitted on pages that provide their own chat entry point. */
  onOpenChat?: () => void;
  onSwitchLeague: (id: number) => void;
  onLogout: () => void;
}) {
  const [showLeaguePicker, setShowLeaguePicker] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: T.bg,
        fontFamily: fontStacks.sans,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 52,
          background: T.panel,
          borderBottom: `1px solid ${T.lineBold}`,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          onClick={onClose}
          style={{
            width: 52,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: `1px solid ${T.line}`,
            color: T.lime,
            background: T.limeDim,
            fontFamily: fontStacks.mono,
            fontSize: 22,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </div>
        <div style={{ flex: 1, padding: "0 12px" }}>
          <Wordmark size="mobile" />
        </div>
      </div>

      <div
        style={{
          padding: "14px 16px",
          background: T.panel2,
          borderBottom: `1px solid ${T.line}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <img
          src={user?.picture}
          referrerPolicy="no-referrer"
          style={{ width: 40, height: 40, borderRadius: 2, objectFit: "cover" }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
            {user?.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: T.textDim,
              fontFamily: fontStacks.mono,
              marginTop: 2,
            }}
          >
            {user?.email}
          </div>
        </div>
      </div>

      {hasLeague && (
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${T.line}`,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: multiLeague ? "pointer" : "default",
          }}
          onClick={
            multiLeague ? () => setShowLeaguePicker((v) => !v) : undefined
          }
        >
          <span
            style={{ width: 6, height: 6, background: T.lime, borderRadius: 1 }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 9,
                color: T.textMute,
                fontFamily: fontStacks.mono,
                letterSpacing: "0.1em",
              }}
            >
              CURRENT LEAGUE
            </div>
            <div
              style={{
                fontSize: 14,
                color: T.text,
                fontWeight: 700,
                marginTop: 2,
              }}
            >
              {leagueName}
            </div>
          </div>
          {multiLeague && (
            <span
              style={{
                fontFamily: fontStacks.mono,
                fontSize: 10,
                color: T.textDim,
                padding: "4px 8px",
                border: `1px solid ${T.line}`,
                borderRadius: 2,
              }}
            >
              {showLeaguePicker ? "▴ CLOSE" : "SWITCH ▾"}
            </span>
          )}
        </div>
      )}

      {showLeaguePicker && multiLeague && (
        <div style={{ borderBottom: `1px solid ${T.line}`, flexShrink: 0 }}>
          {leagues.map((l) => {
            const active = l.league.leagueId === currentLeagueId;
            return (
              <div
                key={l.league.leagueId}
                onClick={() => {
                  onSwitchLeague(l.league.leagueId);
                  setShowLeaguePicker(false);
                }}
                style={{
                  padding: "10px 16px 10px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: active ? T.panel2 : "transparent",
                  cursor: "pointer",
                  borderTop: `1px solid ${T.line}`,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: active ? T.lime : T.textMute,
                    borderRadius: 1,
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? T.text : T.textDim,
                  }}
                >
                  {l.league.name}
                </span>
                {active && (
                  <span
                    style={{
                      fontFamily: fontStacks.mono,
                      fontSize: 9,
                      color: T.lime,
                      letterSpacing: "0.1em",
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        <div
          style={{
            padding: "12px 16px 6px",
            fontSize: 9,
            color: T.textMute,
            fontFamily: fontStacks.mono,
            letterSpacing: "0.1em",
          }}
        >
          NAVIGATE
        </div>
        {(
          [
            hasLeague && {
              id: "league-home" as Page,
              label: "Dashboard",
              glyph: "⊞",
              path: "/league-home",
              sub: null,
              accent: null,
            },
            {
              id: "auction" as Page,
              label: "Auction",
              glyph: "◉",
              path: "/auction",
              sub: liveAuction ? "LIVE" : null,
              accent: liveAuction ? T.red : null,
              disabled: !liveAuction,
            },
            {
              id: "games" as Page,
              label: "Games",
              glyph: "◇",
              path: "/games",
              sub: null,
              accent: null,
            },
          ] as const
        )
          .filter(Boolean)
          .map((item: any) => {
            const active = page === item.id;
            return (
              <div
                key={item.id}
                onClick={item.disabled ? undefined : () => onNavigate(item.path)}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: active ? T.panel2 : "transparent",
                  borderLeft: `2px solid ${active ? T.lime : "transparent"}`,
                  cursor: item.disabled ? "not-allowed" : "pointer",
                }}
              >
                <span
                  style={{
                    fontFamily: fontStacks.mono,
                    fontSize: 16,
                    color: item.disabled ? T.textMute : active ? T.lime : T.textDim,
                    width: 20,
                    textAlign: "center",
                  }}
                >
                  {item.glyph}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: item.disabled ? T.textMute : active ? T.text : T.textDim,
                  }}
                >
                  {item.label}
                </span>
                {item.sub && (
                  <span
                    style={{
                      fontFamily: fontStacks.mono,
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      padding: "2px 6px",
                      borderRadius: 2,
                      background: item.accent || T.line,
                      color: item.accent ? "#fff" : T.textDim,
                    }}
                  >
                    {item.sub}
                  </span>
                )}
              </div>
            );
          })}

        <div
          style={{
            padding: "16px 16px 6px",
            fontSize: 9,
            color: T.textMute,
            fontFamily: fontStacks.mono,
            letterSpacing: "0.1em",
          }}
        >
          QUICK ACTIONS
        </div>
        {onOpenChat && (
          <div
            onClick={onOpenChat}
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: fontStacks.mono,
                fontSize: 16,
                color: T.textDim,
                width: 20,
                textAlign: "center",
              }}
            >
              ◎
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 14,
                color: T.textDim,
                fontWeight: 500,
              }}
            >
              Open chat
            </span>
          </div>
        )}

        <div
          style={{
            padding: "16px 16px 6px",
            fontSize: 9,
            color: T.textMute,
            fontFamily: fontStacks.mono,
            letterSpacing: "0.1em",
          }}
        >
          ACCOUNT
        </div>
        {isAdmin && (
          <div
            onClick={() => onNavigate("/admin")}
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: fontStacks.mono,
                fontSize: 16,
                color: T.textDim,
                width: 20,
                textAlign: "center",
              }}
            >
              ◈
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 14,
                color: T.textDim,
                fontWeight: 500,
              }}
            >
              Admin console
            </span>
            <span
              style={{
                fontFamily: fontStacks.mono,
                fontSize: 9,
                color: T.textMute,
                letterSpacing: "0.08em",
              }}
            >
              STAN
            </span>
          </div>
        )}
        <a
          href="https://www.buymeacoffee.com/ryanstanley"
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: fontStacks.mono,
                fontSize: 16,
                color: T.textDim,
                width: 20,
                textAlign: "center",
              }}
            >
              ☕
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 14,
                color: T.textDim,
                fontWeight: 500,
              }}
            >
              Buy me a coffee
            </span>
            <span
              style={{
                fontFamily: fontStacks.mono,
                fontSize: 9,
                color: T.textMute,
                letterSpacing: "0.08em",
              }}
            >
              EXTERNAL
            </span>
          </div>
        </a>
      </div>

      <div
        onClick={onLogout}
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${T.lineBold}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: T.red,
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: fontStacks.mono,
            fontSize: 16,
            width: 20,
            textAlign: "center",
          }}
        >
          ⏻
        </span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>Log out</span>
      </div>
    </div>
  );
}

function ChatDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!mounted) return null;

  return (
    <Fragment>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 41,
          width: "40%",
          minWidth: 350,
          background: T.panel,
          borderRight: `1px solid ${T.lineBold}`,
          boxShadow: "8px 0 24px rgba(0,0,0,0.5)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.2s ease",
        }}
      >
        <FAChatWindow screen="league" />
      </div>
    </Fragment>
  );
}
