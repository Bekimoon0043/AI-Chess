/**
 * js/multiplayer.js
 * Talks to the backend described in the AI-Chess multiplayer API spec.
 * Handles auth, game CRUD, real-time sync (SSE with long-poll fallback),
 * and an offline-resilient move queue.
 */
const Multiplayer = (() => {
  const API_BASE_URL = window.CHESS_API_BASE_URL || 'https://api.chess.example.com/v1';
  const QUEUE_KEY = 'aichess_move_queue_v1';
  const TOKEN_KEY = 'aichess_token_v1';

  let accessToken = null;
  let currentUser = null;
  let currentGameId = null;
  let source = null;
  let pollTimer = null;
  let pollBackoff = 1500;
  let connectionState = 'offline';
  let lastEventTs = null;

  const listeners = { state: [], move: [], over: [], connection: [], error: [], chat: [] };
  function on(event, cb) { (listeners[event] || (listeners[event] = [])).push(cb); }
  function emit(event, payload) { (listeners[event] || []).forEach(cb => { try { cb(payload); } catch (e) { console.error(e); } }); }

  function setConnectionState(state) {
    if (connectionState === state) return;
    connectionState = state;
    emit('connection', state);
  }

  async function authenticate() {
    accessToken = sessionStorage.getItem(TOKEN_KEY);
    const initData = TG.getInitData();
    if (!initData) return null;
    try {
      const res = await apiFetch('/auth/telegram', { method: 'POST', body: { initData }, auth: false });
      accessToken = res.data.accessToken;
      currentUser = res.data.user;
      sessionStorage.setItem(TOKEN_KEY, accessToken);
      return currentUser;
    } catch (err) {
      emit('error', { stage: 'auth', err });
      return null;
    }
  }

  function getCurrentUser() { return currentUser; }

  async function apiFetch(path, { method = 'GET', body, auth = true, retries = 2 } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && accessToken) headers.Authorization = 'Bearer ' + accessToken;
    let attempt = 0;
    while (true) {
      try {
        const res = await fetch(API_BASE_URL + path, {
          method, headers, body: body ? JSON.stringify(body) : undefined
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) {
          const message = (json.error && json.error.message) || ('Request failed (' + res.status + ')');
          throw Object.assign(new Error(message), { status: res.status, code: json.error && json.error.code });
        }
        setConnectionState(currentGameId ? 'online' : connectionState);
        return json;
      } catch (err) {
        attempt++;
        const isNetworkError = err instanceof TypeError;
        if (isNetworkError && attempt <= retries) {
          setConnectionState('reconnecting');
          await sleep(400 * attempt);
          continue;
        }
        if (isNetworkError) setConnectionState('offline');
        throw err;
      }
    }
  }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function createGame({ type = 'casual', timeControl = '10+0' } = {}) {
    return apiFetch('/games', { method: 'POST', body: { type, timeControl } }).then(r => r.data);
  }
  function joinGameByInvite(code) {
    return apiFetch('/invites/' + encodeURIComponent(code)).then(r => r.data);
  }
  function getGame(gameId) {
    return apiFetch('/games/' + gameId).then(r => r.data);
  }
  function joinGame(gameId) {
    return apiFetch('/games/' + gameId + '/join', { method: 'POST' }).then(r => r.data);
  }
  function resign(gameId) {
    return apiFetch('/games/' + gameId + '/resign', { method: 'POST' }).then(r => r.data);
  }
  function offerDraw(gameId) {
    return apiFetch('/games/' + gameId + '/draw/offer', { method: 'POST' }).then(r => r.data);
  }
  function respondDraw(gameId, accept) {
    return apiFetch('/games/' + gameId + '/draw/respond', { method: 'POST', body: { accept } }).then(r => r.data);
  }
  function enterQueue({ type = 'ranked', timeControl = '10+0' } = {}) {
    return apiFetch('/matchmaking/queue', { method: 'POST', body: { type, timeControl } }).then(r => r.data);
  }
  function leaveQueue() {
    return apiFetch('/matchmaking/queue', { method: 'DELETE' }).then(r => r.data);
  }
  function queueStatus() {
    return apiFetch('/matchmaking/status').then(r => r.data);
  }
  function getMe() {
    return apiFetch('/users/me').then(r => r.data);
  }
  function getLeaderboard(type = 'ranked') {
    return apiFetch('/leaderboard?type=' + type).then(r => r.data);
  }
  function createInvite(gameId) {
    return apiFetch('/invites', { method: 'POST', body: { gameId } }).then(r => r.data);
  }
  function sendChat(gameId, message) {
    return apiFetch('/games/' + gameId + '/chat', { method: 'POST', body: { message }, retries: 0 }).then(r => r.data);
  }

  function loadQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveQueue(q) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) {}
  }
  function queueMove(gameId, move) {
    const q = loadQueue();
    q.push({ gameId, move, ts: Date.now(), id: Math.random().toString(36).slice(2) });
    saveQueue(q);
  }

  async function sendMove(gameId, move) {
    try {
      const result = await apiFetch('/games/' + gameId + '/move', { method: 'POST', body: { move }, retries: 0 });
      return { ok: true, data: result.data };
    } catch (err) {
      if (err instanceof TypeError || connectionState !== 'online') {
        queueMove(gameId, move);
        return { ok: false, queued: true, err };
      }
      return { ok: false, queued: false, err };
    }
  }

  async function flushQueue() {
    const q = loadQueue();
    if (!q.length) return;
    const remaining = [];
    for (const item of q) {
      try {
        await apiFetch('/games/' + item.gameId + '/move', { method: 'POST', body: { move: item.move }, retries: 0 });
      } catch (err) {
        remaining.push(item);
      }
    }
    saveQueue(remaining);
    if (remaining.length === 0) emit('connection', 'online');
  }

  window.addEventListener('online', () => { setConnectionState('reconnecting'); flushQueue().then(() => setConnectionState('online')); });
  window.addEventListener('offline', () => setConnectionState('offline'));

  function connect(gameId) {
    disconnect();
    currentGameId = gameId;
    lastEventTs = null;
    if (window.EventSource) {
      try {
        source = new EventSource(API_BASE_URL + '/games/' + gameId + '/state?stream=1&token=' + encodeURIComponent(accessToken || ''));
        source.addEventListener('game:state', e => handleStatePayload(JSON.parse(e.data)));
        source.addEventListener('game:move:made', e => emit('move', JSON.parse(e.data)));
        source.addEventListener('game:over', e => emit('over', JSON.parse(e.data)));
        source.addEventListener('game:chat', e => emit('chat', JSON.parse(e.data)));
        source.onopen = () => setConnectionState('online');
        source.onerror = () => {
          setConnectionState('reconnecting');
          if (source.readyState === EventSource.CLOSED) {
            source = null;
            startLongPoll(gameId);
          }
        };
        return;
      } catch (e) {
        source = null;
      }
    }
    startLongPoll(gameId);
  }

  function startLongPoll(gameId) {
    pollBackoff = 1500;
    const poll = async () => {
      if (currentGameId !== gameId) return;
      try {
        const res = await apiFetch('/games/' + gameId + '/state' + (lastEventTs ? '?since=' + lastEventTs : ''));
        handleStatePayload(res.data);
        pollBackoff = 1500;
        setConnectionState('online');
      } catch (err) {
        pollBackoff = Math.min(pollBackoff * 1.6, 15000);
        setConnectionState(connectionState === 'offline' ? 'offline' : 'reconnecting');
      } finally {
        if (currentGameId === gameId) pollTimer = setTimeout(poll, pollBackoff);
      }
    };
    poll();
  }

  function handleStatePayload(data) {
    if (!data) return;
    lastEventTs = data.updated_at || data.last_move_at || Date.now();
    emit('state', data);
    if (data.status === 'completed' || data.status === 'aborted') emit('over', data);
  }

  function disconnect() {
    currentGameId = null;
    if (source) { source.close(); source = null; }
    if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
  }

  return {
    on,
    authenticate, getCurrentUser,
    createGame, joinGameByInvite, getGame, joinGame,
    resign, offerDraw, respondDraw,
    enterQueue, leaveQueue, queueStatus,
    getMe, getLeaderboard, createInvite, sendChat,
    sendMove, flushQueue,
    connect, disconnect,
    get connectionState() { return connectionState; },
    get pendingMoveCount() { return loadQueue().length; }
  };
})();
