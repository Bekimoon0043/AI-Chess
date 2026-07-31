# Tasks

## Current Tasks

### Phase 1 – Architecture & Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS with Dark/Light theme CSS variables
- [ ] Set up ESLint + Prettier
- [ ] Create GitHub Actions workflow for GH Pages deployment (`.github/workflows/deploy.yml`)
- [ ] Configure base HTML metadata, OpenGraph tags, and Web App Manifest structure
- [ ] Align repository folder structure with planned architecture (`src/components`, `src/hooks`, `src/workers`, `public/engine`, etc.)

## Backlog

### Phase 2 – Core Engine & Local Gameplay
- [ ] Integrate chess.js (rules, legal moves, castling, en passant, check/checkmate, draws)
- [ ] Build mobile-first interactive chessboard (Pointer Events, drag-and-drop, tap-to-move)
- [ ] Implement Pass-and-Play (Two-Player) mode
- [ ] Implement move history stack with Undo / Redo
- [ ] Build Pawn Promotion modal/selection UI

### Phase 3 – AI Engine & Timers
- [ ] Load Stockfish.js in a dedicated Web Worker
- [ ] Create UCI messaging abstraction (`useStockfish` hook / worker bridge)
- [ ] Add AI difficulty levels (Skill Level / Depth / Movetime tuning)
- [ ] Implement configurable chess clocks using `performance.now()`

### Phase 4 – UI/UX, Sound & Animations
- [ ] Integrate Web Audio API sound effects (move, capture, check, castle, game over, low time)
- [ ] Add piece movement animations and board flip transition
- [ ] Build Captured Pieces component with material differential
- [ ] Build Settings Modal (board theme, piece set, sound, legal move highlights, AI difficulty)

### Phase 5 – PWA & SEO
- [ ] Implement Workbox Service Worker (cache-first for assets, engine, sounds)
- [ ] Complete PWA manifest, icons, offline fallback, install prompt
- [ ] Optimize Lighthouse scores (code splitting, SVG optimization, pre-caching)
- [ ] Finalize SEO metadata, JSON-LD, semantic HTML, sitemap

### Phase 6 – QA & Release
- [ ] Cross-browser E2E testing (Chrome, Safari iOS, Firefox, Edge)
- [ ] Mobile performance profiling during AI calculation
- [ ] Final deployment pipeline to `gh-pages` branch

## Completed

- [x] Repository scaffold with memory system, docs, and project structure
- [x] Technical project blueprint / planning document accepted

## Blocked

- None currently
