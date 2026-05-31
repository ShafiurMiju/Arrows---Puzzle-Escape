import { RatingInput } from '../../types';

/**
 * Star rating for a solved level. Moves (puzzle efficiency) are the primary
 * metric; optional time caps reinforce the higher tiers. Any solve earns ≥1.
 */
export function computeStars(input: RatingInput): number {
  const { movesUsed, timeSec, thresholds } = input;
  const withinTime = (cap?: number): boolean => cap === undefined || timeSec <= cap;

  if (movesUsed <= thresholds.threeStarMoves && withinTime(thresholds.threeStarTimeSec)) {
    return 3;
  }
  if (movesUsed <= thresholds.twoStarMoves && withinTime(thresholds.twoStarTimeSec)) {
    return 2;
  }
  return 1;
}

/**
 * Numeric score for a solve: a base reward reduced by moves over par and by
 * time taken. Floored so a solve always scores something.
 */
export function computeScore(input: RatingInput): number {
  const { movesUsed, timeSec, thresholds } = input;
  const extraMoves = Math.max(0, movesUsed - thresholds.threeStarMoves);
  const score = 1000 - extraMoves * 50 - timeSec * 2;
  return Math.max(100, Math.round(score));
}
