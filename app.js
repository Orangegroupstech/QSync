"use strict";

/* ---------------- Icons (subset of Dyan's set, only what's used) ---------------- */
const I = (() => {
  const w = (p, extra) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra||''}>${p}</svg>`;
  return {
    plus: w('<path d="M12 5v14M5 12h14"/>'),
    check: w('<path d="M20 6L9 17l-5-5"/>'),
    checkCircle: w('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'),
    x: w('<path d="M18 6L6 18M6 6l12 12"/>'),
    clock: w('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>'),
    users: w('<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7" r="3.4"/><path d="M22 20v-1.5a4 4 0 0 0-3-3.85"/><path d="M16.5 3.6a4 4 0 0 1 0 7"/>'),
    chart: w('<path d="M3 3v18h18"/><path d="M7 15l3.5-4 3 2.5L20 7"/>'),
    settings: w('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.6H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9.5A1.6 1.6 0 0 0 10.5 3V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9.5a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>'),
    logout: w('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>'),
    search: w('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>', 'width="15" height="15"'),
    menu: w('<path d="M3 6h18M3 12h18M3 18h18"/>'),
    chevR: w('<path d="M9 6l6 6-6 6"/>', 'width="15" height="15"'),
    chevL: w('<path d="M15 6l-6 6 6 6"/>', 'width="15" height="15"'),
    info: w('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5M12 8h.01"/>', 'width="15" height="15"'),
    alert: w('<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
    box: w('<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>'),
    print: w('<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>'),
    download: w('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>'),
    edit: w('<path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>', 'width="15" height="15"'),
    lock: w('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    key: w('<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.8 12.2L21 2M17 6l3 3M14 9l3 3"/>'),
    send: w('<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>'),
    doc: w('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>'),
    activity: w('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'),
    layers: w('<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>'),
    play: w('<path d="M6 4l14 8-14 8z"/>', 'width="15" height="15"'),
    pause: w('<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>', 'width="15" height="15"'),
    inbox: w('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.5h13l3.5 6.5v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>'),
  };
})();

/* ---------------- Utilities ---------------- */
const $  = (s, r) => (r||document).querySelector(s);
const $$ = (s, r) => Array.from((r||document).querySelectorAll(s));
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDateTime(ts){ if(!ts) return '--'; const d=new Date(ts);
  return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function fmtMonthYear(str){ if(!str) return '--'; const parts=String(str).split('-');
  if (parts.length!==2) return str; const m=parseInt(parts[1],10);
  return `${MONTHS[m-1]||parts[1]} ${parts[0]}`; }
function relTime(ts){
  if(!ts) return '--';
  const s = Math.floor((Date.now()-new Date(ts).getTime())/1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s/60)+'m ago';
  if (s < 86400) return Math.floor(s/3600)+'h ago';
  if (s < 604800) return Math.floor(s/86400)+'d ago';
  return fmtDateTime(ts).split(',')[0];
}
function nfmt(n){ return (n==null||n==='')?'--':Number(n).toLocaleString(); }
function initials(name){ return String(name||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
function avatarColor(seed){
  const palette = ['#ED6B1F','#1F5C3D','#1B5FBF','#8B5CF6','#B3261E','#0E7490','#B45309','#4B5563','#BE185D','#15803D'];
  let h=0; for (const ch of String(seed||'')) h = (h*31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}
function avatarEl(name, cls){
  return `<div class="avatar ${cls||''}" style="background:${avatarColor(name)}" title="${esc(name)}">${esc(initials(name))}</div>`;
}
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms||220); }; }
function download(filename, text, type){
  const blob = new Blob([text], {type: type||'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}
function toCSV(rows){
  return rows.map(r => r.map(c => {
    const v = c==null?'':String(c);
    return /[",\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v;
  }).join(',')).join('\n');
}

/* ---------------- Domain constants (trimmed to what the real backend tracks) ---------------- */
const STATUS = {
  pending_ipqa:      { label:'Pending IPQA',       badge:'b-warn' },
  pending_qa_review: { label:'Pending QA Review',  badge:'b-info' },
  pending_qc_notify: { label:'Approved / With QC', badge:'b-ok' },
  rejected:          { label:'Rejected',           badge:'b-danger' },
};
const PRODUCTS_META = {
  Mixagrip:       { prefix:'A', type:'OSD' },
  Procold:        { prefix:'B', type:'OSD' },
  'Cannon Extra': { prefix:'C', type:'OSD' },
  'Medik 55':     { prefix:'D', type:'OSD' },
  Cypron:         { prefix:'E', type:'OSD' },
  Corhinza:       { prefix:'F', type:'OSD' },
  'Cannon PM':    { prefix:'G', type:'OSD' },
  Zaiki:          { prefix:'H', type:'OSD' },
  Mintacid:       { prefix:'I', type:'OLD' },
};
const UNIT_OPTIONS = { OSD: ['kg', 'tablets'], OLD: ['litres'] };
const STAGE_OPTIONS = {
  OSD: ['Granulation', 'Compression', 'Sacheting/Blistering/Stripping', 'Finished Product'],
  OLD: ['Mixing', 'Filling/Sacheting', 'Finished Product']
};


/* ---------------- API layer ---------------- */
// sessionStorage throws in some sandboxed/embedded viewing contexts (SecurityError:
// "document is sandboxed and lacks the allow-same-origin flag"). Fall back to an
// in-memory token so the app still works there - it just won't survive a reload.
const TOKEN_KEY = 'qsync.admin.token';
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
  if (res.status === 401 && path !== '/webhook/admin/api/login') {
    setToken('');
    S = null;
    stopPolling();
    render();
    throw new Error('Your session has expired. Please log in again.');
  }
  let json = {};
  try { json = await res.json(); } catch (e) { /* empty body */ }
  if (!res.ok) throw new Error(json.error || 'Something went wrong.');
  return json;
}

/* ---------------- State store ---------------- */
let S = null; // { me, users, requests, products, audit }

/* ---------------- Modal / toast / confirm (unchanged from the design system) ---------------- */
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

/* ---------------- Idle timeout + logout (server-enforced) ---------------- */
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
  try { await api('/webhook/admin/api/logout', { method:'POST' }); } catch(e) { /* best effort */ }
  setToken(''); S = null;
  if (idleTimer) clearTimeout(idleTimer);
  stopPolling();
  location.hash = '#/login';
  render();
  if (reason) toast('Signed out', reason, 'err', 6000);
}

/* ---------------- Background polling (read-only pages only, paused while a modal is open) ---------------- */
const POLL_INTERVAL_MS = 60 * 1000;
const POLL_ROUTES = ['/requests', '/reports', '/audit', '/team'];
let pollTimer = null;
async function pollTick(){
  if (!S) return;
  const layers = document.getElementById('layers');
  if (layers && layers.children.length) return; // a modal/form is open - don't disturb it
  const path = currentPath().split('?')[0];
  if (!POLL_ROUTES.some(r => path.startsWith(r))) return;
  try {
    if (path.startsWith('/reports')) {
      reportsCache = await api('/webhook/admin/api/reports');
    } else {
      S = await api('/webhook/admin/api/bootstrap');
    }
    render();
  } catch (e) { /* transient failure - next tick retries; a real 401 already handles itself */ }
}
function startPolling(){
  if (pollTimer) return;
  pollTimer = setInterval(pollTick, POLL_INTERVAL_MS);
}
function stopPolling(){
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}


/* ---------------- Routing ---------------- */
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
function queryParams(){
  const q = currentPath().split('?')[1];
  const o = {}; if (!q) return o;
  q.split('&').forEach(kv => { const [k,v] = kv.split('='); o[decodeURIComponent(k)] = decodeURIComponent(v||''); });
  return o;
}

/* ---------------- Navigation model ---------------- */
function navModel(){
  return [
    { title:'Workspace', items:[ { path:'/new', label:'New Test Request', icon:'plus' } ] },
    { title:'Records', items:[
      { path:'/requests', label:'All Requests', icon:'layers' },
      { path:'/sheets', label:'QSync Sheets', icon:'doc' },
      { path:'/reports', label:'Reports and Trends', icon:'chart' },
    ]},
    { title:'Administration', items:[
      { path:'/team', label:'Team Management', icon:'users' },
      { path:'/products', label:'Products and Specs', icon:'box' },
      { path:'/audit', label:'Audit Trail', icon:'activity' },
      { path:'/settings', label:'Settings', icon:'settings' },
    ]},
  ];
}

/* ---------------- Shell ---------------- */
function renderShell(inner, meta){
  const me = S.me;
  const path = currentPath().split('?')[0];
  const navHtml = navModel().map(g => `
    <div class="nav-group">${esc(g.title)}</div>
    ${g.items.map(it => {
      const active = path.startsWith(it.path);
      return `<a class="nav-item ${active?'active':''}" href="#${it.path}">
        <span class="ic">${I[it.icon]}</span><span>${esc(it.label)}</span></a>`;
    }).join('')}`).join('');

  return `
  <div class="shell">
    <div class="backdrop" onclick="document.body.classList.remove('nav-open')"></div>
    <aside class="sidebar">
      <div class="sidebar-top">
        <a href="#/requests" style="display:flex;align-items:center;gap:9px;text-decoration:none">
          <span class="logo-wrap"><span class="logo sm"><span class="berry"><i></i><i></i><b></b></span><span>ORANGE GROUP</span></span></span>
        </a>
        <button class="btn-icon hide-lg" style="color:var(--nav-text-dim)" onclick="document.body.classList.remove('nav-open')" aria-label="Close menu">${I.x}</button>
      </div>
      <div style="padding:0 16px 10px">
        <div style="font-size:11px;color:var(--nav-text-dim);letter-spacing:.13em;text-transform:uppercase;font-weight:700">QSync Platform</div>
        <div style="font-size:11.5px;color:var(--nav-text-dim);margin-top:2px">Admin console</div>
      </div>
      <div class="sidebar-scroll">${navHtml}</div>
      <div class="sidebar-foot">
        <div class="user-chip" onclick="go('/settings')">
          ${avatarEl(me.name)}
          <div style="min-width:0;flex:1"><div class="nm">${esc(me.name)}</div><div class="rl">Administrator</div></div>
          <span style="color:var(--nav-text-dim)">${I.chevR}</span>
        </div>
        <button class="btn btn-ghost btn-sm btn-block" style="margin-top:8px;border-color:rgba(255,255,255,.12);color:var(--nav-text)"
          onclick="logout()">${I.logout} Sign out</button>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="btn-icon menu-btn" onclick="document.body.classList.add('nav-open')" aria-label="Open menu">${I.menu}</button>
        <a href="#/requests" class="only-mobile" style="line-height:0" aria-label="QSync home">
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
  return `<div class="empty"><div class="em-ic">${I[icon]||I.inbox}</div>
    <h4>${esc(title)}</h4><div class="small">${msg||''}</div>
    ${action?`<div style="margin-top:14px">${action}</div>`:''}</div>`;
}
function statusBadge(status){
  const s = STATUS[status] || {label:status, badge:'b-slate'};
  return `<span class="badge ${s.badge}"><span class="dot"></span>${esc(s.label)}</span>`;
}

