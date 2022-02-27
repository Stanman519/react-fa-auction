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

const defaultState = Array.from(Array(13).keys()).map(l => { return { lotId: l + 1, newNom: false}}) as Lot[]


export const lotReducer = (state = defaultState, action: LotAction): Lot[] => {
    switch (action.type) {
        case UPDATE_LOTS:
            console.log('lot reducer')
            return action.payload;
        default:
            return state;
    }
}