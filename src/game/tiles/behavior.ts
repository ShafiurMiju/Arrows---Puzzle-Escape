import { Direction, FailureReason, RotateEffect, Tile, TileType } from '../../types';
import { assertNever } from '../../utils/assertNever';
import { rotate } from '../../utils/direction';
import { isWallSolid, WorldState } from './world';

/**
 * Pre-entry gate: may the arrow ENTER `tile` while travelling `heading`?
 * Returns the failure reason if entry is blocked, or null if allowed.
 *
 * - Wall: blocked when solid (a deactivated switch-wall is passable).
 * - OneWay: blocked unless the travel heading is in `allowedEntry`.
 * - Breakable: blocked once it has been used (it is now a hole).
 * Every other tile is always enterable; its effect is applied in `resolveOn`.
 */
export function entryBlock(
  tile: Tile,
  heading: Direction,
  world: WorldState,
): FailureReason | null {
  switch (tile.type) {
    case TileType.Wall:
      return isWallSolid(tile, world) ? FailureReason.HitWall : null;
    case TileType.OneWay:
      return tile.allowedEntry.includes(heading) ? null : FailureReason.HitObstacle;
    case TileType.Breakable:
      return world.broken.has(tile.id) ? FailureReason.HitObstacle : null;
    // Always-enterable tiles (effect applied in resolveOn). Listed explicitly so
    // adding a new tile kind that should gate entry fails to compile here.
    case TileType.Empty:
    case TileType.Start:
    case TileType.Exit:
    case TileType.Arrow:
    case TileType.Teleporter:
    case TileType.Speed:
    case TileType.Rotate:
    case TileType.Ice:
    case TileType.Switch:
      return null;
    default:
      return assertNever(tile);
  }
}

/** Resolve a Rotate tile's effect against the incoming heading. */
export function applyRotate(heading: Direction, effect: RotateEffect): Direction {
  return effect.kind === 'SET' ? effect.direction : rotate(heading, effect.sense);
}
