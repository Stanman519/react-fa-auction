import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { synchronizeAuth0WithDbLogin } from "../../redux/actions/LoginActions";
import { RootState } from "../../store";
export const LandingPage = () => {
    const logo = './stanfan-color-logo.png'
    const dispatch = useDispatch();
    const nav = useNavigate()
    const { profile } = useSelector((state: RootState) => state)
    const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
    useEffect(() => {
        if (isLoading) return
        const checkUser = async () => {
            if (isAuthenticated && user?.sub) {
                //nav('/auction')
                dispatch(synchronizeAuth0WithDbLogin(user))
                //DETERMINE NAVIGATION --- Check params, for from screen. if none... are there any leagues? go to dashboard, unless league isAuctioning, no leagues, go to games
                if (profile.owner.ownerId < 1) {

                }//do something}
                
            } else {
                await loginWithRedirect();
            }
        }
        checkUser()
    }, [isAuthenticated, loginWithRedirect, isLoading, user])


    useEffect(() => {
        console.log('owner!!!!!', profile.owner)
        if (profile.owner.ownerId > 0) {
            if (profile.owner.leagues.length > 0) nav('/home')
            if (profile.owner.leagues.length === 0) nav('/games')
        }


    }, [profile])
    return (
        <div className='flex flex-row justify-center items-center max-w-screen-sm min-h-screen '>
            <div className='flex-col justify-center items-center max-w-full p-4 m-4 '>
                <img className='max-w-xs animate-pulse' src={logo} />
                {/* < Button onClick={() => loginWithRedirect()}> Log In</Button > */}
            </div>
        </div>

        )}
