/* OKL Console shared layer (7 Nov 2026 unify round). Loaded last by every console's index.html:
     1. Phone / Laptop view: starts from the screen, is remembered on this device (localStorage okl.view), and a small
        button at the bottom-left switches it.
          - on a phone, "Laptop view" asks the browser for a wide page (the viewport meta), so the full layout shows;
          - on a laptop, "Phone view" makes the page a narrow column and applies every phone rule of the stylesheet
            (the @media (max-width) rules are copied under body.view-phone), so the layout matches a phone.
     2. A few phone rules every console shares: inputs at 16px (no zoom on focus), taps at least 44px high, tables never
        wider than the screen.
     3. The suggestion box under every page: "Suggest an improvement". It posts to its own endpoint (separate table), is
        wrapped so any failure is ignored, and never blocks or changes a page.
     4. No saved e-mail in a search box (12 Nov 2026): the browser's password manager puts the saved e-mail into the text box
        nearest a password box (the QC Manager's sign-off dialog filled the QC inbox search). Search boxes get autocomplete off,
        and a password box with no username box of its own gets a hidden one, so the browser fills that instead.
   Nothing here reads or changes a console's own data. */
(function () {
  'use strict';
  if (window.oklShared) return;
  window.oklShared = true;
  const API = 'https://orangegroupsai.online';
  const mod = (/\/(engineering|qsync|employees|procurement|users|production|requests|profile|system)\b/.exec(location.pathname) || [, 'console'])[1];
  const safe = f => { try { return f(); } catch (e) { return undefined; } };
  const store = {
    get: k => safe(() => localStorage.getItem(k)),
    set: (k, v) => safe(() => localStorage.setItem(k, v)),
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- redraw scroll position ---------------- */
  let lastRenderPath = null;
  window.oklScrollAfterRender = function (path) {
    const currentPath = String(path == null ? location.hash || '#/' : path);
    const top = currentPath === lastRenderPath ? window.scrollY : 0;
    lastRenderPath = currentPath;
    window.scrollTo({ top });
  };

  /* ---------------- 1. view ---------------- */
  const deviceW = Math.min(screen.width || 9999, screen.height || 9999) < 600 ? Math.min(screen.width, screen.height) : (screen.width || 9999);
  const isPhoneDevice = deviceW < 820;
  const meta = document.querySelector('meta[name=viewport]');
  let view = store.get('okl.view');
  if (view !== 'phone' && view !== 'laptop') view = isPhoneDevice ? 'phone' : 'laptop';

  function cloneMedia() {      // the phone rules, for a wide window showing phone view
    if (document.getElementById('oklPhoneRules')) return;
    const out = [];
    const pre = sel => sel.split(',').map(s => {
      s = s.trim();
      if (/^(html|:root)\b/.test(s)) return s.replace(/^(html|:root)/, '$1 body.view-phone').replace('body.view-phone body', 'body.view-phone');
      if (/^body\b/.test(s)) return s.replace(/^body/, 'body.view-phone');
      return 'body.view-phone ' + s;
    }).join(',');
    const walk = (rules, cond) => Array.from(rules).forEach(r => {
      if (r.type === CSSRule.MEDIA_RULE) {
        const m = /max-width:\s*(\d+)px/.exec(r.conditionText || r.media.mediaText);
        if (m && +m[1] <= 1200 && !/print|min-width/.test(r.conditionText || r.media.mediaText)) walk(r.cssRules, true);
      } else if (r.type === CSSRule.STYLE_RULE && cond) {
        out.push(pre(r.selectorText) + '{' + r.style.cssText + '}');
      }
    });
    Array.from(document.styleSheets).forEach(ss => safe(() => walk(ss.cssRules, false)));
    const st = document.createElement('style'); st.id = 'oklPhoneRules'; st.textContent = out.join('\n');
    document.head.appendChild(st);
  }
  function applyView() {
    document.body.classList.toggle('view-phone', view === 'phone' && !isPhoneDevice);
    document.body.classList.toggle('view-laptop', view === 'laptop');
    if (meta) meta.setAttribute('content', view === 'laptop' && isPhoneDevice ? 'width=1100' : 'width=device-width, initial-scale=1');
    if (view === 'phone' && !isPhoneDevice) cloneMedia();
    const b = document.getElementById('oklViewBtn');
    if (b) { b.textContent = view === 'phone' ? 'Laptop view' : 'Phone view'; b.title = 'Switch to the ' + (view === 'phone' ? 'laptop' : 'phone') + ' layout'; }
  }

  /* ---------------- 2. shared styles ---------------- */
  const css = `
  /* the bar at the top right of every page (072): Home, My profile, Phone/Laptop, Sign out */
  #oklBar{position:fixed;right:10px;top:8px;z-index:95;display:flex;gap:6px;align-items:center}
  #oklBar a,#oklBar button{border:0;border-radius:999px;padding:9px 13px;font:700 13px/1 var(--font,system-ui,sans-serif);cursor:pointer;
    box-shadow:0 2px 10px rgba(0,0,0,.18);display:inline-flex;align-items:center;gap:6px;text-decoration:none;white-space:nowrap}
  #oklBar .okl-nb{background:var(--surface,#fff);color:var(--text,#16191D);border:1px solid var(--line,#ccd3cf);box-shadow:none}
  #oklBar .okl-nb:hover{background:var(--surface-2,#f1f4f2)}
  #oklBar .okl-nb svg{width:16px;height:16px;flex:0 0 16px}
  #oklBar .okl-nb.on{border-color:var(--brand,#ED6B1F);color:var(--brand-700,#b4500f)}
  #oklViewBtn{background:#0F5132;color:#fff}
  #oklViewBtn:hover{background:#0b3d26}
  @media (max-width:1024px){#oklBar .okl-nb .t{display:none}#oklBar .okl-nb{padding:9px 10px}}
  body.view-phone #oklBar .okl-nb .t{display:none}
  body.view-phone #oklBar .okl-nb{padding:9px 10px}
  /* phone view on a wide window: a 460px column. No transform (it would pin fixed bars to the page, not the screen); the column is
     clipped instead and the fixed bars are moved into it */
  body.view-phone{max-width:460px;margin:0 auto;min-height:100vh;box-shadow:0 0 0 1px #c9d1cc,0 0 30px rgba(0,0,0,.18)}
  html body.view-phone .sidebar{visibility:hidden}
  html body.view-phone.nav-open .sidebar{visibility:visible}
  html body.view-phone .sidebar{left:calc(50% - 230px)}
  html body.view-phone .botnav{left:calc(50% - 230px);right:auto;width:460px}
  html body.view-phone .toasts{left:calc(50% - 216px);right:auto;width:432px}
  html body.view-phone .backdrop{left:calc(50% - 230px);right:auto;width:460px}
  html:has(body.view-phone){background:#d7ddd9}
  @media (max-width:1024px){
    input.inp,select.inp,textarea.inp,.field input,.field select,.field textarea{font-size:16px}
    select.inp,input.inp{height:auto;min-height:42px;line-height:1.3;padding-top:8px;padding-bottom:8px}
    .btn{min-height:42px}
    .content,.card,.card-b{max-width:100%}
    img,video,canvas{max-width:100%}
    .tbl-wrap{max-width:100%}
    .topbar{padding-right:250px}
  }
  @media (min-width:1025px){.topbar{padding-right:420px}}
  body.view-phone input.inp,body.view-phone select.inp,body.view-phone textarea.inp{font-size:16px}
  body.view-phone select.inp,body.view-phone input.inp{height:auto;min-height:42px;line-height:1.3;padding-top:8px;padding-bottom:8px}
  body.view-phone .btn{min-height:42px}
  body.view-phone #oklBar{right:calc(50% - 220px)}
  html body.view-phone .topbar{padding-right:250px}
  #oklSugFab{position:fixed;right:10px;bottom:10px;z-index:90;height:40px;border-radius:999px;border:0;background:var(--brand,#ED6B1F);color:#fff;
    box-shadow:0 3px 12px rgba(0,0,0,.28);cursor:pointer;font:700 12.5px/1 var(--font,system-ui,sans-serif);padding:0 14px 0 11px;display:flex;align-items:center;gap:7px}
  #oklSugFab:hover{filter:brightness(.94)}
  #oklSugFab .ico{font-size:17px;line-height:1}
  @media (max-width:1024px){#oklSugFab{bottom:66px}}
  html body.view-phone #oklSugFab{right:calc(50% - 220px);bottom:66px}
  #oklSugBox{position:fixed;right:10px;bottom:58px;z-index:91;width:min(310px,calc(100vw - 20px));background:var(--surface,#fff);border:1px solid var(--line,#ccd3cf);border-radius:12px;
    box-shadow:0 6px 24px rgba(0,0,0,.22);padding:10px 12px;font-size:12.5px;display:none}
  #oklSugBox.open{display:block}
  @media (max-width:1024px){#oklSugBox{bottom:114px}}
  html body.view-phone #oklSugBox{right:calc(50% - 220px);bottom:114px}
  #oklSugBox textarea{width:100%;min-height:70px;border:1px solid var(--line,#ccd3cf);border-radius:8px;padding:8px;font:inherit;font-size:16px;resize:vertical;box-sizing:border-box;background:var(--bg,#fff);color:inherit}
  #oklSugBox .okl-sug-r{display:flex;gap:8px;align-items:center;margin-top:6px}
  #oklSugBox button.go{border:0;background:var(--brand,#ED6B1F);color:#fff;border-radius:8px;padding:8px 14px;font:700 12.5px var(--font,system-ui,sans-serif);cursor:pointer;min-height:36px}
  #oklSugBox button:disabled{opacity:.55}
  #oklSugBox .okl-sug-m{color:var(--text-3,#8a93a0);font-size:11.5px}
  @media print{#oklBar,#oklViewBtn,#oklSugFab,#oklSugBox{display:none !important}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------------- 3. suggestion box ---------------- */
  const token = () => safe(() => sessionStorage.getItem('okl.token')) || '';
  const pageName = () => (location.hash || '#/').replace(/^#/, '').split('?')[0] || '/';
  function ensureSug() {
    safe(() => {
      if (!token()) return;                                   // not on the sign-in page
      if (document.getElementById('oklSugFab')) return;
      const fab = document.createElement('button'); fab.id = 'oklSugFab'; fab.type = 'button'; fab.className = 'no-print';
      fab.title = 'Suggestions and complaints'; fab.setAttribute('aria-label', 'Suggestions and complaints'); fab.innerHTML = '<span class="ico">\u{1F4AC}</span><span>Suggestions</span>';
      const box = document.createElement('div'); box.id = 'oklSugBox'; box.className = 'no-print';
      box.innerHTML = `<div class="okl-sug-m" style="margin-bottom:6px"><b style="color:var(--text,#16191D)">Suggestions</b><br>About this page. It goes to the system team and changes nothing here.</div>
        <textarea id="oklSugText" maxlength="1500" placeholder="What is confusing, slow or missing?"></textarea>
        <div class="okl-sug-r"><button type="button" class="go" id="oklSugSend">Send</button><span class="okl-sug-m" id="oklSugMsg"></span></div>`;
      document.body.appendChild(box); document.body.appendChild(fab);
      fab.onclick = () => box.classList.toggle('open');
      const t = box.querySelector('#oklSugText'), b = box.querySelector('#oklSugSend'), m = box.querySelector('#oklSugMsg');
      b.onclick = async () => {
        const text = t.value.trim();
        if (text.length < 3) { m.textContent = 'Write a few words first.'; return; }
        b.disabled = true; m.textContent = 'Sending...';
        try {
          const res = await fetch(API + '/webhook/okl/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token() },
            body: JSON.stringify({ module: mod, page: pageName(), message: text, device: document.body.classList.contains('view-phone') || isPhoneDevice ? 'phone' : 'laptop' }) });
          const j = await res.json().catch(() => ({}));
          if (res.ok && j.ok) { t.value = ''; m.textContent = 'Thank you, sent.'; setTimeout(() => { m.textContent = ''; box.classList.remove('open'); }, 2500); }
          else m.textContent = j.error || 'Could not send now. Try again later.';
        } catch (e) { m.textContent = 'Could not send now. Try again later.'; }
        b.disabled = false;
      };
    });
  }

  /* ---------------- 4. no saved e-mail in a search box ---------------- */
  const SEARCH = /(^|[^a-z])(q|search)$/i;
  function guardInputs(root) {
    (root || document).querySelectorAll('input:not([data-okl-ac])').forEach(el => {
      const t = (el.getAttribute('type') || 'text').toLowerCase();
      if (t === 'password') {
        el.setAttribute('data-okl-ac', '1');
        const box = el.closest('.modal, form, .card, .field') || el.parentElement;
        const scope = el.closest('.modal, form') || box;
        if (scope && !scope.querySelector('input[autocomplete="username"], input[type="email"]')) {
          const u = document.createElement('input');
          u.type = 'text'; u.autocomplete = 'username'; u.tabIndex = -1; u.setAttribute('aria-hidden', 'true'); u.setAttribute('data-okl-ac', '1');
          u.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0;padding:0;margin:0';
          el.parentNode.insertBefore(u, el);
        }
        return;
      }
      if (t !== 'text' && t !== 'search') return;
      el.setAttribute('data-okl-ac', '1');
      const ph = el.getAttribute('placeholder') || '';
      if (SEARCH.test(el.id || '') || /^search/i.test(ph) || el.closest('.search, .filter-search')) {
        el.setAttribute('autocomplete', 'off'); el.setAttribute('autocorrect', 'off'); el.setAttribute('spellcheck', 'false');
        if (!el.name) el.name = 'okl-search-' + (el.id || 'box');
      }
    });
  }

  /* ---------------- 5. the rule behind a number (13 Nov 2026) ----------------
     oklInfo(text) gives a small (i) button to put beside a column heading, a title or a setting. Tapping it shows the rule
     and why it is so, in a bubble; tapping elsewhere, Escape or scrolling closes it. A tap on (i) inside a sortable heading
     does not sort. Lines in the text become lines in the bubble. */
  // 14 Nov 2026 (user): approving a request takes the manager to the WHOLE store of that request, so all the stock and its
  // status stay in mind; the request's own items are highlighted at the top (#/store?req=<request>&codes=A,B)
  window.oklRequestMark = function () {
    const q = new URLSearchParams(((location.hash || '').split('?')[1]) || ''), r = q.get('req');
    return r ? { req: r, codes: String(q.get('codes') || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean) } : null;
  };
  window.oklRequestBanner = function (m) {
    if (!m) return '';
    const back = (location.pathname.indexOf('/procurement/') >= 0 ? '' : '../procurement/') + '#/approve/' + encodeURIComponent(m.req);
    const n = m.codes.length;
    return '<div class="notice info no-print" style="margin-bottom:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1 1 auto">'
      + 'Request <b>' + esc(m.req) + '</b>: the whole store is below' + (n ? ', with its ' + n + ' item' + (n === 1 ? '' : 's') + ' highlighted at the top.' : '. It asks for nothing that is kept in this store.')
      + '</div><a class="btn btn-ghost btn-sm" href="' + back + '">Back to the request</a></div>';
  };
  window.oklRequestFirst = function (m, code) { return m && m.codes.includes(String(code || '').toUpperCase()) ? 0 : 1; };
  window.oklInfo = function (text, label) {
    return '<button type="button" class="okl-info no-print" data-okl-info="' + esc(text) + '" aria-label="' + esc(label || 'How this is worked out') + '">i</button>';
  };
  /* ---------------- Which request did it come for? (070, Production store and Engineering spares) ----------------
     15 Nov 2026 (user): Receive starts from what arrived, not from the request. Each delivery line gets a slot under it
     that suggests the open request lines that look like it (the same store code first, then a name alike); one tap
     links it, and "Nothing more is coming" closes a line that came short. A line can also be found by search.
     cfg: { requests [{ref, asked_on, requestor, po, vendor, lines: [{id, item_id, material, detail, qty, unit, received, due, code}]}],
            what ('material' | 'part'), lines() -> the delivery lines on the form now (a removed line no longer holds its request) }
     returns { count, slot(line, info) -> html, bind(root), refresh(root, line), refreshAll(), link(line) -> {request_item_id, close_line} | {} }
     info(line) -> { key, name, qty, unit }: the store code, the words to match, the quantity and the store unit of the line */
  window.oklReqSuggest = function (cfg) {
    const what = cfg.what || 'material';
    const open = [];
    (cfg.requests || []).forEach(r => (r.lines || []).forEach(l => open.push(Object.assign({}, l, { ref: r.ref, asked_on: r.asked_on, requestor: r.requestor, po: r.po, vendor: r.vendor }))));
    const byId = id => open.find(l => String(l.id) === String(id));
    const reg = {}; let uid = 0, root = null;
    const qtyTxt = (n, u) => (n == null ? '' : String(+n)) + (u ? ' ' + u : '');
    const dateTxt = d => { try { return new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }); } catch (e) { return d || ''; } };
    const STOP = { the: 1, and: 1, for: 1, of: 1, with: 1, to: 1, in: 1, on: 1, a: 1, an: 1, new: 1, pcs: 1, piece: 1, pieces: 1, unit: 1, units: 1, no: 1, nos: 1, x: 1 };
    const words = t => Array.from(new Set(String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ')
      .filter(w => w && !STOP[w] && (w.length > 1 || /\d/.test(w))).map(w => w.length > 3 && /[a-z]s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w)));
    const flat = t => String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    // how much a request line looks like the delivery line: 2 = the same store code, 0..1 = the words, 0 = not alike
    function score(l, inf) {
      if (inf.key && (l.code === inf.key || flat(l.material + ' ' + (l.detail || '')).includes(flat(inf.key)))) return 2;
      const a = words(inf.name), b = words(l.material + ' ' + (l.detail || ''));
      if (!a.length || !b.length) return 0;
      const both = a.filter(w => b.includes(w)); if (!both.length) return 0;
      const na = a.filter(w => /\d/.test(w)), nb = b.filter(w => /\d/.test(w));
      if (na.length && nb.length && !na.some(w => nb.includes(w))) return 0;      // "Bearing 6205" is not "Bearing 6206"
      const s = both.length / Math.min(a.length, b.length);
      return s >= 0.5 ? s : 0;
    }
    const sameUnit = (store, req) => { const U = (window.oklRequests && window.oklRequests.UNIT_OF_STORE) || {};
      const k = t => String(t || '').toLowerCase().replace(/e?s$/, '').replace(/^piece$/, 'pc').replace(/^pc$/, 'pcs');
      return !req || !store || U[store] === req || k(store) === k(req); };
    const live = () => (cfg.lines ? cfg.lines() : Object.keys(reg).map(u => reg[u].line));
    const taken = (line, id) => live().some(x => x !== line && x.rqId && String(x.rqId) === String(id));
    const sig = inf => (inf.key || '') + '|' + words(inf.name).join(' ');
    function cands(line) {
      const inf = reg[line._rqs].info(line);
      if (!inf.key && !words(inf.name).length) return [];
      return open.map(l => ({ l, s: score(l, inf) })).filter(x => x.s > 0 && !taken(line, x.l.id))
        .sort((a, b) => b.s - a.s || String(b.l.asked_on).localeCompare(String(a.l.asked_on))).map(x => x);
    }
    function lineTxt(l) {
      return '<b>' + esc(l.ref) + '</b> <span class="muted">' + esc([dateTxt(l.asked_on), l.requestor].filter(Boolean).join(' · ')) + '</span><br>'
        + esc(l.material) + (l.detail && l.detail !== l.material ? ' <span class="muted">' + esc(l.detail) + '</span>' : '')
        + ' · <b>' + esc(l.due == null ? 'quantity not given' : qtyTxt(l.due, l.unit) + ' to come') + '</b>';
    }
    function opt(u, l, on) {
      return '<label class="rqs-opt' + (on ? ' on' : '') + '"><input type="radio" name="rqs' + u + '" data-rqs-pick="' + u + '" value="' + esc(l.id) + '"' + (on ? ' checked' : '') + '><span>' + lineTxt(l) + '</span></label>';
    }
    function inner(line) {
      const u = line._rqs, inf = reg[u].info(line);
      if (!open.length) return '';
      // another material on the line: what was said about the request no longer holds
      const sg = sig(inf);
      if (line.rqSig !== undefined && line.rqSig !== sg) { line.rqId = undefined; line.rqAuto = false; line.rqClose = false; line.rqFind = false; }
      line.rqSig = sg;
      const L = line.rqId ? byId(line.rqId) : null;
      // a line linked to a request: what is left after this delivery, and closing it
      if (L) {
        const q = +inf.qty > 0 ? +inf.qty : 0, same = sameUnit(inf.unit, L.unit), due = L.due == null ? null : +L.due;
        const done = due == null || (same && q >= due);
        if (done) line.rqClose = false;
        return '<div class="rqs-head">For request ' + (line.rqAuto ? '<span class="tiny muted">(same ' + (what === 'part' ? 'SKU' : 'code') + ' as on the request)</span>' : '')
          + '<button type="button" class="btn btn-ghost btn-sm" data-rqs-change="' + u + '">Change</button></div>'
          + '<div class="rqs-opt on"><span>' + lineTxt(L) + '</span></div>'
          + '<div class="tiny" style="margin-top:4px">' + (done ? '<span class="rqs-ok">This delivery completes the request line.</span>'
            : (same && q ? 'After this delivery: <b>' + esc(qtyTxt(due - q, L.unit)) + '</b> still to come.' : 'Asked ' + esc(qtyTxt(L.qty, L.unit)) + '.')
              + '<label class="row" style="gap:6px;margin-top:4px"><input type="checkbox" data-rqs-close="' + u + '"' + (line.rqClose ? ' checked' : '') + '> Nothing more is coming: close the request line</label>') + '</div>';
      }
      if (line.rqFind) {
        const q = String(line.rqQ || '').trim().toLowerCase();
        const list = open.filter(l => !taken(line, l.id) && (!q || [l.ref, l.requestor, l.po, l.vendor, l.material, l.detail, l.code].join(' ').toLowerCase().includes(q))).slice(0, 8);
        return '<div class="rqs-head">Which request is it for?<button type="button" class="btn btn-ghost btn-sm" data-rqs-nofind="' + u + '">Close</button></div>'
          + '<input class="inp" type="search" data-rqs-q="' + u + '" value="' + esc(line.rqQ || '') + '" placeholder="Request number, item, who asked, PO" style="margin:4px 0">'
          + '<div data-rqs-list="' + u + '">' + (list.map(l => opt(u, l, false)).join('') || '<div class="tiny muted">No open request line matches.</div>') + '</div>';
      }
      const c = cands(line);
      if (!c.length) return (inf.key || words(inf.name).length) ? '<div class="tiny muted">No open request looks like this. <button type="button" class="rqs-link" data-rqs-find="' + u + '">On a request? Find it</button></div>' : '';
      if (line.rqId === undefined && c[0].s === 2 && !(c[1] && c[1].s === 2)) { line.rqId = c[0].l.id; line.rqAuto = true; return inner(line); }
      return '<div class="rqs-head">Is it for one of these requests?</div>' + c.slice(0, 3).map(x => opt(u, x.l, false)).join('')
        + '<label class="rqs-opt' + (line.rqId === 0 ? ' on' : '') + '"><input type="radio" name="rqs' + u + '" data-rqs-pick="' + u + '" value="0"' + (line.rqId === 0 ? ' checked' : '') + '><span>No, not on a request</span></label>'
        + '<button type="button" class="rqs-link tiny" data-rqs-find="' + u + '">Another request...</button>';
    }
    function refresh(r, line) {
      const box = (r || root) && (r || root).querySelector('[data-rqs="' + line._rqs + '"]'); if (!box) return;
      box.innerHTML = inner(line);
    }
    function refreshAll() { live().forEach(l => { if (l._rqs && reg[l._rqs]) refresh(root, l); }); }
    function slot(line, info) {
      if (!line._rqs) line._rqs = String(++uid);
      reg[line._rqs] = { line, info };
      return '<div class="rqs" data-rqs="' + line._rqs + '">' + inner(line) + '</div>';
    }
    function bind(r) {
      if (root === r) { refreshAll(); return; }
      root = r;
      const L = u => reg[u] && reg[u].line;
      r.addEventListener('change', e => {
        const t = e.target, d = t.dataset || {};
        if (d.rqsPick) { const line = L(d.rqsPick); if (!line) return; line.rqId = t.value === '0' ? 0 : t.value; line.rqAuto = false; line.rqFind = false; line.rqClose = false; refreshAll(); }
        else if (d.rqsClose) { const line = L(d.rqsClose); if (line) line.rqClose = t.checked; }
      });
      r.addEventListener('input', e => {
        const t = e.target, d = t.dataset || {};
        if (!d.rqsQ) return;
        const line = L(d.rqsQ); if (!line) return; line.rqQ = t.value;
        const keep = t.selectionStart; refresh(r, line);
        const n = r.querySelector('[data-rqs-q="' + d.rqsQ + '"]'); if (n) { n.focus(); try { n.setSelectionRange(keep, keep); } catch (er) { /* ignore */ } }
      });
      r.addEventListener('click', e => {
        const b = e.target.closest && e.target.closest('[data-rqs-change],[data-rqs-find],[data-rqs-nofind]'); if (!b) return;
        const d = b.dataset, line = L(d.rqsChange || d.rqsFind || d.rqsNofind); if (!line) return;
        e.preventDefault();
        if (d.rqsChange) { line.rqId = 0; line.rqAuto = false; line.rqClose = false; line.rqFind = true; }
        else if (d.rqsFind) { line.rqFind = true; line.rqQ = ''; }
        else line.rqFind = false;
        refreshAll();
        const q = r.querySelector('[data-rqs-q="' + line._rqs + '"]'); if (q) q.focus();
      });
      refreshAll();
    }
    // what a line sends: its request line, and "nothing more is coming"
    function link(line) {
      const L = line && line.rqId ? byId(line.rqId) : null;
      return L ? { request_item_id: String(L.id), close_line: !!line.rqClose } : {};
    }
    return { count: open.length, slot, bind, refresh: (r, line) => { if (line && line._rqs) refresh(r, line); }, refreshAll: () => { if (root) refreshAll(); }, link };
  };

  function infoStyle() {
    if (document.getElementById('oklInfoStyle')) return;
    const st = document.createElement('style'); st.id = 'oklInfoStyle';
    st.textContent = '.okl-info{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;min-height:16px;padding:0;margin:0 0 0 4px;'
      + 'border-radius:50%;border:1px solid currentColor;background:transparent;color:var(--text-3,#6b7280);font:italic 700 10px/1 Georgia,serif;cursor:pointer;vertical-align:middle;opacity:.8}'
      + '.okl-info:hover,.okl-info:focus{opacity:1;color:var(--brand,#ED6B1F);outline:none}'
      + '#oklInfoPop{position:absolute;z-index:3000;max-width:320px;background:#fff;color:#1d2329;border:1px solid #d6dbe0;border-radius:8px;'
      + 'box-shadow:0 8px 24px rgba(0,0,0,.14);padding:10px 12px;font:13px/1.45 system-ui,-apple-system,Segoe UI,Arial,sans-serif;white-space:pre-line;text-align:left;font-weight:400;text-transform:none;letter-spacing:0}'
      + '@media print{#oklInfoPop{display:none}}'
      + '.tbl tr.req-item td{background:#FFF7DB}.tbl tr.req-item td:nth-child(2){font-weight:700}'
      // which request did a delivery line come for (070)
      + '.rqs:empty{display:none}.rqs{margin-top:6px;padding:6px 8px;border-left:3px solid #F6C9A8;background:#FFFBF7;border-radius:0 6px 6px 0;font-size:13px}'
      + '.rqs-head{display:flex;gap:8px;align-items:center;justify-content:space-between;font-weight:600;font-size:12px;margin-bottom:4px}'
      + '.rqs-opt{display:flex;gap:8px;align-items:flex-start;padding:5px 6px;border:1px solid var(--line-2,#e5e8eb);border-radius:6px;margin-top:4px;background:#fff;cursor:pointer;font-size:12px;line-height:1.35}'
      + '.rqs-opt input{margin-top:2px}.rqs-opt.on{border-color:var(--brand,#ED6B1F);background:#FFF3EA}'
      + '.rqs-link{background:none;border:0;padding:0;margin-top:4px;color:var(--brand,#ED6B1F);text-decoration:underline;cursor:pointer;font:inherit;font-size:12px}'
      + '.rqs-ok{color:var(--ok-ink,#166534);font-weight:600}';
    document.head.appendChild(st);
  }
  function infoClose() { const p = document.getElementById('oklInfoPop'); if (p) p.remove(); }
  function infoOpen(btn) {
    infoClose();
    const p = document.createElement('div'); p.id = 'oklInfoPop'; p.setAttribute('role', 'tooltip');
    p.textContent = btn.getAttribute('data-okl-info') || '';
    document.body.appendChild(p);
    const r = btn.getBoundingClientRect(), w = Math.min(320, window.innerWidth - 24);
    p.style.maxWidth = w + 'px';
    const left = Math.max(12, Math.min(window.scrollX + r.left - 8, window.scrollX + window.innerWidth - p.offsetWidth - 12));
    let top = window.scrollY + r.bottom + 6;
    if (r.bottom + p.offsetHeight + 12 > window.innerHeight && r.top > p.offsetHeight + 12) top = window.scrollY + r.top - p.offsetHeight - 6;
    p.style.left = left + 'px'; p.style.top = top + 'px';
  }
  document.addEventListener('click', e => {
    const b = e.target && e.target.closest ? e.target.closest('.okl-info') : null;
    if (b) { e.preventDefault(); e.stopPropagation(); const open = document.getElementById('oklInfoPop'); if (open && open.dataset.for === b.dataset.oklInfo) { if (open.dataset.hover === '1') { delete open.dataset.hover; return; } infoClose(); return; } infoOpen(b); const p = document.getElementById('oklInfoPop'); if (p) p.dataset.for = b.dataset.oklInfo; return; }
    if (!(e.target && e.target.closest && e.target.closest('#oklInfoPop'))) infoClose();
  }, true);
  // hover shows it (mouse only); a click keeps it open (phones have no hover)
  let infoHoverTimer = 0;
  document.addEventListener('mouseover', e => {
    const b = e.target && e.target.closest ? e.target.closest('.okl-info') : null;
    if (!b) return;
    clearTimeout(infoHoverTimer);
    const open = document.getElementById('oklInfoPop');
    if (open && open.dataset.for === b.dataset.oklInfo) return;
    infoOpen(b); const p = document.getElementById('oklInfoPop'); if (p) { p.dataset.for = b.dataset.oklInfo; p.dataset.hover = '1'; }
  });
  document.addEventListener('mouseout', e => {
    const b = e.target && e.target.closest ? e.target.closest('.okl-info, #oklInfoPop') : null;
    if (!b) return;
    clearTimeout(infoHoverTimer);
    infoHoverTimer = setTimeout(() => {
      const p = document.getElementById('oklInfoPop');
      if (p && p.dataset.hover === '1' && !p.matches(':hover') && !document.querySelector('.okl-info:hover')) infoClose();
    }, 250);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') infoClose(); });
  window.addEventListener('scroll', infoClose, { passive: true });
  window.addEventListener('hashchange', infoClose);

  /* ---------------- start ---------------- */
  function start() {
    safe(infoStyle);
    // the bar: Home, My profile, Phone/Laptop, Sign out (reachable from every page; replaces the sidebar's buttons)
    const root = /\/(engineering|qsync|employees|procurement|users|production|requests|profile|datacenter|system)\//.test(location.pathname) ? '../' : './';
    const ico = {
      home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
      user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
      out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
    };
    const bar = document.createElement('div'); bar.id = 'oklBar'; bar.className = 'no-print';
    const onProfile = /\/profile\//.test(location.pathname);
    bar.innerHTML = `<a class="okl-nb" href="${root}" title="Home">${ico.home}<span class="t">Home</span></a>`
      + `<a class="okl-nb${onProfile ? ' on' : ''}" href="${root}profile/" title="My profile">${ico.user}<span class="t">My profile</span></a>`
      + `<button type="button" id="oklViewBtn"></button>`
      + `<button type="button" class="okl-nb" id="oklSignOut" title="Sign out">${ico.out}<span class="t">Sign out</span></button>`;
    document.body.appendChild(bar);
    const b = document.getElementById('oklViewBtn');
    b.onclick = () => { view = view === 'phone' ? 'laptop' : 'phone'; store.set('okl.view', view); applyView(); };
    document.getElementById('oklSignOut').onclick = () => {
      if (typeof window.logout === 'function') return window.logout();
      safe(() => fetch(API + '/webhook/auth/api/logout', { method: 'POST', headers: { Authorization: token() } }));
      safe(() => sessionStorage.removeItem('okl.token')); location.href = root;
    };
    applyView();
    let timer = 0;
    const app = document.getElementById('app') || document.body;
    new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(ensureSug, 60); }).observe(app, { childList: true, subtree: true });
    ensureSug();
    // search boxes and password boxes anywhere on the page, dialogs included (they are added to <body>), as soon as they appear
    safe(() => guardInputs(document));
    new MutationObserver(() => safe(() => guardInputs(document))).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
