import { Action } from "@reduxjs/toolkit";
import React from "react";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { FreeAgent } from "../reducers/FreeAgentReducer";
import { Lot, Bid } from "../reducers/LotReducer";
import { RootState } from "../reducers/RootReducer";
import { updateUI } from "./UiActions";

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
    const newLotIndex = updated.findIndex(l => l.lotId == bid.lotId);
    if (newLotIndex < 0) return; // i was checking for !updated[newLotIndex].bid here but i dont know why. took out because it was breaking nominations
    //const updatedBid = {...bid, player: updated[newLotIndex].bid?.player } as Bid 
    // this was here to just update bids but it was breaking nominations - (and now we are missing headshot and team and position)
    // once update api to get full player back to send with bid response, check if it is okay with bids

    updated[newLotIndex] = {lotId: bid.lotId, newNom: false, bid: bid} as Lot
    dispatch(updateLots(updated));
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

export const makeNewBid = (bid: Bid) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const res = await AuctionApiSvc.makeNewBid(bid)
    const bidBody = await AuctionApiSvc.handleErrorResponse(res);
}

export const makeNewNomination = (bid: Bid) => async ( ): Promise<any> => {
    const res = await AuctionApiSvc.makeNewNom(bid)
    const bidBody = await AuctionApiSvc.handleErrorResponse(res);
}

export const submitWin = (bid: Bid) => async (
    dispatch: Function,
    getState: () => RootState
) : Promise<any> => {
    try {
        const res = await AuctionApiSvc.sendWin(bid)
        const complete = await AuctionApiSvc.handleErrorResponse(res);
        const l = getState().lots;
        const lots = [...l]
        const lotToCleanIndex = lots.findIndex(l => l.lotId === bid.lotId)
        if (lotToCleanIndex < 0) {
            lots[lotToCleanIndex] = {...lots[lotToCleanIndex], bid: undefined}
            dispatch(updateLots(lots))
        }
        
    } catch (e: any) { 
        console.log('e', e.data)
        dispatch(updateUI({ error: 'snackbar', errorText: e.message}))
    }
}