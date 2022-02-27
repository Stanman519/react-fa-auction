import { Action } from "@reduxjs/toolkit";
import React from "react";
import AuctionApiSvc from "../../services/AuctionApiSvc";
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

export const updateLotWithFreshBid = (bid: Bid) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { lots } = getState();
    const updated = [...lots];
    console.log('is this thing on?')
    const newLotIndex = updated.findIndex(l => l.lotId == bid.lotId);
    if (newLotIndex < 0 || !updated[newLotIndex].bid) return;
    const updatedBid = {...bid, player: updated[newLotIndex].bid?.player } as Bid
    updated[newLotIndex] = {lotId: bid.lotId, newNom: false, bid: updatedBid} as Lot
    console.log('update lots with', updated)
    dispatch(updateLots(updated));
}

export const turnOnNominationModeForThisOwnersLot = () => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { lots } = getState()
    const { profile } = getState()
    console.log(profile)
    let updatedLots = [...lots];
    if (!profile || lots.length === 0) return;
    const  thisPlayersLotIndex = updatedLots.findIndex(l => l.lotId == profile.ownerId);
    if (thisPlayersLotIndex < 0) return;
    updatedLots[thisPlayersLotIndex].newNom = true;
    dispatch(updateLots(updatedLots))
}

export const makeNewBid = (bid: Bid) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    console.log('bid action', bid)
    const res = await AuctionApiSvc.makeNewBid(bid)
    console.log('bid res', res)
    const bidBody = await AuctionApiSvc.handleErrorResponse(res);

}

export const makeNewNomination = (bid: Bid) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    console.log('action bid', bid)
    const res = await AuctionApiSvc.makeNewNom(bid)
    console.log(res)
    const bidBody = await AuctionApiSvc.handleErrorResponse(res);
    console.log(bidBody)

}