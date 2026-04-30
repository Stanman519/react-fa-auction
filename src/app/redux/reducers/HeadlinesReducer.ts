import {
  HeadlineAction,
  SeedHeadlinesAction,
  CLEAR_HEADLINES,
  SEED_HEADLINES,
  UPSERT_HEADLINE,
} from "../actions/HeadlineActions";

export interface Headline {
  headlineId: number;
  leagueId: number;
  referenceKind: "Player" | "Owner" | string;
  referenceId: number;
  text: string;
  tags: string;
  createdAt: string;
  expiresAt: string | null;
}

interface HeadlinesState {
  byKey: Record<string, Headline>;
  leagueId: number | null;
}

const initial: HeadlinesState = { byKey: {}, leagueId: null };

const keyOf = (h: Headline) => `${h.referenceKind}:${h.referenceId}`;

export const headlinesReducer = (
  state: HeadlinesState = initial,
  action: HeadlineAction | SeedHeadlinesAction,
): HeadlinesState => {
  switch (action.type) {
    case SEED_HEADLINES: {
      const { items, leagueId } = (action as SeedHeadlinesAction).payload;
      const byKey: Record<string, Headline> = {};
      for (const h of items) byKey[keyOf(h)] = h;
      return { byKey, leagueId };
    }
    case UPSERT_HEADLINE: {
      const h = (action as HeadlineAction).payload;
      if (state.leagueId != null && h.leagueId !== state.leagueId) return state;
      return { ...state, byKey: { ...state.byKey, [keyOf(h)]: h } };
    }
    case CLEAR_HEADLINES:
      return { ...state, byKey: {} };
    default:
      return state;
  }
};
