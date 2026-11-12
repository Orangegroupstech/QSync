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
    undo: w('<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>'),   // recall (058)
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

// All times are shown in WAT (West Africa Time, Africa/Lagos), whatever the viewing device's timezone is.
const WAT_FMT = new Intl.DateTimeFormat('en-GB', { timeZone:'Africa/Lagos', hourCycle:'h23',
  year:'numeric', month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' });
function watParts(ts){
  const d = new Date(ts); if (isNaN(d)) return null;
  const p = {}; WAT_FMT.formatToParts(d).forEach(x => { p[x.type] = x.value; });
  return { y:Number(p.year), m:Number(p.month), d:Number(p.day), h:p.hour, mi:p.minute };
}
function fmtDateTime(ts){ if(!ts) return '--'; const w=watParts(ts); if(!w) return '--';
  return `${String(w.d).padStart(2,'0')} ${MONTHS[w.m-1]} ${w.y}, ${w.h}:${w.mi}`; }
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
  sent_to_qc:        { label:'With QC',            badge:'b-ok' },
  rejected:          { label:'Rejected',           badge:'b-danger' },
  returned_to_ipqa:  { label:'Returned to IPQA',   badge:'b-danger' },
  // QC laboratory (Phase 2, lab.js)
  qc_received:       { label:'In the QC lab',      badge:'b-warn' },
  qc_released:       { label:'Released by QC',     badge:'b-ok' },
  qc_not_released:   { label:'Not released',       badge:'b-danger' },
  qa_acknowledged:   { label:'Closed (QA)',        badge:'b-slate' },
};
const PRODUCTS_META = {
  Mixagrip:       { prefix:'A', type:'OSD', defaultBatchSize:1200000 },
  Procold:        { prefix:'B', type:'OSD', defaultBatchSize:1200000 },
  'Cannon Extra': { prefix:'C', type:'OSD', defaultBatchSize:1200000 },
  'Medik 55':     { prefix:'D', type:'OSD', defaultBatchSize:1200000 },
  Cypron:         { prefix:'E', type:'OSD', defaultBatchSize:600000 },
  Corhinza:       { prefix:'F', type:'OSD', defaultBatchSize:600000 },
  'Cannon PM':    { prefix:'G', type:'OSD', defaultBatchSize:500000 },
  Zaiki:          { prefix:'H', type:'OSD', defaultBatchSize:1200000, noStages:['Compression'] },
  Mintacid:       { prefix:'I', type:'OLD' },
};
const UNIT_OPTIONS = { OSD: ['kg', 'tablets'], OLD: ['litres'] };
const STAGE_OPTIONS = {
  OSD: ['Granulation', 'Finished Product'],   // primary packaging is not raised any more (QC, 29 Oct 2026); Compression is raised by IPQA (2 Nov 2026)
  OLD: ['Mixing', 'Finished Product']   // filling/sacheting is skipped like primary packaging (QC, 30 Oct 2026)
};
// IPQA raises Compression requests on its own sheet (migration 036)
const IPQA_COMPRESSION_URL = 'https://orangegroupsai.online/webhook/test-request/ipqa?new=compression';
const ALL_STAGES = Array.from(new Set([...STAGE_OPTIONS.OSD, 'Compression', 'Sacheting/Blistering/Stripping', 'Filling/Sacheting', ...STAGE_OPTIONS.OLD]));
function yearsFromDates(items, field){
  const years = new Set();
  items.forEach(it => { const v = it[field]; if (v){ const w = watParts(v); if (w) years.add(w.y); } });
  return Array.from(years).sort((a,b) => b-a);
}
function yearMonthSelectHtml(idPrefix, years, state){
  const yearOpts = years.map(y => `<option value="${y}" ${String(state.year)===String(y)?'selected':''}>${y}</option>`).join('');
  const monthOpts = MONTHS.map((m,i) => `<option value="${i+1}" ${String(state.month)===String(i+1)?'selected':''}>${m}</option>`).join('');
  return `<select class="inp" id="${idPrefix}Year" style="width:auto;min-width:100px"><option value="">All years</option>${yearOpts}</select>
    <select class="inp" id="${idPrefix}Month" style="width:auto;min-width:110px"><option value="">All months</option>${monthOpts}</select>`;
}


/* ---------------- API layer ---------------- */
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
// remember the page a link pointed to (e.g. an e-mail's "Open in QSync"), so the landing page returns here after sign-in
function rememberHere(){ try { if (currentPath() !== '/') sessionStorage.setItem('okl.return', location.pathname + location.hash); } catch(e) { /* ignore */ } }
function meFromAuth(auth, scope){
  const u = (auth && auth.user) || {};
  const editor = !!u.is_admin || ((auth && auth.edit) || []).includes(scope);
  return { id: u.id, name: u.name, role: u.is_admin ? 'admin' : '', is_admin: !!u.is_admin,
           permission: editor ? 'editor' : 'viewer', must_change: !!u.must_change, access: (auth && auth.access) || {},
           signoff: (auth && auth.signoff) || [] };
}
// Does this person sign as <role> (signoff.ipqa, signoff.qa_supervisor, ...)? Admins count as every role.
function hasSignoff(role){ return !!(S && S.me && (S.me.is_admin || (S.me.signoff || []).includes('signoff.' + role))); }
// Access per page (migration 022): 'edit' | 'submit' | 'view' | undefined. Admins may do everything.
function levelOf(scope){ return !S || !S.me ? undefined : (S.me.is_admin ? 'edit' : S.me.access[scope]); }
const PAGES = [['/lab/oos', 'qsync.oos'], ['/lab/master', 'qsync.master'], ['/lab', 'qsync.lab'], ['/dept', 'qsync.dept'],
  ['/reports', 'qsync.reports'], ['/products', 'qsync.master'],
  ['/new', 'qsync.requests'], ['/requests', 'qsync.requests'], ['/sheet', 'qsync.requests'], ['/audit', 'qsync.requests']];   // route prefix -> page, first match wins
function pageOf(path){
  const p = String(path == null ? currentPath() : path).split('?')[0];
  const hit = PAGES.find(([pre]) => p === pre || p.startsWith(pre + '/'));
  return hit ? hit[1] : 'qsync';
}
function canOpen(path){ return /^\/(help|my-approvals|ipqa|ipqa-new|qa)(\/|\?|$)/.test(String(path == null ? currentPath() : path)) ? true : !!levelOf(pageOf(path)); }   // How to use: everyone
function canRaiseRequest(){ return ['submit', 'edit'].includes(levelOf('qsync.requests')); }
function noAccess(){
  try { sessionStorage.setItem('okl.notice', 'You do not have access to QSync. Ask an admin if you need it.'); } catch(e) { /* ignore */ }
  toLandingKeepToken();
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
    rememberHere();
    toLanding();
    throw new Error('Your session has expired. Please log in again.');
  }
  let json = {};
  try { json = await res.json(); } catch (e) { /* empty body */ }
  if (!res.ok) throw new Error(json.error || 'Something went wrong.');
  if ((opts.method || 'GET') !== 'GET' && window.oklFormKeep) oklFormKeep.sent(opts.body);   // saved: formkeep.js
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
const IDLE_LIMIT_MS = 30 * 60 * 1000;   // 057: the server session is 30 minutes too
let idleTimer = null;
function resetIdleTimer(){
  if (!S) return;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { logout('Signed out after 30 minutes of inactivity.'); }, IDLE_LIMIT_MS);
}
['click','keydown','mousemove','touchstart'].forEach(evt =>
  document.addEventListener(evt, () => resetIdleTimer(), { passive:true }));


/* ---------------- Background polling (read-only pages only, paused while a modal is open) ---------------- */
const POLL_INTERVAL_MS = 60 * 1000;
const POLL_ROUTES = ['/requests', '/reports', '/audit', '/lab/master'];
let pollTimer = null;
// what waits for this person (042): the numbers on the menu and the tabs
async function refreshPending(){
  const path = S && S.lab ? '/webhook/qsync/lab/api/my' : (S && canOpen('/lab/master') ? '/webhook/qsync/lab/api/masterdata' : null);
  if (!path) return;
  try { const d = await api(path); const before = JSON.stringify(S.pending || {}); S.pending = d.pending;
        if (JSON.stringify(S.pending || {}) !== before && !(document.getElementById('layers') || {}).children?.length) render(); } catch (e) { /* next tick */ }
}
function pendingCount(path){ return Number(((S && S.pending && S.pending.menu) || {})[path] || 0); }
function pendingBadge(path){ const n = pendingCount(path);
  return n ? `<span class="nav-count" title="${n} waiting for you" style="margin-left:auto;min-width:20px;padding:1px 7px;border-radius:10px;background:var(--brand);color:#fff;font-size:11px;font-weight:700;text-align:center">${n > 99 ? '99+' : n}</span>` : ''; }
