import { Action } from "@reduxjs/toolkit";
import { Headline } from "../reducers/HeadlinesReducer";
import { axiosInstance } from "../../services/axiosInstance";
import { Dispatch } from "redux";

export const UPSERT_HEADLINE = "UPSERT_HEADLINE";
export const SEED_HEADLINES = "SEED_HEADLINES";
export const CLEAR_HEADLINES = "CLEAR_HEADLINES";

export interface HeadlineAction extends Action {
  payload: Headline;
}

export interface SeedHeadlinesAction extends Action {
  payload: { items: Headline[]; leagueId: number };
}

export const upsertHeadline = (h: Headline): HeadlineAction => ({
  type: UPSERT_HEADLINE,
  payload: h,
});

export const seedHeadlines = (
  items: Headline[],
  leagueId: number,
): SeedHeadlinesAction => ({
  type: SEED_HEADLINES,
  payload: { items, leagueId },
});

export const clearHeadlines = (): Action => ({ type: CLEAR_HEADLINES });

export const fetchHeadlines =
  (leagueId: number) => async (dispatch: Dispatch) => {
    try {
      const res = await axiosInstance.get(
        `${process.env.REACT_APP_AUCTION_API_URL}/free-agency/leagues/${leagueId}/headlines`,
      );
      const items: Headline[] = res.data ?? [];
      dispatch(seedHeadlines(items, leagueId));
    } catch (e) {
      // non-fatal — ticker will be empty until next event/recompute
    }
  };
