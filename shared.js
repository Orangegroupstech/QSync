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
  const mod = (/\/(engineering|qsync|employees|procurement|users|production)\b/.exec(location.pathname) || [, 'console'])[1];
  const safe = f => { try { return f(); } catch (e) { return undefined; } };
  const store = {
    get: k => safe(() => localStorage.getItem(k)),
    set: (k, v) => safe(() => localStorage.setItem(k, v)),
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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
  #oklViewBtn{position:fixed;right:10px;top:8px;z-index:95;border:0;background:#0F5132;color:#fff;
    border-radius:999px;padding:9px 15px;font:700 13px/1 var(--font,system-ui,sans-serif);box-shadow:0 2px 10px rgba(0,0,0,.3);cursor:pointer}
  #oklViewBtn:hover{background:#0b3d26}
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
    .topbar{padding-right:118px}
  }
  body.view-phone input.inp,body.view-phone select.inp,body.view-phone textarea.inp{font-size:16px}
  body.view-phone select.inp,body.view-phone input.inp{height:auto;min-height:42px;line-height:1.3;padding-top:8px;padding-bottom:8px}
  body.view-phone .btn{min-height:42px}
  body.view-phone #oklViewBtn{right:calc(50% - 220px)}
  body.view-phone .topbar{padding-right:118px}
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
  @media print{#oklViewBtn,#oklSugFab,#oklSugBox{display:none !important}}`;
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
  function infoStyle() {
    if (document.getElementById('oklInfoStyle')) return;
    const st = document.createElement('style'); st.id = 'oklInfoStyle';
    st.textContent = '.okl-info{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;min-height:16px;padding:0;margin:0 0 0 4px;'
      + 'border-radius:50%;border:1px solid currentColor;background:transparent;color:var(--text-3,#6b7280);font:italic 700 10px/1 Georgia,serif;cursor:pointer;vertical-align:middle;opacity:.8}'
      + '.okl-info:hover,.okl-info:focus{opacity:1;color:var(--brand,#ED6B1F);outline:none}'
      + '#oklInfoPop{position:absolute;z-index:3000;max-width:320px;background:#fff;color:#1d2329;border:1px solid #d6dbe0;border-radius:8px;'
      + 'box-shadow:0 8px 24px rgba(0,0,0,.14);padding:10px 12px;font:13px/1.45 system-ui,-apple-system,Segoe UI,Arial,sans-serif;white-space:pre-line;text-align:left;font-weight:400;text-transform:none;letter-spacing:0}'
      + '@media print{#oklInfoPop{display:none}}'
      + '.tbl tr.req-item td{background:#FFF7DB}.tbl tr.req-item td:nth-child(2){font-weight:700}';
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
    const b = document.createElement('button'); b.id = 'oklViewBtn'; b.type = 'button'; b.className = 'no-print';
    b.onclick = () => { view = view === 'phone' ? 'laptop' : 'phone'; store.set('okl.view', view); applyView(); };
    document.body.appendChild(b);
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
