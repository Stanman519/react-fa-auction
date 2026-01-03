import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { DragableMatchups } from "../confidence/DragableMatchups";
import { ConfidenceResultsAccordian } from "../confidence/ConfidenceResultsAccordian";
import { MenuBar } from "../menuBar";
import { Rules } from "../confidence/Rules";
import { Alert, Box, Button, Snackbar, Tab, Tabs, useTheme } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Boarding } from "boarding.js";
import "boarding.js/styles/main.css";
import "boarding.js/styles/themes/basic.css";
import { RootState } from "../../redux/reducers/RootReducer";
import { updateUI } from "../../redux/actions/UiActions";
import { useNavigate } from "react-router-dom";

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

function ConfidenceHome({ isDemo = false }: { isDemo?: boolean }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const { matchups, results } = useSelector((state: RootState) => state.confidence);
  const { modal, errorText } = useSelector((state: RootState) => state.ui);
  const theme = useTheme();
  const [value, setValue] = useState("1");

  const testRef = useRef(null);
  const boarding = new Boarding({
    opacity: 0.75,
    allowClose: false,
  });

  boarding.defineSteps([
    {
      element: "#matchup0",
      popover: {
        className: "first-step-popover-class",
        title: "Make Your Picks",
        description:
          "Pick the team you think will win each game.\n\nTry it out on this game!",
        prefferedSide: "bottom",
      },
    },
    {
      element: "#matchup1",
      popover: {
        title: "Order Your Picks",
        description:
          "Drag and drop each game based on your confidence in your choices.  If you are on mobile, press and hold for a moment before dragging.\n\nPick a team and drag this game to the top!",
        prefferedSide: "top",
      },
    },
    {
      element: "#point-card-2",
      popover: {
        title: "Order Your Picks",
        description:
          "If you pick the winner correctly, you'll get the number of points next to the game.",
        prefferedSide: "top",
      },
    },
    {
      element: "#prop-container",
      popover: {
        title: "Tiebreakers",
        description:
          "Each week there will be a bonus question to help break any ties at the end.",
        prefferedSide: "top",
      },
    },
    {
      element: "#submit-button",
      popover: {
        title: "Submit",
        description:
          "Click here to save your picks. Do this before the first game every week.",
        prefferedSide: "top",
      },
    },
    {
      element: testRef?.current ?? "",
      popover: {
        title: "Results",
        description:
          "After each game, you'll get the points if you were right. You can see where you are ranked here.",
        prefferedSide: "right",
      },
    },
  ]);

  const startTutorial = () => {
    boarding.start();
  };

  // Define the steps for introduction

  useEffect(() => {
    setValue("1");
  }, [isDemo]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    // If clicking on Rules tab, open modal and stay on current tab
    if (newValue === "3") {
      dispatch(updateUI({ modal: "confidence-rules" }));
      return;
    }
    // If clicking on Demo tab, navigate to demo
    if (newValue === "4") {
      navigate("/demo");
      return;
    }
    setValue(newValue);
  };

  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col justify-start items-center"
      style={{ overflowX: "hidden", overflowY: "hidden", minHeight: "100vh" }}
    >
      <MenuBar />
      
      {/* Rules component handles its own modal via Redux */}
      <Rules />

      <TabContext value={value}>
        <div className="flex flex-row w-full justify-center ">
          <TabList
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="inherit"
          >
            <Tab label="My Picks" value={"1"} />
            <Tab ref={testRef} label="Results" value={"2"} />
            <Tab label="Rules" value={"3"} />
            {!isDemo && <Tab label="See Demo" value={"4"} />}
          </TabList>
        </div>
        {isDemo && (
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            {value === "1" && (
              <Button
                variant="outlined"
                style={{ marginBottom: -10, marginTop: 10, width: 300 }}
                onClick={() => startTutorial()}
              >
                start tutorial
              </Button>
            )}
          </div>
        )}
{isDemo && (
        <Box
          sx={{
            width: '100%',
            // backgroundColor: '#ff9800',
            color: 'white',
            overflow: 'hidden',
            position: 'relative',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            // borderBottom: '3px solid #f57c00',
          }}
        >
          <Box
            sx={{
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',

              animation: 'scroll-left 60s linear infinite',
              whiteSpace: 'nowrap',
              '@keyframes scroll-left': {
                '0%': {
                  transform: 'translateX(20%)',
                },
                '100%': {
                  transform: 'translateX(-100%)',
                },
              },
            }}
          >
            {[...Array(10)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>

                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff9800' }}>
                  DEMO MODE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </div>

              </Box>
            ))}
          </Box>
        </Box>
      )}
        <TabPanel
          value={"1"}
          dir={theme.direction}
          className="w-full flex flex-row justify-center"
        >
          <DragableMatchups user={user} isDemo={isDemo} />
        </TabPanel>
        <TabPanel
          value={"2"}
          dir={theme.direction}
          className="w-full flex flex-row justify-center"
        >
          {results && results.length > 0 ? (
            <ConfidenceResultsAccordian isDemo={isDemo} />
          ) : (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              color: theme.palette.text.secondary,
              fontSize: '1.1rem'
            }}>
              Results will appear here when the games begin
            </div>
          )}
        </TabPanel>
      </TabContext>
      <Snackbar
        open={modal === "confidence-submit-success"}
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
      <Snackbar
        open={modal === "error"}
        autoHideDuration={8000}
        onClose={() => {
          dispatch(updateUI({ modal: undefined }));
        }}
      >
        <Alert
          severity="error"
          onClose={() => dispatch(updateUI({ modal: undefined }))}
        >
          {errorText}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ConfidenceHome;
