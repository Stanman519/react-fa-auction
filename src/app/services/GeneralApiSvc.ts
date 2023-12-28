import { User } from "@auth0/auth0-react"
import axios, { AxiosResponse } from "axios"
import { PlayerDTO } from "../redux/reducers/FreeAgentReducer"
import Owner, { LeagueInfo } from "../redux/reducers/OwnerReducer"
import { DeadCapInfo, Transaction } from "../redux/reducers/TransactionReducer"
import { URL } from "./AuctionApiSvc"
import { CommunityMatchupStats, ConfidencePlayerResult, MatchupFormResponse, NflMatchup, NflPickSubmissionBody, NflTeam, PickResult, PickSubmission, Prop } from "../models/ConfidenceDTOs"
import { Type } from "typescript"

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

export interface GenericResponse<Type> {
    success: boolean
    data?: Type
}

function extractErrorMsg<Type>(res: AxiosResponse): GenericResponse<string | Type> {
    var errorMsg
    if (res.status > 299){
        if (res.data.friendlyMessage) errorMsg = res.data.friendlyMessage
        else {
            errorMsg = "There was an error with the request."
        }
        return {success: false, data: errorMsg} as GenericResponse<string>
    }
    if (!res.data) return {success: true}
    return {success: true, data: res.data as Type}
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
            return res.data
        }).catch(() => {
            console.log('catch')
            return undefined
        })
}

const getErrorTest = () : Promise<GenericResponse<string | Type>> => {
    return axios.get(`${URL}/confidence/error`, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            return extractErrorMsg<string>(res)
        }).catch((res) => {
            console.log('catch')
            return extractErrorMsg<string>(res.response)
        })
}

const getNflTeams = () : Promise<NflTeam[]> => {
    return axios.get(`${URL}/confidence/nfl-teams`, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            return res.data
        }).catch(() => {
            console.log('catch')
            return undefined
        })
}

const getUnpaidOwners = () : Promise<Owner[]> => {
    return axios.get(`${URL}/confidence/admin/unpaid`, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            return res.data
        }).catch(() => {
            console.log('catch')
            return undefined
        })
}

const getCommunityStats = (year: number, week: number) : Promise<CommunityMatchupStats[]> => {
    return axios.get(`${URL}/confidence/year/${year}/week/${week}/coummunity-stats`, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            return res.data
        }).catch(() => {
            console.log('catch')
            return undefined
        })
}

const setOwnersToPaid = (body: number[]) : Promise<Response> => {
    return axios.post(`${URL}/confidence/admin/mark-paid`, body, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
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
            return res.data
        }).catch((e) => {
            console.log(e)
            return undefined
        })
}
const submitPicks = (picks: NflPickSubmissionBody) : Promise<GenericResponse<string | Type>> => {
    return axios.post(`${URL}/confidence/picks`, picks, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
            return extractErrorMsg<string>(res)
        }).catch((e) => {
            console.log(e)
            return extractErrorMsg<string>(e.response)
        })
}

const submitProp = (props: Prop[]) : Promise<Response> => {
    return axios.post(`${URL}/confidence/admin/new-props`, props, {headers: {
        'Content-Type': 'application/json'
    },})
        .then((res) => {
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
        return res.data
    }).catch((e) => {
        console.log(e)
        return undefined
    })
}

export default {
    synchronizeAuth,
    getCommunityStats,
    getConfidenceResults,
    submitPicks,
    fetchDashboardInitialLoad,
    getErrorTest,
    postFranchiseTagPlayer,
    postBuyoutPlayer,
    postTaxiCut,
    postNewMatchups,
    setOwnersToPaid,
    getMatchups,
    lockAllMatchups,
    getNflTeams,
    getUnpaidOwners,
    setWinningProp,
    submitProp,
    setWinnerForMatchup
}