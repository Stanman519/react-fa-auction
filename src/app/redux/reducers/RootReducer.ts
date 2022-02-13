import { combineReducers } from '@reduxjs/toolkit';
import { freeAgentReducer } from './FreeAgentReducer';
import { lotReducer } from './LotReducer';
import { ownerReducer } from './OwnerReducer';


export const RootReducer = combineReducers({
    freeAgents: freeAgentReducer,
    lots: lotReducer,
    owners: ownerReducer
});

export type RootState = ReturnType<typeof RootReducer>
