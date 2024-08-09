import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Box,
  Drawer,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import Owner from "../../../redux/reducers/OwnerReducer";
import { RootState } from "../../../store";

interface ScoreboardOwner {}

export const Scoreboard = ({ user }: { user: Owner }): JSX.Element => {
  const dispatch = useDispatch();
  const { otherUsers, userPicks } = useSelector(
    (state: RootState) => state.overUnders,
  );
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const {} = useTheme();
  //   const rows = otherUsers.

  return (
    <Drawer>
      <Paper elevation={3} sx={{}}>
        <Box
          sx={{
            width: "28%",
            mr: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography>{user.displayName}</Typography>
          <Typography></Typography>
          {}
        </Box>
      </Paper>
    </Drawer>
  );
};

export default Scoreboard;
