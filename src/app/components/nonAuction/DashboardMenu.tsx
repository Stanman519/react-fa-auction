import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/reducers/RootReducer";
import LeagueSwitchMenu from "../menu/LeagueSwitchMenu";
import { useSelector } from "react-redux";
import { current } from "@reduxjs/toolkit";
import Divider from "@mui/material/Divider";
import { LeagueSwitchMenuItems } from "../menu/LeagueSwitchMenu";
import { FPLogo } from "../FPLogo";

const settings = ["logout"];

function ResponsiveAppBar() {
  const { owner, currentLeagueId } = useSelector(
    (state: RootState) => state.profile,
  );
  const currentLeague = useSelector((state: RootState) =>
    state.profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    ),
  );
  const pages = [{ label: "Games", route: "/games" }];
  if (currentLeague?.league.isAuctioning)
    pages.push({ label: "Auction", route: "/auction" });
  const navigate = useNavigate();
  const { user, logout } = useAuth0();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null,
  );
  const [picAnchorEl, setPicAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const pfpMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setPicAnchorEl(event.currentTarget);
  };

  React.useEffect(() => {}, [user]);

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  function clearDemoStateAndNav(arg0: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters style={{ maxHeight: 40 }}>
          <img
            src={user?.picture}
            referrerPolicy="no-referrer"
            style={{ height: 0, width: 0 }}
          />
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {owner.leagues.length > 1 && (
                <>
                  <Typography sx={{ px: 2, py: 1, fontWeight: "bold" }}>
                    Change League
                  </Typography>
                  <LeagueSwitchMenuItems />
                  <Divider />
                </>
              )}
              {pages.map((page) => (
                <MenuItem key={page.label} onClick={() => navigate(page.route)}>
                  <Typography textAlign="center">{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ marginRight: "20px" }}>
            <FPLogo size="sm" variant="full" bg="dark" />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                onClick={() => navigate(page.route)}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page.label}
              </Button>
            ))}
            {owner.leagues.length > 1 && <LeagueSwitchMenu />}
          </Box>

          {
            <Box sx={{ flexGrow: 0 }}>
              <Avatar
                alt={user?.displayName}
                src={user?.picture}
                onClick={pfpMenuClick}
                sx={{ cursor: "pointer" }}
              />
              <Menu
                id="profile-menu"
                anchorEl={picAnchorEl}
                sx={{ alignItems: "flex-end" }}
                open={Boolean(picAnchorEl)}
                PaperProps={{
                  elevation: 10,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                onClose={() => setPicAnchorEl(null)}
              >
                <MenuItem
                  color="inherit"
                  style={{
                    textAlign: "right",
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                  onClick={() => {
                    setPicAnchorEl(null);
                    logout();
                  }}
                >
                  Log out
                </MenuItem>
                {user?.sub?.includes("118311468702754688467") && (
                  <MenuItem
                    sx={{ justifyContent: "flex-end" }}
                    onClick={() => navigate("/admin")}
                  >
                    Admin
                  </MenuItem>
                )}
                <MenuItem
                  sx={{ width: 150, justifyContent: "flex-end" }}
                  onClick={() => {}}
                >
                  <a
                    href="https://www.buymeacoffee.com/ryanstanley"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                      alt="Buy Me A Coffee"
                      style={{ height: 34, width: 122 }}
                    />
                  </a>
                </MenuItem>
              </Menu>
            </Box>
          }
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
