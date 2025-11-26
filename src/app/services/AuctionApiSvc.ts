import axios from "axios";
import { PlayerDTO } from "../redux/reducers/FreeAgentReducer";
import { Bid, Lot } from "../redux/reducers/LotReducer";
import Owner, {
  LeagueInfo,
  LeagueLoginInfo,
  OpposingFranchiseDTO,
} from "../redux/reducers/OwnerReducer";
import { ConfidenceHomeResponse } from "../models/ConfidenceDTOs";

export const URL = process.env.REACT_APP_AUCTION_API_URL;
//const env = process.env.NODE_ENV;

export interface PageLoad {
  freeAgents: PlayerDTO[];
  owners: OpposingFranchiseDTO[];
  lots: Lot[];
  profile?: Owner;
}
export interface ErrorResponse {
  friendlyMessage: string;
}
export interface PlayerTipRequest {
  mflId: string;
  ownerId: number;
  position: string;
  age: number;
}
export interface PlayerTipResponse {
  mflId: string;
  ownerId: number;
  suggestion: number;
  yearMin: number;
  yearMax: number;
}
export interface RosterOwner extends OpposingFranchiseDTO {
  players: PlayerDTO[];
}

const makeNewBid = async (bid: Bid): Promise<Response> => {
  return await fetch(`${URL}/free-agency/bid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bid),
  });
};

const makeNewNom = async (bid: Bid): Promise<Response> => {
  return await fetch(`${URL}/free-agency/nominate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bid),
  });
};

const getBundledConfidenceLoadData = async (
  year: number,
): Promise<Response> => {
  return await fetch(
    `${process.env.REACT_APP_AUCTION_API_URL}/confidence/home?year=${year}`,
  );
};

const getRosters = async (leagueId: number): Promise<RosterOwner[]> => {
  const rest = await axios
    .get(
      `${process.env.REACT_APP_AUCTION_API_URL}/free-agency/leagues/${leagueId}/rosters`,
      {},
    )
    .catch((error) => {
      throw new Error(error.response.data.friendlyMessage);
    });
  return rest.data;
};

const getFullPlayerBio = async (
  lastYear: number,
  id: number,
  position: string,
  firstName: string,
  lastName: string,
  actionShot: boolean,
  leagueId: number = 13894,
): Promise<Response> => {
  return await fetch(
    `${URL}/free-agency/leagues/${leagueId}/year/${lastYear}/playerId/${id}/position/${position}/firstName/${firstName}/lastName/${lastName}?hasAction=${actionShot}`,
  );
};

const getBidHistoryByPlayerId = async (
  leagueId: number,
  mflId: number,
): Promise<Response> => {
  return await fetch(
    `${URL}/free-agency/leagues/${leagueId}/players/${mflId}/bid-history`,
  );
};

const login = async (ownername: string, password: string): Promise<Owner> => {
  const res = await axios
    .post(`${URL}/free-agency/login`, {
      ownername: ownername,
      password: password,
    })
    .catch((error) => {
      throw new Error(error.response.data.friendlyMessage);
    });
  return res.data;
};

const register = async (
  name: string,
  username: string,
  password: string,
): Promise<Response> => {
  const res = await fetch(`${URL}/free-agency/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: name,
      ownername: username,
      password: password,
      tipsUsed: [],
    }),
  });
  return res;
};

const pageLoad = async (
  cookie: string = "",
  leagueId: number = 0,
): Promise<PageLoad> => {
  const rest = await axios
    .get(`${URL}/free-agency/leagues/${leagueId}/page-load`, {
      params: { loginInfo: cookie },
    })
    .catch((error) => {
      throw new Error(error.response.data.friendlyMessage);
    });
  console.log("page load league", leagueId);
  return rest.data;
};

async function handleErrorResponse<Type>(
  response: Response,
): Promise<Type | void> {
  const failureCodes = [400, 500];
  if (failureCodes.includes(response.status) && response.body) {
    const error = (await response.json()) as ErrorResponse;
    throw new Error(error.friendlyMessage);
  }
  if (response.status === 204) return Promise.resolve();
  if (response.status !== 200 && response.statusText !== "OK")
    throw new Error("Service unreachable.");
  try {
    return await response.json();
  } catch (e) {
    if (e instanceof SyntaxError) {
      // Handle cases where there is no JSON response
      return Promise.resolve();
    } else {
      throw e;
    }
  }
}

const sendWin = async (bid: Bid): Promise<Response> => {
  const json = JSON.stringify(bid);
  const res = await fetch(`${URL}/free-agency/win`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: json,
  });
  return res;
};

const askCapn = async (
  PlayerTipRequest: PlayerTipRequest,
): Promise<Response> => {
  const json = JSON.stringify(PlayerTipRequest);
  const res = await fetch(`${URL}/free-agency/tip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
  });
  return res;
};
const getLots = async (leagueId: number = 0): Promise<Lot[]> => {
  const rest = await axios
    .get(`${URL}/free-agency/leagues/${leagueId}/lots`, {})
    .catch((error) => {
      throw new Error(error.response.data.friendlyMessage);
    });
  return rest.data;
};

export default {
  getLots,
  pageLoad,
  getFullPlayerBio,
  login,
  getBidHistoryByPlayerId,
  register,
  handleErrorResponse,
  makeNewBid,
  makeNewNom,
  getRosters,
  sendWin,
  askCapn,
  getBundledConfidenceLoadData,
};
