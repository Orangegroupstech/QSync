"use strict";
/* ============================================================
   Production store (migration 066, 13 Nov 2026): production materials with live stock, use per week and a worked-out
   reorder level. Replaces the foreman's "CARTRIDGES CONSUMPTIONs" Excel file. Built like the Engineering spares.
   Loaded after app.js (it uses app.js's helpers: api, S, render, route, openModal, toast, pageHead, levelOf ...).
   Every number that is worked out has an (i) beside it (oklInfo, ../shared.js): the rule, and why it is so.
   Pages: #/store (stock), #/store/received, #/store/issued, #/store/counts, #/store/settings.
   ============================================================ */
const ST = { data: null, loading: false, error: '', q: '', status: '', type: '', moves: { receipt: null, issue: null }, movesErr: '',
             from: '', to: '', counts: null, week: '', requests: null };
const stNum = v => v == null || v === '' ? '' : String(+v);
const stMoney = v => v == null || v === '' ? '' : Number(v).toLocaleString('en-GB', { maximumFractionDigits: 2 });
const stToday = () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);   // Lagos is UTC+1
const stInfo = (t, label) => window.oklInfo ? window.oklInfo(t, label) : '';
const ST_UNITS = ['pcs', 'set', 'pair', 'box', 'pack', 'roll', 'can', 'tube', 'bottle', 'm', 'L', 'kg'];
const ST_ICON_DL = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>';

// the status colours: the same words and colours on the page, in the morning WhatsApp (emoji) and in the How-to
const ST_STATUS = [
  ['Count needed', 'count', 'Count needed: the stock is not known yet (never counted).'],
  ['Out of stock', 'out', 'Out of stock: nothing left.'],
  ['Reorder now', 'reorder', 'Reorder now: at or below the reorder level. Ask for more today.'],
  ['Order soon', 'soon', 'Order soon: within one more week of use above the reorder level.'],
  ['Not moving', 'idle', 'Not moving: on the shelf, but nothing issued in the weeks looked back. Check it is still needed.'],
  ['OK', 'ok', 'OK: enough for now.'],
];
const stCls = s => (ST_STATUS.find(x => x[0] === s) || [0, 'ok'])[1];
const stRank = s => { const i = ST_STATUS.findIndex(x => x[0] === s); return i < 0 ? 9 : i; };
const stBadge = s => `<span class="sb sb-${stCls(s)}">${esc(s)}</span>`;

(function stStyle(){
  if (document.getElementById('stStyle')) return;
  const el = document.createElement('style'); el.id = 'stStyle';
  el.textContent = '.g4{grid-template-columns:repeat(4,minmax(0,1fr))}@media (max-width:900px){.g4{grid-template-columns:repeat(2,minmax(0,1fr))}}'
    + '.sb{display:inline-block;padding:2px 9px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;border:1px solid}'
    + '.sb-out{background:#B3261E;color:#fff;border-color:#B3261E}.sb-reorder{background:#FFE4CC;color:#9A3412;border-color:#FB9F5A}'
    + '.sb-soon{background:#FEF3C0;color:#7A4A06;border-color:#EBC94A}.sb-ok{background:#E3F3E7;color:#1E6B35;border-color:#A9D8B6}'
    + '.sb-idle{background:#EEF0F2;color:#4B5563;border-color:#D0D5DB}.sb-count{background:#E6EEFB;color:#1B4F9C;border-color:#B5CBF0}'
    + '.tbl tr.st-out td:first-child{box-shadow:inset 4px 0 0 #B3261E}.tbl tr.st-reorder td:first-child{box-shadow:inset 4px 0 0 #EA6A12}'
    + '.tbl tr.st-soon td:first-child{box-shadow:inset 4px 0 0 #D9A400}.tbl tr.st-ok td:first-child{box-shadow:inset 4px 0 0 #2E8B4A}'
    + '.tbl tr.st-idle td:first-child{box-shadow:inset 4px 0 0 #9AA3AD}.tbl tr.st-count td:first-child{box-shadow:inset 4px 0 0 #3B73C4}'
    + '.wl-out,.wl-reorder{color:#B3261E;font-weight:700}.wl-soon{color:#8A5A00;font-weight:700}'
    + '.st-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.st-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,#d6dbe0);'
    + 'background:var(--surface,#fff);border-radius:20px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer;min-height:36px}'
    + '.st-chip.on{border-color:var(--text-1,#1d2329);box-shadow:0 0 0 1px var(--text-1,#1d2329)}.st-chip .n{font-weight:700}'
    + '.pl-head{display:flex;gap:8px;padding:0 0 4px}.pl-row{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--line-2,#eef0f2)}'
    + '.pl-part{flex:1 1 auto;min-width:0}.pl-qty{width:90px;flex:0 0 90px}.pl-price{width:130px;flex:0 0 130px}'
    + '@media (max-width:640px){.pl-head{display:none}.pl-row{flex-wrap:wrap}.pl-part{flex:1 1 100%}.pl-qty,.pl-price{flex:1 1 0;width:auto}}'
    + '.st-why{background:var(--bg-2,#f6f7f9);border:1px solid var(--line-2,#eef0f2);border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.55}'
    + '.trend{font-weight:700;margin-left:3px}.trend.up{color:#B3261E}.trend.down{color:#2E6DB4}';
  document.head.appendChild(el);
})();

/* ---- data */
async function stLoad(force){
  if (ST.loading || (ST.data && !force)) return;
  ST.loading = true; ST.error = '';
  try { ST.data = await api('/webhook/production/api/store'); }
  catch (err) { ST.error = err.message; }
  finally { ST.loading = false; render(); }
}
async function stLoadMoves(kind, force){
  if (ST.moves[kind] && !force) return;
  try { const q = '?kind=' + kind + (ST.from ? '&from=' + ST.from : '') + (ST.to ? '&to=' + ST.to : '');
        const r = await api('/webhook/production/api/store/' + (kind === 'issue' ? 'issued' : 'received') + q); ST.moves[kind] = r.moves || []; ST.movesErr = ''; }
  catch (err) { ST.movesErr = err.message; }
  render();
}
async function stLoadCounts(force){
  if (ST.counts && !force) return;
  try { ST.counts = await api('/webhook/production/api/store/counts' + (ST.week ? '?week=' + ST.week : '')); } catch (err) { ST.movesErr = err.message; }
  render();
}
async function stLoadRequests(force){
  if (ST.requests && !force) return ST.requests;
  try { const r = await api('/webhook/production/api/store/requests'); ST.requests = r.requests || []; } catch (err) { ST.requests = []; }
  return ST.requests;
}
async function stRefresh(){ await Promise.all([stLoad(true), ST.moves.receipt && stLoadMoves('receipt', true), ST.moves.issue && stLoadMoves('issue', true),
                                               ST.counts && stLoadCounts(true)]); ST.requests = null; }
const stItems = () => (ST.data && ST.data.items) || [];
const stByCode = c => stItems().find(x => x.code === c);
const stLabel = x => x.code + ' - ' + x.name + (x.part_number ? ' (' + x.part_number + ')' : '');
const stCodeFrom = v => { const m = /^\s*([A-Za-z]{2}) ?(\d{3,4})\b/.exec(String(v || '')); return m ? m[1].toUpperCase() + ' ' + m[2] : ''; };
const stSet = k => ((ST.data && ST.data.settings) || []).find(s => s.key === k) || {};
const stSetV = (k, d) => { const s = stSet(k); return s.value == null ? d : +s.value; };
const stAssets = () => (ST.data && ST.data.assets) || [];
const stAssetFrom = v => { const m = /\(([A-Z0-9_.-]+)\)\s*$/.exec(String(v || '')); return m ? m[1] : String(v || '').trim().toUpperCase(); };
const stAssetOptions = () => stAssets().map(a => `<option value="${esc(a.name + ' (' + a.code + ')')}">`).join('');
const stLocations = () => (ST.data && ST.data.locations && ST.data.locations.length ? ST.data.locations : ['Production store']);
// 14 Nov 2026: each tab is its own page in Users > access (Stock, Received, Issued, Weekly count, Approve, Settings)
const ST_TAB_PAGE = { '/store': 'production.store', '/store/received': 'production.store_received', '/store/issued': 'production.store_issued',
                      '/store/counts': 'production.store_counts', '/store/settings': 'production.store_settings' };
const stCanEdit = () => levelOf('production.store') === 'edit';            // add / change materials
const stCanReceive = () => levelOf('production.store_received') === 'edit';
const stCanIssue = () => levelOf('production.store_issued') === 'edit';
const stCanCount = () => levelOf('production.store_counts') === 'edit';
// the first Store tab this person may open (the menu's Store goes there)
function stFirstTab(){ return Object.keys(ST_TAB_PAGE).find(t => levelOf(ST_TAB_PAGE[t])) || '/store'; }
const stCanApprove = () => levelOf('production.store_approve') === 'edit';
const stCanSettings = () => !!levelOf('production.store_settings');
const stLetters = v => String(v || '').replace(/[^A-Za-zÀ-ɏ]/g, '').length;
// the used-on chips: printers, lines, machines, or Common use
const stUsedText = x => x.common_use ? 'Common use' : (x.used_on_names || []).map(a => a.name).join(', ');

