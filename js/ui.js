const UI = (() => {
  let state, history = [], redoStack = [], selectedSquare = null, legalMoves = [];
  let boardOrientation = 'white';
  let settings = { theme: 'dark', sound: true, animationSpeed: 1, showLegal: true, aiDifficulty: 'medium' };
  let gameMode = 'pvc';
  let gameStartTime = null;
  const CONFETTI_COLORS = ['#7c5cff', '#ffb648', '#35d399', '#ff5470', '#8a72ff', '#ffd166'];

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
      document.getElementById('ai-thinking')?.classList.add('active');
      setTimeout(() => { document.getElementById('ai-thinking')?.classList.remove('active'); makeAIMove(); }, 300);
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
    renderBoard(); updateStatus(); updateMoveHistory(); updateCaptures();
  }

  function redo() {
    if (!redoStack.length) return;
    const next = redoStack.pop();
    history.push({ fen: Chess.toFEN(state), move: next.move });
    state = Chess.parseFEN(next.fen);
    renderBoard(); updateStatus(); updateMoveHistory(); updateCaptures();
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
    const wEl = capturedWhiteEl(); const bEl = capturedBlackEl();
    if (wEl) wEl.innerHTML = whiteCap || '<span class="empty">—</span>';
    if (bEl) bEl.innerHTML = blackCap || '<span class="empty">—</span>';
  }

  function updateMoveHistory() {
    const el = moveHistoryEl();
    if (!el) return;
    el.innerHTML = history.map((h, i) => {
      const m = h.move;
      return '<div>' + (i + 1) + '. ' + String.fromCharCode(97 + m.from.c) + (8 - m.from.r) + ' → ' + String.fromCharCode(97 + m.to.c) + (8 - m.to.r) + '</div>';
    }).join('');
  }

  function checkGameOver() {
    if (Chess.isCheckmate(state) || Chess.isStalemate(state) || Chess.insufficientMaterial(state) || Chess.threefoldRepetition(history) || state.halfMove >= 100) {
      document.getElementById('game-over-modal').classList.remove('hidden');
      document.getElementById('game-result-text').textContent = statusEl().textContent;
      updateResultStats();
      if (Chess.isCheckmate(state)) spawnConfetti();
      if (settings.sound) Sound.victory();
    }
  }

  function updateResultStats() {
    const el = document.getElementById('result-stats');
    if (!el) return;
    const elapsed = gameStartTime ? Math.max(0, Math.round((Date.now() - gameStartTime) / 1000)) : 0;
    const mins = Math.floor(elapsed / 60), secs = elapsed % 60;
    el.innerHTML = [{ label: 'Moves', value: history.length }, { label: 'Time', value: mins + ':' + String(secs).padStart(2, '0') }, { label: 'Mode', value: gameMode === 'pvc' ? 'Vs AI' : 'Vs Player' }].map(s => '<div class="result-stat"><b>' + s.value + '</b><span>' + s.label + '</span></div>').join('');
  }

  function spawnConfetti() {
    const layer = document.getElementById('confetti-layer');
    if (!layer) return;
    layer.innerHTML = '';
    for (let i = 0; i < 26; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.animationDuration = (1.4 + Math.random() * 1.2) + 's';
      piece.style.animationDelay = (Math.random() * 0.4) + 's';
      layer.appendChild(piece);
    }
    setTimeout(() => { layer.innerHTML = ''; }, 3200);
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
    dragPiece = pieceDiv; dragFrom = { row, col };
    selectSquare(row, col);
    pieceDiv.classList.add('dragging');
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  }
  function onDragMove(e) { e.preventDefault(); }
  function onDragEnd(e) {
    if (!dragPiece) return;
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const square = elem?.closest('.square');
    if (square && dragFrom) {
      const toRow = +square.dataset.row, toCol = +square.dataset.col;
      if (needsPromotion(dragFrom.row, dragFrom.col, toRow)) showPromotionModal(dragFrom.row, dragFrom.col, toRow, toCol);
      else executeMove(dragFrom.row, dragFrom.col, toRow, toCol);
    }
    dragPiece.classList.remove('dragging');
    dragPiece = null; dragFrom = null;
    clearSelection();
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  }

  function applyTheme() {
    document.body.className = settings.theme;
    const sel = document.getElementById('theme-select');
    if (sel) sel.value = settings.theme;
  }
  function toggleTheme() {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  }
  function openModal(id) {
    document.getElementById(id)?.classList.remove('hidden');
    document.getElementById(id)?.setAttribute('aria-hidden', 'false');
  }
  function closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
    document.getElementById(id)?.setAttribute('aria-hidden', 'true');
  }
  function setSegmented(groupId, value) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.segmented-opt').forEach(btn => {
      const active = btn.dataset.value === value;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(active));
    });
  }

  function bindControls() {
    document.getElementById('btn-undo')?.addEventListener('click', undo);
    document.getElementById('btn-redo')?.addEventListener('click', redo);
    document.getElementById('btn-flip')?.addEventListener('click', () => {
      boardOrientation = boardOrientation === 'white' ? 'black' : 'white';
      renderBoard();
    });
    document.getElementById('btn-new-game')?.addEventListener('click', newGame);
    document.getElementById('theme-select')?.addEventListener('change', e => { settings.theme = e.target.value; applyTheme(); });
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('home-theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('sound-toggle')?.addEventListener('change', e => { settings.sound = e.target.checked; });
    document.getElementById('show-legal')?.addEventListener('change', e => { settings.showLegal = e.target.checked; renderBoard(); });
    document.getElementById('anim-speed')?.addEventListener('input', e => {
      settings.animationSpeed = parseFloat(e.target.value) || 1;
      document.documentElement.style.setProperty('--speed', String(settings.animationSpeed));
      const out = document.getElementById('anim-speed-value');
      if (out) out.textContent = settings.animationSpeed.toFixed(1) + '×';
    });
    document.getElementById('ai-difficulty')?.addEventListener('change', e => { settings.aiDifficulty = e.target.value; });
    const modeEl = document.getElementById('game-mode');
    if (modeEl) modeEl.addEventListener('change', e => { gameMode = e.target.value; });
    document.getElementById('play-again')?.addEventListener('click', () => { closeModal('game-over-modal'); newGame(); });
    document.getElementById('game-over-settings')?.addEventListener('click', () => { closeModal('game-over-modal'); openModal('settings-modal'); });
    document.getElementById('menu-toggle')?.addEventListener('click', () => openModal('settings-modal'));
    document.getElementById('close-settings')?.addEventListener('click', () => closeModal('settings-modal'));
    document.getElementById('close-settings-btn')?.addEventListener('click', () => closeModal('settings-modal'));
    document.getElementById('btn-about')?.addEventListener('click', () => openModal('about-modal'));
    document.getElementById('close-about')?.addEventListener('click', () => closeModal('about-modal'));
    document.getElementById('close-about-x')?.addEventListener('click', () => closeModal('about-modal'));
    document.getElementById('btn-help')?.addEventListener('click', () => openModal('help-modal'));
    document.getElementById('close-help')?.addEventListener('click', () => closeModal('help-modal'));
    document.getElementById('close-help-x')?.addEventListener('click', () => closeModal('help-modal'));
    document.getElementById('start-help-link')?.addEventListener('click', () => openModal('help-modal'));
    document.getElementById('start-mode-group')?.addEventListener('click', e => {
      const btn = e.target.closest('.segmented-opt');
      if (!btn) return;
      const val = btn.dataset.value;
      gameMode = val;
      if (modeEl) modeEl.value = val;
      setSegmented('start-mode-group', val);
      const field = document.getElementById('start-difficulty-field');
      if (field) field.style.display = val === 'pvc' ? '' : 'none';
    });
    document.getElementById('start-difficulty-group')?.addEventListener('click', e => {
      const btn = e.target.closest('.segmented-opt');
      if (!btn) return;
      const val = btn.dataset.value;
      settings.aiDifficulty = val;
      const diffEl = document.getElementById('ai-difficulty');
      if (diffEl) diffEl.value = val;
      setSegmented('start-difficulty-group', val);
    });
    document.getElementById('btn-start-play')?.addEventListener('click', enterGame);
    document.getElementById('btn-home')?.addEventListener('click', showStartScreen);
  }

  function enterGame() {
    document.getElementById('start-screen')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    newGame();
  }
  function showStartScreen() {
    document.getElementById('app')?.classList.add('hidden');
    document.getElementById('start-screen')?.classList.remove('hidden');
  }

  function newGame() {
    state = Chess.parseFEN(Chess.INIT_FEN);
    history = []; redoStack = [];
    selectedSquare = null; legalMoves = [];
    gameStartTime = Date.now();
    document.getElementById('toast')?.classList.add('hidden');
    const confetti = document.getElementById('confetti-layer');
    if (confetti) confetti.innerHTML = '';
    renderBoard(); updateStatus(); updateMoveHistory(); updateCaptures();
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
