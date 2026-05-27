import { LotBody } from "../components/lot/lot";
import { useEffect, useMemo, useRef, useState } from "react";
import { getInitialAuctionData } from "../redux/actions/FreeAgentActions";
import { seedActivity } from "../redux/actions/ActivityActions";
import { fetchHeadlines } from "../redux/actions/HeadlineActions";
import { fetchQuotes } from "../redux/actions/QuoteActions";
import { loadPersistedActivity } from "../redux/reducers/ActivityReducer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { MenuBar } from "../components/menuBar";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Drawer,
  IconButton,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { updateUI } from "../redux/actions/UiActions";
import signalR from "../signalR/socketMiddleware";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { FreeAgentGridModal } from "./FreeAgentGridModal";
import { BidHistorySlab } from "./lot/bioAndHistory";
import { updateCurrentLeague } from "../redux/actions/LoginActions";
import { Ticker } from "./auction/Ticker";
import { Sidebar } from "./auction/Sidebar";
import { LotRow, LotRowHeader } from "./auction/LotRow";
import { useWatchlist } from "./auction/useWatchlist";
import { NominateModal } from "./auction/NominateModal";
import { NominateBottomButton } from "./auction/NominateBottomButton";
import { SoldMoment } from "./auction/SoldMoment";
import { terminal, fontStacks } from "../../theme";

