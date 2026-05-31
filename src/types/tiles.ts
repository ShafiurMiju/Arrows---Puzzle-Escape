import { Direction, RotationSense } from './direction';
import { Position } from './grid';

/**
 * Every tile kind supported by the engine.
 *
 * String values are persisted in JSON level files, so they are treated as a
 * stable wire format — never renumber or rename without a level migration.
 */
export enum TileType {
  // Basic
  Empty = 'EMPTY',
  Start = 'START',
  Exit = 'EXIT',
  Wall = 'WALL',
  // Player-rotatable arrows
  Arrow = 'ARROW',
  // Special mechanics
  Teleporter = 'TELEPORTER',
  Speed = 'SPEED',
  Rotate = 'ROTATE',
  OneWay = 'ONE_WAY',
  Breakable = 'BREAKABLE',
  Ice = 'ICE',
  Switch = 'SWITCH',
}

/** Fields shared by every tile. */
interface TileBase {
  /** Stable id, unique within a level. Used as a React key and engine handle. */
  readonly id: string;
  /** The cell this tile occupies. */
  readonly position: Position;
}

/** Passable, inert cell. The arrow travels straight through, keeping heading. */
export interface EmptyTile extends TileBase {
  readonly type: TileType.Empty;
}

/** Launch point. The arrow begins here facing {@link StartTile.direction}. */
export interface StartTile extends TileBase {
  readonly type: TileType.Start;
  readonly direction: Direction;
}

/** Goal cell. Reaching it wins the level. */
export interface ExitTile extends TileBase {
  readonly type: TileType.Exit;
}

/** Impassable cell. Entering it is a loss (`HIT_WALL`). */
export interface WallTile extends TileBase {
  readonly type: TileType.Wall;
  /**
   * When set, this wall is controlled by Switch tiles tagged with the same
   * group: toggling the switch makes the wall passable / impassable.
   */
  readonly switchGroup?: string;
}

/**
 * The puzzle's primary interaction. A rotatable arrow redirects the travelling
 * arrow to {@link ArrowTile.direction}; the player taps to rotate it before the
 * simulation runs. Non-rotatable arrows act as fixed redirects.
 */
export interface ArrowTile extends TileBase {
  readonly type: TileType.Arrow;
  readonly direction: Direction;
  readonly rotatable: boolean;
}

/**
 * Paired warp gate. Entering a teleporter instantly relocates the arrow to the
 * other teleporter sharing the same {@link TeleporterTile.channel}, preserving
 * heading. Exactly two teleporters should share a channel per level.
 */
export interface TeleporterTile extends TileBase {
  readonly type: TileType.Teleporter;
  readonly channel: number;
}

/** Boost pad. While crossing, the arrow advances `multiplier` cells in one tick. */
export interface SpeedTile extends TileBase {
  readonly type: TileType.Speed;
  /** Cells advanced per tick across this tile. Defaults to 2 in level loading. */
  readonly multiplier: number;
}

/** How a {@link RotateTile} alters the arrow's heading when it lands on it. */
export type RotateEffect =
  | { readonly kind: 'TURN'; readonly sense: RotationSense }
  | { readonly kind: 'SET'; readonly direction: Direction };

/** Automatically changes the arrow's direction on entry. */
export interface RotateTile extends TileBase {
  readonly type: TileType.Rotate;
  readonly effect: RotateEffect;
}

/**
 * Directional gate. The arrow may only ENTER this tile while travelling in one
 * of {@link OneWayTile.allowedEntry}; entering from any other side is a loss.
 */
export interface OneWayTile extends TileBase {
  readonly type: TileType.OneWay;
  readonly allowedEntry: readonly Direction[];
}

/** Single-use floor. Passable once, then removed (becomes a hole / loss zone). */
export interface BreakableTile extends TileBase {
  readonly type: TileType.Breakable;
}

/** Frictionless cell. The arrow keeps sliding in its heading until it is
 * redirected, blocked, or leaves the ice. */
export interface IceTile extends TileBase {
  readonly type: TileType.Ice;
}

/**
 * Toggles every WallTile carrying the matching {@link WallTile.switchGroup} on
 * entry — walls are the only switchable tile kind today. {@link initiallyActive}
 * sets the group's state on load, where active = solid/impassable.
 */
export interface SwitchTile extends TileBase {
  readonly type: TileType.Switch;
  readonly switchGroup: string;
  /** Whether the controlled group starts active (e.g. walls solid) on load. */
  readonly initiallyActive: boolean;
}

/** Discriminated union of all tile kinds, keyed by `type`. */
export type Tile =
  | EmptyTile
  | StartTile
  | ExitTile
  | WallTile
  | ArrowTile
  | TeleporterTile
  | SpeedTile
  | RotateTile
  | OneWayTile
  | BreakableTile
  | IceTile
  | SwitchTile;

/** Immutable board as delivered by level loading. */
export type Grid = ReadonlyArray<ReadonlyArray<Tile>>;

/**
 * Writable board the engine builds during a simulation. The 2D array spine is
 * mutable (cells can be reassigned), but Tile objects stay immutable — update a
 * cell by replacing it wholesale (`grid[r][c] = { ...grid[r][c], direction }`),
 * never by mutating tile fields. This keeps the engine deterministic.
 */
export type WritableGrid = Tile[][];
