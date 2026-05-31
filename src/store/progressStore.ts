import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys } from '../constants';
import { LEVEL_COUNT } from '../game/levels';
import { applyLevelResult, completedLevelIds, emptyProgress } from '../game/mechanics';
import { isLevelUnlocked } from '../game/levels';
import { zustandStateStorage } from '../services/storage';
import { LevelProgress, LevelResult, ProgressState } from '../types';

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
      // v1 added LevelProgress.completedWithoutHint. Hints did not exist before,
      // so every legacy completion was necessarily hint-free — backfill it from
      // `completed` rather than defaulting to false (which would under-count the
      // "Pure Logic" achievement for returning players).
      version: 1,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as { progress?: ProgressState };
        if (!state.progress || version >= 1) {
          return state as unknown as ProgressStore;
        }
        const levels: Record<number, LevelProgress> = {};
        for (const key of Object.keys(state.progress.levels)) {
          const id = Number(key);
          const entry = state.progress.levels[id] as
            | (LevelProgress & { completedWithoutHint?: boolean })
            | undefined;
          if (entry) {
            levels[id] = {
              ...entry,
              completedWithoutHint: entry.completedWithoutHint ?? entry.completed,
            };
          }
        }
        return {
          progress: { ...state.progress, levels },
        } as unknown as ProgressStore;
      },
      onRehydrateStorage: () => () => {
        useProgressStore.setState({ hasHydrated: true });
      },
    },
  ),
);
