import { LotAction, UPDATE_LOTS } from "../actions/LotActions";
import { FreeAgent } from "./FreeAgentReducer";

export default interface Bid {
    bidId: number
    bidLength: number
    bidSalary: number
    ownername: string
    expires: Date
    lotId?: number
    player: FreeAgent
}
export interface Lot {
    lotId: number
    bid?: Bid
}



const defaultState = [] as Lot[]

for (let i = 1; i <= 12; i++) {
    defaultState.push({lotId: i})
}

export const lotReducer = (state = defaultState, action: LotAction): Lot[] => {
    switch (action.type) {
        case UPDATE_LOTS:
            return action.payload;
        default:
            return state;
    }
}