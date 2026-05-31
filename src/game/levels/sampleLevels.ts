import {
  Difficulty,
  Direction,
  LevelDefinition,
  RotationSense,
  StarThresholds,
  Tile,
  TileType,
} from '../../types';

/**
 * PLACEHOLDER level content for Phase 4 rendering and Phase 5 playtesting.
 * The real 100+ level JSON catalog and its loader are built in Phase 6; this
 * file gives the Game screen something real to render and simulate in the
 * meantime. The playable levels (1–2) use only basic tiles so the Phase 3
 * engine resolves them correctly; the "Showcase" level exists to demonstrate
 * that every tile type renders (its special tiles gain behaviour in Phase 5).
 */

let seq = 0;
const id = (prefix: string): string => {
  seq += 1;
  return `${prefix}-${seq}`;
};

const start = (row: number, col: number, direction: Direction): Tile => ({
  type: TileType.Start,
  id: id('start'),
  position: { row, col },
  direction,
});
const exit = (row: number, col: number): Tile => ({
  type: TileType.Exit,
  id: id('exit'),
  position: { row, col },
});
const wall = (row: number, col: number): Tile => ({
  type: TileType.Wall,
  id: id('wall'),
  position: { row, col },
});
const arrow = (row: number, col: number, direction: Direction, rotatable = true): Tile => ({
  type: TileType.Arrow,
  id: id('arrow'),
  position: { row, col },
  direction,
  rotatable,
});
const teleporter = (row: number, col: number, channel: number): Tile => ({
  type: TileType.Teleporter,
  id: id('tp'),
  position: { row, col },
  channel,
});
const speed = (row: number, col: number): Tile => ({
  type: TileType.Speed,
  id: id('speed'),
  position: { row, col },
  multiplier: 2,
});
const ice = (row: number, col: number): Tile => ({
  type: TileType.Ice,
  id: id('ice'),
  position: { row, col },
});
const oneWay = (row: number, col: number, allowedEntry: Direction[]): Tile => ({
  type: TileType.OneWay,
  id: id('oneway'),
  position: { row, col },
  allowedEntry,
});
const breakable = (row: number, col: number): Tile => ({
  type: TileType.Breakable,
  id: id('breakable'),
  position: { row, col },
});
const rotate = (row: number, col: number): Tile => ({
  type: TileType.Rotate,
  id: id('rotate'),
  position: { row, col },
  effect: { kind: 'TURN', sense: RotationSense.Clockwise },
});
const switchTile = (row: number, col: number, group: string): Tile => ({
  type: TileType.Switch,
  id: id('switch'),
  position: { row, col },
  switchGroup: group,
  initiallyActive: true,
});

const stars = (three: number, two: number): StarThresholds => ({
  threeStarMoves: three,
  twoStarMoves: two,
});

export const SAMPLE_LEVELS: readonly LevelDefinition[] = [
  // 1 — First Turn: rotate the single arrow from Right to Down to avoid the wall.
  {
    id: 1,
    name: 'First Turn',
    difficulty: Difficulty.Easy,
    size: { rows: 5, cols: 5 },
    par: 1,
    stars: stars(1, 2),
    tiles: [
      start(2, 0, Direction.Right),
      arrow(2, 2, Direction.Right),
      wall(2, 3),
      exit(4, 2),
    ],
  },
  // 2 — Detour: route down, across, then up using two arrows.
  {
    id: 2,
    name: 'Detour',
    difficulty: Difficulty.Easy,
    size: { rows: 6, cols: 6 },
    par: 2,
    stars: stars(2, 4),
    tiles: [
      start(0, 0, Direction.Down),
      wall(0, 2),
      wall(1, 2),
      arrow(3, 0, Direction.Up),
      arrow(3, 4, Direction.Left),
      exit(0, 4),
    ],
  },
  // 3 — Showcase: renders every tile type (special behaviour arrives in Phase 5).
  {
    id: 3,
    name: 'Showcase',
    difficulty: Difficulty.Medium,
    size: { rows: 6, cols: 6 },
    par: 4,
    stars: stars(4, 7),
    tiles: [
      start(0, 0, Direction.Right),
      arrow(0, 3, Direction.Down),
      teleporter(2, 1, 1),
      teleporter(4, 4, 1),
      speed(2, 3),
      ice(3, 3),
      oneWay(1, 5, [Direction.Down]),
      breakable(4, 1),
      rotate(5, 2),
      switchTile(5, 5, 'gate-a'),
      wall(3, 0),
      wall(3, 5),
      exit(5, 0),
    ],
  },
];

/** Returns a sample level for the given 1-based id, cycling through the set. */
export function getSampleLevel(levelId: number): LevelDefinition {
  const index = (Math.max(1, levelId) - 1) % SAMPLE_LEVELS.length;
  return SAMPLE_LEVELS[index];
}
