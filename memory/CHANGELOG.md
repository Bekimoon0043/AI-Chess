# Changelog

## [Unreleased]

### Added
- Complete documentation suite: DEPLOYMENT.md, DEVELOPMENT.md, TESTING.md
- API documentation in docs/ARCHITECTURE.md with method signatures
- Browser support matrix in README.md
- Master Context and Prompts memory files
- Pre-release deployment checklist

### Changed
- README.md expanded with tech stack table, feature checklist, and known limitations
- docs/ARCHITECTURE.md updated with full module API reference

## [0.1.0] - 2026-07-31

### Added
- Repository scaffold: README, LICENSE (MIT), .gitignore
- Memory system (`memory/`): MASTER_CONTEXT, ROADMAP, TASKS, DECISIONS, KNOWLEDGE, CHANGELOG, PROMPTS, IDEAS
- Documentation stubs (`docs/`): ARCHITECTURE, DEPLOYMENT, DEVELOPMENT, TESTING
- Full client-side chess PWA: rules engine, minimax AI, UI, sound, service worker
- DeepSeek review analysis: accepted vs rejected findings documented
- Architecture Decision Records in `memory/DECISIONS.md`
- Technical knowledge base updates in `memory/KNOWLEDGE.md`

### Changed
- Adopted vanilla JS architecture: plain HTML/CSS/JS module structure (supersedes earlier React/Vite consideration for MVP)
- `docs/ARCHITECTURE.md` folder map corrected to match shipped files

### Fixed
- Clarified that en passant, underpromotion UI, stalemate, insufficient material, threefold, and 50-move are already implemented
- Documented centralized `isSquareAttacked` — no duplicate attack logic
