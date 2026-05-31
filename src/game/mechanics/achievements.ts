import { AchievementCondition, AchievementDefinition, ProgressState } from '../../types';
import { assertNever } from '../../utils/assertNever';

/** Derived metrics from progress that achievement conditions compare against. */
export interface AchievementContext {
  readonly levelsCompleted: number;
  readonly totalStars: number;
  readonly threeStarLevels: number;
  readonly hintFreeLevels: number;
}

export function buildAchievementContext(progress: ProgressState): AchievementContext {
  let threeStarLevels = 0;
  let hintFreeLevels = 0;
  for (const key of Object.keys(progress.levels)) {
    const level = progress.levels[Number(key)];
    if (!level) {
      continue;
    }
    if (level.bestStars >= 3) {
      threeStarLevels += 1;
    }
    if (level.completed && level.completedWithoutHint) {
      hintFreeLevels += 1;
    }
  }
  return {
    levelsCompleted: progress.completedCount,
    totalStars: progress.totalStars,
    threeStarLevels,
    hintFreeLevels,
  };
}

function metricFor(condition: AchievementCondition, ctx: AchievementContext): number {
  switch (condition.kind) {
    case 'levelsCompleted':
      return ctx.levelsCompleted;
    case 'totalStars':
      return ctx.totalStars;
    case 'threeStarLevels':
      return ctx.threeStarLevels;
    case 'hintFreeLevels':
      return ctx.hintFreeLevels;
    default:
      return assertNever(condition);
  }
}

export function isConditionMet(condition: AchievementCondition, ctx: AchievementContext): boolean {
  return metricFor(condition, ctx) >= condition.count;
}

export function conditionProgress(condition: AchievementCondition, ctx: AchievementContext): number {
  if (condition.count <= 0) {
    return 1;
  }
  return Math.min(1, metricFor(condition, ctx) / condition.count);
}

export interface EvaluatedAchievement {
  readonly definition: AchievementDefinition;
  readonly unlocked: boolean;
  /** 0..1 toward the condition. */
  readonly progress: number;
  /** Current metric value (for "7 / 10" display). */
  readonly current: number;
}

/** Evaluate the whole catalog against the player's progress. */
export function evaluateAchievements(
  catalog: readonly AchievementDefinition[],
  progress: ProgressState,
): EvaluatedAchievement[] {
  const ctx = buildAchievementContext(progress);
  return catalog.map((definition) => ({
    definition,
    unlocked: isConditionMet(definition.condition, ctx),
    progress: conditionProgress(definition.condition, ctx),
    current: metricFor(definition.condition, ctx),
  }));
}

/** Ids currently unlocked, given progress. */
export function unlockedAchievementIds(
  catalog: readonly AchievementDefinition[],
  progress: ProgressState,
): string[] {
  const ctx = buildAchievementContext(progress);
  return catalog.filter((definition) => isConditionMet(definition.condition, ctx)).map((d) => d.id);
}
