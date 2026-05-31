import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildGrid } from '../../engine';
import { Difficulty, Direction, LevelDefinition, TileType } from '../../../types';
import { findHint } from '../hint';

const level: LevelDefinition = {
  id: 1,
  difficulty: Difficulty.Easy,
  size: { rows: 1, cols: 3 },
  tiles: [
    { type: TileType.Start, id: 's', position: { row: 0, col: 0 }, direction: Direction.Right },
    { type: TileType.Arrow, id: 'a1', position: { row: 0, col: 1 }, direction: Direction.Up, rotatable: true },
    { type: TileType.Exit, id: 'e', position: { row: 0, col: 2 } },
  ],
  par: 1,
  stars: { threeStarMoves: 1, twoStarMoves: 2 },
};

test('findHint suggests the first arrow not at its solution heading', () => {
  const grid = buildGrid(level);
  assert.deepEqual(findHint(grid, { a1: Direction.Right }), {
    tileId: 'a1',
    direction: Direction.Right,
  });
});

test('findHint returns null when every arrow already matches the solution', () => {
  const grid = buildGrid(level); // a1 is authored facing Up
  assert.equal(findHint(grid, { a1: Direction.Up }), null);
});
