import { Action } from "@reduxjs/toolkit";
import Cookies from "universal-cookie/es6";
import AuctionApiSvc, { PlayerTipRequest, PlayerTipResponse } from "../../services/AuctionApiSvc";
import Owner from "../reducers/OwnerReducer";
import { RootState } from "../reducers/RootReducer";
import { updateUI } from "./UiActions";


export const UPDATE_LOGIN = 'UPDATE_LOGIN';

export interface LoginAction extends Action {
    payload: Owner
}

export const loadAuthenticatedAccount = (profile: Owner): LoginAction => {
    return {
        type: UPDATE_LOGIN,
        payload: profile
    }
}

export const submitLogin = (username:string, password: string) => async(
    dispatch: Function,
) => {
    try {
        const cookies = new Cookies();
        const login = await AuctionApiSvc.login(username, password)
        dispatch(loadAuthenticatedAccount(login))
        dispatch(updateUI({modal: undefined}))
        cookies.set('token', `${login.ownername},${login.password}`)
    } catch (e: any) { 
        console.log('e', e.data)
        dispatch(updateUI({ error: 'snackbar', errorText: e.message}))
    }

}

export const askCapn = (mflId: string, position: string, age: number) => async(
    dispatch: Function,
    getState: () => RootState
) => {
    const { profile } = getState()
    const askRequest = {mflId, position, age, ownerId: profile.ownerId} as PlayerTipRequest
    const res = await AuctionApiSvc.askCapn(askRequest);
    const tip = await AuctionApiSvc.handleErrorResponse(res) as PlayerTipResponse;

    dispatch(loadAuthenticatedAccount({...profile, tipsUsed: [...profile.tipsUsed, tip]}))
}