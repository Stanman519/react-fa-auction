import { Transaction } from "../reducers/TransactionReducer";
import { Action } from "@reduxjs/toolkit";
import GeneralApiSvc from "../../services/GeneralApiSvc";
import { RootState } from "../reducers/RootReducer";
import { updateDeadCapInfo } from "./DeadCapActions";
import { updateUI } from "./UiActions";
import { updateLoginInfo } from "./LoginActions";
import Cookies from "universal-cookie/es6";
import { User } from "@auth0/auth0-react";

export interface TransactionAction extends Action {
    payload: Transaction[]
}

export const loadTransactions = (transactions: Transaction[]) : TransactionAction => {
    return { type: "LOAD_TRANSACTIONS", payload: transactions };
}



export const loadDataForHomeBase = (authUser: User) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    let user, pass
    // if (!isCookie) {
    //     var userpass = token.split(",")
    //     user = userpass[0]
    //     pass = userpass[1]
    //     pass = btoa(pass)
    //     token = `${user},${pass}`
    // } //else {
    //     var userpass = token.split(",")
    //     user = userpass[0]
    //     pass = userpass[1]
    // }
    const dashboard = await GeneralApiSvc.fetchDashboardInitialLoad("", authUser)
    if (dashboard) {
        const cookies = new Cookies();
        // cookies.set('token', `${dashboard.profile.ownername},${dashboard.profile.password}`)
        const currentLeague = dashboard.profile.leagues.length > 0 ? dashboard.profile.leagues[0] : undefined
        console.log(currentLeague?.taxiPlayers)
        dispatch(loadTransactions(dashboard.leagueTransactions))
        dispatch(updateDeadCapInfo({deadCap: dashboard.teamDeadCaps, selectedTeam: undefined}))
        dispatch(updateLoginInfo({owner: dashboard.profile, currentLeague: currentLeague}))
        dispatch(updateUI({modal: undefined}))
    }
    else {
        dispatch(updateUI({modal: 'signIn'}))
    }

    
}
