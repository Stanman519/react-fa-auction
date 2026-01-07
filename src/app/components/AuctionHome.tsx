import { LotBody } from "../components/lot/lot";
import { useEffect, useRef, useState } from "react";
import { getInitialAuctionData } from "../redux/actions/FreeAgentActions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { MenuBar } from "../components/menuBar";
import {
  Alert,
  Backdrop,
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

function AuctionHome() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [reconSign, setReconSign] = useState<boolean>(false);
  const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const newNom = useSelector((state: RootState) =>
    state.lots.find((l) => l.newNom),
  );
  const lots = useSelector((state: RootState) => state.lots);
  const activeLots = lots.filter((l) => l.bid && !l.newNom);
  const { error, errorText, modal } = useSelector(
    (state: RootState) => state.ui,
  );
  const { authSynchronized } = useSelector((state: RootState) => state.profile);
  const loading = useSelector((state: RootState) => state.ui.isLoading);
  const navigate = useNavigate();
  const { hasReconnected } = useSelector((state: RootState) => state.signalR);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.sub && authSynchronized) {
      console.log("User authenticated, fetching auction data");
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
      {reconSign && <div> Reconnected. </div>}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {loading === "full-screen" ? (
          <div>
            <Backdrop
              sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loading === "full-screen"}
            >
              <CircularProgress size={100} />
            </Backdrop>
          </div>
        ) : (
          <div className="p-2">
            {lots.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div style={{ marginRight: 7 }}>Sort By: </div>
                <ToggleButtonGroup
                  value={sortBy}
                  onChange={handleSort}
                  exclusive
                  aria-label="device"
                >
                  <ToggleButton value="position" aria-label="laptop">
                    Position
                  </ToggleButton>
                  <ToggleButton value="salary" aria-label="tv">
                    Salary
                  </ToggleButton>
                  <ToggleButton value="time" aria-label="phone">
                    Time
                  </ToggleButton>
                  <ToggleButton value="bids" aria-label="phone">
                    My Bids First
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            )}
            {modal === "bid-history-slab" && <BidHistorySlab />}
            <PlayerBioSlab />
            {modal === "free-agent-grid" && (
              <FreeAgentGridModal isOpen={modal === "free-agent-grid"} />
            )}
            {newNom && <LotBody lot={newNom} key={newNom.lotId} />}
            <div className=" flex flex-col md:flex-row flex-wrap items-center justify-center">
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
