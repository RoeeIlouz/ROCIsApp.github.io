// Runs synchronously in <head> so the saved theme is applied before first paint
// (no flash of the wrong theme). Only whitelisted values ever reach the DOM.
(function () {
  var allowed = ['light', 'dark', 'amoled'];
  var theme = 'dark';
  try {
    var saved = localStorage.getItem('theme');
    if (allowed.indexOf(saved) !== -1) theme = saved;
  } catch (e) {
    // Storage blocked (private mode, cookies disabled) — keep the default.
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
