import { Box, Drawer, List, useTheme } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { updateUI } from "../../../redux/actions/UiActions";
import { RootState } from "../../../redux/reducers/RootReducer";
import StandingsRow from "./StandingsRow";

export const OverUnderStandingsSlab = (): JSX.Element => {
  const users = useSelector((state: RootState) => state.overUnders.otherUsers);
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const { currentLeague } = useSelector((state: RootState) => state.profile);
  const openSlab = useSelector(
    (state: RootState) => state.ui.modal === "ou-standings",
  );

  return (
    <Drawer
      anchor={"left"}
      open={openSlab}
      onClose={() => dispatch(updateUI({ modal: undefined }))}
    >
      <Box
        sx={{ width: 250, height: "100%" }}
        role="presentation"
        onClick={() => dispatch(updateUI({ modal: undefined }))}
        bgcolor={palette.background.default}
      >
        <List>
          {users.map((o, index) => (
            <StandingsRow key={o.ownerId} user={o} />
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
