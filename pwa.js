/* Install as an app (21 Nov 2026): registers the site-wide worker so Chrome offers "Install app".
   Nothing is cached (see /sw.js). The Engineering pages keep their own worker for notifications. */
(function () {
  if (!('serviceWorker' in navigator) || location.pathname.indexOf('/engineering/') === 0) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {});
  });
})();
