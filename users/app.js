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
      { path:'/roles', label:'Roles', icon:'layers' },
      { path:'/approvers', label:'Approvers', icon:'key' },
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
  const [acc, staff, roles] = await Promise.all([api('/webhook/users/api/accounts'), api('/webhook/users/api/staff-without-account'), api('/webhook/users/api/roles')]);
  S.accounts = acc.accounts || []; S.defaultPin = acc.default_pin || ''; S.staff = staff.staff || []; S.noApp = staff.no_app || 0;
  S.roles = roles.roles || []; S.pages = roles.pages || [];
}
async function bootstrap(){
  const auth = await api('/webhook/auth/api/me');
  if (auth.user && auth.user.must_change){ toLandingKeepToken(); throw new Error('Password change required'); }
  if (!auth.user || !auth.user.is_admin){ toLandingKeepToken(); throw new Error('Admins only'); }
  S = { me: meFromAuth(auth, 'users'), accounts: [], staff: [], defaultPin: '', noApp: 0 };
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
   One person = one account = one password, used for the consoles, QSync sign-offs and the machine app.
   ============================================================ */
const CONSOLES = [ { key:'employees', label:'Human Resource' }, { key:'procurement', label:'Procurement' }, { key:'qsync', label:'QSync' }, { key:'engineering', label:'Engineering' } ];
const SIGNOFFS = [ { key:'signoff.production', label:'Production' }, { key:'signoff.ipqa', label:'IPQA' },
                   { key:'signoff.qa_supervisor', label:'QA Supervisor' }, { key:'signoff.qc_supervisor', label:'QC Supervisor' },
                   { key:'signoff.qc_analyst', label:'QC Analyst' }, { key:'signoff.qc_manager', label:'QC Manager' }, { key:'signoff.qa_manager', label:'QA Manager' } ];
// A signature is a personal act, so sign-offs are never part of a role: ticking one of these roles only SUGGESTS
// the matching sign-off, and the admin confirms it with one click.
const ROLE_SIGNOFF = { 'Production Supervisor':'signoff.production', 'IPQA Inspector':'signoff.ipqa',
                       'QA Supervisor':'signoff.qa_supervisor', 'QC Supervisor':'signoff.qc_supervisor',
                       'QC Analyst':'signoff.qc_analyst', 'QC Manager':'signoff.qc_manager', 'QA Manager':'signoff.qa_manager' };
const LEVELS = [ { key:'', label:'No access' }, { key:'view', label:'View' }, { key:'submit', label:'Submit' }, { key:'edit', label:'Edit' } ];
const LEVEL_HELP = 'View = can open and read. Submit = can also record their own work (for example a technician closing a job). Edit = can change everything on that page.';
// "Engineering - Spares", or just "Engineering" for a whole console
function pageLabel(k){
  const pg = (S && S.pages || []).find(x => x.scope === k);
  if (!pg) return (CONSOLES.concat(SIGNOFFS).find(x => x.key === k) || { label: k }).label;
  if (pg.scope === pg.module) return pg.label;
  const mod = (S.pages || []).find(x => x.scope === pg.module);
  return (mod ? mod.label + ' - ' : '') + pg.label;
}
const scopeLabel = pageLabel;
const levelWord = l => ({ view:'view', submit:'submit', edit:'edit' })[l] || l;
function pagesSummary(pages){ return (pages || []).map(x => pageLabel(x.scope) + ': ' + levelWord(x.level)).join(', '); }
let peopleState = { q:'', status:'console', tab:'accounts' };
const hasConsole = a => a.console_access !== false || a.is_admin;   // accounts from before the machine app have it

const fmtWhen = iso => iso ? new Date(iso).toLocaleString('en-GB', { timeZone:'Africa/Lagos', dateStyle:'medium', timeStyle:'short' }) : 'Never';
// The access column keeps one line: the most telling chips first (Admin, roles), the rest counted as "+N more"
// with the full list on hover.
function accessChips(a){
  const chips = [];
  if (a.is_admin) chips.push({ h: `<span class="badge b-brand">Admin</span>`, t: 'Admin' });
  if (!hasConsole(a)) chips.push({ h: `<span class="badge b-slate">No console</span>`, t: 'No console' });
  (a.roles || []).forEach(r => chips.push({ h: `<span class="chip on">${esc(r)}</span>`, t: r + ' (' + roleSummary((S.roles || []).find(x => x.role === r) || {}) + ')' }));
  if (a.app_access) chips.push({ h: `<span class="chip">Machine app</span>`, t: 'Machine app' });
  accessLines(expandAccess(a.grants)).forEach(l => chips.push({ h: `<span class="chip">${esc(l)}</span>`, t: l + ' (own access)' }));
  (a.signoff || []).forEach(k => chips.push({ h: `<span class="chip">Signs ${esc(scopeLabel(k))}</span>`, t: 'Signs ' + scopeLabel(k) }));
  (a.seats || []).forEach(s => chips.push({ h: `<span class="chip">Approver: ${esc(s)}</span>`, t: 'Approver: ' + s }));
  if (!chips.length) return '<span class="muted small">No access yet</span>';
  const SHOW = 2, rest = chips.slice(SHOW);
  return `<div class="chips-line" title="${esc(chips.map(c => c.t).join('\n'))}">${chips.slice(0, SHOW).map(c => c.h).join('')}${rest.length ? `<span class="chip more">+${rest.length} more</span>` : ''}</div>`;
}
function statusBadges(a){
  const out = [];
  out.push(a.active ? '<span class="badge b-ok"><span class="dot"></span>Active</span>' : '<span class="badge b-slate">Deactivated</span>');
  if (a.locked) out.push('<span class="badge b-warn">Locked</span>');
  if (a.must_change) out.push('<span class="badge b-slate">First PIN not changed</span>');
  return out.join(' ');
}
function filteredAccounts(){
  const q = peopleState.q.trim().toLowerCase();
  return S.accounts.filter(a => {
    if (q && !(a.name + ' ' + (a.email || '') + ' ' + (a.enroll_id || '')).toLowerCase().includes(q)) return false;
    switch (peopleState.status) {
      case 'console': return hasConsole(a);
      case 'app': return a.app_access;
      case 'approver': return (a.seats || []).length > 0;
      case 'active': return a.active;
      case 'inactive': return !a.active;
      case 'admin': return a.is_admin;
      case 'locked': return a.locked;
      case 'default': return a.must_change && a.active;
      default: return true;
    }
  });
}

function viewPeople(){
  const total = S.accounts.length;
  const consoleN = S.accounts.filter(a => hasConsole(a) && a.active).length;
  const appN = S.accounts.filter(a => a.app_access && a.active).length;
  const onFirst = S.accounts.filter(a => a.must_change && a.active).length;
  const tab = peopleState.tab;
  const rows = filteredAccounts();
  const shown = rows.slice(0, 300);
  const accountsTable = `
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px">
        <div class="row" style="gap:10px">
          <div class="search filter-search"><span class="ic">${I.search}</span>
            <input class="inp" id="pplQ" style="padding-left:34px;border-radius:20px" placeholder="Search by name, email or staff number" value="${esc(peopleState.q)}"></div>
          <select class="inp" id="pplStatus" style="width:auto;min-width:180px">
            ${[['console','Console users'],['app','Machine app'],['approver','Approvers'],['','Everyone'],['active','Active'],['inactive','Deactivated'],['admin','Admins'],['locked','Locked'],['default','First PIN not changed']]
              .map(([v,l]) => `<option value="${v}" ${peopleState.status===v?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Person</th><th>Access</th><th>Status</th><th>Last sign-in</th><th></th></tr></thead>
        <tbody>${shown.length ? shown.map(a => `<tr>
          <td data-label="Person" class="cell-person"><div class="person">${avatarEl(a.name)}
            <div class="person-txt"><span class="strong" title="${esc(a.name)}">${esc(a.name)}</span>
            <span class="tiny muted" title="${esc((a.email || 'no email') + ' - ' + (a.linked ? 'staff no. ' + a.enroll_id : 'not linked to an employee'))}">${esc(a.email || 'no email')} &middot; ${a.linked ? 'staff no. ' + esc(a.enroll_id) : 'not linked'}</span></div></div></td>
          <td data-label="Access" class="cell-access">${accessChips(a)}</td>
          <td data-label="Status"><div class="chips-line">${statusBadges(a)}</div></td>
          <td class="small" data-label="Last sign-in">${esc(fmtWhen(a.last_login_at))}</td>
          <td style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="openManage(${a.id})">${I.edit} Manage</button></td>
        </tr>`).join('') : `<tr><td colspan="5" class="muted" style="padding:16px">No matching people.</td></tr>`}</tbody>
      </table></div>
      ${rows.length > shown.length ? `<div class="small muted" style="padding:12px 18px">Showing the first ${shown.length} of ${rows.length}. Search to find someone.</div>` : ''}
    </div>`;
  const staffTable = `
    <div class="card"><div class="card-h"><h3>Employees without an account</h3>
      <div class="sub">People on the employee list (staff and casuals) who have no account at all. The machine-app button gives them one;
        "Create account" here gives a console account (needs a work email).</div></div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Name</th><th>Department</th><th>Email</th><th></th></tr></thead>
        <tbody>${S.staff.length ? S.staff.slice(0, 300).map(p => `<tr>
          <td data-label="Name"><div class="strong">${esc(p.name)}</div><div class="tiny muted mono">${esc(p.enroll_id)}${p.type ? ' &middot; ' + esc(p.type) : ''}</div></td>
          <td data-label="Department">${esc(p.department || '--')}</td>
          <td class="small" data-label="Email">${esc(p.email || 'none on record')}</td>
          <td style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="addFromStaff('${esc(p.enroll_id)}')">${I.plus} Create account</button></td>
        </tr>`).join('') : `<tr><td colspan="4" class="muted" style="padding:16px">Everyone on the employee list has an account.</td></tr>`}</tbody>
      </table></div></div>`;
  return {
    title:'People', crumb:'Admin',
    html: `
    ${pageHead('People', 'Everyone with an account. One password per person, for the consoles, QSync sign-offs and the machine app.',
      `<button class="btn btn-ghost" onclick="openAppLogins()">${I.key} Machine-app logins${S.noApp ? ' (' + S.noApp + ')' : ''}</button>
       <button class="btn btn-primary" onclick="openAddPerson()">${I.plus} Add person</button>`)}
    <div class="grid g4" style="margin-bottom:16px">
      <div class="stat"><div class="lbl">Console users</div><div class="val">${consoleN}</div><div class="meta">active, can sign in here</div></div>
      <div class="stat"><div class="lbl">Machine app</div><div class="val">${appN}</div><div class="meta">can be picked at a machine</div></div>
      <div class="stat"><div class="lbl">First PIN not changed</div><div class="val">${onFirst}</div><div class="meta">active, have not set their own yet</div></div>
      <div class="stat"><div class="lbl">Not on the machine app</div><div class="val">${S.noApp}</div><div class="meta">on the employee list</div></div>
    </div>
    <div class="row" style="gap:8px;margin-bottom:12px">
      <button class="btn ${tab==='accounts'?'btn-primary':'btn-ghost'} btn-sm" onclick="setPeopleTab('accounts')">Accounts (${total})</button>
      <button class="btn ${tab==='staff'?'btn-primary':'btn-ghost'} btn-sm" onclick="setPeopleTab('staff')">Employees without an account (${S.staff.length})</button>
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

/* ---- first PINs: shown once, printed straight away (only a scrambled copy is kept) ---- */
function printPins(rows, mode){
  const today = new Date().toLocaleDateString('en-GB', { timeZone:'Africa/Lagos', dateStyle:'medium' });
  const list = `<h2>First PINs - ${esc(today)}</h2><p>Hand each person their own PIN. They must change it the first time they use it. Keep this list safe and destroy it after the hand-out.</p>
    <table><thead><tr><th>Staff no.</th><th>Name</th><th>Department</th><th>First PIN</th><th>Signature</th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${esc(r.enroll_id || '')}</td><td>${esc(r.name)}</td><td>${esc(r.department || '')}</td><td class="pin">${esc(r.first_pin)}</td><td></td></tr>`).join('')}</tbody></table>`;
  const slips = `<div class="slips">${rows.map(r => `<div class="slip"><div class="co">ORANGE KALBE LIMITED</div><div class="nm">${esc(r.name)}</div>
    <div class="meta">${esc(r.enroll_id ? 'Staff no. ' + r.enroll_id : '')}${r.department ? ' &middot; ' + esc(r.department) : ''}</div>
    <div class="lbl">Your first PIN</div><div class="pin big">${esc(r.first_pin)}</div>
    <div class="note">Change it the first time you use it (machine app or console). Never share your PIN.</div></div>`).join('')}</div>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>First PINs</title><style>
    body{font-family:system-ui,Segoe UI,Arial,sans-serif;color:#111;margin:18px} h2{margin:0 0 4px} p{font-size:12px;color:#444;margin:0 0 12px}
    table{border-collapse:collapse;width:100%;font-size:12px} th,td{border:1px solid #999;padding:5px 7px;text-align:left} td:last-child{width:120px}
    .pin{font-family:Consolas,monospace;font-size:14px;letter-spacing:2px;font-weight:700}
    .slips{display:grid;grid-template-columns:1fr 1fr;gap:0} .slip{border:1px dashed #777;padding:12px 14px;break-inside:avoid;page-break-inside:avoid}
    .co{font-size:10px;letter-spacing:.08em;color:#555} .nm{font-weight:700;font-size:15px;margin-top:4px} .meta{font-size:11px;color:#444}
    .lbl{font-size:11px;margin-top:8px} .big{font-size:22px} .note{font-size:10px;color:#444;margin-top:6px}
  </style></head><body>${mode === 'slips' ? slips : list}</body></html>`;
  const w = window.open('', '_blank');
  if (!w) { toast('Pop-up blocked', 'Allow pop-ups for this site to print, or use Download CSV.', 'err', 8000); return; }
  w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
}
function pinsCsv(rows){
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  return 'Staff no.,Name,Department,First PIN\r\n' + rows.map(r => [r.enroll_id, r.name, r.department, r.first_pin].map(q).join(',')).join('\r\n') + '\r\n';
}
function showPins(title, rows, extraHtml){
  openModal({
    title, size:'wide', sub:'Shown once. Print or download now: the PINs cannot be shown again, only reset.',
    body: `${extraHtml || ''}
      ${rows.length ? `<div class="tbl-wrap" style="max-height:380px;overflow:auto"><table class="tbl"><thead><tr><th>Staff no.</th><th>Name</th><th>Department</th><th>First PIN</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td class="mono">${esc(r.enroll_id || '--')}</td><td>${esc(r.name)}</td><td>${esc(r.department || '--')}</td><td class="mono strong">${esc(r.first_pin)}</td></tr>`).join('')}</tbody></table></div>` : ''}`,
    footer: `<button class="btn btn-ghost" data-csv ${rows.length ? '' : 'disabled'}>${I.download} Download CSV</button>
      <button class="btn btn-ghost" data-list ${rows.length ? '' : 'disabled'}>Print list</button>
      <button class="btn btn-ghost" data-slips ${rows.length ? '' : 'disabled'}>Print slips</button>
      <button class="btn btn-primary" data-done>Done</button>`,
    onMount: (w, close) => {
      $('[data-csv]', w).onclick = () => download('first-pins-' + new Date().toISOString().slice(0, 10) + '.csv', pinsCsv(rows), 'text/csv;charset=utf-8');
      $('[data-list]', w).onclick = () => printPins(rows, 'list');
      $('[data-slips]', w).onclick = () => printPins(rows, 'slips');
      $('[data-done]', w).onclick = async () => {
        if (rows.length && !(await confirmDialog('Close the PIN list?', 'Have you printed or downloaded it? The PINs cannot be shown again.', 'Yes, close it'))) return;
        close();
      };
    },
  });
}
async function openAppLogins(){
  if (!(await confirmDialog('Machine-app logins',
    `This gives everyone on the employee list (staff and casuals) a way to confirm themselves at a machine:
     <ul style="margin:8px 0 0 18px;padding:0"><li>People with no account get one with a <b>random first PIN</b> (no console access).</li>
     <li>People who already use the console keep their own password.</li>
     <li>Anyone who looks like an existing account that is not linked to an employee is <b>skipped</b>: link that account first (Manage), then run this again.</li></ul>
     <p style="margin-top:8px">The first PINs are shown <b>once</b>, so be ready to print. Safe to run again later for new staff.</p>`, 'Create logins'))) return;
  try {
    const res = await api('/webhook/users/api/app-logins', { method:'POST', body:{} });
    const rows = res.rows || [];
    await loadPeople(); render();
    const withPin = rows.filter(r => r.first_pin);
    const added = rows.filter(r => r.status === 'app_added');
    const skipped = rows.filter(r => r.status === 'skipped_possible_account');
    const extra = `<div class="small" style="margin-bottom:10px"><b>${withPin.length}</b> new first PIN${withPin.length === 1 ? '' : 's'}${added.length ? `, <b>${added.length}</b> console user${added.length === 1 ? '' : 's'} added (they keep their own password)` : ''}.</div>
      ${skipped.length ? `<div class="notice warn" style="margin-bottom:10px">${I.alert}<div><b>Skipped, may already have an account:</b><br>${skipped.map(r => `${esc(r.name)} (${esc(r.enroll_id)}) looks like <b>${esc(r.possible_account)}</b>`).join('<br>')}
        <br>If it is the same person, open that account in Manage, link it to the employee and run this again. If not, use "Create account" for them.</div></div>` : ''}`;
    showPins('First PINs', withPin, extra);
  } catch (err) { toast('Could not create the logins', err.message, 'err', 8000); }
}

async function createAccount(payload){
  const res = await api('/webhook/users/api/create', { method:'POST', body: payload });
  await loadPeople();
  return res;
}
function afterCreate(res, name){
  render(); openManage(res.id);
  if (res.pin) showPins('First PIN for ' + name, [{ enroll_id: '', name, department: '', first_pin: res.pin }],
    `<div class="small" style="margin-bottom:10px">They sign in with their email and this PIN, then must choose their own password.</div>`);
}
async function addFromStaff(enrollId){
  const p = S.staff.find(x => x.enroll_id === enrollId); if (!p) return;
  if (!p.email){ toast('No email on record', p.name + ' needs a work email in the Employee DB before they can sign in to the console. For the machine app, use "Machine-app logins".', 'err', 8000); return; }
  if (!(await confirmDialog('Create account', `Create a console account for <b>${esc(p.name)}</b> (${esc(p.email)})? They get a first PIN (shown once) and must change it at first sign-in.`, 'Create account'))) return;
  try { const res = await createAccount({ enroll_id: enrollId }); afterCreate(res, p.name); toast('Account created', p.name + ' can now sign in.', 'ok'); }
  catch (err) { toast('Could not create account', err.message, 'err', 7000); }
}
function openAddPerson(){
  const staffOpts = S.staff.map(p => `<option value="${esc(p.enroll_id)}">${esc(p.name)}${p.department ? ' - ' + esc(p.department) : ''}${p.email ? '' : ' (no email)'}</option>`).join('');
  openModal({
    title:'Add person', size:'wide', sub:'A console account. They get a first PIN (shown once) and must change it at first sign-in.',
    body:`<form id="addForm" novalidate>
      <div class="field"><label>Who is this?</label>
        <select class="inp" id="apMode"><option value="staff">Someone in the Employee DB</option><option value="new">Someone not in the Employee DB</option></select></div>
      <div id="apStaffBox"><div class="field"><label for="apStaff">Employee</label>
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
        if (mode.value === 'staff' && !payload.enroll_id) return setErr('apMode', 'Choose an employee.', w);
        if (mode.value === 'new' && (!payload.name || !payload.email)) return setErr('apMode', 'A name and an email are required.', w);
        const btn = $('[data-save]', w); btn.disabled = true;
        const name = mode.value === 'staff' ? (S.staff.find(x => x.enroll_id === payload.enroll_id) || {}).name : payload.name;
        try { const res = await createAccount(payload); close(); afterCreate(res, name || 'this person'); toast('Account created', 'Give them the first PIN.', 'ok'); }
        catch (err) { setErr('apMode', err.message, w); btn.disabled = false; }
      };
    },
  });
}

let empCache = null;   // the employee list, for linking an account (loaded when needed)
async function loadEmployees(){
  if (empCache) return empCache;
  const e = await api('/webhook/employees/api/list');
  empCache = (e.employees || []).filter(x => (x.status || 'active') !== 'inactive')
    .map(x => ({ enroll_id: x.enroll_id, name: x.name, department: x.department })).sort((p, q) => String(p.name).localeCompare(String(q.name)));
  return empCache;
}

/* ---------------- Access tree (shared by People > Manage and Roles) ----------------
   The database rule (migrations 016/022): a grant on a console covers all its pages, a page grant covers that page,
   and when several apply the HIGHER level wins. Roles therefore give a minimum: a person's own access can add to a
   role, never take away from it. The tree works page by page: choosing a level on a console sets every page under
   it, then single pages can be changed. On save it is stored compactly: one console grant when all its pages are the
   same, page grants when they differ. */
const ACCESS_RANK = { view:1, submit:2, edit:3 };
const higher = (a, b) => (ACCESS_RANK[a] || 0) >= (ACCESS_RANK[b] || 0) ? (a || '') : (b || '');
function modulesList(){ return (S.pages || []).filter(x => x.scope === x.module); }
function childrenOf(m){ return (S.pages || []).filter(x => x.module === m && x.scope !== m); }
// the pages a level is really set on: a console's pages, or the console itself when it has none
function leavesOf(m){ const k = childrenOf(m); return k.length ? k.map(x => x.scope) : [m]; }
// [{scope, level}] -> { page: level } over every page (console grants spread to their pages; higher wins)
function expandAccess(list){
  const out = {};
  (list || []).forEach(g => {
    if (!g || !g.level || String(g.scope).startsWith('signoff.')) return;
    const pg = (S.pages || []).find(p => p.scope === g.scope); if (!pg) return;
    (pg.scope === pg.module ? leavesOf(pg.scope) : [pg.scope]).forEach(k => { out[k] = higher(out[k], g.level); });
  });
  return out;
}
// { page: level } -> [{scope, level}]: one console grant when all its pages share a level, else page grants
function compressAccess(lv){
  const out = [];
  modulesList().forEach(m => {
    const keys = leavesOf(m.scope), vals = keys.map(k => lv[k] || '');
    if (vals[0] && vals.every(v => v === vals[0])) out.push({ scope: m.scope, level: vals[0] });
    else keys.forEach(k => { if (lv[k]) out.push({ scope: k, level: lv[k] }); });
  });
  return out;
}
// one short line per console: "Engineering: edit" (every page alike), "QSync: Test requests (submit)" (one or two pages),
// "QSync: all 5 pages (2 edit, 3 view)" / "Engineering: 4 of 9 pages (4 view)" (more)
const pageName = k => ((S.pages || []).find(p => p.scope === k) || { label: k }).label;
function accessLines(lv){
  return modulesList().map(m => {
    const keys = leavesOf(m.scope), got = keys.filter(k => lv[k]);
    if (!got.length) return '';
    if (got.length === keys.length && got.every(k => lv[k] === lv[got[0]])) return m.label + ': ' + levelWord(lv[got[0]]);
    if (got.length <= 2) return m.label + ': ' + got.map(k => pageName(k) + ' (' + levelWord(lv[k]) + ')').join(', ');
    const by = ['edit', 'submit', 'view'].map(l => [l, got.filter(k => lv[k] === l).length]).filter(x => x[1]).map(([l, n]) => n + ' ' + l).join(', ');
    return m.label + ': ' + (got.length === keys.length ? 'all ' + keys.length : got.length + ' of ' + keys.length) + ' pages (' + by + ')';
  }).filter(Boolean);
}
const roleSummary = r => accessLines(expandAccess(r.pages)).join(' · ') || 'No pages';
// where each page's minimum comes from: { page: { level, from: [role names] } }
function roleFloor(roleNames){
  const out = {};
  (roleNames || []).forEach(n => {
    const r = (S.roles || []).find(x => x.role === n); if (!r) return;
    Object.entries(expandAccess(r.pages)).forEach(([k, l]) => {
      const cur = out[k];
      if (!cur || (ACCESS_RANK[l] || 0) > (ACCESS_RANK[cur.level] || 0)) out[k] = { level: l, from: [n] };
      else if (cur.level === l) cur.from.push(n);
    });
  });
  return out;
}
/* The tree. opts: { own: {page: level}, floor: {page: {level, from}} (People only), locked: bool (admin) }.
   Returns { html, bind(root, onChange), value() -> {page: level} (own level per page; at least the floor is implied) } */
function accessTree(opts){
  const own = Object.assign({}, opts.own || {}), floor = opts.floor || {}, locked = !!opts.locked;
  const eff = k => higher(own[k], (floor[k] || {}).level);
  const opt = (cur, min) => LEVELS.map(l => `<option value="${l.key}" ${cur === l.key ? 'selected' : ''} ${(ACCESS_RANK[l.key] || 0) < (ACCESS_RANK[min] || 0) ? 'disabled' : ''}>${l.label}</option>`).join('');
  const src = k => {
    const f = floor[k];
    if (f && (ACCESS_RANK[f.level] || 0) >= (ACCESS_RANK[own[k]] || 0)) return `<span class="tree-src role" title="${esc(f.from.join(', '))}">from role ${esc(f.from[0])}${f.from.length > 1 ? ' +' + (f.from.length - 1) : ''}</span>`;
    return own[k] ? '<span class="tree-src own">added here</span>' : '';
  };
  const modSrc = m => {
    const keys = leavesOf(m.scope), f = keys.map(k => floor[k]);
    if (!f.every(Boolean) || keys.some(k => own[k])) return '';
    const who = f[0].from[0];
    return f.every(x => x.from.includes(who)) ? `<span class="tree-src role">from role ${esc(who)}</span>` : '';
  };
  const modState = m => {
    const keys = leavesOf(m.scope), vals = keys.map(eff), set = vals.filter(Boolean);
    const same = vals.every(v => v === vals[0]);
    return { value: same ? vals[0] : 'mixed', note: !set.length ? '' : same ? (keys.length > 1 ? 'all ' + keys.length + ' pages' : '') : set.length + ' of ' + keys.length + ' pages' };
  };
  // the lowest level a console row may be set to: what every one of its pages already gets from roles
  const minOf = m => { const ls = leavesOf(m.scope).map(k => (floor[k] || {}).level || ''); return ls.every(Boolean) ? ls.reduce((a, b) => (ACCESS_RANK[a] || 0) <= (ACCESS_RANK[b] || 0) ? a : b) : ''; };
  const body = () => modulesList().map(m => {
    const kids = childrenOf(m.scope), st = modState(m), open = st.value === 'mixed';
    const modSel = `<select class="inp tree-sel" data-mod="${esc(m.scope)}" ${locked ? 'disabled' : ''}>
        ${st.value === 'mixed' ? '<option value="mixed" selected>Mixed</option>' : ''}${opt(st.value === 'mixed' ? null : st.value, minOf(m))}</select>`;
    return `<div class="tree-mod${open ? ' open' : ''}" data-m="${esc(m.scope)}">
      <div class="tree-row tree-head">
        ${kids.length ? `<button type="button" class="tree-tog" data-tog aria-label="Show the pages">${I.chevR}</button>` : '<span class="tree-tog"></span>'}
        <div class="tree-name"><span class="strong">${esc(m.label)}</span><span class="tiny muted">${esc(st.note)}</span></div>
        <div class="tree-src-cell">${kids.length ? modSrc(m) : src(m.scope)}</div>${modSel}
      </div>
      ${kids.map(pg => `<div class="tree-row tree-page"><span class="tree-tog"></span><div class="tree-name">${esc(pg.label)}</div>
        <div class="tree-src-cell">${src(pg.scope)}</div>
        <select class="inp tree-sel" data-leaf="${esc(pg.scope)}" ${locked ? 'disabled' : ''}>${opt(eff(pg.scope), (floor[pg.scope] || {}).level)}</select></div>`).join('')}
    </div>`;
  }).join('');
  let root = null, onChange = () => {};
  const paint = () => {
    const openNow = new Set(Array.from(root.querySelectorAll('.tree-mod.open')).map(e => e.dataset.m));
    root.innerHTML = body();
    openNow.forEach(m => { const e = root.querySelector(`.tree-mod[data-m="${m}"]`); if (e) e.classList.add('open'); });
    wire(); onChange();
  };
  const wire = () => {
    root.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => b.closest('.tree-mod').classList.toggle('open'));
    root.querySelectorAll('select[data-mod]').forEach(s => s.onchange = () => {
      if (s.value === 'mixed') return;
      // a console level sets every page under it (never below what a role gives)
      leavesOf(s.dataset.mod).forEach(k => { own[k] = s.value; if ((ACCESS_RANK[s.value] || 0) <= (ACCESS_RANK[(floor[k] || {}).level] || 0)) own[k] = ''; });
      paint();
    });
    root.querySelectorAll('select[data-leaf]').forEach(s => s.onchange = () => {
      const k = s.dataset.leaf; own[k] = (ACCESS_RANK[s.value] || 0) <= (ACCESS_RANK[(floor[k] || {}).level] || 0) ? '' : s.value;
      const mod = s.closest('.tree-mod'); paint(); const again = root.querySelector(`.tree-mod[data-m="${mod.dataset.m}"]`); if (again) again.classList.add('open');
    });
  };
  return {
    html: `<div class="tree${locked ? ' locked' : ''}"></div>`,
    bind(container, cb){ root = container.querySelector('.tree'); onChange = cb || onChange; root.innerHTML = body(); wire(); onChange(); },
    setFloor(f){ Object.keys(floor).forEach(k => delete floor[k]); Object.assign(floor, f);
      Object.keys(own).forEach(k => { if ((ACCESS_RANK[own[k]] || 0) <= (ACCESS_RANK[(floor[k] || {}).level] || 0)) own[k] = ''; }); if (root) paint(); },
    value(){ const out = {}; Object.keys(own).forEach(k => { if (own[k]) out[k] = own[k]; }); return out; },
    effective(){ const out = {}; new Set(Object.keys(own).concat(Object.keys(floor))).forEach(k => { const v = eff(k); if (v) out[k] = v; }); return out; },
  };
}

function openManage(id){
  const a = S.accounts.find(x => x.id === id); if (!a) return;
  const isSelf = a.id === S.me.id;
  const has = k => (a.signoff || []).includes(k);
  const signBox = (k, label) => `<label class="check"><input type="checkbox" data-scope="${k}" ${has(k) ? 'checked' : ''}><span>${esc(label)}</span></label>`;
  const roleCard = r => `<label class="check role-card" data-rname="${esc(r.role.toLowerCase())}"><input type="checkbox" data-role="${esc(r.role)}" ${(a.roles || []).includes(r.role) ? 'checked' : ''}>
      <span><span class="strong">${esc(r.role)}</span><span class="hint">${esc(roleSummary(r))}</span></span></label>`;
  const tree = accessTree({ own: expandAccess(a.grants), floor: roleFloor(a.roles), locked: a.is_admin });
  const tabs = [['roles', 'Roles'], ['access', 'Access'], ['signoff', 'QC sign-offs'], ['account', 'Account']];
  openModal({
    title: a.name, size:'wide', sub: (a.email || 'no email') + (a.linked ? ' - staff no. ' + a.enroll_id : ' - not linked to an employee'),
    body:`
      <div class="mg-top">
        <div class="chips-line" style="flex-wrap:wrap">${statusBadges(a)} ${a.is_admin ? '<span class="badge b-brand">Admin</span>' : ''}</div>
        <div class="mg-opens"><span class="strong">Opens:</span> <span id="mgPreview"></span></div>
      </div>
      <div class="tabs mg-tabs">${tabs.map(([k, l], i) => `<div class="tab${i ? '' : ' on'}" data-tab="${k}">${l}<span class="tab-n" data-n="${k}"></span></div>`).join('')}</div>

      <div data-pane="roles">
        <div class="small muted" style="margin-bottom:10px">One role usually covers the whole job. What a role gives is a minimum: their own access in the next tab can add to it, never take it away. Change what a role covers in <a href="#/roles">Roles</a>.</div>
        ${(S.roles || []).length > 6 ? `<div class="search" style="max-width:280px;margin-bottom:8px"><span class="ic">${I.search}</span><input class="inp" id="mgRoleQ" style="padding-left:34px" placeholder="Find a role"></div>` : ''}
        <div class="role-grid">${(S.roles || []).map(roleCard).join('') || '<div class="small muted">No roles yet. Make one in Roles.</div>'}</div>
      </div>

      <div data-pane="access" class="hide">
        <div class="small muted" style="margin-bottom:10px">${esc(LEVEL_HELP)} Choosing a level on a console sets all its pages; open it to change single pages. Pages marked "from role" cannot go lower here.</div>
        ${a.is_admin ? `<div class="notice info" style="margin-bottom:10px">${I.info}<div>Admins open and edit everything and manage people. Nothing to set here.</div></div>` : ''}
        ${tree.html}
      </div>

      <div data-pane="signoff" class="hide">
        <div class="small muted" style="margin-bottom:10px">Who may sign QC stages with their password. A signature is personal, so it is always ticked here, never part of a role.</div>
        <div class="role-grid">${SIGNOFFS.map(c => signBox(c.key, c.label)).join('')}</div>
        <div id="mgSignHint" class="small" style="margin-top:8px"></div>
      </div>

      <div data-pane="account" class="hide">
        <div class="strong" style="margin-bottom:4px">Can use</div>
        <div class="small muted" style="margin-bottom:6px">One password for everything they can use.</div>
        <label class="check"><input type="checkbox" id="mgConsole" ${hasConsole(a) ? 'checked' : ''} ${a.is_admin || isSelf ? 'disabled' : ''}><span>Console (sign in here)</span></label>
        <label class="check"><input type="checkbox" id="mgApp" ${a.app_access ? 'checked' : ''}><span>Machine app (picked at a machine, confirms with PIN)</span></label>
        ${(a.seats || []).length ? `<div class="small muted" style="margin-top:8px">Approver seat${a.seats.length === 1 ? '' : 's'}: ${a.seats.map(esc).join(', ')} (change these in Approvers; approvals work by email link).</div>` : ''}
        <div class="divider"></div>
        <div class="strong" style="margin-bottom:4px">Employee record</div>
        <div class="small muted" style="margin-bottom:6px">${a.linked ? `Linked to staff no. <b>${esc(a.enroll_id)}</b>.` : 'Not linked. Link it so the same person never gets a second account, and so the machine app can find them.'}</div>
        <div class="row" style="gap:8px">
          <input class="inp" id="mgFind" placeholder="Type a name or staff number to link" style="max-width:280px" autocomplete="off">
          <select class="inp" id="mgEmp" style="max-width:340px"><option value="">Choose...</option></select>
          <button class="btn btn-ghost btn-sm" data-link>Link</button>
          ${a.linked ? `<button class="btn btn-ghost btn-sm" data-unlink>Unlink</button>` : ''}
        </div>
        <div class="divider"></div>
        <div class="row" style="gap:8px">
          <button class="btn btn-ghost btn-sm" data-reset>${I.key} Reset PIN</button>
          ${a.locked ? `<button class="btn btn-ghost btn-sm" data-act="unlock">Unlock</button>` : ''}
          <button class="btn btn-ghost btn-sm" data-act="${a.active ? 'deactivate' : 'activate'}" ${isSelf && a.active ? 'disabled' : ''}>${a.active ? 'Deactivate' : 'Reactivate'}</button>
          <button class="btn btn-ghost btn-sm" data-act="${a.is_admin ? 'remove_admin' : 'make_admin'}" ${isSelf && a.is_admin ? 'disabled' : ''}>${a.is_admin ? 'Remove admin' : 'Make admin'}</button>
        </div>
        <div class="small muted" style="margin-top:10px">Last sign-in: ${esc(fmtWhen(a.last_login_at))}. Reset PIN, unlock, deactivate and admin act at once; "Save access" saves the other tabs and "Can use".</div>
      </div>`,
    footer:`<button class="btn btn-ghost" data-close>Close</button><button class="btn btn-primary" data-save>Save access</button>`,
    onMount:(w, close) => {
      // tabs
      $$('[data-tab]', w).forEach(t => t.onclick = () => {
        $$('[data-tab]', w).forEach(x => x.classList.toggle('on', x === t));
        $$('[data-pane]', w).forEach(p => p.classList.toggle('hide', p.dataset.pane !== t.dataset.tab));
      });
      const checkedRoles = () => $$('input[data-role]', w).filter(c => c.checked).map(c => c.dataset.role);
      const counts = () => {
        const n = { roles: checkedRoles().length, signoff: $$('input[data-scope]', w).filter(c => c.checked).length, access: Object.keys(tree.value()).length };
        Object.entries(n).forEach(([k, v]) => { const e = $(`[data-n="${k}"]`, w); if (e) e.textContent = v ? ' (' + v + ')' : ''; });
      };
      // what they will be able to open: roles + their own access, highest wins, one line per console
      const paintPreview = () => {
        const lines = accessLines(tree.effective());
        $('#mgPreview', w).innerHTML = a.is_admin ? '<span class="chip on">Everything (admin)</span>'
          : lines.length ? lines.map(l => `<span class="chip">${esc(l)}</span>`).join(' ')
          : '<span class="muted small">Nothing yet - they cannot open any console.</span>';
        counts();
      };
      // ticking a role suggests its matching sign-off; the admin confirms it deliberately
      const paintSignHint = () => {
        const missing = checkedRoles().map(r => ROLE_SIGNOFF[r]).filter(k => k && !$('input[data-scope="' + k + '"]', w).checked);
        $('#mgSignHint', w).innerHTML = missing.length
          ? 'Suggested for their role' + (missing.length > 1 ? 's' : '') + ': '
            + missing.map(k => `<button type="button" class="btn btn-ghost btn-sm" data-suggest="${k}">Also signs ${esc(scopeLabel(k))}</button>`).join(' ')
          : '';
        $$('[data-suggest]', w).forEach(b => b.onclick = () => { $('input[data-scope="' + b.dataset.suggest + '"]', w).checked = true; paintSignHint(); counts(); });
      };
      tree.bind($('[data-pane="access"]', w), paintPreview);
      $$('input[data-role]', w).forEach(c => c.addEventListener('change', () => { tree.setFloor(roleFloor(checkedRoles())); paintSignHint(); }));
      $$('input[data-scope]', w).forEach(c => c.addEventListener('change', () => { paintSignHint(); counts(); }));
      const rq = $('#mgRoleQ', w);
      if (rq) rq.oninput = () => { const q = rq.value.trim().toLowerCase(); $$('.role-card', w).forEach(c => c.classList.toggle('hide', !!q && !c.dataset.rname.includes(q))); };
      paintSignHint(); paintPreview();

      const paintEmp = () => {
        const q = $('#mgFind', w).value.trim().toLowerCase(), list = (empCache || []).filter(e => !q || (e.name + ' ' + e.enroll_id).toLowerCase().includes(q)).slice(0, 60);
        $('#mgEmp', w).innerHTML = `<option value="">${empCache ? 'Choose...' : 'Loading...'}</option>` + list.map(e => `<option value="${esc(e.enroll_id)}">${esc(e.name)} - ${esc(e.enroll_id)}${e.department ? ' - ' + esc(e.department) : ''}</option>`).join('');
      };
      paintEmp(); loadEmployees().then(paintEmp).catch(() => {});
      $('#mgFind', w).oninput = debounce(paintEmp, 120);
      const link = async enrollId => {
        try { await api('/webhook/users/api/link-employee', { method:'POST', body:{ id: a.id, enroll_id: enrollId } }); await loadPeople(); close(); render(); openManage(a.id);
          toast(enrollId ? 'Linked' : 'Unlinked', enrollId ? a.name + ' is linked to staff no. ' + enrollId + '.' : a.name + ' is no longer linked (and is off the machine app).', 'ok'); }
        catch (err) { toast('Could not do that', err.message, 'err', 7000); }
      };
      $('[data-link]', w).onclick = () => { const v = $('#mgEmp', w).value; if (!v) { toast('Choose the employee first', '', 'err'); return; } link(v); };
      const ul = $('[data-unlink]', w); if (ul) ul.onclick = async () => { if (await confirmDialog('Unlink?', `Unlink <b>${esc(a.name)}</b> from staff no. ${esc(a.enroll_id)}? They also come off the machine app.`, 'Unlink')) link(''); };
      $('[data-save]', w).onclick = async () => {
        const grants = (a.is_admin ? (a.grants || []).filter(g => !String(g.scope).startsWith('signoff.')) : compressAccess(tree.value()))
          .concat($$('input[data-scope]', w).filter(c => c.checked).map(c => ({ scope: c.dataset.scope })));
        const body = { id: a.id, roles: checkedRoles(), grants, app: $('#mgApp', w).checked };
        if (!$('#mgConsole', w).disabled) body.console = $('#mgConsole', w).checked;
        try { await api('/webhook/users/api/grants', { method:'POST', body }); await loadPeople(); close(); render(); toast('Access saved', a.name + "'s access has been updated.", 'ok'); }
        catch (err) { toast('Could not save', err.message, 'err', 8000); }
      };
      $('[data-reset]', w).onclick = async () => {
        if (!(await confirmDialog('Reset PIN', `Give <b>${esc(a.name)}</b> a new first PIN? Their current password stops working everywhere (console, sign-offs, machine app), they are signed out and must choose a new one.`, 'Reset PIN'))) return;
        try { const r = await api('/webhook/users/api/reset-pin', { method:'POST', body:{ id: a.id } }); await loadPeople(); close(); render();
          showPins('New first PIN for ' + a.name, [{ enroll_id: a.enroll_id || '', name: a.name, department: '', first_pin: r.pin }]); }
        catch (err) { toast('Could not reset', err.message, 'err', 7000); }
      };
      $$('[data-act]', w).forEach(btn => btn.onclick = async () => {
        const act = btn.dataset.act;
        const text = {
          deactivate: `Deactivate <b>${esc(a.name)}</b>? They are signed out and cannot sign in, sign QC stages or be confirmed at a machine.`,
          remove_admin: `Remove admin rights from <b>${esc(a.name)}</b>?`, make_admin: `Make <b>${esc(a.name)}</b> an admin? Admins can edit everything and manage people.`,
          unlock: `Unlock <b>${esc(a.name)}</b>?`, activate: `Reactivate <b>${esc(a.name)}</b>?`,
        }[act];
        if (!(await confirmDialog(btn.textContent.trim(), text, btn.textContent.trim(), act === 'deactivate' ? 'danger' : ''))) return;
        try { await api('/webhook/users/api/action', { method:'POST', body:{ id: a.id, action: act } }); await loadPeople(); close(); render(); toast('Done', 'Updated.', 'ok'); }
        catch (err) { toast('Could not do that', err.message, 'err', 7000); }
      });
    },
  });
}

/* ---------------- Roles (migrations 016 / 022) ---------------- */
const roleHolders = name => (S.accounts || []).filter(x => (x.roles || []).includes(name));
function viewRoles(){
  const rows = S.roles || [];
  return {
    title:'Roles', crumb:'Admin',
    html: `${pageHead('Roles', 'A role is a named set of pages with a level for each. Give roles to people in People &gt; Manage. Changing a role changes it for everyone who has it.',
      `<button class="btn btn-primary" onclick="openRole('')">${I.plus} New role</button>`)}
    <div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Role</th><th>Covers</th><th>People</th><th></th></tr></thead>
      <tbody>${rows.length ? rows.map(r => `<tr>
        <td class="strong" data-label="Role">${esc(r.role)}</td>
        <td class="small" data-label="Covers"><span title="${esc(pagesSummary(r.pages))}">${esc(roleSummary(r))}</span></td>
        <td data-label="People">${Number(r.people) || 0}</td>
        <td style="text-align:right;white-space:nowrap"><button class="btn btn-ghost btn-sm" onclick="openRole('${esc(r.role).replace(/'/g, '&#39;')}')">${I.edit} Edit</button></td>
      </tr>`).join('') : `<tr><td colspan="4" class="muted" style="padding:16px">No roles yet.</td></tr>`}</tbody>
    </table></div></div>
    <div class="small muted" style="margin-top:10px">${esc(LEVEL_HELP)}</div>`,
  };
}
route('/roles', () => viewRoles());
function openRole(name){
  const r = (S.roles || []).find(x => x.role === name) || { role: '', pages: [], people: 0 };
  const holders = r.role ? roleHolders(r.role) : [];
  const tree = accessTree({ own: expandAccess(r.pages) });
  openModal({
    title: r.role ? 'Role: ' + r.role : 'New role', size:'wide',
    sub: r.role ? holders.length + ' ' + (holders.length === 1 ? 'person has' : 'people have') + ' this role.' : 'Give it a clear name, for example "Technician".',
    body: `${r.role ? '' : `<div class="field"><label for="rlName">Name</label><input class="inp" id="rlName" maxlength="40" placeholder="e.g. Shift supervisor"></div>`}
      <div class="mg-opens" style="margin-bottom:10px"><span class="strong">Covers:</span> <span id="rlPreview"></span></div>
      <div class="small muted" style="margin-bottom:10px">${esc(LEVEL_HELP)} Choosing a level on a console sets all its pages; open it to change single pages.</div>
      <div id="rlTree">${tree.html}</div>
      <div class="err-msg hide" data-err="rlName" style="margin-top:8px"></div>`,
    footer: `${r.role ? `<button class="btn btn-ghost" data-del style="margin-right:auto">Delete role</button>` : ''}<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>Save role</button>`,
    onMount: (w, close) => {
      tree.bind($('#rlTree', w), () => {
        const lines = accessLines(tree.value());
        $('#rlPreview', w).innerHTML = lines.length ? lines.map(l => `<span class="chip">${esc(l)}</span>`).join(' ') : '<span class="muted small">Nothing yet.</span>';
      });
      const save = async (pages, okMsg) => {
        clearErrors(w);
        const role = r.role || ($('#rlName', w).value || '').trim();
        if (!role) return setErr('rlName', 'Give the role a name.', w);
        try { await api('/webhook/users/api/roles/save', { method:'POST', body:{ role, pages } }); await loadPeople(); close(); render(); toast(okMsg, role, 'ok'); }
        catch (err) { setErr('rlName', err.message, w); }
      };
      $('[data-save]', w).onclick = () => {
        clearErrors(w);
        if (!r.role && !($('#rlName', w).value || '').trim()) return setErr('rlName', 'Give the role a name.', w);
        const pages = compressAccess(tree.value());
        if (!pages.length) return setErr('rlName', r.role ? 'Choose at least one page, or use Delete role.' : 'Choose at least one page.', w);
        save(pages, 'Role saved');
      };
      const d = $('[data-del]', w);
      if (d) d.onclick = async () => {
        if (holders.length) {
          // the database refuses to delete a role someone holds: say who, so the admin takes it off them first
          await confirmDialog('Take it off people first', `<b>${esc(r.role)}</b> is held by ${holders.map(h => '<b>' + esc(h.name) + '</b>').join(', ')}.
            Open each of them in People &gt; Manage, untick the role and save; then delete it here.`, 'OK');
          return;
        }
        if (await confirmDialog('Delete role?', `Delete the role <b>${esc(r.role)}</b>? Nobody holds it, so nobody's access changes.`, 'Delete', 'danger')) save([], 'Role deleted');
      };
    },
  });
}

/* ---------------- Activity (audit) ---------------- */
let auditRows = null;
const ACTION_LABELS = { account_created:'Account created', grants_set:'Access changed', reset:'PIN reset', unlock:'Unlocked', deactivate:'Deactivated',
  activate:'Reactivated', make_admin:'Made admin', remove_admin:'Admin removed', password_changed:'Changed password', locked:'Locked after wrong passwords', overtime_saved:'Overtime recorded',
  overtime_submitted:'Overtime submitted', overtime_edited:'Overtime edited', overtime_voided:'Overtime voided', leave_submitted:'Leave requested', leave_decided:'Leave decision',
  leave_cancelled:'Leave cancelled', leave_types_saved:'Leave types changed', leave_entitlement_set:'Yearly leave days set', holidays_saved:'Public holidays changed',
  approver_saved:'Approver saved', approver_removed:'Approver removed', salary_formula_saved:'Salary formula changed',
  access_set:'Console / machine app changed', employee_linked:'Linked to employee record', role_saved:'Role saved', role_removed:'Role removed' };
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


/* ============================================================
   Approvers: the one list of who approves and who can submit requests (Procurement, Leave). Admins only.
   Each row can be linked to an employee, so the system recognises that person exactly (their own leave never goes to themselves).
   ============================================================ */
const proper = v => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().toLowerCase().replace(/(^|[\s\-.(])([a-z\u00e0-\u00ff])/g, (m, a, b) => a + b.toUpperCase());
const EMAIL_OK = e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(e || ''));
let aprState = { rows:null, employees:null, departments:null, loading:false };
async function aprLoad(force){
  if (aprState.loading) return; if (aprState.rows && !force) return;
  aprState.loading = true;
  try {
    const [a, e, d] = await Promise.all([api('/webhook/users/api/approvers'), aprState.employees ? Promise.resolve(null) : api('/webhook/employees/api/list'), aprState.departments ? Promise.resolve(null) : api('/webhook/employees/api/departments')]);
    aprState.rows = a.approvers || [];
    if (e) aprState.employees = (e.employees || []).filter(x => (x.status || 'active') !== 'inactive').map(x => ({ enroll_id:x.enroll_id, name:proper(x.name), department:x.department, email:x.email || x.work_email || '', type:x.employment_type })).sort((p, q) => p.name.localeCompare(q.name));
    if (d) aprState.departments = d.departments || [];
  } catch (err) { aprState.rows = aprState.rows || []; toast('Could not load approvers', err.message, 'err'); }
  aprState.loading = false; aprPaint();
}
function aprIssues(r){
  const out = [];
  if (!r.enroll_id) out.push(['Not linked to an employee', 'b-warn']);
  else if (r.employee_status === 'inactive') out.push(['Employee has left', 'b-danger']);
  if (!EMAIL_OK(r.email)) out.push(['Email looks wrong', 'b-danger']);
  return out;
}
const aprFilter = { dept:'', role:'', q:'' };
const aprDept = r => r.department || 'Engineering flow';
const aprRank = { requester:0, manager:1, engineering:1, operations:2, plant_head:3 };
function aprFiltered(){
  const q = aprFilter.q.trim().toLowerCase();
  return (aprState.rows || []).filter(r => (!aprFilter.dept || aprDept(r) === aprFilter.dept) && (!aprFilter.role || (r.label || r.stage) === aprFilter.role) &&
    (!q || (String(r.name) + ' ' + String(r.email) + ' ' + String(r.employee_name || '') + ' ' + String(r.enroll_id || '')).toLowerCase().includes(q)))
    .sort((x, y) => aprDept(x).localeCompare(aprDept(y)) || (aprRank[x.stage] - aprRank[y.stage]) || String(x.name).localeCompare(String(y.name)));
}
function aprPaintFilters(){
  const rows = aprState.rows || [], f = $('#aprFilters'); if (!f) return;
  const depts = [...new Set(rows.map(aprDept))].sort(), roles = [...new Set(rows.map(r => r.label || r.stage))].sort();
  f.innerHTML = `<div class="field" style="margin:0"><label for="aprFDept">Department</label><select class="inp" id="aprFDept"><option value="">All departments</option>${depts.map(d => `<option ${aprFilter.dept === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></div>
    <div class="field" style="margin:0"><label for="aprFRole">Role</label><select class="inp" id="aprFRole"><option value="">All roles</option>${roles.map(d => `<option ${aprFilter.role === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></div>
    <div class="field" style="margin:0"><label for="aprFQ">Person</label><input class="inp" id="aprFQ" placeholder="Search name or email" value="${esc(aprFilter.q)}"></div>`;
  $('#aprFDept').onchange = e => { aprFilter.dept = e.target.value; aprPaint(); };
  $('#aprFRole').onchange = e => { aprFilter.role = e.target.value; aprPaint(); };
  $('#aprFQ').oninput = debounce(e => { aprFilter.q = e.target.value; aprPaint(); }, 150);
}
function aprPaint(){
  const box = $('#aprBody'); if (!box) return;
  if (!aprState.rows) { box.innerHTML = `<div class="small muted" style="padding:14px">Loading...</div>`; return; }
  if (!$('#aprFDept')) aprPaintFilters();
  else {      // rows arrived after the page was drawn: refresh the choices without touching the search box
    const rr = aprState.rows, ds = [...new Set(rr.map(aprDept))].sort(), ro = [...new Set(rr.map(r => r.label || r.stage))].sort();
    $('#aprFDept').innerHTML = '<option value="">All departments</option>' + ds.map(d => `<option ${aprFilter.dept === d ? 'selected' : ''}>${esc(d)}</option>`).join('');
    $('#aprFRole').innerHTML = '<option value="">All roles</option>' + ro.map(d => `<option ${aprFilter.role === d ? 'selected' : ''}>${esc(d)}</option>`).join('');
  }
  const all = aprState.rows, rows = aprFiltered(), unlinked = all.filter(r => !r.enroll_id).length, other = all.filter(r => r.enroll_id && aprIssues(r).length).length + all.filter(r => !r.enroll_id && !EMAIL_OK(r.email)).length;
  const hr = r => r.flow === 'dept' && r.stage === 'manager' && /\(HR approver\)/.test(r.used_by || '');
  const hasReq = new Set(all.filter(r => r.flow === 'dept' && r.stage === 'requester').map(r => String(r.department).toLowerCase()));
  // why a row cannot be removed (empty = it can). The server enforces the same rules.
  const keep = r => r.flow === 'engineering' ? 'Each step of the engineering flow needs exactly one person, so it can only be changed, not removed.'
    : hr(r) ? 'This is the HR approver for Leave. Change who it is instead of removing it.'
    : (r.stage === 'manager' && hasReq.has(String(r.department).toLowerCase())) ? 'This department still has requesters, so it needs a manager. Change the manager instead.' : '';
  box.innerHTML = `${unlinked || other ? `<div class="notice warn" style="margin:14px">${I.alert}<div>${unlinked ? `<b>${unlinked}</b> of ${all.length} approver${all.length === 1 ? ' is' : 's are'} not linked to an employee record yet. ` : ''}${other ? `<b>${other}</b> ha${other === 1 ? 's' : 've'} an email that looks wrong or an employee who has left. ` : ''}Linking lets Leave recognise the person exactly (their own leave is never sent to themselves).</div></div>` : ''}
    ${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Department</th><th>Role</th><th>Person</th><th>Employee record</th><th>Used by</th><th></th></tr></thead><tbody>
      ${rows.map(r => `<tr>
        <td data-label="Department" class="strong">${esc(aprDept(r))}</td>
        <td data-label="Role">${esc(r.label || r.stage)}${hr(r) ? ' <span class="badge b-info">HR approver</span>' : ''}</td>
        <td data-label="Person" class="wrap-any"><div class="strong">${esc(r.name)}</div><div class="small muted">${esc(r.email)}</div></td>
        <td data-label="Employee record">${r.enroll_id ? `${esc(proper(r.employee_name || ''))} <span class="tiny muted mono">${esc(r.enroll_id)}</span>` : '<span class="muted">--</span>'}
          ${aprIssues(r).map(([t, c]) => `<div style="margin-top:3px"><span class="badge ${c}">${esc(t)}</span></div>`).join('')}</td>
        <td data-label="Used by" class="small">${esc(r.used_by)}</td>
        <td data-label=""><div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" onclick="aprOpen('${esc(r.role_key)}')">${I.edit} Change</button>
          ${keep(r) ? `<button class="btn btn-ghost btn-sm" disabled title="${esc(keep(r))}" aria-label="${esc(keep(r))}" style="opacity:.45;cursor:not-allowed">${I.x} Remove</button>` : `<button class="btn btn-ghost btn-sm" onclick="aprRemove('${esc(r.role_key)}')">${I.x} Remove</button>`}</div></td></tr>`).join('')}
      </tbody></table></div>` : `<div class="small muted" style="padding:14px">No approvers match these filters.</div>`}
    <div class="small muted" style="padding:14px">${rows.length === all.length ? all.length : rows.length + ' of ' + all.length} approver${all.length === 1 ? '' : 's'}. <b>Requesters</b> can submit a Procurement request for their department. <b>Managers</b> approve Procurement requests and are the first approver for Leave.
      <b>Business Support/HR is the HR department:</b> its manager is the HR approver for Leave, after the person's own manager.
      <b>Remove</b> is greyed out where the system needs that person: the engineering steps, the HR approver, and a manager whose department still has requesters. Change them instead (hover the button to see why).</div>`;
}
route('/approvers', () => ({
  title:'Approvers', crumb:'Admin',
  html: `${pageHead('Approvers', 'Who approves requests and who can submit them. Procurement and Leave both use this one list.',
    `<button class="btn btn-ghost" onclick="aprSuggest()">${I.check} Suggest links</button><button class="btn btn-ghost" onclick="aprOpen('', 'requester')">${I.plus} Add requester</button><button class="btn btn-primary" onclick="aprOpen('', 'manager')">${I.plus} Add department manager</button>`)}
    <div class="row filter-bar" id="aprFilters" style="margin-bottom:14px"></div><div class="card"><div id="aprBody"></div></div>`,
  bind(){ aprPaintFilters(); aprPaint(); aprLoad(true); },
}));
/* ---- Suggest links: match every unlinked approver to an employee in one go ---- */
const aprWords = v => String(v || '').toLowerCase().replace(/[^a-z\u00e0-\u00ff\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);
function aprCandidates(r){
  const emps = aprState.employees || [], mail = String(r.email || '').trim().toLowerCase(), want = aprWords(r.name);
  const byMail = mail ? emps.filter(e => String(e.email || '').trim().toLowerCase() === mail) : [];
  if (byMail.length) return { kind:'email', list:byMail };
  if (!want.length) return { kind:'none', list:[] };
  const list = emps.filter(e => { const have = aprWords(e.name); return want.every(w => have.includes(w)); })
    .sort((a, b) => ((b.department === r.department ? 1 : 0) - (a.department === r.department ? 1 : 0)) || aprWords(a.name).length - aprWords(b.name).length).slice(0, 8);
  const sameDept = r.department ? list.filter(e => e.department === r.department) : [];
  return { kind: list.length ? 'name' : 'none', list, pick: list.length === 1 ? list[0] : (sameDept.length === 1 ? sameDept[0] : null) };
}
function aprSuggest(){
  const todo = (aprState.rows || []).filter(r => !r.enroll_id);
  if (!todo.length) { toast('Nothing to link', 'Every approver is already linked to an employee.', 'ok'); return; }
  const sug = todo.map(r => Object.assign({ r }, aprCandidates(r)));
  const tag = x => x.kind === 'email' ? '<span class="badge b-ok">Email matches</span>' : x.kind === 'name' ? `<span class="badge b-warn">${x.pick ? 'Name matches: please check' : x.list.length + ' people share this name'}</span>` : '<span class="badge b-slate">No match: use Change</span>';
  openModal({
    title:'Suggested links', size:'wide', sub:'Tick the ones that are right. An employee with no work email on record gets the approver\'s email added.',
    body:`<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Approver</th><th>Employee record</th></tr></thead><tbody>
      ${sug.map((x, i) => `<tr><td data-label=""><input type="checkbox" data-sg="${i}" ${(x.kind === 'email' && x.list.length === 1) || x.pick ? 'checked' : ''} ${x.list.length ? '' : 'disabled'}></td>
        <td data-label="Approver"><div class="strong">${esc(x.r.name)}</div><div class="small muted">${esc(x.r.label || x.r.stage)} - ${esc(aprDept(x.r))}<br>${esc(x.r.email)}</div></td>
        <td data-label="Employee record">${x.list.length ? `<select class="inp" data-pick="${i}">${x.list.length > 1 && !x.pick ? '<option value="">Choose...</option>' : ''}${x.list.map(e => `<option value="${esc(e.enroll_id)}" ${x.pick && x.pick.enroll_id === e.enroll_id ? 'selected' : ''}>${esc(e.name)} - ${esc(e.enroll_id)}${e.department ? ' - ' + esc(e.department) : ''}</option>`).join('')}</select>` : ''}<div style="margin-top:4px">${tag(x)}</div></td></tr>`).join('')}
      </tbody></table></div><div class="err-msg hide" id="sgErr" style="margin-top:8px"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Link the ticked ones</button>`,
    onMount:(w, close) => {
      $$('[data-pick]', w).forEach(sel => sel.onchange = () => { const box = $('[data-sg="' + sel.dataset.pick + '"]', w); if (box) box.checked = !!sel.value; });
      $('[data-save]', w).onclick = async () => {
        const jobs = sug.map((x, i) => ({ x, box: $('[data-sg="' + i + '"]', w), sel: $('[data-pick="' + i + '"]', w) })).filter(j => j.box && j.box.checked && j.sel && j.sel.value);
        if (!jobs.length) { const e = $('#sgErr', w); e.textContent = 'Tick at least one, and choose the employee.'; e.classList.remove('hide'); return; }
        const btn = $('[data-save]', w); btn.disabled = true; let ok = 0; const failed = [];
        for (const j of jobs) {
          try { await api('/webhook/users/api/approvers/save', { method:'POST', body:{ role_key: j.x.r.role_key, name: j.x.r.name, email: j.x.r.email, enroll_id: j.sel.value } }); ok++; }
          catch (err) { failed.push(j.x.r.name + ': ' + err.message); }
        }
        if (failed.length) { const e = $('#sgErr', w); e.textContent = ok + ' linked. Not linked: ' + failed.join(' | ') + ' (fix these with Change).'; e.classList.remove('hide'); btn.disabled = false; aprLoad(true); return; }
        close(); toast('Linked', ok + ' approver' + (ok === 1 ? '' : 's') + ' linked to their employee record.', 'ok'); aprLoad(true);
      };
    },
  });
}
function aprOpen(roleKey, newStage){
  const row = roleKey ? (aprState.rows || []).find(r => r.role_key === roleKey) : null;
  if (roleKey && !row) return;
  const emps = aprState.employees || [], deps = aprState.departments || [];
  const body = `${row ? `<div class="small muted" style="margin-bottom:12px">${esc(row.label || row.stage)}${row.department ? ' - ' + esc(row.department) : ''}. Change who this is.</div>`
      : `<div class="field"><label for="aprDept">Department</label><select class="inp" id="aprDept"><option value="">Choose...</option>${deps.map(d => `<option>${esc(d)}</option>`).join('')}</select><div class="err-msg hide" data-err="aprDept"></div></div>`}
    <div class="field"><label for="aprFind">Employee record</label><input class="inp" id="aprFind" placeholder="Type to search by name, ID or department" autocomplete="off">
      <select class="inp" id="aprEmp" size="6" style="margin-top:6px"></select><div class="small muted" style="margin-top:4px">Link the person so the system recognises them. Their name and email are filled in from the record.</div></div>
    <div class="grid g2"><div class="field"><label for="aprName">Name shown</label><input class="inp" id="aprName" maxlength="100" value="${esc(row ? row.name : '')}"><div class="err-msg hide" data-err="aprName"></div></div>
      <div class="field"><label for="aprEmail">Email</label><input class="inp" id="aprEmail" type="email" value="${esc(row ? row.email : '')}"><div class="err-msg hide" data-err="aprEmail"></div></div></div>`;
  openModal({
    title: row ? 'Change approver' : (newStage === 'manager' ? 'Add department manager' : 'Add requester'), size:'wide', body,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Save</button>`,
    onMount: (w, close) => {
      let picked = row && row.enroll_id ? row.enroll_id : '';
      const paintEmp = () => {
        const q = $('#aprFind', w).value.trim().toLowerCase();
        const list = emps.filter(e => !q || (e.name + ' ' + e.enroll_id + ' ' + (e.department || '')).toLowerCase().includes(q)).slice(0, 80);
        $('#aprEmp', w).innerHTML = `<option value="">No employee (not linked)</option>` + list.map(e => `<option value="${esc(e.enroll_id)}" ${e.enroll_id === picked ? 'selected' : ''}>${esc(e.name)} - ${esc(e.enroll_id)}${e.department ? ' - ' + esc(e.department) : ''}</option>`).join('');
      };
      paintEmp();
      $('#aprFind', w).oninput = debounce(paintEmp, 120);
      $('#aprEmp', w).onchange = e => {
        picked = e.target.value; const emp = emps.find(x => x.enroll_id === picked);
        if (emp) { $('#aprName', w).value = emp.name; if (emp.email) $('#aprEmail', w).value = emp.email; }
      };
      $('[data-save]', w).onclick = async () => {
        clearErrors(w);
        const dept = row ? row.department : $('#aprDept', w).value, name = $('#aprName', w).value.trim(), email = $('#aprEmail', w).value.trim();
        if (!row && !dept) return setErr('aprDept', 'Choose a department.', w);
        if (!name && !picked) return setErr('aprName', 'Enter a name, or pick the employee.', w);
        if (email && !EMAIL_OK(email)) return setErr('aprEmail', 'Enter a valid email address (for example name@orangegroups.ng).', w);
        if (!email && !(emps.find(x => x.enroll_id === picked) || {}).email) return setErr('aprEmail', 'Enter an email: this employee has none on record yet.', w);
        const btn = $('[data-save]', w); btn.disabled = true;
        try {
          await api('/webhook/users/api/approvers/save', { method:'POST', body:{ role_key: row ? row.role_key : '', flow:'dept', stage: row ? row.stage : newStage, department: dept, name, email, enroll_id: picked } });
          close(); toast('Saved', (name || 'Approver') + ' saved.', 'ok'); aprLoad(true);
        } catch (err) { setErr('aprEmail', err.message, w); btn.disabled = false; }
      };
    },
  });
}
async function aprRemove(roleKey){
  const row = (aprState.rows || []).find(r => r.role_key === roleKey); if (!row) return;
  if (!await confirmDialog('Remove this approver?', `<b>${esc(row.name)}</b> (${esc(row.label || row.stage)}, ${esc(row.department || '')}) will be taken off the list.`, 'Remove', 'danger')) return;
  try { await api('/webhook/users/api/approvers/delete', { method:'POST', body:{ role_key: roleKey } }); toast('Removed', row.name + ' was removed.', 'ok'); aprLoad(true); }
  catch (err) { toast('Could not remove', err.message, 'err'); }
}
