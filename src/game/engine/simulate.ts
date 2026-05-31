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
  TileEvent,
  TileEventKind,
  TileType,
} from '../../types';
import { assertNever } from '../../utils/assertNever';
import { step as advance, vectorFor } from '../../utils/direction';
import { applyRotate, entryBlock } from '../tiles/behavior';
import { buildWorld, posKey, stateKey, toggleSwitch, WorldState } from '../tiles/world';
import { buildGrid, findStart, inBounds, tileAt } from './buildGrid';

export interface SimulateOptions {
  /** Hard cap on settled ticks before declaring an infinite loop (safety net). */
  readonly maxSteps?: number;
}

/**
 * Deterministic puzzle simulation. From the Start tile, the arrow advances one
 * cell per tick along its heading; each entered tile is resolved (basic +
 * special mechanics), with special tiles able to chain WITHIN a tick (a Speed
 * tile leaps, a Teleporter warps). The full ordered step list is returned for
 * the Phase 8 animator to replay; win/lose is decided here.
 *
 * Termination: the future is a pure function of the settled state
 * (position, heading, broken set, switch states), a finite space; every tick
 * either ends the run or records a new settled key, and a repeated key is an
 * infinite loop. See the design ruling in `game/tiles/world.ts` (stateKey).
 */
export function simulateGrid(grid: Grid, options: SimulateOptions = {}): SimulationResult {
  const start = findStart(grid);
  if (!start) {
    throw new Error('simulateGrid: the level has no Start tile');
  }

  const world = buildWorld(grid);
  // The `visited` set is the real termination oracle; this cap is a backstop
  // sized so it can never pre-empt a valid (non-repeating) path.
  const maxSteps = options.maxSteps ?? computeStepCap(grid, world);
  let state: ArrowState = { position: start.position, direction: start.direction };
  const steps: SimulationStep[] = [];
  const visited = new Set<string>([stateKey(state, world)]);

  const lose = (reason: FailureReason, at: Position): SimulationResult => ({
    status: SimulationStatus.Lost,
    steps,
    failureReason: reason,
    failureAt: at,
    cellsTravelled: steps.length,
  });

  for (let tick = 0; tick < maxSteps; tick += 1) {
    const target = advance(state.position, state.direction);

    if (!inBounds(grid, target)) {
      return lose(FailureReason.OutOfBounds, state.position);
    }

    const blocked = entryBlock(tileAt(grid, target), state.direction, world);
    if (blocked) {
      return lose(blocked, target);
    }

    const resolution = resolveOn(
      grid,
      world,
      steps,
      state.position,
      target,
      state.direction,
      StepKind.Move,
    );

    if (resolution.kind === 'WIN') {
      return { status: SimulationStatus.Won, steps, cellsTravelled: steps.length };
    }
    if (resolution.kind === 'LOSE') {
      return lose(resolution.reason, resolution.at);
    }

    state = { position: resolution.position, direction: resolution.heading };

    const key = stateKey(state, world);
    if (visited.has(key)) {
      return lose(FailureReason.InfiniteLoop, state.position);
    }
    visited.add(key);
  }

  return lose(FailureReason.InfiniteLoop, state.position);
}

export function simulateLevel(level: LevelDefinition, options?: SimulateOptions): SimulationResult {
  return simulateGrid(buildGrid(level), options);
}

// ---------------------------------------------------------------------------
// Within-tick tile resolution
// ---------------------------------------------------------------------------

type Resolution =
  | { readonly kind: 'WIN' }
  | { readonly kind: 'LOSE'; readonly reason: FailureReason; readonly at: Position }
  | { readonly kind: 'SETTLE'; readonly position: Position; readonly heading: Direction };

/**
 * Resolve the arrow ENTERING the tile at `pos` (already passed `entryBlock`),
 * having travelled from `fromPos` via `arrivalKind`. Records the arriving step,
 * applies the tile's effect, and — for Speed/Teleporter — chains within the tick.
 * Returns the settled state, or a win/lose outcome.
 */
