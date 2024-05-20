import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { PlayerDTO } from "../reducers/FreeAgentReducer";
import { updateLoginInfo } from "./LoginActions";
import { updateLots } from "./LotActions";
import { updateOwners } from "./OwnerActions";
import { updateUI } from "./UiActions";
import { RootState } from "../reducers/RootReducer";
import GeneralApiSvc from "../../services/GeneralApiSvc";

export const UPDATE_FREE_AGENTS = 'UPDATE_FREE_AGENTS';

export interface FreeAgentAction extends Action {
    payload: PlayerDTO[]
}

export const updateFreeAgents = (freeAgents: PlayerDTO[]): FreeAgentAction => {
    return {
        type: UPDATE_FREE_AGENTS,
        payload: freeAgents
    }
}

export const getInitialAuctionData = (userSub: string = "") => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    try{
        const { currentLeague } = getState().profile
        dispatch(updateUI({isLoading: 'full-screen'}))
        const leagueId = currentLeague?.league?.leagueId ?? 0
        const initData = await AuctionApiSvc.pageLoad(userSub, leagueId);
        //const user = await GeneralApiSvc.

        dispatch(updateFreeAgents(initData.freeAgents));
        dispatch(updateLots(initData.lots))
        dispatch(updateOwners(initData.owners));
        if (initData.profile) {
            dispatch(updateLoginInfo({owner: initData.profile, currentLeague: currentLeague ?? initData.profile.leagues[0]}));

        }
        dispatch(updateUI({isLoading: undefined}))
    } catch (error: any){
        dispatch(updateUI({ isLoading: undefined, error: 'snackbar', errorText: error.message }));
    }

      
}