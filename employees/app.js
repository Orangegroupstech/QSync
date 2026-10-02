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
        <div style="font-size:13px;font-weight:700;color:#fff;letter-spacing:.02em">Employees</div>
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
async function bootstrap(){
  const auth = await api('/webhook/auth/api/me');
  if (auth.user && auth.user.must_change){ toLandingKeepToken(); throw new Error('Password change required'); }
  const [data, dep] = await Promise.all([
    api('/webhook/employees/api/list'),
    api('/webhook/employees/api/departments').catch(() => ({ departments: [] })),
  ]);
  S = { me: meFromAuth(auth, 'employees'), employees: data.employees, departments: dep.departments || [] };
  resetIdleTimer();
}
function loadError(err){
  return `<div style="max-width:480px;margin:80px auto;padding:0 16px;text-align:center;font-family:var(--font,system-ui,sans-serif)">
    <h2 style="color:#B3261E">Could not load Employees</h2>
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
      ${statCard('Total headcount', total, former ? former + ' former ' + (former===1?'employee':'employees') + ' not counted' : 'Staff and casual', 'users', 'brand', '/employees')}
      ${statCard('Staff', staff, pct(staff) + '% of headcount', 'users', 'ok', '/employees')}
      ${statCard('Casual', casual, pct(casual) + '% of headcount', 'users', 'info', '/employees')}
      ${statCard('Skills recorded', skills.length, withSkills + ' ' + (withSkills===1?'person has':'people have') + ' at least one', 'award', 'warn', '/training')}
    </div>
    <div class="card"><div class="card-h"><div><h3>Top skills</h3><div class="sub">Most common current competencies</div></div><a href="#/training" class="small strong">Training &amp; competencies</a></div>
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

function toggleEmployeeRow(enrollId){
  expandedEnrollId = (expandedEnrollId === enrollId) ? null : enrollId;
  expandedMode = 'view';
  render();
}
function startEditingEmployee(enrollId){
  expandedEnrollId = enrollId;
  expandedMode = 'edit';
  render();
}
function cancelEditingEmployee(enrollId){
  expandedMode = 'view';
  render();
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

function viewEmployees(){
  const q = employeeQuery.trim().toLowerCase();
  const rows = S.employees.filter(e =>
    (!employeeTypeFilter || e.employment_type === employeeTypeFilter) &&
    (employeeStatusFilter === 'all' || (e.status || 'active') === employeeStatusFilter) && matchesEmployeeQuery(e, q));
  const canEdit = S.me.permission === 'editor';

  return {
    title:'Employees', crumb:'People',
    html: `
    ${pageHead('Employees', 'Every casual and staff member currently on record.',
      `<button class="btn btn-ghost" onclick="handleExportClick(this)">${I.download} Export CSV</button>` +
      (canEdit ? `<button class="btn btn-primary" onclick="openAddEmployee()">${I.plus} Add employee</button>` : ''))}
    <div class="row filter-bar" style="margin-bottom:14px">
      <div class="search filter-search">
        <span class="ic">${I.search}</span>
        <input class="inp" id="empSearch" placeholder="Search name, enroll ID, role, department, workstation..." value="${esc(employeeQuery)}">
      </div>
      <select class="inp filter-sel-status" id="empTypeFilter">
        <option value="">All employment types</option>
        <option value="staff" ${employeeTypeFilter==='staff'?'selected':''}>Staff</option>
        <option value="casual" ${employeeTypeFilter==='casual'?'selected':''}>Casual</option>
      </select>
      <select class="inp filter-sel-status" id="empStatusFilter">
        <option value="active" ${employeeStatusFilter==='active'?'selected':''}>Active</option>
        <option value="inactive" ${employeeStatusFilter==='inactive'?'selected':''}>Inactive (left)</option>
        <option value="all" ${employeeStatusFilter==='all'?'selected':''}>All employees</option>
      </select>
      <div class="spacer"></div>
    </div>
    <div class="card">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Enroll ID</th><th>Name</th><th>Gender</th><th>Type</th><th>Role</th><th>Department</th><th>Workstation</th><th>Status</th></tr></thead>
        <tbody>${rows.length ? rows.map(e => {
          const isExpanded = e.enroll_id === expandedEnrollId;
          const row = `
          <tr class="clickable" onclick="toggleEmployeeRow('${esc(e.enroll_id)}')">
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
          <tr><td colspan="8" style="padding:0;background:var(--surface-2);border-bottom:1px solid var(--line)">
            <div style="padding:16px">${renderEmployeeExpanded(e, canEdit)}</div>
          </td></tr>` : '';
          return row + expansion;
        }).join('') : `<tr><td colspan="8">${emptyState('users','No employees match', 'Try a different search or filter.')}</td></tr>`}
        </tbody>
      </table></div>
    </div>`,
    bind(){
      $('#empSearch').oninput = debounce((e) => { employeeQuery = e.target.value; render(); }, 200);
      $('#empSearch').focus();
      $('#empSearch').setSelectionRange(employeeQuery.length, employeeQuery.length);
      $('#empTypeFilter').onchange = (e) => { employeeTypeFilter = e.target.value; render(); };
      $('#empStatusFilter').onchange = (e) => { employeeStatusFilter = e.target.value; render(); };

      const editForm = $('#editEmployeeForm');
      if (editForm) {
        editForm.onsubmit = async (ev) => {
          ev.preventDefault();
          clearErrors(editForm);
          const payload = readEmployeeForm('ee', editForm);
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
   Attendance: overtime (inside the Employees console)
   Recording needs edit access to Employees; everyone signed in can read.
   ============================================================ */
const todayStr = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA'); };
let otState = { department:'', date:'', hours:'', people:[], checked:new Set(), q:'', loading:false };

function renderOtPeople(canEdit){
  if (!otState.department) return `<div class="small muted" style="padding:14px 0">Choose a department to see its people.</div>`;
  if (otState.loading) return `<div class="small muted" style="padding:14px 0">Loading...</div>`;
  const q = otState.q.trim().toLowerCase();
  const rows = otState.people.filter(p => !q || p.name.toLowerCase().includes(q) || p.enroll_id.toLowerCase().includes(q));
  if (!otState.people.length) return `<div class="small muted" style="padding:14px 0">Nobody is recorded in this department yet. Set the Department on their employee record first.</div>`;
  return `
    <div class="row between" style="margin:10px 0">
      <div class="search filter-search"><span class="ic">${I.search}</span>
        <input class="inp" id="otQ" placeholder="Search name or enroll ID" value="${esc(otState.q)}"></div>
      <div class="row" style="gap:8px">
        <button class="btn btn-ghost btn-sm" type="button" id="otAll">Tick all shown</button>
        <button class="btn btn-ghost btn-sm" type="button" id="otNone">Clear</button>
      </div>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th style="width:40px"></th><th>Name</th><th>Type</th><th>Already recorded that day</th></tr></thead>
      <tbody>${rows.map(p => `<tr>
        <td><input type="checkbox" data-id="${esc(p.enroll_id)}" ${otState.checked.has(p.enroll_id)?'checked':''} ${canEdit?'':'disabled'}></td>
        <td><div class="strong">${esc(p.name)}</div><div class="tiny muted mono">${esc(p.enroll_id)}</div></td>
        <td><span class="badge ${p.employment_type==='staff'?'b-brand':'b-slate'}">${esc(p.employment_type)}</span></td>
        <td>${p.hours!=null ? esc(String(Number(p.hours))) + ' h' : '--'}</td></tr>`).join('') || `<tr><td colspan="4" class="muted" style="padding:14px">No match.</td></tr>`}</tbody>
    </table></div>
    <div class="row between" style="margin-top:12px">
      <div class="small muted">${otState.checked.size} ticked</div>
      ${canEdit ? `<button class="btn btn-primary" type="button" id="otSave">${I.check} Save overtime</button>` : ''}
    </div>`;
}
async function loadOtPeople(){
  if (!otState.department){ otState.people = []; otState.checked = new Set(); paintOtPeople(); return; }
  otState.loading = true; paintOtPeople();
  try {
    const res = await api('/webhook/employees/api/overtime/people?department=' + encodeURIComponent(otState.department) + '&date=' + encodeURIComponent(otState.date));
    otState.people = res.people || [];
    otState.checked = new Set(otState.people.filter(p => p.hours != null).map(p => p.enroll_id));
    const first = otState.people.find(p => p.hours != null);
    if (first && !otState.hours) { otState.hours = String(Number(first.hours)); const h = $('#otHours'); if (h) h.value = otState.hours; }
  } catch (err) { toast('Could not load people', err.message, 'err'); otState.people = []; }
  otState.loading = false; paintOtPeople();
}
function paintOtPeople(){
  const box = $('#otPeople'); if (!box) return;
  const canEdit = S.me.permission === 'editor';
  box.innerHTML = renderOtPeople(canEdit);
  const q = $('#otQ'); if (q) q.oninput = () => { otState.q = q.value; const pos = q.selectionStart; paintOtPeople(); const n = $('#otQ'); if (n){ n.focus(); n.setSelectionRange(pos, pos); } };
  $$('input[data-id]', box).forEach(c => c.onchange = () => { c.checked ? otState.checked.add(c.dataset.id) : otState.checked.delete(c.dataset.id); paintOtPeople(); });
  const all = $('#otAll'); if (all) all.onclick = () => {
    const ql = otState.q.trim().toLowerCase();
    otState.people.filter(p => !ql || p.name.toLowerCase().includes(ql) || p.enroll_id.toLowerCase().includes(ql)).forEach(p => otState.checked.add(p.enroll_id)); paintOtPeople(); };
  const none = $('#otNone'); if (none) none.onclick = () => { otState.checked = new Set(); paintOtPeople(); };
  const save = $('#otSave'); if (save) save.onclick = saveOvertime;
}
async function saveOvertime(){
  const hours = Number(otState.hours);
  if (!otState.department) return toast('Choose a department', '', 'err');
  if (!otState.date || otState.date > todayStr()) return toast('Check the date', 'Pick today or an earlier date.', 'err');
  if (!Number.isFinite(hours) || hours < 0.5 || hours > 24 || (hours * 2) % 1 !== 0) return toast('Check the hours', 'Between 0.5 and 24, in steps of 0.5.', 'err');
  if (!otState.checked.size) return toast('Tick at least one person', '', 'err');
  const btn = $('#otSave'); if (btn) btn.disabled = true;
  try {
    const res = await api('/webhook/employees/api/overtime', { method:'POST', body:{ date: otState.date, department: otState.department, hours, enroll_ids: [...otState.checked] } });
    toast('Overtime saved', res.saved + ' ' + (res.saved === 1 ? 'person' : 'people') + ' recorded for ' + otState.date + '.', 'ok');
    await loadOtPeople();
  } catch (err) { toast('Could not save', err.message, 'err'); if (btn) btn.disabled = false; }
}
function viewOvertimeSubmit(){
  const canEdit = S.me.permission === 'editor';
  if (!otState.date) otState.date = todayStr();
  const depOpts = (S.departments || []).map(d => `<option value="${esc(d)}" ${otState.department===d?'selected':''}>${esc(d)}</option>`).join('');
  return {
    title:'Overtime Submission', crumb:'Attendance',
    html: `${pageHead('Overtime Submission', 'Pick a department and a day, tick the people who worked overtime and enter the hours (the same figure applies to everyone ticked).')}
      ${canEdit ? '' : `<div class="notice info">${I.info}<div>You have view-only access - recording overtime needs edit access to Employees.</div></div>`}
      <div class="card"><div class="card-b">
        <div class="grid g3">
          <div class="field"><label for="otDept">Department</label>
            <select class="inp" id="otDept"><option value="">Select...</option>${depOpts}</select></div>
          <div class="field"><label for="otDate">Date</label>
            <input class="inp" type="date" id="otDate" max="${todayStr()}" value="${esc(otState.date)}"></div>
          <div class="field"><label for="otHours">Hours worked</label>
            <input class="inp" type="number" id="otHours" min="0.5" max="24" step="0.5" value="${esc(otState.hours)}" ${canEdit?'':'disabled'}></div>
        </div>
        <div id="otPeople"></div>
      </div></div>`,
    bind(){
      $('#otDept').onchange = e => { otState.department = e.target.value; otState.q = ''; loadOtPeople(); };
      $('#otDate').onchange = e => { otState.date = e.target.value || todayStr(); loadOtPeople(); };
      $('#otHours').oninput = e => { otState.hours = e.target.value; };
      if (otState.department) loadOtPeople(); else paintOtPeople();
    },
  };
}
route('/overtime/submit', () => viewOvertimeSubmit());

let otListState = { from:'', to:'', department:'', records:null };
function paintOtList(){
  const box = $('#otListBody'); if (!box) return;
  if (!otListState.records) { box.innerHTML = `<div class="small muted" style="padding:14px">Loading...</div>`; return; }
  const rows = otListState.records.filter(r => !otListState.department || r.department === otListState.department);
  const total = rows.reduce((t, r) => t + Number(r.hours || 0), 0);
  box.innerHTML = rows.length ? `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Date</th><th>Name</th><th>Department</th><th>Hours</th><th>Recorded by</th></tr></thead>
      <tbody>${rows.map(r => `<tr><td>${esc(r.work_date)}</td><td><div class="strong">${esc(r.name)}</div></td><td>${esc(r.department||'--')}</td>
        <td>${esc(String(Number(r.hours)))}</td><td class="small">${esc(r.recorded_by||'--')}</td></tr>`).join('')}</tbody></table></div>
      <div class="small muted" style="padding:12px 4px">${rows.length} entries, ${total} hours in total.</div>`
    : `<div class="small muted" style="padding:14px">No overtime recorded in this period.</div>`;
}
async function loadOtList(){
  otListState.records = null; paintOtList();
  try {
    const res = await api('/webhook/employees/api/overtime?from=' + encodeURIComponent(otListState.from) + '&to=' + encodeURIComponent(otListState.to));
    otListState.records = res.records || [];
  } catch (err) { toast('Could not load overtime', err.message, 'err'); otListState.records = []; }
  const sel = $('#olDept');
  if (sel) {
    const deps = [...new Set(otListState.records.map(r => r.department).filter(Boolean))].sort();
    sel.innerHTML = `<option value="">All departments</option>` + deps.map(d => `<option value="${esc(d)}" ${otListState.department===d?'selected':''}>${esc(d)}</option>`).join('');
  }
  paintOtList();
}
function viewOvertimeList(){
  if (!otListState.to) { otListState.to = todayStr(); otListState.from = addDays(otListState.to, -31); }
  return {
    title:'Overtime', crumb:'Attendance',
    html: `${pageHead('Overtime', 'Overtime that has been recorded, newest first.')}
      <div class="row filter-bar" style="margin-bottom:14px">
        <div class="field" style="margin:0"><label for="olFrom">From</label><input class="inp" type="date" id="olFrom" value="${esc(otListState.from)}"></div>
        <div class="field" style="margin:0"><label for="olTo">To</label><input class="inp" type="date" id="olTo" value="${esc(otListState.to)}"></div>
        <div class="field" style="margin:0"><label for="olDept">Department</label><select class="inp" id="olDept"><option value="">All departments</option></select></div>
      </div>
      <div class="card"><div id="otListBody"></div></div>`,
    bind(){
      $('#olFrom').onchange = e => { otListState.from = e.target.value; loadOtList(); };
      $('#olTo').onchange = e => { otListState.to = e.target.value; loadOtList(); };
      $('#olDept').onchange = e => { otListState.department = e.target.value; paintOtList(); };
      loadOtList();
    },
  };
}
route('/overtime/records', () => viewOvertimeList());

function stubView(title, crumb){
  return { title, crumb, html: `${pageHead(title, 'This section has not been set up yet.')}
    <div class="card"><div class="card-b">${emptyState('box', 'Not configured yet', 'It will appear here once it has been set up.')}</div></div>` };
}
route('/attendance', () => stubView('Attendance', 'Attendance'));

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


