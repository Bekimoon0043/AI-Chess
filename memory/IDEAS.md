# Ideas

## Feature Ideas

### Post-MVP Backlog (from Project Plan)
- **Analysis Mode** — Evaluation bar and best-move arrows calculated by Stockfish
- **Opening Explorer** — Database lookup of popular opening lines and win percentages
- **PGN Import/Export** — Copy PGN to clipboard or download game history files
- **Custom AI Personalities** — Bot profiles (Aggressive, Defensive, Random, Tactical)
- **Multi-Language Support (i18n)** — Spanish, German, French, Chinese, etc.

### Additional Ideas
- Puzzle / training mode (tactics from famous games)
- Opening trainer with spaced-repetition
- Shareable game links (encoded PGN in URL hash)
- Spectator / replay mode with autoplay
- Keyboard shortcuts for power users

## Improvements

- Dynamic AI depth based on `navigator.hardwareConcurrency` and battery status
- Adaptive board size and piece scale for foldable / ultra-wide screens
- Accessibility: full keyboard navigation and screen-reader announcements for moves
- Theme system that supports community-contributed board/piece skins

## Experiments

- Alternative lightweight engines (e.g., smaller WASM engines) for low-end devices
- WebGPU-accelerated evaluation (future research)
- On-device model for move suggestion (beyond classic Stockfish)

## Future Considerations

- Optional online multiplayer (would require a backend — currently out of scope for pure GH Pages)
- Cloud save / account system (beyond local IndexedDB)
- Tournament mode / Swiss pairing for local events
