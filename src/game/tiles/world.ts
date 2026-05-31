import { ArrowState, Grid, Position, TileType, WallTile } from '../../types';

/**
 * Mutable world state threaded through a single simulation run. Tile objects
 * themselves stay immutable (see {@link WritableGrid}); all per-run mutation
 * lives here so the engine is deterministic and the state is easy to key for
 * loop detection.
 */
export interface WorldState {
  // NOTE: `broken` and `switchStates` are MUTATED in place each tick — they are
  // intentionally not `readonly` (that would only guard the binding, not the
  // container contents). `pairMap` is read-only after `buildWorld`.
  /** Ids of breakable tiles already used — now fatal holes. Grows monotonically. */
  broken: Set<string>;
  /** Active/inactive state per switch group (true = active = walls solid). */
  switchStates: Record<string, boolean>;
  /** Teleporter position-key → partner position (paired by channel). */
  readonly pairMap: Map<string, Position>;
}

export const posKey = (pos: Position): string => `${pos.row},${pos.col}`;

/**
 * Initialise world state from the grid: seed switch-group states, and normalise
 * teleporter pairing once (deterministic (row,col)-ascending consecutive pairs;
 * an odd leftover stays unpaired and acts as inert floor).
 */
export function buildWorld(grid: Grid): WorldState {
  const switchStates: Record<string, boolean> = {};
  const teleportersByChannel = new Map<number, Position[]>();

  for (const row of grid) {
    for (const tile of row) {
      if (tile.type === TileType.Switch) {
        if (!(tile.switchGroup in switchStates)) {
          switchStates[tile.switchGroup] = tile.initiallyActive;
        }
      } else if (tile.type === TileType.Teleporter) {
        const list = teleportersByChannel.get(tile.channel) ?? [];
        list.push(tile.position);
        teleportersByChannel.set(tile.channel, list);
      }
    }
  }

  const pairMap = new Map<string, Position>();
  for (const positions of teleportersByChannel.values()) {
    const sorted = [...positions].sort((a, b) => a.row - b.row || a.col - b.col);
    for (let i = 0; i + 1 < sorted.length; i += 2) {
      pairMap.set(posKey(sorted[i]), sorted[i + 1]);
      pairMap.set(posKey(sorted[i + 1]), sorted[i]);
    }
  }

  return { broken: new Set<string>(), switchStates, pairMap };
}

/** A wall with no switch group is always solid; a switch-controlled wall is
 * solid only while its group is active. */
export function isWallSolid(tile: WallTile, world: WorldState): boolean {
  if (!tile.switchGroup) {
    return true;
  }
  return world.switchStates[tile.switchGroup] ?? true;
}

/** Flip a switch group's active state. */
export function toggleSwitch(world: WorldState, group: string): void {
  world.switchStates[group] = !(world.switchStates[group] ?? true);
}

/**
 * Canonical key for loop detection of a SETTLED state. The future is a pure
 * function of (position, heading, broken set, active switch groups), so two
 * identical keys mean the path repeats forever. Order-independent serialisation.
 */
export function stateKey(state: ArrowState, world: WorldState): string {
  const broken = [...world.broken].sort().join(',');
  const active = Object.keys(world.switchStates)
    .filter((group) => world.switchStates[group])
    .sort()
    .join(',');
  return `${state.position.row},${state.position.col},${state.direction}|B:${broken}|S:${active}`;
}
