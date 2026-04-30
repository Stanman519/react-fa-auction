import { RosterOwner } from "../../services/AuctionApiSvc";

export const SET_ROSTERS = "SET_ROSTERS";
export const CLEAR_ROSTERS = "CLEAR_ROSTERS";

interface RosterState {
  data: RosterOwner[] | null;
  leagueId: number | null;
}

interface SetRostersAction {
  type: typeof SET_ROSTERS;
  payload: { data: RosterOwner[]; leagueId: number };
}

interface ClearRostersAction {
  type: typeof CLEAR_ROSTERS;
}

export type RosterAction = SetRostersAction | ClearRostersAction;

const defaultState: RosterState = {
  data: null,
  leagueId: null,
};

export const rosterReducer = (
  state: RosterState = defaultState,
  action: RosterAction,
): RosterState => {
  switch (action.type) {
    case SET_ROSTERS:
      return { data: action.payload.data, leagueId: action.payload.leagueId };
    case CLEAR_ROSTERS:
      return defaultState;
    default:
      return state;
  }
};
