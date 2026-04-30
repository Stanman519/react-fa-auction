import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { PlayerDTO } from "../reducers/FreeAgentReducer";
import { updateLoginInfo } from "./LoginActions";
import { updateLots } from "./LotActions";
import { updateOwners } from "./OwnerActions";
import { updateUI } from "./UiActions";
import { RootState } from "../reducers/RootReducer";

export const UPDATE_FREE_AGENTS = "UPDATE_FREE_AGENTS";

export interface FreeAgentAction extends Action {
  payload: PlayerDTO[];
}

export const updateFreeAgents = (freeAgents: PlayerDTO[]): FreeAgentAction => {
  return {
    type: UPDATE_FREE_AGENTS,
    payload: freeAgents,
  };
};

export const getInitialAuctionData =
  (userSub: string = "", silent: boolean = false) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    try {
      const { currentLeagueId, owner } = getState().profile;
      if (!silent) dispatch(updateUI({ isLoading: "full-screen" }));
      const leagueId = currentLeagueId ?? 0;
      console.log(
        "profile before fetch init auction data",
        getState().profile.owner.leagues[0],
      );
      const initData = await AuctionApiSvc.pageLoad(userSub, leagueId);

      initData.lots.forEach((l) => {
        if (
          typeof l.bid?.expires === "string" &&
          //@ts-ignore
          !l.bid.expires.endsWith("Z")
        ) {
          //@ts-ignore
          l.bid.expires = new Date((l.bid.expires += "Z")); //TODO: proabbly a database issue, these are actually coming in as strings, maybe need to use datetime offset on api
        }
      });

      dispatch(updateFreeAgents(initData.freeAgents));
      dispatch(updateLots(initData.lots));
      dispatch(updateOwners(initData.owners));
      console.log("initData", initData);

      if (initData.profile) {
        // Find the league to update
        const leagues = [...getState().profile.owner.leagues];

        const newLeagueInfo = initData.profile.leagues.find(
          (l) => l.league.leagueId === leagueId,
        );

        const idx = leagues.findIndex((l) => l.league.leagueId === leagueId);
        if (idx !== -1 && newLeagueInfo) {
          console.log("idx", idx);
          console.log("league", leagueId);
          leagues[idx] = {
            ...leagues[idx],
            capRoom: newLeagueInfo.capRoom ?? 0,
            yearsLeft: newLeagueInfo.yearsLeft ?? 0,
            mflfranchiseid: newLeagueInfo.mflfranchiseid ?? 0,
            leagueownerid: newLeagueInfo.leagueownerid ?? 0,
            teamName: newLeagueInfo.teamName ?? "",
            league: newLeagueInfo.league,
          };
        }

        dispatch(
          updateLoginInfo({
            ...getState().profile,
            owner: {
              ...initData.profile,
              leagues,
            },
            currentLeagueId: leagueId,
            authSynchronized: true,
          }),
        );
      }
      dispatch(updateUI({ isLoading: undefined }));
    } catch (error: any) {
      dispatch(
        updateUI({
          isLoading: undefined,
          error: "snackbar",
          errorText: error.message,
        }),
      );
    }
  };
