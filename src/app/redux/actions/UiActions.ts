import { Action } from "@reduxjs/toolkit";
import { UIState } from "../reducers/UiReducer";
import { RootState } from "../reducers/RootReducer";
import { Bid } from "../reducers/LotReducer";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { PlayerBio } from "../reducers/FreeAgentReducer";
import { lastYear } from "../../services/Common";

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

export const updateBidHistory = (bid?: Bid) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    if (!bid)return
    const {currentLeague} = getState().profile
    const res = await AuctionApiSvc.getBidHistoryByPlayerId(currentLeague?.league.leagueId ?? 0, bid.player.mflId);
    const historyRes = await AuctionApiSvc.handleErrorResponse(res) as Bid[];
    dispatch(updateUI({currentBidHistory: historyRes, modal: 'bid-history-slab'}))
}

export const updatePlayerBio = (bid?: Bid) => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    if (!bid)return
    const {currentLeague} = getState().profile
    dispatch(updateUI({
        modal: 'player-bio-slab', isLoading: 'slab'}));
    const hasAction: boolean = bid.player.actionShot ? true : false
    const res = await AuctionApiSvc.getFullPlayerBio(lastYear, bid.player.mflId, bid.player.position, bid.player.firstName, bid.player.lastName, true);//fix later I ran out of quota for the bing images
    const bioRes = await AuctionApiSvc.handleErrorResponse(res) as PlayerBio;
    dispatch(updateUI({
        currentPlayerBio: {...bioRes, actionShot: hasAction ? bid.player.actionShot ?? '' : bioRes.actionShot}, 
                    modal: 'player-bio-slab', isLoading: undefined}))
}