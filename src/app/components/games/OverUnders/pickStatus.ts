// Single source of truth for whether an over/under pick has clinched.
// Both the in-season card and the standings tally read from here — they used to
// each carry their own (differently wrong) copy of this math.

export type PickStatus = "WIN" | "LOSS" | "TBD";

// Pool rules — single source so the header, rules modal, and submit gate agree.
export const REQUIRED_PICKS = 25;
export const REQUIRED_DOUBLES = 2;
export const NFL_TEAMS = 32;

const GAMES_IN_SEASON = 17;
// Win pct must differ from the line's implied pct by this much to call a pace.
const PACE_THRESHOLD = 0.1;
// Below this many games played, pace is noise (and 0 played divides by zero).
const MIN_GAMES_FOR_PACE = 3;

export interface PickProgress {
  status: PickStatus;
  /** overUnder shifted by the double-down adjustment. Always ends in .5 */
  effLine: number;
  /** Wins (over) or losses (under) needed to clinch */
  target: number;
  /** Wins (over) or losses (under) so far */
  current: number;
  /** current/target, clamped to 0..1 */
  pct: number;
  losses: number;
  isDouble: boolean;
  /** undefined until enough games played to mean anything */
  onPace?: boolean;
}

export interface PickProgressArgs {
  overUnder: number;
  lineAdjustment: number;
  /** null/undefined = passed on this team */
  isOver?: boolean | null;
  realWins: number;
  gamesRemaining: number;
}

export const getPickProgress = ({
  overUnder,
  lineAdjustment,
  isOver,
  realWins,
  gamesRemaining,
}: PickProgressArgs): PickProgress => {
  const effLine = overUnder + lineAdjustment;
  const losses = GAMES_IN_SEASON - gamesRemaining - realWins;
  const maxWins = realWins + gamesRemaining;
  const isDouble = lineAdjustment !== 0;
  const over = isOver === true;

  // Lines always end in .5, so a pick resolves the moment either side is
  // mathematically locked — no pushes to worry about.
  const overClinched = realWins > effLine;
  const overBusted = maxWins < effLine;

  let status: PickStatus = "TBD";
  if (over ? overClinched : overBusted) status = "WIN";
  else if (over ? overBusted : overClinched) status = "LOSS";

  // Over needs ceil(effLine) wins; under needs the team to drop enough games
  // that it can no longer reach the line.
  const target = over
    ? Math.ceil(effLine)
    : GAMES_IN_SEASON - Math.floor(effLine);
  const current = over ? realWins : losses;
  const pct = target <= 0 ? 1 : Math.min(1, Math.max(0, current / target));

  const played = GAMES_IN_SEASON - gamesRemaining;
  let onPace: boolean | undefined;
  if (played >= MIN_GAMES_FOR_PACE) {
    const diff = realWins / played - overUnder / GAMES_IN_SEASON;
    if (Math.abs(diff) > PACE_THRESHOLD) onPace = over ? diff > 0 : diff < 0;
  }

  return { status, effLine, target, current, pct, losses, isDouble, onPace };
};

export interface PickTally {
  w: number;
  l: number;
  tbd: number;
  pts: number;
  /** Double-downs that hit — first tiebreaker */
  doublesHit: number;
  /** Credit for winning picks the pool didn't make — second tiebreaker */
  contrarian: number;
}

/** How many owners took each side of a line. Passes are simply absent. */
export interface LineSides {
  over: number;
  under: number;
}

export const buildLineSides = (
  allPicks: { lineId?: number; isOver?: boolean | null }[],
): Map<number, LineSides> => {
  const map = new Map<number, LineSides>();
  allPicks.forEach((p) => {
    if (p.lineId === undefined) return;
    if (p.isOver !== true && p.isOver !== false) return;
    const entry = map.get(p.lineId) ?? { over: 0, under: 0 };
    if (p.isOver) entry.over += 1;
    else entry.under += 1;
    map.set(p.lineId, entry);
  });
  return map;
};

export interface TallyLine {
  id: number;
  overUnder: number;
  realWins: number;
  gamesRemaining: number;
}

/**
 * Doubled-down picks are worth 2. Only wins score.
 *
 * `sides` + `poolSize` are optional and only feed the contrarian tiebreaker:
 * a win is worth more the fewer owners took that side. Measured against the
 * whole pool, so passing on a team also counts as not backing it — being one
 * of the few to even take a position is the contrarian part.
 */
export const tallyPicks = (
  picks: {
    lineId?: number;
    isOver?: boolean | null;
    lineAdjustment: number;
  }[],
  lines: TallyLine[],
  sides?: Map<number, LineSides>,
  poolSize?: number,
): PickTally => {
  const tally: PickTally = {
    w: 0,
    l: 0,
    tbd: 0,
    pts: 0,
    doublesHit: 0,
    contrarian: 0,
  };
  picks.forEach((p) => {
    // A pass isn't a pick — it can't win, lose, or be pending.
    if (p.isOver !== true && p.isOver !== false) return;
    const line = lines.find((f) => f.id === p.lineId);
    if (!line) return;
    const { status, isDouble } = getPickProgress({
      overUnder: line.overUnder,
      lineAdjustment: p.lineAdjustment,
      isOver: p.isOver,
      realWins: line.realWins,
      gamesRemaining: line.gamesRemaining,
    });
    if (status === "WIN") {
      tally.w += 1;
      tally.pts += isDouble ? 2 : 1;
      if (isDouble) tally.doublesHit += 1;

      if (sides && poolSize && poolSize > 0 && p.lineId !== undefined) {
        const s = sides.get(p.lineId);
        const sameSide = (p.isOver ? s?.over : s?.under) ?? 0;
        tally.contrarian += 1 - sameSide / poolSize;
      }
    } else if (status === "LOSS") tally.l += 1;
    else tally.tbd += 1;
  });
  return tally;
};
