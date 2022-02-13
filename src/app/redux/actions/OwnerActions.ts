import { Action } from "@reduxjs/toolkit";
import Owner from "../reducers/OwnerReducer";


export const UPDATE_OWNERS = 'UPDATE_OWNERS';

export interface OwnerAction extends Action {
    payload: Owner[]
}

export const updateOwners = (owners: Owner[]): OwnerAction => {
    return {
        type: UPDATE_OWNERS,
        payload: owners
    }
}