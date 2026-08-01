# AI-Chess Telegram Bot — Command Flow Spec

This documents the conversational side of the Mini App: every bot command,
its inline keyboards, and the exact message copy. It's the source of truth
for whatever implements the bot side (n8n workflows, a small Node service,
whatever you land on) — the Mini App frontend doesn't care how commands are
handled, only that the backend + bot agree on this contract.

All messages use Telegram's Markdown (`parse_mode: "Markdown"`). Every
button that opens the app uses a `web_app` button (opens in-place, full
Mini App context) — never a plain `url` button pointing at the app, since
Telegram's review guidelines for Mini Apps flag external-navigation buttons
that could've been `web_app` buttons instead.

---

## `/start`

Two cases, based on whether the user arrived via a deep link
(`t.me/your_bot?start=game_ABC123`) or typed `/start` cold.

**Cold start** (`start_param` empty):

```
♟️ *Welcome to AI-Chess!*

Play chess against the AI, pass-and-play with a friend on
one device, or jump into ranked online multiplayer — all
inside Telegram.
```

Keyboard:
```
[ ▶️ Open AI-Chess ]   (web_app → https://your-chess-app.vercel.app/)
```

**Deep-link start** (`start_param = game_ABC123`):

```
♟️ You've been invited to a game!

Tap below to join.
```

Keyboard:
```
[ ▶️ Join Game ]   (web_app → https://your-chess-app.vercel.app/?game=ABC123)
```

The Mini App itself also handles this deep link natively (see
`UI.init()` in `js/ui.js`, which reads `Telegram.WebApp.initDataUnsafe.start_param`
and auto-joins) — the bot's `/start` reply is a fallback for people who see
the message before tapping through, and for re-sharing the link as plain text.

---

## `/newgame`

Creates a private game and returns a shareable invite.

```
🎮 *Game created!*

Time control: 10+0
Share this with a friend, or tap below to start
waiting in the app.
```

Keyboard:
```
[ 🔗 Share Invite ]   (url → https://t.me/share/url?url=<invite_link>&text=Let's play chess!)
[ ▶️ Open Game    ]   (web_app → https://your-chess-app.vercel.app/?game=<gameId>)
```

`Share Invite` deliberately uses Telegram's own `t.me/share/url` share sheet
rather than a raw link-copy — this keeps the flow inside Telegram's native
UI rather than sending the user to an external share dialog, which matters
for review.

If the user has no linked account yet (first-ever interaction), the backend
creates one from the Telegram `id`/`username`/`first_name` in the update
before creating the game — no separate signup step.

---

## `/join <code>`

```
✅ *Found your game!*

Opponent: @{opponent_username} ({opponent_elo})
Time control: {time_control}
```

Keyboard:
```
[ ▶️ Join Game ]   (web_app → https://your-chess-app.vercel.app/?game=<gameId>)
```

**Error cases** (code missing, expired, or already full) reply in plain
text, no keyboard, e.g.:

```
❌ That invite code isn't valid or has expired.
Ask your friend to send /newgame again.
```

---

## `/stats`

```
📊 *Your stats*

Ranked ELO: {elo_ranked}
Casual ELO: {elo_casual}
Games played: {games_played}
Record: {games_won}W · {games_drawn}D · {games_played - games_won - games_drawn}L
```

Keyboard:
```
[ 🏆 Leaderboard ]   (callback_data → "leaderboard")
[ ▶️ Play        ]   (web_app → https://your-chess-app.vercel.app/)
```

The `Leaderboard` button uses `callback_data` rather than re-triggering
`/leaderboard` as a typed command — cheaper round trip, and it lets the bot
edit the existing message in place instead of sending a new one.

---

## `/leaderboard`

```
🏆 *Top players — Ranked*

 1. @{username}   {elo}
 2. @{username}   {elo}
 3. @{username}   {elo}
 4. @{username}   {elo}
 5. @{username}   {elo}
```

Keyboard:
```
[ ▶️ Play ]   (web_app → https://your-chess-app.vercel.app/)
```

If the requester is outside the top 5, append one more line before the
keyboard:

```
—
{rank}. You   {elo}
```

---

## Unknown / malformed input

```
Sorry, I didn't understand that. Try:
/newgame — start a game and invite a friend
/join <code> — join a game by invite code
/stats — your rating and record
/leaderboard — top players
```

No keyboard (a "did you mean" wall of buttons for a typo is noisier than
just re-listing the commands).

---

## Async notifications (not slash commands)

These fire from the backend when something happens while the user isn't
actively in the Mini App — implemented as the n8n webhook workflows from
the earlier n8n workflows for this project (move relay, game-end, matchmaking-found).

**Opponent moved**: "♟️ {opponent} played {move}. It's your turn!"

**Game ended**: result + new rating.

**Match found**: color + time control + Open Game button.

All three, like every command above, open the Mini App via a `web_app`
inline button — consistent with the rest of this spec and with Telegram's
Mini App review guidelines.
