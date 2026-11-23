"use strict";
/* ============================================================
   Daily production report (23 Nov 2026), inside the Production console. Only what the user does:
     Check mailbox (reads the OKL / OBC packaging reports and the OKL RM PM stock report from the user's Zoho mailbox,
     workflow OKL Check Mailbox), Upload (a file that did not come by e-mail), what waits (Zaiki / Mintacid / Cannon PM
     review, stock reports to approve, stops without an action), the daily and weekly drafts to copy, the Google Sheet.
   No messages are sent about any of this any more (migration 093): this page is the only place.
   Server: production-report/api/status | check-mail | upload | month-file (OKL Production Report, OKL Check Mailbox).
   ============================================================ */
const PR = { data: null, err: '', loading: false, mail: null, mailBusy: false, files: [], upBusy: false, upRes: null, copied: '' };
const PR_API = '/webhook/production-report/api/';
const PR_MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PR_MONTH = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const PR_WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], PR_WDAY = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function prParts(iso){ const p = String(iso || '').slice(0, 10).split('-').map(Number); return { p, d: new Date(Date.UTC(p[0], p[1] - 1, p[2])) }; }
function prDay(iso){ if (!iso) return ''; const { p, d } = prParts(iso); return PR_WD[d.getUTCDay()] + ' ' + p[2] + ' ' + PR_MON[p[1] - 1]; }
function prLong(iso){ if (!iso) return ''; const { p, d } = prParts(iso); return PR_WDAY[d.getUTCDay()] + ' ' + p[2] + ' ' + PR_MONTH[p[1] - 1]; }
function prTime(ts){ const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
function prWhen(ts){ if (!ts) return ''; const d = new Date(ts), today = new Date().toDateString() === d.toDateString();
  return (today ? 'today' : PR_WD[d.getDay()] + ' ' + d.getDate() + ' ' + PR_MON[d.getMonth()]) + ', ' + prTime(ts); }
function prCompany(name){ return /\bOKL\s+PERSONNEL/i.test(name) ? 'OKL' : /\bOBC\s+PERSONNEL/i.test(name) ? 'OBC' : ''; }
function prCan(){ return levelOf('production') === 'edit'; }
function prHere(){ return currentPath().split('?')[0] === '/report'; }

async function prLoad(){
  PR.loading = true;
  try { PR.data = await api(PR_API + 'status'); PR.err = ''; PR.at = Date.now(); }
  catch (e) { PR.err = e.message; }
  PR.loading = false;
  if (prHere()) render();
}

async function prCheckMail(){
  if (PR.mailBusy) return;
  PR.mailBusy = true; PR.mail = null; render();
  try { PR.mail = await api(PR_API + 'check-mail', { method: 'POST', body: {} }); }
  catch (e) { PR.mail = { error: e.message }; }
  PR.mailBusy = false;
  await prLoad();
  setTimeout(prLoad, 8000);   // the Google Sheet is written a few seconds after the answer
}

function prB64(f){ return new Promise((ok, bad) => { const r = new FileReader(); r.onload = () => ok(String(r.result).replace(/^data:[^,]*,/, '')); r.onerror = () => bad(new Error('The file could not be read.')); r.readAsDataURL(f); }); }
function prChoose(list){
  Array.from(list || []).filter(f => /\.xls[xm]$/i.test(f.name)).forEach(f => {
    PR.files = PR.files.filter(g => prCompany(g.name) !== prCompany(f.name) || !prCompany(f.name)); PR.files.push(f); });
  PR.files = PR.files.slice(-4); PR.upRes = null; render();
}
async function prUpload(){
  const send = PR.files.filter(f => prCompany(f.name));
  if (!send.length || PR.upBusy) return;
  PR.upBusy = true; render();
  try {
    const body = { files: [] };
    for (const f of send) body.files.push({ name: f.name, data: await prB64(f) });
    PR.upRes = await api(PR_API + 'upload', { method: 'POST', body });
  } catch (e) { PR.upRes = { ok: false, error: e.message }; }
  PR.upBusy = false; PR.files = [];
  await prLoad();
  setTimeout(prLoad, 8000);
}

async function prCopy(key){
  const d = (PR.data && PR.data.drafts) || {}, m = d[key];
  if (!m) return;
  try { await navigator.clipboard.writeText(m.text); }
  catch (e) { const t = document.createElement('textarea'); t.value = m.text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (x) { /* ignore */ } t.remove(); }
  PR.copied = key; render(); toast('Copied', 'Paste it into WhatsApp or your e-mail.', 'ok', 2500);
  setTimeout(() => { if (PR.copied === key) { PR.copied = ''; if (prHere()) render(); } }, 2500);
}

async function prDownload(month, label){
  try {
    const res = await fetch(API_BASE + PR_API + 'month-file?month=' + encodeURIComponent(month), { headers: { Authorization: getToken() } });
    if (!res.ok) { let j = {}; try { j = await res.json(); } catch (e) { /* not json */ } throw new Error(j.error || 'The file did not download.'); }
    const blob = await res.blob(), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'Production report - ' + label + '.xlsx'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  } catch (e) { toast('Not downloaded', e.message, 'warn', 5000); }
}

/* ---- the parts of the page ---- */
function prFileLine(k, x){
  return x.in
    ? `<div class="row" style="gap:8px;flex-wrap:wrap"><span class="badge b-ok"><span class="dot"></span>${k} in</span><span class="small muted">since ${esc(prWhen(x.came_at))}</span></div>`
    : `<div class="row" style="gap:8px;flex-wrap:wrap"><span class="badge b-warn"><span class="dot"></span>${k} not in yet</span><span class="small muted">${x.last_day ? 'its last day so far: ' + esc(prDay(x.last_day)) : 'none this month yet'}</span></div>`;
}
function prOutcomeBadge(o){
  const t = String(o || '');
  if (/^Read:/.test(t)) return `<span class="badge b-ok">${esc(t.replace(/^Read:\s*/, ''))}</span>`;
  if (t === 'reading') return `<span class="badge b-slate">being read</span>`;
  if (t === 'not downloaded') return `<span class="badge b-warn">not downloaded: press Check mailbox again</span>`;
  return `<span class="badge b-danger">${esc(t)}</span>`;
}
const PR_KIND = { OKL: 'OKL report', OBC: 'OBC report', stock: 'Stock report' };
function prMailRows(list){
  return `<div class="tbl-wrap"><table class="tbl" style="min-width:520px"><thead><tr><th>E-mail</th><th>Came in</th><th>What happened</th></tr></thead><tbody>${
    list.map(m => `<tr><td><b>${esc(PR_KIND[m.kind] || m.kind || '')}</b><div class="tiny muted">${esc(m.file_name || m.subject || '')}</div></td>
      <td class="small">${esc(prWhen(m.received_at))}</td><td>${prOutcomeBadge(m.outcome)}</td></tr>`).join('')}</tbody></table></div>`;
}

function prFilesCard(d, can){
  const c = d.companies || {}, ml = d.mail || {};
  const last = ml.checked_at ? 'Last checked ' + esc(prWhen(ml.checked_at)) + (ml.checked_by ? ' by ' + esc(ml.checked_by) : '') + '.' : 'Not checked yet.';
  let result = '';
  if (PR.mailBusy) result = `<div class="notice info" style="margin-top:12px">${I.info}<div>Reading the mailbox and the files. This takes up to a minute.</div></div>`;
  else if (PR.mail && PR.mail.error) result = `<div class="notice danger" style="margin-top:12px">${I.alert}<div>${esc(PR.mail.error)}</div></div>`;
  else if (PR.mail) result = PR.mail.found ? `<div style="margin-top:12px">${prMailRows(PR.mail.mails || [])}</div>`
    : `<div class="notice ok" style="margin-top:12px">${I.check}<div>No new report e-mails since the last check.</div></div>`;
  else if (ml.error) result = `<div class="notice danger" style="margin-top:12px">${I.alert}<div>The last check failed: ${esc(ml.error)}</div></div>`;
  // e-mails of the last 7 days that did not go in well (the rest need no attention)
  const bad = (ml.recent || []).filter(m => !/^Read:/.test(String(m.outcome || '')) && m.outcome !== 'reading');
  const badHtml = !PR.mail && bad.length ? `<div style="margin-top:12px"><div class="small strong" style="margin-bottom:6px">Needs a look</div>${prMailRows(bad)}</div>` : '';
  const chosen = PR.files.map(f => { const co = prCompany(f.name);
    return `<div class="row between small" style="padding:7px 0;border-bottom:1px solid var(--line-2)"><span style="min-width:0;word-break:break-word">${esc(f.name)}</span>
      <span class="badge ${co ? 'b-ok' : 'b-danger'}">${co || 'not a report'}</span></div>`; }).join('');
  const up = PR.upRes;
  let upHtml = '';
  if (PR.upBusy) upHtml = `<div class="small muted" style="margin-top:10px">Reading the file${PR.files.length === 1 ? '' : 's'}...</div>`;
  else if (up) {
    const lines = (up.files || []).map(f => f.error ? `<div style="color:var(--danger)">&#10007; <b>${esc(f.company || '')}</b> ${esc(f.file_name)}: ${esc(f.error)}</div>`
      : `<div style="color:var(--ok)">&#10003; <b>${esc(f.company)}</b> ${esc([(f.new || []).length ? (f.new || []).length + ' new day' + ((f.new || []).length === 1 ? '' : 's') : '', (f.changed || []).length ? (f.changed || []).length + ' changed' : ''].filter(Boolean).join(', ') || 'nothing new (already in)')}.</div>`)
      .concat((up.rejected || []).map(r => `<div style="color:var(--danger)">&#10007; ${esc(r.file_name || 'A file')}: ${esc(r.error)}</div>`));
    if (!lines.length) lines.push(`<div style="color:var(--danger)">&#10007; ${esc(up.error || 'Not uploaded.')}</div>`);
    upHtml = `<div class="small" style="margin-top:10px;line-height:1.6">${lines.join('')}</div>`;
  }
  return `<div class="card"><div class="card-h"><div><h3>Files</h3><div class="sub">${last}</div></div>
      ${can ? `<button class="btn btn-primary" id="prCheck" ${PR.mailBusy ? 'disabled' : ''}>${PR.mailBusy ? 'Checking...' : 'Check mailbox'}</button>` : ''}</div>
    <div class="card-b">
      <div class="grid g2" style="gap:10px">${prFileLine('OKL', c.OKL || {})}${prFileLine('OBC', c.OBC || {})}</div>
      ${result}${badHtml}
      ${can ? `<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line-2)">
        <div class="small strong">A file that did not come by e-mail</div>
        <label id="prDrop" style="display:block;margin-top:8px;border:2px dashed var(--line);border-radius:var(--r-sm);padding:18px 14px;text-align:center;cursor:pointer;color:var(--text-2);font-size:13.5px">
          <input type="file" id="prPick" accept=".xlsx,.xlsm" multiple style="display:none"><b style="color:var(--brand-600)">Choose the OKL or OBC file</b> or drop it here</label>
        ${chosen ? `<div style="margin-top:8px">${chosen}</div>` : ''}
        ${PR.files.length ? `<button class="btn btn-primary" id="prUp" style="margin-top:10px" ${PR.upBusy || !PR.files.some(f => prCompany(f.name)) ? 'disabled' : ''}>Upload</button>` : ''}
        ${upHtml}</div>` : ''}
    </div></div>`;
}

