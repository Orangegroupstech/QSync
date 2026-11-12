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
  try { sessionStorage.setItem('okl.notice', 'You do not have access to Production. Ask an admin if you need it.'); } catch(e) { /* ignore */ }
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
const PAGES = [["/my-approvals", "production"], ["/report", "production"], ["/", "production.requests"]];   // route prefix -> page, first match wins
function pageOf(path){
  const p = String(path == null ? currentPath() : path).split('?')[0];
  const hit = PAGES.find(([pre]) => pre === '/' ? p === '/' : (p === pre || p.startsWith(pre + '/')));
  return hit ? hit[1] : 'production.requests';
}
function canOpen(path){ return !!levelOf(pageOf(path)); }
function canEditHere(){ return levelOf(pageOf()) === 'edit'; }

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
    { title:'Mine', items:[ { path:'/my-approvals', label:'My approvals', icon:'check', count: () => oklWaiting.count('production') } ] },
    { title:'Requests', items:[
      { path:'/requests', label:'Make a procurement request', icon:'box' },
      { path:'/overtime', label:'Submit overtime', icon:'users' },
      { path:'/test', label:'Make a new test request', icon:'plus' },
    ] },
    { title:'Reports', items:[ { path:'/report', label:'Daily production report', icon:'externalLink' } ] },
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
        <div style="font-size:13px;font-weight:700;color:#fff;letter-spacing:.02em">Production</div>
      </div>
      <div class="sidebar-scroll">${navHtml}</div>
      <div class="sidebar-foot">
        <a class="btn btn-ghost btn-sm btn-block" style="margin-bottom:8px;border-color:rgba(255,255,255,.12);color:var(--nav-text)" href="../">${I.chevL} Back to home</a>
        <button class="btn btn-ghost btn-sm btn-block" style="margin-top:8px;border-color:rgba(255,255,255,.12);color:var(--nav-text)"
          onclick="logout()">${I.logout} Sign out</button>
      </div>
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
  S = { me: meFromAuth(auth, 'production'), rq: null };
  resetIdleTimer();
  oklMe.follow(st, a => { if (a.user && a.user.must_change){ rememberHere(); toLandingKeepToken(); return; } if (S){ S.me = meFromAuth(a, 'production'); render(); } });
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
    window.scrollTo({ top:0 });
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
    if (!location.hash) location.hash = '#/requests';
    render();
  } catch (err) {
    console.error(err);
    const app = document.getElementById('app');
    if (app) app.innerHTML = fatalErrorHtml(err);
  }
})();

/* ============================================================
   Production console (7 Nov 2026): for production supervisors. Only three things to do:
     Make a procurement request, Submit overtime (the shared forms in ../requests.js, the same as every console),
     and Make a new test request (the QSync request form; opens in QSync with the same sign-in).
   ============================================================ */
const PROD_DEPT = 'Production';
async function rqLoad(){ try { S.rq = await api('/webhook/production/api/requests'); } catch (e) { S.rq = { error: e.message }; } render(); }
function rqCfg(){
  const d = S.rq && !S.rq.error ? S.rq : {};
  return { api: API_BASE, department: PROD_DEPT, flow: 'dept', requester: (S.me && S.me.name) || d.me || '', icons: I,
           people: d.people || [], toast, onSent: () => { S.rq = null; render(); } };
}
const RQ_STAGE = { manager: 'Production Manager', plant_head: 'Plant Manager', hr: 'HR' };
function viewProdRequest(kind){
  if (!window.oklRequests) return { title:'Requests', crumb:'Requests', html: `<div class="card"><div class="card-b">${emptyState('alert', 'The forms did not load', 'Reload the page.')}</div></div>` };
  if (!S.rq) { S.rq = 'loading'; rqLoad(); }
  const d = S.rq, ready = d && d !== 'loading' && !d.error;
  const rows = !ready ? [] : kind === 'overtime'
    ? (d.overtime || []).map(o => ({ date: o.work_date, day_type: o.day_type, name: o.name || o.enroll_id, start: o.start, end: o.end, hours: o.hours, duty: o.duty, submitted_by: o.submitted_by }))
    : (d.requisitions || []).map(b => ({ batch_id: b.batch_id, created_at: b.created_at, requester: b.requester, requirement_date: b.requirement_date, decided: b.status === 'processed',
        status: b.status === 'processed' ? 'Decided' : 'With the ' + (RQ_STAGE[b.stage] || b.stage || 'approver'),
        items: (b.items || []).map(i => ({ material: i.material, detail: i.detail, qty: i.qty, status: i.status })) }));
  const pg = oklRequests.page(kind, Object.assign(rqCfg(), { lede: kind === 'overtime'
    ? 'Overtime worked by Production staff, to the HR overtime log. The HR Manager is told of the day\'s submissions at midday.' : undefined }), rows);
  const err = d && d.error ? `<div class="notice warn" style="margin-top:14px">${I.alert}<div>Could not load your department: ${esc(d.error)}</div></div>` : '';
  return { title: pg.title, crumb:'Requests', keepScroll: true, html: pageHead(pg.title, pg.lede) + pg.html + err, bind: pg.bind };
}
route('/requests', () => viewProdRequest('item'));
route('/overtime', () => viewProdRequest('overtime'));
route('/', () => viewProdRequest('item'));

