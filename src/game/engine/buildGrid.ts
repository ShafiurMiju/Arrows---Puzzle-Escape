import { Grid, LevelDefinition, Position, StartTile, Tile, TileType } from '../../types';

/**
 * Expand a level's SPARSE tile list into a dense {@link Grid}, filling every
 * unlisted cell with an Empty tile. Authored levels only list non-empty cells
 * (see {@link LevelDefinition.tiles}); the engine always works on a full grid.
 */
export function buildGrid(level: LevelDefinition): Grid {
  const { rows, cols } = level.size;

  const grid: Tile[][] = [];
  for (let row = 0; row < rows; row += 1) {
    const cells: Tile[] = [];
    for (let col = 0; col < cols; col += 1) {
      cells.push({ type: TileType.Empty, id: `empty-${row}-${col}`, position: { row, col } });
    }
    grid.push(cells);
  }

  for (const tile of level.tiles) {
    const { row, col } = tile.position;
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      grid[row][col] = tile;
    }
  }

  return grid;
}

/** Find the single Start tile, or null if the level defines none. */
export function findStart(grid: Grid): StartTile | null {
  for (const row of grid) {
    for (const tile of row) {
      if (tile.type === TileType.Start) {
        return tile;
      }
    }
  }
  return null;
}

/** Whether a position lies within the grid bounds. */
export function inBounds(grid: Grid, pos: Position): boolean {
  return pos.row >= 0 && pos.row < grid.length && pos.col >= 0 && pos.col < grid[0].length;
}

/** Read the tile at a position. Caller must ensure the position is in bounds. */
export function tileAt(grid: Grid, pos: Position): Tile {
  return grid[pos.row][pos.col];
}
