
import axios from "axios";
import { FreeAgent } from "../redux/reducers/FreeAgentReducer";
import { Bid, Lot } from "../redux/reducers/LotReducer";
import Owner from "../redux/reducers/OwnerReducer";

const URL = process.env.REACT_APP_AUCTION_API_URL;
const env = process.env.NODE_ENV;

export interface PageLoad {
    freeAgents: FreeAgent[],
    owners: Owner[],
    lots: Lot[]
}
export interface ErrorResponse {
    friendlyMessage: string
}

// const getInitialFreeAgents = async (): Promise<Response> => {
//     return await fetch(`${URL}/FreeAgency/players/nominate`);
// }

// const loadLots = async (): Promise<Response> => {
//     return await fetch(`${URL}/FreeAgency/lots`);
// }

// const loadOwners = async (): Promise<Response> => {
//     return await fetch(`${URL}/FreeAgency/owners`);
// }

const makeNewBid = async (bid: Bid): Promise<Response> => {
    const body = JSON.stringify({
        bidLength: bid.bidLength,
        bidSalary: bid.bidSalary,
        ownername: bid.ownername,
        ownerId: bid.ownerId,
        lotId: bid.lotId,
        player: {
            mflId: bid.player.mflId,
            firstName: bid.player.firstName,
            lastName: bid.player.lastName,
        }
    }  as Bid)
    console.log('body', body)
    return await fetch(`${URL}/FreeAgency/bid`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({
                bidLength: bid.bidLength,
                bidSalary: bid.bidSalary,
                ownername: bid.ownername,
                ownerId: bid.ownerId,
                lotId: bid.lotId,
                player: {
                    mflId: bid.player.mflId,
                    firstName: bid.player.firstName,
                    lastName: bid.player.lastName,
                }
            })
    })
}

const makeNewNom = async (bid: Bid): Promise<Response> => {
    return await fetch(`${URL}/FreeAgency/nominate`, {
        method: 'POST',
        body: JSON.stringify({
            
                bidLength: bid.bidLength,
                bidSalary: bid.bidSalary,
                ownername: bid.ownername,
                ownerId: bid.ownerId,
                expires: bid.expires,
                lotId: bid.lotId,
                player: {
                    mflId: bid.player.mflId,
                    firstName: bid.player.firstName,
                    lastName: bid.player.lastName,
                }
            }  as Bid)
    })
}

const getFullPlayerBio = async (lastYear: number, id: string, position: string, firstName: string, lastName: string): Promise<Response> => {
    return await fetch(`${URL}/FreeAgency/year/${lastYear}/playerId/${id}/position/${position}/firstName/${firstName}/lastName/${lastName}`)
}

const getBidHistoryByPlayerId = async (mflId: string): Promise<Response> => {
    return await fetch(`${URL}/FreeAgency/players/${mflId}/bid-history`)
}

const login = async (ownername: string, password: string): Promise<Owner> => {
    const res = await axios.post(`${URL}/FreeAgency/login`, 
            {
                ownername: ownername,
                password: password
            }).catch(error => {
                console.log(error.response)
                throw new Error(error.response.data.friendlyMessage)
            })
    return res.data;
}

const register = async (name: string, username: string, password: string): Promise<Response> => {
    const res = await fetch(`${URL}/FreeAgency/register`, {
        method: 'POST',
        body: JSON.stringify({
            email: name,
            ownername: username,
            password: password
        }) 
    })
    return res;
}

const pageLoad = async (): Promise<Response> => {
    console.log('env url', URL)
    console.log('env', env)
    return await fetch(`${URL}/FreeAgency/page-load`);
}

async function handleErrorResponse<Type>(response: Response): Promise<Type | void> {
    
    console.log('response ok', response)
    const failureCodes = [400, 500]
    if (failureCodes.includes(response.status)) {
        const error = await response.json() as ErrorResponse
        throw new Error(error.friendlyMessage);
    }
    if (response.status == 204) return Promise.resolve();
    if (response.status != 200 && response.statusText != 'OK') throw new Error('Service unreachable.');
    return response.json();
}

export default {
    // getInitialFreeAgents,
    // loadLots,
    // loadOwners,
    pageLoad,
    getFullPlayerBio,
    login,
    getBidHistoryByPlayerId,
    register,
    handleErrorResponse,
    makeNewBid,
    makeNewNom
}