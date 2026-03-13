import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { DragableMatchups } from "../confidence/DragableMatchups";
import { ConfidenceResultsAccordian } from "../confidence/ConfidenceResultsAccordian";
import { MenuBar } from "../menuBar";
import { Rules } from "../confidence/Rules";
import { FAChatWindow } from "../chat";
import {
  Alert,
  Box,
  Button,
  Drawer,
  Snackbar,
  Tab,
  Tabs,
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
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
function splitPot(
  total: number,
  splits: { place: string; pct: number }[],
): { place: string; amount: string }[] {
  const floored = splits.map((s) => ({
    place: s.place,
    amount: Math.floor(total * s.pct),
  }));

  const used = floored.reduce((sum, p) => sum + p.amount, 0);
  const remainder = total - used;

  // Give leftover dollars to 1st place
  floored[0].amount += remainder;

  return floored.map((p) => ({
    place: p.place,
    amount: `$${p.amount}`,
  }));
}
// Payout Structure Component
function PayoutStructure({
  results,
  isDemo,
}: {
  results: ConfidencePlayerResult[];
  isDemo: boolean;
}) {
  const theme = useTheme();

  // Count paid entrants (isPaid = true)
  const paidEntrants = results.filter((r) => r.isPaid).length;
  const entryFee = 10; // $10 per entry
  const totalPot = paidEntrants * entryFee;

  // Determine number of winners and calculate payouts
  let payouts: { place: string; amount: string }[] = [];

  if (paidEntrants >= 1 && paidEntrants <= 10) {
    // 1 winner gets 100%
    payouts = [{ place: "1st", amount: `$${totalPot}` }];
  } else if (paidEntrants >= 11 && paidEntrants <= 20) {
    payouts = splitPot(totalPot, [
      { place: "1st", pct: 0.7 },
      { place: "2nd", pct: 0.3 },
    ]);
  } else if (paidEntrants >= 21 && paidEntrants <= 30) {
    payouts = splitPot(totalPot, [
      { place: "1st", pct: 0.65 },
      { place: "2nd", pct: 0.25 },
      { place: "3rd", pct: 0.1 },
    ]);
  } else if (paidEntrants >= 31 && paidEntrants <= 40) {
    payouts = splitPot(totalPot, [
      { place: "1st", pct: 0.6 },
      { place: "2nd", pct: 0.25 },
      { place: "3rd", pct: 0.1 },
      { place: "4th", pct: 0.05 },
    ]);
  } else if (paidEntrants >= 41) {
    const fifthPayout = entryFee;
    const remainingPot = totalPot - fifthPayout;

    payouts = [
      ...splitPot(remainingPot, [
        { place: "1st", pct: 0.6 },
        { place: "2nd", pct: 0.25 },
        { place: "3rd", pct: 0.1 },
        { place: "4th", pct: 0.05 },
      ]),
      { place: "5th", amount: `$${fifthPayout}` },
    ];
  }

  if (payouts.length === 0) {
    return null; // Don't show anything if no one has paid
  }

  return (
    <Box sx={{ my: 2, px: 2 }}>
      <Paper elevation={3} sx={{ py: 1, px: 2 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
        >
          Paid Entrants: {paidEntrants}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "nowrap",
            gap: 2,
          }}
        >
          {payouts.map((payout) => (
            <Box key={payout.place} sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontWeight: "bold" }}
              >
                {payout.place}
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}
              >
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
  const { matchups, results } = useSelector(
    (state: RootState) => state.confidence,
  );
  const { modal, errorText } = useSelector((state: RootState) => state.ui);
  const theme = useTheme();
  const [value, setValue] = useState("1");
  const [openChat, setOpenChat] = useState(false);

  // Check if game has started (if there are any points in results)
  const hasGameStarted = results.some((r) =>
    r.weeklyResults.some((w) => w.totalPoints > 0),
  );

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
    // If clicking on Chat/Demo tab
    if (newValue === "4") {
      if (hasGameStarted) {
        setOpenChat(true);
      } else {
        navigate("/demo");
      }
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
            onChange={handleChange}
            indicatorColor="primary"
            textColor="inherit"
          >
            <Tab label="My Picks" value={"1"} />
            <Tab ref={testRef} label="Results" value={"2"} />
            <Tab label="Rules" value={"3"} />
            {!isDemo && (
              <Tab
                label={hasGameStarted ? "Open Chat" : "See Demo"}
                value={"4"}
              />
            )}
            {isDemo && <Tab label="EXIT DEMO" value={"5"} />}
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
              width: "100%",
              // backgroundColor: '#ff9800',
              color: "white",
              overflow: "hidden",
              position: "relative",
              height: "48px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              // borderBottom: '3px solid #f57c00',
            }}
          >
            <Box
              sx={{
                marginTop: "4px",
                display: "flex",
                alignItems: "center",

                animation: "scroll-left 60s linear infinite",
                whiteSpace: "nowrap",
                "@keyframes scroll-left": {
                  "0%": {
                    transform: "translateX(20%)",
                  },
                  "100%": {
                    transform: "translateX(-100%)",
                  },
                },
              }}
            >
              {[...Array(10)].map((_, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "#ff9800",
                    }}
                  >
                    DEMO MODE
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </div>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        {value === "1" && (
          <TabPanel
            value={"1"}
            dir={theme.direction}
            className="w-full flex flex-row justify-center "
          >
            <DragableMatchups user={user} isDemo={isDemo} />
          </TabPanel>
        )}
        {value === "2" && (
          <TabPanel
            value={"2"}
            dir={theme.direction}
            className="w-full flex flex-col justify-start items-center"
            sx={{ p: 0, pt: 0 }}
          >
            <PayoutStructure results={results} isDemo={isDemo} />
            <ConfidenceResultsAccordian isDemo={isDemo} />
          </TabPanel>
        )}
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
      <Drawer
        PaperProps={{
          sx: { width: "40%", minWidth: 350 },
        }}
        anchor={"left"}
        open={openChat}
        onClose={() => setOpenChat(false)}
      >
        <FAChatWindow screen="league" />
      </Drawer>
    </div>
  );
}

export default ConfidenceHome;
