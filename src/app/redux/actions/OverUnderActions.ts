import { Action } from "@reduxjs/toolkit";
import { FranchiseWinTotal, UPDATE_OUS } from "../reducers/OverUnderReducer";
import { RootState } from "../reducers/RootReducer";
import GeneralApiSvc, { OverUnderPick } from "../../services/GeneralApiSvc";
import { updateUI } from "./UiActions";
import Owner from "../reducers/OwnerReducer";

var TEMP_POOL_ID = 1
export interface OverUnderState {
    franchiseWinTotals: FranchiseWinTotal[]
    userPicks: OverUnderPick[]
    selectedLine?: number
    otherUsers: Owner[]
}

export interface OverUnderAction extends Action {
    payload: OverUnderState
}


export const updateOverUnders = (state: OverUnderState): OverUnderAction => {
    return { type: UPDATE_OUS, payload: state };
}


export const fetchFranchiseWinTotals = (year: number, league: string) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { ownerId } = getState().profile.owner
    const res = await GeneralApiSvc.getWinOverUndersForLeagueYear(TEMP_POOL_ID, year, league, ownerId)
    res.winLines.forEach(r => {
        if (r.userPick.isOver === null) r.userPick.isOver = undefined
    })
    var users = res.otherUsers.map(u => {
        return {
            displayName: u
    } as Owner
})
    const { overUnders } = getState()
    dispatch(updateOverUnders({ ...overUnders, franchiseWinTotals: res.winLines, otherUsers: users }))
}
export const fetchUserPicks = (year: number, league: string) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {

    const res = await GeneralApiSvc.getAllOverUnderPicksByLeagueYear(TEMP_POOL_ID)
    const { overUnders } = getState()
    dispatch(updateOverUnders({...overUnders, userPicks: res}))
}
export const fetchAllUsers = () => async(    
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {

    const res = await GeneralApiSvc.getAllOverUnderUsers(TEMP_POOL_ID)
    const { overUnders } = getState()
    dispatch(updateOverUnders({...overUnders, otherUsers: res}))
}
export const submitOverUnderPicks = (year: number, league: string) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { ownerId } = getState().profile.owner
    const { franchiseWinTotals } = getState().overUnders
    const picks =  franchiseWinTotals.map(f => f.userPick).map(p => {return {
        id: p.id ?? undefined,
        lineId: p.lineId,
        ownerId: ownerId,
        isOver: p.isOver ?? null,
        lineAdjustment: p.lineAdjustment

    } as OverUnderPick }) 
    const res = await GeneralApiSvc.sendOverUnderPicks(year, league, picks)
    if (res.success) dispatch(updateUI({modal: 'confidence-submit-success'}))
    else dispatch(updateUI({modal: 'error', errorText: typeof res.data === 'string' ? res.data : 'There was a problem submitting your picks.'}))
}

export const handleOverUnderRowUpdate = (id: number, adj: number, isOver?: boolean) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    console.log(`setting id : ${id}, adj: ${adj}, isOver: ${isOver}`)
    const {overUnders} = getState()
    const { ownerId } = getState().profile.owner
    const newPicks = [...overUnders.franchiseWinTotals]
    const updatedPick = {
        lineAdjustment: adj, 
        ownerId, 
        isOver: isOver ? true : isOver ===  false ? false : undefined, 
        lineId: id
    } as OverUnderPick

    const foundIndex = newPicks.findIndex(p => p.id == id)
    if (foundIndex < 0) return
    
    newPicks[foundIndex].userPick = updatedPick
    
    dispatch(updateOverUnders({...overUnders, franchiseWinTotals: newPicks}))
}