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
  try { sessionStorage.setItem('okl.notice', 'You do not have access to Procurement. Ask an admin if you need it.'); } catch(e) { /* ignore */ }
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
const PAGES = [["/my-approvals", "procurement"], ["/help", "procurement"], ["/items", "procurement.requests"], ["/new-request", "procurement"], ["/stock", "procurement.spares"], ["/prd-stock", "procurement.prd_store"], ["/spares", "procurement"], ["/", "procurement.requests"]];   // route prefix -> page, first match wins
function pageOf(path){
  const p = String(path == null ? currentPath() : path).split('?')[0];
  const hit = PAGES.find(([pre]) => pre === '/' ? p === '/' : (p === pre || p.startsWith(pre + '/')));
  return hit ? hit[1] : 'procurement';
}
function canOpen(path){ return /^\/(approve|my-approvals|help)(\/|\?|$)/.test(String(path == null ? currentPath() : path)) ? true : !!levelOf(pageOf(path)); }   // approvers open their own requests even without the console's pages
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
  const groups = [
    { title:'Mine', items:[ { path:'/my-approvals', label:'My approvals', icon:'check', count: () => oklWaiting.count('procurement') } ] },
    { title:'Modules', items:[
      { path:'/items', label:'Procurement Log', icon:'box' },
      { path:'/new-request', label:'Make a procurement request', icon:'plus' },
      { path:'/stock', label:'Spares stock (Engineering)', icon:'box' },
      { path:'/prd-stock', label:'Production store stock', icon:'box' },
    ] },
  ];
  groups.push({ title:'Help', items:[ { path:'/help', label:'How to use', icon:'info' } ] });
  return groups;
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
        <div style="font-size:13px;font-weight:700;color:#fff;letter-spacing:.02em">Procurement</div>
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
  // "who am I" and the items at the same time (startup.js); the items call checks the sign-in itself
  const items0 = api('/webhook/procurement/api/items').then(d => ({ d }), e => ({ e }));
  const st = await oklMe.start(api, getToken());
  const auth = st.auth;
  if (auth.user && auth.user.must_change){ rememberHere(); toLandingKeepToken(); throw new Error('Password change required'); }
  let data = { items: [] }, limited = false;
  const it = await items0;
  if (it.e) { if (it.e.status === 403) limited = true; else throw it.e; } else data = it.d;   // an approver without the console's pages still gets My approvals and the approval page
  S = { me: meFromAuth(auth, 'procurement'), items: data.items || [], limited };
  resetIdleTimer();
  window.reloadItems = async () => { try { const d = await api('/webhook/procurement/api/items'); S.items = d.items || []; render(); } catch (e) { toast('Could not reload', e.message, 'err'); } };
  oklMe.follow(st, a => { if (a.user && a.user.must_change){ rememberHere(); toLandingKeepToken(); return; } if (S){ S.me = meFromAuth(a, 'procurement'); render(); } });
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
    if (!location.hash) location.hash = '#/';
    render();
  } catch (err) {
    console.error(err);
    const app = document.getElementById('app');
    if (app) app.innerHTML = fatalErrorHtml(err);
  }
})();

/* ============================================================
   Procurement log
   ============================================================ */
let itemQuery = '';
let itemDeptFilter = '';
let itemStatusFilter = '';
let itemDateFrom = '';
let itemDateTo = '';

let itemStageFilter = '';

// 072 (15 Nov 2026): what Procurement fills in. Term of payment, RFP, ODL and the management remark are no longer asked
// (their old values still show, read only). The department receival status is written by the stores.
const EDITABLE_FIELDS = [
  { key: 'vendor', label: 'Vendor' },
  { key: 'po_number', label: 'PO number' },
  { key: 'vendor_delivery_date', label: 'Vendor delivery date (if known)', type: 'date' },
  { key: 'procurement_note', label: 'Procurement note', type: 'area' },
];
const OLD_FIELDS = [
  { key: 'term_of_payment', label: 'Term of payment (old)' },
  { key: 'rfp_number', label: 'RFP number (old)' },
  { key: 'management_review_odl', label: 'Management review ODL (old)' },
  { key: 'management_remark', label: 'Management remark (old)' },
];
const CLOSE_REASONS = ['Delivered outside the stores', 'Service done', 'Cancelled', 'Not needed any more', 'Finished before the console'];
const STAGES = [
  ['approval', 'Waiting for approval'], ['waiting_order', 'Waiting for order'], ['ordered', 'Ordered'], ['partly', 'Partly received'],
  ['closed', 'Closed'], ['rejected', 'Rejected'], ['old', 'Old sheet line'],
];
const stageOf = it => it.stage || { key: '', label: it.request_status || '' };
function stageBadge(it){
  const st = stageOf(it);
  const cls = { approval: 'b-slate', waiting_order: 'b-warn', ordered: 'b-info', partly: 'b-warn', closed: 'b-ok', rejected: 'b-slate', old: 'b-slate' }[st.key] || 'b-slate';
  return `<span class="badge ${cls}" title="${esc(st.text || '')}">${esc(st.label || '--')}</span>${st.overdue ? ' <span class="badge b-danger" title="The vendor delivery date has passed">Overdue</span>' : ''}`;
}

function formatQty(item){
  if (item.quantity == null) return '--';
  const q = Number(item.quantity);
  return item.unit ? `${q} ${item.unit}` : String(q);
}
function formatDate(v){
  if (!v) return '--';
  try { return new Date(v).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); }
  catch (e) { return String(v); }
}
function dateOnly(v){ return v ? String(v).slice(0, 10) : ''; }
function statusBadgeClass(status){
  const s = String(status||'').toLowerCase();
  if (s.includes('approved')) return 'b-brand';
  return 'b-slate';
}
function matchesItemQuery(it, q){
  if (!q) return true;
  const haystack = [it.item_id, it.requestor, it.material_name, it.item_detail, it.material_type, it.department, it.purpose, it.vendor, it.po_number].map(v => String(v||'').toLowerCase()).join(' ');
  return haystack.includes(q);
}
function inDateRange(dateStr, from, to){
  if (!dateStr) return !from && !to;
  const d = new Date(dateStr);
  if (from && d < new Date(from)) return false;
  if (to){
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);
    if (d > toEnd) return false;
  }
  return true;
}
// the server answers a save with the whole line (stage and history too)
function replaceItem(item){
  const i = S.items.findIndex(x => String(x.id) === String(item.id));
  if (i >= 0) S.items[i] = item;
}
const PATCH_URL = id => '/webhook/e3705766-d634-4852-ba77-62ccfdfb0786/procurement/api/items/' + id;   // n8n serves a ':id' path under its webhook id

