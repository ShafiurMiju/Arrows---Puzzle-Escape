import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildGrid, simulateGrid } from '../../engine';
import { Direction, Grid, Position, SimulationStatus, TileType } from '../../../types';
import { getSampleLevel, SAMPLE_LEVELS } from '../sampleLevels';

/** Return a copy of the grid with the arrow at `pos` set to `direction`. */
function withArrow(grid: Grid, pos: Position, direction: Direction): Grid {
  return grid.map((row) =>
    row.map((tile) =>
      tile.type === TileType.Arrow &&
      tile.position.row === pos.row &&
      tile.position.col === pos.col
        ? { ...tile, direction }
        : tile,
    ),
  );
}

test('sample level 1 is NOT solved by default (arrow points into the wall)', () => {
  const result = simulateGrid(buildGrid(SAMPLE_LEVELS[0]));
  assert.notEqual(result.status, SimulationStatus.Won);
});

test('sample level 1 is solvable by turning the arrow Down', () => {
  const grid = withArrow(buildGrid(SAMPLE_LEVELS[0]), { row: 2, col: 2 }, Direction.Down);
  assert.equal(simulateGrid(grid).status, SimulationStatus.Won);
});

test('sample level 2 is solvable with the intended arrow directions', () => {
  let grid = buildGrid(SAMPLE_LEVELS[1]);
  grid = withArrow(grid, { row: 3, col: 0 }, Direction.Right);
  grid = withArrow(grid, { row: 3, col: 4 }, Direction.Up);
  assert.equal(simulateGrid(grid).status, SimulationStatus.Won);
});

test('getSampleLevel returns a level for any positive id', () => {
  for (let levelId = 1; levelId <= 10; levelId += 1) {
    assert.ok(getSampleLevel(levelId));
  }
});
