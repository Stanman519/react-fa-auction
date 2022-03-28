import { AppBar, Avatar, Box, Button, Toolbar, Typography, useTheme } from "@mui/material";
import { Fragment, useState } from "react";
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { ownerMap } from "../services/Common";
import { turnOnNominationModeForThisOwnersLot } from "../redux/actions/LotActions";
import { updateUI } from "../redux/actions/UiActions";
import { FAChatWindow } from "./chat";

type DrawerType = 'Salaries' | 'Chat' | undefined

export function MenuBar() {
    const [openDrawer, setOpenDrawer] = useState<DrawerType>(undefined);
    const { owners, profile, ui } = useSelector((state: RootState) => state);
    const nomIsUsed = useSelector((state: RootState) => {
        if (!profile.ownername) return false
        return state.lots.find(l => l.lotId === profile.ownerId)?.bid?.player
    })
    const dispatch = useDispatch();
    const { palette } = useTheme();

    const closeDrawer = () => {
        setOpenDrawer(undefined);
    };

    const addNominationCard = () => {
        dispatch(turnOnNominationModeForThisOwnersLot());
    }
    return (
        <div style={{ flex: 1 }}>
            <Fragment>
                <Box>
                    <AppBar position="static" color="primary">
                        <Toolbar style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 40, paddingRight: 50 }}>
                            <div>
                                <Button color="inherit"
                                    onClick={() => setOpenDrawer('Salaries')}>
                                    Salary Caps
                                </Button>
                                <Button color="inherit"
                                    onClick={() => {
                                        //dispatch()
                                        setOpenDrawer('Chat')
                                        }}>
                                    {openDrawer == 'Chat' ? 'Close Chat' : 'Open Chat'}
                                </Button>
                                {!nomIsUsed &&
                                    <Button color='inherit' onClick={() => addNominationCard()}>
                                        Nominate a Player
                                    </Button>}
                            </div>
                            {!profile.ownerId &&
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
                    open={openDrawer == 'Salaries'}
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
                                    <Avatar style={{ marginRight: 8 }} sx={{ height: 50, width: 50 }} alt="" src={ownerMap.find(owner => owner.id === o.ownerId)?.avatar} />
                                    <ListItemText style={{}} primary={o.ownername} secondary={`$${o.capRoom}`} />
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
                    open={openDrawer == 'Chat'}
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