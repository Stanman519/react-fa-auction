import { useAuth0 } from "@auth0/auth0-react";
import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { LoginState } from "../reducers/LoginReducer";
import { RootState } from "../reducers/RootReducer";
import { updateUI } from "./UiActions";


export const UPDATE_LOGIN = 'UPDATE_LOGIN';

export interface LoginAction extends Action {
    payload: LoginState
}

export const updateLoginInfo = (profile: LoginState): LoginAction => {
    return {
        type: UPDATE_LOGIN,
        payload: profile
    }
}

export const submitLogin = (username:string, password: string) => async(
    dispatch: Function,
    
) => {
    try {

        const login = await AuctionApiSvc.login(username, password)
        //console.log('loginleagues', login.leagues)
        const currentLeague = login.leagues.length > 0 ? login.leagues[0] : undefined
        dispatch(updateLoginInfo({owner: login, currentLeague}))
        dispatch(updateUI({modal: undefined}))
    } catch (e: any) { 
        //console.log('e', e.data)
        dispatch(updateUI({ error: 'snackbar', errorText: e.message}))
    }

}

export const loginAuthUserWithRedirect = () => async (
    dispatch: Function,
    getState: () => RootState
    ) => {
        try {
            const login = getState().profile
            const { loginWithRedirect, user } = useAuth0();
            await loginWithRedirect()

            // call api, does db owner exist with this userid?
                // if not, create one?
            // if so, return the user
            
            console.log('auth user....', user)


            dispatch(updateLoginInfo({...login, authUser: user}))
        } catch (e: any) { 
            //console.log('e', e.data)
            dispatch(updateUI({ error: 'snackbar', errorText: e.message}))
        }
    
    }

// export const askCapn = (mflId: string, position: string, age: number) => async(
//     dispatch: Function,
//     getState: () => RootState
// ) => {
//     const { profile } = getState()
//     const askRequest = {mflId, position, age, ownerId: profile.ownerId} as PlayerTipRequest
//     const res = await AuctionApiSvc.askCapn(askRequest);
//     const tip = await AuctionApiSvc.handleErrorResponse(res) as PlayerTipResponse;

//     dispatch(updateLoginInfo({...profile, tipsUsed: [...profile.tipsUsed, tip]}))
// }