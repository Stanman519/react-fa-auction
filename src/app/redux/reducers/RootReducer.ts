import { combineReducers } from '@reduxjs/toolkit';
import { freeAgentReducer } from './FreeAgentReducer';
import { loginReducer } from './LoginReducer';
import { lotReducer } from './LotReducer';
import { ownerReducer } from './OwnerReducer';
import uiReducer from './UiReducer';


export const RootReducer = combineReducers({
    freeAgents: freeAgentReducer,
    lots: lotReducer,
    owners: ownerReducer,
    profile: loginReducer,
    ui: uiReducer
});

export type RootState = ReturnType<typeof RootReducer>
