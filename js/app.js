// Service worker keeps the app installable/offline-capable when opened as a
// plain PWA outside Telegram. Inside Telegram's WebView it either registers
// harmlessly or silently no-ops depending on client/platform — never blocks
// the app, so it's safe to leave unconditional.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
// UI.init() is async (it awaits Telegram auth + deep-link join), but it's
// fine to fire-and-forget here — everything it needs the DOM for happens
// synchronously at the top of the function before the first await.
document.addEventListener('DOMContentLoaded', UI.init);
