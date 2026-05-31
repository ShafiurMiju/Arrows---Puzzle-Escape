import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageService } from '../../types';

/**
 * The single place that imports the AsyncStorage SDK. Exposes both:
 *  - `storage`: the typed {@link StorageService} port adapter (JSON values), and
 *  - `zustandStateStorage`: a string-based StateStorage for the Zustand
 *    `persist` middleware.
 * Everything else depends on these, never on AsyncStorage directly.
 */
class AsyncStorageService implements StorageService {
  async getItem<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export const storage: StorageService = new AsyncStorageService();

/** StateStorage shape consumed by `createJSONStorage` in the Zustand stores. */
export const zustandStateStorage = {
  getItem: (name: string): Promise<string | null> => AsyncStorage.getItem(name),
  setItem: (name: string, value: string): Promise<void> => AsyncStorage.setItem(name, value),
  removeItem: (name: string): Promise<void> => AsyncStorage.removeItem(name),
};
