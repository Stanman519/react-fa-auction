import internal from "stream";
import { PlayerDTO } from "../redux/reducers/FreeAgentReducer";

export interface DashboardTradeLeagueDTO {
  franchises: MflFranchise[];
  name: string;
}

export interface League {
  franchises: Franchises;
  name: string;
}

export interface Franchises {
  count: string;
  franchise: MflFranchise[];
}

export interface MflFranchise {
  waiverSortOrder: string;
  owner_name?: string;
  logo?: string;
  abbrev?: string;
  stadium?: string;
  use_advanced_editor?: string;
  email: string;
  salaryCapAmount: string;
  username: string;
  lastVisit: string;
  time_zone?: string;
  country?: string;
  mail_event: string;
  play_audio?: string;
  icon?: string;
  future_draft_picks: string;
  bbidAvailableBalance: string;
  id: string;
  name: string;
  cell2?: string;
  cell?: string;
  url?: string;
  assets: FranchiseAssets;
}
export interface PendingTradeResponse {
  tradeRequests: TradeRequest[];
}
export interface TradeRequest {
  senderId: number;
  senderTeamName: string;
  receiverTeamName: string;
  receiverId: number;
  sendingAssets: TradeOfferAsset[];
  receivingAssets: TradeOfferAsset[];
  leagueId: number;
  expires: number;
  tradeId: string;
}
export interface TradeOfferAsset {
  mflId: string;
  playerDetails: PlayerDTO;
  capEats: CapEat[];
}
export interface CapEat {
  eaterId: number;
  receiverId: number;
  amount: number;
  year: number;
  mflId: number;
}
export interface FranchiseAssets {
  id: string;
  players: PlayerDTO[];
  futureYearDraftPicks: DraftPick[];
  currentYearDraftPicks: DraftPick[];
}

export interface Players {
  player: PlayerDTO[];
}

// export interface Player {
//   id: string;
// }

export interface FutureYearDraftPicks {
  draftPick: DraftPick[];
}

export interface DraftPick {
  description: string;
  pick: string;
}

export interface TradeBaitDTO {
  franchiseId: string;
  willGiveUp: string;
  inExchangeFor: string;
}
