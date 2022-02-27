import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { FreeAgent } from "../reducers/FreeAgentReducer";
import { loadAuthenticatedAccount } from "./LoginActions";
import { updateLots } from "./LotActions";
import { updateOwners } from "./OwnerActions";
import { updateUI } from "./UiActions";

export const UPDATE_FREE_AGENTS = 'UPDATE_FREE_AGENTS';

export interface FreeAgentAction extends Action {
    payload: FreeAgent[]
}

export const updateFreeAgents = (freeAgents: FreeAgent[]): FreeAgentAction => {
    return {
        type: UPDATE_FREE_AGENTS,
        payload: freeAgents
    }
}

export const getInitialData = (cookie: string = "") => async ( 
    dispatch: Function,
): Promise<any> => {
    try{
        const initData = await AuctionApiSvc.pageLoad(cookie);
        //const initData = await res.json() 
        console.log(initData)
        console.log(initData.lots)
        dispatch(updateFreeAgents(initData.freeAgents));
        dispatch(updateLots(initData.lots))
        dispatch(updateOwners(initData.owners));
        if(initData.profile) dispatch(loadAuthenticatedAccount(initData.profile));
    } catch (error: any){
        console.log('fail', error)
        dispatch(updateUI({ isLoading: undefined, error: 'snackbar', errorText: error.message }));
    }

      
}