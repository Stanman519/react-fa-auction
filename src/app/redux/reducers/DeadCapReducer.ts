import { DeadCapAction, DeadCapState } from "../actions/DeadCapActions";
import { DeadCapInfo } from "./TransactionReducer";



export const UPDATE_DEAD_CAP_INFO = 'UPDATE_DEAD_CAP_INFO'

const defaultState: DeadCapState = {
    deadCap: [],
    selectedTeam: undefined
}

export const deadCapReducer = (state: DeadCapState = defaultState, action: DeadCapAction): DeadCapState => {
    if (action.type === UPDATE_DEAD_CAP_INFO){
        return action.payload;
    }
    return state
}

