const AI = (() => {
  const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

  function evaluate(state) {
    let score = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const piece = state.grid[r][c];
      if (!piece) continue;
      const val = pieceValues[piece.toLowerCase()] || 0;
      score += Chess.isWhitePiece(piece) ? val : -val;
    }
    return score;
  }

  function getAllMoves(state, color) {
    const moves = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      if (state.grid[r][c] && Chess.isWhitePiece(state.grid[r][c]) === (color === 'white')) {
        const legals = Chess.getLegalMoves(state, r, c);
        for (const m of legals) moves.push({ fromR: r, fromC: c, toR: m.r, toC: m.c });
      }
    }
    return moves;
  }

  function minimax(state, depth, alpha, beta, maximizing) {
    if (depth === 0 || Chess.isCheckmate(state) || Chess.isStalemate(state)) {
      if (Chess.isCheckmate(state)) return maximizing ? -99999 : 99999;
      return evaluate(state);
    }
    const color = maximizing ? state.turn : Chess.opponent(state.turn);
    const moves = getAllMoves(state, color);
    if (maximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const child = Chess.movePiece(state, move.fromR, move.fromC, move.toR, move.toC);
        if (!child) continue;
        const ev = minimax(child, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxEval === -Infinity ? evaluate(state) : maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const child = Chess.movePiece(state, move.fromR, move.fromC, move.toR, move.toC);
        if (!child) continue;
        const ev = minimax(child, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break;
      }
      return minEval === Infinity ? evaluate(state) : minEval;
    }
  }

  function getBestMove(state, difficulty) {
    const depth = { easy: 1, medium: 2, hard: 3 }[difficulty] || 2;
    const color = state.turn;
    const isMax = color === 'white';
    let best = null, bestVal = isMax ? -Infinity : Infinity;
    const moves = getAllMoves(state, color);
    if (difficulty === 'easy') moves.sort(() => Math.random() - 0.5);
    for (const move of moves) {
      const child = Chess.movePiece(state, move.fromR, move.fromC, move.toR, move.toC);
      if (!child) continue;
      const val = minimax(child, depth - 1, -Infinity, Infinity, !isMax);
      if ((isMax && val > bestVal) || (!isMax && val < bestVal)) {
        bestVal = val;
        best = move;
      }
    }
    return best;
  }

  return { getBestMove };
})();
