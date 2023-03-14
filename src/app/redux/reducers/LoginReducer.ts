import { User } from "@auth0/auth0-react";
import { AuthUser } from "../../components/login/AuthModel";
import { LoginAction, UPDATE_LOGIN } from "../actions/LoginActions";
import { OwnerAction, UPDATE_OWNERS } from "../actions/OwnerActions";
import Owner, { LeagueInfo, LeagueLoginInfo } from "./OwnerReducer";

export interface LoginState {
    owner: Owner
    currentLeague?: LeagueLoginInfo
    authUser?: User
}


const defaultState: LoginState = {
    owner: {
        ownerId: -1,
        ownername: '',
        password: '',
        leagues: [],
        streamToken: '',
        premium: false,
        displayName: '',
        avatar: ''
        //tipsUsed: []
    },
    currentLeague: undefined,
    authUser: undefined
}


export const loginReducer = (state = defaultState, action: LoginAction): LoginState => {
    switch (action.type) {
        case UPDATE_LOGIN:
            return action.payload;
        default:
            return state;
    }
}

