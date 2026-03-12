import { LotBody } from "../components/lot/lot";
import { useEffect, useRef, useState } from "react";
import { getInitialAuctionData } from "../redux/actions/FreeAgentActions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { MenuBar } from "../components/menuBar";
import {
  Alert,
  Backdrop,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@mui/material";
import { updateUI } from "../redux/actions/UiActions";
import signalR from "../signalR/socketMiddleware";
import { ChatClient } from "../services/ChatUtils";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { NoActiveAuctions } from "./noActiveAuctions";
import { FreeAgentGridModal } from "./FreeAgentGridModal";
import { BidHistorySlab, PlayerBioSlab } from "./lot/bioAndHistory";
import { sortLots } from "../redux/actions/LotActions";
import LeagueSwitchMenu from "./menu/LeagueSwitchMenu";
import { updateCurrentLeague } from "../redux/actions/LoginActions";

function AuctionHome() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [reconSign, setReconSign] = useState<boolean>(false);
  const [crossLeagueAlertDismissed, setCrossLeagueAlertDismissed] =
    useState<boolean>(false);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const newNom = useSelector((state: RootState) =>
    state.lots.find((l) => l.newNom),
  );
  const lots = useSelector((state: RootState) => state.lots);
  const activeLots = lots.filter((l) => l.bid && !l.newNom);
  const { error, errorText, modal } = useSelector(
    (state: RootState) => state.ui,
  );
  const { authSynchronized } = useSelector(
    (state: RootState) => state.profile,
  );
  const { owner, currentLeagueId } = useSelector(
    (state: RootState) => state.profile,
  );
  const loading = useSelector((state: RootState) => state.ui.isLoading);
  const navigate = useNavigate();
  const { hasReconnected } = useSelector(
    (state: RootState) => state.signalR,
  );
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  const currentLeague = owner.leagues.find(
    (l) => l.league.leagueId === currentLeagueId,
  );

  // Other leagues that are ALSO currently auctioning
  const otherAuctioningLeagues = owner.leagues.filter(
    (l) =>
      l.league.leagueId !== currentLeagueId && l.league.isAuctioning,
  );

  // Reset the cross-league alert dismissal when the league changes
  const prevLeagueRef = useRef(currentLeagueId);
  useEffect(() => {
    if (prevLeagueRef.current !== currentLeagueId) {
      prevLeagueRef.current = currentLeagueId;
      setCrossLeagueAlertDismissed(false);
    }
  }, [currentLeagueId]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.sub && authSynchronized) {
      dispatch(getInitialAuctionData(user.sub));
      dispatch(signalR());
    }
    return () => {
      ChatClient.getInstance().chatInstance.disconnectUser();
    };
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

  useEffect(() => {
    if (!sortBy) return;
    dispatch(sortLots(sortBy));
  }, [sortBy]);

  const handleSort = (
    event: React.MouseEvent<HTMLElement>,
    sort: string | null,
  ) => {
    if (sort !== null) {
      setSortBy(sort);
    }
  };

  return (
    <div
      className="App"
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <div className="menu-container">
        <MenuBar />
      </div>

      {/* League identity bar */}
      {currentLeague && (
        <div
          style={{
            backgroundColor: theme.palette.primary.dark,
            color: "white",
            padding: "6px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 64,
            zIndex: 9,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              letterSpacing: "0.06em",
              fontSize: "0.8rem",
            }}
          >
            {currentLeague.league.name.toUpperCase()} — FREE AGENT AUCTION
          </span>
          {owner.leagues.length > 1 && (
            <LeagueSwitchMenu />
          )}
        </div>
      )}

      {/* Cross-league active auction alert */}
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

      {reconSign && (
        <Snackbar open={reconSign} autoHideDuration={5000}>
          <Alert severity="success">Reconnected to auction.</Alert>
        </Snackbar>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        {loading === "full-screen" ? (
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading === "full-screen"}
          >
            <CircularProgress size={100} />
          </Backdrop>
        ) : (
          <div className="p-2 w-full">
            {lots.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div style={{ marginRight: 7 }}>Sort By: </div>
                <ToggleButtonGroup
                  value={sortBy}
                  onChange={handleSort}
                  exclusive
                  aria-label="sort options"
                  size="small"
                >
                  <ToggleButton value="position">Position</ToggleButton>
                  <ToggleButton value="salary">Salary</ToggleButton>
                  <ToggleButton value="time">Time</ToggleButton>
                  <ToggleButton value="bids">My Bids First</ToggleButton>
                </ToggleButtonGroup>
              </div>
            )}
            {modal === "bid-history-slab" && <BidHistorySlab />}
            <PlayerBioSlab />
            {modal === "free-agent-grid" && (
              <FreeAgentGridModal isOpen={modal === "free-agent-grid"} />
            )}
            {newNom && <LotBody lot={newNom} key={newNom.lotId} />}
            <div className="flex flex-col md:flex-row flex-wrap items-center justify-center">
              {activeLots.map((l) => (
                <LotBody lot={l} key={l.lotId} />
              ))}
            </div>
          </div>
        )}
        {!newNom && activeLots.length === 0 && loading !== "full-screen" && (
          <div
            style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
          >
            <NoActiveAuctions />
          </div>
        )}
      </div>
      <Snackbar open={error === "snackbar"} autoHideDuration={6000}>
        <Alert
          onClose={() => dispatch(updateUI({ error: undefined }))}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorText}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AuctionHome;
