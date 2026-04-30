import { Action } from "@reduxjs/toolkit";
import { ActivityItem } from "../reducers/ActivityReducer";

export const RECORD_ACTIVITY = "RECORD_ACTIVITY";
export const CLEAR_ACTIVITY = "CLEAR_ACTIVITY";
export const SEED_ACTIVITY = "SEED_ACTIVITY";

export interface ActivityAction extends Action {
  payload: ActivityItem;
}

export interface SeedActivityAction extends Action {
  payload: { items: ActivityItem[]; leagueId: number };
}

let _id = 0;
const nextId = () => `a${Date.now()}-${++_id}`;

export const recordActivity = (
  item: Omit<ActivityItem, "id" | "at"> & { at?: number },
): ActivityAction => ({
  type: RECORD_ACTIVITY,
  payload: { id: nextId(), at: item.at ?? Date.now(), ...item } as ActivityItem,
});

export const clearActivity = (): Action => ({ type: CLEAR_ACTIVITY });

export const seedActivity = (
  items: ActivityItem[],
  leagueId: number,
): SeedActivityAction => ({
  type: SEED_ACTIVITY,
  payload: { items, leagueId },
});