/* ---------------- Login ---------------- */
function viewLogin(){
  document.body.classList.remove('nav-open');
  return `
  <div class="auth">
    <div class="auth-art">
      <div>
        <span class="logo lg"><span class="berry"><i></i><i></i><b></b></span><span>ORANGE GROUP</span></span>
        <h1 style="margin-top:26px">QSync admin console</h1>
        <p>Sign in with your phone number and PIN to manage users, review requests, and edit product specifications.</p>
      </div>
      <div class="af"><div class="afi">${I.lock}</div><div><div class="aft">Session security</div>
        <div class="afd">You'll be signed out automatically after 10 minutes of inactivity.</div></div></div>
    </div>
    <div class="auth-form">
      <div class="auth-box">
        <h2>Admin sign in</h2>
        <form id="loginForm" novalidate style="margin-top:18px">
          <div class="field"><label for="lgPhone">Phone number</label>
            <input class="inp" id="lgPhone" type="tel" placeholder="2348012345678" autocomplete="username">
            <div class="err-msg hide" data-err="lgPhone"></div></div>
          <div class="field"><label for="lgPin">PIN</label>
            <input class="inp" id="lgPin" type="password" inputmode="numeric" autocomplete="current-password">
            <div class="err-msg hide" data-err="lgPin"></div></div>
          <button class="btn btn-primary btn-lg btn-block" type="submit">${I.send} Log in</button>
        </form>
      </div>
    </div>
  </div>`;
}
function bindLogin(){
  const f = $('#loginForm'); if (!f) return;
  f.onsubmit = async (e) => {
    e.preventDefault();
    clearErrors(f);
    const phone = $('#lgPhone').value.trim();
    const pin = $('#lgPin').value.trim();
    if (!phone) return setErr('lgPhone', 'Enter your phone number.');
    if (!pin) return setErr('lgPin', 'Enter your PIN.');
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const res = await api('/webhook/admin/api/login', { method:'POST', body:{ phone, admin_pin: pin } });
      setToken(res.token);
      await bootstrap();
      go('/requests');
    } catch (err) {
      setErr('lgPin', err.message || 'Invalid phone number or PIN.');
    } finally {
      btn.disabled = false;
    }
  };
}

