import { Action } from "@reduxjs/toolkit";
import Owner, { LeagueLoginInfo, OpposingFranchiseDTO } from "../reducers/OwnerReducer";


export const UPDATE_OWNERS = 'UPDATE_OWNERS';

export interface OwnerAction extends Action {
    payload: OpposingFranchiseDTO[]
}

export const updateOwners = (owners: OpposingFranchiseDTO[]): OwnerAction => {
    return {
        type: UPDATE_OWNERS,
        payload: owners
    }
}