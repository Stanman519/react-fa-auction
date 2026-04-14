import { User } from "@auth0/auth0-react";
import { Action } from "@reduxjs/toolkit";
import { LoginState } from "../reducers/LoginReducer";
import { RootState } from "../reducers/RootReducer";
import { getInitialAuctionData } from "./FreeAgentActions";
import GeneralApiSvc from "../../services/GeneralApiSvc";
import { loadDashboardData } from "./TransactionActions";
import { updateOverUnders } from "./OverUnderActions";
import { LEAGUE_PREF_KEY } from "../../components/menu/LeagueSwitchMenu";

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

    console.log("[synchronizeAuth0WithDbLogin] Calling API...");
    try {
      const dbUser = await GeneralApiSvc.synchronizeAuth(user);
      console.log("[synchronizeAuth0WithDbLogin] API returned dbUser:", dbUser);

      var pool = dbUser.pools && dbUser.pools.length > 0 ? dbUser.pools[0] : undefined;
      dispatch(updateOverUnders({ ...overUnders, currentPool: pool }));

      // Respect the user's last-used league if it's still in their league list
      const storedId = localStorage.getItem(LEAGUE_PREF_KEY);
      const storedLeagueId = storedId ? parseInt(storedId, 10) : null;
      const preferredLeague = storedLeagueId
        ? dbUser.leagues.find((l) => l.league.leagueId === storedLeagueId)
        : null;
      const currentLeagueId =
        preferredLeague?.league.leagueId ??
        (dbUser.leagues.length > 0 ? dbUser.leagues[0].league.leagueId : undefined);

      const updatedProfile = {
        ...profile,
        owner: dbUser,
        currentLeagueId,
        authSynchronized: true,
        authUser: user,
        authError: undefined,
      };

      console.log("[synchronizeAuth0WithDbLogin] Dispatching updated profile:", updatedProfile);
      dispatch(updateLoginInfo(updatedProfile));
    } catch (err: any) {
      // Render may be cold-starting (takes up to 45s) or API is down — surface so user sees retry UI instead of infinite spinner
      console.error("[synchronizeAuth0WithDbLogin] API failed:", err);
      dispatch(updateLoginInfo({ ...profile, authError: err?.message ?? "Login failed" }));
    }
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
    if (currentRoute == "/league-home") dispatch(loadDashboardData());
  };
