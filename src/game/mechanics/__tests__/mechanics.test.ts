import assert from 'node:assert/strict';
import { test } from 'node:test';

import { LevelResult, StarThresholds } from '../../../types';
import { applyLevelResult, completedLevelIds, emptyProgress } from '../progress';
import { computeScore, computeStars } from '../rating';

const thresholds: StarThresholds = { threeStarMoves: 3, twoStarMoves: 6 };

const result = (over: Partial<LevelResult> = {}): LevelResult => ({
  levelId: 1,
  won: true,
  movesUsed: 3,
  timeSec: 10,
  stars: 3,
  score: 1000,
  ...over,
});

// --- Rating ---------------------------------------------------------------

test('computeStars awards 3/2/1 by move count', () => {
  assert.equal(computeStars({ movesUsed: 3, timeSec: 0, thresholds }), 3);
  assert.equal(computeStars({ movesUsed: 5, timeSec: 0, thresholds }), 2);
  assert.equal(computeStars({ movesUsed: 9, timeSec: 0, thresholds }), 1);
});

test('computeStars respects an optional time cap on the 3-star tier', () => {
  const timed: StarThresholds = { ...thresholds, threeStarTimeSec: 20 };
  assert.equal(computeStars({ movesUsed: 3, timeSec: 15, thresholds: timed }), 3);
  assert.equal(computeStars({ movesUsed: 3, timeSec: 25, thresholds: timed }), 2);
});

test('computeScore floors at 100 and rewards efficiency', () => {
  assert.ok(computeScore({ movesUsed: 3, timeSec: 0, thresholds }) >= 900);
  assert.equal(computeScore({ movesUsed: 99, timeSec: 9999, thresholds }), 100);
});

// --- Progress -------------------------------------------------------------

test('applyLevelResult records a win, advances current level, and ignores losses', () => {
  const p0 = emptyProgress();
  const p1 = applyLevelResult(p0, result({ levelId: 1, stars: 2, movesUsed: 4, timeSec: 12 }), 100);
  assert.equal(p1.levels[1]?.completed, true);
  assert.equal(p1.levels[1]?.bestStars, 2);
  assert.equal(p1.currentLevelId, 2);
  assert.equal(p1.completedCount, 1);
  assert.equal(p1.totalStars, 2);

  const p2 = applyLevelResult(p1, result({ levelId: 1, won: false }), 100);
  assert.deepEqual(p2, p1, 'a loss must not change progress');
});

test('applyLevelResult keeps the BEST stars/moves/time across attempts', () => {
  let p = applyLevelResult(emptyProgress(), result({ stars: 1, movesUsed: 8, timeSec: 30 }), 100);
  p = applyLevelResult(p, result({ stars: 3, movesUsed: 3, timeSec: 10 }), 100);
  assert.equal(p.levels[1]?.bestStars, 3);
  assert.equal(p.levels[1]?.bestMoves, 3);
  assert.equal(p.levels[1]?.bestTimeSec, 10);

  // A worse later attempt does not downgrade the bests.
  p = applyLevelResult(p, result({ stars: 1, movesUsed: 9, timeSec: 40 }), 100);
  assert.equal(p.levels[1]?.bestStars, 3);
  assert.equal(p.levels[1]?.bestMoves, 3);
});

test('currentLevelId is clamped to the level count', () => {
  const p = applyLevelResult(emptyProgress(), result({ levelId: 100 }), 100);
  assert.equal(p.currentLevelId, 100);
});

test('completedLevelIds reflects completed entries', () => {
  let p = applyLevelResult(emptyProgress(), result({ levelId: 1 }), 100);
  p = applyLevelResult(p, result({ levelId: 2 }), 100);
  assert.deepEqual([...completedLevelIds(p)].sort((a, b) => a - b), [1, 2]);
});
