/**
 * Namespaced AsyncStorage keys. The version segment lets us invalidate or
 * migrate persisted data deliberately: bump `v1` → `v2` and add a migration
 * when a persisted shape changes incompatibly.
 */
const PREFIX = '@arrows/v1';

export const StorageKeys = {
  progress: `${PREFIX}/progress`,
  settings: `${PREFIX}/settings`,
  achievements: `${PREFIX}/achievements`,
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
