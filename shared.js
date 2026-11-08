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

  /* ---------------- start ---------------- */
  function start() {
    const b = document.createElement('button'); b.id = 'oklViewBtn'; b.type = 'button'; b.className = 'no-print';
    b.onclick = () => { view = view === 'phone' ? 'laptop' : 'phone'; store.set('okl.view', view); applyView(); };
    document.body.appendChild(b);
    applyView();
    let timer = 0;
    const app = document.getElementById('app') || document.body;
    new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(ensureSug, 60); }).observe(app, { childList: true, subtree: true });
    ensureSug();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
