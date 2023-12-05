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
    const {owner} = useSelector((state: RootState) => state.profile)
    const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
    useEffect(() => {
        if (isLoading) return
        const checkUser = async () => {
            if (isAuthenticated && user?.sub) {
                //nav('/auction')
                console.log('authenticated? ', isAuthenticated)
                dispatch(synchronizeAuth0WithDbLogin(user))
                //DETERMINE NAVIGATION --- Check params, for from screen. if none... are there any leagues? go to dashboard, unless league isAuctioning, no leagues, go to games
                if (owner.ownerId < 1) {

                }//do something}
                if (owner.leagues.length > 0) nav('/home')
                if (owner.leagues.length == 0) nav('/games')
                else nav('/games')
                //dispatch(loadDataForHomeBase(user))

            } else {
                await loginWithRedirect();
            }
        }
        checkUser()
    }, [isAuthenticated, loginWithRedirect, isLoading, user])
    return (
        <div className='flex flex-row justify-center content-center max-w-full min-h-full'>
            <div className='flex-col justify-center content-center max-w-screen-sm max-h-screen-sm'>
                <img className='max-w-md animate-pulse' src={logo} />
                {/* < Button onClick={() => loginWithRedirect()}> Log In</Button > */}
            </div>
        </div>

        )}
