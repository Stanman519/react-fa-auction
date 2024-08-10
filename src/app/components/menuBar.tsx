import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
} from "@mui/material";
import { Fragment, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import { useSelector } from "react-redux";
import { RootState, useAppThunkDispatch } from "../store";
import { turnOnNominationModeForThisOwnersLot } from "../redux/actions/LotActions";
import { updateUI } from "../redux/actions/UiActions";
import { FAChatWindow } from "./chat";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { clearConfidenceStateBeforeNav } from "../redux/actions/ConfidenceActions";
import { AuctionTeamSalaryCapsSlab } from "./AuctionTeamSalaryCapsSlab";
import LeagueSwitchMenu from "./menu/LeagueSwitchMenu";
import { OverUnderStandingsSlab } from "./games/OverUnders/OverUnderStandingsSlab";

type DrawerType = "Salaries" | "Chat" | "pfp-click" | undefined;

type BarOption =
  | "fa-auction"
  | "salary-league"
  | "chat"
  | "confidence"
  | "rules"
  | "games"
  | "ou-standings"
  | "league-home"
  | "games";

export function MenuBar({
  chatChannel = "",
  barOptions,
  isDemo = false,
}: {
  chatChannel?: string;
  barOptions: BarOption[];
  isDemo?: boolean;
}) {
  const { user, isAuthenticated, loginWithRedirect, isLoading, logout } =
    useAuth0();
  const { owner, currentLeague } = useSelector(
    (state: RootState) => state.profile,
  );

  const lots = useSelector((state: RootState) =>
    state.lots.filter(
      (l) => l.leagueId === currentLeague?.league.leagueId ?? 0,
    ),
  );
  const { modal } = useSelector((state: RootState) => state.ui);
  const [openDrawer, setOpenDrawer] = useState<DrawerType>(undefined);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [picAnchorEl, setPicAnchorEl] = useState<null | HTMLElement>(null);
  const avatar = user?.picture;
  const logo = process.env.PUBLIC_URL + "/stanfan-logo-white.png";

  const open = Boolean(anchorEl);
  const pfpMenuOpen = Boolean(picAnchorEl);
  const dispatch = useAppThunkDispatch();

  const navigate = useNavigate();
  const closeDrawer = () => {
    setOpenDrawer(undefined);
  };
  const mobileMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const clearDemoStateAndNav = (route: string) => {
    setAnchorEl(null);
    dispatch(clearConfidenceStateBeforeNav()).then(() => {
      navigate(`/${route}`);
    });
  };

  const pfpMenuClick = (event: React.MouseEvent<HTMLImageElement>) => {
    setPicAnchorEl(event?.currentTarget);
  };
  const handleAudio = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateUI({ audioOn: event.target.checked }));
  };

  const addNominationCard = async () => {
    dispatch(turnOnNominationModeForThisOwnersLot());
  };

  const seeFreeAgents = () => {
    dispatch(updateUI({ modal: "free-agent-grid" }));
  };

  return (
    <div className="w-full">
      <Fragment>
        <Box>
          <AppBar position="static" color="primary" sx={{ height: 64 }}>
            <img
              onClick={() => console.log("hi")}
              src={user?.picture}
              referrerPolicy="no-referrer"
              style={{ height: 0, width: 0 }}
            />

            <Toolbar
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingLeft: 40,
                paddingRight: 50,
              }}
            >
              {window.innerWidth < 720 ? (
                <>
                  <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    sx={{ mr: 2 }}
                    onClick={mobileMenuClick}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={() => setAnchorEl(null)}
                    MenuListProps={
                      {
                        //'aria-labelledby': 'basic-button',
                      }
                    }
                  >
                    {barOptions.includes("fa-auction") && (
                      <>
                        <MenuItem onClick={() => navigate("/rosters")}>
                          Rosters
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            dispatch(updateUI({ modal: "team-caps-slab" }));
                            setAnchorEl(null);
                          }}
                        >
                          Salary Caps
                        </MenuItem>
                        {owner.ownername &&
                        lots.filter((l) => !l.bid).length > 0 &&
                        lots.filter(
                          (l) => l.nominatedBy === currentLeague?.leagueownerid,
                        ).length < 3 ? (
                          <MenuItem
                            onClick={() => {
                              addNominationCard();
                              setAnchorEl(null);
                            }}
                          >
                            Nominate a Player
                          </MenuItem>
                        ) : (
                          <MenuItem
                            onClick={() => {
                              if (modal === "free-agent-grid") {
                                dispatch(updateUI({ modal: undefined }));
                                setAnchorEl(null);
                              } else {
                                seeFreeAgents();
                                setAnchorEl(null);
                              }
                            }}
                          >
                            {modal === "free-agent-grid" ? "Close " : ""}Free
                            Agents
                          </MenuItem>
                        )}
                      </>
                    )}

                    {barOptions.includes("rules") && (
                      <MenuItem
                        color="inherit"
                        onClick={() => {
                          setAnchorEl(null);
                          dispatch(updateUI({ modal: "confidence-rules" }));
                        }}
                      >
                        Rules
                      </MenuItem>
                    )}
                    {barOptions.includes("ou-standings") && (
                      <MenuItem
                        color="inherit"
                        onClick={() => {
                          setAnchorEl(null);
                          dispatch(updateUI({ modal: "ou-standings" }));
                        }}
                      >
                        Results
                      </MenuItem>
                    )}
                    {barOptions.includes("games") && (
                      <MenuItem
                        color="inherit"
                        onClick={() => {
                          setAnchorEl(null);
                          navigate("/games");
                        }}
                      >
                        Games Home
                      </MenuItem>
                    )}
                    {!isDemo && barOptions.includes("confidence") && (
                      <MenuItem
                        color="inherit"
                        onClick={() => clearDemoStateAndNav("demo")}
                      >
                        See Demo
                      </MenuItem>
                    )}
                    {barOptions.includes("chat") &&
                      user?.sub &&
                      isDemo !== true && (
                        <MenuItem
                          onClick={() => {
                            setOpenDrawer("Chat");
                            setAnchorEl(null);
                          }}
                        >
                          {openDrawer === "Chat" ? "Close Chat" : "Open Chat"}
                        </MenuItem>
                      )}
                    {barOptions.includes("salary-league") && (
                      <MenuItem
                        onClick={() => {
                          navigate("/");
                        }}
                      >
                        League Info
                      </MenuItem>
                    )}
                    {barOptions.includes("league-home") && (
                      <MenuItem
                        onClick={() => {
                          navigate("/");
                        }}
                      >
                        {currentLeague?.league.name}
                      </MenuItem>
                    )}
                  </Menu>

                  <img
                    src={logo}
                    style={{
                      maxHeight: 20,
                      aspectRatio: "auto",
                      marginRight: 20,
                    }}
                  />
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <img
                    src={logo}
                    style={{
                      maxHeight: 20,
                      aspectRatio: "auto",
                      marginRight: 20,
                    }}
                  />

                  <Button color="inherit" onClick={() => navigate("/games")}>
                    Games Home
                  </Button>

                  {barOptions.includes("fa-auction") && (
                    <Button
                      color="inherit"
                      onClick={() =>
                        dispatch(updateUI({ modal: "team-caps-slab" }))
                      }
                    >
                      Salary Caps
                    </Button>
                  )}
                  {barOptions.includes("fa-auction") && (
                    <Button
                      color="inherit"
                      onClick={() => navigate("/rosters")}
                    >
                      Rosters
                    </Button>
                  )}
                  {barOptions.includes("rules") && (
                    <Button
                      color="inherit"
                      onClick={() => {
                        setAnchorEl(null);
                        dispatch(updateUI({ modal: "confidence-rules" }));
                      }}
                    >
                      Rules
                    </Button>
                  )}
                  {barOptions.includes("ou-standings") && (
                    <Button
                      color="inherit"
                      onClick={() => {
                        setAnchorEl(null);
                        dispatch(updateUI({ modal: "ou-standings" }));
                      }}
                    >
                      Results
                    </Button>
                  )}
                  {barOptions.includes("chat") &&
                    user?.sub &&
                    isDemo !== true && (
                      <Button
                        color="inherit"
                        onClick={() => {
                          //dispatch()
                          setOpenDrawer("Chat");
                        }}
                      >
                        {openDrawer === "Chat" ? "Close Chat" : "Open Chat"}
                      </Button>
                    )}
                  {barOptions.includes("salary-league") && (
                    <Button
                      color="inherit"
                      onClick={() => {
                        navigate("/");
                      }}
                    >
                      {currentLeague?.league.name}
                    </Button>
                  )}
                  {barOptions.includes("league-home") && (
                    <Button
                      color="inherit"
                      onClick={() => {
                        navigate("/");
                      }}
                    >
                      {currentLeague?.league.name}
                    </Button>
                  )}
                  {!isDemo && barOptions.includes("confidence") && (
                    <Button
                      color="inherit"
                      onClick={() => clearDemoStateAndNav("demo")}
                    >
                      See Demo
                    </Button>
                  )}

                  {barOptions.includes("fa-auction") ? (
                    owner.ownername &&
                    lots.filter((l) => !l.bid).length > 0 &&
                    lots.filter(
                      (l) => l.nominatedBy === currentLeague?.leagueownerid,
                    ).length <= 3 ? (
                      <Button
                        color="inherit"
                        onClick={() => addNominationCard()}
                      >
                        Nominate a Player
                      </Button>
                    ) : (
                      <Button
                        color="inherit"
                        onClick={() => {
                          if (modal === "free-agent-grid") {
                            dispatch(updateUI({ modal: undefined }));
                          } else {
                            seeFreeAgents();
                          }
                        }}
                      >
                        {modal === "free-agent-grid" ? "Close " : ""}Free Agents
                      </Button>
                    )
                  ) : (
                    <></>
                  )}

                  {(barOptions.includes("fa-auction") ||
                    barOptions.includes("salary-league")) &&
                    owner.leagues.length > 1 && <LeagueSwitchMenu />}
                  {barOptions.includes("confidence") && (
                    <Button
                      color="inherit"
                      onClick={() => clearDemoStateAndNav("games")}
                    >
                      {" "}
                      CONFIDENCE POOL{" "}
                    </Button>
                  )}
                </div>
              )}

              <Avatar
                onClick={pfpMenuClick}
                alt={user?.displayName}
                src={user?.picture}
                sx={{ cursor: "pointer" }}
              />
              <Menu
                id="basic-menu"
                anchorEl={picAnchorEl}
                sx={{ alignItems: "flex-end" }}
                open={pfpMenuOpen}
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
                MenuListProps={
                  {
                    //'aria-labelledby': 'basic-button',
                  }
                }
              >
                {
                  <MenuItem
                    color="inherit"
                    style={{
                      textAlign: "right",
                      width: "100%",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                    }}
                    onClick={() => {
                      setAnchorEl(null);
                      //should reset state to default here
                      logout();
                    }}
                  >
                    Log out
                  </MenuItem>
                }
                {user?.sub?.includes("118311468702754688467") && (
                  <MenuItem
                    sx={{ justifyContent: "flex-end" }}
                    onClick={() => navigate("/admin")}
                  >
                    Admin
                  </MenuItem>
                )}
                {
                  <MenuItem
                    sx={{ width: 150, justifyContent: "flex-end" }}
                    onClick={() => {}}
                  >
                    <a
                      href="https://www.buymeacoffee.com/ryanstanley"
                      target="_blank"
                    >
                      <img
                        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                        alt="Buy Me A Coffee"
                        style={{ height: 34, width: 122 }}
                      />
                    </a>
                  </MenuItem>
                }
              </Menu>
            </Toolbar>
          </AppBar>
        </Box>
        <AuctionTeamSalaryCapsSlab />
        <OverUnderStandingsSlab />
        <Drawer
          PaperProps={{
            sx: { width: "40%", minWidth: 350 },
          }}
          anchor={"left"}
          open={openDrawer === "Chat"}
          onClose={() => closeDrawer()}
        >
          <FAChatWindow leagueId={currentLeague?.league.leagueId.toString()} />

          {/* </Box> */}
        </Drawer>
      </Fragment>
    </div>
  );
}