function AuctionHome() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [reconSign, setReconSign] = useState(false);
  const [crossLeagueAlertDismissed, setCrossLeagueAlertDismissed] =
    useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [antiSnipeAt, setAntiSnipeAt] = useState<number | null>(null);
  const expiresRef = useRef<Map<number, number>>(new Map());

  const { user, isAuthenticated, isLoading } = useAuth0();
  const newNom = useSelector((s: RootState) =>
    s.lots.find((l) => l.newNom),
  );
  const lots = useSelector((s: RootState) => s.lots);
  const { error, errorText, modal } = useSelector((s: RootState) => s.ui);
  const { authSynchronized, owner, currentLeagueId } = useSelector(
    (s: RootState) => s.profile,
  );
  const loading = useSelector((s: RootState) => s.ui.isLoading);
  const { hasReconnected } = useSelector((s: RootState) => s.signalR);

  const watch = useWatchlist();
  const navigate = useNavigate();

  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const currentLeague = owner.leagues.find(
    (l) => l.league.leagueId === currentLeagueId,
  );
  const otherAuctioningLeagues = owner.leagues.filter(
    (l) => l.league.leagueId !== currentLeagueId && l.league.isAuctioning,
  );

  const prevLeagueRef = useRef(currentLeagueId);
  useEffect(() => {
    if (prevLeagueRef.current !== currentLeagueId) {
      prevLeagueRef.current = currentLeagueId;
      setCrossLeagueAlertDismissed(false);
    }
    if (currentLeagueId) {
      dispatch(seedActivity(loadPersistedActivity(currentLeagueId), currentLeagueId));
      dispatch(fetchHeadlines(currentLeagueId) as any);
      dispatch(fetchQuotes(currentLeagueId) as any);
    }
  }, [currentLeagueId]);

  const signalRInitialized = useRef(false);
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.sub && authSynchronized) {
      if (!signalRInitialized.current) {
        signalRInitialized.current = true;
        dispatch(getInitialAuctionData(user.sub));
        dispatch(signalR());
      }
    }
  }, [isLoading, isAuthenticated, user, authSynchronized]);

  useEffect(() => {
    if (lots.length > 0) setSortBy("time");
  }, [lots.length > 0]);

  useEffect(() => {
    if (hasReconnected) {
      setReconSign(true);
      setTimeout(() => setReconSign(false), 5000);
    }
  }, [hasReconnected]);

  const activeLots = useMemo(
    () => lots.filter((l) => l.bid && !l.newNom),
    [lots],
  );

  const myLeagueOwnerId = currentLeague?.leagueownerid ?? -1;
  const sortedLots = useMemo(() => {
    const arr = [...activeLots];
    if (sortBy === "time") {
      arr.sort((a, b) => {
        const da = a?.bid?.expires ? new Date(a.bid.expires).getTime() : 0;
        const db = b?.bid?.expires ? new Date(b.bid.expires).getTime() : 0;
        return da - db;
      });
    } else if (sortBy === "salary") {
      arr.sort(
        (a, b) =>
          (b?.bid?.bidSalary ?? -Infinity) - (a?.bid?.bidSalary ?? -Infinity),
      );
    } else if (sortBy === "position") {
      arr.sort((a, b) =>
        (a?.bid?.player?.position ?? "").localeCompare(
          b?.bid?.player?.position ?? "",
        ),
      );
    } else if (sortBy === "bids") {
      arr.sort(
        (a, b) =>
          ((b?.bid?.ownerId ?? 0) === myLeagueOwnerId ? 1 : 0) -
          ((a?.bid?.ownerId ?? 0) === myLeagueOwnerId ? 1 : 0),
      );
    }
    return arr;
  }, [activeLots, sortBy, myLeagueOwnerId]);

  // Anti-snipe detection: any lot's expires extended forward → flash banner.
  useEffect(() => {
    let extended = false;
    for (const l of activeLots) {
      const exp = l.bid?.expires
        ? new Date(l.bid.expires as unknown as string).getTime()
        : 0;
      if (!exp) continue;
      const prev = expiresRef.current.get(l.lotId);
      if (prev != null && exp - prev > 15_000) extended = true;
      expiresRef.current.set(l.lotId, exp);
    }
    if (extended) {
      setAntiSnipeAt(Date.now());
      const id = setTimeout(() => setAntiSnipeAt(null), 3000);
      return () => clearTimeout(id);
    }
  }, [activeLots]);

  // Watchlist pins starred lots to the top.
  const displayLots = useMemo(() => {
    const starred: typeof sortedLots = [];
    const rest: typeof sortedLots = [];
    for (const l of sortedLots) {
      if (l.bid?.player?.mflId && watch.has(l.bid.player.mflId)) starred.push(l);
      else rest.push(l);
    }
    return [...starred, ...rest];
  }, [sortedLots, watch]);

  // Select first lot by default on desktop.
  useEffect(() => {
    if (selectedLotId == null && displayLots.length > 0 && isDesktop) {
      setSelectedLotId(displayLots[0].lotId);
    }
  }, [displayLots, selectedLotId, isDesktop]);

  const selectedLot =
    displayLots.find((l) => l.lotId === selectedLotId) ?? null;

  const handleSelectLot = (lotId: number) => {
    setSelectedLotId(lotId);
  };

  const sidebarNode = (
    <Sidebar
      sortBy={sortBy}
      onSort={(v) => setSortBy(v)}
      watchCount={watch.ids.size}
    />
  );

  const listNode = (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {isMobile && antiSnipeAt && (
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            background: terminal.redDim,
            borderBottom: `1px solid ${terminal.lineBold}`,
            color: terminal.red,
            fontFamily: fontStacks.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          +1:00 ANTI-SNIPE · TIMER EXTENDED
        </Box>
      )}
      <LotRowHeader />
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {displayLots.map((l) => (
          <LotRow
            key={l.lotId}
            lot={l}
            active={l.lotId === selectedLotId}
            onClick={() => handleSelectLot(l.lotId)}
            starred={!!(l.bid?.player?.mflId && watch.has(l.bid.player.mflId))}
            onToggleStar={watch.toggle}
          />
        ))}
        {!newNom && displayLots.length === 0 && loading !== "full-screen" && (
          <Box
            sx={{
              px: 1.75,
              py: 2,
              textAlign: "center",
              fontFamily: fontStacks.mono,
              fontSize: 10,
              letterSpacing: "0.08em",
              color: terminal.textMute,
            }}
          >
            NO ACTIVE LOTS · NOMINATE TO KICK THINGS OFF
          </Box>
        )}
        <NominateBottomButton />
      </Box>
      <Box
        sx={{
          px: 1.75,
          py: 1,
          background: terminal.panel,
          borderTop: `1px solid ${terminal.lineBold}`,
          fontFamily: fontStacks.mono,
          fontSize: 10,
          color: terminal.textMute,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{displayLots.length} ACTIVE</span>
        <span>
          SORT:{" "}
          <Box component="span" sx={{ color: terminal.text }}>
            {sortBy?.toUpperCase() ?? "—"}
          </Box>
        </span>
      </Box>
    </Box>
  );

  const detailNode = selectedLot ? (
    <Box
      sx={{
        background: terminal.panel,
        borderLeft: `1px solid ${terminal.lineBold}`,
        height: "100%",
        overflow: "auto",
      }}
    >
      <LotBody
        lot={selectedLot}
        starred={!!(selectedLot.bid?.player?.mflId && watch.has(selectedLot.bid.player.mflId))}
        onToggleStar={watch.toggle}
      />
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: terminal.textMute,
        fontFamily: fontStacks.mono,
        fontSize: 11,
        letterSpacing: "0.08em",
      }}
    >
      SELECT A LOT
    </Box>
  );

  const gridCols = isDesktop
    ? "240px minmax(0, 1fr) 420px"
    : isTablet
      ? "minmax(0, 1fr) 380px"
      : "minmax(0, 1fr)";

  return (
    <Box
      sx={{
        background: terminal.bg,
        color: terminal.text,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MenuBar />

      {currentLeague && (
        <Box
          sx={{
            background: terminal.panel,
            borderBottom: `1px solid ${terminal.line}`,
            color: terminal.text,
            px: 2,
            py: 0.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: isMobile ? 52 : 96,
            zIndex: 9,
            gap: 1,
          }}
        >
          {isMobile && (
            <IconButton
              size="small"
              onClick={() => setMobileSidebarOpen(true)}
              sx={{ color: terminal.textDim }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          )}
          <Box
            sx={{
              fontFamily: fontStacks.mono,
              fontWeight: 700,
              letterSpacing: "0.08em",
              fontSize: 11,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentLeague.league.name.toUpperCase()}
            {!isMobile && " · FREE AGENT AUCTION"}
          </Box>
          {isMobile && (
            <Box
              component="button"
              onClick={() =>
                dispatch(updateUI({ modal: "free-agent-grid" }))
              }
              sx={{
                px: "8px",
                py: "4px",
                fontFamily: fontStacks.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                border: `1px solid ${terminal.line}`,
                color: terminal.textDim,
                background: "transparent",
                borderRadius: "2px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              FREE AGENTS
            </Box>
          )}
          {isMobile && (
            <Box
              component="button"
              onClick={() => setWatchlistOpen(true)}
              sx={{
                px: "8px",
                py: "4px",
                fontFamily: fontStacks.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                border: `1px solid ${terminal.line}`,
                color: watch.ids.size > 0 ? terminal.lime : terminal.textDim,
                background: "transparent",
                borderRadius: "2px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ★ {watch.ids.size}
            </Box>
          )}
        </Box>
      )}

      {otherAuctioningLeagues.length > 0 && !crossLeagueAlertDismissed && (
        <Alert
          severity="warning"
          onClose={() => setCrossLeagueAlertDismissed(true)}
          sx={{ borderRadius: 0 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                if (user) {
                  dispatch(
                    updateCurrentLeague(
                      otherAuctioningLeagues[0].league.leagueId,
                      "/auction",
                      user,
                    ),
                  );
                }
              }}
            >
              SWITCH
            </Button>
          }
        >
          <strong>{otherAuctioningLeagues[0].league.name}</strong> is also
          auctioning right now
          {otherAuctioningLeagues.length > 1 &&
            ` (+${otherAuctioningLeagues.length - 1} more)`}
        </Alert>
      )}

      <Ticker />

      {reconSign && (
        <Snackbar open={reconSign} autoHideDuration={5000}>
          <Alert severity="success">Reconnected to auction.</Alert>
        </Snackbar>
      )}

      {loading === "full-screen" ? (
        <Backdrop
          sx={{ color: "#fff", zIndex: (t) => t.zIndex.drawer + 1 }}
          open
        >
          <CircularProgress size={100} />
        </Backdrop>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: gridCols,
            minHeight: 0,
          }}
        >
          {isDesktop && sidebarNode}
          {listNode}
          {!isMobile && detailNode}
        </Box>
      )}

      {/* Mobile sidebar drawer */}
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        PaperProps={{
          sx: { width: 280, background: terminal.panel },
        }}
      >
        {sidebarNode}
      </Drawer>

      {/* Mobile watchlist drawer */}
      <Drawer
        anchor="right"
        open={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        PaperProps={{
          sx: {
            width: "85%",
            maxWidth: 360,
            background: terminal.bg,
            color: terminal.text,
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            background: terminal.panel,
            borderBottom: `1px solid ${terminal.lineBold}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Box
              sx={{
                fontFamily: fontStacks.mono,
                fontSize: 9,
                color: terminal.textMute,
                letterSpacing: "0.08em",
              }}
            >
              WATCHLIST
            </Box>
            <Box sx={{ fontSize: 14, fontWeight: 700 }}>
              {watch.ids.size} starred
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => setWatchlistOpen(false)}
            sx={{ color: terminal.textDim }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {displayLots
            .filter(
              (l) => l.bid?.player?.mflId && watch.has(l.bid.player.mflId),
            )
            .map((l) => (
              <Box
                key={l.lotId}
                onClick={() => {
                  setSelectedLotId(l.lotId);
                  setWatchlistOpen(false);
                }}
                sx={{
                  px: 2,
                  py: 1.25,
                  borderBottom: `1px solid ${terminal.line}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {l.bid?.player?.fullName}
                  </Box>
                  <Box
                    sx={{
                      fontSize: 10,
                      fontFamily: fontStacks.mono,
                      color: terminal.textDim,
                      mt: "1px",
                    }}
                  >
                    {l.bid?.player?.position} · {l.bid?.player?.team}
                  </Box>
                </Box>
                <Box
                  sx={{
                    fontFamily: fontStacks.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: terminal.lime,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ${l.bid?.bidSalary}M × {l.bid?.bidLength}YR
                </Box>
              </Box>
            ))}
          {watch.ids.size === 0 && (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                color: terminal.textMute,
                fontFamily: fontStacks.mono,
                fontSize: 11,
                letterSpacing: "0.08em",
              }}
            >
              NO LOTS STARRED · TAP ★ ON A LOT TO WATCH IT
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Mobile lot-detail dialog */}
      <Dialog
        open={isMobile && selectedLot !== null}
        onClose={() => setSelectedLotId(null)}
        fullScreen
        PaperProps={{
          sx: { background: terminal.bg, color: terminal.text },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 1,
            borderBottom: `1px solid ${terminal.line}`,
            background: terminal.panel,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setSelectedLotId(null)}
            sx={{ color: terminal.textDim }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {selectedLot && (
          <LotBody
            lot={selectedLot}
            starred={!!(selectedLot.bid?.player?.mflId && watch.has(selectedLot.bid.player.mflId))}
            onToggleStar={watch.toggle}
          />
        )}
      </Dialog>

      {modal === "bid-history-slab" && <BidHistorySlab />}
      {modal === "free-agent-grid" && (
        <FreeAgentGridModal isOpen={modal === "free-agent-grid"} />
      )}

      <NominateModal />
      <SoldMoment />

      <Snackbar open={error === "snackbar"} autoHideDuration={6000}>
        <Alert
          onClose={() => dispatch(updateUI({ error: undefined }))}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorText}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AuctionHome;
