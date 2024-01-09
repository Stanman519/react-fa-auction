import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { DragableMatchups } from "../confidence/DragableMatchups";
import { ConfidenceResultsAccordian } from "../confidence/ConfidenceResultsAccordian";
import { synchronizeAuth0WithDbLogin } from "../../redux/actions/LoginActions";
import { ChatClient } from "../../services/ChatUtils";
import { MenuBar } from "../menuBar";
import { Rules } from "../confidence/Rules";
import { Alert, Button, Snackbar, Tab, Tabs, useTheme } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Boarding } from "boarding.js";
import "boarding.js/styles/main.css";
import "boarding.js/styles/themes/basic.css";
import { RootState } from "../../redux/reducers/RootReducer";
import { updateUI } from "../../redux/actions/UiActions";
import { getError } from "../../redux/actions/ConfidenceActions";

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
  const {matchups} = useSelector((state:RootState) => state.confidence)
  const {modal, errorText} = useSelector((state:RootState) => state.ui)
  const theme = useTheme();
  const [value, setValue] = useState('1');

  const testRef = useRef(null);
  const boarding = new Boarding({
    opacity: 0.75,
    allowClose: false
  });
  
      boarding.defineSteps([

        {
          element: "#matchup0",
          popover: {
            className: "first-step-popover-class",
            title: "Make Your Picks",
            description: "Pick the team you think will win each game.\n\nTry it out on this game!",
            prefferedSide: "bottom",
            
          },
        },        
        {
          element: "#matchup1",
          popover: {
            title: "Order Your Picks",
            description: "Drag and drop each game based on your confidence in your choices.  If you are on mobile, press and hold for a moment before dragging.\n\nPick a team and drag this game to the top!",
            prefferedSide: "top",
            
          },
        },   
        {
          element: "#point-card-2",
          popover: {
            title: "Order Your Picks",
            description: "If you pick the winner correctly, you'll get the number of points next to the game.",
            prefferedSide: "top",
            
          },
        },    
        {
          element: "#prop-container",
          popover: {
            title: "Tiebreakers",
            description: "Each week there will be a bonus question to help break any ties at the end.",
            prefferedSide: "top",
            
          },
        },  
        {
          element: "#submit-button",
          popover: {
            title: "Submit",
            description: "Click here to save your picks. Do this before the first game every week.",
            prefferedSide: "top",
            
          },
        },  
        {
          element: testRef?.current ?? "",
          popover: {
            title: "Results",
            description: "After each game, you'll get the points if you were right. You can see where you are ranked here.",
            prefferedSide: "right",
            
          },
        },
      ]);


  const startTutorial = () => {
    boarding.start()
  }

// Define the steps for introduction


  useEffect(() => {
    setValue('1')
  },[isDemo])

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
  }, [isAuthenticated, loginWithRedirect, isLoading, user, isDemo])

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };



  return (
    <div className="flex flex-col justify-start items-center" style={{ overflowX: 'hidden', overflowY: 'hidden', minHeight: '100vh' }}>

      <MenuBar isDemo={isDemo} chatChannel={'confidence'} barOptions={['confidence', 'chat']} />
      <Rules />
      <TabContext value={value}>
        <div className="flex flex-row w-full justify-center ">
          <TabList 
            value={value}
            onChange={handleChange}
            indicatorColor='primary'
            textColor="inherit"
          >
            <Tab label="My Picks" value={'1'} />
            <Tab ref={testRef} label="Results" value={'2'} />
          </TabList >
          
        </div>
        {isDemo && 
        <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
        {value === "1" && <Button variant="outlined" style={{marginBottom: -10, marginTop: 10, width: 300 }} 
        onClick={() => startTutorial()}>start tutorial</Button>}
        </div>}

        <TabPanel  value={'1'} dir={theme.direction} className="w-full flex flex-row justify-center">
          <DragableMatchups user={user} isDemo={isDemo} />
        </TabPanel>
        <TabPanel  value={'2'} dir={theme.direction} className="w-full flex flex-row justify-center">
          <ConfidenceResultsAccordian isDemo={isDemo} />
        </TabPanel>
      </TabContext>
      <Snackbar open={modal === 'confidence-submit-success'} autoHideDuration={800} onClose={() => dispatch(updateUI({modal: undefined}))} >
        <Alert severity="success" onClose={() => dispatch(updateUI({modal: undefined}))}>
          Submission Complete!
        </Alert>
      </Snackbar>
      <Snackbar open={modal === 'error'} autoHideDuration={8000} onClose={() => {

          dispatch(updateUI({modal: undefined}))}}>
        <Alert  severity="error" onClose={() => dispatch(updateUI({modal: undefined}))}>
          {errorText}
        </Alert>
      </Snackbar>


    </div>
  );
}

export default GamesHome;
