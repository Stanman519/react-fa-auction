import {
  HYDRATE_NOTIFICATIONS,
  MARK_NOTIFICATIONS_READ,
  NotificationsAction,
} from "../actions/NotificationsActions";

export interface NotificationsState {
  lastReadAt: number;
}

const defaultState: NotificationsState = { lastReadAt: 0 };

export const notificationsReducer = (
  state: NotificationsState = defaultState,
  action: NotificationsAction,
): NotificationsState => {
  switch (action.type) {
    case MARK_NOTIFICATIONS_READ:
    case HYDRATE_NOTIFICATIONS:
      return { lastReadAt: action.payload };
    default:
      return state;
  }
};
