import { UIAction, UPDATE_UI } from "../actions/UiActions";

const defaultState: UIState = {
  isLoading: undefined,
  error: undefined,
  errorText: '',
  modal: undefined,
  chatOpen: false,
  isMobile: true,
  audioOn: true,
  multiLoader: []
};

export interface UIState {
  isLoading?: LoadingStates;
  button?: ButtonLoads;
  error?: ErrorTypes;
  multiLoader?: MultiLoads[]
  errorText?: string;
  modal?: Modals;
  chatOpen?: boolean;
  isMobile?: boolean;
  audioOn?: boolean;
}
 
export type ErrorTypes = 'snackbar' | undefined;

export type ButtonLoads = 'conf-pick-submit' | undefined;

export type Modals = 
  'signIn' | 
  'register' | 
  'taxi-confirm' |
  'waiver-confirm' |
  'buyout-confirm' |
  'tag-confirm' |
  'confidence-submit-success' |
  'error'|
  'confidence-rules' |
  undefined;

export type LoadingStates = 'full-screen' | 'button' | undefined
export type MultiLoads = 'con-matchups' | 'con-results'


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
