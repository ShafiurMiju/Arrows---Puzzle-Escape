import { Direction, Grid, LevelDefinition, SimulationStatus, TileType } from '../../types';
import { ALL_DIRECTIONS } from '../../utils/direction';
import { buildGrid, simulateGrid } from '../engine';

/**
 * Brute-force level solver. Enumerates every assignment of headings to the
 * rotatable arrow tiles, simulates each, and returns the winning assignment that
 * needs the fewest clockwise rotations from the authored directions.
 *
 * Uses: level validation (is it solvable at all?), star-threshold derivation
 * (the minimum-move solution = par), and the hint system (Phase 10).
 */
export interface SolveResult {
  readonly solved: boolean;
  /** Winning heading per rotatable arrow tile id (the min-move solution). */
  readonly configuration?: Readonly<Record<string, Direction>>;
  /** Minimum total clockwise taps to reach a winning configuration. */
  readonly minMoves?: number;
}

/** 4^11 ≈ 4.2M — a guard so a pathological level can't hang the solver. */
const MAX_BRUTE_FORCE_ARROWS = 11;

const directionIndex = (dir: Direction): number => ALL_DIRECTIONS.indexOf(dir);

/** Clockwise taps to turn `from` into `to` (tap-to-rotate goes clockwise). */
export function clockwiseDistance(from: Direction, to: Direction): number {
  return (directionIndex(to) - directionIndex(from) + ALL_DIRECTIONS.length) % ALL_DIRECTIONS.length;
}

function withArrowDirections(grid: Grid, config: Record<string, Direction>): Grid {
  return grid.map((row) =>
    row.map((tile) =>
      tile.type === TileType.Arrow && tile.rotatable && config[tile.id] !== undefined
        ? { ...tile, direction: config[tile.id] }
        : tile,
    ),
  );
}

export function solveLevel(level: LevelDefinition): SolveResult {
  const grid = buildGrid(level);

  const arrows: { id: string; initial: Direction }[] = [];
  for (const row of grid) {
    for (const tile of row) {
      if (tile.type === TileType.Arrow && tile.rotatable) {
        arrows.push({ id: tile.id, initial: tile.direction });
      }
    }
  }

  if (arrows.length > MAX_BRUTE_FORCE_ARROWS) {
    return { solved: false };
  }

  const combinations = 4 ** arrows.length;
  let best: { config: Record<string, Direction>; moves: number } | null = null;

  for (let mask = 0; mask < combinations; mask += 1) {
    const config: Record<string, Direction> = {};
    let remaining = mask;
    let moves = 0;
    for (const arrow of arrows) {
      const dir = ALL_DIRECTIONS[remaining % 4];
      remaining = Math.floor(remaining / 4);
      config[arrow.id] = dir;
      moves += clockwiseDistance(arrow.initial, dir);
    }

    // Prune: this assignment can't beat the best winning one found so far.
    if (best && moves >= best.moves) {
      continue;
    }

    if (simulateGrid(withArrowDirections(grid, config)).status === SimulationStatus.Won) {
      best = { config, moves };
    }
  }

  if (!best) {
    return { solved: false };
  }
  return { solved: true, configuration: best.config, minMoves: best.moves };
}

/** Convenience predicate used by the validator. */
export function isSolvable(level: LevelDefinition): boolean {
  return solveLevel(level).solved;
}
