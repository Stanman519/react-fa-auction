import { User } from "@auth0/auth0-react";
import { Action } from "@reduxjs/toolkit";
import { LoginState } from "../reducers/LoginReducer";
import { RootState } from "../reducers/RootReducer";
import { getInitialAuctionData } from "./FreeAgentActions";
import GeneralApiSvc from "../../services/GeneralApiSvc";
import { loadDashboardData } from "./TransactionActions";
import { updateOverUnders } from "./OverUnderActions";

export const UPDATE_LOGIN = "UPDATE_LOGIN";

export interface LoginAction extends Action {
  payload: LoginState;
}

export const updateLoginInfo = (profile: LoginState): LoginAction => {
  return {
    type: UPDATE_LOGIN,
    payload: profile,
  };
};

export const synchronizeAuth0WithDbLogin =
  (user: User) => async (dispatch: Function, getState: () => RootState) => {
    const { profile } = getState();
    const { overUnders } = getState();

    const dbUser = await GeneralApiSvc.synchronizeAuth(user);

    var pool = dbUser.pools.length > 0 ? dbUser.pools[0] : undefined;
    dispatch(updateOverUnders({ ...overUnders, currentPool: pool }));
    dispatch(
      updateLoginInfo({
        ...profile,
        owner: {
          ...profile.owner,
          leagues:
            !profile.owner.leagues || profile.owner.leagues.length == 0
              ? dbUser.leagues
              : profile.owner.leagues,
        },

        currentLeagueId:
          dbUser.leagues.length > 0
            ? dbUser.leagues[0].league.leagueId
            : undefined,
        authSynchronized: true,
        authUser: user,
        redirected: "",
      }),
    );
  };

export const updateCurrentLeague =
  (leagueId: number, currentRoute: string, user: User) =>
  async (dispatch: Function, getState: () => RootState) => {
    const { profile } = getState();
    const newProfile = { ...profile };
    console.log("updating current league to", leagueId);
    const newCurrentLeague = newProfile.owner.leagues.find(
      (l) => l.league.leagueId === leagueId,
    );
    dispatch(
      updateLoginInfo({
        ...newProfile,
        currentLeagueId: newCurrentLeague?.league.leagueId,
      }),
    );
    console.log("updateCurrentLeague checking route", currentRoute);
    if (currentRoute == "/auction") dispatch(getInitialAuctionData(user.sub));
    if (currentRoute == "/") dispatch(loadDashboardData());
  };

export const redirectToAuction =
  () => async (dispatch: Function, getState: () => RootState) => {
    const { profile } = getState();
    dispatch(updateLoginInfo({ ...profile, redirected: "auction" }));
  };
