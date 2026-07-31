# Testing Guide

## Philosophy

This is a client-side PWA with no backend. Testing is primarily **manual** with **automated linting**. Unit tests for the rules engine are recommended but not yet implemented.

## Manual Testing Matrix

### Core Gameplay

| Test Case | Steps | Expected Result |
|-----------|-------|----------------|
| New Game | Click "New Game" | Board resets to starting position, White to move |
| Pawn Move | Click white pawn, click e4 | Pawn moves to e4 |
| Knight Move | Click knight, click valid square | Knight moves in L-shape |
| Bishop Move | Click bishop, click diagonal | Bishop moves diagonally |
| Rook Move | Click rook, click straight | Rook moves horizontally/vertically |
| Queen Move | Click queen, click any direction | Queen moves correctly |
| King Move | Click king, click adjacent | King moves one square |
| Capture | Move piece to occupied enemy square | Enemy piece removed, capture sound plays |

### Special Moves

| Test Case | Steps | Expected Result |
|-----------|-------|----------------|
| Castling Kingside | Move king from e1 to g1 | King and h1 rook move simultaneously |
| Castling Queenside | Move king from e1 to c1 | King and a1 rook move simultaneously |
| En Passant | Move pawn two squares; opponent captures as if one | Pawn captured, correct square cleared |
| Promotion | Move pawn to 8th rank | Modal appears; select Q/R/B/N |
| Underpromotion | Select R/B/N in promotion modal | Correct piece placed |

### Game End Conditions

| Test Case | Steps | Expected Result |
|-----------|-------|----------------|
| Checkmate | Trap opponent king | "Checkmate" status, game over modal |
| Stalemate | Block all legal moves without check | "Stalemate" status, draw |
| Insufficient Material | K vs K, K+B vs K, etc. | "Draw" status |
| 50-Move Rule | 50 moves without pawn move/capture | "Draw" status |
| Threefold Repetition | Repeat position 3 times | "Draw" status |

### UI Features

| Test Case | Steps | Expected Result |
|-----------|-------|----------------|
| Undo | Click "Undo" | Last move reversed |
| Redo | Click "Redo" after undo | Move replayed |
| Board Flip | Click "Flip" | Board rotates 180° |
| Theme Switch | Settings → Theme → Light/Dark | Colors change immediately |
| Sound Toggle | Settings → Sound on/off | Sounds play or silent |
| Legal Moves Toggle | Settings → Show legal moves | Dots appear/disappear |
| AI Difficulty | Settings → Easy/Medium/Hard | AI response time/quality changes |

### AI Behavior

| Difficulty | Expected Behavior |
|------------|-------------------|
| Easy | Random move selection among legal moves, depth 1 |
| Medium | Best move at depth 2, ~1-2s think time |
| Hard | Best move at depth 3, may freeze UI briefly |

### PWA & Offline

| Test Case | Steps | Expected Result |
|-----------|-------|----------------|
| Service Worker | DevTools → Application → SW | SW registered and active |
| Offline Play | DevTools → Network → Offline | Game still functional |
| Install Prompt | Chrome menu → Install AI-Chess | App installs to desktop/home screen |
| Cache Update | Deploy new version, revisit | New assets loaded (cache busted) |

## Browser Compatibility

Test on the following before release:

| Browser | OS | Priority |
|---------|-----|----------|
| Chrome 120+ | Windows/macOS | P0 |
| Firefox 120+ | Windows/macOS | P0 |
| Safari 17+ | macOS | P0 |
| Safari iOS 17+ | iOS | P0 |
| Chrome Android | Android | P1 |
| Edge 120+ | Windows | P1 |

## Automated Testing (Future)

Recommended additions:
- **Jest** for `chess.js` unit tests (FEN parsing, move legality)
- **Playwright** for E2E tests (move execution, UI flows)
- **Lighthouse CI** for performance regression testing

## Bug Reporting Template

When filing issues, include:

```markdown
**Browser:** [Chrome 120 / Safari iOS 17 / etc.]
**Mode:** [PvC Easy / PvC Hard / PvP]
**Steps:**
1. 
2. 
3. 

**Expected:** 
**Actual:** 
**Console Errors:** [if any]
**Screenshot:** [if applicable]
```
