import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { DragableMatchups } from "../confidence/DragableMatchups";
import { ConfidenceResultsAccordian } from "../confidence/ConfidenceResultsAccordian";
import { synchronizeAuth0WithDbLogin } from "../../redux/actions/LoginActions";
import { ChatClient } from "../../services/ChatUtils";
import { MenuBar } from "../menuBar";
import { Rules } from "../confidence/Rules";
import { Tab, Tabs, useTheme } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";


interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}



function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

function GamesHome({ isDemo = false }: { isDemo?: boolean }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const theme = useTheme();
  const [value, setValue] = useState('1');





  useEffect(() => {

    if (isLoading || isDemo) return
    const checkUser = async () => {
      if (isAuthenticated && user?.sub) {
        dispatch(synchronizeAuth0WithDbLogin(user))
      } else {
        await loginWithRedirect({ appState: { returnTo: '/games' } });
      }
    }
    checkUser()
    return () => {
      ChatClient.getInstance().chatInstance.disconnectUser();
    }
  }, [isAuthenticated, loginWithRedirect, isLoading, user])

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <div className="flex flex-col justify-start" style={{ overflowX: 'hidden', overflowY: 'hidden', minHeight: '100vh' }}>

      <MenuBar chatChannel={'confidence'} barOptions={['confidence', 'chat']} />
      <Rules />
      <TabContext value={value}>
        <div className="flex flex-row w-full justify-center">
          <TabList
            value={value}
            onChange={handleChange}
            indicatorColor='primary'
            textColor="inherit"
          >
            <Tab label="My Picks" value={'1'} />
            <Tab label="Results" value={'2'} />
          </TabList >
        </div>


        {/* <SwipeableViews
	  	disabled
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
		style={{}}
      > */}
        <TabPanel value={'1'} dir={theme.direction}>
          <DragableMatchups user={user} isDemo={isDemo} />
        </TabPanel>
        <TabPanel value={'2'} dir={theme.direction}>
          <ConfidenceResultsAccordian isDemo={isDemo} />
        </TabPanel>
      </TabContext>
      {/* </SwipeableViews> */}
      {/* <div className="flex flex-col lg:flex-row lg:justify-around lg:max-w-full lg:content-start p-2">
        <DragableMatchups user={user} isDemo={isDemo}/>
        <ConfidenceResultsAccordian isDemo={isDemo} /> 
      </div> */}

    </div>
  );
}

export default GamesHome;
