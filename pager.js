/* Long tables show 50 rows at a time (12 Nov 2026).
   Any list table in a console with more than 80 rows shows its first 50, with "Show 50 more" and "Show all" under it.
   Nothing else changes: search, filters, column sorting (tablesort.js) and the Excel / CSV downloads still use every row,
   printing shows every row, and the page remembers how far you opened a list until its rows change (a new search).
   Left alone: tables marked data-nopage (or inside an element marked so) and tables you type into.
   Loaded after tablesort.js in every console. */
(function () {
  'use strict';
  if (window.__oklPager) return;
  window.__oklPager = true;
  var STEP = 50, MIN = 80;
  var state = {};                       // table key -> { total, shown }

  var css = document.createElement('style');
  css.textContent = 'tr.okl-pg-hide{display:none!important}@media print{tr.okl-pg-hide{display:table-row!important}.okl-pager,.okl-pager-srv{display:none!important}}'
    + '.okl-pager,.okl-pager-srv{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;padding:12px 16px;font-size:13px;color:var(--muted,#5b6470)}';
  (document.head || document.documentElement).appendChild(css);

  function mainRows(tb) {               // a full-width row right after a row is that row's opened detail: it goes with it
    var out = [], rows = tb.rows;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], one = r.cells.length === 1 && r.cells[0].colSpan > 1;
      if (one && out.length) out[out.length - 1].push(r); else out.push([r]);
    }
    return out;
  }
  function skip(t) {
    return t.closest('[data-nopage]') || !t.tBodies[0] || t.closest('.overlay, .modal, dialog') || t.tBodies[0].querySelector('input:not([type=checkbox]), textarea, select');
  }
  function keyOf(t, i) { return (location.hash.split('?')[0] || '#/') + '|' + (t.id || t.getAttribute('data-page-key') || i); }

  function apply() {
    var tables = document.querySelectorAll('#app table');
    Array.prototype.forEach.call(tables, function (t, i) {
      var tb = t.tBodies[0], groups, k, st, n, wrap, bar;
      wrap = t.closest('.tbl-wrap') || t;
      bar = wrap.nextElementSibling && wrap.nextElementSibling.classList.contains('okl-pager') ? wrap.nextElementSibling : null;
      if (skip(t)) { if (bar) bar.remove(); return; }
      groups = mainRows(tb); n = groups.length; k = keyOf(t, i);
      st = state[k];
      if (!st || st.total !== n) st = state[k] = { total: n, shown: STEP };
      var limit = n > MIN ? st.shown : n;
      groups.forEach(function (g, j) { g.forEach(function (r) { r.classList.toggle('okl-pg-hide', j >= limit); }); });
      if (limit >= n) { if (bar) bar.remove(); return; }
      if (!bar) { bar = document.createElement('div'); bar.className = 'okl-pager'; wrap.parentNode.insertBefore(bar, wrap.nextSibling); }
      var more = Math.min(STEP, n - limit);
      var html = '<span>Showing ' + limit + ' of ' + n + '</span>'
        + '<button type="button" class="btn btn-ghost btn-sm" data-pg="more">Show ' + more + ' more</button>'
        + '<button type="button" class="btn btn-ghost btn-sm" data-pg="all">Show all</button>';
      if (bar.innerHTML !== html) bar.innerHTML = html;
      bar.onclick = function (e) {
        var b = e.target.closest('[data-pg]'); if (!b) return;
        st.shown = b.getAttribute('data-pg') === 'all' ? n : st.shown + STEP;
        apply();
      };
    });
  }
  var timer = null;
  function soon() { clearTimeout(timer); timer = setTimeout(apply, 0); }
  function start() {
    var app = document.getElementById('app');
    if (!app) return;
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {          // our own class changes do not count; new or re-ordered rows do
        if (list[i].type === 'childList' && !(list[i].target.classList && list[i].target.classList.contains('okl-pager'))) { soon(); return; }
      }
    }).observe(app, { childList: true, subtree: true });
    apply();
  }
  window.oklPager = { apply: apply, STEP: STEP, MIN: MIN };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
