import {
  Difficulty,
  Direction,
  GridSize,
  LevelDefinition,
  Position,
  RotationSense,
  StarThresholds,
  Tile,
  TileType,
} from '../../types';
import { rotate, step } from '../../utils/direction';
import { solveLevel } from './solver';

/**
 * Deterministic procedural level generator. It lays a random self-avoiding path
 * from Start to Exit with a number of 90° turns, places a rotatable arrow at
 * each turn pointing the SOLUTION way, then SCRAMBLES every arrow's initial
 * heading so the player must rotate it — guaranteeing a solvable, non-trivial
 * puzzle by construction. Each candidate is then confirmed (and its star
 * thresholds derived) by the brute-force {@link solveLevel}. Generation is
 * seeded by level id, so the catalog is fully reproducible.
 */

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32) — deterministic, no Math.random.
// ---------------------------------------------------------------------------
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const randInt = (rng: Rng, n: number): number => Math.floor(rng() * n);
const posKey = (p: Position): string => `${p.row},${p.col}`;
const inBounds = (p: Position, size: GridSize): boolean =>
  p.row >= 0 && p.row < size.rows && p.col >= 0 && p.col < size.cols;

const HEADINGS = [Direction.Up, Direction.Right, Direction.Down, Direction.Left];

interface PathPlan {
  start: Position;
  startDir: Direction;
  turns: { pos: Position; toDir: Direction }[];
  exit: Position;
  cells: Set<string>;
  pathCells: Position[];
}

/** Lay a self-avoiding path with `turnCount` turns, or null if it gets stuck. */
function tryLayPath(rng: Rng, size: GridSize, turnCount: number): PathPlan | null {
  const start: Position = { row: randInt(rng, size.rows), col: randInt(rng, size.cols) };
  const startDir = HEADINGS[randInt(rng, 4)];
  let pos = start;
  let dir = startDir;

  const cells = new Set<string>([posKey(pos)]);
  const pathCells: Position[] = [pos];
  const turns: { pos: Position; toDir: Direction }[] = [];
  const maxSegment = Math.max(2, Math.min(size.rows, size.cols) - 1);

  for (let segment = 0; segment <= turnCount; segment += 1) {
    const length = 1 + randInt(rng, maxSegment);
    for (let s = 0; s < length; s += 1) {
      const next = step(pos, dir);
      if (!inBounds(next, size) || cells.has(posKey(next))) {
        return null;
      }
      pos = next;
      cells.add(posKey(pos));
      pathCells.push(pos);
    }
    if (segment < turnCount) {
      const sense = randInt(rng, 2) === 0 ? RotationSense.Clockwise : RotationSense.CounterClockwise;
      const newDir = rotate(dir, sense);
      turns.push({ pos, toDir: newDir });
      dir = newDir;
    }
  }

  return { start, startDir, turns, exit: pos, cells, pathCells };
}

function scramble(rng: Rng, solution: Direction): Direction {
  // Rotate clockwise 1–3 steps so the initial heading never equals the solution.
  let dir = solution;
  const steps = 1 + randInt(rng, 3);
  for (let i = 0; i < steps; i += 1) {
    dir = rotate(dir, RotationSense.Clockwise);
  }
  return dir;
}

function buildTiles(id: number, plan: PathPlan, rng: Rng, size: GridSize): Tile[] {
  let seq = 0;
  const mkId = (prefix: string): string => `l${id}-${prefix}-${(seq += 1)}`;

  const tiles: Tile[] = [
    { type: TileType.Start, id: mkId('start'), position: plan.start, direction: plan.startDir },
    { type: TileType.Exit, id: mkId('exit'), position: plan.exit },
  ];

  for (const turn of plan.turns) {
    tiles.push({
      type: TileType.Arrow,
      id: mkId('arrow'),
      position: turn.pos,
      direction: scramble(rng, turn.toDir),
      rotatable: true,
    });
  }

  // Decoy walls on off-path cells (never block the intended solution).
  const decoyCount = randInt(rng, Math.max(1, Math.floor((size.rows * size.cols) / 12)));
  for (let d = 0; d < decoyCount; d += 1) {
    const candidate: Position = { row: randInt(rng, size.rows), col: randInt(rng, size.cols) };
    if (!plan.cells.has(posKey(candidate))) {
      tiles.push({ type: TileType.Wall, id: mkId('wall'), position: candidate });
    }
  }

  return tiles;
}

/**
 * Try to enrich a solvable base level with one Ice tile on a straight path cell.
 * Ice is mechanically identical to floor, so this is always safe; it adds visual
 * variety. Returns the (possibly enriched) tile list.
 */
