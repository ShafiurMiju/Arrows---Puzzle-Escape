import { Direction } from './direction';
import { GridSize } from './grid';
import { Tile } from './tiles';

/** Coarse difficulty buckets used for grouping and progression pacing. */
export enum Difficulty {
  Easy = 'EASY',
  Medium = 'MEDIUM',
  Hard = 'HARD',
  Expert = 'EXPERT',
}

/**
 * Star-rating thresholds for a level. Fewer player moves (tile rotations) and
 * faster solves earn more stars. Any valid solve earns at least one star.
 */
export interface StarThresholds {
  /** Solve using at most this many moves to earn 3 stars. */
  readonly threeStarMoves: number;
  /** Solve using at most this many moves to earn 2 stars. */
  readonly twoStarMoves: number;
  /** Optional time cap (seconds) reinforcing the 3-star tier. */
  readonly threeStarTimeSec?: number;
  /** Optional time cap (seconds) reinforcing the 2-star tier. */
  readonly twoStarTimeSec?: number;
}

/** A single recommended move surfaced by the hint system. */
export interface HintMove {
  readonly tileId: string;
  readonly direction: Direction;
}

/**
 * Immutable definition of a level, authored in JSON under `game/levels`.
 *
 * `tiles` is a SPARSE list: only non-empty cells are listed. The level loader
 * expands it into a full {@link Grid} of `size`, filling gaps with Empty tiles.
 * This keeps the 100+ level JSON files compact and easy to hand-author.
 */
export interface LevelDefinition {
  /** 1-based id; also the display order and unlock sequence position. */
  readonly id: number;
  readonly name?: string;
  readonly difficulty: Difficulty;
  readonly size: GridSize;
  readonly tiles: readonly Tile[];
  /** Intended/optimal number of rotations — the design target for 3 stars. */
  readonly par: number;
  readonly stars: StarThresholds;
  /** Optional authored hint sequence; the hint service may also compute one. */
  readonly hints?: readonly HintMove[];
}

/** Lightweight projection used by the level-select grid (no tile payload). */
export interface LevelSummary {
  readonly id: number;
  readonly name?: string;
  readonly difficulty: Difficulty;
}
