# Decisions

## Architecture Decisions

### ADR-001: Client-side only (no backend)
- **Decision:** Ship as a pure static site on GitHub Pages.
- **Rationale:** Zero hosting cost, simple deployment, full offline capability.
- **Consequence:** No multiplayer server, no cloud accounts; all state is local.

### ADR-002: Vanilla JavaScript architecture (not React/Vite)
- **Decision:** Use plain HTML + CSS + modular ES modules instead of a framework build pipeline.
- **Rationale:** Simpler deployment to GitHub Pages, smaller bundle, no build step required for basic development, easier offline caching of individual files.
- **Note:** Earlier planning considered React 18 + Vite + TypeScript; the chosen architecture favors a lighter vanilla stack for this MVP.

### ADR-003: Stockfish in a Web Worker
- **Decision:** Run Stockfish.js exclusively inside a dedicated Web Worker.
- **Rationale:** Prevents UI freezes during deep searches; keeps main thread responsive on mobile.

### ADR-004: chess.js for rules
- **Decision:** Use chess.js for board state, legal moves, check/checkmate/draw detection, and PGN.
- **Rationale:** Battle-tested, small, pure JS, perfect for client-side use.

### ADR-005: PWA with Service Worker
- **Decision:** Implement `sw.js` + `manifest.json` for installability and offline play.
- **Rationale:** Core distribution strategy for a free static app; users can install and play without network.

## Technology Choices

| Area | Choice | Why |
|------|--------|-----|
| Rules engine | chess.js | Lightweight, complete FIDE rules |
| AI engine | Stockfish.js (WASM/JS) in Web Worker | Strong play, runs in browser |
| Styling | Plain CSS + CSS variables | No build step, easy theming |
| Audio | Web Audio API | Precise, low-latency sound effects |
| Persistence | LocalStorage / IndexedDB | Offline game state |
| Hosting | GitHub Pages | Free, integrated with repo |
| Routing | Single-page (hash or no routes) | Avoids GH Pages 404 issues |

## Process Decisions

- Keep architecture documentation in `docs/ARCHITECTURE.md` as the source of truth for structure.
- Record significant choices in this file (DECISIONS.md) as ADRs.
- Prefer incremental, phase-based delivery aligned with the roadmap in `memory/ROADMAP.md`.

## Open Questions

- Exact Stockfish build (full WASM vs. lighter JS-only) for best mobile performance?
- Whether to later introduce a lightweight build step (e.g., esbuild) without adopting a full framework?
- Preferred piece set format (inline SVG vs. external files) for optimal offline caching?
