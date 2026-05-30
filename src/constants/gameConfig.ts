import { Direction } from '../types/direction';
import { SettingsState } from '../types/progress';

/** Engine + progression tuning shared across the app. */
export const gameConfig = {
  /** Heading used for a Start tile if a level omits one. */
  defaultStartDirection: Direction.Right,
  /** Cells advanced per tick on a Speed tile when not otherwise specified. */
  defaultSpeedMultiplier: 2,
  /**
   * Safety bound for the simulation: if the arrow exceeds this many steps
   * without reaching the exit, the run is declared an INFINITE_LOOP. Sized far
   * above the longest possible non-repeating path on our largest boards.
   */
  maxSimulationSteps: 1000,
  /** Stars achievable per level. */
  maxStars: 3,
  /** Id of the first level. */
  firstLevelId: 1,
} as const;

/** Settings applied on first launch (before any user changes are persisted). */
export const DEFAULT_SETTINGS: SettingsState = {
  musicEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  removeAds: false,
};
