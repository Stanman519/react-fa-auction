import {
  QuoteAction,
  QuoteRemoveAction,
  SeedQuotesAction,
  CLEAR_QUOTES,
  REMOVE_QUOTE,
  SEED_QUOTES,
  UPSERT_QUOTE,
} from "../actions/QuoteActions";

export interface OwnerQuote {
  quoteId: number;
  leagueId: number;
  ownerId: number;
  ownerName: string;
  playerMflId: number;
  text: string;
  createdAt: string;
}

interface QuotesState {
  byKey: Record<string, OwnerQuote>;
  leagueId: number | null;
}

const initial: QuotesState = { byKey: {}, leagueId: null };

const keyOf = (q: OwnerQuote) => `${q.ownerId}:${q.playerMflId}`;
const keyFromIds = (ownerId: number, playerMflId: number) => `${ownerId}:${playerMflId}`;

export const quotesReducer = (
  state: QuotesState = initial,
  action: QuoteAction | SeedQuotesAction | QuoteRemoveAction,
): QuotesState => {
  switch (action.type) {
    case SEED_QUOTES: {
      const { items, leagueId } = (action as SeedQuotesAction).payload;
      const byKey: Record<string, OwnerQuote> = {};
      for (const q of items) byKey[keyOf(q)] = q;
      return { byKey, leagueId };
    }
    case UPSERT_QUOTE: {
      const q = (action as QuoteAction).payload;
      if (state.leagueId != null && q.leagueId !== state.leagueId) return state;
      return { ...state, byKey: { ...state.byKey, [keyOf(q)]: q } };
    }
    case REMOVE_QUOTE: {
      const { quoteId } = (action as QuoteRemoveAction).payload;
      const next = { ...state.byKey };
      for (const k of Object.keys(next)) {
        if (next[k].quoteId === quoteId) delete next[k];
      }
      return { ...state, byKey: next };
    }
    case CLEAR_QUOTES:
      return { ...state, byKey: {} };
    default:
      return state;
  }
};

export { keyFromIds as quoteKey };
