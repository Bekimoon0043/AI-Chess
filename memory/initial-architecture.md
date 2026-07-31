# Architecture Decisions

- Board state stored as FEN + internal object. History maintained as FEN stack.
- Chess module pure functions, no side effects.
- AI module uses minimax with alpha-beta; piece-square tables omitted for simplicity but extensible.
- UI module directly manipulates DOM, no virtual DOM needed.
- Sound synthesized via Web Audio API to avoid external assets.
- PWA with service worker caching all static assets for full offline play.
- Settings stored in memory (localStorage can be added later).
- Dark/light themes controlled by body class.
- Default mode: Player vs Computer (White human, Black AI).
