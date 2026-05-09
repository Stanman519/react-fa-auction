import { Action } from "@reduxjs/toolkit";
import { RecentMove } from "../../services/GeneralApiSvc";

export interface LoadRecentMovesAction extends Action {
  type: "LOAD_RECENT_MOVES";
  payload: RecentMove[];
}

export const loadRecentMoves = (
  payload: RecentMove[],
): LoadRecentMovesAction => ({ type: "LOAD_RECENT_MOVES", payload });

const defaultState: RecentMove[] = [];

export function recentMovesReducer(
  state: RecentMove[] = defaultState,
  action: LoadRecentMovesAction,
): RecentMove[] {
  if (action.type === "LOAD_RECENT_MOVES") return action.payload;
  return state;
}
