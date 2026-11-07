/* ============================================================
   Department requests (042): Quality Control and Quality Assurance raise procurement requests and record overtime
   from the console. Each page first asks the department; the submission goes into the SAME pipelines as the old
   links (procurement intake: approvals by the department manager then the plant manager, e-mails, Procurement sheet;
   overtime: HR's overtime records), so nothing downstream changes. Page access: "qsync.dept" (Users console).
   ============================================================ */
const DEPT_CATEGORIES = ['Routine', 'Non Routine', 'Consumable', 'Equipment', 'Fabrication', 'Spare part', 'Packaging Material', 'Building Materials', 'Safety Equipment', 'Other'];
const DEPT_UNITS = ['Pieces', 'Kg', 'Bags', 'Cans', 'Packs', 'Dozen', 'Sheets', 'Lengths', 'Rooms', 'Each'];
const OT_DAY = { weekday: 'Weekday', weekend: 'Weekend', public_holiday: 'Public holiday' };
const OT_REASON = { duplicate: 'already has overtime recorded for that day', not_in_department: 'belongs to another department', not_found: 'is not an active employee on record',
                    bad_time: 'has a time problem (end must be after start)', repeated: 'was ticked in more than one group' };
let deptState = { dept: '', proc: null, ot: null, busy: false };

