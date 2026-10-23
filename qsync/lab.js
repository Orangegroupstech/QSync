"use strict";
/* ============================================================
   QSync Phase 2: QC laboratory screens (the "QSync Lab" workflow, /webhook/qsync/lab/api/...)
   Loaded after app.js and uses its helpers (api, render, route, openModal, toast, pageHead, esc, I, S ...).
   Every rule (roles, passwords, no self-review, locks, audit) is enforced by the server; these screens only
   show what each person can do and send what they typed. Calculations come from the server (live preview too).
   ============================================================ */
const LAB = '/webhook/qsync/lab/api';
const LAB_STATUS = {
  pending_qc_notify: { label:'Waiting for QC receipt', badge:'b-info' },
  sent_to_qc:        { label:'Waiting for QC receipt', badge:'b-info' },
  qc_received:       { label:'In the QC lab',          badge:'b-warn' },
  qc_released:       { label:'Released by QC',         badge:'b-ok' },
  qc_not_released:   { label:'Not released',           badge:'b-danger' },
  qa_acknowledged:   { label:'Closed (QA acknowledged)', badge:'b-slate' },
};
const WS_STATUS = { in_progress:['In progress','b-warn'], submitted:['Waiting for check','b-info'], returned:['Returned for correction','b-danger'], checked:['Checked','b-ok'] };
const TEST_TYPES = { assay:'Assay', dissolution:'Dissolution', content_uniformity:'Content uniformity', identification:'Identification', microbiology:'Microbiology' };
const CALCULATED_TESTS = Object.keys(TEST_TYPES);   // every test type has a calculation (engine 1.1)

function labRoles(){ return (S && S.lab && S.lab.roles) || []; }
function hasLabRole(r){ return labRoles().includes(r); }
function labStatusBadge(s){ const x = LAB_STATUS[s] || { label:s, badge:'b-slate' }; return `<span class="badge ${x.badge}"><span class="dot"></span>${esc(x.label)}</span>`; }
function wsBadge(s){ const x = WS_STATUS[s] || [s || 'Not started', 'b-slate']; return `<span class="badge ${x[1]}">${esc(x[0])}</span>`; }
function verdictBadge(pass, oos){
  if (pass === true) return `<span class="badge b-ok">${I.check} Pass</span>`;
  if (pass === false) return `<span class="badge b-danger">${I.x} Out of spec${oos ? ' (OOS ' + esc(oos) + ')' : ''}</span>`;
  return `<span class="badge b-slate">--</span>`;
}
const fmtDate = d => (d ? fmtDateTime(d).split(',')[0] : '--');
const num1 = v => (v === null || v === undefined || v === '' ? '--' : Number(v).toFixed(1));

/* ---- data: one cached GET per path; actions clear the cache ---- */
let labCache = {}, labLoading = {};
function labGet(path){
  if (labCache[path]) return labCache[path];
  if (!labLoading[path]){
    labLoading[path] = true;
    api(LAB + path).then(d => { labCache[path] = d; }).catch(e => { labCache[path] = { error: e.message }; })
      .finally(() => { delete labLoading[path]; render(); });
  }
  return null;
}
function labRefresh(){ labCache = {}; render(); }
async function labPost(path, body){ return api(LAB + path, { method:'POST', body }); }
function labWait(title, crumb){
  return { title, crumb, html: `${pageHead(title, '')}<div class="card"><div class="card-b">${emptyState('clock', 'Loading...', '')}</div></div>` };
}
function labFail(title, crumb, msg){
  return { title, crumb, html: `${pageHead(title, '')}<div class="card"><div class="card-b">${emptyState('alert', 'Could not load this page', esc(msg),
    `<button class="btn btn-primary" onclick="labRefresh()">Try again</button>`)}</div></div>` };
}

/* ---- sign-off dialog: password (+ reason/comments), the server checks the role ---- */
function signDialog(o){
  return openModal({
    title: o.title, sub: o.sub, size: o.size || 'narrow',
    body: `${o.body || ''}
      ${o.reason ? `<div class="field"><label for="sgReason">${esc(o.reason)}</label><textarea class="inp" id="sgReason" rows="3"></textarea></div>` : ''}
      <div class="field"><label for="sgPw">Your password</label><input class="inp" id="sgPw" type="password" autocomplete="current-password">
        <div class="hint">${I.lock}<span>${esc(o.meaning || 'Signing records your name, the date and time, and what you signed.')}</span></div></div>
      <div class="err-msg hide" id="sgErr" style="color:var(--danger);font-size:12.5px"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn ${o.danger ? 'btn-danger' : 'btn-primary'}" id="sgOk">${esc(o.ok || 'Sign')}</button>`,
    onMount: (w, close) => {
      if (o.onMount) o.onMount(w);
      const pw = $('#sgPw', w); setTimeout(() => pw.focus(), 30);
      const submit = async () => {
        const err = $('#sgErr', w), btn = $('#sgOk', w);
        err.classList.add('hide');
        const reason = o.reason ? $('#sgReason', w).value.trim() : '';
        if (o.reasonRequired && !reason){ err.textContent = 'Please give a reason.'; err.classList.remove('hide'); return; }
        if (!pw.value){ err.textContent = 'Enter your password to sign.'; err.classList.remove('hide'); return; }
        btn.disabled = true;
        try { await o.submit({ password: pw.value, reason, wrap: w }); close(); }
        catch (e) { err.textContent = e.message; err.classList.remove('hide'); btn.disabled = false; }
      };
      $('#sgOk', w).onclick = submit;
      pw.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    }
  });
}

function testTypesFromRequest(r){
  const t = String(r.test_required || '').toLowerCase(), out = [];
  if (/assay/.test(t)) out.push('assay');
  if (/dissol/.test(t)) out.push('dissolution');
  if (/uniform/.test(t)) out.push('content_uniformity');
  if (/ident/.test(t)) out.push('identification');
  if (/micro/.test(t)) out.push('microbiology');
  return out.length ? out : ['assay'];
}
function analystOptions(analysts, sel){ return analysts.map(a => `<option value="${a.id}" ${String(sel) === String(a.id) ? 'selected' : ''}>${esc(a.name)}</option>`).join(''); }
function testOptions(sel){ return Object.entries(TEST_TYPES).map(([k, v]) => `<option value="${k}" ${sel === k ? 'selected' : ''}>${esc(v)}${CALCULATED_TESTS.includes(k) ? '' : ' (no calculation yet)'}</option>`).join(''); }
function testRowHtml(analysts, test, analyst){
  return `<div class="row lab-test-row" style="gap:8px;margin-bottom:8px;flex-wrap:nowrap">
    <select class="inp" data-f="test_type" style="flex:1.2">${testOptions(test)}</select>
    <select class="inp" data-f="analyst_id" style="flex:1.2"><option value="">Analyst...</option>${analystOptions(analysts, analyst)}</select>
    <input class="inp" data-f="due_date" type="date" style="flex:0.9" title="Due date (optional)">
    <button class="btn-icon" type="button" data-rm title="Remove">${I.x}</button></div>`;
}
function readTestRows(w){
  return $$('.lab-test-row', w).map(r => ({ test_type: $('[data-f=test_type]', r).value, analyst_id: Number($('[data-f=analyst_id]', r).value) || null,
                                             due_date: $('[data-f=due_date]', r).value }));
}
function bindTestRows(w, analysts){
  const box = $('#rcTests', w);
  const wire = () => $$('[data-rm]', box).forEach(b => b.onclick = () => { b.closest('.lab-test-row').remove(); });
  $('#rcAdd', w).onclick = () => { box.insertAdjacentHTML('beforeend', testRowHtml(analysts, 'assay', '')); wire(); };
  wire();
}

