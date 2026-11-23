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
// 11 Nov 2026: My approvals (and How to use) need only the console: the list is the person's own (the server asks only for a sign-in).
// Data center (062; a console since 23 Nov 2026): the spreadsheets for everyone the server lets in; Backup for admins only.
function canOpen(path){ return !!(S && S.me) && (String(path || '').split('?')[0] !== '/backup' || !!S.me.is_admin); }

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
    { title:'Data', items:[ { path:'/', label:'Spreadsheets', icon:'box' } ] },
    { title:'Admin', items:[ { path:'/backup', label:'Google Sheets backup', icon:'settings' } ] },
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
        <div style="font-size:13px;font-weight:700;color:#fff;letter-spacing:.02em">Data center</div>
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
  S = { me: meFromAuth(auth, 'datacenter'), dc: null };
  dcLoad();
  resetIdleTimer();
  oklMe.follow(st, a => { if (a.user && a.user.must_change){ rememberHere(); toLandingKeepToken(); return; } if (S){ S.me = meFromAuth(a, 'datacenter'); render(); } });
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
    if (!location.hash) location.hash = '#/';
    render();
  } catch (err) {
    console.error(err);
    const app = document.getElementById('app');
    if (app) app.innerHTML = fatalErrorHtml(err);
  }
})();

/* ============================================================
   Data center (062, 12 Nov 2026; a console like the others since 23 Nov 2026): the Google Sheets copies of the system's
   data, view only. Admins: every spreadsheet, the copy's status and "Sync data now" (Google Sheets backup). Managers (the
   Data center page in Users): the spreadsheets of the consoles they can open. The data lives in Postgres; the sheets are
   written again every 6 hours (00:07, 06:07, 12:07, 18:07).
   Server: okl/api/datacenter, okl/api/sheets/sync (POST, admins).
   ============================================================ */
