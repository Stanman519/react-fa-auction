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
    const { currentLeague } = getState().profile;
    if (!currentLeague) return;
    const newLeague: LeagueLoginInfo = { ...currentLeague };
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
      newLeague.tagCandidates = tagCandidates;
      newLeague.cutCandidates = buyouts;
      newLeague.taxiPlayers = taxiSquad;
      newLeague.waiverExtensionPlayers = waiverExtensions;
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
      dispatch(updateLoginInfo({ ...profile, currentLeague: newLeague }));
    } catch (e: any) {
      console.log("ERROR: ", e);
    }
  };

export const getLeagueCapInfo =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    dispatch(updateUI({ isLoading: "full-screen" }));
    const { currentLeague } = getState().profile;
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
    if (!profile.currentLeague) return;
    try {
      const res = await GeneralApiSvc.getFranchiseTagCandidates(
        profile.currentLeague.league.leagueId,
        profile.currentLeague.leagueownerid,
        profile.currentLeague.mflfranchiseid,
      );
      const newLeague: LeagueLoginInfo = { ...profile.currentLeague };
      newLeague.tagCandidates = res;
      dispatch(updateLoginInfo({ ...profile, currentLeague: newLeague }));
    } catch (e: any) {}
  };
export const getTaxiSquadPlayers =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    if (!profile.currentLeague) return;
    try {
      const res = await GeneralApiSvc.getTaxiSquadPlayers(
        profile.currentLeague.league.leagueId,
        profile.currentLeague.leagueownerid,
        profile.currentLeague.mflfranchiseid,
      );
      const newLeague: LeagueLoginInfo = { ...profile.currentLeague };
      newLeague.taxiPlayers = res;
      dispatch(updateLoginInfo({ ...profile, currentLeague: newLeague }));
    } catch (e: any) {}
  };
export const getBuyoutCandidates =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    if (!profile.currentLeague) return;
    try {
      const res = await GeneralApiSvc.getBuyoutCandidates(
        profile.currentLeague.league.leagueId,
        profile.currentLeague.leagueownerid,
        profile.currentLeague.mflfranchiseid,
      );
      const newLeague: LeagueLoginInfo = { ...profile.currentLeague };
      newLeague.cutCandidates = res;
      dispatch(updateLoginInfo({ ...profile, currentLeague: newLeague }));
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
    if (!profile.currentLeague) return;
    var requestBody = {
      leagueId,
      mflFranchiseId,
      mflPlayerId,
      tagSalary,
    } as FranchiseTagBody;
    requestBody.leagueOwnerId = profile.currentLeague.leagueownerid;
    try {
      const res = await GeneralApiSvc.postFranchiseTagPlayer(requestBody);
      //const newTags = profile.currentLeague?.tagCandidates.filter(t => t.player.mflId !== mflPlayerId) ?? []
      const newLeague: LeagueLoginInfo = { ...profile.currentLeague };
      if (!newLeague) return;
      newLeague.tagCandidates = [];
      dispatch(updateLoginInfo({ ...profile, currentLeague: newLeague }));
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
    if (!profile.currentLeague) return;
    var requestBody = {
      leagueId,
      mflFranchiseId,
      mflPlayerId,
      tagSalary,
    } as FranchiseTagBody;
    requestBody.leagueOwnerId = profile.currentLeague.leagueownerid;
    try {
      const res = await GeneralApiSvc.postWaiverExtension(requestBody);
      //const newTags = profile.currentLeague?.tagCandidates.filter(t => t.player.mflId !== mflPlayerId) ?? []
      const newLeague: LeagueLoginInfo = { ...profile.currentLeague };
      if (!newLeague) return;
      newLeague.tagCandidates = [];
      dispatch(updateLoginInfo({ ...profile, currentLeague: newLeague }));
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
    if (!profile.currentLeague) return;
    try {
      await GeneralApiSvc.postBuyoutPlayer(requestBody);
      const newLeague: LeagueLoginInfo = { ...profile.currentLeague };
      if (!newLeague) return;
      newLeague.cutCandidates = [];
      dispatch(updateLoginInfo({ ...profile, currentLeague: newLeague }));
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
    if (!profile.currentLeague) return;
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
    const requestBody = { leagueId, player, mflFranchiseId, rebate }; //(Math.round(5.01 * 10) / 10).toFixed(1)
    if (!profile.currentLeague) return;
    try {
      const res = await GeneralApiSvc.postTaxiCut(requestBody);
      dispatch(updateUI({ modal: undefined }));
      const newTaxi =
        profile.currentLeague?.taxiPlayers.filter(
          (t) => t.mflId !== player.mflId,
        ) ?? [];
      const newLeague: LeagueLoginInfo = { ...profile.currentLeague };
      if (!newLeague) return;
      newLeague.taxiPlayers = newTaxi;
      dispatch(updateLoginInfo({ ...profile, currentLeague: newLeague }));
      dispatch(updateUI({ modal: "dashboard-success" }));
    } catch (e: any) {
      dispatch(updateUI({ modal: "error" }));
    }
  };

export const submitTradeRequest =
  (tradeReq: TradeRequest) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { profile } = getState();
    if (!profile.currentLeague) return;
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

    if (!profile.currentLeague) return;
    const leagueId = profile.currentLeague.league.leagueId;
    const franchId = profile.currentLeague.mflfranchiseid;
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
