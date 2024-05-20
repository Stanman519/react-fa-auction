import { Action } from "@reduxjs/toolkit";
import { FranchiseWinTotal, UPDATE_OUS } from "../reducers/OverUnderReducer";
import { RootState } from "../reducers/RootReducer";
import GeneralApiSvc from "../../services/GeneralApiSvc";


export interface OverUnderState {
    franchiseWinTotals: FranchiseWinTotal[]
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
    const res = await GeneralApiSvc.getWinOverUndersForLeagueYear(year, league)
    const overUnder = getState().overUnders
    dispatch(updateOverUnders({...overUnder, franchiseWinTotals: res}))
}