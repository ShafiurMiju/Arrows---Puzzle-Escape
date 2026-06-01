# Architecture

`Arrows – Puzzle Escape` follows a pragmatic **Clean Architecture**: dependencies
point inward, the game's core logic is pure and framework-free, and everything
that touches a device SDK (storage, audio, haptics, ads, analytics) sits behind
an interface ("port") that the rest of the app depends on instead of the SDK.

```
            ┌──────────────────────────────────────────┐
            │                  UI layer                  │
            │   screens/ · components/ · navigation/     │
            │     (React, Reanimated, presentational)    │
            └───────────────┬────────────────────────────┘
                            │ reads state / dispatches intents
            ┌───────────────▼────────────────────────────┐
            │             Application layer               │
            │      store/ (Zustand) · hooks/              │
            │   orchestrates use-cases, holds UI state    │
            └───────────────┬───────────────┬─────────────┘
                            │               │
        depends on ports →  │               │ ← calls pure domain
            ┌───────────────▼──┐      ┌──────▼─────────────────────┐
            │  Services (ports) │      │       Domain (core)        │
            │  services/ impls  │      │  game/engine · game/tiles  │
            │  behind types/    │      │  game/mechanics · types/   │
            │  AsyncStorage,    │      │  utils/                    │
            │  react-native-    │      │  PURE, deterministic, no   │
            │  sound, AdMob,    │      │  React / RN imports        │
            │  Firebase         │      │                            │
            └───────────────────┘      └────────────────────────────┘
```

### Dependency rule

- `types/`, `utils/`, and `game/` are the **core**. They import nothing from
  React, React Native, or any device SDK, which makes the puzzle engine
  unit-testable in plain Node and reusable across white-labeled deployments.
- `services/` contains **adapters** that implement the interfaces declared in
  `types/services.ts` (e.g. an `AsyncStorageService implements StorageService`).
  Feature code depends on the interface, never on the concrete library — so we
  can stub audio in tests, swap analytics vendors, or add IAP without edits
  rippling through the app.
- `store/` (Zustand) is the **application layer**: it composes the domain
  (run a simulation, compute stars) and the ports (persist progress, play SFX,
  show an ad) into use-cases the UI triggers.
- `screens/` + `components/` are **presentational** and read from stores/hooks.

## Folder responsibilities

| Folder            | Responsibility                                                                 |
| ----------------- | ------------------------------------------------------------------------------ |
| `src/types`       | The whole domain type system (tiles, grid, levels, simulation, progress, ports). No runtime code beyond enums/const. |
| `src/constants`   | Theme/colors, layout scale, game tuning, storage keys, ad config.              |
| `src/utils`       | Pure helpers (direction math, clamp/range). No side effects.                   |
| `src/game/engine` | Deterministic simulation: given a board, produce an ordered list of steps and a win/lose result. (Phase 3) |
| `src/game/tiles`  | Per-tile entry behavior (teleport, slide, rotate, break, …). (Phase 5)         |
| `src/game/levels` | 100+ levels authored as JSON + a loader that expands sparse tiles into a grid. (Phase 6) |
| `src/game/mechanics` | Cross-cutting rules: star rating, scoring, hint search, undo history. (Phase 5–7) |
| `src/store`       | Zustand stores: `gameStore`, `progressStore`, `settingsStore`, `achievementsStore`. (Phase 6/7) |
| `src/services`    | Adapters implementing `types/services.ts` ports.                               |
| `src/hooks`       | Reusable React hooks bridging stores/services to components.                   |
| `src/navigation`  | React Navigation trees + strongly-typed route params. (Phase 2)               |
| `src/screens`     | One folder per screen (Splash, Menu, Levels, Game, Victory, Failure, Settings, Achievements). (Phase 2) |
| `src/components`  | Reusable presentational components (buttons, tiles, modals, stars). (Phase 2+) |
| `src/assets`      | Images, fonts, and audio bundled with the app.                                 |

## Core domain model (Phase 1)

The type system already models the **entire** game so later phases only add
behavior, not new shapes:

- **`Direction`** — `UP/RIGHT/DOWN/LEFT`, plus `RotationSense` for turns.
- **`Tile`** — a discriminated union over `TileType`. Each variant carries only
  the data it needs: `ArrowTile.direction/rotatable`, `TeleporterTile.channel`,
  `SpeedTile.multiplier`, `RotateTile.effect`, `OneWayTile.allowedEntry`,
  `WallTile.switchGroup`, `SwitchTile.switchGroup/initiallyActive`. `isTileType`
  is a type-safe runtime guard.
- **`LevelDefinition`** — authored JSON with a **sparse** `tiles` list (only
  non-empty cells), `size`, `difficulty`, `par`, and `StarThresholds`. The
  loader fills the rest with `EmptyTile`s, keeping 100+ level files compact.
- **Simulation** — `SimulationResult` is an ordered list of `SimulationStep`s
  (each with `from`/`to`/`kind`/`events`) plus a win/lose `status`. This clean
  separation lets the engine compute the full path synchronously, while the
  animation layer (Phase 8) simply *replays* the steps.
- **Persistence** — `ProgressState`, `SettingsState`, `AchievementProgress` are
  the serialized shapes; the versioned key prefix in `storageKeys` supports
  deliberate migrations.
- **Ports** — `StorageService`, `AudioService`, `HapticsService`, `AdsService`,
  `AnalyticsService`, and a reserved `PurchaseService` (IAP) decouple the app
  from every device SDK.

## Conventions

- **TypeScript strict** everywhere; prefer `readonly` and discriminated unions.
- **Relative imports** within `src` (the `@/*` alias is configured and available
  if preferred later).
- **Theme-driven styling** — components pull colors/spacing from `constants`,
  never hard-coded hex, so alternate/white-label palettes are a single change.
- **Determinism** — the engine must be pure and deterministic; randomness and
  time live in the application layer, not the core.
