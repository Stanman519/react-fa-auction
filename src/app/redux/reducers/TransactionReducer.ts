import { TransactionAction } from "../actions/TransactionActions"


export interface Transaction {
    timestamp: Date
    transactionId: string
    franchiseId: number
    salary: number
    amount: number
    playerName: string
    position: string
    team: string
    years: number
    yearOfTransaction: number
}

export interface DeadCapInfo {
    franchiseId: number
    amount: Map<string, number>
    team: string
}

const defaultState = [] as Transaction[]

export default function transactionReducer(state: Transaction[] = defaultState, action: TransactionAction){
    if (action.type === 'LOAD_TRANSACTIONS'){
        return action.payload;
    }
    return state
}