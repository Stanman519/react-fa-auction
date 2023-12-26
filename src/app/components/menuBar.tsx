import { AppBar, Avatar, Box, Button, IconButton, Menu, MenuItem, Toolbar, useTheme } from "@mui/material";
import { Fragment, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useDispatch, useSelector } from "react-redux";
import { RootState, useAppThunkDispatch } from "../store";
import { turnOnNominationModeForThisOwnersLot } from "../redux/actions/LotActions";
import { updateUI } from "../redux/actions/UiActions";
import { FAChatWindow } from "./chat";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { clearConfidenceStateBeforeNav } from "../redux/actions/ConfidenceActions";

type DrawerType = 'Salaries' | 'Chat' | 'pfp-click' | undefined

type BarOption = 'fa-auction' | 'salary-league' | 'chat' | 'confidence'

export function MenuBar({chatChannel = "", barOptions, isDemo = false}: {chatChannel?: string, barOptions: BarOption[], isDemo?: boolean}) {
    const { user, isAuthenticated, loginWithRedirect, isLoading, logout } = useAuth0();
    const { owner, currentLeague } = useSelector((state: RootState) => state.profile);
    const owners = useSelector((state: RootState) => state.owners);
    const lots = useSelector((state: RootState) => state.lots.filter(l => l.leagueId === currentLeague?.league.leagueId ?? 0));
    const nomIsUsed = useSelector((state: RootState) => {
        if (!owner.ownername) return false
        return state.lots.find(l => l.nominatedBy === currentLeague?.leagueownerid)?.bid?.player
    })
    const [openDrawer, setOpenDrawer] = useState<DrawerType>(undefined);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [picAnchorEl, setPicAnchorEl] = useState<null | HTMLElement>(null);
    const avatar = user?.picture
    const logo = process.env.PUBLIC_URL + '/stanfan-logo-white.png';

    const open = Boolean(anchorEl);
    const pfpMenuOpen = Boolean(picAnchorEl)
    const dispatch = useAppThunkDispatch();
    const { palette } = useTheme();
    const navigate = useNavigate();
    const closeDrawer = () => {
        setOpenDrawer(undefined);
    };
    const mobileMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
      };

    const clearDemoStateAndNav = (route: string) => {
        setAnchorEl(null)
        dispatch(clearConfidenceStateBeforeNav()).then(() => {
            navigate(`/${route}`)
        })

    }
    
    const pfpMenuClick = (event: React.MouseEvent<HTMLImageElement>) => {
        setPicAnchorEl(event?.currentTarget);
    }
    const handleAudio = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateUI({audioOn: event.target.checked}))
    }

    const addNominationCard = async () => {
        dispatch(turnOnNominationModeForThisOwnersLot())
    }

    const highBidsOnTheBoard = (ownerId: number): number => {
        return lots.filter(l => l.bid?.ownerId === ownerId).map(b => b.bid?.bidSalary)
            .reduce((prev, curr) => prev! + curr!, 0) ?? 0;
    }
    return (
        <div className="w-full">

            <Fragment>
                <Box>
                    <AppBar position="static" color="primary">
                    <img onClick={() => console.log('hi')}  src={user?.picture} referrerPolicy="no-referrer" style={{ height: 0, width: 0 }} />
                    
                        <Toolbar style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 40, paddingRight: 50 }}>
                            {window.innerWidth < 720 ?(
                            <>
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    aria-label="open drawer"
                                    sx={{ mr: 2 }}
                                    onClick={mobileMenuClick}
                                >
                                    <MenuIcon/>
                                </IconButton>
                                <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={() => setAnchorEl(null)}
                                    MenuListProps={{
                                    //'aria-labelledby': 'basic-button',
                                    }}
                                >
                                    {barOptions.includes('fa-auction') && 
                                    
                                    <>
                                    <MenuItem onClick={() => {
                                        setOpenDrawer('Salaries')
                                        setAnchorEl(null)
                                        }}>Salary Caps</MenuItem>
                                        {!nomIsUsed && <MenuItem onClick={() => {
                                            addNominationCard()
                                            setAnchorEl(null)
                                            }}>Nominate a Player</MenuItem>}
                                            </>
                                    }
                                    
                                    {barOptions.includes('confidence') && <MenuItem color='inherit' onClick={() => {
                                        setAnchorEl(null)
                                        dispatch(updateUI({modal: 'confidence-rules'}))}}>Rules</MenuItem>}
                                    {isDemo && <MenuItem color='inherit' onClick={() => clearDemoStateAndNav('games')}> Confidence Pool </MenuItem>}
                                    {!isDemo && <MenuItem color='inherit' onClick={() => clearDemoStateAndNav('demo')}> See Demo </MenuItem>}
                                    {barOptions.includes('chat') &&  
                                        user?.sub && isDemo !== true && <MenuItem onClick={() => {
                                        setOpenDrawer('Chat')
                                        setAnchorEl(null)
                                        }}>{openDrawer === 'Chat' ? 'Close Chat' : 'Open Chat'}</MenuItem>
                                    }
                                    {barOptions.includes('salary-league') && <MenuItem onClick={() => {
                                        navigate("/home")
                                        }}>League Info</MenuItem>}


                                </Menu>

                                <img src={logo} style={{ maxHeight: 20, aspectRatio: 'auto', marginRight: 20 }} />
                            </>
                            )
                            :
                            (<div style={{ display: 'flex', flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                                <img src={logo} style={{ maxHeight: 20, aspectRatio: 'auto', marginRight: 20 }} />
                                {barOptions.includes('fa-auction') && <Button color="inherit"
                                    onClick={() => setOpenDrawer('Salaries')}>
                                    Salary Caps
                                </Button>}
                                {barOptions.includes('confidence') && <Button color='inherit' onClick={() => {
                                    setAnchorEl(null)
                                    dispatch(updateUI({modal: 'confidence-rules'}))
                                    }}>Rules</Button>}
                                {barOptions.includes('chat') && user?.sub && isDemo !== true && <Button color="inherit"
                                    onClick={() => {
                                        //dispatch()
                                        setOpenDrawer('Chat')
                                        }}>
                                    {openDrawer === 'Chat' ? 'Close Chat' : 'Open Chat'}
                                </Button>}
                                {barOptions.includes('salary-league') && <Button color="inherit"
                                    onClick={() => {
                                        navigate('/home')
                                        }}>League Info</Button>}
                                {isDemo && <Button color='inherit' onClick={() => clearDemoStateAndNav('games')}> CONFIDENCE POOL </Button>}
                                {!isDemo && <Button color='inherit' onClick={() => clearDemoStateAndNav('demo')}>See Demo</Button>}
                                {barOptions.includes('fa-auction') &&  !nomIsUsed &&
                                    <Button color='inherit' onClick={() => addNominationCard()}>
                                        Nominate a Player
                                    </Button>}
                                {/* {owner.leagues.length > 1 && <LeagueSwitchMenu />} */}

                            </div>)}

                            <Avatar onClick={pfpMenuClick} alt={user?.displayName} src={user?.picture} sx={{cursor: 'pointer'}} />
                            <Menu
                                    id="basic-menu"
                                    anchorEl={picAnchorEl}
                                    sx={{alignItems: 'flex-end'}}
                                    open={pfpMenuOpen}
                                    onClose={() => setPicAnchorEl(null)}
                                    MenuListProps={{
                                    //'aria-labelledby': 'basic-button',
                                    }}
                                >
                                    
                                    {<MenuItem color='inherit' 
                                    style={{textAlign: 'right', width: '100%', flexDirection: 'row', justifyContent: 'flex-end'}}
                                    onClick={() => {
                                        setAnchorEl(null)
                                        //should reset state to default here
                                        logout()
                                    }}>Log out</MenuItem>}
                                    {user?.sub?.includes('118311468702754688467') && <MenuItem sx={{justifyContent: 'flex-end'}} onClick={() => navigate('/admin')}>Admin</MenuItem>}
                                    {<MenuItem sx={{width: 226, justifyContent: 'flex-end'} } onClick={() => {
                                        setPicAnchorEl(null)
                                        }}>
                                            <a href="https://www.buymeacoffee.com/ryanstanley" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style={{height: 60,width: 217}} /></a>
                                            </MenuItem>
                                    }



                                </Menu>
                        </Toolbar>
                    </AppBar>
                </Box>
                <Drawer
                    anchor={'left'}
                    open={openDrawer=== 'Salaries'}
                    onClose={() => closeDrawer()}
                >
                    <Box
                        sx={{ width: 250, height: '100%' }}
                        role="presentation"
                        onClick={() => closeDrawer()}
                        bgcolor={palette.background.default}
                    >
                        <List>
                            {owners.map((o, index) => (
                                <ListItem key={o.teamName} style={{ backgroundColor: index % 2 === 0 ? palette.background.default : palette.background.paper }}>
                                    <img src={o.avatar} referrerPolicy="no-referrer" style={{ height: 0, width: 0 }} />
                                    <Avatar style={{ marginRight: 8, cursor: 'pointer' }} sx={{ height: 50, width: 50 }} alt={o.ownerName} src={o.avatar}  />
                                    <div style={{flexDirection: 'column'}}>
                                        <ListItemText style={{}} primary={`${o.ownerName} - $${o?.capRoom}`} secondary={highBidsOnTheBoard(o.leagueownerid) ?? 0 > 0 ? `outstanding bids: $${highBidsOnTheBoard(o.leagueownerid)}`: ''} />
                                    </div>
                                
                                </ListItem>
                            ))}
                            <Divider />
                        </List>

                    </Box>
                </Drawer>
                <Drawer
                    PaperProps={{
                        sx: { width: "40%", minWidth: 350}
                      }}
                    anchor={'left'}
                    open={openDrawer=== 'Chat'}
                    onClose={() => closeDrawer()}
                >
                    {/* <Box
                        sx={{ width: 350, height: 500 }}
                        role="presentation"
                        //onClick={() => closeDrawer()}
                        bgcolor={palette.background.default}
                    > */}
                        <FAChatWindow chatChannel={chatChannel}/>

                    {/* </Box> */}
                </Drawer>
            </Fragment>
        </div>

    );
}