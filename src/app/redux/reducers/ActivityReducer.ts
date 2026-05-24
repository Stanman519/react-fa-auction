import {
  ActivityAction,
  SeedActivityAction,
  RECORD_ACTIVITY,
  CLEAR_ACTIVITY,
  SEED_ACTIVITY,
} from "../actions/ActivityActions";

export interface ActivityItem {
  id: string;
  kind: "bid" | "nom" | "win";
  ownerId: number;
  ownername: string;
  playerName?: string;
  bidSalary?: number;
  bidLength?: number;
  bidId?: number;
  at: number; // epoch ms
}

const MAX_ACTIVITY = 50;
const TTL_MS = 24 * 60 * 60 * 1000;

const storageKey = (leagueId: number) => `fanpools_activity_${leagueId}`;

export const loadPersistedActivity = (leagueId: number): ActivityItem[] => {
  try {
    const raw = localStorage.getItem(storageKey(leagueId));
    if (!raw) return [];
    const items: ActivityItem[] = JSON.parse(raw);
    const cutoff = Date.now() - TTL_MS;
    return items.filter((i) => i.at >= cutoff);
  } catch {
    return [];
  }
};

const persist = (leagueId: number, items: ActivityItem[]) => {
  try {
    localStorage.setItem(storageKey(leagueId), JSON.stringify(items));
  } catch {}
};

const clearPersisted = (leagueId: number) => {
  try {
    localStorage.removeItem(storageKey(leagueId));
  } catch {}
};

interface ActivityState {
  items: ActivityItem[];
  leagueId: number | null;
}

const initial: ActivityState = { items: [], leagueId: null };

export const activityReducer = (
  state: ActivityState = initial,
  action: ActivityAction | SeedActivityAction,
): ActivityState => {
  switch (action.type) {
    case SEED_ACTIVITY: {
      const { items, leagueId } = (action as SeedActivityAction).payload;
      return { items, leagueId };
    }
    case RECORD_ACTIVITY: {
      const incoming = (action as ActivityAction).payload;
      if (
        incoming.bidId != null &&
        state.items.some((i) => i.bidId === incoming.bidId)
      ) {
        return state;
      }
      const next = [incoming, ...state.items].slice(0, MAX_ACTIVITY);
      if (state.leagueId != null) persist(state.leagueId, next);
      return { ...state, items: next };
    }
    case CLEAR_ACTIVITY: {
      if (state.leagueId != null) clearPersisted(state.leagueId);
      return { ...state, items: [] };
    }
    default:
      return state;
  }
};
