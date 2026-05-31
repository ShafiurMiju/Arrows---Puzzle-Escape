import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ACHIEVEMENTS, StorageKeys } from '../constants';
import { unlockedAchievementIds } from '../game/mechanics';
import { zustandStateStorage } from '../services/storage';
import { ProgressState } from '../types';

interface AchievementsStore {
  /** Achievement id → epoch ms it was first unlocked. */
  unlockedAt: Record<string, number>;
  hasHydrated: boolean;
  /**
   * Stamp any achievements whose condition is now met against `progress`.
   * Idempotent; returns the ids unlocked by THIS call (for a future toast).
   */
  sync: (progress: ProgressState, now: number) => string[];
  /** Clear all unlock timestamps (paired with a progress reset). */
  reset: () => void;
}

export const useAchievementsStore = create<AchievementsStore>()(
  persist(
    (set, get) => ({
      unlockedAt: {},
      hasHydrated: false,
      sync: (progress, now) => {
        const unlocked = unlockedAchievementIds(ACHIEVEMENTS, progress);
        const current = get().unlockedAt;
        const newly = unlocked.filter((id) => current[id] === undefined);
        if (newly.length > 0) {
          const next = { ...current };
          for (const id of newly) {
            next[id] = now;
          }
          set({ unlockedAt: next });
        }
        return newly;
      },
      reset: () => set({ unlockedAt: {} }),
    }),
    {
      name: StorageKeys.achievements,
      storage: createJSONStorage(() => zustandStateStorage),
      partialize: (state) => ({ unlockedAt: state.unlockedAt }),
      onRehydrateStorage: () => () => {
        useAchievementsStore.setState({ hasHydrated: true });
      },
    },
  ),
);
