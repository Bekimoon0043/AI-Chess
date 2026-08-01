# Multiplayer / Telegram Mini App — Setup Notes

## What changed

| File | Status | Purpose |
|---|---|---|
| `js/telegram.js` | new | Telegram WebApp SDK wrapper (theme, haptics, MainButton, BackButton, safe areas, native popups) |
| `js/multiplayer.js` | new | REST client + SSE/long-poll sync + offline move queue |
| `js/timer.js` | new | Chess clock, server-synced |
| `js/lobby.js` | new | Quick match / invite-a-friend / spectate / leaderboard screen |
| `js/ui.js` | modified | Routes moves through `submitMove()` → local or online; player bars, chat, resign/draw, move confirmation |
| `js/app.js` | modified | Comment-only; confirms async `UI.init()` is safe to fire-and-forget |
| `index.html` | modified | Telegram SDK tag, config block, lobby screen, player bars, chat overlay, move-confirm bar |
| `css/styles.css` | modified | New styles built on existing design tokens |
| `docs/TELEGRAM_MINI_APP.md` | new | Bot command flow, message templates, inline keyboards |

Nothing about the existing vs-AI or pass-and-play modes changed behaviorally
— `gameMode` just gained a third value (`'online'`), and every place that
used to hardcode `pvc`/`pvp` logic now goes through `canInteract()`.

## Configure before deploying

In `index.html`, near the top of the script block:

```html
<script>
  window.CHESS_API_BASE_URL = 'https://api.chess.example.com/v1';
  window.CHESS_BOT_USERNAME = 'your_bot';
</script>
```

Point these at your real backend and bot username. `multiplayer.js` and
`lobby.js` read them off `window` rather than hardcoding.

## What still needs a real backend

This refactor is the *client*. It talks to the REST/SSE contract:

- `POST /auth/telegram`
- `/games`, `/games/:id/move`, `/games/:id/state`
- `/invites`, `/matchmaking/queue`, `/users/me`
- `GET /leaderboard?type=ranked`
- `POST /games/:id/chat`

`GET /games/:id/state` needs to support both SSE (`?stream=1`) and long-poll fallback (`?since=`).

## Telegram review guidelines — what's covered

- **No external links**: every button uses `web_app` buttons or `t.me/share/url`
- **Proper viewport**: safe area CSS vars from Telegram SDK
- **Fast loading**: no new build step; plain script tags
- **Theme sync**: maps Telegram `themeParams` onto existing CSS variables

## Known simplifications

- Move confirmation is client-side UX only
- Spectator mode assumes open GET on games
- Live games list currently reuses leaderboard as a placeholder
