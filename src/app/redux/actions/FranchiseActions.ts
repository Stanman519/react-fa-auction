import { Action } from "@reduxjs/toolkit";
import { FranchiseState } from "../reducers/FranchiseReducer";

export interface FranchiseAction extends Action {
    payload: FranchiseState
}

export const UPDATE_FRANCHISES = "UPDATE_FRANCHISES";

export const updateFranchises = (franchises: FranchiseState): FranchiseAction => {
    return { 
        type: "UPDATE_FRANCHISES", 
        payload: franchises 
    };
}