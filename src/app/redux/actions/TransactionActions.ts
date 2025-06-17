import { Transaction } from "../reducers/TransactionReducer";
import { Action, current } from "@reduxjs/toolkit";
import GeneralApiSvc, { FranchiseTagBody } from "../../services/GeneralApiSvc";
import { RootState } from "../reducers/RootReducer";
import { updateDeadCapInfo } from "./DeadCapActions";
import { updateUI } from "./UiActions";
import { updateLoginInfo } from "./LoginActions";
import { User } from "@auth0/auth0-react";
import { LeagueLoginInfo } from "../reducers/OwnerReducer";
import { PlayerDTO } from "../reducers/FreeAgentReducer";
import { useNavigate } from "react-router-dom";
import { TradeRequest } from "../../models/MflModels";

export interface TransactionAction extends Action {
  payload: Transaction[];
}

export const loadTransactions = (
  transactions: Transaction[],
): TransactionAction => {
  return { type: "LOAD_TRANSACTIONS", payload: transactions };
};

export const loadDashboardData =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    const { currentLeagueId } = getState().profile;
    const leagues = [...profile.owner.leagues];
    const idx = leagues.findIndex((l) => l.league.leagueId === currentLeagueId);
    if (idx === -1) return;

    const currentLeague = leagues[idx];
    try {
      var [deadCap, tagCandidates, taxiSquad, buyouts, waiverExtensions] =
        await Promise.all([
          GeneralApiSvc.getDeadCapAndTransactions(
            currentLeague.league.leagueId,
          ),
          GeneralApiSvc.getFranchiseTagCandidates(
            currentLeague.league.leagueId,
            currentLeague.leagueownerid,
            currentLeague.mflfranchiseid,
          ),
          GeneralApiSvc.getTaxiSquadPlayers(
            currentLeague.league.leagueId,
            currentLeague.leagueownerid,
            currentLeague.mflfranchiseid,
          ),
          GeneralApiSvc.getBuyoutCandidates(
            currentLeague.league.leagueId,
            currentLeague.leagueownerid,
            currentLeague.mflfranchiseid,
          ),
          GeneralApiSvc.getWaiverExtensionCandidates(
            currentLeague.league.leagueId,
            currentLeague.leagueownerid,
            currentLeague.mflfranchiseid,
          ),
        ]);
      console.log("load dashboard taxiSquad", taxiSquad);
      leagues[idx] = {
        ...leagues[idx],
        tagCandidates: tagCandidates,
        taxiPlayers: taxiSquad,
        waiverExtensionPlayers: waiverExtensions,
        cutCandidates: buyouts,
      };

      dispatch(
        updateLoginInfo({
          ...profile,
          owner: {
            ...profile.owner,
            leagues,
          },
        }),
      );
      dispatch(loadTransactions(deadCap.leagueTransactions));
      dispatch(
        updateDeadCapInfo({
          deadCap: deadCap.teamDeadCapData,
          selectedTeam:
            deadCap.teamDeadCapData.length > 0
              ? deadCap.teamDeadCapData[0].franchiseId
              : undefined,
        }),
      );
    } catch (e: any) {
      console.log("ERROR: ", e);
    }
  };

export const getLeagueCapInfo =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    dispatch(updateUI({ isLoading: "full-screen" }));
    const { currentLeagueId } = getState().profile;
    const currentLeague = getState().profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    );
    const dashboard = await GeneralApiSvc.getDeadCapAndTransactions(
      currentLeague?.league.leagueId,
    );
    if (dashboard) {
      dispatch(loadTransactions(dashboard.leagueTransactions));
      dispatch(
        updateDeadCapInfo({
          deadCap: dashboard.teamDeadCapData,
          selectedTeam:
            dashboard.teamDeadCapData.length > 0
              ? dashboard.teamDeadCapData[0].franchiseId
              : undefined,
        }),
      );
      dispatch(updateUI({ modal: undefined }));
    }
    dispatch(updateUI({ isLoading: undefined }));
  };

