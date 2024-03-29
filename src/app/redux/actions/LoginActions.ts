import { User, useAuth0 } from "@auth0/auth0-react";
import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { LoginState } from "../reducers/LoginReducer";
import { RootState } from "../reducers/RootReducer";
import { updateUI } from "./UiActions";
import { Route } from "../../services/Routing";
import { getInitialAuctionData } from "./FreeAgentActions";
import GeneralApiSvc from "../../services/GeneralApiSvc";
import { getLeagueCapInfo } from "./TransactionActions";


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

export const synchronizeAuth0WithDbLogin = (user: User) => async(
    dispatch: Function,
    getState: () => RootState
) => {
    const { profile } = getState()
    const dbUser = await GeneralApiSvc.synchronizeAuth(user);
    console.log('db User', dbUser)
    var newProfile = {...profile}
    newProfile.owner = dbUser
    let defaultLeague = dbUser.leagues.find(l => l.league.leagueId === 13894)
    if (!defaultLeague && dbUser.leagues.length > 0) defaultLeague = dbUser.leagues[0]
    newProfile.currentLeague = defaultLeague
    dispatch(updateLoginInfo(newProfile))
}

export const updateCurrentLeague = (leagueId: number, currentRoute: string, user: User) => async(
    dispatch: Function,
    getState: () => RootState
) => {
    const { profile } = getState()
    const newProfile = { ...profile }
    console.log('newprofile', newProfile)
    const newCurrentLeague = newProfile.owner.leagues.find(l => l.league.leagueId === leagueId)
    dispatch(updateLoginInfo({...newProfile, currentLeague: newCurrentLeague}))
    if (currentRoute == '/auction') dispatch(getInitialAuctionData(user.sub))
    if (currentRoute == '/home') dispatch(getLeagueCapInfo())
}


// export const loginAuthUserWithRedirect = () => async (
//     dispatch: Function,
//     getState: () => RootState
//     ) => {
//         try {
//             const login = getState().profile
//             const { loginWithRedirect, user } = useAuth0();
//             await loginWithRedirect()
//             // call api, does db owner exist with this userid?
//                 // if not, create one?
//             // if so, return the user
//             dispatch(updateLoginInfo({...login, authUser: user}))
//         } catch (e: any) { 
//             dispatch(updateUI({ error: 'snackbar', errorText: e.message}))
//         }
    
//     }

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