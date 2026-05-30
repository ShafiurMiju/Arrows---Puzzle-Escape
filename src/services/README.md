# services/

Adapters that implement the interfaces ("ports") declared in
`src/types/services.ts`. The rest of the app depends on the **interface**, never
the concrete library — so providers can be swapped or stubbed freely.

Planned adapters:

```
services/
├── storage/    # AsyncStorageService   implements StorageService     (Phase 7)
├── audio/      # ExpoAudioService      implements AudioService       (Phase 9)
├── haptics/    # ExpoHapticsService    implements HapticsService     (Phase 9)
├── ads/        # AdMobService          implements AdsService         (Phase 10)
├── analytics/  # FirebaseAnalytics…    implements AnalyticsService   (later)
└── index.ts    # a small service locator / DI container
```

Until an adapter exists, a no-op implementation of its port can be injected so
feature code can be built and tested in isolation.
