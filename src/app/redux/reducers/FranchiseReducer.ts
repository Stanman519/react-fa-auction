import { FranchiseAction, UPDATE_FRANCHISES } from "../actions/FranchiseActions";

export interface Franchise {
    franchiseId: number
    icon: string
    bBidAvailableBalance: number
    ownername: string
    abbrev: string
    teamname: string
}

export interface FranchiseState { 
    franchises: Franchise[]
    selectedTeam: Franchise | undefined
}

const defaultState: FranchiseState = {
    franchises: [],
    selectedTeam: undefined
}

export const franchiseReducer = (state = defaultState, action: FranchiseAction): FranchiseState => {
    switch (action.type) {
        case UPDATE_FRANCHISES:
            return action.payload;
        default:
            return state;
    }
}