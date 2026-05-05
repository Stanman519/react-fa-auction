import { Action } from "@reduxjs/toolkit";

export const SET_CHAT_CONNECTED = "SET_CHAT_CONNECTED";

export interface ChatState {
  connected: boolean;
}

interface SetChatConnectedAction extends Action {
  type: typeof SET_CHAT_CONNECTED;
  connected: boolean;
}

export const setChatConnected = (connected: boolean): SetChatConnectedAction => ({
  type: SET_CHAT_CONNECTED,
  connected,
});

const defaultState: ChatState = { connected: false };

export const chatReducer = (
  state: ChatState = defaultState,
  action: SetChatConnectedAction,
): ChatState => {
  if (action.type === SET_CHAT_CONNECTED) {
    return { connected: action.connected };
  }
  return state;
};
