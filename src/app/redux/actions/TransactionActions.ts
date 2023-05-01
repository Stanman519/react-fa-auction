import { Transaction } from "../reducers/TransactionReducer";
import { Action } from "@reduxjs/toolkit";
import GeneralApiSvc from "../../services/GeneralApiSvc";
import { RootState } from "../reducers/RootReducer";
import { updateDeadCapInfo } from "./DeadCapActions";
import { updateUI } from "./UiActions";
import { updateLoginInfo } from "./LoginActions";
import { User } from "@auth0/auth0-react";
import { LeagueLoginInfo } from "../reducers/OwnerReducer";
import { PlayerDTO } from "../reducers/FreeAgentReducer";

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
    dispatch(updateUI({isLoading: 'full-screen'}))
    const { currentLeague } = getState().profile
    const dashboard = await GeneralApiSvc.fetchDashboardInitialLoad("", authUser, currentLeague?.league.leagueId)
    if (dashboard) {
        const newCurrLeague = currentLeague ? dashboard.profile.leagues.find(l => l.league.leagueId == currentLeague.league.leagueId) : dashboard.profile.leagues.length > 0 ? dashboard.profile.leagues[0] : undefined
        
        dispatch(loadTransactions(dashboard.leagueTransactions))
        dispatch(updateDeadCapInfo({deadCap: dashboard.teamDeadCaps, selectedTeam: undefined}))
        dispatch(updateLoginInfo({owner: dashboard.profile, currentLeague: newCurrLeague}))
        dispatch(updateUI({modal: undefined}))
    }
    dispatch(updateUI({isLoading: undefined}))
}


export const submitFranchiseTag = (leagueId: number, mflPlayerId: number, mflFranchiseId: number, tagSalary: number) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { profile } = getState()
    const requestBody = {leagueId, mflFranchiseId, mflPlayerId, tagSalary}
    if (!profile.currentLeague) return
    try {
        const res = await GeneralApiSvc.postFranchiseTagPlayer(requestBody)
        //const newTags = profile.currentLeague?.tagCandidates.filter(t => t.player.mflId !== mflPlayerId) ?? []
        const newLeague: LeagueLoginInfo = {...profile.currentLeague}
        if (!newLeague) return
        newLeague.tagCandidates = []
        dispatch(updateLoginInfo({...profile, currentLeague: newLeague}))

    } catch (e: any)
    {

    }
    dispatch(updateUI({modal: undefined}))
}

export const submitBuyout = (leagueId: number, player: PlayerDTO, mflFranchiseId: number, rebate: number) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { profile } = getState()
    const requestBody = {leagueId, player, mflFranchiseId, rebate}
    if (!profile.currentLeague) return
    try {
        await GeneralApiSvc.postBuyoutPlayer(requestBody)
        const newLeague: LeagueLoginInfo = {...profile.currentLeague}
        if (!newLeague) return
        newLeague.cutCandidates = []
        dispatch(updateLoginInfo({...profile, currentLeague: newLeague}))

    } catch (e: any)
    {

    }
    dispatch(updateUI({modal: undefined}))
}

export const submitTaxiCut = (leagueId: number, player: PlayerDTO, mflFranchiseId: number, rebate: number) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { profile } = getState()
    const requestBody = {leagueId, player, mflFranchiseId, rebate }//(Math.round(5.01 * 10) / 10).toFixed(1)
    if (!profile.currentLeague) return
    try {
        const res = await GeneralApiSvc.postTaxiCut(requestBody)
        dispatch(updateUI({modal: undefined}))
        const newTaxi = profile.currentLeague?.taxiPlayers.filter(t => t.mflId !== player.mflId) ?? []
        const newLeague: LeagueLoginInfo = {...profile.currentLeague}
        if (!newLeague) return
        newLeague.taxiPlayers = newTaxi
        dispatch(updateLoginInfo({...profile, currentLeague: newLeague}))

    } catch (e: any)
    {

    }
    dispatch(updateUI({modal: undefined}))
}