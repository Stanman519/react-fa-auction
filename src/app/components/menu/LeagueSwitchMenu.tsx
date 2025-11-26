import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/reducers/RootReducer";
import { updateCurrentLeague } from "../../redux/actions/LoginActions";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export function LeagueSwitchMenuItems() {
  const { currentLeagueId } = useSelector((state: RootState) => state.profile);
  const otherLeagues = useSelector((state: RootState) =>
    state.profile.owner.leagues.filter(
      (l) => l.league.leagueId != currentLeagueId,
    ),
  );
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user } = useAuth0();

  return (
    <>
      {otherLeagues.map((l) => (
        <MenuItem
          key={l.league.leagueId}
          onClick={() => {
            if (user) {
              dispatch(updateCurrentLeague(l.league.leagueId, pathname, user));
            }
          }}
        >
          {l.league.name}
        </MenuItem>
      ))}
    </>
  );
}

export default function LeagueSwitchMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { currentLeagueId } = useSelector((state: RootState) => state.profile);
  const otherLeagues = useSelector((state: RootState) =>
    state.profile.owner.leagues.filter(
      (l) => l.league.leagueId != currentLeagueId,
    ),
  );
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user } = useAuth0();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        color="inherit"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        Change League
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {otherLeagues.map((l) => (
          <MenuItem
            key={l.league.leagueId}
            onClick={() => {
              if (user) {
                dispatch(
                  updateCurrentLeague(l.league.leagueId, pathname, user),
                );
                handleClose();
              }
            }}
          >
            {" "}
            {l.league.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
