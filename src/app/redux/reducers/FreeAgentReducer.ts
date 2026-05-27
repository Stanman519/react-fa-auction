import {
  FreeAgentAction,
  UPDATE_FREE_AGENTS,
} from "../actions/FreeAgentActions";

export interface PlayerDTO {
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  team: string;
  age?: number;
  adp?: number;
  lastSeasonPts?: number;
  height?: number;
  weight?: number;
  headshot?: string;
  actionShot?: string;
  mflId: number;
  strMflId?: string; //necessary for draft pick trades ??
  salary?: number;
  length?: number;
  rosterStatus?: string;
}
export interface HoldoutDTO {
  id: number;
  leagueId: number;
  leagueOwnerId: number;
  year: number;
  player: PlayerDTO;
  originalSalary: number;
  holdoutSalary: number;
  status: string; // "Pending", "Accepted", "Denied"
  scoreTier: number;
  salaryComparison: number;
  yearsRemaining: number;
}

export interface PlayerBio {
  firstName: string;
  lastName: string;
  mflId: string;
  team: string;
  position: string;
  age: number;
  height: number;
  weight: number;
  college: string;
  draftYear: string;
  draftRound: string;
  draftPick: string;
  actionShot: string;
  lastSeasonSalary: number;
  prevOwner: string;
  positionRanks: BioPositionRank[];
}

export interface BioPositionRank {
  year: number;
  points: number;
  rank: number;
}

export const freeAgentReducer = (
  state = [] as PlayerDTO[],
  action: FreeAgentAction,
): PlayerDTO[] => {
  switch (action.type) {
    case UPDATE_FREE_AGENTS:
      return action.payload;
    default:
      return state;
  }
};
