import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { DragableMatchups } from "../confidence/DragableMatchups";
import { ConfidenceResultsAccordian } from "../confidence/ConfidenceResultsAccordian";
import { synchronizeAuth0WithDbLogin } from "../../redux/actions/LoginActions";
import { ChatClient } from "../../services/ChatUtils";
import { MenuBar } from "../menuBar";
import { Rules } from "../confidence/Rules";

function GamesHome({isDemo = false}:{isDemo?: boolean} ) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();





  useEffect(() => {

    if (isLoading || isDemo) return
    const checkUser = async () => {
      if (isAuthenticated && user?.sub) {
        dispatch(synchronizeAuth0WithDbLogin(user))
      } else {
        await loginWithRedirect({appState: {returnTo: '/games'}});
      }
  }
  checkUser()
    return () => {
        ChatClient.getInstance().chatInstance.disconnectUser();
    }
  }, [isAuthenticated, loginWithRedirect, isLoading, user])



  return (
    <div className="flex flex-col justify-start" style={{overflowX: 'hidden', overflowY: 'hidden', minHeight: '100vh'}}>

      <MenuBar chatChannel={'confidence'} barOptions={['confidence', 'chat']}/>
      <Rules /> 
      <div className="flex flex-col lg:flex-row lg:justify-around lg:max-w-full lg:content-start lg:p-2">
        <DragableMatchups user={user} isDemo={isDemo}/>
        <ConfidenceResultsAccordian isDemo={isDemo} /> 
      </div>
      <div style={{flex: 1}}></div>
    </div>
  );
}

export default GamesHome;
