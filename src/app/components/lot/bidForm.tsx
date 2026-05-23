import { Cancel } from "@mui/icons-material";
import {
  Backdrop,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  InputBase,
  Slide,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import LoadingButton from "@mui/lab/LoadingButton";
import { forwardRef, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeNewBid, makeNewNomination } from "../../redux/actions/LotActions";
import { Lot } from "../../redux/reducers/LotReducer";
import { RootState } from "../../redux/reducers/RootReducer";
import { BidValidity, checkValidity } from "../../services/Common";
import { terminal, fontStacks } from "../../../theme";
import { dfs, TERMINAL_FONT_SCALE } from "../nonAuction/terminal/tokens";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface BidFormProps {
  bidMode: boolean;
  lot: Lot;
}

const labelSx = {
  fontFamily: fontStacks.mono,
  fontSize: { xs: 10, md: Math.round(10 * TERMINAL_FONT_SCALE) },
  letterSpacing: "0.08em",
  color: terminal.textMute,
  textTransform: "uppercase" as const,
};

const numberSx = {
  fontFamily: fontStacks.mono,
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  color: terminal.text,
};

export const BidForm = ({ bidMode, lot }: BidFormProps): JSX.Element => {
  const capnWarning = process.env.PUBLIC_URL + "/capn-wtf.png";
  const theme = useTheme();
  const dispatch = useDispatch();

  const { owner, currentLeagueId } = useSelector(
    (state: RootState) => state.profile,
  );
  const currentLeague = useSelector((state: RootState) =>
    state.profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    ),
  );
  const highBidsOnTheBoard = useSelector((state: RootState) =>
    state.lots
      .filter((l) => l.bid?.ownerId === currentLeague?.leagueownerid)
      .map((b) => b.bid?.bidSalary)
      .reduce((prev, curr) => (prev ?? 0) + (curr ?? 0), 0),
  );

  const initialSalary = (lot.bid?.bidSalary ?? 0) + 1;
  const initialYears = lot.bid?.bidLength ?? 1;

  const [bidSalary, setBidSalary] = useState<number>(initialSalary);
  const [bidYears, setBidYears] = useState<number>(initialYears);

  const [isLoading, setIsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const validity: BidValidity = useMemo(() => {
    if (!currentLeague) {
      return { isValid: false, violations: ["You are not logged in."] };
    }
    return checkValidity(
      currentLeague,
      bidSalary || 0,
      bidYears || 0,
      lot.bid?.player?.mflId ?? 0,
      lot.bid?.bidSalary ?? 0,
      lot.bid?.bidLength ?? 0,
      highBidsOnTheBoard ?? 0,
    );
  }, [
    currentLeague,
    bidSalary,
    bidYears,
    lot.bid?.player?.mflId,
    lot.bid?.bidSalary,
    lot.bid?.bidLength,
    highBidsOnTheBoard,
  ]);

  const capRoom = currentLeague?.capRoom ?? 0;
  const capHit = bidSalary;
  const apy = bidYears > 0 ? bidSalary / bidYears : 0;
  const total = bidSalary * bidYears;
  // If I'm already top bidder on this lot, my own bid is in highBidsOnTheBoard.
  // Subtract it so REM reflects swap, not double-count.
  const alreadyMine =
    lot.bid?.ownerId === currentLeague?.leagueownerid
      ? (lot.bid?.bidSalary ?? 0)
      : 0;
  const rem = capRoom - (highBidsOnTheBoard ?? 0) + alreadyMine - bidSalary;

  const onPickPill = (val: number) => setBidSalary(val);
  const onYearPill = (y: number) => setBidYears(y);

  const fauxButtonDisable = () => {
    if (!currentLeague) {
      setConfirmModal(false);
      return;
    }
    if (validity.isValid) setConfirmModal(true);
  };

  const handleSubmission = () => {
    if (!currentLeague || !lot.bid) return;
    setIsLoading(true);
    const payload = {
      leagueId: currentLeague.league.leagueId,
      ownerId: currentLeague.leagueownerid,
      ownername: owner.ownername,
      bidSalary: bidSalary ?? 0,
      bidLength: bidYears ?? 0,
      lotId: lot.lotId,
      player: { ...lot.bid.player },
    };
    if (bidMode) dispatch(makeNewBid(payload));
    else dispatch(makeNewNomination(payload));
    setIsLoading(false);
    setConfirmModal(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ ...labelSx, mb: 1 }}>Place Offer</Box>

      {/* $ input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          border: `1px solid ${terminal.lineBold}`,
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1.5,
            background: terminal.panel2,
            color: terminal.textDim,
            fontFamily: fontStacks.mono,
            fontSize: dfs(14),
          }}
        >
          $
        </Box>
        <InputBase
          value={bidSalary}
          onChange={(e) => {
            const v = Number.parseInt(e.target.value, 10);
            setBidSalary(Number.isNaN(v) ? 0 : v);
          }}
          type="number"
          inputProps={{ min: 1, max: 500, inputMode: "numeric" }}
          sx={{
            flex: 1,
            color: terminal.text,
            fontFamily: fontStacks.mono,
            fontSize: dfs(20),
            fontWeight: 700,
            px: 1,
            py: 1,
            "& input": { py: 0 },
          }}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1.5,
            background: terminal.panel2,
            color: terminal.textDim,
            fontFamily: fontStacks.mono,
            fontSize: dfs(11),
          }}
        >
          M
        </Box>
      </Box>

      {/* quick pills */}
      <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
        {[1, 5, 10].map((d) => (
          <Box
            key={d}
            component="button"
            onClick={() => onPickPill(d)}
            sx={{
              flex: 1,
              py: 0.75,
              background: terminal.panel2,
              border: `1px solid ${terminal.line}`,
              color: terminal.textDim,
              fontFamily: fontStacks.mono,
              fontSize: dfs(11),
              cursor: "pointer",
              borderRadius: "2px",
              "&:hover": {
                borderColor: terminal.lineBold,
                color: terminal.text,
              },
            }}
          >
            ${d}
          </Box>
        ))}
      </Box>

      {/* years */}
      <Box sx={{ mt: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: 0.5,
          }}
        >
          <Box sx={labelSx}>Contract Length</Box>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {[1, 2, 3, 4, 5].map((y) => {
            const locked = false;
            const active = y === bidYears;
            return (
              <Box
                key={y}
                component="button"
                disabled={locked}
                onClick={() => !locked && onYearPill(y)}
                sx={{
                  flex: 1,
                  py: 1,
                  background: active ? terminal.lime : terminal.panel2,
                  border: `1px solid ${active ? terminal.lime : terminal.line}`,
                  color: locked
                    ? terminal.textMute
                    : active
                      ? "#000"
                      : terminal.text,
                  fontFamily: fontStacks.mono,
                  fontSize: dfs(13),
                  fontWeight: 700,
                  cursor: locked ? "not-allowed" : "pointer",
                  borderRadius: "2px",
                  opacity: locked ? 0.35 : 1,
                }}
              >
                {y}
                <Box
                  component="span"
                  sx={{
                    fontSize: 9,
                    fontWeight: 500,
                    ml: 0.25,
                    opacity: 0.7,
                  }}
                >
                  YR
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* submit */}
      <Tooltip
        title={
          validity.violations.length
            ? validity.violations.map((v) => (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  key={v}
                >
                  <Cancel fontSize="small" color="warning" />
                  <span>{v}</span>
                </Box>
              ))
            : ""
        }
        arrow
        placement="bottom"
      >
        <Box
          component="button"
          onClick={fauxButtonDisable}
          sx={{
            width: "100%",
            mt: 1.25,
            py: 1.25,
            background: validity.isValid ? terminal.lime : terminal.panel2,
            color: validity.isValid ? "#000" : terminal.textMute,
            border: validity.isValid ? "none" : `1px solid ${terminal.line}`,
            cursor: validity.isValid ? "pointer" : "not-allowed",
            fontFamily: fontStacks.sans,
            fontWeight: 700,
            fontSize: dfs(13),
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            borderRadius: "2px",
          }}
        >
          {bidMode ? "Submit Bid" : "Nominate"} · ${bidSalary}M × {bidYears}YR
        </Box>
      </Tooltip>

      {/* math row */}
      <Box
        sx={{
          mt: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 0.75,
          fontFamily: fontStacks.mono,
          fontSize: dfs(10),
          color: terminal.textDim,
        }}
      >
        <Box>
          <Box>CAP HIT</Box>
          <Box sx={{ ...numberSx, fontSize: dfs(13) }}>${capHit}M</Box>
        </Box>
        <Box>
          <Box>APY</Box>
          <Box sx={{ ...numberSx, fontSize: dfs(13) }}>${apy.toFixed(1)}M</Box>
        </Box>
        <Box>
          <Box>TOTAL</Box>
          <Box sx={{ ...numberSx, fontSize: dfs(13) }}>
            ${total.toFixed(0)}M
          </Box>
        </Box>
        <Box>
          <Box>REM</Box>
          <Box
            sx={{
              ...numberSx,
              fontSize: dfs(13),
              color: rem < 0 ? theme.palette.error.main : terminal.lime,
            }}
          >
            ${rem.toFixed(1)}M
          </Box>
        </Box>
      </Box>

      {/* confirm modal */}
      <Backdrop
        sx={{
          color: "#fff",
          backdropFilter: "blur(3px)",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
        open={confirmModal}
      />
      <Dialog open={confirmModal} TransitionComponent={Transition} keepMounted>
        <DialogContent sx={{ pt: 1 }}>
          <Box>
            <img
              src={capnWarning}
              alt=""
              style={{ maxHeight: "30%", maxWidth: "30%", aspectRatio: "auto" }}
            />
          </Box>
          <Typography variant="h5" sx={{ mb: 0.5, textAlign: "center" }}>
            Are you sure you want to
            {bidMode
              ? ` bid on ${lot.bid?.player?.firstName} ${lot.bid?.player?.lastName} `
              : ` nominate ${lot.bid?.player?.firstName} ${lot.bid?.player?.lastName} `}
            at ${bidSalary} for {bidYears} years?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => setConfirmModal(false)}
            size="large"
            variant="contained"
          >
            Cancel
          </Button>
          <LoadingButton
            loading={isLoading}
            color="success"
            sx={{ ml: 1 }}
            size="large"
            variant="contained"
            onClick={handleSubmission}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
