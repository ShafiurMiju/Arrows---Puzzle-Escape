# game/

The pure, framework-free game core. Nothing here imports React or React Native, so it
runs and unit-tests in plain Node and is reusable across white-labeled builds.

```
game/
├── engine/     # deterministic simulation: board → ordered steps + win/lose  (Phase 3)
├── tiles/      # per-tile entry behavior (teleport, slide, rotate, break, …)  (Phase 5)
├── levels/     # 100+ JSON levels + loader (sparse tiles → full grid)         (Phase 6)
└── mechanics/  # star rating, scoring, hint search, undo history             (Phase 5-7)
```

The engine consumes a `LevelDefinition` (see `src/types/level.ts`) and produces
a `SimulationResult` (see `src/types/game.ts`). The UI/animation layers only
*replay* the resulting steps — they never re-run game rules.
