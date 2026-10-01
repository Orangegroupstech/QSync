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
function meFromAuth(auth, scope){
  const u = (auth && auth.user) || {};
  const editor = !!u.is_admin || ((auth && auth.edit) || []).includes(scope);
  return { id: u.id, name: u.name, role: u.is_admin ? 'admin' : '', is_admin: !!u.is_admin,
           permission: editor ? 'editor' : 'viewer', must_change: !!u.must_change };
}

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
    toLanding();
    throw new Error('Your session has expired. Please log in again.');
  }
  let json = {};
  try { json = await res.json(); } catch (e) { /* empty body */ }
  if (!res.ok) throw new Error(json.error || 'Something went wrong.');
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
  $('[data-close]', wrap).forEach(b => b.onclick = close);
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
const IDLE_LIMIT_MS = 10 * 60 * 1000;
let idleTimer = null;
function resetIdleTimer(){
  if (!S) return;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { logout('Signed out after 10 minutes of inactivity.'); }, IDLE_LIMIT_MS);
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
    { title:'Modules', items:[
      { path:'/items', label:'Procurement Log', icon:'box' },
      { path:'/new-request', label:'New Request', icon:'plus' },
    ] },
    { title:'Engineering Spares', items:[
      { path:'/spares/inventory', label:'Inventory', icon:'box' },
      { path:'/spares/inbound', label:'Inbound', icon:'arrowDown' },
      { path:'/spares/outbound', label:'Outbound', icon:'arrowUp' },
    ] },
  ];
  if (S.me.permission === 'editor') {
    groups.push({ title:'Admin', items:[ { path:'/admin/roles', label:'Roles', icon:'users' } ] });
  }
  return groups;
}

