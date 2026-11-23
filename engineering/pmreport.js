"use strict";
/* ============================================================
   PM report (23 Nov 2026): a finished preventive maintenance job as the paper form OKL/ENG/002/F1:00, simpler.
   One result column (OK / Not done) instead of Dr, Cl, CC, Oil, CF; a remark only where something was not done or a note
   was written; start, finish and total from the job; signed by the people who did the task (the job's technicians, else
   whoever closed it), with the time it was closed in the console. Opens as its own A4 page: Print, or Save as PDF.
   pmReportHtml(job, asset) is plain (also used by workflow/tests/pm_report_test.js); pmReportOpen(id) is the button.
   ============================================================ */
const PMR_REASONS = { no_material: 'Material not available', no_time: 'No time (production running)', not_needed: 'Not needed this time', other: 'Other' };
const PMR_SECTIONS = { 'Mechanics': 'Mechanics', 'Electric & air': 'Electric & Air Compressor', 'Auxiliary': 'Auxiliary' };
const PMR_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function pmrEsc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
// a moment in Lagos time: { date: '18/06/2026', time: '11:00' }
function pmrLagos(ts){
  if (!ts) return { date: '', time: '' };
  const d = new Date(ts);
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(d).reduce((o, x) => { o[x.type] = x.value; return o; }, {});
  return { date: p.day + '/' + p.month + '/' + p.year, time: p.hour + ':' + p.minute };
}
function pmrTotal(a, b){
  if (!a || !b) return '';
  const m = Math.round((new Date(b) - new Date(a)) / 60000);
  if (!(m >= 0)) return '';
  const h = Math.floor(m / 60), r = m % 60;
  return (h ? h + (h === 1 ? ' hr ' : ' hrs ') : '') + r + ' min' + (r === 1 ? '' : 's');
}

