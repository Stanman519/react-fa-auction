import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc, { ErrorResponse, PageLoad } from "../../services/AuctionApiSvc";
import { FreeAgent } from "../reducers/FreeAgentReducer";
import { RootState } from "../reducers/RootReducer";
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

export const getInitialData = () => async ( 
    dispatch: Function,
): Promise<any> => {
    try{
        const res = await AuctionApiSvc.pageLoad();
        //const initData = await AuctionApiSvc.handleErrorResponse(res) as PageLoad;
        const initData = await res.json() 
        console.log(initData)
        dispatch(updateFreeAgents(initData.freeAgents));
        dispatch(updateLots(initData.lots))
        dispatch(updateOwners(initData.owners));
    } catch (error: any){
        console.log('fail', error)
        dispatch(updateUI({ isLoading: undefined, error: 'snackbar', errorText: error.message }));
    }

      
}