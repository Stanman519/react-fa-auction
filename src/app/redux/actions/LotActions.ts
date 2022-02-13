import { Action } from "@reduxjs/toolkit";
import { Lot } from "../reducers/LotReducer";

export const UPDATE_LOTS = 'UPDATE_LOTS';

export interface LotAction extends Action {
    payload: Lot[]
}

export const updateLots = (lots: Lot[]): LotAction => {
    return {
        type: UPDATE_LOTS,
        payload: lots
    }
}