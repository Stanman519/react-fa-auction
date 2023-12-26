import { ConfidenceState, ConfidenceAction } from "../actions/ConfidenceActions";
import { DeadCapAction, DeadCapState } from "../actions/DeadCapActions";
import { DeadCapInfo } from "./TransactionReducer";



export const UPDATE_CONFIDENCE = 'UPDATE_CONFIDENCE'

export const defaultConfState: ConfidenceState = {
    viewMode: 'my-picks',
    nflTeams: [],
    props: [],
    communityStats: [],
    matchups: [],
    results: []
}

export const confidenceReducer = (state: ConfidenceState = defaultConfState, action: ConfidenceAction): ConfidenceState => {
    if (action.type === UPDATE_CONFIDENCE){
        return action.payload;
    }
    return state
}

