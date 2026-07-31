const UI = (() => {
  let state, history = [], redoStack = [], selectedSquare = null, legalMoves = [];
  let boardOrientation = 'white';
  let settings = { theme: 'dark', sound: true, animationSpeed: 1, showLegal: true, aiDifficulty: 'medium' };
  let gameMode = 'pvc';

  const boardEl = () => document.getElementById('board');
  const statusEl = () => document.getElementById('game-status');
  const moveHistoryEl = () => document.getElementById('move-history');
  const capturedWhiteEl = () => document.getElementById('captured-white');
  const capturedBlackEl = () => document.getElementById('captured-black');

  function coordToId(r, c) { return r + '-' + c; }

  function renderBoard() {
    const el = boardEl();
    if (!el) return;
    el.innerHTML = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const displayRow = boardOrientation === 'white' ? row : 7 - row;
        const displayCol = boardOrientation === 'white' ? col : 7 - col;
        const square = document.createElement('div');
        square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
        square.dataset.row = displayRow;
        square.dataset.col = displayCol;
        square.id = coordToId(displayRow, displayCol);
        const piece = state.grid[displayRow][displayCol];
        if (piece) {
          const pieceDiv = document.createElement('div');
          pieceDiv.className = 'piece';
          pieceDiv.textContent = Chess.PIECE_MAP[piece];
          pieceDiv.addEventListener('mousedown', onDragStart);
          pieceDiv.addEventListener('touchstart', onDragStart, { passive: false });
          square.appendChild(pieceDiv);
        }
        square.addEventListener('click', () => onSquareClick(displayRow, displayCol));
        el.appendChild(square);
      }
    }
    highlightLastMove();
    highlightCheck();
    if (selectedSquare) {
      const sq = document.getElementById(coordToId(selectedSquare.row, selectedSquare.col));
      if (sq) sq.classList.add('selected');
    }
    if (settings.showLegal) {
      legalMoves.forEach(m => {
        const sq = document.getElementById(coordToId(m.r, m.c));
        if (sq) sq.classList.add('legal-dot');
      });
    }
  }

  function highlightLastMove() {
    if (history.length) {
      const last = history[history.length - 1].move;
      if (last) {
        ['from', 'to'].forEach(key => {
          const sq = document.getElementById(coordToId(last[key].r, last[key].c));
          if (sq) sq.classList.add('last-move');
        });
      }
    }
  }

  function highlightCheck() {
    if (Chess.inCheck(state, state.turn)) {
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        if (state.grid[r][c] === (state.turn === 'white' ? 'K' : 'k')) {
          document.getElementById(coordToId(r, c))?.classList.add('check');
        }
      }
    }
  }

  function updateStatus() {
    const el = statusEl();
    if (!el) return;
    if (Chess.isCheckmate(state)) el.textContent = 'Checkmate! ' + Chess.opponent(state.turn) + ' wins.';
    else if (Chess.isStalemate(state)) el.textContent = 'Stalemate! Draw.';
    else if (Chess.insufficientMaterial(state)) el.textContent = 'Draw – insufficient material.';
    else if (Chess.threefoldRepetition(history)) el.textContent = 'Draw – threefold repetition.';
    else if (state.halfMove >= 100) el.textContent = 'Draw – 50-move rule.';
    else el.textContent = state.turn.charAt(0).toUpperCase() + state.turn.slice(1) + ' to move';
  }

  function onSquareClick(row, col) {
    if (gameMode === 'pvc' && state.turn !== 'white') return;
    if (selectedSquare) {
      const move = legalMoves.find(m => m.r === row && m.c === col);
      if (move) {
        if (needsPromotion(selectedSquare.row, selectedSquare.col, row)) {
          showPromotionModal(selectedSquare.row, selectedSquare.col, row, col);
          clearSelection();
          return;
        }
        executeMove(selectedSquare.row, selectedSquare.col, row, col);
      }
      clearSelection();
    } else {
      const piece = state.grid[row][col];
      if (piece && Chess.isWhitePiece(piece) === (state.turn === 'white')) {
        selectSquare(row, col);
      }
    }
  }

  function selectSquare(row, col) {
    clearSelection();
    selectedSquare = { row, col };
    legalMoves = Chess.getLegalMoves(state, row, col);
    renderBoard();
  }

  function clearSelection() {
    selectedSquare = null;
    legalMoves = [];
    renderBoard();
  }

  function needsPromotion(fromR, fromC, toR) {
    const piece = state.grid[fromR][fromC];
    return piece && piece.toLowerCase() === 'p' && (toR === 0 || toR === 7);
  }

  function showPromotionModal(fromR, fromC, toR, toC) {
    const modal = document.getElementById('promotion-modal');
    modal.classList.remove('hidden');
    const choices = document.getElementById('promo-choices');
    choices.innerHTML = '';
    const pieces = state.turn === 'white' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
    pieces.forEach(p => {
      const div = document.createElement('div');
      div.className = 'promo-piece';
      div.textContent = Chess.PIECE_MAP[p];
      div.onclick = () => {
        executeMove(fromR, fromC, toR, toC, p);
        modal.classList.add('hidden');
      };
      choices.appendChild(div);
    });
  }

  function executeMove(fromR, fromC, toR, toC, promo = null) {
    const newState = Chess.movePiece(state, fromR, fromC, toR, toC, promo);
    if (!newState) return;
    history.push({ fen: Chess.toFEN(state), move: { from: { r: fromR, c: fromC }, to: { r: toR, c: toC } } });
    redoStack = [];
    state = newState;
    updateCaptures();
    updateMoveHistory();
    renderBoard();
    updateStatus();
    if (settings.sound) {
      if (Chess.isCheckmate(state)) Sound.checkmate();
      else if (Chess.inCheck(state, state.turn)) Sound.check();
      else Sound.move();
    }
    checkGameOver();
    if (gameMode === 'pvc' && state.turn === 'black' && !Chess.isCheckmate(state) && !Chess.isStalemate(state)) {
      setTimeout(makeAIMove, 300);
    }
  }

  function makeAIMove() {
    const move = AI.getBestMove(state, settings.aiDifficulty);
    if (move) executeMove(move.fromR, move.fromC, move.toR, move.toC);
  }

  function undo() {
    if (!history.length) return;
    redoStack.push({ fen: Chess.toFEN(state), move: history[history.length - 1].move });
    const prev = history.pop();
    state = Chess.parseFEN(prev.fen);
    renderBoard();
    updateStatus();
    updateMoveHistory();
    updateCaptures();
  }

  function redo() {
    if (!redoStack.length) return;
    const next = redoStack.pop();
    history.push({ fen: Chess.toFEN(state), move: next.move });
    state = Chess.parseFEN(next.fen);
    renderBoard();
    updateStatus();
    updateMoveHistory();
    updateCaptures();
  }

  function updateCaptures() {
    const initial = Chess.parseFEN(Chess.INIT_FEN).grid.flat().filter(Boolean);
    const current = state.grid.flat().filter(Boolean);
    const count = (arr, p) => arr.filter(x => x === p).length;
    const missing = (p) => {
      const diff = count(initial, p) - count(current, p);
      return diff > 0 ? Chess.PIECE_MAP[p].repeat(diff) : '';
    };
    const whiteCap = ['p', 'n', 'b', 'r', 'q'].map(missing).join('');
    const blackCap = ['P', 'N', 'B', 'R', 'Q'].map(missing).join('');
    capturedWhiteEl().textContent = 'Captured by White: ' + (whiteCap || '—');
    capturedBlackEl().textContent = 'Captured by Black: ' + (blackCap || '—');
  }

  function updateMoveHistory() {
    moveHistoryEl().innerHTML = history.map((h, i) => {
      const m = h.move;
      return '<div>' + (i + 1) + '. ' +
        String.fromCharCode(97 + m.from.c) + (8 - m.from.r) + ' → ' +
        String.fromCharCode(97 + m.to.c) + (8 - m.to.r) + '</div>';
    }).join('');
  }

  function checkGameOver() {
    if (Chess.isCheckmate(state) || Chess.isStalemate(state) || Chess.insufficientMaterial(state) ||
        Chess.threefoldRepetition(history) || state.halfMove >= 100) {
      document.getElementById('game-over-modal').classList.remove('hidden');
      document.getElementById('game-result-text').textContent = statusEl().textContent;
      if (settings.sound) Sound.victory();
    }
  }

  let dragPiece = null, dragFrom = null;
  function onDragStart(e) {
    e.preventDefault();
    const pieceDiv = e.target.closest('.piece');
    if (!pieceDiv) return;
    const square = pieceDiv.parentElement;
    const row = +square.dataset.row, col = +square.dataset.col;
    if (gameMode === 'pvc' && state.turn !== 'white') return;
    const piece = state.grid[row][col];
    if (!piece || Chess.isWhitePiece(piece) !== (state.turn === 'white')) return;
    dragPiece = pieceDiv;
    dragFrom = { row, col };
    selectSquare(row, col);
    pieceDiv.classList.add('dragging');
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  }

  function onDragMove(e) {
    e.preventDefault();
  }

  function onDragEnd(e) {
    if (!dragPiece) return;
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const square = elem?.closest('.square');
    if (square && dragFrom) {
      const toRow = +square.dataset.row, toCol = +square.dataset.col;
      if (needsPromotion(dragFrom.row, dragFrom.col, toRow)) {
        showPromotionModal(dragFrom.row, dragFrom.col, toRow, toCol);
      } else {
        executeMove(dragFrom.row, dragFrom.col, toRow, toCol);
      }
    }
    dragPiece.classList.remove('dragging');
    dragPiece = null;
    dragFrom = null;
    clearSelection();
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  }

  function applyTheme() {
    document.body.className = settings.theme;
  }

  function bindControls() {
    document.getElementById('btn-undo').addEventListener('click', undo);
    document.getElementById('btn-redo').addEventListener('click', redo);
    document.getElementById('btn-flip').addEventListener('click', () => {
      boardOrientation = boardOrientation === 'white' ? 'black' : 'white';
      renderBoard();
    });
    document.getElementById('btn-new-game').addEventListener('click', newGame);
    document.getElementById('theme-select').addEventListener('change', e => {
      settings.theme = e.target.value;
      applyTheme();
    });
    document.getElementById('sound-toggle').addEventListener('change', e => {
      settings.sound = e.target.checked;
    });
    document.getElementById('show-legal').addEventListener('change', e => {
      settings.showLegal = e.target.checked;
      renderBoard();
    });
    document.getElementById('ai-difficulty').addEventListener('change', e => {
      settings.aiDifficulty = e.target.value;
    });
    const modeEl = document.getElementById('game-mode');
    if (modeEl) modeEl.addEventListener('change', e => { gameMode = e.target.value; });
    document.getElementById('play-again').addEventListener('click', () => {
      document.getElementById('game-over-modal').classList.add('hidden');
      newGame();
    });
    document.getElementById('menu-toggle').addEventListener('click', () => {
      document.getElementById('settings-modal').classList.toggle('hidden');
    });
    document.getElementById('close-settings').addEventListener('click', () => {
      document.getElementById('settings-modal').classList.add('hidden');
    });
    document.getElementById('close-about')?.addEventListener('click', () => {
      document.getElementById('about-modal').classList.add('hidden');
    });
    document.getElementById('close-help')?.addEventListener('click', () => {
      document.getElementById('help-modal').classList.add('hidden');
    });
  }

  function newGame() {
    state = Chess.parseFEN(Chess.INIT_FEN);
    history = [];
    redoStack = [];
    selectedSquare = null;
    legalMoves = [];
    renderBoard();
    updateStatus();
    updateMoveHistory();
    updateCaptures();
    if (settings.sound) Sound.gameStart();
  }

  function init() {
    Sound.init();
    state = Chess.parseFEN(Chess.INIT_FEN);
    bindControls();
    applyTheme();
    renderBoard();
    updateStatus();
    updateCaptures();
  }

  return { init };
})();
