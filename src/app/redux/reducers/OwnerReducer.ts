import { OwnerAction, UPDATE_OWNERS } from "../actions/OwnerActions";
import { PlayerDTO } from "./FreeAgentReducer";


export default interface Owner {
    ownerId: number
    ownername: string
    password: string
    premium: boolean
    displayName: string
    streamToken: string
    leagues: LeagueLoginInfo[]
    avatar: string
    //tipsUsed: PlayerTipResponse[]
}

export interface LeagueLoginInfo {
    capRoom: number
    yearsLeft: number
    mflfranchiseid: number
    leagueownerid: number
    teamName: string
    league: LeagueInfo
    tagCandidates: TagCandidate[]
    taxiPlayers: PlayerDTO[]
    cutCandidates: PlayerDTO[]
}

export interface LeagueInfo {
    leagueId: number
    name: string
}

export interface TagCandidate{
    lastSeasonSalary: number
    player: PlayerDTO
    tagAmount: number
}


const defaultState = [] as Owner[]


export const ownerReducer = (state = defaultState, action: OwnerAction): Owner[] => {
    switch (action.type) {
        case UPDATE_OWNERS:
            return action.payload;
        default:
            return state;
    }
}