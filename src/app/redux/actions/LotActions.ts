import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { PlayerDTO } from "../reducers/FreeAgentReducer";
import { Lot, Bid } from "../reducers/LotReducer";
import { RootState } from "../reducers/RootReducer";
import { updateUI } from "./UiActions";
import { recordActivity } from "./ActivityActions";

export const UPDATE_LOTS = "UPDATE_LOTS";

export interface LotAction extends Action {
  payload: Lot[];
}

export const updateLots = (lots: Lot[]): LotAction => {
  return {
    type: UPDATE_LOTS,
    payload: lots,
  };
};

export const selectPlayerToNominate =
  (selectedPlayer: PlayerDTO | null) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { lots } = getState();
    const { profile } = getState();

    const leagues = [...profile.owner.leagues];
    const idx = leagues.findIndex(
      (l) => l.league.leagueId === profile.currentLeagueId,
    );
    if (idx === -1) return;

    if (!profile.owner.ownername || lots.length === 0 || !selectedPlayer)
      return;
    let updatedLots = [...lots];
    const thisPlayersLotIndex = updatedLots.findIndex((l) => l.newNom);
    if (thisPlayersLotIndex < 0) return;
    const newBid: Bid = {
      leagueId: leagues[idx].league.leagueId,
      player: selectedPlayer,
      ownername: profile.owner.ownername,
      ownerId: leagues[idx].leagueownerid,
      bidLength: 0,
      bidSalary: 0,
    };
    updatedLots[thisPlayersLotIndex].bid = newBid;
    dispatch(updateLots(updatedLots));
  };

export const updateLotWithFreshBid =
  (bid: Bid) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { lots } = getState();
    const updated = [...lots];
    const newLotIndex = updated.findIndex((l) => l.lotId === bid.lotId);
    if (newLotIndex < 0) return;
    let reformattedBid = bid;
    //@ts-ignore
    if (typeof reformattedBid.expires === "string") {
      //@ts-ignore
      if (!reformattedBid.expires.endsWith("Z")) {
        //@ts-ignore
        reformattedBid.expires = new Date((bid.expires += "Z")); //TODO: proabbly a database issue, these are actually coming in as strings, maybe need to use datetime offset on api
      } else {
        //@ts-ignore
        reformattedBid.expires = new Date(bid.expires);
      }
    }
    // i was checking for  !updated[newLotIndex].bid here buti dont know why. took out because it was breaking nominations
    //const updatedBid = {...bid, player: updated[newLotIndex].bid?.player } as Bid
    // this was here to just update bids but it was breaking nominations - (and now we are missing headshot and team and position)
    // once update api to get full player back to send with bid response, check if it is okay with bids

    updated[newLotIndex] = {
      lotId: bid.lotId,
      newNom: false,
      bid: reformattedBid,
      isFresh: true,
    } as Lot;
    //TODO: how can i add animation or sound here to show new bid -- add a flag on client side only to say isHotChange
    dispatch(updateLots(updated));
    dispatch(
      recordActivity({
        kind: "bid",
        ownerId: reformattedBid.ownerId,
        ownername: reformattedBid.ownername,
        playerName: `${reformattedBid.player?.firstName ?? ""} ${reformattedBid.player?.lastName ?? ""}`.trim(),
        bidSalary: reformattedBid.bidSalary,
        bidLength: reformattedBid.bidLength,
      }),
    );
  };

export const cancelNomination =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { lots } = getState();
    if (lots.length === 0) return;
    const updated = [...lots];
    const idx = updated.findIndex((l) => l.newNom);
    if (idx < 0) return;
    updated[idx] = { ...updated[idx], newNom: false, bid: undefined };
    dispatch(updateLots(updated));
  };

export const turnOnNominationModeForThisOwnersLot =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { lots } = getState();
    const { profile } = getState();
    let updatedLots = [...lots];
    if (!profile || lots.length === 0) return;
    const thisPlayersLotIndex = updatedLots.findIndex(
      (l) => !l.nominatedBy && !l.bid,
    ); // this is really gross. i meant for it to be null, but somewhere it is turning into 0
    if (thisPlayersLotIndex < 0) return;
    updatedLots[thisPlayersLotIndex].newNom = true;
    dispatch(updateLots(updatedLots));
  };