async function pollTick(){
  if (!S) return;
  refreshPending();
  const layers = document.getElementById('layers');
  if (layers && layers.children.length) return; // a modal/form is open - don't disturb it
  const path = currentPath().split('?')[0];
  if (!POLL_ROUTES.some(r => path.startsWith(r))) return;
  try {
    if (path.startsWith('/reports')) {
      reportsCache = await api('/webhook/admin/api/reports');
    } else {
      const keep = { me: S.me, lab: S.lab, signRoles: S.signRoles, pending: S.pending };
      S = Object.assign(await api('/webhook/admin/api/bootstrap'), keep);
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


async function logout(reason){
  try { await api('/webhook/auth/api/logout', { method:'POST' }); } catch(e) { /* best effort */ }
  if (idleTimer) clearTimeout(idleTimer);
  if (typeof stopPolling === 'function') stopPolling();
  if (reason) { try { sessionStorage.setItem('okl.notice', reason); } catch(e) { /* ignore */ } }
  toLanding();
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
    // "*name" (last part only) takes the rest of the path: request numbers have slashes (OKL/OLD/488), 10 Nov 2026
    const rest = pp.length && pp[pp.length - 1].startsWith('*');
    if (rest ? cp.length < pp.length : pp.length !== cp.length) continue;
    const params = {}; let ok = true;
    for (let i=0;i<pp.length;i++){
      if (pp[i].startsWith('*')) params[pp[i].slice(1)] = cp.slice(i).map(decodeURIComponent).join('/');
      else if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(cp[i]);
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
    { title:'Mine', items:[ { path:'/my-approvals', label:'My approvals', icon:'check', count: () => oklWaiting.count('qsync') } ] },
    ...(canRaiseRequest() ? [{ title:'Workspace', items:[ { path:'/new', label:'New Test Request', icon:'plus' } ] }] : []),
    ...(S.lab ? [{ title:'QC Laboratory', items:[
      { path:'/lab/inbox', label:'QC inbox', icon:'inbox' },
      { path:'/lab/my', label:'My analyses', icon:'doc' },
      { path:'/lab/oos', label:'OOS log', icon:'alert' },
    ]}] : []),
    { title:'Records', items:[
      { path:'/requests', label:'All Requests', icon:'layers' },
      { path:'/reports', label:'Reports and Trends', icon:'chart' },
    ]},
    { title:'Department requests', items:[
      { path:'/dept/procurement', label:'Make a procurement request', icon:'box' },
      { path:'/dept/overtime', label:'Submit overtime', icon:'clock' },
    ]},
    { title:'Administration', items:[
      { path:'/lab/master', label:'Lab master data', icon:'settings' },
      ...(S.lab ? [{ path:'/lab/relievers', label:'Relievers', icon:'users' }] : []),
      { path:'/audit', label:'Audit Trail', icon:'activity' },
    ]},
    { title:'Help', items:[ { path:'/help', label:'How to use', icon:'info' } ] },
  ];
}
// only the pages the person may open (their roles and page access; migration 022)
function allowedNav(){
  return navModel().map(g => Object.assign({}, g, { items: g.items.filter(it => canOpen(it.path)) })).filter(g => g.items.length);
}

/* ---------------- Shell ---------------- */
function renderShell(inner, meta){
  const me = S.me;
  const path = currentPath().split('?')[0];
  const navHtml = allowedNav().map(g => `
    <div class="nav-group">${esc(g.title)}</div>
    ${g.items.map(it => {
      const active = path.startsWith(it.path);
      return `<a class="nav-item ${active?'active':''}" href="#${it.path}">
        <span class="ic">${I[it.icon]}</span><span>${esc(it.label)}</span>${it.count ? waitBadge(it.count()) : pendingBadge(it.path)}</a>`;
    }).join('')}`).join('');

  return `
  <div class="shell">
    <div class="backdrop" onclick="document.body.classList.remove('nav-open')"></div>
    <aside class="sidebar">
      <div class="sidebar-top">
        <a href="#/requests" style="display:flex;flex-direction:column;align-items:flex-start;gap:7px;text-decoration:none">
          <span class="brand-img"><img src="../logo.png" alt="Orange Kalbe Limited"></span><span class="brand-name">ORANGE KALBE LIMITED</span>
        </a>
        <button class="btn-icon hide-lg" style="color:var(--nav-text-dim)" onclick="document.body.classList.remove('nav-open')" aria-label="Close menu">${I.x}</button>
      </div>
      <div style="padding:0 16px 10px">
        <div style="font-size:11px;color:var(--nav-text-dim);letter-spacing:.13em;text-transform:uppercase;font-weight:700">QSync Platform</div>
        <div style="font-size:11.5px;color:var(--nav-text-dim);margin-top:2px">Admin console</div>
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
        <a href="#/requests" class="only-mobile" style="line-height:0" aria-label="QSync home"><span style="display:flex;align-items:center;gap:8px"><img src="../logo.png" alt="Orange Kalbe Limited" style="height:30px;width:auto;display:block">
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
  return `<div class="empty"><div class="em-ic">${I[icon]||I.inbox}</div>
    <h4>${esc(title)}</h4><div class="small">${msg||''}</div>
    ${action?`<div style="margin-top:14px">${action}</div>`:''}</div>`;
}
function statusBadge(status){
  const s = STATUS[status] || {label:status, badge:'b-slate'};
  return `<span class="badge ${s.badge}"><span class="dot"></span>${esc(s.label)}</span>`;
}


/* ---------------- Boot / bootstrap / render ---------------- */
async function bootstrap(){
  // "who am I", the requests and the lab roles at the same time (startup.js); used to be three trips one after the other
  const data0 = api('/webhook/admin/api/bootstrap'), lab0 = api('/webhook/qsync/lab/api/my').catch(() => null);
  data0.catch(() => { /* reported below */ });
  const st = await oklMe.start(api, getToken());
  const auth = st.auth;
  if (auth.user && auth.user.must_change){ rememberHere(); toLandingKeepToken(); throw new Error('Password change required'); }
  const data = await data0;
  S = data;
  S.me = meFromAuth(auth, 'qsync');
  const lab = await lab0; S.lab = lab ? { roles: lab.roles || [] } : null;
  oklMe.follow(st, a => { if (a.user && a.user.must_change){ rememberHere(); toLandingKeepToken(); return; } if (S){ S.me = meFromAuth(a, 'qsync'); render(); } });
  // sign-off roles for people without the QC lab pages (e.g. a QC / QA Manager who only has Lab master data): the buttons there need them
  if (!S.lab && canOpen('/lab/master')) { try { const md = await api('/webhook/qsync/lab/api/masterdata'); S.signRoles = md.roles || []; S.pending = md.pending; } catch (e) { S.signRoles = []; } }
  else if (S.lab) refreshPending();
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
let renderedPath = null;   // a redraw of the same page (a value added, data loaded) keeps the scroll position
function render(){
  const app = document.getElementById('app');
  try {
    if (!S){ rememberHere(); toLanding(); return; }
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
          `<button class="btn btn-primary" onclick="go('/requests')">Back to requests</button>`)}</div></div>` };
    }
    const samePage = path === renderedPath, keepY = window.scrollY;
    const typed = window.oklFormKeep ? oklFormKeep.take(app, path) : null;   // what is being typed survives the draw (formkeep.js)
    app.innerHTML = renderShell(out.html, out);
    document.body.classList.remove('nav-open');
    if (out.bind) { try { out.bind(); } catch(e){ console.error(e); } }
    if (typed) oklFormKeep.put(typed, app, path);
    window.scrollTo({ top: samePage ? keepY : 0 });
    renderedPath = path;
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
    catch (e) { if (!getToken()) return; rememberHere(); toLandingKeepToken(); return; }
    if (!location.hash){
      const first = (allowedNav().find(g => g.title !== 'Mine') || allowedNav()[0]);
      location.hash = '#' + (first ? first.items[0].path : '/requests');
    }
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
// may edit products, specs and the lab master data (the 'qsync.master' page; admins always may)
function canEdit(){ return levelOf('qsync.master') === 'edit'; }
function viewNewRequest(){
  if (!canRaiseRequest()) return { title:'New test request', crumb:'Workspace', html:`<div class="card"><div class="card-b">${emptyState('lock','View-only access','Raising a test request needs "submit" access to Test requests. Ask an admin to grant it in User Management.')}</div></div>` };
  // the one form shared with the Production console (frontend/testrequest.js)
  const pg = oklTestRequest.page({ api: API_BASE, products: (S && S.products) || [], icons: I, toast, pageHead, cancelHref: '#/requests',
    onDone: async () => { await bootstrap(); rqReset(); go('/requests'); } });
  return { title:'New test request', crumb:'Workspace', html: pg.html, bind: pg.bind };
}

/* ============================================================
   All Requests
   ============================================================ */
let listState = { q:'', status:'', product:'', stage:'', result:'', year:'', month:'', sort:'updated' };
/* All test requests come from the server 50 at a time (061, 12 Nov 2026): the start-up only carries the working set.
   RQ = { key: the filters it was asked with, rows, total, next, busy, error } */
let RQ = null;
function rqParams(extra){
  const q = new URLSearchParams();
  Object.entries(listState).forEach(([k, v]) => { if (v) q.set(k, v); });
  Object.entries(extra || {}).forEach(([k, v]) => { if (v != null && v !== '') q.set(k, v); });
  return q;
}
async function rqLoad(more){
  const key = rqParams().toString();
  if (!more) RQ = { key, rows: [], total: null, next: null, busy: true, error: '' }; else RQ.busy = true;
  render();
  try {
    const d = await api('/webhook/admin/api/requests?' + rqParams(more && RQ.next ? { after_t: RQ.next.t, after_id: RQ.next.id } : {}).toString());
    if (!RQ || RQ.key !== key) return;                    // the filters changed meanwhile: that answer is for an old list
    RQ.rows = RQ.rows.concat(d.rows || []); RQ.total = d.total; RQ.next = d.next || null; RQ.busy = false;
  } catch (e) { if (RQ && RQ.key === key) { RQ.busy = false; RQ.error = e.message; } }
  render();
}
function rqReset(){ RQ = null; }
function overallResult(r){
  if (!r.parameters || !r.parameters.length) return null;
  return r.parameters.some(p => p.status === 'fail') ? 'fail' : 'pass';
}
function resultBadge(r){
  const ev = overallResult(r);
  if (ev === null) return `<span class="badge b-slate">Not tested</span>`;
  return ev === 'pass' ? `<span class="badge b-ok">${I.check} IPQA pass</span>` : `<span class="badge b-danger">${I.x} IPQA out of spec</span>`;   // IPQA checks only: QC results show on the batch pages
}
function viewRequests(){
  const want = rqParams().toString();
  if (!RQ || RQ.key !== want) setTimeout(() => { if (!RQ || RQ.key !== rqParams().toString()) rqLoad(false); }, 0);
  const rows = RQ && RQ.key === want ? RQ.rows : [];
  const productOptions = Object.keys(PRODUCTS_META).map(p => `<option value="${esc(p)}" ${listState.product===p?'selected':''}>${esc(p)}</option>`).join('');
  const statusOptions = Object.entries(STATUS).map(([k,v]) => `<option value="${k}" ${listState.status===k?'selected':''}>${esc(v.label)}</option>`).join('');
  const stageOptions = ALL_STAGES.map(s => `<option value="${esc(s)}" ${listState.stage===s?'selected':''}>${esc(s)}</option>`).join('');
  const resultOptions = [['pass','IPQA pass'],['fail','IPQA out of spec'],['untested','Not tested']]
    .map(([k,label]) => `<option value="${k}" ${listState.result===k?'selected':''}>${label}</option>`).join('');
  const years = S.request_years || yearsFromDates(S.requests, 'createdAt');
  const sortOptions = [['updated','Recently updated'],['created','Newest first'],['oldest','Oldest first']]
    .map(([k,label]) => `<option value="${k}" ${listState.sort===k?'selected':''}>${label}</option>`).join('');
  const loading = !RQ || RQ.key !== want || (RQ.busy && !rows.length);
  const more = RQ && RQ.next ? `<button class="btn btn-ghost btn-sm" ${RQ.busy ? 'disabled' : ''} onclick="rqLoad(true)">${RQ.busy ? 'Loading...' : 'Show 50 more'}</button>` : '';
  const foot = RQ && RQ.total != null && rows.length ? `<div class="okl-pager-srv"><span>Showing ${rows.length} of ${RQ.total}</span>${more}</div>` : '';
  const body = RQ && RQ.error ? `<div class="card-b">${emptyState('alert', 'Could not load the requests', esc(RQ.error), '<button class="btn btn-primary" onclick="rqLoad(false)">Try again</button>')}</div>`
    : loading ? `<div class="card-b small muted">Loading...</div>`
    : rows.length ? `<div class="tbl-wrap"><table class="tbl" data-nopage data-nosort>
      <thead><tr><th>Request</th><th>Product / Batch</th><th>Stage</th><th>Status</th><th>IPQA result</th><th>Updated</th><th></th></tr></thead>
      <tbody>${rows.map(r => `
        <tr class="clickable" onclick="go('/sheet/${r.id}')">
          <td data-label="Request"><div class="req-no">${esc(r.requestNo)}</div></td>
          <td data-label="Product / Batch"><div class="strong">${esc(r.productName)}</div><div class="tiny muted mono">${esc(r.batchNo)}</div></td>
          <td data-label="Stage"><span class="chip">${esc(r.stage)}</span></td>
          <td data-label="Status">${statusBadge(r.status)}</td>
          <td data-label="IPQA result">${resultBadge(r)}</td>
          <td class="small muted" data-label="Updated">${relTime(r.updatedAt)}</td>
          <td style="text-align:right">${I.chevR}</td>
        </tr>`).join('')}</tbody></table></div>${foot}`
    : `<div class="card-b">${emptyState('inbox','Nothing here','No requests match the current filters.')}</div>`;
  return {
    title:'All test requests', crumb:'Records', keepScroll: true,
    html: `
    ${pageHead('All test requests', 'Every request raised, with its current status and result.')}
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px">
        <div class="row" style="gap:10px">
          <div class="search filter-search"><span class="ic">${I.search}</span>
            <input class="inp" id="listQ" style="padding-left:34px;border-radius:20px" placeholder="Search request, batch or product" value="${esc(listState.q)}"></div>
          <select class="inp filter-sel-status" id="listStatus"><option value="">All statuses</option>${statusOptions}</select>
          <select class="inp filter-sel-product" id="listProduct"><option value="">All products</option>${productOptions}</select>
          <select class="inp" id="listStage" style="width:auto;min-width:150px"><option value="">All stages</option>${stageOptions}</select>
          <select class="inp" id="listResult" style="width:auto;min-width:130px"><option value="">All results</option>${resultOptions}</select>
          ${yearMonthSelectHtml('list', years, listState)}
          <select class="inp" id="listSort" style="width:auto;min-width:150px">${sortOptions}</select>
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
  const sg = $('#listStage'); if (sg) sg.onchange = e => { listState.stage = e.target.value; render(); };
  const rs = $('#listResult'); if (rs) rs.onchange = e => { listState.result = e.target.value; render(); };
  const yr = $('#listYear'); if (yr) yr.onchange = e => { listState.year = e.target.value; render(); };
  const mo = $('#listMonth'); if (mo) mo.onchange = e => { listState.month = e.target.value; render(); };
  const so = $('#listSort'); if (so) so.onchange = e => { listState.sort = e.target.value; render(); };
}
async function exportRequestList(){
  const rows = [['Request No','Product','Batch No','Stage','Status','Result','Updated']];
  let all;
  try { all = (await api('/webhook/admin/api/requests?' + rqParams({ limit: 5000 }).toString())).rows || []; }
  catch (e) { toast('Could not export', e.message, 'err'); return; }
  all.forEach(r => rows.push([r.requestNo, r.productName, r.batchNo, r.stage, (STATUS[r.status]||{}).label||r.status,
    overallResult(r)===null?'NOT TESTED':overallResult(r).toUpperCase(), fmtDateTime(r.updatedAt)]));
  download('qsync-requests-'+new Date().toISOString().slice(0,10)+'.csv', toCSV(rows), 'text/csv');
  toast('Export ready','The filtered request list has been downloaded.','ok');
}


/* ============================================================
   QSync Sheets
   ============================================================ */
const REQ_FETCH = {};   // id -> 'loading' | 'missing'
function reqById(id){
  const r = S.requests.find(x => String(x.id) === String(id));
  if (r || !S.requests_partial || REQ_FETCH[id]) return r;
  REQ_FETCH[id] = 'loading';                                 // older than the start-up's working set: fetch it once, then draw again
  api('/webhook/admin/api/requests?' + new URLSearchParams({ id: String(id), limit: '1' }).toString())
    .then(d => { const x = (d.rows || [])[0]; if (x) { S.requests.push(x); delete REQ_FETCH[id]; } else REQ_FETCH[id] = 'missing'; render(); })
    .catch(() => { REQ_FETCH[id] = 'missing'; render(); });
  return undefined;
}

function qsyncSheetHtml(r){
  const paramRows = (r.parameters||[]).map(p => {
    const value = p.valueText || p.valueNumeric;
    const spec = p.specText ? htmlDecode(p.specText) : ipqaSpec({ spec_min: p.specMin, spec_max: p.specMax, unit: p.unit });
    const verdict = p.status === 'pass' ? 'PASS' : p.status === 'fail' ? 'FAIL' : 'N/A';
    return `<tr>
      <td>${esc(p.name)}</td>
      <td>${esc(value)}${p.unit && p.valueNumeric ? ' '+esc(p.unit) : ''}</td>
      <td>${esc(spec)}</td>
      <td><b>${verdict}</b></td>
    </tr>`;
  }).join('');
  return `<div class="sheet">
    <div class="letterhead">Orange Kalbe Limited</div>
    <div class="sheet-head">
      <div>
        <h2>QSync Test Request Sheet</h2>
      </div>
      <div class="doc">
        Request No: ${esc(r.requestNo)}
      </div>
    </div>

    <h4>Batch details</h4>
    <table class="kv">
      <tr><th>Product</th><td>${esc(r.productName)}</td><th>Batch No</th><td>${esc(r.batchNo)}</td></tr>
      <tr><th>Batch Size</th><td>${esc(r.batchSize)} ${esc(r.batchSizeUnit||'')}</td><th>Stage</th><td>${esc(r.stage)}</td></tr>
      <tr><th>Mfg Date</th><td>${fmtMonthYear(r.mfgMonth)}</td><th>Exp Date</th><td>${fmtMonthYear(r.expMonth)}</td></tr>
      <tr><th>Sample Qty</th><td>${esc(r.sampleQty||'--')} ${esc(r.sampleQtyUnit||'')}</td><th>Test Required</th><td>${esc(r.testRequired||'--')}</td></tr>
    </table>

    <h4>IPQA parameters checked</h4>
    <table class="data">
      <tr><th>Parameter</th><th>Observed</th><th>Specification</th><th>Status</th></tr>
      ${paramRows || '<tr><td colspan="4" class="muted">No results recorded yet.</td></tr>'}
    </table>

    <div class="sign-grid">
      <div class="sign-box"><div class="sl">Requested by</div>
        <div class="sv">${esc(r.productionSignedBy || '--')}</div>
        <div class="ss">${r.productionSignedAt ? fmtDateTime(r.productionSignedAt) : '--'}</div></div>
      <div class="sign-box"><div class="sl">Done by</div>
        <div class="sv">${esc(r.ipqaSignedBy || '--')}</div>
        <div class="ss">${r.ipqaSignedAt ? fmtDateTime(r.ipqaSignedAt) : '--'}</div></div>
      <div class="sign-box"><div class="sl">${r.status === 'rejected' ? 'Rejected by' : 'Approved by'}</div>
        <div class="sv">${esc(r.qaSupervisorSignedBy || '--')}</div>
        <div class="ss">${r.qaSupervisorSignedAt ? fmtDateTime(r.qaSupervisorSignedAt) : '--'}</div></div>
    </div>

    ${r.qaComments ? `<h4>QA comments</h4><p>${esc(r.qaComments)}</p>` : ''}
  </div>`;
}

const LAB_STAGE = ['sent_to_qc', 'pending_qc_notify', 'qc_received', 'qc_released', 'qc_not_released', 'qa_acknowledged'];
function viewSheet(id){
  const r = reqById(id);
  if (!r && REQ_FETCH[id] === 'loading') return { title:'Loading', crumb:'Records', html: `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
  if (!r) return { title:'Not found', crumb:'Records', html: notFound() };
  // once QC has the batch, the page is the summary report: Phase 1 and QC so far, in one place
  if (S.lab && LAB_STAGE.includes(r.status)){
    const d = labGet('/request?id=' + r.id);
    if (d && !d.error) return {
      title:`${r.requestNo} - summary`, crumb:'Records',
      html: `${pageHead(`${r.requestNo} - summary report`, `As complete as the current stage: ${esc(labStatusText(d.request.status))}`, batchNav(r.id, 'summary'))}
        ${labReportHtml(d)}`
    };
    if (!d) return labWait('Summary report', 'Records');
  }
  // 058: from the sheet, the next step opens where it is done (it used to be a dead end until the e-mail link was used)
  const meName = S.me && S.me.name, next = [];
  if (['pending_ipqa', 'returned_to_ipqa'].includes(r.status)) next.push(`<a class="btn btn-primary" href="#/ipqa/${esc(r.requestNo)}">${r.status === 'returned_to_ipqa' ? 'Correct the IPQA sheet' : 'Fill the IPQA sheet'}</a>`);
  // the review page itself checks the QA Supervisor sign-off
  if (r.status === 'pending_qa_review' && !(meName && r.ipqaSignedBy === meName)) next.push(`<a class="btn btn-primary" href="#/qa/${esc(r.requestNo)}">Review and approve</a>`);
  if (r.status === 'pending_qa_review' && meName && r.ipqaSignedBy === meName && typeof recallBtn === 'function') next.push(recallBtn('ipqa', r.id, r.requestNo, false, '/ipqa/' + r.requestNo));
  if (['pending_qc_notify', 'sent_to_qc'].includes(r.status) && meName && r.qaSupervisorSignedBy === meName && typeof recallBtn === 'function') next.push(recallBtn('qa_review', r.id, r.requestNo));
  return {
    title:`QSync sheet - ${r.requestNo}`, crumb:'Records',
    html: `${pageHead(`QSync sheet - ${esc(r.requestNo)}`, '',
      `${next.join('')}${S.lab && ['qc_received','qc_released','qc_not_released','qa_acknowledged','sent_to_qc','pending_qc_notify'].includes(r.status)
          ? `<a class="btn btn-ghost" href="#/lab/request/${r.id}">${I.inbox} QC lab view</a>` : ''}
       <button class="btn btn-primary" onclick="window.print()">${I.print} Print / save as PDF</button>
       <a class="btn btn-ghost" href="#/requests">${I.chevL} Back to requests</a>`)}
      ${qsyncSheetHtml(r)}`
  };
}


/* ============================================================
   Reports and Trends
   ============================================================ */
let reportsCache = null;
let reportsLoading = false;
let reportsState = { year:'', month:'', product:'' };
function reportsQueryString(){
  const params = [];
  if (reportsState.year) params.push('year=' + encodeURIComponent(reportsState.year));
  if (reportsState.month) params.push('month=' + encodeURIComponent(reportsState.month));
  if (reportsState.product) params.push('product=' + encodeURIComponent(reportsState.product));
  return params.length ? '?' + params.join('&') : '';
}
function bindReportsFilters(){
  const yr = $('#reportsYear'); if (yr) yr.onchange = e => { reportsState.year = e.target.value; reportsCache = null; trendsCache = null; render(); };
  const mo = $('#reportsMonth'); if (mo) mo.onchange = e => { reportsState.month = e.target.value; reportsCache = null; trendsCache = null; render(); };
  const pr = $('#reportsProduct'); if (pr) pr.onchange = e => { reportsState.product = e.target.value; reportsCache = null; trendsCache = null; trendsSeries = ''; render(); };
  const ts = $('#trendSeries'); if (ts) ts.onchange = e => { trendsSeries = e.target.value; render(); };
}

/* ---- Reports and trends tabs (058, 10 Nov 2026): the cards stay on top; Overview (as before), Timing and durations,
   Parameter trends and product performance. Data: the QSync Lab "trends" endpoint (page "qsync.reports"). ---- */
let reportsTab = 'overview', trendsCache = null, trendsLoading = false, trendsSeries = '';
const REPORT_TABS = [['overview', 'Overview'], ['timing', 'Timing and durations'], ['trends', 'Parameter trends and product performance']];
function reportsTabsHtml(){
  return `<div class="tabs">${REPORT_TABS.map(([k, l]) => `<div class="tab ${k === reportsTab ? 'active' : ''}" onclick="reportsTab='${k}';render()">${esc(l)}</div>`).join('')}</div>`;
}
function trendsData(){
  if (trendsCache) return trendsCache;
  if (!trendsLoading){
    trendsLoading = true;
    api('/webhook/qsync/lab/api/trends', { method: 'POST', body: Object.assign({}, reportsState) })
      .then(d => { trendsCache = d; }).catch(e => { trendsCache = { error: e.message }; }).finally(() => { trendsLoading = false; render(); });
  }
  return null;
}
const hrs = h => (h == null ? '--' : h >= 48 ? (h / 24).toFixed(1) + ' days' : h >= 1 ? Number(h).toFixed(1) + ' h' : Math.round(h * 60) + ' min');
function reportsTabBody(){
  const d = trendsData();
  if (!d) return `<div class="card"><div class="card-b">${emptyState('chart', 'Loading...', '')}</div></div>`;
  if (d.error) return `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(d.error))}</div></div>`;
  return reportsTab === 'timing' ? reportsTimingHtml(d) : reportsTrendsHtml(d);
}
function reportsTimingHtml(d){
  const t = d.timing || {}, steps = (t.steps || []).filter(s => s.key !== 'total'), total = (t.steps || []).find(s => s.key === 'total') || {};
  const max = Math.max(1, ...steps.map(s => Number(s.avg_h) || 0));
  return `<div class="grid g4" style="margin-bottom:16px">
      <div class="stat acc-info"><div class="lbl">Whole cycle, average</div><div class="val" style="font-size:22px">${hrs(total.avg_h)}</div><div class="meta">request to QA acknowledgement, ${total.n || 0} batches</div></div>
      <div class="stat acc-info"><div class="lbl">Whole cycle, median</div><div class="val" style="font-size:22px">${hrs(total.median_h)}</div><div class="meta">half the batches are faster</div></div>
      <div class="stat acc-warn"><div class="lbl">Longest</div><div class="val" style="font-size:22px">${hrs(total.max_h)}</div><div class="meta">one batch</div></div>
      <div class="stat acc-brand"><div class="lbl">Not finished yet</div><div class="val">${(t.open || []).length}</div><div class="meta">batches still moving</div></div></div>
    <div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Time of each step</h3><div class="sub">Average (bar), median and longest, from one sign-off to the next</div></div></div>
      <div class="card-b">${steps.map(s => `<div style="margin-bottom:14px" title="${esc(s.label)}: average ${hrs(s.avg_h)}, median ${hrs(s.median_h)}, longest ${hrs(s.max_h)} (${s.n} batches)">
        <div class="row between"><div class="small strong">${esc(s.label)}</div><div class="small"><b class="tnum">${hrs(s.avg_h)}</b> <span class="muted">median ${hrs(s.median_h)} - longest ${hrs(s.max_h)} - ${s.n} batches</span></div></div>
        <div class="bar" style="margin-top:6px"><i style="width:${clamp((Number(s.avg_h) || 0) / max * 100, 2, 100)}%"></i></div></div>`).join('')}</div></div>
    <div class="grid g2" style="align-items:start">
      <div class="card"><div class="card-h"><div><h3>Month by month</h3><div class="sub">Average whole cycle and QC receipt to release</div></div></div>
        ${(t.by_month || []).length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Month</th><th>Batches</th><th>Whole cycle</th><th>QC receipt to release</th></tr></thead><tbody>
          ${t.by_month.map(m => `<tr><td>${esc(m.month)}</td><td class="tnum">${m.n}</td><td class="tnum">${hrs(m.avg_total_h)}</td><td class="tnum">${hrs(m.avg_release_h)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="card-b">${emptyState('chart', 'No finished batches yet', '')}</div>`}</div>
      <div class="card"><div class="card-h"><div><h3>Slowest batches</h3><div class="sub">Whole cycle, longest first</div></div></div>
        ${(t.slowest || []).length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Request</th><th>Product / batch</th><th>Whole cycle</th><th>Slowest step</th></tr></thead><tbody>
          ${t.slowest.map(x => { const st = Object.entries(x.steps || {}).filter(([k]) => k !== 'total').sort((a, b) => b[1] - a[1])[0];
            const lab = st ? ((t.steps || []).find(s => s.key === st[0]) || {}).label : '';
            return `<tr class="clickable" onclick="go('/sheet/${x.request_id}')"><td class="req-no">${esc(x.request_no)}</td><td>${esc(x.product)}<div class="tiny muted mono">${esc(x.batch_no)} - ${esc(x.stage)}</div></td>
              <td class="tnum strong">${hrs(x.total_h)}</td><td class="small">${st ? esc(lab) + ': ' + hrs(st[1]) : '--'}</td></tr>`; }).join('')}</tbody></table></div>` : `<div class="card-b">${emptyState('chart', 'No finished batches yet', '')}</div>`}</div></div>
    ${(t.open || []).length ? `<div class="card" style="margin-top:16px"><div class="card-h"><div><h3>Waiting now</h3><div class="sub">Batches not finished, and how long since their last step</div></div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Request</th><th>Product / batch</th><th>Where</th><th>Waiting</th></tr></thead><tbody>
      ${t.open.slice().sort((a, b) => b.waiting_h - a.waiting_h).slice(0, 25).map(x => `<tr class="clickable" onclick="go('/sheet/${x.request_id}')"><td class="req-no">${esc(x.request_no)}</td>
        <td>${esc(x.product)}<div class="tiny muted mono">${esc(x.batch_no)} - ${esc(x.stage)}</div></td><td class="small">${esc((STATUS[x.status] || {}).label || ((typeof LAB_STATUS !== 'undefined' && LAB_STATUS[x.status]) || {}).label || x.status)}</td>
        <td class="tnum">${hrs(x.waiting_h)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}`;
}
// one parameter over the batches: the values (line + points), the limits as dashed lines; hover a point for the batch
function trendChartSvg(pts, lo, hi, unit){
  const W = 720, H = 240, L = 48, R = 16, T = 14, B = 30;
  const vals = pts.map(p => Number(p.value)).concat([lo, hi].filter(v => v != null && v !== '').map(Number));
  let mn = Math.min(...vals), mx = Math.max(...vals); if (mn === mx){ mn -= 1; mx += 1; }
  const pad = (mx - mn) * 0.08; mn -= pad; mx += pad;
  const x = i => L + (pts.length === 1 ? (W - L - R) / 2 : i * (W - L - R) / (pts.length - 1)), y = v => T + (mx - v) * (H - T - B) / (mx - mn);
  const ticks = [0, 1, 2, 3, 4].map(k => mn + k * (mx - mn) / 4);
  const ref = (v, lab) => v == null || v === '' ? '' : `<line x1="${L}" x2="${W - R}" y1="${y(Number(v))}" y2="${y(Number(v))}" stroke="var(--text-2, #565E6B)" stroke-dasharray="5 4" stroke-width="1"/>
    <text x="${W - R}" y="${y(Number(v)) - 4}" text-anchor="end" font-size="11" fill="var(--text-2, #565E6B)">${esc(lab)} ${esc(v)}</text>`;
  const fmt = v => Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend of the values per batch" style="width:100%;height:auto;display:block">
    ${ticks.map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line, #E4E7EA)" stroke-width="1"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--text-2, #565E6B)">${fmt(v)}</text>`).join('')}
    ${ref(lo, 'min')}${ref(hi, 'max')}
    <polyline points="${pts.map((p, i) => `${x(i)},${y(Number(p.value))}`).join(' ')}" fill="none" stroke="var(--brand, #ED6B1F)" stroke-width="2" stroke-linejoin="round"/>
    ${pts.map((p, i) => `<g><title>${esc(p.batch_no)}${p.sample && p.sample !== p.batch_no ? ' (' + esc(p.sample) + ')' : ''} - ${esc(fmtDate(p.at))}: ${fmt(p.value)} ${esc(unit || '')} - ${p.pass === false ? 'OUT OF SPEC' : 'pass'}</title>
      <circle cx="${x(i)}" cy="${y(Number(p.value))}" r="10" fill="transparent"/>
      ${p.pass === false ? `<path d="M${x(i) - 5},${y(Number(p.value)) - 5}L${x(i) + 5},${y(Number(p.value)) + 5}M${x(i) + 5},${y(Number(p.value)) - 5}L${x(i) - 5},${y(Number(p.value)) + 5}" stroke="var(--danger, #C0392B)" stroke-width="2.5"/>`
        : `<circle cx="${x(i)}" cy="${y(Number(p.value))}" r="4" fill="var(--brand, #ED6B1F)" stroke="var(--surface, #fff)" stroke-width="2"/>`}</g>`).join('')}
    <text x="${L}" y="${H - 8}" font-size="11" fill="var(--text-2, #565E6B)">${esc(fmtDate(pts[0].at))}</text>
    <text x="${W - R}" y="${H - 8}" text-anchor="end" font-size="11" fill="var(--text-2, #565E6B)">${esc(fmtDate(pts[pts.length - 1].at))}</text></svg>`;
}
function reportsTrendsHtml(d){
  const series = (d.ipqa_series || []).map(s => ({ key: 'i|' + s.product + '|' + s.stage + '|' + s.parameter, label: `${s.product} - ${s.stage} - ${s.parameter} (IPQA)`,
      unit: s.unit, lo: s.spec_min, hi: s.spec_max, limit: s.spec_min != null || s.spec_max != null ? `${s.spec_min ?? ''} to ${s.spec_max ?? ''} ${s.unit || ''}` : '', points: s.points }))
    .concat((d.qc_series || []).map(s => ({ key: 'q|' + s.product + '|' + s.test + '|' + s.api, label: `${s.product} - ${s.api} ${String(s.test).replace(/_/g, ' ')} (QC)`,
      unit: s.unit, lo: null, hi: null, limit: s.limit_text, points: s.points })))
    .filter(s => (s.points || []).length);
  const cur = series.find(s => s.key === trendsSeries) || series[0];
  const pts = cur ? cur.points.slice(-60) : [];
  const fails = pts.filter(p => p.pass === false).length;
  return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Parameter trend</h3><div class="sub">One parameter across the batches (the last 60). A cross is out of specification; hover a point for the batch.</div></div></div>
      <div class="card-b">${series.length ? `<div class="field" style="max-width:560px"><label for="trendSeries">Parameter</label><select class="inp" id="trendSeries">${series.map(s => `<option value="${esc(s.key)}" ${cur && s.key === cur.key ? 'selected' : ''}>${esc(s.label)} - ${s.points.length} batches</option>`).join('')}</select></div>
        <div class="small muted" style="margin:4px 0 10px">${cur.limit ? 'Limit: ' + esc(cur.limit) + ' - ' : ''}${pts.length} values, ${fails} out of specification${cur.unit ? ' - unit ' + esc(cur.unit) : ''}</div>
        ${trendChartSvg(pts, cur.lo, cur.hi, cur.unit)}
        <details style="margin-top:10px"><summary class="small">Show the values as a table</summary><div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Batch</th><th>Date</th><th>Value</th><th></th></tr></thead><tbody>
          ${pts.slice().reverse().map(p => `<tr><td class="mono small">${esc(p.batch_no)}${p.sample && p.sample !== p.batch_no ? ' (' + esc(p.sample) + ')' : ''}</td><td class="small">${fmtDate(p.at)}</td><td class="tnum">${esc(p.value)} ${esc(cur.unit || '')}</td>
            <td>${p.pass === false ? '<span class="badge b-danger">Out of spec</span>' : '<span class="badge b-ok">Pass</span>'}</td></tr>`).join('')}</tbody></table></div></details>`
        : emptyState('chart', 'No values yet', 'Values appear as batches are tested.')}</div></div>
    <div class="card"><div class="card-h"><div><h3>Product performance</h3><div class="sub">IPQA first pass, QC results, out-of-specification entries and the time QC takes to release</div></div></div>
      ${(d.products || []).length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Product</th><th>Requests</th><th>IPQA first pass</th><th>QC results passed</th><th>OOS</th><th>Released / not</th><th>QC receipt to release</th></tr></thead><tbody>
        ${d.products.map(p => { const ip = p.ipqa_tested ? Math.round(p.ipqa_first_pass / p.ipqa_tested * 100) : null, qc = p.qc_results ? Math.round(p.qc_pass / p.qc_results * 100) : null;
          const barc = r => `<div class="row" style="gap:8px"><div class="bar ${r >= 95 ? 'ok' : r >= 80 ? 'warn' : 'danger'}" style="width:66px"><i style="width:${r}%"></i></div><span class="tnum small strong">${r}%</span></div>`;
          return `<tr><td class="strong">${esc(p.product)}</td><td class="tnum">${p.requests}</td><td>${ip == null ? '<span class="muted">--</span>' : barc(ip) + `<div class="tiny muted">${p.ipqa_first_pass} of ${p.ipqa_tested}</div>`}</td>
            <td>${qc == null ? '<span class="muted">--</span>' : barc(qc) + `<div class="tiny muted">${p.qc_pass} of ${p.qc_results}</div>`}</td><td class="tnum">${p.oos ? `<span class="badge b-danger">${p.oos}</span>` : '0'}</td>
            <td class="tnum">${p.released} / ${p.not_released}</td><td class="tnum">${hrs(p.avg_release_h)}</td></tr>`; }).join('')}</tbody></table></div>` : `<div class="card-b">${emptyState('chart', 'No data', '')}</div>`}</div>`;
}
function reportsFilterBarHtml(){
  const years = S.request_years || yearsFromDates(S.requests, 'createdAt');
  const productOptions = Object.keys(PRODUCTS_META).map(p => `<option value="${esc(p)}" ${reportsState.product===p?'selected':''}>${esc(p)}</option>`).join('');
  return `<div class="card" style="margin-bottom:16px"><div class="card-b filter-bar" style="padding:14px 18px">
    <div class="row" style="gap:10px">
      ${yearMonthSelectHtml('reports', years, reportsState)}
      <select class="inp" id="reportsProduct" style="width:auto;min-width:150px"><option value="">All products</option>${productOptions}</select>
    </div>
  </div></div>`;
}

function viewReports(){
  if (!reportsCache && !reportsLoading){
    reportsLoading = true;
    api('/webhook/admin/api/reports' + reportsQueryString()).then(data => {
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
        ${reportsFilterBarHtml()}
        <div class="card"><div class="card-b">${emptyState('chart','Loading...','Fetching the latest numbers.')}</div></div>`,
      bind: bindReportsFilters
    };
  }
  const d = reportsCache;
  const maxAvg = Math.max(...(d.timeSpent||[]).map(s => s.avgSeconds || 0), 1);
  return {
    title:'Reports and trends', crumb:'Records',
    html: `
    ${pageHead('Reports and trends', 'Performance of the digital workflow: turnaround, first pass rate, and where time is being spent.',
      `<button class="btn btn-ghost" onclick="reportsCache=null;trendsCache=null;render()">${I.play} Refresh</button>`)}

    ${reportsFilterBarHtml()}

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

    ${reportsTabsHtml()}
    ${reportsTab !== 'overview' ? reportsTabBody() : `
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
    </div>`}`,
    bind: bindReportsFilters
  };
}


