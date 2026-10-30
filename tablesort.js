/* Sorting for every list table in the consoles (loaded by each console's index.html).
   Click a column heading: A to Z / low to high, again: the other way, a third time: back to the list's own order.
   The choice is remembered per table on this computer (localStorage). On phones, where tables show as cards and the
   headings are hidden, a "Sort by" picker above the list does the same.

   A table is sortable when it has a <thead> and its rows are plain rows. Left alone: tables marked data-nosort (or
   inside an element marked so, or a <thead data-nosort>), two-column detail tables (class kv, headings inside the body), tables grouped under
   heading rows or with rowspan, and tables you type into (text boxes in the body). A row spanning the whole width
   right after a row (an opened detail) moves with that row. A cell can give its own sort value with data-sort.

   Lists the console cuts (first 300 of a longer list): the table gets data-sort-key="name", the console orders its whole
   list with oklTableSort.rows(list, 'name', [one value per column]) before cutting, and draws again on the
   'tablesort' event that every click sends. */
(function () {
  'use strict';
  if (window.__oklTableSort) return;
  window.__oklTableSort = true;

  const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const EMPTY = /^(?:-+|—|–|n\/a|none|never|not set|not entered|\?)?$/i;
  const SKIP_IN_CELL = 'button, input, select, textarea, svg, .tip-c';
  const BLOCK = /^(?:DIV|P|BR|UL|OL|LI|SMALL|H[1-6])$/;

  /* ---------- values ---------- */
  function lineOf(el) {                         // the first line of a cell: "Name" from "Name / code underneath"
    let out = '';
    for (const n of el.childNodes) {
      if (n.nodeType === 3) { out += n.nodeValue; continue; }
      if (n.nodeType !== 1 || n.matches(SKIP_IN_CELL)) continue;
      if (BLOCK.test(n.tagName)) { if (out.trim()) break; out += lineOf(n); if (out.trim()) break; }
      else out += n.textContent;
    }
    return out;
  }
  function cellText(td) {
    if (!td) return '';
    if (td.dataset.sort != null) return td.dataset.sort;
    let t = lineOf(td).replace(/\s+/g, ' ').trim();
    if (!t) { const s = td.querySelector('select'); if (s && s.selectedIndex >= 0) t = s.options[s.selectedIndex].text.trim(); }
    return t;
  }
  function yearFor(mon, day) {                  // "30 Oct" without a year: this year, unless that is far in the future
    const now = new Date(), y = now.getFullYear();
    return Date.UTC(y, mon, day) - now.getTime() > 183 * 864e5 ? y - 1 : y;
  }
  function asDate(s) {
    let m = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?(?:[ T](\d{1,2}):(\d{2}))?/);
    if (m) return Date.UTC(+m[1], m[2] - 1, +(m[3] || 1), +(m[4] || 0), +(m[5] || 0));
    m = s.match(/^(?:[A-Za-z]{3,9},?\s+)?(\d{1,2})(?:st|nd|rd|th)?[\s-]+([A-Za-z]{3,9})\.?(?:[\s-]+(\d{4}))?(?:,?\s+(?:at\s+)?(\d{1,2}):(\d{2}))?/);
    if (m && MONTHS[m[2].slice(0, 3).toLowerCase()] != null) {
      const mon = MONTHS[m[2].slice(0, 3).toLowerCase()];
      return Date.UTC(m[3] ? +m[3] : yearFor(mon, +m[1]), mon, +m[1], +(m[4] || 0), +(m[5] || 0));
    }
    m = s.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);  // "Oct 2026"
    if (m && MONTHS[m[1].slice(0, 3).toLowerCase()] != null) return Date.UTC(+m[2], MONTHS[m[1].slice(0, 3).toLowerCase()], 1);
    m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);  // a time on its own
    if (m) return (+m[1]) * 60 + (+m[2]);
    return null;
  }
  function asNumber(s) {
    const m = s.match(/^([-+]?)[₦$£€]?\s*(\d[\d,]*(?:\.\d+)?|\.\d+)\s*(?:%|°C|°|[A-Za-zµ][A-Za-zµ/.]{0,9}|cfu\/(?:g|ml))?$/);
    return m ? Number((m[1] === '-' ? '-' : '') + m[2].replace(/,/g, '')) : null;
  }
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

  /* ---------- which tables ---------- */
  function headRow(table) { const h = table.tHead; return h && h.rows.length ? h.rows[h.rows.length - 1] : null; }
  function eligible(table) {
    if (!headRow(table) || !table.tBodies.length) return false;
    if (table.classList.contains('kv') || table.closest('[data-nosort]') || table.tHead.hasAttribute('data-nosort')) return false;
    const body = table.tBodies[0];
    if (body.querySelector('th, [rowspan]')) return false;
    if (body.querySelector('input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea')) return false;
    const first = body.rows[0];
    if (first && body.rows.length > 1 && isWide(first)) return false;   // heading rows group the list
    return true;
  }
  const isWide = tr => Array.from(tr.cells).some(c => c.colSpan > 1);   // an opened detail, a heading row or 'nothing here'
  function columns(table) {                   // [{ th, index }] using colspans in the heading row
    const out = []; let i = 0;
    for (const th of headRow(table).cells) { out.push({ th, index: i }); i += th.colSpan || 1; }
    return out;
  }
  const label = th => (th.dataset.sortLabel || lineOf(th)).replace(/\s+/g, ' ').trim();

  /* ---------- remembering ---------- */
  function keyOf(table) {
    if (table.dataset.sortKey) return 'okl.sort|key:' + table.dataset.sortKey;
    const route = (location.hash || '').replace(/\?.*$/, '').split('/').map(p => /\d/.test(p) ? ':id' : p).join('/');
    return 'okl.sort|' + location.pathname + '|' + route + '|' + columns(table).map(c => label(c.th)).join('·');
  }
  function loadKey(k) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v && typeof v.col === 'number' ? v : null; } catch (e) { return null; } }
  const load = table => loadKey(keyOf(table));
  function save(table, v) { try { if (v) localStorage.setItem(keyOf(table), JSON.stringify(v)); else localStorage.removeItem(keyOf(table)); } catch (e) { /* storage off: still sorts */ } }

  /* ---------- sorting ---------- */
  // items in the chosen order; vals = the text (or number) shown for each; empty values last either way, ties keep the list order
  function order(items, vals, dir, pos) {
    const txt = vals.map(v => v == null ? '' : typeof v === 'number' ? (isFinite(v) ? String(v) : '') : String(v).replace(/\s+/g, ' ').trim());
    const filled = txt.filter(v => !EMPTY.test(v));
    const kind = filled.length && filled.every(v => asNumber(v) != null) ? 'n' : filled.length && filled.every(v => asDate(v) != null) ? 'd' : 't';
    const d = dir === 'desc' ? -1 : 1;
    return items.map((it, k) => {
      const v = txt[k], empty = EMPTY.test(v);
      return { it, k: pos ? pos(it, k) : k, empty, v: empty ? null : kind === 'n' ? asNumber(v) : kind === 'd' ? asDate(v) : v };
    }).sort((a, b) => {
      if (a.empty !== b.empty) return a.empty ? 1 : -1;
      if (a.empty) return a.k - b.k;
      const c = kind === 't' ? collator.compare(a.v, b.v) : a.v - b.v;
      return c ? c * d : a.k - b.k;
    }).map(x => x.it);
  }
  let seq = 0;
  function groups(body) {                     // rows with their opened-detail rows
    const out = [];
    for (const tr of Array.from(body.rows)) {
      if (tr.dataset.tsI == null) tr.dataset.tsI = String(seq++);
      if (isWide(tr) && out.length) out[out.length - 1].rows.push(tr);
      else out.push({ rows: [tr], i: +tr.dataset.tsI });
    }
    return out;
  }
  function apply(table, state) {
    const body = table.tBodies[0]; if (!body) return;
    const G = groups(body);
    const st = table.__ts; st.state = state;
    if (state && G.length > 1) {
      const col = columns(table)[state.col]; if (!col) { st.state = null; return paint(table); }
      const vals = G.map(g => cellText(g.rows[0].cells[col.index]));
      const sorted = order(G, vals, state.dir, g => g.i);
      reorder(body, sorted);
    } else if (!state) reorder(body, G.slice().sort((a, b) => a.i - b.i));
    paint(table);
  }
  function reorder(body, G) {
    const want = [].concat(...G.map(g => g.rows));
    if (want.every((tr, k) => body.rows[k] === tr)) return;
    const frag = document.createDocumentFragment(); want.forEach(tr => frag.appendChild(tr));
    body.appendChild(frag);
    observer.takeRecords();                    // our own move, not a new list
  }
  function paint(table) {
    const st = table.__ts, s = st.state;
    columns(table).forEach((c, k) => {
      if (!c.th.classList.contains('ts-col')) return;
      const on = s && s.col === k;
      c.th.classList.toggle('ts-on', !!on);
      c.th.setAttribute('aria-sort', on ? (s.dir === 'desc' ? 'descending' : 'ascending') : 'none');
    });
    if (st.bar) {
      const sel = st.bar.querySelector('select');
      sel.value = s ? s.col + ':' + s.dir : '';
      st.bar.hidden = table.tBodies[0].rows.length < 2;
    }
    observer.takeRecords();
  }
  function choose(table, col) {
    const s = table.__ts.state;
    const next = !s || s.col !== col ? { col, dir: 'asc' } : s.dir === 'asc' ? { col, dir: 'desc' } : null;
    pick(table, next);
  }
  function pick(table, next) {
    save(table, next); apply(table, next);
    (table.isConnected ? table : document).dispatchEvent(new CustomEvent('tablesort', { bubbles: true, detail: { key: table.dataset.sortKey || null, sort: next } }));
  }

  /* ---------- set up ---------- */
  function setup(table) {
    if (table.__ts || !table.isConnected || !eligible(table)) return;
    table.__ts = { state: null };
    const cols = columns(table);
    cols.forEach((c, k) => {
      const th = c.th;
      if (th.dataset.nosort != null || !label(th) || th.querySelector('input, button, select')) return;
      th.classList.add('ts-col'); th.tabIndex = 0; th.title = th.title || 'Sort by this column';   // the arrow is CSS: heading text stays as it is
      th.addEventListener('click', e => { if (!e.target.closest('a, button, input, select')) choose(table, k); });
      th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(table, k); } });
    });
    const usable = cols.map((c, k) => [c, k]).filter(([c]) => c.th.classList.contains('ts-col'));
    if (!usable.length) return;
    if (table.classList.contains('tbl') && !table.classList.contains('no-stack')) {   // phones: headings hidden, so a picker
      const bar = document.createElement('div'); bar.className = 'ts-bar';
      bar.innerHTML = '<label>Sort by <select class="inp"><option value="">List order</option>' + usable.map(([c, k]) => {
        const n = label(c.th).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        return `<option value="${k}:asc">${n} ▲</option><option value="${k}:desc">${n} ▼</option>`;
      }).join('') + '</select></label>';
      bar.querySelector('select').addEventListener('change', e => {
        const v = e.target.value;
        pick(table, v ? { col: +v.split(':')[0], dir: v.split(':')[1] } : null);
      });
      const at = table.closest('.tbl-wrap') || table;
      if (at.parentNode) { at.parentNode.insertBefore(bar, at); table.__ts.bar = bar; }
    }
    apply(table, load(table));
  }
  function refresh(table) {                   // the app put new rows in: keep the chosen order
    if (!table.__ts) return setup(table);
    if (!table.querySelector('thead .ts-col')) {            // headings were drawn again: start over
      if (table.__ts.bar) table.__ts.bar.remove();
      table.__ts = null; return setup(table);
    }
    if (!eligible(table)) return;
    apply(table, table.__ts.state);
  }
  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.tagName === 'TABLE') setup(root);
    root.querySelectorAll && root.querySelectorAll('table').forEach(setup);
  }

  const observer = new MutationObserver(records => {
    const touched = new Set();
    for (const r of records) {
      r.addedNodes.forEach(n => { if (n.nodeType === 1) scan(n); });
      const t = r.target.nodeType === 1 && r.target.closest ? r.target.closest('table') : null;
      if (t && (r.target.tagName === 'TBODY' || r.target.tagName === 'TABLE')) touched.add(t);
    }
    touched.forEach(t => { if (t.isConnected) refresh(t); });
  });

  const css = document.createElement('style');
  css.textContent = `
th.ts-col{cursor:pointer;user-select:none;white-space:nowrap}
th.ts-col:hover,th.ts-col:focus-visible{color:var(--text,#1B241F)}
th.ts-col:focus-visible{outline:2px solid var(--brand,#1F7A4D);outline-offset:-2px}
th.ts-col.ts-on{color:var(--brand-700,var(--brand,#1F7A4D))}
.ts-col::after{content:'↕';display:inline-block;margin-left:5px;font-size:9px;opacity:.35;vertical-align:1px}
th.ts-col:hover::after{opacity:.7}
th.ts-col[aria-sort=ascending]::after{content:'▲';opacity:1}
th.ts-col[aria-sort=descending]::after{content:'▼';opacity:1}
.ts-bar{display:none}
@media (max-width:820px){
  .ts-bar{display:flex;justify-content:flex-end;padding:8px 2px}
  .ts-bar[hidden]{display:none}
  .ts-bar label{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text-2,#555)}
  .ts-bar select{width:auto;min-width:160px}
}
@media print{.ts-col::after,.ts-bar{display:none!important}}
html[data-theme="dark"] th.ts-col.ts-on{color:var(--brand,#3FB27A)}`;
  document.head.appendChild(css);

  // for lists the console cuts: the whole list in the order chosen on the table named key
  window.oklTableSort = {
    rows(list, key, getters) {
      const s = loadKey('okl.sort|key:' + key), get = s && getters[s.col];
      if (!get) return list;
      return order(list, list.map(x => { try { return get(x); } catch (e) { return ''; } }), s.dir);
    }
  };

  function start() { scan(document.body); observer.observe(document.body, { childList: true, subtree: true }); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
