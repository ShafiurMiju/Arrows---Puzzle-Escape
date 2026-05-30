# components/

Reusable, presentational React components — buttons, modals, the star-rating
display, tile sprites, HUD controls, etc. They are theme-driven (read from
`src/constants`) and contain no business logic.

Populated from **Phase 2** onward. Suggested early structure:

```
components/
├── ui/        # Button, IconButton, Card, Modal, Toggle, StarRow
├── game/      # Tile, Grid, ArrowSprite, GameControls (Phase 4+)
└── feedback/  # VictoryOverlay, FailureOverlay (Phase 2)
```
