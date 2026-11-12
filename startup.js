/* Faster console start-up (12 Nov 2026).
   Opening a console used to wait for "who am I" (auth/api/me) before asking for its data: two trips to the server one
   after the other (~0.6 s each from Lagos). The answer is kept here for 5 minutes in this browser tab
   (sessionStorage, with the sign-in token it belongs to), so a console opened from the landing page or reloaded starts
   loading its data at once and checks "who am I" again in the background.

   Safe by design: every server call checks the sign-in and access itself; this only decides what the screen shows, and
   the background answer replaces it (a 401 still goes to sign-in, a changed access re-draws the page).
   Loaded before each console's app.js and by the landing page. */
(function () {
  'use strict';
  var KEY = 'okl.me', MAX_AGE = 5 * 60 * 1000;
  function read() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  window.oklMe = {
    save: function (token, me) {
      try { if (token && me && me.user) sessionStorage.setItem(KEY, JSON.stringify({ t: token, at: Date.now(), me: me })); } catch (e) { /* ignore */ }
    },
    cached: function (token) {
      var c = read();
      return c && token && c.t === token && Date.now() - c.at < MAX_AGE && c.me && c.me.user && !c.me.user.must_change ? c.me : null;
    },
    clear: function () { try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ } },
    // did the person's access change between the kept answer and the fresh one?
    differs: function (a, b) {
      var pick = function (m) { return JSON.stringify([m && m.user, m && m.access, m && m.edit, m && m.signoff]); };
      return pick(a) !== pick(b);
    },
    /* The usual start: returns { auth, fresh }. auth = the kept answer if there is one, else the fresh one (waited for).
       fresh = the server's answer (a promise), saved for next time. */
    start: async function (apiGet, token) {
      var fresh = apiGet('/webhook/auth/api/me').then(function (a) { window.oklMe.save(token, a); return a; });
      var kept = window.oklMe.cached(token);
      if (kept) { fresh.catch(function () { /* api() already sends a 401 to sign-in */ }); return { auth: kept, fresh: fresh, kept: true }; }
      return { auth: await fresh, fresh: fresh, kept: false };
    },
    // after a start from the kept answer: when the server's answer differs (access changed, password change needed), apply it
    follow: function (st, apply) {
      if (!st || !st.kept) return;
      st.fresh.then(function (a) { if (window.oklMe.differs(a, st.auth)) apply(a); }).catch(function () { /* ignore */ });
    }
  };
})();