export const makeThisLotStale =
  (id: number) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const lots = getState().lots;
    let lotsToUpdate = [...lots];
    const lotIndex = lotsToUpdate.findIndex((l) => l.lotId === id);
    lotsToUpdate[lotIndex].isFresh = false;
    dispatch(updateLots(lotsToUpdate));
  };

export const makeNewBid =
  (bid: Bid) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const res = await AuctionApiSvc.makeNewBid(bid);
    const bidBody = await AuctionApiSvc.handleErrorResponse(res);
  };

export const makeNewNomination = (bid: Bid) => async (): Promise<any> => {
  await AuctionApiSvc.makeNewNom(bid);
};

export const submitWin =
  (bid: Bid) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { isConnected } = getState().signalR;
    const oldLots = getState().lots;
    let lots = [...oldLots];
    if (!isConnected) {
      dispatch(
        updateUI({
          error: "snackbar",
          errorText:
            "Cancelling win submission because you may not have the latest bids currently. Site will reload when possible.",
        }),
      );
      return;
    }
    try {
      await AuctionApiSvc.sendWin(bid);
    } catch (e: any) {
      dispatch(updateUI({ error: "snackbar", errorText: e.message }));
    }

    const lotToCleanIndex = lots.findIndex((lot) => lot.lotId === bid.lotId);
    if (lotToCleanIndex >= 0) {
      lots[lotToCleanIndex] = {
        lotId: lots[lotToCleanIndex].lotId,
        bid: undefined,
        newNom: false,
      } as Lot;
      dispatch(updateLots(lots));
      dispatch(updateUI({ soldMoment: bid }));
      dispatch(
        recordActivity({
          kind: "win",
          ownerId: bid.ownerId,
          ownername: bid.ownername,
          playerName: `${bid.player?.firstName ?? ""} ${bid.player?.lastName ?? ""}`.trim(),
          bidSalary: bid.bidSalary,
          bidLength: bid.bidLength,
        }),
      );
    }
  };

export const freshenUpTheLotsAfterAbsence =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const leagueId = getState().profile.currentLeagueId;
    try {
      const res = await AuctionApiSvc.getLots(leagueId);
      res.forEach((l) => {
        //@ts-ignore
        if (
          typeof l.bid?.expires === "string" &&
          !(l.bid.expires as string).endsWith("Z")
        ) {
          //@ts-ignore
          l.bid.expires = new Date((l.bid.expires += "Z")); //TODO: proabbly a database issue, these are actually coming in as strings, maybe need to use datetime offset on api
        }
      });
      dispatch(updateLots(res));
    } catch (e: any) {
      dispatch(updateUI({ error: "snackbar", errorText: e.message }));
    }
  };

export const sortLots =
  (sortBy: string) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { lots, profile } = getState();
    const newLots = [...lots];

    const leagues = [...profile.owner.leagues];
    const idx = leagues.findIndex(
      (l) => l.league.leagueId === profile.currentLeagueId,
    );
    if (idx === -1) return;

    const leagueownerid = leagues[idx].leagueownerid ?? -1;

    if (sortBy === "time") {
      newLots.sort((a, b) => {
        const dateA = a?.bid?.expires ? new Date(a?.bid?.expires).getTime() : 0;
        const dateB = b?.bid?.expires ? new Date(b?.bid?.expires).getTime() : 0;
        return dateA - dateB;
      });
    } else if (sortBy == "salary") {
      newLots.sort((a, b) => {
        const lengthA = a?.bid?.bidSalary ?? Number.MAX_SAFE_INTEGER;
        const lengthB = b?.bid?.bidSalary ?? Number.MAX_SAFE_INTEGER;
        return lengthB - lengthA;
      });
    } else if (sortBy == "position") {
      newLots.sort((a, b) => {
        const positionA = a?.bid?.player?.position ?? "";
        const positionB = b?.bid?.player?.position ?? "";
        return positionA.localeCompare(positionB);
      });
    } else if (sortBy == "bids") {
      newLots.sort((a, b) => {
        const positionA = (a?.bid?.ownerId ?? 0) === leagueownerid ? 1 : 0;
        const positionB = (b?.bid?.ownerId ?? 0) === leagueownerid ? 1 : 0;
        return positionB - positionA;
      });
    }

    dispatch(updateLots(newLots));
  };
