import { useDispatch, useSelector } from "react-redux";
import TriTable from "./nonAuction/TriTable";
import { RootState } from "../store";
import DeadCapParentCard from "./nonAuction/DeadCapParentCard";
import { MenuBar } from "./menuBar";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardTabNav, {
  DashboardTab,
} from "./nonAuction/DashboardTabNav";
import BuyoutTile from "./nonAuction/BuyoutTile";
import FranchiseTags from "./nonAuction/FranchiseTags";
import TaxiSquadTile from "./nonAuction/TaxiSquadTile";
import { Alert, Box, CircularProgress, Snackbar, Typography } from "@mui/material";
import {
  getBuyoutCandidates,
  getFranchiseTagCandidates,
  getHoldoutCandidates,
  getTaxiSquadPlayers,
  getWaiverExtensionCandidates,
  loadDashboardData,
} from "../redux/actions/TransactionActions";
import WaiverExtensions from "./nonAuction/WaiverExtensions";
import { updateUI } from "../redux/actions/UiActions";
import AdvancedContractTrades from "./nonAuction/AdvancedContractTrades";
import PendingTrades from "./nonAuction/PendingTrades";
import { updateLoginInfo } from "../redux/actions/LoginActions";
import Holdouts from "./nonAuction/Holdouts";

