import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useState } from 'react';
import { submitLogin } from '../../redux/actions/LoginActions';
import { useDispatch } from 'react-redux';
import { useTheme } from '@mui/material';
import { updateUI } from '../../redux/actions/UiActions';
import { Route } from '../../services/Routing';
import { loadDataForHomeBase } from '../../redux/actions/TransactionActions';

interface SignInProps{
    origin: Route
}

export default function SignIn({origin}: SignInProps) {
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const dispatch = useDispatch();
    const { palette } = useTheme();

    return (
        <Container maxWidth="xs" style={{backgroundColor: palette.background.paper}}>
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '20px'
                }}
            >
                <Avatar sx={{backgroundColor: palette.primary.main}}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box component="form" onSubmit={() => dispatch(submitLogin(username, password))} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="Username"
                        autoComplete="Username"
                        autoFocus
                        value={username}
                        onChange={u => setUsername(u.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        onKeyPress={(event) => {
                            if (event.key === 'Enter')
                                dispatch(submitLogin(username, password))
                          }}
                        autoComplete="current-password"
                        value={password}
                        onChange={u => setPassword(u.target.value)}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => {
                            //dispatch(submitLogin(username, password))

                            //dispatch(loadDataForHomeBase(`${username},${password}`))
                        }}
                        disabled={!username || !password}
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link variant="body2" onClick={() => dispatch(updateUI({modal: 'register'}))}>
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}