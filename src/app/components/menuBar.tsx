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


export function MenuBar() {
    const [isOpen, setIsOpen] = useState(false);
    const { owners, profile } = useSelector((state: RootState) => state); 
    const nomIsUsed = useSelector((state: RootState) => {
        if (!profile.ownername) return false
        return state.lots.find(l => l.lotId === profile.ownerId)?.bid?.player
    })
    const dispatch = useDispatch();
    const { palette } = useTheme();

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    const addNominationCard = () => {
        dispatch(turnOnNominationModeForThisOwnersLot());
    }
    return (
        <div style={{flex: 1}}>
            <Fragment>
                <Box>
                    <AppBar position="static" color="primary">
                        <Toolbar style={{display: 'flex', justifyContent: 'space-between', paddingLeft: 40, paddingRight: 50}}>
                            <div>
                                <Button style={{marginRight: 20}} color="inherit" 
                                onClick={() => toggleDrawer()}>
                                    <Typography fontWeight={'bold'}>Salary Caps</Typography>
                                    </Button>
                                {!nomIsUsed && <Button color='inherit' onClick={() => addNominationCard()}>
                                    <Typography fontWeight={'bold'} >Nominate a Player</Typography>
                                    </Button>}
                            </div>
                            {!profile.ownerId && 
                            <div>
                                <Button color="inherit" onClick={() => dispatch(updateUI({modal: 'signIn'}))}><Typography fontWeight={'bold'}>LOGIN</Typography></Button>
                            </div>}
                            
                        </Toolbar>
                    </AppBar>
                </Box>
                <Drawer
                    anchor={'left'}
                    open={isOpen}
                    onClose={() => toggleDrawer()}
                >
                    <Box
                        sx={{ width: 250, height: '100%' }}
                        role="presentation"
                        onClick={() => toggleDrawer()}
                        bgcolor={palette.background.default}
                    >
                        <List>

                            {owners.map((o, index) => (
                                <ListItem key={o.ownerId} style={{backgroundColor: index % 2 === 0 ? palette.background.default : palette.background.paper}}>
                                    <Avatar style={{marginRight: 8}} sx={{height: 50, width: 50}} alt="" src={ownerMap.find(owner => owner.id === o.ownerId)?.avatar} />
                                    <ListItemText style={{}} primary={o.ownername} secondary={`$${o.capRoom}`} />
                                </ListItem>
                            ))}
                            <Divider />
                        </List>
                    </Box>
                </Drawer>
            </Fragment>
        </div>

    );
}