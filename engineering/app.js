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
    thermo: w('<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>'),
    wrench: w('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
    layers: w('<path d="M12 2l10 5-10 5L2 7z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>'),
    sliders: w('<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'),
    download: w('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>', 'width="15" height="15"'),
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
  try { sessionStorage.setItem('okl.notice', 'You do not have access to Engineering. Ask an admin if you need it.'); } catch(e) { /* ignore */ }
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
const PAGES = [["/spares", "engineering.spares"], ["/jobs", "engineering.jobs"], ["/stops", "engineering.jobs"], ["/floor", "engineering.jobs"],
  ["/actions", "engineering.actions"], ["/pm", "engineering.pm"], ["/overview", "engineering.actions"], ["/outdoor", "engineering.outdoor"],
  ["/equipment", "engineering.equipment"], ["/settings", "engineering.settings"], ["/ahu", "engineering.ahu"]];   // route prefix -> page, first match wins
function pageOf(path){
  const p = String(path == null ? currentPath() : path).split('?')[0];
  const hit = PAGES.find(([pre]) => p === pre || p.startsWith(pre + '/'));
  return hit ? hit[1] : 'engineering';                // "/" (home) needs only the console
}
// Where the console opens: the manager on the Overview, technicians on Calls and jobs, the storekeeper on Spares,
// everyone else on the first page they can open (people who only log AHU temperatures land on the log).
function homePath(){
  if ((levelOf('engineering.jobs') === 'edit' || levelOf('engineering.actions') === 'edit') && canOpen('/overview')) return '/overview';
  if (['submit', 'edit'].includes(levelOf('engineering.jobs'))) return '/jobs';
  if (levelOf('engineering.spares') === 'edit') return '/spares';
  const first = allowedNav()[0];
  return first ? first.items[0].path : '/ahu';
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
  const mgr = levelOf('engineering.jobs') === 'edit';
  return [
    { title:'Maintenance', items:[
      { path:'/overview', label:'Overview', icon:'layers' },
      { path:'/jobs', label:'Calls and jobs', icon:'wrench' },
      { path:'/stops', label:'Machine stops', icon:'alert' },
      { path:'/pm', label:'Preventive maintenance', icon:'checkCircle' },
      { path:'/actions', label:'Corrective and preventive actions', icon:'edit' },
    ] },
    { title:'Logs', items:[
      { path:'/ahu', label:'AHU Temperature Log', icon:'thermo' },
      { path:'/outdoor', label:'Outdoor Units', icon:'thermo' },
    ] },
    { title:'Store', items:[
      { path:'/spares', label:'Spares', icon:'box' },
    ] },
    { title:'Setup', items:[
      { path:'/equipment', label:'Equipment and parts', icon:'layers' },
      { path:'/settings', label:'Settings', icon:'sliders' },
    ].concat(mgr ? [{ path:'/floor', label:'Floor messages', icon:'externalLink' }] : []) },
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
        <div style="font-size:13px;font-weight:700;color:#fff;letter-spacing:.02em">Engineering</div>
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
/* ---------------- Excel downloads (SheetJS, loaded on first use, as in the HR console) ---------------- */
const SHEETJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
function loadSheetJS(){
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = SHEETJS_URL;
    s.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error('The spreadsheet maker did not load.'));
    s.onerror = () => reject(new Error('Could not load the spreadsheet maker. Check your connection and try again.'));
    document.head.appendChild(s);
  });
}
/* sheets = [{ name, head:[...], rows:[[...]] }] -> one .xlsx file named OKL_<name>_<date>.xlsx */
async function downloadXlsx(name, sheets){
  try {
    const XLSX = await loadSheetJS(), wb = XLSX.utils.book_new();
    sheets.forEach(sh => {
      const ws = XLSX.utils.aoa_to_sheet([sh.head].concat(sh.rows.map(r => r.map(v => v == null ? '' : v))));
      ws['!cols'] = sh.head.map((h, i) => ({ wch: Math.min(60, Math.max(10, String(h).length + 2, ...sh.rows.slice(0, 200).map(r => String(r[i] == null ? '' : r[i]).length + 1))) }));
      if (sh.rows.length) ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s:{ r:0, c:0 }, e:{ r:sh.rows.length, c:sh.head.length - 1 } }) };
      XLSX.utils.book_append_sheet(wb, ws, String(sh.name).slice(0, 31));
    });
    XLSX.writeFile(wb, 'OKL_' + name.replace(/[^\w-]+/g, '_') + '_' + todayIso() + '.xlsx');
  } catch (e) { toast('Could not make the file', e.message, 'err', 7000); }
}
const dlButton = onclick => `<button class="btn btn-ghost" onclick="${onclick}">${I.download} Download</button>`;
const lagosDay = iso => iso ? new Date(new Date(iso).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ') : '';

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
  S = { me: meFromAuth(auth, 'engineering') };
  resetIdleTimer();
}
function render(){
  const app = document.getElementById('app');
  try {
    if (!S){ toLanding(); return; }
    const path = currentPath();
    if (!canOpen(path)){
      const first = allowedNav()[0];
      if (first && first.items[0].path !== path.split('?')[0]) { location.hash = '#' + first.items[0].path; return; }
      if (!first) { noAccess(); return; }
    }
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
    const keep = window.scrollY;
    app.innerHTML = renderShell(out.html, out);
    document.body.classList.remove('nav-open');
    if (out.bind) { try { out.bind(); } catch(e){ console.error(e); } }
    window.scrollTo({ top: out.keepScroll ? keep : 0 });
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
   AHU temperature log
   One month at a time from GET /webhook/engineering/api/ahu/month?month=YYYY-MM (SQL: okl_eng_ahu_month).
   Readings arrive as [room_id, day, temp, status, logged_by, time, timing, note]; totals and colours are worked out here.
   Colour codes are the same as the Google Sheet and the WhatsApp notices.
   ============================================================ */
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ojcv39NHPa13S7IluAeaGnumuuhRS2C78qIJdzIyaNs';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const STATUS_CLASS = { 'OK':'ok', 'Near limit':'near', 'Out of limit':'bad', 'Needs review':'rev' };
const LINE_COLORS = ['#1B5FBF','#ED6B1F','#16794C','#8B5CF6','#B3261E','#0E7490','#B45309','#BE185D'];
let AHU = { month:'', data:null, loading:false, error:'' };

async function ahuLoad(month){
  AHU.loading = true; AHU.error = '';
  render();
  try {
    AHU.data = await api('/webhook/engineering/api/ahu/month' + (month ? '?month=' + encodeURIComponent(month) : ''));
    AHU.month = AHU.data.month;
  } catch (e) { AHU.error = e.message; }
  AHU.loading = false;
  render();
}
function ahuShift(step){
  const [y, m] = (AHU.month || '').split('-').map(Number);
  if (!y) return;
  const d = new Date(Date.UTC(y, m - 1 + step, 1));
  ahuLoad(d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0'));
}
function ahuThisMonth(){ ahuLoad(''); }
function monthLabel(ym){ const [y, m] = String(ym).split('-').map(Number); return MONTHS[m - 1] + ' ' + y; }
function lagosMinutes(){
  const p = new Intl.DateTimeFormat('en-GB', { timeZone:'Africa/Lagos', hour:'2-digit', minute:'2-digit', hour12:false }).format(new Date()).split(':').map(Number);
  return p[0] * 60 + p[1];
}
const fmtT = v => v == null ? '?' : Number(v).toFixed(1);

// everything the screen draws, worked out once per render
function ahuModel(D){
  const rooms = D.rooms || [];
  const byRoom = {}; rooms.forEach(r => { byRoom[r.id] = r; });
  const cell = {};                       // 'roomId|day' -> reading
  const counts = { 'OK':0, 'Near limit':0, 'Out of limit':0, 'Needs review':0 };
  const daily = {};                      // day -> { logged, ok, near, bad }
  const perAhu = {};
  rooms.forEach(r => { if (!perAhu[r.ahu]) perAhu[r.ahu] = { ahu:r.ahu, rooms:[], readings:0, bad:0, max:null }; perAhu[r.ahu].rooms.push(r); });
  (D.readings || []).forEach(x => {
    const r = byRoom[x[0]]; if (!r) return;
    const rd = { roomId:x[0], day:x[1], temp:x[2], status:x[3], by:x[4], time:x[5], timing:x[6], note:x[7] };
    cell[x[0] + '|' + x[1]] = rd;
    counts[rd.status] = (counts[rd.status] || 0) + 1;
    const dd = daily[rd.day] || (daily[rd.day] = { logged:0, ok:0, near:0, bad:0 });
    if (rd.temp != null){
      dd.logged++;
      if (rd.status === 'Out of limit') dd.bad++; else if (rd.status === 'Near limit') dd.near++; else dd.ok++;
      const a = perAhu[r.ahu]; a.readings++; if (rd.status === 'Out of limit') a.bad++;
      if (a.max == null || rd.temp > a.max) a.max = Number(rd.temp);
    }
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { rooms, cell, counts, daily, perAhu: Object.values(perAhu), total, daysLogged: Object.keys(daily).filter(d => daily[d].logged > 0).length };
}

function ahuToday(D, M){
  const first = D.first, last = D.last, t = D.today;
  if (t < first || t > last) return '';
  const ts = D.today_summary || {}, by = D.today_by;
  const logged = ts.logged || 0, total = ts.total || (D.rooms || []).length, mins = lagosMinutes();
  let cls = 'info', head, msg;
  if (!D.today_is_workday){ head = 'No readings today'; msg = 'Today is a weekend or a public holiday, so no log is due.'; }
  else if (total && logged >= total){ cls = 'ok'; head = 'Today is done'; msg = 'All ' + total + ' rooms are logged.'; }
  else if (mins >= 16 * 60){ cls = 'danger'; head = 'Today is overdue'; msg = 'The log was due by 4:00 pm and ' + (total - logged) + ' room' + (total - logged === 1 ? ' is' : 's are') + ' still missing. The group has been escalated.'; }
  else if (mins >= 14 * 60){ cls = 'warn'; head = 'Today is due'; msg = (total - logged) + ' room' + (total - logged === 1 ? '' : 's') + ' still to log. Due by 4:00 pm.'; }
  else { head = 'Today'; msg = 'Readings are due between 2:00 and 4:00 pm.' + (logged ? ' ' + logged + ' already logged.' : ''); }
  const out = ts.out || [];
  return `<div class="eng-today ${cls}">
    <div><div class="small strong">${esc(head)}</div><div class="big">${logged} of ${total} rooms</div></div>
    <div class="eng-bar"><i style="width:${total ? Math.round(100 * logged / total) : 0}%"></i></div>
    <div class="msg">${esc(msg)}${by && by.name ? ` <span class="muted">Last logged by ${esc(by.name)} at ${esc(by.time)}${by.timing === 'Late' ? ' (late)' : ''}.</span>` : ''}
      ${out.length ? `<div style="margin-top:4px"><strong style="color:var(--t-bad-tx)">Out of limit:</strong> ${out.map(o => esc(o.room) + ' ' + fmtT(o.temp) + ' °C').join(', ')}</div>` : ''}</div>
  </div>`;
}

function ahuKpis(M){
  const c = M.counts;
  const k = (cls, lbl, val) => `<div class="eng-kpi ${cls}"><div class="lbl">${lbl}</div><div class="val">${val}</div></div>`;
  return `<div class="eng-kpis">${k('', 'Readings logged', M.total - c['Needs review'])}${k('', 'Days logged', M.daysLogged)}
    ${k('ok', 'OK', c['OK'])}${k('near', 'Near limit', c['Near limit'])}${k('bad', 'Out of limit', c['Out of limit'])}${c['Needs review'] ? k('rev', 'Needs review', c['Needs review']) : ''}</div>`;
}

function ahuGrid(D, M){
  const days = D.days || [], today = D.today;
  const dow = d => ['S','M','T','W','T','F','S'][new Date(d.date + 'T00:00:00Z').getUTCDay()];
  let h = `<thead><tr><th class="rn">Room</th>${days.map(d => `<th class="${d.workday ? '' : 'off'}" title="${esc(d.date)}">${d.d}<small>${dow(d)}</small></th>`).join('')}</tr></thead><tbody>`;
  const ahus = [...new Set(M.rooms.map(r => r.ahu))];
  ahus.forEach(ahu => {
    h += `<tr class="ahu"><td class="rn">${esc(ahu)}</td><td colspan="${days.length}"></td></tr>`;
    M.rooms.filter(r => r.ahu === ahu).forEach(r => {
      h += `<tr><td class="rn">${esc(r.room)}</td>`;
      days.forEach(d => {
        const rd = M.cell[r.id + '|' + d.d];
        if (rd) h += `<td class="c ${STATUS_CLASS[rd.status] || ''}${rd.timing === 'Late' ? ' late' : ''}" data-r="${r.id}" data-d="${d.d}">${rd.temp == null ? '?' : fmtT(rd.temp)}</td>`;
        else if (d.workday && d.date <= today) h += `<td class="miss" title="Not logged"></td>`;
        else h += `<td class="${d.workday ? '' : 'off'}"></td>`;
      });
      h += '</tr>';
    });
  });
  return `<div class="eng-legend"><span class="lg-ok">OK</span><span class="lg-near">Near limit (23 to 25 °C)</span><span class="lg-bad">Out of limit (above 25 °C)</span><span class="lg-rev">Needs review</span><span class="lg-miss">Not logged</span><span style="background:#fff;border:1px solid var(--line);box-shadow:inset 0 -3px 0 #1B5FBF">Logged late</span></div>
    <div class="eng-grid-wrap"><table class="eng-grid">${h}</tbody></table></div>`;
}

function ahuDailyChart(D, M){
  const days = D.days || [], n = days.length, W = 760, H = 150, L = 30, B = 22, T = 8, max = Math.max(M.rooms.length, 1);
  const step = (W - L - 6) / n, bw = Math.max(4, step * 0.68);
  const y = v => T + (H - T - B) * (1 - v / max);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rooms logged per day by colour code">`;
  [0, max].forEach(v => { s += `<line x1="${L}" x2="${W - 4}" y1="${y(v)}" y2="${y(v)}" stroke="#E4E7EA"/><text x="${L - 5}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#8A93A0">${v}</text>`; });
  days.forEach((d, i) => {
    const x = L + i * step + (step - bw) / 2, q = M.daily[d.d] || { ok:0, near:0, bad:0, logged:0 };
    let base = 0;
    [['ok', '#2E9E5B'], ['near', '#E6A700'], ['bad', '#D64545']].forEach(([k, col]) => {
      if (!q[k]) return;
      s += `<rect x="${x.toFixed(1)}" y="${y(base + q[k]).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(base) - y(base + q[k])).toFixed(1)}" fill="${col}"/>`;
      base += q[k];
    });
    s += `<rect x="${(L + i * step).toFixed(1)}" y="${T}" width="${step.toFixed(1)}" height="${H - T - B}" fill="transparent"><title>${esc(d.date)}: ${q.logged} of ${max} rooms logged, ${q.near} near limit, ${q.bad} out of limit</title></rect>`;
    if (n <= 16 || d.d % 2 === 1) s += `<text x="${(L + i * step + step / 2).toFixed(1)}" y="${H - 7}" text-anchor="middle" font-size="10" fill="${d.workday ? '#565E6B' : '#B6BCC4'}">${d.d}</text>`;
  });
  return s + '</svg>';
}

function ahuTrend(D, M, a){
  const days = D.days || [], n = days.length, W = 480, H = 230, L = 34, R = 10, T = 12, B = 24;
  const vals = []; a.rooms.forEach(r => days.forEach(d => { const rd = M.cell[r.id + '|' + d.d]; if (rd && rd.temp != null) vals.push(Number(rd.temp)); }));
  const limit = Number(a.rooms[0].limit) || 25;
  const lo = Math.min(15, Math.floor((vals.length ? Math.min(...vals) : 15) - 1)), hi = Math.max(30, Math.ceil((vals.length ? Math.max(...vals) : 30) + 1));
  const x = d => L + (W - L - R) * ((d - 1) / Math.max(n - 1, 1)), y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(a.ahu)} temperature trend">`;
  for (let v = Math.ceil(lo / 5) * 5; v <= hi; v += 5) s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#EDF0F2"/><text x="${L - 5}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#8A93A0">${v}</text>`;
  days.forEach(d => { if (n <= 16 || d.d % 5 === 0 || d.d === 1) s += `<text x="${x(d.d).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="#8A93A0">${d.d}</text>`; });
  s += `<line x1="${L}" x2="${W - R}" y1="${y(limit)}" y2="${y(limit)}" stroke="#D64545" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${W - R}" y="${y(limit) - 4}" text-anchor="end" font-size="10" fill="#D64545">limit ${limit}</text>`;
  a.rooms.forEach((r, i) => {
    const col = LINE_COLORS[i % LINE_COLORS.length], pts = [];
    days.forEach(d => { const rd = M.cell[r.id + '|' + d.d]; if (rd && rd.temp != null) pts.push([d.d, Number(rd.temp), d.date]); });
    if (pts.length > 1) s += `<polyline fill="none" stroke="${col}" stroke-width="1.6" points="${pts.map(p => x(p[0]).toFixed(1) + ',' + y(p[1]).toFixed(1)).join(' ')}"/>`;
    pts.forEach(p => { s += `<circle cx="${x(p[0]).toFixed(1)}" cy="${y(p[1]).toFixed(1)}" r="2.6" fill="${col}"><title>${esc(r.room)}, ${esc(p[2])}: ${p[1].toFixed(1)} °C</title></circle>`; });
  });
  return `<div class="card eng-chart"><div class="card-h"><div><h3>${esc(a.ahu)}</h3><div class="sub">${a.readings} readings, ${a.bad} out of limit</div></div></div>
    <div class="card-b">${s}</svg><div class="lgd">${a.rooms.map((r, i) => `<span><i style="background:${LINE_COLORS[i % LINE_COLORS.length]}"></i>${esc(r.room)}</span>`).join('')}</div></div></div>`;
}

function ahuByAhu(M){
  const pct = a => a.readings ? a.bad / a.readings : 0;
  return `<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>AHU</th><th>Rooms</th><th>Readings</th><th>Out of limit</th><th>% out of limit</th><th>Highest °C</th></tr></thead><tbody>
    ${M.perAhu.map(a => `<tr><td data-label="AHU"><strong>${esc(a.ahu)}</strong></td><td data-label="Rooms">${a.rooms.length}</td><td data-label="Readings">${a.readings}</td>
      <td data-label="Out of limit">${a.bad}</td><td data-label="% out of limit">${a.readings ? `<span class="badge" style="background:${pct(a) > 0.1 ? 'var(--t-bad-bg)' : 'var(--t-ok-bg)'};color:${pct(a) > 0.1 ? 'var(--t-bad-tx)' : 'var(--t-ok-tx)'}">${(100 * pct(a)).toFixed(1)}%</span>` : '--'}</td>
      <td data-label="Highest °C">${a.max == null ? '--' : a.max.toFixed(1)}</td></tr>`).join('')}</tbody></table></div></div>`;
}

function ahuDetail(D, M, roomId, day){
  const rd = M.cell[roomId + '|' + day], r = M.rooms.find(x => x.id === roomId); if (!rd || !r) return;
  const date = (D.days.find(d => d.d === day) || {}).date || '';
  const cls = STATUS_CLASS[rd.status] || '';
  openModal({ title: r.ahu + ' ' + r.room, sub: date, size:'narrow',
    body: `<dl class="eng-det">
      <dt>Temperature</dt><dd><strong style="font-size:20px">${rd.temp == null ? '?' : fmtT(rd.temp) + ' °C'}</strong> <span class="eng-legend" style="display:inline-flex;margin:0 0 0 6px"><span class="lg-${cls}">${esc(rd.status)}</span></span></dd>
      <dt>Limit</dt><dd>${esc(r.limit)} °C</dd>
      <dt>Logged by</dt><dd>${esc(rd.by || '--')}${rd.time ? ' at ' + esc(rd.time) : ''}${rd.timing ? ' (' + esc(rd.timing) + ')' : ''}</dd>
      <dt>Note</dt><dd>${rd.note ? esc(rd.note) : '<span class="muted">None</span>'}</dd></dl>` });
}

function viewAhu(){
  if (!AHU.data && !AHU.loading && !AHU.error) setTimeout(() => ahuLoad(''), 0);
  const D = AHU.data;
  const nav = `<div class="eng-nav"><button class="btn btn-ghost btn-sm" onclick="ahuShift(-1)" aria-label="Previous month">${I.chevL}</button>
    <span class="lbl">${D ? esc(monthLabel(D.month)) : 'Loading...'}</span>
    <button class="btn btn-ghost btn-sm" onclick="ahuShift(1)" aria-label="Next month" ${D && D.month >= D.today.slice(0, 7) ? 'disabled' : ''}>${I.chevR}</button>
    <button class="btn btn-ghost btn-sm" onclick="ahuThisMonth()">This month</button>
    <a class="btn btn-ghost btn-sm" href="${SHEET_URL}" target="_blank" rel="noopener">${I.externalLink} Google Sheet</a></div>`;
  const head = pageHead('AHU Temperature Log', 'Daily room temperatures from the 34 production rooms. Readings are taken between 2:00 and 4:00 pm on working days; the limit is 25 °C.', nav);
  if (AHU.error) return { title:'AHU Temperature Log', crumb:'Engineering', keepScroll:true, bind(){}, html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(AHU.error),
    `<button class="btn btn-primary" onclick="ahuLoad('${esc(AHU.month)}')">Retry</button>`)}</div></div>` };
  if (!D) return { title:'AHU Temperature Log', crumb:'Engineering', bind(){}, html: head + `<div class="card"><div class="card-b">${emptyState('box', 'Loading...', 'Fetching the temperature log.')}</div></div>` };
  const M = ahuModel(D);
  return {
    title:'AHU Temperature Log', crumb:'Engineering', keepScroll:true,
    html: head + (AHU.loading ? '<div class="small muted" style="margin:-8px 0 10px">Updating...</div>' : '') + ahuToday(D, M) + ahuKpis(M)
      + `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(monthLabel(D.month))}: every room, every day</h3><div class="sub">Click a reading for who logged it and when.</div></div></div><div class="card-b">${ahuGrid(D, M)}</div></div>`
      + (M.total ? `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Rooms logged per day</h3><div class="sub">Each bar is the 34 rooms; colours show how the readings were.</div></div></div><div class="card-b eng-chart">${ahuDailyChart(D, M)}</div></div>` : '')
      + (M.total ? `<h3 style="margin:18px 0 10px">By AHU</h3>${ahuByAhu(M)}<h3 style="margin:18px 0 10px">Temperature trends</h3><div class="eng-charts">${M.perAhu.map(a => ahuTrend(D, M, a)).join('')}</div>`
        : `<div class="card"><div class="card-b">${emptyState('box', 'No readings this month', 'Nothing has been logged for ' + esc(monthLabel(D.month)) + ' yet.')}</div></div>`),
    bind(){
      $$('.eng-grid td.c').forEach(td => td.onclick = () => ahuDetail(D, M, Number(td.dataset.r), Number(td.dataset.d)));
    },
  };
}
route('/ahu', viewAhu);
route('/', () => { location.replace('#' + homePath()); return { title:'Engineering', crumb:'', html:'' }; });


/* ============================================================
   Equipment register (migration 017: OKL_ENG_assets)
   Everything Engineering looks after, one row each. GET /webhook/engineering/api/equipment, save with POST .../equipment/save.
   A production machine on the shop floor app uses the floor's machine code as its code. Codes never change.
   Rows whose notes start with "Check:" are guesses from the old lists for Engineering to confirm.
   ============================================================ */
const ASSET_TYPES = ['Machine', 'Line', 'Room', 'AHU', 'Outdoor unit', 'Utility', 'Instrument', 'Building', 'Vehicle', 'Other'];
let EQ = { list: null, loading: false, error: '', q: '', type: '', area: '', status: 'Active', check: false };
async function eqLoad(force){
  if (EQ.loading || (EQ.list && !force)) return;
  EQ.loading = true; EQ.error = '';
  try { const r = await api('/webhook/engineering/api/equipment'); EQ.list = r.assets || []; }
  catch (err) { EQ.error = err.message; }
  finally { EQ.loading = false; render(); }
}
function eqByCode(code){ return (EQ.list || []).find(a => a.code === code); }
function eqFiltered(){
  const q = EQ.q.trim().toLowerCase();
  return (EQ.list || []).filter(a => (!EQ.type || a.type === EQ.type) && (!EQ.area || (a.area || '') === EQ.area) && (!EQ.status || a.status === EQ.status)
    && (!EQ.check || a.review) && (!q || [a.code, a.name, a.eq_no, a.floor_code, a.parent_name, a.area].join(' ').toLowerCase().includes(q)));
}
function viewEquipment(){
  if (!EQ.list && !EQ.error) eqLoad();
  const canEdit = canEditHere();
  const head = pageHead('Equipment and parts', 'Everything Engineering looks after: machines, lines, rooms, AHUs and their outdoor units, utilities, instruments and buildings. Open one to see its whole history.',
    dlButton('eqDownload()') + (canEdit ? `<button class="btn btn-primary" onclick="eqOpen('')">${I.plus} Add equipment</button>` : '')) + eqTabs('list');
  if (EQ.error) return { title:'Equipment', crumb:'Setup', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load the register', esc(EQ.error), `<button class="btn btn-primary" onclick="eqLoad(true)">Try again</button>`)}</div></div>` };
  if (!EQ.list) return { title:'Equipment', crumb:'Setup', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
  const all = EQ.list, rows = eqFiltered(), shown = rows.slice(0, 400);
  const areas = Array.from(new Set(all.map(a => a.area).filter(Boolean))).sort();
  const byType = ASSET_TYPES.map(t => [t, all.filter(a => a.type === t && a.status === 'Active').length]).filter(x => x[1]);
  const toCheck = all.filter(a => a.review).length;
  const opt = (v, cur, label) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(label || v)}</option>`;
  return {
    title:'Equipment', crumb:'Setup', keepScroll: true,
    html: head + `
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:12px">
      ${byType.map(([t, n]) => `<button class="chip ${EQ.type === t ? 'on' : ''}" onclick="eqSet('type', '${esc(t)}')">${esc(t)} <b>${n}</b></button>`).join('')}
      ${toCheck ? `<button class="chip ${EQ.check ? 'on' : ''}" onclick="eqSet('check', ${!EQ.check})" title="Guesses from the old lists: open each and confirm or correct it">${I.alert} To check <b>${toCheck}</b></button>` : ''}
    </div>
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px">
        <div class="row" style="gap:10px;flex-wrap:wrap">
          <div class="search filter-search"><span class="ic">${I.search}</span>
            <input class="inp" id="eqQ" style="padding-left:34px;border-radius:20px" placeholder="Search code, name, EQ/PD number" value="${esc(EQ.q)}"></div>
          <select class="inp" id="eqType" style="width:auto">${opt('', EQ.type, 'All types')}${ASSET_TYPES.map(t => opt(t, EQ.type)).join('')}</select>
          <select class="inp" id="eqArea" style="width:auto">${opt('', EQ.area, 'All areas')}${areas.map(a => opt(a, EQ.area)).join('')}</select>
          <select class="inp" id="eqStatus" style="width:auto">${opt('Active', EQ.status)}${opt('Inactive', EQ.status)}${opt('', EQ.status, 'Active and inactive')}</select>
        </div>
      </div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Area</th><th>Part of</th><th>EQ/PD no</th><th>On the shop floor</th><th></th></tr></thead>
        <tbody>${shown.length ? shown.map(a => `<tr class="clickable" onclick="go('/equipment/${esc(a.code)}')">
          <td class="mono small" data-label="Code">${esc(a.code)}</td>
          <td data-label="Name"><div class="strong">${esc(a.name)}</div>${a.children ? `<div class="tiny muted">${a.children} part${a.children === 1 ? '' : 's'}</div>` : ''}</td>
          <td data-label="Type">${esc(a.type)}</td><td data-label="Area">${esc(a.area || '--')}</td>
          <td data-label="Part of" class="small">${a.parent ? esc(a.parent_name || a.parent) : '--'}</td>
          <td data-label="EQ/PD no" class="mono small">${esc(a.eq_no || '--')}</td>
          <td data-label="On the shop floor">${a.floor_code ? `<span class="badge b-ok">${esc(a.floor_code)}</span>` : '<span class="muted small">no</span>'}</td>
          <td style="text-align:right">${a.review ? `<span class="badge b-warn" title="${esc(a.notes)}">To check</span>` : ''}${a.status === 'Inactive' ? ' <span class="badge b-slate">Inactive</span>' : ''}</td>
        </tr>`).join('') : `<tr><td colspan="8" class="muted" style="padding:16px">Nothing matches.</td></tr>`}</tbody>
      </table></div>
      <div class="small muted" style="padding:12px 18px">${rows.length} of ${all.length} shown${rows.length > shown.length ? ' (first ' + shown.length + ')' : ''}. Mirrored to the Maintenance Google Sheet (Equipment tab).</div>
    </div>`,
    bind(){
      const q = $('#eqQ');
      if (q) q.addEventListener('input', debounce(e => { EQ.q = e.target.value; render(); const el = $('#eqQ'); if (el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 200));
      [['#eqType', 'type'], ['#eqArea', 'area'], ['#eqStatus', 'status']].forEach(([id, k]) => { const el = $(id); if (el) el.onchange = e => eqSet(k, e.target.value); });
    },
  };
}
route('/equipment', viewEquipment);
function eqSet(k, v){ EQ[k] = (k === 'type' && EQ.type === v) ? '' : v; render(); }
function eqDownload(){
  downloadXlsx('Equipment', [{ name: 'Equipment', head: ['Code', 'Name', 'Type', 'Area', 'Part of', 'EQ/PD no', 'Floor code', 'PM interval (days)', 'Status', 'Notes'],
    rows: eqFiltered().map(a => [a.code, a.name, a.type, a.area, a.parent_name || a.parent, a.eq_no, a.floor_code, a.pm_interval_days, a.status, a.notes]) }]);
}

/* ---- one piece of equipment: its PM, KPIs (last 90 days), jobs, failures, floor stops, actions, parts and readings.
   GET /webhook/engineering/api/equipment/one?code= (migration 023) */
let AP = {};
async function apLoad(code){
  try { AP[code] = await api('/webhook/engineering/api/equipment/one?code=' + encodeURIComponent(code)); }
  catch (err) { AP[code] = { error: err.message }; }
  render();
}
const PM_STATE = { overdue: '<span class="badge b-danger">Overdue</span>', due: '<span class="badge b-warn">Due this week</span>', ok: '<span class="badge b-ok">OK</span>', no_record: '<span class="badge b-slate">No PM recorded</span>' };
const PM_STATE_TEXT = { overdue: 'Overdue', due: 'Due this week', ok: 'OK', no_record: 'No PM recorded' };
function viewAsset(params){
  const code = String(params.code || '').toUpperCase();
  if (!EQ.list && !EQ.loading) eqLoad();
  if (AP[code] === undefined) { AP[code] = null; apLoad(code); }
  const d = AP[code], a = eqByCode(code);
  const back = `<a class="btn btn-ghost btn-sm" href="#/equipment">${I.chevL} Equipment</a>`;
  if (!d || !EQ.list) return { title:'Equipment', crumb:'Setup', html: back + `<div class="card" style="margin-top:12px"><div class="card-b small muted">Loading...</div></div>` };
  if (d.error || d.ok === false || !a) return { title:'Equipment', crumb:'Setup', html: back + `<div class="card" style="margin-top:12px"><div class="card-b">${emptyState('alert', 'Could not open it', esc(d.error || 'No such equipment.'))}</div></div>` };
  const tab = (new URLSearchParams(currentPath().split('?')[1] || '')).get('tab') || 'jobs';
  const canJob = ['submit', 'edit'].includes(levelOf('engineering.jobs')), k = d.kpis || {}, pm = d.pm;
  const tabs = [['jobs', 'Jobs', (d.jobs || []).length], ['failures', 'Failures', (d.failures || []).length]]
    .concat(a.floor_code ? [['stops', 'Floor stops', (d.stops || []).length]] : [])
    .concat([['actions', 'Actions', (d.actions || []).length], ['parts', 'Parts used', (d.parts || []).length]])
    .concat(a.type === 'Outdoor unit' ? [['readings', 'Monthly readings', (d.outdoor || []).length]] : [])
    .concat([['checklist', 'PM checklist', (d.checklist || []).length], ['pmparts', 'PM parts', (d.pm_parts || []).length]]);
  const cur = tabs.some(t => t[0] === tab) ? tab : 'jobs';
  const planEdit = levelOf('engineering.pm') === 'edit';
  const empty = (n, msg) => `<tr><td colspan="${n}" class="muted" style="padding:16px">${msg}</td></tr>`;
  const body = {
    jobs: () => `<thead><tr><th>Job</th><th>Type</th><th>What failed / what was done</th><th>Technicians</th><th>Time</th><th>Status</th></tr></thead><tbody>${(d.jobs || []).map(j => `<tr class="clickable" onclick="go('/jobs/${esc(j.job_id)}')">
        <td class="mono small" data-label="Job">${esc(j.job_id)}<div class="tiny muted">${esc(dayHm(j.finished_at || j.created_at))}</div></td><td data-label="Type">${esc(JOB_TYPE[j.type] || j.type)}</td>
        <td data-label="Work" class="small">${j.failure_category ? `<b>${esc(j.failure_category)}</b>: ` : ''}${esc(j.work_done || j.cancel_reason || '')}</td>
        <td data-label="Technicians" class="small">${esc((j.technicians || []).map(t => t.name).join(', '))}</td><td data-label="Time" class="mono small">${j.labour_minutes != null ? dur(j.labour_minutes) : ''}</td><td data-label="Status">${jbBadge(j)}</td></tr>`).join('') || empty(6, 'No jobs in the last year.')}</tbody>`,
    failures: () => `<thead><tr><th>When</th><th>What</th><th style="text-align:right">Down for</th></tr></thead><tbody>${(d.failures || []).slice().reverse().map(f => `<tr>
        <td data-label="When" class="small">${esc(dayHm(f.at))}</td><td data-label="What">${f.kind === 'job' ? `<a href="#/jobs/${esc(f.ref)}">${esc(f.ref)}</a> breakdown` : esc(f.ref)}</td>
        <td data-label="Down for" style="text-align:right" class="mono">${dur(f.minutes)}</td></tr>`).join('') || empty(3, 'No failures in the last year.')}</tbody>`,
    stops: () => `<thead><tr><th>Stopped</th><th>Reason</th><th style="text-align:right">Length</th></tr></thead><tbody>${(d.stops || []).map(s => `<tr>
        <td data-label="Stopped" class="small">${esc(dayHm(s.started_at))}</td><td data-label="Reason">${esc(s.reason)}</td><td data-label="Length" style="text-align:right" class="mono">${dur(s.minutes)}</td></tr>`).join('') || empty(3, 'No machine stops on the floor in the last 90 days.')}</tbody>`,
    actions: () => `<thead><tr><th>Action</th><th>Title</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>${(d.actions || []).map(x => `<tr class="clickable" onclick="go('/actions/${esc(x.action_no)}')">
        <td class="mono small" data-label="Action">${esc(x.action_no)}</td><td data-label="Title">${esc(x.title)}</td><td data-label="Owner" class="small">${esc(x.owner_name || '')}</td>
        <td data-label="Due" class="small">${esc(x.due_date || '')}</td><td data-label="Status">${acBadge(x)}</td></tr>`).join('') || empty(5, 'No corrective or preventive actions.')}</tbody>`,
    parts: () => `<thead><tr><th>Date</th><th>Part</th><th style="text-align:right">Qty</th><th>Job</th><th>Collected by</th></tr></thead><tbody>${(d.parts || []).map(m => `<tr>
        <td data-label="Date" class="small">${esc(m.date)}</td><td data-label="Part"><span class="mono strong">${esc(m.sku || '')}</span> ${esc(m.description || '')}</td>
        <td data-label="Qty" style="text-align:right">${num(m.qty)} ${esc(m.unit || '')}</td><td data-label="Job" class="mono small">${esc(m.job || '')}</td><td data-label="Collected by" class="small">${esc(m.collected_by_name || '')}</td></tr>`).join('') || empty(5, 'No parts issued for it.')}</tbody>`,
    readings: () => `<thead><tr><th>Month</th><th style="text-align:right">Amps</th><th style="text-align:right">Low / high psi</th><th style="text-align:right">Superheat</th><th style="text-align:right">Subcooling</th><th>Status</th></tr></thead><tbody>${(d.outdoor || []).map(r => `<tr>
        <td data-label="Month">${esc(String(r.month).slice(0, 7))}</td><td data-label="Amps" style="text-align:right">${num(r.amps)}</td><td data-label="psi" style="text-align:right">${num(r.low_psi)} / ${num(r.high_psi)}</td>
        <td data-label="Superheat" style="text-align:right">${num(r.superheat)}</td><td data-label="Subcooling" style="text-align:right">${num(r.subcooling)}</td><td data-label="Status">${esc(r.status || '')}</td></tr>`).join('') || empty(6, 'No readings yet.')}</tbody>`,
    checklist: () => `<thead><tr><th>Section</th><th>Item</th><th>Standard</th></tr></thead><tbody>${(d.checklist || []).map(c => `<tr>
        <td data-label="Section" class="small">${esc(c.section)}</td><td data-label="Item" class="strong">${esc(c.item)}</td><td data-label="Standard" class="small">${esc(c.standard || '')}</td></tr>`).join('')
        || empty(3, 'No PM checklist yet.' + (planEdit ? ` <a href="#/equipment/checklists?asset=${esc(code)}">Make one</a>.` : ''))}</tbody>
        ${(d.checklist || []).length && planEdit ? `<tfoot><tr><td colspan="3" style="padding:12px 18px"><a href="#/equipment/checklists?asset=${esc(code)}">Change the checklist</a></td></tr></tfoot>` : ''}`,
    pmparts: () => `<thead><tr><th>Part</th><th style="text-align:right">Qty</th><th>How often</th><th>Last changed</th><th>Next change</th><th style="text-align:right">In stock</th></tr></thead><tbody>${(d.pm_parts || []).map(p => `<tr ${planEdit ? `class="clickable" onclick="ppOpen(${p.id})"` : ''}>
        <td data-label="Part">${p.sku ? `<span class="mono strong">${esc(p.sku)}</span> ` : ''}${esc(p.name)}</td><td data-label="Qty" style="text-align:right">${num(p.qty)} ${esc(p.unit || '')}</td>
        <td data-label="How often">${esc(everyText(p))}</td><td data-label="Last changed" class="small">${esc(p.last_change || 'not known')}</td><td data-label="Next change" class="small">${esc(p.next_change || 'at the next PM')}</td>
        <td data-label="In stock" style="text-align:right">${p.sku ? num(p.stock) : '<span class="tiny muted">not a store item</span>'}</td></tr>`).join('')
        || empty(6, 'No parts on the PM plan.')}</tbody>
        ${planEdit ? `<tfoot><tr><td colspan="6" style="padding:12px 18px"><a href="javascript:void 0" onclick="ppOpen(null, '${esc(code)}')">${I.plus} Add a part to the plan</a></td></tr></tfoot>` : ''}`,
  }[cur]();
  const facts = [['Code', a.code], ['Type', a.type], ['Area', a.area], ['Part of', a.parent_name || a.parent], ['EQ/PD no', a.eq_no], ['Shop floor code', a.floor_code], ['Status', a.status]].filter(x => x[1]);
  return { title: a.name, crumb:'Equipment', keepScroll: true,
    html: `<div class="row between" style="margin-bottom:12px">${back}<div class="row" style="gap:8px">${dlButton(`apDownload('${esc(code)}')`)}
        ${canEditHere() ? `<button class="btn btn-ghost" onclick="eqOpen('${esc(code)}')">${I.edit} Edit</button>` : ''}
        ${canJob ? `<button class="btn btn-ghost" onclick="go('/jobs/new?asset=${encodeURIComponent(code)}')">${I.wrench} Start a job</button><button class="btn btn-primary" onclick="go('/pm/record?asset=${encodeURIComponent(code)}')">${I.plus} Record a PM</button>` : ''}</div></div>
    <div class="card" style="margin-bottom:14px"><div class="card-b"><h2 style="font-size:20px;margin:0 0 6px">${esc(a.name)}</h2>
      <div class="row small" style="gap:6px 16px;flex-wrap:wrap">${facts.map(([l, v]) => `<span><span class="muted">${esc(l)}:</span> <b>${esc(v)}</b></span>`).join('')}</div>
      ${a.notes ? `<div class="small muted" style="margin-top:6px">${esc(a.notes)}</div>` : ''}</div></div>
    <div class="grid g4" style="margin-bottom:14px">
      <div class="stat"><div class="lbl">Preventive maintenance</div><div class="val" style="font-size:16px">${pm ? PM_STATE[pm.state] || '' : '<span class="small muted">not tracked</span>'}</div>
        <div class="meta">${pm ? `every ${pm.interval_days} d · last ${esc(pm.last_pm || 'never')}${pm.due_date ? ' · next ' + esc(pm.due_date) : ''}` : ''}</div></div>
      <div class="stat"><div class="lbl">Failures (90 days)</div><div class="val">${num(k.failures) || 0}</div><div class="meta">${k.downtime_min != null ? 'downtime ' + dur(k.downtime_min) : 'breakdown jobs'}</div></div>
      <div class="stat"><div class="lbl">MTTR</div><div class="val">${dur(k.mttr_min)}</div><div class="meta">mean time to repair</div></div>
      <div class="stat"><div class="lbl">MTBF</div><div class="val">${k.mtbf_days == null ? '--' : num(k.mtbf_days) + ' d'}</div><div class="meta">mean time between failures</div></div></div>
    <div class="tabs" style="margin-bottom:14px">${tabs.map(([t, l, n]) => `<a class="tab ${t === cur ? 'on' : ''}" href="#/equipment/${esc(code)}?tab=${t}">${esc(l)} <span class="badge" style="padding:1px 7px">${n}</span></a>`).join('')}</div>
    <div class="card"><div class="tbl-wrap"><table class="tbl">${body}</table></div></div>` };
}
route('/equipment/parts', () => viewPmParts());
route('/equipment/checklists', () => viewChecklists());
route('/equipment/:code', viewAsset);
function apDownload(code){
  const d = AP[code] || {}, a = eqByCode(code) || { name: code };
  downloadXlsx(a.name, [
    { name: 'Jobs', head: ['Job', 'Type', 'Status', 'Started', 'Finished', 'What failed', 'Cause', 'What was done', 'Technicians', 'Minutes'],
      rows: (d.jobs || []).map(j => [j.job_id, JOB_TYPE[j.type] || j.type, j.status, lagosDay(j.started_at || j.created_at), lagosDay(j.finished_at), j.failure_category, j.cause, j.work_done, (j.technicians || []).map(t => t.name).join(', '), j.labour_minutes]) },
    { name: 'Failures', head: ['When', 'What', 'Minutes down'], rows: (d.failures || []).map(f => [lagosDay(f.at), f.kind === 'job' ? f.ref + ' breakdown' : f.ref, f.minutes]) },
    { name: 'Floor stops', head: ['Stopped', 'Reason', 'Minutes'], rows: (d.stops || []).map(s => [lagosDay(s.started_at), s.reason, s.minutes]) },
    { name: 'Actions', head: ['Action', 'Type', 'Title', 'Root cause', 'Action to take', 'Owner', 'Due', 'Status'], rows: (d.actions || []).map(x => [x.action_no, x.kind, x.title, x.root_cause, x.action_to_take, x.owner_name, x.due_date, (AC_STATUS[x.status] || [x.status])[0]]) },
    { name: 'Parts used', head: ['Date', 'Entry', 'SKU', 'Part', 'Qty', 'Unit', 'Job', 'Collected by', 'Status'], rows: (d.parts || []).map(m => [m.date, m.entry, m.sku, m.description, +m.qty, m.unit, m.job, m.collected_by_name, m.status]) },
  ].concat(a.type === 'Outdoor unit' ? [{ name: 'Readings', head: ['Month', 'Running', 'Amps', 'Low psi', 'High psi', 'Superheat', 'Subcooling', 'Checked on', 'Checked by', 'Status'],
      rows: (d.outdoor || []).map(r => [String(r.month).slice(0, 7), r.running ? 'yes' : 'no', r.amps, r.low_psi, r.high_psi, r.superheat, r.subcooling, r.checked_on, r.checked_by, r.status]) }] : []));
}

function eqOpen(code){
  const a = code ? eqByCode(code) : null, isNew = !a, canEdit = canEditHere(), dis = canEdit ? '' : 'disabled';
  const v = a || { code: '', name: '', type: 'Machine', area: '', parent: '', eq_no: '', floor_code: '', pm_interval_days: '', status: 'Active', notes: '' };
  const parents = (EQ.list || []).filter(x => x.code !== v.code && x.status === 'Active').sort((p, q) => p.name.localeCompare(q.name));
  const kids = a ? (EQ.list || []).filter(x => x.parent === a.code) : [];
  const areas = Array.from(new Set((EQ.list || []).map(x => x.area).filter(Boolean))).sort();
  openModal({
    title: isNew ? 'Add equipment' : v.name, size:'wide', sub: isNew ? 'The code cannot be changed later.' : v.code + ' - ' + v.type,
    body: `<form id="eqForm" novalidate>
      ${a && a.review ? `<div class="notice warn" style="margin-bottom:12px">${I.alert}<div><b>To check:</b> ${esc(a.notes.replace(/^check:\s*/i, ''))}<br>Correct anything wrong, then clear the "Check:" note and save.</div></div>` : ''}
      <div class="grid g2">
        <div class="field"><label for="eqCode">Code</label><input class="inp mono" id="eqCode" maxlength="40" value="${esc(v.code)}" ${isNew ? '' : 'disabled'} placeholder="e.g. AIR_COMPRESSOR_2">
          <div class="hint">${I.info}<span>Capital letters, digits, dots, dashes, underscores. A shop floor machine uses its floor code.</span></div></div>
        <div class="field"><label for="eqName">Name</label><input class="inp" id="eqName" maxlength="80" value="${esc(v.name)}" ${dis}></div>
        <div class="field"><label for="eqTypeSel">Type</label><select class="inp" id="eqTypeSel" ${dis}>${ASSET_TYPES.map(t => `<option ${t === v.type ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="field"><label for="eqAreaIn">Area</label><input class="inp" id="eqAreaIn" maxlength="40" list="eqAreas" value="${esc(v.area || '')}" ${dis}><datalist id="eqAreas">${areas.map(x => `<option value="${esc(x)}">`).join('')}</datalist></div>
        <div class="field"><label for="eqParent">Part of</label><select class="inp" id="eqParent" ${dis}><option value="">(nothing)</option>${parents.map(x => `<option value="${esc(x.code)}" ${x.code === v.parent ? 'selected' : ''}>${esc(x.name)} (${esc(x.code)})</option>`).join('')}</select></div>
        <div class="field"><label for="eqEq">EQ/PD number</label><input class="inp mono" id="eqEq" maxlength="30" value="${esc(v.eq_no || '')}" ${dis} placeholder="EQ/PD/021"></div>
        <div class="field"><label for="eqFloor">Shop floor machine code</label><input class="inp mono" id="eqFloor" maxlength="40" value="${esc(v.floor_code || '')}" ${dis} placeholder="only for machines on the floor app">
          <div class="hint">${I.info}<span>Floor stops and maintenance calls for this code come to this equipment.</span></div></div>
        <div class="field"><label for="eqPm">PM interval (days)</label><input class="inp" id="eqPm" type="number" min="1" max="730" value="${esc(v.pm_interval_days || '')}" ${dis} placeholder="default from Settings"></div>
        <div class="field"><label for="eqStatusSel">Status</label><select class="inp" id="eqStatusSel" ${dis}><option ${v.status === 'Active' ? 'selected' : ''}>Active</option><option ${v.status === 'Inactive' ? 'selected' : ''}>Inactive</option></select></div>
      </div>
      <div class="field"><label for="eqNotes">Notes</label><textarea class="inp" id="eqNotes" rows="2" maxlength="500" ${dis}>${esc(v.notes || '')}</textarea></div>
      ${kids.length ? `<div class="small"><b>Parts (${kids.length}):</b> ${kids.map(k => `<a href="javascript:void 0" onclick="eqSwitch('${esc(k.code)}')">${esc(k.name)}</a>`).join(', ')}</div>` : ''}
      <div class="err-msg hide" data-err="eqName" style="margin-top:8px"></div>
    </form>`,
    footer: canEdit ? `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} ${isNew ? 'Add' : 'Save'}</button>` : `<button class="btn btn-ghost" data-close>Close</button>`,
    onMount: (w, close) => {
      const sv = $('[data-save]', w); if (!sv) return;
      sv.onclick = async () => {
        clearErrors(w);
        const asset = { is_new: isNew, code: ($('#eqCode', w).value || '').trim().toUpperCase(), name: $('#eqName', w).value.trim(), type: $('#eqTypeSel', w).value,
          area: $('#eqAreaIn', w).value.trim(), parent: $('#eqParent', w).value, eq_no: $('#eqEq', w).value.trim(), floor_code: $('#eqFloor', w).value.trim().toUpperCase(),
          pm_interval_days: $('#eqPm', w).value.trim(), status: $('#eqStatusSel', w).value, notes: $('#eqNotes', w).value.trim() };
        if (isNew && !/^[A-Z0-9][A-Z0-9_.-]{1,39}$/.test(asset.code)) return setErr('eqName', 'The code must be 2 to 40 capital letters, digits, dots, dashes or underscores.', w);
        if (asset.name.length < 2) return setErr('eqName', 'Give it a name.', w);
        sv.disabled = true;
        try { await api('/webhook/engineering/api/equipment/save', { method:'POST', body:{ asset } }); close(); toast(isNew ? 'Added' : 'Saved', asset.name, 'ok'); AP = {}; await eqLoad(true); }
        catch (err) { setErr('eqName', err.message, w); sv.disabled = false; }
      };
    },
  });
}
function eqSwitch(code){ $$('#layers .overlay').forEach(o => o.remove()); eqOpen(code); }

/* ---- filters by equipment type, area or one piece of equipment (Overview, job history, PM, actions). F = { type, area, asset } */
function fltHtml(F, id){
  const all = (EQ.list || []).filter(a => a.status === 'Active');
  const types = Array.from(new Set(all.map(a => a.type))).sort(), areas = Array.from(new Set(all.map(a => a.area).filter(Boolean))).sort();
  const opt = (v, cur, l) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(l)}</option>`;
  const a = F.asset ? eqByCode(F.asset) : null;
  return `<select class="inp" id="${id}Type" style="width:auto" aria-label="Equipment type">${opt('', F.type || '', 'All equipment types')}${types.map(t => opt(t, F.type, t)).join('')}</select>
    <select class="inp" id="${id}Area" style="width:auto" aria-label="Area">${opt('', F.area || '', 'All areas')}${areas.map(t => opt(t, F.area, t)).join('')}</select>
    <input class="inp flt-asset" id="${id}Asset" list="${id}Assets" placeholder="One piece of equipment" aria-label="One piece of equipment" value="${esc(a ? a.name + ' (' + a.code + ')' : (F.asset || ''))}"><datalist id="${id}Assets">${spAssetOptions()}</datalist>`;
}
function fltBind(F, id, onChange){
  const t = $('#' + id + 'Type'), ar = $('#' + id + 'Area'), as = $('#' + id + 'Asset');
  if (t) t.onchange = e => { F.type = e.target.value; onChange(); };
  if (ar) ar.onchange = e => { F.area = e.target.value; onChange(); };
  if (as) as.onchange = e => { const v = e.target.value.trim(), c = v ? spAssetFrom(v) : ''; if (c && !eqByCode(c)) return; F.asset = c; onChange(); };
}
function fltMatch(F, code){
  F = F || {};
  if (!F.type && !F.area && !F.asset) return true;
  const a = eqByCode(code); if (!a) return false;
  return (!F.type || a.type === F.type) && (!F.area || a.area === F.area) && (!F.asset || a.code === F.asset || a.parent === F.asset);
}
const fltOn = F => !!(F.type || F.area || F.asset);

/* ============================================================
   PM plan (migration 024), under Equipment and parts: the parts each machine needs on PM and how often each is changed,
   and each machine's PM checklist. The Engineering Manager (Preventive maintenance: edit) changes them.
   GET /webhook/engineering/api/pm/plan; POST /pm/parts/save, /pm/checklist/save.
   A part is changed at a PM when it falls due no later than pm_part_window_days after the PM (Settings).
   ============================================================ */
let PP = { data: null, f: { type: '', area: '', asset: '' }, q: '', ck: null };
const EVERY_UNIT = { day: ['day', 'days'], week: ['week', 'weeks'], month: ['month', 'months'] };
const everyText = p => 'every ' + p.every_n + ' ' + (EVERY_UNIT[p.every_unit] || ['', ''])[+p.every_n === 1 ? 0 : 1];
const ppCanEdit = () => levelOf('engineering.pm') === 'edit';
async function ppLoad(){
  try { PP.data = await api('/webhook/engineering/api/pm/plan'); } catch (err) { PP.data = { error: err.message }; }
  render();
}
function eqTabs(cur){
  return `<div class="tabs" style="margin-bottom:14px">${[['list', 'Equipment', '/equipment'], ['parts', 'PM parts plan', '/equipment/parts'], ['checklists', 'PM checklists', '/equipment/checklists']]
    .map(([k, l, h]) => `<a class="tab ${k === cur ? 'on' : ''}" href="#${h}">${l}</a>`).join('')}</div>`;
}
function ppParts(){ return ((PP.data || {}).parts || []).filter(p => fltMatch(PP.f, p.asset)); }
function viewPmParts(){
  if (!EQ.list && !EQ.loading) eqLoad();
  if (!SP.list && !SP.loading) spLoad();
  if (!PP.data) { PP.data = 'loading'; ppLoad(); }
  const d = PP.data, ready = d && d !== 'loading' && !d.error, edit = ppCanEdit();
  const head = pageHead('Equipment and parts', `The parts each machine needs on preventive maintenance, and how often each one is changed. A part is changed at a PM when it falls due no more than ${num((ready && d.window_days) || 14)} days after it (Settings). The PM notices list them.`,
    (ready ? dlButton('ppDownload()') : '') + (edit ? `<button class="btn btn-primary" onclick="ppOpen(null)">${I.plus} Add a part</button>` : '')) + eqTabs('parts');
  if (!ready) return { title:'PM parts plan', crumb:'Setup', html: head + `<div class="card"><div class="card-b ${d && d.error ? '' : 'small muted'}">${d && d.error ? emptyState('alert', 'Could not load', esc(d.error)) : 'Loading...'}</div></div>` };
  const rows = ppParts(), today = todayIso();
  return { title:'PM parts plan', crumb:'Setup', keepScroll: true,
    html: head + `<div class="row filter-bar" style="gap:8px;margin-bottom:12px;flex-wrap:wrap">${fltHtml(PP.f, 'ppf')}</div>
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Equipment</th><th>Part</th><th style="text-align:right">Qty</th><th>How often</th><th>Last changed</th><th>Next change</th><th style="text-align:right">In stock</th></tr></thead>
      <tbody>${rows.map(p => `<tr ${edit ? `class="clickable" onclick="ppOpen(${p.id})"` : ''}><td data-label="Equipment"><a class="strong" href="#/equipment/${esc(p.asset)}?tab=pmparts" onclick="event.stopPropagation()">${esc(p.asset_name)}</a><div class="tiny muted">${esc(p.area || '')}</div></td>
        <td data-label="Part">${p.sku ? `<span class="mono strong">${esc(p.sku)}</span> ` : ''}${esc(p.name)}${p.note ? `<div class="tiny muted">${esc(p.note)}</div>` : ''}</td>
        <td data-label="Qty" style="text-align:right">${num(p.qty)} ${esc(p.unit || '')}</td><td data-label="How often">${esc(everyText(p))}</td>
        <td data-label="Last changed" class="small">${esc(p.last_change || 'not known')}</td>
        <td data-label="Next change" class="small">${p.next_change ? (p.next_change < today ? `<span class="badge b-danger">${esc(p.next_change)}</span>` : esc(p.next_change)) : '<span class="badge b-warn">at the next PM</span>'}</td>
        <td data-label="In stock" style="text-align:right">${p.sku ? (+p.stock < +p.qty ? `<span class="badge b-danger">${num(p.stock)}</span>` : num(p.stock)) : '<span class="tiny muted">not a store item</span>'}</td></tr>`).join('')
        || `<tr><td colspan="7" class="muted" style="padding:16px">${(d.parts || []).length ? 'Nothing matches.' : 'No parts on the plan yet.' + (edit ? ' Add the parts each machine needs on PM and how often they are changed.' : '')}</td></tr>`}</tbody></table></div>
      <div class="small muted" style="padding:12px 18px">${rows.length} of ${(d.parts || []).length} lines. The last change is the date set here, or the last time the part was issued for that machine, whichever is later.</div></div>`,
    bind(){ fltBind(PP.f, 'ppf', render); } };
}
function ppDownload(){
  downloadXlsx('PM parts plan', [{ name: 'PM parts plan', head: ['Code', 'Equipment', 'Area', 'SKU', 'Part', 'Qty', 'Unit', 'How often', 'Last changed', 'Next change', 'In stock', 'Note'],
    rows: ppParts().map(p => [p.asset, p.asset_name, p.area, p.sku, p.name, +p.qty, p.unit, everyText(p), p.last_change, p.next_change, p.sku ? +p.stock : '', p.note]) }]);
}
function ppOpen(id, asset){
  const all = (PP.data && PP.data.parts) || [], fromPage = Object.values(AP).flatMap(x => (x && x.pm_parts) || []);
  const p = id ? (all.find(x => x.id === id) || fromPage.find(x => x.id === id)) : null;
  const v = p || { asset: asset || '', sku: '', name: '', qty: '', every_n: 3, every_unit: 'month', last_changed_on: '', note: '' };
  const a = v.asset ? eqByCode(v.asset) : null, it = v.sku ? spBySku(v.sku) : null;
  openModal({ title: p ? 'PM part: ' + (p.asset_name || p.asset) : 'Add a part to the PM plan', size:'wide', sub: 'What a machine needs on preventive maintenance, and how often it is changed.',
    body: `<form novalidate><div class="grid g2">
      <div class="field" style="grid-column:1/-1"><label for="ppAsset">Machine or equipment</label><input class="inp" id="ppAsset" list="ppAssets" value="${esc(a ? a.name + ' (' + a.code + ')' : v.asset)}" placeholder="Type to search"><datalist id="ppAssets">${spAssetOptions()}</datalist></div>
      <div class="field" style="grid-column:1/-1"><label for="ppPart">Part from the store</label><input class="inp" id="ppPart" list="ppSkus" value="${esc(it ? spLabel(it) : (v.sku || ''))}" placeholder="Type the SKU or the part name"><datalist id="ppSkus">${spSkuOptions()}</datalist>
        <div class="hint">${I.info}<span>Not a store item (grease, oil...)? Leave this empty and type its name below.</span></div></div>
      <div class="field" style="grid-column:1/-1"><label for="ppName">Or the material's name</label><input class="inp" id="ppName" maxlength="120" value="${esc(v.sku ? '' : (v.name || ''))}"></div>
      <div class="field"><label for="ppQty">Quantity each time</label><input class="inp" id="ppQty" type="number" min="0" step="any" value="${esc(num(v.qty))}"></div>
      <div class="field"><span class="lbl">Changed every</span><div class="row" style="gap:6px;flex-wrap:nowrap"><input class="inp" id="ppN" type="number" min="1" max="520" step="1" value="${esc(v.every_n)}" style="width:90px" aria-label="Every how many">
        <select class="inp" id="ppUnit" style="width:auto" aria-label="Unit">${Object.keys(EVERY_UNIT).map(k => `<option value="${k}" ${v.every_unit === k ? 'selected' : ''}>${EVERY_UNIT[k][1]}</option>`).join('')}</select></div></div>
      <div class="field"><label for="ppLast">Last changed on (if known)</label><input class="inp" id="ppLast" type="date" max="${todayIso()}" value="${esc(v.last_changed_on || '')}">
        <div class="hint">${I.info}<span>Issuing the part for this machine later moves it on by itself.</span></div></div>
      <div class="field"><label for="ppNote">Note (optional)</label><input class="inp" id="ppNote" maxlength="300" value="${esc(v.note || '')}"></div>
      </div><div class="err-msg hide" data-err="ppAsset"></div></form>`,
    footer: `${p ? `<button class="btn btn-danger" data-rm style="margin-right:auto">Take off the plan</button>` : ''}<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Save</button>`,
    onMount: (w, close) => {
      const done = async r => { close(); toast('Saved', '', 'ok'); PP.data = null; AP = {}; PM.data = null; render(); return r; };
      const rm = $('[data-rm]', w);
      if (rm) rm.onclick = async () => { try { await api('/webhook/engineering/api/pm/parts/save', { method:'POST', body:{ part:{ id: p.id, active: false } } }); done(); } catch (e) { setErr('ppAsset', e.message, w); } };
      $('[data-save]', w).onclick = async () => {
        clearErrors(w);
        const part = { id: p ? p.id : '', asset: spAssetFrom($('#ppAsset', w).value), sku: spSkuFrom($('#ppPart', w).value), name: $('#ppName', w).value.trim(),
          qty: $('#ppQty', w).value.trim(), every_n: $('#ppN', w).value.trim(), every_unit: $('#ppUnit', w).value, last_changed_on: $('#ppLast', w).value, note: $('#ppNote', w).value.trim() };
        if (!eqByCode(part.asset)) return setErr('ppAsset', 'Choose the machine or equipment from the list.', w);
        if (part.sku && !spBySku(part.sku)) return setErr('ppAsset', 'Pick the part from the store list.', w);
        if (!part.sku && part.name.length < 2) return setErr('ppAsset', 'Pick the part from the store list, or type the material\'s name.', w);
        if (!(+part.qty > 0)) return setErr('ppAsset', 'Enter the quantity.', w);
        if (!(+part.every_n >= 1)) return setErr('ppAsset', 'Say how often it is changed.', w);
        try { await api('/webhook/engineering/api/pm/parts/save', { method:'POST', body:{ part } }); done(); } catch (e) { setErr('ppAsset', e.message, w); }
      };
    } });
}

/* ---- PM checklists: each machine's items (seeded from "PM Checklist Maintenance 2025 Rev.2"). /equipment/checklists?asset= */
const CK_SECTIONS = ['Mechanics', 'Electric & air', 'Auxiliary'];
function viewChecklists(){
  if (!EQ.list && !EQ.loading) eqLoad();
  if (!PP.data) { PP.data = 'loading'; ppLoad(); }
  const d = PP.data, ready = d && d !== 'loading' && !d.error, edit = ppCanEdit();
  const code = ((new URLSearchParams(currentPath().split('?')[1] || '')).get('asset') || '').toUpperCase();
  const head = pageHead('Equipment and parts', 'The checklist a technician goes through on each PM. Every item is ticked, or marked not done with the reason.',
    edit && !code ? `<button class="btn btn-primary" onclick="ckPick()">${I.plus} Make a checklist</button>` : '') + eqTabs('checklists');
  if (!ready || !EQ.list) return { title:'PM checklists', crumb:'Setup', html: head + `<div class="card"><div class="card-b ${d && d.error ? '' : 'small muted'}">${d && d.error ? emptyState('alert', 'Could not load', esc(d.error)) : 'Loading...'}</div></div>` };
  const lists = d.checklists || [];
  if (!code) {
    const shown = lists.filter(c => fltMatch(PP.f, c.asset) && (!PP.q || (c.name + ' ' + c.asset).toLowerCase().includes(PP.q.toLowerCase())));
    return { title:'PM checklists', crumb:'Setup', keepScroll: true,
      html: head + `<div class="row filter-bar" style="gap:8px;margin-bottom:12px;flex-wrap:wrap">${fltHtml(PP.f, 'ckf')}</div>
      <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Equipment</th><th>Area</th><th style="text-align:right">Items</th></tr></thead>
        <tbody>${shown.map(c => `<tr class="clickable" onclick="go('/equipment/checklists?asset=${esc(c.asset)}')"><td data-label="Equipment" class="strong">${esc(c.name)}<div class="tiny muted mono">${esc(c.asset)}</div></td>
          <td data-label="Area" class="small">${esc(c.area || '')}</td><td data-label="Items" style="text-align:right">${c.items.length}</td></tr>`).join('')
          || `<tr><td colspan="3" class="muted" style="padding:16px">No checklists here.</td></tr>`}</tbody></table></div>
        <div class="small muted" style="padding:12px 18px">${shown.length} of ${lists.length} machines have a checklist. A machine without one is recorded on PM with what was done only.</div></div>`,
      bind(){ fltBind(PP.f, 'ckf', render); } };
  }
  const a = eqByCode(code), list = lists.find(c => c.asset === code);
  if (!a) return { title:'PM checklists', crumb:'Setup', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'No such equipment', '')}</div></div>` };
  if (!PP.ck || PP.ck.asset !== code) PP.ck = { asset: code, items: ((list && list.items) || []).map(x => Object.assign({}, x)) };
  const back = `<a class="btn btn-ghost btn-sm" href="#/equipment/checklists">${I.chevL} All checklists</a>`;
  if (!edit) return { title: a.name, crumb:'Setup', html: back + pageHead('PM checklist: ' + a.name, '') + `<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Section</th><th>Item</th><th>Standard</th></tr></thead>
    <tbody>${PP.ck.items.map(c => `<tr><td class="small">${esc(c.section)}</td><td class="strong">${esc(c.item)}</td><td class="small">${esc(c.standard || '')}</td></tr>`).join('') || '<tr><td colspan="3" class="muted" style="padding:16px">No checklist yet.</td></tr>'}</tbody></table></div></div>` };
  const others = lists.filter(c => c.asset !== code);
  return { title: a.name, crumb:'Setup', keepScroll: true,
    html: `<div class="row between" style="margin-bottom:12px">${back}<a class="small" href="#/equipment/${esc(code)}">See ${esc(a.name)}</a></div>` + pageHead('PM checklist: ' + a.name, 'Items in the order a technician goes through them. Items taken off stay on the PMs already done.')
      + `<div class="card"><div class="card-b" id="ckRows">${ckRows()}</div>
      <div class="card-b row" style="gap:10px;flex-wrap:wrap;border-top:1px solid var(--line-2)">
        <button class="btn btn-ghost btn-sm" id="ckAdd">${I.plus} Add an item</button>
        ${others.length ? `<select class="inp" id="ckCopy" style="width:auto"><option value="">Copy the items of another machine...</option>${others.map(c => `<option value="${esc(c.asset)}">${esc(c.name)} (${c.items.length})</option>`).join('')}</select>` : ''}
        <span style="flex:1"></span><span class="err-msg hide" data-err="ckSave"></span><button class="btn btn-primary" id="ckSave">${I.check} Save the checklist</button></div></div>`,
    bind(){
      const box = $('#ckRows');
      const keep = () => $$('[data-ck]', box).forEach(el => { const [i, k] = el.dataset.ck.split(':'); PP.ck.items[+i][k] = el.value; });
      const redraw = () => { box.innerHTML = ckRows(); wire(); };
      const wire = () => {
        $$('[data-ck]', box).forEach(el => el.oninput = el.onchange = keep);
        $$('[data-ck-mv]', box).forEach(b => b.onclick = () => { keep(); const [i, dir] = b.dataset.ckMv.split(':').map(Number), j = i + dir, L = PP.ck.items; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; redraw(); });
        $$('[data-ck-rm]', box).forEach(b => b.onclick = () => { keep(); PP.ck.items.splice(+b.dataset.ckRm, 1); redraw(); });
      };
      wire();
      $('#ckAdd').onclick = () => { keep(); const last = PP.ck.items[PP.ck.items.length - 1]; PP.ck.items.push({ section: last ? last.section : 'Mechanics', item: '', standard: '' }); redraw(); const ins = $$('[data-ck$=":item"]', box); if (ins.length) ins[ins.length - 1].focus(); };
      const cp = $('#ckCopy'); if (cp) cp.onchange = () => { const src = lists.find(c => c.asset === cp.value); if (!src) return; keep();
        PP.ck.items = PP.ck.items.concat(src.items.map(x => ({ section: x.section, item: x.item, standard: x.standard }))); cp.value = ''; redraw(); toast('Copied', src.items.length + ' items from ' + src.name + '. Change what differs, then save.', 'ok'); };
      $('#ckSave').onclick = async () => {
        keep(); clearErrors(document);
        const items = PP.ck.items.filter(x => String(x.item || '').trim() || String(x.standard || '').trim());
        const bad = items.findIndex(x => String(x.item || '').trim().length < 2);
        if (bad >= 0) return setErr('ckSave', 'Line ' + (bad + 1) + ': name the item.');
        $('#ckSave').disabled = true;
        try { const r = await api('/webhook/engineering/api/pm/checklist/save', { method:'POST', body:{ checklist:{ asset: code, items: items.map(x => ({ id: x.id || '', section: x.section, item: x.item.trim(), standard: String(x.standard || '').trim() })) } } });
              toast('Checklist saved', r.items.length + ' items', 'ok'); PP.data = null; PP.ck = null; AP = {}; render(); }
        catch (e) { setErr('ckSave', e.message); $('#ckSave').disabled = false; }
      };
    } };
}
function ckRows(){
  const L = PP.ck.items;
  if (!L.length) return '<div class="small muted">No items yet. Add them, or copy another machine\'s list.</div>';
  return `<div class="ck-head tiny muted"><span>Section</span><span>Item</span><span>Standard (what good looks like)</span><span></span></div>` + L.map((x, i) => `<div class="ck-row">
    <select class="inp" data-ck="${i}:section" aria-label="Section ${i + 1}">${CK_SECTIONS.map(s => `<option ${s === x.section ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <input class="inp" data-ck="${i}:item" maxlength="80" value="${esc(x.item || '')}" placeholder="e.g. Gear box" aria-label="Item ${i + 1}">
    <input class="inp" data-ck="${i}:standard" maxlength="200" value="${esc(x.standard || '')}" placeholder="e.g. No leak, oil level max" aria-label="Standard ${i + 1}">
    <div class="row" style="gap:2px;flex-wrap:nowrap"><button type="button" class="btn btn-ghost btn-sm" data-ck-mv="${i}:-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">&uarr;</button>
      <button type="button" class="btn btn-ghost btn-sm" data-ck-mv="${i}:1" ${i === L.length - 1 ? 'disabled' : ''} aria-label="Move down">&darr;</button>
      <button type="button" class="btn btn-ghost btn-sm" data-ck-rm="${i}" aria-label="Remove">${I.x}</button></div></div>`).join('');
}
function ckPick(){
  const have = new Set(((PP.data || {}).checklists || []).map(c => c.asset));
  openModal({ title:'Make a checklist', size:'narrow', sub:'For a machine that has none yet.',
    body:`<div class="field"><label for="ckWhich">Machine or equipment</label><input class="inp" id="ckWhich" list="ckWhichL" placeholder="Type to search"><datalist id="ckWhichL">${(EQ.list || []).filter(a => a.status === 'Active' && !have.has(a.code)).map(a => `<option value="${esc(a.name + ' (' + a.code + ')')}">`).join('')}</datalist></div><div class="err-msg hide" data-err="ckWhich"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>Next</button>`,
    onMount: (w, close) => { $('[data-save]', w).onclick = () => { const c = spAssetFrom($('#ckWhich', w).value); if (!eqByCode(c)) return setErr('ckWhich', 'Choose it from the list.', w); close(); go('/equipment/checklists?asset=' + encodeURIComponent(c)); }; } });
}

/* ---- the checklist on a PM job: every item ticked "done", or "not done" with the reason. S = { [item id]: {result, reason, note} } */
const CHK_REASONS = [['no_material', 'Material not available'], ['no_time', 'No time (production running)'], ['not_needed', 'Not needed this time'], ['other', 'Other']];
const CHK_REASON = Object.fromEntries(CHK_REASONS);
function chkState(items){ const S = {}; (items || []).forEach(x => { S[x.id] = { result: x.result || '', reason: x.reason || '', note: x.note || '' }; }); return S; }
function chkHtml(items, S, dis){
  const done = items.filter(x => S[x.id] && S[x.id].result).length;
  const row = x => { const s = S[x.id] || {};
    return `<div class="chk-row ${s.result ? 'chk-' + s.result : ''}">
      <div class="chk-what"><div class="strong">${esc(x.item)}</div>${x.standard ? `<div class="tiny muted">${esc(x.standard)}</div>` : ''}</div>
      <div class="chk-btns"><button type="button" class="btn btn-sm ${s.result === 'done' ? 'btn-primary' : 'btn-ghost'}" data-chk-res="${x.id}:done" ${dis}>${I.check} Done</button>
        <button type="button" class="btn btn-sm ${s.result === 'not_done' ? 'btn-danger' : 'btn-ghost'}" data-chk-res="${x.id}:not_done" ${dis}>Not done</button></div>
      ${s.result === 'not_done' ? `<div class="chk-why"><select class="inp" data-chk-reason="${x.id}" ${dis} aria-label="Why not done"><option value="">Why not?</option>${CHK_REASONS.map(([k, l]) => `<option value="${k}" ${s.reason === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <input class="inp" data-chk-note="${x.id}" maxlength="300" value="${esc(s.note || '')}" ${dis} placeholder="${s.reason === 'other' ? 'Say why (needed)' : 'Note (optional): which material...'}"></div>` : ''}</div>`; };
  return `<div class="row between" style="margin-bottom:8px"><span class="small"><b>${done}</b> of ${items.length} answered</span>
      ${dis ? '' : `<button type="button" class="btn btn-ghost btn-sm" data-chk-all>Mark the rest done</button>`}</div>`
    + CK_SECTIONS.map(sec => { const L = items.filter(x => x.section === sec); return L.length ? `<div class="chk-sec">${esc(sec)}</div>` + L.map(row).join('') : ''; }).join('');
}
// wires the checklist inside box (re-draws itself on each tap); onChange(S) after every change
function chkBind(box, items, S, dis, onChange){
  if (!box) return;
  const redraw = () => { box.innerHTML = chkHtml(items, S, dis); wire(); if (onChange) onChange(S); };
  const wire = () => {
    $$('[data-chk-res]', box).forEach(b => b.onclick = () => { const [id, r] = b.dataset.chkRes.split(':'); const s = S[id] || (S[id] = {}); s.result = s.result === r ? '' : r; if (s.result !== 'not_done') { s.reason = ''; } redraw(); });
    $$('[data-chk-reason]', box).forEach(el => el.onchange = () => { S[el.dataset.chkReason].reason = el.value; redraw(); });
    $$('[data-chk-note]', box).forEach(el => el.oninput = () => { S[el.dataset.chkNote].note = el.value; });
    const all = $('[data-chk-all]', box); if (all) all.onclick = () => { items.forEach(x => { const s = S[x.id] || (S[x.id] = {}); if (!s.result) s.result = 'done'; }); redraw(); };
  };
  wire();
}
// what to send: answered items; { error } when one is not done without a reason, or (all) when items are left
function chkCheck(items, S, all){
  const out = [];
  for (const x of items) {
    const s = S[x.id] || {};
    if (!s.result) { if (all) return { error: 'Tick every checklist item, or say why it was not done (' + items.filter(y => !(S[y.id] || {}).result).length + ' left).' }; out.push({ id: x.id, result: '' }); continue; }
    if (s.result === 'not_done' && !s.reason) return { error: x.item + ': say why it was not done.' };
    if (s.reason === 'other' && String(s.note || '').trim().length < 3) return { error: x.item + ': write why it was not done.' };
    out.push({ id: x.id, result: s.result, reason: s.result === 'not_done' ? s.reason : '', note: s.result === 'not_done' ? String(s.note || '').trim() : '' });
  }
  return { checks: out };
}

/* ============================================================
   Engineering settings (migration 017: OKL_ENG_settings)
   The numbers Engineering can change; each has a lowest and highest value. GET /webhook/engineering/api/settings.
   ============================================================ */
let ES = { list: null, loading: false, error: '' };
async function esLoad(force){
  if (ES.loading || (ES.list && !force)) return;
  ES.loading = true; ES.error = '';
  try { const r = await api('/webhook/engineering/api/settings'); ES.list = r.settings || []; }
  catch (err) { ES.error = err.message; }
  finally { ES.loading = false; render(); }
}
function viewSettings(){
  if (!ES.list && !ES.error) esLoad();
  const canEdit = canEditHere(), dis = canEdit ? '' : 'disabled';
  const head = pageHead('Settings', 'The numbers behind the Engineering rules. Changes apply from the next check.' + (canEdit ? '' : ' Only people with edit access can change them.'));
  if (ES.error) return { title:'Settings', crumb:'Setup', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load the settings', esc(ES.error), `<button class="btn btn-primary" onclick="esLoad(true)">Try again</button>`)}</div></div>` };
  if (!ES.list) return { title:'Settings', crumb:'Setup', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
  const when = iso => iso ? new Date(iso).toLocaleString('en-GB', { timeZone:'Africa/Lagos', dateStyle:'medium', timeStyle:'short' }) : '';
  const about = x => `<div class="strong">${esc(x.label)}</div><div class="small muted">${esc(x.help || '')}</div>
          ${x.updated_by ? `<div class="tiny muted">Changed by ${esc(x.updated_by)}, ${esc(when(x.updated_at))}</div>` : ''}`;
  // number settings in the table; list settings (one entry per line) each get their own block below it, so no row grows tall
  const isList = x => x.unit === 'list' || x.unit === 'emails';
  const nums = ES.list.filter(x => !isList(x)), lists = ES.list.filter(isList);
  return {
    title:'Settings', crumb:'Setup',
    html: head + `<div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Setting</th><th style="width:170px">Value</th><th>Allowed</th></tr></thead>
      <tbody>${nums.map(x => `<tr>
        <td data-label="Setting">${about(x)}</td>
        <td data-label="Value"><div class="row" style="gap:6px;flex-wrap:nowrap"><input class="inp" type="number" data-set="${esc(x.key)}" min="${Number(x.min)}" max="${Number(x.max)}" step="1" value="${Number(x.value)}" style="width:90px" ${dis}><span class="small muted">${esc(x.unit || '')}</span></div></td>
        <td data-label="Allowed" class="small muted">${Number(x.min)} to ${Number(x.max)}</td>
      </tr>`).join('')}</tbody></table></div>
      ${lists.map(x => `<div class="card-b" style="border-top:1px solid var(--line-2)">${about(x)}
        <textarea class="inp" data-list="${esc(x.key)}" rows="${Math.max(2, Math.min(10, (x.list || []).length + 1))}" style="width:100%;max-width:460px;margin-top:8px" ${dis}>${esc((x.list || []).join('\n'))}</textarea>
        <div class="tiny muted" style="margin-top:4px">${x.unit === 'emails' ? 'One e-mail address per line, up to 10.' : 'One per line, 2 to 20.'}</div></div>`).join('')}
      ${canEdit ? `<div class="card-b row" style="gap:10px;border-top:1px solid var(--line-2)"><button class="btn btn-primary" id="esSave">${I.check} Save changes</button><span class="err-msg hide" data-err="esSave"></span></div>` : ''}
    </div>`,
    bind(){
      const b = $('#esSave'); if (!b) return;
      b.onclick = async () => {
        clearErrors(document);
        const values = {};
        for (const el of $$('[data-set]')) {
          const x = ES.list.find(s => s.key === el.dataset.set), v = el.value.trim();
          if (!/^\d+$/.test(v) || +v < +x.min || +v > +x.max) { setErr('esSave', x.label + ': enter a whole number from ' + Number(x.min) + ' to ' + Number(x.max) + '.'); el.focus(); return; }
          if (+v !== +x.value) values[x.key] = +v;
        }
        for (const el of $$('[data-list]')) {
          const x = ES.list.find(s => s.key === el.dataset.list), items = el.value.split('\n').map(s => s.trim()).filter(Boolean);
          if (x.unit === 'emails') {
            if (items.length > 10 || items.some(e => !/^[^@\s|,;]+@[^@\s|,;]+\.[^@\s|,;]+$/.test(e))) { setErr('esSave', x.label + ': one e-mail address per line, up to 10.'); el.focus(); return; }
          } else if (items.length < 2 || items.length > 20) { setErr('esSave', x.label + ': give 2 to 20 entries, one per line.'); el.focus(); return; }
          if (items.join('|') !== (x.list || []).join('|')) values[x.key] = items;
        }
        if (!Object.keys(values).length) { toast('Nothing changed', '', 'ok'); return; }
        b.disabled = true;
        try { const r = await api('/webhook/engineering/api/settings/save', { method:'POST', body:{ values } }); toast('Settings saved', r.changed + ' changed', 'ok'); await esLoad(true); }
        catch (err) { setErr('esSave', err.message); b.disabled = false; }
      };
    },
  };
}
route('/settings', viewSettings);


/* ============================================================
   Spares (migration 018): the catalogue with live stock, receipts (Inbound), issues (Outbound), hand-overs of parts that
   technicians recorded on jobs, and the weekly counts. Nothing is deleted: a mistake is reversed with a reason.
   Stock = the last count (or the opening stock from the old workbook) + receipts - issues since.
   ============================================================ */
const SP_TYPES = { MP:'Mechanical', EP:'Electrical', PP:'Pneumatic', AP:'Accessories', CH:'Chemical', TG:'Tooling' };
const SP_UNITS = ['pcs', 'set', 'pair', 'box', 'pack', 'roll', 'can', 'tube', 'bottle', 'm', 'L', 'kg'];
let SP = { list: null, people: [], loading: false, error: '', q: '', type: '', status: '', noLoc: false,
           moves: { receipt: null, issue: null }, movesErr: '', from: '', to: '', handovers: null, counts: null, week: '' };
const num = v => v == null || v === '' ? '' : String(+v);
const money = v => v == null || v === '' ? '' : Number(v).toLocaleString('en-GB', { maximumFractionDigits: 2 });
const todayIso = () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);   // Lagos is UTC+1
async function spLoad(force){
  if (SP.loading || (SP.list && !force)) return;
  SP.loading = true; SP.error = '';
  try { const r = await api('/webhook/engineering/api/spares'); SP.list = r.spares || []; SP.people = r.people || []; }
  catch (err) { SP.error = err.message; }
  finally { SP.loading = false; render(); }
  if (!EQ.list && !EQ.loading) eqLoad();
}
async function spLoadMoves(kind, force){
  if (SP.moves[kind] && !force) return;
  try { const q = '?kind=' + kind + (SP.from ? '&from=' + SP.from : '') + (SP.to ? '&to=' + SP.to : '');
        const r = await api('/webhook/engineering/api/spares/moves' + q); SP.moves[kind] = r.moves || []; SP.movesErr = ''; }
  catch (err) { SP.movesErr = err.message; }
  render();
}
async function spLoadHandovers(force){
  if (SP.handovers && !force) return;
  try { const r = await api('/webhook/engineering/api/spares/handovers'); SP.handovers = r.handovers || []; } catch (err) { SP.movesErr = err.message; }
  render();
}
async function spLoadCounts(force){
  if (SP.counts && !force) return;
  try { SP.counts = await api('/webhook/engineering/api/spares/counts' + (SP.week ? '?week=' + SP.week : '')); } catch (err) { SP.movesErr = err.message; }
  render();
}
async function spRefresh(){ await Promise.all([spLoad(true), SP.moves.receipt && spLoadMoves('receipt', true), SP.moves.issue && spLoadMoves('issue', true),
                                               SP.handovers && spLoadHandovers(true), SP.counts && spLoadCounts(true)]); }
const spBySku = sku => (SP.list || []).find(x => x.sku === sku);
const spLabel = x => x.sku + ' - ' + x.description;
const spStatusBadge = st => st === 'OK' ? '<span class="badge b-ok">OK</span>' : st === 'Reorder' ? '<span class="badge b-warn">Reorder</span>' : '<span class="badge b-danger">Out of stock</span>';
function spTabs(cur){
  const n = (SP.handovers || []).length, tabs = [['/spares', 'Inventory'], ['/spares/inbound', 'Inbound'], ['/spares/outbound', 'Outbound'],
    ['/spares/handovers', 'Hand-overs' + (n ? ' (' + n + ')' : '')], ['/spares/counts', 'Weekly count']];
  return `<div class="tabs" style="margin-bottom:14px">${tabs.map(([h, l]) => `<a class="tab ${h === cur ? 'on' : ''}" href="#${h}">${esc(l)}</a>`).join('')}</div>`;
}
function spHead(sub, actions){ return pageHead('Spares', sub, actions); }
function spWait(cur){
  if (SP.error) return { title:'Spares', crumb:'Store', html: spHead('') + spTabs(cur) + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load the spares', esc(SP.error), `<button class="btn btn-primary" onclick="spLoad(true)">Try again</button>`)}</div></div>` };
  return { title:'Spares', crumb:'Store', html: spHead('') + spTabs(cur) + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
}
function spActions(){
  if (!canEditHere()) return '';
  return `<button class="btn btn-ghost" onclick="spReceive()">${I.arrowDown} Receive</button><button class="btn btn-ghost" onclick="spIssue()">${I.arrowUp} Issue</button>
    <button class="btn btn-primary" onclick="spOpen('')">${I.plus} Add part</button>`;
}

/* ---- Inventory */
function spFiltered(){
  const q = SP.q.trim().toLowerCase();
  return (SP.list || []).filter(x => (!SP.type || x.sku.slice(0, 2) === SP.type) && (!SP.status || x.status === SP.status) && (!SP.noLoc || !x.location)
    && (!q || [x.sku, x.description, x.part_number, x.brand, x.supplier, x.location, (x.used_on_names || []).join(' '), x.used_for_old].join(' ').toLowerCase().includes(q)));
}
function viewSpares(){
  if (!SP.list) { spLoad(); return spWait('/spares'); }
  if (!SP.handovers) spLoadHandovers();
  const all = SP.list.filter(x => x.active), rows = spFiltered(), shown = rows.slice(0, 300);
  const out = all.filter(x => x.status === 'Out of stock').length, reo = all.filter(x => x.status === 'Reorder').length;
  const value = all.reduce((t, x) => t + (+x.value || 0), 0), noLoc = all.filter(x => !x.location).length, never = all.filter(x => !x.last_count_at).length;
  const opt = (v, cur, l) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(l)}</option>`;
  return {
    title:'Spares', crumb:'Store', keepScroll: true,
    html: spHead('Engineering spare parts with live stock. Stock changes only through receipts, issues and counts.', dlButton("spDownload('inventory')") + spActions()) + spTabs('/spares') + `
    <div class="grid g4" style="margin-bottom:14px">
      <div class="stat"><div class="lbl">Parts</div><div class="val">${all.length}</div><div class="meta">in the catalogue</div></div>
      <div class="stat"><div class="lbl">Stock value</div><div class="val">&#8358;${money(Math.round(value))}</div><div class="meta">where a price is known</div></div>
      <div class="stat"><div class="lbl">Out of stock / reorder</div><div class="val">${out} / ${reo}</div><div class="meta">at or below the reorder level</div></div>
      <div class="stat"><div class="lbl">Never counted / no location</div><div class="val">${never} / ${noLoc}</div><div class="meta">the weekly count fixes these</div></div>
    </div>
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px"><div class="row" style="gap:10px;flex-wrap:wrap">
        <div class="search filter-search"><span class="ic">${I.search}</span><input class="inp" id="spQ" style="padding-left:34px;border-radius:20px" placeholder="SKU, part, brand, machine" value="${esc(SP.q)}"></div>
        <select class="inp" id="spType" style="width:auto">${opt('', SP.type, 'All types')}${Object.entries(SP_TYPES).map(([k, v]) => opt(k, SP.type, k + ' ' + v)).join('')}</select>
        <select class="inp" id="spStatus" style="width:auto">${opt('', SP.status, 'Any stock')}${opt('Out of stock', SP.status, 'Out of stock')}${opt('Reorder', SP.status, 'Reorder')}${opt('OK', SP.status, 'OK')}</select>
        <label class="row small" style="gap:6px"><input type="checkbox" id="spNoLoc" ${SP.noLoc ? 'checked' : ''}> No location</label>
      </div></div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>SKU</th><th>Part</th><th>Location</th><th style="text-align:right">Stock</th><th style="text-align:right">Reorder at</th><th>Status</th><th>Used on</th><th>Last counted</th></tr></thead>
        <tbody>${shown.length ? shown.map(x => `<tr class="clickable" onclick="spOpen('${esc(x.sku)}')">
          <td class="mono small" data-label="SKU">${esc(x.sku)}</td>
          <td data-label="Part"><div class="strong">${esc(x.description)}</div><div class="tiny muted">${esc([x.part_number, x.brand].filter(Boolean).join(' - '))}</div></td>
          <td data-label="Location">${x.location ? esc(x.location) : '<span class="badge b-warn">not set</span>'}</td>
          <td data-label="Stock" style="text-align:right" class="strong">${num(x.stock)} <span class="small muted">${esc(x.unit)}</span>${+x.waiting ? `<div class="tiny muted">${num(x.waiting)} waiting hand-over</div>` : ''}</td>
          <td data-label="Reorder at" style="text-align:right">${num(x.reorder_level)}</td>
          <td data-label="Status">${spStatusBadge(x.status)}${x.active ? '' : ' <span class="badge b-slate">Off</span>'}</td>
          <td data-label="Used on" class="small">${x.common_use ? 'Common use' : esc((x.used_on_names || []).join(', ') || (x.used_for_old ? '(old: ' + x.used_for_old + ')' : '--'))}</td>
          <td data-label="Last counted" class="small">${x.last_count_at ? esc(x.last_count_at.slice(0, 10)) : '<span class="muted">never</span>'}</td>
        </tr>`).join('') : `<tr><td colspan="8" class="muted" style="padding:16px">Nothing matches.</td></tr>`}</tbody>
      </table></div>
      <div class="small muted" style="padding:12px 18px">${rows.length} of ${SP.list.length} shown${rows.length > shown.length ? ' (first ' + shown.length + ')' : ''}. Mirrored to the Spares Google Sheet.</div>
    </div>`,
    bind(){
      const q = $('#spQ'); if (q) q.addEventListener('input', debounce(e => { SP.q = e.target.value; render(); const el = $('#spQ'); if (el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 200));
      const t = $('#spType'); if (t) t.onchange = e => { SP.type = e.target.value; render(); };
      const st = $('#spStatus'); if (st) st.onchange = e => { SP.status = e.target.value; render(); };
      const nl2 = $('#spNoLoc'); if (nl2) nl2.onchange = e => { SP.noLoc = e.target.checked; render(); };
    },
  };
}
route('/spares', viewSpares);
// the list on screen as an Excel file (inventory as filtered; inbound / outbound for the dates picked)
function spDownload(what){
  const mv = m => [m.entry, m.date, m.sku, m.description, (m.reversal ? -1 : 1) * +m.qty, m.unit];
  const sheets = {
    inventory: () => [{ name: 'Inventory', head: ['SKU', 'Part', 'Part number', 'Brand', 'Supplier', 'Location', 'Stock', 'Unit', 'Reorder at', 'Status', 'Unit price (NGN)', 'Value (NGN)', 'Used on', 'Last counted', 'Active'],
      rows: spFiltered().map(x => [x.sku, x.description, x.part_number, x.brand, x.supplier, x.location, +x.stock, x.unit, +x.reorder_level, x.status, x.unit_price == null ? '' : +x.unit_price,
        x.value == null ? '' : +x.value, x.common_use ? 'Common use' : (x.used_on_names || []).join(', '), x.last_count_at ? x.last_count_at.slice(0, 10) : '', x.active ? 'yes' : 'no']) }],
    receipt: () => [{ name: 'Inbound', head: ['Entry', 'Date', 'SKU', 'Part', 'Qty', 'Unit', 'Amount (NGN)', 'Invoice', 'Supplier', 'Received by', 'Note'],
      rows: (SP.moves.receipt || []).map(m => mv(m).concat([m.amount == null ? '' : (m.reversal ? -1 : 1) * +m.amount, m.invoice_no, m.supplier, m.received_by_name, m.reason || m.note])) }],
    issue: () => [{ name: 'Outbound', head: ['Entry', 'Date', 'SKU', 'Part', 'Qty', 'Unit', 'Equipment', 'Collected by', 'Job', 'Status', 'Note'],
      rows: (SP.moves.issue || []).map(m => mv(m).concat([m.asset_name || m.purpose_text, m.collected_by_name, m.job, m.status, m.reason || m.decision_reason || m.note])) }],
    handovers: () => [{ name: 'Hand-overs', head: ['Entry', 'Job', 'SKU', 'Part', 'Qty', 'Unit', 'Taken by', 'Equipment', 'Working days waiting'],
      rows: (SP.handovers || []).map(m => [m.entry, m.job, m.sku, m.description, +m.qty, m.unit, m.collected_by_name, m.asset_name, m.working_days]) }],
    counts: () => [{ name: 'Weekly count', head: ['Week', 'SKU', 'Part', 'Location', 'System', 'Counted', 'Difference', 'Reason', 'Status'],
      rows: ((SP.counts || {}).items || []).map(i => [(SP.counts || {}).week, i.sku, i.description, i.location, i.system_qty == null ? '' : +i.system_qty, i.counted_qty == null ? '' : +i.counted_qty,
        i.difference == null ? '' : +i.difference, i.reason, i.status]) }],
  }[what]();
  downloadXlsx('Spares ' + { inventory: 'inventory', receipt: 'inbound', issue: 'outbound', handovers: 'hand-overs', counts: 'weekly count' }[what], sheets);
}

function spAssetOptions(){ return (EQ.list || []).filter(a => a.status === 'Active').sort((a, b) => a.name.localeCompare(b.name)).map(a => `<option value="${esc(a.name + ' (' + a.code + ')')}">`).join(''); }
const spAssetFrom = v => { const m = /\(([A-Z0-9_.-]+)\)\s*$/.exec(String(v || '')); return m ? m[1] : String(v || '').trim().toUpperCase(); };
const spSkuFrom = v => { const m = /^\s*([A-Z]{2} \d{3,4})/.exec(String(v || '').toUpperCase()); return m ? m[1] : ''; };
function spSkuOptions(){ return (SP.list || []).filter(x => x.active).map(x => `<option value="${esc(spLabel(x))}">`).join(''); }

/* ---- several parts at once: one line per part (part, quantity, and the unit price on a receipt). Used by Receive,
   Issue, parts on a job and Start a job. The server saves all the lines or none (migration 023).
   L = [{ text, sku, qty, price }]; opt = { id, price: bool, stock: bool (stop above the stock) } */
const plNew = sku => { const it = sku ? spBySku(sku) : null; return { text: it ? spLabel(it) : '', sku: it ? it.sku : '', qty: '', price: it && it.unit_price ? num(it.unit_price) : '' }; };
const plStock = l => { const it = spBySku(l.sku); return it ? 'In stock: ' + num(it.stock) + ' ' + it.unit + (it.location ? ' - ' + it.location : '') : ''; };
function plRows(L, opt){
  return L.map((l, i) => `<div class="pl-row">
    <div class="pl-part"><input class="inp" data-pl-sku="${i}" list="${opt.id}Skus" value="${esc(l.text)}" placeholder="Type the SKU or the part name" aria-label="Part ${i + 1}">
      <div class="tiny muted" data-pl-stock="${i}">${esc(plStock(l))}</div></div>
    <input class="inp pl-qty" type="number" min="0" step="any" data-pl-qty="${i}" value="${esc(l.qty)}" placeholder="Qty" aria-label="Quantity ${i + 1}">
    ${opt.price ? `<input class="inp pl-price" type="number" min="0" step="any" data-pl-price="${i}" value="${esc(l.price)}" placeholder="Unit price" aria-label="Unit price ${i + 1}">` : ''}
    <button type="button" class="btn btn-ghost btn-sm" data-pl-rm="${i}" ${L.length === 1 ? 'disabled' : ''} aria-label="Remove line ${i + 1}">${I.x}</button></div>`).join('');
}
function plHtml(L, opt){
  return `<div class="pl" id="${opt.id}"><div class="pl-head tiny muted"><span class="pl-part">Part</span><span class="pl-qty">Quantity</span>${opt.price ? '<span class="pl-price">Unit price (NGN)</span>' : ''}<span style="width:34px"></span></div>
    <div data-pl-rows>${plRows(L, opt)}</div>
    <button type="button" class="btn btn-ghost btn-sm" data-pl-add style="margin-top:6px">${I.plus} Add another part</button>
    <datalist id="${opt.id}Skus">${spSkuOptions()}</datalist></div>`;
}
// wires the lines inside root; keeps L in step with what is typed
function plBind(root, L, opt){
  const box = $('#' + opt.id, root); if (!box) return;
  const rows = $('[data-pl-rows]', box);
  const wire = () => {
    $$('[data-pl-sku]', box).forEach(el => { el.oninput = el.onchange = () => { const l = L[+el.dataset.plSku]; l.text = el.value; l.sku = spSkuFrom(el.value);
      const it = spBySku(l.sku), pr = $(`[data-pl-price="${el.dataset.plSku}"]`, box);
      if (it && pr && !pr.value && it.unit_price) { pr.value = num(it.unit_price); l.price = pr.value; }
      $(`[data-pl-stock="${el.dataset.plSku}"]`, box).textContent = plStock(l); }; });
    $$('[data-pl-qty]', box).forEach(el => { el.oninput = () => { L[+el.dataset.plQty].qty = el.value; }; });
    $$('[data-pl-price]', box).forEach(el => { el.oninput = () => { L[+el.dataset.plPrice].price = el.value; }; });
    $$('[data-pl-rm]', box).forEach(el => { el.onclick = () => { L.splice(+el.dataset.plRm, 1); rows.innerHTML = plRows(L, opt); wire(); }; });
  };
  $('[data-pl-add]', box).onclick = () => { L.push(plNew()); rows.innerHTML = plRows(L, opt); wire(); const ins = $$('[data-pl-sku]', box); ins[ins.length - 1].focus(); };
  wire();
}
// the lines to send, or { error }. Empty lines are skipped; at least one part is needed unless opt.optional.
function plCheck(L, opt){
  const out = [], seen = {};
  for (let i = 0; i < L.length; i++) {
    const l = L[i], n = L.length > 1 ? 'Line ' + (i + 1) + ': ' : '';
    if (!String(l.text || '').trim() && !String(l.qty || '').trim()) continue;
    const it = spBySku(l.sku);
    if (!it) return { error: n + 'pick the part from the list.' };
    if (seen[it.sku]) return { error: it.sku + ' is listed twice. Put it on one line with the total quantity.' };
    seen[it.sku] = 1;
    const whole = !['m', 'L', 'kg'].includes(it.unit);
    if (!(+l.qty > 0) || (whole && +l.qty !== Math.floor(+l.qty))) return { error: n + 'enter a quantity above 0' + (whole ? ', in whole ' + it.unit + '.' : '.') };
    if (opt.stock && +l.qty > +it.stock) return { error: n + 'only ' + num(it.stock) + ' ' + it.unit + ' of ' + it.sku + ' in stock. Count it first if the shelf has more.' };
    if (opt.price && !(+l.price > 0)) return { error: n + 'enter the unit price from the invoice.' };
    out.push(Object.assign({ sku: it.sku, qty: String(l.qty).trim(), description: it.description, unit: it.unit }, opt.price ? { unit_price: String(l.price).trim() } : {}));
  }
  if (!out.length && !opt.optional) return { error: 'Add at least one part.' };
  return { lines: out };
}

function spOpen(sku){
  const x = sku ? spBySku(sku) : null, isNew = !x, canEdit = canEditHere(), dis = canEdit ? '' : 'disabled';
  const v = x || { description: '', part_number: '', brand: '', supplier: '', unit: 'pcs', location: '', reorder_level: 0, used_on: [], common_use: false, active: true, notes: '' };
  const usedNames = (v.used_on || []).map(c => { const a = (EQ.list || []).find(e => e.code === c); return a ? a.name + ' (' + c + ')' : c; });
  openModal({
    title: isNew ? 'Add a part' : v.sku + ' - ' + v.description, size:'wide',
    sub: isNew ? 'The SKU is given automatically from the type.' : (SP_TYPES[v.sku.slice(0, 2)] + ' - stock ' + num(v.stock) + ' ' + v.unit + (v.unit_price ? ', last price NGN ' + money(v.unit_price) : '')),
    body: `<form novalidate>
      <div class="grid g2">
        ${isNew ? `<div class="field"><label for="spPrefix">Type</label><select class="inp" id="spPrefix">${Object.entries(SP_TYPES).map(([k, t]) => `<option value="${k}">${k} - ${t}</option>`).join('')}</select></div>` : ''}
        <div class="field"><label for="spDesc">Part</label><input class="inp" id="spDesc" maxlength="160" value="${esc(v.description)}" ${dis}></div>
        <div class="field"><label for="spPn">Part number</label><input class="inp" id="spPn" maxlength="80" value="${esc(v.part_number || '')}" ${dis}></div>
        <div class="field"><label for="spBrand">Brand</label><input class="inp" id="spBrand" maxlength="80" value="${esc(v.brand || '')}" ${dis}></div>
        <div class="field"><label for="spSup">Supplier</label><input class="inp" id="spSup" maxlength="80" value="${esc(v.supplier || '')}" ${dis}></div>
        <div class="field"><label for="spUnit">Unit</label><select class="inp" id="spUnit" ${dis}>${SP_UNITS.map(u => `<option ${u === v.unit ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
        <div class="field"><label for="spLoc">Location</label><input class="inp" id="spLoc" maxlength="40" value="${esc(v.location || '')}" ${dis} placeholder="shelf / rack / bin"></div>
        <div class="field"><label for="spReo">Reorder level</label><input class="inp" id="spReo" type="number" min="0" step="1" value="${num(v.reorder_level)}" ${dis}></div>
      </div>
      <div class="field"><label>Used on</label>
        <label class="row small" style="gap:6px;margin-bottom:6px"><input type="checkbox" id="spCommon" ${v.common_use ? 'checked' : ''} ${dis}> Common use (fits anything)</label>
        <div id="spUsedList" class="row" style="gap:6px;flex-wrap:wrap">${usedNames.map(n => `<span class="chip" data-used="${esc(spAssetFrom(n))}">${esc(n)} ${canEdit ? '<b style="cursor:pointer" data-rm>&times;</b>' : ''}</span>`).join('')}</div>
        ${canEdit ? `<div class="row" style="gap:6px;margin-top:6px"><input class="inp" id="spUsedAdd" list="spAssets" placeholder="Add a machine or equipment" style="max-width:360px"><button type="button" class="btn btn-ghost btn-sm" id="spUsedBtn">Add</button></div><datalist id="spAssets">${spAssetOptions()}</datalist>` : ''}
        ${v.used_for_old ? `<div class="hint">${I.info}<span>The old workbook said: "${esc(v.used_for_old)}"</span></div>` : ''}
      </div>
      ${isNew ? '' : `<label class="row small" style="gap:6px"><input type="checkbox" id="spActive" ${v.active ? 'checked' : ''} ${dis}> In use (untick to switch the part off)</label>`}
      <div class="field"><label for="spNotes">Notes</label><textarea class="inp" id="spNotes" rows="2" maxlength="500" ${dis}>${esc(v.notes || '')}</textarea></div>
      ${isNew ? '' : `<div class="small muted">Last received ${esc(v.last_in || 'never')}, last issued ${esc(v.last_out || 'never')}, last counted ${esc(v.last_count_at ? v.last_count_at.slice(0, 10) : 'never')}.</div>`}
      <div class="err-msg hide" data-err="spDesc" style="margin-top:8px"></div></form>`,
    footer: canEdit ? `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} ${isNew ? 'Add part' : 'Save'}</button>` : `<button class="btn btn-ghost" data-close>Close</button>`,
    onMount: (w, close) => {
      const list = $('#spUsedList', w);
      list.addEventListener('click', e => { if (e.target.matches('[data-rm]')) e.target.closest('[data-used]').remove(); });
      const addBtn = $('#spUsedBtn', w);
      if (addBtn) addBtn.onclick = () => { const inp = $('#spUsedAdd', w), code = spAssetFrom(inp.value); const a = (EQ.list || []).find(e => e.code === code);
        if (!a) { setErr('spDesc', 'Pick the equipment from the list.', w); return; }
        if (!$(`[data-used="${code}"]`, w)) list.insertAdjacentHTML('beforeend', `<span class="chip" data-used="${esc(code)}">${esc(a.name + ' (' + code + ')')} <b style="cursor:pointer" data-rm>&times;</b></span>`);
        inp.value = ''; };
      const sv = $('[data-save]', w); if (!sv) return;
      sv.onclick = async () => {
        clearErrors(w);
        const spare = { sku: isNew ? '' : v.sku, prefix: isNew ? $('#spPrefix', w).value : '', description: $('#spDesc', w).value.trim(), part_number: $('#spPn', w).value.trim(),
          brand: $('#spBrand', w).value.trim(), supplier: $('#spSup', w).value.trim(), unit: $('#spUnit', w).value, location: $('#spLoc', w).value.trim(),
          reorder_level: $('#spReo', w).value.trim() || '0', common_use: $('#spCommon', w).checked, used_on: $$('[data-used]', w).map(e => e.dataset.used),
          active: isNew ? true : $('#spActive', w).checked, notes: $('#spNotes', w).value.trim() };
        if (spare.description.length < 2) return setErr('spDesc', 'Describe the part.', w);
        if (isNew && !spare.location) return setErr('spDesc', 'Say where it is kept (location).', w);
        sv.disabled = true;
        try { const r = await api('/webhook/engineering/api/spares/save', { method:'POST', body:{ spare } }); close(); toast(isNew ? 'Added ' + r.sku : 'Saved', spare.description, 'ok'); await spLoad(true); }
        catch (err) { setErr('spDesc', err.message, w); sv.disabled = false; }
      };
    },
  });
}

/* ---- Receive / issue forms */
// one delivery: the invoice, supplier and date once, then one line per part
function spReceive(sku){
  const x = sku ? spBySku(sku) : null, me = S.me.name, L = [plNew(sku)], opt = { id: 'rcLines', price: true };
  openModal({
    title:'Receive parts', size:'wide', sub:'A delivery into the store: one invoice, one line per part. The invoice number and prices come from the supplier\'s invoice.',
    body: `<form novalidate><div class="grid g2">
      <div class="field"><label for="rcInv">Invoice number</label><input class="inp" id="rcInv" maxlength="40"></div>
      <div class="field"><label for="rcSup">Supplier</label><input class="inp" id="rcSup" maxlength="80" value="${x ? esc(x.supplier || '') : ''}"></div>
      <div class="field"><label for="rcDate">Received on</label><input class="inp" id="rcDate" type="date" value="${todayIso()}" max="${todayIso()}"></div>
      <div class="field"><label for="rcBy">Received by</label><select class="inp" id="rcBy"><option value="">${esc(me)} (me)</option>${(SP.people || []).map(p => `<option value="${esc(p.enroll_id)}">${esc(p.name)}</option>`).join('')}</select></div>
    </div>
    <div class="field"><span class="lbl">Parts received</span>${plHtml(L, opt)}
      <div class="hint">${I.info}<span>A part that is not in the catalogue yet: add it first (Add part).</span></div></div>
    <div class="field"><label for="rcNote">Note (optional)</label><input class="inp" id="rcNote" maxlength="300"></div>
    <div class="err-msg hide" data-err="rcInv"></div></form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Receive</button>`,
    onMount: (w, close) => {
      plBind(w, L, opt);
      const sv = $('[data-save]', w);
      sv.onclick = async () => {
        clearErrors(w);
        const chk = plCheck(L, opt);
        if (chk.error) return setErr('rcInv', chk.error, w);
        const receipt = { invoice_no: $('#rcInv', w).value.trim(), supplier: $('#rcSup', w).value.trim(), date: $('#rcDate', w).value, received_by: $('#rcBy', w).value,
          note: $('#rcNote', w).value.trim(), lines: chk.lines.map(l => ({ sku: l.sku, qty: l.qty, unit_price: l.unit_price })) };
        if (!receipt.invoice_no || !receipt.supplier) return setErr('rcInv', 'The invoice number and the supplier are needed.', w);
        sv.disabled = true;
        try { const r = await api('/webhook/engineering/api/spares/receipt', { method:'POST', body:{ receipt } }); close();
              toast('Received ' + receipt.lines.length + ' part' + (receipt.lines.length === 1 ? '' : 's'), (r.moves || [r.move]).map(m => m && m.entry).filter(Boolean).join(', '), 'ok'); await spRefresh(); }
        catch (err) { setErr('rcInv', err.message, w); sv.disabled = false; }
      };
    },
  });
}
// parts leaving the store: the equipment and who collected them once, then one line per part
function spIssue(sku){
  const L = [plNew(sku)], opt = { id: 'isLines', stock: true };
  openModal({
    title:'Issue parts', size:'wide', sub:'Parts leaving the store for one piece of equipment: one line per part.',
    body: `<form novalidate><div class="grid g2">
      <div class="field" style="grid-column:1/-1"><label for="isAsset">For which equipment</label><input class="inp" id="isAsset" list="isAssets" placeholder="Type a machine, AHU, utility..."><datalist id="isAssets">${spAssetOptions()}</datalist></div>
      <div class="field"><label for="isWho">Collected by</label><select class="inp" id="isWho"><option value="">Choose...</option>${(SP.people || []).map(p => `<option value="${esc(p.enroll_id)}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="isDate">Date</label><input class="inp" id="isDate" type="date" value="${todayIso()}" max="${todayIso()}"></div>
    </div>
    <div class="field"><span class="lbl">Parts issued</span>${plHtml(L, opt)}</div>
    <div class="field"><label for="isNote">Note (optional)</label><input class="inp" id="isNote" maxlength="300"></div>
    <div class="err-msg hide" data-err="isAsset"></div></form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Issue</button>`,
    onMount: (w, close) => {
      plBind(w, L, opt);
      const sv = $('[data-save]', w);
      sv.onclick = async () => {
        clearErrors(w);
        const chk = plCheck(L, opt);
        if (chk.error) return setErr('isAsset', chk.error, w);
        const issue = { asset: spAssetFrom($('#isAsset', w).value), collected_by: $('#isWho', w).value, date: $('#isDate', w).value, note: $('#isNote', w).value.trim(),
          lines: chk.lines.map(l => ({ sku: l.sku, qty: l.qty })) };
        if (!(EQ.list || []).some(a => a.code === issue.asset)) return setErr('isAsset', 'Pick the equipment from the list.', w);
        if (!issue.collected_by) return setErr('isAsset', 'Choose who collected the parts.', w);
        sv.disabled = true;
        try { const r = await api('/webhook/engineering/api/spares/issue', { method:'POST', body:{ issue } }); close();
              toast('Issued ' + issue.lines.length + ' part' + (issue.lines.length === 1 ? '' : 's'), (r.moves || [r.move]).map(m => m && m.entry).filter(Boolean).join(', '), 'ok'); await spRefresh(); }
        catch (err) { setErr('isAsset', err.message, w); sv.disabled = false; }
      };
    },
  });
}
function spReverse(id, kind){
  const m = (SP.moves[kind] || []).find(x => x.id === id); if (!m) return;
  openModal({
    title:'Reverse ' + m.entry, size:'narrow', sub: m.sku + ' x ' + num(m.qty) + ' ' + (m.unit || '') + ' on ' + m.date,
    body:`<div class="small" style="margin-bottom:8px">A reversal adds an opposite entry; nothing is deleted. ${kind === 'receipt' ? 'The parts come off the stock.' : 'The parts go back into stock.'}</div>
      <div class="field"><label for="rvWhy">Why?</label><input class="inp" id="rvWhy" maxlength="300" placeholder="e.g. entered on the wrong machine"></div><div class="err-msg hide" data-err="rvWhy"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-danger" data-save>Reverse</button>`,
    onMount: (w, close) => { const sv = $('[data-save]', w); sv.onclick = async () => {
      clearErrors(w); const reason = $('#rvWhy', w).value.trim(); if (reason.length < 5) return setErr('rvWhy', 'Say why.', w);
      sv.disabled = true;
      try { await api('/webhook/engineering/api/spares/reverse', { method:'POST', body:{ id, reason } }); close(); toast('Reversed', m.entry, 'ok'); await spRefresh(); }
      catch (err) { setErr('rvWhy', err.message, w); sv.disabled = false; } }; },
  });
}

/* ---- Inbound / Outbound */
function spMovesView(kind){
  const cur = kind === 'receipt' ? '/spares/inbound' : '/spares/outbound';
  if (!SP.list) { spLoad(); return spWait(cur); }
  if (!SP.moves[kind]) { spLoadMoves(kind); }
  const rows = SP.moves[kind], canEdit = canEditHere();
  const head = spHead(kind === 'receipt' ? 'Deliveries into the store. Each needs the invoice number and the supplier.' : 'Parts leaving the store, with the equipment and who collected them.', dlButton(`spDownload('${kind}')`) + spActions()) + spTabs(cur)
    + `<div class="row" style="gap:8px;margin-bottom:12px;flex-wrap:wrap"><label class="small">From <input class="inp" type="date" id="mvFrom" value="${esc(SP.from)}" style="width:auto"></label>
       <label class="small">to <input class="inp" type="date" id="mvTo" value="${esc(SP.to)}" style="width:auto"></label><span class="small muted">Default: the last 90 days.</span></div>`;
  const bind = () => { ['#mvFrom', '#mvTo'].forEach((id, i) => { const el = $(id); if (el) el.onchange = e => { SP[i ? 'to' : 'from'] = e.target.value; SP.moves = { receipt: null, issue: null }; render(); }; }); };
  if (SP.movesErr) return { title:'Spares', crumb:'Store', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(SP.movesErr), `<button class="btn btn-primary" onclick="spLoadMoves('${kind}', true)">Try again</button>`)}</div></div>`, bind };
  if (!rows) return { title:'Spares', crumb:'Store', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>`, bind };
  const stat = m => m.reversal ? '<span class="badge b-slate">Reversal</span>' : m.reversed_by ? '<span class="badge b-slate">Reversed</span>'
    : m.status === 'waiting' ? '<span class="badge b-warn">Waiting hand-over</span>' : m.status === 'cancelled' ? '<span class="badge b-slate">Cancelled</span>'
    : m.source === 'import' ? '<span class="badge">Old workbook</span>' : '<span class="badge b-ok">' + (kind === 'receipt' ? 'Received' : 'Issued') + '</span>';
  const canRev = m => canEdit && !m.reversal && !m.reversed_by && m.source !== 'import' && m.status === 'issued';
  const table = kind === 'receipt'
    ? `<thead><tr><th>Entry</th><th>Date</th><th>Part</th><th style="text-align:right">Qty</th><th style="text-align:right">Amount (NGN)</th><th>Invoice / supplier</th><th>Received by</th><th>Status</th><th></th></tr></thead>
       <tbody>${rows.map(m => `<tr><td class="mono small">${esc(m.entry)}</td><td class="small">${esc(m.date)}</td>
         <td><div class="strong">${esc(m.sku || '(no SKU)')}</div><div class="tiny muted">${esc(m.description || m.note || '')}</div></td>
         <td style="text-align:right">${m.reversal ? '-' : ''}${num(m.qty)} ${esc(m.unit || '')}</td><td style="text-align:right">${m.amount == null ? '' : (m.reversal ? '-' : '') + money(m.amount)}</td>
         <td class="small">${esc(m.invoice_no || '--')}<div class="tiny muted">${esc(m.supplier || '')}</div></td><td class="small">${esc(m.received_by_name || '')}</td>
         <td>${stat(m)}${m.reason ? `<div class="tiny muted">${esc(m.reason)}</div>` : ''}</td>
         <td style="text-align:right">${canRev(m) ? `<button class="btn btn-ghost btn-sm" onclick="spReverse(${m.id}, 'receipt')">Reverse</button>` : ''}</td></tr>`).join('')
         || `<tr><td colspan="9" class="muted" style="padding:16px">No receipts in this period.</td></tr>`}</tbody>`
    : `<thead><tr><th>Entry</th><th>Date</th><th>Part</th><th style="text-align:right">Qty</th><th>Equipment</th><th>Collected by</th><th>Job</th><th>Status</th><th></th></tr></thead>
       <tbody>${rows.map(m => `<tr><td class="mono small">${esc(m.entry)}</td><td class="small">${esc(m.date)}</td>
         <td><div class="strong">${esc(m.sku || '(no SKU)')}</div><div class="tiny muted">${esc(m.description || m.note || '')}</div></td>
         <td style="text-align:right">${m.reversal ? '-' : ''}${num(m.qty)} ${esc(m.unit || '')}</td>
         <td class="small">${esc(m.asset_name || '')}${!m.asset && m.purpose_text ? `<div class="tiny muted">old: ${esc(m.purpose_text)}</div>` : ''}</td>
         <td class="small">${esc(m.collected_by_name || '')}</td><td class="mono small">${esc(m.job || '')}</td>
         <td>${stat(m)}${m.reason || m.decision_reason ? `<div class="tiny muted">${esc(m.reason || m.decision_reason)}</div>` : ''}</td>
         <td style="text-align:right">${canRev(m) ? `<button class="btn btn-ghost btn-sm" onclick="spReverse(${m.id}, 'issue')">Reverse</button>` : ''}</td></tr>`).join('')
         || `<tr><td colspan="9" class="muted" style="padding:16px">No issues in this period.</td></tr>`}</tbody>`;
  return { title:'Spares', crumb:'Store', keepScroll: true, html: head + `<div class="card"><div class="tbl-wrap"><table class="tbl">${table}</table></div>
    <div class="small muted" style="padding:12px 18px">${rows.length} entries.</div></div>`, bind };
}
route('/spares/inbound', () => spMovesView('receipt'));
route('/spares/outbound', () => spMovesView('issue'));

/* ---- Hand-overs: parts technicians recorded on jobs, waiting for the storekeeper */
function viewHandovers(){
  if (!SP.list) { spLoad(); return spWait('/spares/handovers'); }
  if (!SP.handovers) { spLoadHandovers(); return spWait('/spares/handovers'); }
  const rows = SP.handovers, canEdit = canEditHere();
  return { title:'Spares', crumb:'Store', keepScroll: true,
    html: spHead('Parts technicians recorded on their jobs. Stock moves only when the hand-over is confirmed.', dlButton("spDownload('handovers')") + spActions()) + spTabs('/spares/handovers') + `
    <div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Entry</th><th>Job</th><th>Part</th><th style="text-align:right">Qty</th><th>Taken by</th><th>Equipment</th><th>Waiting</th><th></th></tr></thead>
      <tbody>${rows.map(m => `<tr><td class="mono small">${esc(m.entry)}</td><td class="mono small">${esc(m.job || '')}</td>
        <td><div class="strong">${esc(m.sku)}</div><div class="tiny muted">${esc(m.description || '')}</div></td><td style="text-align:right">${num(m.qty)} ${esc(m.unit || '')}</td>
        <td class="small">${esc(m.collected_by_name || '')}</td><td class="small">${esc(m.asset_name || '')}</td>
        <td>${m.working_days >= 2 ? `<span class="badge b-warn">${m.working_days} working days</span>` : `<span class="small">${m.working_days ? m.working_days + ' working day' + (m.working_days === 1 ? '' : 's') : 'today'}</span>`}</td>
        <td style="text-align:right">${canEdit ? `<div class="row" style="gap:6px;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="spHandover(${m.id}, 'confirm')">Confirm</button>
          <button class="btn btn-ghost btn-sm" onclick="spHandover(${m.id}, 'correct')">Correct</button><button class="btn btn-ghost btn-sm" onclick="spHandover(${m.id}, 'cancel')">Cancel</button></div>` : ''}</td>
      </tr>`).join('') || `<tr><td colspan="8" class="muted" style="padding:16px">Nothing waiting.</td></tr>`}</tbody>
    </table></div></div>` };
}
route('/spares/handovers', viewHandovers);
function spHandover(id, action){
  const m = (SP.handovers || []).find(x => x.id === id); if (!m) return;
  const send = async (body, w, close) => {
    try { await api('/webhook/engineering/api/spares/handover', { method:'POST', body: Object.assign({ id, action }, body) }); close && close();
      toast(action === 'confirm' ? 'Confirmed' : action === 'correct' ? 'Corrected' : 'Cancelled', m.entry, 'ok'); await spRefresh(); }
    catch (err) { if (w) setErr('hoWhy', err.message, w); else toast('Could not do that', err.message, 'err', 7000); }
  };
  if (action === 'confirm') { confirmDialog('Confirm the hand-over', `${esc(m.collected_by_name)} took <b>${num(m.qty)} ${esc(m.unit)} of ${esc(m.sku)}</b> (${esc(m.description)}) for ${esc(m.asset_name)}. The stock goes down now.`, 'Confirm').then(ok => ok && send({})); return; }
  openModal({
    title: (action === 'correct' ? 'Correct ' : 'Cancel ') + m.entry, size:'narrow', sub: m.sku + ' x ' + num(m.qty) + ' ' + m.unit + ' recorded on ' + (m.job || 'a job'),
    body: `${action === 'correct' ? `<div class="field"><label for="hoSku">Part actually taken</label><input class="inp" id="hoSku" list="hoSkus" value="${esc(spLabel(spBySku(m.sku) || { sku: m.sku, description: m.description }))}"><datalist id="hoSkus">${spSkuOptions()}</datalist></div>
      <div class="field"><label for="hoQty">Quantity actually taken</label><input class="inp" id="hoQty" type="number" min="0" step="any" value="${num(m.qty)}"></div>` : '<div class="small" style="margin-bottom:8px">Nothing leaves the stock.</div>'}
      <div class="field"><label for="hoWhy">Why?</label><input class="inp" id="hoWhy" maxlength="300"></div><div class="err-msg hide" data-err="hoWhy"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Back</button><button class="btn ${action === 'cancel' ? 'btn-danger' : 'btn-primary'}" data-save>${action === 'correct' ? 'Save the correction' : 'Cancel the hand-over'}</button>`,
    onMount: (w, close) => { $('[data-save]', w).onclick = () => {
      clearErrors(w); const reason = $('#hoWhy', w).value.trim(); if (reason.length < 5) return setErr('hoWhy', 'Say why.', w);
      const body = { reason }; if (action === 'correct') { body.sku = spSkuFrom($('#hoSku', w).value); body.qty = $('#hoQty', w).value; if (!spBySku(body.sku)) return setErr('hoWhy', 'Pick the part from the list.', w); }
      send(body, w, close); }; },
  });
}

/* ---- Weekly count */
function viewCounts(){
  if (!SP.list) { spLoad(); return spWait('/spares/counts'); }
  if (!SP.counts) { spLoadCounts(); return spWait('/spares/counts'); }
  const c = SP.counts, items = c.items || [], canEdit = canEditHere(), canApprove = levelOf('engineering.approvals') === 'edit';
  const done = items.filter(i => i.status !== 'planned').length;
  const shift = d => { const t = new Date(c.week_start + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + d); return t.toISOString().slice(0, 10); };
  const label = { planned:'<span class="badge b-warn">Not counted yet</span>', matches:'<span class="badge b-ok">Matches</span>', adjusted:'<span class="badge b-ok">Adjusted</span>',
    waiting_approval:'<span class="badge b-warn">Waiting approval</span>', approved:'<span class="badge b-ok">Approved</span>', rejected:'<span class="badge b-danger">Rejected</span>' };
  return { title:'Spares', crumb:'Store', keepScroll: true,
    html: spHead('A few parts each week, picked by the system (never-counted first). What you count becomes the stock.', dlButton("spDownload('counts')") + spActions()) + spTabs('/spares/counts') + `
    <div class="row between" style="margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div class="row" style="gap:8px"><button class="btn btn-ghost btn-sm" onclick="spWeek('${shift(-7)}')">${I.chevL} Previous week</button>
        <span class="strong">Week ${esc(c.week)} (from ${esc(c.week_start)})</span>
        <button class="btn btn-ghost btn-sm" onclick="spWeek('')">This week</button></div>
      <div class="small">${done} of ${items.length} counted. A difference over ${num(c.threshold)} needs the Engineering Manager's approval.</div>
    </div>
    <div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Part</th><th>Location</th><th style="text-align:right">On the shelf</th><th>Reason for a difference</th><th>Status</th><th></th></tr></thead>
      <tbody>${items.map(i => `<tr>
        <td><div class="strong">${esc(i.sku)}</div><div class="tiny muted">${esc(i.description)}</div>${+i.waiting_handovers ? `<div class="tiny" style="color:var(--warn)">${num(i.waiting_handovers)} ${esc(i.unit)} waiting hand-over: confirm those first</div>` : ''}</td>
        <td class="small">${esc(i.location || 'not set')}</td>
        ${i.status === 'planned' && canEdit
          ? `<td style="text-align:right"><input class="inp" type="number" min="0" step="any" data-cnt="${i.id}" style="width:90px"> <span class="small muted">${esc(i.unit)}</span></td>
             <td><input class="inp" data-why="${i.id}" maxlength="300" placeholder="only if it differs"></td><td>${label.planned}</td>
             <td style="text-align:right"><button class="btn btn-primary btn-sm" onclick="spCount(${i.id})">Save</button><div class="err-msg hide" data-err="cnt${i.id}"></div></td>`
          : `<td style="text-align:right">${i.counted_qty == null ? '--' : num(i.counted_qty) + ' ' + esc(i.unit)}${i.difference != null && +i.difference !== 0 ? `<div class="tiny muted">system ${num(i.system_qty)}, ${+i.difference > 0 ? '+' : ''}${num(i.difference)}</div>` : ''}</td>
             <td class="small">${esc(i.reason || '')}${i.decision_note ? `<div class="tiny muted">${esc(i.decided_by)}: ${esc(i.decision_note)}</div>` : ''}</td><td>${label[i.status] || esc(i.status)}</td><td></td>`}
      </tr>`).join('') || `<tr><td colspan="6" class="muted" style="padding:16px">No count planned for this week.</td></tr>`}</tbody>
    </table></div></div>
    ${(c.waiting_approval || []).length ? `<div class="card" style="margin-top:14px"><div class="card-h"><h3>Counts waiting for approval</h3><div class="sub">The stock changes only when the Engineering Manager approves.</div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Part</th><th style="text-align:right">System</th><th style="text-align:right">Shelf</th><th>Reason</th><th>Counted by</th><th></th></tr></thead>
      <tbody>${c.waiting_approval.map(i => `<tr><td><div class="strong">${esc(i.sku)}</div><div class="tiny muted">${esc(i.description)}</div></td><td style="text-align:right">${num(i.system_qty)}</td>
        <td style="text-align:right" class="strong">${num(i.counted_qty)}</td><td class="small">${esc(i.reason || '')}</td><td class="small">${esc(i.counted_by || '')}</td>
        <td style="text-align:right">${canApprove ? `<div class="row" style="gap:6px;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="spDecide(${i.id}, true)">Approve</button><button class="btn btn-ghost btn-sm" onclick="spDecide(${i.id}, false)">Reject</button></div>` : '<span class="small muted">waiting for the manager</span>'}</td></tr>`).join('')}</tbody></table></div></div>` : ''}` };
}
route('/spares/counts', viewCounts);
function spWeek(w){ SP.week = w; SP.counts = null; render(); }
async function spCount(id){
  const inp = $(`[data-cnt="${id}"]`), why = $(`[data-why="${id}"]`), err = $(`[data-err="cnt${id}"]`);
  const show = m => { if (err) { err.textContent = m; err.classList.remove('hide'); } };
  if (!inp || inp.value.trim() === '' || !(+inp.value >= 0)) return show('Enter the number on the shelf.');
  try { const r = await api('/webhook/engineering/api/spares/count', { method:'POST', body:{ id, counted: inp.value.trim(), reason: why ? why.value.trim() : '' } });
    toast(r.status === 'matches' ? 'Matches the system' : r.status === 'adjusted' ? 'Stock adjusted' : 'Sent for approval', '', 'ok'); await spRefresh(); }
  catch (e) { show(e.message); }
}
function spDecide(id, approve){
  const i = ((SP.counts || {}).waiting_approval || []).find(x => x.id === id); if (!i) return;
  openModal({ title: (approve ? 'Approve ' : 'Reject ') + i.entry, size:'narrow', sub: i.sku + ': system ' + num(i.system_qty) + ', shelf ' + num(i.counted_qty),
    body: `<div class="small" style="margin-bottom:8px">${approve ? 'The shelf count becomes the stock.' : 'The stock stays as it is; the part is counted again.'}</div>
      <div class="field"><label for="dcNote">${approve ? 'Note (optional)' : 'Why?'}</label><input class="inp" id="dcNote" maxlength="300"></div><div class="err-msg hide" data-err="dcNote"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Back</button><button class="btn ${approve ? 'btn-primary' : 'btn-danger'}" data-save>${approve ? 'Approve' : 'Reject'}</button>`,
    onMount: (w, close) => { $('[data-save]', w).onclick = async () => {
      clearErrors(w); const note = $('#dcNote', w).value.trim(); if (!approve && note.length < 5) return setErr('dcNote', 'Say why.', w);
      try { await api('/webhook/engineering/api/spares/count/decide', { method:'POST', body:{ id, approve, note } }); close(); toast(approve ? 'Approved' : 'Rejected', i.sku, 'ok'); await spRefresh(); }
      catch (e) { setErr('dcNote', e.message, w); } }; } });
}


/* ============================================================
   Calls and jobs (migration 019: OKL_ENG_jobs)
   The floor calls maintenance from a stopped machine ("Call maintenance"); the call arrives here as a breakdown job.
   Technicians take it ("I'm coming"), report arrival, record what failed, what was done and the parts, and close it.
   Jobs without a call (preventive, corrective, inspection, improvement, or a breakdown found on a round) start here too.
   GET /webhook/engineering/api/jobs (the board), /jobs/one?id, /jobs/history, /stops; POST /jobs/action | start | parts.
   Phones get a push notification for each new call once notifications are turned on (sw.js).
   ============================================================ */
const JOB_TYPES = [['breakdown', 'Breakdown'], ['preventive', 'Preventive'], ['corrective', 'Corrective'], ['inspection', 'Inspection'], ['improvement', 'Improvement']];
const JOB_TYPE = Object.fromEntries(JOB_TYPES);
let JB = { board: null, error: '', loading: false, tab: 'calls', one: {}, history: null, histFrom: '', histTo: '', histType: '', stops: null, stopsInfo: {},
           timer: null, draft: null, push: { state: '', key: '' } };
const hm = iso => iso ? new Date(iso).toLocaleTimeString('en-GB', { timeZone:'Africa/Lagos', hour:'2-digit', minute:'2-digit' }) : '';
const dayHm = iso => iso ? new Date(iso).toLocaleString('en-GB', { timeZone:'Africa/Lagos', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '';
const minsBetween = (a, b) => (a ? Math.max(0, Math.round(((b ? new Date(b) : new Date()) - new Date(a)) / 60000)) : null);
function dur(m){ if (m == null) return '--'; if (m < 60) return m + ' min'; const h = Math.floor(m / 60); return h + ' h ' + String(m % 60).padStart(2, '0') + ' min'; }
function jbMe(){ return (JB.board && JB.board.me) || {}; }
function jbOnIt(j){ return (j.technicians || []).some(t => t.enroll_id === jbMe().enroll_id); }
function jbBadge(j){
  const who = j.accepted_by_name ? (j.accepted_by === jbMe().enroll_id ? 'you' : j.accepted_by_name) : '';
  const working = (j.technicians || []).map(t => t.enroll_id === jbMe().enroll_id ? 'you' : t.name).join(', ');
  switch (j.status) {
    case 'called': return '<span class="badge b-warn"><span class="dot"></span>Not accepted</span>';
    case 'accepted': return `<span class="badge b-warn"><span class="dot"></span>On the way${who ? ' · ' + esc(who) : ''}</span>`;
    case 'working': return `<span class="badge b-info"><span class="dot"></span>Working${working ? ' · ' + esc(working) : ''}</span>`;
    case 'waiting_part': return '<span class="badge b-slate"><span class="dot"></span>Waiting for part</span>';
    case 'to_report': return '<span class="badge b-warn"><span class="dot"></span>To report</span>';
    case 'done': return '<span class="badge b-ok">Done</span>';
    case 'cancelled': return '<span class="badge b-slate">Cancelled</span>';
  }
  return esc(j.status);
}
// minutes shown on a card: waiting for a technician, then repairing, then waiting for the part
function jbClock(j){
  if (j.status === 'called' || j.status === 'accepted') return minsBetween(j.called_at || j.created_at);
  if (j.status === 'waiting_part') return minsBetween(j.waiting_since);
  if (j.status === 'working') return minsBetween(j.started_at || j.arrived_at);
  if (j.source === 'report') return j.downtime_minutes;
  return j.labour_minutes;
}
async function jbLoad(force){
  if (JB.loading || (JB.board && !force)) return;
  JB.loading = true;
  try { JB.board = await api('/webhook/engineering/api/jobs'); JB.error = ''; }
  catch (err) { JB.error = err.message; }
  finally { JB.loading = false; render(); }
}
// the board refreshes itself while it is on screen (new calls appear without a reload)
function jbAutoRefresh(on){
  clearInterval(JB.timer); JB.timer = null;
  if (on) JB.timer = setInterval(() => { if (/^\/jobs(\/|$)/.test(currentPath()) && !document.querySelector('#layers .overlay') && !JB.draft) jbLoad(true); else if (!/^\/jobs/.test(currentPath())) jbAutoRefresh(false); }, 30000);
}
function jbTabs(cur){
  const b = JB.board || {}, n = k => (b[k] || []).length, open = (b.calls || []).filter(j => j.status === 'called').length;
  const tabs = [['calls', 'Calls', n('calls'), open], ['mine', 'My jobs', n('mine')], ['open', 'Other open jobs', n('open')], ['reports', 'From the daily report', n('reports'), n('reports')], ['history', 'History']];
  return `<div class="tabs" style="margin-bottom:14px">${tabs.map(([k, l, c, warn]) => `<a class="tab ${k === cur ? 'on' : ''}" href="#/jobs${k === 'calls' ? '' : '?tab=' + k}">${esc(l)}${c != null ? ` <span class="badge ${warn ? 'b-warn' : ''}" style="padding:1px 7px">${c}</span>` : ''}</a>`).join('')}</div>`;
}
function jbCard(j){
  const me = jbMe(), mine = jbOnIt(j), canAct = levelOf('engineering.jobs') && ['submit', 'edit'].includes(levelOf('engineering.jobs')) && me.staff;
  let btn = '';
  if (canAct && j.status === 'called') btn = `<button class="btn btn-primary btn-block" onclick="event.stopPropagation(); jbDo('${esc(j.job_id)}', 'accept')">I'm coming</button>`;
  else if (canAct && j.status === 'accepted' && mine) btn = `<button class="btn btn-primary btn-block" onclick="event.stopPropagation(); jbDo('${esc(j.job_id)}', 'arrive')">Start job</button>`;
  else if (canAct && j.status === 'to_report') btn = `<button class="btn btn-primary btn-block" onclick="event.stopPropagation(); go('/jobs/${esc(j.job_id)}')">Fill in what was done</button>`;
  if (j.status === 'to_report') {
    const what = [j.area, j.report_product, 'down ' + dur(j.downtime_minutes)].filter(Boolean).map(esc).join(' · ');
    return `<div class="card job-card" onclick="go('/jobs/${esc(j.job_id)}')"><div class="card-b">
      <div class="row between" style="flex-wrap:nowrap;align-items:flex-start"><div class="strong" style="font-size:16px">${esc(j.machine_name || j.asset)}</div>
        <div class="mono small muted" style="white-space:nowrap">${esc(lagosDay(j.started_at).slice(0, 10))}</div></div>
      <div class="small" style="margin:4px 0 2px">${esc(j.call_note || j.stop_reason || '')}</div><div class="small muted" style="margin-bottom:10px">${what}</div>
      <div class="row" style="gap:10px;margin-bottom:${btn ? '12px' : '0'}">${jbBadge(j)}<span class="mono tiny muted" style="margin-left:auto">${esc(j.job_id)}</span></div>${btn}</div></div>`;
  }
  const where = [j.area || j.stage, j.source === 'console' ? JOB_TYPE[j.type] : (j.stop_reason || JOB_TYPE[j.type]), j.called_by_name].filter(Boolean).map(esc).join(' · ');
  return `<div class="card job-card" onclick="go('/jobs/${esc(j.job_id)}')">
    <div class="card-b">
      <div class="row between" style="flex-wrap:nowrap;align-items:flex-start"><div class="strong" style="font-size:16px">${esc(j.machine_name || j.asset || j.machine_code)}</div>
        <div class="mono small muted" style="white-space:nowrap">${j.called_at ? 'called ' + hm(j.called_at) : 'started ' + hm(j.started_at || j.created_at)}</div></div>
      <div class="small muted" style="margin:4px 0 10px">${where}</div>
      <div class="row" style="gap:10px;margin-bottom:${btn ? '12px' : '0'}">${jbBadge(j)}<span class="mono strong">${dur(jbClock(j))}</span><span class="mono tiny muted" style="margin-left:auto">${esc(j.job_id)}</span></div>
      ${btn}
    </div></div>`;
}
function jbPushBanner(){
  const p = JB.push;
  if (p.state === 'on' || p.state === 'unsupported-quiet' || p.state === '') return '';
  if (p.state === 'ios') return `<div class="notice info" style="margin-bottom:14px">${I.info}<div>To get a notification for each new call on an iPhone: tap <b>Share</b>, then <b>Add to Home Screen</b>, open the console from the new icon and turn notifications on there.</div></div>`;
  if (p.state === 'denied') return `<div class="notice warn" style="margin-bottom:14px">${I.alert}<div>Notifications are blocked for this site in your browser settings. Allow them to hear about new calls.</div></div>`;
  if (p.state === 'unsupported') return `<div class="notice" style="margin-bottom:14px">${I.info}<div>This browser cannot show notifications. Keep this page open: new calls appear by themselves.</div></div>`;
  if (p.state === 'server') return '';
  return `<div class="notice info row between" style="margin-bottom:14px">${I.info}<div style="flex:1">Get a notification on this phone or computer for each new call.</div>
    <button class="btn btn-primary btn-sm" onclick="pushTurnOn()">Turn on notifications</button></div>`;
}
function viewJobs(){
  const tab = (new URLSearchParams(currentPath().split('?')[1] || '')).get('tab') || 'calls';
  if (tab === 'history') return viewJobsHistory();
  if (!JB.board && !JB.error) jbLoad();
  JB.draft = null; jbAutoRefresh(true); pushCheck();
  const canStart = ['submit', 'edit'].includes(levelOf('engineering.jobs')), mgr = levelOf('engineering.jobs') === 'edit';
  const head = pageHead('Calls and jobs', 'Maintenance calls from the floor and the jobs Engineering is working on. This page refreshes by itself.',
    (mgr ? `<button class="btn btn-ghost" onclick="go('/jobs/report')">${I.download} Daily report issues</button>` : '')
    + (canStart ? `<button class="btn btn-ghost" onclick="go('/jobs/record')">${I.check} Record finished work</button><button class="btn btn-primary" onclick="go('/jobs/new')">${I.plus} Start a job</button>` : ''));
  if (JB.error) return { title:'Calls and jobs', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load the jobs', esc(JB.error), `<button class="btn btn-primary" onclick="jbLoad(true)">Try again</button>`)}</div></div>` };
  if (!JB.board) return { title:'Calls and jobs', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
  const b = JB.board, list = b[tab] || [];
  const me = b.me || {};
  const notStaff = canStart && !me.staff ? `<div class="notice warn" style="margin-bottom:14px">${I.alert}<div>Your account is not linked to an Engineering employee, so you can look but not take calls. Ask an admin to link it (Users).</div></div>` : '';
  const open = (b.calls || []).filter(j => j.status === 'called');
  const sum = tab === 'calls' ? `<div class="small" style="margin-bottom:10px"><span class="badge ${open.length ? 'b-warn' : 'b-ok'}"><span class="dot"></span>${(b.calls || []).length} open call${(b.calls || []).length === 1 ? '' : 's'} · ${open.length} not accepted yet</span>
    <span class="muted"> updated ${hm(b.now)}</span></div>` : '';
  const empty = { calls: 'No open calls. New calls from the floor appear here.', mine: 'You are not on any open job.', open: 'No other open jobs.',
                  reports: 'Nothing to report. Issues from the daily packaging report (products the floor app does not cover) appear here for you to fill in.' }[tab];
  return {
    title:'Calls and jobs', crumb:'Maintenance', keepScroll: true,
    html: head + jbPushBanner() + notStaff + jbTabs(tab) + sum
      + (tab === 'reports' && list.length ? `<div class="small muted" style="margin-bottom:10px">Issues from the daily packaging report. Open one, say what failed and what was done, and save it.</div>` : '')
      + (list.length ? `<div class="grid g3 job-grid">${list.map(jbCard).join('')}</div>` : `<div class="card"><div class="card-b">${emptyState('wrench', empty, '')}</div></div>`)
      + (tab === 'calls' ? `<div class="small muted" style="margin-top:12px">Machine stops nobody called in are on <a href="#/stops">Machine stops</a>.</div>` : ''),
  };
}
route('/jobs', viewJobs);

async function jbDo(id, action, extra){
  try {
    const r = await api('/webhook/engineering/api/jobs/action', { method:'POST', body: Object.assign({ id, action }, extra || {}) });
    JB.one[id] = r.job;
    toast({ accept: 'On your jobs', arrive: 'Started', wait: 'Waiting for the part', resume: 'Back on it', done: 'Job closed', cancel: 'Job cancelled', save: 'Saved', reopen: 'Reopened' }[action] || 'Done', r.job.job_id, 'ok');
    await jbLoad(true);
    if (action === 'accept' || action === 'arrive') go('/jobs/' + id);
    return r.job;
  } catch (err) { toast('Could not do that', err.message, 'err', 7000); throw err; }
}

/* ---- one job */
async function jbLoadOne(id){
  try { const r = await api('/webhook/engineering/api/jobs/one?id=' + encodeURIComponent(id)); JB.one[id] = r.job || false; if (r.failure_categories) JB.cats = r.failure_categories; }
  catch (err) { JB.one[id] = { error: err.message }; }
  render();
}
function viewJob(params, ctx){
  const id = params.id, from = ctx || { back: '/jobs', label: 'Calls and jobs' };
  if (!SP.list && !SP.loading) spLoad();
  if (!EQ.list && !EQ.loading) eqLoad();
  if (!JB.board && !JB.loading) jbLoad();
  if (JB.one[id] === undefined) { JB.one[id] = null; jbLoadOne(id); }
  const j = JB.one[id];
  const back = `<a class="btn btn-ghost btn-sm" href="#${from.back}">${I.chevL} ${esc(from.label)}</a>`;
  if (j === false) return { title:'Job', crumb:'Maintenance', html: back + `<div class="card" style="margin-top:12px"><div class="card-b">${emptyState('alert', 'No such job', 'It may have been typed wrong.')}</div></div>` };
  if (!j) return { title:'Job', crumb:'Maintenance', html: back + `<div class="card" style="margin-top:12px"><div class="card-b small muted">Loading...</div></div>` };
  if (j.error) return { title:'Job', crumb:'Maintenance', html: back + `<div class="card" style="margin-top:12px"><div class="card-b">${emptyState('alert', 'Could not load the job', esc(j.error), `<button class="btn btn-primary" onclick="jbLoadOne('${esc(id)}')">Try again</button>`)}</div></div>` };
  const me = jbMe(), lvl = levelOf('engineering.jobs'), mgr = lvl === 'edit', can = ['submit', 'edit'].includes(lvl);
  const onIt = jbOnIt(j), closed = j.status === 'done' || j.status === 'cancelled', rep = j.status === 'to_report';
  const canWrite = can && (onIt || mgr || (rep && me.staff)) && (!closed || (mgr && j.status === 'done'));
  const checks = j.checks || [];
  if (!JB.chk || JB.chk.id !== id || JB.chk.at !== j.updated_at) JB.chk = { id, at: j.updated_at, S: chkState(checks) };
  const partsUntil = j.parts_until ? new Date(j.parts_until) : null;
  const canParts = can && (onIt || mgr) && j.status !== 'cancelled' && (j.status !== 'done' || mgr || (partsUntil && partsUntil > new Date()));
  const cats = (JB.board && JB.board.failure_categories) || JB.cats || [];
  const isCall = j.source === 'call';
  const waited = isCall ? minsBetween(j.called_at, j.arrived_at) : null;
  const repair = minsBetween(j.started_at || j.arrived_at, j.finished_at);
  const tl = [];
  if (j.stopped_since) tl.push(['Machine stopped', dayHm(j.stopped_since)]);
  if (j.called_at) tl.push([`Called${j.called_by_name ? ' by ' + j.called_by_name : ''}`, hm(j.called_at)]);
  if (j.accepted_at) tl.push([`Accepted by ${j.accepted_by === me.enroll_id ? 'you' : (j.accepted_by_name || '')}`, hm(j.accepted_at)]);
  if (j.arrived_at) tl.push([`Arrived, ${j.arrival_by === 'operator' ? 'confirmed by the operator' : 'reported by the technician'}`, hm(j.arrived_at)]);
  if (!isCall && j.started_at) tl.push(['Started', dayHm(j.started_at)]);
  if (j.waiting_since) tl.push([`Waiting for part${j.waiting_note ? ': ' + j.waiting_note : ''}`, hm(j.waiting_since)]);
  if (j.resumed_at) tl.push(['Machine running again (floor)', dayHm(j.resumed_at)]);
  if (j.call_cancelled_at) tl.push(['Call cancelled on the floor', hm(j.call_cancelled_at)]);
  if (j.finished_at) tl.push([`Closed${j.closed_by ? ' by ' + j.closed_by : ''}`, dayHm(j.finished_at)]);
  const dis = canWrite && j.status !== 'called' && j.status !== 'accepted' ? '' : 'disabled';
  const pmParts = (j.pm_parts || []).filter(p => p.sku && !(j.parts || []).some(m => m.sku === p.sku && m.status !== 'cancelled'));
  const parts = (j.parts || []).filter(p => p.status !== 'cancelled');
  const partStatus = p => p.reversed_by ? '<span class="badge b-slate">Reversed</span>' : p.status === 'waiting' ? '<span class="badge b-warn">Waiting hand-over</span>' : '<span class="badge b-ok">Handed over</span>';
  let actions = '';
  if (can && me.staff && j.status === 'called') actions = `<button class="btn btn-primary btn-lg" onclick="jbDo('${esc(id)}', 'accept')">I'm coming</button>`;
  else if (can && me.staff && j.status === 'accepted' && !onIt) actions = `<button class="btn btn-primary btn-lg" onclick="jbDo('${esc(id)}', 'arrive')">Join: start job</button>`;
  else if (can && me.staff && j.status === 'accepted') actions = `<button class="btn btn-primary btn-lg" onclick="jbDo('${esc(id)}', 'arrive')">Start job (I'm at the machine)</button>`;
  else if (canWrite && rep) actions = `<button class="btn btn-primary btn-lg" onclick="jbSave('${esc(id)}', 'done')">${I.check} Save and close</button>`;
  else if (can && me.staff && !onIt && (j.status === 'working' || j.status === 'waiting_part')) actions = `<button class="btn btn-ghost btn-lg" onclick="jbDo('${esc(id)}', 'arrive')">Join this job</button>`;
  else if (canWrite && j.status === 'working') actions = `<button class="btn btn-ghost btn-lg" onclick="jbWait('${esc(id)}')">Waiting for part</button><button class="btn btn-primary btn-lg" onclick="jbSave('${esc(id)}', 'done')">Job done</button>`;
  else if (canWrite && j.status === 'waiting_part') actions = `<button class="btn btn-ghost btn-lg" onclick="jbDo('${esc(id)}', 'resume')">Back on it</button><button class="btn btn-primary btn-lg" onclick="jbSave('${esc(id)}', 'done')">Job done</button>`;
  else if (mgr && j.status === 'done') actions = `<button class="btn btn-ghost" onclick="jbDo('${esc(id)}', 'reopen')">Reopen</button><button class="btn btn-primary" onclick="jbSave('${esc(id)}', 'save')">${I.check} Save changes</button>`;
  return {
    title: j.machine_name || 'Job', crumb:'Maintenance', keepScroll: true,
    html: `<div class="row between" style="margin-bottom:12px">${back}<span class="mono small muted">${esc(j.job_id)} · ${esc(JOB_TYPE[j.type] || j.type)}</span></div>
    <div class="card" style="margin-bottom:14px"><div class="card-b">
      <div class="row between" style="align-items:flex-start;flex-wrap:nowrap"><div><h2 style="font-size:20px;margin:0">${j.asset ? `<a href="#/equipment/${esc(j.asset)}" style="color:inherit">${esc(j.machine_name || j.asset_name || j.asset)}</a>` : esc(j.machine_name || j.machine_code)}</h2>
        <div class="small muted" style="margin-top:4px">${[j.area || j.stage, j.stop_reason, j.called_by_name ? 'called by ' + j.called_by_name : ''].filter(Boolean).map(esc).join(' · ')}</div></div>${jbBadge(j)}</div>
      ${!j.asset ? `<div class="notice warn" style="margin-top:12px">${I.alert}<div>The floor machine <b>${esc(j.machine_code)}</b> is not in the equipment register. Choose the equipment below before closing the job.</div></div>` : ''}
      ${j.source === 'report' ? `<div class="notice ${rep ? 'warn' : ''}" style="margin-top:12px">${I.info}<div><b>From the daily packaging report</b>${j.report_product ? ' (' + esc(j.report_product) + ')' : ''}, ${esc(lagosDay(j.started_at).slice(0, 10))}:
          ${esc(j.call_note || '')}. Machine down ${dur(j.downtime_minutes)}.${rep ? ' Say what failed and what was done, then save it.' : ''}</div></div>`
        : j.call_note ? `<div class="small" style="margin-top:8px"><b>${j.source === 'call' ? 'Operator\'s note' : 'Note'}:</b> ${esc(j.call_note)}</div>` : ''}
      ${j.backfilled ? `<div class="small muted" style="margin-top:8px">Recorded from old records (no checklist).</div>` : ''}
    </div></div>
    <div class="grid g2" style="margin-bottom:14px">
      ${isCall ? `<div class="stat"><div class="lbl">${j.arrived_at ? 'Waited for a technician' : 'Waiting for a technician'}</div><div class="val mono">${dur(waited)}</div></div>` : ''}
      <div class="stat"><div class="lbl">${j.finished_at ? 'Repair time' : 'Repair so far'}</div><div class="val mono">${j.started_at || j.arrived_at ? dur(repair) : '--'}</div></div>
    </div>
    <div class="card" style="margin-bottom:14px"><div class="card-b">${tl.map(([a, b]) => `<div class="row between small" style="padding:4px 0;border-bottom:1px solid var(--line-2)"><span>${esc(a)}</span><span class="mono strong">${esc(b)}</span></div>`).join('') || '<span class="small muted">Nothing yet.</span>'}
      ${(j.technicians || []).length ? `<div class="small" style="margin-top:8px"><b>On the job:</b> ${j.technicians.map(t => esc(t.name)).join(', ')}</div>` : ''}</div></div>
    ${j.status === 'cancelled' ? `<div class="notice" style="margin-bottom:14px">${I.info}<div>Cancelled: ${esc(j.cancel_reason || '')}</div></div>` : ''}
    <form id="jbForm" novalidate>
      ${!j.asset || (mgr && closed) ? `<div class="field"><label for="jbAsset">Machine or equipment</label><input class="inp" id="jbAsset" list="jbAssets" value="${esc(j.asset ? (j.asset_name + ' (' + j.asset + ')') : '')}" ${dis} placeholder="Type to search the register"><datalist id="jbAssets">${spAssetOptions()}</datalist></div>` : ''}
      ${j.type === 'breakdown' ? `<div class="field"><span class="lbl">What failed?</span><div class="row" style="gap:8px">${cats.map(c => `<button type="button" class="chip big-chip ${String(j.failure_category || '').toLowerCase() === c.toLowerCase() ? 'on' : ''}" data-cat="${esc(c)}" ${dis}>${esc(c)}</button>`).join('')}</div></div>` : ''}
      ${checks.length ? `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>PM checklist</h3><div class="sub">Tick each item, or mark it not done and say why (for example, the material is not available).</div></div></div>
        <div class="card-b" id="jbChk">${chkHtml(checks, JB.chk.S, dis)}</div></div>` : ''}
      <div class="field"><label for="jbDone">${checks.length ? 'Anything else done? (optional)' : 'What was done?'}</label><textarea class="inp" id="jbDone" rows="3" maxlength="2000" ${dis} placeholder="${checks.length ? 'e.g. Also changed the belt' : 'e.g. Replaced the seal kit and tested ten cycles'}">${esc(j.work_done === 'PM checklist completed.' ? '' : (j.work_done || ''))}</textarea></div>
      ${j.type === 'breakdown' ? `<div class="field"><label for="jbCause">Cause (optional)</label><input class="inp" id="jbCause" maxlength="1000" ${dis} placeholder="e.g. Air cylinder seal worn" value="${esc(j.cause || '')}"></div>` : ''}
      <div class="err-msg hide" data-err="jbDone"></div>
    </form>
    <div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>Parts used <span class="muted" style="font-weight:500">(optional)</span></h3>
        <div class="sub">The storekeeper confirms the hand-over; stock moves then.${j.status === 'done' && partsUntil ? ' Parts can be added until ' + esc(dayHm(j.parts_until)) + (mgr ? ' (you can add later too).' : '.') : ''}</div></div>
        ${canParts ? `<button class="btn btn-ghost btn-sm" onclick="jbAddPart('${esc(id)}')">${I.plus} Add parts</button>` : ''}</div>
      ${pmParts.length ? `<div class="card-b" style="border-bottom:1px solid var(--line-2)"><div class="notice info">${I.info}<div style="flex:1">Due for change at this PM (PM parts plan): ${pmParts.map(p => esc(p.sku + ' ' + p.name + ' x ' + num(p.qty))).join(', ')}.</div>
        ${canParts ? `<button class="btn btn-ghost btn-sm" onclick="jbAddPart('${esc(id)}', true)">Add these</button>` : ''}</div></div>` : ''}
      <div class="card-b">${parts.length ? parts.map(p => `<div class="row between" style="padding:6px 0;border-bottom:1px solid var(--line-2)">
          <div><span class="mono strong">${esc(p.sku)}</span> · ${esc(p.description || '')}<div class="tiny muted">${esc(p.collected_by_name || '')} · ${esc(p.entry)}</div></div>
          <div class="row" style="gap:8px"><span class="mono strong">× ${num(p.qty)}</span>${partStatus(p)}${p.status === 'waiting' && canParts ? `<button class="btn btn-ghost btn-sm" onclick="jbRemovePart('${esc(id)}', ${p.id})">Remove</button>` : ''}</div></div>`).join('')
        : '<span class="small muted">None added.</span>'}</div></div>
    ${isCall && !closed ? `<div class="small muted" style="margin-bottom:10px">The operator restarts the machine on the floor. Closing the job here does not.</div>` : ''}
    <div class="row job-actions" style="gap:10px">${actions}
      ${canWrite && !closed && j.status !== 'called' && j.status !== 'accepted' ? `<button class="btn btn-ghost" onclick="jbSave('${esc(id)}', 'save')">Save for later</button>` : ''}
      ${can && !closed && (onIt || mgr || j.status === 'called') && !(isCall && j.status !== 'called' && !mgr) ? `<button class="btn btn-ghost" style="margin-left:auto" onclick="jbCancel('${esc(id)}')">Cancel job</button>` : ''}
    </div>`,
    bind(){
      $$('[data-cat]').forEach(b => b.onclick = () => { if (b.disabled) return; $$('[data-cat]').forEach(x => x.classList.remove('on')); b.classList.add('on'); });
      chkBind($('#jbChk'), checks, JB.chk.S, dis);
    },
  };
}
route('/jobs/:id', params => params.id === 'new' ? viewJobNew() : params.id === 'record' ? viewJobNew({ mode: 'record' }) : params.id === 'report' ? viewReport() : viewJob(params));
route('/pm/jobs/:id', params => viewJob(params, { back: '/pm/effectiveness', label: 'PM effectiveness' }));

function jbFormValues(){
  const cat = $('[data-cat].on'), a = $('#jbAsset');
  return { failure_category: cat ? cat.dataset.cat : '', cause: ($('#jbCause') || {}).value || '', work_done: ($('#jbDone') || {}).value || '',
           asset: a ? spAssetFrom(a.value) : undefined };
}
async function jbSave(id, action){
  const v = jbFormValues(), j = JB.one[id] || {};
  clearErrors(document);
  const checks = j.checks || [];
  if (checks.length && JB.chk && JB.chk.id === id) {
    const c = chkCheck(checks, JB.chk.S, action === 'done' && j.type === 'preventive' && !j.backfilled);
    if (c.error) return setErr('jbDone', c.error);
    v.checks = c.checks;
  }
  if (action === 'done') {
    if (j.type === 'breakdown' && !v.failure_category) return setErr('jbDone', 'Pick what failed.');
    if (v.work_done.trim().length < 5 && !(checks.length && j.type === 'preventive')) return setErr('jbDone', 'Say what was done.');
    if (!j.asset && !(EQ.list || []).some(x => x.code === v.asset)) return setErr('jbDone', 'Choose the machine or equipment from the list.');
    const waiting = (j.parts || []).filter(p => p.status === 'waiting').length;
    const ok = await confirmDialog('Close the job', `Close <b>${esc(j.job_id)}</b> on ${esc(j.machine_name || '')}?${waiting ? ` ${waiting} part${waiting === 1 ? ' is' : 's are'} still waiting for the storekeeper; that is fine.` : ''}`, 'Job done');
    if (!ok) return;
  }
  if (v.asset === '') delete v.asset;
  try { await jbDo(id, action, v); } catch (e) { setErr('jbDone', e.message); }
}
function jbWait(id){
  openModal({ title:'Waiting for part', size:'narrow', sub:'The floor sees "waiting for part" on the machine.',
    body:`<div class="field"><label for="jwNote">Which part? (optional)</label><input class="inp" id="jwNote" maxlength="300" placeholder="e.g. Seal kit from the store"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Back</button><button class="btn btn-primary" data-save>Waiting for part</button>`,
    onMount: (w, close) => { $('[data-save]', w).onclick = async () => { close(); try { await jbSave(id, 'save'); await jbDo(id, 'wait', { note: $('#jwNote', w).value.trim() }); } catch (e) { /* toast shown */ } }; } });
}
function jbCancel(id){
  openModal({ title:'Cancel job ' + id, size:'narrow', sub:'Parts waiting for the hand-over are cancelled with it.',
    body:`<div class="field"><label for="jcWhy">Why?</label><input class="inp" id="jcWhy" maxlength="300" placeholder="e.g. opened by mistake"></div><div class="err-msg hide" data-err="jcWhy"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Back</button><button class="btn btn-danger" data-save>Cancel the job</button>`,
    onMount: (w, close) => { $('[data-save]', w).onclick = async () => {
      clearErrors(w); const reason = $('#jcWhy', w).value.trim(); if (reason.length < 5) return setErr('jcWhy', 'Say why.', w);
      try { await jbDo(id, 'cancel', { reason }); close(); } catch (e) { setErr('jcWhy', e.message, w); } }; } });
}
function jbAddPart(id, fromPlan){
  const j = JB.one[id] || {};
  const plan = fromPlan ? (j.pm_parts || []).filter(p => p.sku && spBySku(p.sku) && !(j.parts || []).some(m => m.sku === p.sku && m.status !== 'cancelled')) : [];
  const L = plan.length ? plan.map(p => Object.assign(plNew(p.sku), { qty: num(p.qty) })) : [plNew()], opt = { id: 'jpLines' };
  openModal({ title:'Parts used on ' + id, size:'wide', sub:'One line per part. The storekeeper confirms the hand-over before the stock changes.',
    body:`${plHtml(L, opt)}<div class="err-msg hide" data-err="jpLines"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.plus} Add the parts</button>`,
    onMount: (w, close) => {
      plBind(w, L, opt);
      const sv = $('[data-save]', w);
      sv.onclick = async () => {
        clearErrors(w);
        const chk = plCheck(L, opt);
        if (chk.error) return setErr('jpLines', chk.error, w);
        sv.disabled = true;
        try { const r = await api('/webhook/engineering/api/jobs/parts', { method:'POST', body:{ id, lines: chk.lines.map(l => ({ sku: l.sku, qty: l.qty })) } });
              JB.one[id] = r.job; close(); toast(chk.lines.length === 1 ? 'Part added' : chk.lines.length + ' parts added', chk.lines.map(l => l.sku + ' × ' + l.qty).join(', '), 'ok'); render(); }
        catch (e) { setErr('jpLines', e.message, w); sv.disabled = false; }
      };
    } });
}
async function jbRemovePart(id, moveId){
  if (!await confirmDialog('Remove the part', 'Take this part off the job? It has not been handed over yet.', 'Remove')) return;
  try { const r = await api('/webhook/engineering/api/jobs/parts', { method:'POST', body:{ remove: moveId } }); JB.one[id] = r.job; toast('Part removed', '', 'ok'); render(); }
  catch (e) { toast('Could not remove it', e.message, 'err', 7000); }
}

/* ---- jobs without a call. Each kind has its own address and goes back where it came from (round 3, 29 Oct 2026):
     /jobs/new        Start a job: work starting now (a breakdown found on a round, corrective, inspection, improvement)
     /jobs/record     Record finished work: work already done, with its date, start and finish time
     /stops/<id>/job  a breakdown on a machine stop: started now while the machine is still down, recorded once it runs again
     /pm/record       a PM: starting now (the checklist is filled in on the job), or already finished (the checklist is here)
   A call from the floor is only ever started from the call itself ("I'm coming", then "Start job").
   ?asset= preselects the equipment. Dates and times are separate boxes (easier on a phone). */
const JN_TYPES = [['breakdown', 'Breakdown'], ['corrective', 'Corrective'], ['inspection', 'Inspection'], ['improvement', 'Improvement']];
const lagosDate = iso => lagosDay(iso).slice(0, 10), lagosTime = iso => lagosDay(iso).slice(11, 16);
// a Lagos date and "HH:MM" -> ISO time; a finish time earlier than the start is the next day
const jnIso = (date, time) => date && time ? date + 'T' + time + ':00+01:00' : '';
function jnFinishIso(date, t0, t1){
  if (!date || !t1) return '';
  if (t0 && t1 < t0) { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return jnIso(d.toISOString().slice(0, 10), t1); }
  return jnIso(date, t1);
}
function jnChecklist(code){ const c = ((PP.data && PP.data.checklists) || []).find(x => x.asset === code); return c ? c.items : []; }
function jnPlanParts(code){ const x = ((PM.data && PM.data.due) || []).find(r => r.asset === code); return ((x && x.parts) || []).filter(p => p.sku && spBySku(p.sku)); }
function viewJobNew(ctx){
  ctx = ctx || {};
  const qs = new URLSearchParams(currentPath().split('?')[1] || ''), stopId = ctx.stop || qs.get('stop');
  if (!ctx.pm && qs.get('type') === 'preventive') { location.replace('#/pm/record' + (qs.get('asset') ? '?asset=' + encodeURIComponent(qs.get('asset')) : '')); return { title:'Record a PM', crumb:'Maintenance', html:'' }; }
  if (!EQ.list && !EQ.loading) eqLoad();
  if (!SP.list && !SP.loading) spLoad();
  if (!JB.board && !JB.loading) jbLoad();
  if (stopId && !JB.stops && !JB.stopsLoading) jbLoadStops();
  if (ctx.pm && !PP.data) { PP.data = 'loading'; ppLoad(); }
  if (ctx.pm && !PM.data) { PM.data = 'loading'; pmLoad(); }
  const stop = stopId ? (Array.isArray(JB.stops) ? JB.stops : []).find(s => String(s.id) === String(stopId)) : null;
  const where = ctx.pm ? { back: '/pm', label: 'Preventive maintenance', crumb: 'Preventive maintenance' }
    : stopId ? { back: '/stops', label: 'Machine stops', crumb: 'Machine stops' } : { back: '/jobs', label: 'Calls and jobs', crumb: 'Maintenance' };
  const back = `<a class="btn btn-ghost btn-sm" href="#${where.back}">${I.chevL} ${esc(where.label)}</a>`;
  const loadingTitle = ctx.pm ? 'Record a PM' : stopId ? 'Job on a machine stop' : ctx.mode === 'record' ? 'Record finished work' : 'Start a job';
  if (stopId && !JB.stops) return { title: loadingTitle, crumb: where.crumb, html: back + `<div class="card" style="margin-top:12px"><div class="card-b small muted">Loading...</div></div>` };
  if (stopId && !stop) return { title: loadingTitle, crumb: where.crumb, html: back + `<div class="card" style="margin-top:12px"><div class="card-b">${emptyState('info', 'That stop is not on the list any more', 'A job may already cover it.')}</div></div>` };
  const draftKey = currentPath();
  if (!JB.draft || JB.draft.key !== draftKey) JB.draft = { key: draftKey,
    type: ctx.pm ? 'preventive' : stopId ? 'breakdown' : (JOB_TYPE[qs.get('type')] && qs.get('type') !== 'preventive' ? qs.get('type') : ''),
    cat: '', parts: [plNew()], partsFor: '', techs: [], asset: qs.get('asset') || '', note: '', work: '', pmMode: 'start', chk: null,
    date: stop ? lagosDate(stop.started_at) : todayIso(), t0: stop ? lagosTime(stop.started_at) : '', t1: stop && stop.ended_at ? lagosTime(stop.ended_at) : '' };
  const d = JB.draft, cats = (JB.board && JB.board.failure_categories) || [], me = jbMe();
  const mode = ctx.pm ? d.pmMode : stopId ? (stop.still_down ? 'start' : 'record') : (ctx.mode || 'start');
  const assetCode = stop && stop.asset ? stop.asset : spAssetFrom(d.assetText != null ? d.assetText : d.asset);
  const items = ctx.pm && mode === 'record' && eqByCode(assetCode) ? jnChecklist(assetCode) : [];
  if (ctx.pm && mode === 'record' && (!d.chk || d.chk.asset !== assetCode)) d.chk = { asset: assetCode, S: chkState(items) };
  if (ctx.pm && mode === 'record' && eqByCode(assetCode) && d.partsFor !== assetCode && PM.data && PM.data !== 'loading' && !d.parts.some(l => l.sku)) {
    const due = jnPlanParts(assetCode); if (due.length) d.parts = due.map(p => Object.assign(plNew(p.sku), { qty: num(p.qty) })); d.partsFor = assetCode;
  }
  const title = ctx.pm ? 'Record a PM' : stopId ? 'Job on a machine stop' : mode === 'start' ? 'Start a job' : 'Record finished work';
  const sub = ctx.pm ? 'Preventive maintenance on one piece of equipment. Its next PM date is worked out from this. Past PMs from old records: Record past PMs.'
    : stopId ? (mode === 'start' ? 'The machine is still down: start the job now. It is linked to the stop.' : 'The machine runs again: record what was done. The times come from the stop; change them if needed.')
    : mode === 'start' ? 'Work you are starting now without a call. Fill in what was done on the job when you finish.' : 'Work that is already done: say when, and what was done.';
  const people = (SP.people || []).filter(p => p.enroll_id !== me.enroll_id);
  const popt = { id: 'jnLines', optional: true };
  const typeChips = !ctx.pm && !stopId;
  const showCat = d.type === 'breakdown' && mode === 'record';
  const timeBoxes = mode === 'record' ? `<div class="grid g3 jn-when">
      <div class="field"><label for="jnDate">Date</label><input class="inp" type="date" id="jnDate" value="${esc(d.date)}" max="${todayIso()}"></div>
      <div class="field"><label for="jnT0">Started</label><input class="inp" type="time" id="jnT0" value="${esc(d.t0)}"></div>
      <div class="field"><label for="jnT1">Finished</label><input class="inp" type="time" id="jnT1" value="${esc(d.t1)}"><div class="hint">${I.info}<span>Earlier than the start? Then it is the next day.</span></div></div></div>` : '';
  const pmLoading = ctx.pm && mode === 'record' && (!PP.data || PP.data === 'loading');
  return {
    title, crumb: where.crumb, keepScroll: true,
    html: back + pageHead(title, sub, ctx.pm && levelOf('engineering.jobs') === 'edit' ? `<button class="btn btn-ghost" onclick="go('/pm/backfill')">Record past PMs</button>` : '') + `
    ${stop ? `<div class="card" style="margin-bottom:14px"><div class="card-b"><div class="strong">${esc(stop.machine_name)}</div><div class="small muted">${esc(stop.reason)} · stopped ${esc(dayHm(stop.started_at))} · ${stop.still_down ? 'still down' : dur(stop.minutes)}</div></div></div>` : ''}
    <form id="jnForm" novalidate>
      ${ctx.pm ? `<div class="field"><span class="lbl">The PM is</span><div class="seg"><button type="button" class="${mode === 'start' ? 'on' : ''}" data-pmmode="start">Starting now</button><button type="button" class="${mode === 'record' ? 'on' : ''}" data-pmmode="record">Already finished</button></div></div>` : ''}
      ${stop && stop.asset ? '' : `<div class="field"><label for="jnAsset">Which machine or equipment?</label><input class="inp" id="jnAsset" list="jnAssets" value="${esc(d.assetText != null ? d.assetText : (d.asset && eqByCode(d.asset) ? eqByCode(d.asset).name + ' (' + d.asset + ')' : ''))}" placeholder="Type to search: compressor, Kunlong, AHU 1.4..."><datalist id="jnAssets">${spAssetOptions()}</datalist></div>`}
      ${typeChips ? `<div class="field"><span class="lbl">Type of job</span><div class="row" style="gap:8px">${JN_TYPES.map(([k, l]) => `<button type="button" class="chip big-chip ${d.type === k ? 'on' : ''}" data-type="${k}">${l}</button>`).join('')}</div></div>` : ''}
      ${showCat || (typeChips && mode === 'record') ? `<div class="field" id="jnCatWrap" style="${showCat ? '' : 'display:none'}"><span class="lbl">What failed?</span><div class="row" style="gap:8px">${cats.map(c => `<button type="button" class="chip big-chip ${d.cat === c ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div></div>` : ''}
      ${mode === 'start' && !ctx.pm ? `<div class="field"><label for="jnNote">What is wrong? (optional)</label><input class="inp" id="jnNote" maxlength="500" value="${esc(d.note || (stop ? stop.reason : ''))}" placeholder="e.g. Belt slipping on the conveyor"></div>` : ''}
      ${pmLoading ? '<div class="small muted" style="margin-bottom:12px">Loading the checklist...</div>' : ''}
      ${items.length ? `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>PM checklist</h3><div class="sub">Tick each item, or mark it not done and say why.</div></div></div><div class="card-b" id="jnChk">${chkHtml(items, d.chk.S, '')}</div></div>` : ''}
      ${mode === 'record' ? `<div class="field"><label for="jnDone">${items.length ? 'Anything else done? (optional)' : 'What was done?'}</label><textarea class="inp" id="jnDone" rows="3" maxlength="2000" placeholder="${ctx.pm ? 'e.g. Greased the bearings, changed the belts' : 'e.g. Re-tensioned the belt and topped up the oil'}">${esc(d.work || '')}</textarea></div>` : ''}
      ${people.length ? `<div class="field"><span class="lbl">Who else ${mode === 'start' ? 'is working on it' : 'worked on it'}? (optional)</span><div class="row" style="gap:6px">${people.map(p => `<button type="button" class="chip ${d.techs.includes(p.enroll_id) ? 'on' : ''}" data-tech="${esc(p.enroll_id)}">${esc(p.name)}</button>`).join('')}</div></div>` : ''}
      ${mode === 'record' ? `<div class="field"><span class="lbl">Parts used <span class="muted" style="font-weight:500">(optional; the storekeeper confirms the hand-over)</span></span>${plHtml(d.parts, popt)}
        ${ctx.pm && d.partsFor === assetCode && d.parts.some(l => l.sku) ? `<div class="tiny muted" style="margin-top:4px">Filled in from the PM parts plan: change what was not used.</div>` : ''}</div>` : ''}
      ${timeBoxes}
      <div class="err-msg hide" data-err="jnDone"></div>
    </form>
    <div class="row job-actions" style="gap:10px"><button class="btn btn-primary btn-lg" id="jnGo">${mode === 'start' ? (ctx.pm ? 'Start the PM' : 'Start job') : (ctx.pm ? 'Save the PM' : 'Save the job')}</button></div>`,
    bind(){
      $$('[data-pmmode]').forEach(b => b.onclick = () => { keep(); d.pmMode = b.dataset.pmmode; render(); });
      $$('[data-type]').forEach(b => b.onclick = () => { d.type = b.dataset.type; $$('[data-type]').forEach(x => x.classList.toggle('on', x === b)); const w = $('#jnCatWrap'); if (w) w.style.display = d.type === 'breakdown' ? '' : 'none'; });
      $$('[data-cat]').forEach(b => b.onclick = () => { d.cat = b.dataset.cat; $$('[data-cat]').forEach(x => x.classList.toggle('on', x === b)); });
      $$('[data-tech]').forEach(b => b.onclick = () => { const k = b.dataset.tech; d.techs = d.techs.includes(k) ? d.techs.filter(x => x !== k) : d.techs.concat(k); b.classList.toggle('on'); });
      function keep(){ const a = $('#jnAsset'); if (a) d.assetText = a.value; [['#jnNote', 'note'], ['#jnDone', 'work'], ['#jnDate', 'date'], ['#jnT0', 't0'], ['#jnT1', 't1']].forEach(([id, k]) => { const el = $(id); if (el) d[k] = el.value; }); }
      ['#jnNote', '#jnDone', '#jnDate', '#jnT0', '#jnT1'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', keep); });
      const a = $('#jnAsset');
      if (a) { a.addEventListener('input', keep); if (ctx.pm && mode === 'record') a.addEventListener('change', () => { keep(); render(); }); }
      if (items.length) chkBind($('#jnChk'), items, d.chk.S, '');
      if (mode === 'record') plBind(document, d.parts, popt);
      $('#jnGo').onclick = async () => {
        keep(); clearErrors(document);
        const asset = stop && stop.asset ? stop.asset : spAssetFrom(a ? a.value : '');
        if (!(stop && stop.asset) && !(EQ.list || []).some(x => x.code === asset && x.status === 'Active')) return setErr('jnDone', 'Choose the machine or equipment from the list.');
        if (!d.type) return setErr('jnDone', 'Pick the type of job.');
        const job = { asset, type: d.type, technicians: d.techs, stop_id: stop ? stop.id : '', done: mode === 'record' };
        if (mode === 'start') job.note = String(d.note || (stop ? stop.reason : '') || '').trim();
        else {
          if (d.type === 'breakdown' && !d.cat) return setErr('jnDone', 'Pick what failed.');
          if (items.length) { const c = chkCheck(items, d.chk.S, true); if (c.error) return setErr('jnDone', c.error); job.checks = c.checks; }
          if (String(d.work || '').trim().length < 5 && !items.length) return setErr('jnDone', 'Say what was done.');
          if (!d.date || !d.t0 || !d.t1) return setErr('jnDone', 'Enter the date, and the start and finish times.');
          job.started_at = jnIso(d.date, d.t0); job.finished_at = jnFinishIso(d.date, d.t0, d.t1);
          if (new Date(job.finished_at) > new Date(Date.now() + 5 * 60000)) return setErr('jnDone', 'The finish time is in the future.');
          const chk = plCheck(d.parts, popt);
          if (chk.error) return setErr('jnDone', 'Parts: ' + chk.error);
          Object.assign(job, { failure_category: d.type === 'breakdown' ? d.cat : '', work_done: String(d.work || '').trim(), parts: chk.lines.map(p => ({ sku: p.sku, qty: p.qty })) });
        }
        $('#jnGo').disabled = true;
        try { const r = await api('/webhook/engineering/api/jobs/start', { method:'POST', body:{ job } }); JB.draft = null; JB.stops = null; JB.one[r.job.job_id] = r.job; AP = {};
              if (ctx.pm) PM.data = null;
              toast(mode === 'record' ? (ctx.pm ? 'PM recorded' : 'Job recorded') : (ctx.pm ? 'PM started' : 'Job started'), r.job.job_id, 'ok'); jbLoad(true); go((ctx.pm ? '/pm/jobs/' : '/jobs/') + r.job.job_id); }
        catch (e) { setErr('jnDone', e.message); $('#jnGo').disabled = false; }
      };
    },
  };
}
route('/pm/record', () => viewJobNew({ pm: true }));
route('/stops/:id/job', params => viewJobNew({ stop: params.id }));

/* ---- past PMs from old records (Engineering Manager): one date, several machines at once. No checklist; marked "backfilled". */
let BF = { date: '', picked: [], f: { type: '', area: '', asset: '' }, q: '', work: '', techs: [] };
function viewBackfill(){
  if (!EQ.list && !EQ.loading) eqLoad();
  if (!SP.list && !SP.loading) spLoad();
  if (!PM.data) { PM.data = 'loading'; pmLoad(); }
  const back = `<a class="btn btn-ghost btn-sm" href="#/pm">${I.chevL} Preventive maintenance</a>`;
  if (levelOf('engineering.jobs') !== 'edit') return { title:'Record past PMs', crumb:'Preventive maintenance', html: back + `<div class="card" style="margin-top:12px"><div class="card-b">${emptyState('alert', 'Only the Engineering Manager records past PMs', '')}</div></div>` };
  const due = (PM.data && PM.data.due) || [];
  if (!EQ.list || PM.data === 'loading') return { title:'Record past PMs', crumb:'Preventive maintenance', html: back + `<div class="card" style="margin-top:12px"><div class="card-b small muted">Loading...</div></div>` };
  const q = BF.q.trim().toLowerCase();
  const shown = due.filter(x => fltMatch(BF.f, x.asset) && (!q || (x.name + ' ' + x.asset + ' ' + (x.area || '')).toLowerCase().includes(q)));
  return { title:'Record past PMs', crumb:'Preventive maintenance', keepScroll: true,
    html: back + pageHead('Record past PMs', 'PMs done before the system, from the old sheets or paper. Pick the date, tick every machine done that day, and save. Each becomes a finished PM (no checklist). Machines that already have a PM that day are skipped.') + `
    <div class="card" style="margin-bottom:14px"><div class="card-b"><div class="grid g2">
      <div class="field"><label for="bfDate">Date of the PM</label><input class="inp" type="date" id="bfDate" max="${todayIso()}" value="${esc(BF.date)}"></div>
      <div class="field"><label for="bfWork">What was done (optional)</label><input class="inp" id="bfWork" maxlength="500" value="${esc(BF.work)}" placeholder="PM done (recorded from old records)."></div></div>
      ${(SP.people || []).length ? `<div class="field"><span class="lbl">Who did it (optional)</span><div class="row" style="gap:6px">${SP.people.map(p => `<button type="button" class="chip ${BF.techs.includes(p.enroll_id) ? 'on' : ''}" data-bftech="${esc(p.enroll_id)}">${esc(p.name)}</button>`).join('')}</div></div>` : ''}
    </div></div>
    <div class="card"><div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px"><div class="row" style="gap:8px;flex-wrap:wrap">
        <div class="search filter-search"><span class="ic">${I.search}</span><input class="inp" id="bfQ" style="padding-left:34px;border-radius:20px" placeholder="Search" value="${esc(BF.q)}"></div>${fltHtml(BF.f, 'bff')}
        <button class="btn btn-ghost btn-sm" id="bfAll">Tick all shown</button><button class="btn btn-ghost btn-sm" id="bfNone">Clear</button></div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:40px"></th><th>Equipment</th><th>Type</th><th>Area</th><th>Last PM</th></tr></thead>
        <tbody>${shown.map(x => `<tr><td><input type="checkbox" data-bf="${esc(x.asset)}" ${BF.picked.includes(x.asset) ? 'checked' : ''} aria-label="${esc(x.name)}"></td>
          <td data-label="Equipment" class="strong">${esc(x.name)}<div class="tiny muted mono">${esc(x.asset)}</div></td><td data-label="Type" class="small">${esc(x.type)}</td>
          <td data-label="Area" class="small">${esc(x.area || '')}</td><td data-label="Last PM" class="small">${esc(x.last_pm || '--')}</td></tr>`).join('') || '<tr><td colspan="5" class="muted" style="padding:16px">Nothing matches.</td></tr>'}</tbody></table></div>
      <div class="card-b row between" style="border-top:1px solid var(--line-2);flex-wrap:wrap;gap:10px"><span class="small"><b id="bfN">${BF.picked.length}</b> ticked</span>
        <span class="err-msg hide" data-err="bfSave"></span><button class="btn btn-primary" id="bfSave">${I.check} Save the PMs</button></div></div>`,
    bind(){
      fltBind(BF.f, 'bff', render);
      const q = $('#bfQ'); if (q) q.addEventListener('input', debounce(e => { BF.q = e.target.value; render(); const el = $('#bfQ'); if (el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 200));
      $('#bfDate').onchange = e => { BF.date = e.target.value; };
      $('#bfWork').oninput = e => { BF.work = e.target.value; };
      $$('[data-bftech]').forEach(b => b.onclick = () => { const k = b.dataset.bftech; BF.techs = BF.techs.includes(k) ? BF.techs.filter(x => x !== k) : BF.techs.concat(k); b.classList.toggle('on'); });
      const count = () => { $('#bfN').textContent = BF.picked.length; };
      $$('[data-bf]').forEach(c => c.onchange = () => { const k = c.dataset.bf; BF.picked = c.checked ? BF.picked.concat(k) : BF.picked.filter(x => x !== k); count(); });
      $('#bfAll').onclick = () => { BF.picked = Array.from(new Set(BF.picked.concat(shown.map(x => x.asset)))); render(); };
      $('#bfNone').onclick = () => { BF.picked = []; render(); };
      $('#bfSave').onclick = async () => {
        clearErrors(document);
        if (!BF.date) return setErr('bfSave', 'Pick the date of the PM.');
        if (!BF.picked.length) return setErr('bfSave', 'Tick the machines done that day.');
        if (BF.picked.length > 80) return setErr('bfSave', 'At most 80 machines at once.');
        if (!await confirmDialog('Record past PMs', `Record a PM on <b>${esc(BF.date)}</b> for <b>${BF.picked.length}</b> machine${BF.picked.length === 1 ? '' : 's'}?`, 'Save')) return;
        $('#bfSave').disabled = true;
        try { const r = await api('/webhook/engineering/api/jobs/backfill', { method:'POST', body:{ backfill:{ date: BF.date, assets: BF.picked, work_done: BF.work.trim(), technicians: BF.techs } } });
              toast(r.added.length + ' PM' + (r.added.length === 1 ? '' : 's') + ' recorded', r.skipped.length ? r.skipped.length + ' already had a PM that day: ' + r.skipped.join(', ') : '', 'ok', 7000);
              BF.picked = []; PM.data = null; AP = {}; render(); }
        catch (e) { setErr('bfSave', e.message); $('#bfSave').disabled = false; }
      };
    } };
}
route('/pm/backfill', viewBackfill);

/* ---- issues from the daily packaging report (round 3; temporary, until the floor app covers every product).
   /jobs/report (Engineering Manager): upload "OKL PERSONNEL PACKAGING - <MONTH>.xlsx" (first sheet, DAILY DOWNTIME TRACKER)
   or type one issue in. Each issue becomes a breakdown "to report" that technicians fill in (Calls and jobs, From the daily
   report). Products the floor app already covers are left out. The same date + machine + issue is only added once, so the
   month's file can be uploaded again every day. POST /webhook/engineering/api/jobs/report {report: {dry, close, lines}} */
const RP_LIVE = /zaiki|mintacid/i;     // products the floor app covers: their stops come from the floor
let RP = { rows: null, file: '', from: '', close: false, error: '', busy: false, one: { date: '', asset: '', product: '', text: '', minutes: '', action: '' } };
const rpNorm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const RP_RULES = [[/^kun(g)?lon(g)?(\d)$/, m => 'KUNLONG_' + m[3]], [/^jcmc[o0](\d)$/, m => 'JCMCO_' + m[1]], [/^wifa(machine)?$/, () => 'WIFA'], [/^ima(pg)?$/, () => 'IMA_PG'],
  [/^hoonga$/, () => 'HOONGA'], [/^chi(e)?mei(\d)$/, m => 'CHIMEI_' + m[2]], [/^(xiaolun|coating(machine)?)$/, () => 'COATING_XIAOLUN'], [/^wraptech$/, () => 'WRAPTECH'],
  [/^siebler(\d)$/, m => 'SIEBLER_' + m[1]], [/^duankwei(\d)$/, m => 'DUANKWEI_' + m[1]], [/^(dynafold|folding(machine)?)$/, () => 'FOLDING_DYNAFOLD']];
// the register code for a machine name in the report ('' when unsure); the manager's earlier picks are remembered on this browser
function rpMachine(name){
  const n = rpNorm(name); if (!n) return '';
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('okl.eng.rpMachines') || '{}'); } catch (e) { saved = {}; }
  if (saved[n] && eqByCode(saved[n])) return saved[n];
  for (const [re, f] of RP_RULES) { const m = re.exec(n); if (m && eqByCode(f(m))) return f(m); }
  const hit = (EQ.list || []).filter(a => a.status === 'Active' && (rpNorm(a.name) === n || rpNorm(a.code) === n));
  return hit.length === 1 ? hit[0].code : '';
}
function rpRemember(name, code){ try { const k = 'okl.eng.rpMachines', m = JSON.parse(localStorage.getItem(k) || '{}'); m[rpNorm(name)] = code; localStorage.setItem(k, JSON.stringify(m)); } catch (e) { /* this browser keeps nothing */ } }
const RP_MINS = /\(?\s*(\d{1,4})\s*min(?:ute)?s?\s*\)?(?:\s*\(\s*cumulatively\s*\))?/i;
// one cell: blocks of "Machine" then "issue (N mins)" lines -> [{ machine, text, minutes, raw }]
function rpParseCell(cell){
  const out = []; let machine = '';
  for (const raw of String(cell || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) { machine = ''; continue; }
    const m = RP_MINS.exec(line);
    if (!m) {
      const last = out[out.length - 1];
      if (machine && last && last.machine === machine) last.text += ' ' + line.replace(/^[,.;\s]+/, '');
      else machine = line;
      continue;
    }
    let text = line.replace(RP_MINS, ' ').replace(/\s+/g, ' ').replace(/^[,.;\s]+|[,.;\s]+$/g, '').trim(), mach = machine;
    if (!mach) {      // "Wraptech videojet nozzle washing (31mins)": the machine starts the line
      const w = text.split(' ');
      for (const k of [2, 1]) { const nm = w.slice(0, k).join(' '); if (w.length > k && (rpMachine(nm) || RP_RULES.some(([re]) => re.test(rpNorm(nm))))) { mach = w.slice(0, k).join(' '); text = w.slice(k).join(' '); break; } }
    }
    if (text.length >= 3) out.push({ machine: mach, text, minutes: +m[1], raw: (mach ? mach + ': ' : '') + line });
  }
  return out;
}
const rpDay = v => {
  if (typeof v === 'number' && v > 30000 && v < 80000) return new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000).toISOString().slice(0, 10);
  if (v instanceof Date) return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate())).toISOString().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || '')); return m ? m[0] : '';
};
// the first sheet -> one row per issue: { date, product, machine (as written), asset (guess), text, minutes, action, raw }
function rpParseSheet(aoa){
  const issueRow = aoa.findIndex(r => (r || []).some(c => /^issues?$/i.test(String(c).trim())));
  if (issueRow < 1) throw new Error('This does not look like the daily packaging report: no "Issue" row on the first sheet.');
  const heads = aoa[issueRow - 1] || [], cols = [];
  for (let c = 1; c < heads.length; c++) {
    const h = String(heads[c] || '').trim();
    if (!h) continue;
    if (/\(ctns\)/i.test(h) || /machine output/i.test(h)) break;
    cols.push({ c, product: h.replace(/\s*\(.*$/, '').trim() || h });
  }
  const out = [];
  for (let r = issueRow + 1; r < aoa.length; r++) {
    const row = aoa[r] || [], date = rpDay(row[0]);
    if (!date) continue;
    for (const { c, product } of cols) {
      if (RP_LIVE.test(product)) continue;
      const action = String(row[c + 1] || '').trim();
      rpParseCell(row[c]).forEach(x => out.push({ date, product, machine: x.machine, asset: rpMachine(x.machine), text: x.text, minutes: x.minutes,
        action: /^issues?$|^action$/i.test(action) ? '' : action, raw: x.raw, pick: true, status: '' }));
    }
  }
  return out;
}
async function rpFile(file){
  RP.error = ''; RP.rows = null; RP.file = file ? file.name : ''; RP.busy = true; render();
  try {
    const XLSX = await loadSheetJS();
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const aoa = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
    RP.rows = rpParseSheet(aoa);
    if (!RP.rows.length) throw new Error('No issues found on the first sheet (Zaiki and Mintacid are left out: the floor app covers them).');
    await rpCheck();
  } catch (e) { RP.error = e.message; RP.rows = RP.rows && RP.rows.length ? RP.rows : null; }
  finally { RP.busy = false; render(); }
}
const rpLine = x => ({ date: x.date, asset: x.asset, product: x.product, text: x.text, minutes: String(x.minutes), action: x.action, raw: x.raw });
// ask the server which lines are new and which were added before (nothing is stored)
async function rpCheck(){
  const ready = RP.rows.filter(x => x.asset);
  for (let i = 0; i < ready.length; i += 400) {
    const part = ready.slice(i, i + 400), r = await api('/webhook/engineering/api/jobs/report', { method:'POST', body:{ report:{ dry: true, lines: part.map(rpLine) } } });
    (r.lines || []).forEach(l => { const x = part[l.n - 1]; x.status = l.status; x.error = l.error || ''; x.job_id = l.job_id || ''; if (l.status === 'exists') x.pick = false; });
  }
}
function rpShown(){ return (RP.rows || []).filter(x => !RP.from || x.date >= RP.from); }
function viewReport(){
  if (!EQ.list && !EQ.loading) eqLoad();
  const back = `<a class="btn btn-ghost btn-sm" href="#/jobs?tab=reports">${I.chevL} Calls and jobs</a>`;
  if (levelOf('engineering.jobs') !== 'edit') return { title:'Daily report issues', crumb:'Maintenance', html: back + `<div class="card" style="margin-top:12px"><div class="card-b">${emptyState('alert', 'Only the Engineering Manager adds issues from the daily report', '')}</div></div>` };
  const rows = rpShown(), toAdd = rows.filter(x => x.pick && x.asset && x.status !== 'exists' && x.status !== 'error');
  const opts = cur => `<option value="">Choose the machine...</option>` + (EQ.list || []).filter(a => a.status === 'Active' && ['Machine', 'Line', 'Utility'].includes(a.type)).sort((a, b) => a.name.localeCompare(b.name))
    .map(a => `<option value="${esc(a.code)}" ${a.code === cur ? 'selected' : ''}>${esc(a.name)}</option>`).join('');
  const st = x => x.status === 'exists' ? `<span class="badge b-slate">Added before${x.job_id ? ' · ' + esc(x.job_id) : ''}</span>` : x.status === 'added' ? `<span class="badge b-ok">Added · ${esc(x.job_id)}</span>`
    : !x.asset ? '<span class="badge b-warn">Choose the machine</span>' : x.status === 'error' ? `<span class="badge b-danger">${esc(x.error)}</span>` : '<span class="badge b-info">New</span>';
  const o = RP.one;
  return { title:'Daily report issues', crumb:'Maintenance', keepScroll: true,
    html: back + pageHead('Issues from the daily packaging report', 'For products the floor app does not cover yet (all but Zaiki and Mintacid). Each issue becomes a breakdown that technicians fill in: what failed and what was done. Upload the month\'s file as often as you like: issues already added are skipped.') + `
    <div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>From the Excel file</h3><div class="sub">"OKL PERSONNEL PACKAGING - &lt;MONTH&gt;.xlsx", first sheet (Daily downtime tracker).</div></div></div>
      <div class="card-b"><div class="row" style="gap:10px;flex-wrap:wrap;align-items:center"><input type="file" id="rpFile" accept=".xlsx,.xls" class="inp" style="width:auto">
        ${RP.busy ? '<span class="small muted">Reading...</span>' : ''}${RP.file && !RP.busy ? `<span class="small muted">${esc(RP.file)}</span>` : ''}</div>
        ${RP.error ? `<div class="notice warn" style="margin-top:10px">${I.alert}<div>${esc(RP.error)}</div></div>` : ''}</div>
      ${RP.rows ? `<div class="card-b filter-bar row" style="gap:10px;flex-wrap:wrap;border-top:1px solid var(--line-2);align-items:center">
          <label class="small">From <input class="inp" type="date" id="rpFrom" value="${esc(RP.from)}" style="width:auto"></label>
          <label class="small row" style="gap:6px"><input type="checkbox" id="rpClose" ${RP.close ? 'checked' : ''}> Close them as they are (technicians do not fill them in)</label>
          <span style="flex:1"></span><span class="small">${rows.length} issues in the file${RP.from ? ' from ' + esc(RP.from) : ''}, <b>${toAdd.length}</b> to add</span></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:36px"></th><th>Date</th><th>Product</th><th>Machine</th><th>Issue</th><th style="text-align:right">Minutes</th><th>Status</th></tr></thead>
          <tbody>${rows.map(x => { const i = RP.rows.indexOf(x); return `<tr><td><input type="checkbox" data-rp-pick="${i}" ${x.pick && x.status !== 'exists' && x.status !== 'added' ? 'checked' : ''} ${x.status === 'exists' || x.status === 'added' ? 'disabled' : ''} aria-label="Add this issue"></td>
            <td data-label="Date" class="small mono">${esc(x.date)}</td><td data-label="Product" class="small">${esc(x.product)}</td>
            <td data-label="Machine"><select class="inp" data-rp-asset="${i}" style="min-width:170px" ${x.status === 'exists' || x.status === 'added' ? 'disabled' : ''}>${opts(x.asset)}</select>${x.machine ? `<div class="tiny muted">"${esc(x.machine)}"</div>` : ''}</td>
            <td data-label="Issue" class="small">${esc(x.text)}${x.action ? `<div class="tiny muted">Action: ${esc(x.action)}</div>` : ''}</td><td data-label="Minutes" style="text-align:right" class="mono">${x.minutes}</td><td data-label="Status">${st(x)}</td></tr>`; }).join('')
            || '<tr><td colspan="7" class="muted" style="padding:16px">No issues in this period.</td></tr>'}</tbody></table></div>
        <div class="card-b row between" style="border-top:1px solid var(--line-2);gap:10px;flex-wrap:wrap"><span class="err-msg hide" data-err="rpAdd"></span><span style="flex:1"></span>
          <button class="btn btn-primary" id="rpAdd" ${toAdd.length ? '' : 'disabled'}>${I.plus} Add ${toAdd.length} issue${toAdd.length === 1 ? '' : 's'}</button></div>` : ''}
    </div>
    <div class="card"><div class="card-h"><div><h3>Add one issue by hand</h3><div class="sub">When the file is not to hand.</div></div></div><div class="card-b"><div class="grid g3">
      <div class="field"><label for="rp1Date">Date</label><input class="inp" type="date" id="rp1Date" max="${todayIso()}" value="${esc(o.date || todayIso())}"></div>
      <div class="field"><label for="rp1Asset">Machine</label><select class="inp" id="rp1Asset">${opts(o.asset)}</select></div>
      <div class="field"><label for="rp1Product">Product (optional)</label><input class="inp" id="rp1Product" maxlength="60" value="${esc(o.product)}" placeholder="e.g. Procold"></div>
      <div class="field" style="grid-column:1/-1"><label for="rp1Text">What happened?</label><input class="inp" id="rp1Text" maxlength="300" value="${esc(o.text)}" placeholder="e.g. Feeding track adjustment"></div>
      <div class="field"><label for="rp1Min">Minutes lost</label><input class="inp" type="number" min="0" max="1440" step="1" id="rp1Min" value="${esc(o.minutes)}"></div>
      <div class="field" style="grid-column:span 2"><label for="rp1Action">Action taken, if known (optional)</label><input class="inp" id="rp1Action" maxlength="500" value="${esc(o.action)}"></div></div>
      <div class="row" style="gap:10px"><span class="err-msg hide" data-err="rp1"></span><span style="flex:1"></span><button class="btn btn-primary" id="rp1Add">${I.plus} Add the issue</button></div></div></div>`,
    bind(){
      const f = $('#rpFile'); if (f) f.onchange = () => { if (f.files && f.files[0]) rpFile(f.files[0]); };
      const fr = $('#rpFrom'); if (fr) fr.onchange = e => { RP.from = e.target.value; render(); };
      const cl = $('#rpClose'); if (cl) cl.onchange = e => { RP.close = e.target.checked; };
      $$('[data-rp-pick]').forEach(c => c.onchange = () => { RP.rows[+c.dataset.rpPick].pick = c.checked; render(); });
      $$('[data-rp-asset]').forEach(s => s.onchange = async () => { const x = RP.rows[+s.dataset.rpAsset]; x.asset = s.value; x.status = ''; if (x.machine && x.asset) rpRemember(x.machine, x.asset);
        if (x.asset) { RP.rows.filter(y => !y.asset && rpNorm(y.machine) === rpNorm(x.machine) && x.machine).forEach(y => { y.asset = x.asset; }); try { await rpCheck(); } catch (e) { /* checked again on adding */ } } render(); });
      const add = $('#rpAdd'); if (add) add.onclick = async () => {
        clearErrors(document);
        const lines = rpShown().filter(x => x.pick && x.asset && x.status !== 'exists' && x.status !== 'error' && x.status !== 'added');
        if (!lines.length) return;
        if (!await confirmDialog('Add the issues', `Add <b>${lines.length}</b> issue${lines.length === 1 ? '' : 's'} as breakdowns${RP.close ? ', closed as they are' : ' for technicians to fill in'}?`, 'Add')) return;
        add.disabled = true;
        try {
          let added = 0;
          for (let i = 0; i < lines.length; i += 400) {
            const part = lines.slice(i, i + 400), r = await api('/webhook/engineering/api/jobs/report', { method:'POST', body:{ report:{ close: RP.close, lines: part.map(rpLine) } } });
            (r.lines || []).forEach(l => { const x = part[l.n - 1]; x.status = l.status; x.job_id = l.job_id || ''; });
            added += r.added || 0;
          }
          toast(added + ' issue' + (added === 1 ? '' : 's') + ' added', RP.close ? '' : 'Technicians see them under From the daily report.', 'ok', 6000); JB.board = null; render();
        } catch (e) { setErr('rpAdd', e.message); add.disabled = false; }
      };
      const keep = () => Object.assign(RP.one, { date: $('#rp1Date').value, asset: $('#rp1Asset').value, product: $('#rp1Product').value, text: $('#rp1Text').value, minutes: $('#rp1Min').value, action: $('#rp1Action').value });
      ['#rp1Date', '#rp1Asset', '#rp1Product', '#rp1Text', '#rp1Min', '#rp1Action'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', keep); if (el) el.addEventListener('change', keep); });
      $('#rp1Add').onclick = async () => {
        keep(); clearErrors(document);
        const x = RP.one;
        if (!x.date || !x.asset) return setErr('rp1', 'Give the date and the machine.');
        if (x.text.trim().length < 3) return setErr('rp1', 'Say what happened.');
        if (!/^\d{1,4}$/.test(String(x.minutes).trim()) || +x.minutes > 1440) return setErr('rp1', 'Give the minutes lost (0 to 1440).');
        $('#rp1Add').disabled = true;
        try { const r = await api('/webhook/engineering/api/jobs/report', { method:'POST', body:{ report:{ lines: [{ date: x.date, asset: x.asset, product: x.product.trim(), text: x.text.trim(), minutes: String(x.minutes).trim(), action: x.action.trim() }] } } });
              if (r.added) { toast('Issue added', (r.lines[0] || {}).job_id || '', 'ok'); RP.one = { date: x.date, asset: '', product: x.product, text: '', minutes: '', action: '' }; JB.board = null; }
              else toast('Already added', 'The same issue is there already for that day and machine.', 'ok');
              render(); }
        catch (e) { setErr('rp1', e.message); $('#rp1Add').disabled = false; }
      };
    } };
}

/* ---- history */
async function jbLoadHistory(){
  try { const q = new URLSearchParams(); if (JB.histFrom) q.set('from', JB.histFrom); if (JB.histTo) q.set('to', JB.histTo); if (JB.histType) q.set('type', JB.histType);
        const r = await api('/webhook/engineering/api/jobs/history?' + q.toString()); JB.history = r.jobs || []; }
  catch (err) { JB.history = { error: err.message }; }
  render();
}
function jbHistShown(){ return (Array.isArray(JB.history) ? JB.history : []).filter(j => fltMatch(JB.hf, j.asset)); }
function viewJobsHistory(){
  if (!JB.board && !JB.loading) jbLoad();
  if (!EQ.list && !EQ.loading) eqLoad();
  JB.hf = JB.hf || { type: '', area: '', asset: '' };
  if (!JB.history) { JB.history = 'loading'; jbLoadHistory(); }
  const h = JB.history, head = pageHead('Calls and jobs', 'Every job, newest first (the last 30 days unless you pick dates).', Array.isArray(h) ? dlButton('jbHistoryDownload()') : '') + jbTabs('history')
    + `<div class="row" style="gap:8px;margin-bottom:12px;flex-wrap:wrap"><label class="small">From <input class="inp" type="date" id="jhFrom" value="${esc(JB.histFrom)}" style="width:auto"></label>
       <label class="small">to <input class="inp" type="date" id="jhTo" value="${esc(JB.histTo)}" style="width:auto"></label>
       <select class="inp" id="jhType" style="width:auto"><option value="">All job types</option>${JOB_TYPES.map(([k, l]) => `<option value="${k}" ${JB.histType === k ? 'selected' : ''}>${l}</option>`).join('')}</select>${fltHtml(JB.hf, 'jf')}</div>`;
  const bind = () => { [['#jhFrom', 'histFrom'], ['#jhTo', 'histTo'], ['#jhType', 'histType']].forEach(([id, k]) => { const el = $(id); if (el) el.onchange = e => { JB[k] = e.target.value; JB.history = null; render(); }; }); fltBind(JB.hf, 'jf', render); };
  if (h === 'loading') return { title:'Calls and jobs', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>`, bind };
  if (h.error) return { title:'Calls and jobs', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(h.error))}</div></div>`, bind };
  return { title:'Calls and jobs', crumb:'Maintenance', keepScroll: true, bind,
    html: head + `<div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Job</th><th>Equipment</th><th>Type</th><th>What failed / what was done</th><th>Technicians</th><th>Time</th><th>Status</th></tr></thead>
      <tbody>${jbHistShown().map(j => `<tr class="clickable" onclick="go('/jobs/${esc(j.job_id)}')"><td class="mono small" data-label="Job">${esc(j.job_id)}<div class="tiny muted">${esc(dayHm(j.finished_at || j.created_at))}</div></td>
        <td data-label="Equipment"><div class="strong">${esc(j.machine_name || '')}</div><div class="tiny muted">${esc(j.stop_reason || '')}</div></td><td data-label="Type">${esc(JOB_TYPE[j.type] || j.type)}</td>
        <td data-label="Work" class="small">${j.failure_category ? `<b>${esc(j.failure_category)}</b>: ` : ''}${esc(j.work_done || j.cancel_reason || '')}</td>
        <td data-label="Technicians" class="small">${esc((j.technicians || []).map(t => t.name).join(', '))}</td><td data-label="Time" class="mono small">${j.labour_minutes != null ? dur(j.labour_minutes) : ''}</td>
        <td data-label="Status">${jbBadge(j)}</td></tr>`).join('') || `<tr><td colspan="7" class="muted" style="padding:16px">No jobs in this period.</td></tr>`}</tbody></table></div>
      <div class="small muted" style="padding:12px 18px">${jbHistShown().length} of ${h.length} jobs. Mirrored to the Maintenance Google Sheet (Breakdowns tab).</div></div>` };
}

function jbHistoryDownload(){
  downloadXlsx('Jobs' + (JB.histFrom ? ' from ' + JB.histFrom : '') + (JB.histTo ? ' to ' + JB.histTo : ''), [{ name: 'Jobs',
    head: ['Job', 'Type', 'Status', 'Equipment', 'Stop reason', 'Called', 'Accepted', 'Arrived', 'Started', 'Finished', 'What failed', 'Cause', 'What was done', 'Technicians', 'Labour (min)', 'Parts'],
    rows: jbHistShown().map(j => [j.job_id, JOB_TYPE[j.type] || j.type, j.status, j.machine_name || j.asset_name || j.asset, j.stop_reason,
      lagosDay(j.called_at), lagosDay(j.accepted_at), lagosDay(j.arrived_at), lagosDay(j.started_at), lagosDay(j.finished_at), j.failure_category, j.cause, j.work_done || j.cancel_reason,
      (j.technicians || []).map(t => t.name).join(', '), j.labour_minutes, (j.parts || []).filter(p => p.status !== 'cancelled').map(p => p.sku + ' x ' + num(p.qty)).join(', ')]) }]);
}

/* ---- Recent machine stops: floor stops with a machine reason that nobody called in (read from the floor system) */
async function jbLoadStops(){
  JB.stopsLoading = true;
  try { const r = await api('/webhook/engineering/api/stops'); JB.stops = r.stops || []; JB.stopsInfo = r; }
  catch (err) { JB.stops = { error: err.message }; }
  finally { JB.stopsLoading = false; render(); }
}
function viewStops(){
  if (!JB.stops && !JB.stopsLoading) jbLoadStops();
  const info = JB.stopsInfo || {}, canStart = ['submit', 'edit'].includes(levelOf('engineering.jobs'));
  const head = pageHead('Machine stops', `Stops on the floor with a machine reason, ${num(info.min_minutes) || 15} minutes or longer, in the last ${num(info.days) || 7} days, that no call or job covers yet. Short stops and operational reasons (breaks, changeovers, material) are left out. The limits are in Settings.`,
    `<button class="btn btn-ghost" onclick="JB.stops = null; render()">Refresh</button>` + (Array.isArray(JB.stops) ? dlButton('jbStopsDownload()') : ''));
  const s = JB.stops;
  if (!s) return { title:'Machine stops', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
  if (s.error) return { title:'Machine stops', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load the stops', esc(s.error))}</div></div>` };
  return { title:'Machine stops', crumb:'Maintenance', keepScroll: true,
    html: head + `<div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Machine</th><th>Reason</th><th>Stopped</th><th>Length</th><th>Operator's note</th><th></th></tr></thead>
      <tbody>${s.map(x => `<tr><td data-label="Machine"><div class="strong">${esc(x.machine_name)}</div><div class="tiny muted">${esc(x.stage || '')}${x.asset ? '' : ' · not in the register'}</div></td>
        <td data-label="Reason">${esc(x.reason)}</td><td data-label="Stopped" class="small">${esc(dayHm(x.started_at))}</td>
        <td data-label="Length">${x.still_down ? `<span class="badge b-danger">still down · ${dur(x.minutes)}</span>` : `<span class="mono">${dur(x.minutes)}</span>`}</td>
        <td data-label="Note" class="small">${esc(x.note || '')}</td>
        <td style="text-align:right">${canStart && x.asset ? `<button class="btn btn-primary btn-sm" onclick="go('/stops/${x.id}/job')">Open a job</button>` : ''}</td></tr>`).join('')
        || `<tr><td colspan="6" class="muted" style="padding:16px">No machine stops to look at. Calls from the floor are on Calls and jobs.</td></tr>`}</tbody></table></div>
      <div class="small muted" style="padding:12px 18px">${s.length} stop${s.length === 1 ? '' : 's'}.</div></div>` };
}
route('/stops', viewStops);
function jbStopsDownload(){
  downloadXlsx('Machine stops', [{ name: 'Machine stops', head: ['Machine', 'Stage', 'Reason', 'Stopped', 'Ended', 'Minutes', 'Still down', "Operator's note", 'In the register'],
    rows: (Array.isArray(JB.stops) ? JB.stops : []).map(x => [x.machine_name, x.stage, x.reason, lagosDay(x.started_at), lagosDay(x.ended_at), x.minutes, x.still_down ? 'yes' : '', x.note, x.asset ? 'yes' : 'no']) }]);
}

/* ---- messages with the floor system (Engineering Manager): delivery problems show here */
let FM = null;
async function fmLoad(){ try { FM = await api('/webhook/engineering/api/floor/messages'); } catch (err) { FM = { error: err.message }; } render(); }
function viewFloorMessages(){
  if (!FM) { FM = 'loading'; fmLoad(); }
  const head = pageHead('Floor messages', 'What the floor system sent us and what we send it (accepted, arrived, status, job closed). Undelivered messages are retried: 1 min, 5 min, 30 min, 2 h, 6 h, then daily for 7 days.',
    `<button class="btn btn-ghost" onclick="FM = null; render()">Refresh</button>`);
  if (FM === 'loading') return { title:'Floor messages', crumb:'Setup', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
  if (FM.error) return { title:'Floor messages', crumb:'Setup', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(FM.error))}</div></div>` };
  const c = FM.configured || {}, yes = ok => ok ? '<span class="badge b-ok">set</span>' : '<span class="badge b-warn">not set</span>';
  const st = m => m.direction === 'in' ? (m.result === 'ok' ? '<span class="badge b-ok">applied</span>' : `<span class="badge b-slate">${esc(m.result)}</span>`)
    : ({ sent: '<span class="badge b-ok">delivered</span>', pending: '<span class="badge b-warn">waiting</span>', failed: '<span class="badge b-danger">failed</span>', gave_up: '<span class="badge b-danger">gave up</span>' }[m.state] || esc(m.state));
  return { title:'Floor messages', crumb:'Setup', keepScroll: true,
    html: head + `<div class="grid g4" style="margin-bottom:14px">
      <div class="stat"><div class="lbl">Receiving calls</div><div class="meta" style="margin-top:8px">${yes(c.receive)}</div></div>
      <div class="stat"><div class="lbl">Sending to the floor</div><div class="meta" style="margin-top:8px">${yes(c.send)}</div></div>
      <div class="stat"><div class="lbl">Push notifications</div><div class="meta" style="margin-top:8px">${yes(c.push)}</div></div>
      <div class="stat"><div class="lbl">Not delivered</div><div class="val">${num(FM.failed)}</div><div class="meta">${num(FM.waiting)} waiting</div></div></div>
    <div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>When</th><th>Way</th><th>Message</th><th>Call / job</th><th>Status</th><th></th></tr></thead>
      <tbody>${(FM.messages || []).map(m => `<tr><td class="small" data-label="When">${esc(dayHm(m.created_at))}</td><td data-label="Way">${m.direction === 'in' ? 'from the floor' : 'to the floor'}</td>
        <td data-label="Message"><span class="mono small">${esc(m.event_type)}</span>${m.body && m.body.status ? ` <span class="small">${esc(m.body.status)}</span>` : ''}</td>
        <td data-label="Call / job" class="small"><a href="#/jobs/${esc(m.job_id || '')}">${esc(m.job_id || '')}</a><div class="tiny muted">${esc(m.call_id || '')}</div></td>
        <td data-label="Status">${st(m)}${m.error || m.last_error ? `<div class="tiny muted">${esc(m.error || ((m.last_code ? m.last_code + ' ' : '') + m.last_error))}</div>` : ''}${m.direction === 'out' && m.attempts ? `<div class="tiny muted">${m.attempts} tries</div>` : ''}</td>
        <td style="text-align:right">${m.direction === 'out' && (m.state === 'failed' || m.state === 'gave_up') ? `<button class="btn btn-ghost btn-sm" onclick="fmRetry(${m.id})">Send again</button>` : ''}</td></tr>`).join('')
        || `<tr><td colspan="6" class="muted" style="padding:16px">No messages in the last 7 days.</td></tr>`}</tbody></table></div></div>` };
}
route('/floor', viewFloorMessages);
async function fmRetry(id){ try { await api('/webhook/engineering/api/floor/retry', { method:'POST', body:{ id } }); toast('Queued again', '', 'ok'); FM = null; render(); } catch (e) { toast('Could not', e.message, 'err'); } }

/* ---- push notifications: a service worker shows a notification for each new call (payloadless push; the worker fetches the text) */
function pushSupported(){ return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
function isIosBrowser(){ return /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window.navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)); }
async function pushCheck(){
  if (JB.push.checked) return;
  JB.push.checked = true;
  if (!pushSupported()) { JB.push.state = isIosBrowser() ? 'ios' : 'unsupported'; render(); return; }
  if (Notification.permission === 'denied') { JB.push.state = 'denied'; render(); return; }
  try {
    const reg = await navigator.serviceWorker.register('sw.js');
    const sub = await reg.pushManager.getSubscription();
    const st = await api('/webhook/engineering/api/push');
    if (!st.public_key) { JB.push.state = 'server'; render(); return; }
    JB.push.publicKey = st.public_key;
    JB.push.state = sub && Notification.permission === 'granted' ? 'on' : 'off';
    if (sub && Notification.permission === 'granted') await pushRegister(sub);     // keep the server's copy linked to this person
  } catch (e) { JB.push.state = 'unsupported'; }
  render();
}
function b64urlToBytes(s){ const pad = '='.repeat((4 - s.length % 4) % 4), raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(raw, c => c.charCodeAt(0)); }
async function pushRegister(sub){
  const r = await api('/webhook/engineering/api/push/subscribe', { method:'POST', body:{ endpoint: sub.endpoint, device: (navigator.userAgent.match(/\(([^)]+)\)/) || [, 'browser'])[1].slice(0, 120) } });
  try { const c = await caches.open('okl-push'); await c.put('key', new Response(r.key)); } catch (e) { /* the worker then shows a plain notice */ }
}
async function pushTurnOn(){
  try {
    if (await Notification.requestPermission() !== 'granted') { JB.push.state = 'denied'; render(); return; }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64urlToBytes(JB.push.publicKey) });
    await pushRegister(sub);
    JB.push.state = 'on'; toast('Notifications on', 'You will get one for each new call.', 'ok'); render();
  } catch (e) { toast('Could not turn notifications on', e.message, 'err', 7000); }
}


/* ============================================================
   Preventive maintenance (migrations 020, 023): two tabs. PM due = every maintained item (not rooms, buildings, lines
   or vehicles) on its own interval or the default one. PM effectiveness = how long each PM held (worked out, never typed):
   a PM is a preventive job, or any other job (not a breakdown) done on a Saturday or Sunday; the run ends at the first
   breakdown, or the first floor machine stop of pm_failure_minutes or more. GET /webhook/engineering/api/pm.
   A PM is recorded here (/pm/record) and opens here (/pm/jobs/<id>).
   ============================================================ */
let PM = { data: null, from: '', to: '', q: '', state: '', f: { type: '', area: '', asset: '' } };
async function pmLoad(){
  try { const q = new URLSearchParams(); if (PM.from) q.set('from', PM.from); if (PM.to) q.set('to', PM.to); PM.data = await api('/webhook/engineering/api/pm?' + q.toString()); }
  catch (err) { PM.data = { error: err.message }; }
  render();
}
function pmDueFiltered(){
  const q = PM.q.trim().toLowerCase();
  return ((PM.data || {}).due || []).filter(x => fltMatch(PM.f, x.asset) && (!PM.state || x.state === PM.state)
    && (!q || [x.asset, x.name, x.area, x.type].join(' ').toLowerCase().includes(q)));
}
function pmEffFiltered(){ return ((PM.data || {}).effectiveness || []).filter(x => fltMatch(PM.f, x.asset)); }
function viewPm(tab){
  if (!PM.data) { PM.data = 'loading'; pmLoad(); }
  if (!EQ.list && !EQ.loading) eqLoad();
  const canStart = ['submit', 'edit'].includes(levelOf('engineering.jobs')), mgr = levelOf('engineering.jobs') === 'edit';
  const d = PM.data, ready = d && d !== 'loading' && !d.error;
  const head = pageHead('Preventive maintenance', tab === 'due' ? 'What is due on every piece of equipment that is maintained. Set an interval per item in Equipment; the rest use the default.'
      : 'How long each PM held before the equipment broke down again.',
    (ready ? dlButton(`pmDownload('${tab}')`) : '') + (mgr ? `<button class="btn btn-ghost" onclick="go('/pm/backfill')">Record past PMs</button>` : '')
    + (canStart ? `<button class="btn btn-primary" onclick="go('/pm/record')">${I.plus} Record a PM</button>` : ''))
    + `<div class="tabs" style="margin-bottom:14px"><a class="tab ${tab === 'due' ? 'on' : ''}" href="#/pm">PM due</a><a class="tab ${tab === 'eff' ? 'on' : ''}" href="#/pm/effectiveness">PM effectiveness</a></div>`;
  if (d === 'loading') return { title:'Preventive maintenance', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
  if (d.error) return { title:'Preventive maintenance', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(d.error))}</div></div>` };
  const due = d.due || [], eff = pmEffFiltered();
  if (tab === 'eff') {
    const scored = eff.filter(x => x.effectiveness != null), avg = scored.length ? Math.round(scored.reduce((s, x) => s + +x.effectiveness, 0) / scored.length) : null;
    const effBadge = s => s === 'Failed early' ? '<span class="badge b-danger">Failed early</span>' : s === 'Running' ? '<span class="badge b-info">Running</span>' : '<span class="badge b-ok">Held to the next PM</span>';
    return { title:'Preventive maintenance', crumb:'Maintenance', keepScroll: true,
      html: head + `<div class="grid g4" style="margin-bottom:14px">
        <div class="stat"><div class="lbl">PM effectiveness</div><div class="val">${avg == null ? '--' : avg + '%'}</div><div class="meta">${scored.length} finished PM runs</div></div>
        <div class="stat"><div class="lbl">PMs in the period</div><div class="val">${eff.length}</div></div>
        <div class="stat"><div class="lbl">Failed early</div><div class="val">${eff.filter(x => x.status === 'Failed early').length}</div></div>
        <div class="stat"><div class="lbl">Still running</div><div class="val">${eff.filter(x => x.status === 'Running').length}</div></div></div>
      <div class="row filter-bar" style="gap:8px;margin-bottom:12px;flex-wrap:wrap"><label class="small">From <input class="inp" type="date" id="pmFrom" value="${esc(PM.from)}" style="width:auto"></label>
        <label class="small">to <input class="inp" type="date" id="pmTo" value="${esc(PM.to)}" style="width:auto"></label>${fltHtml(PM.f, 'pe')}<span class="small muted">Default: the last 6 months.</span></div>
      <div class="card"><div class="card-h"><div><div class="sub">Target = days to the next PM date. Achieved = days until the first breakdown or a machine stop of ${num(d.failure_minutes)} min or more.</div></div></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>PM</th><th>Equipment</th><th>PM date</th><th>Next PM</th><th style="text-align:right">Target</th><th>First failure</th><th style="text-align:right">Achieved</th><th style="text-align:right">%</th><th>Status</th></tr></thead>
        <tbody>${eff.map(x => `<tr class="clickable" onclick="go('/pm/jobs/${esc(x.job_id)}')"><td class="mono small" data-label="PM">${esc(x.job_id)}${x.weekend && x.type !== 'preventive' ? `<div class="tiny muted">weekend ${esc(x.type)}</div>` : ''}</td>
          <td data-label="Equipment">${esc(x.asset_name)}${x.backfilled ? '<div class="tiny muted">from old records</div>' : ''}</td><td data-label="PM date" class="small">${esc(x.pm_date)}</td><td data-label="Next PM" class="small">${esc(x.next_pm_date)}</td>
          <td data-label="Target" style="text-align:right">${x.target_days} d</td><td data-label="First failure" class="small">${x.failure_date ? esc(x.failure_date) + `<div class="tiny muted">${esc(x.failure_ref || '')}${x.failure_minutes != null ? ', ' + x.failure_minutes + ' min' : ''}</div>` : '--'}</td>
          <td data-label="Achieved" style="text-align:right">${x.achieved_days} d</td><td data-label="%" style="text-align:right" class="strong">${x.effectiveness == null ? '--' : x.effectiveness + '%'}</td><td data-label="Status">${effBadge(x.status)}</td></tr>`).join('')
          || `<tr><td colspan="9" class="muted" style="padding:16px">No PM recorded in this period.</td></tr>`}</tbody></table></div></div>`,
      bind(){ [['#pmFrom', 'from'], ['#pmTo', 'to']].forEach(([id, k]) => { const el = $(id); if (el) el.onchange = e => { PM[k] = e.target.value; PM.data = null; render(); }; }); fltBind(PM.f, 'pe', render); } };
  }
  const n = k => due.filter(x => x.state === k).length, rows = pmDueFiltered();
  const opt = (v, cur, l) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(l)}</option>`;
  return { title:'Preventive maintenance', crumb:'Maintenance', keepScroll: true,
    html: head + `<div class="grid g4" style="margin-bottom:14px">
      <div class="stat link ${n('overdue') ? 'acc-danger' : ''}" onclick="pmSet('state', 'overdue')"><div class="lbl">Overdue</div><div class="val">${n('overdue')}</div></div>
      <div class="stat link" onclick="pmSet('state', 'due')"><div class="lbl">Due this week</div><div class="val">${n('due')}</div></div>
      <div class="stat link" onclick="pmSet('state', 'ok')"><div class="lbl">On schedule</div><div class="val">${n('ok')}</div></div>
      <div class="stat link" onclick="pmSet('state', 'no_record')"><div class="lbl">No PM recorded yet</div><div class="val">${n('no_record')}</div><div class="meta">of ${due.length} items</div></div></div>
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px"><div class="row" style="gap:10px;flex-wrap:wrap">
        <div class="search filter-search"><span class="ic">${I.search}</span><input class="inp" id="pmQ" style="padding-left:34px;border-radius:20px" placeholder="Search equipment or area" value="${esc(PM.q)}"></div>
        ${fltHtml(PM.f, 'pd')}
        <select class="inp" id="pmState" style="width:auto">${opt('', PM.state, 'Any status')}${Object.entries(PM_STATE_TEXT).map(([k, l]) => opt(k, PM.state, l)).join('')}</select>
      </div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Equipment</th><th>Type</th><th>Area</th><th style="text-align:right">Every</th><th>Last PM</th><th>Next due</th><th>Status</th><th>Parts for the next PM</th><th></th></tr></thead>
      <tbody>${rows.map(x => `<tr><td data-label="Equipment"><a class="strong" href="#/equipment/${esc(x.asset)}">${esc(x.name)}</a><div class="tiny muted mono">${esc(x.asset)}</div></td><td data-label="Type" class="small">${esc(x.type || '')}</td>
        <td data-label="Area" class="small">${esc(x.area || '')}</td><td data-label="Every" style="text-align:right">${x.interval_days} d</td><td data-label="Last PM" class="small">${esc(x.last_pm || '--')}</td><td data-label="Next due" class="small">${esc(x.due_date || '--')}</td>
        <td data-label="Status">${PM_STATE[x.state] || ''}${x.checklist_items ? '' : '<div class="tiny muted">no checklist</div>'}</td>
        <td data-label="Parts" class="small">${(x.parts || []).map(p => `<div>${esc((p.sku ? p.sku + ' ' : '') + p.name)} x ${num(p.qty)}${p.sku && +p.stock < +p.qty ? ' <span class="badge b-danger">short</span>' : ''}</div>`).join('') || '<span class="muted">--</span>'}</td>
        <td style="text-align:right">${canStart ? `<button class="btn btn-ghost btn-sm" onclick="go('/pm/record?asset=${encodeURIComponent(x.asset)}')">Record PM</button>` : ''}</td></tr>`).join('')
        || `<tr><td colspan="9" class="muted" style="padding:16px">Nothing matches.</td></tr>`}</tbody></table></div>
      <div class="small muted" style="padding:12px 18px">${rows.length} of ${due.length} shown. Default interval ${num(d.default_interval)} days (Settings). Parts come from the <a href="#/equipment/parts">PM parts plan</a>.</div></div>`,
    bind(){
      const q = $('#pmQ'); if (q) q.addEventListener('input', debounce(e => { PM.q = e.target.value; render(); const el = $('#pmQ'); if (el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 200));
      [['#pmState', 'state']].forEach(([id, k]) => { const el = $(id); if (el) el.onchange = e => pmSet(k, e.target.value); });
      fltBind(PM.f, 'pd', render);
    },
  };
}
route('/pm', () => viewPm('due'));
route('/pm/effectiveness', () => viewPm('eff'));
function pmSet(k, v){ PM[k] = (k === 'state' && PM.state === v) ? '' : v; render(); }
function pmDownload(tab){
  const d = PM.data || {};
  if (tab === 'eff') return downloadXlsx('PM effectiveness', [{ name: 'PM effectiveness', head: ['PM', 'Equipment code', 'Equipment', 'PM date', 'Next PM date', 'Target days', 'First failure', 'Failure', 'Failure minutes', 'Achieved days', 'Effectiveness %', 'Status'],
    rows: pmEffFiltered().map(x => [x.job_id, x.asset, x.asset_name, x.pm_date, x.next_pm_date, x.target_days, x.failure_date, x.failure_ref, x.failure_minutes, x.achieved_days, x.effectiveness, x.status]) }]);
  downloadXlsx('PM due', [{ name: 'PM due', head: ['Code', 'Equipment', 'Type', 'Area', 'Every (days)', 'Last PM', 'Next due', 'Status', 'Checklist items', 'Parts for the next PM'],
    rows: pmDueFiltered().map(x => [x.asset, x.name, x.type, x.area, x.interval_days, x.last_pm, x.due_date, PM_STATE_TEXT[x.state] || x.state, x.checklist_items,
      (x.parts || []).map(p => (p.sku ? p.sku + ' ' : '') + p.name + ' x ' + num(p.qty)).join('; ')]) }]);
}

/* ============================================================
   Corrective and preventive actions (migration 020): the register, and what the data suggests.
   /actions (the list and the suggestions), /actions/new, /actions/<CA-0001> (one action on its own page, so it can be
   linked from a message). GET /webhook/engineering/api/actions; POST /actions/save, /actions/dismiss.
   ============================================================ */
let AC = { data: null, filter: 'open', preset: null, f: { type: '', area: '', asset: '' } };
const AC_STATUS = { open: ['Open', 'b-warn'], in_progress: ['In progress', 'b-info'], done: ['Done, to check', 'b-brand'], verified: ['Effective', 'b-ok'],
                    not_effective: ['Not effective', 'b-danger'], cancelled: ['Cancelled', 'b-slate'] };
async function acLoad(){ try { AC.data = await api('/webhook/engineering/api/actions'); } catch (err) { AC.data = { error: err.message }; } render(); if (!EQ.list && !EQ.loading) eqLoad(); }
function acBadge(a){ const s = AC_STATUS[a.status] || [a.status, '']; return `<span class="badge ${s[1]}">${esc(s[0])}</span>${a.overdue ? ' <span class="badge b-danger">Overdue</span>' : ''}`; }
const acOpenNow = a => ['open', 'in_progress', 'done'].includes(a.status);
function acList(){ return ((AC.data || {}).actions || []).filter(a => (AC.filter === 'all' || (AC.filter === 'open' ? acOpenNow(a) : !acOpenNow(a))) && fltMatch(AC.f, a.asset)); }
function viewActions(){
  if (!AC.data) { AC.data = 'loading'; acLoad(); }
  const can = ['submit', 'edit'].includes(levelOf('engineering.actions')), d = AC.data, ready = d && d !== 'loading' && !d.error;
  const head = pageHead('Corrective and preventive actions', 'Root causes and the actions that stop a problem coming back. The system suggests one for a long stop or a repeated one; raise it or say why not.',
    (ready ? dlButton('acDownload()') : '') + (can ? `<button class="btn btn-primary" onclick="AC.preset = null; go('/actions/new')">${I.plus} New action</button>` : ''));
  if (d === 'loading') return { title:'Actions', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
  if (d.error) return { title:'Actions', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(d.error))}</div></div>` };
  const s = d.settings || {}, sug = d.suggestions || [], list = acList();
  return { title:'Actions', crumb:'Maintenance', keepScroll: true,
    html: head + `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>Suggested (${sug.length})</h3>
        <div class="sub">A machine stop or breakdown of ${num(s.long)} min or more, or the same machine stopping for the same reason ${num(s.repeat)} times within ${num(s.days)} days (last 30 days; limits in Settings).</div></div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Why</th><th>Rule</th><th></th></tr></thead><tbody>
      ${sug.map((x, i) => `<tr><td data-label="Why"><div class="strong">${esc(x.why)}</div>${x.job_ids.length ? `<div class="tiny muted">${x.job_ids.map(esc).join(', ')}</div>` : ''}</td>
        <td data-label="Rule">${x.rule === 'repeat' ? '<span class="badge b-warn">Repeats</span>' : '<span class="badge b-danger">Long stop</span>'}</td>
        <td style="text-align:right">${can ? `<div class="row" style="gap:6px;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="acRaise(${i})">Raise an action</button><button class="btn btn-ghost btn-sm" onclick="acDismiss(${i})">No action needed</button></div>` : ''}</td></tr>`).join('')
        || `<tr><td colspan="3" class="muted" style="padding:16px">Nothing suggested.</td></tr>`}</tbody></table></div></div>
    <div class="row filter-bar" style="gap:8px;margin-bottom:10px;flex-wrap:wrap">${[['open', 'Open'], ['closed', 'Closed'], ['all', 'All']].map(([k, l]) => `<button class="chip ${AC.filter === k ? 'on' : ''}" onclick="AC.filter='${k}'; render()">${l}</button>`).join('')}${fltHtml(AC.f, 'acf')}</div>
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Action</th><th>Equipment</th><th>Title</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
      <tbody>${list.map(a => `<tr class="clickable" onclick="go('/actions/${esc(a.action_no)}')"><td class="mono small" data-label="Action">${esc(a.action_no)}<div class="tiny muted">${a.kind === 'corrective' ? 'Corrective' : 'Preventive'}</div></td>
        <td data-label="Equipment">${esc(a.asset_name || a.asset)}</td><td data-label="Title"><div class="strong">${esc(a.title)}</div>${a.trigger ? `<div class="tiny muted">${esc(a.trigger)}</div>` : ''}</td>
        <td data-label="Owner" class="small">${esc(a.owner_name || '')}</td><td data-label="Due" class="small">${esc(a.due_date)}</td><td data-label="Status">${acBadge(a)}</td></tr>`).join('')
        || `<tr><td colspan="6" class="muted" style="padding:16px">No actions here.</td></tr>`}</tbody></table></div>
      <div class="small muted" style="padding:12px 18px">Mirrored to the Maintenance Google Sheet (Actions tab).</div></div>`,
    bind(){ fltBind(AC.f, 'acf', render); } };
}
route('/actions', viewActions);
function acDownload(){
  downloadXlsx('Actions', [{ name: 'Actions', head: ['Action', 'Type', 'Status', 'Equipment code', 'Equipment', 'Title', 'What happened', 'Root cause', 'Action to take', 'Owner', 'Due', 'Overdue', 'Raised by', 'Raised', 'Done', 'What was done', 'Checked by', 'Check note', 'Linked jobs', 'Trigger'],
    rows: acList().map(a => [a.action_no, a.kind === 'corrective' ? 'Corrective' : 'Preventive', (AC_STATUS[a.status] || [a.status])[0], a.asset, a.asset_name, a.title, a.problem, a.root_cause, a.action_to_take,
      a.owner_name, a.due_date, a.overdue ? 'yes' : '', a.created_by, lagosDay(a.created_at), lagosDay(a.done_at), a.done_note, a.checked_by, a.check_note, (a.job_ids || []).join(', '), a.trigger]) }]);
}
// a suggestion opens a new action, filled in
function acRaise(i){ const x = AC.data.suggestions[i]; AC.preset = { kind: 'corrective', asset: x.asset, title: (x.machine_name + ': ' + x.reason).slice(0, 160), problem: x.why,
  suggestion_key: x.key, trigger: x.why, job_ids: x.job_ids, stop_ids: x.stop_ids }; go('/actions/new'); }
function acDismiss(i){
  const x = AC.data.suggestions[i];
  openModal({ title:'No action needed', size:'narrow', sub: x.why,
    body:`<div class="field"><label for="adWhy">Why not?</label><input class="inp" id="adWhy" maxlength="300" placeholder="e.g. one-off: foreign object in the feeder"></div><div class="err-msg hide" data-err="adWhy"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Back</button><button class="btn btn-primary" data-save>Dismiss</button>`,
    onMount: (w, close) => { $('[data-save]', w).onclick = async () => {
      clearErrors(w); const reason = $('#adWhy', w).value.trim(); if (reason.length < 5) return setErr('adWhy', 'Say why.', w);
      try { await api('/webhook/engineering/api/actions/dismiss', { method:'POST', body:{ key: x.key, reason } }); close(); toast('Dismissed', '', 'ok'); AC.data = null; render(); }
      catch (e) { setErr('adWhy', e.message, w); } }; } });
}
// kept for older links and buttons: an action by id, or a new one (with an optional preset)
function acOpen(id, preset){
  const a = id ? ((AC.data || {}).actions || []).find(x => x.id === id) : null;
  if (a) return go('/actions/' + a.action_no);
  AC.preset = preset || null; go('/actions/new');
}
function viewAction(no){
  if (!AC.data) { AC.data = 'loading'; acLoad(); }
  const back = `<a class="btn btn-ghost btn-sm" href="#/actions">${I.chevL} Corrective and preventive actions</a>`;
  const d = AC.data;
  if (d === 'loading') return { title:'Action', crumb:'Maintenance', html: back + `<div class="card" style="margin-top:12px"><div class="card-b small muted">Loading...</div></div>` };
  if (d.error) return { title:'Action', crumb:'Maintenance', html: back + `<div class="card" style="margin-top:12px"><div class="card-b">${emptyState('alert', 'Could not load', esc(d.error))}</div></div>` };
  const found = no ? (d.actions || []).find(x => x.action_no === String(no).toUpperCase()) : null;
  if (no && !found) return { title:'Action', crumb:'Maintenance', html: back + `<div class="card" style="margin-top:12px"><div class="card-b">${emptyState('alert', 'No such action', 'It may have been typed wrong.')}</div></div>` };
  const id = found ? found.id : null;
  const a = found || Object.assign({ kind: 'corrective', status: 'open', job_ids: [], stop_ids: [] }, AC.preset || {});
  const lvl = levelOf('engineering.actions'), can = ['submit', 'edit'].includes(lvl), mgr = lvl === 'edit';
  const closed = ['verified', 'not_effective', 'cancelled'].includes(a.status), dis = can && (!closed || mgr) ? '' : 'disabled';
  const people = d.people || [];
  const assetVal = a.asset ? ((eqByCode(a.asset) || {}).name || a.asset_name || a.asset) + ' (' + a.asset + ')' : '';
  const nextStatus = !id ? [] : a.status === 'open' ? [['in_progress', 'Started']] : [];
  const sub = id ? 'Raised by ' + (a.created_by || '') + (a.created_at ? ', ' + dayHm(a.created_at) : '') + (a.trigger ? ' · ' + a.trigger : '')
    : (a.trigger || 'Corrective: removes the cause of a problem that happened. Preventive: stops one that could happen.');
  return { title: id ? a.action_no : 'New action', crumb:'Maintenance', keepScroll: true,
    html: `<div class="row between" style="margin-bottom:12px">${back}${id ? acBadge(a) : ''}</div>`
    + pageHead(id ? a.action_no + ': ' + a.title : 'New action', esc(sub)) + `
    <form novalidate id="acForm"><div class="card" style="margin-bottom:14px"><div class="card-b"><div class="grid g2">
      <div class="field"><label for="acKind">Type</label><select class="inp" id="acKind" ${dis || (id ? 'disabled' : '')}><option value="corrective" ${a.kind === 'corrective' ? 'selected' : ''}>Corrective</option><option value="preventive" ${a.kind === 'preventive' ? 'selected' : ''}>Preventive</option></select></div>
      <div class="field"><label for="acAsset">Machine or equipment</label><input class="inp" id="acAsset" list="acAssets" value="${esc(assetVal)}" ${dis}><datalist id="acAssets">${spAssetOptions()}</datalist></div>
      <div class="field" style="grid-column:1/-1"><label for="acTitle">Title</label><input class="inp" id="acTitle" maxlength="160" value="${esc(a.title || '')}" ${dis}></div>
      <div class="field" style="grid-column:1/-1"><label for="acProblem">What happened (or could happen)</label><textarea class="inp" id="acProblem" rows="2" maxlength="2000" ${dis}>${esc(a.problem || '')}</textarea></div>
      <div class="field" style="grid-column:1/-1"><label for="acCause">Root cause</label><textarea class="inp" id="acCause" rows="2" maxlength="2000" ${dis} placeholder="Why did it really happen? (ask why until the answer is something you can fix)">${esc(a.root_cause || '')}</textarea></div>
      <div class="field" style="grid-column:1/-1"><label for="acTodo">Action to take</label><textarea class="inp" id="acTodo" rows="2" maxlength="2000" ${dis}>${esc(a.action_to_take || '')}</textarea></div>
      <div class="field"><label for="acOwner">Owner</label><select class="inp" id="acOwner" ${dis}><option value="">Choose...</option>${people.map(p => `<option value="${esc(p.enroll_id)}" ${p.enroll_id === a.owner ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="acDue">Due date</label><input class="inp" type="date" id="acDue" value="${esc(a.due_date || '')}" ${dis}></div>
    </div>
    ${a.asset ? `<div class="small" style="margin-bottom:6px"><a href="#/equipment/${esc(a.asset)}">See everything about ${esc((eqByCode(a.asset) || {}).name || a.asset_name || a.asset)}</a></div>` : ''}
    ${(a.job_ids || []).length ? `<div class="small" style="margin-bottom:10px"><b>Linked jobs:</b> ${a.job_ids.map(j => `<a href="#/jobs/${esc(j)}">${esc(j)}</a>`).join(', ')}</div>` : ''}
    ${a.done_note ? `<div class="small" style="margin-bottom:6px"><b>Done:</b> ${esc(a.done_note)}</div>` : ''}${a.check_note ? `<div class="small" style="margin-bottom:6px"><b>Checked by ${esc(a.checked_by || '')}:</b> ${esc(a.check_note)}</div>` : ''}
    ${id && can && ['open', 'in_progress'].includes(a.status) ? `<div class="field"><label for="acDoneNote">When done: what was done?</label><input class="inp" id="acDoneNote" maxlength="1000"></div>` : ''}
    ${id && mgr && !closed ? `<div class="field"><label for="acCheck">${a.status === 'done' ? 'Did it work? How did you check?' : 'Why cancel it? (only to cancel)'}</label><input class="inp" id="acCheck" maxlength="1000" placeholder="${a.status === 'done' ? 'e.g. no stop for this reason in 4 weeks' : ''}"></div>` : ''}
    <div class="err-msg hide" data-err="acTitle"></div></div></div></form>
    <div class="row job-actions" style="gap:10px;flex-wrap:wrap">
      ${can && !id ? `<button class="btn btn-primary" data-act="open">${I.check} Raise</button>` : ''}
      ${can && id && !closed ? `<button class="btn btn-ghost" data-act="">Save</button>` : ''}
      ${can && id ? nextStatus.map(([k, l]) => `<button class="btn btn-ghost" data-act="${k}">${l}</button>`).join('') : ''}
      ${can && id && ['open', 'in_progress'].includes(a.status) ? `<button class="btn btn-primary" data-act="done">Mark done</button>` : ''}
      ${mgr && id && a.status === 'done' ? `<button class="btn btn-danger" data-act="not_effective">Not effective</button><button class="btn btn-primary" data-act="verified">Effective</button>` : ''}
      ${mgr && id && !closed ? `<button class="btn btn-ghost" style="margin-left:auto" data-act="cancelled">Cancel action</button>` : ''}</div>`,
    bind(){ $$('[data-act]').forEach(b => b.onclick = async () => {
      clearErrors(document);
      const act = b.dataset.act;
      const body = { id: id || '', kind: $('#acKind').value, asset: spAssetFrom($('#acAsset').value), title: $('#acTitle').value.trim(), problem: $('#acProblem').value.trim(),
        root_cause: $('#acCause').value.trim(), action_to_take: $('#acTodo').value.trim(), owner: $('#acOwner').value, due_date: $('#acDue').value,
        suggestion_key: a.suggestion_key || '', trigger: a.trigger || '', job_ids: a.job_ids || [], stop_ids: a.stop_ids || [] };
      if (act) body.status = act;
      if (act === 'done') body.done_note = ($('#acDoneNote') || {}).value || '';
      if (['verified', 'not_effective', 'cancelled'].includes(act)) body.check_note = ($('#acCheck') || {}).value || '';
      if (body.title.length < 3) return setErr('acTitle', 'Give the action a short title.');
      b.disabled = true;
      try { const r = await api('/webhook/engineering/api/actions/save', { method:'POST', body:{ action: body } });
            toast('Saved', body.title, 'ok'); AC.data = null; AC.preset = null; AP = {};
            go(r.action && r.action.action_no ? '/actions/' + r.action.action_no : '/actions'); }
      catch (e) { setErr('acTitle', e.message); b.disabled = false; }
    }); },
  };
}
route('/actions/new', () => viewAction(null));
route('/actions/:no', params => viewAction(params.no));

/* ============================================================
   Overview (migration 023): the manager's KPIs for a date range, on four tabs. GET /webhook/engineering/api/overview?from&to
     Reliability  failures, MTTR, MTBF, machine downtime, equipment ranked by downtime
     Response     calls, response and wait times, open jobs
     Preventive   PM on schedule, PMs done, PM effectiveness, planned work share
     Follow-up    corrective and preventive actions, the store
   A failure = a breakdown job, or a floor stop with a machine reason of pm_failure_minutes or more that no job covers.
   ============================================================ */
let OV = { data: null, preset: '30', from: '', to: '', f: { type: '', area: '', asset: '' } };
const OV_PRESETS = [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['month', 'This month'], ['lastmonth', 'Last month'], ['custom', 'Pick dates']];
const OV_TABS = [['reliability', 'Reliability', '/overview'], ['response', 'Response', '/overview/response'], ['preventive', 'Preventive', '/overview/preventive'], ['followup', 'Follow-up', '/overview/followup']];
function ovRange(){
  const t = todayIso(), back = n => { const d = new Date(t + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
  if (OV.preset === 'custom') return { from: OV.from || back(29), to: OV.to || t };
  if (OV.preset === 'month') return { from: t.slice(0, 8) + '01', to: t };
  if (OV.preset === 'lastmonth') { const d = new Date(t.slice(0, 8) + '01T12:00:00Z'); d.setUTCDate(0); const end = d.toISOString().slice(0, 10); return { from: end.slice(0, 8) + '01', to: end }; }
  return { from: back((+OV.preset || 30) - 1), to: t };
}
async function ovLoad(){
  const r = ovRange();
  const f = ['type', 'area', 'asset'].filter(k => OV.f[k]).map(k => '&' + k + '=' + encodeURIComponent(OV.f[k])).join('');
  try { OV.data = await api('/webhook/engineering/api/overview?from=' + r.from + '&to=' + r.to + f); } catch (err) { OV.data = { error: err.message }; }
  render();
}
function ovSet(k, v){ OV[k] = v; if (k === 'preset' && v === 'custom') { const r = ovRange(); OV.from = r.from; OV.to = r.to; } OV.data = null; render(); }
const ovPct = (a, b) => b ? Math.round(100 * a / b) + '%' : '--';
const ovStat = (lbl, val, meta, link, kind) => `<div class="stat ${link ? 'link' : ''} ${kind ? 'acc-' + kind : ''}" ${link ? `onclick="go('${link}')"` : ''}><div class="lbl">${esc(lbl)}</div><div class="val">${val == null ? '--' : val}</div>${meta ? `<div class="meta">${meta}</div>` : ''}</div>`;
function viewOverview(tab){
  if (!EQ.list && !EQ.loading) eqLoad();
  if (!OV.data) { OV.data = 'loading'; ovLoad(); }
  const d = OV.data, r = ovRange();
  const filters = `<div class="row filter-bar" style="gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:flex-end">
      <div class="field" style="margin:0"><label for="ovPreset">Period</label><select class="inp" id="ovPreset" style="width:auto">${OV_PRESETS.map(([k, l]) => `<option value="${k}" ${OV.preset === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field" style="margin:0"><label for="ovFrom">From</label><input class="inp" type="date" id="ovFrom" value="${esc(r.from)}" max="${todayIso()}" style="width:auto" ${OV.preset === 'custom' ? '' : 'disabled'}></div>
      <div class="field" style="margin:0"><label for="ovTo">To</label><input class="inp" type="date" id="ovTo" value="${esc(r.to)}" max="${todayIso()}" style="width:auto" ${OV.preset === 'custom' ? '' : 'disabled'}></div>
      <div class="field" style="margin:0"><span class="lbl">Equipment</span><div class="row" style="gap:8px;flex-wrap:wrap">${fltHtml(OV.f, 'ov')}${fltOn(OV.f) ? `<button class="btn btn-ghost btn-sm" onclick="OV.f = { type: '', area: '', asset: '' }; OV.data = null; render()">Clear</button>` : ''}</div></div></div>
      ${fltOn(OV.f) ? '<div class="tiny muted" style="margin:-4px 0 10px">Filtered to the equipment chosen. The store figures (Follow-up) are for the whole store.</div>' : ''}`;
  const head = pageHead('Overview', 'Maintenance at a glance for the period you pick.', d && d !== 'loading' && !d.error ? dlButton('ovDownload()') : '') + filters
    + `<div class="tabs" style="margin-bottom:14px">${OV_TABS.map(([k, l, h]) => `<a class="tab ${k === tab ? 'on' : ''}" href="#${h}">${l}</a>`).join('')}</div>`;
  const bind = () => {
    const p = $('#ovPreset'); if (p) p.onchange = e => ovSet('preset', e.target.value);
    fltBind(OV.f, 'ov', () => { OV.data = null; render(); });
    [['#ovFrom', 'from'], ['#ovTo', 'to']].forEach(([id, k]) => { const el = $(id); if (el) el.onchange = e => { if (e.target.value) ovSet(k, e.target.value); }; });
  };
  if (d === 'loading') return { title:'Overview', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>`, bind };
  if (d.error) return { title:'Overview', crumb:'Maintenance', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(d.error))}</div></div>`, bind };
  const warn = d.floor_messages_failed ? `<div class="notice warn" style="margin-bottom:14px">${I.alert}<div>${d.floor_messages_failed} message(s) to the floor system could not be delivered. <a href="#/floor">See the floor messages</a>.</div></div>` : '';
  const html = { reliability: ovReliability, response: ovResponse, preventive: ovPreventive, followup: ovFollowup }[tab](d);
  return { title:'Overview', crumb:'Maintenance', keepScroll: true, html: head + warn + html, bind };
}
function ovReliability(d){
  const x = d.reliability || {};
  return `<div class="grid g4" style="margin-bottom:14px">
      ${ovStat('Failures', num(x.failures) || 0, 'breakdowns, and machine stops of ' + num(d.failure_minutes) + ' min or more')}
      ${ovStat('MTTR', dur(x.mttr_min), 'mean time to repair: failure to running again')}
      ${ovStat('MTBF', x.mtbf_days == null ? '--' : num(x.mtbf_days) + ' days', 'mean time between failures on the same equipment')}
      ${ovStat('Machine downtime', dur(x.downtime_min), 'floor ' + dur(x.floor_downtime_min) + ' (' + num(x.stops) + ' stops), daily report ' + dur(x.report_downtime_min) + ' (' + num(x.report_issues) + ' issues)', '/stops')}</div>
    <div class="card"><div class="card-h"><div><h3>Equipment</h3><div class="sub">Most downtime first. Open one to see its history.</div></div></div><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Equipment</th><th style="text-align:right">Failures</th><th style="text-align:right">Downtime</th><th style="text-align:right">Stops / issues</th><th style="text-align:right">MTTR</th><th style="text-align:right">MTBF</th><th>Last failure</th></tr></thead>
      <tbody>${(x.equipment || []).map(m => `<tr class="clickable" onclick="go('/equipment/${esc(m.asset)}')"><td data-label="Equipment"><div class="strong">${esc(m.name)}</div><div class="tiny muted">${esc(m.type || '')}</div></td>
        <td data-label="Failures" style="text-align:right">${m.failures}</td><td data-label="Downtime" style="text-align:right">${dur(m.downtime_min)}</td><td data-label="Stops / issues" style="text-align:right">${m.stops + (m.report_issues || 0)}</td>
        <td data-label="MTTR" style="text-align:right">${dur(m.mttr_min)}</td><td data-label="MTBF" style="text-align:right">${m.mtbf_days == null ? '--' : num(m.mtbf_days) + ' d'}</td>
        <td data-label="Last failure" class="small">${esc(dayHm(m.last_failure))}</td></tr>`).join('') || '<tr><td colspan="7" class="muted" style="padding:16px">No failures or machine stops in this period.</td></tr>'}</tbody></table></div></div>`;
}
function ovResponse(d){
  const x = d.response || {};
  return `<div class="grid g4" style="margin-bottom:14px">
      ${ovStat('Calls from the floor', num(x.calls) || 0, (x.not_accepted_now || 0) + ' not accepted right now', '/jobs', x.not_accepted_now ? 'warn' : '')}
      ${ovStat('Response time', dur(x.response_min), 'called to accepted, average')}
      ${ovStat('Wait for maintenance', dur(x.wait_min), 'called to technician at the machine, average')}
      ${ovStat('Open jobs', num(x.open_now) || 0, (x.open_over_day || 0) + ' open over 24 h, ' + (x.waiting_part || 0) + ' waiting for a part; ' + (x.to_report || 0) + ' report issues to fill in', '/jobs?tab=open', x.open_over_day ? 'warn' : '')}</div>
    <div class="card"><div class="card-h"><div><h3>Open jobs</h3><div class="sub">Oldest first.</div></div></div><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Job</th><th>Equipment</th><th>Type</th><th>Since</th><th>Status</th></tr></thead>
      <tbody>${(x.open_jobs || []).map(j => `<tr class="clickable" onclick="go('/jobs/${esc(j.job_id)}')"><td class="mono small" data-label="Job">${esc(j.job_id)}</td>
        <td data-label="Equipment" class="strong">${esc(j.machine_name || j.asset_name || j.asset || '')}</td><td data-label="Type">${esc(JOB_TYPE[j.type] || j.type)}</td>
        <td data-label="Since" class="small">${esc(dayHm(j.called_at || j.started_at || j.created_at))}</td><td data-label="Status">${jbBadge(j)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted" style="padding:16px">No open jobs.</td></tr>'}</tbody></table></div></div>`;
}
function ovPreventive(d){
  const x = d.preventive || {};
  return `<div class="grid g4" style="margin-bottom:14px">
      ${ovStat('PM on schedule', ovPct(x.on_schedule, x.tracked), (x.on_schedule || 0) + ' of ' + (x.tracked || 0) + ' items; ' + (x.no_record || 0) + ' with no PM yet', '/pm')}
      ${ovStat('PM overdue', num(x.overdue) || 0, (x.due_week || 0) + ' due this week', '/pm', x.overdue ? 'danger' : '')}
      ${ovStat('PM effectiveness', x.effectiveness == null ? '--' : x.effectiveness + '%', (x.done || 0) + ' PMs in the period', '/pm/effectiveness')}
      ${ovStat('Planned work', x.planned_pct == null ? '--' : x.planned_pct + '%', 'of labour hours: everything but breakdowns')}</div>
    ${x.checks_not_done ? `<div class="notice warn" style="margin-bottom:14px">${I.alert}<div>${x.checks_not_done} PM checklist item${x.checks_not_done === 1 ? ' was' : 's were'} not done in this period, ${x.checks_no_material || 0} for want of material.</div></div>` : ''}
    <div class="grid g2">
      <div class="card"><div class="card-h"><h3>Labour by type of job</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Type</th><th style="text-align:right">Jobs</th><th style="text-align:right">Hours</th></tr></thead>
        <tbody>${(x.hours || []).map(t => `<tr><td>${esc(JOB_TYPE[t.type] || t.type)}</td><td style="text-align:right">${t.jobs}</td><td style="text-align:right">${num(t.hours)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted" style="padding:16px">No jobs in this period.</td></tr>'}</tbody></table></div></div>
      <div class="card"><div class="card-h"><h3>PM to do</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Equipment</th><th>Next due</th><th>Status</th></tr></thead>
        <tbody>${(x.attention || []).map(p => `<tr class="clickable" onclick="go('/equipment/${esc(p.asset)}')"><td data-label="Equipment" class="strong">${esc(p.name)}</td><td data-label="Next due" class="small">${esc(p.due_date || '')}</td><td data-label="Status">${PM_STATE[p.state] || ''}</td></tr>`).join('')
          || '<tr><td colspan="3" class="muted" style="padding:16px">Nothing overdue or due this week.</td></tr>'}</tbody></table></div></div></div>`;
}
function ovFollowup(d){
  const x = d.followup || {}, cw = x.count_week || {};
  return `<h3 style="margin:4px 0 10px">Corrective and preventive actions</h3><div class="grid g4" style="margin-bottom:16px">
      ${ovStat('Actions open', num(x.actions_open) || 0, (x.actions_to_check || 0) + ' done, waiting to be checked', '/actions')}
      ${ovStat('Actions overdue', num(x.actions_overdue) || 0, 'past their due date', '/actions', x.actions_overdue ? 'danger' : '')}
      ${ovStat('Proved effective', ovPct(x.effective, (x.effective || 0) + (x.not_effective || 0)), (x.effective || 0) + ' effective, ' + (x.not_effective || 0) + ' not, checked in the period')}
      ${ovStat('Suggested actions', num(x.suggestions) || 0, 'long or repeated stops to look at', '/actions', x.suggestions ? 'warn' : '')}</div>
    <h3 style="margin:4px 0 10px">Store</h3><div class="grid g4" style="margin-bottom:16px">
      ${ovStat('Out of stock', num(x.out_of_stock) || 0, (x.reorder || 0) + ' more at or below the reorder level', '/spares')}
      ${ovStat('Hand-overs waiting', num(x.handovers_waiting) || 0, 'parts recorded on jobs, not confirmed', '/spares/handovers', x.handovers_waiting ? 'warn' : '')}
      ${ovStat('Weekly count', (cw.done || 0) + ' of ' + (cw.items || 0), 'this week', '/spares/counts')}
      ${ovStat('Actions raised', num(x.actions_raised) || 0, 'in the period')}</div>
    <div class="card"><div class="card-h"><h3>Overdue actions</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Action</th><th>Equipment</th><th>Title</th><th>Owner</th><th>Due</th></tr></thead>
      <tbody>${(x.overdue_actions || []).map(a => `<tr class="clickable" onclick="go('/actions/${esc(a.action_no)}')"><td class="mono small" data-label="Action">${esc(a.action_no)}</td><td data-label="Equipment">${esc(a.asset_name || a.asset || '')}</td>
        <td data-label="Title" class="strong">${esc(a.title)}</td><td data-label="Owner" class="small">${esc(a.owner_name || '')}</td><td data-label="Due" class="small">${esc(a.due_date)}</td></tr>`).join('')
        || '<tr><td colspan="5" class="muted" style="padding:16px">No overdue actions.</td></tr>'}</tbody></table></div></div>`;
}
route('/overview', () => viewOverview('reliability'));
route('/overview/response', () => viewOverview('response'));
route('/overview/preventive', () => viewOverview('preventive'));
route('/overview/followup', () => viewOverview('followup'));
function ovDownload(){
  const d = OV.data || {}, rl = d.reliability || {}, rs = d.response || {}, pv = d.preventive || {}, fu = d.followup || {}, cw = fu.count_week || {};
  const fl = d.filter || {};
  const summary = [['Period', d.from + ' to ' + d.to], ['Equipment', [fl.type, fl.area, fl.asset].filter(Boolean).join(', ') || 'all'],
    ['Failures', rl.failures], ['MTTR (min)', rl.mttr_min], ['MTBF (days)', rl.mtbf_days], ['Machine downtime (min)', rl.downtime_min], ['Of which on the floor (min)', rl.floor_downtime_min], ['Of which in the daily report (min)', rl.report_downtime_min], ['Daily report issues', rl.report_issues], ['Machine stops on the floor', rl.stops],
    ['Calls from the floor', rs.calls], ['Response time (min)', rs.response_min], ['Wait for maintenance (min)', rs.wait_min], ['Open jobs now', rs.open_now], ['Open over 24 h', rs.open_over_day], ['Waiting for a part', rs.waiting_part],
    ['PM items tracked', pv.tracked], ['PM on schedule', pv.on_schedule], ['PM overdue', pv.overdue], ['PM due this week', pv.due_week], ['No PM recorded', pv.no_record], ['PMs in the period', pv.done],
    ['PM effectiveness %', pv.effectiveness], ['Planned work % of hours', pv.planned_pct],
    ['Actions open', fu.actions_open], ['Actions overdue', fu.actions_overdue], ['Actions to check', fu.actions_to_check], ['Actions effective', fu.effective], ['Actions not effective', fu.not_effective],
    ['Suggested actions', fu.suggestions], ['Out of stock', fu.out_of_stock], ['At or below reorder', fu.reorder], ['Hand-overs waiting', fu.handovers_waiting], ['Weekly count done', (cw.done || 0) + ' of ' + (cw.items || 0)]];
  downloadXlsx('Engineering overview ' + d.from + ' to ' + d.to, [
    { name: 'Summary', head: ['KPI', 'Value'], rows: summary },
    { name: 'Equipment', head: ['Code', 'Equipment', 'Type', 'Failures', 'Downtime (min)', 'Floor stops', 'MTTR (min)', 'MTBF (days)', 'Last failure'],
      rows: (rl.equipment || []).map(m => [m.asset, m.name, m.type, m.failures, m.downtime_min, m.stops, m.mttr_min, m.mtbf_days, lagosDay(m.last_failure)]) },
    { name: 'Failures', head: ['When', 'Code', 'Equipment', 'What', 'Minutes down'], rows: (rl.failure_list || []).map(f => [lagosDay(f.at), f.asset, f.name, f.kind === 'job' ? f.ref + ' breakdown' : f.ref, f.minutes]) },
    { name: 'Open jobs', head: ['Job', 'Equipment', 'Type', 'Status', 'Since'], rows: (rs.open_jobs || []).map(j => [j.job_id, j.machine_name || j.asset_name || j.asset, JOB_TYPE[j.type] || j.type, j.status, lagosDay(j.called_at || j.started_at || j.created_at)]) },
    { name: 'Labour by type', head: ['Type', 'Jobs', 'Hours'], rows: (pv.hours || []).map(t => [JOB_TYPE[t.type] || t.type, t.jobs, +t.hours]) },
    { name: 'Overdue actions', head: ['Action', 'Equipment', 'Title', 'Owner', 'Due'], rows: (fu.overdue_actions || []).map(a => [a.action_no, a.asset_name || a.asset, a.title, a.owner_name, a.due_date]) },
  ]);
}

/* ============================================================
   Outdoor units (migration 021): the monthly check, one month at a time. Filled in through the form link (WhatsApp
   reminder from the 25th); people with submit access can open the form from here. GET /webhook/engineering/api/outdoor/month.
   ============================================================ */
let OD = { month: '', data: null };
async function odLoad(){ try { OD.data = await api('/webhook/engineering/api/outdoor/month' + (OD.month ? '?month=' + OD.month : '')); } catch (err) { OD.data = { error: err.message }; } render(); }
function odShift(n){ const base = OD.data && OD.data.month ? OD.data.month : new Date().toISOString().slice(0, 7) + '-01'; const t = new Date(base + 'T12:00:00Z'); t.setUTCMonth(t.getUTCMonth() + n); OD.month = t.toISOString().slice(0, 7); OD.data = null; render(); }
async function odForm(){
  try { const r = await api('/webhook/engineering/api/outdoor/link', { method:'POST', body:{} }); window.open(API_BASE + '/webhook/engineering/outdoor?t=' + encodeURIComponent(r.token), '_blank'); }
  catch (e) { toast('Could not open the form', e.message, 'err'); }
}
function viewOutdoor(){
  if (!OD.data) { OD.data = 'loading'; odLoad(); }
  const canFill = ['submit', 'edit'].includes(levelOf('engineering.outdoor'));
  const head = pageHead('Outdoor units', 'The monthly check of every outdoor unit, due from the 25th to the end of the month. Superheat (T1 - Evap) should be 8-12 °C, subcooling (Cond - T2) 5-10 °C.',
    (OD.data && OD.data !== 'loading' && !OD.data.error ? dlButton('odDownload()') : '') + (canFill ? `<button class="btn btn-primary" onclick="odForm()">${I.externalLink} Open this month's form</button>` : ''));
  const d = OD.data;
  if (d === 'loading') return { title:'Outdoor units', crumb:'Logs', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
  if (d.error) return { title:'Outdoor units', crumb:'Logs', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(d.error))}</div></div>` };
  const badge = s => s === 'OK' ? '<span class="badge b-ok">OK</span>' : s === 'Out of standard' ? '<span class="badge b-danger">Out of standard</span>' : s === 'Not running' ? '<span class="badge b-slate">Not running</span>' : s ? `<span class="badge">${esc(s)}</span>` : '<span class="badge b-warn">Not checked</span>';
  const cell = (v, lo, hi) => v == null ? '' : `<span class="${+v < lo || +v > hi ? 'strong' : ''}" style="${+v < lo || +v > hi ? 'color:var(--danger)' : ''}">${num(v)}</span>`;
  return { title:'Outdoor units', crumb:'Logs', keepScroll: true,
    html: head + `<div class="row between" style="margin-bottom:12px"><div class="eng-nav"><button class="btn btn-ghost btn-sm" onclick="odShift(-1)">${I.chevL}</button><span class="lbl">${esc(d.label)}</span><button class="btn btn-ghost btn-sm" onclick="odShift(1)">${I.chevR}</button></div>
      <div class="small">${d.logged} of ${d.total} units checked · ${d.out} out of standard · due ${esc(d.window_from)} to ${esc(d.window_to)}</div></div>
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Unit</th><th style="text-align:right">Amps</th><th style="text-align:right">Low psi</th><th style="text-align:right">High psi</th>
      <th style="text-align:right">Superheat</th><th style="text-align:right">Subcooling</th><th>Checked</th><th>Status</th></tr></thead>
      <tbody>${(d.units || []).map(u => `<tr><td data-label="Unit"><div class="strong">${esc(u.name)}</div>${u.note ? `<div class="tiny muted">${esc(u.note)}</div>` : ''}</td>
        <td data-label="Amps" style="text-align:right">${num(u.amps)}</td><td data-label="Low psi" style="text-align:right">${num(u.low_psi)}</td><td data-label="High psi" style="text-align:right">${num(u.high_psi)}</td>
        <td data-label="Superheat" style="text-align:right">${cell(u.superheat, 8, 12)}${u.t1 != null ? `<div class="tiny muted">${num(u.t1)} - ${num(u.evap)}</div>` : ''}</td>
        <td data-label="Subcooling" style="text-align:right">${cell(u.subcooling, 5, 10)}${u.t2 != null ? `<div class="tiny muted">${num(u.cond)} - ${num(u.t2)}</div>` : ''}</td>
        <td data-label="Checked" class="small">${u.checked_on ? esc(u.checked_on) + `<div class="tiny muted">${esc(u.checked_by || '')}${u.timing && u.timing !== 'On time' ? ' · ' + esc(u.timing) : ''}</div>` : ''}</td>
        <td data-label="Status">${badge(u.status)}</td></tr>`).join('')}</tbody></table></div>
      <div class="small muted" style="padding:12px 18px">Mirrored to the Maintenance Google Sheet (Outdoor Units tab).</div></div>` };
}
route('/outdoor', viewOutdoor);
function odDownload(){
  const d = OD.data || {};
  downloadXlsx('Outdoor units ' + String(d.month || '').slice(0, 7), [{ name: 'Outdoor units', head: ['Unit', 'Code', 'Running', 'Amps', 'Low psi', 'High psi', 'T1', 'Evap', 'Superheat', 'T2', 'Cond', 'Subcooling', 'Checked on', 'Checked by', 'Timing', 'Status', 'Note'],
    rows: (d.units || []).map(u => [u.name, u.code, u.logged ? (u.running ? 'yes' : 'no') : '', u.amps, u.low_psi, u.high_psi, u.t1, u.evap, u.superheat, u.t2, u.cond, u.subcooling, u.checked_on, u.checked_by, u.timing, u.status || 'Not checked', u.note]) }]);
}