// Make a new test request: the same form as QSync (frontend/testrequest.js), served here. The server needs "submit" on Test requests (Users console).
function viewProdTest(){
  const pg = oklTestRequest.page({ api: API_BASE, icons: I, toast, pageHead, cancelHref: '#/requests', onDone: () => { location.hash = '#/requests'; } });
  return { title:'Make a new test request', crumb:'Requests', html: pg.html, bind: pg.bind };
}
route('/test', viewProdTest);

// the daily production report (the page that was the Production tile before): needs the "Daily production" page
function viewProdReport(){
  return { title:'Daily production report', crumb:'Reports', html: pageHead('Daily production report', 'OKL and OBC daily packaging reports: what is in, what is missing, and upload by hand.')
    + `<div class="card"><div class="card-b"><a class="btn btn-primary" href="report.html">${I.externalLink} Open the daily production report</a></div></div>` };
}
route('/report', viewProdReport);

const PROD_HELP = [
  ['box', 'Make a procurement request', [
    'Menu > <b>Make a procurement request</b>. You are the requester (your own name is filled in).',
    'Pick the date it is needed by, then each item: name, description, category, quantity and why it is needed. <b>Add another item</b> for more.',
    '<b>Send for approval</b>: your manager, then the plant manager approve; you get the result by e-mail. What you sent shows below the form.']],
  ['users', 'Submit overtime', [
    'Menu > <b>Submit overtime</b>. Pick the day (within the last 31 days); tick public holiday if it was one.',
    'Set the start and end time and tick everyone who worked those hours. Other hours or other work? <b>Add another group</b>.',
    '<b>Submit overtime</b>: it goes into the HR overtime log; the HR Manager is told of the day\'s submissions at midday.']],
  ['plus', 'Make a new test request', [
    'Menu > <b>Make a new test request</b> opens the test request form (the same form as QSync). It needs "submit" access to Test requests; ask an admin if it refuses.',
    'Fill in the product, batch and tests, then send. IPQA and QA take it from there.']],
  ['check', 'My approvals', [
    'Menu > <b>My approvals</b> (the first item) lists everything waiting for you in this console.',
    'Four groups: <b>To approve</b> (requests that need your decision), <b>Assigned to you</b> (work to do), <b>Returned to you</b> (things you raised that were returned or rejected) and <b>Overdue in your area</b>.',
    'The orange number on the menu is the number of items on this page. It falls as you act.',
    '<b>Open</b> takes you straight to the item. A link in an e-mail or WhatsApp message does the same: sign in once with your e-mail and password and you land on that item.']],
  ['layers', 'Long lists', [
    'A list longer than 80 rows shows its first 50, with <b>Show 50 more</b> and <b>Show all</b> under it. It opens faster, mostly on phones.',
    'Search, the filters, sorting by a column heading and the Excel / CSV downloads still cover every row, not only the 50 on screen. Printing prints them all.']],
  ['info', 'Phone or laptop', [
    'The small <b>Phone view / Laptop view</b> green button at the top right of the screen switches the layout. It starts from your screen and is remembered on this device.']],
  ['edit', 'Suggestions', [
    'The orange <b>Suggestions</b> button at the bottom right of every page lets you tell us what is wrong or missing. Tap it, write a line or two about what is confusing, slow or missing on that page, and send.',
    'It goes to the system team only. It changes nothing in the system.']],
];
// How to use shows a card only to people who can open its page; `true` = everyone in this console. A card missing here is HIDDEN
// (fail closed, 12 Nov 2026): workflow/tests/help_cards_test.js fails until every card says who sees it.
const PROD_HELP_PAGE = { 'Make a procurement request': '/requests', 'Submit overtime': '/overtime', 'Make a new test request': '/test', 'My approvals': true, 'Phone or laptop': true, 'Suggestions': true , 'Long lists': true};
const PROD_HELP_MINE = () => PROD_HELP.filter(h => { const g = PROD_HELP_PAGE[h[1]]; return g === true || (!!g && (typeof g === 'function' ? g() : canOpen(g))); });
function viewProdHelp(){
  return { title:'How to use', crumb:'Help', html: pageHead('How to use', 'The short version of each task.')
    + `<div class="grid g2">${PROD_HELP_MINE().map(([ic, t, steps]) => `<div class="card"><div class="card-h"><div><h3>${I[ic] || ''} ${esc(t)}</h3></div></div>
        <div class="card-b"><ol class="small" style="margin:0;padding-left:18px;line-height:1.55">${steps.map(x => `<li style="margin-bottom:4px">${x}</li>`).join('')}</ol></div></div>`).join('')}</div>` };
}
route('/help', viewProdHelp);

// the orange number beside a menu item (the same look everywhere)
function waitBadge(n){ return n ? `<span class="nav-count" title="${n} waiting for you" style="margin-left:auto;min-width:20px;padding:1px 7px;border-radius:10px;background:var(--brand);color:#fff;font-size:11px;font-weight:700;text-align:center">${n > 99 ? '99+' : n}</span>` : ''; }

/* ---- My approvals: the same page in every console (../waiting.js), from the one server list (okl_waiting) ---- */
function viewMyApprovals(){
  const pg = oklWaiting.page('production');
  return { title:'My approvals', crumb:'Mine', keepScroll: true, html: pageHead('My approvals', 'What waits for you: requests to approve, work assigned to you, things that came back and overdue items in your area. The number on the menu is this list.') + pg.html };
}
route('/my-approvals', viewMyApprovals);
