/**
 * js/telegram.js
 * Wraps the Telegram WebApp SDK (https://core.telegram.org/bots/webapps).
 * Safe to load outside Telegram — every call degrades to a no-op so the app
 * still works as a plain browser PWA (see index.html loader).
 */
const TG = (() => {
  let webApp = null;
  let isAvailable = false;
  let mainButtonHandler = null;
  let backButtonHandler = null;

  function init() {
    webApp = window.Telegram && window.Telegram.WebApp;
    isAvailable = !!webApp;
    if (!isAvailable) return false;

    webApp.ready();
    webApp.expand();
    if (typeof webApp.disableVerticalSwipes === 'function') webApp.disableVerticalSwipes();
    if (typeof webApp.setHeaderColor === 'function') {
      try { webApp.setHeaderColor('secondary_bg_color'); } catch (e) {}
    }
    if (typeof webApp.enableClosingConfirmation === 'function') webApp.enableClosingConfirmation();

    applyThemeParams();
    applySafeArea();
    webApp.onEvent('themeChanged', applyThemeParams);
    webApp.onEvent('viewportChanged', applySafeArea);

    return true;
  }

  function applyThemeParams() {
    if (!isAvailable) return;
    const tp = webApp.themeParams || {};
    const root = document.documentElement.style;
    const map = {
      bg_color: '--tg-bg', secondary_bg_color: '--tg-secondary-bg',
      text_color: '--tg-text', hint_color: '--tg-hint',
      link_color: '--tg-link', button_color: '--tg-button',
      button_text_color: '--tg-button-text', section_bg_color: '--tg-section-bg'
    };
    Object.entries(map).forEach(([key, cssVar]) => {
      if (tp[key]) root.setProperty(cssVar, tp[key]);
    });
    document.body.classList.toggle('dark', webApp.colorScheme === 'dark');
    document.body.classList.toggle('light', webApp.colorScheme !== 'dark');
    document.body.classList.add('tg-themed');
  }

  function applySafeArea() {
    if (!isAvailable) return;
    const root = document.documentElement.style;
    const stable = webApp.viewportStableHeight || webApp.viewportHeight || window.innerHeight;
    root.setProperty('--tg-viewport-height', stable + 'px');
    const inset = webApp.contentSafeAreaInset || {};
    root.setProperty('--tg-safe-top', (inset.top || 0) + 'px');
    root.setProperty('--tg-safe-bottom', (inset.bottom || 0) + 'px');
  }

  function haptic(kind) {
    if (!isAvailable || !webApp.HapticFeedback) return;
    const hf = webApp.HapticFeedback;
    try {
      if (kind === 'move') hf.impactOccurred('light');
      else if (kind === 'capture') hf.impactOccurred('medium');
      else if (kind === 'check') hf.notificationOccurred('warning');
      else if (kind === 'win') hf.notificationOccurred('success');
      else if (kind === 'lose') hf.notificationOccurred('error');
      else if (kind === 'select') hf.selectionChanged();
      else hf.impactOccurred('light');
    } catch (e) {}
  }

  function setMainButton({ text, onClick, color, textColor, show = true }) {
    if (!isAvailable) return;
    const mb = webApp.MainButton;
    if (mainButtonHandler) mb.offClick(mainButtonHandler);
    mainButtonHandler = onClick;
    mb.setText(text);
    if (color) mb.color = color;
    if (textColor) mb.textColor = textColor;
    mb.onClick(onClick);
    if (show) mb.show(); else mb.hide();
  }
  function hideMainButton() {
    if (!isAvailable) return;
    webApp.MainButton.hide();
    if (mainButtonHandler) { webApp.MainButton.offClick(mainButtonHandler); mainButtonHandler = null; }
  }
  function setMainButtonLoading(loading) {
    if (!isAvailable) return;
    if (loading) webApp.MainButton.showProgress(false); else webApp.MainButton.hideProgress();
  }

  function showBackButton(onClick) {
    if (!isAvailable) return;
    const bb = webApp.BackButton;
    if (backButtonHandler) bb.offClick(backButtonHandler);
    backButtonHandler = onClick;
    bb.onClick(onClick);
    bb.show();
  }
  function hideBackButton() {
    if (!isAvailable) return;
    const bb = webApp.BackButton;
    if (backButtonHandler) { bb.offClick(backButtonHandler); backButtonHandler = null; }
    bb.hide();
  }

  function showConfirm(message) {
    return new Promise(resolve => {
      if (!isAvailable || !webApp.showConfirm) { resolve(window.confirm(message)); return; }
      webApp.showConfirm(message, ok => resolve(ok));
    });
  }
  function showAlert(message) {
    return new Promise(resolve => {
      if (!isAvailable || !webApp.showAlert) { window.alert ? alert(message) : console.log(message); resolve(); return; }
      webApp.showAlert(message, () => resolve());
    });
  }

  function getUser() {
    if (!isAvailable) return null;
    return (webApp.initDataUnsafe && webApp.initDataUnsafe.user) || null;
  }
  function getInitData() {
    return isAvailable ? webApp.initData : '';
  }
  function getStartParam() {
    if (!isAvailable) return null;
    return webApp.initDataUnsafe && webApp.initDataUnsafe.start_param || null;
  }
  function openLink(url) {
    if (isAvailable && webApp.openTelegramLink && url.includes('t.me')) webApp.openTelegramLink(url);
    else if (isAvailable && webApp.openLink) webApp.openLink(url);
    else window.open(url, '_blank', 'noopener');
  }
  function shareInviteLink(url, text) {
    const shareUrl = 'https://t.me/share/url?url=' + encodeURIComponent(url) + (text ? '&text=' + encodeURIComponent(text) : '');
    openLink(shareUrl);
  }
  function close() {
    if (isAvailable) webApp.close();
  }

  return {
    init,
    get isAvailable() { return isAvailable; },
    haptic,
    setMainButton, hideMainButton, setMainButtonLoading,
    showBackButton, hideBackButton,
    showConfirm, showAlert,
    getUser, getInitData, getStartParam,
    openLink, shareInviteLink, close
  };
})();
