import { LoginAction, UPDATE_LOGIN } from "../actions/LoginActions";
import { OwnerAction, UPDATE_OWNERS } from "../actions/OwnerActions";
import Owner from "./OwnerReducer";




const defaultState = {} as Owner


export const loginReducer = (state = defaultState, action: LoginAction): Owner => {
    switch (action.type) {
        case UPDATE_LOGIN:
            return action.payload;
        default:
            return state;
    }
}

