"use strict";

/* ---------------- Icons (trimmed subset, ported from QSync's app.js) ---------------- */
const I = (() => {
  const w = (p, extra) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra||''}>${p}</svg>`;
  return {
    plus: w('<path d="M12 5v14M5 12h14"/>'),
    check: w('<path d="M20 6L9 17l-5-5"/>'),
    checkCircle: w('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'),
    x: w('<path d="M18 6L6 18M6 6l12 12"/>'),
    box: w('<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>'),
    settings: w('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.6H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9.5A1.6 1.6 0 0 0 10.5 3V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9.5a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>'),
    logout: w('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>'),
    search: w('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>', 'width="15" height="15"'),
    menu: w('<path d="M3 6h18M3 12h18M3 18h18"/>'),
    chevR: w('<path d="M9 6l6 6-6 6"/>', 'width="15" height="15"'),
    chevL: w('<path d="M15 6l-6 6 6 6"/>', 'width="15" height="15"'),
    info: w('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5M12 8h.01"/>', 'width="15" height="15"'),
    alert: w('<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
    edit: w('<path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>', 'width="15" height="15"'),
    lock: w('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    externalLink: w('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/>'),
    arrowDown: w('<path d="M12 5v14M5 12l7 7 7-7"/>'),
    arrowUp: w('<path d="M12 19V5M5 12l7-7 7 7"/>'),
    play: w('<path d="M5 3l14 9-14 9z"/>'),
    history: w('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>'),
    download: w('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>', 'width="15" height="15"'),
    printer: w('<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>', 'width="15" height="15"'),
    users: w('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  };
})();

/* ---------------- Utilities (ported from QSync's app.js) ---------------- */
const $  = (s, r) => (r||document).querySelector(s);
const $$ = (s, r) => Array.from((r||document).querySelectorAll(s));
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms||220); }; }
function initials(name){ return String(name||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
function avatarColor(seed){
  const palette = ['#ED6B1F','#1F5C3D','#1B5FBF','#8B5CF6','#B3261E','#0E7490','#B45309','#4B5563','#BE185D','#15803D'];
  let h=0; for (const ch of String(seed||'')) h = (h*31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}
function avatarEl(name, cls){
  return `<div class="avatar ${cls||''}" style="background:${avatarColor(name)}" title="${esc(name)}">${esc(initials(name))}</div>`;
}

/* ---------------- API layer ----------------
   Session-gated, same pattern as QSync/Employees' own app.js: a bearer
   token from /webhook/auth/api/login (landing page), sent as a plain Authorization
   header (no "Bearer " prefix, matching what the backend's session-check
   expects). Same shared OKL_QCD_users / OKL_QCD_admin_sessions tables. */
const TOKEN_KEY = 'okl.token';
let memoryToken = '';
function getToken(){
  try { return sessionStorage.getItem(TOKEN_KEY) || memoryToken || ''; }
  catch (e) { return memoryToken || ''; }
}
function setToken(t){
  memoryToken = t || '';
  try { if (t) sessionStorage.setItem(TOKEN_KEY, t); else sessionStorage.removeItem(TOKEN_KEY); }
  catch (e) { /* sandboxed - memory fallback above already covers this */ }
}

// One sign-in on the landing page serves every console; no token means go there.
function toLanding(){ setToken(''); location.href = '../'; }
function toLandingKeepToken(){ location.href = '../'; }
// a link into this console (WhatsApp, e-mail) survives signing in: the landing page sends the person back here afterwards
function rememberHere(){ try { if (currentPath() !== '/') sessionStorage.setItem('okl.return', location.pathname + location.hash); } catch(e) { /* ignore */ } }
function noAccess(){
  try { sessionStorage.setItem('okl.notice', 'You do not have access to the System pages.'); } catch(e) { /* ignore */ }
  toLandingKeepToken();
}
function meFromAuth(auth, scope){
  const u = (auth && auth.user) || {};
  const editor = !!u.is_admin || ((auth && auth.edit) || []).includes(scope);
  return { id: u.id, name: u.name, role: u.is_admin ? 'admin' : '', is_admin: !!u.is_admin,
           permission: editor ? 'editor' : 'viewer', must_change: !!u.must_change, access: (auth && auth.access) || {} };
}
// Access per page (migration 016): 'edit' | 'submit' | 'view' | undefined. Admins may do everything.
function levelOf(scope){ return !S || !S.me ? undefined : (S.me.is_admin ? 'edit' : S.me.access[scope]); }
// System (083, 16 Nov 2026): two pages given in Users (module "System"); admins have both. Reading only: nothing here changes data.
// The server checks the page again (okl_sys_audit_list / okl_sys_version).
const PAGES = [["/audit", "system.audit"], ["/version", "system.version"], ["/help", "system"], ["/", "system.audit"]];
function pageOf(path){
  const p = String(path == null ? currentPath() : path).split('?')[0];
  const hit = PAGES.find(([pre]) => pre === '/' ? p === '/' : (p === pre || p.startsWith(pre + '/')));
  return hit ? hit[1] : 'system.audit';
}
const canView = scope => !!levelOf(scope);
function canOpen(path){ const sc = pageOf(path); return sc === 'system' ? (canView('system.audit') || canView('system.version')) : canView(sc); }

const API_BASE = 'https://orangegroupsai.online';
async function api(path, opts){
  opts = opts || {};
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  const token = getToken();
  if (token) headers['Authorization'] = token;
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch (e) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  if (res.status === 401){
    rememberHere(); toLanding();
    throw new Error('Your session has expired. Please log in again.');
  }
  let json = {};
  try { json = await res.json(); } catch (e) { /* empty body */ }
  if (!res.ok){ const err = new Error(json.error || 'Something went wrong.'); err.status = res.status; throw err; }
  if ((opts.method || 'GET') !== 'GET' && window.oklFormKeep) oklFormKeep.sent(opts.body);   // saved: formkeep.js
  return json;
}

/* ---------------- State store ---------------- */
let S = null; // { me: {id,name,role,permission}, items: [...] }

/* ---------------- Toast / modal (ported from QSync's app.js) ---------------- */
function toast(title, msg, kind, ms){
  const box = document.getElementById('toasts'); if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (kind||'');
  const icon = kind==='ok' ? I.checkCircle : kind==='err' ? I.alert : I.info;
  el.innerHTML = `<div class="ti">${icon}</div><div><div class="tt">${esc(title)}</div>${msg?`<div class="tm">${esc(msg)}</div>`:''}</div>`;
  box.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .2s'; setTimeout(()=>el.remove(),200); }, ms||4500);
}
function openModal(o){
  const layers = document.getElementById('layers');
  const wrap = document.createElement('div');
  wrap.className = 'overlay';
  wrap.innerHTML = `<div class="modal ${o.size==='wide'?'wide':(o.size==='narrow'?'narrow':'')}">
    <div class="modal-h"><div><h3>${esc(o.title||'')}</h3>${o.sub?`<div class="sub" style="font-size:12px;color:var(--text-3);margin-top:2px">${esc(o.sub)}</div>`:''}</div>
      <button class="btn-icon" data-close aria-label="Close">${I.x}</button></div>
    <div class="modal-b">${o.body||''}</div>
    ${o.footer?`<div class="modal-f">${o.footer}</div>`:''}
  </div>`;
  layers.appendChild(wrap);
  function close(){ wrap.remove(); }
  wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
  $$('[data-close]', wrap).forEach(b => b.onclick = close);
  if (o.onMount) o.onMount(wrap, close);
  return close;
}
function confirmDialog(title, msg, okLabel, kind){
  return new Promise(resolve => {
    const close = openModal({
      title, size:'narrow',
      body: `<div>${msg}</div>`,
      footer: `<button class="btn btn-ghost" data-cancel>Cancel</button>
               <button class="btn ${kind==='danger'?'btn-danger':'btn-primary'}" data-ok>${esc(okLabel||'Confirm')}</button>`,
      onMount:(w) => {
        $('[data-ok]',w).onclick = () => { close(); resolve(true); };
        $('[data-cancel]',w).onclick = () => { close(); resolve(false); };
      }
    });
  });
}
function clearErrors(scope){ $$('.err-msg', scope).forEach(e => { e.classList.add('hide'); e.textContent=''; });
  $$('.inp.err', scope).forEach(e => e.classList.remove('err')); }
function setErr(id, msg, scope){
  const input = $('#'+id, scope||document); const err = $('[data-err="'+id+'"]', scope||document);
  if (input) input.classList.add('err');
  if (err){ err.textContent = msg; err.classList.remove('hide'); }
  return false;
}

/* ---------------- Idle timeout + logout (server session TTL matches, 10 min) ---------------- */
const IDLE_LIMIT_MS = 30 * 60 * 1000;   // 057: the server session is 30 minutes too
let idleTimer = null;
function resetIdleTimer(){
  if (!S) return;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { logout('Signed out after 30 minutes of inactivity.'); }, IDLE_LIMIT_MS);
}
['click','keydown','mousemove','touchstart'].forEach(evt =>
  document.addEventListener(evt, () => resetIdleTimer(), { passive:true }));


async function logout(reason){
  try { await api('/webhook/auth/api/logout', { method:'POST' }); } catch(e) { /* best effort */ }
  if (idleTimer) clearTimeout(idleTimer);
  if (typeof stopPolling === 'function') stopPolling();
  if (reason) { try { sessionStorage.setItem('okl.notice', reason); } catch(e) { /* ignore */ } }
  toLanding();
}

/* ---------------- Routing (ported from QSync's app.js) ---------------- */
const ROUTES = [];
function route(pattern, handler){ ROUTES.push({ pattern, handler }); }
function currentPath(){ return (location.hash || '#/').slice(1) || '/'; }
function go(path){ location.hash = '#' + path; }
function matchRoute(path){
  for (const r of ROUTES){
    const pp = r.pattern.split('/').filter(Boolean);
    const cp = path.split('?')[0].split('/').filter(Boolean);
    if (pp.length !== cp.length) continue;
    const params = {}; let ok = true;
    for (let i=0;i<pp.length;i++){
      if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(cp[i]);
      else if (pp[i] !== cp[i]) { ok = false; break; }
    }
    if (ok) return { ...r, params };
  }
  return null;
}

/* ---------------- Navigation model ---------------- */
function navModel(){
  return [
    { title:'System', items:[
      { path:'/audit', label:'Audit trail', icon:'history' },
      { path:'/version', label:'System version', icon:'settings' },
    ] },
    { title:'Help', items:[ { path:'/help', label:'How to use', icon:'info' } ] },
  ];
}

/* ---------------- Shell ---------------- */
function allowedNav(){
  return navModel().map(g => Object.assign({}, g, { items: g.items.filter(it => canOpen(it.path)) })).filter(g => g.items.length);
}
function renderShell(inner, meta){
  const path = currentPath().split('?')[0];
  const navHtml = allowedNav().map(g => `
    <div class="nav-group">${esc(g.title)}</div>
    ${g.items.map(it => {
      const active = path === it.path || path.startsWith(it.path + '/');
      return `<a class="nav-item ${active?'active':''}" href="#${it.path}">
        <span class="ic">${I[it.icon]}</span><span>${esc(it.label)}</span>${it.count ? waitBadge(it.count()) : ''}</a>`;
    }).join('')}`).join('');

  return `
  <div class="shell">
    <div class="backdrop" onclick="document.body.classList.remove('nav-open')"></div>
    <aside class="sidebar">
      <div class="sidebar-top">
        <a href="#/" style="display:flex;flex-direction:column;align-items:flex-start;gap:7px;text-decoration:none">
          <span class="brand-img"><img src="../logo.png" alt="Orange Kalbe Limited"></span><span class="brand-name">ORANGE KALBE LIMITED</span>
        </a>
        <button class="btn-icon hide-lg" style="color:var(--nav-text-dim)" onclick="document.body.classList.remove('nav-open')" aria-label="Close menu">${I.x}</button>
      </div>
      <div style="padding:0 16px 10px">
        <div style="font-size:13px;font-weight:700;color:#fff;letter-spacing:.02em">System</div>
      </div>
      <div class="sidebar-scroll">${navHtml}</div>
      <!-- Home, My profile, Phone/Laptop and Sign out: the bar at the top right (shared.js) -->
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="btn-icon menu-btn" onclick="document.body.classList.add('nav-open')" aria-label="Open menu">${I.menu}</button>
        <a href="#/" class="only-mobile" style="line-height:0" aria-label="Home"><span style="display:flex;align-items:center;gap:8px"><img src="../logo.png" alt="Orange Kalbe Limited" style="height:30px;width:auto;display:block">
            <span style="font-size:9.5px;font-weight:700;letter-spacing:.12em;color:var(--text-2);line-height:1.15">ORANGE KALBE<br>LIMITED</span></span></a>
        <div style="min-width:0">
          <div class="crumb">${esc(meta.crumb||'')}</div>
          <div class="ttl">${esc(meta.title||'')}</div>
        </div>
        <div class="spacer"></div>
      </header>
      <main class="content">${inner}</main>
    </div>
  </div>`;
}
function pageHead(title, sub, actions){
  return `<div class="page-head">
    <div class="row between">
      <div style="min-width:0"><h1>${esc(title)}</h1>${sub?`<p>${sub}</p>`:''}</div>
      <div class="row no-print">${actions||''}</div>
    </div>
  </div>`;
}
function emptyState(icon, title, msg, action){
  return `<div class="empty"><div class="em-ic">${I[icon]||I.info}</div>
    <h4>${esc(title)}</h4><div class="small">${msg||''}</div>
    ${action?`<div style="margin-top:14px">${action}</div>`:''}</div>`;
}
function notFound(){
  return `<div class="card"><div class="card-b">${emptyState('alert','Page not found','That link may be out of date.',
    `<button class="btn btn-primary" onclick="go('/')">Back to console home</button>`)}</div></div>`;
}
function fatalErrorHtml(err){
  return `<div style="max-width:520px;margin:60px auto;padding:0 16px;font-family:system-ui,sans-serif">
    <div style="background:#fff;border:1px solid #F5C6C2;border-radius:12px;padding:24px;text-align:center">
      <h2 style="color:#B3261E;margin:0 0 10px">Something went wrong loading the console</h2>
      <p style="color:#565E6B;font-size:13.5px">${esc((err && err.message) || String(err))}</p>
      <button style="margin-top:14px;padding:10px 20px;background:#ED6B1F;color:#fff;border:none;border-radius:6px;cursor:pointer"
        onclick="location.reload()">Reload</button>
    </div></div>`;
}


/* ---------------- Boot / bootstrap / render ---------------- */
async function bootstrap(){
  const st = await oklMe.start(api, getToken());   // startup.js: the kept "who am I" lets the page load its data at once
  const auth = st.auth;
  if (auth.user && auth.user.must_change){ rememberHere(); toLandingKeepToken(); throw new Error('Password change required'); }
  S = { me: meFromAuth(auth, 'self'), audit: null, open: {}, version: null, files: null };
  resetIdleTimer();
  oklMe.follow(st, a => { if (a.user && a.user.must_change){ rememberHere(); toLandingKeepToken(); return; } if (S){ S.me = meFromAuth(a, 'self'); render(); } });
}
function render(){
  const app = document.getElementById('app');
  try {
    if (!S){ toLanding(); return; }
    const path = currentPath();
    if (!canOpen(path)){
      const first = (allowedNav().find(g => g.title !== 'Mine') || allowedNav()[0]);
      if (first && first.items[0].path !== path.split('?')[0]) { location.hash = '#' + first.items[0].path; return; }
      if (!first) { noAccess(); return; }
    }
    const m = matchRoute(path);
    if (!m){
      // a link to a page that does not exist (an old e-mail, a typo): open this console's home page and say so, not a dead end
      if (path.split('?')[0] !== '/' && !window.__oklLost) { window.__oklLost = true; try { toast('That link is out of date', 'Opened the home page instead.', 'warn', 6000); } catch (e) { /* ignore */ } location.hash = '#/'; return; }
      app.innerHTML = renderShell(notFound(), { title:'Not found', crumb:'' });
      return;
    }
    let out;
    try { out = m.handler(m.params); }
    catch (err){
      console.error(err);
      out = { title:'Something went wrong', crumb:'', html:`<div class="card"><div class="card-b">
        ${emptyState('alert','Something went wrong on this screen', esc(err.message),
          `<button class="btn btn-primary" onclick="go('/')">Back to console home</button>`)}</div></div>` };
    }
    const typed = window.oklFormKeep ? oklFormKeep.take(app, path) : null;   // what is being typed survives the draw (formkeep.js)
    app.innerHTML = renderShell(out.html, out);
    document.body.classList.remove('nav-open');
    if (out.bind) { try { out.bind(); } catch(e){ console.error(e); } }
    if (typed) oklFormKeep.put(typed, app, path);
    window.oklScrollAfterRender(path);
  } catch (err) {
    console.error(err);
    app.innerHTML = fatalErrorHtml(err);
  }
}
window.addEventListener('hashchange', render);

(async function boot(){
  try {
    if (!getToken()){ rememberHere(); toLanding(); return; }
    try { await bootstrap(); }
    catch (e) { if (!getToken()) return; if (e && e.status === 403) { noAccess(); return; } rememberHere(); toLandingKeepToken(); return; }
    if (!location.hash) location.hash = canView('system.audit') ? '#/audit' : '#/version';
    render();
  } catch (err) {
    console.error(err);
    const app = document.getElementById('app');
    if (app) app.innerHTML = fatalErrorHtml(err);
  }
})();

/* ============================================================
   System (083, 16 Nov 2026): what auditors and the validation team look at.
   Audit trail: every recorded change in every module, one line per change of a record, with who, when, why and each field
   before / after (okl_sys_audit_list). System version: what is installed, for the installation record (okl_sys_version),
   with a fingerprint of every screen file worked out here in the browser.
   ============================================================ */
const LAGOS = { timeZone: 'Africa/Lagos' };
function fmtWhen(iso){
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', Object.assign({ day: '2-digit', month: 'short', year: 'numeric' }, LAGOS)) + ' '
    + d.toLocaleTimeString('en-GB', Object.assign({ hour: '2-digit', minute: '2-digit', second: '2-digit' }, LAGOS));
}
function lagosDay(offsetDays){
  const d = new Date(Date.now() + (offsetDays || 0) * 86400000);
  return d.toLocaleDateString('en-CA', LAGOS);   // YYYY-MM-DD
}
const info = (t, l) => (window.oklInfo ? oklInfo(t, l) : '');

/* ---------------- Audit trail ---------------- */
const AUDIT_ACTION = { insert: 'Added', update: 'Changed', delete: 'Removed' };
function auditFilters(){
  if (!S.af) S.af = { module: '', q: '', from: lagosDay(-6), to: lagosDay(0) };
  return S.af;
}
function auditQuery(limit){
  const f = auditFilters();
  const p = new URLSearchParams({ module: f.module, q: f.q, from: f.from, to: f.to, limit: String(limit || 500) });
  return '/webhook/okl/audit?' + p.toString();
}
async function auditLoad(){
  try { S.audit = await api(auditQuery(500)); }
  catch (e) { S.audit = { error: e.message }; }
  render();
}
function auditBy(e){
  const sys = e.source === 'system' || /^System: /.test(e.by || '');
  const db = e.source === 'database';
  return `${esc(e.by || '--')}${sys ? ' <span class="badge b-slate" title="An automatic job, not a person">automatic</span>' : ''}${db
    ? ' <span class="badge b-warn" title="Changed straight in the database, not from a console page">database</span>' : ''}`;
}
function auditWhole(txt){
  // a record added or removed: its values, as "field: value" lines
  let o = null; try { o = JSON.parse(txt); } catch (e) { /* not JSON: show as it is */ }
  if (!o || typeof o !== 'object') return `<div class="small mono" style="white-space:pre-wrap">${esc(txt || '--')}</div>`;
  return `<table class="tbl"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>${Object.entries(o).map(([k, v]) =>
    `<tr><td class="mono small">${esc(k)}</td><td class="small" style="white-space:pre-wrap;word-break:break-word">${esc(v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : v))}</td></tr>`).join('')}</tbody></table>`;
}
// 21 Nov 2026 (user): a line with nothing behind it has no "Show" button (no opening onto "--")
function auditHasDetail(e){
  if (e.action === 'insert' || e.action === 'delete') return !!(e.whole && String(e.whole).trim() && String(e.whole).trim() !== '{}');
  return (e.changes || []).length > 0 || !!(e.whole && String(e.whole).trim());
}
function auditDetail(e){
  if (e.action === 'insert' || e.action === 'delete') return auditWhole(e.whole);
  const ch = e.changes || [];
  if (!ch.length) return `<div class="small muted">${esc(e.whole || 'No field details.')}</div>`;
  return `<table class="tbl"><thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead><tbody>${ch.map(c =>
    `<tr><td class="mono small">${esc(c.field || '--')}</td><td class="small" style="white-space:pre-wrap;word-break:break-word">${esc(c.old == null ? '--' : c.old)}</td>`
    + `<td class="small" style="white-space:pre-wrap;word-break:break-word">${esc(c.new == null ? '--' : c.new)}</td></tr>`).join('')}</tbody></table>`;
}
function viewAudit(){
  const f = auditFilters();
  if (!S.audit) { S.audit = 'loading'; auditLoad(); }
  const d = S.audit, ready = d && d !== 'loading' && !d.error;
  const mods = (ready && d.modules) || ['Engineering', 'Production', 'HR', 'Procurement', 'QSync', 'Access and sign-in'];
  const filters = `<div class="card" style="margin-bottom:14px"><div class="card-b">
    <form id="auFilters" class="row" style="flex-wrap:wrap;gap:10px;align-items:flex-end">
      <div class="field" style="min-width:170px"><label for="auModule">Module</label><select class="inp" id="auModule"><option value="">All modules</option>
        ${mods.map(m => `<option value="${esc(m)}" ${m === f.module ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select></div>
      <div class="field"><label for="auFrom">From</label><input class="inp" type="date" id="auFrom" value="${esc(f.from)}"></div>
      <div class="field"><label for="auTo">To</label><input class="inp" type="date" id="auTo" value="${esc(f.to)}"></div>
      <div class="field" style="flex:1;min-width:200px"><label for="auQ">Search</label><input class="inp" id="auQ" autocomplete="off" value="${esc(f.q)}" placeholder="A record, a person, a value..."></div>
      <button class="btn btn-primary" type="submit">${I.search} Show</button>
      <button class="btn btn-ghost" type="button" id="auExport">${I.download} Export (Excel CSV)</button>
    </form>
    <div class="err-msg hide" data-err="auFilters"></div></div></div>`;
  let body;
  if (!ready) body = d && d.error ? `<div class="notice warn">${I.alert}<div>${esc(d.error)}</div></div>` : `<div class="card"><div class="card-b small muted">Loading the audit trail...</div></div>`;
  else if (!d.events.length) body = `<div class="card"><div class="card-b">${emptyState('history', 'Nothing recorded', 'No change matches these filters. Widen the dates or clear the search.')}</div></div>`;
  else {
    const rows = d.events.map((e, i) => {
      const key = e.log + ':' + e.id, open = !!S.open[key];
      const n = e.action === 'update' ? (e.changes || []).length : 0;
      const what = e.action === 'update' ? (n === 1 ? '1 field' : n + ' fields') : 'whole record';
      return `<tr>
        <td class="small" style="white-space:nowrap">${esc(fmtWhen(e.at))}</td>
        <td class="small">${esc(e.module)}</td>
        <td><div class="strong small">${esc(e.what)}</div><div class="small mono muted" style="word-break:break-word">${esc(e.record || '')}</div></td>
        <td class="small">${esc(AUDIT_ACTION[e.action] || e.action)}</td>
        <td class="small">${auditBy(e)}</td>
        <td class="small" style="max-width:220px;word-break:break-word">${esc(e.reason || '')}</td>
        <td>${auditHasDetail(e) ? `<button class="btn btn-ghost btn-sm" type="button" data-au-open="${esc(key)}">${open ? 'Hide' : 'Show'} ${esc(what)}</button>` : ''}</td>
      </tr>${open && auditHasDetail(e) ? `<tr class="au-sub"><td colspan="7" style="background:var(--surface-2,#F7F8FA)">${auditDetail(e)}</td></tr>` : ''}`;
    }).join('');
    const more = d.total > d.shown ? `<div class="notice" style="margin-bottom:10px">${I.info}<div>Showing the latest <b>${d.shown}</b> of <b>${d.total}</b> changes. Narrow the dates, pick a module or search to see older ones. Export takes up to 5,000.</div></div>` : '';
    body = more + `<div class="card"><div class="card-h"><div><h3>${d.total} change${d.total === 1 ? '' : 's'}, ${esc(fmtDay(d.from))} to ${esc(fmtDay(d.to))}</h3>
      <div class="sub">Newest first. One line per change of a record; "Show" lists each field before and after.</div></div></div>
      <div class="tbl-wrap"><table class="tbl" id="auTable"><thead><tr><th>When (Lagos)</th><th>Module</th><th>What</th><th>Action</th>
        <th>By ${info('Who made the change: the signed-in person. "automatic" is a job with no person (the weekly count plan, the daily production report...). "database" means it was changed straight in the database, outside the console pages.', 'Who')}</th>
        <th>Reason ${info('The reason the person typed when the system asked for one (a void, a recall, a correction). Empty when none was asked.', 'Reason')}</th>
        <th>Details</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }
  return { title: 'Audit trail', crumb: 'System', html: pageHead('Audit trail', 'Every recorded change in every module: who, when, why, and each field before and after. Nothing here can be changed or removed.') + filters + body,
    bind(){
      const form = $('#auFilters');
      if (form) form.onsubmit = ev => {
        ev.preventDefault(); clearErrors(form.parentNode);
        const nf = { module: $('#auModule').value, q: $('#auQ').value.trim(), from: $('#auFrom').value, to: $('#auTo').value };
        if (!nf.from || !nf.to) return setErr('auFilters', 'Pick both days.', form.parentNode);
        if (nf.from > nf.to) return setErr('auFilters', 'The "From" day is after the "To" day.', form.parentNode);
        S.af = nf; S.open = {}; S.audit = null; render();
      };
      const ex = $('#auExport'); if (ex) ex.onclick = auditExport;
      $$('[data-au-open]').forEach(b => b.onclick = () => { const k = b.getAttribute('data-au-open'); S.open[k] = !S.open[k]; render(); });
    } };
}
function fmtDay(iso){
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
function csvCell(v){ const s = v == null ? '' : String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
async function auditExport(){
  let d;
  try { d = await api(auditQuery(5000)); } catch (e) { toast('Export failed', e.message, 'err'); return; }
  const lines = [['When (Lagos)', 'Module', 'What', 'Record', 'Action', 'By', 'Source', 'Reason', 'Field', 'Before', 'After']];
  for (const e of d.events || []) {
    const base = [fmtWhen(e.at), e.module, e.what, e.record, AUDIT_ACTION[e.action] || e.action, e.by, e.source, e.reason || ''];
    if (e.action === 'update' && (e.changes || []).length) for (const c of e.changes) lines.push(base.concat([c.field, c.old, c.new]));
    else lines.push(base.concat(['(whole record)', e.action === 'delete' ? e.whole : '', e.action === 'insert' ? e.whole : (e.action === 'delete' ? '' : e.whole)]));
  }
  const blob = new Blob(['﻿' + lines.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `OKL_audit_trail_${d.from}_to_${d.to}${d.module ? '_' + d.module.replace(/\W+/g, '_') : ''}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  toast('Exported', `${(d.events || []).length} change(s)${d.total > (d.events || []).length ? ' of ' + d.total + ' (narrow the dates for the rest)' : ''}.`, 'ok');
}
route('/audit', viewAudit);
route('/', viewAudit);

/* ---------------- System version ---------------- */
// the screen files every console loads; their fingerprints are worked out here (SHA-256 of the file as the browser gets it)
const SCREEN_FILES = ['index.html', 'shared.js', 'scrollkeep.js', 'startup.js', 'keepalive.js', 'formkeep.js', 'tablesort.js', 'pager.js', 'waiting.js', 'requests.js', 'testrequest.js',
  'engineering/app.js', 'employees/app.js', 'procurement/app.js', 'production/app.js', 'production/store.js', 'production/report.html',
  'qsync/app.js', 'qsync/lab.js', 'qsync/dept.js', 'qsync/apqr.js', 'users/app.js', 'profile/app.js', 'requests/app.js', 'datacenter/index.html', 'system/app.js', 'pwa.js', 'sw.js', 'manifest.json'];
async function fingerprint(url){
  try {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) return { status: r.status };
    const buf = await r.arrayBuffer();
    const h = await crypto.subtle.digest('SHA-256', buf);
    return { hash: Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join(''), bytes: buf.byteLength };
  } catch (e) { return { error: e.message }; }
}
async function versionLoad(){
  try { S.version = await api('/webhook/okl/version'); } catch (e) { S.version = { error: e.message }; }
  render();
  const out = {};
  for (const f of SCREEN_FILES) out[f] = await fingerprint(new URL('../' + f, location.href).href);
  S.files = out; render();
}
function kv(k, v){ return `<tr><td class="small muted" style="width:38%">${k}</td><td class="small" style="word-break:break-all">${v}</td></tr>`; }
function viewVersion(){
  if (!S.version) { S.version = 'loading'; S.files = null; versionLoad(); }
  const d = S.version, ready = d && d !== 'loading' && !d.error;
  const actions = `<button class="btn btn-ghost btn-sm" type="button" id="vrReload">Check again</button> <button class="btn btn-primary btn-sm" type="button" onclick="window.print()">${I.printer} Print</button>`;
  if (!ready) return { title: 'System version', crumb: 'System', html: pageHead('System version', '') + (d && d.error ? `<div class="notice warn">${I.alert}<div>${esc(d.error)}</div></div>`
    : `<div class="card"><div class="card-b small muted">Reading what is installed...</div></div>`) };
  const db = d.database, au = d.audit, migs = db.migrations || [];
  const kept = migs.filter(m => m.applied_at);
  const dbCard = `<div class="card"><div class="card-h"><div><h3>Database ${info('The OKL database: its name, the PostgreSQL version and the last change (migration) installed. A fingerprint is a short code worked out from the installed code or structure: it changes when anything in it changes, so compare it with the one recorded at validation.', 'Database')}</h3></div></div>
    <div class="card-b"><table class="tbl"><tbody>
      ${kv('Database', esc(db.name))}${kv('PostgreSQL', esc(db.postgres))}
      ${kv('Last migration installed', `<b>${esc(db.last_migration || '--')}</b>`)}
      ${kv('Database functions', `${esc(db.functions.count)} &middot; fingerprint <span class="mono">${esc(db.functions.fingerprint)}</span>`)}
      ${kv('Tables', `${esc(db.tables.count)} &middot; fingerprint <span class="mono">${esc(db.tables.fingerprint)}</span>`)}
      ${kv('Triggers (audit trail, no-delete rules...)', `${esc(db.triggers.count)} &middot; fingerprint <span class="mono">${esc(db.triggers.fingerprint)}</span>`)}
      ${kv('Checked', esc(fmtWhen(d.checked_at)))}
    </tbody></table></div></div>`;
  const without = au.writers_without || [];
  const auCard = `<div class="card"><div class="card-h"><div><h3>Audit trail coverage ${info('The tables whose every change is recorded, and the database functions that change them. Each such function must say who is acting (the signed-in person, or "System: <job>" for an automatic job). All of them should.', 'Audit trail coverage')}</h3></div></div>
    <div class="card-b"><table class="tbl"><tbody>
      ${kv('Tables recorded', esc(au.tables))}
      ${kv('Functions that change them', esc(au.writers))}
      ${kv('...that say who is acting', `${esc(au.writers_naming_actor)}${without.length ? '' : ' <span class="badge b-ok">all that should</span>'}`)}
      ${without.length ? kv('Not saying who', `<span class="badge b-danger">${without.length}</span> <span class="mono small">${esc(without.join(', '))}</span>`) : ''}
    </tbody></table></div></div>`;
  const wf = d.workflows || [];
  const wfCard = `<div class="card" style="margin-top:14px"><div class="card-h"><div><h3>Workflows (n8n) ${info('The automations behind the consoles. Version changes every time a workflow is saved; Published is the version that runs. The fingerprint is worked out from its steps and links.', 'Workflows')}</h3>
      <div class="sub">${d.workflows_here ? wf.length + ' OKL and QSync workflows, ' + wf.filter(w => w.active).length + ' switched on.' : 'Not readable here: this copy of the system keeps its workflows elsewhere (the TEST environment). In production they are listed here.'}</div></div></div>
    ${wf.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Workflow</th><th>On</th><th>Version</th><th>Published</th><th>Saves</th><th>Last saved</th><th>Fingerprint</th></tr></thead><tbody>
      ${wf.map(w => `<tr><td class="small strong">${esc(w.name)}<div class="mono muted" style="font-size:11px">${esc(w.id)}</div></td><td class="small">${w.active ? 'Yes' : 'No'}</td>
        <td class="mono" style="font-size:11px">${esc(String(w.version || '').trim())}</td><td class="mono" style="font-size:11px">${esc(w.published || '--')}</td>
        <td class="small">${esc(w.saves ?? '--')}</td><td class="small">${esc(fmtWhen(w.updated_at))}</td><td class="mono" style="font-size:11px">${esc(w.fingerprint)}</td></tr>`).join('')}
    </tbody></table></div>` : ''}</div>`;
  const fs = S.files;
  const scCard = `<div class="card" style="margin-top:14px"><div class="card-h"><div><h3>Screens ${info('The files the browser loads for each console, as served now. The fingerprint (SHA-256) changes when a file changes.', 'Screens')}</h3>
      <div class="sub">${fs ? 'Worked out in this browser just now.' : 'Working out the fingerprints...'}</div></div></div>
    ${fs ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>File</th><th>Size</th><th>Fingerprint (SHA-256)</th></tr></thead><tbody>
      ${SCREEN_FILES.map(f => { const x = fs[f] || {}; return `<tr><td class="mono small">${esc(f)}</td><td class="small">${x.bytes != null ? (x.bytes / 1024).toFixed(1) + ' KB' : '--'}</td>
        <td class="mono" style="font-size:11px;word-break:break-all">${x.hash ? esc(x.hash) : `<span class="muted">${x.status === 404 ? 'not in this version' : esc(x.error || ('could not read (' + x.status + ')'))}</span>`}</td></tr>`; }).join('')}
    </tbody></table></div>` : ''}</div>`;
  const mgCard = `<div class="card" style="margin-top:14px"><div class="card-h"><div><h3>Migrations installed (${migs.length}) ${info('Each migration is one numbered change to the database, kept in the repository. Those run before 16 Nov 2026 (082) have no date: the list was started then.', 'Migrations')}</h3>
      <div class="sub">${kept.length} with the date they were installed; ${migs.length - kept.length} installed before the list was kept.</div></div></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Migration</th><th>Installed</th><th>By</th></tr></thead><tbody>
      ${migs.slice().reverse().map(m => `<tr><td class="mono small">${esc(m.file)}</td><td class="small">${m.applied_at ? esc(fmtWhen(m.applied_at)) : '<span class="muted">before 16 Nov 2026</span>'}</td><td class="small">${esc(m.applied_at ? m.applied_by : '')}</td></tr>`).join('')}
    </tbody></table></div></div>`;
  return { title: 'System version', crumb: 'System',
    html: pageHead('System version', 'What is installed now: the database, the workflows and the screens. Print it for the installation record (IQ); a fingerprint that differs from the one recorded means something changed.', actions)
      + `<div class="grid g2">${dbCard}${auCard}</div>` + wfCard + scCard + mgCard,
    bind(){ const b = $('#vrReload'); if (b) b.onclick = () => { S.version = null; render(); }; } };
}
route('/version', viewVersion);

const SY_HELP = [
  ['history', 'Audit trail (all modules)', [
    'Menu > <b>Audit trail</b>. Every change recorded in Engineering, Production, HR, Procurement, QSync and sign-in / access, newest first: when, what, who and why.',
    'Pick a module, the days (one year at most) or search a record, a person or a value, then <b>Show</b>. <b>Show N fields</b> on a line lists each field before and after; a record added or removed shows all its values.',
    '<b>By</b> is the signed-in person. "automatic" is a job with no person (for example the weekly count plan or the daily production report). "database" means it was changed straight in the database, outside the console.',
    '<b>Export</b> gives an Excel (CSV) file with one row per field changed, up to 5,000 changes. Nothing on this page can be changed or removed.']],
  ['settings', 'System version (installation record)', [
    'Menu > <b>System version</b>: the database (its last migration and fingerprints), whether every change says who made it, the workflows and the screen files.',
    'A <b>fingerprint</b> is a short code worked out from the installed code: it changes when anything changes. Record them at validation; later, a different fingerprint means a change that must have gone through change control.',
    '<b>Print</b> it for the installation record (IQ). <b>Check again</b> reads everything afresh.']],
  ['info', 'Phone or laptop', [
    'The small <b>Phone view / Laptop view</b> green button at the top right of the screen switches the layout. It starts from your screen and is remembered on this device.']],
  ['edit', 'Suggestions', [
    'The orange <b>Suggestions</b> button at the bottom right of every page lets you tell us what is wrong or missing. Tap it, write a line or two about what is confusing, slow or missing on that page, and send.',
    'It goes to the system team only. It changes nothing in the system.']],
];
// How to use shows a card only to people who can open its page; `true` = everyone here (workflow/tests/help_cards_test.js)
const SY_HELP_PAGE = { 'Audit trail (all modules)': '/audit', 'System version (installation record)': '/version', 'Phone or laptop': true, 'Suggestions': true };
const SY_HELP_MINE = () => SY_HELP.filter(h => { const g = SY_HELP_PAGE[h[1]]; return g === true || (!!g && canOpen(g)); });
function viewSyHelp(){
  return { title:'How to use', crumb:'Help', html: pageHead('How to use', 'The short version of each task.')
    + `<div class="grid g2">${SY_HELP_MINE().map(([ic, t, steps]) => `<div class="card"><div class="card-h"><div><h3>${I[ic] || ''} ${esc(t)}</h3></div></div>
        <div class="card-b"><ol class="small" style="margin:0;padding-left:18px;line-height:1.55">${steps.map(x => `<li style="margin-bottom:4px">${x}</li>`).join('')}</ol></div></div>`).join('')}</div>` };
}
route('/help', viewSyHelp);

function waitBadge(n){ return n ? `<span class="nav-count" style="margin-left:auto;min-width:20px;padding:1px 7px;border-radius:10px;background:var(--brand);color:#fff;font-size:11px;font-weight:700;text-align:center">${n > 99 ? '99+' : n}</span>` : ''; }
