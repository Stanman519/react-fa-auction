import axios from "axios";
import { FreeAgent } from "../redux/reducers/FreeAgentReducer";
import { Bid, Lot } from "../redux/reducers/LotReducer";
import Owner from "../redux/reducers/OwnerReducer";

const URL = process.env.REACT_APP_AUCTION_API_URL;
const env = process.env.NODE_ENV;

export interface PageLoad {
    freeAgents: FreeAgent[],
    owners: Owner[],
    lots: Lot[],
    profile?: Owner
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

const pageLoad = async (cookie: string = ""): Promise<PageLoad> => {
    const rest = await axios.get(`${URL}/FreeAgency/page-load`, 
    {
        params: { loginInfo: cookie }
    }).catch(error => {
        throw new Error(error.response.data.friendlyMessage)
    });
    return rest.data;
}

async function handleErrorResponse<Type>(response: Response): Promise<Type | void> {
    const failureCodes = [400, 500]
    if (failureCodes.includes(response.status) && response.body) {
        const error = await response.json() as ErrorResponse
        throw new Error(error.friendlyMessage);
    }
    if (response.status === 204) return Promise.resolve();
    if (response.status !== 200 && response.statusText !== 'OK') throw new Error('Service unreachable.');
    return response.json();
}

const sendWin = async (bid: Bid): Promise<Response> => {
    const json = JSON.stringify(bid)
    const res = await fetch(`${URL}/FreeAgency/win`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: json
        })
    return res;
}


export default {
    pageLoad,
    getFullPlayerBio,
    login,
    getBidHistoryByPlayerId,
    register,
    handleErrorResponse,
    makeNewBid,
    makeNewNom,
    sendWin
}