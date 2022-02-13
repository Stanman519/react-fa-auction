import { AppBar, Avatar, Box, Button, IconButton, Toolbar } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Fragment, useState } from "react";
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { ownerMap } from "../services/Common";


export function MenuBar() {
    const [isOpen, setIsOpen] = useState(false);
    const { owners } = useSelector((state: RootState) => state); 

    const toggleDrawer = () => (event: any) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setIsOpen(!isOpen);
    };
    return (
        <div style={{flex: 1}}>
            <Fragment>
                <Box>
                    <AppBar position="static" onDrop={() => console.log('drop')}>
                        <Toolbar style={{display: 'flex', justifyContent: 'space-between', paddingLeft: 40, paddingRight: 50}}>
                            <div>
                                <Button style={{marginRight: 20}} color="inherit" onClick={toggleDrawer()}><h3>Salary Caps</h3></Button>
                                {<Button color='inherit' onClick={toggleDrawer()}><h3>Nominate a Player</h3></Button>}
                            </div>
                            <div>
                                <Button color="inherit"><h3>LOGIN</h3></Button>
                            </div>
                            
                        </Toolbar>
                    </AppBar>
                </Box>
                <Drawer
                    anchor={'left'}
                    open={isOpen}
                    onClose={toggleDrawer()}
                >
                    <Box
                        sx={{ width: 250, height: '100%' }}
                        role="presentation"
                        onClick={toggleDrawer()}
                        onKeyDown={toggleDrawer()}
                        bgcolor={'rgb(180,180,185)'}
                    >
                        <List>
                            <Divider />
                            {owners.map((o, index) => (
                                <ListItem key={o.ownerId} style={{backgroundColor: index % 2 === 0 ? 'rgb(230,230,235)': 'rgb(210,210,215)'}}>
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