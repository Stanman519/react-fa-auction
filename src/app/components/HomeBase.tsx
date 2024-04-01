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

interface Tab {
    label: string;
    value: string;
}


const HomeBase = () => {
  const { currentLeague } = useSelector((state: RootState) => state.profile)
    const { profile } = useSelector((state: RootState) => state)
    const { modal } = useSelector((state: RootState) => state.ui)
  const { user } = useAuth0();
  const isLoading = useSelector((state: RootState) => state.ui.isLoading === 'full-screen')
  const dispatch = useDispatch()
  const nav = useNavigate()
  const [currentTab, setCurrentTab] = useState('league');
  const leagueTab: Tab = { label: 'LEAGUE INFO', value: 'league' }
  const [tabs, setTabs] = useState<Tab[]>([leagueTab, { label: 'AMNESTY BUYOUTS', value: 'buyouts' }, { label: 'FREE TAXI CUTS', value: 'taxi' }, { label: 'FRANCHISE TAGS', value: 'tags' }, {label: "WAIVER EXTENSION", value: 'waiver'}])
  const {deadCap} = useSelector((state: RootState) => state.deadCap)

  useEffect(() => {
      console.log('deadcap', deadCap)

      if (!deadCap || deadCap.length === 0) {
        dispatch(loadDashboardData())
      }

  },[])

  return (
    <div>
      <DashboardMenu />
      {isLoading ? 
      <div className="flex-1 flex justify-center">
        <CircularProgress />
      </div>
      :
      <>
      {currentLeague ?
      <div className="flex flex-col items-center pt-4" >

        {currentLeague?.teamName &&
          <div className="text-2xl pb-4 m-1 text-center">Dashboard for {currentLeague?.teamName}</div>}
        {tabs.length > 1 && <DashboardTabNav onChange={(newTab) => setCurrentTab(newTab)} tabs={tabs} />}

        <div className="min-w-full">
          {currentTab === 'league' &&
            <div className="flex flex-col content-center">
              <DeadCapParentCard />
              <div className="max-w-5xl flex-1 m-1 self-center" >
                <TriTable  />
              </div>
            </div>}
            <Snackbar open={modal === 'dashboard-success'} autoHideDuration={800} onClose={() => dispatch(updateUI({modal: undefined}))} >
              <Alert severity="success" onClose={() => dispatch(updateUI({modal: undefined}))}>
                Submission Complete!
              </Alert>
            </Snackbar>
          {currentTab === 'tags' && <FranchiseTags />}
          {currentTab === 'taxi' && <TaxiSquadTile />}
          {currentTab === 'buyouts' && <BuyoutTile />}
          {currentTab === 'waiver' && <WaiverExtensions />}
        </div>
      </div> :
      <div>Your profile was not automatically linked to your MyFantasyLeague Account. Please contact the admin.</div>
      }
      </>
      }

    </div>
  );
}
export default HomeBase;
