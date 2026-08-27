import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { Alert, Box, Fab, Snackbar } from "@mui/material";
import "boarding.js/styles/main.css";
import "boarding.js/styles/themes/basic.css";
import {
  fetchFranchiseWinTotals,
  fetchUserPicks,
  submitOverUnderPicks,
} from "../../../redux/actions/OverUnderActions";
import { OverUnderRow } from "./OverUnderRow";
import { MenuBar } from "../../menuBar";
import OverUnderRules from "./OverUnderRules";
import { updateUI } from "../../../redux/actions/UiActions";
import { RootState } from "../../../store";
import SendIcon from "@mui/icons-material/Send";
import InSeasonOUTeamRow from "./InSeasonOUTeamRow";
import { OverUnderPick } from "../../../services/GeneralApiSvc";
import OverUnderStickyBar from "./OverUnderStickyBar";
import { terminal as T, fontStacks } from "../../../../theme";
import { REQUIRED_DOUBLES, REQUIRED_PICKS } from "./pickStatus";

function OverUnderHome({ isDemo = false }: { isDemo?: boolean }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { modal, errorText } = useSelector((state: RootState) => state.ui);
  const { authSynchronized } = useSelector((state: RootState) => state.profile);
  const { franchiseWinTotals, userPicks, currentPool, selectedUser, selectedLine } =
    useSelector((state: RootState) => state.overUnders);
  const rightNow = new Date();
  const isPreseason =
    rightNow < new Date(currentPool?.startDate ?? +new Date() + 100000);

  const selectedPoolUserId = selectedUser?.id;
  // Must match the sticky bar's counter exactly — this one gates SAVE PICKS.
  const totalPicks = franchiseWinTotals.filter(
    (p) => p.userPick.isOver === true || p.userPick.isOver === false,
  ).length;
  const totalDoubles = franchiseWinTotals.filter(
    (p) => p.userPick.lineAdjustment !== 0,
  ).length;

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.sub && authSynchronized) {
      dispatch(fetchFranchiseWinTotals());
      //TODO: store this in cookies because it is set once and saved?
      dispatch(fetchUserPicks());
    }
  }, [isLoading, isAuthenticated, user, authSynchronized]);

  // Show the rules once for someone who hasn't picked yet — but only once per
  // visit, or switching seasons would pop it again on the way back.
  const rulesShown = useRef(false);
  useEffect(() => {
    if (
      !rulesShown.current &&
      franchiseWinTotals.length > 0 &&
      isPreseason &&
      franchiseWinTotals
        .map((f) => f.userPick)
        .every((p) => p.isOver === null || p.isOver === undefined)
    ) {
      rulesShown.current = true;
      dispatch(updateUI({ modal: "ou-rules" }));
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
      style={{
        minHeight: "100vh",
        background: T.bg,
        fontFamily: fontStacks.sans,
      }}
    >
      <MenuBar />
      <OverUnderRules />
      <OverUnderStickyBar isPreseason={isPreseason} />

      <Box
        sx={{
          width: "100%",
          maxWidth: 1280,
          display: "grid",
          // auto-fill + minmax kills the ragged last row the fixed-width
          // flex cards used to leave. The 1px gap reads as hairline rules.
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1px",
          background: T.line,
          border: `1px solid ${T.line}`,
          mt: 2,
          mb: 10,
        }}
      >
        {isPreseason
          ? franchiseWinTotals.map((f) => <OverUnderRow key={f.id} prop={f} />)
          : franchiseWinTotals.map((f) => (
              <InSeasonOUTeamRow
                key={f.id}
                franchise={f}
                userPick={getRelevantUserPick(f.id)}
                isSelected={f.id === selectedLine}
              />
            ))}
      </Box>

      {isPreseason && (
        <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 20 }}>
          <Fab
            variant="extended"
            disabled={
              totalPicks !== REQUIRED_PICKS || totalDoubles !== REQUIRED_DOUBLES
            }
            onClick={() => dispatch(submitOverUnderPicks())}
            sx={{
              fontFamily: fontStacks.mono,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              background: T.lime,
              color: "#000",
              "&:hover": { background: T.lime },
              "&.Mui-disabled": {
                background: T.panel2,
                color: T.textMute,
                border: `1px solid ${T.line}`,
              },
            }}
          >
            <SendIcon className="mr-2" sx={{ fontSize: 16 }} />
            SAVE PICKS
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
