import { PlayerTipResponse } from "../../services/AuctionApiSvc";
import { OwnerAction, UPDATE_OWNERS } from "../actions/OwnerActions";
import { FreeAgent } from "./FreeAgentReducer";


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
    taxiPlayers: FreeAgent[]
    cutCandidates: FreeAgent[]
}

export interface LeagueInfo {
    leagueId: number
    name: string
}

export interface TagCandidate{
    lastSeasonSalary: number
    player: FreeAgent
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