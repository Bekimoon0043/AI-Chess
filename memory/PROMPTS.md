# AI Prompts

## Code Review Prompt

```
Review the AI-Chess codebase for:
1. Performance bottlenecks in js/ai.js (main-thread blocking)
2. Accessibility gaps in js/ui.js and index.html
3. CSS maintainability and responsive design issues
4. Missing error handling boundaries

Consider this is a vanilla JS PWA, not a React/TypeScript app.
```

## Feature Addition Prompt

```
I want to add [FEATURE] to AI-Chess. The codebase uses:
- Vanilla ES6+ modules (IIFE pattern)
- Custom chess rules engine in js/chess.js
- Minimax AI in js/ai.js
- DOM manipulation in js/ui.js
- Web Audio API in js/sound.js

Provide the implementation following existing patterns and update docs/ARCHITECTURE.md.
```

## Debugging Prompt

```
The AI-Chess app has this bug: [DESCRIPTION].
Relevant files: js/chess.js, js/ui.js, js/ai.js.
The app is a vanilla JS chess PWA. Suggest root cause and fix.
```

## Documentation Update Prompt

```
Update the AI-Chess documentation to reflect:
- Current vanilla JS architecture (not React)
- Implemented features vs planned features
- Module API signatures
- Deployment procedures for GitHub Pages
```

## Refactor Prompt

```
Refactor js/ui.js to:
1. Extract board rendering into a separate renderer module
2. Use event delegation instead of per-square listeners
3. Add keyboard navigation support
4. Maintain backward compatibility with existing settings object

Do not introduce build tools or frameworks.
```
