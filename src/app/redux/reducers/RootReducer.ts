import { combineReducers } from '@reduxjs/toolkit';
import { deadCapReducer } from './DeadCapReducer';
import { franchiseReducer } from './FranchiseReducer';
import { freeAgentReducer } from './FreeAgentReducer';
import { loginReducer } from './LoginReducer';
import { lotReducer } from './LotReducer';
import { ownerReducer } from './OwnerReducer';
import transactionReducer from './TransactionReducer';
import uiReducer from './UiReducer';
import { confidenceReducer } from './ConfidenceReducer';
import { overUnderReducer } from './OverUnderReducer';
import { signalRReducer } from './SignalRReducer';
import { activityReducer } from './ActivityReducer';
import { headlinesReducer } from './HeadlinesReducer';
import { quotesReducer } from './QuotesReducer';
import { notificationsReducer } from './NotificationsReducer';
import { rosterReducer } from './RosterReducer';


export const RootReducer = combineReducers({
    freeAgents: freeAgentReducer,
    lots: lotReducer,
    owners: ownerReducer,
    profile: loginReducer,
    ui: uiReducer,
    transactions: transactionReducer,
    franchises: franchiseReducer,
    deadCap: deadCapReducer,
    confidence: confidenceReducer,
    overUnders: overUnderReducer,
    signalR: signalRReducer,
    activity: activityReducer,
    headlines: headlinesReducer,
    quotes: quotesReducer,
    notifications: notificationsReducer,
    rosters: rosterReducer,
});

export type RootState = ReturnType<typeof RootReducer>
