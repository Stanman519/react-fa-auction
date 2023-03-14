import { User } from "@auth0/auth0-react"
import axios from "axios"
import Owner, { LeagueInfo } from "../redux/reducers/OwnerReducer"
import { DeadCapInfo, Transaction } from "../redux/reducers/TransactionReducer"
import { URL } from "./AuctionApiSvc"

export interface Dashboard {
    profile: Owner
    leagueTransactions: Transaction[]
    teamDeadCaps: DeadCapInfo[]
    leagues: LeagueInfo[]
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


const fetchDeadCapForLoad = () : Promise<DeadCapInfo[]> => {
    return axios.get(`${URL}/deadCapInfo`)
        .then((res) => {
            //console.log('res.data', res.data)
            return res.data
        }).catch(() => {
            return []
        })
}

const fetchTransactionsForLoad = () : Promise<Transaction[]> => {
    return axios.get(`${URL}/allTransactions`)
        .then((res) => {
            return res.data
        }).catch(() => {
            return []
        })

}


export default {
    fetchDeadCapForLoad,
    fetchTransactionsForLoad,
    fetchDashboardInitialLoad
}