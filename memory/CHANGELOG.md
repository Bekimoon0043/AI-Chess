# Changelog

## [Unreleased]

### Added
- DeepSeek review analysis: accepted vs rejected findings documented in `memory/KNOWLEDGE.md` and `docs/ARCHITECTURE.md`
- Architecture documentation aligned with **implemented** vanilla JS modules (`js/chess.js`, `ai.js`, `ui.js`, `sound.js`, `app.js`)
- Performance notes: main-thread AI limitation, planned Web Worker offload, timer cleanup guidance
- Architecture documentation in `docs/ARCHITECTURE.md` (vanilla JS structure, components, data flow, design patterns)
- Architecture Decision Records in `memory/DECISIONS.md` (client-side only, vanilla JS vs React, Web Worker, chess.js, PWA)
- Technical knowledge base updates in `memory/KNOWLEDGE.md` (domain rules, APIs, lessons, resources)
- Technical project blueprint (client-side SPA architecture, 6-phase roadmap, feature priority matrix, risk analysis)
- Populated `memory/ROADMAP.md` with vision, milestones, timeline, and priorities from the plan
- Populated `memory/TASKS.md` with Phase 1–6 task breakdown
- Populated `memory/IDEAS.md` with post-MVP backlog and future considerations

### Changed
- Adopted Claude architecture: plain HTML/CSS/JS module structure (supersedes earlier React/Vite consideration for MVP)
- `docs/ARCHITECTURE.md` folder map corrected to match shipped files (not the earlier planned `engine/` / React layout)
- `memory/KNOWLEDGE.md` updated with actual module paths and filtered code-review outcomes

### Fixed
- Clarified that en passant, underpromotion UI, stalemate, insufficient material, threefold, and 50-move are already implemented (contrary to DeepSeek assumptions)
- Documented centralized `isSquareAttacked` — no duplicate attack logic

## [0.1.0] - Initial

### Added
- Repository scaffold: README, LICENSE (MIT), .gitignore
- Memory system (`memory/`): MASTER_CONTEXT, ROADMAP, TASKS, DECISIONS, KNOWLEDGE, CHANGELOG, PROMPTS, IDEAS
- Documentation stubs (`docs/`): ARCHITECTURE, DEPLOYMENT, DEVELOPMENT, TESTING
- Empty source folders: `src/`, `assets/`, `css/`, `js/`
- Full client-side chess PWA: rules engine, minimax AI, UI, sound, service worker

### Changed

### Fixed
