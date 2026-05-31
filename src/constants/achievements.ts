import { AchievementDefinition } from '../types';

/**
 * Static achievement catalog. Unlock logic and persisted progress arrive in
 * Phase 11; this is the data the Achievements screen renders today.
 */
export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: 'first_victory',
    title: 'First Victory',
    description: 'Complete your very first level.',
  },
  {
    id: 'levels_10',
    title: 'Getting Started',
    description: 'Complete 10 levels.',
    target: 10,
  },
  {
    id: 'levels_50',
    title: 'Puzzle Solver',
    description: 'Complete 50 levels.',
    target: 50,
  },
  {
    id: 'levels_100',
    title: 'Escape Artist',
    description: 'Complete all 100 levels.',
    target: 100,
  },
  {
    id: 'perfect_solver',
    title: 'Perfect Solver',
    description: 'Earn 3 stars on 25 levels.',
    target: 25,
  },
  {
    id: 'no_hints',
    title: 'Pure Logic',
    description: 'Solve 10 levels without using a hint.',
    target: 10,
  },
];
