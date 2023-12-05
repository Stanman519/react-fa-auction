import { User } from "@auth0/auth0-react"
import axios from "axios"
import { PlayerDTO } from "../redux/reducers/FreeAgentReducer"
import Owner, { LeagueInfo } from "../redux/reducers/OwnerReducer"
import { DeadCapInfo, Transaction } from "../redux/reducers/TransactionReducer"
import { URL } from "./AuctionApiSvc"
import { ConfidencePlayerResult, MatchupFormResponse, NflMatchup, NflPickSubmissionBody, NflTeam, PickResult, PickSubmission, Prop } from "../models/ConfidenceDTOs"

export interface Dashboard {
    profile: Owner
    leagueTransactions: Transaction[]
    teamDeadCaps: DeadCapInfo[]
    leagues: LeagueInfo[]
}
export interface FranchiseTagBody{
    leagueId: number
    mflPlayerId: number
    mflFranchiseId: number
    tagSalary: number
}
export interface CutRequestBody{
    leagueId: number
    player: PlayerDTO
    mflFranchiseId: number
    rebate: number
}


const fetchDashboardInitialLoad = (cookie: string = "", authUser: User, leagueId?: number) : Promise<Dashboard> => {
    return axios.post(`${URL}/dashboard/home`, 
    authUser, {
        params: {leagueId},
        headers: {'Content-Type': 'application/json'}
    })
        .then((res) => {
            return res.data
        }).catch(() => {
            return undefined
        })
}

const synchronizeAuth = (authUser: User) : Promise<Owner> => {
    return axios.post(`${URL}/dashboard/auth`, authUser, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            return res.data
        }).catch(() => {
            return undefined
        })
}

const getMatchups = (year: number, auth: string) : Promise<MatchupFormResponse> => {
    return axios.get(`${URL}/confidence/matchups?year=${year}&user=${auth}`, {headers: {
        'Content-Type': 'application/json',
    },})
        .then((res) => {
            return res.data
        }).catch(e => {
            console.log(e)
            return undefined
        })
}
const getConfidenceResults = (year: number) : Promise<ConfidencePlayerResult[]> => {
    return axios.get(`${URL}/confidence/results?year=${year}`, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            console.log('res.data', res.data)
            return res.data
        }).catch(() => {
            console.log('catch')
            return undefined
        })
}

const getNflTeams = () : Promise<NflTeam[]> => {
    return axios.get(`${URL}/confidence/nfl-teams`, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            console.log('res.data', res.data)
            return res.data
        }).catch(() => {
            console.log('catch')
            return undefined
        })
}


const postFranchiseTagPlayer = (body: FranchiseTagBody) : Promise<Response> => {
    return axios.post(`${URL}/dashboard/tag-player`, body, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            return res.data
        }).catch(() => {
            return undefined
        })
}
const postBuyoutPlayer = (body: CutRequestBody) : Promise<Response> => {
    return axios.post(`${URL}/dashboard/buyout`, body, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            return res.data
        }).catch(() => {
            return undefined
        })
}
const postTaxiCut = (body: CutRequestBody) : Promise<Response> => {
    return axios.post(`${URL}/dashboard/taxi-cut`, body, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            return res.data
        }).catch(() => {
            return undefined
        })
}

const postNewMatchups = (matchups: NflMatchup[]) : Promise<Response> => {
    return axios.post(`${URL}/confidence/admin/new-matchups`, matchups, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            console.log(res)
            return res.data
        }).catch((e) => {
            console.log(e)
            return undefined
        })
}
const submitPicks = (picks: NflPickSubmissionBody) : Promise<Response> => {
    return axios.post(`${URL}/confidence/picks`, picks, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            console.log(res)
            return res.data
        }).catch((e) => {
            console.log(e)
            return undefined
        })
}

const submitProp = (props: Prop[]) : Promise<Response> => {
    return axios.post(`${URL}/confidence/admin/new-props`, props, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            console.log(res)
            return res.data
        }).catch((e) => {
            console.log(e)
            return undefined
        })
}

const lockAllMatchups = (year?: number): Promise<Response> => {
    return axios.post(`${URL}/confidence/lock-matchups`, {}, year ? {
        params: {year}
    } : {})
    .then((res) => {
        console.log(res)
        return res.data
    }).catch((e) => {
        console.log(e)
        return undefined
    })
}

const setWinnerForMatchup = (matchupId: number, winningTricode: string): Promise<Response> => {
    return axios.post(`${URL}/confidence/admin/matchups/${matchupId}/results/${winningTricode}`, {}, {headers: {
        'Content-Type': 'application/json'
    }})
    .then((res) => {
        console.log(res)
        return res.data
    }).catch((e) => {
        console.log(e)
        return undefined
    })
}

const setWinningProp = (propId: number, winningSide: string): Promise<Response> => {
    return axios.post(`${URL}/confidence/admin/props/${propId}/results/${winningSide}`, {}, {headers: {
        'Content-Type': 'application/json'
    }})
    .then((res) => {
        console.log(res)
        return res.data
    }).catch((e) => {
        console.log(e)
        return undefined
    })
}

export default {
    synchronizeAuth,
    getConfidenceResults,
    submitPicks,
    fetchDashboardInitialLoad,
    postFranchiseTagPlayer,
    postBuyoutPlayer,
    postTaxiCut,
    postNewMatchups,
    getMatchups,
    lockAllMatchups,
    getNflTeams,
    setWinningProp,
    submitProp,
    setWinnerForMatchup
}