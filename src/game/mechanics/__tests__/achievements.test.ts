import assert from 'node:assert/strict';
import { test } from 'node:test';

// Import the catalog directly (not the constants barrel, which pulls RN-only
// modules like `__DEV__` that don't compile under the Node test config).
import { ACHIEVEMENTS } from '../../../constants/achievements';
import { LevelResult, ProgressState } from '../../../types';
import {
  buildAchievementContext,
  evaluateAchievements,
  unlockedAchievementIds,
} from '../achievements';
import { applyLevelResult, emptyProgress } from '../progress';

function win(
  progress: ProgressState,
  levelId: number,
  stars: number,
  usedHint = false,
): ProgressState {
  const result: LevelResult = {
    levelId,
    won: true,
    movesUsed: 1,
    timeSec: 1,
    stars,
    score: 100,
    usedHint,
  };
  return applyLevelResult(progress, result, 100);
}

test('first_victory unlocks after a single completion', () => {
  let progress = emptyProgress();
  assert.deepEqual(unlockedAchievementIds(ACHIEVEMENTS, progress), []);
  progress = win(progress, 1, 2);
  assert.ok(unlockedAchievementIds(ACHIEVEMENTS, progress).includes('first_victory'));
});

test('context counts three-star and hint-free levels correctly', () => {
  let progress = emptyProgress();
  progress = win(progress, 1, 3, false); // 3 stars, no hint
  progress = win(progress, 2, 2, true); // hinted
  const ctx = buildAchievementContext(progress);
  assert.equal(ctx.levelsCompleted, 2);
  assert.equal(ctx.threeStarLevels, 1);
  assert.equal(ctx.hintFreeLevels, 1); // only level 1
});

test('a later hinted replay does not revoke a prior hint-free completion', () => {
  let progress = emptyProgress();
  progress = win(progress, 1, 2, false); // hint-free first
  progress = win(progress, 1, 3, true); // replay with a hint
  assert.equal(buildAchievementContext(progress).hintFreeLevels, 1);
});

test('evaluateAchievements reports the progress fraction toward a target', () => {
  let progress = emptyProgress();
  for (let id = 1; id <= 5; id += 1) {
    progress = win(progress, id, 1);
  }
  const tens = evaluateAchievements(ACHIEVEMENTS, progress).find(
    (e) => e.definition.id === 'levels_10',
  );
  assert.ok(tens);
  assert.equal(tens.unlocked, false);
  assert.equal(tens.current, 5);
  assert.ok(Math.abs(tens.progress - 0.5) < 1e-9);
});
