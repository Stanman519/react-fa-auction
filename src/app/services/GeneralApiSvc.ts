import { User } from "@auth0/auth0-react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { PlayerDTO } from "../redux/reducers/FreeAgentReducer";
import Owner, {
  LeagueInfo,
  PoolUser,
  TagCandidate,
} from "../redux/reducers/OwnerReducer";
import { DeadCapInfo, Transaction } from "../redux/reducers/TransactionReducer";
import { URL } from "./AuctionApiSvc";
import {
  CommunityMatchupStats,
  ConfidencePlayerResult,
  MatchupFormResponse,
  NflMatchup,
  NflPickSubmissionBody,
  NflTeam,
  PickResult,
  PickSubmission,
  Prop,
} from "../models/ConfidenceDTOs";
import { Type } from "typescript";
import {
  FranchiseWinTotal,
  OverUnderLoadResponse,
} from "../redux/reducers/OverUnderReducer";
import { TradeRequest } from "../models/MflModels";

export interface LeagueCapInfo {
  leagueTransactions: Transaction[];
  teamDeadCapData: DeadCapInfo[];
}
export interface Dashboard {
  profile: Owner;
  leagueTransactions: Transaction[];
  teamDeadCaps: DeadCapInfo[];
  leagues: LeagueInfo[];
}
export interface FranchiseTagBody {
  leagueId: number;
  mflPlayerId: number;
  mflFranchiseId: number;
  tagSalary: number;
  leagueOwnerId: number;
}
export interface CutRequestBody {
  leagueId: number;
  player: PlayerDTO;
  mflFranchiseId: number;
  rebate: number;
}

export interface GenericResponse<Type> {
  success: boolean;
  errorMsg?: string;
  data?: Type;
}

export interface OverUnderPick {
  id?: number;
  lineId?: number;
  userId: number;
  isOver?: boolean;
  lineAdjustment: number;
}

function determineSuccessOrErrorMsg<Type>(
  res: AxiosResponse | AxiosError,
): GenericResponse<Type> {
  if (axios.isAxiosError(res)) {
    // Handle the case where the response is an AxiosError
    if (res.response) {
      const response = res.response as AxiosResponse;
      const errorMsg =
        response.data?.friendlyMessage ||
        "There was an error with the request.";
      return { success: false, errorMsg: errorMsg };
    } else {
      // AxiosError without a response (network error)
      return {
        success: false,
        errorMsg: "Network error occurred.",
      };
    }
  } else {
    // Handle the case where the response is an AxiosResponse
    return { success: true, data: res.data as Type };
  }
}

const fetchDashboardInitialLoad = (
  cookie: string = "",
  authUser: User,
  leagueId?: number,
): Promise<Dashboard> => {
  return axios
    .post(`${URL}/dashboard/league-home`, authUser, {
      params: { leagueId },
      headers: { "Content-Type": "application/json" },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      return undefined;
    });
};

const getDeadCapAndTransactions = (
  leagueId?: number,
): Promise<LeagueCapInfo> => {
  return axios
    .get(`${URL}/dashboard/leagues/${leagueId}/league-caps`, {
      headers: { "Content-Type": "application/json" },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      return undefined;
    });
};

const synchronizeAuth = (authUser: User): Promise<Owner> => {
  return axios
    .post(`${URL}/dashboard/auth`, authUser, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      return undefined;
    });
};

const getMatchups = (
  year: number,
  auth: string,
): Promise<MatchupFormResponse> => {
  return axios
    .get(`${URL}/confidence/matchups?year=${year}&user=${auth}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};
const getConfidenceResults = (
  year: number,
): Promise<ConfidencePlayerResult[]> => {
  return axios
    .get(`${URL}/confidence/results?year=${year}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      console.log("catch");
      return undefined;
    });
};

const getErrorTest = (): Promise<GenericResponse<string | Type>> => {
  return axios
    .get(`${URL}/confidence/error`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return determineSuccessOrErrorMsg<string>(res);
    })
    .catch((res) => {
      console.log("catch");
      return determineSuccessOrErrorMsg<string>(res.response);
    });
};

