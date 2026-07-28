import { Action } from "@reduxjs/toolkit";
import { Headline } from "../reducers/HeadlinesReducer";
import { axiosInstance } from "../../services/axiosInstance";
import { Dispatch } from "redux";
import { RootState } from "../reducers/RootReducer";

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

/**
 * Demo mode: the real headlines endpoint is token-gated, so fabricate a plausible
 * wire feed from the auction lots already in state (real player names + demo owners).
 * Keeps the ticker lively instead of showing "awaiting headlines". Client-only.
 */
export const seedDemoHeadlines =
  () => (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const leagueId = state.profile.currentLeagueId ?? -32;
    const lots = state.lots.filter((l) => l.bid?.player);
    const now = Date.now();

    const playerTemplates = [
      (name: string, owner: string, salary?: number) =>
        `${owner} opens the bidding on ${name} at $${salary ?? 5}M`,
      (name: string) => `Bidding war heating up over ${name}`,
      (name: string, owner: string) => `${owner} makes a late push for ${name}`,
      (name: string) => `Sleeper alert: ${name} drawing surprise interest`,
      (name: string, owner: string, salary?: number) =>
        `${name} nominated — ${owner} in front at $${salary ?? 5}M`,
      (name: string) => `GMs circling ${name} as the clock winds down`,
    ];

    const items: Headline[] = [];

    lots.slice(0, 8).forEach((l, i) => {
      const p = l.bid!.player!;
      const name = p.fullName || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
      const owner = l.bid!.ownername || "A GM";
      const tmpl = playerTemplates[i % playerTemplates.length];
      items.push({
        headlineId: 1000 + i,
        leagueId,
        referenceKind: "Player",
        referenceId: p.mflId,
        text: tmpl(name, owner, l.bid!.bidSalary),
        tags: p.position ?? "",
        // Stagger into the recent past so the ticker shows varied "3m / 1h" ages.
        createdAt: new Date(now - (i + 1) * 7 * 60 * 1000).toISOString(),
        expiresAt: null,
      });
    });

    // A few owner-flavored beats keyed by distinct owners (byKey dedups per owner).
    const seenOwners = new Set<number>();
    const ownerTemplates = [
      (owner: string) => `${owner} clears cap space ahead of the next nomination`,
      (owner: string) => `${owner} says they're "not done yet" this auction`,
      (owner: string) => `${owner} eyeing a run at a top free agent`,
    ];
    let oIdx = 0;
    for (const l of lots) {
      const ownerId = l.bid!.ownerId;
      const owner = l.bid!.ownername;
      if (!owner || ownerId == null || seenOwners.has(ownerId)) continue;
      seenOwners.add(ownerId);
      items.push({
        headlineId: 2000 + oIdx,
        leagueId,
        referenceKind: "Owner",
        referenceId: ownerId,
        text: ownerTemplates[oIdx % ownerTemplates.length](owner),
        tags: "",
        createdAt: new Date(now - (oIdx + 1) * 11 * 60 * 1000).toISOString(),
        expiresAt: null,
      });
      if (++oIdx >= 3) break;
    }

    dispatch(seedHeadlines(items, leagueId));
  };
