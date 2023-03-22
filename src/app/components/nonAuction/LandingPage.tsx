import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadDataForHomeBase } from "../../redux/actions/TransactionActions";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
export const LandingPage = () => {

    const logo = './stanfan-color-logo.png'
    const dispatch = useDispatch();
    const nav = useNavigate()
    const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
    useEffect(() => {
        console.log('isLoading', isLoading)
        if (isLoading) return
        const checkUser = async () => {
            console.log('checkinguser')
            if (isAuthenticated && user?.sub) {
                console.log('is auth')
                dispatch(loadDataForHomeBase(user))
                nav("/home");
            } else {
                console.log('not auth. login')
                await loginWithRedirect();
            }
        }
        console.log('check user?')
        checkUser()
    }, [isAuthenticated, loginWithRedirect, isLoading, user])
    return (
        <div className='flex flex-row justify-center content-center max-w-full min-h-full'>
            <div className='flex-col justify-center content-center'>
                <img className='max-w-md' src={logo} />
                < Button onClick={() => loginWithRedirect()}> Log In</Button >
            </div>
        </div>

        )}
