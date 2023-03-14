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

export interface Standings {
    franchiseId: number;
    pointsFor1: number;
    h2hWins1: number;
    h2hLosses1: number;
    victoryPoints1: number;
    allPlayWins1: number;
    allPlayLosses1: number;
    allPlayTies1: number;
    pointsFor2: number;
    h2hWins2: number;
    h2hLosses2: number;
    victoryPoints2: number;
    allPlayWins2: number;
    allPlayLosses2: number;
    allPlayTies2: number;
    pointsFor3: number;
    h2hWins3: number;
    h2hLosses3: number;
    victoryPoints3: number;
    allPlayWins3: number;
    allPlayLosses3: number;
    allPlayTies3: number;
}

export interface DeadCapInfo {
    franchiseId: number
    amount: Record<string, number>
    team: string
    startingYear: number
}

const defaultState = [] as Transaction[]

export default function transactionReducer(state: Transaction[] = defaultState, action: TransactionAction){
    if (action.type === 'LOAD_TRANSACTIONS'){
        return action.payload;
    }
    return state
}