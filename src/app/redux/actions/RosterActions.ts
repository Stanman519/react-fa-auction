import { RootState } from "../reducers/RootReducer";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { CLEAR_ROSTERS, SET_ROSTERS } from "../reducers/RosterReducer";

export const fetchRosters =
  (leagueId: number) =>
  async (dispatch: Function, getState: () => RootState): Promise<void> => {
    const existing = getState().rosters;
    if (existing.data !== null && existing.leagueId === leagueId) return;
    try {
      const data = await AuctionApiSvc.getRosters(leagueId);
      dispatch({ type: SET_ROSTERS, payload: { data, leagueId } });
    } catch {
      dispatch({ type: SET_ROSTERS, payload: { data: [], leagueId } });
    }
  };

export const clearRosters = () => ({ type: CLEAR_ROSTERS });
