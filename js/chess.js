// Chess logic module
const Chess = (() => {
  const INIT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const PIECE_MAP = { r:'♜', n:'♞', b:'♝', q:'♛', k:'♚', p:'♟',
                      R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔', P:'♙' };

  function parseFEN(fen) {
    const [board, turn, castling, enPassant, halfMove, fullMove] = fen.split(' ');
    const rows = board.split('/');
    const grid = Array(8).fill().map(() => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const ch of rows[r]) {
        if (/\d/.test(ch)) c += +ch;
        else { grid[r][c] = ch; c++; }
      }
    }
    return {
      grid, turn: turn === 'w' ? 'white' : 'black',
      castling: { wK: castling.includes('K'), wQ: castling.includes('Q'),
                  bK: castling.includes('k'), bQ: castling.includes('q') },
      enPassant: enPassant === '-' ? null : enPassant,
      halfMove: +halfMove,
      fullMove: +fullMove
    };
  }

  function toFEN(state) {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const piece = state.grid[r][c];
        if (piece) {
          if (empty) { fen += empty; empty = 0; }
          fen += piece;
        } else empty++;
      }
      if (empty) fen += empty;
      if (r < 7) fen += '/';
    }
    fen += state.turn === 'white' ? ' w ' : ' b ';
    let castling = '';
    if (state.castling.wK) castling += 'K';
    if (state.castling.wQ) castling += 'Q';
    if (state.castling.bK) castling += 'k';
    if (state.castling.bQ) castling += 'q';
    fen += (castling || '-') + ' ';
    fen += (state.enPassant || '-') + ' ';
    fen += state.halfMove + ' ' + state.fullMove;
    return fen;
  }

  function isWhitePiece(p) { return p && p === p.toUpperCase(); }
  function opponent(turn) { return turn === 'white' ? 'black' : 'white'; }

  function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

  function getPseudoMoves(state, fromR, fromC) {
    const piece = state.grid[fromR][fromC];
    if (!piece) return [];
    const isWhite = isWhitePiece(piece);
    const moves = [];
    const dir = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    const addIf = (r, c) => {
      if (!inBounds(r, c)) return false;
      const target = state.grid[r][c];
      if (!target) { moves.push({ r, c }); return true; }
      if (isWhitePiece(target) !== isWhite) { moves.push({ r, c }); }
      return false;
    };

    switch (piece.toLowerCase()) {
      case 'p': {
        const fwd = fromR + dir;
        if (inBounds(fwd, fromC) && !state.grid[fwd][fromC]) {
          moves.push({ r: fwd, c: fromC });
          if (fromR === startRow) {
            const dbl = fromR + 2 * dir;
            if (!state.grid[dbl][fromC]) moves.push({ r: dbl, c: fromC });
          }
        }
        for (const dc of [-1, 1]) {
          const capR = fromR + dir, capC = fromC + dc;
          if (inBounds(capR, capC)) {
            const cap = state.grid[capR][capC];
            if (cap && isWhitePiece(cap) !== isWhite) moves.push({ r: capR, c: capC });
            else if (state.enPassant) {
              const epFile = 'abcdefgh'.indexOf(state.enPassant[0]);
              const epRank = parseInt(state.enPassant[1], 10);
              const epRow = 8 - epRank;
              if (capR === epRow && capC === epFile) moves.push({ r: capR, c: capC, enPassant: true });
            }
          }
        }
        break;
      }
      case 'n':
        for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) addIf(fromR+dr, fromC+dc);
        break;
      case 'b':
      case 'q':
        for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
          let r = fromR+dr, c = fromC+dc;
          while (inBounds(r, c)) { if (!addIf(r, c)) break; r += dr; c += dc; }
        }
        if (piece.toLowerCase() === 'b') break;
        // fallthrough for queen
      case 'r':
        for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          let r = fromR+dr, c = fromC+dc;
          while (inBounds(r, c)) { if (!addIf(r, c)) break; r += dr; c += dc; }
        }
        break;
      case 'k':
        for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) addIf(fromR+dr, fromC+dc);
        if (isWhite && fromR === 7 && fromC === 4) {
          if (state.castling.wK && !state.grid[7][5] && !state.grid[7][6] &&
              !isSquareAttacked(state, 7, 4, 'black') && !isSquareAttacked(state, 7, 5, 'black'))
            moves.push({ r:7, c:6, castling:'K' });
          if (state.castling.wQ && !state.grid[7][3] && !state.grid[7][2] && !state.grid[7][1] &&
              !isSquareAttacked(state, 7, 4, 'black') && !isSquareAttacked(state, 7, 3, 'black'))
            moves.push({ r:7, c:2, castling:'Q' });
        } else if (!isWhite && fromR === 0 && fromC === 4) {
          if (state.castling.bK && !state.grid[0][5] && !state.grid[0][6] &&
              !isSquareAttacked(state, 0, 4, 'white') && !isSquareAttacked(state, 0, 5, 'white'))
            moves.push({ r:0, c:6, castling:'k' });
          if (state.castling.bQ && !state.grid[0][3] && !state.grid[0][2] && !state.grid[0][1] &&
              !isSquareAttacked(state, 0, 4, 'white') && !isSquareAttacked(state, 0, 3, 'white'))
            moves.push({ r:0, c:2, castling:'q' });
        }
        break;
    }
    return moves;
  }

  function isSquareAttacked(state, r, c, byColor) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.grid[row][col];
        if (piece && isWhitePiece(piece) === (byColor === 'white')) {
          const moves = getPseudoMoves(state, row, col);
          if (moves.some(m => m.r === r && m.c === c && !m.castling)) return true;
        }
      }
    }
    return false;
  }

  function inCheck(state, color) {
    const king = color === 'white' ? 'K' : 'k';
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (state.grid[r][c] === king) return isSquareAttacked(state, r, c, opponent(color));
    return false;
  }

  function getLegalMoves(state, fromR, fromC) {
    const piece = state.grid[fromR][fromC];
    if (!piece || isWhitePiece(piece) !== (state.turn === 'white')) return [];
    const pseudo = getPseudoMoves(state, fromR, fromC);
    return pseudo.filter(move => {
      const newState = simulateMove(state, fromR, fromC, move);
      return newState && !inCheck(newState, state.turn);
    });
  }

  function simulateMove(state, fromR, fromC, move) {
    const newGrid = state.grid.map(row => [...row]);
    const piece = newGrid[fromR][fromC];
    const captured = newGrid[move.r][move.c];
    newGrid[move.r][move.c] = piece;
    newGrid[fromR][fromC] = null;
    if (move.enPassant) {
      const capturedRow = piece === 'P' ? move.r + 1 : move.r - 1;
      newGrid[capturedRow][move.c] = null;
    }
    let promotion = null;
    if ((piece === 'P' && move.r === 0) || (piece === 'p' && move.r === 7)) {
      promotion = 'Q';
      newGrid[move.r][move.c] = isWhitePiece(piece) ? 'Q' : 'q';
    }
    if (move.castling) {
      const rookFromR = move.r;
      if (move.castling === 'K' || move.castling === 'k') {
        newGrid[rookFromR][7] = null;
        newGrid[rookFromR][5] = move.castling === 'K' ? 'R' : 'r';
      } else {
        newGrid[rookFromR][0] = null;
        newGrid[rookFromR][3] = move.castling === 'Q' ? 'R' : 'r';
      }
    }
    const castling = { ...state.castling };
    if (piece === 'K') { castling.wK = false; castling.wQ = false; }
    if (piece === 'k') { castling.bK = false; castling.bQ = false; }
    if (piece === 'R' && fromR === 7 && fromC === 7) castling.wK = false;
    if (piece === 'R' && fromR === 7 && fromC === 0) castling.wQ = false;
    if (piece === 'r' && fromR === 0 && fromC === 7) castling.bK = false;
    if (piece === 'r' && fromR === 0 && fromC === 0) castling.bQ = false;
    let ep = null;
    if (piece.toLowerCase() === 'p' && Math.abs(move.r - fromR) === 2) {
      ep = 'abcdefgh'[move.c] + (piece === 'P' ? '3' : '6');
    }
    const halfMove = (piece.toLowerCase() === 'p' || captured) ? 0 : state.halfMove + 1;
    const fullMove = state.turn === 'black' ? state.fullMove + 1 : state.fullMove;
    return {
      grid: newGrid,
      turn: opponent(state.turn),
      castling,
      enPassant: ep,
      halfMove,
      fullMove,
      promotion: promotion || undefined
    };
  }

  function movePiece(state, fromR, fromC, toR, toC, promoPiece = null) {
    const legal = getLegalMoves(state, fromR, fromC);
    const move = legal.find(m => m.r === toR && m.c === toC);
    if (!move) return null;
    let newState = simulateMove(state, fromR, fromC, move);
    if (promoPiece && move.r === (state.turn === 'white' ? 0 : 7) && state.grid[fromR][fromC].toLowerCase() === 'p') {
      const isWhite = state.turn === 'white';
      newState.grid[move.r][move.c] = isWhite ? promoPiece.toUpperCase() : promoPiece.toLowerCase();
      newState.promotion = promoPiece;
    }
    return newState;
  }

  function isCheckmate(state) {
    if (!inCheck(state, state.turn)) return false;
    return !hasLegalMoves(state);
  }
  function isStalemate(state) {
    if (inCheck(state, state.turn)) return false;
    return !hasLegalMoves(state);
  }
  function hasLegalMoves(state) {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      if (state.grid[r][c] && isWhitePiece(state.grid[r][c]) === (state.turn === 'white'))
        if (getLegalMoves(state, r, c).length) return true;
    }
    return false;
  }

  function insufficientMaterial(state) {
    const pieces = state.grid.flat().filter(Boolean);
    if (pieces.length === 2) return true;
    if (pieces.length === 3 && pieces.some(p => p.toLowerCase() === 'b' || p.toLowerCase() === 'n')) return true;
    return false;
  }

  function threefoldRepetition(history) {
    const fens = history.map(h => h.fen);
    return fens.filter(f => f === fens[fens.length - 1]).length >= 3;
  }

  return {
    INIT_FEN, parseFEN, toFEN, getLegalMoves, movePiece,
    inCheck, isCheckmate, isStalemate, insufficientMaterial,
    threefoldRepetition, isWhitePiece, opponent, PIECE_MAP
  };
})();
