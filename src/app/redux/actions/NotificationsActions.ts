import { Action } from "@reduxjs/toolkit";

export const MARK_NOTIFICATIONS_READ = "MARK_NOTIFICATIONS_READ";
export const HYDRATE_NOTIFICATIONS = "HYDRATE_NOTIFICATIONS";

export interface MarkReadAction extends Action {
  type: typeof MARK_NOTIFICATIONS_READ;
  payload: number;
}

export interface HydrateAction extends Action {
  type: typeof HYDRATE_NOTIFICATIONS;
  payload: number;
}

export type NotificationsAction = MarkReadAction | HydrateAction;

export const LS_KEY = "stanfan_notifications_lastread_v1";

export const markNotificationsRead = (): MarkReadAction => {
  const at = Date.now();
  try {
    localStorage.setItem(LS_KEY, String(at));
  } catch {}
  return { type: MARK_NOTIFICATIONS_READ, payload: at };
};

export const hydrateNotifications = (): HydrateAction => {
  let at = 0;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) at = Number(raw) || 0;
  } catch {}
  return { type: HYDRATE_NOTIFICATIONS, payload: at };
};
