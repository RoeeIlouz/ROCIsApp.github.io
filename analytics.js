// Google Analytics 4 — visit counting only (see privacy.html §8).
// Kept in a file (not inline) so the Content-Security-Policy can forbid inline scripts.
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-3TJ6TLY6Y8', {
  allow_google_signals: false,            // no cross-device / demographics tracking
  allow_ad_personalization_signals: false // never used for advertising
});
