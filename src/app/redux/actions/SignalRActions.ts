import { Action } from 'redux';
import { HubConnection } from '@microsoft/signalr';
import { SignalRState } from '../reducers/SignalRReducer';

export const SET_CONNECTION = 'SET_CONNECTION';
export const SET_DISCONNECTED = 'SET_DISCONNECTED';
export const SET_RECONNECTED = 'SET_RECONNECTED';

export interface SignalRAction extends Action {
  payload: SignalRState;
}


export const setConnection = (connectionState: SignalRState): SignalRAction => ({
  type: SET_CONNECTION,
  payload: connectionState,
});


