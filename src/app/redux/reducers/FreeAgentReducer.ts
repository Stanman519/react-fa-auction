import { FreeAgentAction, UPDATE_FREE_AGENTS } from "../actions/FreeAgentActions";

export interface FreeAgent{
    firstName: string
    lastName: string
    fullName: string
    position: string
    team: string
    age?: number
    height?: number
    weight?: number
    headshot?: string
    actionShot?: string
    mflId: string
}

export interface PlayerBio{
    firstName: string
    lastName: string
    mflId: string
    team: string
    position: string
    age: number
    height: number
    weight: number
    college: string
    draftYear: string
    draftRound: string
    draftPick: string
    actionShot: string
    lastSeasonSalary: number
    prevOwner: string
    positionRanks: BioPositionRank[]
}

export interface BioPositionRank{
    year: number
    points: number
    rank: number
}

export const freeAgentReducer = (state = [] as FreeAgent[], action: FreeAgentAction): FreeAgent[] => {
    switch (action.type) {
        case UPDATE_FREE_AGENTS:
            return action.payload;
        default:
            return state;
    }
}