import { useDispatch, useSelector } from "react-redux";
import TriTable from "./nonAuction/TriTable";
import { RootState } from "../store";
import DeadCapParentCard from "./nonAuction/DeadCapParentCard";
import DashboardMenu from "./nonAuction/DashboardMenu";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardTabNav from "./nonAuction/DashboardTabNav";
import BuyoutTile from "./nonAuction/BuyoutTile";
import FranchiseTags from "./nonAuction/FranchiseTags";
import TaxiSquadTile from "./nonAuction/TaxiSquadTile";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { loadDashboardData } from "../redux/actions/TransactionActions";
import WaiverExtensions from "./nonAuction/WaiverExtensions";
import { updateUI } from "../redux/actions/UiActions";
import { OverUnderRow } from "./games/OverUnders/OverUnderRow";
import AdvancedContractTrades from "./nonAuction/AdvancedContractTrades";
import PendingTrades from "./nonAuction/PendingTrades";
import { updateLoginInfo } from "../redux/actions/LoginActions";

interface Tab {
  label: string;
  value: string;
}

const HomeBase = () => {
  const profileState = useSelector((state: RootState) => state.profile);
  const { currentLeagueId, authSynchronized, owner } = profileState;
  const { franchiseWinTotals } = useSelector(
    (state: RootState) => state.overUnders,
  );
  const { modal } = useSelector((state: RootState) => state.ui);
  const {} = useSelector((state: RootState) => state);
  const isLoading = useSelector(
    (state: RootState) => state.ui.isLoading === "full-screen",
  );
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [currentTab, setCurrentTab] = useState("league");
  const leagueTab: Tab = { label: "LEAGUE INFO", value: "league" };
  const currentLeague = useSelector((state: RootState) =>
    state.profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    ),
  );
  var draftTabs: Tab[] = [
    leagueTab,
    { label: "FREE TAXI CUTS", value: "taxi" },
    { label: "PROPOSE TRADE", value: "new-trades" },
    { label: "PENDING TRADES", value: "pending-trades" },
  ];
  if (currentLeague?.league.isBuyoutSzn)
    draftTabs.push({ label: "AMNESTY BUYOUTS", value: "buyouts" });
  if (currentLeague?.league.isFranchiseTagSzn)
    draftTabs.push({ label: "FRANCHISE TAGS", value: "tags" });
  if (currentLeague?.league.isFranchiseTagSzn)
    draftTabs.push({ label: "WAIVER EXTENSION", value: "waiver" });
  const [tabs, setTabs] = useState<Tab[]>(draftTabs);
  const { deadCap } = useSelector((state: RootState) => state.deadCap);

  // Load dashboard data when auth is synchronized
  useEffect(() => {
    if (authSynchronized && (!deadCap || deadCap.length === 0)) {
      dispatch(loadDashboardData());
    }
  }, [authSynchronized, deadCap, dispatch]);

  // Handle one-time redirect to auction (but only if not already redirected for this league)
  // This redirect happens after AuthCallback has routed here, so if we're here and
  // league.redirected is null, we can safely redirect once and set the flag.
  useEffect(() => {
    if (!currentLeague) return;

    const alreadyRedirected = currentLeague.redirected === "auction";
    if (currentLeague.league.isAuctioning && !alreadyRedirected) {
      // Set the redirected flag on the league to prevent future redirects
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
        // Navigate AFTER dispatch completes
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
    <div>
      <DashboardMenu />
      {isLoading ? (
        <div className="flex-1 flex justify-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          {currentLeague ? (
            <div className="flex flex-col pt-4">
              {currentLeague?.teamName && (
                <div className="text-2xl pb-4 m-1 text-center">
                  {currentLeague?.league.name} Dashboard
                </div>
              )}
              {tabs.length > 1 && (
                <DashboardTabNav
                  onChange={(newTab) => setCurrentTab(newTab)}
                  tabs={tabs}
                />
              )}

              <div className="min-w-full">
                {currentTab === "league" && (
                  <div className="flex flex-col">
                    <DeadCapParentCard />
                    <TriTable />
                  </div>
                )}
                <Snackbar
                  open={modal === "dashboard-success"}
                  autoHideDuration={800}
                  onClose={() => dispatch(updateUI({ modal: undefined }))}
                >
                  <Alert
                    severity="success"
                    onClose={() => dispatch(updateUI({ modal: undefined }))}
                  >
                    Submission Complete!
                  </Alert>
                </Snackbar>
                {currentTab === "tags" && <FranchiseTags />}
                {currentTab === "taxi" && <TaxiSquadTile />}
                {currentTab === "buyouts" && <BuyoutTile />}
                {currentTab === "waiver" && <WaiverExtensions />}
                {currentTab === "new-trades" && <AdvancedContractTrades />}
                {currentTab === "pending-trades" && <PendingTrades />}
              </div>
            </div>
          ) : (
            <CircularProgress />
          )}
        </>
      )}
    </div>
  );
};
export default HomeBase;
