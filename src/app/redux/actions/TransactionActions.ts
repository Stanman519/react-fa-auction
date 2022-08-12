import { Transaction } from "../reducers/TransactionReducer";
import { Action } from "@reduxjs/toolkit";
import GeneralApiSvc from "../../services/GeneralApiSvc";
import { RootState } from "../reducers/RootReducer";
import { updateDeadCapInfo } from "./DeadCapActions";

export interface TransactionAction extends Action {
    payload: Transaction[]
}

export function loadTransactions(transactions: Transaction[]){
    return { type: "LOAD_TRANSACTIONS", transactions };
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
