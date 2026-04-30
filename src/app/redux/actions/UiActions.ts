import { Action } from "@reduxjs/toolkit";
import { UIState } from "../reducers/UiReducer";
import { RootState } from "../reducers/RootReducer";
import { Bid } from "../reducers/LotReducer";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { PlayerBio } from "../reducers/FreeAgentReducer";
import { lastYear } from "../../services/Common";

export const UPDATE_UI = "UPDATE_UI";

export interface UIAction extends Action {
  payload: UIState;
}

export const updateUI = (data: UIState): UIAction => {
  return {
    type: UPDATE_UI,
    payload: data,
  };
};

export const updateBidHistory =
  (bid?: Bid) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    if (!bid) return;
    const { currentLeagueId } = getState().profile;
    if (!currentLeagueId) return;
    const historyRes = (await AuctionApiSvc.getBidHistoryByPlayerId(
      currentLeagueId,
      bid.player.mflId,
    )) as Bid[];
    dispatch(
      updateUI({ currentBidHistory: historyRes, modal: "bid-history-slab" }),
    );
  };

export const loadPlayerBio =
  (bid?: Bid) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    if (!bid) return;
    const { mflId, position, firstName, lastName } = bid.player;
    const state = getState();
    if (state.ui.playerBioCache?.[mflId]) return;
    const { currentLeagueId } = state.profile;
    const bio = (await AuctionApiSvc.getFullPlayerBio(
      lastYear,
      mflId,
      position,
      firstName,
      lastName,
      false,
      currentLeagueId ?? 13894,
    )) as PlayerBio;
    const prev = getState().ui.playerBioCache ?? {};
    dispatch(updateUI({ playerBioCache: { ...prev, [mflId]: bio } }));
  };
