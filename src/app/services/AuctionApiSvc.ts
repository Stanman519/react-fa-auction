import axios from "axios"
import { FreeAgent, PlayerBio } from "../redux/reducers/FreeAgentReducer";
import { Lot } from "../redux/reducers/LotReducer";
import Owner from "../redux/reducers/OwnerReducer";

const URL = process.env.REACT_APP_AUCTION_API_URL;
const env = process.env.NODE_ENV;

interface PageLoad {
    freeAgents: FreeAgent[],
    owners: Owner[],
    lots: Lot[]
}

const getInitialFreeAgents = async (): Promise<FreeAgent[]> => {

    const res = await axios.get(`${URL}/FreeAgency/players/nominate`);
    return res.data;
}

const loadLots = async (): Promise<Lot[]> => {
    const res = await axios.get(`${URL}/FreeAgency/lots`);

    return res.data;
}

const loadOwners = async (): Promise<Owner[]> => {
    const res = await axios.get(`${URL}/FreeAgency/owners`);

    return res.data;
}

const getFullPlayerBio = async (lastYear: number, id: string, position: string, firstName: string, lastName: string): Promise<PlayerBio> => {
    const res = await axios.get(`${URL}/FreeAgency/year/${lastYear}/playerId/${id}/position/${position}/firstName/${firstName}/lastName/${lastName}`)
    console.log('res', res.data);
    return res.data;
}

const pageLoad = async (): Promise<PageLoad> => {
    console.log('env url', URL)
    console.log('env', env)
    const res = await axios.get(`${URL}/FreeAgency/page-load`);
    return res.data
}

export default {
    getInitialFreeAgents,
    loadLots,
    loadOwners,
    pageLoad,
    getFullPlayerBio
}