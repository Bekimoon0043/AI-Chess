# Developer Guide

## Development Environment

### Prerequisites
- Any modern code editor (VS Code recommended)
- A local static file server (required for Service Worker testing)
- Git

### Recommended VS Code Extensions
- **Live Server** — Instant local server with auto-reload
- **ESLint** — JavaScript linting
- **Prettier** — Code formatting

## Project Setup

```bash
git clone https://github.com/Bekimoon0043/AI-Chess.git
cd AI-Chess
```

## Local Development Server

Because Service Workers require HTTPS or localhost, you must serve files via a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Open `http://localhost:8000` in your browser.

## Coding Standards

### JavaScript
- Use ES6+ features (arrow functions, `const`/`let`, template literals)
- Prefer `const` over `let`; avoid `var`
- Use the Module pattern (IIFE) for encapsulation
- Export public API as an object at module end
- Keep functions pure where possible; mutate DOM only in `ui.js`

### CSS
- Use CSS custom properties (variables) for theming
- Mobile-first media queries
- Consistent kebab-case class names

### File Organization
- `js/chess.js` — Pure logic, no DOM access
- `js/ai.js` — Pure logic, depends only on `Chess`
- `js/sound.js` — Audio only, no game logic
- `js/ui.js` — DOM manipulation only, orchestrates `Chess`, `AI`, `Sound`
- `js/app.js` — Entry point, initialization only

## Debugging

### AI Performance
Open DevTools → Performance → Record while AI thinks. Look for long tasks (>50ms) on the main thread.

### Service Worker
- Chrome DevTools → Application → Service Workers
- Check "Update on reload" during development
- Use "Clear storage" to reset cache

### Common Issues

| Issue | Solution |
|-------|----------|
| Audio doesn't play | `Sound.init()` must be called after a user gesture (click) |
| Board doesn't render | Check that `index.html` includes all `<script>` tags in correct order |
| AI freezes UI | Expected on Hard difficulty; Web Worker migration planned |
| SW not registering | Must use `http://localhost` or HTTPS, not `file://` |

## Adding Features

### Adding a New Sound
1. Add method to `js/sound.js`:
   ```javascript
   mySound: () => play(440, 'sine', 0.2)
   ```
2. Call `Sound.mySound()` in `js/ui.js` at the appropriate event.

### Adding a Theme
1. Add CSS in `css/styles.css`:
   ```css
   body.my-theme { background: #...; color: #...; }
   ```
2. Add option to theme `<select>` in `index.html`
3. Handle in `js/ui.js` `applyTheme()`

### Adding an AI Difficulty
1. Update depth map in `js/ai.js`:
   ```javascript
   const depth = { easy: 1, medium: 2, hard: 3, expert: 4 }[difficulty] || 2;
   ```
2. Add option to difficulty `<select>` in `index.html`
3. Ensure performance is acceptable before shipping.

## Git Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes, test locally
3. Update `memory/CHANGELOG.md` under `[Unreleased]`
4. Commit with descriptive message
5. Push and open Pull Request

## Testing Before Commit

- Game starts without errors
- All piece types move correctly
- Special moves work: castling, en passant, promotion
- Undo/redo functions correctly
- AI responds in all difficulties
- Sound plays on move/check/mate
- Theme switch works
- Board flip works
- Service Worker registers (check DevTools)
- Works on mobile viewport (DevTools responsive mode)
