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
const PAGES = [["/my-approvals", "procurement"], ["/help", "procurement"], ["/items", "procurement.requests"], ["/new-request", "procurement"], ["/spares", "procurement"], ["/", "procurement.requests"]];   // route prefix -> page, first match wins
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
  const auth = await api('/webhook/auth/api/me');
  if (auth.user && auth.user.must_change){ rememberHere(); toLandingKeepToken(); throw new Error('Password change required'); }
  let data = { items: [] }, limited = false;
  try { data = await api('/webhook/procurement/api/items'); } catch (e) { if (e && e.status === 403) limited = true; else throw e; }   // an approver without the console's pages still gets My approvals and the approval page
  S = { me: meFromAuth(auth, 'procurement'), items: data.items || [], limited };
  resetIdleTimer();
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

// The 7 fields this workflow never fills in - the only ones the console can
// edit. Kept as one list so the detail modal, the edit form, and the
// PATCH payload builder can't drift out of sync with each other.
const EDITABLE_FIELDS = [
  { key: 'vendor', label: 'Vendor' },
  { key: 'po_number', label: 'PO Number' },
  { key: 'term_of_payment', label: 'Term Of Payment' },
  { key: 'rfp_number', label: 'RFP Number' },
  { key: 'management_review_odl', label: 'Management Review (ODL)' },
  { key: 'vendor_delivery_date', label: 'Vendor Delivery Date' },
  { key: 'department_receival_status', label: 'Department Receival Status' },
];

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
function statusBadgeClass(status){
  const s = String(status||'').toLowerCase();
  if (s.includes('approved')) return 'b-brand';
  if (s.includes('rejected')) return 'b-slate';
  return 'b-slate';
}
function matchesItemQuery(it, q){
  if (!q) return true;
  const haystack = [it.item_id, it.requestor, it.material_name, it.item_detail, it.material_type, it.department, it.purpose].map(v => String(v||'').toLowerCase()).join(' ');
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

// Detail + edit lives in one wide modal (not an inline row expansion) - more
// room for the full record, and the edit form is right there without
// needing a narrow table row to carry it.
function openItemDetail(id){
  // Postgres bigserial ids come back as strings (node-postgres avoids precision
  // loss on int8 by not coercing to number), but the onclick="...(${it.id})"
  // that got us here embeds a bare numeric literal - compare as strings.
  const it = S.items.find(x => String(x.id) === String(id));
  if (!it) return;
  const canEdit = canEditHere();
  const readonlyRow = (label, value) => `<div class="kv-item"><div class="k">${esc(label)}</div><div class="v">${esc(value||'--')}</div></div>`;

  const body = `
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
    </div>
    <div class="divider"></div>
    <div class="row between" id="procDetailsHead" style="margin-bottom:12px">
      <div class="small muted">Procurement details (not set by the requisition flow)</div>
      ${canEdit ? `<button class="btn btn-primary btn-sm" id="startEditBtn">${I.edit} Edit</button>` : ''}
    </div>
    ${!canEdit ? `<div class="notice info">${I.info}<div>You have viewer access - filling in vendor/PO details requires an editor account.</div></div>` : ''}
    <div class="kv-grid" id="procDetailsView">
      ${EDITABLE_FIELDS.map(f => readonlyRow(f.label, it[f.key])).join('')}
    </div>
    <form id="editItemForm" novalidate style="display:none">
      <div class="grid g2">
        ${EDITABLE_FIELDS.map(f => `
          <div class="field"><label for="ei_${f.key}">${esc(f.label)}</label>
            <input class="inp" id="ei_${f.key}" value="${esc(it[f.key]||'')}"></div>`).join('')}
      </div>
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
      if (startEditBtn){
        startEditBtn.onclick = () => {
          viewGrid.hidden = true;
          startEditBtn.hidden = true;
          form.style.display = 'block';
        };
      }
      if (form){
        $('#cancelEditBtn', form).onclick = () => {
          form.style.display = 'none';
          viewGrid.hidden = false;
          if (startEditBtn) startEditBtn.hidden = false;
        };
        form.onsubmit = async (ev) => {
          ev.preventDefault();
          const payload = {};
          EDITABLE_FIELDS.forEach(f => { payload[f.key] = $('#ei_' + f.key, form).value.trim(); });
          const btn = form.querySelector('button[type=submit]');
          btn.disabled = true;
          try {
            // n8n serves a webhook with a ':id' in its path under its webhook id ("Procurement Item Patch Webhook")
            await api('/webhook/e3705766-d634-4852-ba77-62ccfdfb0786/procurement/api/items/' + id, { method:'PATCH', body: payload });
            Object.assign(it, payload);
            render();
            toast('Changes saved', 'Procurement details updated.', 'ok');
            openItemDetail(id);
          } catch (err) {
            toast('Could not save', err.message, 'err');
            btn.disabled = false;
          }
        };
      }
    },
  });
}

function viewItems(){
  const q = itemQuery.trim().toLowerCase();
  // Server already returns items ordered by request_date desc - filtering
  // preserves that order, no client-side re-sort needed.
  const rows = S.items.filter(it =>
    (!itemDeptFilter || it.department === itemDeptFilter) &&
    (!itemStatusFilter || it.request_status === itemStatusFilter) &&
    inDateRange(it.request_date, itemDateFrom, itemDateTo) &&
    matchesItemQuery(it, q));
  const departments = [...new Set(S.items.map(it => it.department).filter(Boolean))].sort();
  const statuses = [...new Set(S.items.map(it => it.request_status).filter(Boolean))].sort();

  return {
    title:'Procurement Log', crumb:'Modules',
    html: `
    ${pageHead('Procurement Log', 'Every procured item across all departments, sorted by request date.')}
    <div class="row filter-bar" style="margin-bottom:14px;flex-wrap:wrap;row-gap:10px">
      <div class="search filter-search">
        <span class="ic">${I.search}</span>
        <input class="inp" id="itemSearch" placeholder="Search item ID, requestor, material, item detail, purpose..." value="${esc(itemQuery)}">
      </div>
      <select class="inp filter-sel-status" id="itemDeptFilter">
        <option value="">All departments</option>
        ${departments.map(d => `<option value="${esc(d)}" ${itemDeptFilter===d?'selected':''}>${esc(d)}</option>`).join('')}
      </select>
      <select class="inp filter-sel-status" id="itemStatusFilter">
        <option value="">All statuses</option>
        ${statuses.map(s => `<option value="${esc(s)}" ${itemStatusFilter===s?'selected':''}>${esc(s)}</option>`).join('')}
      </select>
      <input type="date" class="inp" id="itemDateFrom" value="${esc(itemDateFrom)}" title="From date" style="max-width:150px">
      <input type="date" class="inp" id="itemDateTo" value="${esc(itemDateTo)}" title="To date" style="max-width:150px">
      <div class="spacer"></div>
    </div>
    <div class="card">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>
          <th>Request Date</th><th>Item ID</th><th>Requestor</th><th>Material</th><th>Item Detail</th>
          <th>Material Type</th><th>Qty &amp; Unit</th><th>Status</th>
        </tr></thead>
        <tbody>${rows.length ? rows.map(it => `
          <tr class="clickable" onclick="openItemDetail(${it.id})">
            <td data-label="Request Date">${esc(formatDate(it.request_date))}</td>
            <td class="mono" data-label="Item ID">${esc(it.item_id||'--')}</td>
            <td data-label="Requestor"><div class="person">${avatarEl(it.requestor)}<div class="person-txt"><span class="strong" title="${esc(it.requestor)}">${esc(it.requestor)}</span></div></div></td>
            <td data-label="Material">${esc(it.material_name||'--')}</td>
            <td data-label="Item Detail" style="max-width:280px;white-space:normal" title="${esc(it.item_detail||'')}">${esc(it.item_detail||'--')}</td>
            <td data-label="Material Type">${esc(it.material_type||'--')}</td>
            <td data-label="Qty & Unit">${esc(formatQty(it))}</td>
            <td data-label="Status">${it.request_status ? `<span class="badge ${statusBadgeClass(it.request_status)}">${esc(it.request_status)}</span>` : '--'}</td>
          </tr>`).join('') : `<tr><td colspan="8">${emptyState('box','No items match', 'Try a different search or filter.')}</td></tr>`}
        </tbody>
      </table></div>
    </div>`,
    bind(){
      $('#itemSearch').oninput = debounce((e) => { itemQuery = e.target.value; render(); }, 200);
      $('#itemSearch').focus();
      $('#itemSearch').setSelectionRange(itemQuery.length, itemQuery.length);
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
  } catch (e) { toast('Not recorded', e.message, 'err', 8000); }
  a.busy = false; render();
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
  if (a.done) return frame(head + `<div class="card"><div class="card-b">${emptyState('checkCircle', 'Decision recorded', esc(a.done), '<a class="btn btn-primary" href="#/my-approvals">Back to My approvals</a>')}</div></div>`);
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
  return frame(head + `<div class="card"><div class="tbl-wrap"><table class="tbl no-stack"><thead><tr><th>Item</th><th>Purpose</th><th>Qty</th><th>${d.can_decide ? 'Decision' : ''}</th></tr></thead><tbody>${rows}</tbody></table></div></div>` + bottom);
}
route('/approve/:batch', viewApprove);

/* ---- How to use (7 Nov 2026: every feature people notice has a short manual) ---- */
const HELP = [
  ['box', 'Make a procurement request', [
    'Menu > <b>Make a procurement request</b>. Pick the department the request is for, then the date it is needed by.',
    'Add each item: name, description, category, quantity, why. <b>Send for approval</b>: that department\'s manager, then the plant manager.',
    'Engineering requests (with the store parts list) are made in the Engineering console.']],
  ['check', 'Approve a request', [
    'An approval e-mail now links to the request in this console. Sign in with your e-mail and password and you land on it. You can also open it from <b>My approvals</b>.',
    'Approve or reject each item, then <b>Submit decisions</b>. A reason is needed when any item is rejected. Only the approver of the request\'s current step can decide it.']],
  ['check', 'My approvals', [
    'Menu > <b>My approvals</b> (the first item) lists everything waiting for you in this console.',
    'Four groups: <b>To approve</b> (requests that need your decision), <b>Assigned to you</b> (work to do), <b>Returned to you</b> (things you raised that were returned or rejected) and <b>Overdue in your area</b>.',
    'The orange number on the menu is the number of items on this page. It falls as you act.',
    '<b>Open</b> takes you straight to the item. A link in an e-mail or WhatsApp message does the same: sign in once with your e-mail and password and you land on that item.']],
  ['info', 'Phone or laptop', [
    'The small <b>Phone view / Laptop view</b> green button at the top right of the screen switches the layout. It starts from your screen and is remembered on this device.']],
  ['edit', 'Suggestions', [
    'The orange <b>Suggestions</b> button at the bottom right of every page lets you tell us what is wrong or missing. Tap it, write a line or two about what is confusing, slow or missing on that page, and send.',
    'It goes to the system team only. It changes nothing in the system.']],
];
// How to use shows a card only to people who can open its page (11 Nov 2026); cards not listed here are for everyone.
const HELP_PAGE = { 'Make a procurement request': '/new-request', 'Approve a request': '/' };
const HELP_MINE = () => HELP.filter(h => { const g = HELP_PAGE[h[1]]; return !g || (typeof g === 'function' ? g() : canOpen(g)); });
function viewHelp(){
  return { title:'How to use', crumb:'Help', html: pageHead('How to use', 'The short version of each task.')
    + `<div class="grid g2">${HELP_MINE().map(([ic, t, steps]) => `<div class="card"><div class="card-h"><div><h3>${I[ic] || ''} ${esc(t)}</h3></div></div>
        <div class="card-b"><ol class="small" style="margin:0;padding-left:18px;line-height:1.55">${steps.map(x => `<li style="margin-bottom:4px">${x}</li>`).join('')}</ol></div></div>`).join('')}</div>` };
}
route('/help', viewHelp);
