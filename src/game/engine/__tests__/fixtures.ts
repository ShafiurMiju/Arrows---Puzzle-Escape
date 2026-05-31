import {
  Difficulty,
  Direction,
  LevelDefinition,
  RotateEffect,
  Tile,
  TileType,
} from '../../../types';

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

export const teleporter = (row: number, col: number, channel: number): Tile => ({
  type: TileType.Teleporter,
  id: nextId('tp'),
  position: { row, col },
  channel,
});

export const speed = (row: number, col: number, multiplier = 2): Tile => ({
  type: TileType.Speed,
  id: nextId('speed'),
  position: { row, col },
  multiplier,
});

export const rotateTile = (row: number, col: number, effect: RotateEffect): Tile => ({
  type: TileType.Rotate,
  id: nextId('rotate'),
  position: { row, col },
  effect,
});

export const oneWay = (row: number, col: number, allowedEntry: Direction[]): Tile => ({
  type: TileType.OneWay,
  id: nextId('oneway'),
  position: { row, col },
  allowedEntry,
});

export const breakable = (row: number, col: number): Tile => ({
  type: TileType.Breakable,
  id: nextId('breakable'),
  position: { row, col },
});

export const switchTile = (
  row: number,
  col: number,
  switchGroup: string,
  initiallyActive = true,
): Tile => ({
  type: TileType.Switch,
  id: nextId('switch'),
  position: { row, col },
  switchGroup,
  initiallyActive,
});

export const switchWall = (row: number, col: number, switchGroup: string): Tile => ({
  type: TileType.Wall,
  id: nextId('wall'),
  position: { row, col },
  switchGroup,
});

export const makeLevel = (rows: number, cols: number, tiles: Tile[]): LevelDefinition => ({
  id: 1,
  difficulty: Difficulty.Easy,
  size: { rows, cols },
  tiles,
  par: 0,
  stars: { threeStarMoves: 0, twoStarMoves: 0 },
});
