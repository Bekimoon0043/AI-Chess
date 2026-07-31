# Roadmap

## Vision

Build a production-ready, fully client-side AI Chess Web Application hosted free on GitHub Pages. All logic (engine, state, audio, rendering) runs in the browser with offline PWA support.

**Tech Stack:**
- Frontend: React 18 / Vite + TypeScript
- CSS: Tailwind CSS (Dark/Light themes)
- Rules Engine: chess.js
- AI Engine: Stockfish.js in a Web Worker
- Board: Custom Canvas/SVG with CSS transitions
- PWA: Workbox Service Worker + IndexedDB/LocalStorage

## Milestones

```
[Phase 1: Foundations] ──> [Phase 2: Core Gameplay] ──> [Phase 3: AI Engine] ──> [Phase 4: UX & Audio] ──> [Phase 5: PWA & SEO] ──> [Phase 6: Deployment]
```

### Phase 1: Architecture & Project Setup (Weeks 1–2)
- Initialize Vite + React + TypeScript repository structure
- Configure Tailwind CSS with CSS variables for Dark/Light theme switching
- Set up ESLint, Prettier, and GitHub Actions for GH Pages deployment
- Configure HTML metadata, OpenGraph tags, and Web App Manifest

### Phase 2: Core Engine & Local Gameplay (Weeks 3–4)
- Integrate chess.js (rules, legal moves, castling, en passant, check/checkmate, draws)
- Mobile-first interactive chessboard (touch drag-and-drop & tap-to-move)
- Pass-and-Play (Two-Player) mode
- Move history stack with Undo / Redo
- Pawn Promotion modal

### Phase 3: AI Engine Integration & Timers (Weeks 5–6)
- Stockfish.js inside a dedicated Web Worker
- UCI protocol abstraction over worker messages
- AI Difficulty levels (Beginner, Intermediate, Advanced)
- Configurable chess clocks (Standard, Blitz, Bullet, Rapid, Custom)

### Phase 4: UI/UX Refinement, Sound & Animations (Weeks 7–8)
- Sound effects via Web Audio API
- Piece movement animations and board flipping
- Captured pieces & material advantage display
- Settings Modal (themes, piece sets, sound, highlights, AI difficulty)

### Phase 5: Offline PWA & SEO Optimization (Weeks 9–10)
- Workbox Service Worker (cache-first)
- Full PWA requirements (manifest, icons, offline fallback, install prompt)
- Lighthouse performance optimization
- SEO metadata, JSON-LD, semantic HTML, sitemap

### Phase 6: QA, Risk Mitigation & Release (Weeks 11–12)
- Cross-browser E2E testing
- Mobile performance profiling
- Final deployment to gh-pages branch

## Timeline

- **Target:** 6 Sprints / 12 Weeks (solo or small-team)
- **Deployment Target:** GitHub Pages via GitHub Actions CI/CD

## Priorities

### P0 – Must Have
- Mobile-first responsive board
- Chess rules logic (chess.js)
- Single-player AI (Web Worker)
- Two-player local mode
- Undo / Redo & move history
- Check / Checkmate / Draw rules

### P1 – Should Have
- Timers & clocks
- Dark / Light theme
- Captured pieces display
- Sound effects & animations
- PWA & offline capability

### P2 – Nice to Have
- SEO & OpenGraph tags
- Custom piece / board skins
