import { useSelector } from "react-redux";
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
import { CircularProgress } from "@mui/material";




const HomeBase = () => {
  const { currentLeague } = useSelector((state: RootState) => state.profile)
  const { user } = useAuth0();
  const isLoading = useSelector((state: RootState) => state.ui.isLoading === 'full-screen')
  const nav = useNavigate()
  const [tab, setTab] = useState('league');
  const [tabs, setTabs] = useState([{ label: 'LEAGUE INFO', value: 'league' }])

  useEffect(() => {
    if (!currentLeague) return
    if (currentLeague.cutCandidates.length > 0 && !tabs.find(t => t.value === 'buyouts')) setTabs(tabs.concat({ label: 'BUYOUTS', value: 'buyouts' }))
    if (currentLeague.taxiPlayers.length > 0 && !tabs.find(t => t.value === 'taxi')) setTabs(tabs.concat({ label: 'TAXI CUTS', value: 'taxi' }))
    if (currentLeague.tagCandidates.length > 0 && !tabs.find(t => t.value === 'tags')) setTabs(tabs.concat({ label: 'FRANCHISE TAGS', value: 'tags' }))
  }, [currentLeague, tabs])

  useEffect(() => {
    if (!user) nav('/')
  }, [])

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
        {tabs.length > 1 && <DashboardTabNav onChange={(newTab) => setTab(newTab)} tabs={tabs} />}

        <div className="min-w-full">
          {tab === 'league' &&
            <div>
              <DeadCapParentCard />
              <div className="m-1">
                <TriTable />
              </div>
            </div>}
          {tab === 'tags' && <FranchiseTags />}
          {tab === 'taxi' && <TaxiSquadTile />}
          {tab === 'buyouts' && <BuyoutTile />}
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