const getNflTeams = (): Promise<NflTeam[]> => {
  return axios
    .get(`${URL}/confidence/nfl-teams`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      console.log("catch");
      return undefined;
    });
};

const getUnpaidOwners = (): Promise<Owner[]> => {
  return axios
    .get(`${URL}/confidence/admin/unpaid`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      console.log("catch");
      return undefined;
    });
};

const getCommunityStats = (
  year: number,
  week: number,
): Promise<CommunityMatchupStats[]> => {
  return axios
    .get(`${URL}/confidence/year/${year}/week/${week}/coummunity-stats`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      console.log("catch");
      return undefined;
    });
};
const getFranchiseTagCandidates = (
  leagueId: number,
  leagueOwnerId: number,
  mflFranchiseId: number,
): Promise<TagCandidate[]> => {
  return axios
    .get(
      `${URL}/dashboard/league/${leagueId}/owners/${leagueOwnerId}/mfl/${mflFranchiseId}/tag-candidates`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      console.log("catch");
      return undefined;
    });
};
const getTaxiSquadPlayers = (
  leagueId: number,
  leagueOwnerId: number,
  mflFranchiseId: number,
): Promise<PlayerDTO[]> => {
  return axios
    .get(
      `${URL}/dashboard/league/${leagueId}/owners/${leagueOwnerId}/mfl/${mflFranchiseId}/taxi-squad`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      console.log("catch");
      return undefined;
    });
};

const getBuyoutCandidates = (
  leagueId: number,
  leagueOwnerId: number,
  mflFranchiseId: number,
): Promise<PlayerDTO[]> => {
  return axios
    .get(
      `${URL}/dashboard/league/${leagueId}/owners/${leagueOwnerId}/mfl/${mflFranchiseId}/buyout-candidates`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      console.log("catch");
      return undefined;
    });
};
const getWaiverExtensionCandidates = (
  leagueId: number,
  leagueOwnerId: number,
  mflFranchiseId: number,
): Promise<PlayerDTO[]> => {
  return axios
    .get(
      `${URL}/dashboard/league/${leagueId}/owners/${leagueOwnerId}/mfl/${mflFranchiseId}/waiver-extensions`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      console.log("catch");
      return undefined;
    });
};
const setOwnersToPaid = (body: number[]): Promise<Response> => {
  return axios
    .post(`${URL}/confidence/admin/mark-paid`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      console.log("catch");
      return undefined;
    });
};

const postFranchiseTagPlayer = (body: FranchiseTagBody): Promise<Response> => {
  return axios
    .post(`${URL}/dashboard/tag-player`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      return undefined;
    });
};
const postWaiverExtension = (body: FranchiseTagBody): Promise<Response> => {
  return axios
    .post(`${URL}/dashboard/waiver-extension`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      return undefined;
    });
};

const postBuyoutPlayer = (body: CutRequestBody): Promise<Response> => {
  return axios
    .post(`${URL}/dashboard/buyout`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      return undefined;
    });
};
const postTaxiCut = (body: CutRequestBody): Promise<Response> => {
  return axios
    .post(`${URL}/dashboard/taxi-cut`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      return undefined;
    });
};

const postNewMatchups = (matchups: NflMatchup[]): Promise<Response> => {
  return axios
    .post(`${URL}/confidence/admin/new-matchups`, matchups, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};
const submitPicks = (
  picks: NflPickSubmissionBody,
): Promise<GenericResponse<string | Type>> => {
  return axios
    .post(`${URL}/confidence/picks`, picks, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return determineSuccessOrErrorMsg<string>(res);
    })
    .catch((e) => {
      console.log(e);
      return determineSuccessOrErrorMsg<string>(e.response);
    });
};

