import { User, useAuth0 } from "@auth0/auth0-react";
import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { LoginState } from "../reducers/LoginReducer";
import { RootState } from "../reducers/RootReducer";
import { updateUI } from "./UiActions";
import { Route } from "../../services/Routing";
import { getInitialAuctionData } from "./FreeAgentActions";
import GeneralApiSvc from "../../services/GeneralApiSvc";
import { getLeagueCapInfo } from "./TransactionActions";
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

    var newProfile = { ...profile };
    newProfile.owner = dbUser;
    newProfile.currentLeague =
      dbUser.leagues.length > 0 ? dbUser.leagues[0] : undefined;
    newProfile.authSynchronized = true;
    var pool = dbUser.pools.length > 0 ? dbUser.pools[0] : undefined;
    dispatch(updateOverUnders({ ...overUnders, currentPool: pool }));
    dispatch(updateLoginInfo(newProfile));
  };

export const updateCurrentLeague =
  (leagueId: number, currentRoute: string, user: User) =>
  async (dispatch: Function, getState: () => RootState) => {
    const { profile } = getState();
    const newProfile = { ...profile };
    const newCurrentLeague = newProfile.owner.leagues.find(
      (l) => l.league.leagueId === leagueId,
    );
    dispatch(
      updateLoginInfo({ ...newProfile, currentLeague: newCurrentLeague }),
    );
    if (currentRoute == "/auction") dispatch(getInitialAuctionData(user.sub));
    if (currentRoute == "/home") dispatch(getLeagueCapInfo());
  };
