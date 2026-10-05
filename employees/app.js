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
    home: w('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'),
    award: w('<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>'),
  };
})();

/* ---------------- Utilities (ported from QSync's app.js) ---------------- */
const $  = (s, r) => (r||document).querySelector(s);
const $$ = (s, r) => Array.from((r||document).querySelectorAll(s));
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms||220); }; }
function properName(v){
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().toLowerCase()
    .replace(/(^|[\s\-.(])([a-z\u00e0-\u00ff])/g, (m, a, b) => a + b.toUpperCase());
}
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
async function exportEmployeesCSV(){
  const token = getToken();
  const res = await fetch(API_BASE + '/webhook/employees/api/export', {
    headers: token ? { Authorization: token } : {},
  });
  if (res.status === 401){ toLanding(); throw new Error('Your session has expired. Please log in again.'); }
  if (!res.ok) throw new Error('Could not export employees right now.');
  const text = await res.text();
  download('okl_employees.csv', text, 'text/csv;charset=utf-8');
}

/* ---------------- State store ---------------- */
let S = null; // { me: {id,name,role,permission}, employees: [...] }

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
    { title:'Overview', items:[ { path:'/dashboard', label:'Dashboard', icon:'home' } ] },
    { title:'People', items:[
      { path:'/employees', label:'Employees', icon:'users' },
      { path:'/training', label:'Training & Competencies', icon:'award' },
    ] },
    { title:'Attendance', items:[
      { path:'/overtime/submit', label:'Overtime Submission', icon:'plus' },
      { path:'/overtime/records', label:'Overtime', icon:'layers' },
      { path:'/attendance', label:'Attendance', icon:'activity' },
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
        <div style="font-size:13px;font-weight:700;color:#fff;letter-spacing:.02em">Human Resource</div>
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
          <span style="display:flex;align-items:center;gap:8px"><img src="../logo.png" alt="Orange Kalbe Limited" style="height:30px;width:auto;display:block">
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
  if (auth.user && auth.user.must_change){ toLandingKeepToken(); throw new Error('Password change required'); }
  const [data, dep] = await Promise.all([
    api('/webhook/employees/api/list'),
    api('/webhook/employees/api/departments').catch(() => ({ departments: [] })),
  ]);
  S = { me: meFromAuth(auth, 'employees'), employees: (data.employees || []).map(e => Object.assign(e, { name: properName(e.name) })), departments: dep.departments || [] };
  resetIdleTimer();
}
function loadError(err){
  return `<div style="max-width:480px;margin:80px auto;padding:0 16px;text-align:center;font-family:var(--font,system-ui,sans-serif)">
    <h2 style="color:#B3261E">Could not load Human Resource</h2>
    <p style="color:#565E6B;font-size:13.5px">${esc(err.message)}</p>
    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
  </div>`;
}
let lastRenderPath = null;
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
    const keepY = window.scrollY;
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
    window.scrollTo({ top: lastRenderPath === path ? keepY : 0 }); lastRenderPath = path;
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
   Skills helpers (from the real employee list - nothing is stored separately yet)
   ============================================================ */
// Groups free-text skill names case-insensitively; keeps the most common spelling.
function skillStats(list, field){
  const map = new Map();
  list.forEach(e => (Array.isArray(e[field]) ? e[field] : []).forEach(raw => {
    const name = String(raw||'').trim(); if (!name) return;
    const key = name.toLowerCase();
    if (!map.has(key)) map.set(key, { key, spellings:{}, people:[] });
    const m = map.get(key);
    m.spellings[name] = (m.spellings[name]||0) + 1;
    if (!m.people.includes(e)) m.people.push(e);
  }));
  return Array.from(map.values()).map(m => ({
    key: m.key,
    name: Object.keys(m.spellings).sort((a,b) => m.spellings[b]-m.spellings[a])[0],
    people: m.people,
    staff: m.people.filter(p => p.employment_type === 'staff').length,
    casual: m.people.filter(p => p.employment_type === 'casual').length,
  })).sort((a,b) => b.people.length - a.people.length || a.name.localeCompare(b.name));
}
function hasSkill(e, field, key){
  return (Array.isArray(e[field]) ? e[field] : []).some(v => String(v||'').trim().toLowerCase() === key);
}
function statCard(label, val, meta, icon, accent, link){
  return `<div class="stat acc-${accent} ${link?'link':''}" ${link?`onclick="go('${link}')"`:''}>
    <div class="lbl">${esc(label)}</div><div class="val">${val}</div><div class="meta">${meta}</div>
    <div class="ic-wrap">${I[icon]}</div></div>`;
}

/* ============================================================
   Dashboard
   ============================================================ */
const isActiveEmp = e => (e.status || 'active') !== 'inactive';
const activeEmps = () => S.employees.filter(isActiveEmp);

function viewDashboard(){
  const list = activeEmps();
  const former = S.employees.length - list.length;
  const total = list.length;
  const staff = list.filter(e => e.employment_type === 'staff').length;
  const casual = list.filter(e => e.employment_type === 'casual').length;
  const skills = skillStats(list, 'current_competencies');
  const withSkills = list.filter(e => Array.isArray(e.current_competencies) && e.current_competencies.length).length;
  const top = skills.slice(0, 8);
  const pct = n => total ? Math.round(n / total * 100) : 0;
  return {
    title:'Dashboard', crumb:'Overview',
    html: `${pageHead('Dashboard', 'Headcount and skills across the people currently employed.')}
    <div class="grid g4" style="margin-bottom:16px">
      ${statCard('Total headcount', total, former ? former + ' former ' + (former===1?'employee':'employees') + ' not counted' : 'Staff and casual', 'users', 'brand')}
      ${statCard('Staff', staff, pct(staff) + '% of headcount', 'users', 'ok')}
      ${statCard('Casual', casual, pct(casual) + '% of headcount', 'users', 'info')}
      ${statCard('Skills recorded', skills.length, withSkills + ' ' + (withSkills===1?'person has':'people have') + ' at least one', 'award', 'warn')}
    </div>
    <div class="card"><div class="card-h"><div><h3>Top skills</h3><div class="sub">Most common current competencies</div></div></div>
      <div class="card-b stack" style="gap:13px">${top.length ? top.map(k => `<div><div class="row between small"><span class="strong">${esc(k.name)}</span><span class="muted">${k.people.length} ${k.people.length===1?'person':'people'}</span></div>
        <div class="bar" style="margin-top:5px"><i style="width:${Math.round(k.people.length / top[0].people.length * 100)}%"></i></div></div>`).join('')
        : emptyState('award', 'No skills recorded yet', 'Add current competencies to an employee, or record a training session, and they will show up here.')}</div></div>`,
  };
}
route('/', () => viewDashboard());
route('/dashboard', () => viewDashboard());

/* ============================================================
   Training & Competencies
   Skills come from the employee records; recording a training session adds its skill
   to everyone who attended. Only people currently employed are listed.
   ============================================================ */
let trainTab = 'sessions';
let matrixDept = '';
let trainings = null; // null = not loaded yet
let expandedTraining = null;
function setTrainTab(t){ trainTab = t; render(); }
function toggleTraining(id){ expandedTraining = (expandedTraining === id) ? null : id; render(); }
const fmtDate = iso => { const t = String(iso||'').slice(0,10); return /^\d{4}-\d{2}-\d{2}$/.test(t) ? new Date(t + 'T12:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '--'; };

function trainSessionsTab(){
  if (trainings === null) return `<div class="card"><div class="card-b small muted">Loading...</div></div>`;
  if (!trainings.length) return `<div class="card"><div class="card-b">${emptyState('award', 'No training sessions recorded yet', 'Add a session, pick who attended, and the skill is added to their record.')}</div></div>`;
  return `<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>Session</th><th>Skill built</th><th>Provider</th><th>Attendees</th></tr></thead><tbody>
    ${trainings.map(t => {
      const open = expandedTraining === t.id, att = t.attendees || [];
      return `<tr class="clickable" onclick="toggleTraining(${Number(t.id)})">
        <td data-label="Date">${esc(fmtDate(t.trained_on))}</td>
        <td data-label="Session"><div class="strong">${esc(t.title)}</div></td>
        <td data-label="Skill built"><span class="chip">${esc(t.skill)}</span></td>
        <td data-label="Provider">${esc(t.provider||'--')}</td>
        <td data-label="Attendees" class="tnum">${att.length}</td></tr>` + (open ? `
      <tr><td colspan="5" style="padding:0;background:var(--surface-2);border-bottom:1px solid var(--line)"><div style="padding:14px 16px">
        <div class="small muted" style="margin-bottom:8px">Attended${t.recorded_by ? ' &middot; recorded by ' + esc(t.recorded_by) : ''}</div>
        ${att.map(a => `<span class="chip" style="margin:2px 4px 2px 0">${esc(a.name)}</span>`).join('') || '--'}</div></td></tr>` : '');
    }).join('')}
  </tbody></table></div></div>`;
}

function trainCatalogueTab(){
  const skills = skillStats(activeEmps(), 'current_competencies');
  if (!skills.length) return `<div class="card"><div class="card-b">${emptyState('award', 'No competencies recorded yet', 'Skills will be listed here once people have them recorded.')}</div></div>`;
  return `<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Competency</th><th>People</th><th>Staff</th><th>Casual</th></tr></thead><tbody>
    ${skills.map(k => `<tr><td data-label="Competency" class="strong">${esc(k.name)}</td><td data-label="People" class="tnum">${k.people.length}</td>
      <td data-label="Staff" class="tnum">${k.staff}</td><td data-label="Casual" class="tnum">${k.casual}</td></tr>`).join('')}
  </tbody></table></div></div>`;
}

function trainMatrixTab(){
  const pool = activeEmps();
  const depts = [...new Set(pool.map(e => e.department).filter(Boolean))].sort();
  const cols = skillStats(pool, 'current_competencies').slice(0, 14);
  const emps = pool.filter(e => !matrixDept || e.department === matrixDept)
    .filter(e => cols.some(c => hasSkill(e, 'current_competencies', c.key)));
  const legend = `<div class="small muted">&#10003; = has the skill &middot; click a name to see all their skills and download their card</div>`;
  const filter = depts.length ? `<div class="row filter-bar" style="margin-bottom:14px">
      <select class="inp filter-sel-status" id="mxDept"><option value="">All departments</option>${depts.map(d => `<option value="${esc(d)}" ${matrixDept===d?'selected':''}>${esc(d)}</option>`).join('')}</select>${legend}</div>`
    : `<div style="margin-bottom:14px">${legend}</div>`;
  if (!emps.length) return filter + `<div class="card"><div class="card-b">${emptyState('award', 'Nothing to show yet', 'People appear here once they have competencies recorded.')}</div></div>`;
  return filter + `<div class="card"><div class="tbl-wrap"><table class="tbl no-stack" style="min-width:${200 + cols.length * 90}px"><thead><tr><th style="min-width:180px">Employee</th>
    ${cols.map(c => `<th style="text-align:center" title="${esc(c.name)}">${esc(c.name)}</th>`).join('')}</tr></thead><tbody>
    ${emps.map(e => `<tr class="clickable" onclick="openPersonSkills('${esc(e.enroll_id)}')"><td><div class="strong">${esc(e.name)}</div><div class="small muted">${esc(e.role||'--')}</div></td>
      ${cols.map(c => `<td style="text-align:center">${hasSkill(e,'current_competencies',c.key) ? '<span class="strong" style="color:var(--ok)">&#10003;</span>' : ''}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div></div>`;
}

function viewTraining(){
  const canEdit = S.me.permission === 'editor';
  const tabs = [['sessions','Training sessions'],['catalogue','Competency catalogue'],['matrix','Skills matrix']];
  const tabBar = `<div class="tabs">${tabs.map(([k,l]) => `<div class="tab ${trainTab===k?'on':''}" onclick="setTrainTab('${k}')">${esc(l)}</div>`).join('')}</div>`;
  const body = trainTab==='sessions' ? trainSessionsTab() : trainTab==='catalogue' ? trainCatalogueTab() : trainMatrixTab();
  const actions = (trainTab === 'sessions' && canEdit) ? `<button class="btn btn-primary" onclick="openAddTraining()">${I.plus} Add training session</button>` : '';
  return {
    title:'Training & Competencies', crumb:'People',
    html: pageHead('Training & competencies', 'Who has which skills. Recording a training adds its skill to everyone who attended.', actions) + tabBar + body,
    bind(){
      const sel = $('#mxDept'); if (sel) sel.onchange = e => { matrixDept = e.target.value; render(); };
      if (trainTab === 'sessions' && trainings === null) {
        api('/webhook/employees/api/trainings').then(r => r.trainings || []).catch(() => [])
          .then(list => { trainings = list; if (currentPath().split('?')[0] === '/training' && trainTab === 'sessions') render(); });
      }
    },
  };
}
route('/training', () => viewTraining());

/* ---- Add a training session ---- */
function openAddTraining(){
  const st = { q:'', type:'', dept:'', checked:new Set() };
  const pool = activeEmps();
  const depts = [...new Set(pool.map(e => e.department).filter(Boolean))].sort();
  const skillOpts = skillStats(S.employees, 'current_competencies').map(k => `<option value="${esc(k.name)}"></option>`).join('');
  const shown = () => { const q = st.q.trim().toLowerCase();
    return pool.filter(e => (!st.type || e.employment_type === st.type) && (!st.dept || e.department === st.dept)
      && (!q || e.name.toLowerCase().includes(q) || String(e.enroll_id).toLowerCase().includes(q))); };
  openModal({
    title:'Add training session', size:'wide', sub:'Everyone ticked gets the skill added to their record.',
    body:`<form id="addTrainingForm" novalidate onsubmit="return false">
      <div class="grid g2">
        <div class="field"><label for="trTitle">Training title<span class="req">*</span></label><input class="inp" id="trTitle" maxlength="150" placeholder="e.g. Granulation refresher">
          <div class="err-msg hide" data-err="trTitle"></div></div>
        <div class="field"><label for="trSkill">Skill it builds<span class="req">*</span></label><input class="inp" id="trSkill" maxlength="100" list="trSkillList" placeholder="e.g. Granulation">
          <datalist id="trSkillList">${skillOpts}</datalist><div class="err-msg hide" data-err="trSkill"></div></div>
      </div>
      <div class="grid g2">
        <div class="field"><label for="trDate">Date<span class="req">*</span></label><input class="inp" type="date" id="trDate" max="${todayStr()}" value="${todayStr()}">
          <div class="err-msg hide" data-err="trDate"></div></div>
        <div class="field"><label for="trProvider">Provider / trainer</label><input class="inp" id="trProvider" maxlength="100"></div>
      </div>
      <div class="field"><label>Who attended<span class="req">*</span></label>
        <div class="row filter-bar" style="margin-bottom:8px">
          <div class="search filter-search"><span class="ic">${I.search}</span><input class="inp" id="trQ" placeholder="Search name or enroll ID"></div>
          <select class="inp filter-sel-status" id="trType"><option value="">Staff and casual</option><option value="staff">Staff</option><option value="casual">Casual</option></select>
          ${depts.length ? `<select class="inp filter-sel-status" id="trDept"><option value="">All departments</option>${depts.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('')}</select>` : ''}
        </div>
        <div class="row" style="gap:8px;margin-bottom:8px"><button class="btn btn-ghost btn-sm" type="button" id="trAll">Tick all shown</button>
          <button class="btn btn-ghost btn-sm" type="button" id="trNone">Clear</button><div class="small muted" id="trCount"></div></div>
        <div class="tbl-wrap" style="max-height:260px;overflow:auto"><table class="tbl no-stack"><tbody id="trList"></tbody></table></div>
        <div class="err-msg hide" data-err="trPeople"></div>
      </div></form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Save session</button>`,
    onMount:(w, close) => {
      const paint = () => {
        const rows = shown();
        $('#trList', w).innerHTML = rows.length ? rows.map(e => `<tr><td style="width:40px"><input type="checkbox" data-id="${esc(e.enroll_id)}" ${st.checked.has(e.enroll_id)?'checked':''}></td>
          <td><div class="strong">${esc(e.name)}</div><div class="tiny muted mono">${esc(e.enroll_id)}</div></td>
          <td><span class="badge ${e.employment_type==='staff'?'b-brand':'b-slate'}">${esc(e.employment_type)}</span></td>
          <td class="small muted">${esc(e.role||'')}</td></tr>`).join('') : `<tr><td class="muted" style="padding:14px">No one matches.</td></tr>`;
        $$('input[data-id]', w).forEach(c => c.onchange = () => { c.checked ? st.checked.add(c.dataset.id) : st.checked.delete(c.dataset.id); $('#trCount', w).textContent = st.checked.size + ' ticked'; });
        $('#trCount', w).textContent = st.checked.size + ' ticked';
      };
      $('#trQ', w).oninput = e => { st.q = e.target.value; paint(); };
      $('#trType', w).onchange = e => { st.type = e.target.value; paint(); };
      const dsel = $('#trDept', w); if (dsel) dsel.onchange = e => { st.dept = e.target.value; paint(); };
      $('#trAll', w).onclick = () => { shown().forEach(e => st.checked.add(e.enroll_id)); paint(); };
      $('#trNone', w).onclick = () => { st.checked = new Set(); paint(); };
      paint();
      $('[data-save]', w).onclick = async () => {
        const f = $('#addTrainingForm', w); clearErrors(f);
        const title = $('#trTitle', w).value.trim(), skill = $('#trSkill', w).value.trim(), date = $('#trDate', w).value, provider = $('#trProvider', w).value.trim();
        if (!title) return setErr('trTitle', 'Enter a title.', f);
        if (!skill) return setErr('trSkill', 'Enter the skill this training builds.', f);
        if (!date || date > todayStr()) return setErr('trDate', 'Pick today or an earlier date.', f);
        if (!st.checked.size) return setErr('trPeople', 'Tick at least one person.', f);
        const btn = $('[data-save]', w); btn.disabled = true;
        try {
          await api('/webhook/employees/api/trainings', { method:'POST', body:{ title, skill, trained_on: date, provider, enroll_ids: [...st.checked] } });
          const key = skill.toLowerCase();
          S.employees.forEach(e => {
            if (!st.checked.has(e.enroll_id)) return;
            const have = Array.isArray(e.current_competencies) ? e.current_competencies : [];
            if (!have.some(v => String(v||'').trim().toLowerCase() === key)) e.current_competencies = have.concat(skill);
          });
          trainings = null; expandedTraining = null; close(); render();
          toast('Training recorded', st.checked.size + ' ' + (st.checked.size === 1 ? 'person' : 'people') + ' now have ' + skill + '.', 'ok');
        } catch (err) { setErr('trPeople', err.message, f); btn.disabled = false; }
      };
    },
  });
}

/* ---- A person's skills, and their downloadable card ---- */
function openPersonSkills(enrollId){
  const e = S.employees.find(x => x.enroll_id === enrollId); if (!e) return;
  const skills = Array.isArray(e.current_competencies) ? e.current_competencies : [];
  openModal({
    title: e.name, size:'narrow', sub: [e.enroll_id, e.role, e.employment_type].filter(Boolean).join(' · '),
    body: `<div class="small muted" style="margin-bottom:8px">Skills and competencies (${skills.length})</div>
      <div>${skills.length ? skills.map(v => `<span class="chip" style="margin:2px 4px 2px 0">${esc(v)}</span>`).join('') : '<span class="muted small">No skills recorded yet.</span>'}</div>`,
    footer: `<button class="btn btn-ghost" data-close>Close</button><button class="btn btn-primary" data-card ${skills.length ? '' : 'disabled title="No skills recorded yet"'}>${I.download} Download certificate</button>`,
    onMount:(w) => { $('[data-card]', w).onclick = async (ev) => {
      const b = ev.currentTarget; b.disabled = true;
      try { await downloadSkillCard(e); } catch (err) { toast('Could not make the card', err.message, 'err'); }
      finally { b.disabled = false; }
    }; },
  });
}

function loadLogo(){
  return new Promise(resolve => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = '../logo.png'; });
}
// Draws the certificate on a canvas and saves it as a PNG: logo, then
// "This is to certify that <name> has completed training(s) on <courses> administered by
// Orange Kalbe Limited". Nothing else (no date, ID, role).
async function downloadSkillCard(e){
  const logo = await loadLogo();
  const courses = (Array.isArray(e.current_competencies) ? e.current_competencies : []).map(v => String(v||'').trim()).filter(Boolean);
  const list = courses.length > 1 ? courses.slice(0, -1).join(', ') + ' and ' + courses[courses.length - 1] : (courses[0] || '');
  const W = 900, PAD = 70, SC = 2, FONT = '"Inter","Segoe UI",system-ui,Arial,sans-serif', MAXW = W - 2 * PAD;
  const probe = document.createElement('canvas').getContext('2d');
  const wrap = (text, font) => { probe.font = font; const out = []; let line = '';
    text.split(/\s+/).forEach(w => { const t = line ? line + ' ' + w : w; if (line && probe.measureText(t).width > MAXW) { out.push(line); line = w; } else line = t; });
    if (line) out.push(line); return out; };
  const F_PLAIN = '500 24px ' + FONT, F_NAME = '700 44px ' + FONT, F_LIST = '700 28px ' + FONT;
  const nameLines = wrap(e.name, F_NAME), listLines = wrap(list, F_LIST);
  const logoH = logo ? 100 : 0, logoW = logo ? Math.round(logo.width * logoH / logo.height) : 0;
  let y = 48 + logoH + (logo ? 56 : 20);
  const yThis = y; y += 52;
  const yName = y; y += nameLines.length * 54 + 6;
  const yHas = y; y += 50;
  const yList = y; y += listLines.length * 40 + 14;
  const yBy = y; const H = yBy + 70;
  const c = document.createElement('canvas'); c.width = W * SC; c.height = H * SC;
  const ctx = c.getContext('2d'); ctx.scale(SC, SC);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ED6B1F'; ctx.fillRect(0, 0, W, 14);
  ctx.strokeStyle = '#BFCAC2'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (logo) ctx.drawImage(logo, (W - logoW) / 2, 48, logoW, logoH);
  ctx.fillStyle = '#565E6B'; ctx.font = F_PLAIN; ctx.fillText('This is to certify that', W / 2, yThis);
  ctx.fillStyle = '#16191D'; ctx.font = F_NAME; nameLines.forEach((l, i) => ctx.fillText(l, W / 2, yName + i * 54));
  ctx.fillStyle = '#565E6B'; ctx.font = F_PLAIN; ctx.fillText(courses.length > 1 ? 'has completed trainings on' : 'has completed training on', W / 2, yHas);
  ctx.fillStyle = '#B4510F'; ctx.font = F_LIST; listLines.forEach((l, i) => ctx.fillText(l, W / 2, yList + i * 40));
  ctx.fillStyle = '#565E6B'; ctx.font = F_PLAIN; ctx.fillText('administered by Orange Kalbe Limited', W / 2, yBy);
  const blob = await new Promise(res => c.toBlob(res, 'image/png'));
  if (!blob) throw new Error('Your browser could not create the image.');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'OKL_certificate_' + String(e.enroll_id).replace(/[^\w-]/g, '') + '.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}


/* ============================================================
   Employees
   ============================================================ */
let employeeQuery = '';
let employeeTypeFilter = '';
let employeeStatusFilter = 'active';
let employeeDeptFilter = '';
let employeeGenderFilter = '';
let employeeSearchActive = false;

function matchesEmployeeQuery(e, q){
  if (!q) return true;
  const haystack = [e.enroll_id, e.name, e.role, e.department, e.workstation].map(v => String(v||'').toLowerCase()).join(' ');
  return haystack.includes(q);
}

// Which row (if any) is expanded in place, and whether it's showing the
// read-only card or the edit form. Resets to view mode whenever a
// *different* row is opened, but survives re-renders of the same one (e.g.
// after a failed save) so the form doesn't collapse under the user.
let expandedEnrollId = null;
let expandedMode = 'view';

function showEmployeeRow(enrollId){      // keep the opened row on screen without jumping to the top
  const r = document.querySelector('tr[data-eid="' + String(enrollId).replace(/"/g, '') + '"]');
  if (r) r.scrollIntoView({ block:'nearest' });
}
function toggleEmployeeRow(enrollId){
  expandedEnrollId = (expandedEnrollId === enrollId) ? null : enrollId;
  expandedMode = 'view';
  render(); if (expandedEnrollId) showEmployeeRow(enrollId);
}
function startEditingEmployee(enrollId){
  expandedEnrollId = enrollId;
  expandedMode = 'edit';
  render(); showEmployeeRow(enrollId);
}
function cancelEditingEmployee(enrollId){
  expandedMode = 'view';
  render(); showEmployeeRow(enrollId);
}

function renderEmployeeExpanded(e, canEdit){
  const editing = canEdit && expandedMode === 'edit';
  const readonlyRow = (label, value) => `<div class="kv-item"><div class="k">${esc(label)}</div><div class="v">${esc(value||'--')}</div></div>`;
  const tagRow = (label, values) => `<div class="kv-item"><div class="k">${esc(label)}</div><div class="v">${
    (values&&values.length) ? values.map(v=>`<span class="chip" style="margin:2px 4px 2px 0">${esc(v)}</span>`).join('') : '--'
  }</div></div>`;

  if (editing) {
    return `
      <form id="editEmployeeForm" novalidate>${employeeFormFields(e, 'ee')}
        <div class="row end" style="margin-top:6px">
          <button class="btn btn-ghost" type="button" onclick="cancelEditingEmployee('${esc(e.enroll_id)}')">Cancel</button>
          <button class="btn btn-primary" type="submit">${I.check} Save changes</button>
        </div>
      </form>`;
  }

  return `
    <div class="row between" style="margin-bottom:12px">
      <div class="small muted">Full details</div>
      ${canEdit ? `<button class="btn btn-primary btn-sm" onclick="startEditingEmployee('${esc(e.enroll_id)}')">${I.edit} Edit</button>` : ''}
    </div>
    ${!canEdit ? `<div class="notice info">${I.info}<div>You have viewer access - editing employee records requires an editor account.</div></div>` : ''}
    <div class="kv-grid">
      ${readonlyRow('Enroll ID', e.enroll_id)}
      ${readonlyRow('Gender', e.gender)}
      ${readonlyRow('Employment type', e.employment_type)}
      ${readonlyRow('Role', e.role)}
      ${readonlyRow('Department', e.department)}
      ${readonlyRow('Phone number', e.phone_number)}
      ${readonlyRow('Work email', e.work_email)}
      ${readonlyRow('Workstation', e.workstation)}
      ${readonlyRow('Status', (e.status||'active')==='inactive' ? 'Inactive (left)' : 'Active')}
      ${readonlyRow('Join date', fmtDate(e.join_date)==='--' ? '' : fmtDate(e.join_date))}
      ${readonlyRow('Left date', fmtDate(e.left_date)==='--' ? '' : fmtDate(e.left_date))}
      ${tagRow('Current competencies', e.current_competencies)}
      ${tagRow('Skill gaps', e.skill_gaps)}
    </div>`;
}

let selectedEmployees = new Set();
function paintBulkBar(){
  const b = $('#bulkBar'); if (!b) return;
  const n = selectedEmployees.size;
  if (!n) { b.innerHTML = ''; return; }
  const opts = `<option value="">No department</option>` + (S.departments || []).map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
  b.innerHTML = `<div class="card" style="margin-bottom:14px"><div class="card-b row between" style="gap:12px;flex-wrap:wrap">
      <div class="strong">${n} selected</div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <select class="inp" id="bulkDept" style="width:auto;min-width:210px"><option value="__pick" disabled selected>Set department to...</option>${opts}</select>
        <button class="btn btn-primary btn-sm" id="bulkApply">Apply</button>
        <button class="btn btn-ghost btn-sm" id="bulkClear">Clear selection</button>
      </div></div></div>`;
  $('#bulkClear').onclick = () => { selectedEmployees = new Set(); $$('[data-sel]').forEach(c => { c.checked = false; }); const a = $('#empSelAll'); if (a) a.checked = false; paintBulkBar(); };
  $('#bulkApply').onclick = applyBulkDepartment;
}
async function applyBulkDepartment(){
  const sel = $('#bulkDept');
  if (!sel || sel.value === '__pick') return toast('Pick a department', 'Choose one from the list first.', 'err');
  const department = sel.value, ids = [...selectedEmployees];
  const label = department || 'no department';
  const ok = await confirmDialog('Set department', `Set <strong>${esc(label)}</strong> for ${ids.length} ${ids.length === 1 ? 'person' : 'people'}?`, 'Apply');
  if (!ok) return;
  try {
    await api('/webhook/employees/api/bulk-department', { method:'POST', body:{ enroll_ids: ids, department } });
    S.employees.forEach(e => { if (selectedEmployees.has(e.enroll_id)) e.department = department || null; });
    selectedEmployees = new Set(); render();
    toast('Department updated', ids.length + ' ' + (ids.length === 1 ? 'person is' : 'people are') + ' now in ' + label + '.', 'ok');
  } catch (err) { toast('Could not update', err.message, 'err'); }
}

function viewEmployees(){
  const q = employeeQuery.trim().toLowerCase();
  const rows = S.employees.filter(e =>
    (!employeeTypeFilter || e.employment_type === employeeTypeFilter) &&
    (employeeStatusFilter === 'all' || (e.status || 'active') === employeeStatusFilter) &&
    (!employeeDeptFilter || (employeeDeptFilter === '__none' ? !e.department : e.department === employeeDeptFilter)) &&
    (!employeeGenderFilter || (e.gender || '') === employeeGenderFilter) && matchesEmployeeQuery(e, q));
  const depts = [...new Set([...(S.departments || []), ...S.employees.map(e => e.department).filter(Boolean)])].sort();
  const filtering = !!(q || employeeTypeFilter || employeeDeptFilter || employeeGenderFilter || employeeStatusFilter !== 'active');
  const canEdit = S.me.permission === 'editor';
  const cols = canEdit ? 9 : 8;

  return {
    title:'Employees', crumb:'People',
    html: `
    ${pageHead('Employees', 'Every casual and staff member currently on record.',
      `<button class="btn btn-ghost" onclick="handleExportClick(this)">${I.download} Export CSV</button>` +
      (canEdit ? `<button class="btn btn-primary" onclick="openAddEmployee()">${I.plus} Add employee</button>` : ''))}
    <div class="row filter-bar compact" style="margin-bottom:12px">
      <div class="search filter-search">
        <span class="ic">${I.search}</span>
        <input class="inp" id="empSearch" placeholder="Search name, ID, role, workstation..." value="${esc(employeeQuery)}">
      </div>
      <select class="inp" id="empDeptFilter" aria-label="Department">
        <option value="">All departments</option>
        ${depts.map(d => `<option value="${esc(d)}" ${employeeDeptFilter===d?'selected':''}>${esc(d)}</option>`).join('')}
        <option value="__none" ${employeeDeptFilter==='__none'?'selected':''}>No department</option>
      </select>
      <select class="inp" id="empTypeFilter" aria-label="Employment type">
        <option value="">Staff and casual</option>
        <option value="staff" ${employeeTypeFilter==='staff'?'selected':''}>Staff</option>
        <option value="casual" ${employeeTypeFilter==='casual'?'selected':''}>Casual</option>
      </select>
      <select class="inp" id="empGenderFilter" aria-label="Gender">
        <option value="">Any gender</option>
        <option value="Male" ${employeeGenderFilter==='Male'?'selected':''}>Male</option>
        <option value="Female" ${employeeGenderFilter==='Female'?'selected':''}>Female</option>
      </select>
      <select class="inp" id="empStatusFilter" aria-label="Status">
        <option value="active" ${employeeStatusFilter==='active'?'selected':''}>Active</option>
        <option value="inactive" ${employeeStatusFilter==='inactive'?'selected':''}>Inactive (left)</option>
        <option value="all" ${employeeStatusFilter==='all'?'selected':''}>All</option>
      </select>
      ${filtering ? `<button class="btn btn-ghost btn-sm" id="empClear">Clear</button>` : ''}
      <div class="spacer"></div>
      <div class="small muted">${rows.length} ${rows.length === 1 ? 'person' : 'people'}</div>
    </div>
    <div id="bulkBar"></div>
    <div class="card">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>${canEdit ? '<th style="width:36px"><input type="checkbox" id="empSelAll" aria-label="Select all shown"></th>' : ''}<th>Enroll ID</th><th>Name</th><th>Gender</th><th>Type</th><th>Role</th><th>Department</th><th>Workstation</th><th>Status</th></tr></thead>
        <tbody>${rows.length ? rows.map(e => {
          const isExpanded = e.enroll_id === expandedEnrollId;
          const row = `
          <tr class="clickable" data-eid="${esc(e.enroll_id)}" onclick="toggleEmployeeRow('${esc(e.enroll_id)}')">
            ${canEdit ? `<td onclick="event.stopPropagation()"><input type="checkbox" data-sel="${esc(e.enroll_id)}" ${selectedEmployees.has(e.enroll_id)?'checked':''} aria-label="Select ${esc(e.name)}"></td>` : ''}
            <td class="mono" data-label="Enroll ID">${esc(e.enroll_id)}</td>
            <td data-label="Name"><div class="row" style="gap:10px">${avatarEl(e.name)}<div class="strong">${esc(e.name)}</div></div></td>
            <td data-label="Gender">${esc(e.gender||'--')}</td>
            <td data-label="Type"><span class="badge ${e.employment_type==='staff'?'b-brand':'b-slate'}">${esc(e.employment_type)}</span></td>
            <td data-label="Role">${esc(e.role||'--')}</td>
            <td data-label="Department">${esc(e.department||'--')}</td>
            <td data-label="Workstation">${esc(e.workstation||'--')}</td>
            <td data-label="Status"><span class="badge ${(e.status||'active')==='inactive'?'b-slate':'b-ok'}">${(e.status||'active')==='inactive'?'Inactive':'Active'}</span></td>
          </tr>`;
          const expansion = isExpanded ? `
          <tr><td colspan="${cols}" style="padding:0;background:var(--surface-2);border-bottom:1px solid var(--line)">
            <div style="padding:16px">${renderEmployeeExpanded(e, canEdit)}</div>
          </td></tr>` : '';
          return row + expansion;
        }).join('') : `<tr><td colspan="${cols}">${emptyState('users','No employees match', 'Try a different search or filter.')}</td></tr>`}
        </tbody>
      </table></div>
    </div>`,
    bind(){
      $('#empSearch').oninput = debounce((e) => { employeeQuery = e.target.value; employeeSearchActive = true; render(); }, 200);
      if (employeeSearchActive) { employeeSearchActive = false; $('#empSearch').focus({ preventScroll:true }); $('#empSearch').setSelectionRange(employeeQuery.length, employeeQuery.length); }
      $('#empTypeFilter').onchange = (e) => { employeeTypeFilter = e.target.value; render(); };
      $('#empStatusFilter').onchange = (e) => { employeeStatusFilter = e.target.value; render(); };
      $('#empDeptFilter').onchange = (e) => { employeeDeptFilter = e.target.value; render(); };
      $('#empGenderFilter').onchange = (e) => { employeeGenderFilter = e.target.value; render(); };
      const clr = $('#empClear'); if (clr) clr.onclick = () => { employeeQuery = ''; employeeTypeFilter = ''; employeeDeptFilter = ''; employeeGenderFilter = ''; employeeStatusFilter = 'active'; render(); };

      if (canEdit) {
        const visible = rows.map(e => e.enroll_id);
        selectedEmployees = new Set([...selectedEmployees].filter(id => visible.includes(id)));
        const all = $('#empSelAll');
        const syncAll = () => { if (all) all.checked = visible.length > 0 && visible.every(id => selectedEmployees.has(id)); };
        $$('[data-sel]').forEach(c => { c.onchange = () => { c.checked ? selectedEmployees.add(c.dataset.sel) : selectedEmployees.delete(c.dataset.sel); syncAll(); paintBulkBar(); }; });
        if (all) all.onchange = () => {
          visible.forEach(id => all.checked ? selectedEmployees.add(id) : selectedEmployees.delete(id));
          $$('[data-sel]').forEach(c => { c.checked = all.checked; });
          paintBulkBar();
        };
        syncAll(); paintBulkBar();
      }

      const editForm = $('#editEmployeeForm');
      if (editForm) {
        editForm.onsubmit = async (ev) => {
          ev.preventDefault();
          clearErrors(editForm);
          const payload = readEmployeeForm('ee', editForm);
          payload.name = properName(payload.name);
          if (!payload.name) return setErr('eeName', 'Enter a name.', editForm);
          const btn = editForm.querySelector('button[type=submit]');
          btn.disabled = true;
          try {
            await api('/webhook/employees/api/update', { method:'POST', body: payload });
            const emp = S.employees.find(x => x.enroll_id === payload.enroll_id);
            Object.assign(emp, payload);
            if (emp.status === 'active') emp.left_date = null;
            else if (!emp.left_date) emp.left_date = todayStr();
            expandedMode = 'view';
            render(); toast('Changes saved', esc(payload.name) + ' has been updated.', 'ok');
          } catch (err) { setErr('eeName', err.message, editForm); }
          finally { btn.disabled = false; }
        };
      }
    },
  };
}
route('/employees', () => viewEmployees());


/* ============================================================
   Attendance: overtime
   Entries are made on the hosted department form (the same page supervisors use); this console
   opens it and is where editors review, correct and void what was submitted.
   ============================================================ */
const todayStr = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA'); };
const fmtHours = n => String(Math.round(Number(n || 0) * 100) / 100);
const hhmm = t => t ? String(t).slice(0, 5) : '';
const OVERTIME_FORM_URL = 'https://orangegroupsai.online/webhook/employees/overtime-form';

/* ---- Overtime Submission: department tiles that open the hosted form ---- */
function viewOvertimeSubmit(){
  const departments = (S.departments || []);
  const tile = (name) => `
    <a class="card ot-dept-card" href="${esc(OVERTIME_FORM_URL + '?department=' + encodeURIComponent(name))}" target="_blank" rel="noopener"
       style="display:block;text-decoration:none;color:inherit">
      <div class="card-h"><h3>${esc(name)}</h3></div>
      <div class="card-b">
        <p class="small muted">Record overtime for ${esc(name)}.</p>
        <div class="row" style="margin-top:14px;gap:6px;color:var(--brand-600);font-weight:600;font-size:13px">Open form ${I.externalLink}</div>
      </div>
    </a>`;
  return {
    title:'Overtime Submission', crumb:'Attendance',
    html: `
    <style>.ot-dept-card{transition:.16s ease}.ot-dept-card:hover{border-color:var(--brand);box-shadow:0 8px 24px rgba(16,25,20,.08);transform:translateY(-2px)}</style>
    ${pageHead('Overtime Submission', 'Pick the department - each opens that department\'s hosted overtime form in a new tab. Supervisors can use the same link directly.')}
    ${departments.length ? `<div class="grid g3">${departments.map(tile).join('')}</div>`
      : `<div class="card"><div class="card-b">${emptyState('box', 'No departments yet', 'Departments appear here once they exist.')}</div></div>`}
    <div class="card" style="margin-top:16px"><div class="card-b small muted">
      <div class="strong" style="color:var(--text);margin-bottom:4px">Link for supervisors</div>
      <div class="mono" style="word-break:break-all">${esc(OVERTIME_FORM_URL)}</div></div></div>`,
  };
}
route('/overtime/submit', () => viewOvertimeSubmit());

/* ---- Overtime: the log ---- */
let otListState = { preset:'last30', from:'', to:'', department:'', q:'', showVoid:false, mode:'overview', records:null };
function filteredOvertime(){
  const s = otListState, q = s.q.trim().toLowerCase();
  return (s.records || []).filter(r =>
    (s.showVoid || r.status !== 'void') && (!s.department || r.department === s.department) &&
    (!q || String(r.name).toLowerCase().includes(q) || String(r.enroll_id).toLowerCase().includes(q)));
}
function otTimes(r){ return r.start_time ? hhmm(r.start_time) + ' - ' + hhmm(r.end_time) : '--'; }
function paintOtList(){
  const box = $('#otListBody'); if (!box) return;
  const s = otListState;
  if (!s.records) { box.innerHTML = `<div class="small muted" style="padding:14px">Loading...</div>`; return; }
  const rows = filteredOvertime(), canEdit = S.me.permission === 'editor';
  const live = rows.filter(r => r.status !== 'void');
  const total = live.reduce((t, r) => t + Number(r.hours || 0), 0);
  const foot = `<div class="small muted" style="padding:12px 14px">${live.length} ${live.length === 1 ? 'entry' : 'entries'}, ${fmtHours(total)} hours in total${rows.length !== live.length ? ' (voided entries not counted)' : ''}.</div>`;
  if (!rows.length) { box.innerHTML = `<div class="small muted" style="padding:14px">No overtime recorded in this period.</div>`; return; }
  if (s.mode === 'overview') {
    const people = new Set(live.map(r => r.enroll_id)).size;
    const group = (keyFn) => { const g = new Map(); live.forEach(r => { const k = keyFn(r) || 'No department'; if (!g.has(k)) g.set(k, { key:k, hours:0, entries:0, people:new Set() }); const x = g.get(k); x.hours += Number(r.hours || 0); x.entries++; x.people.add(r.enroll_id); }); return [...g.values()]; };
    const depts = group(r => r.department).sort((a, b) => b.hours - a.hours);
    const weekOf = iso => { const d = new Date(String(iso).slice(0, 10) + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
    const weeks = group(r => weekOf(r.work_date)).sort((a, b) => a.key < b.key ? 1 : -1);
    const nameOf = new Map(live.map(r => [r.enroll_id, r.name]));
    const topPeople = group(r => r.enroll_id).sort((a, b) => b.hours - a.hours).slice(0, 10);
    const maxD = depts[0].hours || 1, maxW = Math.max(1, ...weeks.map(x => x.hours)), maxP = topPeople[0].hours || 1;
    const bar = (label, right, pct) => `<div><div class="row between small"><span class="strong">${esc(label)}</span><span class="muted">${right}</span></div><div class="bar" style="margin-top:4px"><i style="width:${pct}%"></i></div></div>`;
    box.innerHTML = `<div class="card-b">
      <div class="grid g3" style="margin-bottom:18px">
        ${statCard('Total hours', fmtHours(total), live.length + ' ' + (live.length === 1 ? 'entry' : 'entries') + ' in this period', 'clock', 'brand')}
        ${statCard('People', people, 'worked overtime', 'users', 'ok')}
        ${statCard('Average per person', fmtHours(people ? total / people : 0), 'hours in this period', 'activity', 'info')}
      </div>
      <div class="grid g2">
        <div><div class="strong" style="margin-bottom:8px">Hours by department</div><div class="stack" style="gap:11px">${depts.map(x => bar(x.key, fmtHours(x.hours) + ' h - ' + x.people.size + ' ' + (x.people.size === 1 ? 'person' : 'people') + ' - ' + fmtHours(x.hours / x.people.size) + ' h each', Math.round(x.hours / maxD * 100))).join('')}</div></div>
        <div><div class="strong" style="margin-bottom:8px">Most overtime</div><div class="stack" style="gap:11px">${topPeople.map(x => bar(nameOf.get(x.key) || x.key, fmtHours(x.hours) + ' h - ' + x.entries + ' ' + (x.entries === 1 ? 'day' : 'days'), Math.round(x.hours / maxP * 100))).join('')}</div></div>
      </div>
      <div class="strong" style="margin:20px 0 8px">Hours by week</div>
      <div class="stack" style="gap:11px">${weeks.map(x => bar('Week of ' + fmtDayShort(x.key), fmtHours(x.hours) + ' h - ' + x.people.size + ' ' + (x.people.size === 1 ? 'person' : 'people'), Math.round(x.hours / maxW * 100))).join('')}</div></div>`;
    return;
  }
  if (s.mode === 'totals') {
    const by = new Map();
    live.forEach(r => { const k = r.enroll_id; if (!by.has(k)) by.set(k, { name:r.name, id:k, depts:new Set(), days:0, hours:0 }); const x = by.get(k); x.depts.add(r.department); x.days++; x.hours += Number(r.hours || 0); });
    const list = [...by.values()].sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name));
    box.innerHTML = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Department</th><th>Days</th><th>Hours</th></tr></thead>
      <tbody>${list.map(x => `<tr><td data-label="Name"><div class="strong">${esc(x.name)}</div><div class="tiny muted mono">${esc(x.id)}</div></td>
        <td data-label="Department">${esc([...x.depts].filter(Boolean).join(', ') || '--')}</td><td data-label="Days" class="tnum">${x.days}</td><td data-label="Hours" class="tnum strong">${fmtHours(x.hours)}</td></tr>`).join('')}</tbody></table></div>${foot}`;
    return;
  }
  box.innerHTML = `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Date</th><th>Name</th><th>Department</th><th>Time</th><th>Hours</th><th>Duty</th><th>Submitted by</th><th>Status</th>${canEdit ? '<th></th>' : ''}</tr></thead>
      <tbody>${rows.map(r => `<tr ${r.status === 'void' ? 'style="opacity:.55"' : ''}>
        <td data-label="Date">${esc(r.work_date)}</td><td data-label="Name"><div class="strong">${esc(r.name)}</div></td><td data-label="Department">${esc(r.department||'--')}</td>
        <td data-label="Time" class="tnum">${esc(otTimes(r))}</td><td data-label="Hours" class="tnum strong">${esc(fmtHours(r.hours))}</td>
        <td data-label="Duty" class="small">${esc(r.duty||'--')}</td><td data-label="Submitted by" class="small">${esc(r.submitted_by || r.recorded_by || '--')}</td>
        <td data-label="Status">${r.status === 'void' ? `<span class="badge b-slate" title="${esc(r.void_reason||'')}">Void</span>` : '<span class="badge b-ok">Recorded</span>'}</td>
        ${canEdit ? `<td>${r.status === 'void' ? '' : `<div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" onclick="openEditOvertime(${Number(r.id)})">${I.edit} Edit</button><button class="btn btn-ghost btn-sm" onclick="openVoidOvertime(${Number(r.id)})">Void</button></div>`}</td>` : ''}</tr>`).join('')}</tbody></table></div>${foot}`;
}
async function loadOtList(){
  otListState.records = null; paintOtList();
  try {
    const res = await api('/webhook/employees/api/overtime?from=' + encodeURIComponent(otListState.from) + '&to=' + encodeURIComponent(otListState.to));
    otListState.records = (res.records || []).map(r => Object.assign(r, { name: properName(r.name) }));
  } catch (err) { toast('Could not load overtime', err.message, 'err'); otListState.records = []; }
  const sel = $('#olDept');
  if (sel) {
    const deps = [...new Set(otListState.records.map(r => r.department).filter(Boolean))].sort();
    sel.innerHTML = `<option value="">All departments</option>` + deps.map(d => `<option value="${esc(d)}" ${otListState.department===d?'selected':''}>${esc(d)}</option>`).join('');
  }
  paintOtList();
}
function exportOvertimeCSV(){
  const cell = v => { const t = v == null ? '' : String(v); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  const head = ['Date','Name','Enroll ID','Department','Start','End','Hours','Duty','Submitted by','Status'];
  const lines = [head.join(',')].concat(filteredOvertime().map(r => [r.work_date, r.name, r.enroll_id, r.department, hhmm(r.start_time), hhmm(r.end_time), fmtHours(r.hours), r.duty, r.submitted_by || r.recorded_by, r.status].map(cell).join(',')));
  download('okl_overtime_' + otListState.from + '_to_' + otListState.to + '.csv', lines.join('\n'), 'text/csv;charset=utf-8');
}
function viewOvertimeList(){
  if (!otListState.to) { const r = presetRange(otListState.preset); otListState.from = r[0]; otListState.to = r[1]; }
  const s = otListState;
  return {
    title:'Overtime', crumb:'Attendance',
    html: `${pageHead('Overtime', 'Hours submitted on the department forms: overview, totals by person, and every entry.', `<button class="btn btn-ghost" id="olCsv">${I.download} Export CSV</button>`)}
      <div class="row filter-bar" style="margin-bottom:14px">
        ${periodFields(s, 'ol')}
        <div class="field" style="margin:0"><label for="olDept">Department</label><select class="inp" id="olDept"><option value="">All departments</option></select></div>
        <div class="field" style="margin:0"><label for="olQ">Person</label><input class="inp" id="olQ" placeholder="Search name or ID" value="${esc(s.q)}"></div>
        <label class="row" style="gap:8px;margin:0;align-self:flex-end;padding-bottom:10px;font-weight:500"><input type="checkbox" id="olVoid" ${s.showVoid?'checked':''}> Show voided</label>
      </div>
      <div class="tabs"><div class="tab ${s.mode==='overview'?'on':''}" data-mode="overview">Overview</div><div class="tab ${s.mode==='totals'?'on':''}" data-mode="totals">By person</div><div class="tab ${s.mode==='entries'?'on':''}" data-mode="entries">Entries</div></div>
      <div class="card"><div id="otListBody"></div></div>`,
    bind(){
      bindPeriodFields(otListState, 'ol', loadOtList);
      $('#olDept').onchange = e => { otListState.department = e.target.value; paintOtList(); };
      $('#olQ').oninput = debounce(e => { otListState.q = e.target.value; paintOtList(); }, 150);
      $('#olVoid').onchange = e => { otListState.showVoid = e.target.checked; paintOtList(); };
      $('#olCsv').onclick = exportOvertimeCSV;
      $$('.tab[data-mode]').forEach(t => t.onclick = () => { otListState.mode = t.dataset.mode; $$('.tab[data-mode]').forEach(x => x.classList.toggle('on', x === t)); paintOtList(); });
      loadOtList();
    },
  };
}
route('/overtime/records', () => viewOvertimeList());

function openEditOvertime(id){
  const r = (otListState.records || []).find(x => Number(x.id) === Number(id)); if (!r) return;
  const calc = (a, b) => { const m = t => { const x = /^(\d{1,2}):(\d{2})/.exec(t || ''); return x ? (+x[1]) * 60 + (+x[2]) : null; };
    const s = m(a), e = m(b); return (s == null || e == null || e <= s) ? null : Math.round((e - s) / 60 * 100) / 100; };
  openModal({
    title:'Edit overtime', size:'narrow', sub: r.name + ' · ' + r.work_date + ' · ' + (r.department || ''),
    body:`<div class="grid g2">
        <div class="field"><label for="eoStart">Start time</label><input class="inp" type="time" id="eoStart" value="${esc(hhmm(r.start_time))}"></div>
        <div class="field"><label for="eoEnd">End time</label><input class="inp" type="time" id="eoEnd" value="${esc(hhmm(r.end_time))}"></div></div>
      <div class="field"><label for="eoDuty">Duty</label><input class="inp" id="eoDuty" maxlength="150" value="${esc(r.duty||'')}"></div>
      <div class="small muted" id="eoHours"></div><div class="err-msg hide" data-err="eoStart"></div>
      ${r.start_time ? '' : `<div class="hint">${I.info}<span>This entry was recorded with hours only (${esc(fmtHours(r.hours))} h). Enter start and end times to replace it.</span></div>`}`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Save</button>`,
    onMount:(w, close) => {
      const upd = () => { const h = calc($('#eoStart', w).value, $('#eoEnd', w).value); $('#eoHours', w).textContent = h == null ? 'End must be after start.' : 'Duration: ' + fmtHours(h) + ' h'; };
      $('#eoStart', w).oninput = upd; $('#eoEnd', w).oninput = upd; upd();
      $('[data-save]', w).onclick = async () => {
        clearErrors(w);
        const start = $('#eoStart', w).value, end = $('#eoEnd', w).value;
        if (calc(start, end) == null) return setErr('eoStart', 'End must be after start.', w);
        const btn = $('[data-save]', w); btn.disabled = true;
        try {
          const res = await api('/webhook/employees/api/overtime/update', { method:'POST', body:{ id: r.id, start, end, duty: $('#eoDuty', w).value.trim() } });
          r.start_time = start + ':00'; r.end_time = end + ':00'; r.duty = $('#eoDuty', w).value.trim() || null; r.hours = res.hours != null ? res.hours : calc(start, end);
          close(); paintOtList(); toast('Overtime updated', r.name + ' now has ' + fmtHours(r.hours) + ' h on ' + r.work_date + '.', 'ok');
        } catch (err) { setErr('eoStart', err.message, w); btn.disabled = false; }
      };
    },
  });
}
async function openVoidOvertime(id){
  const r = (otListState.records || []).find(x => Number(x.id) === Number(id)); if (!r) return;
  openModal({
    title:'Void overtime entry', size:'narrow', sub: r.name + ' · ' + r.work_date + ' · ' + fmtHours(r.hours) + ' h',
    body:`<div class="small" style="margin-bottom:10px">The entry stops counting and its row is removed from the Google Sheet. It stays in the log as voided.</div>
      <div class="field"><label for="voReason">Reason (optional)</label><input class="inp" id="voReason" maxlength="200" placeholder="e.g. entered by mistake"></div>
      <div class="err-msg hide" data-err="voReason"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-danger" data-save>Void entry</button>`,
    onMount:(w, close) => { $('[data-save]', w).onclick = async () => {
      const btn = $('[data-save]', w); btn.disabled = true;
      try {
        const reason = $('#voReason', w).value.trim();
        await api('/webhook/employees/api/overtime/void', { method:'POST', body:{ id: r.id, reason } });
        r.status = 'void'; r.void_reason = reason || null;
        close(); paintOtList(); toast('Entry voided', r.name + ' on ' + r.work_date + '.', 'ok');
      } catch (err) { setErr('voReason', err.message, w); btn.disabled = false; }
    }; },
  });
}

/* ============================================================
   Attendance: device export (upload), overview, daily register, by person
   Punches come from the attendance machine's Excel export. Nothing is automated: an editor uploads
   the file, days that are already in the system are skipped, and everything below is worked out
   from the raw punches (so changing the lateness time re-labels past days too).
   ============================================================ */
const LATE_DEFAULT = '08:30';
const SHEETJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const att = { preset:'last30', from:'', to:'', dept:'', type:'', q:'', day:'', chip:'all', sort:'name', data:null, key:'', tab:'' };
const attMins = t => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); return m ? (+m[1]) * 60 + (+m[2]) : 0; };
const attHHMM = n => { n = Math.round(n); return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); };
const isoWeekday = iso => new Date(iso + 'T12:00:00Z').getUTCDay();          // 0 = Sunday
const isWorkDay = iso => { const w = isoWeekday(iso); return w >= 1 && w <= 5; };
const fmtDay = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric', timeZone:'UTC' });
const fmtDayShort = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', timeZone:'UTC' });
const fmtWhen = v => v ? new Date(v).toLocaleString('en-GB', { timeZone:'Africa/Lagos', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '--';

function presetRange(key){
  const t = todayStr(), y = +t.slice(0, 4), m = +t.slice(5, 7), pad = n => String(n).padStart(2, '0');
  const lastOf = (yy, mm) => new Date(Date.UTC(yy, mm, 0)).toISOString().slice(0, 10);
  switch (key) {
    case 'month': return [`${y}-${pad(m)}-01`, t];
    case 'last30': return [addDays(t, -29), t];
    case 'last90': return [addDays(t, -89), t];
    case 'lastmonth': { const pm = m === 1 ? 12 : m - 1, py = m === 1 ? y - 1 : y; return [`${py}-${pad(pm)}-01`, lastOf(py, pm)]; }
    case 'year': return [`${y}-01-01`, t];
  }
  return null;
}
function initAttPeriod(){ if (!att.from) { const r = presetRange(att.preset); att.from = r[0]; att.to = r[1]; } }
const PERIODS = [['month','This month'],['last30','Last 30 days'],['last90','Last 90 days'],['lastmonth','Last month'],['year','This year'],['custom','Custom']];

function periodFields(s, p){      // p = element id prefix; shared by attendance and overtime
  return `<div class="field" style="margin:0"><label for="${p}Preset">Period</label><select class="inp" id="${p}Preset">${PERIODS.map(([k, l]) => `<option value="${k}" ${s.preset === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="field" style="margin:0"><label for="${p}From">From</label><input class="inp" type="date" id="${p}From" value="${esc(s.from)}"></div>
    <div class="field" style="margin:0"><label for="${p}To">To</label><input class="inp" type="date" id="${p}To" value="${esc(s.to)}"></div>`;
}
function bindPeriodFields(s, p, onRange){
  $('#' + p + 'Preset').onchange = e => {
    s.preset = e.target.value; const r = presetRange(s.preset);
    if (r) { s.from = r[0]; s.to = r[1]; $('#' + p + 'From').value = s.from; $('#' + p + 'To').value = s.to; onRange(); }
  };
  $('#' + p + 'From').onchange = e => { s.from = e.target.value; s.preset = 'custom'; $('#' + p + 'Preset').value = 'custom'; onRange(); };
  $('#' + p + 'To').onchange = e => { s.to = e.target.value; s.preset = 'custom'; $('#' + p + 'Preset').value = 'custom'; onRange(); };
}
function deptOptionsHtml(sel, label){
  return `<option value="">${esc(label || 'All departments')}</option>` + (S.departments || []).map(d => `<option value="${esc(d)}" ${sel === d ? 'selected' : ''}>${esc(d)}</option>`).join('');
}

/* ---- loading ---- */
async function attFetchRange(from, to){
  return api('/webhook/employees/api/attendance?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to));
}
async function attEnsure(){
  const key = att.from + '|' + att.to;
  if (att.data && att.key === key) return att.data;
  att.data = null;
  const res = await attFetchRange(att.from, att.to);
  att.data = { late_after: res.late_after || LATE_DEFAULT, days: res.days || [], rows: res.rows || [] };
  att.key = key;
  return att.data;
}

/* ---- the numbers ---- */
function attCompute(){
  const d = att.data, lateM = attMins(d.late_after || LATE_DEFAULT);
  const days = (d.days || []).map(x => String(x.date).slice(0, 10)).filter(x => x >= att.from && x <= att.to && isWorkDay(x)).sort();   // weekends count as overtime, not attendance
  const idx = new Map();
  (d.rows || []).forEach(r => { let m = idx.get(r[0]); if (!m) idx.set(r[0], m = new Map()); m.set(String(r[1]).slice(0, 10), { i:r[2], o:r[3], n:Number(r[4]) }); });
  const q = att.q.trim().toLowerCase();
  const emps = S.employees.filter(e => (!att.dept || e.department === att.dept) && (!att.type || e.employment_type === att.type)
    && (!q || String(e.name).toLowerCase().includes(q) || String(e.enroll_id).toLowerCase().includes(q))
    && (isActiveEmp(e) || idx.has(e.enroll_id)));
  const expected = (e, day) => {
    if (!isWorkDay(day)) return false;
    if (e.join_date && String(e.join_date).slice(0, 10) > day) return false;
    if (!isActiveEmp(e)) { const l = String(e.left_date || '').slice(0, 10); return !!l && day <= l; }
    return true;
  };
  const recs = [];
  emps.forEach(e => {
    const m = idx.get(e.enroll_id);
    days.forEach(day => {
      const p = m && m.get(day);
      if (!p) { if (expected(e, day)) recs.push({ e, day, absent:true }); return; }
      let i = p.i, o = p.o, missing = null;
      if (p.n <= 1) { if (attMins(p.i) < 720) { o = null; missing = 'out'; } else { i = null; o = p.i; missing = 'in'; } }
      const lateMin = i ? Math.max(0, attMins(i) - lateM) : 0;
      recs.push({ e, day, i, o, missing, lateMin, late: lateMin > 0, present:true });
    });
  });
  const byEmp = new Map(emps.map(e => [e.enroll_id, { e, present:0, late:0, absent:0, missing:0, arrSum:0, arrN:0, lateSum:0 }]));
  const byDay = new Map(days.map(day => [day, { day, present:0, late:0, absent:0, missing:0, expected:0 }]));
  recs.forEach(r => {
    const a = byEmp.get(r.e.enroll_id), dd = byDay.get(r.day);
    if (r.absent) { a.absent++; dd.absent++; dd.expected++; return; }
    a.present++; dd.present++; if (expected(r.e, r.day)) dd.expected++;
    if (r.i) { a.arrSum += attMins(r.i); a.arrN++; }
    if (r.late) { a.late++; dd.late++; a.lateSum += r.lateMin; }
    if (r.missing) { a.missing++; dd.missing++; }
  });
  const dayList = days.map(day => byDay.get(day));
  const base = dayList;
  const sum = (arr, k) => arr.reduce((t, x) => t + x[k], 0);
  const people = [...byEmp.values()];
  const arrN = sum(people, 'arrN');
  return {
    late: d.late_after || LATE_DEFAULT, days, recs, people, dayList, emps,
    workingDays: dayList.length, avgPresent: base.length ? sum(base, 'present') / base.length : 0, avgExpected: base.length ? sum(base, 'expected') / base.length : 0,
    lateTotal: sum(people, 'late'), latePeople: people.filter(p => p.late > 0).length, absentTotal: sum(people, 'absent'), absentPeople: people.filter(p => p.absent > 0).length, missingTotal: sum(people, 'missing'),
    lateRate: arrN ? sum(people, 'late') / arrN : 0,
  };
}
function attGroup(people, keyFn){
  const g = new Map();
  people.forEach(p => { const k = keyFn(p.e) || 'No department'; if (!g.has(k)) g.set(k, { key:k, n:0, present:0, late:0, absent:0, arrN:0 }); const x = g.get(k); x.n++; x.present += p.present; x.late += p.late; x.absent += p.absent; x.arrN += p.arrN; });
  return [...g.values()];
}

/* ---- page frame ---- */
function attTabs(tab){
  const tabs = [['overview', 'Overview', '/attendance'], ['daily', 'Daily', '/attendance/daily'], ['people', 'By person', '/attendance/people'], ['setup', 'Upload & settings', '/attendance/upload']];
  return `<div class="tabs">${tabs.map(([k, l, p]) => `<a class="tab ${tab === k ? 'on' : ''}" href="#${p}" style="text-decoration:none">${l}</a>`).join('')}</div>`;
}
function attFilterBar(withQ){
  return `<div class="row filter-bar" style="margin-bottom:14px">${periodFields(att, 'af')}
    <div class="field" style="margin:0"><label for="afDept">Department</label><select class="inp" id="afDept">${deptOptionsHtml(att.dept)}</select></div>
    <div class="field" style="margin:0"><label for="afType">Type</label><select class="inp" id="afType"><option value="">Staff and casual</option><option value="staff" ${att.type === 'staff' ? 'selected' : ''}>Staff</option><option value="casual" ${att.type === 'casual' ? 'selected' : ''}>Casual</option></select></div>
    ${withQ ? `<div class="field" style="margin:0"><label for="afQ">Person</label><input class="inp" id="afQ" placeholder="Search name or ID" value="${esc(att.q)}"></div>` : ''}</div>`;
}
function viewAttendance(tab){
  initAttPeriod(); att.tab = tab;
  const filtered = ['overview', 'daily', 'people'].includes(tab);
  return {
    title:'Attendance', crumb:'Attendance',
    html: `${pageHead('Attendance', 'Weekday attendance, lateness and absences from the attendance machine export. Weekends count as overtime.')}${attTabs(tab)}${filtered ? attFilterBar(tab !== 'overview') : ''}
      <div id="attBody"><div class="small muted" style="padding:14px">Loading...</div></div>`,
    bind(){
      if (filtered) {
        const again = () => attLoad(tab);
        bindPeriodFields(att, 'af', again);
        $('#afDept').onchange = e => { att.dept = e.target.value; paintAtt(tab); };
        $('#afType').onchange = e => { att.type = e.target.value; paintAtt(tab); };
        const q = $('#afQ'); if (q) q.oninput = debounce(e => { att.q = e.target.value; paintAtt(tab); }, 150);
      }
      attLoad(tab);
    },
  };
}
async function attLoad(tab){
  if (tab === 'setup') {
    if (!$('#attBody')) return;
    $('#attBody').innerHTML = `<div id="attUp"></div><div id="attSet" style="margin-top:18px"></div><div id="attHist" style="margin-top:18px"></div>`;
    paintAttUpload(); loadAttHistory();
    try { await attEnsure(); } catch (e) { /* settings fall back to the default time */ }
    return paintAttSettings($('#attSet'));
  }
  const body = $('#attBody'); if (body) body.innerHTML = `<div class="small muted" style="padding:14px">Loading...</div>`;
  try { await attEnsure(); } catch (err) { if ($('#attBody')) $('#attBody').innerHTML = `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load attendance', esc(err.message))}</div></div>`; return; }
  paintAtt(tab);
}
function paintAtt(tab){
  const body = $('#attBody'); if (!body || att.tab !== tab || !att.data) return;
  const c = attCompute();
  if (!c.days.length) {
    body.innerHTML = `<div class="card"><div class="card-b">${emptyState('clock', 'No attendance in this period', 'Nothing has been uploaded for these dates yet. Pick another period' + (S.me.permission === 'editor' ? ' or upload the machine export.' : '.'),
      S.me.permission === 'editor' ? `<a class="btn btn-primary" href="#/attendance/upload">${I.plus} Upload attendance</a>` : '')}</div></div>`;
    return;
  }
  if (tab === 'daily') return paintAttDaily(body, c);
  if (tab === 'people') return paintAttPeople(body, c);
  paintAttOverview(body, c);
}
const pctTxt = n => (Math.round(n * 1000) / 10) + '%';

/* ---- Overview ---- */
function paintAttOverview(body, c){
  const depRows = attGroup(c.people, e => e.department).sort((a, b) => b.n - a.n);
  const topLate = c.people.filter(p => p.late > 0).sort((a, b) => b.late - a.late || b.lateSum - a.lateSum).slice(0, 10);
  const minDays = Math.min(3, c.dayList.length);
  const topEarly = c.people.filter(p => p.arrN >= minDays && p.arrN > 0).sort((a, b) => a.arrSum / a.arrN - b.arrSum / b.arrN || b.arrN - a.arrN).slice(0, 10);
  const wd = c.workingDays || 1;
  body.innerHTML = `
    <div class="grid g4" style="margin-bottom:16px">
      ${statCard('Working days', c.workingDays, 'weekdays with attendance uploaded', 'clock', 'brand')}
      ${statCard('Avg present per day', fmtHours(c.avgPresent), 'of ' + fmtHours(c.avgExpected) + ' on the payroll', 'users', 'ok')}
      ${statCard('Late arrivals', c.lateTotal, 'first punch after ' + c.late + ' - ' + c.latePeople + ' ' + (c.latePeople === 1 ? 'person' : 'people'), 'alert', 'warn')}
      ${statCard('People absent', c.absentPeople, c.absentTotal + ' absent ' + (c.absentTotal === 1 ? 'day' : 'days') + ' in total', 'x', 'danger')}
    </div>
    <div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>By day</h3><div class="sub">Click a day to open its register</div></div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>Present</th><th>Late</th><th>Absent</th><th>No out/in punch</th><th style="width:28%">Attendance</th></tr></thead>
      <tbody>${c.dayList.map(x => `<tr class="clickable" onclick="attGoDay('${x.day}')"><td data-label="Date" class="strong">${esc(fmtDayShort(x.day))}</td><td data-label="Present" class="tnum">${x.present}</td>
        <td data-label="Late" class="tnum">${x.late}</td><td data-label="Absent" class="tnum">${x.absent}</td><td data-label="Missing punch" class="tnum">${x.missing}</td>
        <td data-label="Attendance">${x.expected ? `<div class="bar ${x.present / x.expected < 0.8 ? 'warn' : 'ok'}"><i style="width:${Math.min(100, Math.round(x.present / x.expected * 100))}%"></i></div>` : ''}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="grid g2" style="margin-bottom:16px">
      <div class="card"><div class="card-h"><h3>Most late</h3><div class="sub">Days arriving after ${esc(c.late)}</div></div>
        ${topLate.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Late days</th><th>Avg late</th></tr></thead>
        <tbody>${topLate.map(p => `<tr><td data-label="Name"><div class="strong">${esc(p.e.name)}</div><div class="tiny muted">${esc(p.e.department || '--')}</div></td><td data-label="Late days" class="tnum strong">${p.late}</td><td data-label="Avg late" class="tnum">${Math.round(p.lateSum / p.late)} min</td></tr>`).join('')}</tbody></table></div>`
        : `<div class="card-b small muted">Nobody was late in this period.</div>`}</div>
      <div class="card"><div class="card-h"><h3>Most early</h3><div class="sub">Earliest average first punch</div></div>
        ${topEarly.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Avg arrival</th><th>Days</th></tr></thead>
        <tbody>${topEarly.map(p => `<tr><td data-label="Name"><div class="strong">${esc(p.e.name)}</div><div class="tiny muted">${esc(p.e.department || '--')}</div></td><td data-label="Avg arrival" class="tnum strong">${attHHMM(p.arrSum / p.arrN)}</td><td data-label="Days" class="tnum">${p.arrN}</td></tr>`).join('')}</tbody></table></div>`
        : `<div class="card-b small muted">Not enough days to rank in this period.</div>`}</div>
    </div>
    <div class="card"><div class="card-h"><h3>By department</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Department</th><th>People</th><th>Avg/day</th><th>Late</th><th>Absent</th><th>Late rate</th></tr></thead>
      <tbody>${depRows.map(x => `<tr><td data-label="Department" class="strong">${esc(x.key)}</td><td data-label="People" class="tnum">${x.n}</td><td class="tnum">${fmtHours(x.present / wd)}</td><td class="tnum">${x.late}</td><td class="tnum">${x.absent}</td><td class="tnum">${x.arrN ? pctTxt(x.late / x.arrN) : '--'}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="small muted" style="margin-top:12px">Weekdays only. Late = first punch after ${esc(c.late)}. Absent = on the payroll that day (join and left dates respected) with no punch. Days that have not been uploaded are never counted as absences.</div>`;
}
function attGoDay(day){ att.day = day; go('/attendance/daily'); }

/* ---- Daily register ---- */
function attStatusBadges(r){
  if (r.absent) return '<span class="badge b-danger">Absent</span>';
  const a = r.late ? `<span class="badge b-warn">Late ${r.lateMin} min</span>` : (r.i ? '<span class="badge b-ok">On time</span>' : '<span class="badge b-info">Present</span>');
  const b = r.missing ? ` <span class="badge b-slate">No ${r.missing === 'out' ? 'out' : 'in'} punch</span>` : '';
  return a + b;
}
function paintAttDaily(body, c){
  const days = c.days.slice().reverse();
  if (!days.includes(att.day)) att.day = days[0];
  const recs = c.recs.filter(r => r.day === att.day);
  const cnt = { all:recs.length, present:recs.filter(r => r.present).length, late:recs.filter(r => r.late).length, absent:recs.filter(r => r.absent).length, missing:recs.filter(r => r.missing).length };
  const show = recs.filter(r => att.chip === 'all' || (att.chip === 'present' && r.present) || (att.chip === 'late' && r.late) || (att.chip === 'absent' && r.absent) || (att.chip === 'missing' && r.missing))
    .sort((a, b) => a.e.name.localeCompare(b.e.name));
  const k = days.indexOf(att.day);
  const chip = (key, label) => `<span class="chip ${att.chip === key ? 'on' : ''}" data-chip="${key}" style="cursor:pointer">${label} ${cnt[key]}</span>`;
  body.innerHTML = `
    <div class="row between" style="margin-bottom:12px;flex-wrap:wrap;gap:10px">
      <div class="row" style="gap:8px"><button class="btn btn-ghost btn-sm" id="adPrev" ${k >= days.length - 1 ? 'disabled' : ''} aria-label="Previous day">${I.chevL}</button>
        <select class="inp" id="adDay" style="width:auto">${days.map(d => `<option value="${d}" ${d === att.day ? 'selected' : ''}>${esc(fmtDay(d))}</option>`).join('')}</select>
        <button class="btn btn-ghost btn-sm" id="adNext" ${k <= 0 ? 'disabled' : ''} aria-label="Next day">${I.chevR}</button></div>
      <div class="row" style="gap:6px;flex-wrap:wrap">${chip('all', 'Everyone')}${chip('present', 'Present')}${chip('late', 'Late')}${chip('absent', 'Absent')}${chip('missing', 'Missing a punch')}</div></div>
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Department</th><th>Type</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
      <tbody>${show.length ? show.map(r => `<tr><td data-label="Name"><div class="strong">${esc(r.e.name)}</div><div class="tiny muted mono">${esc(r.e.enroll_id)}</div></td><td data-label="Department">${esc(r.e.department || '--')}</td>
        <td data-label="Type">${esc(r.e.employment_type === 'casual' ? 'Casual' : 'Staff')}</td><td data-label="In" class="tnum">${esc(r.i || '--')}</td><td data-label="Out" class="tnum">${esc(r.o || '--')}</td>
        <td data-label="Status">${attStatusBadges(r)}</td></tr>`).join('')
        : `<tr><td colspan="6"><div class="small muted" style="padding:10px">Nobody matches this filter on ${esc(fmtDay(att.day))}.</div></td></tr>`}</tbody></table></div></div>`;
  $('#adDay').onchange = e => { att.day = e.target.value; paintAtt('daily'); };
  $('#adPrev').onclick = () => { att.day = days[k + 1]; paintAtt('daily'); };
  $('#adNext').onclick = () => { att.day = days[k - 1]; paintAtt('daily'); };
  $$('[data-chip]').forEach(x => x.onclick = () => { att.chip = x.dataset.chip; paintAtt('daily'); });
}

/* ---- By person ---- */
function attPersonRows(c){
  const rows = c.people.filter(p => p.present || p.absent);
  const sorters = { name:(a, b) => a.e.name.localeCompare(b.e.name), late:(a, b) => b.late - a.late || a.e.name.localeCompare(b.e.name),
    absent:(a, b) => b.absent - a.absent || a.e.name.localeCompare(b.e.name), present:(a, b) => b.present - a.present || a.e.name.localeCompare(b.e.name) };
  return rows.sort(sorters[att.sort] || sorters.name);
}
function paintAttPeople(body, c){
  const rows = attPersonRows(c);
  body.innerHTML = `
    <div class="row between" style="margin-bottom:12px;flex-wrap:wrap;gap:10px">
      <div class="small muted">${rows.length} ${rows.length === 1 ? 'person' : 'people'} over ${c.dayList.length} ${c.dayList.length === 1 ? 'day' : 'days'} of data. Click a name for their day-by-day record.</div>
      <div class="row" style="gap:8px"><select class="inp" id="apSort" style="width:auto"><option value="name">Sort: name</option><option value="late" ${att.sort === 'late' ? 'selected' : ''}>Sort: most late</option><option value="absent" ${att.sort === 'absent' ? 'selected' : ''}>Sort: most absent</option><option value="present" ${att.sort === 'present' ? 'selected' : ''}>Sort: most present</option></select>
      <button class="btn btn-ghost" id="apCsv">${I.download} Export CSV</button></div></div>
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Department</th><th>Days present</th><th>Days late</th><th>Days absent</th><th>Avg arrival</th></tr></thead>
      <tbody>${rows.map(p => `<tr class="clickable" onclick="openAttPerson('${esc(p.e.enroll_id)}')"><td data-label="Name"><div class="strong">${esc(p.e.name)}</div><div class="tiny muted mono">${esc(p.e.enroll_id)} - ${esc(p.e.employment_type === 'casual' ? 'Casual' : 'Staff')}</div></td>
        <td data-label="Department">${esc(p.e.department || '--')}</td><td data-label="Days present" class="tnum">${p.present}</td><td data-label="Days late" class="tnum ${p.late ? 'strong' : ''}">${p.late}</td>
        <td data-label="Days absent" class="tnum ${p.absent ? 'strong' : ''}">${p.absent}</td><td data-label="Avg arrival" class="tnum">${p.arrN ? attHHMM(p.arrSum / p.arrN) : '--'}</td></tr>`).join('')}</tbody></table></div></div>`;
  $('#apSort').onchange = e => { att.sort = e.target.value; paintAtt('people'); };
  $('#apCsv').onclick = () => attPeopleCsv(c);
}
function attPeopleCsv(c){
  const cell = v => { const t = v == null ? '' : String(v); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  const lines = [['Enroll ID', 'Name', 'Department', 'Type', 'Days present', 'Days late', 'Days absent', 'Missing punch days', 'Avg arrival'].join(',')].concat(attPersonRows(c).map(p =>
    [p.e.enroll_id, p.e.name, p.e.department, p.e.employment_type, p.present, p.late, p.absent, p.missing, p.arrN ? attHHMM(p.arrSum / p.arrN) : ''].map(cell).join(',')));
  download('okl_attendance_' + att.from + '_to_' + att.to + '.csv', lines.join('\n'), 'text/csv;charset=utf-8');
}
function openAttPerson(id){
  if (!att.data) return;
  const c = attCompute(), p = c.people.find(x => x.e.enroll_id === id); if (!p) return;
  const recs = c.recs.filter(r => r.e.enroll_id === id).sort((a, b) => a.day < b.day ? 1 : -1);
  openModal({
    title: p.e.name, size:'wide', sub: (p.e.department || 'No department') + ' - ' + att.from + ' to ' + att.to,
    body: `<div class="grid g4" style="margin-bottom:12px">${[['Present', p.present], ['Late', p.late], ['Absent', p.absent], ['Avg arrival', p.arrN ? attHHMM(p.arrSum / p.arrN) : '--']].map(([l, v]) => `<div class="stat"><div class="lbl">${l}</div><div class="val">${v}</div></div>`).join('')}</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
      <tbody>${recs.map(r => `<tr><td data-label="Date">${esc(fmtDayShort(r.day))}</td><td data-label="In" class="tnum">${esc(r.i || '--')}</td><td data-label="Out" class="tnum">${esc(r.o || '--')}</td><td data-label="Status">${attStatusBadges(r)}</td></tr>`).join('')}</tbody></table></div>`,
    footer: `<button class="btn btn-ghost" data-close>Close</button>`,
  });
}

/* ---- Settings ---- */
function paintAttSettings(body){
  if (!body || att.tab !== 'setup') return;
  const canEdit = S.me.permission === 'editor', late = att.data.late_after || LATE_DEFAULT;
  body.innerHTML = `<div class="card"><div class="card-h"><h3>Lateness</h3></div><div class="card-b">
    <div class="field"><label for="asLate">Late after</label><input class="inp" type="time" id="asLate" value="${esc(late)}" ${canEdit ? '' : 'disabled'}>
      <div class="hint">${I.info}<span>A first punch after this time counts as late; exactly this time is on time. Changing it re-labels every day already uploaded.</span></div>
      <div class="err-msg hide" data-err="asLate"></div></div>
    ${canEdit ? `<button class="btn btn-primary" id="asSave">${I.check} Save</button>` : '<div class="small muted">Only editors can change this.</div>'}</div></div>`;
  const save = $('#asSave');
  if (save) save.onclick = async () => {
    clearErrors(body); const v = $('#asLate').value;
    if (!v) return setErr('asLate', 'Enter a time such as 08:30.', body);
    save.disabled = true;
    try { const res = await api('/webhook/employees/api/attendance/settings', { method:'POST', body:{ late_after: v } }); att.data.late_after = res.late_after || v; toast('Lateness updated', 'Late is now after ' + att.data.late_after + '.', 'ok'); }
    catch (err) { setErr('asLate', err.message, body); }
    save.disabled = false;
  };
}

/* ---- History ---- */
async function loadAttHistory(){
  const body = $('#attHist'); if (body) body.innerHTML = `<div class="small muted" style="padding:14px">Loading history...</div>`;
  let list = [];
  try { list = (await api('/webhook/employees/api/attendance/imports')).imports || []; }
  catch (err) { if ($('#attHist')) $('#attHist').innerHTML = `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load history', esc(err.message))}</div></div>`; return; }
  if (!$('#attHist') || att.tab !== 'setup') return;
  $('#attHist').innerHTML = `<div class="card"><div class="card-h"><h3>Upload history</h3></div>${list.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Uploaded</th><th>File</th><th>By</th><th>Period</th><th>Days</th><th>Punches</th><th>Unknown IDs</th></tr></thead>
    <tbody>${list.map(i => `<tr><td data-label="Uploaded">${esc(fmtWhen(i.uploaded_at))}</td><td data-label="File" class="small">${esc(i.file_name || '--')}</td><td data-label="By">${esc(i.uploaded_by || '--')}</td>
      <td data-label="Period">${i.first_date ? esc(String(i.first_date).slice(0, 10) + ' to ' + String(i.last_date).slice(0, 10)) : '--'}</td>
      <td data-label="Days">${i.days_imported} imported${i.days_skipped ? ', ' + i.days_skipped + ' skipped' : ''}${i.days_replaced ? ', ' + i.days_replaced + ' replaced' : ''}</td>
      <td data-label="Punches" class="tnum">${i.punches_saved}</td><td data-label="Unknown IDs" class="tnum" title="${esc((i.unmatched || []).join(', '))}">${(i.unmatched || []).length}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="card-b">${emptyState('clock', 'Nothing uploaded yet', 'Each upload of the machine export is listed here.')}</div>`}</div>`;
}

/* ---- Upload ---- */
const attUp = { name:'', grid:null, year:null, verified:false, days:[], punches:[], entered:new Set(), replace:new Set(), busy:false, result:null, error:'' };

// rows = the sheet as an array of arrays. Pure function (no SheetJS needed) so it can be tested.
function attParseGrid(rows){
  const dateRe = /^\s*(\d{1,2})\/(\d{1,2})(?:\s+([A-Za-z]{3}))?/;
  let h = -1;
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const cells = (rows[r] || []).map(x => String(x == null ? '' : x));
    if (cells.some(x => /enroll\s*id|user\s*id/i.test(x)) && cells.some(x => dateRe.test(x))) { h = r; break; }
  }
  if (h < 0) return null;
  const head = rows[h].map(x => String(x == null ? '' : x).trim());
  let idCol = head.findIndex(x => /^enroll\s*id$/i.test(x)); if (idCol < 0) idCol = head.findIndex(x => /^user\s*id$/i.test(x));
  const nameCol = head.findIndex(x => /^name$/i.test(x));
  const cols = [];
  head.forEach((x, i) => { const m = dateRe.exec(x); if (m && i !== idCol) cols.push({ idx:i, m:+m[1], d:+m[2], wd:m[3] ? m[3].slice(0, 3).toLowerCase() : '' }); });
  const toTimes = v => {
    if (v == null || v === '') return [];
    if (typeof v === 'number') { if (v > 0 && v < 1) { const t = Math.round(v * 1440); return [attHHMM(t % 1440)]; } return []; }
    const out = []; String(v).replace(/(\d{1,2}):(\d{2})/g, (_, a, b) => { if (+a < 24 && +b < 60) { const t = String(+a).padStart(2, '0') + ':' + b; if (!out.includes(t)) out.push(t); } return ''; });
    return out;
  };
  const people = [];
  for (let r = h + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    let id = String(row[idCol] == null ? '' : row[idCol]).trim().replace(/\.0+$/, '');
    if (!id) continue;
    const cells = {}; cols.forEach(c => { const t = toTimes(row[c.idx]); if (t.length) cells[c.idx] = t; });
    people.push({ id, name: nameCol >= 0 ? String(row[nameCol] == null ? '' : row[nameCol]).trim() : '', cells });
  }
  return { cols, people };
}
const WD3 = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
// the file has day and month but no year: assign years (rolling over after December) from a starting year
function attColDates(cols, startYear){
  let y = startYear, prev = 0; const out = [];
  cols.forEach(c => {
    if (c.m < prev) y++; prev = c.m;
    const dt = new Date(Date.UTC(y, c.m - 1, c.d, 12));
    out.push(dt.getUTCMonth() === c.m - 1 && dt.getUTCDate() === c.d ? dt.toISOString().slice(0, 10) : null);
  });
  return out;
}
function attWeekdaysMatch(cols, dates){ return cols.every((c, i) => !c.wd || (dates[i] && WD3[isoWeekday(dates[i])] === c.wd)); }
// the year whose calendar agrees with the weekday labels (latest year that is not in the future)
function attInferYear(cols, today){
  const cy = +today.slice(0, 4);
  for (let y = cy + 1; y >= cy - 10; y--) {
    const dates = attColDates(cols, y), last = dates.filter(Boolean).pop();
    if (last && last <= addDays(today, 1) && attWeekdaysMatch(cols, dates)) return { year:y, verified:true };
  }
  return { year:cy, verified:false };
}
function attBuildPunches(grid, dates){
  const punches = [], perDay = new Map();
  grid.cols.forEach((c, i) => { if (dates[i]) perDay.set(dates[i], { date:dates[i], people:0, punches:0 }); });
  grid.people.forEach(p => grid.cols.forEach((c, i) => {
    const t = p.cells[c.idx], d = dates[i]; if (!t || !d) return;
    const dd = perDay.get(d); dd.people++; dd.punches += t.length;
    t.forEach(x => punches.push({ i:p.id, d, t:x }));
  }));
  return { punches, days:[...perDay.values()].sort((a, b) => a.date < b.date ? -1 : 1) };
}
function loadSheetJS(){
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = SHEETJS_URL;
    s.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error('The spreadsheet reader did not load.'));
    s.onerror = () => reject(new Error('Could not load the spreadsheet reader. Check your connection and try again.'));
    document.head.appendChild(s);
  });
}
async function attReadFile(file){
  const XLSX = await loadSheetJS();
  const wb = XLSX.read(await file.arrayBuffer(), { type:'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { header:1, raw:false, defval:'' });
}
async function attRefreshUpload(){
  const g = attUp.grid; if (!g) return;
  const dates = attColDates(g.cols, attUp.year);
  attUp.verified = attWeekdaysMatch(g.cols, dates);
  const built = attBuildPunches(g, dates); attUp.punches = built.punches; attUp.days = built.days;
  attUp.entered = new Set(); attUp.replace = new Set();
  if (built.days.length) {
    try { const res = await attFetchRange(built.days[0].date, built.days[built.days.length - 1].date); (res.days || []).forEach(x => attUp.entered.add(String(x.date).slice(0, 10))); }
    catch (err) { attUp.error = err.message; }
  }
  paintAttUpload();
}
async function attChooseFile(file){
  Object.assign(attUp, { name:file.name, grid:null, result:null, error:'', busy:true, days:[], punches:[] }); paintAttUpload();
  try {
    const grid = attParseGrid(await attReadFile(file));
    if (!grid || !grid.cols.length) throw new Error('This does not look like the machine export: no Enroll ID / User ID column with date columns (like "09/21 Mon") was found.');
    if (!grid.people.length) throw new Error('The file has no people rows.');
    attUp.grid = grid;
    const inf = attInferYear(grid.cols, todayStr()); attUp.year = inf.year;
  } catch (err) { attUp.error = err.message; attUp.busy = false; paintAttUpload(); return; }
  attUp.busy = false; await attRefreshUpload();
}
function paintAttUpload(){
  const body = $('#attUp'); if (!body || att.tab !== 'setup') return;
  if (S.me.permission !== 'editor') { body.innerHTML = ''; return; }
  const u = attUp, known = new Set(S.employees.map(e => e.enroll_id));
  const g = u.grid, unknown = g ? [...new Set(g.people.map(p => p.id).filter(id => !known.has(id)))] : [];
  const todo = u.days.filter(d => !u.entered.has(d.date) || u.replace.has(d.date));
  const years = []; const cy = +todayStr().slice(0, 4); for (let y = cy + 1; y >= cy - 10; y--) years.push(y);
  let html = `<div class="card"><div class="card-h"><h3>Upload attendance</h3></div><div class="card-b">
    <div class="field" style="margin:0"><label for="upFile">Machine export (.xls or .xlsx)</label><input class="inp" type="file" id="upFile" accept=".xls,.xlsx,.csv"></div>
    <div class="hint" style="margin-top:8px">${I.info}<span>Every date column carries its own day and month, so you do not pick dates. Days that are already in the system are skipped, so overlapping exports are safe.</span></div></div></div>`;
  if (u.busy) html += `<div class="small muted" style="padding:14px">Reading the file...</div>`;
  if (u.error) html += `<div class="card" style="margin-top:14px"><div class="card-b" style="color:var(--danger)">${esc(u.error)}</div></div>`;
  if (g && !u.busy && u.days.length) {
    html += `<div class="card" style="margin-top:14px"><div class="card-h row between"><div><h3>${esc(u.name)}</h3>
      <div class="sub">${u.days.length} ${u.days.length === 1 ? 'day' : 'days'} found, ${esc(fmtDayShort(u.days[0].date))} to ${esc(fmtDayShort(u.days[u.days.length - 1].date))} - ${g.people.length} people - ${u.punches.length} punches</div></div>
      <div class="field" style="margin:0"><label for="upYear" class="tiny">Year of the first column</label><select class="inp" id="upYear" style="width:auto">${years.map(y => `<option ${y === u.year ? 'selected' : ''}>${y}</option>`).join('')}</select></div></div>
      ${u.verified ? '' : `<div class="card-b" style="color:var(--warn)">The weekday labels in the file do not match ${u.year}. Check the year before importing.</div>`}
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>People</th><th>Punches</th><th>Status</th><th>Replace?</th></tr></thead>
      <tbody>${u.days.map(d => { const en = u.entered.has(d.date); return `<tr><td data-label="Date" class="strong">${esc(fmtDay(d.date))}</td><td data-label="People" class="tnum">${d.people}</td><td data-label="Punches" class="tnum">${d.punches}</td>
        <td data-label="Status">${en ? (u.replace.has(d.date) ? '<span class="badge b-warn">Will replace</span>' : '<span class="badge b-slate">Already entered - skipped</span>') : '<span class="badge b-ok">New</span>'}</td>
        <td data-label="Replace?">${en ? `<label class="row" style="gap:6px;margin:0;font-weight:500"><input type="checkbox" data-rep="${d.date}" ${u.replace.has(d.date) ? 'checked' : ''}> replace this day</label>` : ''}</td></tr>`; }).join('')}</tbody></table></div>
      ${unknown.length ? `<div class="card-b small" style="border-top:1px solid var(--line-2)"><span class="strong">${unknown.length} ID${unknown.length === 1 ? '' : 's'} in the file ${unknown.length === 1 ? 'is' : 'are'} not in the employee list</span> and will be ignored: <span class="mono">${esc(unknown.slice(0, 12).join(', '))}${unknown.length > 12 ? ' ...' : ''}</span></div>` : ''}
      <div class="card-b row between" style="border-top:1px solid var(--line-2);flex-wrap:wrap;gap:10px"><div class="small muted">${todo.length ? todo.length + ' ' + (todo.length === 1 ? 'day' : 'days') + ' will be imported.' : 'Every day in this file is already entered.'}</div>
        <button class="btn btn-primary" id="upGo" ${todo.length ? '' : 'disabled'}>${I.check} Import ${todo.length || ''} ${todo.length === 1 ? 'day' : 'days'}</button></div></div>`;
  }
  if (u.result) {
    const r = u.result;
    html += `<div class="card" style="margin-top:14px"><div class="card-b">${r.nothing_new ? `<div class="strong">Nothing new to import</div><div class="small muted">All ${r.days_skipped} days in the file were already entered.</div>`
      : `<div class="strong" style="color:var(--ok)">Imported ${r.days_imported} ${r.days_imported === 1 ? 'day' : 'days'}</div>
         <div class="small">${r.punches_saved} punches saved${r.days_skipped ? ', ' + r.days_skipped + ' ' + (r.days_skipped === 1 ? 'day' : 'days') + ' skipped (already entered)' : ''}${r.days_replaced ? ', ' + r.days_replaced + ' replaced' : ''}${(r.unmatched || []).length ? ', ' + r.unmatched.length + ' unknown IDs ignored' : ''}.</div>`}
      <div style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="#/attendance">View attendance</a></div></div></div>`;
  }
  body.innerHTML = html;
  const f = $('#upFile'); f.onchange = () => { if (f.files[0]) attChooseFile(f.files[0]); };
  const y = $('#upYear'); if (y) y.onchange = e => { attUp.year = +e.target.value; attRefreshUpload(); };
  $$('[data-rep]').forEach(c => c.onchange = () => { c.checked ? attUp.replace.add(c.dataset.rep) : attUp.replace.delete(c.dataset.rep); paintAttUpload(); });
  const go1 = $('#upGo'); if (go1) go1.onclick = attImport;
}
async function attImport(){
  const u = attUp, take = new Set(u.days.filter(d => !u.entered.has(d.date) || u.replace.has(d.date)).map(d => d.date));
  const punches = u.punches.filter(p => take.has(p.d));
  if (!punches.length) return;
  const ok = await confirmDialog('Import attendance', `Import <strong>${take.size}</strong> ${take.size === 1 ? 'day' : 'days'} (${punches.length} punches)?` + (u.replace.size ? ' Days marked "replace" are overwritten.' : ''), 'Import');
  if (!ok) return;
  const btn = $('#upGo'); if (btn) btn.disabled = true;
  try {
    const res = await api('/webhook/employees/api/attendance/import', { method:'POST', body:{ file:u.name, punches, replace:[...u.replace] } });
    u.result = res; att.data = null; att.key = '';
    u.grid = null; u.days = []; u.punches = []; u.entered = new Set(); u.replace = new Set(); u.error = '';
    toast('Attendance imported', res.days_imported + ' ' + (res.days_imported === 1 ? 'day' : 'days') + ' saved.', 'ok');
  } catch (err) { u.error = err.message; }
  paintAttUpload();
}

route('/attendance', () => viewAttendance('overview'));
route('/attendance/daily', () => viewAttendance('daily'));
route('/attendance/people', () => viewAttendance('people'));
route('/attendance/upload', () => viewAttendance('setup'));
route('/attendance/history', () => viewAttendance('setup'));
route('/attendance/settings', () => viewAttendance('setup'));

async function handleExportClick(btn){
  btn.disabled = true;
  try { await exportEmployeesCSV(); }
  catch (err) { toast('Export failed', err.message, 'err'); }
  finally { btn.disabled = false; }
}

function tagsInputValue(values){ return Array.isArray(values) ? values.join(', ') : ''; }
function parseTagsInput(value){ return String(value||'').split(',').map(v => v.trim()).filter(Boolean); }

function employeeFormFields(e, idPrefix){
  e = e || {};
  const id = (suffix) => idPrefix + suffix;
  return `
    <div class="grid g2">
      <div class="field"><label for="${id('EnrollId')}">Enroll ID<span class="req">*</span></label>
        <input class="inp" id="${id('EnrollId')}" value="${esc(e.enroll_id||'')}" ${e.enroll_id?'readonly':''} maxlength="20">
        <div class="err-msg hide" data-err="${id('EnrollId')}"></div></div>
      <div class="field"><label for="${id('Name')}">Name<span class="req">*</span></label>
        <input class="inp" id="${id('Name')}" value="${esc(e.name||'')}" maxlength="100">
        <div class="err-msg hide" data-err="${id('Name')}"></div></div>
    </div>
    <div class="grid g2">
      <div class="field"><label for="${id('Gender')}">Gender</label>
        <select class="inp" id="${id('Gender')}">
          <option value="" ${!e.gender?'selected':''}>-</option>
          <option value="Male" ${e.gender==='Male'?'selected':''}>Male</option>
          <option value="Female" ${e.gender==='Female'?'selected':''}>Female</option>
        </select></div>
      <div class="field"><label for="${id('EmploymentType')}">Employment type<span class="req">*</span></label>
        <select class="inp" id="${id('EmploymentType')}">
          <option value="staff" ${e.employment_type!=='casual'?'selected':''}>Staff</option>
          <option value="casual" ${e.employment_type==='casual'?'selected':''}>Casual</option>
        </select></div>
    </div>
    <div class="field"><label for="${id('Role')}">Role</label>
      <input class="inp" id="${id('Role')}" value="${esc(e.role||'')}" maxlength="100"></div>
    <div class="grid g2">
      <div class="field"><label for="${id('Phone')}">Phone number</label>
        <input class="inp" id="${id('Phone')}" value="${esc(e.phone_number||'')}" maxlength="20"></div>
      <div class="field"><label for="${id('Email')}">Work email</label>
        <input class="inp" id="${id('Email')}" type="email" value="${esc(e.work_email||'')}"></div>
    </div>
    <div class="grid g2">
      <div class="field"><label for="${id('Department')}">Department</label>
        <select class="inp" id="${id('Department')}">${departmentOptions(e.department)}</select></div>
      <div class="field"><label for="${id('Workstation')}">Workstation</label>
        <input class="inp" id="${id('Workstation')}" value="${esc(e.workstation||'')}" maxlength="100"></div>
    </div>
    <div class="grid g3">
      <div class="field"><label for="${id('Status')}">Status</label>
        <select class="inp" id="${id('Status')}">
          <option value="active" ${(e.status||'active')!=='inactive'?'selected':''}>Active</option>
          <option value="inactive" ${e.status==='inactive'?'selected':''}>Inactive (left)</option>
        </select></div>
      <div class="field"><label for="${id('JoinDate')}">Join date</label>
        <input class="inp" id="${id('JoinDate')}" type="date" value="${esc(String(e.join_date||'').slice(0,10))}"></div>
      <div class="field"><label for="${id('LeftDate')}">Left date</label>
        <input class="inp" id="${id('LeftDate')}" type="date" value="${esc(String(e.left_date||'').slice(0,10))}">
        <div class="hint">${I.info}<span>Only for inactive staff; today if left blank.</span></div></div>
    </div>
    <div class="field"><label for="${id('Competencies')}">Current competencies</label>
      <input class="inp" id="${id('Competencies')}" value="${esc(tagsInputValue(e.current_competencies))}" placeholder="e.g. Tablet Compression, Granulation">
      <div class="hint">${I.info}<span>Comma-separated - add as many as apply.</span></div></div>
    <div class="field"><label for="${id('SkillGaps')}">Skill gaps</label>
      <input class="inp" id="${id('SkillGaps')}" value="${esc(tagsInputValue(e.skill_gaps))}" placeholder="e.g. Quality Documentation">
      <div class="hint">${I.info}<span>Comma-separated - add as many as apply.</span></div></div>
  `;
}

function departmentOptions(current){
  const list = (S && S.departments) || [];
  const all = current && !list.includes(current) ? [...list, current] : list;
  return `<option value="">-</option>` + all.map(d => `<option value="${esc(d)}" ${current===d?'selected':''}>${esc(d)}</option>`).join('');
}
function readEmployeeForm(idPrefix, scope){
  const id = (suffix) => idPrefix + suffix;
  return {
    enroll_id: $('#'+id('EnrollId'), scope).value.trim(),
    name: $('#'+id('Name'), scope).value.trim(),
    gender: $('#'+id('Gender'), scope).value,
    employment_type: $('#'+id('EmploymentType'), scope).value,
    role: $('#'+id('Role'), scope).value.trim(),
    phone_number: $('#'+id('Phone'), scope).value.trim(),
    work_email: $('#'+id('Email'), scope).value.trim(),
    workstation: $('#'+id('Workstation'), scope).value.trim(),
    department: $('#'+id('Department'), scope).value,
    status: $('#'+id('Status'), scope).value,
    join_date: $('#'+id('JoinDate'), scope).value,
    left_date: $('#'+id('LeftDate'), scope).value,
    current_competencies: parseTagsInput($('#'+id('Competencies'), scope).value),
    skill_gaps: parseTagsInput($('#'+id('SkillGaps'), scope).value),
  };
}

function openAddEmployee(){
  openModal({
    title:'Add employee', size:'wide',
    body:`<form id="addEmployeeForm" novalidate>${employeeFormFields({}, 'ae')}</form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button>
            <button class="btn btn-primary" data-save>${I.plus} Add employee</button>`,
    onMount:(w, close) => {
      $('[data-save]', w).onclick = async () => {
        const f = $('#addEmployeeForm', w); clearErrors(f);
        const payload = readEmployeeForm('ae', w);
        payload.name = properName(payload.name);
        if (!payload.enroll_id) return setErr('aeEnrollId', 'Enter an Enroll ID.', f);
        if (!payload.name) return setErr('aeName', 'Enter a name.', f);
        try {
          await api('/webhook/employees/api/create', { method:'POST', body: payload });
          S.employees.push(payload);
          close(); render(); toast('Employee added', esc(payload.name) + ' is now on record.', 'ok');
        } catch (err) { setErr('aeName', err.message, f); }
      };
    },
  });
}

/* ============================================================
   Settings (change PIN, sign out)
   ============================================================ */