const HomeBase = () => {
  const profileState = useSelector((state: RootState) => state.profile);
  const { currentLeagueId, authSynchronized, owner } = profileState;
  const { modal, errorText } = useSelector((state: RootState) => state.ui);
  const isLoading = useSelector(
    (state: RootState) => state.ui.isLoading === "full-screen",
  );
  const dispatch = useDispatch();
  const nav = useNavigate();

  const [currentTab, setCurrentTab] = useState("league");
  // Track which tabs have already had their data fetched this session
  const fetchedTabs = useRef<Set<string>>(new Set(["league"]));

  const currentLeague = useSelector((state: RootState) =>
    state.profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    ),
  );
  const { deadCap } = useSelector((state: RootState) => state.deadCap);

  // --- Tab definitions ---
  // Seasonal tabs only appear when their season flag is on.
  // Always-present tabs hide when they have no data after first load.
  const holdoutCount = currentLeague?.holdoutCandidates?.filter(h => h.status === "Pending").length ?? 0;
  const taxiCount = currentLeague?.taxiPlayers?.length ?? 0;
  const tagCount = currentLeague?.tagCandidates?.length ?? 0;
  const buyoutCount = currentLeague?.cutCandidates?.length ?? 0;
  const waiverCount = currentLeague?.waiverExtensionPlayers?.length ?? 0;

  const tabs: DashboardTab[] = [
    { label: "LEAGUE INFO", value: "league" },
    { label: "PROPOSE TRADE", value: "new-trades" },
    { label: "PENDING TRADES", value: "pending-trades" },
    // Show TAXI CUTS if season is active OR there's data already loaded
    ...(currentLeague?.league.isTaxiCutSzn || taxiCount > 0
      ? [{ label: "FREE TAXI CUTS", value: "taxi", badge: taxiCount }]
      : []),
    // Always show HOLDOUTS so users know it exists; badge when there are candidates
    { label: "HOLDOUTS", value: "holdouts", badge: holdoutCount || undefined },
    ...(currentLeague?.league.isBuyoutSzn || buyoutCount > 0
      ? [{ label: "AMNESTY BUYOUTS", value: "buyouts" }]
      : []),
    ...(currentLeague?.league.isFranchiseTagSzn || tagCount > 0
      ? [{ label: "FRANCHISE TAGS", value: "tags" }]
      : []),
    ...(currentLeague?.league.isFranchiseTagSzn || waiverCount > 0
      ? [{ label: "WAIVER EXTENSION", value: "waiver", badge: waiverCount }]
      : []),
  ];

  // --- Data loading ---
  // On mount / league change: load dead cap (LEAGUE INFO tab only)
  useEffect(() => {
    if (authSynchronized && currentLeagueId) {
      fetchedTabs.current = new Set(["league"]);
      dispatch(loadDashboardData());
    }
  }, [currentLeagueId, authSynchronized, dispatch]);

  // Lazy load when a tab is first opened
  const handleTabChange = (newTab: string) => {
    setCurrentTab(newTab);
    if (fetchedTabs.current.has(newTab)) return;
    fetchedTabs.current.add(newTab);

    switch (newTab) {
      case "taxi":
        dispatch(getTaxiSquadPlayers());
        break;
      case "holdouts":
        dispatch(getHoldoutCandidates());
        break;
      case "buyouts":
        dispatch(getBuyoutCandidates());
        break;
      case "tags":
        dispatch(getFranchiseTagCandidates());
        break;
      case "waiver":
        dispatch(getWaiverExtensionCandidates());
        break;
      // pending-trades and new-trades fetch their own data internally
    }
  };

  // --- One-time redirect to auction ---
  useEffect(() => {
    if (!currentLeague) return;

    const alreadyRedirected = currentLeague.redirected === "auction";
    if (currentLeague.league.isAuctioning && !alreadyRedirected) {
      const leagues = [...(owner?.leagues ?? [])];
      const idx = leagues.findIndex(
        (l) => l.league.leagueId === currentLeagueId,
      );
      if (idx !== -1) {
        leagues[idx] = { ...leagues[idx], redirected: "auction" };
        dispatch(
          updateLoginInfo({
            ...profileState,
            owner: { ...owner, leagues },
          }),
        );
        setTimeout(() => {
          nav("/auction", { replace: true });
        }, 0);
      }
    }
  }, [
    currentLeague?.redirected,
    currentLeague?.league.isAuctioning,
    currentLeagueId,
    owner?.ownerId,
    dispatch,
    nav,
  ]);

  return (
    <div className="pt-16">
      <MenuBar />
      {isLoading ? (
        <div className="flex-1 flex justify-center mt-8">
          <CircularProgress />
        </div>
      ) : (
        <>
          {currentLeague ? (
            <div className="flex flex-col">
              {currentLeague?.teamName && (
                <Box sx={{ textAlign: 'center', py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h5" fontWeight={700} color="primary.main" letterSpacing="0.03em">
                    {currentLeague?.league.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" letterSpacing="0.12em" sx={{ textTransform: 'uppercase' }}>
                    Dashboard
                  </Typography>
                </Box>
              )}
              <DashboardTabNav
                currentValue={currentTab}
                onChange={handleTabChange}
                tabs={tabs}
              />

              <div className="min-w-full">
                <Snackbar
                  open={modal === "dashboard-success"}
                  autoHideDuration={5000}
                  onClose={() => dispatch(updateUI({ modal: undefined }))}
                >
                  <Alert
                    severity="success"
                    onClose={() => dispatch(updateUI({ modal: undefined }))}
                  >
                    Submission Complete!
                  </Alert>
                </Snackbar>
                <Snackbar
                  open={modal === "error"}
                  autoHideDuration={6000}
                  onClose={() => dispatch(updateUI({ modal: undefined, errorText: undefined }))}
                >
                  <Alert
                    severity="error"
                    onClose={() => dispatch(updateUI({ modal: undefined, errorText: undefined }))}
                  >
                    {errorText || "An error occurred."}
                  </Alert>
                </Snackbar>

                {currentTab === "league" && (
                  <div className="flex flex-col gap-4">
                    <DeadCapParentCard />
                    <TriTable />
                  </div>
                )}
                {currentTab === "tags" && <FranchiseTags />}
                {currentTab === "taxi" && <TaxiSquadTile />}
                {currentTab === "buyouts" && <BuyoutTile />}
                {currentTab === "waiver" && <WaiverExtensions />}
                {currentTab === "holdouts" && <Holdouts />}
                {currentTab === "new-trades" && <AdvancedContractTrades />}
                {currentTab === "pending-trades" && <PendingTrades />}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex justify-center mt-8">
              <CircularProgress />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomeBase;
