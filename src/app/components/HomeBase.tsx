import { useDispatch, useSelector } from "react-redux";
import TriTable from "./nonAuction/TriTable";
import Cookies from 'universal-cookie/es6';
import { RootState } from "../store";
import DeadCapParentCard from "./nonAuction/DeadCapParentCard";
import TeamManagementCard from "./nonAuction/TeamManagementCard";
import DashboardMenu from "./nonAuction/DashboardMenu";
import { ConfirmModal } from "./ConfirmModal";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardTabNav from "./nonAuction/DashboardTabNav";
import BuyoutTile from "./nonAuction/BuyoutTile";
import FranchiseTags from "./nonAuction/FranchiseTags";
import TaxiSquadTile from "./nonAuction/TaxiSquadTile";




const HomeBase = () => {
  const { modal } = useSelector((state: RootState) => state.ui)
  const { currentLeague } = useSelector((state: RootState) => state.profile)
  const { user } = useAuth0();
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
    <div >
      <DashboardMenu />
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

      </div>


    </div>
  );
}
export default HomeBase;
