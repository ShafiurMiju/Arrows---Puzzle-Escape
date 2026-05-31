import { LevelProgress, LevelResult, ProgressState } from '../../types';
import { clamp } from '../../utils/math';

/** Fresh progress for a first launch: only level 1 is implicitly unlocked. */
export function emptyProgress(): ProgressState {
  return { currentLevelId: 1, levels: {}, totalStars: 0, completedCount: 0 };
}

/** The set of completed level ids (drives the unlock rule). */
export function completedLevelIds(progress: ProgressState): Set<number> {
  const ids = new Set<number>();
  for (const key of Object.keys(progress.levels)) {
    const id = Number(key);
    if (progress.levels[id]?.completed) {
      ids.add(id);
    }
  }
  return ids;
}

/**
 * Fold a finished attempt into progress. Losses are ignored; a win records the
 * level as completed and keeps the BEST stars/moves/time. Totals and the
 * "current" (furthest) level are recomputed; `levelCount` clamps the latter.
 */
export function applyLevelResult(
  progress: ProgressState,
  result: LevelResult,
  levelCount: number,
): ProgressState {
  if (!result.won) {
    return progress;
  }

  const previous = progress.levels[result.levelId];
  const entry: LevelProgress = {
    levelId: result.levelId,
    unlocked: true,
    completed: true,
    bestStars: Math.max(previous?.bestStars ?? 0, result.stars),
    bestMoves:
      previous?.bestMoves != null ? Math.min(previous.bestMoves, result.movesUsed) : result.movesUsed,
    bestTimeSec:
      previous?.bestTimeSec != null ? Math.min(previous.bestTimeSec, result.timeSec) : result.timeSec,
  };

  const levels: ProgressState['levels'] = { ...progress.levels, [result.levelId]: entry };

  let totalStars = 0;
  let completedCount = 0;
  for (const key of Object.keys(levels)) {
    const level = levels[Number(key)];
    if (level) {
      totalStars += level.bestStars;
      if (level.completed) {
        completedCount += 1;
      }
    }
  }

  const currentLevelId = clamp(
    Math.max(progress.currentLevelId, result.levelId + 1),
    1,
    levelCount,
  );

  return { currentLevelId, levels, totalStars, completedCount };
}
