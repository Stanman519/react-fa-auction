import { combineReducers } from '@reduxjs/toolkit';
import { deadCapReducer } from './DeadCapReducer';
import { franchiseReducer } from './FranchiseReducer';
import { freeAgentReducer } from './FreeAgentReducer';
import { loginReducer } from './LoginReducer';
import { lotReducer } from './LotReducer';
import { ownerReducer } from './OwnerReducer';
import transactionReducer from './TransactionReducer';
import uiReducer from './UiReducer';


export const RootReducer = combineReducers({
    freeAgents: freeAgentReducer,
    lots: lotReducer,
    owners: ownerReducer,
    profile: loginReducer,
    ui: uiReducer,
    transactions: transactionReducer,
    franchises: franchiseReducer,
    deadCap: deadCapReducer
});

export type RootState = ReturnType<typeof RootReducer>
