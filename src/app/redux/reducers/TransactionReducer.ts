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

export interface FranchiseStandings {
    franchiseId: number;
    teamStandings: SeasonFranchiseStanding[];

}
export interface SeasonFranchiseStanding{
    year: number;
    franchiseId: number
    pointsFor: number;
    h2hWins: number;
    h2hLosses: number;
    victoryPoints: number;
}


export interface DeadCapInfo {
    franchiseId: number
    amount: Record<string, number>
    team: string
    startingYear: number
    capRoom: number
}

const defaultState = [] as Transaction[]

export default function transactionReducer(state: Transaction[] = defaultState, action: TransactionAction){
    if (action.type === 'LOAD_TRANSACTIONS'){
        return action.payload;
    }
    return state
}