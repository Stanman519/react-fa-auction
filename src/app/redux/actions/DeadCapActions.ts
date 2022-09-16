import { Action } from "@reduxjs/toolkit";
import { UPDATE_DEAD_CAP_INFO } from "../reducers/DeadCapReducer";
import { RootState } from "../reducers/RootReducer";
import { DeadCapInfo } from "../reducers/TransactionReducer";

export interface DeadCapState {
    deadCap: DeadCapInfo[],
    selectedTeam: number | undefined
}

export interface DeadCapAction extends Action {
    payload: DeadCapState
}



export const updateDeadCapInfo = (state: DeadCapState) : DeadCapAction => {
    return { type: UPDATE_DEAD_CAP_INFO, payload: state };
}


export const selectTeam = (teamId: number) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const deadCap = getState().deadCap
    dispatch(updateDeadCapInfo({ ...deadCap, selectedTeam: teamId }))

}