import { Direction } from '../types/direction';
import { SettingsState } from '../types/progress';

/** Engine + progression tuning shared across the app. */
export const gameConfig = {
  /** Heading used for a Start tile if a level omits one. */
  defaultStartDirection: Direction.Right,
  /** Cells advanced per tick on a Speed tile when not otherwise specified. */
  defaultSpeedMultiplier: 2,
  /**
   * Floor for the simulation's step backstop. The engine derives the actual cap
   * from the level's finite settled-state space (so it never pre-empts a valid
   * path) but never goes below this. Loop detection — not this cap — is what
   * actually proves an INFINITE_LOOP; this is only a defensive ceiling.
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
