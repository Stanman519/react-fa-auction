import { useDispatch, useSelector } from "react-redux";
import TriTable from "./nonAuction/TriTable";
import { RootState } from "../store";
import DeadCapParentCard from "./nonAuction/DeadCapParentCard";
import DashboardMenu from "./nonAuction/DashboardMenu";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useRef } from "react";
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
import { redirectToAuction } from "../redux/actions/LoginActions";

interface Tab {
  label: string;
  value: string;
}

const HomeBase = () => {
  const { currentLeague, authSynchronized, redirected } = useSelector(
    (state: RootState) => state.profile,
  );
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
  const hasRedirectedToAuction = useRef(false);

  useEffect(() => {
    console.log("getting dead cap");
    if (authSynchronized && (!deadCap || deadCap.length === 0)) {
      console.log("loading dead cap");
      dispatch(loadDashboardData());
    }
  }, [authSynchronized, deadCap]);

  // useEffect(() => {  // i dont know this was causing looping
  //   dispatch(loadDashboardData());
  // }, [currentLeague?.league?.leagueId]);

  useEffect(() => {
    console.log("redir", redirected);
    if (currentLeague?.league.isAuctioning && redirected != "auction") {
      dispatch(redirectToAuction());
      nav("/auction");
    }
    if (authSynchronized && !currentLeague) nav("/games");
  }, [authSynchronized, currentLeague, nav]);
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
