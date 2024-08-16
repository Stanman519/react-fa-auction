import { useState } from "react";
import { useDispatch } from "react-redux";
import { Avatar, Box, Paper, Typography, useTheme } from "@mui/material";
import Owner, { PoolUser } from "../../../redux/reducers/OwnerReducer";
import Icon from "@mdi/react";
import { mdiCashRemove } from "@mdi/js";
import { seePicksForUser } from "../../../redux/actions/OverUnderActions";

export const StandingsRow = ({
  user,
  currentPool,
}: {
  user: PoolUser;
  currentPool?: number;
}): JSX.Element => {
  const dispatch = useDispatch();

  return (
    <Paper elevation={3} sx={{ marginBottom: 0.5, cursor: "pointer" }}>
      <Box
        onClick={() => {
          dispatch(seePicksForUser(user.id));
        }}
        sx={{
          mr: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 1,
          paddingTop: 1,
          paddingBottom: 1,
        }}
      >
        <img
          src={user.owner.avatar}
          referrerPolicy="no-referrer"
          style={{ height: 0, width: 0 }}
        />
        <div className="flex flex-row justify-start items-center flex-grow">
          <Avatar
            style={{ marginRight: 8, cursor: "pointer" }}
            sx={{ height: 50, width: 50 }}
            alt={user.owner.ownername}
            src={user.owner.avatar}
          />
          <Typography>{user.owner.displayName}</Typography>
          {!user.isPaid && <Icon path={mdiCashRemove} size={1} color="red" />}
        </div>
        <Typography>0</Typography>
      </Box>
    </Paper>
  );
};

export default StandingsRow;
