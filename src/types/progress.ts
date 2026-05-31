/**
 * Persistence-facing models for player progression and settings. These shapes
 * are serialized to AsyncStorage, so treat them as a stable format and migrate
 * deliberately (see the versioned prefix in `constants/storageKeys`).
 */

/** Per-level persisted progress. */
export interface LevelProgress {
  readonly levelId: number;
  readonly unlocked: boolean;
  readonly completed: boolean;
  /** Best stars earned, 0..3. */
  readonly bestStars: number;
  /** Fewest moves used in a winning attempt, or null if never solved. */
  readonly bestMoves: number | null;
  /** Fastest winning time in seconds, or null if never solved. */
  readonly bestTimeSec: number | null;
  /** True if the level was ever completed without using a hint. */
  readonly completedWithoutHint: boolean;
}

/** Aggregate progression persisted across sessions. */
export interface ProgressState {
  /** The furthest level the player is expected to be on next. */
  readonly currentLevelId: number;
  /**
   * Sparse map of levelId → progress; absent levels are locked/untouched.
   * `Partial` so an indexed lookup is typed `LevelProgress | undefined`,
   * forcing callers to null-check the sparse entries.
   */
  readonly levels: Partial<Record<number, LevelProgress>>;
  readonly totalStars: number;
  readonly completedCount: number;
}

/** User-tunable settings persisted across sessions. */
export interface SettingsState {
  readonly musicEnabled: boolean;
  readonly soundEnabled: boolean;
  readonly vibrationEnabled: boolean;
  /** Set by a future "Remove Ads" IAP; suppresses interstitials and banners. */
  readonly removeAds: boolean;
}
