// Google Analytics 4 loads only after the visitor accepts (see privacy.html §8).
// The choice is kept in localStorage; "Cookie settings" in the footer reopens
// the banner. Kept in a file (not inline) so the CSP can forbid inline scripts.
(function () {
  var GA_ID = 'G-3TJ6TLY6Y8';
  var KEY = 'analytics-consent';

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* storage blocked */ }
  }

  function loadAnalytics() {
    window['ga-disable-' + GA_ID] = false;
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      allow_google_signals: false,            // no cross-device / demographics tracking
      allow_ad_personalization_signals: false // never used for advertising
    });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  // Stops a tag that already loaded this visit and removes its cookies.
  function stopAnalytics() {
    window['ga-disable-' + GA_ID] = true;
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        ['', '; domain=.' + host, '; domain=' + host].forEach(function (domain) {
          document.cookie = name + '=; Max-Age=0; path=/' + domain;
        });
      }
    });
  }

  var banner;

  function close() {
    if (banner) { banner.remove(); banner = null; }
  }

  function choose(value) {
    save(value);
    if (value === 'granted') loadAnalytics(); else stopAnalytics();
    close();
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text) node.textContent = text;
    return node;
  }

  function show() {
    if (banner) return;
    banner = el('section', { class: 'consent-banner', role: 'region', 'aria-label': 'Cookie consent' });
    var text = el('p', { class: 'consent-text' },
      'We use Google Analytics cookies to count visits, only if you allow it. No ads, no cross-site tracking. ');
    text.appendChild(el('a', { href: '/privacy.html#our-website' }, 'Privacy Policy'));
    var actions = el('div', { class: 'consent-actions' });
    var decline = el('button', { type: 'button', class: 'btn btn-secondary btn-sm' }, 'Decline');
    var accept = el('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'Accept');
    decline.addEventListener('click', function () { choose('denied'); });
    accept.addEventListener('click', function () { choose('granted'); });
    actions.appendChild(decline);
    actions.appendChild(accept);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
  }

  function init() {
    var choice = read();
    if (choice === 'granted') loadAnalytics();
    else if (choice !== 'denied') show();
    document.querySelectorAll('[data-cookie-settings]').forEach(function (b) {
      b.addEventListener('click', function () {
        show();
        var first = banner && banner.querySelector('button');
        if (first) first.focus();
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Conversion clicks. Every click is counted by the cookieless ROCIs counter
  // (one number per button per day, nothing about the visitor). Google
  // Analytics gets the same event only after consent, when gtag exists.
  var COUNTER = 'https://rocis-count.roee-ilouz.workers.dev';
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    var name = null;
    if (href.indexOf('play.google.com/store/apps/details?id=com.rocisapps.tasks') !== -1) name = 'tasks_play_click';
    else if (href.indexOf('tasks.rocisapps.com') !== -1) name = 'tasks_web_click';
    else if (a.hasAttribute('data-schedule-beta')) name = 'schedule_beta_click';
    if (!name) return;
    try { if (navigator.sendBeacon) navigator.sendBeacon(COUNTER, name); } catch (err) { /* blocked */ }
    if (window.gtag) window.gtag('event', name, { link_url: href, page_path: location.pathname });
  });
})();
