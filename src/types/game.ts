import { Direction } from './direction';
import { Position } from './grid';
import { StarThresholds } from './level';

/** High-level lifecycle of a simulation run. */
export enum SimulationStatus {
  Idle = 'IDLE',
  Running = 'RUNNING',
  Won = 'WON',
  Lost = 'LOST',
}

/** Why a run ended in a loss. Mapped to copy on the Failure screen. */
export enum FailureReason {
  HitWall = 'HIT_WALL',
  HitObstacle = 'HIT_OBSTACLE',
  OutOfBounds = 'OUT_OF_BOUNDS',
  InfiniteLoop = 'INFINITE_LOOP',
  Stuck = 'STUCK',
}

/** Snapshot of the travelling arrow at a single instant. */
export interface ArrowState {
  readonly position: Position;
  readonly direction: Direction;
}

/** Classification of a step, used to select the animation curve and SFX. */
export enum StepKind {
  Move = 'MOVE',
  Slide = 'SLIDE',
  Speed = 'SPEED',
  Teleport = 'TELEPORT',
  Rotate = 'ROTATE',
}

/** Side effects a step had on the board (drives tile animations). */
export enum TileEventKind {
  Broken = 'BROKEN',
  SwitchToggled = 'SWITCH_TOGGLED',
}

export interface TileEvent {
  readonly kind: TileEventKind;
  readonly tileId: string;
  readonly position: Position;
}

/**
 * One discrete movement emitted by the engine. The animator replays the full
 * ordered list to visualize the arrow's journey after the player presses Play.
 */
export interface SimulationStep {
  readonly index: number;
  readonly from: ArrowState;
  readonly to: ArrowState;
  readonly kind: StepKind;
  readonly events: readonly TileEvent[];
}

/** Deterministic result of running a board to completion. */
export interface SimulationResult {
  readonly status: SimulationStatus.Won | SimulationStatus.Lost;
  readonly steps: readonly SimulationStep[];
  readonly failureReason?: FailureReason;
  readonly failureAt?: Position;
  /** Total cells traversed; useful for scoring and analytics. */
  readonly cellsTravelled: number;
}

/** A single tap-to-rotate interaction, recorded for the unlimited-undo stack. */
export interface PlayerMove {
  readonly tileId: string;
  readonly previousDirection: Direction;
  readonly nextDirection: Direction;
  readonly timestamp: number;
}

/** Inputs to the star-rating calculation after a successful solve. */
export interface RatingInput {
  readonly movesUsed: number;
  readonly timeSec: number;
  readonly thresholds: StarThresholds;
}

/** Outcome of a finished attempt; fed to the Victory screen and progress store. */
export interface LevelResult {
  readonly levelId: number;
  readonly won: boolean;
  readonly movesUsed: number;
  readonly timeSec: number;
  /** 0 (lost) … 3 (perfect). */
  readonly stars: number;
  readonly score: number;
}
