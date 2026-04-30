import { Action } from "@reduxjs/toolkit";
import { OwnerQuote } from "../reducers/QuotesReducer";
import { axiosInstance } from "../../services/axiosInstance";
import { Dispatch } from "redux";

export const UPSERT_QUOTE = "UPSERT_QUOTE";
export const REMOVE_QUOTE = "REMOVE_QUOTE";
export const SEED_QUOTES = "SEED_QUOTES";
export const CLEAR_QUOTES = "CLEAR_QUOTES";

export interface QuoteAction extends Action {
  payload: OwnerQuote;
}

export interface QuoteRemoveAction extends Action {
  payload: { leagueId: number; quoteId: number };
}

export interface SeedQuotesAction extends Action {
  payload: { items: OwnerQuote[]; leagueId: number };
}

export const upsertQuote = (q: OwnerQuote): QuoteAction => ({
  type: UPSERT_QUOTE,
  payload: q,
});

export const removeQuote = (payload: {
  leagueId: number;
  quoteId: number;
}): QuoteRemoveAction => ({
  type: REMOVE_QUOTE,
  payload,
});

export const seedQuotes = (
  items: OwnerQuote[],
  leagueId: number,
): SeedQuotesAction => ({
  type: SEED_QUOTES,
  payload: { items, leagueId },
});

export const clearQuotes = (): Action => ({ type: CLEAR_QUOTES });

export const fetchQuotes =
  (leagueId: number) => async (dispatch: Dispatch) => {
    try {
      const res = await axiosInstance.get(
        `${process.env.REACT_APP_AUCTION_API_URL}/free-agency/leagues/${leagueId}/quotes`,
      );
      const items: OwnerQuote[] = res.data ?? [];
      dispatch(seedQuotes(items, leagueId));
    } catch {
      // non-fatal
    }
  };

export const postQuote =
  (leagueId: number, playerMflId: number, ownerId: number, text: string) =>
  async (dispatch: Dispatch) => {
    const res = await axiosInstance.post(
      `${process.env.REACT_APP_AUCTION_API_URL}/free-agency/leagues/${leagueId}/players/${playerMflId}/quote`,
      { ownerId, text },
    );
    const q: OwnerQuote = res.data;
    dispatch(upsertQuote(q));
    return q;
  };

export const deleteQuote =
  (leagueId: number, ownerId: number, playerMflId: number) =>
  async (_dispatch: Dispatch) => {
    await axiosInstance.delete(
      `${process.env.REACT_APP_AUCTION_API_URL}/free-agency/leagues/${leagueId}/owners/${ownerId}/players/${playerMflId}/quote`,
    );
  };
