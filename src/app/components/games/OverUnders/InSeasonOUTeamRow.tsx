import { useState } from "react";
import { useDispatch } from "react-redux";
import { FranchiseWinTotal } from "../../../redux/reducers/OverUnderReducer";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { OverUnderPick } from "../../../services/GeneralApiSvc";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { selectALine } from "../../../redux/actions/OverUnderActions";
export const InSeasonOUTeamRow = ({
  franchise,
  userPick,
}: {
  franchise: FranchiseWinTotal;
  userPick: OverUnderPick;
}): JSX.Element => {
  const dispatch = useDispatch();
  const [startTime, setStartTime] = useState<number | undefined>(undefined);

  const {} = useTheme();

  return (
    <Paper
      onClick={() => dispatch(selectALine(franchise.id))}
      elevation={3}
      sx={{
        cursor: "pointer",
        width: 350,
        height: 120, // Fixed height for consistency
        p: 1,
        display: "flex",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 6,
        },
      }}
    >
      <Box
        sx={{
          width: "25%",
          mr: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={franchise.franchise.logo}
          alt={`${franchise.franchise.city} ${franchise.franchise.name} logo`}
          style={{
            filter: `saturate(${userPick.isOver === null ? "20%" : "100%"})`,
            opacity: userPick.isOver === null ? "50%" : "100%",
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          loading="lazy"
        />
      </Box>
      <Box
        sx={{
          width: "80%",
          display: "flex",
          flexGrow: "grow",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flex: 1,
            paddingRight: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              flexGrow: "grow",
              fontWeight: "bold",
              textAlign: "center",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              display: "-webkit-box",
              overflow: "hidden",
            }}
          >
            {franchise.franchise.city} {franchise.franchise.name}
          </Typography>
          <div
            style={{
              backgroundColor: userPick.lineAdjustment === 0 ? "" : "yellow",
            }}
            className="flex flex-row content-center w-full justify-center"
          >
            {userPick.lineAdjustment > 0 && (
              <KeyboardDoubleArrowUpIcon color="error" />
            )}
            {userPick.lineAdjustment < 0 && (
              <KeyboardDoubleArrowDownIcon color="error" />
            )}
            <Typography
              sx={{
                flexWrap: "nowrap",
                textAlign: "center",
              }}
            >
              {userPick.isOver === null
                ? "PASS"
                : userPick.isOver
                  ? `OVER ${franchise.overUnder + userPick.lineAdjustment}`
                  : `UNDER ${franchise.overUnder + userPick.lineAdjustment}`}
            </Typography>
            {userPick.lineAdjustment > 0 && (
              <KeyboardDoubleArrowUpIcon color="error" />
            )}
            {userPick.lineAdjustment < 0 && (
              <KeyboardDoubleArrowDownIcon color="error" />
            )}
          </div>
          {/* {userPick.lineAdjustment !== 0 && (
            <Typography>(Double Down)</Typography>
          )} */}
        </Box>
        <Box
          sx={{
            borderLeft: 1,
            height: "100%",
            width: "28%",
            borderLeftStyle: "solid",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="flex flex-col justify-center">
            <div>Wins</div>
            <div style={{ textAlign: "center", fontWeight: "700" }}>
              {franchise.realWins}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                flexWrap: "nowrap",
              }}
            >
              Gms Left
            </div>
            <div style={{ textAlign: "center", fontWeight: "700" }}>
              {franchise.gamesRemaining}
            </div>
          </div>
        </Box>
      </Box>
    </Paper>
  );
};

export default InSeasonOUTeamRow;
