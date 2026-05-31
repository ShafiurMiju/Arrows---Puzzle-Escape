import { gameConfig } from '../../constants/gameConfig';
import {
  ArrowState,
  Direction,
  FailureReason,
  Grid,
  LevelDefinition,
  Position,
  SimulationResult,
  SimulationStatus,
  SimulationStep,
  StepKind,
  Tile,
  TileType,
} from '../../types';
import { step as advance } from '../../utils/direction';
import { buildGrid, findStart, inBounds, tileAt } from './buildGrid';

export interface SimulateOptions {
  /** Hard cap on steps before declaring an infinite loop (safety net). */
  readonly maxSteps?: number;
}

/**
 * The deterministic core: starting from the Start tile, advance the arrow one
 * cell at a time along its heading, applying each tile's behaviour, until it
 * reaches the Exit (win) or fails. The full ordered step list is returned so the
 * animation layer (Phase 8) can simply replay it — it never re-runs the rules.
 *
 * Phase 3 implements the basic tiles (Start, Empty, Exit, Wall, Arrow) plus the
 * out-of-bounds / infinite-loop / stuck detectors. Special tiles (Teleporter,
 * Speed, Rotate, OneWay, Breakable, Ice, Switch) are inert pass-through
 * placeholders here; their behaviour is implemented in Phase 5 (tile mechanics).
 */
export function simulateGrid(grid: Grid, options: SimulateOptions = {}): SimulationResult {
  const maxSteps = options.maxSteps ?? gameConfig.maxSimulationSteps;

  const start = findStart(grid);
  if (!start) {
    throw new Error('simulateGrid: the level has no Start tile');
  }

  let state: ArrowState = { position: start.position, direction: start.direction };
  const steps: SimulationStep[] = [];
  // Loop detection: the future is fully determined by (position, heading) while
  // the grid is immutable, so revisiting a state means the path repeats forever.
  const visited = new Set<string>([stateKey(state)]);
  let cellsTravelled = 0;

  const lose = (reason: FailureReason, at: Position): SimulationResult => ({
    status: SimulationStatus.Lost,
    steps,
    failureReason: reason,
    failureAt: at,
    cellsTravelled,
  });

  for (let i = 0; i < maxSteps; i += 1) {
    const target = advance(state.position, state.direction);

    if (!inBounds(grid, target)) {
      return lose(FailureReason.OutOfBounds, state.position);
    }

    const tile = tileAt(grid, target);

    const blocked = entryBlock(tile, state.direction);
    if (blocked) {
      return lose(blocked, target);
    }

    const from = state;
    const outcome = onEnter(tile, state.direction);

    if (outcome.kind === 'WIN') {
      const to: ArrowState = { position: target, direction: state.direction };
      steps.push({ index: steps.length, from, to, kind: StepKind.Move, events: [] });
      cellsTravelled += 1;
      return { status: SimulationStatus.Won, steps, cellsTravelled };
    }

    if (outcome.kind === 'LOSE') {
      return lose(outcome.reason, target);
    }

    const to: ArrowState = { position: target, direction: outcome.heading };
    steps.push({ index: steps.length, from, to, kind: StepKind.Move, events: [] });
    cellsTravelled += 1;
    state = to;

    const key = stateKey(state);
    if (visited.has(key)) {
      return lose(FailureReason.InfiniteLoop, state.position);
    }
    visited.add(key);
  }

  // Exhausted the safety cap without resolving — treat as an infinite loop.
  return lose(FailureReason.InfiniteLoop, state.position);
}

/** Build the grid from a level definition and simulate it. */
export function simulateLevel(level: LevelDefinition, options?: SimulateOptions): SimulationResult {
  return simulateGrid(buildGrid(level), options);
}

// ---------------------------------------------------------------------------
// Tile resolution
// ---------------------------------------------------------------------------

/** Outcome of the arrow landing on a tile. */
type EnterOutcome =
  | { readonly kind: 'CONTINUE'; readonly heading: Direction }
  | { readonly kind: 'WIN' }
  | { readonly kind: 'LOSE'; readonly reason: FailureReason };

/** Pre-entry gate: may the arrow move INTO this tile while travelling `heading`? */
function entryBlock(tile: Tile, _heading: Direction): FailureReason | null {
  switch (tile.type) {
    case TileType.Wall:
      return FailureReason.HitWall;
    // Special-tile entry rules (e.g. OneWay directional gating) arrive in Phase 5.
    default:
      return null;
  }
}

/** Effect applied once the arrow lands on a tile. */
function onEnter(tile: Tile, heading: Direction): EnterOutcome {
  switch (tile.type) {
    case TileType.Exit:
      return { kind: 'WIN' };
    case TileType.Arrow:
      return { kind: 'CONTINUE', heading: tile.direction };
    case TileType.Empty:
    case TileType.Start:
      return { kind: 'CONTINUE', heading };
    case TileType.Wall:
      // Unreachable — entryBlock already rejects walls — but keeps this exhaustive.
      return { kind: 'LOSE', reason: FailureReason.HitWall };
    // Inert pass-through placeholders until Phase 5 (tile mechanics):
    case TileType.Teleporter:
    case TileType.Speed:
    case TileType.Rotate:
    case TileType.OneWay:
    case TileType.Breakable:
    case TileType.Ice:
    case TileType.Switch:
      return { kind: 'CONTINUE', heading };
    default:
      return assertNever(tile);
  }
}

const stateKey = (s: ArrowState): string => `${s.position.row},${s.position.col},${s.direction}`;

function assertNever(value: never): never {
  throw new Error(`simulate: unhandled tile ${JSON.stringify(value)}`);
}
