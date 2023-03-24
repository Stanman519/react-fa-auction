import { UIAction, UPDATE_UI } from "../actions/UiActions";

const defaultState: UIState = {
  isLoading: undefined,
  error: undefined,
  errorText: '',
  modal: undefined,
  chatOpen: false,
  isMobile: true,
  audioOn: true
};

export interface UIState {
  isLoading?: LoadingStates;
  error?: ErrorTypes;
  errorText?: string;
  modal?: Modals;
  chatOpen?: boolean;
  isMobile?: boolean;
  audioOn?: boolean;
}
 
export type ErrorTypes = 'snackbar' | undefined;

export type Modals = 
  'signIn' | 
  'register' | 
  'taxi-confirm' |
  'buyout-confirm' |
  'tag-confirm' |
  undefined;

export type LoadingStates = 'full-screen' | 'button' | undefined

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