function pmReportHtml(j, asset, opts){
  opts = opts || {};
  asset = asset || {};
  const checks = j.checks || [];
  const sections = [];
  for (const c of checks) {
    let s = sections.find(x => x.name === c.section);
    if (!s) sections.push(s = { name: c.section, items: [] });
    s.items.push(c);
  }
  const done = checks.filter(c => c.result === 'done').length, notDone = checks.filter(c => c.result === 'not_done').length, blank = checks.length - done - notDone;
  const rows = sections.map((s, k) => `<tr class="sec"><td>${PMR_ROMAN[k] || k + 1}</td><td colspan="4">${pmrEsc(PMR_SECTIONS[s.name] || s.name)}</td></tr>`
    + s.items.map((c, n) => {
      const res = c.result === 'done' ? '<span class="ok">OK</span>' : c.result === 'not_done' ? '<span class="nd">Not done</span>' : '<span class="nd">-</span>';
      const rem = c.result === 'not_done' ? [PMR_REASONS[c.reason] || c.reason, c.note].filter(Boolean).join(': ') : (c.note || '');
      return `<tr${c.result === 'not_done' ? ' class="bad"' : ''}><td class="n">${n + 1}</td><td>${pmrEsc(c.item)}</td><td class="std">${pmrEsc(c.standard || '')}</td><td class="res">${res}</td><td>${pmrEsc(rem)}</td></tr>`;
    }).join('')).join('');
  const summary = !checks.length ? 'No checklist was recorded for this PM.'
    : notDone || blank ? `${done} of ${checks.length} items OK; ${notDone ? notDone + ' not done' : ''}${notDone && blank ? ', ' : ''}${blank ? blank + ' not marked' : ''} (see the remarks).`
    : `All ${checks.length} items OK.`;
  const st = pmrLagos(j.started_at), fi = pmrLagos(j.finished_at);
  const people = (j.technicians || []).map(t => t.name).filter(Boolean);
  const signers = people.length ? people : (j.closed_by ? [j.closed_by] : []);
  const other = j.work_done && j.work_done !== 'PM checklist completed.' ? j.work_done : '';
  const parts = (j.parts || []).filter(p => p.status !== 'cancelled' && !p.reversed_by);
  const made = pmrLagos(opts.now || new Date());
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>PM report ${pmrEsc(j.job_id)} - ${pmrEsc(j.asset_name || j.machine_name || '')}</title>
<style>
@page{size:A4;margin:12mm}
*{box-sizing:border-box}
body{font:11.5px/1.35 Arial,Helvetica,sans-serif;color:#1d2329;margin:0;padding:16px;background:#f3f4f2}
.sheet{max-width:190mm;margin:0 auto;background:#fff;padding:14px 16px;border:1px solid #c9cdc9}
.bar{display:flex;gap:8px;justify-content:flex-end;max-width:190mm;margin:0 auto 10px}
.bar button{font:600 13px Arial,sans-serif;padding:8px 14px;border-radius:6px;border:1px solid #c9cdc9;background:#fff;cursor:pointer}
.bar button.p{background:#ED6B1F;border-color:#ED6B1F;color:#fff}
.head{display:flex;align-items:center;gap:12px;border:1.5px solid #333;padding:6px 10px}
.head img{height:44px}
.head .co{font-size:11px;line-height:1.3}
.head h1{flex:1;text-align:center;font-size:17px;letter-spacing:.04em;margin:0;background:#e4e6e4;padding:6px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:2px 18px;border:1.5px solid #333;border-top:none;padding:8px 10px}
.meta div{display:flex;gap:6px}.meta b{min-width:92px;display:inline-block}
.meta div.form{grid-column:1/-1;justify-content:flex-end;font-size:10.5px;color:#444}
table{width:100%;border-collapse:collapse;margin-top:8px}
th,td{border:1px solid #555;padding:4px 6px;vertical-align:top;text-align:left}
th{background:#e4e6e4;font-size:11px}
tr.sec td{background:#f1f2f0;font-weight:700}
td.n{width:28px;text-align:center}td.res{width:74px;text-align:center;white-space:nowrap}td.std{color:#333;width:38%}
.ok{font-weight:700;color:#1d6b35}.nd{font-weight:700;color:#b3261e}
tr.bad td{background:#fdf1ef}
.sum{margin-top:6px;font-weight:700}
.box{display:grid;grid-template-columns:1.1fr 1fr;gap:10px;margin-top:10px}
.box table{margin-top:0}
.box td{height:24px}
.sig td{height:40px}
.foot{margin-top:10px;font-size:10px;color:#555}
@media print{body{background:#fff;padding:0}.sheet{border:none;padding:0;max-width:none}.bar{display:none}tr{page-break-inside:avoid}}
</style></head><body>
<div class="bar"><button onclick="window.close()">Close</button><button class="p" onclick="window.print()">Print / Save as PDF</button></div>
<div class="sheet">
  <div class="head">${opts.logo ? `<img src="${pmrEsc(opts.logo)}" alt="">` : ''}<div class="co">Orange Kalbe Ltd<br>Engineering Dept.</div><h1>PREVENTIVE MAINTENANCE REPORT</h1></div>
  <div class="meta">
    <div><b>Machine name</b>: ${pmrEsc(j.asset_name || j.machine_name || j.asset || '')}</div>
    <div><b>PM date</b>: ${pmrEsc(fi.date || st.date)}</div>
    <div><b>Machine no.</b>: ${pmrEsc(asset.eq_no || j.asset || '')}</div>
    <div><b>Job no.</b>: ${pmrEsc(j.job_id)}</div>
    <div><b>Location</b>: ${pmrEsc(asset.area || j.area || '')}</div>
    <div><b>Status</b>: ${j.status === 'done' ? 'Finished' : 'Not finished'}</div>
    <div class="form">OKL/ENG/002/F1:00</div>
  </div>
  <table><thead><tr><th>No.</th><th>Item check</th><th>Standard</th><th>Result</th><th>Remarks</th></tr></thead><tbody>${rows || '<tr><td colspan="5">No checklist items.</td></tr>'}</tbody></table>
  <div class="sum">${pmrEsc(summary)}</div>
  ${other ? `<div style="margin-top:6px"><b>Note:</b> ${pmrEsc(other)}</div>` : ''}
  ${parts.length ? `<div style="margin-top:6px"><b>Parts changed:</b> ${parts.map(p => pmrEsc(p.sku + ' ' + (p.description || '') + ' x ' + p.qty)).join('; ')}</div>` : ''}
  <div class="box">
    <table><tr><th colspan="2">Start</th><th colspan="2">Finish</th></tr>
      <tr><th>Date</th><th>Time</th><th>Date</th><th>Time</th></tr>
      <tr><td>${pmrEsc(st.date)}</td><td>${pmrEsc(st.time)}</td><td>${pmrEsc(fi.date)}</td><td>${pmrEsc(fi.time)}</td></tr>
      <tr><th>Total</th><td colspan="3"><b>${pmrEsc(pmrTotal(j.started_at, j.finished_at))}</b></td></tr></table>
    <table class="sig"><tr><th>Done by (technician${signers.length === 1 ? '' : 's'})</th></tr>
      <tr><td>${signers.length ? signers.map(pmrEsc).join('<br>') : '<span style="color:#b3261e">No one recorded on the job</span>'}
        ${j.finished_at && signers.length ? `<div style="font-size:10px;color:#555;margin-top:4px">Signed in the OKL console when the job was closed, ${pmrEsc(fi.date)} ${pmrEsc(fi.time)}${j.closed_by && people.length ? ', closed by ' + pmrEsc(j.closed_by) : ''}.</div>` : ''}</td></tr></table>
  </div>
  <div class="foot">Printed from the OKL console on ${pmrEsc(made.date)} ${pmrEsc(made.time)}. The record is job ${pmrEsc(j.job_id)} in Engineering &gt; Calls and jobs; this page is a copy of it.</div>
</div></body></html>`;
}

function pmReportOpen(id){
  const j = (typeof JB !== 'undefined' && JB.one) ? JB.one[id] : null;
  if (!j) return;
  const w = window.open('', '_blank');
  if (!w) { toast('The report did not open', 'Allow pop-ups for this site, then try again.', 'warn', 6000); return; }
  w.document.open();
  w.document.write(pmReportHtml(j, typeof eqByCode === 'function' ? eqByCode(j.asset) : null, { logo: new URL('../logo.png', location.href).href }));
  w.document.close();
}

if (typeof module !== 'undefined' && module.exports) module.exports = { pmReportHtml, pmrLagos, pmrTotal };
