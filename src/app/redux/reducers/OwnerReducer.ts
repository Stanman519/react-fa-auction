import { OwnerAction, UPDATE_OWNERS } from "../actions/OwnerActions";


export default interface Owner {
    ownerId: number
    ownername: string
    password: string
    capRoom: number
    yearsLeft: number
    token: string
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