import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys } from '../constants';
import { LEVEL_COUNT } from '../game/levels';
import { applyLevelResult, completedLevelIds, emptyProgress } from '../game/mechanics';
import { isLevelUnlocked } from '../game/levels';
import { zustandStateStorage } from '../services/storage';
import { LevelResult, ProgressState } from '../types';

interface ProgressStore {
  progress: ProgressState;
  /** True once the persisted state has been read back from storage. */
  hasHydrated: boolean;
  /** Fold a finished attempt into progress (and persist). */
  recordResult: (result: LevelResult) => void;
  /** Whether the player may enter a level (sequential unlock rule). */
  isUnlocked: (levelId: number) => boolean;
  /** Best stars earned on a level (0 if unplayed). */
  starsFor: (levelId: number) => number;
  /** Wipe all progress (used by a future "reset progress" setting). */
  reset: () => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: emptyProgress(),
      hasHydrated: false,
      recordResult: (result) =>
        set((state) => ({ progress: applyLevelResult(state.progress, result, LEVEL_COUNT) })),
      isUnlocked: (levelId) => isLevelUnlocked(levelId, completedLevelIds(get().progress)),
      starsFor: (levelId) => get().progress.levels[levelId]?.bestStars ?? 0,
      reset: () => set({ progress: emptyProgress() }),
    }),
    {
      name: StorageKeys.progress,
      storage: createJSONStorage(() => zustandStateStorage),
      partialize: (state) => ({ progress: state.progress }),
      onRehydrateStorage: () => () => {
        useProgressStore.setState({ hasHydrated: true });
      },
    },
  ),
);