export const getFranchiseTagCandidates =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    const leagues = [...profile.owner.leagues];
    const idx = leagues.findIndex(
      (l) => l.league.leagueId === profile.currentLeagueId,
    );
    if (idx === -1) return;

    try {
      const res = await GeneralApiSvc.getFranchiseTagCandidates(
        leagues[idx].league.leagueId,
        leagues[idx].leagueownerid,
        leagues[idx].mflfranchiseid,
      );
      leagues[idx] = {
        ...leagues[idx],
        tagCandidates: res,
      };
      dispatch(
        updateLoginInfo({
          ...profile,
          owner: {
            ...profile.owner,
            leagues,
          },
        }),
      );
    } catch (e: any) {}
  };

export const getTaxiSquadPlayers =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    const leagues = [...profile.owner.leagues];
    const idx = leagues.findIndex(
      (l) => l.league.leagueId === profile.currentLeagueId,
    );
    if (idx === -1) return;
    try {
      const res = await GeneralApiSvc.getTaxiSquadPlayers(
        leagues[idx].league.leagueId,
        leagues[idx].leagueownerid,
        leagues[idx].mflfranchiseid,
      );
      leagues[idx] = {
        ...leagues[idx],
        taxiPlayers: res,
      };
      console.log("getTaxiSquadPlayers", res);
      dispatch(
        updateLoginInfo({
          ...profile,
          owner: {
            ...profile.owner,
            leagues,
          },
        }),
      );
    } catch (e: any) {}
  };
export const getBuyoutCandidates =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    const leagues = [...profile.owner.leagues];
    const idx = leagues.findIndex(
      (l) => l.league.leagueId === profile.currentLeagueId,
    );
    if (idx === -1) return;

    try {
      const res = await GeneralApiSvc.getBuyoutCandidates(
        leagues[idx].league.leagueId,
        leagues[idx].leagueownerid,
        leagues[idx].mflfranchiseid,
      );
      leagues[idx] = {
        ...leagues[idx],
        cutCandidates: res,
      };
      dispatch(
        updateLoginInfo({
          ...profile,
          owner: {
            ...profile.owner,
            leagues,
          },
        }),
      );
    } catch (e: any) {}
  };

export const submitFranchiseTag =
  (
    leagueId: number,
    mflPlayerId: number,
    mflFranchiseId: number,
    tagSalary: number,
  ) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    if (!profile.currentLeagueId) return;
    var requestBody = {
      leagueId,
      mflFranchiseId,
      mflPlayerId,
      tagSalary,
    } as FranchiseTagBody;
    // Find and update the league in the leagues array
    const leagues = [...profile.owner.leagues];
    const idx = leagues.findIndex(
      (l) => l.league.leagueId === profile.currentLeagueId,
    );
    if (idx === -1) return;
    requestBody.leagueOwnerId = leagues[idx].leagueownerid;
    leagues[idx] = {
      ...leagues[idx],
    };

    try {
      const res = await GeneralApiSvc.postFranchiseTagPlayer(requestBody);
      leagues[idx] = {
        ...leagues[idx],
        tagCandidates: [],
      };

      dispatch(
        updateLoginInfo({
          ...profile,
          owner: {
            ...profile.owner,
            leagues,
          },
        }),
      );
      dispatch(updateUI({ modal: "dashboard-success" }));
    } catch (e: any) {
      dispatch(updateUI({ modal: "error" }));
    }
  };

export const submitWaiverExtension =
  (
    leagueId: number,
    mflPlayerId: number,
    mflFranchiseId: number,
    tagSalary: number,
  ) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    const leagues = [...profile.owner.leagues];
    const idx = leagues.findIndex(
      (l) => l.league.leagueId === profile.currentLeagueId,
    );
    if (idx === -1) return;

    var requestBody = {
      leagueId,
      mflFranchiseId,
      mflPlayerId,
      tagSalary,
    } as FranchiseTagBody;

    requestBody.leagueOwnerId = leagues[idx].leagueownerid;
    try {
      const res = await GeneralApiSvc.postWaiverExtension(requestBody);
      leagues[idx] = {
        ...leagues[idx],
        waiverExtensionPlayers: [],
      };
      dispatch(
        updateLoginInfo({
          ...profile,
          owner: {
            ...profile.owner,
            leagues,
          },
        }),
      );
      dispatch(updateUI({ modal: "dashboard-success" }));
    } catch (e: any) {
      dispatch(updateUI({ modal: "error" }));
    }
  };