/* ---------------- Boot / bootstrap / render ---------------- */
async function bootstrap(){
  const data = await api('/webhook/admin/api/bootstrap');
  S = data;
  resetIdleTimer();
  startPolling();
}
function notFound(){
  return `<div class="card"><div class="card-b">${emptyState('alert','Page not found','That link may be out of date.',
    `<button class="btn btn-primary" onclick="go('/requests')">Back to requests</button>`)}</div></div>`;
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
function render(){
  const app = document.getElementById('app');
  try {
    if (!S){
      app.innerHTML = viewLogin();
      bindLogin();
      return;
    }
    const path = currentPath();
    if (path.startsWith('/login')){ go('/requests'); return; }
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
          `<button class="btn btn-primary" onclick="go('/requests')">Back to requests</button>`)}</div></div>` };
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
    const token = getToken();
    if (token){
      try { await bootstrap(); }
      catch (e) { setToken(''); S = null; }
    }
    if (!location.hash) location.hash = S ? '#/requests' : '#/login';
    render();
  } catch (err) {
    console.error(err);
    const app = document.getElementById('app');
    if (app) app.innerHTML = fatalErrorHtml(err);
  }
})();


/* ============================================================
   New Test Request
   ============================================================ */
function viewNewRequest(){
  const productOptions = Object.keys(PRODUCTS_META)
    .map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join('');
  return {
    title:'New test request', crumb:'Workspace',
    html: `
    ${pageHead('Raise a test request',
      'Complete the batch details below and submit to IPQA. A unique request number is generated automatically and the expiry date is calculated from the approved shelf life.',
      `<a class="btn btn-ghost" href="#/requests">Cancel</a>`)}
    <div class="grid g-2-1">
      <form id="reqForm" class="card" novalidate>
        <div class="card-b">
          <div class="sec-title">${I.box} Product and batch</div>
          <div class="field">
            <label for="rqProduct">Product name<span class="req">*</span></label>
            <select class="inp" id="rqProduct" onchange="onNewReqProductChange()">
              <option value="">-- Select a product --</option>
              ${productOptions}
            </select>
            <div class="err-msg hide" data-err="rqProduct"></div>
          </div>
          <div class="field">
            <label for="rqBatch">Batch number<span class="req">*</span></label>
            <div class="inp-group">
              <div class="addon" id="rqPrefix" style="min-width:52px">--</div>
              <input class="inp" id="rqBatch" inputmode="numeric" maxlength="8" placeholder="e.g. 260345 - numeric part only">
            </div>
            <div class="err-msg hide" data-err="rqBatch"></div>
          </div>
          <div class="grid g2">
            <div class="field">
              <label for="rqSize">Batch size<span class="req">*</span></label>
              <div class="inp-group">
                <input class="inp" id="rqSize" inputmode="numeric" placeholder="e.g. 1200000">
                <select class="inp fixed" id="rqUnit" style="max-width:130px" disabled><option value="">Unit</option></select>
              </div>
              <div class="err-msg hide" data-err="rqSize"></div>
            </div>
            <div class="field">
              <label for="rqMfg">Manufacturing date (month / year)<span class="req">*</span></label>
              <input class="inp" id="rqMfg" type="month">
              <div class="err-msg hide" data-err="rqMfg"></div>
            </div>
          </div>
          <div class="field">
            <label for="rqStage">Stage of manufacture<span class="req">*</span></label>
            <select class="inp" id="rqStage" disabled><option value="">-- Select a product first --</option></select>
            <div class="err-msg hide" data-err="rqStage"></div>
          </div>
        </div>
        <div class="card-f row end sticky-actions">
          <a class="btn btn-ghost" href="#/requests">Cancel</a>
          <button class="btn btn-primary btn-lg" type="submit">${I.send} Submit request to IPQA</button>
        </div>
      </form>
      <div class="stack">
        <div class="card"><div class="card-h"><h3>What happens next</h3></div>
          <div class="card-b">
            <div class="timeline">
              <div class="tl-item current"><div class="tl-dot">1</div>
                <div class="tl-t">You submit this request</div>
                <div class="tl-m">A request number is generated and IPQA is notified by e-mail.</div></div>
              <div class="tl-item"><div class="tl-dot">2</div>
                <div class="tl-t">IPQA records the results</div>
                <div class="tl-m">Every value is checked against the approved specification.</div></div>
              <div class="tl-item"><div class="tl-dot">3</div>
                <div class="tl-t">QA Supervisor reviews and releases</div>
                <div class="tl-m">Approval notifies QC and generates the QSync sheet.</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>`,
    bind: bindNewRequest
  };
}
function onNewReqProductChange(){
  const name = $('#rqProduct').value;
  const meta = PRODUCTS_META[name];
  const unitSel = $('#rqUnit'), stageSel = $('#rqStage');
  $('#rqPrefix').textContent = meta ? meta.prefix : '--';
  if (!meta){
    unitSel.innerHTML = '<option value="">Unit</option>'; unitSel.disabled = true;
    stageSel.innerHTML = '<option value="">-- Select a product first --</option>'; stageSel.disabled = true;
    return;
  }
  unitSel.innerHTML = UNIT_OPTIONS[meta.type].map(u => `<option value="${u}">${u}</option>`).join('');
  unitSel.disabled = false;
  stageSel.innerHTML = '<option value="">-- Select a stage --</option>' +
    STAGE_OPTIONS[meta.type].map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  stageSel.disabled = false;
}
function bindNewRequest(){
  const f = $('#reqForm'); if (!f) return;
  f.onsubmit = async (e) => {
    e.preventDefault();
    clearErrors(f);
    const product = $('#rqProduct').value;
    const meta = PRODUCTS_META[product];
    if (!product || !meta) return setErr('rqProduct', 'Select a product.');
    const suffix = $('#rqBatch').value.trim();
    if (!/^[0-9]{1,8}$/.test(suffix)) return setErr('rqBatch', 'Enter 1 to 8 digits.');
    const size = $('#rqSize').value.trim();
    if (!size || isNaN(Number(size)) || Number(size) <= 0) return setErr('rqSize', 'Enter a batch size greater than zero.');
    const unit = $('#rqUnit').value;
    if (!unit) return setErr('rqSize', 'Select a unit.');
    const stage = $('#rqStage').value;
    if (!stage) return setErr('rqStage', 'Select a stage.');
    const mfg = $('#rqMfg').value;
    if (!mfg) return setErr('rqMfg', 'Select a manufacturing month.');

    const prefixLetter = $('#rqPrefix').textContent;
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const res = await api('/webhook/admin/api/requests', { method:'POST', body:{
        product_name: product,
        batch_no: prefixLetter + suffix,
        batch_size: size,
        batch_size_unit: unit,
        mfg_date: mfg,
        stage,
      }});
      toast('Request submitted', res.requestNo + ' has been raised and IPQA notified.', 'ok');
      await bootstrap();
      go('/requests');
    } catch (err){
      setErr('rqBatch', err.message || 'Could not submit this request.');
    } finally {
      btn.disabled = false;
    }
  };
}

/* ============================================================
   All Requests
   ============================================================ */
let listState = { q:'', status:'', product:'', sort:'updated' };
function filterRequests(){
  let out = S.requests.slice();
  const q = listState.q.trim().toLowerCase();
  if (q) out = out.filter(r => [r.requestNo, r.batchNo, r.productName].join(' ').toLowerCase().includes(q));
  if (listState.status) out = out.filter(r => r.status === listState.status);
  if (listState.product) out = out.filter(r => r.productName === listState.product);
  const sorters = {
    updated:(a,b)=> new Date(b.updatedAt) - new Date(a.updatedAt),
    created:(a,b)=> new Date(b.createdAt) - new Date(a.createdAt),
    oldest:(a,b)=> new Date(a.createdAt) - new Date(b.createdAt),
  };
  return out.sort(sorters[listState.sort] || sorters.updated);
}
function overallResult(r){
  if (!r.parameters || !r.parameters.length) return null;
  return r.parameters.some(p => p.status === 'fail') ? 'fail' : 'pass';
}
function resultBadge(r){
  const ev = overallResult(r);
  if (ev === null) return `<span class="badge b-slate">Not tested</span>`;
  return ev === 'pass' ? `<span class="badge b-ok">${I.check} Pass</span>` : `<span class="badge b-danger">${I.x} Out of spec</span>`;
}
function viewRequests(){
  const rows = filterRequests();
  const productOptions = Object.keys(PRODUCTS_META).map(p => `<option value="${esc(p)}" ${listState.product===p?'selected':''}>${esc(p)}</option>`).join('');
  const statusOptions = Object.entries(STATUS).map(([k,v]) => `<option value="${k}" ${listState.status===k?'selected':''}>${esc(v.label)}</option>`).join('');
  const body = rows.length ? `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Request</th><th>Product / Batch</th><th>Stage</th><th>Status</th><th>Result</th><th>Updated</th><th></th></tr></thead>
      <tbody>${rows.map(r => `
        <tr class="clickable" onclick="go('/sheet/${r.id}')">
          <td data-label="Request"><div class="req-no">${esc(r.requestNo)}</div></td>
          <td data-label="Product / Batch"><div class="strong">${esc(r.productName)}</div><div class="tiny muted mono">${esc(r.batchNo)}</div></td>
          <td data-label="Stage"><span class="chip">${esc(r.stage)}</span></td>
          <td data-label="Status">${statusBadge(r.status)}</td>
          <td data-label="Result">${resultBadge(r)}</td>
          <td class="small muted" data-label="Updated">${relTime(r.updatedAt)}</td>
          <td style="text-align:right">${I.chevR}</td>
        </tr>`).join('')}</tbody></table></div>`
    : `<div class="card-b">${emptyState('inbox','Nothing here','No requests match the current filters.')}</div>`;
  return {
    title:'All test requests', crumb:'Records',
    html: `
    ${pageHead('All test requests', 'Every request raised, with its current status and result.')}
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px">
        <div class="row" style="gap:10px">
          <div class="search filter-search"><span class="ic">${I.search}</span>
            <input class="inp" id="listQ" style="padding-left:34px;border-radius:20px" placeholder="Search request, batch or product" value="${esc(listState.q)}"></div>
          <select class="inp filter-sel-status" id="listStatus"><option value="">All statuses</option>${statusOptions}</select>
          <select class="inp filter-sel-product" id="listProduct"><option value="">All products</option>${productOptions}</select>
          <div class="spacer"></div>
          <button class="btn btn-ghost btn-sm" onclick="exportRequestList()">${I.download} Export CSV</button>
        </div>
      </div>
      ${body}
    </div>`,
    bind: bindRequestFilters
  };
}
function bindRequestFilters(){
  const q = $('#listQ');
  if (q) q.addEventListener('input', debounce(e => { listState.q = e.target.value; render();
    const el = $('#listQ'); if (el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 260));
  const st = $('#listStatus'); if (st) st.onchange = e => { listState.status = e.target.value; render(); };
  const pr = $('#listProduct'); if (pr) pr.onchange = e => { listState.product = e.target.value; render(); };
}
function exportRequestList(){
  const rows = [['Request No','Product','Batch No','Stage','Status','Result','Updated']];
  filterRequests().forEach(r => rows.push([r.requestNo, r.productName, r.batchNo, r.stage, (STATUS[r.status]||{}).label||r.status,
    overallResult(r)===null?'NOT TESTED':overallResult(r).toUpperCase(), fmtDateTime(r.updatedAt)]));
  download('qsync-requests-'+new Date().toISOString().slice(0,10)+'.csv', toCSV(rows), 'text/csv');
  toast('Export ready','The filtered request list has been downloaded.','ok');
}


/* ============================================================
   QSync Sheets
   ============================================================ */
function reqById(id){ return S.requests.find(r => String(r.id) === String(id)); }

function qsyncSheetHtml(r){
  const paramRows = (r.parameters||[]).map(p => {
    const value = p.valueText || p.valueNumeric;
    const spec = p.specText ? p.specText : `${p.specMin ?? ''} - ${p.specMax ?? ''}${p.unit ? ' '+p.unit : ''}`;
    const verdict = p.status === 'pass' ? 'PASS' : p.status === 'fail' ? 'FAIL' : 'N/A';
    return `<tr>
      <td>${esc(p.name)}</td>
      <td>${esc(value)}${p.unit && p.valueNumeric ? ' '+esc(p.unit) : ''}</td>
      <td>${esc(spec)}</td>
      <td><b>${verdict}</b></td>
    </tr>`;
  }).join('');
  const decided = r.qaDecision === 'approved';
  const stampHtml = r.qaDecision
    ? `<span class="stamp ${decided?'':'rej'}">${decided?'APPROVED':'REJECTED'}</span>`
    : `<span class="tiny muted">Awaiting QA Supervisor decision</span>`;

  return `<div class="sheet">
    <div class="sheet-head">
      <div>
        <h2>QSync Test Request Sheet</h2>
        <div class="small muted">Consolidated analysis record - replaces the paper batch analysis sheet.</div>
      </div>
      <div class="doc">
        Request No: ${esc(r.requestNo)}<br>
        Generated: ${fmtDateTime(Date.now())}
      </div>
    </div>

    <h4>Batch details</h4>
    <table class="kv">
      <tr><th>Product</th><td>${esc(r.productName)}</td><th>Batch No</th><td>${esc(r.batchNo)}</td></tr>
      <tr><th>Batch Size</th><td>${esc(r.batchSize)} ${esc(r.batchSizeUnit||'')}</td><th>Stage</th><td>${esc(r.stage)}</td></tr>
      <tr><th>Mfg Date</th><td>${fmtMonthYear(r.mfgMonth)}</td><th>Exp Date</th><td>${fmtMonthYear(r.expMonth)}</td></tr>
      <tr><th>Sample Qty</th><td>${esc(r.sampleQty||'--')} ${esc(r.sampleQtyUnit||'')}</td><th>Test Required</th><td>${esc(r.testRequired||'--')}</td></tr>
      <tr><th>Status</th><td colspan="3">${(STATUS[r.status]||{}).label || r.status}</td></tr>
    </table>

    <h4>IPQA parameters checked</h4>
    <table class="data">
      <tr><th>Parameter</th><th>Observed</th><th>Specification</th><th>Status</th></tr>
      ${paramRows || '<tr><td colspan="4" class="muted">No results recorded yet.</td></tr>'}
    </table>

    <h4>Sign off</h4>
    <div class="sign-grid">
      <div class="sign-box"><div class="sl">Production</div>
        <div class="sv">${esc(r.productionSignedBy || '--')}</div>
        <div class="ss">${r.productionSignedAt ? fmtDateTime(r.productionSignedAt) : '--'}</div></div>
      <div class="sign-box"><div class="sl">IPQA</div>
        <div class="sv">${esc(r.ipqaSignedBy || '--')}</div>
        <div class="ss">${r.ipqaSignedAt ? fmtDateTime(r.ipqaSignedAt) : '--'}</div></div>
      <div class="sign-box"><div class="sl">QA Supervisor</div>
        <div class="sv">${esc(r.qaSupervisorSignedBy || '--')}</div>
        <div class="ss">${r.qaSupervisorSignedAt ? fmtDateTime(r.qaSupervisorSignedAt) : '--'}</div></div>
    </div>

    ${r.qaComments ? `<h4>QA comments</h4><p>${esc(r.qaComments)}</p>` : ''}

    <div style="margin-top:22px;text-align:center">${stampHtml}</div>
  </div>`;
}

function viewSheet(id){
  const r = reqById(id);
  if (!r) return { title:'Not found', crumb:'Records', html: notFound() };
  return {
    title:`QSync sheet - ${r.requestNo}`, crumb:'Records',
    html: `${pageHead(`QSync sheet - ${esc(r.requestNo)}`, '',
      `<button class="btn btn-primary" onclick="window.print()">${I.print} Print / save as PDF</button>
       <a class="btn btn-ghost" href="#/sheets">${I.chevL} Back to sheets</a>`)}
      ${qsyncSheetHtml(r)}`
  };
}
function viewSheets(){
  const list = S.requests.filter(r => r.parameters && r.parameters.length);
  const body = list.length ? `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Request</th><th>Product / Batch</th><th>Stage</th><th>Verdict</th><th>Status</th><th></th></tr></thead>
      <tbody>${list.map(r => `<tr class="clickable" onclick="go('/sheet/${r.id}')">
        <td class="req-no" data-label="Request">${esc(r.requestNo)}</td>
        <td data-label="Product / Batch"><div class="strong">${esc(r.productName)}</div><div class="tiny muted mono">${esc(r.batchNo)}</div></td>
        <td data-label="Stage"><span class="chip">${esc(r.stage)}</span></td>
        <td data-label="Verdict">${resultBadge(r)}</td>
        <td data-label="Status">${statusBadge(r.status)}</td>
        <td style="text-align:right">${I.chevR}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="card-b">${emptyState('doc','No sheets yet','A QSync sheet is generated once IPQA records results.')}</div>`;
  return {
    title:'QSync sheets', crumb:'Records',
    html: `${pageHead('QSync sheets', 'Every batch with a completed analysis has a QSync sheet. Open one to print it or save it as a PDF.')}
      <div class="card">${body}</div>`
  };
}


/* ============================================================
   Reports and Trends
   ============================================================ */
let reportsCache = null;
let reportsLoading = false;

function viewReports(){
  if (!reportsCache && !reportsLoading){
    reportsLoading = true;
    api('/webhook/admin/api/reports').then(data => {
      reportsCache = data; reportsLoading = false; render();
    }).catch(err => {
      reportsLoading = false;
      toast('Could not load reports', err.message, 'err');
    });
  }
  if (!reportsCache){
    return {
      title:'Reports and trends', crumb:'Records',
      html: `${pageHead('Reports and trends', 'Performance of the digital workflow.')}
        <div class="card"><div class="card-b">${emptyState('chart','Loading...','Fetching the latest numbers.')}</div></div>`
    };
  }
  const d = reportsCache;
  const maxAvg = Math.max(...(d.timeSpent||[]).map(s => s.avgSeconds || 0), 1);
  return {
    title:'Reports and trends', crumb:'Records',
    html: `
    ${pageHead('Reports and trends', 'Performance of the digital workflow: turnaround, first pass rate, and where time is being spent.',
      `<button class="btn btn-ghost" onclick="reportsCache=null;render()">${I.play} Refresh</button>`)}

    <div class="grid g4" style="margin-bottom:16px">
      <div class="stat acc-brand"><div class="ic-wrap">${I.layers}</div><div class="lbl">Total requests</div>
        <div class="val">${d.kpis.totalRequests}</div><div class="meta">${d.kpis.openRequests} still open</div></div>
      <div class="stat acc-ok"><div class="ic-wrap">${I.checkCircle}</div><div class="lbl">First pass rate</div>
        <div class="val">${d.kpis.firstPassRate}%</div><div class="meta">${d.kpis.passCount} of ${d.kpis.testedCount} analyses</div></div>
      <div class="stat acc-info"><div class="ic-wrap">${I.clock}</div><div class="lbl">Average turnaround</div>
        <div class="val" style="font-size:22px">${d.kpis.avgTurnaround || '--'}</div><div class="meta">Request raised to QA decision</div></div>
      <div class="stat acc-warn"><div class="ic-wrap">${I.doc}</div><div class="lbl">Paper saved</div>
        <div class="val">${nfmt(d.kpis.paperSaved)}</div><div class="meta">pages, at 68 per paper analysis</div></div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-h"><div><h3>Where the time goes</h3><div class="sub">Average duration of each step</div></div></div>
      <div class="card-b">${(d.timeSpent||[]).map(s => `
        <div style="margin-bottom:15px">
          <div class="row between"><div class="small strong">${esc(s.label)}</div>
            <div class="mono small">${s.avg || '--'}</div></div>
          <div class="bar" style="margin-top:6px"><i style="width:${clamp((s.avgSeconds||0)/maxAvg*100,2,100)}%"></i></div>
        </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-h"><h3>Product performance</h3></div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Product</th><th>Requests</th><th>Analysed</th><th>First pass</th></tr></thead>
        <tbody>${(d.byProduct||[]).map(p => `<tr>
          <td class="strong" data-label="Product">${esc(p.name)}</td><td class="tnum" data-label="Requests">${p.total}</td><td class="tnum" data-label="Analysed">${p.tested}</td>
          <td data-label="First pass">${p.rate==null?'<span class="muted">--</span>':`
            <div class="row" style="gap:8px"><div class="bar ${p.rate>=95?'ok':(p.rate>=80?'warn':'danger')}" style="width:66px"><i style="width:${p.rate}%"></i></div>
            <span class="tnum small strong">${p.rate}%</span></div>`}</td></tr>`).join('')}
        </tbody></table></div>
    </div>`
  };
}


/* ============================================================
   Team Management (our add/edit/deactivate logic, Dyan's UI)
   ============================================================ */
const ROLE_LABELS = {
  production:'Production', ipqa:'IPQA', qa_supervisor:'QA Supervisor',
  qc_supervisor:'QC Supervisor', admin:'Admin',
};
function roleSelectHtml(id, val){
  return `<select class="inp" id="${id}">${Object.entries(ROLE_LABELS).map(([k,v]) =>
    `<option value="${k}" ${val===k?'selected':''}>${esc(v)}</option>`).join('')}</select>`;
}
function viewTeam(){
  const users = S.users;
  const active = users.filter(u => u.active).length;
  return {
    title:'Team management', crumb:'Administration',
    html: `
    ${pageHead('Team management',
      'Add colleagues, keep their contact details current, and deactivate accounts when people move on.',
      `<button class="btn btn-primary" onclick="openAddUser()">${I.plus} Add team member</button>`)}
    <div class="grid g4" style="margin-bottom:16px">
      <div class="stat acc-brand"><div class="ic-wrap">${I.users}</div><div class="lbl">Team members</div>
        <div class="val">${users.length}</div><div class="meta">${active} active, ${users.length-active} deactivated</div></div>
    </div>
    <div class="card">
      <div class="card-h"><h3>All accounts</h3></div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Person</th><th>Role</th><th>Phone</th><th>Email</th><th>Status</th><th></th></tr></thead>
        <tbody>${users.map(u => `<tr>
          <td data-label="Person"><div class="row" style="gap:10px">${avatarEl(u.name)}
            <div style="min-width:0"><div class="strong">${esc(u.name)}</div></div></div></td>
          <td data-label="Role"><span class="badge b-slate">${esc(ROLE_LABELS[u.role]||u.role)}</span></td>
          <td class="small mono" data-label="Phone">${esc(u.phone_number||'--')}</td>
          <td class="small" data-label="Email">${esc(u.email||'--')}</td>
          <td data-label="Status">${u.active?'<span class="badge b-ok"><span class="dot"></span>Active</span>':'<span class="badge b-slate"><span class="dot"></span>Inactive</span>'}</td>
          <td style="text-align:right;white-space:nowrap">
            <button class="btn btn-ghost btn-sm" onclick="openEditUser(${u.id})">${I.edit} Edit</button>
            <button class="btn btn-ghost btn-sm" onclick="toggleUserActive(${u.id})">
              ${u.active?I.pause+' Deactivate':I.play+' Activate'}</button>
          </td>
        </tr>`).join('')}</tbody></table></div>
    </div>`
  };
}
function openAddUser(){
  openModal({
    title:'Add team member', size:'wide',
    body:`<form id="addUserForm" novalidate>
      <div class="grid g2">
        <div class="field"><label for="auName">Full Name<span class="req">*</span></label>
          <input class="inp" id="auName" maxlength="60"><div class="err-msg hide" data-err="auName"></div></div>
        <div class="field"><label for="auRole">Role<span class="req">*</span></label>${roleSelectHtml('auRole','ipqa')}</div>
      </div>
      <div class="grid g2">
        <div class="field"><label for="auPhone">Phone Number<span class="req">*</span></label>
          <input class="inp" id="auPhone" type="tel" placeholder="2348012345678" maxlength="13">
          <div class="err-msg hide" data-err="auPhone"></div></div>
        <div class="field"><label for="auEmail">Email Address<span class="req">*</span></label>
          <input class="inp" id="auEmail" type="email"><div class="err-msg hide" data-err="auEmail"></div></div>
      </div>
      <div class="field"><label for="auPin">PIN<span class="req">*</span></label>
        <input class="inp" id="auPin" type="password" inputmode="numeric" maxlength="6">
        <div class="hint">${I.info}<span>4-6 digits recommended</span></div>
        <div class="err-msg hide" data-err="auPin"></div></div>
    </form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button>
            <button class="btn btn-primary" data-save>${I.plus} Add User</button>`,
    onMount:(w,close) => {
      $('[data-save]',w).onclick = async () => {
        const f = $('#addUserForm',w); clearErrors(f);
        const name = $('#auName',w).value.trim(), phone = $('#auPhone',w).value.trim(),
              email = $('#auEmail',w).value.trim(), role = $('#auRole',w).value, pin = $('#auPin',w).value.trim();
        if (!name) return setErr('auName','Enter the full name.',f);
        if (!/^234[0-9]{10}$/.test(phone)) return setErr('auPhone','Must start with 234 and be 13 digits total.',f);
        if (!email) return setErr('auEmail','Enter an email address.',f);
        if (!pin) return setErr('auPin','Enter a PIN.',f);
        try {
          const res = await api('/webhook/admin/api/users/add', { method:'POST', body:{
            new_user_name:name, new_user_phone:phone, new_user_email:email, new_user_role:role, new_user_pin:pin } });
          S.users.push({ id:res.user.id, name:res.user.name, role:res.user.role, phone_number:phone, email:res.user.email, active:true });
          close(); render(); toast('User added', esc(name)+' can now sign in.', 'ok');
        } catch (err){ setErr('auPin', err.message, f); }
      };
    }
  });
}
function openEditUser(id){
  const u = S.users.find(x => x.id === id); if (!u) return;
  openModal({
    title:`Edit ${u.name}`, size:'wide',
    body:`<form id="editUserForm" novalidate>
      <div class="grid g2">
        <div class="field"><label for="euName">Full Name<span class="req">*</span></label>
          <input class="inp" id="euName" value="${esc(u.name)}" maxlength="60"><div class="err-msg hide" data-err="euName"></div></div>
        <div class="field"><label for="euRole">Role</label>${roleSelectHtml('euRole',u.role)}</div>
      </div>
      <div class="grid g2">
        <div class="field"><label for="euPhone">Phone Number<span class="req">*</span></label>
          <input class="inp" id="euPhone" value="${esc(u.phone_number||'')}" maxlength="13"><div class="err-msg hide" data-err="euPhone"></div></div>
        <div class="field"><label for="euEmail">Email Address<span class="req">*</span></label>
          <input class="inp" id="euEmail" type="email" value="${esc(u.email||'')}"><div class="err-msg hide" data-err="euEmail"></div></div>
      </div>
      <div class="field"><label for="euPin">New PIN</label>
        <input class="inp" id="euPin" type="password" inputmode="numeric" maxlength="6">
        <div class="hint">${I.info}<span>Leave blank to keep the current PIN</span></div></div>
    </form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button>
            <button class="btn btn-primary" data-save>${I.check} Save changes</button>`,
    onMount:(w,close) => {
      $('[data-save]',w).onclick = async () => {
        const f = $('#editUserForm',w); clearErrors(f);
        const name = $('#euName',w).value.trim(), phone = $('#euPhone',w).value.trim(),
              email = $('#euEmail',w).value.trim(), role = $('#euRole',w).value, pin = $('#euPin',w).value.trim();
        if (!name) return setErr('euName','Enter the full name.',f);
        if (!/^234[0-9]{10}$/.test(phone)) return setErr('euPhone','Must start with 234 and be 13 digits total.',f);
        if (!email) return setErr('euEmail','Enter an email address.',f);
        try {
          const res = await api('/webhook/admin/api/users/edit', { method:'POST', body:{
            target_id:id, edit_name:name, edit_role:role, edit_phone:phone, edit_email:email, edit_pin:pin } });
          Object.assign(u, { name:res.user.name, role:res.user.role, phone_number:res.user.phone_number, email:res.user.email });
          close(); render(); toast('Changes saved', esc(name)+' has been updated.', 'ok');
        } catch (err){ setErr('euEmail', err.message, f); }
      };
    }
  });
}
async function toggleUserActive(id){
  const u = S.users.find(x => x.id === id); if (!u) return;
  const goingActive = !u.active;
  const yes = await confirmDialog(goingActive?'Reactivate this account?':'Deactivate this account?',
    `<b>${esc(u.name)}</b> will ${goingActive?'be able to sign in again.':'no longer be able to sign in. Their signed records are kept intact.'}`,
    goingActive?'Reactivate':'Deactivate', goingActive?'':'danger');
  if (!yes) return;
  try {
    const res = await api('/webhook/admin/api/users/toggle', { method:'POST', body:{ target_id:id } });
    u.active = res.user.active;
    render(); toast('Status updated', esc(u.name)+' is now '+(u.active?'active':'inactive')+'.', 'ok');
  } catch (err){ toast('Could not update', err.message, 'err'); }
}


/* ============================================================
   Products and Specifications
   ============================================================ */
function stagesForProduct(p){
  const stages = [];
  (p.specs||[]).forEach(s => { if (!stages.includes(s.stage)) stages.push(s.stage); });
  return stages;
}
function viewProducts(){
  const products = S.products;
  const rows = products.map(x => {
    const stages = stagesForProduct(x);
    const requestsRaised = S.requests.filter(r => r.productName === x.name).length;
    return `<div class="mail-row" onclick="go('/products/${x.id}')">
      <div style="flex:1;min-width:0">
        <div class="ms">${esc(x.name)} <span class="badge b-brand" style="margin-left:6px">${esc(x.type)}</span></div>
        <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">
          <span class="chip">Prefix ${esc(x.prefix)}</span>
          <span class="chip">${esc((UNIT_OPTIONS[x.type]||[]).join(', '))}</span>
          <span class="chip">${stages.length} stage${stages.length===1?'':'s'}</span>
          <span class="chip">${requestsRaised} request${requestsRaised===1?'':'s'} raised</span>
        </div>
      </div>
      <span class="muted">${I.chevR}</span>
    </div>`;
  }).join('');
  return {
    title:'Products and specifications', crumb:'Administration',
    html: `
    ${pageHead('Products and specifications',
      'Acceptance criteria imported from the Spec Lookup sheet. Editing a limit here updates this console only - it does not change the live Google Sheet IPQA tests against.')}
    <div class="card">
      <div class="card-h"><div><h3>Product catalogue</h3><div class="sub">${products.length} products</div></div></div>
      ${products.length ? rows : `<div class="card-b">${emptyState('box','No products yet','Run the spec import to populate this page.')}</div>`}
    </div>`
  };
}
function viewProductDetail(id){
  const p = S.products.find(x => String(x.id) === String(id));
  if (!p) return { title:'Not found', crumb:'Administration', html: notFound() };
  const stages = stagesForProduct(p);
  const requestsRaised = S.requests.filter(r => r.productName === p.name).length;
  return {
    title:p.name, crumb:'Administration',
    html: `
    ${pageHead(p.name, 'Shelf life and acceptance criteria for this product.',
      `<a class="btn btn-ghost" href="#/products">${I.chevL} Back to products</a>`)}
    <div class="stack">
      <div class="card">
        <div class="card-h"><div><h3>${esc(p.name)}</h3>
          <div class="sub">Prefix <b>${esc(p.prefix)}</b></div></div>
          <span class="badge b-brand">${esc(p.type)} line</span></div>
        <div class="card-b">
          <div class="kv-grid">
            <div class="kv-item"><div class="k">Batch units</div><div class="v">${esc((UNIT_OPTIONS[p.type]||[]).join(', '))}</div></div>
            <div class="kv-item"><div class="k">Stages tested</div><div class="v">${esc(stages.join(', '))}</div></div>
            <div class="kv-item"><div class="k">Requests raised</div><div class="v">${requestsRaised}</div></div>
          </div>
          <div class="row" style="margin-top:16px;align-items:center;gap:12px;padding-top:14px;border-top:1px solid var(--line-2)">
            <div class="kv-item" style="flex:1"><div class="k">Shelf life</div><div class="v">${p.shelfLifeMonths} months</div></div>
            <button class="btn btn-ghost btn-sm" onclick="editShelfLife(${p.id})">${I.edit} Edit</button>
          </div>
        </div>
      </div>
      ${stages.map(stage => {
        const specs = (p.specs||[]).filter(s => s.stage === stage);
        return `<div class="card">
          <div class="card-h"><div><h3>${esc(stage)}</h3><div class="sub">Applied automatically on the IPQA form</div></div></div>
          <div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Parameter</th><th>Acceptance criteria</th><th>Type</th><th></th></tr></thead>
            <tbody>${specs.length ? specs.map(s => `<tr>
              <td data-label="Parameter"><div class="strong">${esc(s.parameterName)}</div></td>
              <td class="small" data-label="Acceptance criteria">${esc(s.specText || (s.specMin!=null && s.specMax!=null ? `${s.specMin} - ${s.specMax}${s.unit?' '+s.unit:''}` : '--'))}</td>
              <td data-label="Type"><span class="chip">${s.specText ? 'Complies / Does not' : 'Numeric'}</span></td>
              <td style="text-align:right">${s.specText ? '<span class="tiny muted">Fixed</span>' :
                `<button class="btn btn-ghost btn-sm" onclick='editSpec(${s.id})'>${I.edit} Edit limits</button>`}</td>
            </tr>`).join('') : `<tr><td colspan="4" class="muted" style="padding:16px">No parameters imported for this stage.</td></tr>`}</tbody>
          </table></div>
        </div>`;
      }).join('')}
    </div>`
  };
}
function editSpec(specId){
  let found = null;
  for (const p of S.products){ const s = (p.specs||[]).find(x => x.id === specId); if (s){ found = s; break; } }
  if (!found) return;
  const s = found;
  openModal({
    title:`Edit limits - ${s.parameterName}`, sub:`Stage: ${esc(s.stage)}`,
    body:`<form id="specForm" novalidate>
      <div class="notice warn">${I.alert}<div>This changes the admin console's copy only - the live Google Sheet is unaffected.</div></div>
      <div class="grid g2">
        <div class="field"><label for="spMin">Lower limit</label>
          <div class="inp-group"><input class="inp" id="spMin" value="${s.specMin ?? ''}" inputmode="decimal">
            <div class="addon">${esc(s.unit||'')}</div></div><div class="err-msg hide" data-err="spMin"></div></div>
        <div class="field"><label for="spMax">Upper limit</label>
          <div class="inp-group"><input class="inp" id="spMax" value="${s.specMax ?? ''}" inputmode="decimal">
            <div class="addon">${esc(s.unit||'')}</div></div><div class="err-msg hide" data-err="spMax"></div></div>
      </div>
    </form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>Save limits</button>`,
    onMount:(w,close) => {
      $('[data-save]',w).onclick = async () => {
        clearErrors(w);
        const min = parseFloat($('#spMin',w).value), max = parseFloat($('#spMax',w).value);
        if (isNaN(min)) return setErr('spMin','Enter a numeric lower limit.',w);
        if (isNaN(max)) return setErr('spMax','Enter a numeric upper limit.',w);
        if (max <= min) return setErr('spMax','The upper limit must be greater than the lower limit.',w);
        try {
          await api('/webhook/admin/api/specs/edit', { method:'POST', body:{ spec_id:specId, spec_min:min, spec_max:max } });
          s.specMin = min; s.specMax = max;
          close(); render(); toast('Specification updated', esc(s.parameterName)+' is now '+min+' - '+max+' '+(s.unit||''), 'ok');
        } catch (err){ setErr('spMax', err.message, w); }
      };
    }
  });
}
function editShelfLife(productId){
  const p = S.products.find(x => x.id === productId);
  if (!p) return;
  openModal({
    title:`Edit shelf life - ${esc(p.name)}`, sub:'Used to calculate Exp Date on new test requests for this product',
    body:`<form id="shelfForm" novalidate>
      <div class="field"><label for="slMonths">Shelf life (months)</label>
        <input class="inp" id="slMonths" value="${p.shelfLifeMonths}" inputmode="numeric">
        <div class="err-msg hide" data-err="slMonths"></div></div>
    </form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>Save</button>`,
    onMount:(w,close) => {
      $('[data-save]',w).onclick = async () => {
        clearErrors(w);
        const months = parseInt($('#slMonths',w).value, 10);
        if (!Number.isFinite(months) || months <= 0) return setErr('slMonths','Enter a whole number of months greater than zero.',w);
        try {
          await api('/webhook/admin/api/products/edit', { method:'POST', body:{ product_id:productId, shelf_life_months:months } });
          p.shelfLifeMonths = months;
          close(); render(); toast('Shelf life updated', esc(p.name)+' is now '+months+' months', 'ok');
        } catch (err){ setErr('slMonths', err.message, w); }
      };
    }
  });
}


/* ============================================================
   Audit Trail
   ============================================================ */
let auditQuery = '';
function viewAudit(){
  const q = auditQuery.trim().toLowerCase();
  const rows = q ? S.audit.filter(e => [e.actor_name, e.action, e.detail, e.ref].join(' ').toLowerCase().includes(q)) : S.audit;
  return {
    title:'Audit trail', crumb:'Administration',
    html: `
    ${pageHead('Audit trail', 'A chronological record of user, request, and specification changes.',
      `<button class="btn btn-ghost" onclick="exportAudit()">${I.download} Export</button>`)}
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px">
        <div class="search" style="max-width:340px"><span class="ic">${I.search}</span>
          <input class="inp" id="auditQ" style="padding-left:34px;border-radius:20px" value="${esc(auditQuery)}"
            placeholder="Search by person, action or reference"></div>
      </div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th><th>Reference</th></tr></thead>
        <tbody>${rows.length ? rows.map(e => `<tr>
          <td class="small" style="white-space:nowrap" data-label="When">${fmtDateTime(e.at)}<div class="tiny muted">${relTime(e.at)}</div></td>
          <td data-label="Who"><div class="row" style="gap:8px">${avatarEl(e.actor_name,'sm')}<span class="small strong">${esc(e.actor_name)}</span></div></td>
          <td class="small strong" data-label="Action">${esc(e.action)}</td>
          <td class="small muted" style="max-width:380px" data-label="Detail">${esc(e.detail||'--')}</td>
          <td data-label="Reference">${e.ref?`<span class="mono small">${esc(e.ref)}</span>`:'<span class="muted">--</span>'}</td>
        </tr>`).join('') : `<tr><td colspan="5" class="muted" style="padding:16px">No matching entries.</td></tr>`}</tbody>
      </table></div>
    </div>`,
    bind: () => {
      const el = $('#auditQ'); if (!el) return;
      el.addEventListener('input', debounce(e => { auditQuery = e.target.value; render();
        const q = $('#auditQ'); if (q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 260));
    }
  };
}
function exportAudit(){
  const rows = [['Timestamp','Actor','Role','Action','Detail','Reference']];
  S.audit.forEach(e => rows.push([fmtDateTime(e.at), e.actor_name, e.actor_role, e.action, e.detail, e.ref]));
  download('qsync-audit-'+new Date().toISOString().slice(0,10)+'.csv', toCSV(rows), 'text/csv');
  toast('Export ready','The audit trail has been downloaded.','ok');
}

/* ============================================================
   Settings (Signature PIN only)
   ============================================================ */
function viewSettings(){
  return {
    title:'Settings', crumb:'Administration',
    html: `
    ${pageHead('Settings', 'Change the PIN used to sign in to this console.')}
    <div class="grid g2">
      <div class="card"><div class="card-h"><h3>Signature PIN</h3></div><div class="card-b">
        <div class="notice warn">${I.lock}<div>Your PIN is your electronic signature. Anything signed with it is legally attributed to you.</div></div>
        <form id="pinForm" novalidate>
          <div class="grid g2">
            <div class="field"><label for="stOld">Current PIN</label>
              <input class="inp" id="stOld" type="password" inputmode="numeric" maxlength="6">
              <div class="err-msg hide" data-err="stOld"></div></div>
            <div class="field"><label for="stNew">New PIN</label>
              <input class="inp" id="stNew" type="password" inputmode="numeric" maxlength="6">
              <div class="err-msg hide" data-err="stNew"></div></div>
          </div>
          <button class="btn btn-primary" type="submit">${I.key} Change PIN</button>
        </form>
      </div></div>
    </div>`,
    bind: bindSettings
  };
}
function bindSettings(){
  const f = $('#pinForm'); if (!f) return;
  f.onsubmit = async (e) => {
    e.preventDefault(); clearErrors(f);
    const oldPin = $('#stOld').value.trim(), newPin = $('#stNew').value.trim();
    if (!oldPin) return setErr('stOld','Enter your current PIN.',f);
    if (!/^[0-9]{4,6}$/.test(newPin)) return setErr('stNew','New PIN must be 4 to 6 digits.',f);
    try {
      await api('/webhook/admin/api/change-pin', { method:'POST', body:{ old_pin:oldPin, new_pin:newPin } });
      f.reset(); toast('PIN changed','Your electronic signature PIN has been updated.','ok');
    } catch (err){ setErr('stOld', err.message, f); }
  };
}

/* ============================================================
   Routes
   ============================================================ */
route('/new', () => viewNewRequest());
route('/requests', () => viewRequests());
route('/sheet/:id', p => viewSheet(p.id));
route('/sheets', () => viewSheets());
route('/reports', () => viewReports());
route('/team', () => viewTeam());
route('/products', () => viewProducts());
route('/products/:id', p => viewProductDetail(p.id));
route('/audit', () => viewAudit());
route('/settings', () => viewSettings());