/* ============================================================
   Role labels (used by the Audit Trail filter; people are managed in User Management)
   ============================================================ */
const ROLE_LABELS = {
  production:'Production', ipqa:'IPQA', qa_supervisor:'QA Supervisor',
  qc_supervisor:'QC Supervisor', admin:'Admin', qc_analyst:'QC Analyst', qc_manager:'QC Manager', qa_manager:'QA Manager',
};


/* ============================================================
   Products and Specifications
   ============================================================ */
function stagesForProduct(p){
  const stages = [];
  (p.specs||[]).forEach(s => { if (!stages.includes(s.stage)) stages.push(s.stage); });
  return stages;
}
let productsState = { q:'', type:'' };
function viewProducts(){
  let products = S.products.slice();
  const q = productsState.q.trim().toLowerCase();
  if (q) products = products.filter(x => x.name.toLowerCase().includes(q));
  if (productsState.type) products = products.filter(x => x.type === productsState.type);
  const rows = products.map(x => {
    const stages = stagesForProduct(x);
    const requestsRaised = S.request_counts ? (S.request_counts[x.name] || 0) : S.requests.filter(r => r.productName === x.name).length;
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
      'Acceptance criteria used to build the live IPQA testing form. A new product or a change is started by a QC or QA Supervisor, reviewed by the QC Manager and approved by the QA Manager; it takes effect on the next IPQA form load once approved. An optional check may be left blank on the IPQA sheet (saved as Not tested).',
      isStarter() ? `<button class="btn btn-primary" onclick="productDialog()">${I.plus} New product</button>` : '')}
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px">
        <div class="row" style="gap:10px">
          <div class="search filter-search"><span class="ic">${I.search}</span>
            <input class="inp" id="prodQ" style="padding-left:34px;border-radius:20px" placeholder="Search products" value="${esc(productsState.q)}"></div>
          <select class="inp" id="prodType" style="width:auto;min-width:130px">
            <option value="">All types</option>
            <option value="OSD" ${productsState.type==='OSD'?'selected':''}>OSD</option>
            <option value="OLD" ${productsState.type==='OLD'?'selected':''}>OLD</option>
          </select>
        </div>
      </div>
      <div class="card-h"><div><h3>Product catalogue</h3><div class="sub">${products.length} products</div></div></div>
      ${products.length ? rows : `<div class="card-b">${emptyState('box','No products match','Try a different search or type filter.')}</div>`}
    </div>`,
    bind: () => {
      const q = $('#prodQ');
      if (q) q.addEventListener('input', debounce(e => { productsState.q = e.target.value; render();
        const el = $('#prodQ'); if (el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 260));
      const t = $('#prodType'); if (t) t.onchange = e => { productsState.type = e.target.value; render(); };
    }
  };
}
function viewProductDetail(id){
  const p = S.products.find(x => String(x.id) === String(id));
  if (!p) return { title:'Not found', crumb:'Administration', html: notFound() };
  const stages = stagesForProduct(p);
  const requestsRaised = S.request_counts ? (S.request_counts[p.name] || 0) : S.requests.filter(r => r.productName === p.name).length;
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
            ${isStarter() ? `<button class="btn btn-ghost btn-sm" onclick="editShelfLife(${p.id})">${I.edit} Request change</button>` : ''}
          </div>
        </div>
      </div>
      ${stages.map(stage => {
        const specs = (p.specs||[]).filter(s => s.stage === stage);
        return `<div class="card">
          <div class="card-h"><div><h3>${esc(stage)}</h3><div class="sub">Applied automatically on the IPQA form</div></div></div>
          <div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Parameter</th><th>Acceptance criteria</th><th>Type</th><th>On the IPQA sheet</th><th></th></tr></thead>
            <tbody>${specs.length ? specs.map(s => `<tr>
              <td data-label="Parameter"><div class="strong">${esc(s.parameterName)}</div></td>
              <td class="small" data-label="Acceptance criteria">${esc(s.specText || (s.specMin!=null && s.specMax!=null ? `${s.specMin} - ${s.specMax}${s.unit?' '+s.unit:''}` : '--'))}</td>
              <td data-label="Type"><span class="chip">${s.specText ? 'Complies / Does not' : 'Numeric'}</span></td>
              <td data-label="On the IPQA sheet">${s.optional ? '<span class="badge b-warn">Optional</span>' : '<span class="small muted">Required</span>'}</td>
              <td style="text-align:right">${isStarter() ? `<button class="btn btn-ghost btn-sm" onclick='editSpec(${s.id})'>${I.edit} Request change</button>` : '<span class="tiny muted">View only</span>'}</td>
            </tr>`).join('') : `<tr><td colspan="5" class="muted" style="padding:16px">No parameters imported for this stage.</td></tr>`}</tbody>
          </table></div>
        </div>`;
      }).join('')}
    </div>`
  };
}
function editSpec(specId){
  let found = null;
  for (const p of S.products){ const s = (p.specs||[]).find(x => x.id === specId); if (s){ found = { s, p }; break; } }
  if (!found) return;
  const s = found.s, p = found.p, numeric = !s.specText;
  signDialog({
    title:`Change ${s.parameterName}`, sub:`${p.name} - ${s.stage}. The QC Manager reviews it, then the QA Manager approves it.`, ok:'Sign and send',
    meaning:`You start this change as ${starterTitle()}. Nothing changes until the QA Manager approves.`,
    body:`${numeric ? `<div class="grid g2">
        <div class="field"><label for="spMin">Lower limit</label><div class="inp-group"><input class="inp" id="spMin" value="${s.specMin ?? ''}" inputmode="decimal"><div class="addon">${esc(s.unit||'')}</div></div></div>
        <div class="field"><label for="spMax">Upper limit</label><div class="inp-group"><input class="inp" id="spMax" value="${s.specMax ?? ''}" inputmode="decimal"><div class="addon">${esc(s.unit||'')}</div></div></div></div>`
        : `<div class="field"><label>Specification</label><div class="small">${esc(s.specText)}</div></div>`}
      <div class="field"><label for="spOpt">On the IPQA sheet</label><select class="inp" id="spOpt">
        <option value="no" ${s.optional ? '' : 'selected'}>Required: IPQA must enter it</option>
        <option value="yes" ${s.optional ? 'selected' : ''}>Optional: IPQA may leave it blank (saved as Not tested)</option></select></div>`,
    reason:'Why is this needed?', reasonRequired:true,
    submit: async ({ password, reason, wrap }) => {
      const ch = { id:specId, stage:s.stage, parameter_name:s.parameterName, optional: $('#spOpt',wrap).value === 'yes' };
      if (numeric){
        const min = parseFloat($('#spMin',wrap).value), max = parseFloat($('#spMax',wrap).value);
        if (isNaN(min) || isNaN(max)) throw new Error('Enter a number for both limits.');
        if (max <= min) throw new Error('The upper limit must be greater than the lower limit.');
        ch.spec_min = min; ch.spec_max = max;
      }
      await labPost('/change/submit', { kind:'product', action:'edit', target_id:p.id, reason, password, payload:{ spec_changes:[ch] } });
      toast('Sent to the QC Manager', esc(p.name)+' - '+esc(s.parameterName), 'ok');
    }
  });
}
function editShelfLife(productId){
  const p = S.products.find(x => x.id === productId);
  if (!p) return;
  signDialog({
    title:`Change shelf life - ${p.name}`, sub:'Used to calculate Exp Date on new test requests. The QC Manager reviews it, then the QA Manager approves it.', ok:'Sign and send',
    meaning:`You start this change as ${starterTitle()}. The shelf life stays as it is until the QA Manager approves.`,
    body:`<div class="field"><label for="slMonths">Shelf life (months)</label><input class="inp" id="slMonths" value="${p.shelfLifeMonths}" inputmode="numeric"></div>`,
    reason:'Why is this needed?', reasonRequired:true,
    submit: async ({ password, reason, wrap }) => {
      const months = parseInt($('#slMonths',wrap).value, 10);
      if (!Number.isFinite(months) || months <= 0) throw new Error('Enter a whole number of months greater than zero.');
      await labPost('/change/submit', { kind:'product', action:'edit', target_id:productId, reason, password, payload:{ shelf_life_months:months } });
      toast('Sent to the QC Manager', esc(p.name), 'ok');
    }
  });
}