function prTodoCard(d){
  const rows = [], e = d.engineering || {}, rv = d.review || {}, eng = '../engineering/#/jobs?tab=reports';
  const row = (what, say, act) => rows.push(`<div class="row between" style="gap:12px;padding:11px 0;border-bottom:1px solid var(--line-2);flex-wrap:wrap">
      <div style="min-width:0;flex:1 1 260px"><div class="strong">${what}</div><div class="small muted" style="margin-top:2px">${say}</div></div><div>${act || ''}</div></div>`);
  if (rv.state === 'waiting') row('Zaiki, Mintacid and Cannon Para/Cannon PM', 'Prefilled from the OKL file for ' + esc(prDay(rv.day)) + '. Check it and save.',
    `<a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="${esc(d.review_url + encodeURIComponent(rv.token))}">Review and save</a>`);
  (d.stock || []).forEach(s => row('Stock report to approve', esc(s.subject || 'OKL RM PM stock report') + ': ' + s.matched + ' material' + (s.matched === 1 ? '' : 's') + ' matched'
    + (s.unmatched ? ', ' + s.unmatched + ' not matched' : '') + '. Came in ' + esc(prWhen(s.staged_at)) + '.',
    `<a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="${esc(d.stock_url + encodeURIComponent(s.token))}">Review and approve</a>`));
  const blanks = ((d.stops || {}).list || []).filter(x => x.action == null || String(x.action).trim() === '');
  if (blanks.length) {
    const list = blanks.map(x => `<li>${esc(x.company)} ${esc(x.product || '')}${x.machine && x.machine !== x.product ? ' / ' + esc(x.machine) : ''}: ${esc(x.text || '')} (${x.minutes} min)`
      + (x.job_id ? ` <span class="tiny muted">${esc(x.job_id)}${x.job_status === 'to_report' ? ', Engineering has not filled it' : ''}</span>` : '') + '</li>').join('');
    row(blanks.length + ' stop' + (blanks.length === 1 ? '' : 's') + ' of 30+ minutes without an action', `They show as [action?] in the draft. OKL stops are filled by Engineering; OBC ones come from the OBC file.<ul style="margin:6px 0 0;padding-left:18px">${list}</ul>`,
      blanks.some(x => x.company === 'OKL') ? `<a class="btn btn-ghost btn-sm" href="${eng}">Engineering's list</a>` : '');
  }
  // 095: the machine stops wait on the Machine issues tab before they become jobs
  const miOpen = window.MI && window.MI.data ? (window.MI.data.days || []).filter(x => x.open) : [];
  if (miOpen.length) row('Machine issues to check', miOpen.reduce((s2, x) => s2 + x.open, 0) + ' issue(s) on ' + miOpen.map(x => esc(prDay(x.day))).join(', ')
    + '. Paste Engineering&#39;s report, check each issue, then Move to jobs.', `<a class="btn btn-primary btn-sm" href="#/report/issues">Open</a>`);
  if (e.waiting) row('Machine names to choose', e.waiting + ' OKL stop' + (e.waiting === 1 ? '' : 's') + ' wait for Engineering to choose the machine (Engineering > Settings > Daily report machine names).',
    `<a class="btn btn-ghost btn-sm" href="${eng}">Open Engineering</a>`);
  return `<div class="card"><div class="card-h"><div><h3>Waiting for you</h3></div>${rows.length ? `<span class="badge b-warn">${rows.length}</span>` : ''}</div>
    <div class="card-b">${rows.length ? rows.join('') : `<div class="small muted">Nothing waiting.</div>`}</div></div>`;
}

