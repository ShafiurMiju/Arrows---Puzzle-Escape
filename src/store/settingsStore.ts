import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_SETTINGS, StorageKeys } from '../constants';
import { zustandStateStorage } from '../services/storage';
import { SettingsState } from '../types';

interface SettingsStore {
  settings: SettingsState;
  hasHydrated: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setRemoveAds: (removeAds: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      hasHydrated: false,
      setMusicEnabled: (musicEnabled) =>
        set((state) => ({ settings: { ...state.settings, musicEnabled } })),
      setSoundEnabled: (soundEnabled) =>
        set((state) => ({ settings: { ...state.settings, soundEnabled } })),
      setVibrationEnabled: (vibrationEnabled) =>
        set((state) => ({ settings: { ...state.settings, vibrationEnabled } })),
      setRemoveAds: (removeAds) =>
        set((state) => ({ settings: { ...state.settings, removeAds } })),
    }),
    {
      name: StorageKeys.settings,
      storage: createJSONStorage(() => zustandStateStorage),
      partialize: (state) => ({ settings: state.settings }),
      onRehydrateStorage: () => () => {
        useSettingsStore.setState({ hasHydrated: true });
      },
    },
  ),
);
