import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { PlayerDTO } from "../reducers/FreeAgentReducer";
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

export const selectPlayerToNominate = (selectedPlayer: PlayerDTO | null) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { lots } = getState()
    const { owner, currentLeague } = getState().profile
    if (!owner.ownername || lots.length === 0 || !selectedPlayer || !currentLeague) return;
    let updatedLots = [...lots];
    const  thisPlayersLotIndex = updatedLots.findIndex(l => !l.nominatedBy);
    if (thisPlayersLotIndex < 0 ) return;
    const newBid: Bid = { 
        leagueId: currentLeague.league.leagueId,
        player: selectedPlayer,
        ownername: owner.ownername,
        ownerId: currentLeague.leagueownerid,
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
    const newLotIndex = updated.findIndex(l => l.lotId === bid.lotId);
    if (newLotIndex < 0) return; 
        
    // i was checking for  !updated[newLotIndex].bid here buti dont know why. took out because it was breaking nominations
    //const updatedBid = {...bid, player: updated[newLotIndex].bid?.player } as Bid 
    // this was here to just update bids but it was breaking nominations - (and now we are missing headshot and team and position)
    // once update api to get full player back to send with bid response, check if it is okay with bids

    updated[newLotIndex] = {lotId: bid.lotId, newNom: false, bid: bid, isFresh: true} as Lot
    //TODO: how can i add animation or sound here to show new bid -- add a flag on client side only to say isHotChange
    dispatch(updateLots(updated));
}

export const turnOnNominationModeForThisOwnersLot = () => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { lots } = getState()
    const { profile } = getState()
    let updatedLots = [...lots];
    if (!profile || lots.length === 0) return
    const  thisPlayersLotIndex = updatedLots.findIndex(l => !l.nominatedBy); // this is really gross. i meant for it to be null, but somewhere it is turning into 0
    if (thisPlayersLotIndex < 0) return;
    updatedLots[thisPlayersLotIndex].newNom = true;
    dispatch(updateLots(updatedLots))
    
}

export const makeThisLotStale = (id: number) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const lots = getState().lots
    let lotsToUpdate = [...lots]
    const lotIndex = lotsToUpdate.findIndex(l => l.lotId === id)
    lotsToUpdate[lotIndex].isFresh = false
    dispatch(updateLots(lotsToUpdate))
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
    const oldLots = getState().lots;
    let lots = [...oldLots]
    try {
        const res = await AuctionApiSvc.sendWin(bid)
        const complete = await AuctionApiSvc.handleErrorResponse(res);
    } catch (e: any) { 
        dispatch(updateUI({ error: 'snackbar', errorText: e.message}))
    }

    const lotToCleanIndex = lots.findIndex(lot => lot.lotId === bid.lotId)
    if (lotToCleanIndex >= 0) {

        lots[lotToCleanIndex] = {lotId: lots[lotToCleanIndex].lotId, bid: undefined, newNom: false} as Lot
        dispatch(updateLots(lots))
    }
}