/* ============================================================ QC inbox ============================================================ */
let inboxTab = 'waiting', inboxQ = '';
const INBOX_TABS = [
  ['waiting', 'Waiting for receipt', r => ['pending_qc_notify', 'sent_to_qc'].includes(r.status)],
  ['lab', 'In the lab', r => r.status === 'qc_received'],
  ['check', 'Worksheets to check', r => r.status === 'qc_received' && (r.assignments || []).some(a => !a.cancelled && a.analysis_status === 'submitted')],
  ['decided', 'Waiting for QA', r => ['qc_released', 'qc_not_released'].includes(r.status)],
  ['closed', 'Closed', r => r.status === 'qa_acknowledged'],
];
function testsCell(r){
  const live = (r.assignments || []).filter(a => !a.cancelled);
  if (!live.length) return '<span class="muted small">--</span>';
  return live.map(a => `<div class="tiny" style="margin:2px 0">${esc(TEST_TYPES[a.test_type] || a.test_type)} - ${esc(a.analyst)} ${a.analysis_id ? wsBadge(a.analysis_status) : '<span class="muted">(not started)</span>'}</div>`).join('');
}
function viewLabInbox(){
  const d = labGet('/inbox');
  if (!d) return labWait('QC inbox', 'QC Laboratory');
  if (d.error) return labFail('QC inbox', 'QC Laboratory', d.error);
  const q = inboxQ.trim().toLowerCase();
  const tab = INBOX_TABS.find(t => t[0] === inboxTab) || INBOX_TABS[0];
  const rows = d.requests.filter(tab[2]).filter(r => !q || [r.request_no, r.batch_no, r.product_name].join(' ').toLowerCase().includes(q));
  const isSup = hasLabRole('qc_supervisor');
  const body = rows.length ? `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Request</th><th>Product / Batch</th><th>Stage</th><th>Tests</th><th>OOS</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows.map(r => `<tr class="clickable" onclick="go('/lab/request/${r.id}')">
        <td data-label="Request"><div class="req-no">${esc(r.request_no)}</div><div class="tiny muted">${r.qa_signed_at ? 'QA approved ' + relTime(r.qa_signed_at) : 'sent straight to QC (' + esc(r.stage) + ')'}</div></td>
        <td data-label="Product / Batch"><div class="strong">${esc(r.product_name)}</div><div class="tiny muted mono">${esc(r.batch_no)}</div></td>
        <td data-label="Stage"><span class="chip">${esc(r.stage)}</span></td>
        <td data-label="Tests">${testsCell(r)}</td>
        <td data-label="OOS">${r.open_oos ? `<span class="badge b-danger">${r.open_oos} open</span>` : '<span class="muted small">--</span>'}</td>
        <td data-label="Status">${labStatusBadge(r.status)}</td>
        <td style="text-align:right;white-space:nowrap">${isSup && inboxTab === 'waiting'
          ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();labReceive(${r.id})">Receive</button>`
          : isSup && inboxTab === 'check'
          ? [...new Set(r.assignments.filter(a => !a.cancelled && a.analysis_status === 'submitted').map(a => a.analysis_id))]
              .map(w => `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();go('/lab/worksheet/${w}')">Check #${w}</button>`).join(' ')
          : I.chevR}</td>
      </tr>`).join('')}</tbody></table></div>`
    : `<div class="card-b">${emptyState('inbox', 'Nothing here', 'No requests in this list.')}</div>`;
  return {
    title:'QC inbox', crumb:'QC Laboratory',
    html: `${pageHead('QC inbox', 'Batches QA approved for QC: receive the sample, assign the tests, follow them to release.',
              `<button class="btn btn-ghost" onclick="labRefresh()">${I.play} Refresh</button>`)}
      <div class="tabs">${INBOX_TABS.map(t => `<div class="tab ${t[0] === inboxTab ? 'active' : ''}" onclick="inboxTab='${t[0]}';render()">${esc(t[1])}
        <span class="badge b-slate" style="margin-left:6px">${d.requests.filter(t[2]).length}</span></div>`).join('')}</div>
      <div class="card">
        <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px"><div class="row">
          <div class="search filter-search"><span class="ic">${I.search}</span>
            <input class="inp" id="inboxQ" style="padding-left:34px;border-radius:20px" placeholder="Search request, batch or product" value="${esc(inboxQ)}"></div>
          ${!isSup ? `<div class="hint">${I.info}<span>Receiving and assigning needs the QC Supervisor sign-off.</span></div>` : ''}
        </div></div>
        ${body}
      </div>`,
    bind(){
      const el = $('#inboxQ');
      if (el) el.addEventListener('input', debounce(e => { inboxQ = e.target.value; render(); const x = $('#inboxQ'); if (x){ x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }, 260));
    }
  };
}

function labReceive(id){
  // the analyst list comes with the inbox: load it first when the dialog is opened from the batch page
  if (!labCache['/inbox'] || labCache['/inbox'].error){
    api(LAB + '/inbox').then(dd => { labCache['/inbox'] = dd; labReceive(id); }).catch(e => toast('Could not load the analysts', e.message, 'err'));
    return;
  }
  const d = labCache['/inbox'];
  const r = (d.requests || []).find(x => x.id === id) || (labCache['/request?id=' + id] || {}).request;
  const analysts = d.analysts || [];
  if (!r) return;
  signDialog({
    title: 'Receive sample and assign tests', sub: `${r.request_no} - ${r.product_name} batch ${r.batch_no} (${r.stage})`, size: 'wide',
    ok: 'Sign as received and assigned', meaning: 'You sign as "Received by" and "Assigned by" (QC Supervisor).',
    body: `<div class="grid g2"><div class="field"><label for="rcQty">Quantity received</label><input class="inp" id="rcQty" inputmode="decimal"></div>
        <div class="field"><label for="rcUnit">Unit</label><select class="inp" id="rcUnit"><option>g</option><option>tablets</option><option>caplets</option><option>mL</option><option>sachets</option></select></div></div>
      <div class="field"><label>Tests to assign</label><div id="rcTests">${testTypesFromRequest(r).map(t => testRowHtml(analysts, t, '')).join('')}</div>
        <button class="btn btn-ghost btn-sm" type="button" id="rcAdd">${I.plus} Add a test</button>
        ${analysts.length ? '' : `<div class="hint">${I.alert}<span>No one has the analyst sign-off yet: give it in the Users console.</span></div>`}</div>`,
    onMount: w => bindTestRows(w, analysts),
    submit: async ({ password, wrap }) => {
      const tests = readTestRows(wrap);
      if (!tests.length) throw new Error('Assign at least one test.');
      if (tests.some(t => !t.analyst_id)) throw new Error('Choose an analyst for every test.');
      await labPost('/receive', { request_id: id, password, qty: $('#rcQty', wrap).value.replace(/,/g, ''), unit: $('#rcUnit', wrap).value, assignments: tests });
      toast('Received', `${r.request_no}: ${tests.length} test(s) assigned.`, 'ok');
      labRefresh();
    }
  });
}

/* ============================================================ Batch (request) view ============================================================ */
const AUDIT_TABLES = { okl_qcd_test_requests:'Request', okl_qcd_test_assignments:'Test', okl_qcd_analyses:'Worksheet', okl_qcd_analysis_results:'Result' };
function auditLine(e){
  const short = v => { const s = v == null ? '--' : String(v); return s.length > 70 ? s.slice(0, 67) + '...' : s; };
  const what = AUDIT_TABLES[e.table] || e.table || '';
  if (e.action === 'insert') return `${esc(what)} #${esc(e.record)} created`;
  if (e.field === 'inputs') return `${esc(what)} #${esc(e.record)}: worksheet values changed`;
  return `${esc(what)} #${esc(e.record)}: <b>${esc(String(e.field || '').replace(/_/g, ' '))}</b> ${esc(short(e.old))} &rarr; ${esc(short(e.new))}`;
}
// whose turn it is on a batch, in plain words, with a button when the turn is the signed-in person's
function labNextSteps(r){
  const st = r.status, me = S && S.me ? S.me.id : null, out = [];
  const step = (text, btn) => out.push(`<div class="next-step">${I.info}<span>${text}</span>${btn || ''}</div>`);
  const btn = (label, href) => `<a class="btn btn-primary btn-sm" href="#${href}">${esc(label)}</a>`;
  if (['pending_qc_notify', 'sent_to_qc'].includes(st)) step('Next: the <b>QC Supervisor</b> receives the sample and assigns the tests.');
  if (st === 'qc_received'){
    const live = r.assignments.filter(a => !a.cancelled), seen = new Set();
    live.forEach(a => {
      const w = a.analysis_id, mine = String(a.analyst_id) === String(me);
      if (!w){ step(`<b>${esc(a.analyst)}</b> (analyst) starts the ${esc(TEST_TYPES[a.test_type] || a.test_type)} worksheet from My analyses.`, mine ? btn('Start it', '/lab/my') : ''); return; }
      if (seen.has(w)) return; seen.add(w);
      if (['in_progress', 'returned'].includes(a.analysis_status))
        step(`<b>${esc(a.analyst)}</b> (analyst) ${a.analysis_status === 'returned' ? 'corrects the returned' : 'completes and submits'} worksheet #${w}.`, mine ? btn('Open worksheet #' + w, '/lab/worksheet/' + w) : '');
      else if (a.analysis_status === 'submitted')
        step(`The <b>QC Supervisor</b> checks worksheet #${w} against the chromatograms, then signs it or returns it.`, hasLabRole('qc_supervisor') && !mine ? btn('Check worksheet #' + w, '/lab/worksheet/' + w) : '');
    });
    const allChecked = live.length && live.every(a => a.analysis_status === 'checked');
    if (allChecked && r.open_oos) step('Every worksheet is checked. The <b>QC Manager</b> closes the open OOS entries, then decides.', hasLabRole('qc_manager') ? btn('Open the OOS log', '/lab/oos') : '');
    else if (allChecked) step('Every worksheet is checked. The <b>QC Manager</b> decides: Released or Not released (button at the top).');
  }
  if (['qc_released', 'qc_not_released'].includes(st)) step('Next: the <b>QA Manager</b> acknowledges the QC decision (button at the top).');
  if (st === 'qa_acknowledged') step('Closed: QC decided and QA acknowledged.');
  return out.length ? `<div class="card" style="margin-bottom:16px"><div class="card-h"><h3>What happens next</h3></div><div class="card-b">${out.join('')}</div></div>` : '';
}
function viewLabRequest(id){
  const d = labGet('/request?id=' + id);
  if (!d) return labWait('Batch', 'QC Laboratory');
  if (d.error) return labFail('Batch', 'QC Laboratory', d.error);
  const r = d.request, st = r.status;
  const acts = [];
  if (hasLabRole('qc_supervisor') && ['pending_qc_notify', 'sent_to_qc'].includes(st)){
    if (!labCache['/inbox']) labGet('/inbox');
    acts.push(`<button class="btn btn-primary" onclick="labReceive(${r.id})">Receive and assign</button>`);
  }
  if (hasLabRole('qc_supervisor') && st === 'qc_received'){
    [...new Set(r.assignments.filter(a => !a.cancelled && a.analysis_status === 'submitted' && String(a.analyst_id) !== String(S.me && S.me.id)).map(a => a.analysis_id))]
      .forEach(w => acts.push(`<a class="btn btn-primary" href="#/lab/worksheet/${w}">Check worksheet #${w}</a>`));
    acts.push(`<button class="btn btn-ghost" onclick="labChangeTests(${r.id})">${I.edit} Change tests</button>`);
  }
  if (hasLabRole('qc_manager') && st === 'qc_received') acts.push(`<button class="btn btn-primary" onclick="labDecide(${r.id})">Decide (QC Manager)</button>`);
  if (hasLabRole('qa_manager') && ['qc_released', 'qc_not_released'].includes(st)) acts.push(`<button class="btn btn-primary" onclick="labQaAck(${r.id})">Acknowledge (QA Manager)</button>`);
  acts.push(`<a class="btn btn-ghost" href="#/lab/report/${r.id}">${I.print} QC report</a>`);
  acts.push(`<a class="btn btn-ghost" href="#/sheet/${r.id}">${I.doc} Phase 1 sheet</a>`);
  const live = r.assignments.filter(a => !a.cancelled), cancelled = r.assignments.filter(a => a.cancelled);
  const results = r.results || [];
  return {
    title: r.request_no, crumb:'QC Laboratory',
    html: `${pageHead(esc(r.request_no), `${esc(r.product_name)} - batch <span class="mono">${esc(r.batch_no)}</span> - ${esc(r.stage)}`, acts.join(''))}
      <div class="card" style="margin-bottom:16px"><div class="card-b"><div class="kv-grid">
        <div class="kv-item"><div class="k">Status</div><div class="v">${labStatusBadge(st)}</div></div>
        <div class="kv-item"><div class="k">Received by</div><div class="v">${esc(r.qc_received_by || '--')}</div><div class="tiny muted">${r.qc_received_at ? fmtDateTime(r.qc_received_at) : ''}</div></div>
        <div class="kv-item"><div class="k">Quantity</div><div class="v">${r.qc_received_qty != null ? esc(r.qc_received_qty) + ' ' + esc(r.qc_received_qty_unit || '') : '--'}</div></div>
        <div class="kv-item"><div class="k">QC Manager</div><div class="v">${r.qc_decision ? (r.qc_decision === 'released' ? 'Released' : 'Not released') + ' - ' + esc(r.qc_manager) : '--'}</div>
          <div class="tiny muted">${r.qc_manager_signed_at ? fmtDateTime(r.qc_manager_signed_at) : ''}${r.qc_comments ? ' - ' + esc(r.qc_comments) : ''}</div></div>
        <div class="kv-item"><div class="k">QA Manager</div><div class="v">${esc(r.qa_manager || '--')}</div>
          <div class="tiny muted">${r.qa_manager_signed_at ? fmtDateTime(r.qa_manager_signed_at) : ''}${r.qa_manager_comments ? ' - ' + esc(r.qa_manager_comments) : ''}</div></div>
      </div>${r.open_oos ? `<div class="notice" style="margin-top:14px;color:var(--danger)">${I.alert} ${r.open_oos} open OOS entr${r.open_oos === 1 ? 'y' : 'ies'}: the QC Manager must close ${r.open_oos === 1 ? 'it' : 'them'} (OOS log) before deciding.</div>` : ''}
      </div></div>
      ${labNextSteps(r)}
      <div class="grid g2" style="margin-bottom:16px;align-items:start">
        <div class="card"><div class="card-h"><h3>Tests</h3></div>
          ${live.length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Test</th><th>Analyst</th><th>Worksheet</th></tr></thead><tbody>
            ${live.map(a => `<tr><td>${esc(TEST_TYPES[a.test_type] || a.test_type)}${a.due_date ? `<div class="tiny muted">due ${fmtDate(a.due_date)}</div>` : ''}</td><td>${esc(a.analyst)}</td>
              <td>${a.analysis_id ? `<a href="#/lab/worksheet/${a.analysis_id}">#${a.analysis_id}</a> ${wsBadge(a.analysis_status)}` : '<span class="muted small">not started</span>'}</td></tr>`).join('')}
            ${cancelled.map(a => `<tr class="muted"><td><s>${esc(TEST_TYPES[a.test_type] || a.test_type)}</s></td><td>${esc(a.analyst)}</td><td class="tiny">cancelled: ${esc(a.cancel_reason || '')}</td></tr>`).join('')}
            </tbody></table></div>` : `<div class="card-b">${emptyState('inbox', 'No tests yet', 'The QC Supervisor assigns them when the sample is received.')}</div>`}
        </div>
        <div class="card"><div class="card-h"><h3>QC results</h3><div class="sub">Current results (corrected ones replace older ones)</div></div>
          ${results.length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>API</th><th>Sample</th><th>Result</th><th>Limit</th><th></th></tr></thead><tbody>
            ${results.map(x => `<tr><td>${esc(x.api)}</td><td class="mono small">${esc(x.sample_label)}</td><td class="strong tnum">${esc(resText(x))}</td>
              <td class="small muted">${esc(x.limit_text || '')}</td><td>${verdictBadge(x.pass, x.oos_status)}</td></tr>`).join('')}</tbody></table></div>`
            : `<div class="card-b">${emptyState('chart', 'No results yet', 'Results appear when the analyst submits the worksheet.')}</div>`}
        </div>
      </div>
      ${d.ipqa && d.ipqa.length ? `<div class="card" style="margin-bottom:16px"><div class="card-h"><h3>IPQA (Phase 1)</h3></div><div class="tbl-wrap"><table class="tbl" style="min-width:0">
        <thead><tr><th>Parameter</th><th>Observed</th><th>Specification</th><th>Status</th></tr></thead><tbody>
        ${d.ipqa.map(p => `<tr><td>${esc(p.parameter)}</td><td>${esc(p.value)} ${esc(p.unit || '')}</td><td class="small">${esc(p.spec || '')}</td><td>${esc(String(p.status || '').toUpperCase())}</td></tr>`).join('')}
        </tbody></table></div></div>` : ''}
      <div class="card"><div class="card-h"><h3>History</h3><div class="sub">Every change, who made it, when and why (written by the database)</div></div>
        <div class="card-b">${d.audit.length ? `<div class="timeline">${d.audit.slice().reverse().map(e => `<div class="tl-item ${e.action === 'insert' ? 'done' : ''}">
          <div class="tl-dot">${e.action === 'insert' ? I.plus : I.edit}</div>
          <div class="tl-t">${auditLine(e)}</div>
          <div class="tl-time"><span>${esc(e.who)}${e.role ? ' (' + esc(String(e.role).replace(/_/g, ' ')) + ')' : ''}</span><span>${fmtDateTime(e.at)}</span></div>
          ${e.reason ? `<div class="tl-note">Reason: ${esc(e.reason)}</div>` : ''}</div>`).join('')}</div>` : emptyState('activity', 'No lab history yet', '')}</div></div>`
  };
}

function labChangeTests(id){
  const r = (labCache['/request?id=' + id] || {}).request; if (!r) return;
  const go2 = analysts => signDialog({
    title: 'Change tests', sub: `${r.request_no} - batch ${r.batch_no}`, size: 'wide', ok: 'Sign changes',
    reason: 'Reason for the change', reasonRequired: true,
    body: `${r.assignments.filter(a => !a.cancelled).map(a => `<div class="row lab-cur" data-id="${a.id}" style="gap:8px;margin-bottom:8px;flex-wrap:nowrap">
        <div style="flex:1" class="small strong">${esc(TEST_TYPES[a.test_type] || a.test_type)}</div>
        ${a.analysis_id ? `<div style="flex:2" class="small muted">${esc(a.analyst)} - in worksheet #${a.analysis_id} (cannot change)</div>`
          : `<select class="inp" data-f="analyst" style="flex:1.4">${analystOptions(analysts, a.analyst_id)}</select>
             <label class="small" style="flex:0.8;display:flex;gap:6px;align-items:center"><input type="checkbox" data-f="cancel"> Cancel</label>`}</div>`).join('')}
      <div class="field" style="margin-top:12px"><label>Add tests</label><div id="rcTests"></div>
        <button class="btn btn-ghost btn-sm" type="button" id="rcAdd">${I.plus} Add a test</button></div>`,
    onMount: w => bindTestRows(w, analysts),
    submit: async ({ password, reason, wrap }) => {
      const reassign = [], cancel = [];
      $$('.lab-cur', wrap).forEach(row => {
        const a = r.assignments.find(x => String(x.id) === row.dataset.id), sel = $('[data-f=analyst]', row), cx = $('[data-f=cancel]', row);
        if (cx && cx.checked) cancel.push({ assignment_id: a.id, reason });
        else if (sel && String(sel.value) !== String(a.analyst_id)) reassign.push({ assignment_id: a.id, analyst_id: Number(sel.value) });
      });
      const add = readTestRows(wrap);
      if (add.some(t => !t.analyst_id)) throw new Error('Choose an analyst for every new test.');
      if (!add.length && !reassign.length && !cancel.length) throw new Error('Nothing changed.');
      await labPost('/assign', { request_id: id, password, reason, add, reassign, cancel });
      toast('Tests updated', r.request_no, 'ok'); labRefresh();
    }
  });
  const inbox = labCache['/inbox'];
  if (inbox && inbox.analysts) go2(inbox.analysts);
  else api(LAB + '/inbox').then(dd => { labCache['/inbox'] = dd; go2(dd.analysts || []); }).catch(e => toast('Could not load analysts', e.message, 'err'));
}

function labDecide(id){
  const r = (labCache['/request?id=' + id] || {}).request; if (!r) return;
  const fails = (r.results || []).filter(x => x.pass === false).length;
  signDialog({
    title: 'QC decision', sub: `${r.request_no} - ${r.product_name} batch ${r.batch_no}`, ok: 'Sign decision',
    meaning: 'You sign as "Approved by" (QC Manager). The decision is final.',
    body: `<div class="small" style="margin-bottom:12px">${(r.results || []).length} result(s), ${fails ? `<b style="color:var(--danger)">${fails} out of specification</b>` : 'all within specification'}.</div>
      <div class="radio-cards" style="margin-bottom:14px">
        <label class="radio-card"><input type="radio" name="dec" value="released" ${fails ? '' : 'checked'}> Released for further processing</label>
        <label class="radio-card"><input type="radio" name="dec" value="not_released" ${fails ? 'checked' : ''}> Not released</label></div>
      <div class="field"><label for="dcCom">Comments</label><textarea class="inp" id="dcCom" rows="2"></textarea></div>`,
    submit: async ({ password, wrap }) => {
      const dec = ($('input[name=dec]:checked', wrap) || {}).value;
      if (!dec) throw new Error('Choose released or not released.');
      await labPost('/decide', { request_id: id, password, decision: dec, comments: $('#dcCom', wrap).value });
      toast('Decision signed', `${r.request_no}: ${dec === 'released' ? 'released' : 'not released'}.`, 'ok'); labRefresh();
    }
  });
}

function labQaAck(id){
  const r = (labCache['/request?id=' + id] || {}).request; if (!r) return;
  signDialog({
    title: 'QA acknowledgement', sub: `${r.request_no} - QC decision: ${r.qc_decision === 'released' ? 'Released' : 'Not released'} by ${r.qc_manager}`,
    ok: 'Sign acknowledgement', reason: 'Comments (optional)', meaning: 'You sign as QA Manager that you have reviewed and documented the QC decision. It does not change it.',
    submit: async ({ password, reason }) => {
      await labPost('/qa-ack', { request_id: id, password, comments: reason });
      toast('Acknowledged', r.request_no, 'ok'); labRefresh();
    }
  });
}

/* ============================================================ My analyses ============================================================ */
let mySel = new Set();
function viewLabMy(){
  const d = labGet('/my');
  if (!d) return labWait('My analyses', 'QC Laboratory');
  if (d.error) return labFail('My analyses', 'QC Laboratory', d.error);
  const waiting = d.waiting || [];
  mySel = new Set([...mySel].filter(x => waiting.some(w => w.assignment_id === x)));
  const chosen = waiting.filter(w => mySel.has(w.assignment_id));
  const mixed = new Set(chosen.map(w => [w.product_name, w.stage, w.test_type].join('|'))).size > 1;
  return {
    title:'My analyses', crumb:'QC Laboratory',
    html: `${pageHead('My analyses', 'Tests assigned to you, and your worksheets. One worksheet = one HPLC run: pick every batch that goes into the run.',
              `<button class="btn btn-ghost" onclick="labRefresh()">${I.play} Refresh</button>`)}
      ${!hasLabRole('qc_analyst') ? `<div class="notice" style="margin-bottom:16px">${I.info} You do not have the analyst sign-off, so no tests can be assigned to you.</div>` : ''}
      <div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Waiting for a worksheet</h3><div class="sub">Tick the batches for one run (same product, stage and test)</div></div>
        <button class="btn btn-primary btn-sm" id="myStart" ${chosen.length && !mixed ? '' : 'disabled'}>${I.plus} Start worksheet (${chosen.length})</button></div>
        ${mixed ? `<div class="card-b" style="padding-top:0"><div class="hint" style="color:var(--danger)">${I.alert}<span>One worksheet holds one product, stage and test.</span></div></div>` : ''}
        ${waiting.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Request</th><th>Product / Batch</th><th>Stage</th><th>Test</th><th>Due</th></tr></thead><tbody>
          ${waiting.map(w => `<tr><td style="width:36px"><input type="checkbox" data-sel="${w.assignment_id}" ${mySel.has(w.assignment_id) ? 'checked' : ''} style="accent-color:var(--brand);width:16px;height:16px"></td>
            <td><a href="#/lab/request/${w.request_id}" class="req-no">${esc(w.request_no)}</a></td><td><div class="strong">${esc(w.product_name)}</div><div class="tiny muted mono">${esc(w.batch_no)}</div></td>
            <td><span class="chip">${esc(w.stage)}</span></td><td>${esc(TEST_TYPES[w.test_type] || w.test_type)}</td><td class="small">${fmtDate(w.due_date)}</td></tr>`).join('')}
          </tbody></table></div>` : `<div class="card-b">${emptyState('inbox', 'Nothing waiting', 'Tests appear here when the QC Supervisor assigns them to you.')}</div>`}
      </div>
      <div class="card"><div class="card-h"><h3>My worksheets</h3></div>
        ${(d.worksheets || []).length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Worksheet</th><th>Product / Stage</th><th>Test</th><th>Batches</th><th>Status</th><th>Updated</th></tr></thead><tbody>
          ${d.worksheets.map(x => `<tr class="clickable" onclick="go('/lab/worksheet/${x.id}')"><td class="strong">#${x.id}</td><td>${esc(x.product_name)}<div class="tiny muted">${esc(x.stage)}</div></td>
            <td>${esc(TEST_TYPES[x.test_type] || x.test_type)}</td><td class="mono small">${esc((x.batches || []).join(', '))}</td>
            <td>${wsBadge(x.status)}${x.return_reason ? `<div class="tiny" style="color:var(--danger);margin-top:3px">${esc(x.return_reason)}</div>` : ''}</td><td class="small muted">${relTime(x.updated_at)}</td></tr>`).join('')}
          </tbody></table></div>` : `<div class="card-b">${emptyState('doc', 'No worksheets yet', '')}</div>`}
      </div>`,
    bind(){
      $$('[data-sel]').forEach(c => c.onchange = () => { const v = Number(c.dataset.sel); if (c.checked) mySel.add(v); else mySel.delete(v); render(); });
      const b = $('#myStart'); if (b) b.onclick = async () => {
        b.disabled = true;
        try { const res = await labPost('/worksheet/create', { assignment_ids: [...mySel] }); mySel.clear(); labCache = {}; go('/lab/worksheet/' + res.analysis_id); }
        catch (e) { toast('Could not start the worksheet', e.message, 'err'); b.disabled = false; }
      };
    }
  };
}

/* ============================================================ Worksheet ============================================================ */
let ws = null;   // { id, src, ctx, inputs, run, calc, tab, dirty, timer }
function wsInit(d){
  const a = d.analysis;
  ws = { id: a.id, src: d, ctx: d, inputs: JSON.parse(JSON.stringify(a.inputs || {})), calc: a.calc || null, dirty: false, timer: null,
         run: { equipment_id: a.equipment_id || '', reagents: a.reagents || '', started_on: a.started_on || '', ended_on: a.ended_on || '' },
         tab: ws && ws.id === a.id ? ws.tab : (d.templates[0] || {}).id };
  ws.savedApis = JSON.parse(JSON.stringify((a.inputs || {}).apis || {}));   // the standards as last saved (a change needs a reason)
  wsEnsure();
}
function wsEnsure(){
  const inp = ws.inputs, test = ws.ctx.analysis.test_type;
  if (!inp.apis || Array.isArray(inp.apis)) inp.apis = {};
  if (!inp.values || Array.isArray(inp.values)) inp.values = {};
  if (!Array.isArray(inp.samples)) inp.samples = [];
  const hplc = ['assay', 'dissolution', 'content_uniformity'].includes(test);
  for (const t of ws.ctx.templates){
    const P = t.parameters || {}, a = inp.apis[t.id] = inp.apis[t.id] || {};
    if (hplc && !Array.isArray(a.std_areas)) a.std_areas = Array(((P.std_injections || {}).max) || 6).fill('');
  }
  for (const s of inp.samples){
    const v = inp.values[s.key] = inp.values[s.key] || {};
    if (test === 'assay'){
      if (v.avg_weight === undefined) v.avg_weight = '';
      if (!v.preps || Array.isArray(v.preps)) v.preps = {};
    }
    if (test === 'dissolution' || test === 'content_uniformity'){ if (!v.units || Array.isArray(v.units)) v.units = {}; }
    if (test === 'identification'){ if (!v.rt || Array.isArray(v.rt)) v.rt = {}; }
    if (test === 'microbiology'){ if (!v.micro || Array.isArray(v.micro)) v.micro = {}; }
    for (const t of ws.ctx.templates){
      const P = t.parameters || {};
      if (test === 'assay'){
        const list = v.preps[t.id] = Array.isArray(v.preps[t.id]) ? v.preps[t.id] : [];
        const n = (list[0] && Array.isArray(list[0].areas) && list[0].areas.length) || 1;   // 1 injection, or 2 once the analyst adds one
        while (list.length < (P.preparations || 1)) list.push({ weight:'', areas: Array(n).fill('') });
        list.forEach(p => { if (!Array.isArray(p.areas)) p.areas = []; if (!p.areas.length) p.areas.push(''); });
      } else if (test === 'dissolution' || test === 'content_uniformity'){
        const n = test === 'dissolution' ? (P.units || 6) : 10;
        const u = v.units[t.id] = (Array.isArray(v.units[t.id]) ? v.units[t.id] : []).map(x => (Array.isArray(x) ? x : [x]));
        const inj = (u[0] && u[0].length) || 1;   // every caplet of a sample has the same number of injections (1 or 2)
        while (u.length < n) u.push(Array(inj).fill(''));
      }
    }
  }
}
function wsSet(path, value){
  const keys = path.split('.'); let o = ws.inputs;
  for (let i = 0; i < keys.length - 1; i++){ if (o[keys[i]] == null) o[keys[i]] = /^\d+$/.test(keys[i + 1]) ? [] : {}; o = o[keys[i]]; }
  o[keys[keys.length - 1]] = value;
}
function wsGet(path){ return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), ws.inputs); }
function wsEditable(){ const a = ws.ctx.analysis; return a.is_mine && ['in_progress', 'returned'].includes(a.status); }
const wsMiss = v => (ws.showMissing && wsEditable() && (v == null || String(v).trim() === '') ? ' err' : '');
function inpNum(path, attrs){
  const v = wsGet(path); const ro = wsEditable() ? '' : 'disabled';
  return `<input class="inp tnum${wsMiss(v)}" data-k="${esc(path)}" value="${esc(v == null ? '' : v)}" inputmode="decimal" autocomplete="off" ${ro} ${attrs || ''}>`;
}
// sample injections: 1, or up to the template's number (2); the same count for every prep / caplet of a sample
const wsSplMax = P => (typeof P.injections === 'object' && P.injections ? P.injections.max : P.injections) || 2;
function wsSplInjButtons(si, tid, n, max){
  if (!wsEditable()) return '';
  return `${n < max ? `<button class="btn btn-ghost btn-sm" onclick="wsSplInj(${si},${tid},1)">${I.plus} Injection</button>` : ''}
    ${n > 1 ? `<button class="btn btn-ghost btn-sm" onclick="wsSplInj(${si},${tid},-1)">${I.x} Last injection</button>` : ''}`;
}
function stepsText(steps, firstUnit){
  return (steps || []).map((s, i) => (i === 0 ? (firstUnit === 'caplet' ? `${s[0] || 1} caplet in ${s[1]} mL` : `weighed (${firstUnit}) to ${s[1]} mL`)
    : (s[0] === 1 && s[1] === 1 ? null : `${s[0]} mL to ${s[1]} mL`))).filter(Boolean).join(', then ');
}
function wsStandardCard(t, extraSub){
  const P = t.parameters || {}, tid = t.id, a = ws.inputs.apis[tid];
  const ro = wsEditable() ? '' : 'disabled';
  const stds = ws.ctx.standards.filter(w => !t.api || String(w.substance).toLowerCase() === String(t.api).toLowerCase());
  const stdList = stds.length ? stds : ws.ctx.standards;
  const inj = P.std_injections || {};
  const lim = P.limits || {};
  const limTxt = ws.ctx.analysis.test_type === 'content_uniformity' ? `AV NMT ${P.l1 || 15}` : lim.max != null ? `limit ${lim.min}% to ${lim.max}%` : `NLT ${lim.min}%`;
  return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(t.api)} - standard</h3>
      <div class="sub">Template v${esc(t.version)} ${esc(t.method_ref || '')} - label claim ${esc(P.label_claim_mg)} mg - ${esc(limTxt)}${extraSub ? ' - ' + esc(extraSub) : ''}</div></div></div>
    <div class="card-b">
      <div class="grid g3">
        <div class="field"><label>Working standard</label><select class="inp${wsMiss(a.ws_id)}" data-ws="${tid}" ${ro}><option value="">Choose...</option>
          ${stdList.map(w => `<option value="${w.id}" ${String(a.ws_id) === String(w.id) ? 'selected' : ''} ${w.usable ? '' : 'disabled'}>${esc(w.ws_no)} - ${esc(w.substance)} - ${esc(w.potency_pct)}%${w.usable ? ' (exp ' + fmtDate(w.expiry_date) + ')' : ' (cannot be used: ' + (w.expiry_date ? 'expired' : 'no expiry date') + ')'}</option>`).join('')}</select></div>
        <div class="field"><label>Standard weight (mg)</label>${inpNum(`apis.${tid}.std_weight`, 'placeholder="' + esc((P.std || {}).nominal_mg || '') + '"')}
          <div class="hint">${I.info}<span>${esc(stepsText((P.std || {}).steps, 'mg'))}</span></div></div>
        <div class="field"><label>System suitability</label><div id="sst-${tid}" class="small" style="padding-top:8px">--</div></div>
      </div>
      <div class="field"><label>Standard injection areas (${inj.min === inj.max ? inj.min : `${inj.min || 1} to ${inj.max || ''}`} injections)</label>
        <div class="lab-areas" data-group="apis.${tid}.std_areas">${a.std_areas.map((v, i) => inpNum(`apis.${tid}.std_areas.${i}`, `placeholder="${i + 1}"`)).join('')}</div>
        ${wsEditable() ? `<div class="row" style="margin-top:6px">${a.std_areas.length < (inj.max || 6) ? `<button class="btn btn-ghost btn-sm" onclick="wsInj(${tid},1)">${I.plus} Injection</button>` : ''}
          ${a.std_areas.length > (inj.min || 1) ? `<button class="btn btn-ghost btn-sm" onclick="wsInj(${tid},-1)">${I.x} Last injection</button>` : ''}
          <span class="hint">${I.info}<span>Tip: paste a column of areas from Empower into the first box.</span></span></div>` : ''}</div>
      ${(a.ws_changes || []).length ? `<div class="notice" style="margin-bottom:12px">${I.info} <span>${a.ws_changes.map(c => `Standard changed from <b>${esc(c.from_no || '?')}</b> to <b>${esc(c.to_no || 'none')}</b>${c.at ? ' on ' + fmtDateTime(c.at) : ''}: ${esc(c.reason)}`).join('<br>')}</span></div>` : ''}
      <div class="field hide" id="just-${tid}"><label>System suitability failed: supervisor's justification (or repeat the run)</label>
        <textarea class="inp" data-k="apis.${tid}.sst_justification" rows="2" ${ro}>${esc(a.sst_justification || '')}</textarea></div>
    </div></div>`;
}
function wsApiPanel(t){
  const P = t.parameters || {}, tid = t.id, test = ws.ctx.analysis.test_type;
  const samples = ws.inputs.samples, ro = wsEditable() ? '' : 'disabled';
  if (test === 'assay'){
    return wsStandardCard(t) + samples.map((s, si) => {
      const v = ws.inputs.values[s.key], preps = v.preps[tid];
      return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(t.api)} - sample ${esc(s.label)}</h3>
          <div class="sub">${esc(stepsText((P.sample || {}).steps, 'mg'))}</div></div><div id="mean-${tid}-${si}" class="strong">--</div></div>
        <div class="card-b">
          <div class="field" style="max-width:260px"><label>Average weight (mg, measured)</label>${inpNum(`values.${s.key}.avg_weight`, `placeholder="theoretical ${esc((P.avg_weight || {}).theoretical_mg || '')}"`)}
            <div class="hint">${I.info}<span>Shared by the three APIs of this sample.</span></div></div>
          <div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Prep</th><th>Sample weight (mg)</th><th>Injection areas</th><th style="text-align:right">% of label claim</th></tr></thead><tbody>
          ${preps.map((p, pi) => `<tr><td class="strong">${String.fromCharCode(97 + pi)}</td>
            <td style="width:150px">${inpNum(`values.${s.key}.preps.${tid}.${pi}.weight`)}</td>
            <td><div class="lab-areas" data-group="values.${s.key}.preps.${tid}.${pi}.areas">${p.areas.map((x, ii) => inpNum(`values.${s.key}.preps.${tid}.${pi}.areas.${ii}`, `placeholder="${ii + 1}"`)).join('')}</div></td>
            <td style="text-align:right" class="tnum strong" id="pr-${tid}-${si}-${pi}">--</td></tr>`).join('')}
          </tbody></table></div>
          ${wsEditable() ? `<div class="row" style="margin-top:8px">${wsSplInjButtons(si, tid, (preps[0] || { areas: [''] }).areas.length, wsSplMax(P))}
            <span class="hint">${I.info}<span>1 or ${wsSplMax(P)} injections per preparation; with ${wsSplMax(P)}, their mean is used.</span></span></div>` : ''}
        </div></div>`;
    }).join('');
  }
  if (test === 'dissolution' || test === 'content_uniformity'){
    const diss = test === 'dissolution';
    const sub = diss ? `${P.medium_ml || 900} mL medium${P.time_point_min ? ', ' + P.time_point_min + ' min' : ', time point per method'}` : '';
    return wsStandardCard(t, sub) + samples.map((s, si) => {
      const units = ws.inputs.values[s.key].units[tid];
      return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(t.api)} - sample ${esc(s.label)}</h3>
          <div class="sub">${diss ? `One caplet per vessel: ${esc(stepsText((P.sample || {}).steps, 'caplet'))}` : `One caplet each: ${esc(stepsText((P.sample || {}).steps, 'caplet'))}`}
            ${!diss ? ` - stage ${units.length === 30 ? '2 (30 caplets, k 2.0)' : '1 (10 caplets, k 2.4)'}` : ''}</div></div>
          <div id="mean-${tid}-${si}" class="strong" style="text-align:right">--</div></div>
        <div class="card-b">
          <div class="lab-units" data-group="values.${s.key}.units.${tid}">${units.map((x, ui) => `<div class="lab-unit"><div class="tiny muted">Caplet ${ui + 1}</div>
            ${x.map((y, ii) => inpNum(`values.${s.key}.units.${tid}.${ui}.${ii}`, `placeholder="${x.length > 1 ? 'injection ' + (ii + 1) : 'area'}"`)).join('')}<div class="tiny tnum strong" id="u-${tid}-${si}-${ui}">--</div></div>`).join('')}</div>
          ${wsEditable() ? `<div class="row" style="margin-top:10px">${wsSplInjButtons(si, tid, (units[0] || ['']).length, wsSplMax(P))}
            <span class="hint">${I.info}<span>1 or ${wsSplMax(P)} injections per caplet; with ${wsSplMax(P)}, their mean is used.</span></span></div>` : ''}
          ${!diss && wsEditable() ? `<div class="row" style="margin-top:10px">${units.length === 10
            ? `<button class="btn btn-ghost btn-sm" onclick="wsCuStage('${esc(s.key)}',${tid},30)">${I.plus} Stage 2: add 20 caplets</button>`
            : `<button class="btn btn-ghost btn-sm" onclick="wsCuStage('${esc(s.key)}',${tid},10)">${I.x} Back to stage 1 (10 caplets)</button>`}</div>` : ''}
          <div class="hint" style="margin-top:8px">${I.info}<span>Tip: paste the column of caplet areas from Empower into the first box${(units[0] || []).length > 1 ? ' (caplet 1 injection 1, caplet 1 injection 2, caplet 2 ...)' : ''}.</span></div>
        </div></div>`;
    }).join('');
  }
  if (test === 'identification'){
    return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(t.api)} - identification (HPLC)</h3>
        <div class="sub">Template v${esc(t.version)} - the sample peak's retention time must be within ${esc(P.tolerance_pct)}% of the standard's</div></div></div>
      <div class="card-b"><div class="grid g3">
        <div class="field"><label>Standard retention time (min)</label>${inpNum(`apis.${tid}.std_rt`)}</div>
        ${samples.map((s, si) => `<div class="field"><label>Sample ${esc(s.label)} retention time (min)</label>${inpNum(`values.${s.key}.rt.${tid}`)}
          <div class="small" id="mean-${tid}-${si}" style="margin-top:6px">--</div></div>`).join('')}
      </div></div></div>`;
  }
  if (test === 'microbiology'){
    const L = P.limits || {};
    return samples.map((s, si) => `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Microbiology - sample ${esc(s.label)}</h3>
        <div class="sub">Template v${esc(t.version)} - leave a field blank while it is incubating (you can save; you can submit once everything is in)</div></div>
        <div id="mean-${tid}-${si}" class="strong">--</div></div>
      <div class="card-b"><div class="grid g3">
        ${(L.counts || []).map(c => `<div class="field"><label>${esc(c.label)} (cfu/g, NMT ${esc(c.max)})</label>${inpNum(`values.${s.key}.micro.${c.key}`)}</div>`).join('')}
        ${(L.absent || []).map(o => `<div class="field"><label>${esc(o.label)} (must be absent)</label><select class="inp" data-k="values.${s.key}.micro.${o.key}" ${ro}>
          ${[['', 'Awaiting result'], ['absent', 'Absent'], ['present', 'Present']].map(([k, l]) => `<option value="${k}" ${(ws.inputs.values[s.key].micro || {})[o.key] === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`).join('')}
      </div></div></div>`).join('');
  }
  return emptyState('alert', 'Unknown test', '');
}
function viewLabWorksheet(id){
  const d = labGet('/worksheet?id=' + id);
  if (!d) return labWait('Worksheet', 'QC Laboratory');
  if (d.error) return labFail('Worksheet', 'QC Laboratory', d.error);
  if (!ws || ws.src !== d){
    const keep = ws && ws.id === d.analysis.id && ws.dirty ? { inputs: ws.inputs, run: ws.run, calc: ws.calc } : null;
    wsInit(d);
    if (keep && wsEditable()){ Object.assign(ws, keep); ws.dirty = true; wsEnsure(); }
  }
  const a = d.analysis, edit = wsEditable();
  if (!d.templates.some(t => t.id === ws.tab)) ws.tab = (d.templates[0] || {}).id;
  const t = d.templates.find(x => x.id === ws.tab);
  const batchOf = s => (d.samples.find(b => b.assignment_id === s.assignment_id) || {}).batch_no || '?';
  const maxSamples = Math.min(...d.templates.map(x => ((x.parameters || {}).samples || {}).max || 1));
  const perBatch = id2 => ws.inputs.samples.filter(s => s.assignment_id === id2).length;
  const acts = [];
  if (edit){
    acts.push(`<button class="btn btn-ghost" id="wsSave">Save draft</button>`);
    acts.push(`<button class="btn btn-primary" id="wsSubmit">${I.send} Submit</button>`);
  }
  if (hasLabRole('qc_supervisor') && a.status === 'submitted' && !a.is_mine) acts.push(`<button class="btn btn-primary" onclick="wsCheck()">Check / return</button>`);
  acts.push(`<a class="btn btn-ghost" href="#/lab/print/${a.id}">${I.print} Printable copy</a>`);
  if (hasLabRole('qc_manager') && a.status === 'checked') acts.push(`<button class="btn btn-ghost" onclick="wsSendBack()">Send back</button>`);
  return {
    title: `Worksheet #${a.id}`, crumb:'QC Laboratory',
    html: `${pageHead(`Worksheet #${a.id} - ${esc(TEST_TYPES[a.test_type] || a.test_type)}`, `${esc(a.product_name)} - ${esc(a.stage)} - analyst ${esc(a.analyst)} - ${wsBadge(a.status)}`, acts.join(''))}
      ${a.status === 'returned' ? `<div class="notice" style="margin-bottom:16px;color:var(--danger)">${I.alert} Returned by ${esc(a.returned_by || '')} ${a.returned_at ? fmtDateTime(a.returned_at) : ''}: <b>${esc(a.return_reason || '')}</b>. Every correction asks for a reason.</div>` : ''}
      ${!edit && !['submitted', 'checked'].includes(a.status) && !a.is_mine ? `<div class="notice" style="margin-bottom:16px">${I.info} Only the analyst of this worksheet can edit it.</div>` : ''}
      <div class="grid g2" style="margin-bottom:16px;align-items:start">
        <div class="card"><div class="card-h"><div><h3>Run details</h3><div class="sub">Every field on this worksheet is required to submit</div></div></div><div class="card-b"><div class="grid g2">
          <div class="field"><label>${a.test_type === 'microbiology' ? 'Instrument / incubator' : 'Instrument'}</label><select class="inp${wsMiss(ws.run.equipment_id)}" data-r="equipment_id" ${edit ? '' : 'disabled'}><option value="">Choose...</option>
            ${d.equipment.map(q => `<option value="${q.id}" ${String(ws.run.equipment_id) === String(q.id) ? 'selected' : ''}>${esc(q.eq_no)} ${esc(q.eq_type || '')}</option>`).join('')}</select></div>
          <div class="field"><label>${a.test_type === 'microbiology' ? 'Media / reagent lots' : 'Mobile phase / reagent lots'}</label><input class="inp${wsMiss(ws.run.reagents)}" data-r="reagents" value="${esc(ws.run.reagents)}" ${edit ? '' : 'disabled'}></div>
          <div class="field"><label>Analysis started</label><input class="inp${wsMiss(ws.run.started_on)}" type="date" data-r="started_on" value="${esc(ws.run.started_on || '')}" ${edit ? '' : 'disabled'}></div>
          <div class="field"><label>Analysis ended</label><input class="inp${wsMiss(ws.run.ended_on)}" type="date" data-r="ended_on" value="${esc(ws.run.ended_on || '')}" ${edit ? '' : 'disabled'}></div>
        </div></div></div>
        <div class="card"><div class="card-h"><div><h3>Samples</h3><div class="sub">One per batch; a validation batch may have up to ${maxSamples} (e.g. LS, MS, HS)</div></div></div>
          <div class="card-b">${ws.inputs.samples.map((s, si) => `<div class="row" style="gap:8px;margin-bottom:8px;flex-wrap:nowrap">
              <div style="flex:1" class="small">Batch <b class="mono">${esc(batchOf(s))}</b></div>
              <input class="inp" style="flex:1" data-k="samples.${si}.label" value="${esc(s.label)}" ${edit ? '' : 'disabled'} aria-label="Sample label">
              ${edit && ws.inputs.samples.findIndex(x => x.assignment_id === s.assignment_id) !== si ? `<button class="btn-icon" onclick="wsSample(${si},-1)" title="Remove sample">${I.x}</button>` : '<span style="width:32px"></span>'}</div>`).join('')}
            ${edit ? d.samples.filter(b => perBatch(b.assignment_id) < maxSamples).map(b => `<button class="btn btn-ghost btn-sm" onclick="wsSample(${b.assignment_id},1)">${I.plus} Sample for batch ${esc(b.batch_no)}</button>`).join(' ') : ''}
          </div></div>
      </div>
      <div class="tabs">${d.templates.map(x => `<div class="tab ${x.id === ws.tab ? 'active' : ''}" onclick="wsTab(${x.id})">${esc(x.api)}</div>`).join('')}</div>
      ${t ? wsApiPanel(t) : emptyState('alert', 'No method template', '')}
      <div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Results</h3><div class="sub">Calculated on the server from the values above (engine <span id="wsEngine">${esc((ws.calc || {}).engine_version || '')}</span>)</div></div>
        <span id="wsCalcState" class="small muted"></span></div><div id="wsResults" class="card-b"></div></div>
      <div class="card"><div class="card-h"><div><h3>Chromatograms</h3><div class="sub">PDF printouts from Empower / LabSolutions, stored in MinIO with a fingerprint (SHA-256). Files can be added, never replaced or deleted.</div></div>
        ${(a.is_mine && a.status !== 'checked') || hasLabRole('qc_supervisor') || hasLabRole('qc_manager')
          ? `<label class="btn btn-ghost btn-sm" style="cursor:pointer">${I.plus} Add PDF<input type="file" id="wsFile" accept="application/pdf" multiple style="display:none"></label>` : ''}</div>
        ${d.attachments.length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>File</th><th>Size</th><th>Uploaded</th><th>Fingerprint</th><th></th></tr></thead><tbody>
          ${d.attachments.map(f => `<tr><td>${I.doc} ${esc(f.file_name)}</td><td class="small">${(Number(f.size_bytes || 0) / 1024).toFixed(0)} KB</td>
            <td class="small">${esc(f.uploaded_by || '')}<div class="tiny muted">${fmtDateTime(f.uploaded_at)}</div></td>
            <td class="mono tiny" title="${esc(f.sha256)}">${esc(f.sha256.slice(0, 16))}...<div id="att-ver-${f.id}"></div></td>
            <td style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="labOpenFile(${f.id}, '${esc(f.sha256)}')">Open</button></td></tr>`).join('')}</tbody></table></div>`
          : `<div class="card-b">${emptyState('doc', 'No chromatograms yet', 'Add the PDF printouts of this run; the checker compares the typed areas with them.')}</div>`}
      </div>`,
    bind(){
      $$('[data-k]').forEach(el => {
        const ev = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(ev, () => { wsSet(el.dataset.k, el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || /label$/.test(el.dataset.k) ? el.value : el.value.replace(/,/g, '').trim()); ws.dirty = true; wsUnmark(el); wsCalcSoon(); });
      });
      $$('[data-r]').forEach(el => el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => { ws.run[el.dataset.r] = el.value; ws.dirty = true; wsUnmark(el); }));
      $$('[data-ws]').forEach(el => el.addEventListener('change', () => wsStdChange(el)));
      $$('.lab-areas, .lab-units').forEach(g => g.addEventListener('paste', e => {
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const vals = String(text).split(/[\s;\t]+/).map(x => x.replace(/,/g, '')).filter(x => x !== '' && !isNaN(Number(x)));
        if (vals.length < 2 || !wsEditable()) return;
        e.preventDefault();
        const boxes = $$('input', g), start = Math.max(0, boxes.indexOf(e.target));
        vals.forEach((v, i) => { if (boxes[start + i]){ boxes[start + i].value = v; wsSet(boxes[start + i].dataset.k, v); } });
        ws.dirty = true; wsCalcSoon(0);
      }));
      const fi = $('#wsFile'); if (fi) fi.onchange = () => wsUpload(Array.from(fi.files || []));
      const sv = $('#wsSave'); if (sv) sv.onclick = () => wsSave();
      const sb = $('#wsSubmit'); if (sb) sb.onclick = () => wsSubmit();
      wsPaint();
      if (edit && (!ws.calc || ws.dirty)) wsCalcSoon(0);
    }
  };
}
function wsTab(tid){ ws.tab = tid; render(); }
function wsUnmark(el){ if (String(el.value).trim() !== '') el.classList.remove('err'); }
function wsSplInj(si, tid, delta){
  const t = ws.ctx.templates.find(x => x.id === tid), v = ws.inputs.values[ws.inputs.samples[si].key], max = wsSplMax((t || {}).parameters || {});
  const lists = ws.ctx.analysis.test_type === 'assay' ? (v.preps[tid] || []).map(p => p.areas) : (v.units[tid] || []);
  const n = ((lists[0] || []).length || 1) + delta;
  if (n < 1 || n > max) return;
  lists.forEach(l => { if (delta > 0) while (l.length < n) l.push(''); else l.length = n; });
  ws.dirty = true; render(); wsCalcSoon(0);
}
// a working standard already saved on this worksheet is only changed with a reason (kept on the worksheet and in the audit trail)
function wsStdChange(el){
  const tid = el.dataset.ws, a = ws.inputs.apis[tid], to = el.value;
  const savedApi = ws.savedApis[tid] || {};
  const saved = String(savedApi.ws_id || ''), savedChanges = savedApi.ws_changes || [];
  const no = id => (ws.ctx.standards.find(w => String(w.id) === String(id)) || {}).ws_no || null;
  const apply = reason => {
    a.ws_changes = savedChanges.slice();
    if (reason) a.ws_changes.push({ from: saved, to, from_no: no(saved), to_no: no(to), reason, at: new Date().toISOString() });
    a.ws_id = to; ws.dirty = true; render(); wsCalcSoon(0);
  };
  if (!saved || to === saved){ apply(null); return; }
  el.value = String(a.ws_id || '');   // stays on the current standard until a reason is given
  openModal({ title: 'Reason for changing the standard', size: 'narrow',
    body: `<p class="small" style="margin-top:0">The saved standard is <b>${esc(no(saved) || '?')}</b>; you picked <b>${esc(no(to) || 'none')}</b>. The reason is kept on the worksheet and in the audit trail.</p>
      <div class="field"><label for="wsR">Why is the standard changing?</label><textarea class="inp" id="wsR" rows="3"></textarea></div><div class="err-msg hide" id="wsRE" style="color:var(--danger)"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="wsROk">Change standard</button>`,
    onMount: (w, close) => { $('#wsROk', w).onclick = () => {
      const r = $('#wsR', w).value.trim();
      if (!r){ const e2 = $('#wsRE', w); e2.textContent = 'Please give a reason.'; e2.classList.remove('hide'); return; }
      close(); apply(r);
    }; } });
}
function wsInj(tid, delta){
  const a = ws.inputs.apis[tid];
  if (delta > 0) a.std_areas.push(''); else a.std_areas.pop();
  ws.dirty = true; render(); wsCalcSoon(0);
}
function wsCuStage(key, tid, n){
  const u = ws.inputs.values[key].units[tid];
  const inj = (u[0] || ['']).length;   // the new caplets get as many injection boxes as the first one
  if (n === 30) while (u.length < 30) u.push(Array(inj).fill('')); else u.length = 10;
  ws.dirty = true; render(); wsCalcSoon(0);
}
function wsSample(arg, delta){
  const list = ws.inputs.samples;
  if (delta > 0){
    const n = list.filter(s => s.assignment_id === arg).length;
    const labels = ['LS', 'MS', 'HS', 'S4', 'S5'];
    list.push({ key: 'a' + arg + '_' + Date.now().toString(36), assignment_id: arg, label: labels[n] || 'S' + (n + 1) });
  } else {
    const s = list[arg]; list.splice(arg, 1); delete ws.inputs.values[s.key];
  }
  wsEnsure(); ws.dirty = true; render(); wsCalcSoon(0);
}
function wsCalcSoon(ms){
  if (!wsEditable()) return;
  clearTimeout(ws.timer);
  const st = $('#wsCalcState'); if (st) st.textContent = 'calculating...';
  ws.timer = setTimeout(async () => {
    const id = ws.id;
    try {
      const res = await labPost('/worksheet/calculate', { analysis_id: id, inputs: ws.inputs });
      if (!ws || ws.id !== id) return;
      ws.calc = res.calc; wsPaint();
    } catch (e) { const s2 = $('#wsCalcState'); if (s2) s2.textContent = 'could not calculate: ' + e.message; }
  }, ms === undefined ? 700 : ms);
}
function wsPaint(){
  const c = ws.calc, st = $('#wsCalcState');
  if (st) st.textContent = c ? (c.ok ? 'complete - ready to submit' : 'incomplete') : '';
  const eng = $('#wsEngine'); if (eng && c) eng.textContent = c.engine_version || '';
  const box = $('#wsResults'); if (!box) return;
  if (!c){ box.innerHTML = emptyState('chart', 'Nothing calculated yet', 'Enter the values above.'); return; }
  const test = ws.ctx.analysis.test_type;
  for (const t of ws.ctx.templates){
    const r = (c.apis || {})[t.id];
    const sst = $('#sst-' + t.id), just = $('#just-' + t.id);
    if (sst) sst.innerHTML = r && r.sst ? `%RSD <b class="tnum">${Number(r.sst.rsd_reported).toFixed(2)}%</b> (${esc(r.sst.limit_text)}) ${r.sst.pass ? `<span class="badge b-ok">Pass</span>` : `<span class="badge b-danger">Fail</span>`}` : '--';
    if (just) just.classList.toggle('hide', !(r && r.sst && !r.sst.pass) && !(ws.inputs.apis[t.id] || {}).sst_justification);
    ws.inputs.samples.forEach((s, si) => {
      const rs = r && r.samples ? r.samples[si] : null;
      const m = $(`#mean-${t.id}-${si}`);
      const v = ws.inputs.values[s.key] || {};
      if (test === 'assay'){
        if (m) m.innerHTML = rs ? `<span class="tnum">${num1(rs.reported)}%</span> ${verdictBadge(rs.pass)}` : '--';
        ((v.preps || {})[t.id] || []).forEach((p, pi) => {
          const el = $(`#pr-${t.id}-${si}-${pi}`); if (el) el.textContent = rs && rs.preparations[pi] ? num1(rs.preparations[pi].pct_reported) + '%' : '--';
        });
      } else if (test === 'dissolution' || test === 'content_uniformity'){
        const below = rs && rs.units_below ? rs.units_below : [];
        if (m) m.innerHTML = !rs || !rs.units ? '--' : test === 'dissolution'
          ? `mean <span class="tnum">${num1(rs.reported)}%</span> ${verdictBadge(rs.pass)}${below.length ? ` <span class="badge b-danger">caplet ${below.join(', ')} below ${esc(r.samples[si].limit_text || '')}</span>` : ''}`
          : `mean <span class="tnum">${num1(rs.mean_reported)}%</span> - AV <b class="tnum">${num1(rs.av_reported)}</b> ${rs.needs_l2 ? '<span class="badge b-warn">AV above 15: stage 2 needed</span>' : verdictBadge(rs.pass)}`;
        ((v.units || {})[t.id] || []).forEach((u, ui) => {
          const el = $(`#u-${t.id}-${si}-${ui}`); if (!el) return;
          const val = rs && rs.units_reported ? rs.units_reported[ui] : null;
          el.textContent = val == null ? '--' : num1(val) + '%';
          el.style.color = below.includes(ui + 1) ? 'var(--danger)' : '';
        });
      } else if (test === 'identification'){
        if (m) m.innerHTML = rs ? `difference <b class="tnum">${Number(rs.deviation_reported).toFixed(2)}%</b> ${verdictBadge(rs.pass)}` : '--';
      } else if (test === 'microbiology'){
        if (m) m.innerHTML = !rs ? '--' : r.pending ? '<span class="badge b-warn">Awaiting incubation</span>' : verdictBadge(rs.pass);
      }
    });
  }
  const errs = (c.errors || []).map(e => `<li>${e.api ? `<b>${esc(e.api)}:</b> ` : ''}${esc(e.message)}</li>`).join('');
  const blocked = (c.blocked || []).length ? `<div class="notice" style="color:var(--danger);margin-bottom:10px">${I.alert} System suitability failed for ${esc(c.blocked.join(', '))}: results are blocked until the run is repeated or a justification is entered.</div>` : '';
  box.innerHTML = `${blocked}${errs ? `<div class="small" style="margin-bottom:10px"><b>To complete:</b><ul style="margin:6px 0 0 18px">${errs}</ul></div>` : ''}
    ${(c.results || []).length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>API</th><th>Sample</th><th style="text-align:right">Reported</th><th>Limit</th><th></th></tr></thead><tbody>
      ${c.results.map(x => `<tr><td>${esc(x.api)}</td><td class="mono small">${esc(x.sample_label)}</td><td class="tnum strong" style="text-align:right">${num1(x.value_reported)}%</td>
        <td class="small muted">${esc(x.limit_text)}</td><td>${verdictBadge(x.pass)}</td></tr>`).join('')}</tbody></table></div>` : ''}`;
}
function wsBody(extra){
  return Object.assign({ analysis_id: ws.id, inputs: ws.inputs, equipment_id: ws.run.equipment_id, reagents: ws.run.reagents,
                         started_on: ws.run.started_on, ended_on: ws.run.ended_on }, extra || {});
}
async function wsSave(){
  const returned = ws.ctx.analysis.status === 'returned';
  const doSave = async reason => {
    const res = await labPost('/worksheet/save', wsBody({ reason }));
    ws.calc = res.calc; ws.dirty = false; ws.savedApis = JSON.parse(JSON.stringify(ws.inputs.apis)); wsPaint();
    toast('Saved', 'Your worksheet is saved as a draft.', 'ok');
  };
  if (!returned){ try { await doSave(''); } catch (e) { toast('Could not save', e.message, 'err'); } return; }
  openModal({ title: 'Reason for the correction', size: 'narrow',
    body: `<div class="field"><label for="svR">Why are these values changing?</label><textarea class="inp" id="svR" rows="3"></textarea></div><div class="err-msg hide" id="svE" style="color:var(--danger)"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="svOk">Save</button>`,
    onMount: (w, close) => { $('#svOk', w).onclick = async () => {
      const r = $('#svR', w).value.trim(), e2 = $('#svE', w);
      if (!r){ e2.textContent = 'Please give a reason.'; e2.classList.remove('hide'); return; }
      try { await doSave(r); close(); } catch (e) { e2.textContent = e.message; e2.classList.remove('hide'); }
    }; } });
}
function wsSubmit(){
  const returned = ws.ctx.analysis.status === 'returned';
  const run = [['equipment_id', 'instrument'], ['reagents', ws.ctx.analysis.test_type === 'microbiology' ? 'media / reagent lots' : 'mobile phase / reagent lots'],
               ['started_on', 'start date'], ['ended_on', 'end date']].filter(([k]) => !String(ws.run[k] || '').trim()).map(([, l]) => l);
  const calcOk = (ws.calc || {}).ok;
  if (run.length || !calcOk){
    ws.showMissing = true; render();
    toast('Not complete yet', run.length ? `Fill in the ${run.join(', ')} under Run details${calcOk ? '' : ', and the points listed under Results'}.` : 'Fill in the points listed under Results (empty boxes are marked in red).', 'err', 7000);
    return;
  }
  if (ws.run.ended_on < ws.run.started_on){ toast('Check the dates', 'The end date is before the start date.', 'err'); return; }
  signDialog({
    title: 'Submit worksheet', sub: `Worksheet #${ws.id} - complete`,
    ok: 'Sign as performed by', meaning: 'You sign as "Performed by" (analyst). The worksheet is then locked until it is checked or returned.',
    reason: returned ? 'Reason for the correction' : null, reasonRequired: returned,
    submit: async ({ password, reason }) => {
      const res = await labPost('/worksheet/submit', wsBody({ password, reason }));
      toast('Submitted', res.oos ? `${res.oos} result(s) out of specification: OOS entries opened.` : 'All results within specification.', res.oos ? 'err' : 'ok', 7000);
      labCache = {}; go('/lab/my');
    }
  });
}
function wsCheck(){
  signDialog({
    title: 'Check worksheet', sub: `Worksheet #${ws.id}: compare the typed values with the chromatograms`, ok: 'Sign',
    meaning: 'Checked = you sign as "Checked by" (QC Supervisor). Returned = it goes back to the analyst with your reason.',
    body: `<div class="radio-cards" style="margin-bottom:14px"><label class="radio-card"><input type="radio" name="ck" value="check" checked> Checked</label>
      <label class="radio-card"><input type="radio" name="ck" value="return"> Return for correction</label></div>`,
    reason: 'Reason (needed to return)',
    submit: async ({ password, reason, wrap }) => {
      const act = $('input[name=ck]:checked', wrap).value;
      if (act === 'return' && !reason) throw new Error('Say why it is returned.');
      await labPost('/worksheet/check', { analysis_id: ws.id, password, action: act, reason });
      toast(act === 'check' ? 'Checked' : 'Returned to the analyst', `Worksheet #${ws.id}`, 'ok'); labRefresh();
    }
  });
}
function wsSendBack(){
  signDialog({
    title: 'Send worksheet back', sub: `Worksheet #${ws.id} (QC Manager)`, ok: 'Sign and send back', reason: 'Reason', reasonRequired: true,
    body: `<div class="radio-cards" style="margin-bottom:14px"><label class="radio-card"><input type="radio" name="sbk" value="analyst" checked> To the analyst</label>
      <label class="radio-card"><input type="radio" name="sbk" value="supervisor"> To the QC Supervisor</label></div>`,
    submit: async ({ password, reason, wrap }) => {
      await labPost('/worksheet/send-back', { analysis_id: ws.id, password, to: $('input[name=sbk]:checked', wrap).value, reason });
      toast('Sent back', `Worksheet #${ws.id}`, 'ok'); labRefresh();
    }
  });
}