function enrichWithIce(tiles: Tile[], plan: PathPlan, rng: Rng): Tile[] {
  const turnPositions = new Set(plan.turns.map((t) => posKey(t.pos)));
  const candidates = plan.pathCells.filter(
    (p) =>
      posKey(p) !== posKey(plan.start) &&
      posKey(p) !== posKey(plan.exit) &&
      !turnPositions.has(posKey(p)),
  );
  if (candidates.length === 0) {
    return tiles;
  }
  const target = candidates[randInt(rng, candidates.length)];
  return [
    ...tiles,
    { type: TileType.Ice, id: `ice-${posKey(target)}`, position: target },
  ];
}

function starThresholds(minMoves: number): StarThresholds {
  return {
    threeStarMoves: minMoves,
    twoStarMoves: minMoves + Math.max(2, Math.ceil(minMoves / 2)),
  };
}

interface Tier {
  difficulty: Difficulty;
  size: GridSize;
  minTurns: number;
  maxTurns: number;
}

function tierFor(progress: number): Tier {
  // progress in [0, 1)
  if (progress < 0.25) {
    return { difficulty: Difficulty.Easy, size: { rows: 5, cols: 5 }, minTurns: 1, maxTurns: 2 };
  }
  if (progress < 0.5) {
    return { difficulty: Difficulty.Medium, size: { rows: 6, cols: 6 }, minTurns: 2, maxTurns: 3 };
  }
  if (progress < 0.8) {
    return { difficulty: Difficulty.Hard, size: { rows: 7, cols: 7 }, minTurns: 3, maxTurns: 4 };
  }
  return { difficulty: Difficulty.Expert, size: { rows: 8, cols: 8 }, minTurns: 4, maxTurns: 5 };
}

const MAX_ATTEMPTS = 400;

/** Generate one fully-validated, solvable level for the given id. */
function generateLevel(id: number, tier: Tier): LevelDefinition {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const rng = mulberry32(id * 100003 + attempt);
    const turnCount = tier.minTurns + randInt(rng, tier.maxTurns - tier.minTurns + 1);
    const plan = tryLayPath(rng, tier.size, turnCount);
    if (!plan || plan.turns.length === 0) {
      continue;
    }

    let tiles = buildTiles(id, plan, rng, tier.size);
    if (randInt(rng, 2) === 0) {
      tiles = enrichWithIce(tiles, plan, rng);
    }

    const candidate: LevelDefinition = {
      id,
      name: `${tier.difficulty} ${id}`,
      difficulty: tier.difficulty,
      size: tier.size,
      tiles,
      par: plan.turns.length,
      stars: starThresholds(plan.turns.length),
    };

    const solution = solveLevel(candidate);
    if (solution.solved && (solution.minMoves ?? 0) >= 1) {
      const minMoves = solution.minMoves ?? plan.turns.length;
      return { ...candidate, par: minMoves, stars: starThresholds(minMoves) };
    }
  }

  // Deterministic fallback: a guaranteed-solvable single-turn level.
  return fallbackLevel(id, tier);
}

function fallbackLevel(id: number, tier: Tier): LevelDefinition {
  const tiles: Tile[] = [
    { type: TileType.Start, id: `l${id}-start`, position: { row: 0, col: 0 }, direction: Direction.Right },
    // Arrow scrambled away from the Down solution.
    { type: TileType.Arrow, id: `l${id}-arrow`, position: { row: 0, col: 2 }, direction: Direction.Left, rotatable: true },
    { type: TileType.Exit, id: `l${id}-exit`, position: { row: 2, col: 2 } },
  ];
  const candidate: LevelDefinition = {
    id,
    name: `${tier.difficulty} ${id}`,
    difficulty: tier.difficulty,
    size: { rows: Math.max(3, tier.size.rows), cols: Math.max(3, tier.size.cols) },
    tiles,
    par: 1,
    stars: starThresholds(2),
  };
  const solution = solveLevel(candidate);
  const minMoves = solution.minMoves ?? 2;
  return { ...candidate, par: minMoves, stars: starThresholds(minMoves) };
}

/**
 * Hand-authored introductory levels that each showcase one special mechanic.
 * Tiles are authored with the arrow SCRAMBLED away from the solution so the
 * player must rotate it; `solveLevel` derives par/stars and the emit step
 * asserts solvability.
 */
function buildCurated(
  id: number,
  name: string,
  size: GridSize,
  tiles: Tile[],
): LevelDefinition {
  const base: LevelDefinition = {
    id,
    name,
    difficulty: Difficulty.Easy,
    size,
    tiles,
    par: 1,
    stars: starThresholds(2),
  };
  const solution = solveLevel(base);
  const minMoves = solution.minMoves ?? 1;
  return { ...base, par: minMoves, stars: starThresholds(minMoves) };
}

