/* Keep the server sign-in alive while someone is using the page (loaded by each console's index.html, after formkeep.js).
   10 Nov 2026: each console counted typing and tapping as activity and signed out after 10 minutes without it, but the server
   only counted calls to the server. Someone filling a long form without saving (34 AHU rooms, a lab sheet, a request) for longer
   than that was still signed in on screen, but Submit was refused (401): the page went to the sign-in screen and the typing was
   lost. Now activity on the page also tells the server, at most once every 4 minutes, so both count the same thing, and both
   end the sign-in after 30 minutes without activity (migration 057 and IDLE_LIMIT_MS in each console). */
(function () {
  'use strict';
  if (window.oklKeepAlive) return;
  var EVERY = 4 * 60 * 1000, last = Date.now(), busy = false;    // the console calls the server itself as it opens
  function token() { try { return sessionStorage.getItem('okl.token') || ''; } catch (e) { return ''; } }
  function ping(force) {
    var t = token();
    if (!t || busy || (!force && Date.now() - last < EVERY)) return;
    last = Date.now(); busy = true;
    fetch('https://orangegroupsai.online/webhook/auth/api/me', { headers: { 'Authorization': t } })
      .catch(function () { /* offline: the next activity tries again after 4 minutes */ })
      .then(function () { busy = false; });
  }
  ['keydown', 'input', 'click', 'touchstart', 'mousemove', 'scroll'].forEach(function (e) {
    (e === 'scroll' ? window : document).addEventListener(e, function () { ping(false); }, { passive: true, capture: true });
  });
  window.oklKeepAlive = { ping: ping };
})();