/* ---- chromatograms: upload (PDF -> server -> MinIO) and open with the fingerprint checked in the browser ---- */
function fileToBase64(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ''));
    r.onerror = () => reject(new Error('The file could not be read.'));
    r.readAsDataURL(file);
  });
}
async function wsUpload(files){
  if (!files.length) return;
  const id = ws.id;
  let done = 0;
  for (const f of files){
    if (f.size > 10 * 1024 * 1024){ toast('Too large', `${f.name} is larger than 10 MB.`, 'err'); continue; }
    try {
      toast('Uploading', f.name);
      await labPost('/attachment/upload', { analysis_id: id, file_name: f.name, content_type: f.type || 'application/pdf', data_base64: await fileToBase64(f) });
      done++;
    } catch (e) { toast('Not added: ' + f.name, e.message, 'err', 7000); }
  }
  if (done){ toast('Chromatograms added', `${done} file(s) stored with their fingerprint.`, 'ok'); delete labCache['/worksheet?id=' + id]; render(); }
}
async function labOpenFile(id, expected){
  const out = $('#att-ver-' + id);
  try {
    const res = await fetch(API_BASE + LAB + '/attachment?id=' + id, { headers: { Authorization: getToken() } });
    if (!res.ok){ let m = 'Could not open the file.'; try { m = (await res.json()).error || m; } catch (e) { /* not json */ } throw new Error(m); }
    const blob = await res.blob();
    let verdict = '';
    if (window.crypto && crypto.subtle){
      const hex = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()))).map(b => b.toString(16).padStart(2, '0')).join('');
      verdict = hex === expected ? 'ok' : 'bad';
    }
    if (out) out.innerHTML = verdict === 'ok' ? '<span class="badge b-ok">fingerprint verified</span>'
      : verdict === 'bad' ? '<span class="badge b-danger">FINGERPRINT MISMATCH</span>' : '';
    if (verdict === 'bad'){ toast('Fingerprint mismatch', 'This file is not the one that was uploaded. Report it to QA.', 'err', 10000); return; }
    const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) { toast('Could not open the file', e.message, 'err'); }
}

