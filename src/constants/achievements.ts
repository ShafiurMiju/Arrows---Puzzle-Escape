import { AchievementDefinition } from '../types';

/**
 * Static achievement catalog. Each entry carries a declarative `condition`
 * evaluated against the player's progress (see `game/mechanics/achievements`).
 */
export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: 'first_victory',
    title: 'First Victory',
    description: 'Complete your very first level.',
    condition: { kind: 'levelsCompleted', count: 1 },
  },
  {
    id: 'levels_10',
    title: 'Getting Started',
    description: 'Complete 10 levels.',
    condition: { kind: 'levelsCompleted', count: 10 },
  },
  {
    id: 'levels_50',
    title: 'Puzzle Solver',
    description: 'Complete 50 levels.',
    condition: { kind: 'levelsCompleted', count: 50 },
  },
  {
    id: 'levels_100',
    title: 'Escape Artist',
    description: 'Complete all 100 levels.',
    condition: { kind: 'levelsCompleted', count: 100 },
  },
  {
    id: 'perfect_solver',
    title: 'Perfect Solver',
    description: 'Earn 3 stars on 25 levels.',
    condition: { kind: 'threeStarLevels', count: 25 },
  },
  {
    id: 'star_collector',
    title: 'Star Collector',
    description: 'Earn 150 stars.',
    condition: { kind: 'totalStars', count: 150 },
  },
  {
    id: 'no_hints',
    title: 'Pure Logic',
    description: 'Solve 10 levels without using a hint.',
    condition: { kind: 'hintFreeLevels', count: 10 },
  },
];
