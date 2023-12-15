import { ConfidenceState, ConfidenceAction } from "../actions/ConfidenceActions";
import { DeadCapAction, DeadCapState } from "../actions/DeadCapActions";
import { DeadCapInfo } from "./TransactionReducer";



export const UPDATE_CONFIDENCE = 'UPDATE_CONFIDENCE'

const defaultState: ConfidenceState = {
    viewMode: 'my-picks',
    nflTeams: [],
    props: [],
    matchups: [],
    results: []
}

export const confidenceReducer = (state: ConfidenceState = defaultState, action: ConfidenceAction): ConfidenceState => {
    if (action.type === UPDATE_CONFIDENCE){
        return action.payload;
    }
    return state
}

