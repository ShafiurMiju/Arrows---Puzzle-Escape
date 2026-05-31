import { Direction, Grid, HintMove, TileType } from '../../types';

/**
 * The first recommended move: a rotatable arrow that isn't yet at its solution
 * heading, paired with the heading it should point. Returns null when every
 * arrow already matches the solution. Powers the rewarded-ad hint (the solution
 * config comes from `solveLevel`).
 */
export function findHint(
  grid: Grid,
  solution: Readonly<Record<string, Direction>>,
): HintMove | null {
  for (const row of grid) {
    for (const tile of row) {
      if (tile.type === TileType.Arrow && tile.rotatable) {
        const target = solution[tile.id];
        if (target !== undefined && tile.direction !== target) {
          return { tileId: tile.id, direction: target };
        }
      }
    }
  }
  return null;
}
