import { AppBar, Avatar, Box, Button, IconButton, Menu, MenuItem, Switch, Toolbar, useTheme } from "@mui/material";
import {VolumeUp, VolumeMute} from '@mui/icons-material';
import { Fragment, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { turnOnNominationModeForThisOwnersLot } from "../redux/actions/LotActions";
import { updateUI } from "../redux/actions/UiActions";
import { FAChatWindow } from "./chat";
import { useAuth0 } from "@auth0/auth0-react";

type DrawerType = 'Salaries' | 'Chat' | undefined

export function MenuBar() {
    const [openDrawer, setOpenDrawer] = useState<DrawerType>(undefined);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { owner, currentLeague } = useSelector((state: RootState) => state.profile);
    const owners = useSelector((state: RootState) => state.owners.filter(o => o?.leagues.map(l => l.league.leagueId).includes(currentLeague?.league.leagueId ?? 0)));
    const lots = useSelector((state: RootState) => state.lots.filter(l => l.leagueId === currentLeague?.league.leagueId ?? 0));
    const { user } = useAuth0();
    const avatar = user?.picture
    console.log('avatar', avatar)

    const nomIsUsed = useSelector((state: RootState) => {
        if (!owner.ownername) return false
        return state.lots.find(l => l.lotId === owner.ownerId)?.bid?.player
    })
    const open = Boolean(anchorEl);
    const dispatch = useDispatch();
    const { palette } = useTheme();

    const closeDrawer = () => {
        setOpenDrawer(undefined);
    };
    const mobileMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
      };
    const handleAudio = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateUI({audioOn: event.target.checked}))
    }

    const addNominationCard = () => {
        dispatch(turnOnNominationModeForThisOwnersLot());
    }

    const highBidsOnTheBoard = (ownername: string): number => {
        return lots.filter(l => l.bid?.ownername === ownername).map(b => b.bid?.bidSalary)
            .reduce((prev, curr) => prev! + curr!, 0) ?? 0;
    }
    return (
        <div style={{ flex: 1 }}>
            <Fragment>
                <Box>
                    <AppBar position="static" color="primary">
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
                                    <MenuItem onClick={() => {
                                        setOpenDrawer('Salaries')
                                        setAnchorEl(null)
                                        }}>Salary Caps</MenuItem>
                                    {owner.ownername && <MenuItem onClick={() => {
                                        setOpenDrawer('Chat')
                                        setAnchorEl(null)
                                        }}>{openDrawer=== 'Chat' ? 'Close Chat' : 'Open Chat'}</MenuItem>}
                                    {!nomIsUsed && <MenuItem onClick={() => {
                                        addNominationCard()
                                        setAnchorEl(null)
                                        }}>Nominate a Player</MenuItem>}
                                    <MenuItem>
                                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: 8}}>
                                            <VolumeMute />
                                            <Switch defaultChecked color='default' onChange={handleAudio}/>
                                            <VolumeUp />
                                        </div>
                                    </MenuItem>
                                </Menu>
                            </>
                            )
                            :
                            (<div style={{ display: 'flex', flexDirection: 'row', flex: 1}}>
                                <Button color="inherit"
                                    onClick={() => setOpenDrawer('Salaries')}>
                                    Salary Caps
                                </Button>
                                {owner.ownername && <Button color="inherit"
                                    onClick={() => {
                                        //dispatch()
                                        setOpenDrawer('Chat')
                                        }}>
                                    {openDrawer=== 'Chat' ? 'Close Chat' : 'Open Chat'}
                                </Button>}
                                {!nomIsUsed &&
                                    <Button color='inherit' onClick={() => addNominationCard()}>
                                        Nominate a Player
                                    </Button>}
                                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: 8}}>
                                    <VolumeMute />
                                    <Switch defaultChecked color='default' onChange={handleAudio}/>
                                    <VolumeUp />
                                </div>
                            </div>)}
                            {!owner.ownerId &&
                                <div>
                                    <Button color="inherit" onClick={() => dispatch(updateUI({ modal: 'signIn' }))}>
                                        LOGIN
                                    </Button>
                                </div>}

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
                                <ListItem key={o.ownerId} style={{ backgroundColor: index % 2 === 0 ? palette.background.default : palette.background.paper }}>
                                    
                                    <Avatar style={{ marginRight: 8 }} sx={{ height: 50, width: 50 }} alt={user?.name} src={avatar} />
                                    <div style={{flexDirection: 'column'}}>
                                        <ListItemText style={{}} primary={`${o.ownername} - $${o?.leagues}`} secondary={highBidsOnTheBoard(o.ownername) ?? 0 > 0 ? `outstanding bids: $${highBidsOnTheBoard(o.ownername)}`: ''} />
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
                        <FAChatWindow />

                    {/* </Box> */}
                </Drawer>
            </Fragment>
        </div>

    );
}