const submitProp = (props: Prop[]): Promise<Response> => {
  return axios
    .post(`${URL}/confidence/admin/new-props`, props, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};

const lockAllMatchups = (year?: number): Promise<Response> => {
  return axios
    .post(
      `${URL}/confidence/lock-matchups`,
      {},
      year
        ? {
            params: { year },
          }
        : {},
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};

const setWinnerForMatchup = (
  matchupId: number,
  winningTricode: string,
): Promise<Response> => {
  return axios
    .post(
      `${URL}/confidence/admin/matchups/${matchupId}/results/${winningTricode}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};

const setWinningProp = (
  propId: number,
  winningSide: string,
): Promise<Response> => {
  return axios
    .post(
      `${URL}/confidence/admin/props/${propId}/results/${winningSide}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};

const sendOverUnderPicks = (
  poolId: number,
  picks: OverUnderPick[],
  ownerId: number,
): Promise<GenericResponse<OverUnderPick[] | string>> => {
  return axios
    .post(
      `${URL}/games/pools/${poolId}/owners/${ownerId}/ou-save-picks`,
      picks,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      const parsedResponse = determineSuccessOrErrorMsg<OverUnderPick[]>(res);
      return parsedResponse;
    })
    .catch((e: AxiosError) => {
      return determineSuccessOrErrorMsg<string>(e);
    });
};

const getWinOverUndersForLeagueYear = (
  poolId: number,
  year: number,
  league: string,
  ownerId: number,
): Promise<OverUnderLoadResponse> => {
  return axios
    .get(
      `${URL}/games/pools/${poolId}/year/${year}/leagues/${league}/owners/${ownerId}/team-win-totals`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};

const getAllOverUnderUsersAndPicks = (poolId: number): Promise<PoolUser[]> => {
  return axios
    .get(`${URL}/games/pools/${poolId}/ou-users-picks`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};

const proposeTrade = (tradeReq: TradeRequest): Promise<Response> => {
  return axios
    .post(`${URL}/dashboard/propose-trade`, tradeReq, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      throw e;
    });
};

const acceptTrade = (
  leagueId: number,
  tradeId: number,
  leagueOwnerId: number,
  mflFranchiseId: number,
): Promise<Response> => {
  return axios
    .get(
      `${URL}/dashboard/league/${leagueId}/trades/${tradeId}/${leagueOwnerId}/mfl/${mflFranchiseId}/accept-trade`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};
const rejectTrade = (
  leagueId: number,
  tradeId: number,
  leagueOwnerId: number,
  mflFranchiseId: number,
): Promise<Response> => {
  return axios
    .get(
      `${URL}/dashboard/league/${leagueId}/trades/${tradeId}/${leagueOwnerId}/mfl/${mflFranchiseId}/reject-trade/comments/sent from stanfan`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};
const cancelTrade = (
  leagueId: number,
  tradeId: number,
  leagueOwnerId: number,
  mflFranchiseId: number,
): Promise<Response> => {
  return axios
    .get(
      `${URL}/dashboard/league/${leagueId}/trades/${tradeId}/${leagueOwnerId}/mfl/${mflFranchiseId}/revoke-trade/comments/sent from stanfan`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });
};
// const getAllOverUnderUsers = (poolId: number): Promise<Owner[]> => {
//   return axios
//     .get(`${URL}/games/pools/${poolId}/ou-users`, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//     .then((res) => {
//       return res.data;
//     })
//     .catch((e) => {
//       console.log(e);
//       return undefined;
//     });
// };
export default {
  synchronizeAuth,
  getCommunityStats,
  getConfidenceResults,
  submitPicks,
  fetchDashboardInitialLoad,
  getErrorTest,
  postFranchiseTagPlayer,
  postBuyoutPlayer,
  postWaiverExtension,
  postTaxiCut,
  postNewMatchups,
  setOwnersToPaid,
  getDeadCapAndTransactions,
  getMatchups,
  lockAllMatchups,
  getNflTeams,
  getUnpaidOwners,
  getFranchiseTagCandidates,
  setWinningProp,
  submitProp,
  getTaxiSquadPlayers,
  getWaiverExtensionCandidates,
  getBuyoutCandidates,
  setWinnerForMatchup,
  sendOverUnderPicks,
  getWinOverUndersForLeagueYear,
  getAllOverUnderUsersAndPicks,
  proposeTrade,
  cancelTrade,
  acceptTrade,
  rejectTrade,
};
