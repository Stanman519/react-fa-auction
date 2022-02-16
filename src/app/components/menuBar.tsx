import { AppBar, Avatar, Box, Button, IconButton, Toolbar, useTheme } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Fragment, useState } from "react";
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { ownerMap } from "../services/Common";
import AuctionApiSvc from "../services/AuctionApiSvc";
import { loadAuthenticatedAccount } from "../redux/actions/LoginActions";
import { turnOnNominationModeForThisOwnersLot } from "../redux/actions/LotActions";
import { updateUI } from "../redux/actions/UiActions";


export function MenuBar() {
    const [isOpen, setIsOpen] = useState(false);
    const { owners, profile } = useSelector((state: RootState) => state); 
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
                    <AppBar position="static" >
                        <Toolbar style={{display: 'flex', justifyContent: 'space-between', paddingLeft: 40, paddingRight: 50}}>
                            <div>
                                <Button style={{marginRight: 20}} color="inherit" onClick={() => toggleDrawer()}><h3>Salary Caps</h3></Button>
                                {<Button color='inherit' onClick={() => addNominationCard()}><h3>Nominate a Player</h3></Button>}
                            </div>
                            {!profile.ownerId && 
                            <div>
                                <Button color="inherit" onClick={() => dispatch(updateUI({modal: 'signIn'}))}><h3>LOGIN</h3></Button>
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
                        bgcolor={palette.grey[400]}
                    >
                        <List>

                            {owners.map((o, index) => (
                                <ListItem key={o.ownerId} style={{backgroundColor: index % 2 === 0 ? palette.grey[400] : palette.grey[300]}}>
                                    <Avatar style={{marginRight: 8}} sx={{height: 50, width: 50}} alt="" src={ownerMap.find(owner => owner.id == o.ownerId)?.avatar} />
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