export interface NflMatchup {
  id: number;
  year: number;
  week: number;
  left: NflTeam;
  right: NflTeam;
  winner: NflTeam;
  pickable: boolean;
  chosenTeamLocal?: NflTeam;
  choice?: number;
  pick?: NflPick;
}
export interface Prop {
  id?: number;
  year: number;
  prompt: string;
  week: number;
  optionA: string;
  optionB: string;
  winner?: string;
  pickable: boolean;
  localChoice?: string;
  pick?: ExtraPick;
}
export interface MatchupFormResponse {
  matchups: NflMatchup[];
  props: Prop[];
}
export interface NflPickSubmissionBody {
  picks: PickSubmission[];
  props: ExtraPick[];
}

export interface NflTeam {
  tricode: string;
  city: string;
  name: string;
  primary: string;
  secondary: string;
  logo: string;
  secondaryLogo: string;
  tertiary: string;
  id: number;
}
export interface CommunityMatchupStats {
  matchupId: number;
  lPct: number;
  rPct: number;
  lAvg: number;
  rAvg: number;
}
export interface NflPick {
  id: number;
  ownerId: number;
  matchupId: number;
  choice: number;
  points: number;
}

export interface ExtraPick {
  id?: number;
  ownerId: number;
  propId: number;
  choice: string;
}

export interface ConfidencePoolResponse {
  poolResults: ConfidencePlayerResult[];
}

export interface ConfidencePlayerResult {
  displayName: string;
  pickSubmitted: boolean;
  ownerId: number;
  totalPoints: number;
  weeklyResults: WeeklyConfidenceResult[];
  extraPoints: number;
  rank: number;
  avatar: string;
  isPaid: boolean;
}
export interface WeeklyConfidenceResult {
  extraPoints: number;
  week: number;
  totalPoints: number;
  results: PickResult[];
}

export interface PickBase {
  id?: number;
  ownerId: number;
  matchupId: number;
  points: number;
}

export interface PickSubmission extends PickBase {
  choice: string | number;
}

export interface PickResult extends PickBase {
  correct: boolean;
  pickTeam: NflTeam;
}

export interface ConfidenceHomeResponse {
  matchups: NflMatchup[];
  results: ConfidencePlayerResult[];
}
