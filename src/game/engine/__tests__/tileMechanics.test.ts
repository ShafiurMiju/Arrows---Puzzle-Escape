import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  Direction,
  FailureReason,
  RotationSense,
  SimulationStatus,
  StepKind,
  TileEventKind,
} from '../../../types';
import { simulateLevel } from '../simulate';
import {
  arrow,
  breakable,
  exit,
  ice,
  makeLevel,
  oneWay,
  rotateTile,
  speed,
  start,
  switchTile,
  switchWall,
  teleporter,
  wall,
} from './fixtures';

const hasKind = (steps: readonly { kind: StepKind }[], kind: StepKind): boolean =>
  steps.some((s) => s.kind === kind);
const hasEvent = (
  steps: readonly { events: readonly { kind: TileEventKind }[] }[],
  kind: TileEventKind,
): boolean => steps.some((s) => s.events.some((e) => e.kind === kind));

// --- Teleporter -----------------------------------------------------------

test('teleporter warps to its paired partner and preserves heading (no infinite bounce)', () => {
  const level = makeLevel(3, 3, [
    start(0, 0, Direction.Right),
    teleporter(0, 2, 1),
    teleporter(2, 0, 1),
    exit(2, 2),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(hasKind(result.steps, StepKind.Teleport), 'should emit a TELEPORT step');
});

test('an unpaired teleporter acts as inert floor', () => {
  const level = makeLevel(1, 3, [start(0, 0, Direction.Right), teleporter(0, 1, 9), exit(0, 2)]);
  assert.equal(simulateLevel(level).status, SimulationStatus.Won);
});

// --- Speed ----------------------------------------------------------------

test('speed leaps over a wall that would otherwise block the path', () => {
  const level = makeLevel(1, 5, [
    start(0, 0, Direction.Right),
    speed(0, 1),
    wall(0, 2),
    exit(0, 4),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(hasKind(result.steps, StepKind.Speed), 'should emit a SPEED step');
});

test('without speed the same wall blocks the path (control)', () => {
  const level = makeLevel(1, 5, [start(0, 0, Direction.Right), wall(0, 2), exit(0, 4)]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.HitWall);
});

test('speed can overshoot the exit (intermediate exit is leaped over)', () => {
  // Leap from (0,1) lands on (0,3), skipping the exit at (0,2); then crashes.
  const level = makeLevel(1, 5, [
    start(0, 0, Direction.Right),
    speed(0, 1),
    exit(0, 2),
    wall(0, 4),
  ]);
  assert.notEqual(simulateLevel(level).status, SimulationStatus.Won);
});

test('speed leaping off the board is out of bounds', () => {
  const level = makeLevel(1, 5, [start(0, 2, Direction.Right), speed(0, 3)]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.OutOfBounds);
});

// --- Rotate ---------------------------------------------------------------

test('rotate (TURN clockwise) redirects the arrow', () => {
  const level = makeLevel(3, 3, [
    start(0, 0, Direction.Right),
    rotateTile(0, 2, { kind: 'TURN', sense: RotationSense.Clockwise }),
    exit(2, 2),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(hasKind(result.steps, StepKind.Rotate));
});

test('rotate (SET) forces an absolute heading', () => {
  const level = makeLevel(3, 3, [
    start(0, 0, Direction.Right),
    rotateTile(0, 2, { kind: 'SET', direction: Direction.Down }),
    exit(2, 2),
  ]);
  assert.equal(simulateLevel(level).status, SimulationStatus.Won);
});

// --- One-Way --------------------------------------------------------------

test('one-way allows entry from a permitted heading', () => {
  const level = makeLevel(1, 4, [
    start(0, 0, Direction.Right),
    oneWay(0, 1, [Direction.Right]),
    exit(0, 3),
  ]);
  assert.equal(simulateLevel(level).status, SimulationStatus.Won);
});

test('one-way blocks entry from a disallowed heading', () => {
  const level = makeLevel(1, 4, [
    start(0, 0, Direction.Right),
    oneWay(0, 1, [Direction.Up]),
    exit(0, 3),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.HitObstacle);
});

// --- Breakable ------------------------------------------------------------

test('breakable is passable on first entry', () => {
  const level = makeLevel(1, 3, [start(0, 0, Direction.Right), breakable(0, 1), exit(0, 2)]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(hasEvent(result.steps, TileEventKind.Broken));
});

test('breakable becomes a fatal hole on re-entry', () => {
  // Pass the breakable, get turned back by a fixed arrow, then fall through it.
  const level = makeLevel(1, 3, [
    start(0, 0, Direction.Right),
    breakable(0, 1),
    arrow(0, 2, Direction.Left, false),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.HitObstacle);
});

// --- Ice ------------------------------------------------------------------

test('ice slides the arrow through (SLIDE step kind)', () => {
  const level = makeLevel(1, 4, [
    start(0, 0, Direction.Right),
    ice(0, 1),
    ice(0, 2),
    exit(0, 3),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(hasKind(result.steps, StepKind.Slide));
});

// --- Switch ---------------------------------------------------------------

test('a switch deactivates its wall group, opening the path', () => {
  const level = makeLevel(1, 4, [
    start(0, 0, Direction.Right),
    switchTile(0, 1, 'gate', true),
    switchWall(0, 2, 'gate'),
    exit(0, 3),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(hasEvent(result.steps, TileEventKind.SwitchToggled));
});

test('a switch-wall with no switch in the level is solid by default', () => {
  const level = makeLevel(1, 3, [
    start(0, 0, Direction.Right),
    switchWall(0, 1, 'gate'),
    exit(0, 2),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.HitWall);
});

test('a switch toggle flips back (re-activating its wall on a second pass)', () => {
  // A perimeter ring: g starts inactive (wall open), the switch flips it active,
  // and the second lap finds the wall solid → HIT_WALL. A set-true (non-flip)
  // toggle would loop forever instead.
  const level = makeLevel(3, 3, [
    start(0, 1, Direction.Right),
    arrow(0, 2, Direction.Down),
    switchWall(1, 2, 'g'),
    arrow(2, 2, Direction.Left),
    switchTile(2, 1, 'g', false),
    arrow(2, 0, Direction.Up),
    arrow(0, 0, Direction.Right),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.HitWall);
});

test('a switch ping-pong cycle (two switches, same group) is an infinite loop', () => {
  const level = makeLevel(3, 4, [
    start(1, 0, Direction.Right),
    arrow(0, 1, Direction.Right),
    switchTile(0, 2, 'g', true),
    arrow(0, 3, Direction.Down),
    arrow(2, 3, Direction.Left),
    switchTile(2, 2, 'g', true),
    arrow(2, 1, Direction.Up),
    arrow(1, 1, Direction.Up),
  ]);
  const result = simulateLevel(level, { maxSteps: 1000 });
  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.InfiniteLoop);
  assert.ok(result.steps.length < 1000, 'should terminate well under the cap');
});

// --- Speed: chaining & full landing resolution ----------------------------

test('speed chains when it lands on another speed tile', () => {
  const level = makeLevel(1, 6, [
    start(0, 0, Direction.Right),
    speed(0, 1), // leaps to (0,3)
    speed(0, 3), // chains, leaps to (0,5)
    exit(0, 5),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(
    result.steps.filter((s) => s.kind === StepKind.Speed).length >= 2,
    'a chain should emit at least two SPEED steps',
  );
});

test('speed leaping onto a teleporter warps (resolved fully)', () => {
  const level = makeLevel(1, 9, [
    start(0, 0, Direction.Right),
    speed(0, 1), // leaps to (0,3)
    teleporter(0, 3, 1),
    teleporter(0, 5, 1),
    exit(0, 8),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(hasKind(result.steps, StepKind.Speed));
  assert.ok(hasKind(result.steps, StepKind.Teleport));
});

test('speed leap landing exactly on the exit wins', () => {
  const level = makeLevel(1, 4, [start(0, 0, Direction.Right), speed(0, 1, 2), exit(0, 3)]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(hasKind(result.steps, StepKind.Speed));
});

test('speed landing on a one-way is gated against the leap heading (allowed)', () => {
  const level = makeLevel(1, 5, [
    start(0, 0, Direction.Right),
    speed(0, 1),
    oneWay(0, 3, [Direction.Right]),
    exit(0, 4),
  ]);
  assert.equal(simulateLevel(level).status, SimulationStatus.Won);
});

test('speed landing on a one-way is gated against the leap heading (blocked)', () => {
  const level = makeLevel(1, 5, [
    start(0, 0, Direction.Right),
    speed(0, 1),
    oneWay(0, 3, [Direction.Up]),
    exit(0, 4),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.HitObstacle);
});

test('a one-way that is leaped OVER is not gated', () => {
  const level = makeLevel(1, 4, [
    start(0, 0, Direction.Right),
    speed(0, 1),
    oneWay(0, 2, [Direction.Up]), // skipped by the leap to (0,3)
    exit(0, 3),
  ]);
  assert.equal(simulateLevel(level).status, SimulationStatus.Won);
});

// --- Breakable: leap-over vs land-on --------------------------------------

test('a breakable leaped OVER by speed is not consumed', () => {
  const level = makeLevel(1, 5, [
    start(0, 0, Direction.Right),
    speed(0, 1), // leaps over (0,2) to (0,3)
    breakable(0, 2),
    exit(0, 4),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(!hasEvent(result.steps, TileEventKind.Broken), 'leaped-over breakable must NOT break');
});

test('a breakable that speed LANDS on is consumed', () => {
  const level = makeLevel(1, 5, [
    start(0, 0, Direction.Right),
    speed(0, 1), // lands exactly on (0,3)
    breakable(0, 3),
    exit(0, 4),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  assert.ok(hasEvent(result.steps, TileEventKind.Broken));
});

// --- Rotate (counter-clockwise) -------------------------------------------

test('rotate (TURN counter-clockwise) redirects the arrow', () => {
  const level = makeLevel(3, 3, [
    start(2, 0, Direction.Right),
    rotateTile(2, 2, { kind: 'TURN', sense: RotationSense.CounterClockwise }),
    exit(0, 2),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Won);
  const turn = result.steps.find((s) => s.kind === StepKind.Rotate);
  assert.ok(turn, 'expected a ROTATE step');
  assert.equal(turn.to.direction, Direction.Up, 'Right turned CCW should face Up');
});

// --- Teleport preserves heading into a one-way gate -----------------------

test('teleport preserves heading into a permitting one-way gate', () => {
  const level = makeLevel(3, 3, [
    start(0, 0, Direction.Down),
    teleporter(1, 0, 1),
    teleporter(0, 2, 1),
    oneWay(1, 2, [Direction.Down]),
    exit(2, 2),
  ]);
  assert.equal(simulateLevel(level).status, SimulationStatus.Won);
});

test('teleport preserves heading into a blocking one-way gate', () => {
  const level = makeLevel(3, 3, [
    start(0, 0, Direction.Down),
    teleporter(1, 0, 1),
    teleporter(0, 2, 1),
    oneWay(1, 2, [Direction.Up]),
    exit(2, 2),
  ]);
  const result = simulateLevel(level);
  assert.equal(result.status, SimulationStatus.Lost);
  assert.equal(result.failureReason, FailureReason.HitObstacle);
});

test('teleport arrival settles unresolved (the TELEPORT step carries no events)', () => {
  const level = makeLevel(3, 3, [
    start(0, 0, Direction.Right),
    teleporter(0, 2, 1),
    teleporter(2, 0, 1),
    exit(2, 2),
  ]);
  const result = simulateLevel(level);
  const teleport = result.steps.find((s) => s.kind === StepKind.Teleport);
  if (!teleport) {
    throw new Error('expected a TELEPORT step');
  }
  assert.equal(teleport.events.length, 0);
});
