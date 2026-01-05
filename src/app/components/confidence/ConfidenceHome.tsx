import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { DragableMatchups } from "../confidence/DragableMatchups";
import { ConfidenceResultsAccordian } from "../confidence/ConfidenceResultsAccordian";
import { MenuBar } from "../menuBar";
import { Rules } from "../confidence/Rules";
import { Alert, Box, Button, Snackbar, Tab, Tabs, useTheme, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Boarding } from "boarding.js";
import "boarding.js/styles/main.css";
import "boarding.js/styles/themes/basic.css";
import { RootState } from "../../redux/reducers/RootReducer";
import { updateUI } from "../../redux/actions/UiActions";
import { useNavigate } from "react-router-dom";
import { getConfidenceResults } from "../../redux/actions/ConfidenceActions";
import { ConfidencePlayerResult } from "../../models/ConfidenceDTOs";

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

// Payout Structure Component
function PayoutStructure({ results, isDemo }: { results: ConfidencePlayerResult[], isDemo: boolean }) {
  const theme = useTheme();
  
  // Count paid entrants (isPaid = true)
  const paidEntrants = results.filter(r => r.isPaid).length;
  const entryFee = 10; // $10 per entry
  const totalPot = paidEntrants * entryFee;
  
  // Determine number of winners and calculate payouts
  let payouts: { place: string; amount: string }[] = [];
  
  if (paidEntrants >= 1 && paidEntrants <= 10) {
    // 1 winner gets 100%
    payouts = [
      { place: "1st", amount: `$${totalPot}` }
    ];
  } else if (paidEntrants >= 11 && paidEntrants <= 20) {
    // 2 winners: 70%/30%
    payouts = [
      { place: "1st", amount: `$${(totalPot * 0.70).toFixed(0)}` },
      { place: "2nd", amount: `$${(totalPot * 0.30).toFixed(0)}` }
    ];
  } else if (paidEntrants >= 21 && paidEntrants <= 30) {
    // 3 winners: 65%/25%/10%
    payouts = [
      { place: "1st", amount: `$${(totalPot * 0.65).toFixed(0)}` },
      { place: "2nd", amount: `$${(totalPot * 0.25).toFixed(0)}` },
      { place: "3rd", amount: `$${(totalPot * 0.10).toFixed(0)}` }
    ];
  } else if (paidEntrants >= 31 && paidEntrants <= 40) {
    // 4 winners: 60%/25%/10%/5%
    payouts = [
      { place: "1st", amount: `$${(totalPot * 0.60).toFixed(0)}` },
      { place: "2nd", amount: `$${(totalPot * 0.25).toFixed(0)}` },
      { place: "3rd", amount: `$${(totalPot * 0.10).toFixed(0)}` },
      { place: "4th", amount: `$${(totalPot * 0.05).toFixed(0)}` }
    ];
  } else if (paidEntrants >= 41) {
    // 5+ winners: 5th gets entry back, rest split from remaining pot
    const fifthPayout = entryFee;
    const remainingPot = totalPot - fifthPayout;
    payouts = [
      { place: "1st", amount: `$${(remainingPot * 0.60).toFixed(0)}` },
      { place: "2nd", amount: `$${(remainingPot * 0.25).toFixed(0)}` },
      { place: "3rd", amount: `$${(remainingPot * 0.10).toFixed(0)}` },
      { place: "4th", amount: `$${(remainingPot * 0.05).toFixed(0)}` },
      { place: "5th", amount: `$${fifthPayout}` }
    ];
  }

  if (payouts.length === 0) {
    return null; // Don't show anything if no one has paid
  }

  return (
    <Box sx={{ mb: 2, px: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
          Paid Entrants: {paidEntrants}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
          {payouts.map((payout) => (
            <Box key={payout.place} sx={{ textAlign: 'center', minWidth: '80px' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 'bold' }}>
                {payout.place}
              </Typography>
              <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {payout.amount}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
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

  // Fetch results when switching to Results tab
  useEffect(() => {
    if (value === "2") {
      console.log("[ConfidenceHome] Loading results for tab switch");
      dispatch(getConfidenceResults(isDemo ? -1 : new Date().getFullYear()));
    }
  }, [value, isDemo, dispatch]);

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
    // If clicking on EXIT tab (in demo), navigate back to confidence
    if (newValue === "5") {
      navigate("/confidence");
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
            {isDemo && <Tab label="EXIT" value={"5"} />}
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
          className="w-full flex flex-row justify-center "
        >
          <DragableMatchups user={user} isDemo={isDemo} />
        </TabPanel>
        <TabPanel
          value={"2"}
          dir={theme.direction}

          className="w-full flex flex-col jusify-center"
          sx={{ p: 0, pt: 1, alignItems: "center" }}
        >
          <PayoutStructure results={results} isDemo={isDemo} />
          <ConfidenceResultsAccordian isDemo={isDemo} />
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
