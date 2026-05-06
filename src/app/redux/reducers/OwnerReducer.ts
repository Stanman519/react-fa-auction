import { OverUnderPick } from "../../services/GeneralApiSvc";
import { OwnerAction, UPDATE_OWNERS } from "../actions/OwnerActions";
import { HoldoutDTO, PlayerDTO } from "./FreeAgentReducer";

export default interface Owner {
  ownerId: number;
  ownername: string;
  password: string;
  premium: boolean;
  displayName: string;
  streamToken: string;
  leagues: LeagueLoginInfo[];
  pools: Pool[];
  avatar: string;
  confidencePaid: boolean;
  //tipsUsed: PlayerTipResponse[]
}
export interface PoolUser {
  id: number;
  owner: Owner;
  isPaid: boolean;
  picks: OverUnderPick[];
  score?: number;
}
export interface Pool {
  id: number;
  type: string;
  league: string;
  year: number;
  openDate: Date;
  startDate: Date;
  name: string;
  poolOwnerId: number;
  myOverUnderPicks: OverUnderPick[];
}
export interface OpposingFranchiseDTO {
  capRoom: number;
  yearsLeft: number;
  mflfranchiseid: number;
  leagueownerid: number;
  teamName: string;
  ownerName: string;
  avatar: string;
}

export interface LeagueLoginInfo {
  capRoom: number;
  yearsLeft: number;
  mflfranchiseid: number;
  leagueownerid: number;
  teamName: string;
  league: LeagueInfo;
  tagCandidates: TagCandidate[];
  taxiPlayers: PlayerDTO[];
  cutCandidates: PlayerDTO[];
  holdoutCandidates: HoldoutDTO[];
  waiverExtensionPlayers: PlayerDTO[];
  fifthYearOptionCandidates?: FifthYearOptionCandidate[];
  redirected?: string | null; // track if already redirected to auction/games for this league
}

export interface LeagueInfo {
  leagueId: number;
  name: string;
  firstYear: number;
  isAuctioning: boolean;
  isFranchiseTagSzn: boolean;
  isTaxiCutSzn: boolean;
  isBuyoutSzn: boolean;
}

export interface TagCandidate {
  lastSeasonSalary: number;
  player: PlayerDTO;
  tagAmount: number;
}

export interface FifthYearOptionCandidate {
  player: PlayerDTO;
  originalRookieSalary: number;
  optionSalary: number;
  draftYear: number;
  draftPick: number;
}

const defaultState = [] as OpposingFranchiseDTO[];

export const ownerReducer = (
  state = defaultState,
  action: OwnerAction,
): OpposingFranchiseDTO[] => {
  switch (action.type) {
    case UPDATE_OWNERS:
      return action.payload;
    default:
      return state;
  }
};
