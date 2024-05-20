import { NflTeam } from "../../models/ConfidenceDTOs";
import { OverUnderAction, OverUnderState } from "../actions/OverUnderActions";

export interface FranchiseWinTotal {
    id: string,
    overUnder: number,
    year: number,
    realWins: number,
    gamesRemaining: number,
    franchise: NflTeam
}

export const UPDATE_OUS = 'UPDATE_OUS'

const defaultState: OverUnderState = {
    franchiseWinTotals: []
}

export const overUnderReducer = (state: OverUnderState = defaultState, action: OverUnderAction): OverUnderState => {
    if (action.type === UPDATE_OUS){
        return action.payload;
    }
    return state
}

