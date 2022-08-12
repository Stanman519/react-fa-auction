import axios from "axios"
import { DeadCapInfo, Transaction } from "../redux/reducers/TransactionReducer"



const URL = `https://mfl-capn.herokuapp.com/Mfl`



const fetchDeadCapForLoad = () : Promise<DeadCapInfo[]> => {
    return axios.get(`${URL}/deadCapInfo`)
        .then((res) => {
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
    fetchTransactionsForLoad
}