# screens/

One folder per screen, each exporting a screen component wired to navigation.
Planned screens (Phase 2):

```
screens/
├── Splash/
├── MainMenu/        # Play · Levels · Settings · Achievements
├── LevelSelect/     # locked/unlocked levels + star ratings
├── Game/            # grid, Play/Pause/Undo/Restart/Hint
├── Victory/         # stars, score, next level
├── Failure/         # retry, level select
├── Settings/        # music / sound / vibration toggles
└── Achievements/    # achievement list + progress
```

Screens compose `components/`, read from `store/`, and stay free of low-level
SDK calls (those go through `services/`).
