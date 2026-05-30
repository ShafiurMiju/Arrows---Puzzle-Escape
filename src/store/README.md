# store/

Zustand v5 stores — the application layer. Each store composes the pure domain
(`game/`) and the service ports (`services/`) into the use-cases the UI calls.

Planned stores:

```
store/
├── gameStore.ts          # active level, board state, undo stack, simulation (Phase 3/5)
├── progressStore.ts      # unlocked levels, stars, completion — persisted (Phase 7)
├── settingsStore.ts      # music/sound/vibration/removeAds — persisted (Phase 7)
└── achievementsStore.ts  # achievement progress — persisted (Phase 11)
```

Persisted stores use the `StorageService` port (AsyncStorage adapter) and the
versioned keys in `constants/storageKeys`.