/* ============================================================
   Audit Trail
   ============================================================ */
let auditState = { q:'', role:'', action:'', year:'', month:'' };
function viewAudit(){
  let rows = S.audit.slice();
  const q = auditState.q.trim().toLowerCase();
  if (q) rows = rows.filter(e => [e.actor_name, e.action, e.detail, e.ref].join(' ').toLowerCase().includes(q));
  if (auditState.role) rows = rows.filter(e => e.actor_role === auditState.role);
  if (auditState.action) rows = rows.filter(e => e.action === auditState.action);
  if (auditState.year) rows = rows.filter(e => e.at && (watParts(e.at)||{}).y === Number(auditState.year));
  if (auditState.month) rows = rows.filter(e => e.at && (watParts(e.at)||{}).m === Number(auditState.month));

  const roleOptions = Object.entries(ROLE_LABELS).map(([k,v]) => `<option value="${k}" ${auditState.role===k?'selected':''}>${esc(v)}</option>`).join('');
  const actionOptions = Array.from(new Set(S.audit.map(e => e.action))).sort()
    .map(a => `<option value="${esc(a)}" ${auditState.action===a?'selected':''}>${esc(a)}</option>`).join('');
  const years = yearsFromDates(S.audit, 'at');

  return {
    title:'Audit trail', crumb:'Administration',
    html: `
    ${pageHead('Audit trail', 'A chronological record of user, request, and specification changes.',
      `<button class="btn btn-ghost" onclick="exportAudit()">${I.download} Export</button>`)}
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px">
        <div class="row" style="gap:10px">
          <div class="search" style="max-width:340px"><span class="ic">${I.search}</span>
            <input class="inp" id="auditQ" style="padding-left:34px;border-radius:20px" value="${esc(auditState.q)}"
              placeholder="Search by person, action or reference"></div>
          <select class="inp" id="auditRole" style="width:auto;min-width:150px"><option value="">All roles</option>${roleOptions}</select>
          <select class="inp" id="auditAction" style="width:auto;min-width:180px"><option value="">All actions</option>${actionOptions}</select>
          ${yearMonthSelectHtml('audit', years, auditState)}
        </div>
      </div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th><th>Reference</th></tr></thead>
        <tbody>${rows.length ? rows.map(e => `<tr>
          <td class="small" style="white-space:nowrap" data-label="When">${fmtDateTime(e.at)}<div class="tiny muted">${relTime(e.at)}</div></td>
          <td data-label="Who"><div class="person" style="gap:8px">${avatarEl(e.actor_name,'sm')}<div class="person-txt"><span class="small strong" title="${esc(e.actor_name)}">${esc(e.actor_name)}</span></div></div></td>
          <td class="small strong" data-label="Action">${esc(e.action)}</td>
          <td class="small muted" style="max-width:380px" data-label="Detail">${esc(e.detail||'--')}</td>
          <td data-label="Reference">${e.ref?`<span class="mono small">${esc(e.ref)}</span>`:'<span class="muted">--</span>'}</td>
        </tr>`).join('') : `<tr><td colspan="5" class="muted" style="padding:16px">No matching entries.</td></tr>`}</tbody>
      </table></div>
    </div>`,
    bind: () => {
      const el = $('#auditQ');
      if (el) el.addEventListener('input', debounce(e => { auditState.q = e.target.value; render();
        const q = $('#auditQ'); if (q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 260));
      const ro = $('#auditRole'); if (ro) ro.onchange = e => { auditState.role = e.target.value; render(); };
      const ac = $('#auditAction'); if (ac) ac.onchange = e => { auditState.action = e.target.value; render(); };
      const yr = $('#auditYear'); if (yr) yr.onchange = e => { auditState.year = e.target.value; render(); };
      const mo = $('#auditMonth'); if (mo) mo.onchange = e => { auditState.month = e.target.value; render(); };
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

/* ============================================================
   Routes
   ============================================================ */
route('/new', () => viewNewRequest());
// the console's home: the first page this person may open (a link to "QSync" with no page, or to a page that is gone, lands here)
route('/', () => { const first = (allowedNav().find(g => g.title !== 'Mine') || allowedNav()[0]); location.replace('#' + (first ? first.items[0].path : '/requests')); return { title:'QSync', crumb:'', html:'' }; });
route('/requests', () => viewRequests());
route('/sheet/:id', p => viewSheet(p.id));
route('/reports', () => viewReports());
// Products and Specs is the first tab of Lab master data (042); old links still land there
route('/products', () => { mdTab = 'products'; mdProduct = null; go('/lab/master'); return labWait('Lab master data', 'Administration'); });
route('/products/:id', p => { mdTab = 'products'; mdProduct = Number(p.id); go('/lab/master'); return labWait('Lab master data', 'Administration'); });
route('/audit', () => viewAudit());

// the orange number beside a menu item (the same look everywhere)
function waitBadge(n){ return n ? `<span class="nav-count" title="${n} waiting for you" style="margin-left:auto;min-width:20px;padding:1px 7px;border-radius:10px;background:var(--brand);color:#fff;font-size:11px;font-weight:700;text-align:center">${n > 99 ? '99+' : n}</span>` : ''; }

/* ---- My approvals: the same page in every console (../waiting.js), from the one server list (okl_waiting) ---- */
function viewMyApprovals(){
  const pg = oklWaiting.page('qsync');
  return { title:'My approvals', crumb:'Mine', keepScroll: true, html: pageHead('My approvals', 'What waits for you: requests to approve, work assigned to you, things that came back and overdue items in your area. The number on the menu is this list.') + pg.html };
}
route('/my-approvals', viewMyApprovals);
/* The IPQA sheet and the QA review inside the console (8 Nov 2026). The same page the e-mail used to open, served after sign-in: the
   server sees the console session, shows the sign-off as "type your full name" (no password) and checks the name is yours.
   Access is decided by the server (IPQA / QA Supervisor sign-off in Users); the page only shows what it answers. */
function viewSignoff(kind, no){
  const isQa = kind === 'qa', isNew = kind === 'ipqa-new';
  const url = API_BASE + '/webhook/test-request/' + (isQa ? 'qa' : 'ipqa') + (isNew ? '?new=compression' : '?request_no=' + encodeURIComponent(no || ''));
  const title = isQa ? 'QA review - ' + no : isNew ? 'New Compression request (IPQA)' : 'IPQA sheet - ' + no;
  return { title, crumb:'Workspace',
    html: `${pageHead(title, isQa ? 'Review the IPQA results, then approve or send back. You sign by ticking your name.' : 'Record the IPQA results. You sign by ticking your name.', `<a class="btn btn-ghost" href="#/my-approvals">Back to My approvals</a>`)}
      <div class="card"><div class="card-b" style="padding:0"><div id="soNote" class="small muted" style="padding:14px">Loading the page...</div>
      <iframe id="soFrame" title="${esc(title)}" style="width:100%;border:0;min-height:480px;display:none;background:#fff"></iframe></div></div>`,
    bind(){
      const fr = $('#soFrame'), note = $('#soNote'); if (!fr) return;
      fetch(url, { headers: { Authorization: getToken() || '' } }).then(r => r.text().then(h => ({ ok: r.ok, h }))).then(r => {
        if (!r.ok && !/<html/i.test(r.h)) { note.textContent = 'The page could not be opened. Try again.'; return; }
        fr.srcdoc = r.h; fr.style.display = 'block'; note.style.display = 'none';
        const fit = () => { if (!document.body.contains(fr)) return clearInterval(t); try { const d = fr.contentDocument; if (d && d.documentElement) fr.style.height = Math.max(480, d.documentElement.scrollHeight + 8) + 'px'; } catch (e) { /* ignore */ } };
        const t = setInterval(fit, 500); fr.onload = fit;
      }).catch(() => { note.textContent = 'Could not reach the server. Check your connection and try again.'; });
    } };
}
route('/ipqa/*no', p => viewSignoff('ipqa', p.no));
route('/ipqa-new', () => viewSignoff('ipqa-new'));
route('/qa/*no', p => viewSignoff('qa', p.no));

