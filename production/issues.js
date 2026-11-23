"use strict";
/* ============================================================
   Machine issues (23 Nov 2026, migration 095): Daily production report > tab "Machine issues".
   One screen per report day. The OKL file's machine stops and Engineering's daily activity report (pasted) are put side
   by side; the user checks each issue and decides what happens, then "Move to jobs". Nothing becomes an Engineering job
   before that. Server: production/api/issues (GET ?day), production/api/issues/save (POST {op, day, ...}).
   miParse() reads Engineering's WhatsApp text in the browser (also used by workflow/tests/machine_issues_parse_test.js).
   ============================================================ */

/* ---------------- reading Engineering's report ---------------- */
const MI_LABELS = [['problem', /^problem/i], ['occurred', /^occur/i], ['resolved', /^resolv/i], ['downtime', /^down\s*time/i],
  ['action', /^action/i], ['status', /^status/i], ['follow_up', /^follow/i]];
function miTwo(n){ return String(n).padStart(2, '0'); }
function miHM(m){ m = ((m % 1440) + 1440) % 1440; return miTwo(Math.floor(m / 60)) + ':' + miTwo(m % 60); }
function miClean(v){ return String(v == null ? '' : v).replace(/^\s*\[\s*/, '').replace(/\s*\]\s*$/, '').replace(/^\s*\[\s*\]\s*$/, '').trim(); }
// every time in a value: "9:20AM", "09:42 am", "13:45", "1.18pm", "10am" -> [{m: minutes of the day, ap: 'am'|'pm'|'', text}]
function miTimes(v){
  const out = [], re = /(\d{1,2})(?:\s*[:.]\s*(\d{2}))?\s*([ap])?\.?\s*(m\b\.?)?/gi;
  let x;
  const s = String(v || '');
  while ((x = re.exec(s))) {
    const h = +x[1], mm = x[2] != null ? +x[2] : null, ap = x[3] && x[4] ? x[3].toLowerCase() + 'm' : '';
    if (mm == null && !ap) continue;                          // a bare number is not a time
    if (h > 23 || (mm != null && mm > 59) || (ap && (h < 1 || h > 12))) continue;
    let m = (ap ? (h % 12) + (ap === 'pm' ? 12 : 0) : h) * 60 + (mm || 0);
    out.push({ m, ap, text: x[0].trim() });
  }
  return out;
}
// "183 mins", "1hr 30mins", "2 hours" -> minutes, or null
function miMinutes(v){
  const s = String(v || '').toLowerCase();
  const h = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/), m = s.match(/(\d+)\s*(?:m|min|mins|minute|minutes)\b/);
  if (!h && !m) { const n = s.match(/^\D*(\d{1,4})\D*$/); return n ? +n[1] : null; }
  return Math.round((h ? +h[1] * 60 : 0) + (m ? +m[1] : 0));
}
function miParse(text){
  const raw = String(text || '').replace(/\r/g, '').replace(/[•●▪‣]/g, '*');
  const res = { date: null, prepared_by: '', entries: [], pending: '', total_stated: null, flags: [] };
  const dm = raw.match(/date\s*:\s*\[?\s*(\d{1,2})\s*[\/.\-]\s*(\d{1,2})\s*[\/.\-]\s*(\d{2,4})/i);
  if (dm) { const y = dm[3].length === 2 ? 2000 + +dm[3] : +dm[3]; if (+dm[2] >= 1 && +dm[2] <= 12 && +dm[1] >= 1 && +dm[1] <= 31) res.date = y + '-' + miTwo(dm[2]) + '-' + miTwo(dm[1]); }
  if (!res.date) res.flags.push('No date found ("Date: [19/11/2026]").');
  const pb = raw.match(/prepared\s*by\s*:\s*\[?([^\]\n]*)\]?/i);
  res.prepared_by = pb ? pb[1].trim() : '';
  // split: the summary, then one block per numbered machine ("1. WIFA", "2. . [WIFA]", "3. CHE-MEI 1")
  const sumAt = raw.search(/daily\s+summary/i);
  const body = sumAt >= 0 ? raw.slice(0, sumAt) : raw, summary = sumAt >= 0 ? raw.slice(sumAt) : '';
  const lines = body.split('\n'), heads = [];
  lines.forEach((l, i) => {
    const h = l.match(/^\s*(\d{1,2})\s*[.)]\s*(?:\.\s*)*\[?\s*([A-Za-z][^\]:\n]*?)\s*\]?\s*$/);
    if (h && !/^(problem|occur|resolv|down|action|status|follow)/i.test(h[2])) heads.push({ i, n: +h[1], machine: h[2].trim() });
  });
  heads.forEach((h, k) => {
    const block = lines.slice(h.i + 1, k + 1 < heads.length ? heads[k + 1].i : lines.length).join('\n');
    const f = {}, at = [];
    const lab = /^[ \t]*([A-Za-z][A-Za-z \-()]{1,24}?)\s*:/gm;
    let x;
    while ((x = lab.exec(block))) { const key = (MI_LABELS.find(([, re]) => re.test(x[1].trim())) || [])[0]; if (key) at.push({ key, start: x.index, val: x.index + x[0].length }); }
    at.forEach((a, j) => { f[a.key] = block.slice(a.val, j + 1 < at.length ? at[j + 1].start : block.length).trim(); });
    const e = { n: h.n, machine: h.machine, problem: miClean(f.problem), windows: [], minutes_stated: miMinutes(miClean(f.downtime).replace(/[\[\]]/g, '')),
                action: miClean(f.action), status: miClean(f.status), follow_up: miClean(f.follow_up), flags: [] };
    const occ = miTimes(f.occurred), rsv = miTimes(f.resolved);
    if (!e.problem) e.flags.push('No problem written.');
    if (occ.length !== rsv.length) e.flags.push('Occurred has ' + occ.length + ' time' + (occ.length === 1 ? '' : 's') + ', Resolved ' + rsv.length + ': check the windows.');
    for (let j = 0; j < Math.min(occ.length, rsv.length); j++) {
      const o = occ[j], r = rsv[j];
      let rm = r.m;
      if (rm < o.m) {
        // "Resolved 12:02AM" after "Occurred 9:20AM": a slip for 12:02 PM; any am/none +12 h when that makes sense
        if (r.ap === 'am' && rm + 720 >= o.m && rm + 720 - o.m <= 720) { rm += 720; e.flags.push('Resolved "' + r.text + '" read as ' + miHM(rm) + ' (it was before the start).'); }
        else if (!r.ap && rm + 720 >= o.m && rm + 720 - o.m <= 720) { rm += 720; e.flags.push('Resolved "' + r.text + '" read as ' + miHM(rm) + ' (no am/pm).'); }
        else e.flags.push('Resolved ' + r.text + ' is before Occurred ' + o.text + ': counted past midnight.');
      }
      if (!o.ap && o.m < 7 * 60) e.flags.push('Occurred "' + o.text + '" has no am/pm: read as ' + miHM(o.m) + '.');
      e.windows.push({ from: miHM(o.m), to: miHM(rm) });
    }
    if (!occ.length) e.flags.push('No times found.');
    e.minutes = e.windows.length ? e.windows.reduce((s, w) => s + ((miHMm(w.to) - miHMm(w.from) + 1440) % 1440), 0) : null;
    if (e.minutes != null && e.minutes_stated != null && Math.abs(e.minutes - e.minutes_stated) > 2)
      e.flags.push('Says ' + e.minutes_stated + ' min; the times give ' + e.minutes + ' min.');
    if (!e.status) e.flags.push('No status given.');
    if (!e.action) e.flags.push('No action written.');
    res.entries.push(e);
  });
  const pend = summary.match(/pending[^:\n]*:\s*\[?([^\]\n]*)\]?/i);
  res.pending = pend ? pend[1].trim() : '';
  const tot = summary.match(/total\s*down\s*time\s*:\s*\[?([^\]\n]*)\]?/i);
  res.total_stated = tot ? miMinutes(tot[1]) : null;
  const said = res.entries.reduce((s, e) => s + (e.minutes_stated || 0), 0);
  if (res.total_stated != null && res.entries.length && Math.abs(said - res.total_stated) > 2)
    res.flags.push('The summary says ' + res.total_stated + ' min in total; the machines add up to ' + said + ' min.');
  if (!res.entries.length) res.flags.push('No machine found. Each machine starts on its own line with a number: "1. WIFA".');
  return res;
}
function miHMm(t){ const p = String(t || '').split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
if (typeof module !== 'undefined' && module.exports) { module.exports = { miParse, miTimes, miMinutes }; }

/* ---------------- the page ---------------- */
if (typeof window !== 'undefined') {

const MI = { data: null, err: '', loading: false, day: '', busy: false, paste: '', parsed: null, repaste: false, showRaw: false, showMoved: false, howOpen: null };
const MI_API = '/webhook/production/api/issues';
const MI_EXAMPLE = 'ENGINEERING DAILY ACTIVITY REPORT FOR MAINTENANCE\n\nDate: [18/11/2026]\nPrepared by: [Chukwudi, Joseph and Victor]\n\n1. KUNGLONG 2\nProblem: [Power switch issue]\nOccurred: [09:42 am]\nResolved: [10:03 am]\nDowntime: [21 mins]\nAction Taken: [glued the push lever]\nStatus: Resolved\nFollow-up: [Spare part required]\n\n2. WIFA\nProblem: [Vibrating table]\nOccurred: [9:15AM] - [1:45PM]\nResolved: [11:53AM] - [2:10PM]\n...\n\nDAILY SUMMARY\nTotal Downtime: [254 mins]';
const MI_DEC = {
  job_fill: 'Fill the job\'s empty fields', job_new: 'New job, filled from Engineering\'s report', job_empty: 'New job for Engineering to fill',
  keep: 'Not a job: keep it here', operator: 'Not a job: the operator fixed it', not_machine: 'Not a job: not a machine issue',
};
function miCan(){ return levelOf('production.machine_issues') === 'edit'; }
function miHere(){ return currentPath().split('?')[0] === '/report/issues'; }
function miDayLabel(iso){ return typeof prDay === 'function' ? prDay(iso) : String(iso || ''); }

async function miLoad(day){
  MI.loading = true;
  try {
    const d = await api(MI_API + (day ? '?day=' + encodeURIComponent(day) : ''));
    MI.data = d; MI.err = ''; MI.day = d.day ? d.day.day : ''; MI.at = Date.now();
  } catch (e) { MI.err = e.message; }
  MI.loading = false;
  if (miHere() || currentPath().split('?')[0] === '/report') render();   // the Report tab shows the count too
}
async function miSave(body, okMsg){
  if (MI.busy) return null;
  MI.busy = true; if (miHere()) render();
  let r = null;
  try {
    r = await api(MI_API + '/save', { method: 'POST', body: Object.assign({ day: MI.day }, body) });
    if (r.day) { MI.data = Object.assign({}, MI.data, { day: r.day }); }
    if (okMsg) toast(okMsg[0], okMsg[1] || '', 'ok', 4000);
    miLoad(MI.day);   // the day list (dots, counts) too
  } catch (e) { toast('Not saved', e.message, 'err', 7000); }
  MI.busy = false; if (miHere()) render();
  return r;
}

// the tabs of the Daily production report (report.js shows them too)
function miTabs(cur){
  const tabs = [];
  if (canOpen('/report/issues') && !MI.data && !MI.loading && !MI.err) miLoad();
  if (canOpen('/report')) tabs.push(['/report', 'Report']);
  if (canOpen('/report/issues')) {
    const open = ((MI.data && MI.data.days) || []).reduce((s, d) => s + (d.open || 0), 0);
    tabs.push(['/report/issues', 'Machine issues' + (open ? ` <span class="badge b-warn" style="margin-left:4px;padding:1px 7px">${open}</span>` : '')]);
  }
  if (tabs.length < 2) return '';
  return `<div class="tabs" style="margin-bottom:14px">${tabs.map(([h, l]) => `<a class="tab ${h === cur ? 'on' : ''}" href="#${h}">${l}</a>`).join('')}</div>`;
}
window.miTabs = miTabs; window.MI = MI;   // report.js shows the tabs and the count

function miHow(){
  if (MI.howOpen === null) { try { MI.howOpen = localStorage.getItem('okl.mi.how') !== 'closed'; } catch (e) { MI.howOpen = true; } }
  const step = (n, t, s) => `<div style="flex:1 1 200px;display:flex;gap:10px"><div style="flex:0 0 26px;height:26px;border-radius:50%;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">${n}</div>
    <div><div class="strong">${t}</div><div class="small muted" style="margin-top:2px">${s}</div></div></div>`;
  if (!MI.howOpen) return `<div class="small" style="margin-bottom:10px"><a href="javascript:void 0" id="miHowOpen">${I.info} How this works</a></div>`;
  return `<div class="card" style="margin-bottom:14px"><div class="card-b">
      <div class="row between" style="margin-bottom:10px"><div class="strong">How this works</div><button class="btn btn-ghost btn-sm" id="miHowClose">Hide</button></div>
      <div class="row" style="gap:14px;flex-wrap:wrap;align-items:flex-start">
        ${step(1, 'Pick the day', 'The days below. The OKL report\'s machine stops are already here once the file came in (Report tab > Check mailbox).')}
        ${step(2, 'Paste Engineering\'s report', 'Copy their WhatsApp message as it is and paste it. Check what was read, then <b>Save</b>. Anything odd is marked in orange.')}
        ${step(3, 'Check each issue, then Move to jobs', 'Each issue says what will happen. Change it where needed, then <b>Move to jobs</b>. Nothing reaches Engineering before that.')}
      </div>
      <div class="small muted" style="margin-top:10px">Full steps: <a href="#/help">How to use</a> > Machine issues.</div></div></div>`;
}

function miDayBar(days){
  if (!days.length) return '';
  return `<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:14px">${days.slice(0, 14).map(d => {
    const on = d.day === MI.day;
    const state = d.processed_at && !d.open ? `<span style="color:var(--ok)">&#10003;</span>` : d.open ? `<span class="badge b-warn" style="padding:0 6px">${d.open}</span>` : '';
    const dots = `<span title="${d.report_in ? 'OKL report in' : 'OKL report not in'}" style="color:${d.report_in ? 'var(--ok)' : 'var(--line)'}">&#9679;</span><span title="${d.eng_in ? 'Engineering\'s report pasted' : 'Engineering\'s report not pasted'}" style="color:${d.eng_in ? 'var(--brand)' : 'var(--line)'}">&#9679;</span>`;
    return `<button type="button" class="chip ${on ? 'on' : ''}" data-mi-day="${esc(d.day)}" style="gap:6px">${esc(miDayLabel(d.day))} ${dots} ${state}</button>`;
  }).join('')}</div>
  <div class="tiny muted" style="margin:-8px 0 14px"><span style="color:var(--ok)">&#9679;</span> OKL report in &nbsp; <span style="color:var(--brand)">&#9679;</span> Engineering's report pasted &nbsp; <span class="badge b-warn" style="padding:0 6px">2</span> issues left &nbsp; <span style="color:var(--ok)">&#10003;</span> done</div>`;
}

