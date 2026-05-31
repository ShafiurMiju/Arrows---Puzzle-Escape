import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Direction, FailureReason, SimulationStatus } from '../../../types';
import { simulateLevel } from '../simulate';
import { arrow, exit, ice, makeLevel, start, wall } from './fixtures';

test('straight shot to the exit wins', () => {
  // 1x4: Start (0,0) facing Right, Exit at (0,3).
  const level = makeLevel(1, 4, [start(0, 0, Direction.Right), exit(0, 3)]);
  const result = simulateLevel(level);

  assert.equal(result.status, SimulationStatus.Won);
  assert.equal(result.steps.length, 3);
  assert.equal(result.cellsTravelled, 3);
});

test('an arrow tile redirects the path to the exit', () => {
  // 3x3: Start (0,0) Right → Arrow (0,2) Down → Exit (2,2).
  const level = makeLevel(3, 3, [
    start(0, 0, Direction.Right),
    arrow(0, 2, Direction.Down),
    exit(2, 2),
  ]);
  const result = simulateLevel(level);

  assert.equal(result.status, SimulationStatus.Won);
  // Final heading is Down where it entered the exit.
  const last = result.steps[result.steps.length - 1];
  assert.equal(last.to.direction, Direction.Down);
});

test('hitting a wall loses with HIT_WALL', () => {
  const level = makeLevel(1, 3, [start(0, 0, Direction.Right), wall(0, 1)]);
  const result = simulateLevel(level);

  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.HitWall);
});

test('leaving the grid loses with OUT_OF_BOUNDS', () => {
  // Start at the right edge facing further right.
  const level = makeLevel(1, 3, [start(0, 2, Direction.Right)]);
  const result = simulateLevel(level);

  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.OutOfBounds);
});

test('a cycle of arrows is detected as an infinite loop', () => {
  // 2x3: Start (0,0) Right feeds a 2x2 arrow loop at columns 1-2; no exit.
  const level = makeLevel(2, 3, [
    start(0, 0, Direction.Right),
    arrow(0, 1, Direction.Right),
    arrow(0, 2, Direction.Down),
    arrow(1, 2, Direction.Left),
    arrow(1, 1, Direction.Up),
  ]);
  const result = simulateLevel(level);

  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.InfiniteLoop);
});

test('special tiles are inert pass-through in Phase 3 (engine still resolves)', () => {
  // An Ice tile between start and exit should not break traversal yet.
  const level = makeLevel(1, 4, [
    start(0, 0, Direction.Right),
    ice(0, 1), // Phase 5 gives ice real behaviour; here it must not break traversal.
    exit(0, 3),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
});
