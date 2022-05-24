import { PlayerTipResponse } from "../../services/AuctionApiSvc";
import { OwnerAction, UPDATE_OWNERS } from "../actions/OwnerActions";


export default interface Owner {
    ownerId: number
    ownername: string
    password: string
    capRoom: number
    yearsLeft: number
    token: string
    premium: boolean
    displayName: string
    tipsUsed: PlayerTipResponse[]
}




const defaultState = [] as Owner[]


export const ownerReducer = (state = defaultState, action: OwnerAction): Owner[] => {
    switch (action.type) {
        case UPDATE_OWNERS:
            return action.payload;
        default:
            return state;
    }
}