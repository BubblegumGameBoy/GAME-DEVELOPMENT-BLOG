/* Google-certified messaging controls ads. Analytics waits for a usable consent decision. */
(function () {
  'use strict';
  const tagId = 'G-17WNKDX3ZB';
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  let loaded = false;
  window.googlefc.callbackQueue.push({
    CONSENT_MODE_DATA_READY: function () {
      const fc = window.googlefc, states = fc.ConsentModePurposeStatusEnum;
      if (!states || typeof fc.getGoogleConsentModeValues !== 'function') return;
      const value = fc.getGoogleConsentModeValues().analyticsStoragePurposeConsentStatus;
      document.querySelectorAll('[data-privacy-choices]').forEach(function (button) {
        button.hidden = value === states.CONSENT_MODE_PURPOSE_STATUS_NOT_APPLICABLE;
      });
      if (value !== states.CONSENT_MODE_PURPOSE_STATUS_GRANTED &&
          value !== states.CONSENT_MODE_PURPOSE_STATUS_NOT_APPLICABLE) return;
      if (loaded) return;
      loaded = true;
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', tagId, { allow_google_signals: false, allow_ad_personalization_signals: false });
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + tagId;
      document.head.appendChild(script);
    }
  });
  function setup() {
    document.querySelectorAll('[data-privacy-choices]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.googlefc.callbackQueue.push(function () {
          window.googlefc.showRevocationMessage();
        });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
