import { Difficulty, LevelDefinition, LevelSummary } from '../../types';
import rawLevels from './levels.json';

/**
 * The level catalog, loaded from the committed JSON (generated + validated by
 * `npm run levels:generate`). The cast is safe: the JSON is produced from
 * `LevelDefinition`s and every level is solver-verified in `levels.test.ts`.
 */
const LEVELS = rawLevels as unknown as LevelDefinition[];
const BY_ID = new Map<number, LevelDefinition>(LEVELS.map((level) => [level.id, level]));

export const LEVEL_COUNT = LEVELS.length;

export function getAllLevels(): readonly LevelDefinition[] {
  return LEVELS;
}

export function getLevel(id: number): LevelDefinition | undefined {
  return BY_ID.get(id);
}

export function getLevelOrThrow(id: number): LevelDefinition {
  const level = BY_ID.get(id);
  if (!level) {
    throw new Error(`getLevelOrThrow: no level with id ${id}`);
  }
  return level;
}

/** Lightweight projection for the level-select grid (no tile payload). */
export function getLevelSummaries(): LevelSummary[] {
  return LEVELS.map((level) => ({
    id: level.id,
    name: level.name,
    difficulty: level.difficulty,
  }));
}

export function getFirstLevelId(): number {
  return LEVELS[0]?.id ?? 1;
}

/** The next level id after `id`, or null if `id` is the last level. */
export function getNextLevelId(id: number): number | null {
  return BY_ID.has(id + 1) ? id + 1 : null;
}

export function countByDifficulty(): Record<Difficulty, number> {
  const counts = {
    [Difficulty.Easy]: 0,
    [Difficulty.Medium]: 0,
    [Difficulty.Hard]: 0,
    [Difficulty.Expert]: 0,
  };
  for (const level of LEVELS) {
    counts[level.difficulty] += 1;
  }
  return counts;
}
