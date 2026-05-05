import axios from "axios";
import { RootState } from "../reducers/RootReducer";
import { FranchiseStandings } from "../reducers/TransactionReducer";
import {
  SET_TRI_YEAR_STANDINGS_DATA,
  SET_TRI_YEAR_STANDINGS_ERROR,
  SET_TRI_YEAR_STANDINGS_LOADING,
} from "../reducers/TriYearStandingsReducer";
import { lastYear, tytFor } from "../../services/Common";

export const loadTriYearStandings =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { currentLeagueId } = getState().profile;
    if (!currentLeagueId) return;
    const entry = getState().triYearStandings.byLeague[currentLeagueId];
    if (entry && (entry.status === "idle" || entry.status === "loading")) return;

    dispatch({ type: SET_TRI_YEAR_STANDINGS_LOADING, leagueId: currentLeagueId });
    try {
      const thisYear = lastYear + 1;
      const res = await axios.get(
        `${process.env.REACT_APP_BOT_API_URL}/Mfl/leagues/${currentLeagueId}/years/${thisYear}/standings`,
      );
      const data = ((res.data ?? []) as FranchiseStandings[]).sort(
        (a, b) => tytFor(b) - tytFor(a),
      );
      dispatch({
        type: SET_TRI_YEAR_STANDINGS_DATA,
        leagueId: currentLeagueId,
        data,
      });
    } catch {
      dispatch({ type: SET_TRI_YEAR_STANDINGS_ERROR, leagueId: currentLeagueId });
    }
  };