export const submitBuyout =
  (
    leagueId: number,
    player: PlayerDTO,
    mflFranchiseId: number,
    rebate: number,
  ) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    const requestBody = { leagueId, player, mflFranchiseId, rebate };
    if (!profile.currentLeagueId) return;
    try {
      await GeneralApiSvc.postBuyoutPlayer(requestBody);
      // Find and update the league in the leagues array
      const leagues = [...profile.owner.leagues];
      const idx = leagues.findIndex(
        (l) => l.league.leagueId === profile.currentLeagueId,
      );
      if (idx === -1) return;
      leagues[idx] = {
        ...leagues[idx],
        cutCandidates: [],
      };

      dispatch(
        updateLoginInfo({
          ...profile,
          owner: {
            ...profile.owner,
            leagues,
          },
        }),
      );
      dispatch(updateUI({ modal: "dashboard-success" }));
    } catch (e: any) {
      dispatch(updateUI({ modal: "error" }));
    }
  };

export const submitPendingTrade =
  (
    leagueId: number,
    player: PlayerDTO,
    mflFranchiseId: number,
    rebate: number,
  ) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    const requestBody = { leagueId, player, mflFranchiseId, rebate }; //(Math.round(5.01 * 10) / 10).toFixed(1)
    if (!profile.currentLeagueId) return;
    try {
      const res = await GeneralApiSvc.postTaxiCut(requestBody);

      dispatch(updateUI({ modal: "dashboard-success" }));
    } catch (e: any) {
      dispatch(updateUI({ modal: "error" }));
    }
  };

export const submitTaxiCut =
  (
    leagueId: number,
    player: PlayerDTO,
    mflFranchiseId: number,
    rebate: number,
  ) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    const requestBody = { leagueId, player, mflFranchiseId, rebate };
    if (!profile.currentLeagueId) return;
    try {
      const res = await GeneralApiSvc.postTaxiCut(requestBody);
      dispatch(updateUI({ modal: undefined }));

      // Update taxiPlayers in the correct league
      const leagues = [...profile.owner.leagues];
      const idx = leagues.findIndex(
        (l) => l.league.leagueId === profile.currentLeagueId,
      );
      if (idx === -1) return;
      leagues[idx] = {
        ...leagues[idx],
        taxiPlayers:
          leagues[idx].taxiPlayers?.filter((t) => t.mflId !== player.mflId) ??
          [],
      };

      dispatch(
        updateLoginInfo({
          ...profile,
          owner: {
            ...profile.owner,
            leagues,
          },
        }),
      );
      dispatch(updateUI({ modal: "dashboard-success" }));
    } catch (e: any) {
      dispatch(updateUI({ modal: "error" }));
    }
  };

export const submitTradeRequest =
  (tradeReq: TradeRequest) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    if (!profile.currentLeagueId) return;
    try {
      dispatch(updateUI({ isLoading: "button" }));
      const res = await GeneralApiSvc.proposeTrade(tradeReq);

      dispatch(
        updateUI({ isLoading: undefined, modal: "trade-submit-success" }),
      );
    } catch (e: any) {
      dispatch(updateUI({ modal: "error", isLoading: undefined }));
    }
  };

export const replyToTrade =
  (tradeId: number, answer: "reject" | "accept" | "revoke") =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();

    if (!profile.currentLeagueId) return;
    const leagueId = profile.currentLeagueId;
    // Update taxiPlayers in the correct league
    const leagues = [...profile.owner.leagues];
    const idx = leagues.findIndex(
      (l) => l.league.leagueId === profile.currentLeagueId,
    );
    if (idx === -1) return;
    const franchId = profile.owner.leagues[idx].mflfranchiseid;
    try {
      dispatch(updateUI({ isLoading: "button" }));

      if (answer === "accept")
        await GeneralApiSvc.acceptTrade(leagueId, tradeId, 0, franchId);
      else if (answer === "reject")
        await GeneralApiSvc.rejectTrade(leagueId, tradeId, 0, franchId);
      else if (answer === "revoke")
        await GeneralApiSvc.cancelTrade(leagueId, tradeId, 0, franchId);
      dispatch(
        updateUI({ isLoading: undefined, modal: "trade-response-success" }),
      );
    } catch (e: any) {
      dispatch(updateUI({ modal: "error", isLoading: undefined }));
    }
  };
