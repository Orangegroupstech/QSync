"use strict";

/* ---------------- Icons (trimmed subset, ported from QSync's app.js) ---------------- */
const I = (() => {
  const w = (p, extra) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra||''}>${p}</svg>`;
  return {
    plus: w('<path d="M12 5v14M5 12h14"/>'),
    check: w('<path d="M20 6L9 17l-5-5"/>'),
    checkCircle: w('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'),
    x: w('<path d="M18 6L6 18M6 6l12 12"/>'),
    users: w('<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7" r="3.4"/><path d="M22 20v-1.5a4 4 0 0 0-3-3.85"/><path d="M16.5 3.6a4 4 0 0 1 0 7"/>'),
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
    key: w('<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.8 12.2L21 2M17 6l3 3M14 9l3 3"/>'),
    download: w('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>'),
    layers: w('<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>'),
    box: w('<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>'),
    activity: w('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'),
    externalLink: w('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/>'),
    clock: w('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>'),
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
function download(filename, text, type){
  const blob = new Blob([text], {type: type||'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

/* ---------------- API layer ----------------
   Session-gated, same pattern as QSync's own app.js: a bearer token from
   /webhook/auth/api/login (landing page), sent as a plain Authorization header (no
   "Bearer " prefix, matching what the backend's session-check expects). */
// sessionStorage throws in some sandboxed/embedded viewing contexts (SecurityError:
// "document is sandboxed and lacks the allow-same-origin flag"). Fall back to an
// in-memory token so the app still works there - it just won't survive a reload.
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
let S = null; // { me, accounts: [...], staff: [...], defaultPin }

/* ---------------- Toast / modal / confirm (ported from QSync's app.js) ---------------- */
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

/* ---------------- Idle timeout + logout (server-enforced too - session TTL matches QSync's 10 min) ---------------- */
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
  return [
    { title:'Admin', items:[
      { path:'/people', label:'People', icon:'users' },
      { path:'/audit', label:'Activity', icon:'activity' },
    ] },
  ];
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
        <a href="#/" style="display:flex;flex-direction:column;align-items:flex-start;gap:7px;text-decoration:none">
          <span class="brand-img"><img src="../logo.png" alt="Orange Kalbe Limited"></span><span class="brand-name">ORANGE KALBE LIMITED</span>
        </a>
        <button class="btn-icon hide-lg" style="color:var(--nav-text-dim)" onclick="document.body.classList.remove('nav-open')" aria-label="Close menu">${I.x}</button>
      </div>
      <div style="padding:0 16px 10px">
        <div style="font-size:13px;font-weight:700;color:#fff;letter-spacing:.02em">Users</div>
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
        <a href="#/" class="only-mobile" style="line-height:0" aria-label="Home">
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
async function loadPeople(){
  const [acc, staff] = await Promise.all([api('/webhook/users/api/accounts'), api('/webhook/users/api/staff-without-account')]);
  S.accounts = acc.accounts || []; S.defaultPin = acc.default_pin || ''; S.staff = staff.staff || [];
}
async function bootstrap(){
  const auth = await api('/webhook/auth/api/me');
  if (auth.user && auth.user.must_change){ toLandingKeepToken(); throw new Error('Password change required'); }
  if (!auth.user || !auth.user.is_admin){ toLandingKeepToken(); throw new Error('Admins only'); }
  S = { me: meFromAuth(auth, 'users'), accounts: [], staff: [], defaultPin: '' };
  await loadPeople();
  resetIdleTimer();
}
function loadError(err){
  return `<div style="max-width:480px;margin:80px auto;padding:0 16px;text-align:center;font-family:var(--font,system-ui,sans-serif)">
    <h2 style="color:#B3261E">Could not load Users</h2>
    <p style="color:#565E6B;font-size:13.5px">${esc(err.message)}</p>
    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
  </div>`;
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
   People (User Management) - admins only
   ============================================================ */
const CONSOLES = [ { key:'employees', label:'Employees' }, { key:'procurement', label:'Procurement' }, { key:'qsync', label:'QSync' } ];
const SIGNOFFS = [ { key:'signoff.production', label:'Production' }, { key:'signoff.ipqa', label:'IPQA' },
                   { key:'signoff.qa_supervisor', label:'QA Supervisor' }, { key:'signoff.qc_supervisor', label:'QC Supervisor' } ];
const scopeLabel = k => (CONSOLES.concat(SIGNOFFS).find(x => x.key === k) || { label: k }).label;
let peopleState = { q:'', status:'', tab:'accounts' };

const fmtWhen = iso => iso ? new Date(iso).toLocaleString('en-GB', { timeZone:'Africa/Lagos', dateStyle:'medium', timeStyle:'short' }) : 'Never';
function accessChips(a){
  const chips = [];
  if (a.is_admin) chips.push(`<span class="badge b-brand">Admin</span>`);
  (a.edit || []).forEach(k => chips.push(`<span class="chip">Edit ${esc(scopeLabel(k))}</span>`));
  (a.signoff || []).forEach(k => chips.push(`<span class="chip">Signs ${esc(scopeLabel(k))}</span>`));
  return chips.length ? chips.join(' ') : '<span class="muted small">Read only</span>';
}
function statusBadges(a){
  const out = [];
  out.push(a.active ? '<span class="badge b-ok"><span class="dot"></span>Active</span>' : '<span class="badge b-slate">Deactivated</span>');
  if (a.locked) out.push('<span class="badge b-warn">Locked</span>');
  if (a.must_change) out.push('<span class="badge b-slate">Default PIN</span>');
  return out.join(' ');
}
function filteredAccounts(){
  const q = peopleState.q.trim().toLowerCase();
  return S.accounts.filter(a => {
    if (q && !(a.name + ' ' + (a.email || '')).toLowerCase().includes(q)) return false;
    switch (peopleState.status) {
      case 'active': return a.active;
      case 'inactive': return !a.active;
      case 'admin': return a.is_admin;
      case 'locked': return a.locked;
      case 'default': return a.must_change;
      default: return true;
    }
  });
}

function viewPeople(){
  const total = S.accounts.length;
  const active = S.accounts.filter(a => a.active).length;
  const onDefault = S.accounts.filter(a => a.must_change && a.active).length;
  const admins = S.accounts.filter(a => a.is_admin && a.active).length;
  const tab = peopleState.tab;
  const rows = filteredAccounts();
  const accountsTable = `
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px">
        <div class="row" style="gap:10px">
          <div class="search filter-search"><span class="ic">${I.search}</span>
            <input class="inp" id="pplQ" style="padding-left:34px;border-radius:20px" placeholder="Search by name or email" value="${esc(peopleState.q)}"></div>
          <select class="inp" id="pplStatus" style="width:auto;min-width:160px">
            ${[['','All people'],['active','Active'],['inactive','Deactivated'],['admin','Admins'],['locked','Locked'],['default','Still on default PIN']]
              .map(([v,l]) => `<option value="${v}" ${peopleState.status===v?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Person</th><th>Access</th><th>Status</th><th>Last sign-in</th><th></th></tr></thead>
        <tbody>${rows.length ? rows.map(a => `<tr>
          <td data-label="Person"><div class="row" style="gap:10px">${avatarEl(a.name)}
            <div style="min-width:0"><div class="strong">${esc(a.name)}</div>
            <div class="tiny muted">${esc(a.email || 'no email')} &middot; ${a.linked ? 'linked to Employee DB' : 'standalone'}</div></div></div></td>
          <td data-label="Access">${accessChips(a)}</td>
          <td data-label="Status">${statusBadges(a)}</td>
          <td class="small" data-label="Last sign-in">${esc(fmtWhen(a.last_login_at))}</td>
          <td style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="openManage(${a.id})">${I.edit} Manage</button></td>
        </tr>`).join('') : `<tr><td colspan="5" class="muted" style="padding:16px">No matching people.</td></tr>`}</tbody>
      </table></div>
    </div>`;
  const staffTable = `
    <div class="card"><div class="card-h"><h3>Staff without an account</h3>
      <div class="sub">People in the Employee DB (staff) who cannot sign in yet.</div></div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Name</th><th>Department</th><th>Email</th><th></th></tr></thead>
        <tbody>${S.staff.length ? S.staff.map(p => `<tr>
          <td data-label="Name"><div class="strong">${esc(p.name)}</div><div class="tiny muted mono">${esc(p.enroll_id)}</div></td>
          <td data-label="Department">${esc(p.department || '--')}</td>
          <td class="small" data-label="Email">${esc(p.email || 'none on record')}</td>
          <td style="text-align:right"><button class="btn btn-primary btn-sm" onclick="addFromStaff('${esc(p.enroll_id)}')">${I.plus} Create account</button></td>
        </tr>`).join('') : `<tr><td colspan="4" class="muted" style="padding:16px">Every staff member already has an account.</td></tr>`}</tbody>
      </table></div></div>`;
  return {
    title:'People', crumb:'Admin',
    html: `
    ${pageHead('People', 'Everyone who can sign in. Add people, choose what they can edit, reset passwords.',
      `<button class="btn btn-primary" onclick="openAddPerson()">${I.plus} Add person</button>`)}
    <div class="grid g4" style="margin-bottom:16px">
      <div class="stat"><div class="lbl">People</div><div class="val">${total}</div><div class="meta">${active} active</div></div>
      <div class="stat"><div class="lbl">Admins</div><div class="val">${admins}</div><div class="meta">active</div></div>
      <div class="stat"><div class="lbl">Still on default PIN</div><div class="val">${onDefault}</div><div class="meta">have not changed it yet</div></div>
      <div class="stat"><div class="lbl">Staff without account</div><div class="val">${S.staff.length}</div><div class="meta">in the Employee DB</div></div>
    </div>
    <div class="row" style="gap:8px;margin-bottom:12px">
      <button class="btn ${tab==='accounts'?'btn-primary':'btn-ghost'} btn-sm" onclick="setPeopleTab('accounts')">Accounts</button>
      <button class="btn ${tab==='staff'?'btn-primary':'btn-ghost'} btn-sm" onclick="setPeopleTab('staff')">Staff without an account (${S.staff.length})</button>
    </div>
    ${tab === 'accounts' ? accountsTable : staffTable}`,
    bind(){
      const q = $('#pplQ');
      if (q) q.addEventListener('input', e => { peopleState.q = e.target.value; render();
        const el = $('#pplQ'); if (el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } });
      const st = $('#pplStatus'); if (st) st.onchange = e => { peopleState.status = e.target.value; render(); };
    },
  };
}
route('/', () => viewPeople());
route('/people', () => viewPeople());
function setPeopleTab(t){ peopleState.tab = t; render(); }
async function refreshPeople(){ await loadPeople(); render(); }

async function createAccount(payload){
  const res = await api('/webhook/users/api/create', { method:'POST', body: payload });
  await loadPeople();
  return res;
}
async function addFromStaff(enrollId){
  const p = S.staff.find(x => x.enroll_id === enrollId); if (!p) return;
  if (!p.email){ toast('No email on record', esc(p.name) + ' needs a work email in the Employee DB before they can sign in.', 'err', 7000); return; }
  if (!(await confirmDialog('Create account', `Create an account for <b>${esc(p.name)}</b> (${esc(p.email)})? They start on the default PIN and must change it at first sign-in.`, 'Create account'))) return;
  try { const res = await createAccount({ enroll_id: enrollId }); render(); openManage(res.id); toast('Account created', esc(p.name) + ' can now sign in with the default PIN.', 'ok'); }
  catch (err) { toast('Could not create account', err.message, 'err', 7000); }
}
function openAddPerson(){
  const staffOpts = S.staff.map(p => `<option value="${esc(p.enroll_id)}">${esc(p.name)}${p.department ? ' - ' + esc(p.department) : ''}${p.email ? '' : ' (no email)'}</option>`).join('');
  openModal({
    title:'Add person', size:'wide', sub:'They start on the default PIN and must change it at first sign-in.',
    body:`<form id="addForm" novalidate>
      <div class="field"><label>Who is this?</label>
        <select class="inp" id="apMode"><option value="staff">Someone in the Employee DB (staff)</option><option value="new">Someone not in the Employee DB</option></select></div>
      <div id="apStaffBox"><div class="field"><label for="apStaff">Staff member</label>
        <select class="inp" id="apStaff"><option value="">Select...</option>${staffOpts}</select>
        <div class="hint">${I.info}<span>Their name, email and phone come from the Employee DB.</span></div></div></div>
      <div id="apNewBox" class="hide"><div class="grid g2">
        <div class="field"><label for="apName">Full name</label><input class="inp" id="apName" maxlength="100"></div>
        <div class="field"><label for="apEmail">Email (they sign in with it)</label><input class="inp" id="apEmail" type="email"></div></div>
        <div class="field"><label for="apPhone">Phone (optional)</label><input class="inp" id="apPhone" maxlength="20"></div></div>
      <div class="err-msg hide" data-err="apMode"></div>
    </form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>Create account</button>`,
    onMount:(w, close) => {
      const mode = $('#apMode', w);
      mode.onchange = () => { $('#apStaffBox', w).classList.toggle('hide', mode.value !== 'staff'); $('#apNewBox', w).classList.toggle('hide', mode.value !== 'new'); };
      $('[data-save]', w).onclick = async () => {
        clearErrors(w);
        const payload = mode.value === 'staff'
          ? { enroll_id: $('#apStaff', w).value }
          : { name: $('#apName', w).value.trim(), email: $('#apEmail', w).value.trim(), phone: $('#apPhone', w).value.trim() };
        if (mode.value === 'staff' && !payload.enroll_id) return setErr('apMode', 'Choose a staff member.', w);
        if (mode.value === 'new' && (!payload.name || !payload.email)) return setErr('apMode', 'A name and an email are required.', w);
        const btn = $('[data-save]', w); btn.disabled = true;
        try { const res = await createAccount(payload); close(); render(); openManage(res.id); toast('Account created', 'They can sign in with the default PIN.', 'ok'); }
        catch (err) { setErr('apMode', err.message, w); btn.disabled = false; }
      };
    },
  });
}

function openManage(id){
  const a = S.accounts.find(x => x.id === id); if (!a) return;
  const has = k => (a.edit || []).includes(k) || (a.signoff || []).includes(k);
  const box = (k, label) => `<label class="row" style="gap:8px;margin:6px 0;font-weight:500"><input type="checkbox" data-scope="${k}" ${has(k)?'checked':''}> ${esc(label)}</label>`;
  const isSelf = a.id === S.me.id;
  openModal({
    title: a.name, size:'wide', sub: (a.email || 'no email') + (a.linked ? ' - linked to the Employee DB' : ' - standalone'),
    body:`
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:12px">${statusBadges(a)} ${a.is_admin ? '<span class="badge b-brand">Admin</span>' : ''}</div>
      <div class="grid g2">
        <div><div class="strong" style="margin-bottom:4px">Can edit</div>
          <div class="small muted" style="margin-bottom:6px">Everyone signed in can read every console; this adds the right to change things.</div>
          ${CONSOLES.map(c => box(c.key, c.label)).join('')}</div>
        <div><div class="strong" style="margin-bottom:4px">QC sign-off roles</div>
          <div class="small muted" style="margin-bottom:6px">Who may sign QC stages with their password.</div>
          ${SIGNOFFS.map(c => box(c.key, c.label)).join('')}</div>
      </div>
      ${a.is_admin ? `<div class="notice info" style="margin-top:12px">${I.info}<div>Admins can edit everything and manage people. Sign-off roles are still ticked individually.</div></div>` : ''}
      <div class="divider"></div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" data-act="reset">${I.key} Reset to default PIN</button>
        ${a.locked ? `<button class="btn btn-ghost btn-sm" data-act="unlock">Unlock</button>` : ''}
        <button class="btn btn-ghost btn-sm" data-act="${a.active ? 'deactivate' : 'activate'}" ${isSelf && a.active ? 'disabled' : ''}>${a.active ? 'Deactivate' : 'Reactivate'}</button>
        <button class="btn btn-ghost btn-sm" data-act="${a.is_admin ? 'remove_admin' : 'make_admin'}" ${isSelf && a.is_admin ? 'disabled' : ''}>${a.is_admin ? 'Remove admin' : 'Make admin'}</button>
      </div>
      <div class="small muted" style="margin-top:10px">Last sign-in: ${esc(fmtWhen(a.last_login_at))}</div>`,
    footer:`<button class="btn btn-ghost" data-close>Close</button><button class="btn btn-primary" data-save>Save access</button>`,
    onMount:(w, close) => {
      $('[data-save]', w).onclick = async () => {
        const scopes = $$('input[data-scope]', w).filter(c => c.checked).map(c => c.dataset.scope);
        try { await api('/webhook/users/api/grants', { method:'POST', body:{ id: a.id, scopes } }); await loadPeople(); close(); render(); toast('Access saved', esc(a.name) + "'s access has been updated.", 'ok'); }
        catch (err) { toast('Could not save', err.message, 'err', 7000); }
      };
      $$('[data-act]', w).forEach(btn => btn.onclick = async () => {
        const act = btn.dataset.act;
        const text = {
          reset: `Reset <b>${esc(a.name)}</b> to the default PIN${S.defaultPin ? ' (<b>' + esc(S.defaultPin) + '</b>)' : ''}? They will be signed out everywhere and must choose a new password.`,
          deactivate: `Deactivate <b>${esc(a.name)}</b>? They are signed out and cannot sign in or sign QC stages.`,
          remove_admin: `Remove admin rights from <b>${esc(a.name)}</b>?`, make_admin: `Make <b>${esc(a.name)}</b> an admin? Admins can edit everything and manage people.`,
          unlock: `Unlock <b>${esc(a.name)}</b>?`, activate: `Reactivate <b>${esc(a.name)}</b>?`,
        }[act];
        if (!(await confirmDialog(btn.textContent.trim(), text, btn.textContent.trim(), act === 'deactivate' ? 'danger' : ''))) return;
        try { await api('/webhook/users/api/action', { method:'POST', body:{ id: a.id, action: act } }); await loadPeople(); close(); render();
          toast('Done', act === 'reset' ? esc(a.name) + ' is back on the default PIN' + (S.defaultPin ? ' (' + esc(S.defaultPin) + ').' : '.') : 'Updated.', 'ok', 7000); }
        catch (err) { toast('Could not do that', err.message, 'err', 7000); }
      });
    },
  });
}

/* ---------------- Activity (audit) ---------------- */
let auditRows = null;
const ACTION_LABELS = { account_created:'Account created', grants_set:'Access changed', reset:'Password reset', unlock:'Unlocked', deactivate:'Deactivated',
  activate:'Reactivated', make_admin:'Made admin', remove_admin:'Admin removed', password_changed:'Changed password', locked:'Locked after wrong passwords', overtime_saved:'Overtime recorded' };
function paintAudit(){
  const box = $('#auditBody'); if (!box) return;
  if (!auditRows){ box.innerHTML = `<div class="small muted" style="padding:14px">Loading...</div>`; return; }
  box.innerHTML = auditRows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>When</th><th>Who</th><th>What</th><th>Person affected</th><th>Detail</th></tr></thead>
    <tbody>${auditRows.map(r => `<tr><td class="small">${esc(fmtWhen(r.at))}</td><td>${esc(r.actor || '--')}</td><td>${esc(ACTION_LABELS[r.action] || r.action)}</td>
      <td>${esc(r.target || '--')}</td><td class="small muted">${esc(r.detail || '')}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="small muted" style="padding:14px">Nothing recorded yet.</div>`;
}
route('/audit', () => ({
  title:'Activity', crumb:'Admin',
  html: `${pageHead('Activity', 'Recent changes to people and access (latest 300).')}<div class="card"><div id="auditBody"></div></div>`,
  bind(){ auditRows = null; paintAudit();
    api('/webhook/users/api/audit').then(r => { auditRows = r.audit || []; paintAudit(); }).catch(err => { auditRows = []; paintAudit(); toast('Could not load activity', err.message, 'err'); }); },
}));
