# Arrows – Puzzle Escape

A modern, minimalist Android puzzle game built with React Native (CLI). Guide
an arrow from the **Start** tile to the **Exit** by rotating arrow tiles and
outsmarting special mechanics (teleporters, ice, speed pads, switches, and more)
before pressing **Play**.

> **Status:** Phase 1 — project setup & architecture. The app currently boots to
> a themed placeholder screen. Gameplay arrives in later phases (see the roadmap).

---

## Tech stack

| Concern              | Choice                                            |
| -------------------- | ------------------------------------------------- |
| Framework            | React Native `0.85.3` (CLI)                      |
| Language             | TypeScript `~6.0` (strict)                        |
| Navigation           | React Navigation v7 (native-stack + bottom-tabs)  |
| State                | Zustand v5                                        |
| Persistence          | `@react-native-async-storage/async-storage`       |
| Animation            | React Native Reanimated v4 (+ react-native-worklets) |
| Audio                | `react-native-sound`                              |
| Haptics              | `react-native-haptic-feedback`                    |
| Ads                  | `react-native-google-mobile-ads` (AdMob)          |
| Analytics (reserved) | Firebase Analytics + Crashlytics (ports only)     |

> **New Architecture (Fabric/TurboModules) is enabled** — required by Reanimated 4.

---

## Prerequisites

- Node.js 20+ (project verified on Node 26)
- A package manager (`npm` is assumed below)
- For Android builds: Android Studio + JDK 17

## Installation

```bash
# 1. Install JS dependencies
npm install

# 2. Generate placeholder app icons (until final art is added)
npm run assets:icons

# 3. Lint the project
npm run lint
```

## Running on Android

```bash
npm run android
```

If Metro is not running yet, start it in another terminal:

```bash
npm start
```

## Useful scripts

| Script                  | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm start`             | Start Metro                                   |
| `npm run android`       | Build + run on Android                        |
| `npm run typecheck`     | `tsc --noEmit`                                |
| `npm run lint`          | `eslint . --ext .ts,.tsx`                     |
| `npm run assets:icons`  | Regenerate placeholder icons                  |

---

## Project structure

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full layering explanation.

```
.
├── package.json          # dependencies & npm scripts
├── app.json              # React Native app config (name/displayName)
├── eas.json              # Legacy Expo build profiles (unused in CLI builds)
├── babel.config.js       # metro-react-native-babel-preset + worklets plugin
├── metro.config.js       # Metro config (audio asset extensions)
├── tsconfig.json         # strict TS, "@/*" path alias → src/*
├── .prettierrc           # Prettier formatting config
├── .gitignore            # ignored files (node_modules, native dirs, …)
├── index.ts              # entry: AppRegistry.registerComponent
├── scripts/              # dev tooling (placeholder icon generator)
└── src/
    ├── App.tsx           # root component + providers + splash flow
    ├── assets/           # images, fonts, sounds
    ├── components/       # reusable presentational components      (Phase 2+)
    ├── screens/          # one folder per screen                   (Phase 2)
    ├── navigation/       # React Navigation trees & route types    (Phase 2)
    ├── store/            # Zustand stores (game, progress, …)       (Phase 6/7)
    ├── services/         # adapters implementing the type "ports"   (Phase 7/9/10)
    ├── hooks/            # reusable React hooks                     (Phase 3+)
    ├── utils/            # pure, dependency-free helpers
    ├── constants/        # theme, layout, game config, keys, ads
    ├── types/            # the domain type system (no runtime deps)
    └── game/
        ├── engine/       # deterministic simulation                (Phase 3)
        ├── tiles/        # per-tile behavior                       (Phase 5)
        ├── levels/       # 100+ JSON levels + loader               (Phase 6)
        └── mechanics/    # scoring, hints, undo                    (Phase 5-7)
```

## Roadmap (phased delivery) — ✅ all phases complete

1. ✅ Project setup & architecture
2. ✅ Navigation & screens
3. ✅ Puzzle engine
4. ✅ Grid rendering
5. ✅ Tile mechanics
6. ✅ Level system (100+ levels)
7. ✅ Save & progress system
8. ✅ Animations
9. ✅ Audio
10. ✅ Ads (AdMob)
11. ✅ Achievements
12. ✅ Optimization & release prep

## Quality gates

```bash
npm run typecheck     # tsc --noEmit (strict) — clean
npm run test:engine   # 53 pure-logic unit tests (engine, mechanics, levels, achievements)
```

The pure core (engine, tile mechanics, level solver, rating/progress/achievements,
hints) is unit-tested in plain Node. RN-coupled layers (stores, services, screens,
animations) are verified by `tsc` and on-device runs.

## Releasing to Google Play

This project has been built and verified via `tsc` + unit tests, but **not yet run
on a device**. Before publishing:

1. **Run it on Android**: `npm run android`.
2. **Build a release**: open Android Studio or run `./gradlew bundleRelease`.
3. **Real assets**: replace the placeholder icons (`npm run assets:icons`) and
   synthesized sounds (`npm run assets:sounds`) under `src/assets/` with final art/audio.
4. **Real AdMob**: set the production App ID in `android/app/src/main/AndroidManifest.xml`
   and the real ad-unit ids in `src/constants/ads.ts` (`ProdAdUnitIds`). Keep test ids
   in dev — never click live ads on your own account.
5. **Analytics (optional)**: drop a Firebase Analytics + Crashlytics adapter behind
   the existing `AnalyticsService` port (`src/services/analytics`) — no call sites change.
6. **In-app purchase (optional)**: implement the reserved `PurchaseService` port to
   make "Remove Ads" a real purchase (it's a placeholder flag today).
7. **Lint**: `npm run lint`.
8. **Bump** `versionName` + `versionCode` in `android/app/build.gradle` per release.
