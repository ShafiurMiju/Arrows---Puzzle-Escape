import { LEVEL_COUNT } from './loader';

/**
 * Sequential unlock rules: level 1 is always available; level N unlocks once
 * level N-1 is completed. The set of completed levels comes from the persisted
 * progress store (Phase 7); this module holds only the pure rule.
 */
export function isLevelUnlocked(levelId: number, completed: ReadonlySet<number>): boolean {
  if (levelId <= 1) {
    return true;
  }
  return completed.has(levelId - 1);
}

/** The furthest level the player can currently enter. */
export function highestUnlockedLevel(completed: ReadonlySet<number>): number {
  let highest = 1;
  for (const id of completed) {
    if (id >= highest && id < LEVEL_COUNT) {
      highest = id + 1;
    }
  }
  return Math.min(highest, LEVEL_COUNT);
}
