import { HubConnection } from "@microsoft/signalr";
import { SET_CONNECTION, SignalRAction } from "../actions/SignalRActions";


export interface SignalRState {
    connection: HubConnection | null;
    isConnected: boolean;
    hasReconnected: boolean
  }


const defaultState: SignalRState = {
    connection: null,
    isConnected: false,
    hasReconnected: false
}


export const signalRReducer = (state = defaultState, action: SignalRAction): SignalRState => {
    switch (action.type) {
        case SET_CONNECTION:
            return action.payload;
        default:
            return state;
    }
}