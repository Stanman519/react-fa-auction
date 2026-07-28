import { useDispatch, useSelector } from "react-redux";
import PowerRankings from "./dashboard/PowerRankings";
import { RootState } from "../store";
import DeadCapParentCard from "./nonAuction/DeadCapParentCard";
import { MenuBar } from "./menuBar";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardTabNav, {
  DashboardTab,
} from "./nonAuction/DashboardTabNav";
import BuyoutTile from "./nonAuction/BuyoutTile";
import FranchiseTags from "./nonAuction/FranchiseTags";
import TaxiSquadTile from "./nonAuction/TaxiSquadTile";
import { Alert, Box, CircularProgress, Snackbar, Typography } from "@mui/material";
import {
  getBuyoutCandidates,
  getFifthYearOptionCandidates,
  getFranchiseTagCandidates,
  getHoldoutCandidates,
  getTaxiSquadPlayers,
  getWaiverExtensionCandidates,
  loadDashboardData,
} from "../redux/actions/TransactionActions";
import WaiverExtensions from "./nonAuction/WaiverExtensions";
import FifthYearOptionTerminal from "./nonAuction/FifthYearOptionTerminal";
import { updateUI } from "../redux/actions/UiActions";
import AdvancedContractTrades from "./nonAuction/AdvancedContractTrades";
import PendingTrades from "./nonAuction/PendingTrades";
import { updateLoginInfo } from "../redux/actions/LoginActions";
import Holdouts from "./nonAuction/Holdouts";
import { RosterContracts } from "./dashboard/RosterContracts";
import { CapOutlook } from "./dashboard/CapOutlook";
import { Rulebook } from "./dashboard/Rulebook";
import { TERMINAL_UI_ENABLED } from "../../theme";
import TLeagueBar from "./nonAuction/terminal/TLeagueBar";
import LeagueInfoTerminal from "./nonAuction/terminal/LeagueInfoTerminal";
import { fetchRosters, clearRosters } from "../redux/actions/RosterActions";

