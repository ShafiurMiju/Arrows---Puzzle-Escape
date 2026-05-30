# Arrows – Puzzle Escape

A modern, minimalist Android puzzle game built with React Native + Expo. Guide
an arrow from the **Start** tile to the **Exit** by rotating arrow tiles and
outsmarting special mechanics (teleporters, ice, speed pads, switches, and more)
before pressing **Play**.

> **Status:** Phase 1 — project setup & architecture. The app currently boots to
> a themed placeholder screen. Gameplay arrives in later phases (see the roadmap).

---

## Tech stack

| Concern              | Choice                                            |
| -------------------- | ------------------------------------------------- |
| Framework            | React Native `0.85.3` + **Expo SDK 56**           |
| Language             | TypeScript `~6.0` (strict)                        |
| Navigation           | React Navigation v7 (native-stack + bottom-tabs)  |
| State                | Zustand v5                                        |
| Persistence          | `@react-native-async-storage/async-storage`       |
| Animation            | React Native Reanimated v4 (+ react-native-worklets) |
| Audio                | `expo-audio` (expo-av is removed in SDK 56)       |
| Haptics              | `expo-haptics`                                    |
| Ads                  | `react-native-google-mobile-ads` (AdMob)          |
| Analytics (reserved) | Firebase Analytics + Crashlytics (ports only)     |

> **New Architecture (Fabric/TurboModules) is enabled** — required by Reanimated 4.

---

## Prerequisites

- Node.js 20+ (project verified on Node 26)
- A package manager (`npm` is assumed below)
- For device builds: Android Studio + JDK 17, and an [Expo account](https://expo.dev) for EAS builds
- **AdMob and Reanimated worklets require native code, so this app does NOT run
  in Expo Go.** You build a custom *dev client* instead (steps below).

## Installation

```bash
# 1. Install JS dependencies
npm install

# 2. Align all Expo-managed native packages to the exact SDK 56 versions
#    (safe to run; it fixes any drift from npm's standalone latests)
npx expo install --fix

# 3. Generate placeholder app icons (until final art is added)
npm run assets:icons

# 4. (First time) set up linting — `npx expo lint` scaffolds eslint.config.js
#    and installs eslint + eslint-config-expo on first run
npx expo lint
```

## Running on Android (custom dev client)

Because of AdMob + Reanimated, use a development build rather than Expo Go:

```bash
# Option A — build & run locally (requires Android Studio/SDK)
npx expo run:android          # prebuilds native project, builds, installs

# Option B — build the dev client in the cloud with EAS
npm i -g eas-cli
eas login
eas build --profile development --platform android
# install the resulting .apk on your device/emulator, then:
npm start                     # starts Metro for the dev client
```

> After changing `app.json` plugin config (e.g. the AdMob App ID) you must
> re-run `npx expo prebuild --clean` / rebuild the dev client — a JS reload will
> not pick up native changes.

## Useful scripts

| Script                  | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm start`             | Start Metro for the dev client                |
| `npm run android`       | Prebuild + build + run on Android             |
| `npm run typecheck`     | `tsc --noEmit`                                |
| `npm run lint`          | `expo lint`                                   |
| `npm run prebuild:clean`| Regenerate native projects from `app.json`    |
| `npm run assets:icons`  | Regenerate placeholder icons                  |

---

## Project structure

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full layering explanation.

```
.
├── package.json          # dependencies & npm scripts
├── app.json              # Expo config (plugins, AdMob App ID, Android settings)
├── eas.json              # EAS build profiles (development / preview / production)
├── babel.config.js       # babel-preset-expo (auto-manages Reanimated/worklets)
├── metro.config.js       # Metro config (audio asset extensions)
├── tsconfig.json         # strict TS, "@/*" path alias → src/*
├── .prettierrc           # Prettier formatting config
├── .gitignore            # ignored files (node_modules, native dirs, …)
├── index.ts              # entry: registerRootComponent(App)
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

## Roadmap (phased delivery)

1. **Project setup & architecture** ← _you are here_
2. Navigation & screens
3. Puzzle engine
4. Grid rendering
5. Tile mechanics
6. Level system (100+ levels)
7. Save & progress system
8. Animations
9. Audio
10. Ads (AdMob)
11. Achievements
12. Optimization & release prep