/* ============================================================ OOS log ============================================================ */
let oosOpenOnly = true;
function viewLabOos(){
  const d = labGet('/oos');
  if (!d) return labWait('OOS log', 'QC Laboratory');
  if (d.error) return labFail('OOS log', 'QC Laboratory', d.error);
  const rows = d.entries.filter(e => !oosOpenOnly || e.status === 'open');
  const qcm = hasLabRole('qc_manager');
  return {
    title:'OOS log', crumb:'QC Laboratory',
    html: `${pageHead('Out-of-specification log', 'Every result outside its limit. A batch cannot be decided while one of its entries is open; the investigation itself stays on paper.')}
      <div class="card"><div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px"><div class="row">
        <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="oosOpen" ${oosOpenOnly ? 'checked' : ''}> Open entries only</label>
        <span class="muted small">${d.entries.filter(e => e.status === 'open').length} open, ${d.entries.length} in total</span></div></div>
      ${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Raised</th><th>Request / Batch</th><th>API / Sample</th><th>Result</th><th>Status</th><th></th></tr></thead><tbody>
        ${rows.map(e => `<tr><td class="small">${fmtDateTime(e.raised_at)}${e.superseded ? '<div class="tiny muted">replaced by a correction</div>' : ''}</td>
          <td><a class="req-no" href="#/lab/request/${e.request_id}">${esc(e.request_no)}</a><div class="tiny muted">${esc(e.product_name)} ${esc(e.batch_no)}</div></td>
          <td>${esc(e.api)}<div class="tiny muted mono">${esc(e.sample_label)}</div></td>
          <td class="strong tnum" style="color:var(--danger)">${esc(resText(e))}<div class="tiny muted">${esc(e.limit_text || '')}</div></td>
          <td>${e.status === 'open' ? '<span class="badge b-danger">Open</span>' : `<span class="badge b-slate">${esc(e.outcome)}</span><div class="tiny muted">${esc(e.reference || '')} - ${esc(e.closed_by || '')}</div>`}</td>
          <td style="text-align:right">${qcm && e.status === 'open' ? `<button class="btn btn-ghost btn-sm" onclick="labOosClose(${e.id})">Close</button>` : ''}</td></tr>`).join('')}
        </tbody></table></div>` : `<div class="card-b">${emptyState('checkCircle', 'No entries', oosOpenOnly ? 'No open OOS entries.' : 'No OOS entries yet.')}</div>`}</div>`,
    bind(){ const c = $('#oosOpen'); if (c) c.onchange = () => { oosOpenOnly = c.checked; render(); }; }
  };
}
function labOosClose(id){
  const e = ((labCache['/oos'] || {}).entries || []).find(x => x.id === id); if (!e) return;
  signDialog({
    title: 'Close OOS entry', sub: `${e.request_no} - ${e.api} ${e.sample_label}: ${num1(e.value_reported)}${e.unit || ''} (${e.limit_text})`, ok: 'Sign and close',
    body: `<div class="radio-cards" style="margin-bottom:14px"><label class="radio-card"><input type="radio" name="oc" value="confirmed" checked> Confirmed OOS</label>
      <label class="radio-card"><input type="radio" name="oc" value="invalidated"> Invalidated</label></div>`,
    reason: 'Investigation number and reason', reasonRequired: true,
    submit: async ({ password, reason, wrap }) => {
      await labPost('/oos/close', { result_id: id, password, outcome: $('input[name=oc]:checked', wrap).value, reference: reason });
      toast('OOS entry closed', e.request_no, 'ok'); labRefresh();
    }
  });
}

/* ============================================================ Lab master data ============================================================ */
let mdTab = 'standards';
function viewLabMaster(){
  const d = labGet('/masterdata');
  if (!d) return labWait('Lab master data', 'QC Laboratory');
  if (d.error) return labFail('Lab master data', 'QC Laboratory', d.error);
  const ed = canEdit(), qa = hasLabRole('qa_manager') || hasLabRole('qa_supervisor');
  const tabs = [['standards', 'Working standards'], ['equipment', 'Equipment'], ['templates', 'Method templates']];
  let body = '';
  if (mdTab === 'standards'){
    body = `<div class="card"><div class="card-h"><div><h3>Working-standard register</h3><div class="sub">A standard without an expiry date, or past it, cannot be picked on a worksheet</div></div>
        ${ed ? `<button class="btn btn-primary btn-sm" onclick="mdStandard()">${I.plus} Add standard</button>` : ''}</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Number</th><th>Substance</th><th>Potency</th><th>Expiry</th><th>Usable today</th><th></th></tr></thead><tbody>
      ${d.standards.map(w => `<tr><td class="mono strong">${esc(w.ws_no)}</td><td>${esc(w.substance)}${w.notes ? `<div class="tiny muted">${esc(w.notes)}</div>` : ''}</td><td class="tnum">${esc(w.potency_pct)}%</td>
        <td>${fmtDate(w.expiry_date)}</td><td>${w.usable_today ? '<span class="badge b-ok">Yes</span>' : `<span class="badge b-danger">${!w.active ? 'Inactive' : w.expiry_date ? 'Expired' : 'No expiry date'}</span>`}</td>
        <td style="text-align:right">${ed ? `<button class="btn btn-ghost btn-sm" onclick="mdStandard(${w.id})">${I.edit} Edit</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
  } else if (mdTab === 'equipment'){
    body = `<div class="card"><div class="card-h"><h3>Equipment</h3>${ed ? `<button class="btn btn-primary btn-sm" onclick="mdEquipment()">${I.plus} Add equipment</button>` : ''}</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Number</th><th>Type</th><th>Description</th><th>Calibration due</th><th>Active</th><th></th></tr></thead><tbody>
      ${d.equipment.map(q => `<tr><td class="mono strong">${esc(q.eq_no)}</td><td>${esc(q.eq_type || '')}</td><td class="small">${esc(q.description || '')}</td><td>${fmtDate(q.calibration_due)}</td>
        <td>${q.active ? 'Yes' : 'No'}</td><td style="text-align:right">${ed ? `<button class="btn btn-ghost btn-sm" onclick="mdEquipment(${q.id})">${I.edit} Edit</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
  } else {
    body = `<div class="card"><div class="card-h"><div><h3>Method templates</h3><div class="sub">QC drafts, QA approves; an approved version is locked and every worksheet records the version it used</div></div>
        ${ed ? `<button class="btn btn-primary btn-sm" onclick="mdTemplate()">${I.plus} New template</button>` : ''}</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Product / Stage</th><th>Test / API</th><th>Version</th><th>Status</th><th>Drafted</th><th>Approved</th><th></th></tr></thead><tbody>
      ${d.templates.map(t => `<tr><td>${esc(t.product_name)}<div class="tiny muted">${esc(t.stage)}</div></td><td>${esc(TEST_TYPES[t.test_type] || t.test_type)}<div class="tiny muted">${esc(t.api)}</div></td>
        <td class="tnum">v${esc(t.version)}</td><td><span class="badge ${t.status === 'approved' ? 'b-ok' : t.status === 'draft' ? 'b-warn' : 'b-slate'}">${esc(t.status)}</span></td>
        <td class="small">${esc(t.drafted_by || 'setup')}<div class="tiny muted">${fmtDate(t.drafted_at)}</div></td><td class="small">${esc(t.approved_by || '--')}<div class="tiny muted">${t.approved_at ? fmtDate(t.approved_at) : ''}</div></td>
        <td style="text-align:right;white-space:nowrap"><button class="btn btn-ghost btn-sm" onclick="mdTemplateView(${t.id})">View</button>
          ${t.status === 'draft' && ed ? `<button class="btn btn-ghost btn-sm" onclick="mdTemplate(${t.id},'edit')">${I.edit} Edit</button>` : ''}
          ${t.status !== 'draft' && ed ? `<button class="btn btn-ghost btn-sm" onclick="mdTemplate(${t.id},'copy')">New version</button>` : ''}
          ${t.status === 'draft' && qa ? `<button class="btn btn-primary btn-sm" onclick="mdApprove(${t.id})">Approve</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  return {
    title:'Lab master data', crumb:'QC Laboratory',
    html: `${pageHead('Lab master data', 'Working standards, equipment and the locked method templates that replace the Excel sheets.')}
      ${!ed ? `<div class="notice" style="margin-bottom:16px">${I.info} Editing needs QSync edit access; template approval needs the QA Manager or QA Supervisor sign-off.</div>` : ''}
      <div class="tabs">${tabs.map(([k, l]) => `<div class="tab ${k === mdTab ? 'active' : ''}" onclick="mdTab='${k}';render()">${esc(l)}</div>`).join('')}</div>${body}`
  };
}
function mdSaveDialog(title, fields, kind, row){
  openModal({ title, size: 'narrow',
    body: fields.map(f => `<div class="field"><label for="md_${f[0]}">${esc(f[1])}</label>${f[2] === 'check'
        ? `<label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="md_${f[0]}" ${!row || row[f[0]] ? 'checked' : ''}> ${esc(f[3] || '')}</label>`
        : `<input class="inp" id="md_${f[0]}" type="${f[2] || 'text'}" value="${esc(row && row[f[0]] != null ? row[f[0]] : '')}">`}</div>`).join('')
      + (row ? `<div class="field"><label for="md_reason">Reason for the change</label><input class="inp" id="md_reason"></div>` : '')
      + `<div class="err-msg hide" id="mdErr" style="color:var(--danger)"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="mdOk">Save</button>`,
    onMount: (w, close) => { $('#mdOk', w).onclick = async () => {
      const body = { kind, id: row ? row.id : '' };
      fields.forEach(f => { const el = $('#md_' + f[0], w); body[f[0]] = f[2] === 'check' ? el.checked : el.value.trim(); });
      if (row) body.reason = $('#md_reason', w).value.trim();
      try { await labPost('/masterdata/save', body); close(); toast('Saved', '', 'ok'); labRefresh(); }
      catch (e) { const er = $('#mdErr', w); er.textContent = e.message; er.classList.remove('hide'); }
    }; } });
}
function mdStandard(id){
  const row = id ? (labCache['/masterdata'].standards || []).find(w => w.id === id) : null;
  mdSaveDialog(row ? 'Edit working standard' : 'Add working standard', [['ws_no', 'Standard number (e.g. WS/026/01)'], ['substance', 'Substance'],
    ['potency_pct', 'Potency (%)', 'number'], ['expiry_date', 'Expiry / re-test date', 'date'], ['notes', 'Notes'], ['active', 'Active', 'check', 'Can be used']], 'standard', row);
}
function mdEquipment(id){
  const row = id ? (labCache['/masterdata'].equipment || []).find(q => q.id === id) : null;
  mdSaveDialog(row ? 'Edit equipment' : 'Add equipment', [['eq_no', 'Equipment number (e.g. EQ/QC/029)'], ['eq_type', 'Type (e.g. HPLC)'], ['description', 'Description'],
    ['calibration_due', 'Calibration due', 'date'], ['active', 'Active', 'check', 'In use']], 'equipment', row);
}
function mdApprove(id){
  const t = (labCache['/masterdata'].templates || []).find(x => x.id === id); if (!t) return;
  signDialog({ title: 'Approve method template', sub: `${t.product_name} ${t.stage} - ${TEST_TYPES[t.test_type] || t.test_type} - ${t.api} v${t.version}`,
    ok: 'Sign approval', meaning: 'You approve this version for use (QA). It is then locked; the previous approved version is retired.',
    body: mdParamsHtml(t.parameters),
    submit: async ({ password }) => { await labPost('/template/approve', { id, password }); toast('Template approved', `${t.api} v${t.version}`, 'ok'); labRefresh(); } });
}
function mdParamsHtml(P){
  P = P || {};
  const kv = (k, v) => `<div class="kv-item"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`;
  const steps = s => (s || []).map((x, i) => (i === 0 ? `weight to ${x[1]} mL` : `${x[0]} to ${x[1]} mL`)).join(', ');
  return `<div class="kv-grid" style="margin-bottom:12px">${kv('Label claim', (P.label_claim_mg ?? '--') + ' mg')}${kv('Theoretical avg weight', ((P.avg_weight || {}).theoretical_mg ?? '--') + ' mg')}
    ${kv('Standard', `${(P.std || {}).nominal_mg ?? '--'} mg: ${steps((P.std || {}).steps)}`)}${kv('Sample', steps((P.sample || {}).steps))}
    ${kv('Standard injections', `${(P.std_injections || {}).min} to ${(P.std_injections || {}).max}`)}${kv('Preparations x injections', `${P.preparations} x ${P.injections}`)}
    ${kv('Samples per batch', `up to ${(P.samples || {}).max || 1}`)}${kv('Limits', `${(P.limits || {}).min}% to ${(P.limits || {}).max}%`)}
    ${kv('System suitability', `%RSD NMT ${(P.sst || {}).limit_rsd}%`)}${kv('Reported to', `${P.dp ?? 1} decimal place(s)`)}</div>`;
}
function mdTemplateView(id){
  const t = (labCache['/masterdata'].templates || []).find(x => x.id === id); if (!t) return;
  openModal({ title: `${t.api} - v${t.version} (${t.status})`, sub: `${t.product_name} ${t.stage} - ${TEST_TYPES[t.test_type] || t.test_type} - ${t.method_ref || ''} ${t.spec_ref || ''} ${t.form_ref || ''}`,
    body: mdParamsHtml(t.parameters) + (t.change_note ? `<div class="small muted">Change note: ${esc(t.change_note)}</div>` : ''),
    footer: `<button class="btn btn-ghost" data-close>Close</button>` });
}
function mdTemplate(id, mode){
  const md = labCache['/masterdata'];
  const src = id ? md.templates.find(x => x.id === id) : null;
  const P = (src && src.parameters) || { label_claim_mg:'', std:{ nominal_mg:'', steps:[[null, 100], [1, 1], [1, 1]] }, sample:{ nominal_mg:'', steps:[[null, 100], [1, 1], [1, 1]] },
    avg_weight:{ theoretical_mg:'' }, std_injections:{ min:5, max:6 }, samples:{ min:1, max:3 }, preparations:2, injections:2, sst:{ limit_rsd:2.0, dp:2 }, limits:{ min:90.0, max:110.0 }, dp:1 };
  const f = (id2, label, val, type) => `<div class="field"><label for="tp_${id2}">${esc(label)}</label><input class="inp" id="tp_${id2}" type="${type || 'number'}" step="any" value="${esc(val ?? '')}"></div>`;
  const stepRows = (pre, s) => [0, 1, 2].map(i => `<div class="row" style="gap:6px;flex-wrap:nowrap;margin-bottom:6px"><span class="small" style="width:70px">${i === 0 ? 'Weigh into' : 'Then take'}</span>
      ${i === 0 ? '' : `<input class="inp" id="tp_${pre}_t${i}" type="number" step="any" value="${esc((s[i] || [1])[0])}" style="width:90px"><span class="small">mL to</span>`}
      <input class="inp" id="tp_${pre}_v${i}" type="number" step="any" value="${esc((s[i] || [null, 1])[1])}" style="width:90px"><span class="small">mL</span></div>`).join('');
  const isNew = !src;
  openModal({ title: isNew ? 'New method template (draft)' : mode === 'edit' ? `Edit draft - ${src.api} v${src.version}` : `New version of ${src.api} (from v${src.version})`, size: 'wide',
    body: `${isNew ? `<div class="grid g2">
        <div class="field"><label for="tp_product">Product</label><select class="inp" id="tp_product">${(md.products || []).map(p => `<option>${esc(p)}</option>`).join('')}</select></div>
        <div class="field"><label for="tp_stage">Stage</label><select class="inp" id="tp_stage">${ALL_STAGES.map(s => `<option>${esc(s)}</option>`).join('')}</select></div>
        <div class="field"><label for="tp_test">Test</label><select class="inp" id="tp_test">${testOptions('assay')}</select></div>
        <div class="field"><label for="tp_api">API</label><input class="inp" id="tp_api" placeholder="e.g. Paracetamol"></div></div>` : ''}
      <div class="grid g3">${f('lc', 'Label claim (mg)', P.label_claim_mg)}${f('avg', 'Theoretical average weight (mg)', (P.avg_weight || {}).theoretical_mg)}${f('stdnom', 'Standard nominal weight (mg)', (P.std || {}).nominal_mg)}</div>
      <div class="grid g2"><div class="fieldset"><div class="sec-title">Standard dilution</div>${stepRows('std', (P.std || {}).steps || [])}</div>
        <div class="fieldset"><div class="sec-title">Sample dilution</div>${stepRows('spl', (P.sample || {}).steps || [])}</div></div>
      <div class="grid g4">${f('injmin', 'Std injections min', (P.std_injections || {}).min)}${f('injmax', 'Std injections max', (P.std_injections || {}).max)}
        ${f('preps', 'Preparations', P.preparations)}${f('inj', 'Injections per prep', P.injections)}
        ${f('smax', 'Samples per batch (max)', (P.samples || {}).max)}${f('min', 'Lower limit (%)', (P.limits || {}).min)}${f('max', 'Upper limit (%)', (P.limits || {}).max)}${f('rsd', 'SST %RSD limit', (P.sst || {}).limit_rsd)}</div>
      <div class="grid g3">${f('mref', 'Method ref', src ? src.method_ref : 'QC/MOA/FP/005', 'text')}${f('sref', 'Spec ref', src ? src.spec_ref : '', 'text')}${f('fref', 'Form / Excel ref', src ? src.form_ref : '', 'text')}</div>
      <div class="field"><label for="tp_note">Change note</label><input class="inp" id="tp_note" value="${esc(mode === 'edit' && src ? src.change_note || '' : '')}"></div>
      <div class="err-msg hide" id="tpErr" style="color:var(--danger)"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="tpOk">Save draft</button>`,
    onMount: (w, close) => { $('#tpOk', w).onclick = async () => {
      const v = k => $('#tp_' + k, w).value, n = k => (v(k) === '' ? null : Number(v(k)));
      const steps = pre => [0, 1, 2].map(i => (i === 0 ? [null, n(pre + '_v0')] : [n(pre + '_t' + i), n(pre + '_v' + i)]));
      const params = { label_claim_mg: n('lc'), std: { nominal_mg: n('stdnom'), steps: steps('std') }, sample: { nominal_mg: n('avg'), steps: steps('spl') },
        avg_weight: { theoretical_mg: n('avg') }, std_injections: { min: n('injmin'), max: n('injmax') }, samples: { min: 1, max: n('smax') || 1 },
        preparations: n('preps'), injections: n('inj'), sst: { limit_rsd: n('rsd'), dp: 2 }, limits: { min: n('min'), max: n('max') }, dp: (P.dp == null ? 1 : P.dp) };
      const body = { parameters: params, method_ref: v('mref'), spec_ref: v('sref'), form_ref: v('fref'), change_note: v('note') };
      if (isNew) Object.assign(body, { product_name: v('product'), stage: v('stage'), test_type: v('test'), api: v('api') });
      else if (mode === 'edit') body.id = src.id; else body.from_id = src.id;
      try { await labPost('/template/draft', body); close(); toast('Draft saved', 'QA approves it before it can be used.', 'ok'); labRefresh(); }
      catch (e) { const er = $('#tpErr', w); er.textContent = e.message; er.classList.remove('hide'); }
    }; } });
}

/* ============================================================ Printable worksheet and batch QC report ============================================================ */
// generated from the stored record (values typed + the server's calculation); the paper format numbers are kept for auditors
const FORM_TITLES = {
  'Granulation':      ['Granules Analytical Worksheet', 'QC/MOA/FP/005/F1-01', 'Granules Analysis Assessment Report', 'QC/MOA/FP/005/F3-01'],
  'Finished Product': ['Finished Product Analytical Worksheet', 'QC/MOA/FP/005/F2-01', 'Product Analysis Assessment Report', 'QC/MOA/FP/005/F4-01'],
};
function formFor(stage){ return FORM_TITLES[stage] || ['Analytical Worksheet', '', 'QC Analysis Report', '']; }
const nfix = (v, dp) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? '--' : Number(v).toFixed(dp));
function signBox(label, name, at){ return `<div class="sign-box"><div class="sl">${esc(label)}</div><div class="sv">${esc(name || '--')}</div><div class="ss">${at ? fmtDateTime(at) : '--'}</div></div>`; }
function resText(x){
  if (x.value_reported === null || x.value_reported === undefined) return x.unit ? String(x.unit).charAt(0).toUpperCase() + String(x.unit).slice(1) : '--';
  if (x.unit === '%') return num1(x.value_reported) + '%';
  if (x.unit === 'AV') return 'AV ' + num1(x.value_reported);
  if (x.unit === '% RT diff') return nfix(x.value_reported, 2) + '% RT difference';
  return `${x.value_reported} ${x.unit || ''}`.trim();
}
const verdictText = p => (p === true ? 'COMPLIES' : p === false ? 'DOES NOT COMPLY' : '--');
const testOfResult = n => TEST_TYPES[n] || 'Microbiology';

function printWorksheetHtml(d){
  const a = d.analysis, c = a.calc || {}, inp = a.inputs || {}, test = a.test_type, f = formFor(a.stage);
  const eq = d.equipment.find(q => String(q.id) === String(a.equipment_id));
  const samples = inp.samples || [];
  const hplc = ['assay', 'dissolution', 'content_uniformity'].includes(test);
  const parts = d.templates.map(t => {
    const P = t.parameters || {}, r = (c.apis || {})[t.id] || {}, x = (inp.apis || {})[t.id] || {};
    const ws = d.standards.find(w => String(w.id) === String(x.ws_id));
    let html = `<h4>${esc(t.api)} - template v${esc(t.version)}${t.form_ref ? ' (replaces ' + esc(t.form_ref) + ')' : ''}</h4>`;
    if (hplc){
      const s = r.sst || {};
      html += `<table><tr><th>Working standard</th><th>Potency</th><th>Weight</th><th>Dilution</th><th>Standard areas</th><th>Mean</th><th>%RSD</th><th>SST</th></tr>
        <tr><td>${esc(ws ? ws.ws_no : r.ws_no || '--')}</td><td>${esc(ws ? ws.potency_pct + '%' : '--')}</td><td>${esc(x.std_weight || '--')} mg</td>
          <td>${esc(stepsText((P.std || {}).steps, 'mg'))}</td><td class="mono">${esc((x.std_areas || []).filter(v => v !== '').join(', '))}</td>
          <td>${nfix(s.mean, 1)}</td><td>${nfix(s.rsd_reported, 2)}% (${esc(s.limit_text || '')})</td><td><b>${s.pass === true ? 'PASS' : s.pass === false ? 'FAIL' : '--'}</b></td></tr>
        ${x.sst_justification ? `<tr><td colspan="8">SST justification: ${esc(x.sst_justification)}</td></tr>` : ''}
        ${(x.ws_changes || []).map(ch => `<tr><td colspan="8">Working standard changed from ${esc(ch.from_no || '?')} to ${esc(ch.to_no || 'none')}${ch.at ? ' (' + fmtDateTime(ch.at) + ')' : ''}: ${esc(ch.reason)}</td></tr>`).join('')}</table>`;
    }
    if (test === 'assay'){
      html += `<table><tr><th>Sample</th><th>Average weight</th><th>Prep</th><th>Sample weight</th><th>Areas</th><th>% of label claim</th><th>Result (mean)</th><th>Limit</th><th>Verdict</th></tr>
        ${samples.map((sm, si) => { const v = (inp.values || {})[sm.key] || {}, preps = (v.preps || {})[t.id] || [], rs = (r.samples || [])[si] || {};
          return preps.map((p, pi) => `<tr>${pi === 0 ? `<td rowspan="${preps.length}">${esc(sm.label)}</td><td rowspan="${preps.length}">${esc(v.avg_weight || '--')} mg</td>` : ''}
            <td>${String.fromCharCode(97 + pi)}</td><td>${esc(p.weight || '--')} mg</td><td class="mono">${esc((p.areas || []).join(', '))}</td>
            <td>${nfix(((rs.preparations || [])[pi] || {}).pct_reported, 1)}%</td>
            ${pi === 0 ? `<td rowspan="${preps.length}"><b>${nfix(rs.reported, 1)}%</b><div class="tiny">${nfix(rs.mg_reported, 2)} mg</div></td><td rowspan="${preps.length}">${esc(r.limit_text || '')}</td>
              <td rowspan="${preps.length}"><b>${verdictText(rs.pass)}</b></td>` : ''}</tr>`).join(''); }).join('')}</table>`;
    } else if (test === 'dissolution' || test === 'content_uniformity'){
      samples.forEach((sm, si) => {
        const units = (((inp.values || {})[sm.key] || {}).units || {})[t.id] || [], rs = (r.samples || [])[si] || {};
        html += `<table><tr><th>Sample ${esc(sm.label)}</th>${units.map((u, i) => `<th>${i + 1}</th>`).join('')}</tr>
          <tr><td>Area${units.some(u => Array.isArray(u) && u.length > 1) ? 's (mean used)' : ''}</td>${units.map(u => `<td class="mono">${esc(Array.isArray(u) ? u.join(' / ') : u)}</td>`).join('')}</tr>
          <tr><td>${test === 'dissolution' ? '% dissolved' : '% of label claim'}</td>${units.map((u, i) => `<td>${nfix((rs.units_reported || [])[i], 1)}</td>`).join('')}</tr></table>
          <table><tr>${test === 'dissolution'
            ? `<th>Mean</th><th>Min</th><th>Max</th><th>Limit</th><th>Verdict</th></tr><tr><td><b>${nfix(rs.reported, 1)}%</b></td><td>${nfix(rs.min_unit, 1)}%</td><td>${nfix(rs.max_unit, 1)}%</td>
               <td>${esc(rs.limit_text || '')}${(rs.units_below || []).length ? ' - caplet ' + rs.units_below.join(', ') + ' below' : ''}</td><td><b>${verdictText(rs.pass)}</b></td>`
            : `<th>Stage</th><th>Mean (X)</th><th>SD</th><th>M</th><th>k</th><th>AV</th><th>Limit</th><th>Verdict</th></tr><tr><td>${esc(rs.stage || '--')}</td><td>${nfix(rs.mean_reported, 1)}%</td>
               <td>${nfix(rs.sd, 2)}</td><td>${nfix(rs.m, 1)}</td><td>${esc(rs.k || '--')}</td><td><b>${nfix(rs.av_reported, 1)}</b></td><td>${esc(rs.limit_text || '')}</td><td><b>${verdictText(rs.pass)}</b></td>`}</tr></table>`;
      });
    } else if (test === 'identification'){
      html += `<table><tr><th>Sample</th><th>Standard RT (min)</th><th>Sample RT (min)</th><th>Difference</th><th>Limit</th><th>Verdict</th></tr>
        ${samples.map((sm, si) => { const rs = (r.samples || [])[si] || {};
          return `<tr><td>${esc(sm.label)}</td><td>${esc(x.std_rt || '--')}</td><td>${esc((((inp.values || {})[sm.key] || {}).rt || {})[t.id] || '--')}</td>
            <td>${nfix(rs.deviation_reported, 2)}%</td><td>${esc(r.limit_text || '')}</td><td><b>${verdictText(rs.pass)}</b></td></tr>`; }).join('')}</table>`;
    } else if (test === 'microbiology'){
      html += `<table><tr><th>Sample</th><th>Parameter</th><th>Result</th><th>Limit</th><th>Verdict</th></tr>
        ${samples.map((sm, si) => ((r.samples || [])[si] || { rows: [] }).rows.map((row, ri) => `<tr>${ri === 0 ? `<td rowspan="${((r.samples || [])[si] || { rows: [] }).rows.length}">${esc(sm.label)}</td>` : ''}
          <td>${esc(row.label)}</td><td>${row.value === null ? 'awaiting' : esc(typeof row.value === 'number' ? row.value + ' cfu/g' : row.value)}</td><td>${esc(row.limit_text)}</td><td><b>${verdictText(row.pass)}</b></td></tr>`).join('')).join('')}</table>`;
    }
    return html;
  }).join('');
  return `<div class="sheet">
    <div class="letterhead">Orange Kalbe Limited - Quality Control Department</div>
    <div class="sheet-head"><div><h2>${esc(f[0])}</h2><div class="small">${esc(TEST_TYPES[test] || test)}</div></div>
      <div class="doc">${esc(f[1])}<br>Worksheet #${a.id}<br>Engine ${esc(c.engine_version || a.engine_version || '--')}</div></div>
    ${a.status !== 'checked' ? `<p><b>Status: ${esc((WS_STATUS[a.status] || [a.status])[0])}</b>${a.status === 'in_progress' ? ' - draft, not submitted' : ''}</p>` : ''}
    <h4>Analysis details</h4>
    <table class="kv"><tr><th>Product</th><td>${esc(a.product_name)}</td><th>Stage</th><td>${esc(a.stage)}</td></tr>
      <tr><th>Batch(es)</th><td>${esc(d.samples.map(b => b.batch_no).join(', '))}</td><th>Requests</th><td>${esc(d.samples.map(b => b.request_no).join(', '))}</td></tr>
      <tr><th>Instrument</th><td>${esc(eq ? eq.eq_no + ' ' + (eq.eq_type || '') : '--')}</td><th>Reagent / mobile phase lots</th><td>${esc(a.reagents || '--')}</td></tr>
      <tr><th>Started</th><td>${fmtDate(a.started_on)}</td><th>Ended</th><td>${fmtDate(a.ended_on)}</td></tr>
      <tr><th>Method</th><td>${esc([...new Set(d.templates.map(t => t.method_ref).filter(Boolean))].join(', ') || '--')}</td><th>Specification</th><td>${esc([...new Set(d.templates.map(t => t.spec_ref).filter(Boolean))].join(', ') || '--')}</td></tr></table>
    ${parts}
    ${d.attachments.length ? `<h4>Chromatograms</h4><table><tr><th>File</th><th>Fingerprint (sha256)</th><th>Uploaded</th></tr>${d.attachments.map(x => `<tr><td>${esc(x.file_name)}</td><td class="mono">${esc(x.sha256)}</td><td>${esc(x.uploaded_by)} ${fmtDateTime(x.uploaded_at)}</td></tr>`).join('')}</table>` : ''}
    <div class="sign-grid">${signBox('Performed by (analyst)', a.performed_by, a.performed_at)}${signBox('Checked by (QC Supervisor)', a.checked_by, a.checked_at)}</div>
    <p class="tiny" style="margin-top:14px">Generated by QSync from the stored record. Every value above was entered once; the results are those calculated and stored by the server (engine ${esc(c.engine_version || a.engine_version || '--')}). Signatures are electronic password sign-offs.</p>
  </div>`;
}
function viewLabPrint(id){
  const d = labGet('/worksheet?id=' + id);
  if (!d) return labWait('Worksheet', 'QC Laboratory');
  if (d.error) return labFail('Worksheet', 'QC Laboratory', d.error);
  return { title: `Worksheet #${id} - print`, crumb: 'QC Laboratory',
    html: `${pageHead(`Worksheet #${esc(id)} - printable copy`, '', `<button class="btn btn-primary" onclick="window.print()">${I.print} Print / save as PDF</button>
      <a class="btn btn-ghost" href="#/lab/worksheet/${esc(id)}">${I.chevL} Back to the worksheet</a>`)}${printWorksheetHtml(d)}` };
}

function labReportHtml(d){
  const r = d.request, f = formFor(r.stage), results = r.results || [];
  const live = r.assignments.filter(a => !a.cancelled);
  const names = k => [...new Set(live.map(a => a[k]).filter(Boolean))].join(', ');
  const at = k => live.map(a => a[k]).filter(Boolean).sort().slice(-1)[0];
  const allPass = results.length && results.every(x => x.pass === true);
  const oos = results.filter(x => x.oos_status);
  return `<div class="sheet">
    <div class="letterhead">Orange Kalbe Limited - Quality Control Department</div>
    <div class="sheet-head"><div><h2>${esc(f[2])}</h2><div class="small">Includes the Test Request Form "To be filled by QC" section (OKL/QAD/038/F1-00)</div></div>
      <div class="doc">${esc(f[3])}<br>Request No: ${esc(r.request_no)}</div></div>
    <h4>Batch details</h4>
    <table class="kv"><tr><th>Product</th><td>${esc(r.product_name)}</td><th>Batch No</th><td>${esc(r.batch_no)}</td></tr>
      <tr><th>Stage</th><td>${esc(r.stage)}</td><th>Tests required</th><td>${esc(r.test_required || '--')}</td></tr>
      <tr><th>Mfg Date</th><td>${fmtMonthYear(r.mfg_date)}</td><th>Exp Date</th><td>${fmtMonthYear(r.exp_date)}</td></tr>
      <tr><th>Sample received</th><td>${r.qc_received_at ? fmtDateTime(r.qc_received_at) : '--'}</td><th>Quantity</th><td>${r.qc_received_qty != null ? esc(r.qc_received_qty + ' ' + (r.qc_received_qty_unit || '')) : '--'}</td></tr></table>
    ${d.ipqa && d.ipqa.length ? `<h4>In-process (IPQA) results</h4><table><tr><th>Parameter</th><th>Observed</th><th>Specification</th><th>Status</th></tr>
      ${d.ipqa.map(p => `<tr><td>${esc(p.parameter)}</td><td>${esc(p.value)} ${esc(p.unit || '')}</td><td>${esc(p.spec || '')}</td><td><b>${esc(String(p.status || '').toUpperCase())}</b></td></tr>`).join('')}</table>` : ''}
    <h4>QC results</h4>
    <table><tr><th>Test</th><th>API / parameter</th><th>Sample</th><th>Result</th><th>Specification</th><th>Verdict</th></tr>
      ${results.length ? results.map(x => `<tr><td>${esc(testOfResult(x.result_name))}</td><td>${esc(x.api)}</td><td>${esc(x.sample_label)}</td><td><b>${esc(resText(x))}</b></td>
        <td>${esc(x.limit_text || '')}</td><td><b>${verdictText(x.pass)}</b></td></tr>`).join('') : '<tr><td colspan="6">No results yet.</td></tr>'}</table>
    ${oos.length ? `<h4>Out-of-specification entries</h4><table><tr><th>Result</th><th>Status</th><th>Outcome / investigation</th></tr>
      ${oos.map(x => `<tr><td>${esc(x.api)} ${esc(x.sample_label)}: ${esc(resText(x))}</td><td>${esc(x.oos_status)}</td><td>${esc((x.oos_outcome || '') + (x.oos_reference ? ' - ' + x.oos_reference : ''))}</td></tr>`).join('')}</table>` : ''}
    <h4>Conclusion</h4>
    <table class="kv"><tr><th>Results</th><td><b>${results.length ? (allPass ? 'Complies with the specification' : 'Does not comply with the specification') : '--'}</b></td>
      <th>QC decision</th><td><b>${r.qc_decision ? (r.qc_decision === 'released' ? 'Released for further processing' : 'Not released for further processing') : 'Pending'}</b>${r.qc_comments ? '<div class="tiny">' + esc(r.qc_comments) + '</div>' : ''}</td></tr></table>
    <div class="sign-grid">
      ${signBox('Received by (QC Supervisor)', r.qc_received_by, r.qc_received_at)}
      ${signBox('Performed by (analyst)', names('performed_by'), at('performed_at'))}
      ${signBox('Checked by (QC Supervisor)', names('checked_by'), at('checked_at'))}
      ${signBox('Approved by (QC Manager)', r.qc_manager, r.qc_manager_signed_at)}
      ${signBox('Reviewed by (QA Manager)', r.qa_manager, r.qa_manager_signed_at)}
    </div>
    ${r.qa_manager_comments ? `<p class="small">QA comments: ${esc(r.qa_manager_comments)}</p>` : ''}
    <p class="tiny" style="margin-top:14px">Generated by QSync from the stored record. Signatures are electronic password sign-offs; the full history of every change is kept in QSync.</p>
  </div>`;
}
function viewLabReport(id){
  const d = labGet('/request?id=' + id);
  if (!d) return labWait('QC report', 'QC Laboratory');
  if (d.error) return labFail('QC report', 'QC Laboratory', d.error);
  return { title: `QC report - ${d.request.request_no}`, crumb: 'QC Laboratory',
    html: `${pageHead(`QC report - ${esc(d.request.request_no)}`, '', `<button class="btn btn-primary" onclick="window.print()">${I.print} Print / save as PDF</button>
      <a class="btn btn-ghost" href="#/lab/request/${esc(id)}">${I.chevL} Back to the batch</a>`)}${labReportHtml(d)}` };
}

/* ---- routes ---- */
route('/lab/inbox', () => viewLabInbox());
route('/lab/request/:id', p => viewLabRequest(p.id));
route('/lab/my', () => viewLabMy());
route('/lab/worksheet/:id', p => viewLabWorksheet(p.id));
route('/lab/oos', () => viewLabOos());
route('/lab/master', () => viewLabMaster());
route('/lab/print/:id', p => viewLabPrint(p.id));
route('/lab/report/:id', p => viewLabReport(p.id));
