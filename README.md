# AI-Chess

An AI-powered chess application that combines classic chess gameplay with intelligent AI opponents, analysis tools, and a structured project memory system.

## Overview

AI-Chess is a fully client-side Progressive Web App (PWA) designed for free hosting on GitHub Pages. All game logic, AI evaluation, audio synthesis, and UI state run entirely in the browser with zero backend dependencies.

### Features

- **Play against AI** — Three difficulty levels (Easy, Medium, Hard) powered by minimax + alpha-beta pruning
- **Two-Player Mode** — Pass-and-Play local multiplayer
- **Full FIDE Rules** — Castling, en passant, promotion (with underpromotion), check, checkmate, stalemate, draw detection
- **Move History** — Complete undo/redo stack with algebraic notation display
- **Captured Pieces** — Live material advantage tracking
- **Sound Effects** — Synthesized audio via Web Audio API (move, capture, check, checkmate, victory)
- **Themes** — Dark and Light modes with CSS custom properties
- **Responsive Design** — Mobile-first, touch-optimized drag-and-drop
- **Offline Play** — PWA with Service Worker cache-first strategy
- **Board Flip** — View from either side

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Vanilla JavaScript (ES6+) |
| Styling | Plain CSS + CSS Variables |
| Rules Engine | Custom implementation (`js/chess.js`) |
| AI Engine | Custom minimax + alpha-beta (`js/ai.js`) |
| Audio | Web Audio API |
| Hosting | GitHub Pages |
| PWA | Service Worker + Web App Manifest |

## Project Structure

```
AI-Chess/
├── index.html              # Entry point, PWA manifest link
├── css/
│   └── styles.css          # Themes, board, layout, responsive rules
├── js/
│   ├── chess.js            # Rules engine (FEN, legal moves, special moves)
│   ├── ai.js               # Minimax AI with difficulty levels
│   ├── sound.js            # Web Audio API synthesis
│   ├── ui.js               # DOM board, interaction, history, modals
│   └── app.js              # Bootstrap + Service Worker registration
├── icons/
│   └── chess.svg           # App / PWA icon
├── manifest.json           # Web App Manifest
├── sw.js                   # Service Worker (cache-first)
├── memory/                 # AI project memory & knowledge base
└── docs/                   # Technical documentation
```

## Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- [Optional] A local static file server for development

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Bekimoon0043/AI-Chess.git
   cd AI-Chess
   ```

2. Serve locally (recommended for Service Worker/PWA testing):
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (npx)
   npx serve .

   # VS Code Live Server extension
   ```

3. Open `http://localhost:8000` in your browser.

4. For PWA install testing, use Chrome DevTools → Application → Service Workers.

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) — System design, data flow, module boundaries
- [Developer Guide](docs/DEVELOPMENT.md) — Setup, coding standards, contribution workflow
- [Deployment Guide](docs/DEPLOYMENT.md) — GitHub Pages, cache busting, release checklist
- [Testing Guide](docs/TESTING.md) — Manual testing matrix, browser compatibility

## Memory System

This repository uses a structured AI memory system to maintain project knowledge:

| File | Purpose |
|------|---------|
| `memory/MASTER_CONTEXT.md` | High-level project context and goals |
| `memory/ROADMAP.md` | Product roadmap and milestones |
| `memory/TASKS.md` | Current tasks and backlog |
| `memory/DECISIONS.md` | Architecture and product decisions (ADRs) |
| `memory/KNOWLEDGE.md` | Domain and technical knowledge |
| `memory/CHANGELOG.md` | Version history |
| `memory/PROMPTS.md` | Useful AI prompts |
| `memory/IDEAS.md` | Future ideas and experiments |

## Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |
| Mobile Safari | 14+ | Touch optimized |
| Chrome Android | 90+ | PWA installable |

## Known Limitations

- AI runs on the main thread (may freeze UI on Hard difficulty) — Web Worker migration planned
- No chess clocks implemented yet
- Settings are not persisted across sessions (planned: LocalStorage/IndexedDB)
- No PGN import/export yet

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
