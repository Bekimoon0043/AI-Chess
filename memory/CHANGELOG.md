# Changelog

## [Unreleased]

### Added
- **Modern UI redesign** — start/home screen, design tokens, segmented controls, polished modals
- Confetti on checkmate, AI thinking indicator, result stats
- Service Worker cache bumped to `chess-v2`
- Updated app icon gradient SVG
- Complete documentation suite: DEPLOYMENT.md, DEVELOPMENT.md, TESTING.md
- API documentation in docs/ARCHITECTURE.md with method signatures
- Browser support matrix in README.md
- Master Context and Prompts memory files

### Changed
- `index.html` — start screen, icon sprite, improved settings/help/about/game-over modals
- `css/styles.css` — full design system (tokens, dark/light, start card, panels)
- `js/ui.js` — enterGame/showStartScreen, theme toggle, confetti, segmented mode/difficulty
- README.md expanded with tech stack table, feature checklist, and known limitations

## [0.1.0] - 2026-07-31

### Added
- Repository scaffold: README, LICENSE (MIT), .gitignore
- Memory system and documentation
- Full client-side chess PWA: rules engine, minimax AI, UI, sound, service worker

### Changed
- Adopted vanilla JS architecture (supersedes earlier React/Vite consideration for MVP)

### Fixed
- Documented centralized `isSquareAttacked` — no duplicate attack logic