// Detail + edit in one wide modal: the request, where it is (stage), what Procurement fills in, and close / reopen.
function openItemDetail(id){
  // Postgres bigserial ids come back as strings: compare as strings
  const it = S.items.find(x => String(x.id) === String(id));
  if (!it) return;
  const canEdit = canEditHere();
  const st = stageOf(it);
  const readonlyRow = (label, value) => `<div class="kv-item"><div class="k">${esc(label)}</div><div class="v">${esc(value||'--')}</div></div>`;
  const vendors = [...new Set(S.items.map(x => String(x.vendor || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const olds = OLD_FIELDS.filter(f => String(it[f.key] || '').trim());
  const log = (it.log || []).map(l => `<div class="small" style="margin-top:4px">${esc(l.action === 'closed' ? 'Closed' : 'Opened again')}: ${esc(l.reason)}${l.note ? ' (' + esc(l.note) + ')' : ''}
      <span class="muted">· ${esc(l.by || '')} · ${esc(formatDate(l.at))}</span></div>`).join('');
  const canClose = canEdit && !['closed', 'rejected'].includes(st.key);
  const canReopen = canEdit && st.key === 'closed' && st.reopen;

  const body = `
    <div class="card" style="margin-bottom:14px"><div class="card-b">
      <div class="row between" style="flex-wrap:wrap;gap:8px"><div>${stageBadge(it)} <span class="small" style="margin-left:6px">${esc(st.text || '')}</span></div>
        <div class="row" style="gap:8px">${canClose ? `<button class="btn btn-ghost btn-sm" id="closeLineBtn">Close this line</button>` : ''}${canReopen ? `<button class="btn btn-ghost btn-sm" id="reopenLineBtn">Open it again</button>` : ''}</div></div>
      ${st.key === 'closed' && !st.reopen ? '<div class="tiny muted" style="margin-top:6px">Closed by the store: everything asked for was received.</div>' : ''}
      ${log}
      <div id="stageForm" style="display:none;margin-top:12px"></div>
    </div></div>
    <div class="kv-grid">
      ${readonlyRow('Item ID', it.item_id)}
      ${readonlyRow('Department', it.department)}
      ${readonlyRow('Requestor', it.requestor)}
      ${readonlyRow('Requestor email', it.requestor_email)}
      ${readonlyRow('Material', it.material_name)}
      ${readonlyRow('Material type', it.material_type)}
      ${readonlyRow('Item detail', it.item_detail)}
      ${readonlyRow('Purchase category', it.purchase_category)}
      ${readonlyRow('Purpose', it.purpose)}
      ${readonlyRow('Quantity', formatQty(it))}
      ${readonlyRow('Request date', formatDate(it.request_date))}
      ${readonlyRow('Requirement date', formatDate(it.requirement_date))}
      ${readonlyRow('Management review (OKL)', it.management_review_okl)}
      ${readonlyRow('Remarks', it.remarks)}
      ${readonlyRow('Request status', it.request_status)}
      ${readonlyRow('Received (from the stores)', it.department_receival_status)}
    </div>
    <div class="divider"></div>
    <div class="row between" id="procDetailsHead" style="margin-bottom:12px">
      <div class="small muted">Filled in by Procurement</div>
      ${canEdit ? `<button class="btn btn-primary btn-sm" id="startEditBtn">${I.edit} Edit</button>` : ''}
    </div>
    ${!canEdit ? `<div class="notice info">${I.info}<div>You have viewer access: filling in the vendor and PO needs an editor account.</div></div>` : ''}
    <div class="kv-grid" id="procDetailsView">
      ${EDITABLE_FIELDS.map(f => readonlyRow(f.label, f.type === 'date' ? (it[f.key] ? formatDate(it[f.key]) : '') : it[f.key])).join('')}
      ${olds.map(f => readonlyRow(f.label, it[f.key])).join('')}
    </div>
    <form id="editItemForm" novalidate style="display:none">
      <datalist id="vendorList">${vendors.map(v => `<option value="${esc(v)}">`).join('')}</datalist>
      <div class="grid g2">
        ${EDITABLE_FIELDS.map(f => `
          <div class="field" ${f.type === 'area' ? 'style="grid-column:1/-1"' : ''}><label for="ei_${f.key}">${esc(f.label)}</label>
            ${f.type === 'area' ? `<textarea class="inp" id="ei_${f.key}" rows="2" maxlength="500">${esc(it[f.key]||'')}</textarea>`
              : `<input class="inp" id="ei_${f.key}" ${f.type === 'date' ? 'type="date"' : 'maxlength="' + (f.key === 'vendor' ? 120 : 60) + '"'} ${f.key === 'vendor' ? 'list="vendorList" autocomplete="off"' : ''}
                 value="${esc(f.type === 'date' ? dateOnly(it[f.key]) : (it[f.key]||''))}">`}</div>`).join('')}
      </div>
      <div class="tiny muted">With a PO number the line shows as Ordered. The delivery date can stay empty; when it is given and has passed, the line shows Overdue.</div>
      <div class="row end" style="margin-top:6px">
        <button class="btn btn-ghost" type="button" id="cancelEditBtn">Cancel</button>
        <button class="btn btn-primary" type="submit">${I.check} Save changes</button>
      </div>
    </form>`;

  openModal({
    title: it.material_name || 'Item detail',
    sub: [it.item_id, it.department].filter(Boolean).join(' · '),
    size: 'wide',
    body,
    onMount(wrap){
      const startEditBtn = $('#startEditBtn', wrap);
      const viewGrid = $('#procDetailsView', wrap);
      const form = $('#editItemForm', wrap);
      const send = async (payload, okTitle, btn) => {
        if (btn) btn.disabled = true;
        try {
          const r = await api(PATCH_URL(id), { method:'PATCH', body: payload });
          if (r.item) replaceItem(r.item);
          render(); toast(okTitle, it.item_id || '', 'ok'); openItemDetail(id);
        } catch (err) { toast('Could not save', err.message, 'err', 7000); if (btn) btn.disabled = false; }
      };
      // close (a reason from the list) or open again (say why)
      const stageForm = $('#stageForm', wrap);
      const closeBtn = $('#closeLineBtn', wrap), reopenBtn = $('#reopenLineBtn', wrap);
      if (closeBtn) closeBtn.onclick = () => {
        stageForm.style.display = 'block';
        stageForm.innerHTML = `<div class="grid g2"><div class="field"><label for="clReason">Why is it closed?</label><select class="inp" id="clReason"><option value="">Choose...</option>
            ${CLOSE_REASONS.map(r => `<option>${esc(r)}</option>`).join('')}</select></div>
          <div class="field"><label for="clNote">Note (optional)</label><input class="inp" id="clNote" maxlength="300"></div></div>
          <div class="row end"><button class="btn btn-ghost btn-sm" type="button" id="clCancel">Cancel</button><button class="btn btn-primary btn-sm" type="button" id="clGo">Close the line</button></div>`;
        $('#clCancel', stageForm).onclick = () => { stageForm.style.display = 'none'; };
        $('#clGo', stageForm).onclick = (e) => {
          const reason = $('#clReason', stageForm).value; if (!reason) { toast('Choose why it is closed', '', 'err'); return; }
          send({ action: 'close', reason, note: $('#clNote', stageForm).value.trim() }, 'Line closed', e.target);
        };
      };
      if (reopenBtn) reopenBtn.onclick = () => {
        stageForm.style.display = 'block';
        stageForm.innerHTML = `<div class="field"><label for="roReason">Why is it opened again?</label><input class="inp" id="roReason" maxlength="300"></div>
          <div class="row end"><button class="btn btn-ghost btn-sm" type="button" id="roCancel">Cancel</button><button class="btn btn-primary btn-sm" type="button" id="roGo">Open it again</button></div>`;
        $('#roCancel', stageForm).onclick = () => { stageForm.style.display = 'none'; };
        $('#roGo', stageForm).onclick = (e) => {
          const reason = $('#roReason', stageForm).value.trim(); if (reason.length < 3) { toast('Say why it is opened again', '', 'err'); return; }
          send({ action: 'reopen', reason }, 'Line opened again', e.target);
        };
      };
      if (startEditBtn){
        startEditBtn.onclick = () => { viewGrid.hidden = true; startEditBtn.hidden = true; form.style.display = 'block'; };
      }
      if (form){
        $('#cancelEditBtn', form).onclick = () => { form.style.display = 'none'; viewGrid.hidden = false; if (startEditBtn) startEditBtn.hidden = false; };
        form.onsubmit = (ev) => {
          ev.preventDefault();
          const payload = {};
          EDITABLE_FIELDS.forEach(f => { payload[f.key] = $('#ei_' + f.key, form).value.trim(); });
          send(payload, 'Changes saved', form.querySelector('button[type=submit]'));
        };
      }
    },
  });
}

// the old sheet lines (from before the console): close all the ones shown, with one reason
function closeShown(ids){
  openModal({
    title: 'Close ' + ids.length + ' line' + (ids.length === 1 ? '' : 's'), sub: 'The lines shown by the filters now.',
    body: `<div class="grid g2"><div class="field"><label for="bcReason">Why are they closed?</label><select class="inp" id="bcReason"><option value="">Choose...</option>
        ${CLOSE_REASONS.map(r => `<option ${r === 'Finished before the console' ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select></div>
      <div class="field"><label for="bcNote">Note (optional)</label><input class="inp" id="bcNote" maxlength="300"></div></div>
      <div class="tiny muted">Each line keeps who closed it and why; a closed line can be opened again from its detail.</div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>Close them</button>`,
    onMount(w, close){
      $('[data-save]', w).onclick = async (e) => {
        const reason = $('#bcReason', w).value; if (!reason) { toast('Choose why they are closed', '', 'err'); return; }
        e.target.disabled = true;
        try {
          const r = await api('/webhook/procurement/api/items-close', { method:'POST', body: { ids, reason, note: $('#bcNote', w).value.trim() } });
          close(); toast('Lines closed', r.closed + ' closed' + (r.skipped ? ', ' + r.skipped + ' left as they were' : ''), 'ok', 7000);
          await reloadItems();
        } catch (err) { toast('Could not close them', err.message, 'err', 7000); e.target.disabled = false; }
      };
    },
  });
}
window.closeShownLines = () => { const ids = (window.__shownIds || []); if (ids.length) closeShown(ids); };

function viewItems(){
  const q = itemQuery.trim().toLowerCase();
  // the approval e-mail's button opens #/items?batch=<request>: only that request's lines (072)
  const onlyBatch = new URLSearchParams(currentPath().split('?')[1] || '').get('batch') || '';
  // the server returns the lines newest first: filtering keeps that order
  const rows = S.items.filter(it => (!onlyBatch || it.batch_id === onlyBatch) &&
    (!itemDeptFilter || it.department === itemDeptFilter) &&
    (!itemStatusFilter || it.request_status === itemStatusFilter) &&
    (!itemStageFilter || stageOf(it).key === itemStageFilter || (itemStageFilter === 'overdue' && stageOf(it).overdue)) &&
    inDateRange(it.request_date, itemDateFrom, itemDateTo) &&
    matchesItemQuery(it, q));
  const departments = [...new Set(S.items.map(it => it.department).filter(Boolean))].sort();
  const statuses = [...new Set(S.items.map(it => it.request_status).filter(Boolean))].sort();
  const count = k => S.items.filter(it => stageOf(it).key === k).length;
  const overdue = S.items.filter(it => stageOf(it).overdue).length;
  const closable = rows.filter(it => !['closed', 'rejected'].includes(stageOf(it).key));
  window.__shownIds = closable.map(it => it.id);
  const bulk = canEditHere() && itemStageFilter === 'old' && closable.length
    ? `<div class="notice info" style="margin-bottom:14px">${I.info}<div>${closable.length} old sheet line${closable.length === 1 ? '' : 's'} shown (from before the console). If they are finished, close them in one go.
        <button class="btn btn-primary btn-sm" style="margin-left:8px" onclick="closeShownLines()">Close the ${closable.length} shown</button></div></div>` : '';

  return {
    title:'Procurement Log', crumb:'Modules',
    html: `
    ${pageHead('Procurement Log', 'Every procured item across all departments, newest first. Each line shows where it is: waiting for order, ordered, received or closed.')}
    <div class="row filter-bar" style="margin-bottom:14px;flex-wrap:wrap;row-gap:10px">
      <div class="search filter-search">
        <span class="ic">${I.search}</span>
        <input class="inp" id="itemSearch" placeholder="Search item ID, requestor, material, vendor, PO..." value="${esc(itemQuery)}">
      </div>
      <select class="inp filter-sel-status" id="itemStageFilter">
        <option value="">All stages</option>
        ${STAGES.map(([k, l]) => `<option value="${k}" ${itemStageFilter===k?'selected':''}>${esc(l)} (${count(k)})</option>`).join('')}
        <option value="overdue" ${itemStageFilter==='overdue'?'selected':''}>Overdue (${overdue})</option>
      </select>
      <select class="inp filter-sel-status" id="itemDeptFilter">
        <option value="">All departments</option>
        ${departments.map(d => `<option value="${esc(d)}" ${itemDeptFilter===d?'selected':''}>${esc(d)}</option>`).join('')}
      </select>
      <select class="inp filter-sel-status" id="itemStatusFilter">
        <option value="">All approval statuses</option>
        ${statuses.map(s => `<option value="${esc(s)}" ${itemStatusFilter===s?'selected':''}>${esc(s)}</option>`).join('')}
      </select>
      <input type="date" class="inp" id="itemDateFrom" value="${esc(itemDateFrom)}" title="From date" style="max-width:150px">
      <input type="date" class="inp" id="itemDateTo" value="${esc(itemDateTo)}" title="To date" style="max-width:150px">
      <div class="spacer"></div>
    </div>
    ${bulk}
    ${onlyBatch ? `<div class="notice info" style="margin-bottom:14px">${I.info}<div>Showing request <b>${esc(onlyBatch)}</b> only: open each line, <b>Edit</b>, put the PO number and vendor.
        <a class="btn btn-ghost btn-sm" style="margin-left:8px" href="#/items">Show every line</a></div></div>` : ''}
    <div class="card">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>
          <th>Request Date</th><th>Item ID</th><th>Requestor</th><th>Material</th><th>Item Detail</th>
          <th>Qty &amp; Unit</th><th>Stage</th><th>Vendor / PO</th>
        </tr></thead>
        <tbody>${rows.length ? rows.map(it => `
          <tr class="clickable" onclick="openItemDetail(${it.id})">
            <td data-label="Request Date">${esc(formatDate(it.request_date))}</td>
            <td class="mono" data-label="Item ID">${esc(it.item_id||'--')}</td>
            <td data-label="Requestor"><div class="person">${avatarEl(it.requestor)}<div class="person-txt"><span class="strong" title="${esc(it.requestor)}">${esc(it.requestor)}</span><span class="tiny muted">${esc(it.department||'')}</span></div></div></td>
            <td data-label="Material">${esc(it.material_name||'--')}</td>
            <td data-label="Item Detail" style="max-width:280px;white-space:normal" title="${esc(it.item_detail||'')}">${esc(it.item_detail||'--')}</td>
            <td data-label="Qty & Unit">${esc(formatQty(it))}</td>
            <td data-label="Stage">${stageBadge(it)}</td>
            <td data-label="Vendor / PO" class="small">${esc(it.vendor||'')}${it.po_number ? `<div class="tiny muted mono">PO ${esc(it.po_number)}</div>` : ''}${it.vendor_delivery_date ? `<div class="tiny muted">due ${esc(formatDate(it.vendor_delivery_date))}</div>` : ''}</td>
          </tr>`).join('') : `<tr><td colspan="8">${emptyState('box','No items match', 'Try a different search or filter.')}</td></tr>`}
        </tbody>
      </table></div>
    </div>`,
    bind(){
      $('#itemSearch').oninput = debounce((e) => { itemQuery = e.target.value; render(); }, 200);
      $('#itemSearch').focus();
      $('#itemSearch').setSelectionRange(itemQuery.length, itemQuery.length);
      $('#itemStageFilter').onchange = (e) => { itemStageFilter = e.target.value; render(); };
      $('#itemDeptFilter').onchange = (e) => { itemDeptFilter = e.target.value; render(); };
      $('#itemStatusFilter').onchange = (e) => { itemStatusFilter = e.target.value; render(); };
      $('#itemDateFrom').onchange = (e) => { itemDateFrom = e.target.value; render(); };
      $('#itemDateTo').onchange = (e) => { itemDateTo = e.target.value; render(); };
    },
  };
}
route('/', () => viewItems());
route('/items', () => viewItems());

/* ============================================================
   New Request (unified 7 Nov 2026): the shared procurement request form (../requests.js), the same page, checks and
   words as Engineering, HR, QSync and Production. Pick the department, the requester is you; it goes into the same
   approvals as the old hosted form. Engineering's own requests (with the store parts list) are made in the Engineering console.
   ============================================================ */
let NR = { dept: '' };
function viewNewRequest(){
  if (!rolesCache && !rolesLoading && !rolesError) loadRoles();
  const deptNames = [...new Set((rolesCache || [])
    .filter(r => r.flow === 'dept' && r.stage === 'requester' && r.department)
    .map(r => r.department))].sort();
  let note = '';
  if (rolesLoading) note = `<div class="hint" style="margin-bottom:14px">${I.info}<span>Loading the departments...</span></div>`;
  else if (rolesError) note = `<div class="notice info" style="margin-bottom:14px">${I.info}<div>Could not load the departments (${esc(rolesError)}).
      <button class="btn btn-ghost btn-sm" onclick="retryRoles()">Retry</button></div></div>`;
  if (!window.oklRequests) return { title:'New Request', crumb:'Modules', html: `<div class="card"><div class="card-b">${emptyState('alert', 'The form did not load', 'Reload the page.')}</div></div>` };
  const pg = oklRequests.page('item', { api: API_BASE, department: NR.dept, departments: deptNames, flow: 'dept', requester: (S.me && S.me.name) || '', icons: I, toast, noRecent: true,
    onDept: v => { NR.dept = v; render(); }, onSent: () => render(),
    lede: 'Pick the department the request is for. It goes to that department\'s approvers, as the old form did. Engineering requests (store parts list) are made in the <a href="../engineering/#/requests">Engineering console</a>.' });
  return { title: pg.title, crumb:'Modules', keepScroll: true, html: pageHead(pg.title, pg.lede) + note + pg.html, bind: pg.bind };
}
route('/new-request', () => viewNewRequest());

/* ============================================================
   Engineering spares moved to the Engineering console (migration 018): stock, receipts, issues and counts live in the
   database now. Old links land on a pointer.
   ============================================================ */
function viewSparesMoved(){
  return { title:'Spares', crumb:'Procurement',
    html: `${pageHead('Spares have moved', 'Engineering spares are now kept in the Engineering console, with live stock.')}
      <div class="card"><div class="card-b">${emptyState('box', 'Spares are in the Engineering console', 'Inventory, receipts, issues and the weekly counts are there.',
        `<a class="btn btn-primary" href="../engineering/#/spares">Open Engineering spares</a>`)}</div></div>` };
}
route('/spares/inventory', viewSparesMoved);

/* ============================================================
   Spares stock (12 Nov 2026): the Engineering store's live stock, VIEW ONLY, for Procurement (what is low, what is out)
   without opening the Engineering console. GET procurement/api/spares (page "Spares stock", procurement.spares).
   Receiving, issuing and counting stay in the Engineering console.
   ============================================================ */
const ST = { data: null, q: '', status: '' };
const PST = { data: null, q: '', status: '' };
// 067 (13 Nov 2026): both stores work out the reorder level from use; the same statuses and colours as their consoles
const STOCK_STATUS = [['Count needed', 'count'], ['Out of stock', 'out'], ['Reorder now', 'reorder'], ['Order soon', 'soon'], ['Not moving', 'idle'], ['OK', 'ok']];
(function stockStyle(){
  if (document.getElementById('stockStyle')) return;
  const el = document.createElement('style'); el.id = 'stockStyle';
  el.textContent = '.sb{display:inline-block;padding:2px 9px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;border:1px solid}'
    + '.sb-out{background:#B3261E;color:#fff;border-color:#B3261E}.sb-reorder{background:#FFE4CC;color:#9A3412;border-color:#FB9F5A}'
    + '.sb-soon{background:#FEF3C0;color:#7A4A06;border-color:#EBC94A}.sb-ok{background:#E3F3E7;color:#1E6B35;border-color:#A9D8B6}'
    + '.sb-idle{background:#EEF0F2;color:#4B5563;border-color:#D0D5DB}.sb-count{background:#E6EEFB;color:#1B4F9C;border-color:#B5CBF0}';
  document.head.appendChild(el);
})();
const STOCK_RULES = {
  status: 'Out of stock: nothing left.\nReorder now: at or below the reorder level.\nOrder soon: within one more week of use above it.\n'
    + 'Not moving: nothing issued lately.\nCount needed: never counted, so the stock is not known yet.\nOK: enough for now.',
  use: 'How many the store uses in a normal week.\n'
    + 'Use per week = issued over the last weeks (Engineering 26, Production 8) / the weeks it was in stock.\n'
    + '"Not enough use" when it was issued on fewer than 3 days.',
  reorder: 'When the stock is down to this number, the store asks for more.\n'
    + 'Reorder level = use per week x (lead time + safety weeks), never below the store\'s minimum.',
  order: 'How many the store usually asks for.\nOrder quantity = reorder level x 1.5.',
};
const stockInfo = t => window.oklInfo ? window.oklInfo(t) : '';
function stockBadge(s){ const c = (STOCK_STATUS.find(x => x[0] === s) || [0, 'ok'])[1]; return `<span class="sb sb-${c}">${esc(s || '')}</span>`; }
async function stLoad(){
  try { ST.data = await api('/webhook/procurement/api/spares'); } catch (e) { ST.data = { error: e.message }; }
  render();
}
async function pstLoad(){
  try { PST.data = await api('/webhook/production/api/store/procurement'); } catch (e) { PST.data = { error: e.message }; }
  render();
}
// one page for either store: E = { state, load, title, lede, list(d), code, name }
function stockPage(E){
  const T = E.state;
  if (!T.data) { T.data = 'loading'; E.load(); }
  const d = T.data;
  const head = pageHead(E.title, E.lede, `<button class="btn btn-ghost" onclick="${E.refresh}">Refresh</button>`);
  if (d === 'loading') return { title: E.title, crumb:'Procurement', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
  if (d.error) return { title: E.title, crumb:'Procurement', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(d.error))}</div></div>` };
  const mark = window.oklRequestMark ? window.oklRequestMark() : null;
  const all = E.list(d), q = T.q.trim().toLowerCase(), rank = s => { const i = STOCK_STATUS.findIndex(x => x[0] === s); return i < 0 ? 9 : i; };
  const rows = all.filter(r => (!T.status || r.status === T.status) && (!q || [E.code(r), E.name(r), r.part_number, r.brand, r.supplier, r.location].join(' ').toLowerCase().includes(q)))
    .sort((a, b) => (mark ? window.oklRequestFirst(mark, E.code(a)) - window.oklRequestFirst(mark, E.code(b)) : 0) || rank(a.status) - rank(b.status) || String(E.code(a)).localeCompare(String(E.code(b))));
  const n = s => all.filter(r => r.status === s).length;
  const money = v => v == null || v === '' ? '' : Number(v).toLocaleString('en-NG', { maximumFractionDigits: 2 });
  const opt = (v, l) => `<option value="${v}" ${T.status === v ? 'selected' : ''}>${l}</option>`;
  const use = r => r.trusted ? esc(r.use_per_week) + (r.trend === 'up' ? ' ↑' : r.trend === 'down' ? ' ↓' : '') : '<span class="tiny muted">not enough use</span>';
  return { title: E.title, crumb:'Procurement', keepScroll: true,
    html: head + (mark ? window.oklRequestBanner(mark) : '') + `<div class="card"><div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px"><div class="row" style="gap:10px;flex-wrap:wrap">
        <div class="search filter-search"><span class="ic">${I.search || ''}</span><input class="inp" id="stQ" style="padding-left:34px;border-radius:20px" placeholder="Search code, name, part number, supplier" value="${esc(T.q)}"></div>
        <select class="inp" id="stStatus" style="width:auto">${opt('', 'All (' + all.length + ')')}${STOCK_STATUS.filter(x => n(x[0])).map(x => opt(x[0], x[0] + ' (' + n(x[0]) + ')')).join('')}</select>
      </div></div>
      ${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Status ${stockInfo(STOCK_RULES.status)}</th><th>Code</th><th>Description</th><th style="text-align:right">Stock</th>
        <th style="text-align:right">Use / week ${stockInfo(STOCK_RULES.use)}</th><th style="text-align:right">Weeks left</th><th style="text-align:right">Reorder at ${stockInfo(STOCK_RULES.reorder)}</th>
        <th style="text-align:right">Order qty ${stockInfo(STOCK_RULES.order)}</th><th>Last in</th><th style="text-align:right">Unit price (NGN)</th></tr></thead>
        <tbody>${rows.map(r => `<tr class="${mark && mark.codes.includes(String(E.code(r)).toUpperCase()) ? 'req-item' : ''}"><td data-label="Status">${stockBadge(r.status)}</td><td class="mono small" data-label="Code">${esc(E.code(r))}</td>
          <td data-label="Description"><div class="strong">${esc(E.name(r) || '')}</div><div class="tiny muted">${esc([r.part_number, r.brand, r.supplier].filter(Boolean).join(' · '))}</div></td>
          <td data-label="Stock" class="tnum" style="text-align:right">${r.stock == null ? '<span class="tiny muted">not known</span>' : esc(r.stock) + ' <span class="tiny muted">' + esc(r.unit || '') + '</span>'}</td>
          <td data-label="Use / week" class="tnum" style="text-align:right">${use(r)}</td>
          <td data-label="Weeks left" class="tnum" style="text-align:right">${esc(r.weeks_left == null ? '--' : r.weeks_left)}</td>
          <td data-label="Reorder at" class="tnum" style="text-align:right">${esc(r.reorder_level == null ? '' : r.reorder_level)}</td>
          <td data-label="Order qty" class="tnum" style="text-align:right">${+r.order_qty ? esc(r.order_qty) : '--'}</td>
          <td data-label="Last in" class="small">${esc(r.last_in || '')}</td>
          <td data-label="Unit price (NGN)" class="tnum" style="text-align:right">${money(r.unit_price)}</td></tr>`).join('')}</tbody></table></div>`
        : `<div class="card-b">${emptyState('search', 'Nothing matches', 'Nothing matches the search or the status chosen.')}</div>`}
    </div>`,
    bind(){
      const qi = document.getElementById('stQ');
      if (qi) qi.addEventListener('input', debounce(e => { T.q = e.target.value; render(); const x = document.getElementById('stQ'); if (x){ x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }, 260));
      const ss = document.getElementById('stStatus'); if (ss) ss.onchange = e => { T.status = e.target.value; render(); };
    } };
}
function viewStock(){
  return stockPage({ state: ST, load: stLoad, refresh: 'ST.data = null; render()', title: 'Spares stock',
    lede: 'The Engineering store\'s stock, live. View only: receipts, issues and counts are made in the Engineering console.',
    list: d => d.spares || [], code: r => r.sku, name: r => r.description });
}
// Production store (066): what Production keeps (coding fluids, cartridges, ribbons, characters ...), view only
function viewPrdStock(){
  return stockPage({ state: PST, load: pstLoad, refresh: 'PST.data = null; render()', title: 'Production store stock',
    lede: 'The Production store\'s stock, live: coding fluids, cartridges, ribbons and other production materials. View only: Production receives, issues and counts in its console.',
    list: d => d.items || [], code: r => r.code, name: r => r.name });
}
route('/prd-stock', viewPrdStock);
route('/stock', viewStock);
route('/spares/inbound', viewSparesMoved);
route('/spares/outbound', viewSparesMoved);

/* ============================================================
   Roles list (read-only data for the New Request page). Who can submit and who approves now lives in the central
   approvers table (OKL_AUTH_approvers) and is edited in the Users console, Approvers tab. There is no Roles page here any more.
   ============================================================ */
let rolesCache = null;
let rolesLoading = false;
let rolesError = '';

async function loadRoles(){
  if (rolesCache || rolesLoading) return;
  rolesLoading = true;
  rolesError = '';
  render();
  try {
    const data = await api('/webhook/procurement/api/roles');
    rolesCache = Array.isArray(data.roles) ? data.roles : [];
    S.roles = rolesCache;
  } catch (err) {
    rolesError = err.message;
  } finally {
    rolesLoading = false;
    render();
  }
}
function retryRoles(){
  rolesError = '';
  loadRoles();
}

/* ============================================================
   Settings (account info, sign out)
   ============================================================ */

// the orange number beside a menu item (the same look everywhere)
function waitBadge(n){ return n ? `<span class="nav-count" title="${n} waiting for you" style="margin-left:auto;min-width:20px;padding:1px 7px;border-radius:10px;background:var(--brand);color:#fff;font-size:11px;font-weight:700;text-align:center">${n > 99 ? '99+' : n}</span>` : ''; }

/* ---- My approvals: the same page in every console (../waiting.js), from the one server list (okl_waiting) ---- */
function viewMyApprovals(){
  const pg = oklWaiting.page('procurement');
  return { title:'My approvals', crumb:'Mine', keepScroll: true, html: pageHead('My approvals', 'What waits for you: requests to approve, work assigned to you, things that came back and overdue items in your area. The number on the menu is this list.') + pg.html };
}
route('/my-approvals', viewMyApprovals);


/* ============================================================
   The approval page (7 Nov 2026): the link in an approval e-mail opens here, after signing in, on the exact request. Only the
   approver of the request's current step can decide it (the server checks the signed-in account's seat). It replaces the
   old checklist page that needed no sign-in: the decision is made as YOU.
   ============================================================ */
const AP = {};      // batch id -> { data, error, decisions: {rowNumber: 'approved'|'rejected'}, reason, busy, done }
async function apLoad(id){
  const a = AP[id] = AP[id] || { decisions: {}, reason: '' };
  try { a.data = await api('/webhook/procurement/api/batch?batchId=' + encodeURIComponent(id)); a.error = ''; } catch (e) { a.error = e.message; }
  render();
}
function apSet(id, row, v){ AP[id].decisions[row] = v; render(); }
function apAll(id, v){ (AP[id].data.items || []).forEach(it => { AP[id].decisions[it.rowNumber] = v; }); render(); }
async function apSubmit(id){
  const a = AP[id], items = a.data.items || [];
  const reasonEl = document.getElementById('apReason'); if (reasonEl) a.reason = reasonEl.value;
  const undecided = items.filter(it => !a.decisions[it.rowNumber]);
  if (undecided.length) return toast('Decide every item', undecided.length + ' item(s) still need a decision.', 'err');
  const rejected = items.some(it => a.decisions[it.rowNumber] === 'rejected');
  if (rejected && !String(a.reason || '').trim()) return toast('Say why', 'A reason is needed when any item is rejected.', 'err');
  a.busy = true; render();
  try {
    const res = await fetch(API_BASE + '/webhook/procurement/decision', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: getToken() },
      body: JSON.stringify({ batchId: id, requesterName: a.data.requester, rejectionReason: rejected ? String(a.reason).trim() : '',
        decisions: items.map(it => ({ rowNumber: it.rowNumber, material: it.material, detail: it.detail, purpose: it.purpose, qty: it.qty, decision: a.decisions[it.rowNumber] })) }) });
    const text = await res.text(); let msg = text; try { msg = JSON.parse(text).error || text; } catch (e) { /* plain text answer */ }
    if (res.status === 401) { rememberHere(); toLanding(); return; }
    if (!res.ok) throw new Error(msg || ('Not accepted (' + res.status + ')'));
    a.done = msg || 'Your decision was recorded.'; toast('Decision recorded', a.done, 'ok', 7000);
    if (window.oklWaiting) oklWaiting.refresh('procurement');
    const go = apStockLinks(a.data)[0];
    if (go) { a.busy = false; location.href = go.href; return; }   // the whole store of the request, its items highlighted
  } catch (e) { toast('Not recorded', e.message, 'err', 8000); }
  a.busy = false; render();
}
// 068 (14 Nov 2026): the stock of what the request asks for (lines that name a store code), shown before and after the decision
// where this person can see the stock table of the request's items: their store's own page, else Procurement's view
function apStockLinks(d){
  const rows = d.stock || [], dep = String(d.department || '').toLowerCase();
  const codes = store => rows.filter(r => r.store === store).map(r => r.code);
  const qs = list => '?req=' + encodeURIComponent(d.batch_id || '') + (list.length ? '&codes=' + encodeURIComponent(list.join(',')) : '');
  const out = [], prd = codes('Production store'), eng = codes('Engineering spares');
  if (dep === 'production' || prd.length) {
    if (levelOf('production.store')) out.push({ label: 'the Production store', href: '../production/#/store' + qs(prd) });
    else if (levelOf('procurement.prd_store')) out.push({ label: 'the Production store stock', href: '#/prd-stock' + qs(prd) });
  }
  if (dep === 'engineering' || eng.length) {
    if (levelOf('engineering.spares')) out.push({ label: 'Engineering spares', href: '../engineering/#/spares' + qs(eng) });
    else if (levelOf('procurement.spares')) out.push({ label: 'the spares stock', href: '#/stock' + qs(eng) });
  }
  return out;
}
function apStockCard(d){
  const rows = d.stock || [];
  if (!rows.length) return '';
  const info = stockInfo('What the store has now of each item on this request, to judge the quantity asked for.\n'
    + 'Only lines with a store code (like MP 406 or RB 001) are shown; the numbers are the same as on the store\'s own page.');
  const use = r => r.trusted ? esc(r.use_per_week) + (r.trend === 'up' ? ' ↑' : r.trend === 'down' ? ' ↓' : '') : '<span class="tiny muted">not enough use</span>';
  const links = apStockLinks(d).map(l => `<a class="btn btn-ghost btn-sm" href="${esc(l.href)}">Open in ${esc(l.label)}</a>`).join(' ');
  return `<div class="card" style="margin-top:12px"><div class="card-h"><h3>Stock of these items ${info}</h3>${links ? `<div class="row" style="gap:6px;flex-wrap:wrap">${links}</div>` : ''}</div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Status ${stockInfo(STOCK_RULES.status)}</th><th>Code</th><th>Item</th><th>Asked for</th>
      <th style="text-align:right">Stock</th><th style="text-align:right">Use / week ${stockInfo(STOCK_RULES.use)}</th><th style="text-align:right">Weeks left</th>
      <th style="text-align:right">Reorder at ${stockInfo(STOCK_RULES.reorder)}</th><th style="text-align:right">Order qty ${stockInfo(STOCK_RULES.order)}</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td data-label="Status">${stockBadge(r.status)}</td><td class="mono small" data-label="Code">${esc(r.code)}</td>
      <td data-label="Item"><div class="strong">${esc(r.name || '')}</div><div class="tiny muted">${esc(r.store)}</div></td>
      <td data-label="Asked for" class="small">${esc(r.requested || '')}</td>
      <td data-label="Stock" class="tnum" style="text-align:right">${r.stock_known === false || r.stock == null ? '<span class="tiny muted">not known</span>' : esc(r.stock) + ' <span class="tiny muted">' + esc(r.unit || '') + '</span>'}</td>
      <td data-label="Use / week" class="tnum" style="text-align:right">${use(r)}</td>
      <td data-label="Weeks left" class="tnum" style="text-align:right">${esc(r.weeks_left == null ? '--' : r.weeks_left)}</td>
      <td data-label="Reorder at" class="tnum" style="text-align:right">${esc(r.reorder_level == null ? '' : r.reorder_level)}</td>
      <td data-label="Order qty" class="tnum" style="text-align:right">${+r.order_qty ? esc(r.order_qty) : '--'}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function viewApprove(params){
  const id = params.batch, a = AP[id];
  const frame = body => ({ title:'Approve a request', crumb:'Mine', keepScroll: true, html: pageHead('Approve a request', esc(id)) + body });
  if (!a || (!a.data && !a.error)) { if (!a) AP[id] = { decisions: {}, reason: '' }; if (!AP[id].loading) { AP[id].loading = true; apLoad(id); } return frame('<div class="card"><div class="card-b small muted">Loading...</div></div>'); }
  if (a.error) return frame(`<div class="card"><div class="card-b">${emptyState('alert', 'Could not open it', esc(a.error), '<a class="btn btn-primary" href="#/my-approvals">My approvals</a>')}</div></div>`);
  const d = a.data;
  if (!d.ok) return frame(`<div class="card"><div class="card-b">${emptyState('alert', 'Not found', esc(d.error || ''), '<a class="btn btn-primary" href="#/my-approvals">My approvals</a>')}</div></div>`);
  const STAGE = { engineering: 'Engineering Manager', operations: 'Operations Manager', manager: 'Department Manager', plant_head: 'Plant Manager' };
  const head = `<div class="card" style="margin-bottom:12px"><div class="card-b"><div class="row between" style="flex-wrap:wrap;gap:8px"><div><div class="strong mono">${esc(d.batch_id)}</div>
      <div class="small muted">${esc(d.requester || '')} · ${esc(d.department || '')} · needed by ${esc(String(d.requirement_date || '').slice(0, 10))}</div></div>
      <span class="badge ${d.status === 'processed' ? 'b-ok' : 'b-warn'}">${d.status === 'processed' ? 'Decided' : 'With the ' + esc(STAGE[d.stage] || d.stage)}</span></div></div></div>`;
  if (a.done) return frame(head + `<div class="card"><div class="card-b">${emptyState('checkCircle', 'Decision recorded', esc(a.done), '<a class="btn btn-primary" href="#/my-approvals">Back to My approvals</a>')}</div></div>` + apStockCard(d));
  const items = d.items || [];
  const rows = items.map(it => `<tr><td data-label="Item"><div class="strong">${esc(it.material || '')}</div><div class="tiny muted">${esc(it.detail || '')}</div></td>
      <td data-label="Purpose" class="small">${esc(it.purpose || '')}</td><td data-label="Qty" class="small">${esc(it.qty || '')}</td>
      <td data-label="Decision">${d.can_decide ? `<div class="row" style="gap:6px"><button class="btn btn-sm ${a.decisions[it.rowNumber] === 'approved' ? 'btn-primary' : 'btn-ghost'}" onclick="apSet('${esc(id)}', ${Number(it.rowNumber)}, 'approved')">Approve</button>
        <button class="btn btn-sm ${a.decisions[it.rowNumber] === 'rejected' ? 'btn-danger' : 'btn-ghost'}" onclick="apSet('${esc(id)}', ${Number(it.rowNumber)}, 'rejected')">Reject</button></div>` : ''}</td></tr>`).join('');
  const rejected = items.some(it => a.decisions[it.rowNumber] === 'rejected');
  const bottom = d.can_decide ? `<div class="row" style="gap:8px;margin:12px 0;flex-wrap:wrap"><button class="btn btn-ghost" onclick="apAll('${esc(id)}','approved')">Approve all</button><button class="btn btn-ghost" onclick="apAll('${esc(id)}','rejected')">Reject all</button></div>
      ${rejected ? `<div class="field"><label for="apReason">Why are you rejecting? (one reason for the request)</label><textarea class="inp" id="apReason" rows="3" maxlength="500">${esc(a.reason || '')}</textarea></div>` : ''}
      <div class="row job-actions" style="gap:10px"><button class="btn btn-primary btn-lg" ${a.busy ? 'disabled' : ''} onclick="apSubmit('${esc(id)}')">${I.check} ${a.busy ? 'Sending...' : 'Submit decisions'}</button></div>`
    : `<div class="notice info" style="margin-top:12px">${I.info}<div>${d.status === 'processed' ? 'This request has been decided.' : 'This request is not waiting for you now. Only the approver of its current step can decide it.'}</div></div>`;
  return frame(head + `<div class="card"><div class="tbl-wrap"><table class="tbl no-stack"><thead><tr><th>Item</th><th>Purpose</th><th>Qty</th><th>${d.can_decide ? 'Decision' : ''}</th></tr></thead><tbody>${rows}</tbody></table></div></div>` + bottom + apStockCard(d));
}
route('/approve/:batch', viewApprove);

/* ---- How to use (7 Nov 2026: every feature people notice has a short manual) ---- */
const HELP = [
  ['box', 'Make a procurement request', [
    'Menu > <b>Make a procurement request</b>. Pick the department the request is for, then the date it is needed by.',
    'Add each item: name, description, category, quantity, why. <b>Send for approval</b>: that department\'s manager, then the plant manager.',
    'Engineering requests (with the store parts list) are made in the Engineering console.']],
  ['check', 'Approve a request', [
    'An approval e-mail now links to the request in this console. Sign in with your e-mail or staff number and your PIN and you land on it. You can also open it from <b>My approvals</b>.',
    'Approve or reject each item, then <b>Submit decisions</b>. A reason is needed when any item is rejected. Only the approver of the request\'s current step can decide it.',
    '<b>Stock of these items</b> (below the request, before and after you decide): what the store has of each item with a store code, its use per week, weeks left, reorder level and order quantity. Point at the small <b>i</b> for what each one means.',
    'When you submit, you are taken to the <b>whole store</b> of that request (Production > Store or Engineering > Spares), with its items highlighted at the top, so you see all the stock and its status.']],
  ['check', 'My approvals', [
    'Menu > <b>My approvals</b> (the first item) lists everything waiting for you in this console.',
    'Four groups: <b>To approve</b> (requests that need your decision), <b>Assigned to you</b> (work to do), <b>Returned to you</b> (things you raised that were returned or rejected) and <b>Overdue in your area</b>.',
    'The orange number on the menu is the number of items on this page. It falls as you act.',
    '<b>Open</b> takes you straight to the item. A link in an e-mail or WhatsApp message does the same: sign in once with your e-mail or staff number and your PIN and you land on that item.']],
  ['box', 'Procurement log: stages and closing', [
    'Menu > <b>Procurement Log</b>. Every line shows its <b>stage</b>: Waiting for approval, <b>Waiting for order</b> (approved), <b>Ordered</b> (a PO number is in), <b>Partly received</b>, <b>Closed</b>, Rejected, or <b>Old sheet line</b> (from before the console). Filter by stage at the top; <b>Overdue</b> = ordered and the delivery date has passed.',
    'Open a line > <b>Edit</b>: vendor (earlier vendors are suggested), PO number, the vendor delivery date if you know it (it can stay empty) and a note. Term of payment, RFP and ODL are no longer asked; old values still show.',
    'Received and partly received come from the stores by themselves (when the storekeeper receives against the request). Everything received = closed by itself.',
    '<b>Close this line</b> when it is finished another way: delivered outside the stores, service done, cancelled, not needed any more. A closed line can be <b>opened again</b> with a reason. Who did it, and why, stays on the line.',
    'Old sheet lines: pick <b>Old sheet line</b> in the stage filter, narrow it down if needed, then <b>Close the ... shown</b> to close them in one go.']],
  ['box', 'Production store stock', [
    'Menu > <b>Production store stock</b>: every Production store material (coding fluids, cartridges, ribbons, characters ...) with its stock, use per week, weeks left, reorder level and order quantity.',
    'Red and orange first: <b>Out of stock</b> and <b>Reorder now</b> are what Production will ask for. Their requests carry the store code (e.g. CF 001), so you can find the material here.',
    'View only. Tap the small <b>i</b> beside a heading for how a number is worked out.']],
  ['box', 'Spares stock (Engineering store)', [
    'Menu > <b>Spares stock (Engineering)</b>: every Engineering spare part with its stock now, use per week, weeks left, the level it is reordered at (worked out from use) and the usual order quantity.',
    'Pick <b>Reorder now</b>, <b>Order soon</b> or <b>Out of stock</b> to see what needs buying; search by SKU, description, part number or supplier.',
    'It is view only. Receiving, issuing and counting stay with the store in the Engineering console.']],
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
const HELP_PAGE = { 'Make a procurement request': '/new-request', 'Approve a request': '/', 'Procurement log: stages and closing': '/items', 'Spares stock (Engineering store)': '/stock', 'Production store stock': '/prd-stock', 'My approvals': true, 'Phone or laptop': true, 'Suggestions': true , 'Long lists': true};
const HELP_MINE = () => HELP.filter(h => { const g = HELP_PAGE[h[1]]; return g === true || (!!g && (typeof g === 'function' ? g() : canOpen(g))); });
function viewHelp(){
  return { title:'How to use', crumb:'Help', html: pageHead('How to use', 'The short version of each task.')
    + `<div class="grid g2">${HELP_MINE().map(([ic, t, steps]) => `<div class="card"><div class="card-h"><div><h3>${I[ic] || ''} ${esc(t)}</h3></div></div>
        <div class="card-b"><ol class="small" style="margin:0;padding-left:18px;line-height:1.55">${steps.map(x => `<li style="margin-bottom:4px">${x}</li>`).join('')}</ol></div></div>`).join('')}</div>` };
}
route('/help', viewHelp);
