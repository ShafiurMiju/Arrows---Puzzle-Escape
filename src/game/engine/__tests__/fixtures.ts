import { Difficulty, Direction, LevelDefinition, Tile, TileType } from '../../../types';

let counter = 0;
const nextId = (prefix: string): string => {
  counter += 1;
  return `${prefix}-${counter}`;
};

export const start = (row: number, col: number, direction: Direction): Tile => ({
  type: TileType.Start,
  id: nextId('start'),
  position: { row, col },
  direction,
});

export const exit = (row: number, col: number): Tile => ({
  type: TileType.Exit,
  id: nextId('exit'),
  position: { row, col },
});

export const wall = (row: number, col: number): Tile => ({
  type: TileType.Wall,
  id: nextId('wall'),
  position: { row, col },
});

export const arrow = (
  row: number,
  col: number,
  direction: Direction,
  rotatable = true,
): Tile => ({
  type: TileType.Arrow,
  id: nextId('arrow'),
  position: { row, col },
  direction,
  rotatable,
});

export const ice = (row: number, col: number): Tile => ({
  type: TileType.Ice,
  id: nextId('ice'),
  position: { row, col },
});

export const makeLevel = (rows: number, cols: number, tiles: Tile[]): LevelDefinition => ({
  id: 1,
  difficulty: Difficulty.Easy,
  size: { rows, cols },
  tiles,
  par: 0,
  stars: { threeStarMoves: 0, twoStarMoves: 0 },
});
