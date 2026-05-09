import { User } from "@auth0/auth0-react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { axiosInstance } from "./axiosInstance";
import { HoldoutDTO, PlayerDTO } from "../redux/reducers/FreeAgentReducer";
import Owner, {
  FifthYearOptionCandidate,
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

/**
 * Helper function to safely encode Auth0 user sub for URL parameters
 * @param userSub - Auth0 sub (e.g., "auth0|507f1f77bcf86cd799439011")
 * @returns URL-encoded user sub
 */
const encodeUserSub = (userSub: string): string => {
  return encodeURIComponent(userSub);
};

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
export interface FifthYearOptionBody {
  leagueId: number;
  mflPlayerId: number;
  mflFranchiseId: number;
  leagueOwnerId: number;
}
export interface CutRequestBody {
  leagueId: number;
  player: PlayerDTO;
  mflFranchiseId: number;
  rebate: number;
}
export interface HoldoutRequestBody {
  holdoutId: number;
  status: string;
  leagueId: number;
  mflPlayerId: number;
  mflFranchiseId: number;
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

      // Handle authentication/authorization errors
      if (response.status === 401) {
        return {
          success: false,
          errorMsg: "Please log in to perform this action.",
        };
      }
      if (response.status === 403) {
        return {
          success: false,
          errorMsg: "You are not authorized to perform this action.",
        };
      }

      const errorMsg =
        response.data?.friendlyMessage ||
        response.data?.Message ||
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
  return axiosInstance
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
  return axiosInstance
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

export interface RecentMove {
  timestamp: string;
  franchiseId: number;
  action: "ADD" | "DROP";
  mflPlayerId: number;
  playerName: string;
  position: string;
  team: string;
  salary?: number;
  years?: number;
}

const getRecentMoves = (leagueId?: number): Promise<RecentMove[]> => {
  return axiosInstance
    .get(`${URL}/dashboard/leagues/${leagueId}/recent-moves`, {
      headers: { "Content-Type": "application/json" },
    })
    .then((res) => res.data)
    .catch(() => [] as RecentMove[]);
};

const synchronizeAuth = (authUser: User): Promise<Owner> => {
  return axiosInstance
    .post(`${URL}/dashboard/auth`, authUser, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

const getMatchups = (
  year: number,
  auth: string,
): Promise<MatchupFormResponse> => {
  return axiosInstance
    .get(`${URL}/confidence/matchups?year=${year}&user=${auth}`, {
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
const getConfidenceResults = (
  year: number,
): Promise<ConfidencePlayerResult[]> => {
  return axiosInstance
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
  return axiosInstance
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
  return axiosInstance
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
  return axiosInstance
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
  return axiosInstance
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
  return axiosInstance
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
const getFifthYearOptionCandidates = (
  leagueId: number,
  leagueOwnerId: number,
  mflFranchiseId: number,
): Promise<FifthYearOptionCandidate[]> => {
  return axiosInstance
    .get(
      `${URL}/dashboard/league/${leagueId}/owners/${leagueOwnerId}/mfl/${mflFranchiseId}/fifth-year-option-candidates`,
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
  return axiosInstance
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
  return axiosInstance
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
  return axiosInstance
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
const getHoldoutCandidates = (
  leagueId: number,
  leagueOwnerId: number,
): Promise<HoldoutDTO[]> => {
  return axiosInstance
    .get(
      `${URL}/dashboard/league/${leagueId}/owners/${leagueOwnerId}/holdouts`,
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
const setOwnersToPaid = (
  body: number[],
  userSub: string,
): Promise<Response> => {
  return axiosInstance
    .post(
      `${URL}/confidence/admin/mark-paid?user=${encodeUserSub(userSub)}`,
      body,
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

const postFranchiseTagPlayer = (body: FranchiseTagBody): Promise<Response> => {
  return axiosInstance
    .post(`${URL}/dashboard/tag-player`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    });
};
const postFifthYearOption = (body: FifthYearOptionBody): Promise<Response> => {
  return axiosInstance
    .post(`${URL}/dashboard/fifth-year-option`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    });
};
const postWaiverExtension = (body: FranchiseTagBody): Promise<Response> => {
  return axiosInstance
    .post(`${URL}/dashboard/waiver-extension`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    });
};

const postBuyoutPlayer = (body: CutRequestBody): Promise<Response> => {
  return axiosInstance
    .post(`${URL}/dashboard/buyout`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    });
};
const postHoldoutPlayer = (body: HoldoutRequestBody): Promise<Response> => {
  return axiosInstance
    .post(`${URL}/dashboard/holdout-response`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    });
};
const postTaxiCut = (body: CutRequestBody): Promise<Response> => {
  return axiosInstance
    .post(`${URL}/dashboard/taxi-cut`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data;
    });
};

const postNewMatchups = (
  matchups: NflMatchup[],
  userSub: string,
): Promise<Response> => {
  return axiosInstance
    .post(
      `${URL}/confidence/admin/new-matchups?user=${encodeUserSub(userSub)}`,
      matchups,
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
      throw e;
    });
};
const submitPicks = (
  picks: NflPickSubmissionBody,
  userSub: string,
): Promise<GenericResponse<string | Type>> => {
  return axiosInstance
    .post(`${URL}/confidence/picks?user=${encodeUserSub(userSub)}`, picks, {
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

const submitProp = (props: Prop[], userSub: string): Promise<Response> => {
  return axiosInstance
    .post(
      `${URL}/confidence/admin/new-props?user=${encodeUserSub(userSub)}`,
      props,
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
      throw e;
    });
};

const lockAllMatchups = (userSub: string, year?: number): Promise<Response> => {
  return axiosInstance
    .post(
      `${URL}/confidence/lock-matchups${year ? `?year=${year}&` : "?"}user=${encodeUserSub(userSub)}`,
      {},
    )
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      throw e;
    });
};

const setWinnerForMatchup = (
  matchupId: number,
  winningTricode: string,
  userSub: string,
): Promise<Response> => {
  return axiosInstance
    .post(
      `${URL}/confidence/admin/matchups/${matchupId}/results/${winningTricode}?user=${encodeUserSub(userSub)}`,
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
      throw e;
    });
};

const setWinningProp = (
  propId: number,
  winningSide: string,
  userSub: string,
): Promise<Response> => {
  return axiosInstance
    .post(
      `${URL}/confidence/admin/props/${propId}/results/${winningSide}?user=${encodeUserSub(userSub)}`,
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
      throw e;
    });
};

const sendOverUnderPicks = (
  poolId: number,
  picks: OverUnderPick[],
  ownerId: number,
): Promise<GenericResponse<OverUnderPick[] | string>> => {
  return axiosInstance
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
  return axiosInstance
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
      throw e;
    });
};

const getAllOverUnderUsersAndPicks = (poolId: number): Promise<PoolUser[]> => {
  return axiosInstance
    .get(`${URL}/games/pools/${poolId}/ou-users-picks`, {
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

const proposeTrade = (tradeReq: TradeRequest): Promise<Response> => {
  return axiosInstance
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
  return axiosInstance
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
      throw e;
    });
};
const rejectTrade = (
  leagueId: number,
  tradeId: number,
  leagueOwnerId: number,
  mflFranchiseId: number,
): Promise<Response> => {
  return axiosInstance
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
      throw e;
    });
};
const cancelTrade = (
  leagueId: number,
  tradeId: number,
  leagueOwnerId: number,
  mflFranchiseId: number,
): Promise<Response> => {
  return axiosInstance
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
      throw e;
    });
};
const setCurrentMatchup = (
  matchupId: number,
  userSub: string,
): Promise<Response> => {
  return axiosInstance
    .post(
      `${URL}/confidence/admin/matchups/${matchupId}/set-current?user=${encodeUserSub(userSub)}`,
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
      throw e;
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
const generateFranchiseTagValues = (leagueId: number, year: number) =>
  axiosInstance.post(
    `${URL}/dashboard/admin/leagues/${leagueId}/years/${year}/generate-franchise-tag-values`
  ).then((res) => res.data);

const trueUpSalaryCaps = (leagueId: number) =>
  axiosInstance.post(
    `${URL}/dashboard/admin/leagues/${leagueId}/true-up-salary-caps`
  ).then((res) => res.data);

export default {
  synchronizeAuth,
  getCommunityStats,
  getConfidenceResults,
  submitPicks,
  fetchDashboardInitialLoad,
  getErrorTest,
  postFranchiseTagPlayer,
  postBuyoutPlayer,
  postHoldoutPlayer,
  postWaiverExtension,
  postTaxiCut,
  postNewMatchups,
  setCurrentMatchup,
  setOwnersToPaid,
  getDeadCapAndTransactions,
  getRecentMoves,
  getMatchups,
  lockAllMatchups,
  getNflTeams,
  getUnpaidOwners,
  getFranchiseTagCandidates,
  getFifthYearOptionCandidates,
  postFifthYearOption,
  setWinningProp,
  submitProp,
  getTaxiSquadPlayers,
  getWaiverExtensionCandidates,
  getBuyoutCandidates,
  setWinnerForMatchup,
  sendOverUnderPicks,
  getWinOverUndersForLeagueYear,
  getAllOverUnderUsersAndPicks,
  getHoldoutCandidates,
  proposeTrade,
  cancelTrade,
  acceptTrade,
  rejectTrade,
  generateFranchiseTagValues,
  trueUpSalaryCaps,
};
