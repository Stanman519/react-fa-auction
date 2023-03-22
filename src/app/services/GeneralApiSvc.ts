import { User } from "@auth0/auth0-react"
import axios from "axios"
import { PlayerDTO } from "../redux/reducers/FreeAgentReducer"
import Owner, { LeagueInfo } from "../redux/reducers/OwnerReducer"
import { DeadCapInfo, Transaction } from "../redux/reducers/TransactionReducer"
import { URL } from "./AuctionApiSvc"

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


const fetchDashboardInitialLoad = (cookie: string = "", authUser: User) : Promise<Dashboard> => {
    return axios.post(`${URL}/dashboard/home`, authUser, {headers: {
        'content-type': 'application/json'
    },})
        .then((res) => {
            console.log('res.data', res.data)
            return res.data
        }).catch(() => {
            return undefined
        })
}

const postFranchiseTagPlayer = (body: FranchiseTagBody) : Promise<Response> => {
    return axios.post(`${URL}/dashboard/tag-player`, body, {headers: {
        'content-type': 'application/json'
    },})
        .then((res) => {
            console.log('res.data', res.data)
            return res.data
        }).catch(() => {
            return undefined
        })
}
const postBuyoutPlayer = (body: CutRequestBody) : Promise<Response> => {
    return axios.post(`${URL}/dashboard/buyout`, body, {headers: {
        'content-type': 'application/json'
    },})
        .then((res) => {
            console.log('res.data', res.data)
            return res.data
        }).catch(() => {
            return undefined
        })
}
const postTaxiCut = (body: CutRequestBody) : Promise<Response> => {
    return axios.post(`${URL}/dashboard/taxi-cut`, body, {headers: {
        'content-type': 'application/json'
    },})
        .then((res) => {
            console.log('res.data', res.data)
            return res.data
        }).catch(() => {
            return undefined
        })
}




export default {
    fetchDashboardInitialLoad,
    postFranchiseTagPlayer,
    postBuyoutPlayer,
    postTaxiCut
}