function prDraftCard(key, title, m){
  if (!m) return '';
  return `<div class="card"><div class="card-h"><div><h3>${esc(title)}</h3><div class="sub">${esc(m.subject)}</div></div>
      <button class="btn ${PR.copied === key ? 'btn-ghost' : 'btn-primary'} btn-sm" data-copy="${key}">${PR.copied === key ? I.check + ' Copied' : 'Copy'}</button></div>
    <div class="card-b">
      <div style="white-space:pre-wrap;font-size:13.5px;line-height:1.6;background:var(--surface-3, #F6F8F6);border:1px solid var(--line-2);border-radius:var(--r-sm);padding:12px 14px">${esc(m.text)}</div>
      ${(m.checks || []).length ? `<div class="notice warn" style="margin-top:12px">${I.alert}<div><b>Before you send</b> (not part of the message)<ul style="margin:4px 0 0;padding-left:18px">${m.checks.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div></div>` : ''}
    </div></div>`;
}

function prSheetCard(d){
  const sh = d.sheet || {}, month = sh.month ? PR_MONTH[Number(String(sh.month).slice(5, 7)) - 1] : '';
  const months = (d.months || []).map(f => `<button class="btn btn-ghost btn-sm" data-month="${esc(f.month)}" data-label="${esc(f.label)}">${I.arrowDown} ${esc(f.label)} (Excel)</button>`).join(' ');
  return `<div class="card"><div class="card-h"><div><h3>Google Sheet</h3><div class="sub">${esc(month)}${sh.written_at ? ': updated ' + esc(prWhen(sh.written_at)) : ': fills when a file comes in'}</div></div>
      <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://docs.google.com/spreadsheets/d/11c43m-WEgAgTzcJr2nP0LQzr7De4ZVZ7MqngACq3Npg/edit">${I.externalLink} Open</a></div>
    <div class="card-b small">${months ? `<div class="muted" style="margin-bottom:8px">Finished months, kept when the sheet moves on (for the Dropbox folder):</div>${months}` : '<span class="muted">The finished month can be downloaded here once the sheet moves to the next month.</span>'}</div></div>`;
}

function viewProdReport(){
  if (!PR.loading && ((!PR.data && !PR.err) || (PR.data && Date.now() - (PR.at || 0) > 60000))) prLoad();   // fresh each visit (a minute old at most)
  const d = PR.data, can = prCan();
  const sub = d ? 'The report you send today is for <b>' + esc(prLong(d.report_day)) + '</b>.' + (d.workday ? '' : ' Today is not a working day.') : 'OKL and OBC daily packaging reports.';
  if (!d) return { title: 'Daily production report', crumb: 'Reports', html: pageHead('Daily production report', sub) + (typeof miTabs === 'function' ? miTabs('/report') : '')
    + `<div class="card"><div class="card-b">${PR.err ? `<div class="notice danger">${I.alert}<div>${esc(PR.err)} <button class="btn btn-ghost btn-sm" id="prRetry">Try again</button></div></div>` : '<div class="muted small">Loading...</div>'}</div></div>`,
    bind: () => { const b = $('#prRetry'); if (b) b.onclick = () => { PR.err = ''; prLoad(); render(); }; } };
  const dr = d.drafts || {};
  const html = pageHead('Daily production report', sub) + (typeof miTabs === 'function' ? miTabs('/report') : '')
    + `<div class="grid g2" style="align-items:start">${prFilesCard(d, can)}${prTodoCard(d)}</div>`
    + (dr.error ? `<div class="notice danger">${I.alert}<div>${esc(dr.error)}</div></div>` : '')
    + prDraftCard('daily', 'Daily draft', dr.daily)
    + (d.weekly && d.weekly.due ? prDraftCard('weekly', 'Weekly draft', dr.weekly) : '')
    + prSheetCard(d);
  return { title: 'Daily production report', crumb: 'Reports', keepScroll: true, html, bind: prBind };
}

function prBind(){
  const chk = $('#prCheck'); if (chk) chk.onclick = prCheckMail;
  const pick = $('#prPick'); if (pick) pick.onchange = function(){ prChoose(this.files); this.value = ''; };
  const drop = $('#prDrop');
  if (drop) {
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.style.borderColor = 'var(--brand)'; }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.style.borderColor = ''; }));
    drop.addEventListener('drop', e => prChoose(e.dataTransfer && e.dataTransfer.files));
  }
  const up = $('#prUp'); if (up) up.onclick = prUpload;
  $$('[data-copy]').forEach(b => { b.onclick = () => prCopy(b.dataset.copy); });
  $$('[data-month]').forEach(b => { b.onclick = () => prDownload(b.dataset.month, b.dataset.label); });
}
route('/report', viewProdReport);