/* ---- the rules, in words (the (i) texts). They read the settings, so they say the numbers in use. */
function stRules(){
  const wk = stSetV('usage_weeks', 8), md = stSetV('usage_min_issue_days', 3), lead = stSetV('lead_time_weeks', 4), sf = stSetV('safety_weeks', 1),
        pct = stSetV('order_qty_percent', 150), tr = stSetV('trend_percent', 33), thr = stSetV('count_diff_approval_units', 1), per = stSetV('count_items_per_week', 5);
  return {
    module: 'The materials in the Production store and how many of each are on the shelf.\n'
      + 'Nobody types the stock: the system starts from the last count, adds what is received and takes away what is issued.\n'
      + 'A mistake is reversed with a reason, never deleted.',
    status: ST_STATUS.map(s => s[2]).join('\n') + '\nThe worst come first in the list.',
    code: 'The material\'s short code, like CF 001.\n'
      + 'The system gives it: the type\'s two letters and the next number. It never changes, and procurement requests use it.',
    stock: 'How many are on the shelf now.\nStock = last count + received since - issued since.\n'
      + '"Count needed" means it has never been counted, so the number is not known yet.',
    use: 'How many are used in a normal week.\n'
      + 'Use per week = issued in the last ' + wk + ' weeks / the weeks it was in stock (weeks it ran out are left out).\n'
      + 'It needs issues on ' + md + ' or more days; an arrow shows the last 4 weeks are over ' + tr + '% higher (↑) or lower (↓).',
    left: 'How many weeks the stock on the shelf will last.\nWeeks left = stock / use per week.',
    reorder: 'When the stock is down to this number, ask for more.\n'
      + 'Reorder level = use per week x (lead time ' + lead + ' + safety ' + sf + ' weeks), never below the minimum.\n'
      + 'With too little use, the minimum is the reorder level.',
    order: 'How many to ask for on a request.\nOrder quantity = reorder level x ' + pct + '%. "Request more" fills it in.',
    count: 'The weekly count checks that what is on the shelf matches the system, so the stock is always right.\n'
      + 'A few materials are counted each working day (' + per + ' a week), so every material is checked in turn.\n'
      + 'A difference up to ' + thr + ' unit' + (thr === 1 ? '' : 's') + ' is fixed at once; a bigger one waits for the Production Manager.',
    min: 'The lowest the reorder level can ever be.\nWhen there is too little use to work one out, this is the reorder level.',
    lead: 'How many weeks a delivery takes, from the request to the store.\nEmpty means the default, ' + lead + ' weeks.',
    usedOn: 'The printers, lines or machines this material is used on, or Common use.\nEach issue names one, so the use can be seen per line.',
    receipt: 'Record what arrived, against its procurement request line, so the request shows it was delivered.\n'
      + 'With no request, give the supplier and the invoice or delivery note number.',
  };
}
// how one material's numbers were worked out, step by step (the item page)
function stWhy(x){
  const b = x.basis || {}, u = x.unit;
  if (!x.stock_known) return 'The stock is not known yet: it has never been counted. It is counted in its first week; until then nothing can be issued.';
  if (!(+b.issue_days)) return 'Nothing was issued in the last ' + b.weeks + ' weeks, so there is no use to work a reorder level from. '
    + 'The reorder level is the typed minimum: ' + stNum(x.min_level) + ' ' + u + '.';
  const lines = ['Issued ' + stNum(b.used) + ' ' + u + ' in the last ' + b.weeks + ' weeks, on ' + b.issue_days + ' different day' + (+b.issue_days === 1 ? '' : 's') + '.',
    'In stock ' + b.in_stock_weeks + ' of those weeks' + (+b.out_weeks ? ' (out of stock about ' + b.out_weeks + ' weeks, left out)' : '') + '.'];
  if (!x.trusted) return lines.concat(['Fewer than ' + b.min_days + ' issue days: not enough to trust a rate. The reorder level is the typed minimum: ' + stNum(x.min_level) + ' ' + u + '.']).join('\n');
  const raw = Math.ceil(x.use_per_week * (+b.lead + +b.safety) - 1e-9);
  return lines.concat([
    'Use per week = ' + stNum(b.used) + ' / ' + b.in_stock_weeks + ' = ' + x.use_per_week + ' ' + u + '.' + (x.trend === 'up' ? ' The last 4 weeks are higher (' + x.recent_per_week + ' a week).' : x.trend === 'down' ? ' The last 4 weeks are lower (' + x.recent_per_week + ' a week).' : ''),
    'Reorder level = ' + x.use_per_week + ' x (' + b.lead + ' lead + ' + b.safety + ' safety weeks) = about ' + raw + (+x.min_level > raw ? ', below the minimum ' + stNum(x.min_level) + ', so ' + stNum(x.reorder_level) : '') + ' ' + u + '.',
    'Order quantity = ' + stNum(x.reorder_level) + ' x ' + b.pct + '% = ' + stNum(x.order_qty) + ' ' + u + '.',
    'Weeks left = ' + stNum(x.stock) + ' / ' + x.use_per_week + ' = ' + x.weeks_left + '.']).join('\n');
}

