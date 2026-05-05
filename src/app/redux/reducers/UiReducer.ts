import { UIAction, UPDATE_UI } from "../actions/UiActions";
import { PlayerBio } from "./FreeAgentReducer";
import { Bid } from "./LotReducer";

const defaultState: UIState = {
  isLoading: undefined,
  error: undefined,
  errorText: "",
  successText: undefined,
  modal: undefined,
  chatOpen: false,
  isMobile: true,
  audioOn: true,
  multiLoader: [],
  playerBioCache: {},
  currentBidHistory: [],
  soldMoment: undefined,
};

export interface UIState {
  currentBidHistory?: Bid[];
  playerBioCache?: Record<number, PlayerBio>;
  isLoading?: LoadingStates;
  button?: ButtonLoads;
  error?: ErrorTypes;
  multiLoader?: MultiLoads[];
  errorText?: string;
  successText?: string;
  modal?: Modals;
  chatOpen?: boolean;
  isMobile?: boolean;
  audioOn?: boolean;
  soldMoment?: Bid;
}

export type ErrorTypes = "snackbar" | undefined;

export type ButtonLoads = "conf-pick-submit" | undefined;

export type Modals =
  | "signIn"
  | "register"
  | "taxi-confirm"
  | "dashboard-success"
  | "waiver-confirm"
  | "buyout-confirm"
  | "tag-confirm"
  | "bid-history-slab"
  | "team-caps-slab"
  | "free-agent-grid"
  | "confidence-submit-success"
  | "ou-standings"
  | "error"
  | "holdout-confirm"
  | "confidence-rules"
  | undefined;

export type LoadingStates = "full-screen" | "button" | "slab" | undefined;
export type MultiLoads = "con-matchups" | "con-results";

export type SnackBars = undefined;

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
