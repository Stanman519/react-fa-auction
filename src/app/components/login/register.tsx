import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import AuctionApiSvc from '../../services/AuctionApiSvc';
import { updateUI } from '../../redux/actions/UiActions';
import { useDispatch } from 'react-redux';

export default function Register() {
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const theme = useTheme();
    const dispatch = useDispatch();
    const handleSubmit = async () => {
        try{
            await AuctionApiSvc.register(name, username, password);
            dispatch(updateUI({modal: 'signIn'}))
        } catch {

        }
        

    };

  return (
      <Container maxWidth="xs">
        <Box
          sx={{
            backgroundColor: theme.palette.background.default,
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: theme.palette.primary.main }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={name}
                  onChange={p => setName(p.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={p => setUsername(p.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={p => setPassword(p.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password-match"
                  label="Re-type password"
                  type="password"
                  id="password-match"
                  autoComplete="new-password"
                  value={password2}
                  onChange={s => setPassword2(s.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              disabled={password2 !== password}
              onClick={() => handleSubmit()}
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link onClick={() => dispatch(updateUI({modal: 'signIn'}))} variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>

  );
}