/* ---- page frame */
function stTabs(cur){
  const tabs = [['/store', 'Stock'], ['/store/received', 'Received'], ['/store/issued', 'Issued'], ['/store/counts', 'Weekly count'], ['/store/settings', 'Settings']]
    .filter(([h]) => levelOf(ST_TAB_PAGE[h]));
  return `<div class="tabs" style="margin-bottom:14px">${tabs.map(([h, l]) => `<a class="tab ${h === cur ? 'on' : ''}" href="#${h}">${esc(l)}</a>`).join('')}</div>`;
}
function stHead(sub, actions){ return pageHead('Production store', sub + ' ' + stInfo(stRules().module, 'How the stock works'), actions); }
function stWait(cur){
  if (ST.error) return { title:'Store', crumb:'Store', html: stHead('') + stTabs(cur) + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load the store', esc(ST.error), `<button class="btn btn-primary" onclick="stLoad(true)">Try again</button>`)}</div></div>` };
  return { title:'Store', crumb:'Store', html: stHead('') + stTabs(cur) + `<div class="card"><div class="card-b small muted">Loading...</div></div>` };
}
function stActions(){
  return (stCanReceive() ? `<button class="btn btn-ghost" onclick="stReceive()">${I.arrowDown} Receive</button>` : '')
    + (stCanIssue() ? `<button class="btn btn-ghost" onclick="stIssue()">${I.arrowUp} Issue</button>` : '')
    + (stCanEdit() ? `<button class="btn btn-primary" onclick="stOpen('')">${I.plus} Add material</button>` : '');
}
const stDl = what => `<button class="btn btn-ghost" onclick="stDownload('${what}')">${ST_ICON_DL} Download</button>`;

/* ---- Stock */
function stFiltered(){
  const q = ST.q.trim().toLowerCase(), mark = window.oklRequestMark ? window.oklRequestMark() : null;
  return stItems().filter(x => (!ST.status || x.status === ST.status) && (!ST.type || x.type === ST.type)
    && (!q || [x.code, x.name, x.part_number, x.brand, x.supplier, x.location, stUsedText(x), x.type_name].join(' ').toLowerCase().includes(q)))
    .sort((a, b) => (b.active - a.active) || (mark ? window.oklRequestFirst(mark, a.code) - window.oklRequestFirst(mark, b.code) : 0)
      || stRank(a.status) - stRank(b.status) || a.code.localeCompare(b.code));
}
function stUseCell(x){
  if (x.trusted) return `${esc(x.use_per_week)} <span class="small muted">${esc(x.unit)}</span>${x.trend === 'up' ? '<span class="trend up" title="the last 4 weeks are higher">↑</span>' : x.trend === 'down' ? '<span class="trend down" title="the last 4 weeks are lower">↓</span>' : ''}`;
  return +((x.basis || {}).issue_days) ? '<span class="small muted">not enough use</span>' : '<span class="small muted">--</span>';
}
function stLeftCell(x){
  if (x.weeks_left == null) return '<span class="small muted">--</span>';
  const c = stCls(x.status);
  return `<span class="wl-${c}">${esc(x.weeks_left)}</span>`;
}
function viewStore(){
  if (!ST.data) { stLoad(); return stWait('/store'); }
  const R = stRules(), all = stItems().filter(x => x.active), rows = stFiltered(), mark = window.oklRequestMark ? window.oklRequestMark() : null;
  const n = s => all.filter(x => x.status === s).length;
  const value = all.reduce((t, x) => t + (+x.value || 0), 0);
  const types = (ST.data.types || []).filter(t => t.items > 0);
  const opt = (v, cur, l) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(l)}</option>`;
  const chips = `<div class="st-chips">${[['', 'All', all.length]].concat(ST_STATUS.map(s => [s[0], s[0], n(s[0])]).filter(c => c[2] > 0))
    .map(([v, l, c]) => `<button type="button" class="st-chip ${ST.status === v ? 'on' : ''}" onclick="stStatus('${esc(v)}')">${v ? stBadge(v) : esc(l)} <span class="n">${c}</span></button>`).join('')}
    ${stInfo(R.status, 'What the colours mean')}</div>`;
  return {
    title:'Store', crumb:'Store', keepScroll: true,
    html: stHead('Production materials with live stock: what is used each week and when to order.', stDl('stock') + stActions()) + stTabs('/store') + (mark ? window.oklRequestBanner(mark) : '') + `
    <div class="grid g4" style="margin-bottom:14px">
      <div class="stat"><div class="lbl">Materials</div><div class="val">${all.length}</div><div class="meta">${types.map(t => esc(t.prefix + ' ' + t.name)).join(' · ')}</div></div>
      <div class="stat"><div class="lbl">To order now</div><div class="val">${n('Out of stock') + n('Reorder now')}</div><div class="meta">${n('Out of stock')} out of stock, ${n('Reorder now')} at the reorder level</div></div>
      <div class="stat"><div class="lbl">Order soon</div><div class="val">${n('Order soon')}</div><div class="meta">within a week of the reorder level</div></div>
      <div class="stat"><div class="lbl">Stock value</div><div class="val">&#8358;${stMoney(Math.round(value))}</div><div class="meta">where a price is known</div></div>
    </div>
    ${chips}
    <div class="card">
      <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px"><div class="row" style="gap:10px;flex-wrap:wrap">
        <div class="search filter-search"><span class="ic">${I.search}</span><input class="inp" id="stQ" style="padding-left:34px;border-radius:20px" placeholder="Code, material, printer, line" value="${esc(ST.q)}"></div>
        <select class="inp" id="stType" style="width:auto">${opt('', ST.type, 'All types')}${(ST.data.types || []).map(t => opt(t.prefix, ST.type, t.prefix + ' ' + t.name)).join('')}</select>
      </div></div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Status ${stInfo(R.status)}</th><th>Code ${stInfo(R.code)}</th><th>Material</th><th style="text-align:right">Stock ${stInfo(R.stock)}</th>
          <th style="text-align:right">Use / week ${stInfo(R.use)}</th><th style="text-align:right">Weeks left ${stInfo(R.left)}</th>
          <th style="text-align:right">Reorder at ${stInfo(R.reorder)}</th><th style="text-align:right">Order qty ${stInfo(R.order)}</th></tr></thead>
        <tbody>${rows.length ? rows.map(x => `<tr class="clickable st-${stCls(x.status)}${mark && mark.codes.includes(x.code) ? ' req-item' : ''}" onclick="stOpen('${esc(x.code)}')">
          <td data-label="Status" data-sort="${stRank(x.status)}">${stBadge(x.status)}${x.active ? '' : ' <span class="badge b-slate">Off</span>'}</td>
          <td class="mono small" data-label="Code">${esc(x.code)}</td>
          <td data-label="Material"><div class="strong">${esc(x.name)}</div><div class="tiny muted">${esc([x.part_number, x.brand, stUsedText(x)].filter(Boolean).join(' · '))}</div></td>
          <td data-label="Stock" style="text-align:right" data-sort="${x.stock_known ? +x.stock : -1}" class="strong">${x.stock_known ? stNum(x.stock) + ' <span class="small muted">' + esc(x.unit) + '</span>' : '<span class="small muted">not known</span>'}</td>
          <td data-label="Use / week" style="text-align:right" data-sort="${x.trusted ? +x.use_per_week : -1}">${stUseCell(x)}</td>
          <td data-label="Weeks left" style="text-align:right" data-sort="${x.weeks_left == null ? 9999 : +x.weeks_left}">${stLeftCell(x)}</td>
          <td data-label="Reorder at" style="text-align:right">${stNum(x.reorder_level)}${x.trusted ? '' : ' <span class="tiny muted">min</span>'}</td>
          <td data-label="Order qty" style="text-align:right">${+x.order_qty ? stNum(x.order_qty) : '--'}</td>
        </tr>`).join('') : `<tr><td colspan="8" class="muted" style="padding:16px">Nothing matches.</td></tr>`}</tbody>
      </table></div>
      <div class="small muted" style="padding:12px 18px">${rows.length} of ${stItems().length} shown. Click a material for how its numbers were worked out.</div>
    </div>`,
    bind(){
      const q = $('#stQ'); if (q) q.addEventListener('input', debounce(e => { ST.q = e.target.value; render(); const el = $('#stQ'); if (el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 200));
      const t = $('#stType'); if (t) t.onchange = e => { ST.type = e.target.value; render(); };
    },
  };
}
function stStatus(v){ ST.status = ST.status === v ? '' : v; render(); }
route('/store', () => levelOf('production.store') || stFirstTab() === '/store' ? viewStore() : (go(stFirstTab()), { title: 'Store', html: '' }));

/* ---- Excel download of what is on screen (SheetJS on first use, as in the other consoles) */
function stLoadSheetJS(){
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error('The spreadsheet maker did not load.'));
    s.onerror = () => reject(new Error('Could not load the spreadsheet maker. Check your connection and try again.')); document.head.appendChild(s); });
}
async function stDownload(what){
  const mv = m => [m.entry, m.date, m.code, m.name, (m.reversal ? -1 : 1) * +m.qty, m.unit];
  const sh = {
    stock: () => ({ name: 'Stock', head: ['Status', 'Code', 'Material', 'Type', 'Part number', 'Brand', 'Unit', 'Stock', 'Use per week', 'Trend', 'Weeks left', 'Minimum', 'Reorder level', 'Order quantity', 'Location', 'Used on', 'Last supplier', 'Unit price (NGN)', 'Last received', 'Last issued', 'Last counted'],
      rows: stFiltered().map(x => [x.status, x.code, x.name, x.type_name, x.part_number, x.brand, x.unit, x.stock_known ? +x.stock : 'not known', x.trusted ? +x.use_per_week : 'not enough use', x.trend || '',
        x.weeks_left == null ? '' : +x.weeks_left, +x.min_level, +x.reorder_level, +x.order_qty, x.location, stUsedText(x), x.supplier, x.unit_price == null ? '' : +x.unit_price, x.last_in, x.last_out, x.last_count_at ? x.last_count_at.slice(0, 10) : '']) }),
    receipt: () => ({ name: 'Received', head: ['Entry', 'Date', 'Code', 'Material', 'Qty', 'Unit', 'Request', 'Supplier', 'Invoice / delivery note', 'Received by', 'Note'],
      rows: (ST.moves.receipt || []).map(m => mv(m).concat([m.request_ref, m.supplier, m.invoice_no, m.received_by_name, m.reason || m.note])) }),
    issue: () => ({ name: 'Issued', head: ['Entry', 'Date', 'Code', 'Material', 'Qty', 'Unit', 'Used on', 'Collected by', 'Note'],
      rows: (ST.moves.issue || []).map(m => mv(m).concat([m.used_on_name || m.purpose_text, m.collected_by_name, m.reason || m.note])) }),
  }[what]();
  try {
    const X = await stLoadSheetJS(), wb = X.utils.book_new(), ws = X.utils.aoa_to_sheet([sh.head].concat(sh.rows.map(r => r.map(v => v == null ? '' : v))));
    X.utils.book_append_sheet(wb, ws, sh.name); X.writeFile(wb, 'OKL_Production_store_' + sh.name + '_' + stToday() + '.xlsx');
  } catch (e) { toast('Could not make the file', e.message, 'err', 7000); }
}

/* ---- one material: its numbers and how they were worked out; edit it (edit rights) */
function stUsedChip(code, name, canEdit){ return `<span class="chip" data-used="${esc(code)}">${esc(name)}${canEdit ? ' <b style="cursor:pointer" data-rm aria-label="Remove">&times;</b>' : ''}</span>`; }
function stUsedEditor(prefix, x, canEdit){
  const common = !!(x && x.common_use), names = (x && x.used_on_names) || [];
  return `<label class="row small" style="gap:6px;margin-bottom:6px"><input type="checkbox" id="${prefix}Common" ${common ? 'checked' : ''} ${canEdit ? '' : 'disabled'}> Common use (any line: gloves, tape ...)</label>
    <div id="${prefix}Used" class="row" style="gap:6px;flex-wrap:wrap${common ? ';display:none' : ''}">${common ? '' : names.map(a => stUsedChip(a.code, a.name, canEdit)).join('')}</div>
    ${canEdit ? `<div class="row" id="${prefix}AddRow" style="gap:6px;margin-top:6px${common ? ';display:none' : ''}"><input class="inp" id="${prefix}Add" list="${prefix}Assets" placeholder="Add a printer, line or machine" style="max-width:360px"><button type="button" class="btn btn-ghost btn-sm" id="${prefix}AddBtn">Add</button></div>
    <datalist id="${prefix}Assets">${stAssetOptions()}</datalist>` : ''}`;
}
function stUsedBind(w, prefix, onErr){
  const list = $('#' + prefix + 'Used', w), cb = $('#' + prefix + 'Common', w);
  if (!list) return;
  list.addEventListener('click', e => { if (e.target.matches('[data-rm]')) e.target.closest('[data-used]').remove(); });
  if (cb) cb.onchange = () => { list.style.display = cb.checked ? 'none' : ''; const r = $('#' + prefix + 'AddRow', w); if (r) r.style.display = cb.checked ? 'none' : ''; };
  const btn = $('#' + prefix + 'AddBtn', w);
  if (btn) btn.onclick = () => { const inp = $('#' + prefix + 'Add', w), code = stAssetFrom(inp.value), a = stAssets().find(e => e.code === code);
    if (!a) return onErr('Pick the printer, line or machine from the list.');
    if (!$(`[data-used="${code}"]`, w)) list.insertAdjacentHTML('beforeend', stUsedChip(a.code, a.name, true));
    inp.value = ''; };
}
const stUsedValue = (w, prefix) => $('#' + prefix + 'Common', w) && $('#' + prefix + 'Common', w).checked ? ['COMMON'] : $$('[data-used]', $('#' + prefix + 'Used', w) || w).map(e => e.dataset.used);
function stNextCode(prefix){ if (!prefix) return ''; const n = Math.max(0, ...stItems().filter(x => x.type === prefix).map(x => +x.code.slice(3) || 0)); return prefix + ' ' + String(n + 1).padStart(3, '0'); }

function stOpen(code){
  const x = code ? stByCode(code) : null, isNew = !x, canEdit = stCanEdit(), dis = canEdit ? '' : 'disabled', R = stRules();
  const v = x || { name: '', part_number: '', brand: '', unit: 'pcs', location: stLocations()[0], min_level: 0, lead_time_weeks: '', used_on_names: [], common_use: false, active: true, notes: '' };
  const types = (ST.data.types || []).filter(t => t.active);
  const facts = isNew ? '' : `<div class="grid g4" style="margin-bottom:12px">
      <div class="stat"><div class="lbl">Status</div><div class="val" style="font-size:15px">${stBadge(x.status)}</div><div class="meta">${esc(x.type_name)} · ${esc(x.category)}</div></div>
      <div class="stat"><div class="lbl">Stock</div><div class="val">${x.stock_known ? stNum(x.stock) : '?'}</div><div class="meta">${esc(x.unit)}${x.weeks_left != null ? ' · ' + esc(x.weeks_left) + ' weeks left' : ''}</div></div>
      <div class="stat"><div class="lbl">Reorder at</div><div class="val">${stNum(x.reorder_level)}</div><div class="meta">${x.trusted ? 'worked out from use' : 'the typed minimum'}</div></div>
      <div class="stat"><div class="lbl">Order quantity</div><div class="val">${+x.order_qty ? stNum(x.order_qty) : '--'}</div><div class="meta">what "Request more" asks for</div></div></div>
    <div class="st-why" style="margin-bottom:12px"><b>How these numbers were worked out</b> ${stInfo(R.reorder)}<div style="white-space:pre-line;margin-top:4px">${esc(stWhy(x))}</div></div>
    <div class="small muted" style="margin-bottom:12px">Last supplier ${esc(x.supplier || 'not known')}${x.unit_price ? ' at NGN ' + stMoney(x.unit_price) : ''} · last received ${esc(x.last_in || 'never')} · last issued ${esc(x.last_out || 'never')} · last counted ${esc(x.last_count_at ? x.last_count_at.slice(0, 10) : 'never')}</div>`;
  openModal({
    title: isNew ? 'Add a material' : x.code + ' - ' + x.name, size:'wide',
    sub: isNew ? 'The code is given by the system from the type.' : (x.part_number ? 'Part number ' + x.part_number : ''),
    body: facts + `<form novalidate>
      <div class="grid g2">
        ${isNew ? `<div class="field"><label for="stPrefix">Type ${stInfo(R.code)}</label><select class="inp" id="stPrefix"><option value="">Choose...</option>${types.map(t => `<option value="${esc(t.prefix)}">${esc(t.prefix + ' - ' + t.name + ' (' + t.category + ')')}</option>`).join('')}</select>
          <div class="tiny muted" id="stCodeNext"></div></div>` : ''}
        <div class="field"><label for="stName">Material</label><input class="inp" id="stName" maxlength="160" value="${esc(v.name)}" ${dis}></div>
        <div class="field"><label for="stPn">Part number</label><input class="inp" id="stPn" maxlength="80" value="${esc(v.part_number || '')}" ${dis}></div>
        <div class="field"><label for="stBrand">Brand</label><input class="inp" id="stBrand" maxlength="80" value="${esc(v.brand || '')}" ${dis}></div>
        <div class="field"><label for="stUnit">Unit</label><select class="inp" id="stUnit" ${dis}>${ST_UNITS.map(u => `<option ${u === v.unit ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
        <div class="field"><label for="stLoc">Location</label><select class="inp" id="stLoc" ${dis}>${stLocations().map(l => `<option ${l === v.location ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
        <div class="field"><label for="stMin">Minimum ${stInfo(R.min)}</label><input class="inp" id="stMin" type="number" min="0" step="1" value="${stNum(v.min_level)}" ${dis}></div>
        <div class="field"><label for="stLead">Lead time, weeks ${stInfo(R.lead)}</label><input class="inp" id="stLead" type="number" min="1" max="52" step="1" placeholder="default ${stSetV('lead_time_weeks', 4)}" value="${esc(v.lead_time_weeks == null ? '' : v.lead_time_weeks)}" ${dis}></div>
        ${isNew ? `<div class="field"><label for="stNow">On the shelf now (optional)</label><input class="inp" id="stNow" type="number" min="0" step="any" placeholder="empty = count it this week"></div>` : ''}
      </div>
      <div class="field"><label>Used on ${stInfo(R.usedOn)}</label>${stUsedEditor('stU', v, canEdit)}</div>
      ${isNew ? '' : `<label class="row small" style="gap:6px"><input type="checkbox" id="stActive" ${v.active ? 'checked' : ''} ${dis}> In use (untick to switch the material off)</label>`}
      <div class="field"><label for="stNotes">Notes</label><textarea class="inp" id="stNotes" rows="2" maxlength="500" ${dis}>${esc(v.notes || '')}</textarea></div>
      <div class="err-msg hide" data-err="stName" style="margin-top:8px"></div></form>`,
    footer: (!isNew && canEdit ? `<button class="btn btn-ghost" data-req>${I.box} Request more</button>${stCanReceive() ? `<button class="btn btn-ghost" data-rcv>${I.arrowDown} Receive</button>` : ''}${stCanIssue() ? `<button class="btn btn-ghost" data-iss>${I.arrowUp} Issue</button>` : ''}` : '')
      + (!isNew && !canEdit && canOpen('/requests') ? `<button class="btn btn-ghost" data-req>${I.box} Request more</button>` : '')
      + (canEdit ? `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} ${isNew ? 'Add material' : 'Save'}</button>` : `<button class="btn btn-ghost" data-close>Close</button>`),
    onMount: (w, close) => {
      stUsedBind(w, 'stU', m => setErr('stName', m, w));
      const pf = $('#stPrefix', w); if (pf) pf.onchange = () => { $('#stCodeNext', w).textContent = pf.value ? 'Its code will be ' + stNextCode(pf.value) + '.' : ''; };
      const rq = $('[data-req]', w); if (rq) rq.onclick = () => { close(); stRequestMore(x.code); };
      const rc = $('[data-rcv]', w); if (rc) rc.onclick = () => { close(); stReceive(x.code); };
      const is = $('[data-iss]', w); if (is) is.onclick = () => { close(); stIssue(x.code); };
      const sv = $('[data-save]', w); if (!sv) return;
      sv.onclick = async () => {
        clearErrors(w);
        const item = { code: isNew ? '' : x.code, prefix: isNew ? $('#stPrefix', w).value : '', name: $('#stName', w).value.trim(), part_number: $('#stPn', w).value.trim(),
          brand: $('#stBrand', w).value.trim(), unit: $('#stUnit', w).value, location: $('#stLoc', w).value, min_level: $('#stMin', w).value.trim() || '0',
          lead_time_weeks: $('#stLead', w).value.trim(), used_on: stUsedValue(w, 'stU'), active: isNew ? true : $('#stActive', w).checked, notes: $('#stNotes', w).value.trim() };
        if (isNew) item.stock_now = $('#stNow', w).value.trim();
        if (isNew && !item.prefix) return setErr('stName', 'Choose the type: it gives the code.', w);
        if (item.name.length < 2 || stLetters(item.name) < 2) return setErr('stName', 'Name the material in words.', w);
        if (!/^\d+(\.\d{1,2})?$/.test(item.min_level) || +item.min_level > 10000) return setErr('stName', 'The minimum must be a number from 0 to 10 000.', w);
        if (item.lead_time_weeks && !(/^\d+$/.test(item.lead_time_weeks) && +item.lead_time_weeks >= 1 && +item.lead_time_weeks <= 52)) return setErr('stName', 'The lead time is 1 to 52 weeks (empty = the default).', w);
        if (!isNew && x.unit && item.unit !== x.unit) {
          if (!(await confirmDialog('Change the unit', `Change the unit of <b>${esc(x.code)}</b> from <b>${esc(x.unit)}</b> to <b>${esc(item.unit)}</b>? The stock and the past moves keep their numbers.`, 'Change the unit'))) return;
          item.confirm_unit = true;
        }
        sv.disabled = true;
        try { const r = await api('/webhook/production/api/store/item', { method:'POST', body:{ item } }); close(); toast(isNew ? 'Added ' + r.code : 'Saved', item.name, 'ok'); await stLoad(true); }
        catch (err) { setErr('stName', err.message, w); sv.disabled = false; }
      };
    },
  });
}

/* ---- Request more: the Production request form, filled in with the code and the order quantity */
function stRequestMore(code){
  const x = stByCode(code); if (!x || !window.oklRequests) return;
  const U = oklRequests.UNIT_OF_STORE || {};
  oklRequests.prefill('Production', [{ part: stLabel(x), detail: [x.name, x.brand, x.part_number ? 'P/N ' + x.part_number : ''].filter(Boolean).join(', '),
    category: oklRequests.CATEGORIES.includes(x.category) ? x.category : 'Consumable', unit: U[x.unit] || 'Pieces', qty: String(+x.order_qty || ''),
    purpose: 'Store: ' + (x.stock_known ? stNum(x.stock) + ' ' + x.unit + ' left' : 'stock not known') + (x.weeks_left != null ? ', about ' + x.weeks_left + ' weeks' : '') + ' (' + x.status + ')' }]);
  go('/requests');
  toast('Request filled in', x.code + ': check the quantity and send it for approval.', 'ok', 6000);
}
// the store list for the request form (app.js's rqCfg): materials picked by code there
function stStoreForRequests(){
  if (!ST.data && !ST.loading) stLoad();
  return stItems().filter(x => x.active).map(x => ({ code: x.code, name: x.name, part_number: x.part_number, brand: x.brand, unit: x.unit, category: x.category, stock: x.stock_known ? x.stock : null, order_qty: x.order_qty }));
}

/* ---- several materials at once: one line per material (code, quantity, and on a receipt the price and request) */
const stLnNew = code => { const it = code ? stByCode(code) : null; return { text: it ? stLabel(it) : '', code: it ? it.code : '', qty: '', price: it && it.unit_price ? stNum(it.unit_price) : '', req: '' }; };
function stDetail(it, typed){
  if (!it) return String(typed || '').trim() ? '<span style="color:var(--danger)">Not in the store: pick it from the list.</span>' : '';
  return `<b>${esc(it.name)}</b>${it.part_number ? ' · ' + esc(it.part_number) : ''} · ${it.stock_known ? 'in stock ' + stNum(it.stock) + ' ' + esc(it.unit) : 'stock not known'}${it.location ? ' · ' + esc(it.location) : ''}`;
}
function stReqOptions(code, cur){
  const rows = (ST.requests || []).filter(r => !code || !r.code || r.code === code);
  return `<option value="">No request (give the supplier and invoice above)</option>` + rows.map(r => `<option value="${r.id}" ${String(cur) === String(r.id) ? 'selected' : ''}>${esc((r.item_id || 'request') + ' · ' + r.material + ' · ' + (r.qty == null ? '' : r.qty + ' asked') + (+r.received ? ', ' + r.received + ' received' : '') + (r.po_number ? ' · PO ' + r.po_number : '') + (r.vendor ? ' · ' + r.vendor : ''))}</option>`).join('');
}
function stLnRows(L, opt){
  return L.map((l, i) => `<div class="pl-row">
    <div class="pl-part"><input class="inp" data-ln-code="${i}" list="${opt.id}Codes" value="${esc(l.text)}" placeholder="Type the code or the material" aria-label="Material ${i + 1}">
      <div class="tiny muted" data-ln-info="${i}">${stDetail(stByCode(l.code), l.text)}</div>
      ${opt.receipt ? `<select class="inp" data-ln-req="${i}" style="margin-top:6px" aria-label="Request ${i + 1}">${stReqOptions(l.code, l.req)}</select>` : ''}</div>
    <input class="inp pl-qty" type="number" min="0" step="any" data-ln-qty="${i}" value="${esc(l.qty)}" placeholder="Qty" aria-label="Quantity ${i + 1}">
    ${opt.receipt ? `<input class="inp pl-price" type="number" min="0" step="any" data-ln-price="${i}" value="${esc(l.price)}" placeholder="Unit price" aria-label="Unit price ${i + 1}">` : ''}
    <button type="button" class="btn btn-ghost btn-sm" data-ln-rm="${i}" ${L.length === 1 ? 'disabled' : ''} aria-label="Remove line ${i + 1}">${I.x}</button></div>`).join('');
}
function stLnHtml(L, opt){
  return `<div class="pl" id="${opt.id}"><div class="pl-head tiny muted"><span class="pl-part">Material${opt.receipt ? ' and its request' : ''}</span><span class="pl-qty">Quantity</span>${opt.receipt ? '<span class="pl-price">Unit price (NGN, optional)</span>' : ''}<span style="width:34px"></span></div>
    <div data-ln-rows>${stLnRows(L, opt)}</div>
    <button type="button" class="btn btn-ghost btn-sm" data-ln-add style="margin-top:6px">${I.plus} Add another material</button>
    <datalist id="${opt.id}Codes">${stItems().filter(x => x.active).map(x => `<option value="${esc(stLabel(x))}">`).join('')}</datalist></div>`;
}
function stLnBind(root, L, opt){
  const box = $('#' + opt.id, root); if (!box) return;
  const rows = $('[data-ln-rows]', box);
  const wire = () => {
    $$('[data-ln-code]', box).forEach(el => { el.oninput = el.onchange = e => { const i = +el.dataset.lnCode, l = L[i]; l.code = stCodeFrom(el.value);
      const it = stByCode(l.code);
      if (e && e.type === 'change' && it && el.value.trim() !== stLabel(it)) el.value = stLabel(it);
      l.text = el.value;
      const pr = $(`[data-ln-price="${i}"]`, box); if (it && pr && !pr.value && it.unit_price) { pr.value = stNum(it.unit_price); l.price = pr.value; }
      const rq = $(`[data-ln-req="${i}"]`, box); if (rq) rq.innerHTML = stReqOptions(l.code, l.req);
      $(`[data-ln-info="${i}"]`, box).innerHTML = stDetail(it, el.value); }; });
    $$('[data-ln-qty]', box).forEach(el => { el.oninput = () => { L[+el.dataset.lnQty].qty = el.value; }; });
    $$('[data-ln-price]', box).forEach(el => { el.oninput = () => { L[+el.dataset.lnPrice].price = el.value; }; });
    $$('[data-ln-req]', box).forEach(el => { el.onchange = () => { L[+el.dataset.lnReq].req = el.value; }; });
    $$('[data-ln-rm]', box).forEach(el => { el.onclick = () => { L.splice(+el.dataset.lnRm, 1); rows.innerHTML = stLnRows(L, opt); wire(); }; });
  };
  $('[data-ln-add]', box).onclick = () => { L.push(stLnNew()); rows.innerHTML = stLnRows(L, opt); wire(); };
  wire();
}
function stLnCheck(L, opt){
  const out = [], seen = {};
  for (let i = 0; i < L.length; i++) {
    const l = L[i], n = L.length > 1 ? 'Line ' + (i + 1) + ': ' : '';
    if (!String(l.text || '').trim() && !String(l.qty || '').trim()) continue;
    const it = stByCode(l.code);
    if (!it) return { error: n + 'pick the material from the list.' };
    if (seen[it.code]) return { error: it.code + ' is listed twice. Put it on one line with the total quantity.' };
    seen[it.code] = 1;
    const whole = !['m', 'L', 'kg'].includes(it.unit);
    if (!(+l.qty > 0) || (whole && +l.qty !== Math.floor(+l.qty))) return { error: n + 'enter a quantity above 0' + (whole ? ', in whole ' + it.unit + '.' : '.') };
    if (opt.stock && !it.stock_known) return { error: n + 'the stock of ' + it.code + ' is not known yet. Count it first (Weekly count).' };
    if (opt.stock && +l.qty > +it.stock) return { error: n + 'only ' + stNum(it.stock) + ' ' + it.unit + ' of ' + it.code + ' in stock. Count it first if the shelf has more.' };
    if (opt.receipt && l.price !== '' && l.price != null && !(+l.price > 0)) return { error: n + 'the unit price must be more than 0, or empty.' };
    out.push(Object.assign({ code: it.code, qty: String(l.qty).trim() }, opt.receipt ? { unit_price: String(l.price || '').trim(), request_item_id: l.req || '' } : {}));
  }
  if (!out.length && !opt.optional) return { error: 'Add at least one material.' };
  return { lines: out };
}

/* ---- Receive: one delivery, one line per material; a material not in the store can be typed (added with its code) */
const stNlNew = () => ({ name: '', prefix: '', unit: 'pcs', qty: '', price: '', req: '', confirm: false });
function stNlRows(N){
  const types = ((ST.data && ST.data.types) || []).filter(t => t.active);
  return N.map((l, i) => `<div class="pl-row">
    <div class="pl-part"><input class="inp" data-nl-name="${i}" maxlength="160" value="${esc(l.name)}" placeholder="Name of the new material" aria-label="New material ${i + 1}">
      <div class="row" style="gap:6px;margin-top:6px;flex-wrap:nowrap"><select class="inp" data-nl-prefix="${i}" aria-label="Type ${i + 1}"><option value="">Type...</option>${types.map(t => `<option value="${esc(t.prefix)}" ${l.prefix === t.prefix ? 'selected' : ''}>${esc(t.prefix + ' ' + t.name)}</option>`).join('')}</select>
        <select class="inp" data-nl-unit="${i}" style="width:auto" aria-label="Unit ${i + 1}">${ST_UNITS.map(u => `<option ${l.unit === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
      <select class="inp" data-nl-req="${i}" style="margin-top:6px" aria-label="Request ${i + 1}">${stReqOptions('', l.req)}</select>
      <div class="tiny muted" data-nl-info="${i}">${l.prefix ? 'New: it gets the code <b>' + esc(stNextCode(l.prefix)) + '</b>.' : 'New: added to the store with the next code of its type.'}</div>
      <label class="row small" style="gap:6px;margin-top:4px"><input type="checkbox" data-nl-new="${i}" ${l.confirm ? 'checked' : ''}> It is a new material (if the name looks like one already in the store)</label></div>
    <input class="inp pl-qty" type="number" min="0" step="any" data-nl-qty="${i}" value="${esc(l.qty)}" placeholder="Qty" aria-label="Quantity ${i + 1}">
    <input class="inp pl-price" type="number" min="0" step="any" data-nl-price="${i}" value="${esc(l.price)}" placeholder="Unit price" aria-label="Unit price ${i + 1}">
    <button type="button" class="btn btn-ghost btn-sm" data-nl-rm="${i}" aria-label="Remove new material ${i + 1}">${I.x}</button></div>`).join('');
}
async function stReceive(code){
  await stLoadRequests();
  const people = (ST.data && ST.data.people) || [], L = [stLnNew(code)], opt = { id: 'rcLines', receipt: true }, N = [], R = stRules();
  openModal({
    title:'Receive materials', size:'wide', sub:'A delivery into the store: one line per material, each linked to its procurement request where there is one.',
    body: `<form novalidate><div class="grid g2">
      <div class="field"><label for="rcDate">Received on</label><input class="inp" id="rcDate" type="date" value="${stToday()}" max="${stToday()}"></div>
      <div class="field"><label for="rcBy">Received by</label><select class="inp" id="rcBy"><option value="">${esc(S.me.name)} (me)</option>${people.map(p => `<option value="${esc(p.enroll_id)}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="rcSup">Supplier (if no request)</label><input class="inp" id="rcSup" maxlength="80"></div>
      <div class="field"><label for="rcInv">Invoice / delivery note no. (if no request)</label><input class="inp" id="rcInv" maxlength="40"></div>
    </div>
    <div class="field"><span class="lbl">Materials received ${stInfo(R.receipt)}</span>${stLnHtml(L, opt)}
      <div data-nl-rows>${stNlRows(N)}</div>
      <button type="button" class="btn btn-ghost btn-sm" data-nl-add style="margin-top:6px">${I.plus} A material not in the store</button></div>
    <div class="field"><label for="rcNote">Note (optional)</label><input class="inp" id="rcNote" maxlength="300"></div>
    <div class="err-msg hide" data-err="rcDate"></div></form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Receive</button>`,
    onMount: (w, close) => {
      stLnBind(w, L, opt);
      const nbox = $('[data-nl-rows]', w);
      const wireN = () => {
        $$('[data-nl-name]', w).forEach(el => { el.oninput = () => { N[+el.dataset.nlName].name = el.value; }; });
        $$('[data-nl-prefix]', w).forEach(el => { el.onchange = () => { const l = N[+el.dataset.nlPrefix]; l.prefix = el.value;
          $(`[data-nl-info="${el.dataset.nlPrefix}"]`, w).innerHTML = l.prefix ? 'New: it gets the code <b>' + esc(stNextCode(l.prefix)) + '</b>.' : ''; }; });
        $$('[data-nl-unit]', w).forEach(el => { el.onchange = () => { N[+el.dataset.nlUnit].unit = el.value; }; });
        $$('[data-nl-qty]', w).forEach(el => { el.oninput = () => { N[+el.dataset.nlQty].qty = el.value; }; });
        $$('[data-nl-price]', w).forEach(el => { el.oninput = () => { N[+el.dataset.nlPrice].price = el.value; }; });
        $$('[data-nl-req]', w).forEach(el => { el.onchange = () => { N[+el.dataset.nlReq].req = el.value; }; });
        $$('[data-nl-new]', w).forEach(el => { el.onchange = () => { N[+el.dataset.nlNew].confirm = el.checked; }; });
        $$('[data-nl-rm]', w).forEach(el => { el.onclick = () => { N.splice(+el.dataset.nlRm, 1); nbox.innerHTML = stNlRows(N); wireN(); }; });
      };
      $('[data-nl-add]', w).onclick = () => { N.push(stNlNew()); nbox.innerHTML = stNlRows(N); wireN(); };
      const sv = $('[data-save]', w);
      sv.onclick = async () => {
        clearErrors(w);
        const chk = stLnCheck(L, Object.assign({}, opt, { optional: N.length > 0 }));
        if (chk.error) return setErr('rcDate', chk.error, w);
        const newLines = [];
        for (let i = 0; i < N.length; i++) {
          const l = N[i], n = 'New material ' + (i + 1) + ': ', nm = l.name.trim().replace(/\s+/g, ' ');
          if (!nm && !String(l.qty).trim()) continue;
          if (nm.length < 2 || stLetters(nm) < 2) return setErr('rcDate', n + 'type its name in words.', w);
          if (!l.prefix) return setErr('rcDate', n + 'choose its type (it gives the code).', w);
          const whole = !['m', 'L', 'kg'].includes(l.unit);
          if (!(+l.qty > 0) || (whole && +l.qty !== Math.floor(+l.qty))) return setErr('rcDate', n + 'enter a quantity above 0' + (whole ? ', in whole ' + l.unit + '.' : '.'), w);
          newLines.push({ new: { name: nm, prefix: l.prefix, unit: l.unit, confirm: !!l.confirm }, qty: String(l.qty).trim(), unit_price: String(l.price || '').trim(), request_item_id: l.req || '' });
        }
        const receipt = { date: $('#rcDate', w).value, received_by: $('#rcBy', w).value, supplier: $('#rcSup', w).value.trim(), invoice_no: $('#rcInv', w).value.trim(),
          note: $('#rcNote', w).value.trim(), lines: chk.lines.concat(newLines) };
        if (!receipt.lines.length) return setErr('rcDate', 'Add at least one material.', w);
        if (receipt.lines.some(l => !l.request_item_id) && (!receipt.supplier || !receipt.invoice_no)) return setErr('rcDate', 'A line with no request needs the supplier and the invoice or delivery note number above.', w);
        sv.disabled = true;
        try { const r = await api('/webhook/production/api/store/receipt', { method:'POST', body:{ receipt } }); close();
              toast('Received ' + receipt.lines.length + ' material' + (receipt.lines.length === 1 ? '' : 's'), (r.moves || []).map(m => m.entry).join(', ')
                + ((r.added || []).length ? ' · new code' + (r.added.length === 1 ? '' : 's') + ': ' + r.added.map(a => a.code + ' = ' + a.name).join(', ') : ''), 'ok', 9000); await stRefresh(); }
        catch (err) { setErr('rcDate', err.message, w); sv.disabled = false; }
      };
    },
  });
}

/* ---- Issue: materials leaving the store for one printer, line or machine */
function stIssue(code){
  const people = (ST.data && ST.data.people) || [], L = [stLnNew(code)], opt = { id: 'isLines', stock: true }, R = stRules();
  const x = code ? stByCode(code) : null, firstUse = x && !x.common_use && (x.used_on_names || []).length === 1 ? x.used_on_names[0] : null;
  openModal({
    title:'Issue materials', size:'wide', sub:'Materials leaving the store for one printer, line or machine: one line per material.',
    body: `<form novalidate><div class="grid g2">
      <div class="field" style="grid-column:1/-1"><label for="isUsed">For which printer, line or machine ${stInfo(R.usedOn)}</label><input class="inp" id="isUsed" list="isAssets" placeholder="Type a printer, line or machine" value="${firstUse ? esc(firstUse.name + ' (' + firstUse.code + ')') : ''}"><datalist id="isAssets">${stAssetOptions()}</datalist></div>
      <div class="field"><label for="isWho">Collected by</label><select class="inp" id="isWho"><option value="">Choose...</option>${people.map(p => `<option value="${esc(p.enroll_id)}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="isDate">Date</label><input class="inp" id="isDate" type="date" value="${stToday()}" max="${stToday()}"></div>
    </div>
    <div class="field"><span class="lbl">Materials issued</span>${stLnHtml(L, opt)}</div>
    <div class="field"><label for="isNote">Note (optional)</label><input class="inp" id="isNote" maxlength="300"></div>
    <div class="err-msg hide" data-err="isUsed"></div></form>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Issue</button>`,
    onMount: (w, close) => {
      stLnBind(w, L, opt);
      const sv = $('[data-save]', w);
      sv.onclick = async () => {
        clearErrors(w);
        const chk = stLnCheck(L, opt);
        if (chk.error) return setErr('isUsed', chk.error, w);
        const issue = { used_on: stAssetFrom($('#isUsed', w).value), collected_by: $('#isWho', w).value, date: $('#isDate', w).value, note: $('#isNote', w).value.trim(), lines: chk.lines };
        if (!stAssets().some(a => a.code === issue.used_on)) return setErr('isUsed', 'Pick the printer, line or machine from the list.', w);
        if (!issue.collected_by) return setErr('isUsed', 'Choose who collected it.', w);
        sv.disabled = true;
        try { const r = await api('/webhook/production/api/store/issue', { method:'POST', body:{ issue } }); close();
              toast('Issued ' + issue.lines.length + ' material' + (issue.lines.length === 1 ? '' : 's'), (r.moves || []).map(m => m.entry).join(', '), 'ok'); await stRefresh(); }
        catch (err) { setErr('isUsed', err.message, w); sv.disabled = false; }
      };
    },
  });
}
function stReverse(id, kind){
  const m = (ST.moves[kind] || []).find(x => x.id === id); if (!m) return;
  openModal({
    title:'Reverse ' + m.entry, size:'narrow', sub: m.code + ' x ' + stNum(m.qty) + ' ' + (m.unit || '') + ' on ' + m.date,
    body:`<div class="small" style="margin-bottom:8px">A reversal adds an opposite entry; nothing is deleted. ${kind === 'receipt' ? 'The materials come off the stock.' : 'The materials go back into stock.'}</div>
      <div class="field"><label for="rvWhy">Why?</label><input class="inp" id="rvWhy" maxlength="300" placeholder="e.g. entered for the wrong line"></div><div class="err-msg hide" data-err="rvWhy"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-danger" data-save>Reverse</button>`,
    onMount: (w, close) => { const sv = $('[data-save]', w); sv.onclick = async () => {
      clearErrors(w); const reason = $('#rvWhy', w).value.trim(); if (reason.length < 5) return setErr('rvWhy', 'Say why.', w);
      sv.disabled = true;
      try { await api('/webhook/production/api/store/reverse/' + (kind === 'issue' ? 'issue' : 'receipt'), { method:'POST', body:{ id, reason } }); close(); toast('Reversed', m.entry, 'ok'); await stRefresh(); }
      catch (err) { setErr('rvWhy', err.message, w); sv.disabled = false; } }; },
  });
}

/* ---- Received / Issued */
function stMovesView(kind){
  const cur = kind === 'receipt' ? '/store/received' : '/store/issued';
  if (!ST.data) { stLoad(); return stWait(cur); }
  if (!ST.moves[kind]) stLoadMoves(kind);
  const rows = ST.moves[kind], canEdit = kind === 'issue' ? stCanIssue() : stCanReceive(), R = stRules();
  const head = stHead(kind === 'receipt' ? 'Deliveries into the store, each against its procurement request (or with the supplier and invoice).' : 'Materials leaving the store: which printer, line or machine, and who collected them.',
      stDl(kind) + stActions()) + stTabs(cur)
    + `<div class="row" style="gap:8px;margin-bottom:12px;flex-wrap:wrap"><label class="small">From <input class="inp" type="date" id="mvFrom" value="${esc(ST.from)}" style="width:auto"></label>
       <label class="small">to <input class="inp" type="date" id="mvTo" value="${esc(ST.to)}" style="width:auto"></label><span class="small muted">Default: the last 90 days.</span></div>`;
  const bind = () => { ['#mvFrom', '#mvTo'].forEach((id, i) => { const el = $(id); if (el) el.onchange = e => { ST[i ? 'to' : 'from'] = e.target.value; ST.moves = { receipt: null, issue: null }; render(); }; }); };
  if (ST.movesErr) return { title:'Store', crumb:'Store', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(ST.movesErr), `<button class="btn btn-primary" onclick="stLoadMoves('${kind}', true)">Try again</button>`)}</div></div>`, bind };
  if (!rows) return { title:'Store', crumb:'Store', html: head + `<div class="card"><div class="card-b small muted">Loading...</div></div>`, bind };
  const stat = m => m.reversal ? '<span class="badge b-slate">Reversal</span>' : m.reversed_by ? '<span class="badge b-slate">Reversed</span>'
    : m.source === 'import' ? '<span class="badge">Old Excel file</span>' : '<span class="badge b-ok">' + (kind === 'receipt' ? 'Received' : 'Issued') + '</span>';
  const canRev = m => canEdit && !m.reversal && !m.reversed_by && m.source !== 'import';
  const table = kind === 'receipt'
    ? `<thead><tr><th>Entry</th><th>Date</th><th>Material</th><th style="text-align:right">Qty</th><th>Request ${stInfo(R.receipt)}</th><th>Supplier / invoice</th><th>Received by</th><th>Status</th><th></th></tr></thead>
       <tbody>${rows.map(m => `<tr><td class="mono small">${esc(m.entry)}</td><td class="small">${esc(m.date)}</td>
         <td><div class="strong">${esc(m.code)}</div><div class="tiny muted">${esc(m.name)}</div></td>
         <td style="text-align:right">${m.reversal ? '-' : ''}${stNum(m.qty)} ${esc(m.unit || '')}</td>
         <td class="small">${esc(m.request_ref || '--')}${m.request_po ? `<div class="tiny muted">PO ${esc(m.request_po)}</div>` : ''}</td>
         <td class="small">${esc(m.supplier || '')}<div class="tiny muted">${esc(m.invoice_no || '')}</div></td><td class="small">${esc(m.received_by_name || '')}</td>
         <td>${stat(m)}${m.reason || m.note ? `<div class="tiny muted">${esc(m.reason || m.note)}</div>` : ''}</td>
         <td style="text-align:right">${canRev(m) ? `<button class="btn btn-ghost btn-sm" onclick="stReverse(${m.id}, 'receipt')">Reverse</button>` : ''}</td></tr>`).join('')
         || `<tr><td colspan="9" class="muted" style="padding:16px">Nothing received in this period.</td></tr>`}</tbody>`
    : `<thead><tr><th>Entry</th><th>Date</th><th>Material</th><th style="text-align:right">Qty</th><th>Used on</th><th>Collected by</th><th>Status</th><th></th></tr></thead>
       <tbody>${rows.map(m => `<tr><td class="mono small">${esc(m.entry)}</td><td class="small">${esc(m.date)}</td>
         <td><div class="strong">${esc(m.code)}</div><div class="tiny muted">${esc(m.name)}</div></td>
         <td style="text-align:right">${m.reversal ? '-' : ''}${stNum(m.qty)} ${esc(m.unit || '')}</td>
         <td class="small">${esc(m.used_on_name || '')}${!m.used_on && m.purpose_text ? `<div class="tiny muted">Excel: ${esc(m.purpose_text)}</div>` : ''}</td>
         <td class="small">${esc(m.collected_by_name || '')}</td>
         <td>${stat(m)}${m.reason || (m.source !== 'import' && m.note) ? `<div class="tiny muted">${esc(m.reason || m.note)}</div>` : ''}</td>
         <td style="text-align:right">${canRev(m) ? `<button class="btn btn-ghost btn-sm" onclick="stReverse(${m.id}, 'issue')">Reverse</button>` : ''}</td></tr>`).join('')
         || `<tr><td colspan="8" class="muted" style="padding:16px">Nothing issued in this period.</td></tr>`}</tbody>`;
  return { title:'Store', crumb:'Store', keepScroll: true, html: head + `<div class="card"><div class="tbl-wrap"><table class="tbl">${table}</table></div>
    <div class="small muted" style="padding:12px 18px">${rows.length} entries.</div></div>`, bind };
}
route('/store/received', () => stMovesView('receipt'));
route('/store/issued', () => stMovesView('issue'));

/* ---- Weekly count */
const stDayName = iso => iso ? new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday:'short', timeZone:'UTC' }) : '';
function viewStoreCounts(){
  if (!ST.data) { stLoad(); return stWait('/store/counts'); }
  if (!ST.counts) { stLoadCounts(); return stWait('/store/counts'); }
  const c = ST.counts, items = c.items || [], canEdit = stCanCount(), R = stRules();
  const today = c.today || stToday(), thisWeek = !ST.week;
  const done = items.filter(i => i.status !== 'planned').length, dueNow = items.filter(i => i.status === 'planned' && i.due_on && i.due_on <= today).length;
  const shift = d => { const t = new Date(c.week_start + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + d); return t.toISOString().slice(0, 10); };
  const label = { planned:'<span class="badge b-warn">Not counted yet</span>', matches:'<span class="badge b-ok">Matches</span>', adjusted:'<span class="badge b-ok">Adjusted</span>',
    waiting_approval:'<span class="badge b-warn">Waiting approval</span>', approved:'<span class="badge b-ok">Approved</span>', rejected:'<span class="badge b-danger">Rejected</span>' };
  const day = i => {
    if (!i.due_on) return '<span class="small muted">--</span>';
    const late = i.status === 'planned' && thisWeek && i.due_on < today;
    return (i.due_on === today && thisWeek ? '<span class="strong">Today</span>' : `<span class="small">${esc(stDayName(i.due_on))}</span>`)
      + (late ? ' <span class="badge b-warn">late</span>' : '') + (i.carried ? '<div class="tiny muted">from last week</div>' : '');
  };
  const used = i => i.common_use ? 'Common use' : (i.used_on_names || []).length ? esc(i.used_on_names.map(a => a.name).join(', ')) : '<span class="muted">not set</span>';
  return { title:'Store', crumb:'Store', keepScroll: true,
    html: stHead('Each working day a few materials to count. For each one, also confirm its location and where it is used. What is counted becomes the stock.', stActions()) + stTabs('/store/counts') + `
    <div class="grid g2" style="margin-bottom:14px">
      <div class="stat"><div class="lbl">${thisWeek ? 'To count today' : 'Week'}</div><div class="val">${thisWeek ? dueNow : esc(c.week)}</div><div class="meta">${thisWeek ? 'today\'s and any left from earlier days' : 'from ' + esc(c.week_start)}</div></div>
      <div class="stat"><div class="lbl">This week</div><div class="val">${done} of ${items.length}</div><div class="meta">counted. Count ahead if you have time.</div></div>
    </div>
    <div class="row between" style="margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div class="row" style="gap:8px"><button class="btn btn-ghost btn-sm" onclick="stWeek('${shift(-7)}')">${I.chevL} Previous week</button>
        <span class="strong">Week ${esc(c.week)} (from ${esc(c.week_start)})</span>
        ${thisWeek ? '' : `<button class="btn btn-ghost btn-sm" onclick="stWeek('')">This week</button>`}</div>
      <div class="small">${stInfo(R.count, 'How the count works')}</div>
    </div>
    <div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Day</th><th>Material</th><th>Location</th><th>Used on</th><th style="text-align:right">Counted</th><th>Status</th><th></th></tr></thead>
      <tbody>${items.map(i => `<tr>
        <td data-label="Day">${day(i)}</td>
        <td><div class="strong">${esc(i.code)}</div><div class="tiny muted">${esc(i.name)}${i.part_number ? ' · ' + esc(i.part_number) : ''}${i.first_count ? ' · first count' : ''}</div></td>
        <td data-label="Location" class="small">${esc(i.location || '') || '<span class="muted">not set</span>'}</td>
        <td data-label="Used on" class="small">${used(i)}</td>
        <td data-label="Counted" style="text-align:right">${i.counted_qty == null ? '--' : stNum(i.counted_qty) + ' ' + esc(i.unit)}${i.difference != null && +i.difference !== 0 ? `<div class="tiny muted">system ${stNum(i.system_qty)}, ${+i.difference > 0 ? '+' : ''}${stNum(i.difference)}</div>` : ''}
          ${i.reason ? `<div class="tiny muted">${esc(i.reason)}</div>` : ''}${i.decision_note ? `<div class="tiny muted">${esc(i.decided_by)}: ${esc(i.decision_note)}</div>` : ''}</td>
        <td>${label[i.status] || esc(i.status)}</td>
        <td style="text-align:right">${i.status === 'planned' && canEdit ? `<button class="btn ${i.due_on && i.due_on <= today ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="stCount(${i.id})">Count</button>` : ''}</td>
      </tr>`).join('') || `<tr><td colspan="7" class="muted" style="padding:16px">No count planned for this week.</td></tr>`}</tbody>
    </table></div></div>
    ${(c.waiting_approval || []).length ? `<div class="card" style="margin-top:14px"><div class="card-h"><h3>Counts waiting for approval</h3><div class="sub">The stock changes only when the Production Manager approves.</div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Material</th><th style="text-align:right">System</th><th style="text-align:right">Shelf</th><th>Reason</th><th>Counted by</th><th></th></tr></thead>
      <tbody>${c.waiting_approval.map(i => `<tr><td><div class="strong">${esc(i.code)}</div><div class="tiny muted">${esc(i.name)}</div></td><td style="text-align:right">${stNum(i.system_qty)}</td>
        <td style="text-align:right" class="strong">${stNum(i.counted_qty)}</td><td class="small">${esc(i.reason || '')}</td><td class="small">${esc(i.counted_by || '')}</td>
        <td style="text-align:right">${stCanApprove() ? `<div class="row" style="gap:6px;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="stDecide(${i.id}, true)">Approve</button><button class="btn btn-ghost btn-sm" onclick="stDecide(${i.id}, false)">Reject</button></div>` : '<span class="small muted">waiting for the Production Manager</span>'}</td></tr>`).join('')}</tbody></table></div></div>` : ''}` };
}
route('/store/counts', viewStoreCounts);
function stWeek(w){ ST.week = w; ST.counts = null; render(); }
function stCount(id){
  const i = ((ST.counts || {}).items || []).find(x => x.id === id); if (!i) return;
  openModal({
    title: 'Count ' + i.code, size:'narrow', sub: i.name + (i.part_number ? ' · ' + i.part_number : '') + (i.location ? ' · ' + i.location : ''),
    body: `<form novalidate>
      ${i.first_count ? `<div class="hint" style="margin-bottom:10px">${I.info}<span>First count: the stock was not known before, so what you count becomes the stock. Check the name and part number too; tell the store manager if they are wrong.</span></div>` : ''}
      <div class="field"><label for="cnQty">How many are on the shelf?</label>
        <div class="row" style="gap:8px"><input class="inp" id="cnQty" type="number" min="0" step="any" inputmode="decimal" style="max-width:140px"><span class="small muted">${esc(i.unit)}</span></div></div>
      <div class="field"><label for="cnWhy">If it differs from the system, why? <span class="muted">(only if asked)</span></label><input class="inp" id="cnWhy" maxlength="300"></div>
      <div class="field"><label for="cnLoc">Location</label><select class="inp" id="cnLoc">${stLocations().map(l => `<option ${l === i.location ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
      <div class="field"><label>Used on ${stInfo(stRules().usedOn)}</label>${stUsedEditor('cn', i, true)}</div>
      <div class="err-msg hide" data-err="cnQty"></div></form>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Save</button>`,
    onMount: (w, close) => {
      stUsedBind(w, 'cn', m => setErr('cnQty', m, w));
      const sv = $('[data-save]', w);
      sv.onclick = async () => {
        clearErrors(w);
        const body = { id, counted: $('#cnQty', w).value.trim(), reason: $('#cnWhy', w).value.trim(), location: $('#cnLoc', w).value, used_on: stUsedValue(w, 'cn') };
        if (!/^\d+(\.\d{1,2})?$/.test(body.counted)) return setErr('cnQty', 'Enter the number on the shelf (0 or more).', w);
        if (!['m', 'L', 'kg'].includes(i.unit) && +body.counted !== Math.floor(+body.counted)) return setErr('cnQty', 'Whole ' + i.unit + ' only.', w);
        if (!body.used_on.length) return setErr('cnQty', 'Add the printers, lines or machines it is used on, or tick "Common use".', w);
        sv.disabled = true;
        try { const r = await api('/webhook/production/api/store/count', { method:'POST', body }); close();
          toast(r.status === 'matches' ? 'Matches the system' : r.status === 'adjusted' ? 'Stock set' : 'Sent for approval', i.code + ': location and used-on saved', 'ok'); await stRefresh(); }
        catch (err) { setErr('cnQty', err.message, w); sv.disabled = false; if (/why/i.test(err.message)) $('#cnWhy', w).focus(); }
      };
      setTimeout(() => { const q = $('#cnQty', w); q && q.focus(); }, 30);
    },
  });
}
function stDecide(id, approve){
  const i = ((ST.counts || {}).waiting_approval || []).find(x => x.id === id); if (!i) return;
  openModal({ title: (approve ? 'Approve ' : 'Reject ') + i.entry, size:'narrow', sub: i.code + ': system ' + stNum(i.system_qty) + ', shelf ' + stNum(i.counted_qty),
    body: `<div class="small" style="margin-bottom:8px">${approve ? 'The shelf count becomes the stock.' : 'The stock stays as it is; the material is counted again.'}</div>
      <div class="field"><label for="dcNote">${approve ? 'Note (optional)' : 'Why?'}</label><input class="inp" id="dcNote" maxlength="300"></div><div class="err-msg hide" data-err="dcNote"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Back</button><button class="btn ${approve ? 'btn-primary' : 'btn-danger'}" data-save>${approve ? 'Approve' : 'Reject'}</button>`,
    onMount: (w, close) => { $('[data-save]', w).onclick = async () => {
      clearErrors(w); const note = $('#dcNote', w).value.trim(); if (!approve && note.length < 5) return setErr('dcNote', 'Say why.', w);
      try { await api('/webhook/production/api/store/count/decide', { method:'POST', body:{ id, approve, note } }); close(); toast(approve ? 'Approved' : 'Rejected', i.code, 'ok'); await stRefresh(); }
      catch (e) { setErr('dcNote', e.message, w); } }; } });
}

/* ---- Settings: the numbers behind the rules (each with its reason), the counter, locations, material types */
const ST_DAYS = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' };
function viewStoreSettings(){
  if (!ST.data) { stLoad(); return stWait('/store/settings'); }
  const canEdit = levelOf('production.store_settings') === 'edit', dis = canEdit ? '' : 'disabled', set = ST.data.settings || [], people = ST.data.people || [];
  const field = s => {
    let input;
    if (s.unit === 'person') input = `<select class="inp" data-set="${esc(s.key)}" ${dis}>${people.map(p => `<option value="${esc(p.enroll_id)}" ${s.person && s.person.enroll_id === p.enroll_id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>`;
    else if (s.unit === 'list') input = `<textarea class="inp" data-set="${esc(s.key)}" data-list="1" rows="3" ${dis}>${esc((s.list || []).join('\n'))}</textarea><div class="tiny muted">One per line.</div>`;
    else if (s.unit === 'weekday') input = `<select class="inp" data-set="${esc(s.key)}" ${dis}>${Object.entries(ST_DAYS).map(([k, v]) => `<option value="${k}" ${+s.value === +k ? 'selected' : ''}>${v}</option>`).join('')}</select>`;
    else input = `<div class="row" style="gap:8px"><input class="inp" type="number" data-set="${esc(s.key)}" min="${s.min}" max="${s.max}" step="1" value="${stNum(s.value)}" style="max-width:120px" ${dis}><span class="small muted">${esc(s.unit || '')}</span></div>`;
    return `<div class="field" style="padding:12px 0;border-top:1px solid var(--line-2)"><label>${esc(s.label)}</label>${input}
      <div class="tiny muted" style="margin-top:4px;line-height:1.5">${esc(s.help || '')}</div>${s.updated_by ? `<div class="tiny muted">Last changed by ${esc(s.updated_by)}, ${esc(String(s.updated_at || '').slice(0, 10))}</div>` : ''}</div>`;
  };
  const types = ST.data.types || [];
  return { title:'Store', crumb:'Store',
    html: stHead('The numbers behind the rules. Each one says what it does and why it is set so.', '') + stTabs('/store/settings') + `
    <div class="grid g2" style="align-items:start">
      <div class="card"><div class="card-h"><h3>Rules</h3><div class="sub">A change applies at once to every material.</div></div><div class="card-b">${set.map(field).join('')}
        ${canEdit ? `<div class="err-msg hide" data-err="setSave"></div><button class="btn btn-primary" style="margin-top:10px" onclick="stSaveSettings()">${I.check} Save the rules</button>` : ''}</div></div>
      <div class="card"><div class="card-h"><h3>Material types ${stInfo(stRules().code)}</h3><div class="sub">The two letters start every code. A new kind of material (gloves, change parts, tools ...) gets its own type and category.</div></div>
        <div class="tbl-wrap"><table class="tbl" data-nosort><thead><tr><th>Letters</th><th>Type</th><th>Category</th><th style="text-align:right">Materials</th><th></th></tr></thead>
        <tbody>${types.map(t => `<tr><td class="mono">${esc(t.prefix)}</td><td>${esc(t.name)}</td><td>${esc(t.category)}</td><td style="text-align:right">${t.items}</td>
          <td style="text-align:right">${t.active ? '' : '<span class="badge b-slate">Off</span> '}${canEdit ? `<button class="btn btn-ghost btn-sm" onclick="stType('${esc(t.prefix)}')">Edit</button>` : ''}</td></tr>`).join('')}</tbody></table></div>
        ${canEdit ? `<div class="card-b"><button class="btn btn-ghost" onclick="stType('')">${I.plus} Add a type</button></div>` : ''}</div>
    </div>` };
}
route('/store/settings', viewStoreSettings);
async function stSaveSettings(){
  const values = {};
  $$('[data-set]').forEach(el => { values[el.dataset.set] = el.dataset.list ? el.value.split('\n').map(s => s.trim()).filter(Boolean) : el.value; });
  const err = $('[data-err="setSave"]'); if (err) { err.classList.add('hide'); err.textContent = ''; }
  try { const r = await api('/webhook/production/api/store/settings', { method:'POST', body:{ values } }); toast(r.changed ? 'Saved' : 'Nothing changed', r.changed ? r.changed + ' setting' + (r.changed === 1 ? '' : 's') : '', 'ok'); await stLoad(true); }
  catch (e) { if (err) { err.textContent = e.message; err.classList.remove('hide'); } else toast('Not saved', e.message, 'err'); }
}
function stType(prefix){
  const t = prefix ? (ST.data.types || []).find(x => x.prefix === prefix) : null;
  openModal({ title: t ? 'Type ' + t.prefix : 'Add a material type', size:'narrow', sub: t ? 'The letters stay; the name and category can change.' : 'Two capital letters that start every code of this type.',
    body: `<div class="field"><label for="tyPx">Letters</label><input class="inp" id="tyPx" maxlength="2" value="${esc(t ? t.prefix : '')}" ${t ? 'disabled' : ''} placeholder="e.g. GL" style="max-width:90px;text-transform:uppercase"></div>
      <div class="field"><label for="tyName">Type</label><input class="inp" id="tyName" maxlength="40" value="${esc(t ? t.name : '')}" placeholder="e.g. Gloves"></div>
      <div class="field"><label for="tyCat">Category</label><input class="inp" id="tyCat" maxlength="30" value="${esc(t ? t.category : 'Consumable')}" list="tyCats"><datalist id="tyCats">${Array.from(new Set((ST.data.types || []).map(x => x.category))).map(c => `<option value="${esc(c)}">`).join('')}</datalist></div>
      ${t ? `<label class="row small" style="gap:6px"><input type="checkbox" id="tyActive" ${t.active ? 'checked' : ''}> In use (untick: no new materials of this type)</label>` : ''}
      <div class="err-msg hide" data-err="tyPx"></div>`,
    footer:`<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${I.check} Save</button>`,
    onMount: (w, close) => { $('[data-save]', w).onclick = async () => {
      clearErrors(w);
      const type = { prefix: $('#tyPx', w).value.trim().toUpperCase(), name: $('#tyName', w).value.trim(), category: $('#tyCat', w).value.trim(), active: t ? $('#tyActive', w).checked : true };
      if (!/^[A-Z]{2}$/.test(type.prefix)) return setErr('tyPx', 'Two capital letters.', w);
      try { await api('/webhook/production/api/store/type', { method:'POST', body:{ type } }); close(); toast('Saved', type.prefix + ' ' + type.name, 'ok'); await stLoad(true); }
      catch (e) { setErr('tyPx', e.message, w); } }; } });
}
