import { LotAction, UPDATE_LOTS } from "../actions/LotActions";
import { FreeAgent } from "./FreeAgentReducer";

export interface Bid {
    bidId?: number
    bidLength: number
    bidSalary: number
    ownername: string
    ownerId: number
    expires?: Date
    lotId?: number
    player: FreeAgent
}
export interface Lot {
    lotId: number
    bid?: Bid
    newNom: boolean
}



const defaultState = [] as Lot[]

for (let i = 1; i <= 12; i++) {
    defaultState.push({lotId: i, newNom: false})
}

export const lotReducer = (state = defaultState, action: LotAction): Lot[] => {
    switch (action.type) {
        case UPDATE_LOTS:
            return action.payload;
        default:
            return state;
    }
}