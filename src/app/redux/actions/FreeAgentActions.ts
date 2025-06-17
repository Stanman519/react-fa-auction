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
  (userSub: string = "") =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    try {
      const { currentLeague } = getState().profile;
      const { profile } = getState();
      dispatch(updateUI({ isLoading: "full-screen" }));
      const leagueId = currentLeague?.league?.leagueId ?? 0;
      const initData = await AuctionApiSvc.pageLoad(userSub, leagueId);
      //const user = await GeneralApiSvc.

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
      if (initData.profile) {
        dispatch(
          updateLoginInfo({
            ...getState().profile,
            owner: initData.profile,
            currentLeague: {
              ...getState().profile.currentLeague, // preserve existing fields
              ...(() => {
                const foundLeague = initData.profile.leagues.find(
                  (l) =>
                    l.league.leagueId ===
                    (currentLeague?.league?.leagueId ?? 0),
                );
                // Ensure required fields are not undefined
                return {
                  ...foundLeague,
                  capRoom: foundLeague?.capRoom ?? 0,
                  yearsLeft: foundLeague?.yearsLeft ?? 0,
                  mflfranchiseid: foundLeague?.mflfranchiseid ?? 0,
                  leagueownerid: foundLeague?.leagueownerid ?? 0,
                  teamName: foundLeague?.teamName ?? "",
                  league: foundLeague?.league ?? (currentLeague?.league as any), // fallback to existing league, ensure not undefined
                  tagCandidates: foundLeague?.tagCandidates ?? [],
                  taxiPlayers: foundLeague?.taxiPlayers ?? [],
                  cutCandidates: foundLeague?.cutCandidates ?? [],
                  waiverExtensionPlayers:
                    foundLeague?.waiverExtensionPlayers ?? [],
                };
              })(),
            },
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
