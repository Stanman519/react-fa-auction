import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/reducers/RootReducer';
import LeagueSwitchMenu from '../menu/LeagueSwitchMenu';
import { useSelector } from 'react-redux';

const pages = [{label:'Games', route: "/games"}, {label:'Auction', route: "/auction"}];
const settings = ['logout'];

function ResponsiveAppBar() {
  const { owner } = useSelector((state: RootState) => state.profile)
  const navigate = useNavigate()
  const { user } = useAuth0();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const logo = process.env.PUBLIC_URL + '/stanfan-logo-white.png';
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  React.useEffect(() => {

  }, [user])

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl" >
        <Toolbar disableGutters style={{ maxHeight: 40 }}>
          <img src={user?.picture} referrerPolicy="no-referrer" style={{ height: 0, width: 0 }} />
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
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
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {owner.leagues.length > 1 && <LeagueSwitchMenu />}
              {pages.map((page) => (
                <MenuItem key={page.label} onClick={() => navigate(page.route)}>
                  <Typography textAlign="center">{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <img src={logo} style={{ maxHeight: 20, aspectRatio: 'auto', marginRight: 20 }} />

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                onClick={() => navigate(page.route)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.label}
              </Button>

            ))}
            {owner.leagues.length > 1 && <LeagueSwitchMenu />}
          </Box>

          {<Box sx={{ flexGrow: 0 }}>
                <Avatar alt={user?.displayName} src={user?.picture} />
          </Box>}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;