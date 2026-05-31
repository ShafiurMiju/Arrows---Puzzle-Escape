/**
 * Achievements are split into an immutable catalog ({@link AchievementDefinition})
 * and persisted per-player state ({@link AchievementProgress}), mirroring the
 * level/progress split so the catalog can grow without breaking saves.
 */

/**
 * Declarative unlock condition, evaluated against the player's progress. Keeping
 * it as data (not a function) means the catalog stays pure/serializable and the
 * evaluator is a single pure function.
 */
export type AchievementCondition =
  | { readonly kind: 'levelsCompleted'; readonly count: number }
  | { readonly kind: 'totalStars'; readonly count: number }
  | { readonly kind: 'threeStarLevels'; readonly count: number }
  | { readonly kind: 'hintFreeLevels'; readonly count: number };

/** Static catalog entry describing one achievement. */
export interface AchievementDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** The condition that unlocks it; `condition.count` also drives the progress bar. */
  readonly condition: AchievementCondition;
}

/** Persisted unlock + progress state for a single achievement. */
export interface AchievementProgress {
  readonly id: string;
  readonly unlocked: boolean;
  /** Epoch milliseconds when unlocked, or null if still locked. */
  readonly unlockedAt: number | null;
  /** 0..1 progress toward the unlock condition. */
  readonly progress: number;
}
