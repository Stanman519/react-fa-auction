import { Action } from "@reduxjs/toolkit";
import { UIState } from "../reducers/UiReducer";

export const UPDATE_UI = 'UPDATE_UI';

export interface UIAction extends Action {
    payload: UIState
}

export const updateUI = (data: UIState): UIAction => {
    return {
        type: UPDATE_UI,
        payload: data
    }
}