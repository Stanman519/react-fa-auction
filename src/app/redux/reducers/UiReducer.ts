import { UIAction, UPDATE_UI } from "../actions/UiActions";

const defaultState: UIState = {
  isLoading: undefined,
  error: undefined,
  errorText: '',
  modal: undefined,
};

export interface UIState {
  isLoading?: boolean;
  error?: ErrorTypes;
  errorText?: string;
  modal?: Modals;
}

export type ErrorTypes = undefined;

export type Modals = 
  'signIn' | 
  'register' | 
  undefined;

export type SnackBars =  undefined; 

const uiReducer = (state = defaultState, action: UIAction): UIState => {
  switch (action.type) {
    case UPDATE_UI:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default uiReducer;