function deptData(){ return labGet('/dept'); }
function lagosToday(){ return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' }); }
function addDaysIso(iso, n){ const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function deptPick(d, onchange){
  return `<div class="field" style="max-width:360px"><label for="dpDept">Department</label>
    <select class="inp" id="dpDept" onchange="${onchange}"><option value="">Choose your department...</option>
      ${(d.departments || []).map(x => `<option ${deptState.dept === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>`;
}

/* ---------------- Procurement request ---------------- */
function procBlankItem(){ return { material: '', itemDetail: '', category: '', purpose: '', quantity: '', unit: '' }; }
function procReadForm(){
  const P = deptState.proc; if (!P) return;
  const v = id => { const el = $('#' + id); return el ? el.value : undefined; };
  if (v('pqName') !== undefined) P.name = v('pqName');
  if (v('pqDate') !== undefined) P.requirementDate = v('pqDate');
  P.items.forEach((it, i) => ['material', 'itemDetail', 'category', 'purpose', 'quantity', 'unit'].forEach(k => { const x = v(`pq_${i}_${k}`); if (x !== undefined) it[k] = x; }));
}
function procSetDept(x){ procReadForm(); deptState.dept = x; deptState.proc.name = ''; render(); }
function procAdd(){ procReadForm(); deptState.proc.items.push(procBlankItem()); render(); }
function procRemove(i){ procReadForm(); deptState.proc.items.splice(i, 1); if (!deptState.proc.items.length) deptState.proc.items.push(procBlankItem()); render(); }
function viewDeptProcurement(){
  const d = deptData();
  if (!d) return labWait('Procurement request', 'Department requests');
  if (d.error) return labFail('Procurement request', 'Department requests', d.error);
  if (!deptState.proc) deptState.proc = { name: '', requirementDate: '', items: [procBlankItem()], result: null };
  const P = deptState.proc, dept = deptState.dept;
  const people = (d.requesters || {})[dept] || [];
  if (dept && !P.name && people.length) P.name = people.find(n => String(d.me || '').toLowerCase().includes(String(n).toLowerCase())) || (people.length === 1 ? people[0] : '');
  const recent = (d.procurement || []).filter(x => !dept || x.department === dept);
  const opt = (list, sel) => list.map(x => `<option ${sel === x ? 'selected' : ''}>${esc(x)}</option>`).join('');
  const itemCard = (it, i) => `<div class="card" style="margin-bottom:12px"><div class="card-h"><h3>Item ${i + 1}</h3>
      ${P.items.length > 1 ? `<button class="btn btn-ghost btn-sm" onclick="procRemove(${i})">${I.x} Remove</button>` : ''}</div><div class="card-b">
      <div class="grid g2"><div class="field"><label for="pq_${i}_material">Name of material / part</label><input class="inp" id="pq_${i}_material" value="${esc(it.material)}" placeholder="e.g. HPLC grade methanol"></div>
        <div class="field"><label for="pq_${i}_category">Purchase category</label><select class="inp" id="pq_${i}_category"><option value="">Select...</option>${opt(DEPT_CATEGORIES, it.category)}</select></div></div>
      <div class="field"><label for="pq_${i}_itemDetail">Item detail (specification and brand)</label><input class="inp" id="pq_${i}_itemDetail" value="${esc(it.itemDetail)}"></div>
      <div class="field"><label for="pq_${i}_purpose">Purpose</label><input class="inp" id="pq_${i}_purpose" value="${esc(it.purpose)}" placeholder="What is this needed for?"></div>
      <div class="grid g2"><div class="field"><label for="pq_${i}_quantity">Quantity</label><input class="inp" id="pq_${i}_quantity" type="number" min="1" step="1" value="${esc(it.quantity)}"></div>
        <div class="field"><label for="pq_${i}_unit">Unit</label><select class="inp" id="pq_${i}_unit"><option value="">Select...</option>${opt(DEPT_UNITS, it.unit)}</select></div></div></div></div>`;
  const form = !dept ? `<div class="notice">${I.info} Choose the department first: the request goes to that department's manager, then the plant manager.</div>`
    : P.result ? `<div class="card"><div class="card-b"><h3 style="margin-top:0">${I.check} Request sent</h3><p>${esc(P.result)}</p>
        <p class="small muted">The ${esc(dept)} manager has been e-mailed to approve it; you will hear by e-mail when it is decided.</p>
        <button class="btn btn-primary" onclick="deptState.proc=null;render()">Raise another request</button></div></div>`
    : `<div class="card" style="margin-bottom:12px"><div class="card-b"><div class="grid g2">
        <div class="field"><label for="pqName">Requested by</label>${people.length
          ? `<select class="inp" id="pqName"><option value="">Choose...</option>${opt(people, P.name)}</select>`
          : `<div class="small" style="color:var(--danger)">No requester is set up for ${esc(dept)} yet. An admin adds requesters in the procurement settings.</div>`}</div>
        <div class="field"><label for="pqDate">Needed by</label><input class="inp" id="pqDate" type="date" min="${lagosToday()}" value="${esc(P.requirementDate)}"></div></div></div></div>
      ${P.items.map(itemCard).join('')}
      <div class="row" style="gap:8px;margin-bottom:8px"><button class="btn btn-ghost" onclick="procAdd()">${I.plus} Add another item</button>
        <button class="btn btn-primary" id="pqSend" onclick="procSubmit()" ${deptState.busy ? 'disabled' : ''}>${deptState.busy ? 'Sending...' : 'Send for approval'}</button></div>
      <div class="err-msg" id="pqErr" style="color:var(--danger)">${esc(P.error || '')}</div>`;
  return {
    title: 'Procurement request', crumb: 'Department requests',
    html: `${pageHead('Procurement request', 'Ask for materials, parts or services for Quality Control or Quality Assurance. The same approval as the procurement link: your manager, then the plant manager.',
              `<button class="btn btn-ghost" onclick="labRefresh()">${I.play} Refresh</button>`)}
      ${deptPick(d, 'procSetDept(this.value)')}${form}
      <div class="card" style="margin-top:16px"><div class="card-h"><div><h3>Recent requests${dept ? ' - ' + esc(dept) : ''}</h3><div class="sub">The last 120 days</div></div></div>
      ${recent.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Raised</th><th>Batch</th><th>Item</th><th>Quantity</th><th>Requested by</th><th>Needed by</th><th>Status</th></tr></thead><tbody>
        ${recent.map(x => `<tr><td class="small">${fmtDateTime(x.at)}</td><td class="mono small">${esc(x.batch_id || '')}</td>
          <td><div class="strong">${esc(x.material || '')}</div><div class="tiny muted">${esc([x.category, x.purpose].filter(Boolean).join(' - '))}</div></td>
          <td>${esc(x.quantity == null ? '' : x.quantity)} ${esc(x.unit || '')}</td><td class="small">${esc(x.requestor || '')}</td><td class="small">${esc(x.needed_by || '')}</td>
          <td><span class="chip">${esc(x.status || x.review || 'Waiting for approval')}</span>${x.remarks && x.remarks !== x.batch_id ? `<div class="tiny muted">${esc(x.remarks)}</div>` : ''}</td></tr>`).join('')}
        </tbody></table></div>` : `<div class="card-b">${emptyState('box', 'No requests yet', 'Requests raised here or through the procurement link show up here.')}</div>`}</div>`
  };
}
async function procSubmit(){
  procReadForm();
  const P = deptState.proc, dept = deptState.dept;
  const bad = m => { P.error = m; render(); };
  if (!P.name) return bad('Choose who is requesting it.');
  if (!P.requirementDate) return bad('Choose the date it is needed by.');
  for (let i = 0; i < P.items.length; i++){
    const it = P.items[i];
    if (!it.material.trim()) return bad(`Item ${i + 1}: enter the material or part.`);
    if (!it.category) return bad(`Item ${i + 1}: choose the purchase category.`);
    if (!it.purpose.trim()) return bad(`Item ${i + 1}: enter the purpose.`);
    if (!(Number(it.quantity) > 0)) return bad(`Item ${i + 1}: the quantity must be more than 0.`);
    if (!it.unit) return bad(`Item ${i + 1}: choose the unit.`);
  }
  P.error = ''; deptState.busy = true; render();
  try {
    const res = await fetch(API_BASE + '/webhook/procurement/intake?flow=dept', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: P.name, department: dept, requirementDate: P.requirementDate,
        items: P.items.map(it => ({ material: it.material.trim(), itemDetail: it.itemDetail.trim(), category: it.category, purpose: it.purpose.trim(), quantity: it.quantity, unit: it.unit })) }) });
    const text = await res.text();
    if (!res.ok) throw new Error('The request was not accepted (' + res.status + '). ' + text.slice(0, 200));
    P.result = text || 'Your request was received.'; toast('Request sent', esc(dept), 'ok'); labCache = {};
  } catch (e) { P.error = /fetch/i.test(e.message) ? 'Could not reach the server. Check your connection and try again.' : e.message; }
  finally { deptState.busy = false; render(); }
}

/* ---------------- Overtime ---------------- */
function otBlankGroup(){ return { start: '', end: '', duty: '', sel: {} }; }
function otMinutes(t){ const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; }
function otDuration(a, b){ const x = otMinutes(a), y = otMinutes(b); if (x == null || y == null) return null; return y > x ? Math.round((y - x) / 60 * 100) / 100 : -1; }
function otReadForm(){
  const O = deptState.ot; if (!O) return;
  const v = id => { const el = $('#' + id); return el ? el.value : undefined; };
  if (v('otDate') !== undefined) O.date = v('otDate');
  const h = $('#otHol'); if (h) O.holiday = h.checked;
  O.groups.forEach((g, i) => { ['start', 'end', 'duty'].forEach(k => { const x = v(`ot_${i}_${k}`); if (x !== undefined) g[k] = x; });
    const boxes = $$(`[data-otg="${i}"]`); if (boxes.length) { g.sel = {}; boxes.forEach(b => { if (b.checked) g.sel[b.dataset.pid] = true; }); } });
}
function otSetDept(x){ otReadForm(); deptState.dept = x; deptState.ot.groups = [otBlankGroup()]; render(); }
function otAddGroup(){ otReadForm(); deptState.ot.groups.push(otBlankGroup()); render(); }
function otRemoveGroup(i){ otReadForm(); deptState.ot.groups.splice(i, 1); if (!deptState.ot.groups.length) deptState.ot.groups.push(otBlankGroup()); render(); }
function otTick(){ otReadForm(); render(); }
function viewDeptOvertime(){
  const d = deptData();
  if (!d) return labWait('Overtime', 'Department requests');
  if (d.error) return labFail('Overtime', 'Department requests', d.error);
  if (!deptState.ot) deptState.ot = { date: lagosToday(), holiday: false, groups: [otBlankGroup()], result: null };
  const O = deptState.ot, dept = deptState.dept, people = (d.roster || {})[dept] || [];
  const owner = (pid, gi) => { const k = O.groups.findIndex((g, j) => j !== gi && g.sel[pid]); return k < 0 ? 0 : k + 1; };
  const groupCard = (g, gi) => { const h = otDuration(g.start, g.end);
    return `<div class="card" style="margin-bottom:12px"><div class="card-h"><h3>Group ${gi + 1}</h3>${O.groups.length > 1 ? `<button class="btn btn-ghost btn-sm" onclick="otRemoveGroup(${gi})">${I.x} Remove group</button>` : ''}</div><div class="card-b">
      <div class="grid g3"><div class="field"><label for="ot_${gi}_start">Start time</label><input class="inp" type="time" id="ot_${gi}_start" value="${esc(g.start)}" onchange="otTick()"></div>
        <div class="field"><label for="ot_${gi}_end">End time</label><input class="inp" type="time" id="ot_${gi}_end" value="${esc(g.end)}" onchange="otTick()"></div>
        <div class="field"><label>Duration</label><div class="small" style="padding-top:9px;${h === -1 ? 'color:var(--danger)' : ''}">${h == null ? 'Set start and end' : h === -1 ? 'End must be after start' : h + ' h each'}</div></div></div>
      <div class="field"><label for="ot_${gi}_duty">Duty (optional)</label><input class="inp" id="ot_${gi}_duty" value="${esc(g.duty)}" placeholder="e.g. stability testing"></div>
      <div class="sec-title">Who worked (${Object.keys(g.sel).length} ticked)</div>
      <div style="max-height:300px;overflow:auto;border:1px solid var(--line-2);border-radius:8px">
      ${people.length ? people.map(p => { const o = owner(p.enroll_id, gi);
        return `<label style="display:flex;gap:10px;align-items:center;padding:8px 12px;border-bottom:1px solid var(--line-2);${o ? 'opacity:.45' : ''}">
          <input type="checkbox" data-otg="${gi}" data-pid="${esc(p.enroll_id)}" ${g.sel[p.enroll_id] ? 'checked' : ''} ${o ? 'disabled' : ''} onchange="otTick()">
          <span><span class="strong">${esc(p.name)}</span> <span class="tiny muted">${esc(p.role || p.employment_type || '')}</span></span>${o ? `<span class="tiny" style="margin-left:auto">in group ${o}</span>` : ''}</label>`; }).join('')
        : `<div class="card-b small muted">No active staff are listed for ${esc(dept)}. HR keeps the staff list.</div>`}</div></div></div>`; };
  const ticked = O.groups.reduce((n, g) => n + Object.keys(g.sel).length, 0);
  const total = O.groups.reduce((n, g) => { const h = otDuration(g.start, g.end); return n + (h > 0 ? h * Object.keys(g.sel).length : 0); }, 0);
  const dow = O.date ? new Date(O.date + 'T12:00:00Z').getUTCDay() : null;
  const dayType = !O.date ? '' : O.holiday ? 'public_holiday' : (dow === 0 || dow === 6) ? 'weekend' : 'weekday';
  const recent = (d.overtime || []).filter(x => !dept || x.department === dept);
  const form = !dept ? `<div class="notice">${I.info} Choose the department first: its staff list appears here.</div>`
    : O.result ? `<div class="card"><div class="card-b">${O.result}<button class="btn btn-primary" onclick="deptState.ot=null;render()">Record more overtime</button></div></div>`
    : `<div class="card" style="margin-bottom:12px"><div class="card-b"><div class="grid g3">
        <div class="field"><label for="otDate">Date</label><input class="inp" type="date" id="otDate" min="${addDaysIso(lagosToday(), -31)}" max="${lagosToday()}" value="${esc(O.date)}" onchange="otTick()"></div>
        <div class="field"><label>Submitted by</label><div class="small" style="padding-top:9px">${esc(d.me || '')}</div></div>
        <div class="field"><label><input type="checkbox" id="otHol" ${O.holiday ? 'checked' : ''} onchange="otTick()"> The date is a public holiday</label>
          <div class="small muted">${dayType ? 'Recorded as <b>' + OT_DAY[dayType] + '</b> overtime' : ''}</div></div></div></div></div>
      ${O.groups.map(groupCard).join('')}
      <div class="row" style="gap:8px;align-items:center"><button class="btn btn-ghost" onclick="otAddGroup()">${I.plus} Another group (different times)</button>
        <span class="small" style="margin-left:auto">${ticked ? `${ticked} ${ticked === 1 ? 'person' : 'people'}, ${Math.round(total * 100) / 100} h in total` : 'Nothing ticked yet'}</span>
        <button class="btn btn-primary" onclick="otSubmit()" ${deptState.busy ? 'disabled' : ''}>${deptState.busy ? 'Saving...' : 'Submit overtime'}</button></div>
      <div class="err-msg" style="color:var(--danger);margin-top:6px">${esc(O.error || '')}</div>`;
  return {
    title: 'Overtime', crumb: 'Department requests',
    html: `${pageHead('Overtime', 'Record overtime for Quality Control or Quality Assurance staff. It goes into the same overtime records HR uses for pay.',
              `<button class="btn btn-ghost" onclick="labRefresh()">${I.play} Refresh</button>`)}
      ${deptPick(d, 'otSetDept(this.value)')}${form}
      <div class="card" style="margin-top:16px"><div class="card-h"><div><h3>Recent overtime${dept ? ' - ' + esc(dept) : ''}</h3><div class="sub">The last 60 days</div></div></div>
      ${recent.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>Name</th><th>Time</th><th>Hours</th><th>Day</th><th>Submitted by</th><th>Status</th></tr></thead><tbody>
        ${recent.map(x => `<tr><td class="small">${esc(x.date)}</td><td class="strong">${esc(x.name)}</td><td class="small">${esc(String(x.start || '').slice(0, 5))} - ${esc(String(x.end || '').slice(0, 5))}</td>
          <td>${esc(x.hours)}</td><td class="small">${esc(OT_DAY[x.day_type] || x.day_type || '')}</td><td class="small">${esc(x.submitted_by || '')}</td><td><span class="chip">${esc(x.status || '')}</span></td></tr>`).join('')}
        </tbody></table></div>` : `<div class="card-b">${emptyState('clock', 'No overtime yet', 'Overtime recorded here or through the overtime link shows up here.')}</div>`}</div>`
  };
}
async function otSubmit(){
  otReadForm();
  const O = deptState.ot, dept = deptState.dept, d = deptData() || {};
  const bad = m => { O.error = m; render(); };
  if (!O.date) return bad('Pick the date.');
  if (O.date > lagosToday()) return bad('The date cannot be in the future.');
  if (O.date < addDaysIso(lagosToday(), -31)) return bad('The date is more than 31 days ago.');
  for (let i = 0; i < O.groups.length; i++){
    const h = otDuration(O.groups[i].start, O.groups[i].end);
    if (h == null) return bad(`Group ${i + 1}: set the start and end time.`);
    if (h === -1) return bad(`Group ${i + 1}: the end must be after the start.`);
    if (!Object.keys(O.groups[i].sel).length) return bad(`Group ${i + 1}: tick at least one person (or remove the group).`);
  }
  O.error = ''; deptState.busy = true; render();
  try {
    const res = await fetch(API_BASE + '/webhook/employees/overtime-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: dept, date: O.date, holiday: !!O.holiday, submitted_by: d.me || '',
        groups: O.groups.map(g => ({ start: g.start, end: g.end, duty: g.duty, enroll_ids: Object.keys(g.sel) })) }) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok && !(j && j.results)) throw new Error((j && j.error) || 'Could not save. Please try again.');
    const ok = (j.results || []).filter(r => r.result === 'ok'), skipped = (j.results || []).filter(r => r.result !== 'ok');
    O.result = `<h3 style="margin-top:0">${ok.length ? I.check + ' Overtime recorded' : 'Nothing was saved'}</h3>
      ${ok.length ? `<p>${ok.length} ${ok.length === 1 ? 'person' : 'people'} saved for ${esc(O.date)}${ok[0].day_type ? ' (' + esc(OT_DAY[ok[0].day_type] || ok[0].day_type) + ')' : ''}:</p>
        <ul>${ok.map(r => `<li>${esc(r.name)} - ${esc(r.hours)} h</li>`).join('')}</ul>` : ''}
      ${skipped.length ? `<p style="color:var(--danger)">Not saved:</p><ul>${skipped.map(r => `<li>${esc(r.name || r.enroll_id)} ${esc(OT_REASON[r.result] || r.result)}</li>`).join('')}</ul>` : ''}`;
    if (ok.length) toast('Overtime recorded', esc(dept), 'ok');
    labCache = {};
  } catch (e) { O.error = /fetch/i.test(e.message) ? 'Could not reach the server. Check your connection and try again.' : e.message; }
  finally { deptState.busy = false; render(); }
}

route('/dept/procurement', () => viewDeptProcurement());
route('/dept/overtime', () => viewDeptOvertime());

/* ============================================================
   How to use (#/help): the short version of each task, for the people doing it. Update it with every feature people
   will notice (rule of 7 Nov 2026). One card per task, steps in the order they are done, plain words.
   ============================================================ */
const QSYNC_HELP = [
  ['inbox', 'What waits for you', [
    'An orange number on the menu (QC inbox, My analyses, OOS log, Lab master data) is how many things wait for <b>you</b>.',
    'Open that page: the tab with the orange number is where they are.',
    'The number goes down by itself when you have acted.']],
  ['doc', 'IPQA: fill the in-process sheet', [
    'Open the link from the WhatsApp or e-mail.',
    'Enter the sample quantity, the tests QC must do, then each check.',
    'A check marked <b>optional</b> (e.g. Mintacid pH while the probe is faulty) may be left blank: it is saved as "Not tested".',
    'Pick your name, enter your password, <b>Submit</b>. The QA Supervisor is told.']],
  ['check', 'QA Supervisor: review an IPQA sheet', [
    'The e-mail now shows every check: the specification, what IPQA recorded (each reading too) and PASS / FAIL.',
    'Tap <b>Review and Approve</b>, look at the same table, then <b>Approve</b>, or <b>Reject</b> with a comment to send it back to IPQA.']],
  ['inbox', 'QC inbox: samples and tests', [
    'QC inbox is for samples only. <b>Waiting for receipt</b>: the QC Supervisor taps <b>Receive</b> and assigns the tests to analysts.',
    'Analysts work in <b>My analyses</b>; the QC Supervisor checks the worksheets; the QC Manager decides; the QA Manager acknowledges.']],
  ['box', 'Change a product\'s IPQA checks', [
    'Lab master data > <b>Products and specs</b> (first tab). Tap the product.',
    'Change limits or make a check optional: <b>Request change</b> on that check. Remove it: <b>Remove</b>. New check: <b>Add a check</b>.',
    'Say why, enter your password. A QC Supervisor or QA Supervisor starts it.',
    'The QC Manager reviews, then the QA Manager approves (Lab master data > <b>Changes</b>). The IPQA sheet changes only after that.']],
  ['settings', 'Method templates and working standards', [
    'Lab master data > <b>Method templates</b>: a QC or QA Supervisor drafts (one template per API), then <b>Send for approval</b>.',
    'The QC Manager approves it or returns it with a reason. Working standards: same, on their tab.']],
  ['users', 'Relievers (someone away)', [
    'Administration > <b>Relievers</b>: the QC Manager, QA Manager or an admin sets who signs for whom, and the dates.',
    'The reliever gets the role on the first day and loses it after the last.']],
  ['box', 'Procurement request (QC / QA)', [
    'Department requests > <b>Procurement request</b>. Choose your department first.',
    'Pick the requester, the date it is needed by, then each item: name, detail, category, purpose, quantity, unit. <b>Add another item</b> for more.',
    '<b>Send for approval</b>: your manager, then the plant manager approve, by e-mail as before. The status shows in the list below.']],
  ['clock', 'Overtime (QC / QA)', [
    'Department requests > <b>Overtime</b>. Choose your department.',
    'Pick the date (within the last 31 days), tick public holiday if it was one.',
    'Set the start and end time, tick the people. Different times? <b>Another group</b>.',
    '<b>Submit overtime</b>: it goes into HR\'s overtime records. Anyone already recorded for that day is listed as not saved.']],
];
function viewQsyncHelp(){
  return { title: 'How to use', crumb: 'Help', html: pageHead('How to use', 'The short version of each task. Ask the QC or QA Supervisor if something is not clear.')
    + `<div class="grid g2">${QSYNC_HELP.map(([ic, t, steps]) => `<div class="card"><div class="card-h"><div><h3>${I[ic] || ''} ${esc(t)}</h3></div></div>
        <div class="card-b"><ol class="small" style="margin:0;padding-left:18px;line-height:1.55">${steps.map(x => `<li style="margin-bottom:4px">${x}</li>`).join('')}</ol></div></div>`).join('')}</div>` };
}
route('/help', viewQsyncHelp);
