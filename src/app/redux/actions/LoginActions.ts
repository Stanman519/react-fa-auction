import { Action } from "@reduxjs/toolkit";
import Owner from "../reducers/OwnerReducer";


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