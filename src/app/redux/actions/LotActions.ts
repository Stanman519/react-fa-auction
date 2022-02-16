import { Action } from "@reduxjs/toolkit";
import React from "react";
import { FreeAgent } from "../reducers/FreeAgentReducer";
import { Lot, Bid } from "../reducers/LotReducer";
import { RootState } from "../reducers/RootReducer";

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

export const selectPlayerToNominate = (selectedPlayer: FreeAgent | null) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { lots } = getState()
    const { profile } = getState()
    if (!profile || lots.length === 0 || !selectedPlayer) return;
    let updatedLots = [...lots];
    const  thisPlayersLotIndex = updatedLots.findIndex(l => l.lotId == profile.ownerId);
    if (thisPlayersLotIndex < 0 ) return;
    const newBid: Bid = { 
        player: selectedPlayer,
        ownername: profile.ownername,
        ownerId: profile.ownerId,
        bidLength: 0,
        bidSalary: 0
    }
    updatedLots[thisPlayersLotIndex].bid = newBid;
    dispatch(updateLots(updatedLots));
}

export const turnOnNominationModeForThisOwnersLot = () => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { lots } = getState()
    const { profile } = getState()
    let updatedLots = [...lots];
    if (!profile || lots.length === 0) return;
    const  thisPlayersLotIndex = updatedLots.findIndex(l => l.lotId == profile.ownerId);
    if (thisPlayersLotIndex < 0) return;
    updatedLots[thisPlayersLotIndex].newNom = true;
    dispatch(updateLots(updatedLots))
}