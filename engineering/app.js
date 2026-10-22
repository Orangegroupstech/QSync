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
  return [
    { title:'Engineering', items:[
      { path:'/', label:'AHU Temperature Log', icon:'alert' },
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
  S = { me: meFromAuth(auth, 'engineering') };
  resetIdleTimer();
}
function render(){
  const app = document.getElementById('app');
  try {
    if (!S){ toLanding(); return; }
    const m = matchRoute(currentPath());
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
   AHU temperature log
   One month at a time from GET /webhook/engineering/api/ahu/month?month=YYYY-MM (SQL: okl_eng_ahu_month).
   Readings arrive as [room_id, day, temp, status, logged_by, time, timing, note]; totals and colours are worked out here.
   Colour codes are the same as the Google Sheet and the WhatsApp notices.
   ============================================================ */
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ojcv39NHPa13S7IluAeaGnumuuhRS2C78qIJdzIyaNs/edit';
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
route('/', viewAhu);
