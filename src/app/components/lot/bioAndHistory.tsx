import { Avatar, Box, Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { updateUI } from "../../redux/actions/UiActions";
import { terminal, fontStacks } from "../../../theme";
import { dfs } from "../nonAuction/terminal/tokens";

const labelSx = {
  fontFamily: fontStacks.mono,
  fontSize: dfs(10),
  letterSpacing: "0.08em",
  color: terminal.textMute,
  textTransform: "uppercase" as const,
};

const formatTimestamp = (expires: Date) => {
  const dayBefore = new Date(expires);
  dayBefore.setUTCDate(expires.getUTCDate() - 1);
  return `${dayBefore.toLocaleDateString()} ${dayBefore.toLocaleTimeString()}`;
};

export const BidHistorySlab = (): JSX.Element => {
  const owners = useSelector((s: RootState) => s.owners);
  const { modal, currentBidHistory, isMobile } = useSelector(
    (s: RootState) => s.ui,
  );
  const dispatch = useDispatch();
  const close = () => dispatch(updateUI({ modal: undefined }));
  const open = modal === "bid-history-slab";
  const bottom = !!isMobile;

  return (
    <Drawer
      open={open}
      onClose={close}
      variant="temporary"
      anchor={bottom ? "bottom" : "right"}
      sx={{ zIndex: (t) => t.zIndex.modal + 1 }}
      PaperProps={{
        sx: {
          background: terminal.bg,
          color: terminal.text,
          ...(bottom
            ? {
                borderTop: `1px solid ${terminal.lineBold}`,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                maxHeight: "75vh",
                width: "100%",
              }
            : {
                borderLeft: `1px solid ${terminal.lineBold}`,
                width: "min(420px, 90vw)",
              }),
        },
      }}
      ModalProps={{ keepMounted: false }}
    >
      {bottom && (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 0.75 }}>
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: terminal.lineBold,
            }}
          />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          background: terminal.panel,
          borderBottom: `1px solid ${terminal.line}`,
        }}
      >
        <Box sx={{ ...labelSx, fontSize: dfs(11), color: terminal.text }}>
          Bid History
        </Box>
        <IconButton
          size="small"
          onClick={close}
          sx={{ color: terminal.textDim }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        {(!currentBidHistory || currentBidHistory.length === 0) && (
          <Box
            sx={{
              ...labelSx,
              textAlign: "center",
              py: 4,
            }}
          >
            No bids yet
          </Box>
        )}
        {currentBidHistory?.map((p) => {
          const owner = owners.find((o) => o.leagueownerid === p.ownerId);
          return (
            <Box
              key={p.bidId}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.5,
                py: 1,
                borderBottom: `1px solid ${terminal.line}`,
              }}
            >
              <Avatar
                src={owner?.avatar}
                sx={{ width: 32, height: 32 }}
                imgProps={{ referrerPolicy: "no-referrer" }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    fontFamily: fontStacks.sans,
                    fontSize: dfs(12),
                    color: terminal.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {owner?.ownerName ?? "—"}
                </Box>
                <Box
                  sx={{
                    fontFamily: fontStacks.mono,
                    fontSize: dfs(10),
                    color: terminal.textDim,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {p.expires ? formatTimestamp(new Date(p.expires)) : ""}
                </Box>
              </Box>
              <Box
                sx={{
                  fontFamily: fontStacks.mono,
                  fontSize: dfs(13),
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: terminal.lime,
                  whiteSpace: "nowrap",
                }}
              >
                ${p.bidSalary}
                <Box
                  component="span"
                  sx={{ color: terminal.textDim, ml: 0.5, fontWeight: 400 }}
                >
                  · {p.bidLength}
                  {p.bidLength === 1 ? "yr" : "yrs"}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Drawer>
  );
};
