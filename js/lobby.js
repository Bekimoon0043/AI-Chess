/**
 * js/lobby.js
 * Renders and drives the multiplayer lobby screen (#lobby-screen in index.html).
 * Delegates all network calls to Multiplayer and hands off to UI.startOnlineGame()
 * once a game is ready to play.
 */
const Lobby = (() => {
  let queuePollTimer = null;
  let inQueue = false;

  function el(id) { return document.getElementById(id); }

  function show() {
    el('start-screen')?.classList.add('hidden');
    el('app')?.classList.add('hidden');
    el('lobby-screen')?.classList.remove('hidden');
    TG.showBackButton(() => { hide(); UI.showStartScreen(); });
    renderIdentity();
    loadStats();
  }

  function hide() {
    el('lobby-screen')?.classList.add('hidden');
    stopQueuePolling();
    TG.hideBackButton();
  }

  function renderIdentity() {
    const user = Multiplayer.getCurrentUser() || TG.getUser();
    const nameEl = el('lobby-username');
    const avatarEl = el('lobby-avatar');
    if (!user) return;
    if (nameEl) nameEl.textContent = user.username ? '@' + user.username : (user.first_name || user.firstName || 'Player');
    if (avatarEl) {
      const initial = ((user.first_name || user.firstName || user.username || '?')[0] || '?').toUpperCase();
      avatarEl.textContent = initial;
      if (user.photo_url) {
        avatarEl.style.backgroundImage = 'url(' + user.photo_url + ')';
        avatarEl.textContent = '';
      }
    }
  }

  async function loadStats() {
    const ratingEl = el('lobby-rating');
    if (!ratingEl) return;
    try {
      const me = await Multiplayer.getMe();
      ratingEl.textContent = 'Ranked ' + me.elo_ranked + ' · Casual ' + me.elo_casual;
    } catch (e) {
      ratingEl.textContent = '';
    }
  }

  async function quickMatch(timeControl) {
    const btn = el('btn-quick-match');
    setBusy(btn, true);
    try {
      await Multiplayer.enterQueue({ type: 'ranked', timeControl });
      inQueue = true;
      showQueueState(true);
      pollQueue();
    } catch (err) {
      TG.showAlert('Could not join matchmaking: ' + err.message);
    } finally {
      setBusy(btn, false);
    }
  }

  function pollQueue() {
    stopQueuePolling();
    queuePollTimer = setInterval(async () => {
      try {
        const status = await Multiplayer.queueStatus();
        if (status.matched && status.gameId) {
          stopQueuePolling();
          showQueueState(false);
          hide();
          UI.startOnlineGame(status.gameId);
        } else if (el('queue-elapsed')) {
          el('queue-elapsed').textContent = formatElapsed(status.waitingSeconds || 0);
        }
      } catch (e) { /* keep trying */ }
    }, 2000);
  }

  function stopQueuePolling() {
    if (queuePollTimer) { clearInterval(queuePollTimer); queuePollTimer = null; }
    inQueue = false;
  }

  async function cancelQueue() {
    try { await Multiplayer.leaveQueue(); } catch (e) {}
    stopQueuePolling();
    showQueueState(false);
  }

  function showQueueState(active) {
    el('quick-match-idle')?.classList.toggle('hidden', active);
    el('quick-match-active')?.classList.toggle('hidden', !active);
  }

  function formatElapsed(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  async function playWithFriend(timeControl) {
    const btn = el('btn-create-invite');
    setBusy(btn, true);
    try {
      const game = await Multiplayer.createGame({ type: 'private', timeControl });
      const invite = await Multiplayer.createInvite(game.id);
      const botUsername = window.CHESS_BOT_USERNAME || 'your_bot';
      const link = 'https://t.me/' + botUsername + '?start=game_' + invite.code;
      const box = el('invite-link-box');
      if (box) { box.textContent = link; box.classList.remove('hidden'); }
      TG.shareInviteLink(link, "Let's play chess! ♟️");
      pollForOpponent(game.id);
    } catch (err) {
      TG.showAlert('Could not create invite: ' + err.message);
    } finally {
      setBusy(btn, false);
    }
  }

  function pollForOpponent(gameId) {
    const timer = setInterval(async () => {
      try {
        const game = await Multiplayer.getGame(gameId);
        if (game.status === 'active') {
          clearInterval(timer);
          hide();
          UI.startOnlineGame(gameId);
        }
      } catch (e) {}
    }, 2500);
    const stopOnHide = () => { if (el('lobby-screen')?.classList.contains('hidden')) { clearInterval(timer); document.removeEventListener('lobby:hidden', stopOnHide); } };
    document.addEventListener('lobby:hidden', stopOnHide);
  }

  async function joinByCode(code) {
    if (!code) return;
    const btn = el('btn-join-code');
    setBusy(btn, true);
    try {
      const info = await Multiplayer.joinGameByInvite(code.trim());
      await Multiplayer.joinGame(info.game_id);
      hide();
      UI.startOnlineGame(info.game_id);
    } catch (err) {
      TG.showAlert('Could not join: ' + err.message);
    } finally {
      setBusy(btn, false);
    }
  }

  async function spectate(gameId) {
    hide();
    UI.startOnlineGame(gameId, { spectate: true });
  }

  async function loadSpectatableList() {
    const list = el('spectate-list');
    if (!list) return;
    list.innerHTML = '<div class="lobby-empty">Loading live games…</div>';
    try {
      const leaderboard = await Multiplayer.getLeaderboard('ranked');
      if (!leaderboard || !leaderboard.length) {
        list.innerHTML = '<div class="lobby-empty">No live games right now.</div>';
        return;
      }
      list.innerHTML = leaderboard.slice(0, 5).map(p =>
        '<div class="lobby-row"><span>' + escapeHtml(p.username || 'Player') + '</span><span class="text-dim">' + p.elo_ranked + '</span></div>'
      ).join('');
    } catch (e) {
      list.innerHTML = '<div class="lobby-empty">Couldn\u2019t load live games.</div>';
    }
  }

  async function loadLeaderboard() {
    const list = el('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<div class="lobby-empty">Loading leaderboard…</div>';
    try {
      const rows = await Multiplayer.getLeaderboard('ranked');
      if (!rows || !rows.length) { list.innerHTML = '<div class="lobby-empty">No ranked games yet.</div>'; return; }
      list.innerHTML = rows.map((p, i) =>
        '<div class="lobby-row leaderboard-row">' +
          '<span class="lb-rank">' + (i + 1) + '</span>' +
          '<span class="lb-name">' + escapeHtml(p.username || 'Player') + '</span>' +
          '<span class="lb-elo">' + p.elo_ranked + '</span>' +
        '</div>'
      ).join('');
    } catch (e) {
      list.innerHTML = '<div class="lobby-empty">Couldn\u2019t load leaderboard.</div>';
    }
  }

  function setBusy(btn, busy) {
    if (!btn) return;
    btn.disabled = busy;
    btn.classList.toggle('btn-busy', busy);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function bindControls() {
    el('btn-quick-match')?.addEventListener('click', () => quickMatch(el('lobby-time-control')?.value || '10+0'));
    el('btn-cancel-queue')?.addEventListener('click', cancelQueue);
    el('btn-create-invite')?.addEventListener('click', () => playWithFriend(el('lobby-time-control')?.value || '10+0'));
    el('btn-join-code')?.addEventListener('click', () => joinByCode(el('join-code-input')?.value));
    el('lobby-tabs')?.addEventListener('click', e => {
      const tab = e.target.closest('.lobby-tab');
      if (!tab) return;
      document.querySelectorAll('.lobby-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.lobby-panel').forEach(p => p.classList.toggle('hidden', p.id !== 'lobby-panel-' + tab.dataset.tab));
      if (tab.dataset.tab === 'spectate') loadSpectatableList();
      if (tab.dataset.tab === 'leaderboard') loadLeaderboard();
    });
    el('lobby-back')?.addEventListener('click', () => { hide(); UI.showStartScreen(); });
  }

  function init() {
    bindControls();
  }

  return { init, show, hide, joinByCode };
})();
