import { Action } from "@reduxjs/toolkit";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { PlayerDTO } from "../reducers/FreeAgentReducer";
import { updateLoginInfo } from "./LoginActions";
import { updateLots } from "./LotActions";
import { updateOwners } from "./OwnerActions";
import { updateUI } from "./UiActions";
import { RootState } from "../reducers/RootReducer";
import { isDemoMode } from "../../services/demoMode";

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
      // Demo: pull the lively in-memory auction from the anonymous demo endpoint.
      const initData = isDemoMode()
        ? await AuctionApiSvc.demoAuctionBundle()
        : await AuctionApiSvc.pageLoad(userSub, leagueId);

      initData.lots.forEach((l) => {
        if (typeof l.bid?.expires === "string") {
          // DB values arrive without a zone (assume UTC → append Z); the demo
          // endpoint already emits a UTC DateTime with a trailing Z. Either way,
          // parse to a Date so <Timer> can call its getUTC* methods.
          //@ts-ignore
          const raw = l.bid.expires.endsWith("Z")
            ? l.bid.expires
            : l.bid.expires + "Z";
          //@ts-ignore
          l.bid.expires = new Date(raw);
        }
      });

      dispatch(updateFreeAgents(initData.freeAgents));
      dispatch(updateLots(initData.lots));
      dispatch(updateOwners(initData.owners));

      if (initData.profile) {
        // Find the league to update
        const leagues = [...getState().profile.owner.leagues];

        const newLeagueInfo = initData.profile.leagues.find(
          (l) => l.league.leagueId === leagueId,
        );

        const idx = leagues.findIndex((l) => l.league.leagueId === leagueId);
        if (idx !== -1 && newLeagueInfo) {
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
