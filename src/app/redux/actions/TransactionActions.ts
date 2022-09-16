import { Transaction } from "../reducers/TransactionReducer";
import { Action } from "@reduxjs/toolkit";
import GeneralApiSvc from "../../services/GeneralApiSvc";
import { RootState } from "../reducers/RootReducer";
import { updateDeadCapInfo } from "./DeadCapActions";

export interface TransactionAction extends Action {
    payload: Transaction[]
}

export const loadTransactions = (transactions: Transaction[]) : TransactionAction => {
    return { type: "LOAD_TRANSACTIONS", payload: transactions };
}



export const loadDataForHomeBase = () => async ( 
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const transactions = await GeneralApiSvc.fetchTransactionsForLoad()
    const deadCap = await GeneralApiSvc.fetchDeadCapForLoad()
    dispatch(loadTransactions(transactions))
    dispatch(updateDeadCapInfo({deadCap, selectedTeam: undefined}))
    
}
