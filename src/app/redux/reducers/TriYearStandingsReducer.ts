import { Action } from "@reduxjs/toolkit";
import { FranchiseStandings } from "./TransactionReducer";

export const SET_TRI_YEAR_STANDINGS_LOADING = "SET_TRI_YEAR_STANDINGS_LOADING";
export const SET_TRI_YEAR_STANDINGS_DATA = "SET_TRI_YEAR_STANDINGS_DATA";
export const SET_TRI_YEAR_STANDINGS_ERROR = "SET_TRI_YEAR_STANDINGS_ERROR";

export interface TriYearStandingsLeagueEntry {
  data: FranchiseStandings[];
  status: "idle" | "loading" | "error";
}

export interface TriYearStandingsState {
  byLeague: { [leagueId: number]: TriYearStandingsLeagueEntry };
}

interface LoadingAction extends Action {
  type: typeof SET_TRI_YEAR_STANDINGS_LOADING;
  leagueId: number;
}
interface DataAction extends Action {
  type: typeof SET_TRI_YEAR_STANDINGS_DATA;
  leagueId: number;
  data: FranchiseStandings[];
}
interface ErrorAction extends Action {
  type: typeof SET_TRI_YEAR_STANDINGS_ERROR;
  leagueId: number;
}

export type TriYearStandingsAction = LoadingAction | DataAction | ErrorAction;

const defaultState: TriYearStandingsState = { byLeague: {} };

export const triYearStandingsReducer = (
  state: TriYearStandingsState = defaultState,
  action: TriYearStandingsAction,
): TriYearStandingsState => {
  switch (action.type) {
    case SET_TRI_YEAR_STANDINGS_LOADING:
      return {
        byLeague: {
          ...state.byLeague,
          [action.leagueId]: {
            data: state.byLeague[action.leagueId]?.data ?? [],
            status: "loading",
          },
        },
      };
    case SET_TRI_YEAR_STANDINGS_DATA:
      return {
        byLeague: {
          ...state.byLeague,
          [action.leagueId]: { data: action.data, status: "idle" },
        },
      };
    case SET_TRI_YEAR_STANDINGS_ERROR:
      return {
        byLeague: {
          ...state.byLeague,
          [action.leagueId]: {
            data: state.byLeague[action.leagueId]?.data ?? [],
            status: "error",
          },
        },
      };
    default:
      return state;
  }
};