function curatedLevels(): LevelDefinition[] {
  const size: GridSize = { rows: 5, cols: 5 };
  return [
    // Teleporter: turn the arrow Down into the teleporter, warp, reach the exit.
    buildCurated(1, 'Warp', size, [
      { type: TileType.Start, id: 'c1-start', position: { row: 0, col: 0 }, direction: Direction.Right },
      { type: TileType.Arrow, id: 'c1-arrow', position: { row: 0, col: 2 }, direction: Direction.Up, rotatable: true },
      { type: TileType.Teleporter, id: 'c1-tpA', position: { row: 2, col: 2 }, channel: 1 },
      { type: TileType.Teleporter, id: 'c1-tpB', position: { row: 2, col: 0 }, channel: 1 },
      { type: TileType.Exit, id: 'c1-exit', position: { row: 4, col: 0 } },
    ]),
    // One-Way: the gate only admits a downward arrow.
    buildCurated(2, 'One Way', size, [
      { type: TileType.Start, id: 'c2-start', position: { row: 0, col: 0 }, direction: Direction.Right },
      { type: TileType.Arrow, id: 'c2-arrow', position: { row: 0, col: 2 }, direction: Direction.Left, rotatable: true },
      { type: TileType.OneWay, id: 'c2-ow', position: { row: 2, col: 2 }, allowedEntry: [Direction.Down] },
      { type: TileType.Exit, id: 'c2-exit', position: { row: 4, col: 2 } },
    ]),
    // Breakable: cross it once on the way to the exit.
    buildCurated(3, 'Fragile', size, [
      { type: TileType.Start, id: 'c3-start', position: { row: 2, col: 0 }, direction: Direction.Right },
      { type: TileType.Arrow, id: 'c3-arrow', position: { row: 2, col: 2 }, direction: Direction.Right, rotatable: true },
      { type: TileType.Breakable, id: 'c3-brk', position: { row: 1, col: 2 } },
      { type: TileType.Exit, id: 'c3-exit', position: { row: 0, col: 2 } },
    ]),
    // Switch: flip the gate open, then pass through the (now passable) wall.
    buildCurated(4, 'The Switch', size, [
      { type: TileType.Start, id: 'c4-start', position: { row: 0, col: 0 }, direction: Direction.Right },
      { type: TileType.Arrow, id: 'c4-arrow', position: { row: 0, col: 2 }, direction: Direction.Left, rotatable: true },
      { type: TileType.Switch, id: 'c4-sw', position: { row: 2, col: 2 }, switchGroup: 'gate', initiallyActive: true },
      { type: TileType.Wall, id: 'c4-wall', position: { row: 3, col: 2 }, switchGroup: 'gate' },
      { type: TileType.Exit, id: 'c4-exit', position: { row: 4, col: 2 } },
    ]),
    // Speed: leap over the wall to land on the exit.
    buildCurated(5, 'Boost', size, [
      { type: TileType.Start, id: 'c5-start', position: { row: 0, col: 0 }, direction: Direction.Right },
      { type: TileType.Arrow, id: 'c5-arrow', position: { row: 0, col: 2 }, direction: Direction.Left, rotatable: true },
      { type: TileType.Speed, id: 'c5-spd', position: { row: 2, col: 2 }, multiplier: 2 },
      { type: TileType.Wall, id: 'c5-wall', position: { row: 3, col: 2 } },
      { type: TileType.Exit, id: 'c5-exit', position: { row: 4, col: 2 } },
    ]),
    // Rotate: the rotate pad turns the arrow's heading automatically.
    buildCurated(6, 'Spin', size, [
      { type: TileType.Start, id: 'c6-start', position: { row: 0, col: 0 }, direction: Direction.Right },
      { type: TileType.Arrow, id: 'c6-arrow', position: { row: 0, col: 2 }, direction: Direction.Up, rotatable: true },
      {
        type: TileType.Rotate,
        id: 'c6-rot',
        position: { row: 2, col: 2 },
        effect: { kind: 'TURN', sense: RotationSense.Clockwise },
      },
      { type: TileType.Exit, id: 'c6-exit', position: { row: 2, col: 0 } },
    ]),
  ];
}

/** Generate the full reproducible catalog of `count` levels (default 100). */
export function generateCatalog(count = 100): LevelDefinition[] {
  const curated = curatedLevels();
  const levels: LevelDefinition[] = [...curated];
  for (let id = curated.length + 1; id <= count; id += 1) {
    const tier = tierFor((id - 1) / count);
    levels.push(generateLevel(id, tier));
  }
  return levels;
}