const DC_API = '/webhook/okl/api/';
let dcBusy = false, dcPoll = null, dcNotice = '';
async function dcLoad(){
  try { S.dc = await api(DC_API + 'datacenter'); dcNotice = ''; }
  catch (e) { S.dc = { error: e.status === 403 ? 'The Data center is for admins and managers. Ask an admin to give you the Data center page in Users.' : e.message, denied: e.status === 403 }; }
  if (S.dc && !S.dc.error && S.me) S.me.is_admin = S.me.is_admin || !!S.dc.is_admin;
  render();
}
function dcWhen(ts){
  if (!ts) return '--';
  const d = new Date(ts); if (isNaN(d)) return '--';
  return d.toLocaleString('en-GB', { timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function dcWait(){
  const d = S.dc;
  if (!d) return `<div class="card"><div class="card-b small muted">Loading...</div></div>`;
  if (d.error) return `<div class="notice ${d.denied ? 'warn' : 'danger'}">${I.alert}<div>${esc(d.error)}</div></div>`;
  return '';
}
const DC_SUB = 'The system\'s data as Google Sheets, to look at, filter and download. They are <b>view only</b>: every sheet is written again from the system <b>every 6 hours</b> (00:07, 06:07, 12:07 and 18:07), so anything typed into a sheet is lost. Change things in the consoles.';

function viewSheets(){
  const wait = dcWait();
  if (wait) return { title:'Spreadsheets', crumb:'Data center', html: pageHead('Spreadsheets', DC_SUB) + wait };
  const files = S.dc.files || [], depts = [];
  files.forEach(f => { let g = depts.find(x => x.name === f.department); if (!g) depts.push(g = { name: f.department, files: [] }); g.files.push(f); });
  const body = !files.length ? `<div class="card"><div class="card-b">${emptyState('box', 'No spreadsheets yet', 'None of your consoles has a spreadsheet yet.')}</div></div>`
    : depts.map(g => `<div class="card"><div class="card-h"><div><h3>${esc(g.name)}</h3><div class="sub">${g.files.length} spreadsheet${g.files.length === 1 ? '' : 's'}</div></div></div>
        <div class="card-b"><div class="grid g2">${g.files.map(f => `<div style="border:1px solid var(--line);border-radius:var(--r-sm);padding:14px 16px">
            <div class="strong">${esc(f.title)}</div><div class="tiny muted" style="margin:4px 0 10px;line-height:1.5">${(f.tabs || []).map(esc).join(' &middot; ')}</div>
            ${f.url ? `<a class="btn btn-ghost btn-sm" href="${esc(f.url)}" target="_blank" rel="noopener">${I.externalLink} Open (view only)</a>` : `<span class="badge b-warn">Not set up yet</span>`}</div>`).join('')}</div></div></div>`).join('');
  return { title:'Spreadsheets', crumb:'Data center', html: pageHead('Spreadsheets', DC_SUB) + body };
}

function viewBackup(){
  const wait = dcWait();
  if (wait) return { title:'Google Sheets backup', crumb:'Admin', html: pageHead('Google Sheets backup', '') + wait };
  const st = S.dc.status || {}, last = st.last, x = st.last_xlsx;
  const lastTxt = !last ? '<span class="muted">Not run yet</span>'
    : (last.ok ? '<span class="badge b-ok">Done</span>' : `<span class="badge b-danger">Failed for ${(last.failed || []).length} spreadsheet(s)</span>`);
  const stat = (lbl, val, meta) => `<div class="stat"><div class="lbl">${lbl}</div><div class="val" style="font-size:18px">${val}</div><div class="meta">${meta || ''}</div></div>`;
  const fails = last && !last.ok ? `<div class="notice danger" style="margin-top:12px">${I.alert}<div>${(last.failed || []).map(f => esc(f.file) + ': ' + esc(f.error)).join('<br>')}</div></div>` : '';
  const notSet = (st.not_set_up || []).length ? `<div class="notice warn" style="margin-bottom:12px">${I.alert}<div>Not set up yet: ${st.not_set_up.map(esc).join(', ')}. Create the spreadsheet in the OKL Data folder and send its link to be added.</div></div>` : '';
  const html = pageHead('Google Sheets backup', 'The copy of the system\'s data into the spreadsheets, and the nightly Excel files. Admins only.',
      `<button class="btn btn-primary" id="syncNow" ${dcBusy ? 'disabled' : ''}>${dcBusy ? 'Copying... (a minute or two)' : 'Sync data now'}</button>`)
    + (dcNotice ? `<div class="notice warn" style="margin-bottom:12px">${I.alert}<div>${esc(dcNotice)}</div></div>` : '') + notSet
    + `<div id="status"><div class="grid g4" style="margin-bottom:14px">
        ${stat('Last copy', lastTxt, esc(dcWhen(last && last.at)) + (last && last.trigger === 'manual' ? ', Sync data now' : ''))}
        ${stat('Last good copy', esc(dcWhen(st.last_ok_at)))}
        ${stat('Clean days in a row', esc(st.clean_days == null ? '--' : st.clean_days))}
        ${stat('Nightly Excel files', !x ? '<span class="muted">Not run yet</span>' : (x.ok ? '<span class="badge b-ok">Saved</span>' : '<span class="badge b-danger">Failed</span>'), esc(dcWhen(x && x.at)))}
      </div>${fails}
      <div class="card"><div class="card-b small muted">The copy runs by itself every 6 hours: 00:07, 06:07, 12:07 and 18:07. Use <b>Sync data now</b> only when you need the sheets up to date now: a full copy is heavy for the server.</div></div></div>`;
  return { title:'Google Sheets backup', crumb:'Admin', html, bind: () => { const b = $('#syncNow'); if (b) b.onclick = dcSync; } };
}
async function dcSync(){
  if (dcBusy) return;
  const before = S.dc && S.dc.status && S.dc.status.last ? S.dc.status.last.at : null;
  dcBusy = true; dcNotice = ''; render();
  try { await api(DC_API + 'sheets/sync', { method: 'POST', body: {} }); }
  catch (e) { dcBusy = false; dcNotice = e.message; render(); return; }
  let tries = 0;
  clearInterval(dcPoll);
  dcPoll = setInterval(async () => {
    tries++;
    try { const d = await api(DC_API + 'datacenter'); const at = d.status && d.status.last ? d.status.last.at : null;
          if (at && at !== before) { clearInterval(dcPoll); dcBusy = false; S.dc = d; dcNotice = d.status.last.ok ? '' : 'The copy finished with failures: see Last copy.'; render(); return; } } catch (e) { /* keep waiting */ }
    if (tries >= 60) { clearInterval(dcPoll); dcBusy = false; dcNotice = 'Still copying after 5 minutes: look again later (Last copy shows when it finishes).'; render(); }
  }, 5000);
}

function viewDcHelp(){
  const admin = !!(S.me && S.me.is_admin);
  const steps = [
    '<b>Spreadsheets</b> lists the spreadsheets of the consoles you can open, by department. <b>Open (view only)</b> opens one in Google Sheets: you need to be signed in to Google with an e-mail the admin has shared it with.',
    'Use filters, sorting and <b>File &gt; Download</b> as you like. Do not type into the sheets: every sheet is written again from the system every 6 hours (00:07, 06:07, 12:07, 18:07), so typed changes are lost. Change things in the consoles.',
    'A sheet can be up to 6 hours behind the consoles; the consoles are always up to date.'];
  if (admin) steps.push('<b>Google Sheets backup</b> (admins): when the last copy ran, whether any spreadsheet failed, and the nightly Excel files. <b>Sync data now</b> copies everything straight away; it is heavy for the server, so use it only when you need it.',
    'Every night each spreadsheet is also saved as an Excel file in the backup storage; the laptop backup pull brings them down (14 days kept).');
  return { title:'How to use', crumb:'Help', html: pageHead('How to use', 'The short version.')
    + `<div class="card"><div class="card-h"><div><h3>${I.box} The Data center</h3></div></div><div class="card-b"><ol class="small" id="helpList" style="margin:0;padding-left:18px;line-height:1.55">${steps.map(x => `<li style="margin-bottom:4px">${x}</li>`).join('')}</ol></div></div>` };
}
function waitBadge(n){ return ''; }
route('/', viewSheets);
route('/backup', viewBackup);
route('/help', viewDcHelp);
