import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getAllLevels, getNextLevelId, LEVEL_COUNT } from '../loader';
import { solveLevel } from '../solver';
import { highestUnlockedLevel, isLevelUnlocked } from '../unlock';
import { validateLevel } from '../validator';

test('catalog has at least 100 levels with sequential ids', () => {
  const levels = getAllLevels();
  assert.ok(LEVEL_COUNT >= 100, `expected >= 100 levels, got ${LEVEL_COUNT}`);
  levels.forEach((level, index) => assert.equal(level.id, index + 1));
});

test('every catalog level is structurally valid, solvable, and non-trivial', () => {
  for (const level of getAllLevels()) {
    const issues = validateLevel(level);
    assert.equal(issues.length, 0, `level ${level.id}: ${issues.join('; ')}`);

    const solution = solveLevel(level);
    assert.ok(solution.solved, `level ${level.id} is unsolvable`);
    assert.ok((solution.minMoves ?? 0) >= 1, `level ${level.id} is trivially solved`);

    assert.ok(
      level.stars.threeStarMoves <= level.stars.twoStarMoves,
      `level ${level.id} has inverted star thresholds`,
    );
  }
});

test('getNextLevelId returns the next id, or null for the last level', () => {
  assert.equal(getNextLevelId(1), 2);
  assert.equal(getNextLevelId(LEVEL_COUNT), null);
});

test('unlock rules: level 1 is always open; level N needs N-1 completed', () => {
  const completed = new Set<number>([1, 2, 3]);
  assert.equal(isLevelUnlocked(1, new Set()), true);
  assert.equal(isLevelUnlocked(4, completed), true); // 3 is completed
  assert.equal(isLevelUnlocked(5, completed), false); // 4 is not
  assert.equal(highestUnlockedLevel(completed), 4);
  assert.equal(highestUnlockedLevel(new Set()), 1);
});