function resolveOn(
  grid: Grid,
  world: WorldState,
  steps: SimulationStep[],
  fromPos: Position,
  pos: Position,
  heading: Direction,
  arrivalKind: StepKind,
): Resolution {
  const tile = tileAt(grid, pos);
  const events: TileEvent[] = [];

  if (tile.type === TileType.Breakable && !world.broken.has(tile.id)) {
    world.broken.add(tile.id);
    events.push({ kind: TileEventKind.Broken, tileId: tile.id, position: pos });
  } else if (tile.type === TileType.Switch) {
    toggleSwitch(world, tile.switchGroup);
    events.push({ kind: TileEventKind.SwitchToggled, tileId: tile.id, position: pos });
  }

  switch (tile.type) {
    case TileType.Exit:
      pushStep(steps, fromPos, heading, pos, heading, arrivalKind, events);
      return { kind: 'WIN' };

    case TileType.Arrow: {
      const next = tile.direction;
      pushStep(steps, fromPos, heading, pos, next, arrivalKind, events);
      return { kind: 'SETTLE', position: pos, heading: next };
    }

    case TileType.Rotate: {
      const next = applyRotate(heading, tile.effect);
      pushStep(steps, fromPos, heading, pos, next, StepKind.Rotate, events);
      return { kind: 'SETTLE', position: pos, heading: next };
    }

    case TileType.Ice:
      // Frictionless glide. Mechanically identical to Empty in this continuous
      // engine (no STOP concept to override); the SLIDE kind is for animation.
      pushStep(steps, fromPos, heading, pos, heading, StepKind.Slide, events);
      return { kind: 'SETTLE', position: pos, heading };

    case TileType.Teleporter: {
      pushStep(steps, fromPos, heading, pos, heading, arrivalKind, events);
      const partner = world.pairMap.get(posKey(pos));
      if (!partner) {
        return { kind: 'SETTLE', position: pos, heading }; // unpaired → inert floor
      }
      // Warp, heading preserved. Anti-bounce: we settle ON the partner and do
      // NOT resolve it, so A→B never instantly bounces back to A.
      pushStep(steps, pos, heading, partner, heading, StepKind.Teleport, []);
      return { kind: 'SETTLE', position: partner, heading };
    }

    case TileType.Speed: {
      pushStep(steps, fromPos, heading, pos, heading, arrivalKind, events);
      const multiplier = Math.max(1, tile.multiplier);
      const vector = vectorFor(heading);

      let landing = pos;
      for (let leap = 1; leap <= multiplier; leap += 1) {
        const candidate: Position = {
          row: pos.row + vector.dRow * leap,
          col: pos.col + vector.dCol * leap,
        };
        if (!inBounds(grid, candidate)) {
          // Flew off the board mid-leap; record the partial leap (if any) and
          // fail at the last in-bounds cell.
          if (landing.row !== pos.row || landing.col !== pos.col) {
            pushStep(steps, pos, heading, landing, heading, StepKind.Speed, []);
          }
          return { kind: 'LOSE', reason: FailureReason.OutOfBounds, at: landing };
        }
        landing = candidate;
      }

      // Intermediate cells are leaped over (effects skipped); the LANDING cell
      // is resolved fully by its own behaviour.
      const blocked = entryBlock(tileAt(grid, landing), heading, world);
      if (blocked) {
        pushStep(steps, pos, heading, landing, heading, StepKind.Speed, []);
        return { kind: 'LOSE', reason: blocked, at: landing };
      }
      return resolveOn(grid, world, steps, pos, landing, heading, StepKind.Speed);
    }

    case TileType.Wall:
      // Reached only for a deactivated switch-wall (passable); solid walls are
      // rejected by entryBlock. Treat as floor.
      pushStep(steps, fromPos, heading, pos, heading, arrivalKind, events);
      return { kind: 'SETTLE', position: pos, heading };

    case TileType.Empty:
    case TileType.Start:
    case TileType.OneWay:
    case TileType.Breakable:
    case TileType.Switch:
      pushStep(steps, fromPos, heading, pos, heading, arrivalKind, events);
      return { kind: 'SETTLE', position: pos, heading };

    default:
      return assertNever(tile);
  }
}

function pushStep(
  steps: SimulationStep[],
  fromPos: Position,
  fromDir: Direction,
  toPos: Position,
  toDir: Direction,
  kind: StepKind,
  events: TileEvent[],
): void {
  steps.push({
    index: steps.length,
    from: { position: fromPos, direction: fromDir },
    to: { position: toPos, direction: toDir },
    kind,
    events,
  });
}

const HARD_STEP_CEILING = 1_000_000;

/**
 * Upper bound on distinct settled states: cells × 4 headings × 2^switchGroups ×
 * 2^breakables. Sized so the maxSteps backstop never pre-empts a valid path,
 * while a hard ceiling guards against pathological inputs.
 */
function computeStepCap(grid: Grid, world: WorldState): number {
  const cells = grid.length * (grid[0]?.length ?? 0);
  const switchGroups = Object.keys(world.switchStates).length;
  let breakables = 0;
  for (const row of grid) {
    for (const tile of row) {
      if (tile.type === TileType.Breakable) {
        breakables += 1;
      }
    }
  }
  const reachable = cells * 4 * 2 ** switchGroups * 2 ** breakables;
  return Math.min(HARD_STEP_CEILING, Math.max(gameConfig.maxSimulationSteps, reachable));
}
