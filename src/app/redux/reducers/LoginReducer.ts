import { User } from "@auth0/auth0-react";
import { LoginAction, UPDATE_LOGIN } from "../actions/LoginActions";
import Owner, { LeagueLoginInfo } from "./OwnerReducer";

export interface LoginState {
  owner: Owner;
  currentLeague?: LeagueLoginInfo;
  authUser?: User;
  authSynchronized: boolean;
}

const defaultState: LoginState = {
  owner: {
    pools: [],
    ownerId: -1,
    ownername: "",
    password: "",
    confidencePaid: false,
    leagues: [],
    streamToken: "",
    premium: false,
    displayName: "",
    avatar: "",
    //tipsUsed: []
  },
  authSynchronized: false,
  currentLeague: undefined,
  authUser: undefined,
};

export const loginReducer = (
  state = defaultState,
  action: LoginAction,
): LoginState => {
  switch (action.type) {
    case UPDATE_LOGIN:
      return action.payload;
    default:
      return state;
  }
};