function miEngCard(d, can){
  const e = d.eng;
  if (e && !MI.repaste && !MI.parsed) {
    const ppl = (e.people || []).map(p => p.name ? `<b>${esc(p.said)}</b> = ${esc(p.name)}` : `<b>${esc(p.said)}</b> <span style="color:var(--warn)">(not found in Engineering)</span>`).join(', ');
    const tot = e.total_stated != null && e.total != null && Math.abs(e.total_stated - e.total) > 2
      ? ` <span style="color:var(--warn)">(the summary says ${e.total_stated} min)</span>` : '';
    return `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>Engineering's report ${I.check}</h3>
        <div class="sub">Pasted ${esc(prWhen(e.pasted_at))}${e.pasted_by ? ' by ' + esc(e.pasted_by) : ''}. ${(d.issues || []).reduce((s, i) => s + i.lines.filter(l => l.kind === 'eng').length, 0)} machines, ${e.total || 0} min of repair time${tot}.</div></div>
        ${can ? `<div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" id="miRaw">${MI.showRaw ? 'Hide the text' : 'Show the text'}</button><button class="btn btn-ghost btn-sm" id="miRepaste">Paste again</button></div>` : ''}</div>
      <div class="card-b small">
        ${ppl ? `<div>Prepared by: ${ppl}. ${oklInfo('The people who wrote the report. They are put on the new jobs as the technicians.\nA name not found in Engineering is left off; check the spelling in their report or in HR.')}</div>` : ''}
        ${e.pending ? `<div style="margin-top:6px">Pending: ${esc(e.pending)}</div>` : ''}
        ${MI.showRaw ? `<pre style="white-space:pre-wrap;margin-top:10px;font-size:12.5px;background:var(--surface-3, #F6F8F6);padding:10px;border-radius:var(--r-sm)">${esc(e.raw || '')}</pre>` : ''}
      </div></div>`;
  }
  if (!can) return e ? '' : `<div class="notice info" style="margin-bottom:14px">${I.info}<div>Engineering's report is not pasted for this day yet.</div></div>`;
  const p = MI.parsed;
  let preview = '';
  if (p) {
    const other = p.date && p.date !== MI.day;
    preview = `<div style="margin-top:12px">
      ${p.flags.length ? `<div class="notice warn" style="margin-bottom:10px">${I.alert}<div>${p.flags.map(esc).join('<br>')}</div></div>` : ''}
      ${other ? `<div class="notice info" style="margin-bottom:10px">${I.info}<div>The report is dated <b>${esc(miDayLabel(p.date))}</b>, not ${esc(miDayLabel(MI.day))}. It will be saved to <b>${esc(miDayLabel(p.date))}</b>.</div></div>` : ''}
      <div class="small" style="margin-bottom:6px">Read: <b>${p.entries.length}</b> machine${p.entries.length === 1 ? '' : 's'}${p.prepared_by ? ', prepared by ' + esc(p.prepared_by) : ''}. Check them, then save.</div>
      <div class="tbl-wrap"><table class="tbl" style="min-width:640px"><thead><tr><th>Machine</th><th>Problem</th><th>Times</th><th>Minutes</th><th>Status</th></tr></thead><tbody>
      ${p.entries.map(x => `<tr><td><b>${esc(x.machine)}</b></td><td class="small">${esc(x.problem)}</td>
        <td class="small mono">${x.windows.map(w => esc(w.from + '-' + w.to)).join('<br>') || '-'}</td>
        <td class="small">${x.minutes != null ? x.minutes : '-'}${x.minutes_stated != null && x.minutes_stated !== x.minutes ? ` <span class="muted">(says ${x.minutes_stated})</span>` : ''}</td>
        <td class="small">${esc(x.status || '-')}${x.flags.length ? `<div style="color:var(--warn);margin-top:3px">${x.flags.map(esc).join('<br>')}</div>` : ''}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="row" style="gap:8px;margin-top:10px">
        <button class="btn btn-primary" id="miPasteSave" ${!p.entries.length || MI.busy ? 'disabled' : ''}>Save to ${esc(miDayLabel(p.date || MI.day))}</button>
        <button class="btn btn-ghost" id="miPasteCancel">Cancel</button></div></div>`;
  }
  return `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>Engineering's report</h3>
      <div class="sub">${e ? 'Pasting again replaces the lines not moved yet.' : 'Paste their "Daily activity report for maintenance" for this day, exactly as they sent it.'}</div></div>
      ${e ? `<button class="btn btn-ghost btn-sm" id="miPasteCancel">Cancel</button>` : ''}</div>
    <div class="card-b">
      <textarea class="inp" id="miPaste" rows="${p ? 4 : 9}" style="width:100%;font-family:var(--mono);font-size:12.5px" placeholder="${esc(MI_EXAMPLE)}">${esc(MI.paste)}</textarea>
      ${p ? '' : `<button class="btn btn-primary" id="miRead" style="margin-top:10px">Read the report</button>`}
      ${preview}
    </div></div>`;
}

function miLineHtml(l, iss, d, can){
  const asset = l.asset_name || '';
  const pick = !l.asset && can && !iss.moved_at
    ? `<div style="margin-top:6px"><select class="inp" data-mi-asset="${l.id}" style="min-width:200px;padding:5px 8px"><option value="">Choose the machine...</option>${(d.assets || []).map(a => `<option value="${esc(a.code)}">${esc(a.name)}</option>`).join('')}</select>
       <label class="tiny" style="display:block;margin-top:3px"><input type="checkbox" data-mi-remember="${l.id}" checked> Remember "${esc(l.machine_text || '')}" for next time</label></div>` : '';
  const head = `<div class="tiny muted" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">${l.kind === 'prod' ? 'OKL production report' : 'Engineering\'s report'}</div>`;
  const sep = can && !iss.moved_at && iss.lines.length > 1 ? `<button class="btn btn-ghost btn-sm" data-mi-split="${l.id}" title="Take this line out of the pair: it becomes an issue on its own">Separate</button>` : '';
  const edit = can && !iss.moved_at && l.kind === 'eng' ? `<button class="btn btn-ghost btn-sm" data-mi-edit="${l.id}">Correct</button>` : '';
  const flags = (l.flags || []).length ? `<div class="small" style="color:var(--warn);margin-top:4px">${I.alert} ${(l.flags || []).map(esc).join('<br>')}</div>` : '';
  const body = l.kind === 'prod'
    ? `<div><b>${esc(l.product || '')}</b> · ${esc(l.machine_text || '')}${asset && asset !== l.machine_text ? ` <span class="muted">(${esc(asset)})</span>` : ''}</div>
       <div style="margin-top:2px">${esc(l.problem)} <b>${l.minutes} min</b></div>${l.action ? `<div class="small muted" style="margin-top:2px">Action in the file: ${esc(l.action)}</div>` : ''}`
    : `<div><b>${esc(l.machine_text || '')}</b>${asset && asset !== l.machine_text ? ` <span class="muted">(${esc(asset)})</span>` : ''}: ${esc(l.problem)}</div>
       <div class="small" style="margin-top:2px"><span class="mono">${(l.windows || []).map(w => esc(w.from + '-' + w.to)).join(', ') || 'no times'}</span>
         · <b>${l.minutes != null ? l.minutes : (l.minutes_stated != null ? l.minutes_stated : '?')} min</b>${l.minutes_stated != null && l.minutes != null && Math.abs(l.minutes - l.minutes_stated) > 2 ? ` <span style="color:var(--warn)">(says ${l.minutes_stated})</span>` : ''}
         ${l.status ? ' · ' + esc(l.status) : ''}${l.follow_up ? ' · ' + esc(l.follow_up) : ''}</div>
       ${l.action ? `<div class="small muted" style="margin-top:3px;white-space:pre-wrap">${esc(l.action)}</div>` : ''}`;
  return `<div style="flex:1 1 280px;min-width:0;padding:10px 12px;border:1px solid var(--line-2);border-radius:var(--r-sm);background:var(--surface)">
    <div class="row between" style="gap:6px">${head}<div class="row" style="gap:4px">${edit}${sep}</div></div>
    <div class="small" style="margin-top:4px">${body}</div>${pick}${flags}</div>`;
}

function miChoices(iss){
  const hasEng = iss.lines.some(l => l.kind === 'eng'), out = [];
  if (iss.job_id) out.push('job_fill');
  if (hasEng) out.push('job_new');
  out.push('job_empty', 'keep');
  if (!hasEng) out.push('operator');
  out.push('not_machine');
  return out;
}
function miDecLabel(k, iss){ return k === 'job_fill' && iss.job_id ? 'Fill ' + iss.job_id + '\'s empty fields' : MI_DEC[k]; }
function miJobLine(j){
  const src = { call: 'floor call', stop: 'machine stop', console: 'console job', report: 'from a report', import: 'imported' }[j.source] || j.source;
  return esc(j.job_id) + ' · ' + esc(j.asset_name || j.asset_code || '') + ' · ' + esc(src) + (j.at ? ' ' + esc(prTime(j.at)) : '') + ' · ' + esc(j.status) + (j.what ? ' · ' + esc(String(j.what).slice(0, 50)) : '');
}

function miIssueHtml(iss, d, can){
  const moved = !!iss.moved_at;
  const lines = iss.lines.slice().sort((a, b) => (a.kind === 'prod' ? 0 : 1) - (b.kind === 'prod' ? 0 : 1));
  const hasProd = lines.some(l => l.kind === 'prod'), hasEng = lines.some(l => l.kind === 'eng');
  const name = (lines.find(l => l.asset_name) || {}).asset_name || (lines[0] || {}).machine_text || 'Machine?';
  const kind = hasProd && hasEng ? '<span class="badge b-ok">In both reports</span>'
    : hasProd ? `<span class="badge b-warn">Only in the production report</span> ${oklInfo('Engineering did not report this stop. Often the operator fixed it.\nIt does not become a job unless you choose one. It stays here for the Process Improvement work.')}`
    : `<span class="badge">Only in Engineering's report</span>`;
  let job = '';
  if (iss.job) job = `<div class="small" style="margin-top:8px">${I.check} Linked job: <a href="../engineering/#/jobs/${esc(iss.job.job_id)}" target="_blank" rel="noopener">${miJobLine(iss.job)}</a>
      ${oklInfo('A job that already exists for this machine on this day (a floor call, a stop or a job started in the console).\nOn Move to jobs only its EMPTY fields are filled; nothing in it is overwritten.')}</div>`;
  let ctl = '';
  if (moved) {
    const what = { job_fill: 'Filled ' + (iss.job_id || ''), job_new: 'New job ' + (iss.job_id || ''), job_empty: 'Job ' + (iss.job_id || '') + ' for Engineering to fill',
                   keep: 'Kept here', operator: 'Kept here: the operator fixed it', not_machine: 'Kept here: not a machine issue' }[iss.moved_as] || iss.moved_as;
    ctl = `<div class="small" style="margin-top:8px;color:var(--ok)">&#10003; ${esc(what)}${iss.job_id && iss.moved_as && iss.moved_as.indexOf('job') === 0 ? ` · <a href="../engineering/#/jobs/${esc(iss.job_id)}" target="_blank" rel="noopener">open</a>` : ''}
      <span class="muted">· ${esc(prWhen(iss.moved_at))}${iss.moved_by ? ' by ' + esc(iss.moved_by) : ''}</span></div>`;
  } else if (can) {
    const others = (d.issues || []).filter(o => o.id !== iss.id && !o.moved_at);
    const pairSel = lines.length === 1 && others.length ? `<select class="inp" data-mi-pair="${lines[0].id}" style="padding:5px 8px;max-width:260px"><option value="">Pair with...</option>${
      others.map(o => { const l0 = o.lines[0] || {}; return `<option value="${o.id}">${esc((l0.asset_name || l0.machine_text || '') + ': ' + String(l0.problem || '').slice(0, 40))}</option>`; }).join('')}</select>` : '';
    const asset = (lines.find(l => l.asset) || {}).asset;
    const jobs = (d.jobs || []).filter(j => !(d.issues || []).some(o => o.id !== iss.id && o.job_id === j.job_id));
    const jobsSorted = jobs.slice().sort((a, b) => (b.asset_code === asset) - (a.asset_code === asset));
    const jobSel = `<select class="inp" data-mi-link="${iss.id}" style="padding:5px 8px;max-width:300px"><option value="">${iss.job_id ? 'No job (unlink)' : 'Link an existing job...'}</option>${
      jobsSorted.map(j => `<option value="${esc(j.job_id)}" ${j.job_id === iss.job_id ? 'selected' : ''}>${miJobLine(j)}</option>`).join('')}</select>`;
    const dec = `<select class="inp" data-mi-dec="${iss.id}" style="padding:6px 8px;min-width:250px;font-weight:600">${miChoices(iss).map(k =>
      `<option value="${k}" ${k === iss.effective ? 'selected' : ''}>${esc(miDecLabel(k, iss))}${k === iss.effective && iss.decision === 'auto' ? ' (suggested)' : ''}</option>`).join('')}</select>`;
    ctl = `<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">
      <span class="small strong">What happens:</span> ${dec}
      ${oklInfo('What Move to jobs does with this issue. "(suggested)" is the page\'s own choice: fill the linked job, a new job when Engineering reported it, else keep it here.\nChange it and it stays as you set it.')}
      ${iss.decision !== 'auto' ? `<button class="btn btn-ghost btn-sm" data-mi-dec-auto="${iss.id}">Back to suggested</button>` : ''}</div>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px">${pairSel}${jobs.length || iss.job_id ? jobSel : ''}</div>`;
  } else {
    ctl = `<div class="small" style="margin-top:8px">Will be: <b>${esc(miDecLabel(iss.effective, iss))}</b></div>`;
  }
  return `<div class="card" style="margin-bottom:10px${moved ? ';opacity:.8' : ''}"><div class="card-b">
    <div class="row between" style="gap:8px;flex-wrap:wrap;margin-bottom:8px"><div class="strong" style="font-size:15px">${esc(name)}</div><div>${kind}</div></div>
    <div class="row" style="gap:10px;flex-wrap:wrap;align-items:stretch">${lines.map(l => miLineHtml(l, iss, d, can)).join('')}</div>
    ${job}${ctl}</div></div>`;
}

function miMoveBar(d, can){
  const open = (d.issues || []).filter(i => !i.moved_at);
  if (!open.length || !can) return '';
  const n = k => open.filter(i => i.effective === k).length;
  const parts = [[n('job_new'), 'new job', 'new jobs', ' filled from Engineering\'s report'], [n('job_empty'), 'job', 'jobs', ' for Engineering to fill'],
                 [n('job_fill'), 'job', 'jobs', ' filled (empty fields only)'], [n('keep') + n('operator') + n('not_machine'), 'issue stays', 'issues stay', ' here, no job']]
    .filter(p => p[0]).map(p => '<b>' + p[0] + '</b> ' + (p[0] === 1 ? p[1] : p[2]) + p[3]);
  const noEng = !d.eng ? `<div class="notice warn" style="margin-bottom:10px">${I.alert}<div>Engineering's report is not pasted for this day. You can still move: their entries can be pasted later and moved then.</div></div>` : '';
  const noMachine = open.filter(i => ['job_new', 'job_empty'].includes(i.effective) && !i.lines.some(l => l.asset));
  return `<div class="card" style="margin:14px 0;border-color:var(--brand-100)"><div class="card-b">${noEng}
    <div class="row between" style="gap:12px;flex-wrap:wrap"><div class="small">Move to jobs will make: ${parts.join(', ')}.${noMachine.length ? `<div style="color:var(--danger);margin-top:4px">${noMachine.length} issue${noMachine.length === 1 ? ' needs' : 's need'} the machine chosen first.</div>` : ''}</div>
    <button class="btn btn-primary" id="miMove" ${MI.busy || noMachine.length ? 'disabled' : ''}>Move to jobs</button></div></div></div>`;
}

function viewMachineIssues(){
  if (!MI.loading && ((!MI.data && !MI.err) || (MI.data && Date.now() - (MI.at || 0) > 60000))) miLoad(MI.day);
  const can = miCan();
  const head = pageHead('Daily production report', 'Machine stops from the OKL report and Engineering\'s own report, side by side, before they become Engineering jobs.');
  const tabs = miTabs('/report/issues');
  if (!MI.data) return { title: 'Machine issues', crumb: 'Reports', html: head + tabs + `<div class="card"><div class="card-b">${MI.err
      ? `<div class="notice danger">${I.alert}<div>${esc(MI.err)} <button class="btn btn-ghost btn-sm" id="miRetry">Try again</button></div></div>` : '<div class="small muted">Loading...</div>'}</div></div>`,
    bind: () => { const b = $('#miRetry'); if (b) b.onclick = () => { MI.err = ''; miLoad(MI.day); render(); }; } };
  const days = MI.data.days || [], d = MI.data.day;
  let main;
  if (!d) main = `<div class="card"><div class="card-b">${emptyState('info', 'No report days yet', 'Machine issues start on ' + esc(miDayLabel(MI.data.from)) + '. The days appear once the OKL report for them is in (Report tab > Check mailbox), or when you paste Engineering\'s report.')}</div></div>`
      + (can ? miEngCard({ issues: [], assets: [] }, can) : '');
  else {
    const open = (d.issues || []).filter(i => !i.moved_at), moved = (d.issues || []).filter(i => i.moved_at);
    const top = `<div class="row between" style="gap:10px;flex-wrap:wrap;margin-bottom:10px"><h2 style="margin:0;font-size:18px">${esc(typeof prLong === 'function' ? prLong(d.day) : d.day)}</h2>
      <div class="small muted">${d.report ? 'OKL report in' : '<span style="color:var(--warn)">OKL report not in yet</span>'}${d.processed_at ? ' · moved ' + esc(prWhen(d.processed_at)) + (d.processed_by ? ' by ' + esc(d.processed_by) : '') : ''}</div></div>`;
    const list = open.length ? open.map(i => miIssueHtml(i, d, can)).join('')
      : `<div class="card"><div class="card-b">${emptyState('check', moved.length ? 'Everything on this day is moved' : 'No machine issues on this day',
          moved.length ? 'New lines appear here if the report changes or Engineering\'s report is pasted again.' : (d.report ? 'The OKL report has no machine stops for this day.' : 'Waiting for the OKL report or Engineering\'s report.'))}</div></div>`;
    const movedHtml = moved.length ? `<div style="margin-top:14px"><button class="btn btn-ghost btn-sm" id="miMovedToggle">${MI.showMoved ? 'Hide' : 'Show'} the ${moved.length} moved</button>
      ${MI.showMoved ? `<div style="margin-top:10px">${moved.map(i => miIssueHtml(i, d, can)).join('')}</div>` : ''}</div>` : '';
    main = top + miEngCard(d, can) + `<div class="small strong" style="margin:4px 0 8px">Issues to check (${open.length})</div>` + list + miMoveBar(d, can) + movedHtml;
  }
  return { title: 'Machine issues', crumb: 'Reports', keepScroll: true, html: head + tabs + miHow() + miDayBar(days) + main, bind: miBind };
}

function miEditLine(l){
  const d = MI.data.day;
  openModal({ title: 'Correct Engineering\'s line', sub: l.machine_text + ': ' + l.problem, size: 'wide',
    body: `<div class="grid g2" style="gap:12px">
      <div class="field"><label>Machine</label><select class="inp" id="miEA"><option value="">Choose the machine...</option>${(d.assets || []).map(a => `<option value="${esc(a.code)}" ${a.code === l.asset ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Problem</label><input class="inp" id="miEP" maxlength="300" value="${esc(l.problem)}"></div>
      <div class="field"><label>Times (start-end, a comma between)</label><input class="inp mono" id="miEW" value="${esc((l.windows || []).map(w => w.from + '-' + w.to).join(', '))}" placeholder="09:15-11:53, 13:45-14:10"></div>
      <div class="field"><label>Minutes they wrote</label><input class="inp" id="miEM" inputmode="numeric" maxlength="5" value="${l.minutes_stated == null ? '' : l.minutes_stated}"></div>
      <div class="field"><label>Status</label><input class="inp" id="miES" maxlength="60" value="${esc(l.status || '')}" placeholder="Resolved, Monitoring, Pending"></div>
      <div class="field"><label>Follow-up</label><input class="inp" id="miEF" maxlength="300" value="${esc(l.follow_up || '')}"></div></div>
      <div class="field" style="margin-top:12px"><label>Action taken</label><textarea class="inp" id="miEX" rows="4" maxlength="2000">${esc(l.action || '')}</textarea></div>
      <span class="err-msg hide" data-err="miE"></span>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="miESave">Save</button>`,
    onMount: (w, close) => {
      $('#miESave', w).onclick = async () => {
        const txt = $('#miEW', w).value.trim(), windows = [];
        for (const part of txt ? txt.split(',') : []) {
          const m = part.trim().match(/^(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})$/);
          if (!m) { setErr('miE', 'Write each time as 09:15-11:53.', w); return; }
          windows.push({ from: miTwo(m[1]) + ':' + m[2], to: miTwo(m[3]) + ':' + m[4] });
        }
        const r = await miSave({ op: 'line', line: l.id, asset: $('#miEA', w).value, problem: $('#miEP', w).value, windows,
          minutes_stated: $('#miEM', w).value.trim(), status: $('#miES', w).value, follow_up: $('#miEF', w).value, action: $('#miEX', w).value }, ['Saved']);
        if (r) close();
      };
    } });
}

function miBind(){
  const on = (sel, ev, fn) => $$(sel).forEach(el => { el[ev] = () => fn(el); });
  on('[data-mi-day]', 'onclick', el => { MI.parsed = null; MI.paste = ''; MI.repaste = false; MI.showRaw = false; MI.day = el.dataset.miDay; miLoad(MI.day); });
  const ho = $('#miHowOpen'); if (ho) ho.onclick = () => { MI.howOpen = true; try { localStorage.removeItem('okl.mi.how'); } catch (e) { /* ignore */ } render(); };
  const hc = $('#miHowClose'); if (hc) hc.onclick = () => { MI.howOpen = false; try { localStorage.setItem('okl.mi.how', 'closed'); } catch (e) { /* ignore */ } render(); };
  const ta = $('#miPaste'); if (ta) ta.oninput = () => { MI.paste = ta.value; };
  const rd = $('#miRead'); if (rd) rd.onclick = () => { MI.paste = $('#miPaste').value; if (!MI.paste.trim()) { toast('Nothing to read', 'Paste Engineering\'s report first.', 'warn'); return; } MI.parsed = miParse(MI.paste); render(); };
  const pc = $('#miPasteCancel'); if (pc) pc.onclick = () => { MI.parsed = null; MI.paste = ''; MI.repaste = false; render(); };
  const rp = $('#miRepaste'); if (rp) rp.onclick = () => { MI.parsed = null; MI.paste = ''; MI.repaste = true; render(); };
  const raw = $('#miRaw'); if (raw) raw.onclick = () => { MI.showRaw = !MI.showRaw; render(); };
  const ps = $('#miPasteSave'); if (ps) ps.onclick = async () => {
    const p = MI.parsed, day = p.date || MI.day;
    if (day !== MI.day && !(MI.data.days || []).some(x => x.day === day)) {
      if (!await confirmDialog('Save to ' + miDayLabel(day) + '?', 'The report is dated ' + esc(miDayLabel(day)) + '. The OKL report for that day is not in yet; its stops will join when it comes.', 'Save', 'primary')) return;
    }
    MI.day = day;
    const r = await miSave({ op: 'paste', day, raw: MI.paste, prepared_by: p.prepared_by, pending: p.pending, total_stated: p.total_stated,
      entries: p.entries.map(e => ({ machine: e.machine, problem: e.problem, windows: e.windows, minutes_stated: e.minutes_stated, action: e.action, status: e.status, follow_up: e.follow_up, flags: e.flags })) },
      ['Engineering\'s report saved', p.entries.length + ' machines. Check each issue below.']);
    if (r) { MI.parsed = null; MI.paste = ''; MI.repaste = false; }
  };
  on('[data-mi-asset]', 'onchange', el => { if (!el.value) return; const id = +el.dataset.miAsset, rem = $(`[data-mi-remember="${id}"]`);
    miSave({ op: 'line', line: id, asset: el.value, remember: !!(rem && rem.checked) }, ['Machine chosen']); });
  on('[data-mi-dec]', 'onchange', el => miSave({ op: 'decide', issue: +el.dataset.miDec, decision: el.value }));
  on('[data-mi-dec-auto]', 'onclick', el => miSave({ op: 'decide', issue: +el.dataset.miDecAuto, decision: 'auto' }));
  on('[data-mi-pair]', 'onchange', el => { if (el.value) miSave({ op: 'pair', line: +el.dataset.miPair, issue: +el.value }, ['Paired']); });
  on('[data-mi-split]', 'onclick', el => miSave({ op: 'pair', line: +el.dataset.miSplit, issue: null }, ['Separated', 'It is an issue on its own now.']));
  on('[data-mi-link]', 'onchange', el => miSave({ op: 'link', issue: +el.dataset.miLink, job: el.value || null }, [el.value ? 'Job linked' : 'Job unlinked']));
  on('[data-mi-edit]', 'onclick', el => { const id = +el.dataset.miEdit; for (const i of MI.data.day.issues) { const l = i.lines.find(x => x.id === id); if (l) { miEditLine(l); return; } } });
  const mt = $('#miMovedToggle'); if (mt) mt.onclick = () => { MI.showMoved = !MI.showMoved; render(); };
  const mv = $('#miMove'); if (mv) mv.onclick = async () => {
    const d = MI.data.day, open = d.issues.filter(i => !i.moved_at);
    const list = open.map(i => { const l0 = i.lines[0] || {}; return '<li>' + esc((l0.asset_name || l0.machine_text || '') + ': ' + String(l0.problem || '').slice(0, 50)) + ' &rarr; <b>' + esc(miDecLabel(i.effective, i)) + '</b></li>'; }).join('');
    if (!await confirmDialog('Move ' + miDayLabel(d.day) + ' to jobs?', '<ul class="small" style="margin:0;padding-left:18px;line-height:1.6">' + list + '</ul><div class="small muted" style="margin-top:8px">The jobs appear in Engineering at once. Moved issues cannot be changed here afterwards.</div>', 'Move to jobs', 'primary')) return;
    const r = await miSave({ op: 'move' });
    if (r && r.moved) { const m = r.moved; toast('Moved to jobs', (m.made || []).length + ' new, ' + (m.filled || []).length + ' filled, ' + (m.kept || 0) + ' kept here.', 'ok', 6000); }
  };
}

route('/report/issues', viewMachineIssues);
}
