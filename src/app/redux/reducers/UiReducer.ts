import { UIAction, UPDATE_UI } from "../actions/UiActions";

const defaultState: UIState = {
  isLoading: undefined,
  error: undefined,
  errorText: '',
  modal: undefined,
  chatOpen: false,
  isMobile: true
};

export interface UIState {
  isLoading?: string;
  error?: ErrorTypes;
  errorText?: string;
  modal?: Modals;
  chatOpen?: boolean;
  isMobile?: boolean;
}
 
export type ErrorTypes = 'snackbar' | undefined;

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
