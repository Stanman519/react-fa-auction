import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { PlayerDTO } from "../reducers/FreeAgentReducer";
import { updateLoginInfo } from "./LoginActions";
import { updateLots } from "./LotActions";
import { updateOwners } from "./OwnerActions";
import { updateUI } from "./UiActions";

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

export const getInitialData = (cookie: string = "") => async ( 
    dispatch: Function,
): Promise<any> => {
    try{
        dispatch(updateUI({isLoading: 'full-screen'}))
        const initData = await AuctionApiSvc.pageLoad(cookie);
        console.log('auc', initData)
        dispatch(updateFreeAgents(initData.freeAgents));
        dispatch(updateLots(initData.lots))
        dispatch(updateOwners(initData.owners));
        if(initData.profile) dispatch(updateLoginInfo({owner: initData.profile}));
        dispatch(updateUI({isLoading: undefined}))
    } catch (error: any){
        dispatch(updateUI({ isLoading: undefined, error: 'snackbar', errorText: error.message }));
    }

      
}