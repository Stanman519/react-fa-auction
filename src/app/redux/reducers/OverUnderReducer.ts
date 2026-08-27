import { NflTeam } from "../../models/ConfidenceDTOs";
import { OverUnderPick } from "../../services/GeneralApiSvc";
import { OverUnderAction, OverUnderState } from "../actions/OverUnderActions";

export interface OverUnderLoadResponse {
  winLines: FranchiseWinTotal[];
  otherUsers: string[];
}
export interface FranchiseWinTotal {
  id: number;
  overUnder: number;
  year: number;
  realWins: number;
  gamesRemaining: number;
  franchise: NflTeam;
  userPick: OverUnderPick;
}

export const UPDATE_OUS = "UPDATE_OUS";

const defaultState: OverUnderState = {
  franchiseWinTotals: [],
  userPicks: [],
  // No hardcoded default — fetchFranchiseWinTotals selects the first real line
  // once the data lands. A fixed id here pointed at whatever team happened to
  // be row 12 of some season.
  selectedLine: undefined,
  otherUsers: [],
  currentPool: undefined,
};

export const overUnderReducer = (
  state: OverUnderState = defaultState,
  action: OverUnderAction,
): OverUnderState => {
  if (action.type === UPDATE_OUS) {
    return action.payload;
  }
  return state;
};
