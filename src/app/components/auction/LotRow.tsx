import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { Lot } from "../../redux/reducers/LotReducer";
import { Timer } from "../lot/timer";
import { terminal, fontStacks } from "../../../theme";
import { dfs } from "../nonAuction/terminal/tokens";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { QuoteButton } from "./QuoteButton";

const POS_COLORS: Record<string, string> = {
  QB: "#e8538a",
  RB: "#2ca579",
  WR: "#4a90e2",
  TE: "#c47a2b",
  K: "#8888aa",
  DEF: "#6b6b6b",
  PK: "#8888aa",
};

interface LotRowProps {
  lot: Lot;
  active: boolean;
  onClick: () => void;
  starred: boolean;
  onToggleStar: (mflId: number) => void;
}

export const LotRow = ({
  lot,
  active,
  onClick,
  starred,
  onToggleStar,
}: LotRowProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find(
      (l) => l.league.leagueId === s.profile.currentLeagueId,
    ),
  );
  const myId = currentLeague?.leagueownerid;
  const bid = lot.bid;
  const player = bid?.player;
  const pos = player?.position ?? "—";
  const posColor = POS_COLORS[pos] ?? "#666";
  const isMine = bid?.ownerId === myId;

  const cols = isMobile
    ? "40px minmax(0, 1fr) 46px minmax(0, 0.7fr) 68px"
    : "28px 40px minmax(0, 1.6fr) 90px minmax(0, 1fr) 80px 56px";

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "grid",
        gridTemplateColumns: cols,
        gap: isMobile ? 1 : 1.25,
        alignItems: "center",
        px: 1.75,
        py: 1,
        borderBottom: `1px solid ${terminal.line}`,
        background: active
          ? terminal.panel2
          : lot.isFresh
            ? terminal.limeDim
            : "transparent",
        transition: "background-color 900ms ease-out",
        cursor: "pointer",
        "&:hover": { background: terminal.panel2 },
        fontFamily: fontStacks.mono,
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            fontSize: dfs(10),
            color: terminal.textMute,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {lot.lotId}
        </Box>
      )}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 22,
          minWidth: 22,
          px: 0.75,
          borderRadius: "2px",
          background: posColor,
          color: "#fff",
          fontWeight: 700,
          fontSize: 10,
        }}
      >
        {pos}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            color: terminal.text,
            fontSize: dfs(13),
            fontWeight: 600,
            fontFamily: fontStacks.sans,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {player
            ? `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim()
            : lot.newNom
              ? "— choose player —"
              : "—"}
        </Box>
        <Box
          sx={{
            fontSize: dfs(10),
            color: terminal.textMute,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {player?.team?.toUpperCase() ?? ""}
          {player?.age ? ` · AGE ${player.age}` : ""}
        </Box>
      </Box>
      <Box
        sx={{
          textAlign: "right",
          fontSize: dfs(13),
          fontWeight: 700,
          color: bid?.bidSalary != null ? terminal.lime : terminal.textMute,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {bid?.bidSalary != null ? `${bid.bidLength ?? 0}/$${bid.bidSalary}` : "—"}
      </Box>
      <Box
        sx={{
          fontSize: dfs(11),
          color: bid?.ownername ? terminal.text : terminal.textMute,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {bid?.ownername ? `@${bid.ownername}` : "—"}
        {isMine && (
          <Box
            component="span"
            sx={{
              ml: 0.75,
              px: 0.5,
              fontSize: 9,
              borderRadius: "2px",
              background: terminal.lime,
              color: "#000",
              fontWeight: 700,
            }}
          >
            YOU
          </Box>
        )}
      </Box>
      <Box sx={{ textAlign: "right" }}>
        <Timer endTime={bid?.expires} lot={lot} size="sm" />
      </Box>
      {!isMobile && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, justifyContent: "flex-end" }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (player?.mflId) onToggleStar(player.mflId);
            }}
            sx={{
              p: 0.25,
              color: starred ? terminal.amber : terminal.textMute,
            }}
          >
            {starred ? (
              <StarIcon fontSize="small" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </IconButton>
          {player?.mflId != null && player.firstName != null && (
            <QuoteButton
              playerMflId={player.mflId}
              playerName={`${player.firstName ?? ""} ${player.lastName ?? ""}`.trim()}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export const LotRowHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const cols = isMobile
    ? "40px minmax(0, 1fr) 46px minmax(0, 0.7fr) 68px"
    : "28px 40px minmax(0, 1.6fr) 90px minmax(0, 1fr) 80px 56px";
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: cols,
        gap: isMobile ? 1 : 1.25,
        px: 1.75,
        py: 1,
        background: terminal.panel,
        borderBottom: `1px solid ${terminal.lineBold}`,
        fontFamily: fontStacks.mono,
        fontSize: dfs(9),
        color: terminal.textMute,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {!isMobile && <span>#</span>}
      <span>POS</span>
      <span>PLAYER</span>
      <span style={{ textAlign: "right" }}>HIGH</span>
      <span>BIDDER</span>
      <span style={{ textAlign: "right" }}>ENDS</span>
      {!isMobile && <span />}
    </Box>
  );
};