/* ---------------- Shell ---------------- */
function renderShell(inner, meta){
  const path = currentPath().split('?')[0];
  const navHtml = navModel().map(g => `
    <div class="nav-group">${esc(g.title)}</div>
    ${g.items.map(it => {
      const active = path === it.path || path.startsWith(it.path + '/');
      return `<a class="nav-item ${active?'active':''}" href="#${it.path}">
        <span class="ic">${I[it.icon]}</span><span>${esc(it.label)}</span></a>`;
    }).join('')}`).join('');

  return `
  <div class="shell">
    <div class="backdrop" onclick="document.body.classList.remove('nav-open')"></div>
    <aside class="sidebar">
      <div class="sidebar-top">
        <a href="#/" style="display:flex;align-items:center;gap:9px;text-decoration:none">
          <span class="logo-wrap"><span class="logo sm"><span class="berry"><i></i><i></i><b></b></span><span>ORANGE GROUP</span></span></span>
        </a>
        <button class="btn-icon hide-lg" style="color:var(--nav-text-dim)" onclick="document.body.classList.remove('nav-open')" aria-label="Close menu">${I.x}</button>
      </div>
      <div style="padding:0 16px 10px">
        <div style="font-size:11px;color:var(--nav-text-dim);letter-spacing:.13em;text-transform:uppercase;font-weight:700">OKL Console</div>
        <div style="font-size:11.5px;color:var(--nav-text-dim);margin-top:2px">Procurement</div>
      </div>
      <div class="sidebar-scroll">${navHtml}</div>
      <div class="sidebar-foot">
        <a class="btn btn-ghost btn-sm btn-block" style="margin-bottom:8px;border-color:rgba(255,255,255,.12);color:var(--nav-text)" href="../">${I.chevL} Back to OKL Console</a>
        <div class="user-chip">
          ${avatarEl(S.me.name)}
          <div style="min-width:0;flex:1"><div class="nm">${esc(S.me.name)}</div><div class="rl">${S.me.permission==='editor'?'Editor':'Viewer'}</div></div>
          <span style="color:var(--nav-text-dim)">${I.chevR}</span>
        </div>
        <button class="btn btn-ghost btn-sm btn-block" style="margin-top:8px;border-color:rgba(255,255,255,.12);color:var(--nav-text)"
          onclick="logout()">${I.logout} Sign out</button>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="btn-icon menu-btn" onclick="document.body.classList.add('nav-open')" aria-label="Open menu">${I.menu}</button>
        <a href="#/" class="only-mobile" style="line-height:0" aria-label="OKL Console home">
          <span class="logo sm" style="border-width:1.5px;box-shadow:0 0 0 1.5px var(--brand)">
            <span class="berry"><i></i><i></i><b></b></span><span>ORANGE GROUP</span></span></a>
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
  if (auth.user && auth.user.must_change){ toLandingKeepToken(); throw new Error('Password change required'); }
  const data = await api('/webhook/procurement/api/items');
  S = { me: meFromAuth(auth, 'procurement'), items: data.items };
  resetIdleTimer();
}
function render(){
  const app = document.getElementById('app');
  try {
    if (!S){ toLanding(); return; }
    const path = currentPath();
    const m = matchRoute(path);
    if (!m){
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
    app.innerHTML = renderShell(out.html, out);
    document.body.classList.remove('nav-open');
    if (out.bind) { try { out.bind(); } catch(e){ console.error(e); } }
    window.scrollTo({ top:0 });
  } catch (err) {
    console.error(err);
    app.innerHTML = fatalErrorHtml(err);
  }
}
window.addEventListener('hashchange', render);

(async function boot(){
  try {
    if (!getToken()){ toLanding(); return; }
    try { await bootstrap(); }
    catch (e) { if (!getToken()) return; toLandingKeepToken(); return; }
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
  const haystack = [it.item_id, it.requestor, it.material_name, it.material_type, it.department, it.purpose].map(v => String(v||'').toLowerCase()).join(' ');
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
  const canEdit = S.me.permission === 'editor';
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
            await api('/webhook/procurement/api/items/' + id, { method:'PATCH', body: payload });
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
        <input class="inp" id="itemSearch" placeholder="Search item ID, requestor, material, purpose..." value="${esc(itemQuery)}">
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
          <th>Request Date</th><th>Item ID</th><th>Requestor</th><th>Material</th>
          <th>Material Type</th><th>Qty &amp; Unit</th><th>Status</th>
        </tr></thead>
        <tbody>${rows.length ? rows.map(it => `
          <tr class="clickable" onclick="openItemDetail(${it.id})">
            <td data-label="Request Date">${esc(formatDate(it.request_date))}</td>
            <td class="mono" data-label="Item ID">${esc(it.item_id||'--')}</td>
            <td data-label="Requestor"><div class="row" style="gap:10px">${avatarEl(it.requestor)}<div class="strong">${esc(it.requestor)}</div></div></td>
            <td data-label="Material">${esc(it.material_name||'--')}</td>
            <td data-label="Material Type">${esc(it.material_type||'--')}</td>
            <td data-label="Qty & Unit">${esc(formatQty(it))}</td>
            <td data-label="Status">${it.request_status ? `<span class="badge ${statusBadgeClass(it.request_status)}">${esc(it.request_status)}</span>` : '--'}</td>
          </tr>`).join('') : `<tr><td colspan="7">${emptyState('box','No items match', 'Try a different search or filter.')}</td></tr>`}
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
   New Request - a launcher, not a rebuilt form. Lists every
   department (Engineering plus each department that has a
   requester on file), mirroring the hosted requisition landing
   page; each tile opens that department's hosted form in a new tab.
   ============================================================ */
const REQUISITION_URL = 'https://orangegroupsai.online/webhook/procurement/requisition';
function viewNewRequest(){
  if (!rolesCache && !rolesLoading && !rolesError) loadRoles();
  const deptNames = [...new Set((rolesCache || [])
    .filter(r => r.flow === 'dept' && r.stage === 'requester' && r.department)
    .map(r => r.department))].sort();
  const departments = ['Engineering', ...deptNames];

  const optionCard = (name) => `
    <a class="card new-request-card" href="${esc(REQUISITION_URL + '?department=' + encodeURIComponent(name))}" target="_blank" rel="noopener"
       style="display:block;text-decoration:none;color:inherit">
      <div class="card-h"><h3>${esc(name)}</h3></div>
      <div class="card-b">
        <p class="small muted">Submit a material requisition for ${esc(name)}.</p>
        <div class="row" style="margin-top:14px;gap:6px;color:var(--brand-600);font-weight:600;font-size:13px">
          Open form ${I.externalLink}
        </div>
      </div>
    </a>`;

  let note = '';
  if (rolesLoading) note = `<div class="hint" style="margin-bottom:14px">${I.info}<span>Loading the other departments...</span></div>`;
  else if (rolesError) note = `<div class="notice info" style="margin-bottom:14px">${I.info}<div>Could not load the other departments (${esc(rolesError)}).
      <button class="btn btn-ghost btn-sm" onclick="retryRoles()">Retry</button></div></div>`;

  return {
    title:'New Request', crumb:'Modules',
    html: `
    <style>.new-request-card{transition:.16s ease}
      .new-request-card:hover{border-color:var(--brand);box-shadow:0 8px 24px rgba(16,25,20,.08);transform:translateY(-2px)}</style>
    ${pageHead('New Request', 'Pick the department this request is for - each opens that department\'s hosted form in a new tab.')}
    ${note}
    <div class="grid g3">${departments.map(optionCard).join('')}</div>`,
    bind(){},
  };
}
route('/new-request', () => viewNewRequest());

/* ============================================================
   Engineering Spares - simple read-only views straight off the same
   .xlsx workbook the requisition form's SKU catalog already reads
   (Plantilla stock/Inbound/Outbond tabs). Not part of the bootstrap
   fetch since they're heavier and not needed on every visit - loaded
   on demand, once per session, the first time each page is opened.
   ============================================================ */
const sparesCache = { inventory: null, inbound: null, outbound: null };
const sparesLoading = { inventory: false, inbound: false, outbound: false };
const sparesError = { inventory: '', inbound: '', outbound: '' };

async function loadSpares(kind, path){
  if (sparesCache[kind] || sparesLoading[kind]) return;
  sparesLoading[kind] = true;
  sparesError[kind] = '';
  render();
  try {
    const data = await api('/webhook/procurement/api/spares/' + path);
    sparesCache[kind] = Array.isArray(data.rows) ? data.rows : [];
  } catch (err) {
    sparesError[kind] = err.message;
  } finally {
    sparesLoading[kind] = false;
    render();
  }
}
function retrySpares(kind, path){
  sparesError[kind] = '';
  loadSpares(kind, path);
}

function viewSpares(kind, path, title, desc){
  if (!sparesCache[kind] && !sparesLoading[kind] && !sparesError[kind]) loadSpares(kind, path);
  const rows = sparesCache[kind] || [];
  const columns = [...new Set(rows.flatMap(r => Object.keys(r)))];

  let bodyHtml;
  if (sparesLoading[kind]) {
    bodyHtml = `<div class="card"><div class="card-b">${emptyState('box', 'Loading...', 'Fetching the latest data from the sheet.')}</div></div>`;
  } else if (sparesError[kind]) {
    bodyHtml = `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(sparesError[kind]),
      `<button class="btn btn-primary" onclick="retrySpares('${kind}','${path}')">Retry</button>`)}</div></div>`;
  } else if (!rows.length) {
    bodyHtml = `<div class="card"><div class="card-b">${emptyState('box', 'No rows found', '')}</div></div>`;
  } else {
    bodyHtml = `<div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr>${columns.map(col => `<th>${esc(col)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${columns.map(col => `<td data-label="${esc(col)}">${esc(r[col] ?? '--')}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div></div>`;
  }

  return {
    title, crumb:'Engineering Spares',
    html: `${pageHead(title, desc)}${bodyHtml}`,
    bind(){},
  };
}
route('/spares/inventory', () => viewSpares('inventory', 'inventory', 'Spares Inventory', 'Engineering spare parts stock, from the same sheet the requisition form looks SKUs up against.'));
route('/spares/inbound', () => viewSpares('inbound', 'inbound', 'Spares Inbound', 'Engineering spare parts received.'));
route('/spares/outbound', () => viewSpares('outbound', 'outbound', 'Spares Outbound', 'Engineering spare parts issued.'));
route('/admin/roles', () => viewRoles());

/* ============================================================
   Roles admin (OKL_PROC_role_directory) - editor only.
   Editing works for every row (Engineering + Dept, any stage).
   Adding/deleting is intentionally scoped to dept-requester rows only -
   every other role is looked up as exactly one row per its scope with no
   disambiguation logic, so a second Engineering Manager (say) would just be
   silently and arbitrarily picked between, and deleting the only manager
   for a department breaks that department's approval routing outright.
   Dept requesters are the one role-type built to safely hold more than one
   person (name-matched at submission, falls back to the first if unmatched).
   ============================================================ */
const ROLE_DEPARTMENTS = ['Production', 'Quality Assurance', 'Quality Control', 'Safety/HSE', 'Warehouse', 'Business Support/HR'];
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

function roleFormFields(row, idPrefix, opts){
  const showDepartment = !!(opts && opts.showDepartment);
  const departmentField = showDepartment ? `
    <div class="field"><label for="${idPrefix}Department">Department</label>
      <select class="inp" id="${idPrefix}Department">
        <option value="">Select...</option>
        ${ROLE_DEPARTMENTS.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('')}
      </select>
      <div class="err-msg hide" data-err="${idPrefix}Department"></div></div>` : '';
  return `
    ${departmentField}
    <div class="field"><label for="${idPrefix}Name">Full name</label>
      <input class="inp" id="${idPrefix}Name" value="${esc(row ? row.name : '')}">
      <div class="err-msg hide" data-err="${idPrefix}Name"></div></div>
    <div class="field"><label for="${idPrefix}Email">Email</label>
      <input class="inp" id="${idPrefix}Email" type="email" value="${esc(row ? row.email : '')}">
      <div class="err-msg hide" data-err="${idPrefix}Email"></div></div>`;
}
function readRoleForm(idPrefix, scope){
  const deptEl = $('#' + idPrefix + 'Department', scope);
  return {
    department: deptEl ? deptEl.value : undefined,
    name: $('#' + idPrefix + 'Name', scope).value.trim(),
    email: $('#' + idPrefix + 'Email', scope).value.trim(),
  };
}

function openAddRole(){
  const body = roleFormFields(null, 'addRole', { showDepartment: true });
  const close = openModal({
    title: 'Add requester',
    size: 'wide',
    body,
    footer: `<button class="btn btn-ghost" data-cancel>Cancel</button>
             <button class="btn btn-primary" id="addRoleSaveBtn">${I.plus} Add</button>`,
    onMount(wrap){
      $('[data-cancel]', wrap).onclick = close;
      $('#addRoleSaveBtn', wrap).onclick = async () => {
        clearErrors(wrap);
        const f = readRoleForm('addRole', wrap);
        let ok = true;
        if (!f.department) { setErr('addRoleDepartment', 'Choose a department.', wrap); ok = false; }
        if (!f.name) { setErr('addRoleName', 'Enter a name.', wrap); ok = false; }
        if (!f.email) { setErr('addRoleEmail', 'Enter an email.', wrap); ok = false; }
        if (!ok) return;
        const btn = $('#addRoleSaveBtn', wrap);
        btn.disabled = true;
        try {
          const res = await api('/webhook/procurement/api/roles', { method:'POST', body: f });
          if (!rolesCache) rolesCache = [];
          rolesCache.push(res.role);
          S.roles = rolesCache;
          close();
          render();
          toast('Requester added', esc(res.role.name) + ' can now submit for ' + esc(res.role.department) + '.', 'ok');
        } catch (err) {
          toast('Could not add requester', err.message, 'err');
          btn.disabled = false;
        }
      };
    },
  });
}

function openEditRole(roleKey){
  const row = (rolesCache || []).find(r => r.role_key === roleKey);
  if (!row) return;
  const context = `
    <div class="kv-grid" style="margin-bottom:14px">
      <div class="kv-item"><div class="k">Flow</div><div class="v">${esc(row.flow === 'engineering' ? 'Engineering' : 'Dept')}</div></div>
      <div class="kv-item"><div class="k">Role</div><div class="v">${esc(row.label || row.stage)}</div></div>
      <div class="kv-item"><div class="k">Department</div><div class="v">${esc(row.department || '--')}</div></div>
    </div>`;
  const body = context + roleFormFields(row, 'editRole', { showDepartment: false });
  const close = openModal({
    title: 'Edit role',
    sub: row.label || row.stage,
    size: 'wide',
    body,
    footer: `<button class="btn btn-ghost" data-cancel>Cancel</button>
             <button class="btn btn-primary" id="editRoleSaveBtn">${I.check} Save</button>`,
    onMount(wrap){
      $('[data-cancel]', wrap).onclick = close;
      $('#editRoleSaveBtn', wrap).onclick = async () => {
        clearErrors(wrap);
        const f = readRoleForm('editRole', wrap);
        let ok = true;
        if (!f.name) { setErr('editRoleName', 'Enter a name.', wrap); ok = false; }
        if (!f.email) { setErr('editRoleEmail', 'Enter an email.', wrap); ok = false; }
        if (!ok) return;
        const btn = $('#editRoleSaveBtn', wrap);
        btn.disabled = true;
        try {
          const res = await api('/webhook/procurement/api/roles/' + encodeURIComponent(roleKey), { method:'PATCH', body: { name: f.name, email: f.email } });
          Object.assign(row, res.role);
          close();
          render();
          toast('Saved', esc(row.name) + ' updated.', 'ok');
        } catch (err) {
          toast('Could not save', err.message, 'err');
          btn.disabled = false;
        }
      };
    },
  });
}

async function deleteRole(roleKey){
  const row = (rolesCache || []).find(r => r.role_key === roleKey);
  if (!row) return;
  const yes = await confirmDialog('Delete this requester?',
    `<b>${esc(row.name)}</b> will no longer be able to submit requests for ${esc(row.department)}.`,
    'Delete', 'danger');
  if (!yes) return;
  try {
    await api('/webhook/procurement/api/roles/' + encodeURIComponent(roleKey), { method:'DELETE' });
    rolesCache = (rolesCache || []).filter(r => r.role_key !== roleKey);
    S.roles = rolesCache;
    render();
    toast('Requester deleted', esc(row.name) + ' removed.', 'ok');
  } catch (err) {
    toast('Could not delete', err.message, 'err');
  }
}

function viewRoles(){
  const canEdit = S.me.permission === 'editor';
  if (!canEdit) {
    return {
      title:'Roles', crumb:'Admin',
      html: `${pageHead('Roles')}<div class="card"><div class="card-b">
        <div class="notice info">${I.info}<div>You have viewer access - managing roles requires an editor account.</div></div>
      </div></div>`,
      bind(){},
    };
  }

  if (!rolesCache && !rolesLoading && !rolesError) loadRoles();
  const rows = rolesCache || [];

  let bodyHtml;
  if (rolesLoading) {
    bodyHtml = `<div class="card"><div class="card-b">${emptyState('box', 'Loading...', 'Fetching roles.')}</div></div>`;
  } else if (rolesError) {
    bodyHtml = `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(rolesError),
      `<button class="btn btn-primary" onclick="retryRoles()">Retry</button>`)}</div></div>`;
  } else if (!rows.length) {
    bodyHtml = `<div class="card"><div class="card-b">${emptyState('box', 'No roles found', '')}</div></div>`;
  } else {
    bodyHtml = `<div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Flow</th><th>Role</th><th>Department</th><th>Name</th><th>Email</th><th></th></tr></thead>
      <tbody>${rows.map(r => `
        <tr>
          <td data-label="Flow">${esc(r.flow === 'engineering' ? 'Engineering' : 'Dept')}</td>
          <td data-label="Role">${esc(r.label || r.stage)}</td>
          <td data-label="Department">${esc(r.department || '--')}</td>
          <td data-label="Name">${esc(r.name)}</td>
          <td data-label="Email">${esc(r.email)}</td>
          <td data-label="Actions" class="no-print">
            <button class="btn btn-ghost btn-sm" onclick="openEditRole('${esc(r.role_key)}')">${I.edit} Edit</button>
            ${r.flow === 'dept' && r.stage === 'requester' ? `<button class="btn btn-ghost btn-sm" onclick="deleteRole('${esc(r.role_key)}')">${I.x} Delete</button>` : ''}
          </td>
        </tr>`).join('')}</tbody>
    </table></div></div>`;
  }

  return {
    title:'Roles', crumb:'Admin',
    html: `${pageHead('Roles', 'Everyone who can submit or approve a request, across both flows.',
      `<button class="btn btn-primary" onclick="openAddRole()">${I.plus} Add requester</button>`)}${bodyHtml}`,
    bind(){},
  };
}

/* ============================================================
   Settings (account info, sign out)
   ============================================================ */
