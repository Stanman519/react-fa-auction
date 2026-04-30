import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";

export const DEAD_CAP_RATE = 0.4;
export const YEARS_SHOWN = 4;
export const LEAGUE_CAP_MAX = 500;

const rosterMultiplier = (status?: string): number => {
  if (status === "TAXI_SQUAD") return 0.2;
  if (status === "INJURED_RESERVE") return 0.5;
  return 1.0;
};

export const capHitForYear = (p: PlayerDTO, yearsFromNow: number): number => {
  const length = p.length ?? 0;
  if (yearsFromNow >= length) return 0;
  return Math.round((p.salary ?? 0) * rosterMultiplier(p.rosterStatus));
};

export const deadCapIfCut = (p: PlayerDTO): number => {
  const remaining = (p.length ?? 0) * (p.salary ?? 0);
  return Math.round(remaining * DEAD_CAP_RATE);
};

export type CapSegKey = "qb" | "rb" | "wr" | "te" | "taxi" | "ir";

const positionSeg = (pos?: string, status?: string): CapSegKey => {
  if (status === "TAXI_SQUAD") return "taxi";
  if (status === "INJURED_RESERVE") return "ir";
  switch (pos?.toUpperCase()) {
    case "QB": return "qb";
    case "WR": return "wr";
    case "TE": return "te";
    default:   return "rb"; // RB, FB, HB, etc.
  }
};

export const capHitsBySegment = (
  p: PlayerDTO,
  yearsFromNow: number,
): Partial<Record<CapSegKey, number>> => {
  const length = p.length ?? 0;
  if (yearsFromNow >= length) return {};
  const salary = p.salary ?? 0;
  return { [positionSeg(p.position, p.rosterStatus)]: salary * rosterMultiplier(p.rosterStatus) };
};