const HomeBase = ({ isDemo = false }: { isDemo?: boolean }) => {
  const profileState = useSelector((state: RootState) => state.profile);
  const { currentLeagueId, authSynchronized, owner } = profileState;
  const { modal, errorText, successText } = useSelector((state: RootState) => state.ui);
  const isLoading = useSelector(
    (state: RootState) => state.ui.isLoading === "full-screen",
  );
  const dispatch = useDispatch();
  const nav = useNavigate();
  const location = useLocation();

  // Demo shows the read-only contract/cap surface only.
  const [currentTab, setCurrentTab] = useState(isDemo ? "roster" : "league");

  useEffect(() => {
    const tabState = (location.state as any)?.tab;
    if (tabState) setCurrentTab(tabState);
  }, [location.state]);
  const [loadingTab, setLoadingTab] = useState<string | null>(null);
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
  const fifthYearCount = currentLeague?.fifthYearOptionCandidates?.length ?? 0;

  const allTabs: DashboardTab[] = [
    { label: "LEAGUE INFO", value: "league" },
    { label: "ROSTER", value: "roster" },
    { label: "CAP OUTLOOK", value: "cap-outlook" },
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
    ...(currentLeague?.league.isFranchiseTagSzn || fifthYearCount > 0
      ? [{ label: "5TH YR OPTION", value: "fifth-year", badge: fifthYearCount || undefined }]
      : []),
    ...(currentLeague?.league.isFranchiseTagSzn || waiverCount > 0
      ? [{ label: "WAIVER EXTENSION", value: "waiver", badge: waiverCount }]
      : []),
    { label: "RULES", value: "rules" },
  ];

  // Demo exposes only the read-only contract/cap surface.
  const tabs: DashboardTab[] = isDemo
    ? [
        { label: "ROSTER", value: "roster" },
        { label: "CAP OUTLOOK", value: "cap-outlook" },
      ]
    : allTabs;

  // All open transaction windows, collapsed into one "ACTIVE WINDOWS" stat
  // (franchise-tag season opens both the tag and waiver windows).
  const activeWindows: string[] = [
    ...(currentLeague?.league.isFranchiseTagSzn ? ["FRANCHISE TAG", "WAIVER"] : []),
    ...(currentLeague?.league.isBuyoutSzn ? ["BUYOUT"] : []),
    ...(currentLeague?.league.isTaxiCutSzn ? ["TAXI CUTS"] : []),
  ];

  // --- Data loading ---
  // On mount / league change: load dead cap (LEAGUE INFO tab only)
  useEffect(() => {
    if (authSynchronized && currentLeagueId) {
      if (isDemo) {
        // Demo: only rosters (dead cap / rankings hit token-gated endpoints).
        dispatch(clearRosters() as any);
        dispatch(fetchRosters(currentLeagueId) as any);
        return;
      }
      fetchedTabs.current = new Set(["league", "roster"]);
      dispatch(loadDashboardData());
      dispatch(clearRosters() as any);
      dispatch(fetchRosters(currentLeagueId) as any);
    }
  }, [currentLeagueId, authSynchronized, dispatch]);

  // Lazy load when a tab is first opened
  const handleTabChange = async (newTab: string) => {
    setCurrentTab(newTab);
    // Roster and cap-outlook share the same data; fetching one satisfies both
    const rosterTab = newTab === "roster" || newTab === "cap-outlook";
    const rosterAlreadyFetched =
      fetchedTabs.current.has("roster") || fetchedTabs.current.has("cap-outlook");
    if (fetchedTabs.current.has(newTab)) return;
    fetchedTabs.current.add(newTab);
    setLoadingTab(newTab);
    try {
      if (rosterTab && !rosterAlreadyFetched && currentLeagueId) {
        await dispatch(fetchRosters(currentLeagueId) as any);
      }
      switch (newTab) {
        case "taxi":
          await dispatch(getTaxiSquadPlayers() as any);
          break;
        case "holdouts":
          await dispatch(getHoldoutCandidates() as any);
          break;
        case "buyouts":
          await dispatch(getBuyoutCandidates() as any);
          break;
        case "tags":
          await dispatch(getFranchiseTagCandidates() as any);
          break;
        case "fifth-year":
          await dispatch(getFifthYearOptionCandidates() as any);
          break;
        case "waiver":
          await dispatch(getWaiverExtensionCandidates() as any);
          break;
        // pending-trades and new-trades fetch their own data internally
      }
    } finally {
      setLoadingTab(null);
    }
  };


  return (
    <div>
      {!isDemo && <MenuBar />}
      {isLoading ? (
        <div className="flex-1 flex justify-center mt-8">
          <CircularProgress />
        </div>
      ) : (
        <>
          {currentLeague ? (
            <div className="flex flex-col">
              {TERMINAL_UI_ENABLED ? (
                <TLeagueBar
                  leagueName={currentLeague.league.name}
                  teamName={currentLeague.teamName}
                  stats={[
                    ...(currentLeague.league.isAuctioning
                      ? [{ label: "STATUS", value: <Link to={isDemo ? "/demo/auction" : "/auction"} style={{ color: "inherit", textDecoration: "underline" }}>AUCTION LIVE</Link>, tone: "lime" as const }]
                      : []),
                    ...(activeWindows.length > 0
                      ? [{ label: "ACTIVE WINDOWS", value: activeWindows.join(" · "), tone: "amber" as const }]
                      : []),
                  ]}
                />
              ) : (
                currentLeague?.teamName && (
                  <Box sx={{ textAlign: 'center', py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main" letterSpacing="0.03em">
                      {currentLeague?.league.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" letterSpacing="0.12em" sx={{ textTransform: 'uppercase' }}>
                      Dashboard
                    </Typography>
                  </Box>
                )
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
                  onClose={() => dispatch(updateUI({ modal: undefined, successText: undefined }))}
                >
                  <Alert
                    severity="success"
                    onClose={() => dispatch(updateUI({ modal: undefined, successText: undefined }))}
                  >
                    {successText || "Submission complete!"}
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
                  TERMINAL_UI_ENABLED ? (
                    <LeagueInfoTerminal onNavigateTab={handleTabChange} />
                  ) : (
                    <div className="flex flex-col gap-4">
                      <DeadCapParentCard />
                      <PowerRankings />
                    </div>
                  )
                )}
                {currentTab === "roster" && <RosterContracts />}
                {currentTab === "cap-outlook" && <CapOutlook />}
                {currentTab === "rules" && <Rulebook />}
                {currentTab === "tags" && (loadingTab === "tags" ? <div className="flex justify-center mt-8"><CircularProgress /></div> : <FranchiseTags />)}
                {currentTab === "fifth-year" && (loadingTab === "fifth-year" ? <div className="flex justify-center mt-8"><CircularProgress /></div> : <FifthYearOptionTerminal />)}
                {currentTab === "taxi" && (loadingTab === "taxi" ? <div className="flex justify-center mt-8"><CircularProgress /></div> : <TaxiSquadTile />)}
                {currentTab === "buyouts" && (loadingTab === "buyouts" ? <div className="flex justify-center mt-8"><CircularProgress /></div> : <BuyoutTile />)}
                {currentTab === "waiver" && (loadingTab === "waiver" ? <div className="flex justify-center mt-8"><CircularProgress /></div> : <WaiverExtensions />)}
                {currentTab === "holdouts" && (loadingTab === "holdouts" ? <div className="flex justify-center mt-8"><CircularProgress /></div> : <Holdouts />)}
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
