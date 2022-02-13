import { Action } from "@reduxjs/toolkit";
import { FreeAgent } from "../reducers/FreeAgentReducer";

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