import { LoginAction, UPDATE_LOGIN } from "../actions/LoginActions";
import { OwnerAction, UPDATE_OWNERS } from "../actions/OwnerActions";
import Owner from "./OwnerReducer";




const defaultState = {
    ownerId: 0,
    ownername: '',
    password: '',
    capRoom: 0,
    yearsLeft: 0,
    token: '',
    premium: false,
    displayName: '',
    tipsUsed: []
} as Owner


export const loginReducer = (state = defaultState, action: LoginAction): Owner => {
    switch (action.type) {
        case UPDATE_LOGIN:
            return action.payload;
        default:
            return state;
    }
}

