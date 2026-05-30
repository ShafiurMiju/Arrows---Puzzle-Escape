/**
 * Achievements are split into an immutable catalog ({@link AchievementDefinition})
 * and persisted per-player state ({@link AchievementProgress}), mirroring the
 * level/progress split so the catalog can grow without breaking saves.
 */

/** Static catalog entry describing one achievement. */
export interface AchievementDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /**
   * For incremental achievements (e.g. "Complete 50 levels"), the count the
   * player must reach. Omitted for one-shot achievements (e.g. "First Victory").
   */
  readonly target?: number;
}

/** Persisted unlock + progress state for a single achievement. */
export interface AchievementProgress {
  readonly id: string;
  readonly unlocked: boolean;
  /** Epoch milliseconds when unlocked, or null if still locked. */
  readonly unlockedAt: number | null;
  /** Current count toward {@link AchievementDefinition.target}. */
  readonly progress: number;
}
