import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Alert, Box, Card, Fab, Snackbar, Typography } from "@mui/material";
import "boarding.js/styles/main.css";
import "boarding.js/styles/themes/basic.css";
import {
  fetchFranchiseWinTotals,
  fetchUserPicks,
  submitOverUnderPicks,
} from "../../../redux/actions/OverUnderActions";
import { OverUnderRow } from "./OverUnderRow";
import { MenuBar } from "../../menuBar";
import { Rules } from "../../confidence/Rules";
import { updateUI } from "../../../redux/actions/UiActions";
import { ChatClient } from "../../../services/ChatUtils";
import { RootState } from "../../../store";
import SendIcon from "@mui/icons-material/Send";
import InSeasonOUTeamRow from "./InSeasonOUTeamRow";
import { OverUnderPick } from "../../../services/GeneralApiSvc";
import UserPickChartForTeam from "./UserPickChartForTeam";

function OverUnderHome({ isDemo = false }: { isDemo?: boolean }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { modal, errorText } = useSelector((state: RootState) => state.ui);
  const { authSynchronized } = useSelector((state: RootState) => state.profile);
  const {
    franchiseWinTotals,
    userPicks,
    currentPool,
    selectedUser,
    selectedLine,
  } = useSelector((state: RootState) => state.overUnders);
  const rightNow = new Date();
  const isPreseason =
    rightNow < new Date(currentPool?.startDate ?? +new Date() + 100000);

  const selectedPoolUserId = selectedUser?.id;
  const totalPicks = franchiseWinTotals.filter(
    (p) => p.userPick.isOver !== undefined,
  ).length;
  const totalDoubles = franchiseWinTotals.filter(
    (p) => p.userPick.lineAdjustment !== 0,
  ).length;
  const [translateY, setTranslateY] = useState(64); // Initial translateY to match the menu bar height
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.sub && authSynchronized) {
      dispatch(fetchFranchiseWinTotals());
      //TODO: store this in cookies because it is set once and saved?
      dispatch(fetchUserPicks());
    }
    return () => {
      ChatClient.getInstance().chatInstance.disconnectUser();
    };
  }, [isLoading, isAuthenticated, user, authSynchronized]);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setTranslateY(0);
      } else {
        setTranslateY(64); // Adjust this value based on the height of your menu bar
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (
      franchiseWinTotals.length > 0 &&
      isPreseason &&
      franchiseWinTotals
        .map((f) => f.userPick)
        .every((p) => p.isOver === null || p.isOver === undefined)
    ) {
      dispatch(updateUI({ modal: "confidence-rules" }));
    }
  }, [franchiseWinTotals.length]);

  const getRelevantUserPick = (lineId: number) => {
    const pick = userPicks.find(
      (p) => p.lineId === lineId && p.userId === selectedPoolUserId,
    );
    if (!pick) {
      return {
        lineAdjustment: 0,
        userId: selectedPoolUserId,
        isOver: undefined,
        lineId: lineId,
      } as OverUnderPick;
    }
    return pick;
  };
  return (
    <div
      className="flex flex-col justify-start items-center"
      style={{ overflowX: "hidden", overflowY: "hidden", minHeight: "100vh" }}
    >
      <MenuBar />
      <Rules />

      {isPreseason ? (
        <Card
          className={`fixed left-0  p-4 shadow-lg rounded-md bg-white flex items-center transition-opacity ease-in-out hover:opacity-100 ${translateY === 0 ? "opacity-50" : "opacity-100"}`}
          sx={{
            zIndex: 3,
            transform: `translateY(${translateY}px)`,
            transition: "transform 0.2s ease-in-out, opacity 0.3s ease-in-out", // Smooth transition for both properties
            border: "1px solid #ddd",
          }}
        >
          <div className="flex flex-row justify-between items-start">
            <div
              className={`text-center px-4 py-2 rounded  mr-1  ${
                totalPicks === 24 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Typography variant="h6" className="text-gray-700">
                Picks: <span className="font-bold">{totalPicks}</span>
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                {totalPicks > 24 ? "Max" : "Required"}: 24
              </Typography>
            </div>
            <div
              className={`text-center px-4 py-2 rounded ${
                totalDoubles === 2 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Typography variant="h6" className="text-gray-700">
                Double Downs: <span className="font-bold">{totalDoubles}</span>
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                {totalDoubles > 2 ? "Max" : "Required"}: 2 (Hold down on
                selection)
              </Typography>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {selectedLine && (
            <Card
              className={`w-full p-4 flex flex-col justify-center fixed left-0 transition-opacity ease-in-out hover:opacity-100 ${translateY === 0 ? "opacity-50" : "opacity-100"}`}
              sx={{
                zIndex: 2,
                transform: `translateY(${translateY}px)`,
                transition:
                  "transform 0.2s ease-in-out, opacity 0.3s ease-in-out", // Smooth transition for both properties
              }}
            >
              <Typography
                variant="h5"
                className="text-center font-bold mb-2 flex-grow"
              >
                {
                  franchiseWinTotals.find((f) => f.id === selectedLine)
                    ?.franchise.name
                }{" "}
                Pick Distribution
              </Typography>
              <UserPickChartForTeam />
            </Card>
          )}
        </>
      )}
      <div
        style={{ marginTop: isPreseason ? "100px" : 175, width: "100%" }}
      ></div>
      {selectedUser && !isPreseason && (
        <Typography variant="h3">
          {selectedUser?.owner.displayName}'s Picks
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
          p: 2,
          pb: 8,
        }}
      >
        {isPreseason
          ? franchiseWinTotals.map((f) => <OverUnderRow key={f.id} prop={f} />)
          : franchiseWinTotals.map((f) => (
              <InSeasonOUTeamRow
                key={f.id}
                franchise={f}
                userPick={getRelevantUserPick(f.id)}
              />
            ))}
      </Box>
      {isPreseason && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1,
          }}
        >
          <Fab
            variant="extended"
            color="primary"
            disabled={totalPicks !== 24 || totalDoubles !== 2}
            onClick={() => dispatch(submitOverUnderPicks())}
          >
            <SendIcon className="mr-2" />
            Save Picks
          </Fab>
        </Box>
      )}
      <Snackbar
        open={modal === "confidence-submit-success"}
        autoHideDuration={6000}
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

export default OverUnderHome;
