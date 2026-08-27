import { useDispatch } from "react-redux";
import { Avatar, Box } from "@mui/material";
import { PoolUser } from "../../../redux/reducers/OwnerReducer";
import { seePicksForUser } from "../../../redux/actions/OverUnderActions";
import { PickTally } from "./pickStatus";
import { terminal as T, fontStacks } from "../../../../theme";

export const STANDINGS_COLUMNS = "24px 28px 1fr 78px 28px 40px";

export const StandingsRow = ({
  user,
  rank,
  tally,
}: {
  user: PoolUser;
  rank: number;
  tally: PickTally;
}): JSX.Element => {
  const dispatch = useDispatch();

  const num = (value: number, color: string) => (
    <span
      style={{
        color,
        display: "inline-block",
        width: "2ch",
        textAlign: "right",
      }}
    >
      {value}
    </span>
  );

  return (
    <Box
      onClick={() => dispatch(seePicksForUser(user.id))}
      sx={{
        display: "grid",
        gridTemplateColumns: STANDINGS_COLUMNS,
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.75,
        cursor: "pointer",
        borderBottom: `1px solid ${T.line}`,
        "&:hover": { background: T.panel2 },
      }}
    >
      <span
        style={{
          fontFamily: fontStacks.mono,
          fontSize: 10,
          color: rank <= 3 ? T.lime : T.textMute,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {rank}
      </span>

      {/* Warms the referrer-less avatar cache before MUI requests it. */}
      <img
        src={user.owner.avatar}
        referrerPolicy="no-referrer"
        alt=""
        style={{ height: 0, width: 0, position: "absolute" }}
      />
      <Avatar
        alt={user.owner.ownername}
        src={user.owner.avatar}
        sx={{ height: 28, width: 28, borderRadius: "2px", fontSize: 12 }}
        variant="square"
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: fontStacks.sans,
            fontSize: 13,
            fontWeight: 600,
            color: T.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {user.owner.displayName}
        </span>
        {!user.isPaid && (
          <span
            style={{
              fontFamily: fontStacks.mono,
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: T.red,
              border: `1px solid ${T.red}`,
              padding: "0 3px",
              flexShrink: 0,
            }}
          >
            UNPAID
          </span>
        )}
      </Box>

      <span
        style={{
          fontFamily: fontStacks.mono,
          fontSize: 12,
          fontVariantNumeric: "tabular-nums",
          color: T.textMute,
          whiteSpace: "nowrap",
        }}
      >
        {num(tally.w, T.lime)}-{num(tally.l, T.red)}-{num(tally.tbd, T.textMute)}
      </span>

      {/* Tiebreakers, in the order they're applied */}
      <span
        style={{
          fontFamily: fontStacks.mono,
          fontSize: 11,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
          color: tally.doublesHit > 0 ? T.amber : T.textMute,
        }}
      >
        {tally.doublesHit > 0 ? `${tally.doublesHit}✓` : "–"}
      </span>

      <span
        style={{
          fontFamily: fontStacks.mono,
          fontSize: 11,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
          color: T.textDim,
        }}
      >
        {tally.contrarian.toFixed(1)}
      </span>
    </Box>
  );
};

export default StandingsRow;
