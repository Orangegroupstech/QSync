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
const TEST_TYPES = { assay:'Assay', dissolution:'Dissolution', content_uniformity:'Content uniformity', identification:'Identification', microbiology:'Microbiology',
                     weight_variation:'Weight variation', ph:'pH' };   // weight variation and pH: 058, engine 1.5.0
const CALCULATED_TESTS = Object.keys(TEST_TYPES);   // every test type has a calculation
const NEW_TESTS = ['weight_variation', 'ph'];       // offered only for a product that has an approved method for them

function labRoles(){ return (S && S.lab && S.lab.roles) || (S && S.signRoles) || []; }
// who may start a method template or a change (042): a QC Supervisor or a QA Supervisor
function isStarter(){ return hasLabRole('qc_supervisor') || hasLabRole('qa_supervisor'); }
function starterTitle(){ return hasLabRole('qc_supervisor') ? 'QC Supervisor' : 'QA Supervisor'; }
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
// labGen: an answer that left before the cache was cleared (an action, Refresh) is dropped, never shown as the new state:
// QC inbox kept showing the list from before an action until the whole page was reloaded (suggestion of 9 Nov 2026)
let labCache = {}, labLoading = {}, labGen = 0;
function labGet(path){
  if (labCache[path]) return labCache[path];
  if (!labLoading[path]){
    const gen = labGen;
    labLoading[path] = gen + 1;
    api(LAB + path).then(d => { if (gen !== labGen) return; labCache[path] = d; if (d && d.pending) S.pending = d.pending; })
      .catch(e => { if (gen === labGen) labCache[path] = { error: e.message }; })
      .finally(() => { if (labLoading[path] === gen + 1) delete labLoading[path]; render(); });
  }
  return null;
}
function labClear(){ labGen++; labCache = {}; labLoading = {}; }
// the server time a page's data was read: sent with a sign-off, so one on a page opened before a recall is refused (058)
function labSeen(path){ return ((labCache[path] || {}).now) || ''; }
function labRefresh(){ labClear(); if (typeof refreshPending === 'function') refreshPending();
  if (currentPath().startsWith('/lab/master')) api('/webhook/admin/api/bootstrap').then(b => { S.products = b.products || S.products; render(); }).catch(() => {});
  render(); }
// a tab's number: brand colour when something there waits for this person (042)
function tabCount(n, mine){ return `<span class="badge ${mine ? 'b-brand' : 'b-slate'}" style="margin-left:6px" ${mine ? `title="${mine} waiting for you"` : ''}>${mine ? mine : n}</span>`; }
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
      <div class="field"><label for="sgPw">Your password</label><input type="text" autocomplete="username" tabindex="-1" aria-hidden="true" data-okl-ac="1" value="${esc((S && S.me && S.me.name) || '')}" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0;padding:0"><input class="inp" id="sgPw" type="password" autocomplete="current-password">
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
  const t = String(r.test_required || '').toLowerCase(), out = [], has = x => (r.methods || []).includes(x);
  if (/assay/.test(t)) out.push('assay');
  if (/dissol/.test(t)) out.push('dissolution');
  if (/uniform/.test(t)) out.push('content_uniformity');
  if (/ident/.test(t)) out.push('identification');
  if (/micro/.test(t)) out.push('microbiology');
  if (/weight/.test(t) && has('weight_variation')) out.push('weight_variation');
  if (r.qc_ph && !out.includes('ph')) out.push('ph');   // Mintacid: "QC also tests pH" is on (Products and specs)
  return out.length ? out : ['assay'];
}
function analystOptions(analysts, sel){ return analysts.map(a => `<option value="${a.id}" ${String(sel) === String(a.id) ? 'selected' : ''}>${esc(a.name)}</option>`).join(''); }
function testOptions(sel, methods){
  return Object.entries(TEST_TYPES).filter(([k]) => !NEW_TESTS.includes(k) || k === sel || (methods || []).includes(k))
    .map(([k, v]) => `<option value="${k}" ${sel === k ? 'selected' : ''}>${esc(v)}</option>`).join('');
}
function testRowHtml(analysts, test, analyst, methods){
  return `<div class="row lab-test-row" style="gap:8px;margin-bottom:8px;flex-wrap:nowrap">
    <select class="inp" data-f="test_type" style="flex:1.2">${testOptions(test, methods)}</select>
    <select class="inp" data-f="analyst_id" style="flex:1.2"><option value="">Analyst...</option>${analystOptions(analysts, analyst)}</select>
    <input class="inp" data-f="due_date" type="date" style="flex:0.9" title="Due date (optional)">
    <button class="btn-icon" type="button" data-rm title="Remove">${I.x}</button></div>`;
}
function readTestRows(w){
  return $$('.lab-test-row', w).map(r => ({ test_type: $('[data-f=test_type]', r).value, analyst_id: Number($('[data-f=analyst_id]', r).value) || null,
                                             due_date: $('[data-f=due_date]', r).value }));
}
function bindTestRows(w, analysts, methods){
  const box = $('#rcTests', w);
  const wire = () => $$('[data-rm]', box).forEach(b => b.onclick = () => { b.closest('.lab-test-row').remove(); });
  $('#rcAdd', w).onclick = () => { box.insertAdjacentHTML('beforeend', testRowHtml(analysts, 'assay', '', methods)); wire(); };
  wire();
}

/* ============================================================ QC inbox ============================================================ */
/* ---- Recall (058): the person who sent something takes it back, with a reason, until the next person signs. The server decides
   who may and when; a sign-off on a page opened before the recall is refused. IPQA and QA Supervisor steps need no password. ---- */
const RECALL_WHAT = { ipqa:'your IPQA sheet', qa_review:'your QA approval', receipt:'your receipt of this sample', approval:'your approval for production',
  worksheet:'this worksheet', check:'your check of this worksheet', decision:'your decision', change:'this change request', template:'this method template' };
function labRecall(kind, id, label, after){
  const pw = !['ipqa', 'qa_review'].includes(kind);
  openModal({ title: 'Recall ' + (RECALL_WHAT[kind] || ''), sub: label || '', size: 'narrow',
    body: `<div class="notice" style="margin-bottom:12px">${I.info} It comes back to you to correct, and the person who was waiting is told by e-mail. You can recall only until they sign.</div>
      <div class="field"><label for="rcWhy">Why are you recalling it?</label><textarea class="inp" id="rcWhy" rows="3" placeholder="e.g. wrong dilution entered"></textarea></div>
      ${pw ? `<div class="field"><label for="rcPw">Your password</label><input type="text" autocomplete="username" tabindex="-1" aria-hidden="true" data-okl-ac="1" value="${esc((S && S.me && S.me.name) || '')}" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0;padding:0"><input class="inp" id="rcPw" type="password" autocomplete="current-password"></div>` : ''}
      <div class="err-msg hide" id="rcErr" style="color:var(--danger);font-size:12.5px"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-danger" id="rcOk">Recall</button>`,
    onMount: (w, close) => {
      setTimeout(() => $('#rcWhy', w).focus(), 30);
      $('#rcOk', w).onclick = async () => {
        const err = $('#rcErr', w), btn = $('#rcOk', w), why = $('#rcWhy', w).value.trim(), p = pw ? $('#rcPw', w).value : '';
        err.classList.add('hide');
        if (!why){ err.textContent = 'Say why you are recalling it.'; err.classList.remove('hide'); return; }
        if (pw && !p){ err.textContent = 'Enter your password.'; err.classList.remove('hide'); return; }
        btn.disabled = true;
        try {
          await labPost('/recall', { kind, id, reason: why, password: p });
          close(); toast('Recalled', 'It is back with you. The person who was waiting has been told.', 'ok');
          labRefresh();
          if (after) go(after);   // e.g. straight to the IPQA sheet to correct it
        } catch (e) { err.textContent = e.message; err.classList.remove('hide'); btn.disabled = false; }
      };
    } });
}
function recallBtn(kind, id, label, small, after){
  return `<button class="btn btn-ghost${small ? ' btn-sm' : ''}" onclick="event.stopPropagation();labRecall('${kind}', ${Number(id)}, ${esc(JSON.stringify(label || ''))}, ${esc(JSON.stringify(after || ''))})">${I.undo || I.chevL} Recall</button>`;
}

let inboxTab = 'waiting', inboxQ = '';
const IPQA_STATUS = { pending_ipqa: ['With IPQA', 'b-info'], returned_to_ipqa: ['Returned to IPQA', 'b-danger'], pending_qa_review: ['Waiting for QA review', 'b-warn'] };
const INBOX_TABS = [
  ['ipqa', 'With IPQA', null],   // 058: what is coming; IPQA opens the sheet from here
  ['waiting', 'Waiting for receipt', r => ['pending_qc_notify', 'sent_to_qc'].includes(r.status)],
  ['lab', 'In the lab', r => r.status === 'qc_received'],
  ['check', 'Worksheets to check', r => r.status === 'qc_received' && (r.assignments || []).some(a => !a.cancelled && a.analysis_status === 'submitted')],
  ['qcm', 'Waiting for QC Manager', r => labWaitsForQcm(r)],
  ['decided', 'Waiting for QA', r => ['qc_released', 'qc_not_released'].includes(r.status)],
  ['closed', 'Closed', r => r.status === 'qa_acknowledged'],
];
// the QC Manager's turn: every test checked (or a stage QC does not test), open OOS entries to close, then Released / Not released
function labWaitsForQcm(r){
  if (r.status !== 'qc_received') return false;
  const live = (r.assignments || []).filter(a => !a.cancelled);
  return live.length ? live.every(a => a.analysis_status === 'checked') : NO_TEST_STAGES.includes(r.stage);
}
function testsCell(r){
  const live = (r.assignments || []).filter(a => !a.cancelled);
  if (!live.length) return '<span class="muted small">--</span>';
  return live.map(a => `<div class="tiny" style="margin:2px 0">${esc(TEST_TYPES[a.test_type] || a.test_type)} - ${esc(a.analyst)} ${a.analysis_id ? wsBadge(a.analysis_status) : '<span class="muted">(not started)</span>'}</div>`).join('');
}
// rows the search hides: say so, with the search and a button to clear it
function hiddenBySearch(n){
  return `<div class="card-b">${emptyState('search', 'No match for "' + esc(inboxQ.trim()) + '"', n + ' in this list ' + (n === 1 ? 'is' : 'are') + ' hidden by the search.',
    `<button class="btn btn-primary" onclick="inboxQ='';render()">Clear the search</button>`)}</div>`;
}
function viewLabInbox(){
  const d = labGet('/inbox');
  if (!d) return labWait('QC inbox', 'QC Laboratory');
  if (d.error) return labFail('QC inbox', 'QC Laboratory', d.error);
  const q = inboxQ.trim().toLowerCase();
  const tab = INBOX_TABS.find(t => t[0] === inboxTab) || INBOX_TABS[1];
  const match = r => !q || [r.request_no, r.batch_no, r.product_name].join(' ').toLowerCase().includes(q);
  const rows = tab[2] ? d.requests.filter(tab[2]).filter(match) : [];
  const isSup = hasLabRole('qc_supervisor');
  const me = S && S.me ? S.me.id : null;
  // With IPQA (058): samples IPQA still has, or waiting for the QA Supervisor. IPQA fills the sheet from here; the QA Supervisor reviews.
  const ipqaRows = (d.ipqa || []).filter(match);
  const ipqaBody = ipqaRows.length ? `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Request</th><th>Product / Batch</th><th>Stage</th><th>Tests for QC</th><th>Status</th><th></th></tr></thead>
      <tbody>${ipqaRows.map(r => { const st = IPQA_STATUS[r.status] || [r.status, 'b-slate'];
        const act = (d.ipqa_role && ['pending_ipqa', 'returned_to_ipqa'].includes(r.status)) ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();go('/ipqa/${esc(r.request_no)}')">${r.status === 'returned_to_ipqa' ? 'Correct the sheet' : 'Fill the sheet'}</button>`
          : (d.qas_role && r.status === 'pending_qa_review') ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();go('/qa/${esc(r.request_no)}')">Review</button>` : '';
        const rec = r.status === 'pending_qa_review' && String(r.ipqa_signed_by_id) === String(me) ? recallBtn('ipqa', r.id, r.request_no, true, '/ipqa/' + r.request_no) : '';
        return `<tr class="clickable" onclick="go('/sheet/${r.id}')">
        <td data-label="Request"><div class="req-no">${esc(r.request_no)}</div><div class="tiny muted">raised ${relTime(r.created_at)}${r.requested_by ? ' by ' + esc(r.requested_by) : ''}</div></td>
        <td data-label="Product / Batch"><div class="strong">${esc(r.product_name)}</div><div class="tiny muted mono">${esc(r.batch_no)}</div></td>
        <td data-label="Stage"><span class="chip">${esc(r.stage)}</span></td>
        <td data-label="Tests for QC" class="small">${esc(r.test_required || '--')}</td>
        <td data-label="Status"><span class="badge ${st[1]}">${esc(st[0])}</span>${r.ipqa_signed_at ? `<div class="tiny muted" style="margin-top:3px">IPQA signed: ${esc(r.ipqa_signed_by || '')}, ${fmtDateTime(r.ipqa_signed_at)}</div>` : ''}${r.returns ? `<div class="tiny" style="color:var(--danger)">returned ${r.returns}x</div>` : ''}</td>
        <td style="text-align:right;white-space:nowrap">${act} ${rec}</td></tr>`; }).join('')}</tbody></table></div>`
    : (d.ipqa || []).length ? hiddenBySearch((d.ipqa || []).length)
    : `<div class="card-b">${emptyState('inbox', 'Nothing with IPQA', 'Samples appear here from the moment they are raised until the QA Supervisor approves them.')}</div>`;
  const body = !tab[2] ? ipqaBody : rows.length ? `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Request</th><th>Product / Batch</th><th>Stage</th><th>Tests</th><th>OOS</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows.map(r => `<tr class="clickable" onclick="go('/lab/request/${r.id}')">
        <td data-label="Request"><div class="req-no">${esc(r.request_no)}</div><div class="tiny muted">${r.qa_signed_at ? 'QA approved ' + relTime(r.qa_signed_at) : r.ipqa_signed_at ? 'IPQA sampled ' + relTime(r.ipqa_signed_at) + ', no QA review (' + esc(r.stage) + ')' : 'sent straight to QC (' + esc(r.stage) + ')'}</div></td>
        <td data-label="Product / Batch"><div class="strong">${esc(r.product_name)}</div><div class="tiny muted mono">${esc(r.batch_no)}</div></td>
        <td data-label="Stage"><span class="chip">${esc(r.stage)}</span></td>
        <td data-label="Tests">${testsCell(r)}</td>
        <td data-label="OOS">${r.open_oos ? `<span class="badge b-danger">${r.open_oos} open</span>` : '<span class="muted small">--</span>'}</td>
        <td data-label="Status">${labStatusBadge(r.status)}${r.qc_approved_at ? `<div class="tiny" style="margin-top:4px;color:var(--ok, #16794C)">${I.check || ''} Approved ${relTime(r.qc_approved_at)}</div>` : ''}</td>
        <td style="text-align:right;white-space:nowrap">${isSup && inboxTab === 'waiting'
          ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();labReceive(${r.id})">Receive</button>`
          : hasLabRole('qc_manager') && inboxTab === 'qcm'
          ? (r.open_oos ? `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();go('/lab/oos')">Close OOS</button>`
              : `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();go('/lab/request/${r.id}')">Open to decide</button>`)
          : isSup && inboxTab === 'check'
          ? [...new Set(r.assignments.filter(a => !a.cancelled && a.analysis_status === 'submitted').map(a => a.analysis_id))]
              .map(w => `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();go('/lab/worksheet/${w}')">Check #${w}</button>`).join(' ')
          : I.chevR}</td>
      </tr>`).join('')}</tbody></table></div>`
    : tab[2] && d.requests.filter(tab[2]).length ? hiddenBySearch(d.requests.filter(tab[2]).length)
    : `<div class="card-b">${emptyState('inbox', 'Nothing here', 'No requests in this list.')}</div>`;
  const qcmNote = '';   // method templates and changes are counted on Lab master data (042): the inbox is samples only
  return {
    title:'QC inbox', crumb:'QC Laboratory',
    html: `${pageHead('QC inbox', 'Batches QA approved for QC: receive the sample, assign the tests, follow them to release.',
              `<button class="btn btn-ghost" onclick="labRefresh()">${I.play} Refresh</button>`)}
      <div class="tabs">${INBOX_TABS.map(t => { const all = t[2] ? d.requests.filter(t[2]).length : (d.ipqa || []).length, mine = Number((((S.pending || {}).inbox) || {})[t[0]] || 0);
        return `<div class="tab ${t[0] === inboxTab ? 'active' : ''}" onclick="inboxTab='${t[0]}';render()">${esc(t[1])}${tabCount(all, mine)}</div>`; }).join('')}</div>
      <div class="card">
        <div class="card-b filter-bar" style="border-bottom:1px solid var(--line-2);padding:14px 18px"><div class="row">
          <div class="search filter-search"><span class="ic">${I.search}</span>
            <input class="inp" id="inboxQ" autocomplete="off" name="okl-inbox-search" style="padding-left:34px;border-radius:20px" placeholder="Search request, batch or product" value="${esc(inboxQ)}"></div>
          ${!isSup ? `<div class="hint">${I.info}<span>Receiving and assigning needs the QC Supervisor sign-off.</span></div>` : ''}
        </div></div>
        ${qcmNote}${body}
      </div>`,
    bind(){
      const el = $('#inboxQ');
      if (el) el.addEventListener('input', debounce(e => { inboxQ = e.target.value; render(); const x = $('#inboxQ'); if (x){ x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }, 260));
    }
  };
}

// stages QC receives but does not test (QC, 29 Oct 2026)
const NO_TEST_STAGES = ['Compression'];
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
  const noTest = NO_TEST_STAGES.includes(r.stage);   // QC receives it, does not test it
  signDialog({
    title: noTest ? 'Receive sample' : 'Receive sample and assign tests', sub: `${r.request_no} - ${r.product_name} batch ${r.batch_no} (${r.stage})`, size: 'wide',
    ok: noTest ? 'Sign as received' : 'Sign as received and assigned', meaning: noTest ? 'You sign as "Received by" (QC Supervisor). QC does not test this stage.' : 'You sign as "Received by" and "Assigned by" (QC Supervisor).',
    body: `<div class="small muted" style="margin-bottom:10px">Sample sent by IPQA: <b>${r.sample_qty ? esc(r.sample_qty + ' ' + (r.sample_qty_unit || '')) : '--'}</b></div>
      ${noTest ? `<div class="notice">${I.info} QC does not test ${esc(r.stage)}. Sign to confirm the sample is received; the QC Manager then releases it.</div>`
      : `<div class="field"><label>Tests to assign</label><div id="rcTests">${testTypesFromRequest(r).map(t => testRowHtml(analysts, t, '', r.methods)).join('')}</div>
        ${r.qc_ph ? `<div class="tiny muted" style="margin:-2px 0 8px">${I.info} pH is added because "QC also tests pH" is on for ${esc(r.product_name)} (Lab master data).</div>` : ''}
        <button class="btn btn-ghost btn-sm" type="button" id="rcAdd">${I.plus} Add a test</button>
        ${analysts.length ? '' : `<div class="hint">${I.alert}<span>No one has the analyst sign-off yet: give it in the Users console.</span></div>`}</div>`}`,
    onMount: w => { if (!noTest) bindTestRows(w, analysts, r.methods); },
    submit: async ({ password, wrap }) => {
      const tests = noTest ? [] : readTestRows(wrap);
      if (!noTest && !tests.length) throw new Error('Assign at least one test.');
      if (tests.some(t => !t.analyst_id)) throw new Error('Choose an analyst for every test.');
      await labPost('/receive', { request_id: id, password, assignments: tests, seen: labSeen('/request?id=' + id) || labSeen('/inbox') });
      toast('Received', noTest ? `${r.request_no}: received, no tests.` : `${r.request_no}: ${tests.length} test(s) assigned.`, 'ok');
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
  if (['qc_received', 'qc_released'].includes(st) && !r.qc_approved_at)
    step('The <b>QC Supervisor</b> approves the batch for production when the results are good (any time now, before or after the tests). It clears the batch on the shop floor and tells the supervisors on WhatsApp.',
      hasLabRole('qc_supervisor') ? `<button class="btn btn-primary btn-sm" onclick="labApprove(${r.id})">Approve</button>` : '');
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
    acts.push(`<button class="btn btn-primary" onclick="labReceive(${r.id})">${NO_TEST_STAGES.includes(r.stage) ? 'Receive' : 'Receive and assign'}</button>`);
  }
  if (hasLabRole('qc_supervisor') && st === 'qc_received'){
    [...new Set(r.assignments.filter(a => !a.cancelled && a.analysis_status === 'submitted' && String(a.analyst_id) !== String(S.me && S.me.id)).map(a => a.analysis_id))]
      .forEach(w => acts.push(`<a class="btn btn-primary" href="#/lab/worksheet/${w}">Check worksheet #${w}</a>`));
    if (!NO_TEST_STAGES.includes(r.stage)) acts.push(`<button class="btn btn-ghost" onclick="labChangeTests(${r.id})">${I.edit} Change tests</button>`);
  }
  if (hasLabRole('qc_supervisor') && ['qc_received', 'qc_released'].includes(st) && !r.qc_approved_at)
    acts.push(`<button class="btn btn-primary" onclick="labApprove(${r.id})">${I.check || ''} Approve</button>`);
  if (hasLabRole('qc_supervisor') && r.qc_approved_at && ['not_found', 'partial', 'error'].includes(r.floor_status))
    acts.push(`<button class="btn btn-ghost" onclick="labApproveFloor(${r.id})">Send to the shop floor again</button>`);
  if (hasLabRole('qc_manager') && st === 'qc_received') acts.push(`<button class="btn btn-primary" onclick="labDecide(${r.id})">Decide (QC Manager)</button>`);
  if (hasLabRole('qa_manager') && ['qc_released', 'qc_not_released'].includes(st)) acts.push(`<button class="btn btn-primary" onclick="labQaAck(${r.id})">Acknowledge (QA Manager)</button>`);
  // Recall (058): only the person who signed, only until the next person signs (the server checks again)
  const me = S && S.me ? String(S.me.id) : '', ids = r.ids || {}, mine = k => ids[k] != null && String(ids[k]) === me;
  const label = `${r.request_no} - ${r.product_name} ${r.batch_no}`;
  if (mine('received') && st === 'qc_received' && !r.qc_approved_at && !r.assignments.some(a => !a.cancelled && a.analysis_id)) acts.push(recallBtn('receipt', r.id, label));
  if (mine('approved') && r.qc_approved_at && !['ok', 'already_passed', 'partial'].includes(r.floor_status)) acts.push(recallBtn('approval', r.id, label));
  if (mine('decided') && ['qc_released', 'qc_not_released'].includes(st)) acts.push(recallBtn('decision', r.id, label));
  if (mine('qa') && ['pending_qc_notify', 'sent_to_qc'].includes(st)) acts.push(recallBtn('qa_review', r.id, label));

  const live = r.assignments.filter(a => !a.cancelled), cancelled = r.assignments.filter(a => a.cancelled);
  const results = r.results || [];
  // one line per step: "Name, 07 Nov 2026 06:29" (suggestion of 9 Nov 2026: the IPQA log date sits with the others)
  const one = (k, who, at, extra) => `<div class="kv-item"><div class="k">${k}</div><div class="v" style="font-size:13.5px">${who ? esc(who) + (at ? `<span class="muted">, ${fmtDateTime(at)}</span>` : '') : '--'}</div>${extra || ''}</div>`;
  const dec = r.qc_decision ? (r.qc_decision === 'released' ? 'Released' : 'Not released') + ': ' : '';
  return {
    title: r.request_no, crumb:'QC Laboratory',
    html: `${pageHead(`${r.request_no} - QC lab view`, `${esc(r.product_name)} - batch <span class="mono">${esc(r.batch_no)}</span> - ${esc(r.stage)}`, batchNav(r.id, 'lab') + acts.join(''))}
      <div class="card" style="margin-bottom:16px"><div class="card-b"><div class="kv-grid">
        <div class="kv-item"><div class="k">Status</div><div class="v">${labStatusBadge(st)}</div></div>
        ${one('Logged by IPQA', r.ipqa_signed_by, r.ipqa_signed_at, `<div class="tiny muted">Sample: ${r.sample_qty ? esc(r.sample_qty) + ' ' + esc(r.sample_qty_unit || '') : r.qc_received_qty != null ? esc(r.qc_received_qty) + ' ' + esc(r.qc_received_qty_unit || '') : '--'}</div>`)}
        ${one('QA Supervisor approved', r.qa_supervisor_signed_by, r.qa_supervisor_signed_at || r.qa_signed_at)}
        ${one('Received by QC', r.qc_received_by, r.qc_received_at)}
        ${one('Approved for production', r.qc_approved_by, r.qc_approved_at, (r.qc_approval_comments ? `<div class="tiny muted">${esc(r.qc_approval_comments)}</div>` : '')
          + (r.floor_note ? `<div class="tiny" style="margin-top:2px;color:${['ok', 'already_passed'].includes(r.floor_status) ? 'var(--ok, #16794C)' : r.floor_status === 'no_floor_stage' ? 'inherit' : 'var(--danger)'}">${esc(r.floor_note)}</div>` : ''))}
        ${one('QC Manager (release)', r.qc_decision ? dec + r.qc_manager : '', r.qc_manager_signed_at, r.qc_comments ? `<div class="tiny muted">${esc(r.qc_comments)}</div>` : '')}
        ${one('QA Manager acknowledged', r.qa_manager, r.qa_manager_signed_at, r.qa_manager_comments ? `<div class="tiny muted">${esc(r.qa_manager_comments)}</div>` : '')}
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
        ${d.ipqa.map(p => `<tr><td>${esc(p.parameter)}</td><td>${p.readings && p.readings.length && p.average != null && !/weights/.test(p.value || '') ? esc(p.average) + ' ' + esc(p.unit || '') + `<div class="tiny muted">average of ${p.readings.length}: ${esc(p.readings.join(', '))}</div>` : esc(p.value) + ' ' + esc(p.unit || '')}</td><td class="small">${esc(ipqaSpec(p))}</td><td>${esc(String(p.status || '').toUpperCase())}</td></tr>`).join('')}
        </tbody></table></div></div>` : ''}
      <div class="card" style="margin-bottom:16px"><div class="card-h"><h3>History</h3><div class="sub">The life of this batch, from the request to the end: one line per step</div></div>
        <div class="card-b">${(d.history || []).length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:0"><tbody>
          ${d.history.map(h => `<tr><td class="small muted" style="white-space:nowrap;width:1%">${fmtDateTime(h.at)}</td><td><span class="strong">${esc(h.what)}</span>${h.who ? ` <span class="muted">- ${esc(h.who)}</span>` : ''}${h.note ? `<div class="tiny muted">${esc(h.note)}</div>` : ''}</td></tr>`).join('')}
          </tbody></table></div>` : emptyState('activity', 'No history yet', '')}</div></div>
      <div class="card"><div class="card-h"><h3>Audit trail</h3><div class="sub">Every change, who made it, when and why (written by the database)</div></div>
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
      await labPost('/decide', { request_id: id, password, decision: dec, comments: $('#dcCom', wrap).value, seen: labSeen('/request?id=' + id) });
      toast('Decision signed', `${r.request_no}: ${dec === 'released' ? 'released' : 'not released'}.`, 'ok'); labRefresh();
    }
  });
}

// QC Supervisor: approve the batch for production (clears it on the shop floor, tells the supervisors' WhatsApp group)
function labApprove(id){
  const r = (labCache['/request?id=' + id] || {}).request; if (!r) return;
  const fails = (r.results || []).filter(x => x.pass === false).length, open = (r.assignments || []).filter(a => !a.cancelled && a.analysis_status !== 'checked').length;
  const floor = { Granulation: 'Granulation', Compression: 'Compression', Mixing: 'Mixing' }[r.stage];
  signDialog({
    title: 'Approve for production', sub: `${r.request_no} - ${r.product_name} batch ${r.batch_no} (${r.stage})`, ok: 'Sign approval',
    reason: 'Comment (optional)', meaning: 'You sign as QC Supervisor that this batch is approved for production. The QC Manager\'s Released / Not released stays as it is.',
    body: `<div class="small" style="margin-bottom:12px">${(r.results || []).length} result(s) so far${fails ? `, <b style="color:var(--danger)">${fails} out of specification</b>` : ''}${open ? `; ${open} test(s) not finished yet` : ''}.</div>
      <div class="notice" style="margin-bottom:12px">${I.info} ${floor ? `The batch is marked <b>Quality Passed</b> at ${floor} on the shop floor (cleared for the next stage), and` : 'The'} supervisors' WhatsApp group gets "QC approved", with Daniel tagged.</div>`,
    submit: async ({ password, reason }) => {
      const res = await labPost('/approve', { request_id: id, password, comments: reason, seen: labSeen('/request?id=' + id) || labSeen('/inbox') });
      const f = res.floor || {};
      toast('Approved', f.status === 'ok' || f.status === 'already_passed' || f.status === 'no_floor_stage' ? `${r.request_no}: approved.`
        : `${r.request_no}: approved, but the shop floor was not updated: ${f.message || 'unknown reason'}`, f.status === 'not_found' || f.status === 'error' ? 'warn' : 'ok');
      labRefresh();
    }
  });
}
async function labApproveFloor(id){
  try {
    const res = await labPost('/approve/floor', { request_id: id });
    const f = res.floor || {};
    toast(f.status === 'ok' || f.status === 'already_passed' ? 'Shop floor updated' : 'Shop floor not updated', f.message || (res.request || {}).floor_note || '', f.status === 'ok' || f.status === 'already_passed' ? 'ok' : 'warn');
    labRefresh();
  } catch (e){ toast('Could not send it', e.message, 'err'); }
}

function labQaAck(id){
  const r = (labCache['/request?id=' + id] || {}).request; if (!r) return;
  signDialog({
    title: 'QA acknowledgement', sub: `${r.request_no} - QC decision: ${r.qc_decision === 'released' ? 'Released' : 'Not released'} by ${r.qc_manager}`,
    ok: 'Sign acknowledgement', reason: 'Comments (optional)', meaning: 'You sign as QA Manager that you have reviewed and documented the QC decision. It does not change it.',
    submit: async ({ password, reason }) => {
      await labPost('/qa-ack', { request_id: id, password, comments: reason, seen: labSeen('/request?id=' + id) || labSeen('/inbox') });
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
        try { const res = await labPost('/worksheet/create', { assignment_ids: [...mySel] }); mySel.clear(); labClear(); go('/lab/worksheet/' + res.analysis_id); }
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
    if (hplc && techOf(P) !== 'uv_a1' && !Array.isArray(a.std_areas)) a.std_areas = Array(((P.std_injections || {}).max) || 6).fill('');   // UV fixed A1%: no standard
  }
  for (const s of inp.samples){
    const v = inp.values[s.key] = inp.values[s.key] || {};
    if (test === 'assay'){
      const theo = ((((ws.ctx.templates[0] || {}).parameters || {}).avg_weight) || {}).theoretical_mg;
      if (v.avg_weight === undefined) v.avg_weight = ws.ctx.analysis.stage === 'Granulation' && theo ? String(theo) : '';
      if (!v.preps || Array.isArray(v.preps)) v.preps = {};
    }
    if (test === 'dissolution' || test === 'content_uniformity'){ if (!v.units || Array.isArray(v.units)) v.units = {}; }
    if (test === 'identification'){ if (!v.rt || Array.isArray(v.rt)) v.rt = {}; if (!v.verdict || Array.isArray(v.verdict)) v.verdict = {}; }
    if (test === 'microbiology'){ if (!v.micro || Array.isArray(v.micro)) v.micro = {}; }
    if (test === 'weight_variation'){ if (!v.weights || Array.isArray(v.weights)) v.weights = {}; }
    if (test === 'ph'){ if (!v.ph || Array.isArray(v.ph)) v.ph = {}; }
    for (const t of ws.ctx.templates){
      const P = t.parameters || {};
      if (test === 'weight_variation'){   // 058: the number of units from the method (10 if it does not say)
        const w = v.weights[t.id] = Array.isArray(v.weights[t.id]) ? v.weights[t.id] : [];
        while (w.length < (Number((P.limits || {}).units) || 10)) w.push('');
      }
      if (test === 'ph'){ const r = v.ph[t.id] = Array.isArray(v.ph[t.id]) ? v.ph[t.id] : []; while (r.length < (Number(P.readings) || 1)) r.push(''); }
      if (test === 'assay'){
        const list = v.preps[t.id] = Array.isArray(v.preps[t.id]) ? v.preps[t.id] : [];
        while (list.length < (P.preparations || 1)) list.push({ weight:'', areas: [''] });   // 1 injection; each preparation can get a 2nd
        list.forEach(p => { if (!Array.isArray(p.areas)) p.areas = []; while (p.areas.length < wsSplMin(P)) p.areas.push(''); });   // 065: the method's least
      } else if (test === 'dissolution' || test === 'content_uniformity'){
        const n = test === 'dissolution' ? (P.units || 6) : 10;
        const u = v.units[t.id] = (Array.isArray(v.units[t.id]) ? v.units[t.id] : []).map(x => (Array.isArray(x) ? x : [x]));
        const inj = Math.max((u[0] && u[0].length) || 1, wsSplMin(P));   // every caplet of a sample has the same number of injections; 065: at least the method's least
        u.forEach(x => { while (x.length < inj) x.push(''); });
        while (u.length < n) u.push(Array(inj).fill(''));
        if (test === 'content_uniformity' && u.length > 10) u.length = 10;   // drafts from before 23 Oct 2026 could hold 30 (stage 2 is gone)
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
const wsSplMax = P => (typeof P.injections === 'object' && P.injections ? Number(P.injections.max) : P.injections) || 2;
// pi: one assay preparation (each preparation has its own injections); none: every caplet of the sample
function wsSplInjButtons(si, tid, n, P, pi){
  if (!wsEditable()) return '';
  const at = pi === undefined ? '' : ',' + pi, w = techWords(P);
  return `${n < wsSplMax(P) ? `<button class="btn btn-ghost btn-sm" onclick="wsSplInj(${si},${tid},1${at})">${I.plus} ${w.Reading}</button>` : ''}
    ${n > wsSplMin(P) ? `<button class="btn btn-ghost btn-sm" onclick="wsSplInj(${si},${tid},-1${at})">${I.x} Last ${w.reading}</button>` : ''}`;
}
// "1 to 2 injections per caplet ..." / "2 readings (A and B) per caplet; their mean is used."
function readingsHint(P, per){
  const w = techWords(P), lo = wsSplMin(P), hi = wsSplMax(P);
  const letters = Array.from({ length: hi }, (x, i) => String.fromCharCode(65 + i)).join(' and ');
  if (lo === hi) return `${hi} ${hi > 1 ? w.readings : w.reading} per ${per}` + (hi > 1 ? (techOf(P) === 'hplc' ? '' : ` (${letters})`) + '; their mean is used.' : '.');
  return `${lo} to ${hi} ${w.readings} per ${per}; with more than one, their mean is used.`;
}
// ---- technique of a method (065, same rule as the server's labTechnique): HPLC (peak areas, injections), UV with a measured
// standard, or UV with a fixed A1% (absorbance, readings; no standard). A method without it is HPLC, or UV A1% when a1pct is set.
const TECHNIQUES = [['hplc', 'HPLC (peak areas)'], ['uv_std', 'UV with a standard (absorbance)'], ['uv_a1', 'UV with a fixed A1% (absorbance, no standard)']];
function techOf(P){ P = P || {}; return ['hplc', 'uv_std', 'uv_a1'].includes(P.technique) ? P.technique : (P.a1pct != null && P.a1pct !== '' ? 'uv_a1' : 'hplc'); }
function techWords(P){
  return techOf(P) === 'hplc'
    ? { value: 'area', values: 'areas', Value: 'Area', reading: 'injection', readings: 'injections', Reading: 'Injection', Readings: 'Injections',
        std: 'Standard injection areas', spl: 'Sample peak areas', src: 'Empower', name: 'HPLC' }
    : { value: 'absorbance', values: 'absorbances', Value: 'Absorbance', reading: 'reading', readings: 'readings', Reading: 'Reading', Readings: 'Readings',
        std: 'Standard absorbance readings', spl: 'Sample absorbances', src: 'the UV printout', name: techOf(P) === 'uv_a1' ? 'UV, fixed A1%' : 'UV' };
}
// one box's placeholder: HPLC "injection 1", UV "reading A" / "reading B" (as on the Cypron sheet); a single box: "area" / "absorbance"
function readingLabel(P, i, n){ return n > 1 ? (techOf(P) === 'hplc' ? 'injection ' + (i + 1) : 'reading ' + String.fromCharCode(65 + i)) : techWords(P).value; }
// readings per preparation / unit from the method: a number n = 1 to n, or {min, max}; min = max means fixed (every box shown)
const wsSplMin = P => (P && P.injections && typeof P.injections === 'object' ? Number(P.injections.min) || 1 : 1);
// the dosage unit of a product's templates: 'tablet' (Procold) or 'caplet' (Mixagrip, Corhinza)
const unitWord = P => (P && P.dosage_form) || 'caplet';
const UnitWord = P => unitWord(P).charAt(0).toUpperCase() + unitWord(P).slice(1);
function stepsText(steps, firstUnit){
  return (steps || []).map((s, i) => (i === 0 ? (['caplet', 'tablet'].includes(firstUnit) ? `${s[0] || 1} ${firstUnit} in ${s[1]} mL` : `weighed (${firstUnit}) to ${s[1]} mL`)
    : (s[0] === 1 && s[1] === 1 ? null : `${s[0]} mL to ${s[1]} mL`))).filter(Boolean).join(', then ');
}
// the standards of other worksheets this one may reuse (058): same working standard, offered by the server (same API, last 7 days)
function wsStdSources(t){
  return Object.values(ws.ctx.std_sources || {}).filter(x => String(x.api || '').trim().toLowerCase() === String(t.api || '').trim().toLowerCase());
}
function wsUseStd(tid, key){
  const a = ws.inputs.apis[tid], src = (ws.ctx.std_sources || {})[key];
  if (src){
    a.std_from = { analysis_id: src.analysis_id, template_id: src.template_id };
    a.ws_id = src.ws_id; a.std_weight = src.std_weight; a.std_areas = (src.std_areas || []).slice();   // shown as they are; the server uses the source's stored values
    ['sst_tailing', 'sst_resolution', 'sst_justification'].forEach(k => { if (src[k] != null) a[k] = src[k]; else delete a[k]; });
  } else {
    delete a.std_from; a.std_weight = ''; a.std_areas = Array((((ws.ctx.templates.find(x => x.id === Number(tid)) || {}).parameters || {}).std_injections || {}).max || 6).fill('');
  }
  ws.dirty = true; render(); wsCalcSoon(0);
}
function wsStandardCard(t, extraSub){
  const P = t.parameters || {}, tid = t.id, a = ws.inputs.apis[tid];
  // UV with a fixed specific absorbance (e.g. Cypron, A1% 355): nothing to measure for the standard (058)
  if (techOf(P) === 'uv_a1') return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(t.api)} - UV, fixed A1% ${esc(P.a1pct)}</h3>
      <div class="sub">Template v${esc(t.version)} ${esc(t.method_ref || '')} - label claim ${esc(P.label_claim_mg)} mg${extraSub ? ' - ' + esc(extraSub) : ''}</div></div></div>
    <div class="card-b"><div class="notice">${I.info} This method uses the specific absorbance A(1%, 1 cm) = <b>${esc(P.a1pct)}</b> instead of a measured standard: no standard to weigh or read. Enter the sample absorbances below.</div></div></div>`;
  const ro = wsEditable() ? '' : 'disabled';
  const offers = wsStdSources(t), from = a.std_from;
  if (from){
    const src = (ws.ctx.std_sources || {})[from.analysis_id + ':' + from.template_id];
    return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(t.api)} - standard (reused)</h3>
        <div class="sub">Template v${esc(t.version)} ${esc(t.method_ref || '')} - label claim ${esc(P.label_claim_mg)} mg${extraSub ? ' - ' + esc(extraSub) : ''}</div></div>
        ${wsEditable() ? `<button class="btn btn-ghost btn-sm" onclick="wsUseStd(${tid}, '')">Enter my own standard</button>` : ''}</div>
      <div class="card-b">
        <div class="notice" style="margin-bottom:12px">${I.info} The standard of <b>${esc(src ? src.label : 'worksheet #' + from.analysis_id)}</b>${src ? ` (${esc(src.analyst || '')}, ${esc(src.status || '')})` : ''}: the same solution, weight, dilution and injections. If that worksheet is corrected, this one recalculates.</div>
        ${src ? `<div class="grid g3"><div class="kv-item"><div class="k">Working standard</div><div class="v">${esc(src.ws_no)}</div></div>
          <div class="kv-item"><div class="k">Standard weight</div><div class="v">${esc(src.std_weight)} mg</div></div>
          <div class="field"><label>System suitability</label><div id="sst-${tid}" class="small" style="padding-top:8px">--</div></div></div>
          <div class="small muted">${esc(techWords(P).std)}: ${(src.std_areas || []).map(x => esc(x)).join(', ')}</div>` : `<div class="notice" style="color:var(--danger)">${I.alert} That worksheet's standard cannot be used any more. Enter your own standard.</div>`}
      </div></div>`;
  }
  const stds = ws.ctx.standards.filter(w => !t.api || String(w.substance).toLowerCase() === String(t.api).toLowerCase());
  const stdList = stds.length ? stds : ws.ctx.standards;
  const inj = P.std_injections || {};
  const lim = P.limits || {};
  const limTxt = ws.ctx.analysis.test_type === 'content_uniformity' ? `AV NMT ${P.l1 || 15}` : lim.max != null ? `limit ${lim.min}% to ${lim.max}%` : `NLT ${lim.min}%`;
  const W = techWords(P);
  return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(t.api)} - standard${techOf(P) === 'uv_std' ? ' (UV)' : ''}</h3>
      <div class="sub">Template v${esc(t.version)} ${esc(t.method_ref || '')} - label claim ${esc(P.label_claim_mg)} mg - ${esc(limTxt)}${extraSub ? ' - ' + esc(extraSub) : ''}</div></div></div>
    <div class="card-b">
      ${wsEditable() && offers.length ? `<div class="field"><label>Reuse a standard already run (same working standard)</label>
        <select class="inp" onchange="wsUseStd(${tid}, this.value)"><option value="">No: I enter this worksheet's own standard</option>
          ${offers.map(o => `<option value="${esc(o.analysis_id + ':' + o.template_id)}">${esc(o.label)}${o.started_on ? ' - ' + esc(fmtDate(o.started_on)) : ''}</option>`).join('')}</select>
        <div class="hint">${I.info}<span>Pick it when this test was run with the same standard solution as that worksheet: its weight, dilution and injection areas are used, nothing is typed again.</span></div></div>` : ''}
      <div class="grid g3">
        ${ws.try ? `<div class="field"><label>Standard purity (%) from the Excel sheet</label>${inpNum(`apis.${tid}.try_purity`, 'placeholder="e.g. 99.62"')}</div>` : `<div class="field"><label>Working standard</label><select class="inp${wsMiss(a.ws_id)}" data-ws="${tid}" ${ro}><option value="">Choose...</option>
          ${stdList.map(w => `<option value="${w.id}" ${String(a.ws_id) === String(w.id) ? 'selected' : ''} ${w.usable ? '' : 'disabled'}>${esc(w.ws_no)} - ${esc(w.substance)} - ${esc(w.potency_pct)}%${w.usable ? ' (exp ' + fmtDate(w.expiry_date) + ')' : ' (cannot be used: ' + (w.expiry_date ? 'expired' : 'no expiry date') + ')'}</option>`).join('')}</select></div>`}
        <div class="field"><label>Standard weight (mg)</label>${inpNum(`apis.${tid}.std_weight`, 'placeholder="' + esc((P.std || {}).nominal_mg || '') + '"')}
          <div class="hint">${I.info}<span>${esc(stepsText((P.std || {}).steps, 'mg'))}</span></div></div>
        <div class="field"><label>System suitability</label><div id="sst-${tid}" class="small" style="padding-top:8px">--</div></div>
      </div>
      <div class="field"><label>${esc(W.std)} (${inj.min === inj.max ? inj.min : `${inj.min || 1} to ${inj.max || ''}`} ${W.readings})</label>
        <div class="lab-areas" data-group="apis.${tid}.std_areas">${a.std_areas.map((v, i) => inpNum(`apis.${tid}.std_areas.${i}`, `placeholder="${i + 1}"`)).join('')}</div>
        ${wsEditable() ? `<div class="row" style="margin-top:6px">${a.std_areas.length < (inj.max || 6) ? `<button class="btn btn-ghost btn-sm" onclick="wsInj(${tid},1)">${I.plus} ${W.Reading}</button>` : ''}
          ${a.std_areas.length > (inj.min || 1) ? `<button class="btn btn-ghost btn-sm" onclick="wsInj(${tid},-1)">${I.x} Last ${W.reading}</button>` : ''}
          <span class="hint">${I.info}<span>Tip: paste a column of ${W.values} from ${W.src} into the first box. System suitability shows as soon as they are in.</span></span></div>` : ''}</div>
      ${sstExtraFields(P, tid)}
      ${(a.ws_changes || []).length ? `<div class="notice" style="margin-bottom:12px">${I.info} <span>${a.ws_changes.map(c => `Standard changed from <b>${esc(c.from_no || '?')}</b> to <b>${esc(c.to_no || 'none')}</b>${c.at ? ' on ' + fmtDateTime(c.at) : ''}: ${esc(c.reason)}`).join('<br>')}</span></div>` : ''}
      <div class="field hide" id="just-${tid}"><label>System suitability failed: supervisor's justification (or repeat the run)</label>
        <textarea class="inp" data-k="apis.${tid}.sst_justification" rows="2" ${ro}>${esc(a.sst_justification || '')}</textarea></div>
    </div></div>`;
}
// tailing factor / resolution: typed in from the chromatography report, only when the method template sets the limit
function sstExtraFields(P, tid){
  const q = P.sst || {}, f = [];
  if (q.tailing_max != null && q.tailing_max !== '') f.push(`<div class="field"><label>Tailing factor (NMT ${esc(Number(q.tailing_max).toFixed(1))})</label>${inpNum(`apis.${tid}.sst_tailing`, 'placeholder="e.g. 1.2"')}</div>`);
  if (q.resolution_min != null && q.resolution_min !== '') f.push(`<div class="field"><label>Resolution (NLT ${esc(Number(q.resolution_min).toFixed(1))})</label>${inpNum(`apis.${tid}.sst_resolution`, 'placeholder="e.g. 3.5"')}</div>`);
  return f.length ? `<div class="grid g3">${f.join('')}</div>` : '';
}
// the optional SST checks in words: "Tailing 1.2 (NMT 2.0) Pass"
function sstExtraText(s, html){
  return ['tailing', 'resolution'].filter(k => s && s[k]).map(k => { const x = s[k], name = k === 'tailing' ? 'Tailing factor' : 'Resolution';
    return html ? `<span><span class="muted">${name}</span> <b class="tnum">${esc(x.value)}</b> <span class="muted">(${esc(x.limit_text)})</span> ${x.pass ? '<span class="badge b-ok">Pass</span>' : '<span class="badge b-danger">Fail</span>'}</span>`
      : `${name} ${x.value} (${x.limit_text}) ${x.pass ? 'pass' : 'FAIL'}`; }).join(html ? '' : '; ');
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
          <div class="field" style="max-width:260px"><label>Average weight (mg${ws.ctx.analysis.stage === 'Granulation' ? ', granules: theoretical' : ', measured'})</label>${inpNum(`values.${s.key}.avg_weight`, 'placeholder="mg"')}
            <div class="hint">${I.info}<span>Shared by the three APIs of this sample.</span></div></div>
          <div class="tbl-wrap"><table class="tbl" style="min-width:0" data-nosort><thead><tr><th>Prep</th><th>Sample weight (mg)</th><th>${esc(techWords(P).spl)}</th><th style="text-align:right">% of label claim</th></tr></thead><tbody>
          ${preps.map((p, pi) => `<tr><td class="strong">${String.fromCharCode(97 + pi)}</td>
            <td style="width:150px">${inpNum(`values.${s.key}.preps.${tid}.${pi}.weight`)}</td>
            <td><div class="row" style="gap:6px;flex-wrap:wrap"><div class="lab-areas" data-group="values.${s.key}.preps.${tid}.${pi}.areas">${p.areas.map((x, ii) => inpNum(`values.${s.key}.preps.${tid}.${pi}.areas.${ii}`, `placeholder="${esc(readingLabel(P, ii, p.areas.length))}"`)).join('')}</div>
              ${wsSplInjButtons(si, tid, p.areas.length, P, pi)}</div></td>
            <td style="text-align:right" class="tnum strong" id="pr-${tid}-${si}-${pi}">--</td></tr>`).join('')}
          </tbody></table></div>
          ${wsEditable() ? `<div class="hint" style="margin-top:8px">${I.info}<span>${esc(readingsHint(P, 'preparation'))}</span></div>` : ''}
        </div></div>`;
    }).join('');
  }
  if (test === 'dissolution' || test === 'content_uniformity'){
    const diss = test === 'dissolution';
    const sub = diss ? `${P.medium_ml || 900} mL medium` : '';
    return wsStandardCard(t, sub) + samples.map((s, si) => {
      const units = ws.inputs.values[s.key].units[tid];
      return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(t.api)} - sample ${esc(s.label)}</h3>
          <div class="sub">${diss ? `One ${unitWord(P)} per vessel: ${esc(stepsText((P.sample || {}).steps, unitWord(P)))}` : `One ${unitWord(P)} each: ${esc(stepsText((P.sample || {}).steps, unitWord(P)))}`}
            ${!diss ? ` - 10 ${unitWord(P)}s, AV NMT ` + esc(P.l1 || 15) : ''}</div></div>
          <div id="mean-${tid}-${si}" class="strong" style="text-align:right">--</div></div>
        <div class="card-b">
          <div class="lab-units" data-group="values.${s.key}.units.${tid}">${units.map((x, ui) => `<div class="lab-unit"><div class="tiny muted">${UnitWord(P)} ${ui + 1}</div>
            ${x.map((y, ii) => inpNum(`values.${s.key}.units.${tid}.${ui}.${ii}`, `placeholder="${esc(readingLabel(P, ii, x.length))}"`)).join('')}<div class="tiny tnum strong" id="u-${tid}-${si}-${ui}">--</div></div>`).join('')}</div>
          ${wsEditable() ? `<div class="row" style="margin-top:10px">${wsSplInjButtons(si, tid, (units[0] || ['']).length, P)}
            <span class="hint">${I.info}<span>${esc(readingsHint(P, unitWord(P)))}</span></span></div>` : ''}

          <div class="hint" style="margin-top:8px">${I.info}<span>Tip: paste the column of ${unitWord(P)} ${techWords(P).values} from ${techWords(P).src} into the first box${(units[0] || []).length > 1 ? ` (${unitWord(P)} 1 ${readingLabel(P, 0, 2)}, ${unitWord(P)} 1 ${readingLabel(P, 1, 2)}, ${unitWord(P)} 2 ...)` : ''}.</span></div>
        </div></div>`;
    }).join('');
  }
  if (test === 'identification'){
    return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(t.api)} - identification (HPLC)</h3>
        <div class="sub">Template v${esc(t.version)} - record the retention times; you decide whether the sample complies</div></div></div>
      <div class="card-b"><div class="grid g3">
        <div class="field"><label>Standard retention time (min)</label>${inpNum(`apis.${tid}.std_rt`)}</div>
        ${samples.map((s, si) => { const vd = ((ws.inputs.values[s.key] || {}).verdict || {})[tid] || '';
          return `<div class="field"><label>Sample ${esc(s.label)} retention time (min)</label>${inpNum(`values.${s.key}.rt.${tid}`)}
          <label style="margin-top:10px">Sample ${esc(s.label)}: your conclusion</label>
          <select class="inp${wsMiss(vd)}" data-k="values.${s.key}.verdict.${tid}" ${ro}>${[['', 'Choose...'], ['complies', 'Complies'], ['does_not_comply', 'Does not comply']]
            .map(([k, l]) => `<option value="${k}" ${vd === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
          <div class="small" id="mean-${tid}-${si}" style="margin-top:6px">--</div></div>`; }).join('')}
      </div></div></div>`;
  }
  if (test === 'microbiology'){
    const L = P.limits || {};
    return samples.map((s, si) => `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Microbiology - sample ${esc(s.label)}</h3>
        <div class="sub">Template v${esc(t.version)} - leave a field blank while it is incubating (you can save; you can submit once everything is in)</div></div>
        <div id="mean-${tid}-${si}" class="strong">--</div></div>
      <div class="card-b"><div class="grid g3">
        ${(L.counts || []).map(c => `<div class="field"><label>${esc(c.label)} (${esc(L.unit || 'cfu/g')}, NMT ${esc(c.max)})</label>${inpNum(`values.${s.key}.micro.${c.key}`)}</div>`).join('')}
        ${(L.absent || []).map(o => `<div class="field"><label>${esc(o.label)} (must be absent)</label><select class="inp" data-k="values.${s.key}.micro.${o.key}" ${ro}>
          ${[['', 'Awaiting result'], ['absent', 'Absent'], ['present', 'Present']].map(([k, l]) => `<option value="${k}" ${(ws.inputs.values[s.key].micro || {})[o.key] === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`).join('')}
      </div></div></div>`).join('');
  }
  if (test === 'weight_variation'){   // 058: each unit's weight; the server gives the average, each unit's difference and pass / fail
    const L = P.limits || {}, unit = P.unit || 'g';
    return samples.map((s, si) => { const w = ws.inputs.values[s.key].weights[tid] || [];
      return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Weight variation - sample ${esc(s.label)}</h3>
        <div class="sub">Template v${esc(t.version)} - ${esc(w.length)} units, each within ±${esc(L.limit_pct)}% of the average${L.allowed_out ? ` (${esc(L.allowed_out)} may be outside)` : ''}${L.target && L.target.weight ? `; average ${esc(L.target.weight)} ${esc(unit)} ±${esc(L.target.pct)}%` : ''}</div></div>
        <div id="mean-${tid}-${si}" class="strong" style="text-align:right">--</div></div>
      <div class="card-b"><div class="lab-units" data-group="values.${s.key}.weights.${tid}">${w.map((x, ui) => `<div class="lab-unit"><div class="tiny muted">Unit ${ui + 1} (${esc(unit)})</div>
          ${inpNum(`values.${s.key}.weights.${tid}.${ui}`, 'placeholder="weight"')}<div class="tiny tnum strong" id="u-${tid}-${si}-${ui}">--</div></div>`).join('')}</div>
        <div class="hint" style="margin-top:8px">${I.info}<span>Tip: paste the column of weights from the balance printout into the first box.</span></div></div></div>`; }).join('');
  }
  if (test === 'ph'){   // 058: the pH reading(s) against the method's limits
    const L = P.limits || {};
    return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>pH</h3>
        <div class="sub">Template v${esc(t.version)} - limit ${esc(L.min != null && L.min !== '' ? L.min : '')}${L.max != null && L.max !== '' ? ' to ' + esc(L.max) : ''}</div></div></div>
      <div class="card-b"><div class="grid g3">${samples.map((s, si) => `<div class="field"><label>Sample ${esc(s.label)}: pH</label>
        ${(ws.inputs.values[s.key].ph[tid] || []).map((x, ri) => inpNum(`values.${s.key}.ph.${tid}.${ri}`, 'placeholder="e.g. 8.2"')).join('')}
        <div class="small" id="mean-${tid}-${si}" style="margin-top:6px">--</div></div>`).join('')}</div></div></div>`;
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
  // Recall (058): the analyst until the QC Supervisor checks; the checker until the QC Manager decides (the server checks again)
  if (a.is_mine && a.status === 'submitted') acts.push(recallBtn('worksheet', a.id, `Worksheet #${a.id} - ${a.product_name}`));
  if (a.status === 'checked' && a.checked_by && S.me && a.checked_by === S.me.name && !d.samples.some(b => b.decided)) acts.push(recallBtn('check', a.id, `Worksheet #${a.id} - ${a.product_name}`));
  acts.push(`<a class="btn btn-ghost" href="#/lab/print/${a.id}">${I.print} Printable copy</a>`);
  if (hasLabRole('qc_manager') && a.status === 'checked') acts.push(`<button class="btn btn-ghost" onclick="wsSendBack()">Send back</button>`);
  return {
    title: `Worksheet #${a.id}`, crumb:'QC Laboratory',
    html: `${pageHead(`Worksheet #${a.id} - ${esc(TEST_TYPES[a.test_type] || a.test_type)}`, `${esc(a.product_name)} - ${esc(a.stage)} - analyst ${esc(a.analyst)} - ${wsBadge(a.status)}`, acts.join(''))}
      ${a.status === 'returned' ? `<div class="notice" style="margin-bottom:16px;color:var(--danger)">${I.alert} Returned by ${esc(a.returned_by || '')} ${a.returned_at ? fmtDateTime(a.returned_at) : ''}: <b>${esc(a.return_reason || '')}</b>. Every correction asks for a reason.</div>` : ''}
      ${!edit && !['submitted', 'checked'].includes(a.status) && !a.is_mine ? `<div class="notice" style="margin-bottom:16px">${I.info} Only the analyst of this worksheet can edit it.</div>` : ''}
      <div class="grid g2" style="margin-bottom:16px;align-items:start">
        <div class="card"><div class="card-h"><div><h3>Run details</h3><div class="sub">Every field on this worksheet is required to submit</div></div></div><div class="card-b"><div class="grid g2">
          ${a.test_type === 'microbiology' ? '' : `<div class="field"><label>Instrument</label><select class="inp${wsMiss(ws.run.equipment_id)}" data-r="equipment_id" ${edit ? '' : 'disabled'}><option value="">Choose...</option>
            ${d.equipment.map(q => `<option value="${q.id}" ${String(ws.run.equipment_id) === String(q.id) ? 'selected' : ''}>${esc(q.eq_no)} ${esc(q.eq_type || '')}</option>`).join('')}</select></div>
          <div class="field"><label>Mobile phase / reagent lots</label><input class="inp${wsMiss(ws.run.reagents)}" data-r="reagents" value="${esc(ws.run.reagents)}" ${edit ? '' : 'disabled'} placeholder="separate them with commas">
            <div id="wsReagents" style="margin-top:6px">${reagentChips(ws.run.reagents)}</div></div>`}
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
      wsBindInputs();
      $$('[data-r]').forEach(el => el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => { ws.run[el.dataset.r] = el.value; ws.dirty = true; wsUnmark(el);
        if (el.dataset.r === 'reagents'){ const box = $('#wsReagents'); if (box) box.innerHTML = reagentChips(el.value); } }));
      $$('[data-ws]').forEach(el => el.addEventListener('change', () => wsStdChange(el)));
      const fi = $('#wsFile'); if (fi) fi.onchange = () => wsUpload(Array.from(fi.files || []));
      const sv = $('#wsSave'); if (sv) sv.onclick = () => wsSave();
      const sb = $('#wsSubmit'); if (sb) sb.onclick = () => wsSubmit();
      wsPaint();
      if (edit && (!ws.calc || ws.dirty)) wsCalcSoon(0);
    }
  };
}
// every typed box of a worksheet (and of a method try-out, 065): kept in ws.inputs, recalculated on the server; a pasted column fills the boxes
function wsBindInputs(){
  $$('[data-k]').forEach(el => {
    const ev = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(ev, () => { wsSet(el.dataset.k, el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || /label$/.test(el.dataset.k) ? el.value : el.value.replace(/,/g, '').trim()); ws.dirty = true; wsUnmark(el); wsCalcSoon(); });
  });
  $$('.lab-areas, .lab-units').forEach(g => g.addEventListener('paste', e => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const vals = String(text).split(/[\s;\t]+/).map(x => x.replace(/,/g, '')).filter(x => x !== '' && !isNaN(Number(x)));
    if (vals.length < 2 || !wsEditable()) return;
    e.preventDefault();
    const boxes = $$('input', g), start = Math.max(0, boxes.indexOf(e.target));
    vals.forEach((v, i) => { if (boxes[start + i]){ boxes[start + i].value = v; wsSet(boxes[start + i].dataset.k, v); } });
    ws.dirty = true; wsCalcSoon(0);
  }));
}
// reagents / mobile phase lots: typed with commas, shown one per item (058); stored as typed
const reagentList = s => String(s || '').split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
function reagentChips(s){ return reagentList(s).map(x => `<span class="chip" style="margin:0 4px 4px 0">${esc(x)}</span>`).join(''); }
function wsTab(tid){ ws.tab = tid; render(); }
function wsUnmark(el){ if (String(el.value).trim() !== '') el.classList.remove('err'); }
function wsSplInj(si, tid, delta, pi){
  const t = ws.ctx.templates.find(x => x.id === tid), v = ws.inputs.values[ws.inputs.samples[si].key], max = wsSplMax((t || {}).parameters || {});
  const lists = ws.ctx.analysis.test_type === 'assay' ? (v.preps[tid] || []).filter((p, i) => pi === undefined || i === pi).map(p => p.areas) : (v.units[tid] || []);
  const n = ((lists[0] || []).length || 1) + delta;
  if (n < wsSplMin((t || {}).parameters || {}) || n > max) return;
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
function wsSample(arg, delta){
  const list = ws.inputs.samples;
  if (delta > 0){
    const n = list.filter(s => s.assignment_id === arg).length;
    const named = (((ws.ctx.templates[0] || {}).parameters || {}).sample_names) || [];   // 065: the method's usual sample names
    const labels = named.length ? named : ['LS', 'MS', 'HS', 'S4', 'S5'];
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
      const res = ws.try ? await labPost('/template/try', { id: ws.try, inputs: ws.inputs }) : await labPost('/worksheet/calculate', { analysis_id: id, inputs: ws.inputs });
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
    const big = v => (v === null || v === undefined || isNaN(Number(v)) ? '--' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 1 }));
    if (sst) sst.innerHTML = r && r.sst
      ? `<div class="row" style="gap:14px;align-items:baseline;flex-wrap:wrap">
          <span><span class="muted">Average</span> <b class="tnum">${big(r.sst.mean)}</b></span>
          <span><span class="muted">SD</span> <b class="tnum">${big(r.sst.sd)}</b></span>
          <span><span class="muted">%RSD</span> <b class="tnum">${Number(r.sst.rsd_reported).toFixed(2)}%</b> <span class="muted">(${esc(r.sst.limit_text)})</span></span>
          ${sstExtraText(r.sst, true)}
          ${r.sst.pass ? `<span class="badge b-ok">Pass</span>` : `<span class="badge b-danger">Fail</span>`}
        </div>`
      : '--';
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
          ? `mean <span class="tnum">${num1(rs.reported)}%</span> ${verdictBadge(rs.pass)}${below.length ? ` <span class="badge b-danger">${unitWord(t.parameters)} ${below.join(', ')} below ${esc(r.samples[si].limit_text || '')}</span>` : ''}`
          : `mean <span class="tnum">${num1(rs.mean_reported)}%</span> - AV <b class="tnum">${num1(rs.av_reported)}</b> ${verdictBadge(rs.pass)}`;
        ((v.units || {})[t.id] || []).forEach((u, ui) => {
          const el = $(`#u-${t.id}-${si}-${ui}`); if (!el) return;
          const val = rs && rs.units_reported ? rs.units_reported[ui] : null;
          el.textContent = val == null ? '--' : num1(val) + '%';
          el.style.color = below.includes(ui + 1) ? 'var(--danger)' : '';
        });
      } else if (test === 'weight_variation'){
        if (m) m.innerHTML = rs ? `average <span class="tnum">${esc(rs.mean_reported)} ${esc(rs.unit)}</span> - largest difference <b class="tnum">${esc(rs.max_dev)}%</b> ${verdictBadge(rs.pass)}` : '--';
        (((v.weights || {})[t.id]) || []).forEach((u, ui) => {
          const el = $(`#u-${t.id}-${si}-${ui}`); if (!el) return;
          const d = rs ? rs.deviations_reported[ui] : null;
          el.textContent = d == null ? '--' : (d > 0 ? '+' : '') + d.toFixed(2) + '%';
          el.style.color = rs && rs.out_units.includes(ui + 1) ? 'var(--danger)' : '';
        });
      } else if (test === 'ph'){
        if (m) m.innerHTML = rs ? `pH <b class="tnum">${Number(rs.reported).toFixed(2)}</b> ${verdictBadge(rs.pass)}` : '--';
      } else if (test === 'identification'){
        if (m) m.innerHTML = rs ? verdictBadge(rs.pass) : '--';
      } else if (test === 'microbiology'){
        if (m) m.innerHTML = !rs ? '--' : r.pending ? '<span class="badge b-warn">Awaiting incubation</span>' : verdictBadge(rs.pass);
      }
    });
  }
  const errs = (c.errors || []).map(e => `<li>${e.api ? `<b>${esc(e.api)}:</b> ` : ''}${esc(e.message)}</li>`).join('');
  const blocked = (c.blocked || []).length ? `<div class="notice" style="color:var(--danger);margin-bottom:10px">${I.alert} System suitability failed for ${esc(c.blocked.join(', '))}: results are blocked until the run is repeated or a justification is entered.</div>` : '';
  if (typeof ws.afterPaint === 'function') setTimeout(ws.afterPaint, 0);
  box.innerHTML = `${blocked}${errs ? `<div class="small" style="margin-bottom:10px"><b>To complete:</b><ul style="margin:6px 0 0 18px">${errs}</ul></div>` : ''}
    ${(c.results || []).length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:0" data-nosort><thead><tr><th>API</th><th>Sample</th><th style="text-align:right">Reported</th><th>Limit</th><th></th></tr></thead><tbody>
      ${c.results.map(x => `<tr><td>${esc(x.api)}</td><td class="mono small">${esc(x.sample_label)}</td><td class="tnum strong" style="text-align:right">${esc(resText(x))}</td>
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
  const micro = ws.ctx.analysis.test_type === 'microbiology';   // 065: microbiology has no instrument and no reagent lots
  const run = [...(micro ? [] : [['equipment_id', 'instrument'], ['reagents', 'mobile phase / reagent lots']]),
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
      labClear(); go('/lab/my');
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
      await labPost('/worksheet/check', { analysis_id: ws.id, password, action: act, reason, seen: labSeen('/worksheet?id=' + ws.id) });
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
let mdTab = 'products', mdProduct = null;
const TPL_STAGE = { draft: 'Draft', returned: 'Returned', in_review: 'With QC Manager', reviewed: 'With QA Manager (old route)', approved: 'Approved', retired: 'Retired' };
const CHG_STATUS = { submitted: [c => (c.kind === 'standard' ? 'With QC Manager' : 'With QC Manager (review)'), 'b-warn'], reviewed: [() => 'With QA Manager', 'b-warn'],
                     approved: [() => 'Approved', 'b-ok'], returned: [() => 'Returned', 'b-danger'] };
// Lab master data (065, 13 Nov 2026): Method templates is a grid per product group (test x API, the current version in each cell);
// Approvals is one list of everything not finished, with the button to act in the row (yours first); History is what is finished.
let mdFilter = '', mdQ = '', mdOpened = '';
const GRID_TESTS = ['assay', 'dissolution', 'content_uniformity', 'identification', 'microbiology', 'weight_variation', 'ph'];
const ROW_TESTS = ['microbiology', 'weight_variation', 'ph'];   // one method for the whole product (no API columns)
function viewLabMaster(){
  const d = labGet('/masterdata');
  if (!d) return labWait('Lab master data', 'Administration');
  if (d.error) return labFail('Lab master data', 'Administration', d.error);
  if (d.roles && !S.lab) S.signRoles = d.roles;
  if (mdTab === 'changes') mdTab = 'approvals';   // the old tab name (links, tests)
  const qcs = isStarter(), qcm = hasLabRole('qc_manager'), qam = hasLabRole('qa_manager');
  const ap = mdApprovalItems(d);
  const mine = ap.filter(x => x.forMe).length;
  // a link from My approvals or an e-mail: #/lab/master?open=tpl:12 / chg:5 opens that item once (the sign dialog when it is yours)
  const open = (/[?&]open=((?:tpl|chg):\d+)/.exec(currentPath()) || [])[1];
  if (open && open !== mdOpened){ mdOpened = open; mdTab = 'approvals'; setTimeout(() => { mdOpenItem(open); try { history.replaceState(null, '', '#/lab/master'); } catch (e) { /* ignore */ } }, 50); }
  const tabs = [['products', 'Products and specs', 0], ['standards', 'Working standards', 0], ['equipment', 'Equipment', 0], ['templates', 'Method templates', 0],
                ['approvals', `Approvals${ap.length ? ` (${ap.length} open)` : ''}`, mine], ['history', 'History', 0]];
  let body = '';
  if (mdTab === 'products') body = mdProductsBody(qcs);
  else if (mdTab === 'standards'){
    body = `<div class="card"><div class="card-h"><div><h3>Working-standard register</h3><div class="sub">A standard without an expiry date, or past it, cannot be picked on a worksheet. A new standard or a change is started by a QC or QA Supervisor and approved by the QC Manager.</div></div>
        ${qcs ? `<button class="btn btn-primary btn-sm" onclick="mdStandard()">${I.plus} Add standard</button>` : ''}</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Number</th><th>Substance</th><th>Potency</th><th>Expiry</th><th>Usable today</th><th></th></tr></thead><tbody>
      ${d.standards.map(w => `<tr><td class="mono strong">${esc(w.ws_no)}</td><td>${esc(w.substance)}${w.notes ? `<div class="tiny muted">${esc(w.notes)}</div>` : ''}</td><td class="tnum">${esc(w.potency_pct)}%</td>
        <td>${fmtDate(w.expiry_date)}</td><td>${w.usable_today ? '<span class="badge b-ok">Yes</span>' : `<span class="badge b-danger">${!w.active ? 'Inactive' : w.expiry_date ? 'Expired' : 'No expiry date'}</span>`}</td>
        <td style="text-align:right">${qcs ? `<button class="btn btn-ghost btn-sm" onclick="mdStandard(${w.id})">${I.edit} Request change</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
  } else if (mdTab === 'equipment'){
    const ed = canEdit();
    body = `<div class="card"><div class="card-h"><h3>Equipment</h3>${ed ? `<button class="btn btn-primary btn-sm" onclick="mdEquipment()">${I.plus} Add equipment</button>` : ''}</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Number</th><th>Type</th><th>Description</th><th>Calibration due</th><th>Active</th><th></th></tr></thead><tbody>
      ${d.equipment.map(q => `<tr><td class="mono strong">${esc(q.eq_no)}</td><td>${esc(q.eq_type || '')}</td><td class="small">${esc(q.description || '')}</td><td>${fmtDate(q.calibration_due)}</td>
        <td>${q.active ? 'Yes' : 'No'}</td><td style="text-align:right">${ed ? `<button class="btn btn-ghost btn-sm" onclick="mdEquipment(${q.id})">${I.edit} Edit</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
  } else if (mdTab === 'templates') body = mdTemplatesBody(d, qcs);
  else if (mdTab === 'approvals') body = mdApprovalsBody(ap, qcs);
  else body = mdHistoryBody(d);
  return {
    title:'Lab master data', crumb:'Administration',
    html: `${pageHead('Lab master data', 'Settings and system changes: products and their IPQA checks, working standards, equipment and the locked method templates. Every change is signed and approved.')}
      ${!qcs && !qcm && !qam ? `<div class="notice" style="margin-bottom:16px">${I.info} Changes are started by a QC or QA Supervisor, reviewed by the QC Manager and approved by the QA Manager (working standards: the QC Manager approves). You can read everything here.</div>` : ''}
      <div class="tabs">${tabs.map(([k, l, n]) => `<div class="tab ${k === mdTab ? 'active' : ''}" onclick="mdTab='${k}';mdProduct=null;render()">${esc(l)}${n ? tabCount(0, n) : ''}</div>`).join('')}</div>${body}`,
    bind(){
      const q = $('#mdQ'); if (q) q.addEventListener('input', debounce(e => { mdQ = e.target.value; render(); const x = $('#mdQ'); if (x){ x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }, 260));
      const f = $('#mdFilter'); if (f) f.onchange = () => { mdFilter = f.value; render(); };
    }
  };
}

// ---------- Method templates: one card per product group, a grid per product ----------
// the methods of one product, current version per (test, API), retired versions left out (they are in each cell's history)
function productMethods(templates, product){
  const live = (templates || []).filter(t => t.product_name === product && t.status !== 'retired');
  const cell = (test, api) => { const xs = live.filter(t => t.test_type === test && String(t.api).trim().toLowerCase() === String(api).trim().toLowerCase());
    return { approved: xs.filter(t => t.status === 'approved').sort((a, b) => b.version - a.version)[0] || null, draft: xs.find(t => t.status === 'draft') || null }; };
  const apis = [...new Set(live.filter(t => !ROW_TESTS.includes(t.test_type) && String(t.api).trim()).map(t => String(t.api).trim()))]
    .filter((a, i, all) => all.findIndex(b => b.toLowerCase() === a.toLowerCase()) === i).sort((a, b) => a.localeCompare(b));
  return { live, cell, apis };
}
function mdCellHtml(product, test, api, c, qcs){
  const js = s => esc(JSON.stringify(String(s)));
  const click = `onclick='mdCell(${js(product)}, ${js(test)}, ${js(api)})'`;
  if (!c.approved && !c.draft) return qcs ? `<button class="btn btn-ghost btn-sm" title="New method" onclick='mdTemplate(null, "new", { product: ${js(product)}, test: ${js(test)}, api: ${js(api)} })'>${I.plus}</button>` : '<span class="muted">--</span>';
  const d = c.draft;
  const tag = d ? (d.stage_of_change === 'in_review' ? '<span class="badge b-warn">with QC Manager</span>' : d.stage_of_change === 'reviewed' ? '<span class="badge b-warn">with QA Manager</span>'
    : d.stage_of_change === 'returned' ? '<span class="badge b-danger">returned</span>' : (d.problems || []).length ? '<span class="badge b-danger">draft, not complete</span>' : '<span class="badge b-slate">draft</span>') : '';
  return `<button class="btn btn-ghost btn-sm" style="padding:2px 8px;min-height:0" ${click}>${c.approved ? `<span class="badge b-ok">v${esc(c.approved.version)}</span>` : '<span class="muted">none yet</span>'}</button>${tag ? `<div style="margin-top:3px">${tag}</div>` : ''}`;
}
function productGridHtml(d, product, qcs){
  const { live, cell, apis } = productMethods(d.templates, product);
  if (!live.length) return `<div class="small muted" style="padding:6px 0 12px">No methods yet.${qcs ? ` Use <b>New template</b> or <b>Copy methods from another product</b>.` : ''}</div>`;
  const q = mdQ.trim().toLowerCase();
  const tests = GRID_TESTS.filter(t => live.some(x => x.test_type === t));
  const rows = tests.map(test => {
    const name = TEST_TYPES[test] || test;
    const ownApis = [...new Set(live.filter(t => t.test_type === test).map(t => String(t.api).trim()))];
    const extra = ownApis.filter(a => !apis.some(b => b.toLowerCase() === a.toLowerCase()));   // a product-level test, or an identification without an API
    if (q && !name.toLowerCase().includes(q) && !ownApis.concat(apis).some(a => a.toLowerCase().includes(q))) return '';
    if (ROW_TESTS.includes(test) || (extra.length && !apis.length))
      return `<tr><td class="strong">${esc(name)}</td><td colspan="${Math.max(apis.length, 1)}">${ownApis.map(a => `<span style="display:inline-block;margin-right:14px">${ROW_TESTS.includes(test) ? '' : `<span class="tiny muted">${esc(a || 'no API')}</span> `}${mdCellHtml(product, test, a, cell(test, a), qcs)}</span>`).join('')}</td></tr>`;
    return `<tr><td class="strong">${esc(name)}${extra.map(a => `<div class="tiny muted">also: ${esc(a || 'no API')} ${mdCellHtml(product, test, a, cell(test, a), qcs)}</div>`).join('')}</td>
      ${apis.map(a => `<td>${mdCellHtml(product, test, a, cell(test, a), qcs)}</td>`).join('')}</tr>`;
  }).join('');
  if (!rows) return '';
  return `<div class="tbl-wrap"><table class="tbl" style="min-width:0" data-nosort><thead><tr><th style="width:170px">Test</th>${apis.length ? apis.map(a => `<th>${esc(a)}</th>`).join('') : '<th></th>'}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
function mdTemplatesBody(d, qcs){
  const flags = d.product_flags || {};
  const groups = {};
  (d.products || []).forEach(p => { const g = (flags[p] || {}).method_group || p; (groups[g] = groups[g] || []).push(p); });
  const names = Object.keys(groups).sort((a, b) => a.localeCompare(b));
  const show = g => !mdFilter || mdFilter === g || groups[g].includes(mdFilter);
  const cards = names.filter(show).map(g => {
    const prods = groups[g].filter(p => !mdFilter || mdFilter === g || mdFilter === p).sort();
    const inner = prods.map(p => { const grid = productGridHtml(d, p, qcs); return grid === '' ? '' : `<div style="margin:4px 0 14px"><div class="row" style="justify-content:space-between;margin-bottom:6px">
        <h4 style="margin:0">${esc(p)}</h4></div>${grid}</div>`; }).join('');
    if (!inner) return '';
    return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(g)}</h3>${groups[g].length > 1 ? '<div class="sub">These products share their methods: a new version on one offers "same change" for the others.</div>' : ''}</div></div>
      <div class="card-b">${inner}</div></div>`;
  }).join('');
  return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Method templates</h3><div class="sub">The current version of each method, per product. Click a version to see it, try it, change it or see its history. A QC or QA Supervisor drafts, the QC Manager approves; waiting ones are on <b>Approvals</b>.</div></div>
      ${qcs ? `<div class="row" style="gap:8px"><button class="btn btn-ghost btn-sm" onclick="mdCopyProduct()">${I.layers || I.plus} Copy methods from another product</button>
        <button class="btn btn-primary btn-sm" onclick="mdTemplate()">${I.plus} New template</button></div>` : ''}</div>
    <div class="card-b filter-bar" style="padding:12px 18px"><div class="row" style="gap:10px;flex-wrap:wrap">
      <select class="inp" id="mdFilter" style="max-width:280px"><option value="">All products</option>
        ${names.filter(g => groups[g].length > 1).map(g => `<option value="${esc(g)}" ${mdFilter === g ? 'selected' : ''}>Group: ${esc(g)}</option>`).join('')}
        ${(d.products || []).slice().sort().map(p => `<option value="${esc(p)}" ${mdFilter === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
      <div class="search filter-search"><span class="ic">${I.search}</span><input class="inp" id="mdQ" autocomplete="off" style="padding-left:34px;border-radius:20px" placeholder="Search test or API" value="${esc(mdQ)}"></div>
    </div></div></div>
    ${cards || `<div class="card"><div class="card-b">${emptyState('search', 'Nothing matches', 'Change the product or the search.')}</div></div>`}`;
}
// one cell: every version of that method (newest first) with what you can do on each
function mdCell(product, test, api){
  const d = labCache['/masterdata'] || {};
  const lc = x => String(x || '').trim().toLowerCase();
  const all = (d.templates || []).filter(t => t.product_name === product && t.test_type === test && lc(t.api) === lc(api)).sort((a, b) => b.version - a.version);
  if (!all.length) return;
  const qcs = isStarter();
  const approved = all.find(t => t.status === 'approved'), draft = all.find(t => t.status === 'draft');
  openModal({ title: `${product} - ${TEST_TYPES[test] || test}${ROW_TESTS.includes(test) ? '' : ' - ' + (api || 'no API')}`, size: 'wide',
    sub: approved ? `In use: v${approved.version}${approved.method_ref ? ' - ' + approved.method_ref : ''}` : 'No approved version yet',
    body: `${approved ? mdParamsHtml(approved.parameters, test) : ''}
      <h4 style="margin:10px 0 6px">Versions</h4>
      <div class="tbl-wrap"><table class="tbl" style="min-width:0" data-nosort><thead><tr><th>Version</th><th>Status</th><th>Drafted</th><th>Approved</th><th></th></tr></thead><tbody>
      ${all.map(t => `<tr><td class="tnum strong">v${esc(t.version)}</td><td>${tplStatusHtml(t)}</td>
        <td class="small">${esc(t.drafted_by || 'setup')}<div class="tiny muted">${fmtDate(t.drafted_at)}</div></td>
        <td class="small">${esc(t.approved_by || '--')}<div class="tiny muted">${t.approved_at ? fmtDate(t.approved_at) : t.retired_at ? 'retired ' + fmtDate(t.retired_at) : ''}</div></td>
        <td style="text-align:right;white-space:nowrap">${tplActions(t, d, true)}</td></tr>`).join('')}</tbody></table></div>`,
    footer: `${approved && !draft && qcs ? `<button class="btn btn-primary" onclick="closeModalOf(this.closest('.modal'));mdTemplate(${approved.id},'copy')">${I.edit} New version</button>` : ''}<button class="btn btn-ghost" data-close>Close</button>` });
}
function tplStatusHtml(t){
  return `<span class="badge ${t.status === 'approved' ? 'b-ok' : t.status === 'draft' ? (t.stage_of_change === 'returned' ? 'b-danger' : 'b-warn') : 'b-slate'}">${esc(TPL_STAGE[t.stage_of_change] || t.status)}</span>
    ${t.returned_note && t.stage_of_change === 'returned' ? `<div class="tiny muted">${esc(t.returned_by || '')}: ${esc(t.returned_note)}</div>` : ''}
    ${t.status === 'draft' && (t.problems || []).length ? `<div class="tiny" style="color:var(--danger)" title="${esc((t.problems || []).join(' '))}">${I.alert} not complete (${t.problems.length})</div>` : ''}
    ${t.status === 'draft' && TRY_TESTS.includes(t.test_type) ? (t.try_current ? `<div class="tiny" style="color:var(--ok, #16794C)">${I.check || ''} tried with Excel numbers</div>` : '<div class="tiny muted">not tried with Excel numbers</div>') : ''}`;
}
// the buttons for one method version, for the person looking (the same everywhere: cell, Approvals)
function tplActions(t, d, inModal){
  const qcs = isStarter(), qcm = hasLabRole('qc_manager'), qam = hasLabRole('qa_manager');
  const close = inModal ? `closeModalOf(this.closest('.modal'));` : '';
  const b = [`<button class="btn btn-ghost btn-sm" onclick="${close}mdTemplateView(${t.id})">View</button>`];
  if (t.status !== 'retired' && TRY_TESTS.includes(t.test_type) && (qcs || qcm)) b.push(`<a class="btn btn-ghost btn-sm" href="#/lab/master/try/${t.id}" onclick="${close}">Try it</a>`);
  if (['draft', 'returned'].includes(t.stage_of_change) && qcs){
    b.push(`<button class="btn btn-ghost btn-sm" onclick="${close}mdTemplate(${t.id},'edit')">${I.edit} Edit</button>`);
    b.push(`<button class="btn btn-primary btn-sm" onclick="${close}mdTplSubmit(${t.id})">Send for review</button>`);
  }
  if (t.stage_of_change === 'in_review' && qcm && t.drafted_by_id !== d.me) b.push(`<button class="btn btn-primary btn-sm" onclick="${close}mdTplReview(${t.id})">Approve</button>`);
  if (t.stage_of_change === 'in_review' && t.drafted_by_id === d.me) b.push(recallBtn('template', t.id, `${t.api} v${t.version}`, true));
  if (t.stage_of_change === 'reviewed' && qam && t.drafted_by_id !== d.me && t.reviewed_by_id !== d.me) b.push(`<button class="btn btn-primary btn-sm" onclick="${close}mdApprove(${t.id})">Approve</button>`);
  return b.join(' ');
}

// ---------- Approvals: everything not finished, the action in the row, yours first ----------
function mdApprovalItems(d){
  const qcs = isStarter(), qcm = hasLabRole('qc_manager'), qam = hasLabRole('qa_manager'), me = d.me;
  const chg = (d.changes || []).filter(c => ['submitted', 'reviewed', 'returned'].includes(c.status)).map(c => {
    const forMe = (c.status === 'submitted' && qcm && c.initiated_by_id !== me) || (c.status === 'reviewed' && qam && c.initiated_by_id !== me && c.reviewed_by_id !== me)
      || (c.status === 'returned' && c.initiated_by_id === me);
    const acts = [`<button class="btn btn-ghost btn-sm" onclick="chgView(${c.id})">View</button>`];
    if (c.status === 'submitted' && qcm && c.initiated_by_id !== me) acts.push(`<button class="btn btn-primary btn-sm" onclick="chgDecide(${c.id})">${c.kind === 'standard' ? 'Approve' : 'Review'}</button>`);
    if (c.status === 'reviewed' && qam && c.initiated_by_id !== me && c.reviewed_by_id !== me) acts.push(`<button class="btn btn-primary btn-sm" onclick="chgDecide(${c.id})">Approve</button>`);
    if (c.status === 'returned' && c.initiated_by_id === me && qcs) acts.push(`<button class="btn btn-primary btn-sm" onclick="chgResend(${c.id})">${I.edit} Correct and send again</button>`);
    if (c.status === 'submitted' && c.initiated_by_id === me) acts.push(recallBtn('change', c.id, c.title, true));
    const note = c.status === 'returned' && c.returned_note ? `${c.returned_by || ''}: ${c.returned_note}` : c.status === 'reviewed' && c.review_comment ? `${c.reviewed_by || ''}: ${c.review_comment}` : c.reason || '';
    return { key: 'chg:' + c.id, what: c.title, kind: c.kind === 'standard' ? 'Working standard' : 'Product', who: c.initiated_by, at: c.reviewed_at || c.initiated_at,
             where: CHG_STATUS[c.status][0](c), badge: CHG_STATUS[c.status][1], note, forMe, acts: acts.join(' ') };
  });
  const tpl = (d.templates || []).filter(t => ['in_review', 'reviewed', 'returned'].includes(t.stage_of_change)).map(t => {
    const forMe = (t.stage_of_change === 'in_review' && qcm && t.drafted_by_id !== me) || (t.stage_of_change === 'reviewed' && qam && t.drafted_by_id !== me && t.reviewed_by_id !== me)
      || (t.stage_of_change === 'returned' && t.drafted_by_id === me);
    return { key: 'tpl:' + t.id, what: `${t.product_name} - ${TEST_TYPES[t.test_type] || t.test_type}${ROW_TESTS.includes(t.test_type) ? '' : ' - ' + (t.api || 'no API')} v${t.version}`,
             kind: 'Method template', who: t.drafted_by, at: t.reviewed_at || t.submitted_at || t.drafted_at, where: TPL_STAGE[t.stage_of_change],
             badge: t.stage_of_change === 'returned' ? 'b-danger' : 'b-warn', note: t.stage_of_change === 'returned' ? `${t.returned_by || ''}: ${t.returned_note || ''}` : t.change_note || '',
             forMe, acts: tplActions(t, d), tryNote: t.status === 'draft' && TRY_TESTS.includes(t.test_type) ? (t.try_current ? 'tried with Excel numbers' : 'not tried with Excel numbers') : '' };
  });
  return chg.concat(tpl).sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')));
}
function mdApprovalsBody(items, qcs){
  const d = labCache['/masterdata'] || {};
  const table = list => `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>What</th><th>Kind</th><th>Started</th><th>Where it is</th><th></th></tr></thead><tbody>
    ${list.map(o => `<tr><td><b>${esc(o.what)}</b>${o.note ? `<div class="tiny muted">${esc(o.note)}</div>` : ''}${o.tryNote ? `<div class="tiny muted">${esc(o.tryNote)}</div>` : ''}</td><td class="small">${esc(o.kind)}</td>
      <td class="small">${esc(o.who || 'setup')}<div class="tiny muted">${fmtDate(o.at)}</div></td><td><span class="badge ${o.badge}">${esc(o.where)}</span></td>
      <td style="text-align:right;white-space:nowrap">${o.acts}</td></tr>`).join('')}</tbody></table></div>`;
  const mine = items.filter(x => x.forMe), others = items.filter(x => !x.forMe);
  // drafts nobody has sent yet (the starter's, or made by a data fix): the QC / QA Supervisor sends them
  const drafts = (d.templates || []).filter(t => t.stage_of_change === 'draft' && (t.drafted_by_id === d.me || t.drafted_by_id == null));
  return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Waiting for you (${mine.length})</h3><div class="sub">Approve, review, or correct and send again: the button is in the row</div></div></div>
      ${mine.length ? table(mine) : `<div class="card-b">${emptyState('checkCircle', 'Nothing waiting for you', '')}</div>`}</div>
    ${qcs && drafts.length ? `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Drafts not sent yet (${drafts.length})</h3><div class="sub">Yours, or made by the system: edit, try with Excel numbers, then send for review</div></div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Method</th><th>Status</th><th></th></tr></thead><tbody>
      ${drafts.map(t => `<tr><td><b>${esc(t.product_name)} - ${esc(TEST_TYPES[t.test_type] || t.test_type)}${ROW_TESTS.includes(t.test_type) ? '' : ' - ' + esc(t.api || 'no API')} v${esc(t.version)}</b>${t.change_note ? `<div class="tiny muted">${esc(t.change_note)}</div>` : ''}</td>
        <td>${tplStatusHtml(t)}</td><td style="text-align:right;white-space:nowrap">${tplActions(t, d)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
    <div class="card"><div class="card-h"><div><h3>Waiting for someone else (${others.length})</h3><div class="sub">Not yours to act on now: shown so you know where things are</div></div></div>
      ${others.length ? table(others) : `<div class="card-b">${emptyState('checkCircle', 'Nothing else open', '')}</div>`}</div>`;
}
// open one item from a link: the sign dialog when it is yours, else the item
function mdOpenItem(key){
  const d = labCache['/masterdata'] || {}, [kind, sid] = key.split(':'), id = Number(sid);
  const item = mdApprovalItems(d).find(x => x.key === key);
  if (kind === 'tpl'){
    const t = (d.templates || []).find(x => x.id === id); if (!t) return toast('Not found', 'That method is no longer there.', 'warn');
    if (item && item.forMe && t.stage_of_change === 'in_review') return mdTplReview(id);
    if (item && item.forMe && t.stage_of_change === 'reviewed') return mdApprove(id);
    return mdTemplateView(id);
  }
  const c = (d.changes || []).find(x => x.id === id); if (!c) return toast('Not found', 'That change is no longer open.', 'warn');
  if (item && item.forMe && ['submitted', 'reviewed'].includes(c.status)) return chgDecide(id);
  if (item && item.forMe && c.status === 'returned' && isStarter()) return chgResend(id);
  return chgView(id);
}

// ---------- History: what is finished (last 90 days for changes; every method version ever approved) ----------
function mdHistoryBody(d){
  const q = mdQ.trim().toLowerCase();
  const rows = (d.changes || []).filter(c => !['submitted', 'reviewed', 'returned'].includes(c.status)).map(c => ({
      what: c.title, kind: c.kind === 'standard' ? 'Working standard' : 'Product', who: c.initiated_by, at: c.initiated_at, outcome: CHG_STATUS[c.status] ? CHG_STATUS[c.status][0](c) : c.status,
      badge: CHG_STATUS[c.status] ? CHG_STATUS[c.status][1] : 'b-slate', by: c.decided_by, when: c.decided_at, note: c.decision_comment || c.reason || '', view: `chgView(${c.id})` }))
    .concat((d.templates || []).filter(t => t.status !== 'draft').map(t => ({
      what: `${t.product_name} - ${TEST_TYPES[t.test_type] || t.test_type}${ROW_TESTS.includes(t.test_type) ? '' : ' - ' + (t.api || 'no API')} v${t.version}`, kind: 'Method template',
      who: t.drafted_by || 'setup', at: t.drafted_at, outcome: t.status === 'approved' ? 'Approved, in use' : 'Approved, later replaced', badge: t.status === 'approved' ? 'b-ok' : 'b-slate',
      by: t.approved_by, when: t.approved_at, note: t.change_note || '', view: `mdTemplateView(${t.id})` })))
    .filter(r => !q || [r.what, r.kind, r.who, r.by, r.note].join(' ').toLowerCase().includes(q))
    .sort((a, b) => String(b.when || b.at || '').localeCompare(String(a.when || a.at || '')));
  return `<div class="card"><div class="card-h"><div><h3>History</h3><div class="sub">Finished changes (last 90 days) and every approved method version, newest first. Open items are on <b>Approvals</b>.</div></div></div>
    <div class="card-b filter-bar" style="padding:12px 18px"><div class="search filter-search"><span class="ic">${I.search}</span><input class="inp" id="mdQ" autocomplete="off" style="padding-left:34px;border-radius:20px" placeholder="Search product, method, person" value="${esc(mdQ)}"></div></div>
    ${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>What</th><th>Kind</th><th>Started</th><th>Outcome</th><th></th></tr></thead><tbody>
      ${rows.map(r => `<tr><td><b>${esc(r.what)}</b>${r.note ? `<div class="tiny muted">${esc(r.note)}</div>` : ''}</td><td class="small">${esc(r.kind)}</td>
        <td class="small">${esc(r.who || '')}<div class="tiny muted">${fmtDate(r.at)}</div></td>
        <td><span class="badge ${r.badge}">${esc(r.outcome)}</span>${r.by ? `<div class="tiny muted">${esc(r.by)}${r.when ? ' - ' + fmtDate(r.when) : ''}</div>` : ''}</td>
        <td style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="${r.view}">View</button></td></tr>`).join('')}</tbody></table></div>`
      : `<div class="card-b">${emptyState('search', 'Nothing found', '')}</div>`}</div>`;
}
// ---- Products and specs (042: the first tab of Lab master data; the IPQA sheet is built from these)
function mdSpecText(s){
  if (s.specText) return s.specText;
  if (s.specMin != null && s.specMax != null) return (Number(s.specMin) === 0 ? 'NMT ' + s.specMax : `${s.specMin} - ${s.specMax}`) + (s.unit ? ' ' + s.unit : '');
  if (s.specMin != null) return 'NLT ' + s.specMin + (s.unit ? ' ' + s.unit : '');
  if (s.specMax != null) return 'NMT ' + s.specMax + (s.unit ? ' ' + s.unit : '');
  return '--';
}
function mdProductsBody(qcs){
  const products = (S.products || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const p = mdProduct != null ? products.find(x => Number(x.id) === Number(mdProduct)) : null;
  if (!p) return `<div class="card"><div class="card-h"><div><h3>Products and specifications</h3><div class="sub">What IPQA checks at each stage. A new product or a change is started by a QC or QA Supervisor, reviewed by the QC Manager and approved by the QA Manager; the IPQA sheet uses it as soon as it is approved.</div></div>
      ${qcs ? `<button class="btn btn-primary btn-sm" onclick="productDialog()">${I.plus} New product</button>` : ''}</div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Product</th><th>Type</th><th>Prefix</th><th>Shelf life</th><th>Stages checked by IPQA</th><th></th></tr></thead><tbody>
    ${products.map(x => { const st = [...new Set((x.specs || []).map(y => y.stage))];
      return `<tr class="clickable" onclick="mdProduct=${x.id};render()"><td class="strong">${esc(x.name)}</td><td><span class="badge b-brand">${esc(x.type)}</span></td><td class="mono">${esc(x.prefix)}</td>
        <td>${esc(x.shelfLifeMonths)} months</td><td class="small">${esc(st.join(', ') || '--')}</td><td style="text-align:right">${I.chevR}</td></tr>`; }).join('')}</tbody></table></div></div>`;
  const stages = [...new Set((p.specs || []).map(y => y.stage))];
  const md = labCache['/masterdata'] || {};
  // QC tests of this product (065): the same grid as Method templates (one place); a click opens the method, its history and New version
  const qcCard = `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>QC tests</h3><div class="sub">The current method of each QC test. Click a version to see it, try it, or make a new version (the QC Manager approves it).</div></div>
      <button class="btn btn-ghost btn-sm" onclick="mdTab='templates';mdFilter=${esc(JSON.stringify(p.name))};mdProduct=null;render()">Open in Method templates</button></div>
    <div class="card-b">${productGridHtml(md, p.name, qcs)}</div></div>`;
  // Mintacid only (058): QC also tests pH while the IPQA probe is faulty; switched through a change request
  const phOn = !!(((md.product_flags || {})[p.name]) || {}).qc_ph;
  const phCard = p.name === 'Mintacid' ? `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>QC also tests pH: ${phOn ? '<span class="badge b-ok">On</span>' : '<span class="badge b-slate">Off</span>'}</h3>
      <div class="sub">While on, every ${esc(p.name)} sample QC receives gets a pH test (the QC Supervisor can take it off). It needs an approved pH method (QC tests above).</div></div>
      ${qcs ? `<button class="btn btn-ghost btn-sm" onclick="mdQcPh(${p.id}, ${phOn ? 'false' : 'true'})">${I.edit} Request: switch ${phOn ? 'off' : 'on'}</button>` : ''}</div></div>` : '';
  return `<div class="row" style="margin-bottom:12px"><button class="btn btn-ghost btn-sm" onclick="mdProduct=null;render()">${I.chevL} All products</button></div>
    <div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(p.name)}</h3><div class="sub">${esc(p.type)} - prefix <b>${esc(p.prefix)}</b> - shelf life ${esc(p.shelfLifeMonths)} months
        - method group: <b>${esc((((md.product_flags || {})[p.name]) || {}).method_group || 'none')}</b>
        ${hasLabRole('qc_supervisor') || hasLabRole('qc_manager') ? `<button class="btn btn-ghost btn-sm" onclick="mdGroup('${esc(p.name).replace(/'/g, '&#39;')}')">Change group</button>` : ''}</div></div>
      <div class="row" style="gap:8px">${qcs ? `<button class="btn btn-ghost btn-sm" onclick="editShelfLife(${p.id})">${I.edit} Change shelf life</button>
        <button class="btn btn-primary btn-sm" onclick="mdSpecAdd(${p.id})">${I.plus} Add a check</button>` : ''}</div></div></div>
    ${phCard}${qcCard}
    <h3 style="margin:6px 0 10px">IPQA checks</h3>
    ${stages.length ? stages.map(stage => `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${esc(stage)}</h3><div class="sub">On the IPQA sheet at this stage</div></div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Parameter</th><th>Acceptance criteria</th><th>Type</th><th>On the IPQA sheet</th><th></th></tr></thead><tbody>
      ${(p.specs || []).filter(y => y.stage === stage).map(y => `<tr><td class="strong">${esc(y.parameterName)}</td><td class="small">${esc(mdSpecText(y))}</td>
        <td><span class="chip">${y.specText ? 'Complies / Does not' : 'Numeric'}</span></td>
        <td>${y.optional ? '<span class="badge b-warn">Optional</span>' : '<span class="small muted">Required</span>'}</td>
        <td style="text-align:right;white-space:nowrap">${qcs ? `<button class="btn btn-ghost btn-sm" onclick='editSpec(${y.id})'>${I.edit} Request change</button>
          <button class="btn btn-ghost btn-sm" onclick='mdSpecRemove(${y.id})'>${I.x} Remove</button>` : '<span class="tiny muted">View only</span>'}</td></tr>`).join('')}</tbody></table></div></div>`).join('')
      : `<div class="card"><div class="card-b">${emptyState('box', 'No IPQA checks yet', 'Add a check to put it on the IPQA sheet.')}</div></div>`}`;
}
// a method's limits in one line (058: the QC tests list of a product)
function tplLimitText(t){
  const P = t.parameters || {}, L = P.limits || {};
  if (t.test_type === 'assay') return `${L.min}% to ${L.max}% of label claim${P.a1pct ? ` (UV, A1% ${P.a1pct})` : ''}`;
  if (t.test_type === 'dissolution') return `NLT ${L.min}% dissolved${P.a1pct ? ` (UV, A1% ${P.a1pct})` : ''}`;
  if (t.test_type === 'content_uniformity') return `AV NMT ${P.l1 ?? 15}${P.a1pct ? ` (UV, A1% ${P.a1pct})` : ''}`;
  if (t.test_type === 'weight_variation') return `${L.units || '?'} units, each within ±${L.limit_pct}% of the average` + (L.target && L.target.weight ? `; average ${L.target.weight} ${P.unit || 'g'} ±${L.target.pct}%` : '');
  if (t.test_type === 'ph') return `pH ${L.min ?? '--'} to ${L.max ?? '--'}`;
  if (t.test_type === 'microbiology') return (L.counts || []).map(c => `${c.label} NMT ${c.max}`).join(', ') + ((L.absent || []).length ? '; ' + L.absent.length + ' organisms absent' : '');
  return 'Matches the standard (analyst)';
}
// Mintacid: switch "QC also tests pH" on or off (a change request: QC Manager reviews, QA Manager approves)
function mdQcPh(productId, on){
  const p = (S.products || []).find(x => Number(x.id) === Number(productId)); if (!p) return;
  signDialog({ title: `QC tests pH: switch ${on ? 'on' : 'off'} - ${p.name}`, sub: on ? 'Every sample QC receives then gets a pH test.' : 'QC stops adding a pH test to new samples.', ok: 'Sign and send',
    meaning: `You start this change as ${starterTitle()}. Nothing changes until the QA Manager approves.`, reason: 'Why?', reasonRequired: true,
    submit: async ({ password, reason }) => {
      await labPost('/change/submit', { kind: 'product', action: 'edit', target_id: p.id, reason, password, payload: { qc_ph: on } });
      toast('Sent to the QC Manager', `${p.name}: QC tests pH ${on ? 'on' : 'off'}`, 'ok'); labRefresh();
    } });
}
function mdSpecAdd(productId){
  const p = (S.products || []).find(x => Number(x.id) === Number(productId)); if (!p) return;
  const md = labCache['/masterdata'] || {};
  const stages = ((md.type_stages || {})[p.type]) || (p.type === 'OLD' ? ['Mixing', 'Filling/Sacheting', 'Finished Product'] : ['Granulation', 'Compression', 'Sacheting/Blistering/Stripping', 'Finished Product']);
  const params = (md.parameters || []).length ? md.parameters
    : Array.from(new Map((S.products || []).flatMap(x => (x.specs || []).map(y => [y.parameterName, { name: y.parameterName, unit: y.unit, text: !!y.specText }]))).values());
  signDialog({ title: `Add a check - ${p.name}`, sub: 'It goes on the IPQA sheet at that stage once the QC Manager has reviewed it and the QA Manager has approved it.', ok: 'Sign and send',
    meaning: `You start this change as ${starterTitle()}. Nothing changes until the QA Manager approves.`,
    body: `<div class="grid g2"><div class="field"><label for="saStage">Stage</label><select class="inp" id="saStage">${stages.map(x => `<option>${esc(x)}</option>`).join('')}</select></div>
        <div class="field"><label for="saParam">Parameter</label><select class="inp" id="saParam"><option value="">Choose...</option>${params.map(q => `<option>${esc(q.name)}</option>`).join('')}</select></div></div>
      <div class="grid g3"><div class="field"><label for="saMin">Lower limit</label><input class="inp" id="saMin" inputmode="decimal"></div>
        <div class="field"><label for="saMax">Upper limit</label><input class="inp" id="saMax" inputmode="decimal"></div>
        <div class="field"><label for="saUnit">Unit</label><input class="inp" id="saUnit"></div></div>
      <div class="field"><label for="saText">Or a description to comply with (instead of limits)</label><input class="inp" id="saText" placeholder="e.g. A white coloured suspension"></div>
      <div class="field"><label for="saOpt">On the IPQA sheet</label><select class="inp" id="saOpt"><option value="no">Required: IPQA must enter it</option><option value="yes">Optional: IPQA may leave it blank (saved as Not tested)</option></select></div>`,
    onMount: w => { $('#saParam', w).onchange = e => { const q = params.find(z => z.name === e.target.value); if (q && !$('#saUnit', w).value) $('#saUnit', w).value = q.unit || ''; }; },
    reason: 'Why is this needed?', reasonRequired: true,
    submit: async ({ password, reason, wrap }) => {
      const v = id => $(id, wrap).value.trim();
      if (!v('#saParam')) throw new Error('Choose the parameter.');
      if (!v('#saMin') && !v('#saMax') && !v('#saText')) throw new Error('Enter a lower or upper limit, or a description.');
      const spec = { stage: v('#saStage'), parameter_name: v('#saParam'), spec_min: v('#saMin'), spec_max: v('#saMax'), spec_text: v('#saText'), unit: v('#saUnit'), optional: v('#saOpt') === 'yes' };
      await labPost('/change/submit', { kind: 'product', action: 'edit', target_id: p.id, reason, password, payload: { specs: [spec] } });
      toast('Sent to the QC Manager', esc(p.name) + ' - ' + esc(spec.parameter_name) + ' (' + esc(spec.stage) + ')', 'ok'); labRefresh();
    } });
}
function mdSpecRemove(specId){
  let p = null, y = null;
  (S.products || []).forEach(x => (x.specs || []).forEach(z => { if (z.id === specId){ p = x; y = z; } }));
  if (!y) return;
  signDialog({ title: `Remove ${y.parameterName} - ${p.name}`, sub: `${y.stage}: ${mdSpecText(y)}. It comes off the IPQA sheet once the QC Manager has reviewed it and the QA Manager has approved it.`, ok: 'Sign and send',
    meaning: `You start this change as ${starterTitle()}. The check stays on the sheet until the QA Manager approves. Results already recorded are kept.`,
    reason: 'Why is it removed?', reasonRequired: true,
    submit: async ({ password, reason }) => {
      await labPost('/change/submit', { kind: 'product', action: 'edit', target_id: p.id, reason, password,
        payload: { spec_removals: [specId], removed: [{ id: specId, stage: y.stage, parameter_name: y.parameterName, was: mdSpecText(y) }] } });
      toast('Sent to the QC Manager', esc(p.name) + ' - remove ' + esc(y.parameterName), 'ok'); labRefresh();
    } });
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
function mdStandard(id, again){
  const row = again || (id ? (labCache['/masterdata'].standards || []).find(w => w.id === id) : null);
  const f = [['ws_no', 'Standard number (e.g. WS/026/01)'], ['substance', 'Substance'], ['potency_pct', 'Potency (%)', 'number'],
             ['expiry_date', 'Expiry / re-test date', 'date'], ['notes', 'Notes']];
  signDialog({ title: again ? 'Correct the change' : row ? 'Change a working standard' : 'Add a working standard',
    sub: 'The QC Manager approves it before it takes effect.', ok: 'Sign and send', size: 'narrow',
    meaning: `You start this change as ${starterTitle()}. Nothing changes until the QC Manager approves it.`,
    body: f.map(x => `<div class="field"><label for="cs_${x[0]}">${esc(x[1])}</label><input class="inp" id="cs_${x[0]}" type="${x[2] || 'text'}" value="${esc(row && row[x[0]] != null ? row[x[0]] : '')}"></div>`).join('')
      + `<div class="field"><label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="cs_active" ${!row || row.active !== false ? 'checked' : ''}> Can be used</label></div>`,
    reason: 'Why is this needed?', reasonRequired: true,
    submit: async ({ password, reason, wrap }) => {
      const payload = {}; f.forEach(x => { payload[x[0]] = $('#cs_' + x[0], wrap).value.trim(); }); payload.active = $('#cs_active', wrap).checked;
      const body = { payload, reason, password };
      if (again) body.id = again.id_change; else { body.kind = 'standard'; body.action = row ? 'edit' : 'create'; body.target_id = row ? row.id : ''; }
      await labPost('/change/submit', body); toast('Sent to the QC Manager', payload.ws_no, 'ok'); mdTab = 'changes'; labRefresh();
    } });
}
function mdEquipment(id){
  const row = id ? (labCache['/masterdata'].equipment || []).find(q => q.id === id) : null;
  mdSaveDialog(row ? 'Edit equipment' : 'Add equipment', [['eq_no', 'Equipment number (e.g. EQ/QC/029)'], ['eq_type', 'Type (e.g. HPLC)'], ['description', 'Description'],
    ['calibration_due', 'Calibration due', 'date'], ['active', 'Active', 'check', 'In use']], 'equipment', row);
}
function mdApprove(id){
  const t = (labCache['/masterdata'].templates || []).find(x => x.id === id); if (!t) return;
  signDialog({ title: 'Approve method template', sub: `${t.product_name} ${t.stage} - ${TEST_TYPES[t.test_type] || t.test_type} - ${t.api} v${t.version}`,
    ok: 'Sign approval', meaning: 'You approve this version for use (QA Manager). It is then locked; the previous approved version is retired.',
    body: mdParamsHtml(t.parameters, t.test_type)
      + `<div class="tiny muted" style="margin:8px 0">Started by ${esc(t.drafted_by || '')}, reviewed by ${esc(t.reviewed_by || '')}${t.review_comment ? ' - ' + esc(t.review_comment) : ''}</div>`
      + `<button class="btn btn-ghost btn-sm" id="tpReturn" type="button">Return to the QC Supervisor instead</button>`,
    onMount: w => { $('#tpReturn', w).onclick = () => { closeModalOf(w); decisionDialog({ title: 'Return method template', sub: `${t.api} v${t.version}`, role: 'QA Manager',
      submit: async ({ password, reason }) => { await labPost('/template/approve', { id, password, decision: 'returned', comments: reason }); toast('Returned', `${t.api} v${t.version}`, 'ok'); labRefresh(); } }); }; },
    reason: 'Comment (optional)',
    submit: async ({ password, reason }) => { await labPost('/template/approve', { id, password, comments: reason }); toast('Template approved', `${t.api} v${t.version}`, 'ok'); labRefresh(); } });
}
function closeModalOf(w){ const b = w && w.querySelector ? w.querySelector('[data-close]') : null; if (b) b.click(); }
// a signed "return it" box: the reason is required
function decisionDialog(o){
  signDialog({ title: o.title, sub: o.sub, ok: 'Sign and return', danger: true, meaning: `You return this to the person who started it, as ${o.role}.`,
    reason: 'Why is it returned?', reasonRequired: true, submit: o.submit });
}
function mdTplSubmit(id){
  const t = (labCache['/masterdata'].templates || []).find(x => x.id === id); if (!t) return;
  if ((t.problems || []).length){ toast('Not complete yet', t.problems.join(' '), 'err', 9000); mdTemplateView(id); return; }
  signDialog({ title: 'Send for review', sub: `${t.product_name} - ${TEST_TYPES[t.test_type] || t.test_type} - ${t.api} v${t.version}`, ok: 'Sign and send',
    meaning: `You start this method as ${starterTitle()}. The QC Manager approves it. You cannot edit it while it is with the QC Manager.`,
    body: mdParamsHtml(t.parameters, t.test_type) + tplTryHtml(t),
    submit: async ({ password }) => { await labPost('/template/submit', { id, password }); toast('Sent to the QC Manager', `${t.api} v${t.version}`, 'ok'); labRefresh(); } });
}
function mdTplReview(id){
  const t = (labCache['/masterdata'].templates || []).find(x => x.id === id); if (!t) return;
  signDialog({ title: 'Approve method template', sub: `${t.product_name} - ${TEST_TYPES[t.test_type] || t.test_type} - ${t.api} v${t.version}`, ok: 'Sign approval',
    meaning: 'You approve this method as QC Manager. It is then locked and used on worksheets; the previous approved version is retired.',
    body: tplProblemsHtml(t) + mdParamsHtml(t.parameters, t.test_type) + tplTryHtml(t) + `<div class="tiny muted" style="margin:8px 0">Started by ${esc(t.drafted_by || '')}${t.change_note ? ' - ' + esc(t.change_note) : ''}</div>`
      + `<button class="btn btn-ghost btn-sm" id="tpReturn" type="button">Return to the QC Supervisor instead</button>`,
    onMount: w => { $('#tpReturn', w).onclick = () => { closeModalOf(w); decisionDialog({ title: 'Return method template', sub: `${t.api} v${t.version}`, role: 'QC Manager',
      submit: async ({ password, reason }) => { await labPost('/template/review', { id, password, decision: 'returned', comments: reason, seen: labSeen('/masterdata') }); toast('Returned', `${t.api} v${t.version}`, 'ok'); labRefresh(); } }); }; },
    reason: 'Comment (optional)',
    submit: async ({ password, reason }) => { await labPost('/template/review', { id, password, decision: 'reviewed', comments: reason, seen: labSeen('/masterdata') }); toast('Method approved', `${t.api} v${t.version}`, 'ok'); labRefresh(); } });
}
// ---- changes to standards and products
const limitText = x => esc(x.spec_text || [x.spec_min, x.spec_max].map(v => (v === '' || v == null ? '--' : v)).join(' to '));
function chgText(c){
  const P = c.payload || {};
  if (c.kind === 'standard') return `<table class="tbl"><tbody>${[['Number', P.ws_no], ['Substance', P.substance], ['Potency', P.potency_pct + ' %'], ['Expiry', P.expiry_date ? fmtDate(P.expiry_date) : 'not entered'],
    ['Notes', P.notes || ''], ['Can be used', P.active === false ? 'No' : 'Yes']].map(r => `<tr><th>${r[0]}</th><td>${esc(r[1] || '')}</td></tr>`).join('')}</tbody></table>`;
  const specs = (P.specs || []).map(x => `<tr><td>${esc(x.stage)}</td><td>${esc(x.parameter_name)}${c.action === 'edit' ? ' (added)' : ''}</td><td>${limitText(x)} ${esc(x.unit || '')}${x.optional ? ' - optional on the IPQA sheet' : ''}</td></tr>`).join('');
  const optText = x => (x.optional === true ? ' - optional on the IPQA sheet' : x.optional === false ? ' - required on the IPQA sheet' : '');
  const rem = (P.removed || []).map(x => `<tr><td>${esc(x.stage)}</td><td>${esc(x.parameter_name)} (removed)</td><td>was ${esc(x.was || '')}</td></tr>`).join('');
  const chg = (P.spec_changes || []).map(x => `<tr>${x.parameter_name ? `<td>${esc(x.stage || '')}</td><td>${esc(x.parameter_name)} (changed)</td>` : `<td colspan="2">Specification #${esc(x.id)} (changed)</td>`}
    <td>${x.spec_min != null || x.spec_max != null ? limitText(x) : 'limits unchanged'}${esc(optText(x))}</td></tr>`).join('');
  return `<table class="tbl"><tbody>${c.action === 'create' ? [['Name', P.name], ['Prefix', P.prefix], ['Type', P.type], ['Shelf life', P.shelf_life_months + ' months']].map(r => `<tr><th>${r[0]}</th><td colspan="2">${esc(r[1] || '')}</td></tr>`).join('')
    : P.shelf_life_months != null ? `<tr><th>Shelf life</th><td colspan="2">${esc(P.shelf_life_months)} months</td></tr>` : ''}
    ${typeof P.qc_ph === 'boolean' ? `<tr><th>QC also tests pH</th><td colspan="2">switch ${P.qc_ph ? 'ON: every sample received gets a pH test' : 'OFF'}</td></tr>` : ''}</tbody></table>
    ${specs || chg || rem ? `<table class="tbl" style="margin-top:8px"><thead><tr><th>Stage</th><th>Parameter</th><th>Limit</th></tr></thead><tbody>${specs}${chg}${rem}</tbody></table>` : ''}`;
}
function chgView(id){
  const c = (labCache['/masterdata'].changes || []).find(x => x.id === id); if (!c) return;
  openModal({ title: c.title, sub: `Started by ${c.initiated_by} - ${fmtDate(c.initiated_at)}`, size: 'wide',
    body: `<div class="small" style="margin-bottom:10px"><b>Why:</b> ${esc(c.reason || '')}</div>${chgText(c)}`, footer: `<button class="btn btn-ghost" data-close>Close</button>` });
}
function chgDecide(id){
  const c = (labCache['/masterdata'].changes || []).find(x => x.id === id); if (!c) return;
  const last = c.kind === 'standard' || c.status === 'reviewed', role = c.status === 'submitted' ? 'QC Manager' : 'QA Manager';
  signDialog({ title: last ? 'Approve change' : 'Review change', sub: c.title, ok: last ? 'Sign approval' : 'Sign review',
    meaning: last ? `You approve this as ${role}. It takes effect now.` : `You review this as ${role}. The QA Manager then approves it.`,
    body: `<div class="small" style="margin-bottom:10px"><b>Why:</b> ${esc(c.reason || '')}</div>${chgText(c)}<button class="btn btn-ghost btn-sm" id="chReturn" type="button" style="margin-top:10px">Return to ${esc(c.initiated_by)} instead</button>`,
    onMount: w => { $('#chReturn', w).onclick = () => { closeModalOf(w); decisionDialog({ title: 'Return change', sub: c.title, role,
      submit: async ({ password, reason }) => { await labPost('/change/decide', { id, password, decision: 'return', comments: reason, seen: labSeen('/masterdata') }); toast('Returned', c.title, 'ok'); labRefresh(); } }); }; },
    reason: 'Comment (optional)',
    submit: async ({ password, reason }) => { await labPost('/change/decide', { id, password, decision: 'approve', comments: reason, seen: labSeen('/masterdata') });
      toast(last ? 'Change approved' : 'Sent to the QA Manager', c.title, 'ok'); labRefresh(); } });
}
function chgResend(id){
  const c = (labCache['/masterdata'].changes || []).find(x => x.id === id); if (!c) return;
  if (c.kind === 'standard') return mdStandard(null, Object.assign({}, c.payload, { id_change: c.id }));
  productDialog(c);
}
// a new product (all its details and specifications), or a returned one corrected
function productDialog(again){
  const P = again ? again.payload : { specs: [] };
  // the stages of a solid (granulation ... primary packaging) or a liquid (mixing ... filling)
  const typeStages = (labCache['/masterdata'] || {}).type_stages || { OSD: ['Granulation', 'Compression', 'Sacheting/Blistering/Stripping', 'Finished Product'], OLD: ['Mixing', 'Filling/Sacheting', 'Finished Product'] };
  let stages = typeStages[P.type || 'OSD'];
  const stageOpts = sel => stages.map(st => `<option ${sel === st ? 'selected' : ''}>${esc(st)}</option>`).join('');
  const params = ((labCache['/masterdata'] || {}).parameters || []).length ? labCache['/masterdata'].parameters
    : Array.from(new Map((S.products || []).flatMap(x => (x.specs || []).map(y => [y.parameterName, { name: y.parameterName, unit: y.unit, text: !!y.specText }]))).values());
  const taken = ((labCache['/masterdata'] || {}).prefixes || (S.products || []).map(x => x.prefix)).map(x => String(x).toUpperCase());
  const specRow = x => `<tr class="pd-spec"><td><select class="inp" data-k="stage">${stageOpts(x.stage)}</select></td>
    <td><select class="inp" data-k="parameter_name"><option value="">Choose...</option>${params.map(q => `<option ${x.parameter_name === q.name ? 'selected' : ''}>${esc(q.name)}</option>`).join('')}</select></td>
    <td><input class="inp" data-k="spec_min" type="number" step="any" value="${esc(x.spec_min ?? '')}" style="width:90px"></td>
    <td><input class="inp" data-k="spec_max" type="number" step="any" value="${esc(x.spec_max ?? '')}" style="width:90px"></td><td><input class="inp" data-k="spec_text" value="${esc(x.spec_text || '')}" placeholder="or words, e.g. Complies"></td>
    <td><input class="inp" data-k="unit" value="${esc(x.unit || '')}" style="width:70px"></td><td><button class="btn btn-ghost btn-sm" type="button" data-rm>${I.x}</button></td></tr>`;
  signDialog({ title: again ? 'Correct the new product' : 'New product', sub: 'Everything the product needs is entered here: the QC Manager reviews it, then the QA Manager approves it.', size: 'wide', ok: 'Sign and send',
    meaning: `You start this as ${starterTitle()}. Nothing changes until the QC Manager has reviewed it and the QA Manager has approved it.`,
    body: `<div class="grid g4"><div class="field"><label for="np_name">Product name</label><input class="inp" id="np_name" value="${esc(P.name || '')}"></div>
      <div class="field"><label for="np_prefix">Batch prefix (one letter)</label><input class="inp" id="np_prefix" maxlength="1" style="text-transform:uppercase" value="${esc(P.prefix || '')}">
        <div class="hint" id="np_prefixHint"><span>In use: ${esc(taken.sort().join(', '))}</span></div></div>
      <div class="field"><label for="np_type">Type</label><select class="inp" id="np_type"><option ${P.type === 'OSD' ? 'selected' : ''}>OSD</option><option ${P.type === 'OLD' ? 'selected' : ''}>OLD</option></select></div>
      <div class="field"><label for="np_shelf">Shelf life (months)</label><input class="inp" id="np_shelf" type="number" value="${esc(P.shelf_life_months ?? 60)}"></div></div>
      <div class="sec-title">Specifications (what IPQA and QC check, per stage)</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Stage</th><th>Parameter</th><th>Lower</th><th>Upper</th><th>Description</th><th>Unit</th><th></th></tr></thead><tbody id="npSpecs">${(P.specs || []).map(specRow).join('')}</tbody></table></div>
      <button class="btn btn-ghost btn-sm" type="button" id="npAdd" style="margin-top:6px">${I.plus} Add specification</button>`,
    onMount: w => {
      const tb = $('#npSpecs', w);
      const add = () => tb.insertAdjacentHTML('beforeend', specRow({}));
      if (!(P.specs || []).length) add();
      $('#npAdd', w).onclick = add;
      tb.addEventListener('click', e => { const b = e.target.closest ? e.target.closest('[data-rm]') : null; if (b) b.closest('tr').remove(); });
      tb.addEventListener('change', e => {
        if (!e.target.matches || !e.target.matches('[data-k=parameter_name]')) return;
        const q = params.find(z => z.name === e.target.value), tr = e.target.closest('tr');
        if (q && !tr.querySelector('[data-k=unit]').value) tr.querySelector('[data-k=unit]').value = q.unit || '';
      });
      $('#np_type', w).onchange = e => { stages = typeStages[e.target.value];
        tb.querySelectorAll('[data-k=stage]').forEach(el => { const v = el.value; el.innerHTML = stageOpts(v); }); };
      const pf = $('#np_prefix', w), hint = $('#np_prefixHint', w);
      pf.addEventListener('input', () => {
        pf.value = pf.value.replace(/[^A-Za-z]/g, '').toUpperCase();
        const used = taken.includes(pf.value);
        hint.style.color = used ? 'var(--danger)' : '';
        hint.firstElementChild.textContent = used ? `${pf.value} is already used by another product` : `In use: ${taken.slice().sort().join(', ')}`;
      });
    },
    reason: 'Why is this needed?', reasonRequired: true,
    submit: async ({ password, reason, wrap }) => {
      const specs = Array.from(wrap.querySelectorAll('.pd-spec')).map(tr => { const o = {}; tr.querySelectorAll('[data-k]').forEach(el => { o[el.dataset.k] = el.value.trim(); }); return o; })
        .filter(o => o.parameter_name || o.spec_min || o.spec_max || o.spec_text);
      const payload = { name: $('#np_name', wrap).value.trim(), prefix: $('#np_prefix', wrap).value.trim(), type: $('#np_type', wrap).value, shelf_life_months: $('#np_shelf', wrap).value, specs };
      const body = { payload, reason, password };
      if (again) body.id = again.id; else { body.kind = 'product'; body.action = 'create'; }
      await labPost('/change/submit', body); toast('Sent to the QC Manager', payload.name, 'ok'); mdTab = 'changes'; labRefresh();
    } });
}
// what a template holds, per test type (the view QA signs and the read-only view)
// a method in words (view, send for review, approval): what the analyst will be asked for (065: the technique and its words)
function mdParamsHtml(P, test){
  P = P || {}; test = test || 'assay';
  const kv = (k, v) => `<div class="kv-item"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`;
  const steps = (s, first) => (s || []).map((x, i) => (i === 0 ? `${first} to ${x[1]} mL` : `${x[0]} mL to ${x[1]} mL`)).join(', ');
  const unit = P.dosage_form || 'caplet', W = techWords(P), tech = techOf(P);
  const rd = per => { const lo = wsSplMin(P), hi = wsSplMax(P); return kv(`Sample ${W.readings} per ${per}`, lo === hi ? String(hi) : `${lo} to ${hi}`); };
  const names = Array.isArray(P.sample_names) && P.sample_names.length ? [kv('Usual sample names', P.sample_names.join(', '))] : [];
  const std = tech === 'uv_a1' ? [kv('Technique', 'UV, fixed A(1%, 1 cm) - no standard measured'), kv('A(1%, 1 cm)', P.a1pct ?? '--')]
    : [kv('Technique', tech === 'uv_std' ? 'UV with a standard (absorbance)' : 'HPLC (peak areas)'),
       kv('Standard', `${(P.std || {}).nominal_mg ?? '--'} mg: ${steps((P.std || {}).steps, 'weight')}`),
       kv(`Standard ${W.readings}`, `${(P.std_injections || {}).min} to ${(P.std_injections || {}).max}`),
       kv('System suitability', [`%RSD NMT ${(P.sst || {}).limit_rsd}%`, (P.sst || {}).tailing_max != null ? `tailing factor NMT ${(P.sst || {}).tailing_max}` : '',
         (P.sst || {}).resolution_min != null ? `resolution NLT ${(P.sst || {}).resolution_min}` : ''].filter(Boolean).join(', '))];
  const tail = [kv('Samples per batch', `up to ${(P.samples || {}).max || 1}`), kv('Dosage form', unit), kv('Reported to', `${P.dp ?? 1} decimal place(s)`), ...names];
  let rows;
  if (test === 'assay') rows = [kv('Label claim', (P.label_claim_mg ?? '--') + ' mg'), kv('Theoretical avg weight', ((P.avg_weight || {}).theoretical_mg ?? '--') + ' mg'),
    ...std, kv('Sample', steps((P.sample || {}).steps, 'weight')), kv('Preparations', P.preparations ?? '--'), rd('preparation'),
    kv('Limits', `${(P.limits || {}).min}% to ${(P.limits || {}).max}%`), ...tail];
  else if (test === 'dissolution') rows = [kv('Label claim', (P.label_claim_mg ?? '--') + ' mg'), ...std,
    kv('Sample', steps((P.sample || {}).steps, `1 ${unit}`)), kv('Medium / units', `${P.medium_ml ?? '--'} mL, ${P.units ?? '--'} ${unit}s`), rd(unit),
    kv('Limit', `NLT ${(P.limits || {}).min}%`), ...tail];
  else if (test === 'content_uniformity') rows = [kv('Label claim', (P.label_claim_mg ?? '--') + ' mg'), ...std,
    kv('Sample', steps((P.sample || {}).steps, `1 ${unit}`)), rd(unit), kv('Acceptance', `10 ${unit}s, AV NMT ${P.l1 ?? 15}, k ${P.k1 ?? 2.4}`), ...tail];
  else if (test === 'microbiology') rows = [kv('Unit', (P.limits || {}).unit || 'cfu/g'),
    ...(((P.limits || {}).counts) || []).map(c => kv(c.label, `NMT ${c.max} ${(P.limits || {}).unit || ''}`)),
    kv('Absent', (((P.limits || {}).absent) || []).map(a => a.label).join(', ') || '--'), tail[0], kv('Run details', 'dates only (no instrument, no reagent lots)')];
  else if (test === 'weight_variation'){ const L = P.limits || {};   // 058
    rows = [kv('Units weighed', L.units ?? '--'), kv('Each unit', `within ±${L.limit_pct}% of the average`), kv('Allowed outside', `${L.allowed_out || 0} (none beyond ±${2 * (L.limit_pct || 0)}%)`),
      kv('Average', L.target && L.target.weight ? `${L.target.weight} ${P.unit || 'g'} ±${L.target.pct}%` : 'no target'), kv('Unit', P.unit || 'g'), tail[0]]; }
  else if (test === 'ph') rows = [kv('Limit', `${(P.limits || {}).min ?? '--'} to ${(P.limits || {}).max ?? '--'}`), kv('Readings per sample', P.readings || 1), tail[0]];   // 058
  else rows = [kv('Calculation', 'Retention times recorded; the analyst decides whether the sample complies'), ...tail];
  return `<div class="kv-grid" style="margin-bottom:12px">${rows.join('')}</div>`;
}
// what a draft still needs (the server's check, 065) and whether it was tried with Excel numbers
function tplProblemsHtml(t){
  const p = t.problems || [];
  return p.length ? `<div class="notice" style="margin-bottom:12px;color:var(--danger)">${I.alert} <span><b>Not complete yet</b> (it cannot be sent or approved):<ul style="margin:6px 0 0 18px">${p.map(x => `<li>${esc(x)}</li>`).join('')}</ul></span></div>` : '';
}
function tplTryHtml(t){
  const r = t.try_run;
  if (!r) return t.status === 'draft' ? `<div class="notice" style="margin-bottom:12px">${I.info} Not tried with Excel numbers.</div>` : '';
  const rows = (r.results || []).map((x, i) => { const e = (r.excel || [])[i] || (r.excel || [])[0] || {}; const same = tryMatches(x, e.value);
    return `<tr><td>${esc(x.api)}</td><td class="tnum strong">${esc(resText(x))}</td><td class="tnum">${esc(e.value ?? '--')}</td><td>${same ? '<span class="badge b-ok">Same</span>' : '<span class="badge b-danger">Different</span>'}</td></tr>`; }).join('');
  return `<div class="card" style="margin-bottom:12px"><div class="card-h"><div><h3>Tried with Excel numbers</h3>
      <div class="sub">${esc(r.by || '')}, ${fmtDateTime(r.at)}${t.try_current === false ? ' - <b>the method changed after this try-out: try it again</b>' : ''}</div></div></div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:0" data-nosort><thead><tr><th>API</th><th>QSync</th><th>Excel</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
// QSync's reported value against the Excel number, rounded the same way (the method's decimal places)
function tryMatches(x, excel){
  if (excel === '' || excel == null || isNaN(Number(excel)) || x.value_reported == null) return false;
  const dp = (String(x.value_reported).split('.')[1] || '').length;
  const r = Number(Math.round(Number(Number(excel).toPrecision(12) + 'e' + Math.max(dp, 1))) + 'e-' + Math.max(dp, 1));
  return Math.abs(r - Number(x.value_reported)) < 1e-9 || Math.abs(Number(excel) - Number(x.value_reported)) < 0.05;
}
function mdTemplateView(id){
  const t = (labCache['/masterdata'].templates || []).find(x => x.id === id); if (!t) return;
  openModal({ title: `${t.api} - v${t.version} (${t.status})`, sub: `${t.product_name} ${t.stage} - ${TEST_TYPES[t.test_type] || t.test_type} - ${t.method_ref || ''} ${t.spec_ref || ''} ${t.form_ref || ''}`,
    body: tplProblemsHtml(t) + mdParamsHtml(t.parameters, t.test_type) + tplTryHtml(t) + (t.change_note ? `<div class="small muted">Change note: ${esc(t.change_note)}</div>` : ''),
    footer: `${TRY_TESTS.includes(t.test_type) ? `<a class="btn btn-ghost" href="#/lab/master/try/${t.id}">Try it with Excel numbers</a>` : ''}<button class="btn btn-ghost" data-close>Close</button>` });
}
// the tests a try-out is offered for (a number to compare with the Excel sheet)
const TRY_TESTS = ['assay', 'dissolution', 'content_uniformity', 'weight_variation', 'ph'];
// fresh parameters for a new template, per test type: the reusable set-up for new products and new methods
function mdTplDefaults(test){
  const base = { std_injections: { min: 5, max: 6 }, samples: { min: 1, max: 3 }, sst: { limit_rsd: 2.0, dp: 2 }, dp: 1, dosage_form: 'tablet', technique: 'hplc', injections: { min: 1, max: 2 } };
  if (test === 'assay') return { label_claim_mg: '', std: { nominal_mg: '', steps: [[null, 100], [1, 1], [1, 1]] }, sample: { nominal_mg: '', steps: [[null, 100], [1, 1], [1, 1]] },
    avg_weight: { theoretical_mg: '' }, preparations: 2, limits: { min: 90.0, max: 110.0 }, ...base };
  if (test === 'dissolution') return { label_claim_mg: '', std: { nominal_mg: '', steps: [[null, 100], [1, 1], [1, 1]] }, sample: { steps: [[1, 900], [1, 1], [1, 1]] },
    medium_ml: 900, units: 6, limits: { min: 80.0 }, ...base };
  if (test === 'content_uniformity') return { label_claim_mg: '', std: { nominal_mg: '', steps: [[null, 100], [1, 1]] }, sample: { steps: [[1, 100]] },
    k1: 2.4, l1: 15.0, ...base };
  if (test === 'microbiology') return { samples: base.samples, dosage_form: base.dosage_form,
    limits: { unit: 'cfu/g', counts: [{ key: 'tamc', label: 'TAMC', max: 100 }, { key: 'tymc', label: 'TYMC', max: 50 }],
      absent: [{ key: 's_aureus', label: 'Staphylococcus aureus' }, { key: 'salmonella', label: 'Salmonella spp' },
               { key: 'p_aeruginosa', label: 'Pseudomonas aeruginosa' }, { key: 'e_coli', label: 'Escherichia coli' }] } };
  // 058: weight variation (units weighed, each within +/- limit of the average) and pH (reading against limits)
  if (test === 'weight_variation') return { unit: 'g', dp: 3, samples: { min: 1, max: 1 }, dosage_form: 'sachet',
    limits: { units: 10, limit_pct: 5, allowed_out: 0, target: { weight: '', pct: '' } } };
  if (test === 'ph') return { readings: 1, dp: 2, samples: { min: 1, max: 1 }, limits: { min: '', max: '' } };
  return { samples: base.samples, dosage_form: base.dosage_form };                     // identification: the analyst decides
}
const UNIT_TESTS = ['assay', 'dissolution', 'content_uniformity'];
// older methods: "injections: 2" means 1 to 2; the technique is written out (065)
function tplNormalize(P, test){
  if (!UNIT_TESTS.includes(test)) return P;
  if (P.injections == null) P.injections = { min: 1, max: 2 };
  else if (typeof P.injections !== 'object') P.injections = { min: 1, max: Number(P.injections) || 2 };
  P.technique = techOf(P);
  if (!P.std_injections && P.technique !== 'uv_a1') P.std_injections = { min: 5, max: 6 };
  if (!P.sst && P.technique !== 'uv_a1') P.sst = { limit_rsd: 2.0, dp: 2 };
  if (!P.std && P.technique !== 'uv_a1') P.std = { nominal_mg: '', steps: [[null, 100], [1, 1]] };
  return P;
}
// the other products of a product's group that have an approved method for the same test and API, and no draft of it
function groupSiblings(product, test, api){
  const md = labCache['/masterdata'] || {}, flags = md.product_flags || {}, g = (flags[product] || {}).method_group;
  if (!g) return { group: null, list: [] };
  const lc = x => String(x || '').trim().toLowerCase();
  const list = Object.keys(flags).filter(n => n !== product && flags[n].method_group === g).sort().map(n => {
    const has = (md.templates || []).some(x => x.product_name === n && x.test_type === test && lc(x.api) === lc(api) && x.status === 'approved');
    const draft = (md.templates || []).some(x => x.product_name === n && x.test_type === test && lc(x.api) === lc(api) && x.status === 'draft');
    return { name: n, ok: has && !draft, why: !has ? `no approved ${TEST_TYPES[test] || test} method for ${api}` : draft ? 'already has a draft' : '' };
  });
  return { group: g, list };
}
// draft editor (065): the technique first, then the boxes in the order the analyst works: standard, sample, readings, limits, this product's numbers.
// Anything a field does not show is kept as it was (never dropped). New: start from any approved method; "same change for the group".
function mdTemplate(id, mode, preset){
  const md = labCache['/masterdata'];
  const src = id ? md.templates.find(x => x.id === id) : null;
  const isNew = !src;
  let test = src ? src.test_type : 'assay';
  let P = tplNormalize(src ? JSON.parse(JSON.stringify(src.parameters || {})) : mdTplDefaults(test), test);
  const getP = path => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), P);
  const setP = (path, val) => { const ks = path.split('.'); let o = P; ks.slice(0, -1).forEach(k => { if (o[k] == null) o[k] = {}; o = o[k]; }); o[ks[ks.length - 1]] = val; };
  const product = () => (isNew ? ($('#tp_product') || {}).value : src.product_name);
  const apiNow = () => (isNew ? (($('#tp_api') || {}).value || '').trim() : src.api);
  const starts = () => (md.templates || []).filter(x => x.status === 'approved' && x.test_type === test && String(x.api || '').trim())
    .sort((a, b) => a.product_name.localeCompare(b.product_name) || a.api.localeCompare(b.api));
  openModal({ title: isNew ? 'New method template (draft)' : mode === 'edit' ? `Edit draft - ${src.product_name} ${src.api} v${src.version}` : `New version of ${src.product_name} ${src.api} (from v${src.version})`, size: 'wide',
    body: `${isNew ? `<div class="grid g3">
        <div class="field"><label for="tp_product">Product</label><select class="inp" id="tp_product">${(md.products || []).map(p => `<option>${esc(p)}</option>`).join('')}</select></div>
        <div class="field"><label for="tp_test">Test</label><select class="inp" id="tp_test">${testOptions('assay', NEW_TESTS)}</select></div>
        <div class="field"><label for="tp_api">API</label><input class="inp" id="tp_api" autocomplete="off" placeholder="e.g. Paracetamol (one template per API)"></div></div>
      <div class="field"><label for="tp_from">Start from an existing method (optional)</label><select class="inp" id="tp_from"></select>
        <div class="hint">${I.info}<span>Fills everything in from that method (any product). Then change only what is different for this product, e.g. the label claim and average weight.</span></div></div>` : ''}
      <div id="tpParams"></div>
      <div id="tpGroup"></div>
      <div class="grid g3">
        <div class="field"><label for="tp_mref">Method ref</label><input class="inp" id="tp_mref" type="text" placeholder="e.g. QC/MOA/FP/002" value="${esc(src ? src.method_ref || '' : '')}"></div>
        <div class="field"><label for="tp_sref">Spec ref</label><input class="inp" id="tp_sref" type="text" placeholder="e.g. OKL/QC/SP/FP/002" value="${esc(src ? src.spec_ref || '' : '')}"></div>
        <div class="field"><label for="tp_fref">Form / Excel ref</label><input class="inp" id="tp_fref" type="text" value="${esc(src ? src.form_ref || '' : '')}"></div></div>
      <div class="field"><label for="tp_note">Change note</label><input class="inp" id="tp_note" value="${esc(mode === 'edit' && src ? src.change_note || '' : '')}"></div>
      <div class="err-msg hide" id="tpErr" style="color:var(--danger)"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="tpOk">Save draft</button>`,
    onMount: (w, close) => {
      const box = $('#tpParams', w);
      const f = (path, label, type, hint) => `<div class="field"><label>${esc(label)}</label><input class="inp" data-p="${path}" type="${type || 'number'}" step="any" value="${esc(getP(path) ?? '')}">${hint ? `<div class="hint">${I.info}<span>${esc(hint)}</span></div>` : ''}</div>`;
      const formSel = () => `<div class="field"><label>Dosage form (unit word)</label><select class="inp" data-p="dosage_form">
          ${['tablet', 'caplet', 'capsule', 'sachet'].map(u => `<option ${((P.dosage_form || 'caplet') === u) ? 'selected' : ''}>${u}</option>`).join('')}</select></div>`;
      const sec = (title, inner, sub) => `<div class="fieldset" style="margin-bottom:12px"><div class="sec-title">${esc(title)}${sub ? ` <span class="tiny muted" style="font-weight:400">${esc(sub)}</span>` : ''}</div>${inner}</div>`;
      const stepRows = (key, title, first) => { const s = getP(key + '.steps') || [];
        return `<div><div class="small strong" style="margin-bottom:6px">${esc(title)}</div>
          ${s.map((x, i) => `<div class="row" style="gap:6px;flex-wrap:nowrap;margin-bottom:6px">
            ${i === 0 ? `<span class="small" style="width:110px">${esc(first)}</span>`
              : `<span class="small" style="width:70px">Then take</span><input class="inp" data-p="${key}.steps.${i}.0" type="number" step="any" value="${esc(x[0] ?? '')}" style="width:84px"><span class="small">mL to</span>`}
            <input class="inp" data-p="${key}.steps.${i}.1" type="number" step="any" value="${esc(x[1] ?? '')}" style="width:84px"><span class="small">mL</span>
            ${i === s.length - 1 && i > 0 ? `<button class="btn btn-ghost btn-sm" data-step="${key}:-1" title="Remove this step">${I.x}</button>` : ''}</div>`).join('')}
          ${s.length < 4 ? `<button class="btn btn-ghost btn-sm" data-step="${key}:1">${I.plus} Dilution step</button>` : ''}</div>`; };
      const namesBox = () => `<div class="field"><label>Usual sample names (optional)</label><input class="inp" id="tp_names" type="text" autocomplete="off" placeholder="e.g. Top, Middle, Bottom, Composite"
          value="${esc((P.sample_names || []).join(', '))}"><div class="hint">${I.info}<span>Separated by commas. Offered as the sample names on the worksheet, in this order.</span></div></div>`;
      const draw = () => {
        const unit = P.dosage_form || 'caplet';
        if (UNIT_TESTS.includes(test)){
          const tech = techOf(P), W = techWords(P);
          const techBox = `<div class="field"><label>Technique</label><select class="inp" data-p="technique">${TECHNIQUES.map(([k, l]) => `<option value="${k}" ${tech === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
            <div class="hint">${I.info}<span>${tech === 'hplc' ? 'Peak areas from Empower / LabSolutions; injections.' : tech === 'uv_std' ? 'Absorbances from the UV; a weighed standard is read too (e.g. Cypron dissolution).' : 'Absorbances from the UV against a fixed A(1%, 1 cm) value: no standard is weighed or read (e.g. Cypron assay and CU).'}</span></div></div>`;
          const product = sec('This product', `<div class="grid g4">${f('label_claim_mg', 'Label claim (mg)')}${test === 'assay' ? f('avg_weight.theoretical_mg', 'Theoretical average weight (mg)') : ''}
              ${formSel()}${f('samples.max', 'Samples per batch (max)', 'number', 'More than 1 for validation batches (LS, MS, HS) or blend locations')}</div>${namesBox()}`,
            '(each product keeps its own when a change is copied to its group)');
          const std = tech === 'uv_a1' ? sec('Standard', `<div class="grid g3">${f('a1pct', 'A(1%, 1 cm) value', 'number', 'e.g. 355 for cyproheptadine')}
              <div class="hint" style="align-self:center;grid-column:span 2">${I.info}<span>No standard is weighed or read; the analyst enters only the sample absorbances.</span></div></div>`)
            : sec('Standard', `<div class="grid g2">${stepRows('std', 'Standard dilution', 'Weigh into')}<div>
                ${f('std.nominal_mg', 'Standard nominal weight (mg)')}
                <div class="grid g2">${f('std_injections.min', `Standard ${W.readings}: least`)}${f('std_injections.max', `Standard ${W.readings}: most`)}</div></div></div>
              <div class="grid g3">${f('sst.limit_rsd', 'System suitability %RSD limit (NMT)')}
                ${tech === 'hplc' ? f('sst.tailing_max', 'Tailing factor NMT (optional)') + f('sst.resolution_min', 'Resolution NLT (optional)') : ''}</div>
              ${tech === 'hplc' ? `<div class="hint">${I.info}<span>Leave tailing / resolution blank when the method does not use them. When set, the analyst types the value in after the standard injections.</span></div>` : ''}`);
          const per = test === 'assay' ? 'preparation' : unit;
          const reads = `<div class="grid g2">${f('injections.min', `${W.Readings} per ${per}: least`)}${f('injections.max', `${W.Readings} per ${per}: most`)}</div>
            <div class="hint">${I.info}<span>The same number for both (e.g. 2 and 2) shows that many boxes every time${tech === 'hplc' ? '' : ' (reading A and B)'}; with more than one, the mean is used.</span></div>`;
          const sample = test === 'assay' ? sec('Sample', `<div class="grid g2">${stepRows('sample', 'Sample dilution', 'Weigh into')}<div>${f('preparations', 'Preparations')}${reads}</div></div>`)
            : test === 'dissolution' ? sec('Sample', `<div class="grid g2">${stepRows('sample', `Sample dilution (1 ${unit} into the medium)`, `1 ${unit} into`)}<div>${f('units', `Units per run (${unit}s)`)}${reads}</div></div>`)
            : sec('Sample', `<div class="grid g2">${stepRows('sample', `Sample dilution (1 ${unit} each, 10 ${unit}s)`, `1 ${unit} into`)}<div>${reads}</div></div>`);
          const limits = test === 'assay' ? sec('Limits', `<div class="grid g3">${f('limits.min', 'Lower limit (%)')}${f('limits.max', 'Upper limit (%)')}${f('dp', 'Reported to (decimal places)')}</div>`)
            : test === 'dissolution' ? sec('Limits', `<div class="grid g3">${f('limits.min', 'Limit: NLT (%)')}${f('dp', 'Reported to (decimal places)')}</div>`)
            : sec('Limits', `<div class="grid g3">${f('k1', 'k (acceptability constant)')}${f('l1', 'AV limit (NMT)')}${f('dp', 'Reported to (decimal places)')}</div>`);
          box.innerHTML = `<div class="grid g2">${techBox}</div>${std}${sample}${limits}${product}`;
        } else if (test === 'microbiology') box.innerHTML = `
          <div class="notice" style="margin-bottom:12px">${I.info} Microbiology worksheets ask only for the dates: no instrument and no reagent lots.</div>
          <div class="grid g3">
            <div class="field"><label>Unit</label><select class="inp" data-p="limits.unit">${['cfu/g', 'cfu/ml'].map(u => `<option ${(((P.limits || {}).unit || 'cfu/g') === u) ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
            ${(((P.limits || {}).counts) || []).map((c, i) => f(`limits.counts.${i}.max`, `${c.label} (NMT)`)).join('')}</div>
          <div class="field"><label>Organisms that must be absent (one per line)</label>
            <textarea class="inp" id="tp_absent" rows="4">${esc((((P.limits || {}).absent) || []).map(a => a.label).join('\n'))}</textarea></div>
          <div class="grid g3">${f('samples.max', 'Samples per batch (max)')}</div>`;
        else if (test === 'weight_variation') box.innerHTML = `
          <div class="grid g4">${f('limits.units', 'Units weighed')}${f('limits.limit_pct', 'Each unit within ± % of the average')}${f('limits.allowed_out', 'Units allowed outside (none beyond twice)')}
            <div class="field"><label>Unit of weight</label><select class="inp" data-p="unit">${['g', 'mg'].map(u => `<option ${(P.unit || 'g') === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div></div>
          <div class="grid g3">${f('limits.target.weight', 'Target average weight (optional)')}${f('limits.target.pct', 'Average within ± % of the target')}${formSel()}</div>`;
        else if (test === 'ph') box.innerHTML = `
          <div class="grid g3">${f('limits.min', 'Lower limit (pH)')}${f('limits.max', 'Upper limit (pH)')}${f('readings', 'Readings per sample')}</div>
          <div class="hint">${I.info}<span>For a new pH method the limits are filled in from the product's IPQA pH specification. Change them only if QC's limit is different.</span></div>`;
        else box.innerHTML = `
          <div class="notice" style="margin-bottom:12px">${I.info} Identification has no calculation: the retention times are recorded and the analyst decides whether the sample complies. One method per API.</div>
          <div class="grid g3">${f('samples.max', 'Samples per batch (max)')}${formSel()}</div>`;
        drawGroup();
      };
      // "same change for the group" (065): offered on a new version or a draft edit, for the products of the same group
      const drawGroup = () => {
        const g = $('#tpGroup', w); if (!g) return;
        if (isNew){ g.innerHTML = ''; return; }
        const sib = groupSiblings(src.product_name, test, src.api);
        if (!sib.group || !sib.list.length){ g.innerHTML = ''; return; }
        g.innerHTML = `<div class="fieldset" style="margin-bottom:12px"><div class="sec-title">Same change for the group <span class="tiny muted" style="font-weight:400">(${esc(sib.group)})</span></div>
          ${sib.list.map(x => `<label class="row" style="gap:8px;margin-bottom:6px;align-items:center"><input type="checkbox" data-grp="${esc(x.name)}" ${x.ok ? '' : 'disabled'}> <span>${esc(x.name)}</span>
            ${x.ok ? '' : `<span class="tiny muted">${esc(x.why)}</span>`}</label>`).join('')}
          <div class="hint">${I.info}<span>Each ticked product gets its own draft with this change, keeping its own label claim, average weight, dosage form, samples per batch and sample names. Each draft is sent and approved on its own.</span></div></div>`;
      };
      const sync = e => { const p = e.target.dataset && e.target.dataset.p; if (p) { setP(p, e.target.value); if (p === 'dosage_form' || p === 'technique') draw(); } };
      box.addEventListener('input', sync); box.addEventListener('change', sync);
      box.addEventListener('click', e => { const b = e.target.closest ? e.target.closest('[data-step]') : null; if (!b) return;
        const [key, d] = b.dataset.step.split(':'); const s = getP(key + '.steps');
        if (d === '1') s.push([1, 1]); else s.pop(); draw(); });
      // a new pH method starts from the product's IPQA pH specification (058)
      const phFromSpec = () => { if (test !== 'ph') return; const prod = (S.products || []).find(x => x.name === $('#tp_product', w).value);
        const sp = ((prod || {}).specs || []).find(y => /^ph$/i.test(String(y.parameterName || '').trim()) && (y.specMin != null || y.specMax != null));
        if (sp){ P.limits = { min: sp.specMin ?? '', max: sp.specMax ?? '' }; } if (!$('#tp_api', w).value) $('#tp_api', w).value = 'pH'; };
      // fixed names: microbiology, weight variation, pH (065: microbiology is always "Microbiology")
      const fixedApi = () => { const a = $('#tp_api', w); if (!a) return;
        if (test === 'microbiology'){ a.value = 'Microbiology'; a.readOnly = true; return; }
        a.readOnly = false;
        if (test === 'weight_variation' && !a.value) a.value = 'Weight variation'; };
      const fillStarts = () => { const sel = $('#tp_from', w); if (!sel) return;
        const list = starts();
        sel.innerHTML = `<option value="">No: start from empty boxes</option>` + list.map(x => `<option value="${x.id}">${esc(x.product_name)} - ${esc(x.api)} v${esc(x.version)}${UNIT_TESTS.includes(test) ? ' (' + esc(techWords(x.parameters).name) + ')' : ''}${x.method_ref ? ' - ' + esc(x.method_ref) : ''}</option>`).join('');
        sel.parentElement.style.display = list.length ? '' : 'none'; };
      if (isNew){
        $('#tp_test', w).onchange = () => { test = $('#tp_test', w).value; P = tplNormalize(mdTplDefaults(test), test); phFromSpec(); fixedApi(); fillStarts(); draw(); };
        $('#tp_product', w).onchange = () => { if (test === 'ph'){ phFromSpec(); draw(); } };
        $('#tp_from', w).onchange = () => { const x = (md.templates || []).find(y => String(y.id) === $('#tp_from', w).value);
          if (!x){ P = tplNormalize(mdTplDefaults(test), test); draw(); return; }
          P = tplNormalize(JSON.parse(JSON.stringify(x.parameters || {})), test);
          const a = $('#tp_api', w); if (a && !a.readOnly) a.value = x.api;
          [['mref', 'method_ref'], ['sref', 'spec_ref'], ['fref', 'form_ref']].forEach(([k, n]) => { const el = $('#tp_' + k, w); if (el && !el.value) el.value = x[n] || ''; });
          const note = $('#tp_note', w); if (note && !note.value) note.value = `Started from ${x.product_name} ${x.api} v${x.version}`;
          draw(); };
        fixedApi(); fillStarts();
        if (preset){   // from an empty cell of the grid (065)
          if (preset.product) $('#tp_product', w).value = preset.product;
          if (preset.test && preset.test !== test){ $('#tp_test', w).value = preset.test; $('#tp_test', w).onchange(); }
          if (preset.api && !$('#tp_api', w).readOnly) $('#tp_api', w).value = preset.api;
        }
      }
      draw();
      $('#tpOk', w).onclick = async () => {
        const v = k => $('#tp_' + k, w).value;
        const er = $('#tpErr', w);
        const fail = m => { er.textContent = m; er.classList.remove('hide'); };
        const num = x => (x === '' || x === null || x === undefined ? null : Number(x));
        // numbers typed as text -> numbers; dilution steps keep their shape (first take: a weight -> null, 1 unit -> 1)
        const numPaths = { assay: ['label_claim_mg', 'std.nominal_mg', 'sample.nominal_mg', 'avg_weight.theoretical_mg', 'preparations', 'limits.min', 'limits.max'],
          dissolution: ['label_claim_mg', 'std.nominal_mg', 'medium_ml', 'units', 'limits.min'],
          content_uniformity: ['label_claim_mg', 'std.nominal_mg', 'k1', 'l1'],
          identification: ['samples.max'], microbiology: ['samples.max'],
          weight_variation: ['limits.units', 'limits.limit_pct', 'limits.allowed_out', 'limits.target.weight', 'limits.target.pct', 'samples.max', 'dp'],
          ph: ['readings', 'limits.min', 'limits.max', 'samples.max', 'dp'] }[test] || [];
        if (UNIT_TESTS.includes(test)) numPaths.push('a1pct', 'std_injections.min', 'std_injections.max', 'sst.limit_rsd', 'sst.tailing_max', 'sst.resolution_min',
          'injections.min', 'injections.max', 'samples.max', 'dp');
        numPaths.forEach(p => { if (getP(p) !== undefined) setP(p, num(getP(p))); });
        if (UNIT_TESTS.includes(test)){
          const tech = techOf(P);
          if (tech === 'uv_a1'){ delete P.std; delete P.std_injections; delete P.sst; }   // no standard is measured
          else delete P.a1pct;
          if (P.sst){ if (tech !== 'hplc'){ delete P.sst.tailing_max; delete P.sst.resolution_min; } ['tailing_max', 'resolution_min'].forEach(k => { if (P.sst[k] == null) delete P.sst[k]; }); }
          const names = String(($('#tp_names', w) || {}).value || '').split(',').map(x => x.trim()).filter(Boolean);
          if (names.length) P.sample_names = names; else delete P.sample_names;
        }
        if (test === 'weight_variation' && P.limits && P.limits.target && !P.limits.target.weight) delete P.limits.target;
        if (test === 'ph' && P.limits && P.limits.min == null && P.limits.max == null) return fail('Enter the pH limits.');
        if (test === 'weight_variation' && !(P.limits && P.limits.limit_pct > 0)) return fail('Enter the ± % limit for each unit.');
        const unitFirst = test === 'dissolution' || test === 'content_uniformity';
        ['std', 'sample'].forEach(k => { const s = getP(k + '.steps');
          if (s) s.forEach((x, i) => { s[i] = i === 0 ? [k === 'sample' && unitFirst ? 1 : null, num(x[1])] : [num(x[0]), num(x[1])]; }); });
        if (P.samples) P.samples.min = P.samples.min || 1;
        if (test === 'dissolution' && P.sample && P.sample.steps) P.medium_ml = P.sample.steps[0][1];
        if (test === 'microbiology' && P.limits) { const old = (P.limits.absent) || [];
          (P.limits.counts || []).forEach(c => { c.max = num(c.max); });
          P.limits.absent = $('#tp_absent', w).value.split('\n').map(x => x.trim()).filter(Boolean).map(label => {
            const prev = old.find(a => a.label.toLowerCase() === label.toLowerCase());
            return { key: prev ? prev.key : label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''), label }; });
        }
        if (P.sample && P.sample.nominal_mg === undefined && test === 'assay') P.sample.nominal_mg = (P.avg_weight || {}).theoretical_mg;
        if (isNew && !v('api').trim()) return fail('Enter the API.');
        const body = { parameters: P, method_ref: v('mref'), spec_ref: v('sref'), form_ref: v('fref'), change_note: v('note') };
        if (isNew) Object.assign(body, { product_name: v('product'), test_type: test, api: v('api').trim() });
        else if (mode === 'edit') body.id = src.id; else body.from_id = src.id;
        const group = $$('[data-grp]', w).filter(x => x.checked).map(x => x.dataset.grp);
        try {
          const res = await labPost('/template/draft', body);
          let extra = '';
          if (group.length){
            try { const g = await labPost('/template/group', { id: res.id, products: group });
              extra = ` Same change drafted for ${(g.created || []).join(', ') || 'none'}${(g.skipped || []).length ? '; not for ' + g.skipped.join('; ') : ''}.`; }
            catch (e2) { extra = ' The group drafts were not made: ' + e2.message; }
          }
          close(); toast('Draft saved', 'Try it with Excel numbers, then send it for review.' + extra, 'ok', extra ? 9000 : 5000); labRefresh();
        } catch (e) { fail(e.message); }
      };
    } });
}
// copy every approved method of one product to another, as drafts (065): e.g. Cannon Para from Cypron
function mdCopyProduct(){
  const md = labCache['/masterdata'] || {};
  const withMethods = [...new Set((md.templates || []).filter(t => t.status === 'approved').map(t => t.product_name))].sort();
  openModal({ title: 'Copy methods from another product', size: 'narrow',
    body: `<div class="field"><label for="cpFrom">Copy the approved methods of</label><select class="inp" id="cpFrom">${withMethods.map(p => `<option>${esc(p)}</option>`).join('')}</select></div>
      <div class="field"><label for="cpTo">To</label><select class="inp" id="cpTo">${(md.products || []).map(p => `<option>${esc(p)}</option>`).join('')}</select></div>
      <div class="hint">${I.info}<span>Each method becomes a draft for the new product. Then edit each draft (label claim, average weight, limits), try it with Excel numbers and send it for review. Methods the product already has are left alone.</span></div>
      <div class="err-msg hide" id="cpErr" style="color:var(--danger)"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="cpOk">Copy as drafts</button>`,
    onMount: (w, close) => { $('#cpOk', w).onclick = async () => {
      try { const r = await labPost('/template/copy-product', { from_product: $('#cpFrom', w).value, to_product: $('#cpTo', w).value });
        close(); toast(`${r.created} draft(s) made`, (r.skipped || []).length ? 'Not copied: ' + r.skipped.join('; ') : 'Edit each one, then send it for review.', 'ok', 9000); labRefresh(); }
      catch (e) { const er = $('#cpErr', w); er.textContent = e.message; er.classList.remove('hide'); }
    }; } });
}
// a product's method group (065): which products share methods; QC Supervisor or QC Manager
function mdGroup(name){
  const md = labCache['/masterdata'] || {}, cur = ((md.product_flags || {})[name] || {}).method_group || '';
  openModal({ title: `Method group of ${name}`, size: 'narrow',
    body: `<div class="field"><label for="grSel">Group</label><select class="inp" id="grSel"><option value="">No group</option>
        ${(md.groups || []).map(g => `<option ${g === cur ? 'selected' : ''}>${esc(g)}</option>`).join('')}<option value="__new">A new group...</option></select></div>
      <div class="field hide" id="grNewF"><label for="grNew">New group name</label><input class="inp" id="grNew" autocomplete="off" placeholder="e.g. Cypron, Cannon Para"></div>
      <div class="field"><label for="grWhy">Why (kept in the audit trail)</label><input class="inp" id="grWhy" autocomplete="off"></div>
      <div class="hint">${I.info}<span>Products in the same group share their methods: a new version on one offers "same change" for the others. It changes no result and no approved method.</span></div>
      <div class="err-msg hide" id="grErr" style="color:var(--danger)"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="grOk">Save</button>`,
    onMount: (w, close) => {
      $('#grSel', w).onchange = () => $('#grNewF', w).classList.toggle('hide', $('#grSel', w).value !== '__new');
      $('#grOk', w).onclick = async () => {
        const sel = $('#grSel', w).value, g = sel === '__new' ? $('#grNew', w).value.trim() : sel;
        try { await labPost('/product/group', { product_name: name, method_group: g, reason: $('#grWhy', w).value.trim() });
          close(); toast('Group saved', `${name}: ${g || 'no group'}`, 'ok'); labRefresh(); }
        catch (e) { const er = $('#grErr', w); er.textContent = e.message; er.classList.remove('hide'); }
      };
    } });
}
// ---- "Try it with Excel numbers" (065): the method's worksheet boxes for one sample, calculated on the server like a real worksheet;
// the QC or QA Supervisor types one run from the Excel sheet and the Excel result, and saves the comparison on the draft.
let tryExcel = {};
function viewLabTry(id){
  const md = labGet('/masterdata');
  if (!md) return labWait('Try a method', 'Administration');
  if (md.error) return labFail('Try a method', 'Administration', md.error);
  const t = (md.templates || []).find(x => String(x.id) === String(id));
  if (!t) return labFail('Try a method', 'Administration', 'Method not found.');
  if (!TRY_TESTS.includes(t.test_type)) return labFail('Try a method', 'Administration', 'This test has no calculation to compare.');
  if (!ws || ws.try !== t.id || ws.src !== t){
    const keepIn = ws && ws.try === t.id ? ws.inputs : null;
    const P = t.parameters || {};
    const names = Array.isArray(P.sample_names) && P.sample_names.length ? P.sample_names[0] : 'Excel';
    ws = { id: 'try' + t.id, try: t.id, src: t, dirty: false, timer: null, run: {}, calc: null, tab: t.id,
           ctx: { analysis: { id: 0, test_type: t.test_type, stage: 'Finished Product', is_mine: true, status: 'in_progress' },
                  templates: [{ id: t.id, api: t.api, version: t.version, method_ref: t.method_ref, parameters: P }],
                  standards: [{ id: -1, ws_no: 'Excel check', substance: t.api, potency_pct: '', usable: true }],
                  samples: [{ assignment_id: 0, batch_no: 'Excel' }], std_sources: {}, equipment: [], attachments: [] },
           inputs: keepIn || { samples: [{ key: 'x', assignment_id: 0, label: names }], apis: {}, values: {} } };
    ws.savedApis = {};
    wsEnsure();
    if (UNIT_TESTS.includes(t.test_type) && techOf(P) !== 'uv_a1') ws.inputs.apis[t.id].ws_id = -1;
  }
  const canSave = isStarter() && t.status === 'draft' && t.stage_of_change !== 'in_review' && t.stage_of_change !== 'reviewed';
  const ex = tryExcel[t.id] || '';
  return {
    title: 'Try a method', crumb: 'Administration',
    html: `${pageHead(`Try: ${esc(t.product_name)} - ${esc(TEST_TYPES[t.test_type] || t.test_type)} - ${esc(t.api)} v${esc(t.version)}`,
        'Type one run from your Excel calculation sheet. QSync calculates it exactly as on a worksheet; compare its result with your Excel result.',
        `<a class="btn btn-ghost" href="#/lab/master">${I.chevL} Lab master data</a>`)}
      ${tplProblemsHtml(t)}
      <div class="notice" style="margin-bottom:16px">${I.info} <span>Nothing typed here goes on a batch. ${canSave ? 'When the results match, <b>Save this check</b>: the QC Manager sees it when approving.' : t.status === 'draft' ? 'This draft is with the approvers: the check can be tried but not saved.' : 'This method is approved: you can try it, nothing is saved.'}
        Known Excel errors give a different number: Mixagrip CU (phenylephrine tablet 3 uses tablet 2's area), Medik 55 and Cannon PM dissolution (divide by the 6th standard injection, not the average).</span></div>
      ${wsApiPanel(ws.ctx.templates[0])}
      <div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Results</h3><div class="sub">Calculated on the server (engine <span id="wsEngine"></span>)</div></div><span id="wsCalcState" class="small muted"></span></div><div id="wsResults" class="card-b"></div></div>
      <div class="card"><div class="card-h"><div><h3>Your Excel result</h3><div class="sub">${esc(t.test_type === 'content_uniformity' ? 'The acceptance value (AV)' : t.test_type === 'weight_variation' ? 'The average weight' : t.test_type === 'ph' ? 'The pH' : 'The result (mean %)')} on the Excel sheet for the same numbers</div></div></div>
        <div class="card-b"><div class="grid g3"><div class="field"><label for="tryEx">Excel result</label><input class="inp tnum" id="tryEx" inputmode="decimal" autocomplete="off" value="${esc(ex)}"></div>
          <div class="field"><label>Compared</label><div id="tryCmp" style="padding-top:8px">--</div></div>
          <div class="field" style="align-self:end">${canSave ? `<button class="btn btn-primary" id="trySave">Save this check</button>` : ''}</div></div>
          ${tplTryHtml(t)}</div></div>`,
    bind(){
      wsBindInputs();
      const cmp = () => { const r = ((ws.calc || {}).results || [])[0], el = $('#tryCmp'); if (!el) return;
        el.innerHTML = !r || $('#tryEx').value === '' ? '--' : tryMatches(r, $('#tryEx').value) ? `<span class="badge b-ok">Same</span> QSync ${esc(resText(r))}` : `<span class="badge b-danger">Different</span> QSync ${esc(resText(r))}`; };
      ws.afterPaint = cmp;
      $('#tryEx').addEventListener('input', e => { tryExcel[t.id] = e.target.value; cmp(); });
      const sv = $('#trySave'); if (sv) sv.onclick = async () => {
        const val = $('#tryEx').value.trim();
        if (!val){ toast('Enter your Excel result', 'Type the result your Excel sheet gives for these numbers.', 'err'); return; }
        try { await labPost('/template/try', { id: t.id, inputs: ws.inputs, excel: [{ label: (ws.inputs.samples[0] || {}).label || 'Excel', value: Number(val) }], save: true });
          toast('Check saved', 'The QC Manager sees it when approving.', 'ok'); labRefresh(); }
        catch (e) { toast('Not saved', e.message, 'err', 7000); }
      };
      wsPaint();
      wsCalcSoon(0);
    }
  };
}
route('/lab/master/try/:id', p => viewLabTry(p.id));

/* ============================================================ Printable worksheet and batch QC report ============================================================ */
// generated from the stored record (values typed + the server's calculation); the paper format numbers are kept for auditors
const FORM_TITLES = {
  'Granulation':      ['Granules Analytical Worksheet', 'QC/MOA/FP/005/F1-01', 'Granules Analysis Assessment Report', 'QC/MOA/FP/005/F3-01'],
  'Finished Product': ['Finished Product Analytical Worksheet', 'QC/MOA/FP/005/F2-01', 'Product Analysis Assessment Report', 'QC/MOA/FP/005/F4-01'],
};
// caplet stages before packing use the finished-product forms
FORM_TITLES['Compression'] = FORM_TITLES['Sacheting/Blistering/Stripping'] = FORM_TITLES['Finished Product'];
function formFor(stage, methodRef){
  const f = (FORM_TITLES[stage] || ['Analytical Worksheet', '', 'QC Analysis Report', '']).slice();
  if (methodRef) [1, 3].forEach(i => { if (f[i]) f[i] = f[i].replace(/^QC\/MOA\/FP\/005/, methodRef); });
  return f;
}
const nfix = (v, dp) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? '--' : Number(v).toFixed(dp));
function signBox(label, name, at){ return `<div class="sign-box"><div class="sl">${esc(label)}</div><div class="sv">${esc(name || '--')}</div><div class="ss">${at ? fmtDateTime(at) : '--'}</div></div>`; }
function resText(x){
  if (x.value_reported === null || x.value_reported === undefined) return x.unit ? String(x.unit).charAt(0).toUpperCase() + String(x.unit).slice(1) : '--';
  if (x.unit === '%') return num1(x.value_reported) + '%';
  if (x.unit === 'AV') return 'AV ' + num1(x.value_reported);
  if (x.unit === '% RT diff') return nfix(x.value_reported, 2) + '% RT difference';   // results stored before 23 Oct 2026
  if (x.unit === 'min RT') return 'RT ' + nfix(x.value_reported, 2) + ' min';
  if (x.unit === 'pH') return 'pH ' + nfix(x.value_reported, 2);                                 // 058
  if (x.result_name === 'weight_variation') return 'average ' + x.value_reported + ' ' + (x.unit || '');   // 058
  return `${x.value_reported} ${x.unit || ''}`.trim();
}
const verdictText = p => (p === true ? 'COMPLIES' : p === false ? 'DOES NOT COMPLY' : '--');
const testOfResult = n => TEST_TYPES[n] || 'Microbiology';

// opt.only: assignment ids to show (one batch of a run, for the detailed batch report); opt.embedded: no letterhead
function printWorksheetHtml(d, opt){
  opt = opt || {};
  const a = d.analysis, c = a.calc || {}, inp = a.inputs || {}, test = a.test_type, f = formFor(a.stage, (d.templates[0] || {}).method_ref);
  const eq = d.equipment.find(q => String(q.id) === String(a.equipment_id));
  const samples = inp.samples || [];
  const show = sm => !opt.only || opt.only.map(String).includes(String(sm.assignment_id));
  const hplc = ['assay', 'dissolution', 'content_uniformity'].includes(test);
  const parts = d.templates.map(t => {
    const P = t.parameters || {}, r = (c.apis || {})[t.id] || {}, x = (inp.apis || {})[t.id] || {};
    const ws = d.standards.find(w => String(w.id) === String(x.ws_id));
    let html = `<h4>${esc(t.api)} - template v${esc(t.version)}${t.form_ref ? ' (replaces ' + esc(t.form_ref) + ')' : ''}</h4>`;
    if (hplc && techOf(P) === 'uv_a1') html += `<table><tr><td>UV with a fixed specific absorbance: A(1%, 1 cm) = <b>${esc(P.a1pct)}</b>. No standard measured.</td></tr></table>`;
    else if (hplc){
      const s = r.sst || {};
      if (x.std_from) html += `<table><tr><td>Standard reused from worksheet #${esc(x.std_from.analysis_id)} (the same solution, weight, dilution and injections).</td></tr></table>`;
      html += `<table><tr><th>Working standard</th><th>Potency</th><th>Weight</th><th>Dilution</th><th>${esc(techWords(P).std)}</th><th>Mean</th><th>SD</th><th>%RSD</th><th>SST</th></tr>
        <tr><td>${esc(ws ? ws.ws_no : r.ws_no || '--')}</td><td>${esc(ws ? ws.potency_pct + '%' : '--')}</td><td>${esc(x.std_weight || '--')} mg</td>
          <td>${esc(stepsText((P.std || {}).steps, 'mg'))}</td><td class="mono">${esc((x.std_areas || []).filter(v => v !== '').join(', '))}</td>
          <td>${nfix(s.mean, 1)}</td><td>${nfix(s.sd, 1)}</td><td>${nfix(s.rsd_reported, 2)}% (${esc(s.limit_text || '')})</td><td><b>${s.pass === true ? 'PASS' : s.pass === false ? 'FAIL' : '--'}</b></td></tr>
        ${s.tailing || s.resolution ? `<tr><td colspan="9">System suitability: %RSD ${nfix(s.rsd_reported, 2)}% (${esc(s.limit_text || '')}); ${esc(sstExtraText(s, false))}</td></tr>` : ''}
        ${x.sst_justification ? `<tr><td colspan="9">SST justification: ${esc(x.sst_justification)}</td></tr>` : ''}
        ${(x.ws_changes || []).map(ch => `<tr><td colspan="9">Working standard changed from ${esc(ch.from_no || '?')} to ${esc(ch.to_no || 'none')}${ch.at ? ' (' + fmtDateTime(ch.at) + ')' : ''}: ${esc(ch.reason)}</td></tr>`).join('')}</table>`;
    }
    if (test === 'assay'){
      html += `<table><tr><th>Sample</th><th>Average weight</th><th>Prep</th><th>Sample weight</th><th>${esc(techWords(P).spl)}</th><th>% of label claim</th><th>Result (mean)</th><th>Limit</th><th>Verdict</th></tr>
        ${samples.map((sm, si) => { if (!show(sm)) return ''; const v = (inp.values || {})[sm.key] || {}, preps = (v.preps || {})[t.id] || [], rs = (r.samples || [])[si] || {};
          return preps.map((p, pi) => `<tr>${pi === 0 ? `<td rowspan="${preps.length}">${esc(sm.label)}</td><td rowspan="${preps.length}">${esc(v.avg_weight || '--')} mg</td>` : ''}
            <td>${String.fromCharCode(97 + pi)}</td><td>${esc(p.weight || '--')} mg</td><td class="mono">${esc((p.areas || []).join(', '))}</td>
            <td>${nfix(((rs.preparations || [])[pi] || {}).pct_reported, 1)}%</td>
            ${pi === 0 ? `<td rowspan="${preps.length}"><b>${nfix(rs.reported, 1)}%</b><div class="tiny">${nfix(rs.mg_reported, 2)} mg</div></td><td rowspan="${preps.length}">${esc(r.limit_text || '')}</td>
              <td rowspan="${preps.length}"><b>${verdictText(rs.pass)}</b></td>` : ''}</tr>`).join(''); }).join('')}</table>`;
    } else if (test === 'dissolution' || test === 'content_uniformity'){
      samples.forEach((sm, si) => {
        if (!show(sm)) return;
        const units = (((inp.values || {})[sm.key] || {}).units || {})[t.id] || [], rs = (r.samples || [])[si] || {};
        html += `<table><tr><th>Sample ${esc(sm.label)}</th>${units.map((u, i) => `<th>${i + 1}</th>`).join('')}</tr>
          <tr><td>${techWords(P).Value}${units.some(u => Array.isArray(u) && u.length > 1) ? 's (mean used)' : ''}</td>${units.map(u => `<td class="mono">${esc(Array.isArray(u) ? u.join(' / ') : u)}</td>`).join('')}</tr>
          <tr><td>${test === 'dissolution' ? '% dissolved' : '% of label claim'}</td>${units.map((u, i) => `<td>${nfix((rs.units_reported || [])[i], 1)}</td>`).join('')}</tr>
          ${test === 'dissolution' && rs.units_reported ? `<tr><td>Each ${unitWord(P)} (${esc(rs.limit_text || '')})</td>${units.map((u, i) => `<td><b>${(rs.units_below || []).includes(i + 1) ? 'BELOW' : 'COMPLIES'}</b></td>`).join('')}</tr>` : ''}</table>
          <table><tr>${test === 'dissolution'
            ? `<th>Mean</th><th>Min</th><th>Max</th><th>Limit</th><th>Verdict</th></tr><tr><td><b>${nfix(rs.reported, 1)}%</b></td><td>${nfix(rs.min_unit, 1)}%</td><td>${nfix(rs.max_unit, 1)}%</td>
               <td>${esc(rs.limit_text || '')}${(rs.units_below || []).length ? ` - ${unitWord(P)} ` + rs.units_below.join(', ') + ' below' : ''}</td><td><b>${verdictText(rs.pass)}</b></td>`
            : `<th>Mean (X)</th><th>SD</th><th>M</th><th>k</th><th>AV</th><th>Limit</th><th>Verdict</th></tr><tr><td>${nfix(rs.mean_reported, 1)}%</td>
               <td>${nfix(rs.sd, 2)}</td><td>${nfix(rs.m, 1)}</td><td>${esc(rs.k || '--')}</td><td><b>${nfix(rs.av_reported, 1)}</b></td><td>${esc(rs.limit_text || '')}</td><td><b>${verdictText(rs.pass)}</b></td>`}</tr></table>`;
      });
    } else if (test === 'identification'){
      html += `<table><tr><th>Sample</th><th>Standard RT (min)</th><th>Sample RT (min)</th><th>Conclusion</th></tr>
        ${samples.map((sm, si) => { if (!show(sm)) return ''; const rs = (r.samples || [])[si] || {};
          return `<tr><td>${esc(sm.label)}</td><td>${esc(x.std_rt || '--')}</td><td>${esc((((inp.values || {})[sm.key] || {}).rt || {})[t.id] || '--')}</td>
            <td><b>${verdictText(rs.pass)}</b> (analyst)</td></tr>`; }).join('')}</table>`;
    } else if (test === 'microbiology'){
      html += `<table><tr><th>Sample</th><th>Parameter</th><th>Result</th><th>Limit</th><th>Verdict</th></tr>
        ${samples.map((sm, si) => !show(sm) ? '' : ((r.samples || [])[si] || { rows: [] }).rows.map((row, ri) => `<tr>${ri === 0 ? `<td rowspan="${((r.samples || [])[si] || { rows: [] }).rows.length}">${esc(sm.label)}</td>` : ''}
          <td>${esc(row.label)}</td><td>${row.value === null ? 'awaiting' : esc(typeof row.value === 'number' ? row.value + ' ' + (r.unit || 'cfu/g') : row.value)}</td><td>${esc(row.limit_text)}</td><td><b>${verdictText(row.pass)}</b></td></tr>`).join('')).join('')}</table>`;
    } else if (test === 'weight_variation'){   // 058
      samples.forEach((sm, si) => {
        if (!show(sm)) return;
        const w = (((inp.values || {})[sm.key] || {}).weights || {})[t.id] || [], rs = (r.samples || [])[si] || {};
        html += `<table><tr><th>Sample ${esc(sm.label)}</th>${w.map((u, i) => `<th>${i + 1}</th>`).join('')}</tr>
          <tr><td>Weight (${esc(rs.unit || P.unit || 'g')})</td>${w.map(u => `<td class="mono">${esc(u)}</td>`).join('')}</tr>
          <tr><td>Difference from the average</td>${w.map((u, i) => `<td>${rs.deviations_reported ? nfix(rs.deviations_reported[i], 2) + '%' : '--'}</td>`).join('')}</tr></table>
          <table><tr><th>Average</th><th>Largest difference</th><th>Limit</th><th>Verdict</th></tr>
          <tr><td><b>${esc(rs.mean_reported != null ? rs.mean_reported + ' ' + (rs.unit || '') : '--')}</b></td><td>${rs.max_dev != null ? nfix(rs.max_dev, 2) + '%' : '--'}</td><td>${esc(rs.limit_text || '')}</td><td><b>${verdictText(rs.pass)}</b></td></tr></table>`;
      });
    } else if (test === 'ph'){   // 058
      html += `<table><tr><th>Sample</th><th>Reading(s)</th><th>pH</th><th>Limit</th><th>Verdict</th></tr>
        ${samples.map((sm, si) => { if (!show(sm)) return ''; const rs = (r.samples || [])[si] || {};
          return `<tr><td>${esc(sm.label)}</td><td class="mono">${esc(((((inp.values || {})[sm.key] || {}).ph || {})[t.id] || []).join(', '))}</td><td><b>${rs.reported != null ? nfix(rs.reported, 2) : '--'}</b></td>
            <td>${esc(rs.limit_text || '')}</td><td><b>${verdictText(rs.pass)}</b></td></tr>`; }).join('')}</table>`;
    }
    return html;
  }).join('');
  return `<div class="${opt.embedded ? 'sheet-part' : 'sheet'}">
    ${opt.embedded ? `<h3 class="part-title">${esc(TEST_TYPES[test] || test)} - worksheet #${a.id} <span class="tiny">(${esc(f[1])}, engine ${esc(c.engine_version || a.engine_version || '--')})</span></h3>`
      : `<div class="letterhead">Orange Kalbe Limited - Quality Control Department</div>
    <div class="sheet-head"><div><h2>${esc(f[0])}</h2><div class="small">${esc(TEST_TYPES[test] || test)}</div></div>
      <div class="doc">${esc(f[1])}<br>Worksheet #${a.id}<br>Engine ${esc(c.engine_version || a.engine_version || '--')}</div></div>`}
    ${a.status !== 'checked' ? `<p><b>Status: ${esc((WS_STATUS[a.status] || [a.status])[0])}</b>${a.status === 'in_progress' ? ' - draft, not submitted' : ''}</p>` : ''}
    <h4>Analysis details</h4>
    <table class="kv"><tr><th>Product</th><td>${esc(a.product_name)}</td><th>Stage</th><td>${esc(a.stage)}</td></tr>
      <tr><th>Batch(es)</th><td>${esc(d.samples.map(b => b.batch_no).join(', '))}</td><th>Requests</th><td>${esc(d.samples.map(b => b.request_no).join(', '))}</td></tr>
      ${test === 'microbiology' ? '' : `<tr><th>Instrument</th><td>${esc(eq ? eq.eq_no + ' ' + (eq.eq_type || '') : '--')}</td><th>Reagent / mobile phase lots</th><td>${reagentList(a.reagents).length ? reagentList(a.reagents).map(x => esc(x)).join('<br>') : '--'}</td></tr>`}
      <tr><th>Started</th><td>${fmtDate(a.started_on)}</td><th>Ended</th><td>${fmtDate(a.ended_on)}</td></tr>
      <tr><th>Method</th><td>${esc([...new Set(d.templates.map(t => t.method_ref).filter(Boolean))].join(', ') || '--')}</td><th>Specification</th><td>${esc([...new Set(d.templates.map(t => t.spec_ref).filter(Boolean))].join(', ') || '--')}</td></tr></table>
    ${parts}
    ${d.attachments.length ? `<h4>Chromatograms</h4><table><tr><th>File</th><th>Fingerprint (sha256)</th><th>Uploaded</th></tr>${d.attachments.map(x => `<tr><td>${esc(x.file_name)}</td><td class="mono">${esc(x.sha256)}</td><td>${esc(x.uploaded_by)} ${fmtDateTime(x.uploaded_at)}</td></tr>`).join('')}</table>` : ''}
    <div class="sign-grid">${signBox('Performed by (analyst)', a.performed_by, a.performed_at)}${signBox('Checked by (QC Supervisor)', a.checked_by, a.checked_at)}</div>
    ${opt.embedded ? '' : `<p class="tiny" style="margin-top:14px">Generated by QSync from the stored record. Every value above was entered once; the results are those calculated and stored by the server (engine ${esc(c.engine_version || a.engine_version || '--')}). Signatures are electronic password sign-offs.</p>`}
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

// IPQA specification as Phase 1 stores it: a text, or a numeric range (spec_min / spec_max) in the parameter's unit
function ipqaSpec(p){
  const text = htmlDecode(p.spec || '').trim();
  if (text) return text;
  const u = p.unit ? ' ' + p.unit : '', has = v => v !== null && v !== undefined && v !== '';
  if (has(p.spec_min) && has(p.spec_max)) return Number(p.spec_min) === 0 ? `NMT ${p.spec_max}${u}` : `${p.spec_min} - ${p.spec_max}${u}`;
  if (has(p.spec_max)) return `NMT ${p.spec_max}${u}`;
  if (has(p.spec_min)) return `NLT ${p.spec_min}${u}`;
  return '--';
}
// Phase 1 saves some texts HTML-escaped (&quot;): turn them back into characters before esc() shows them
function htmlDecode(t){
  return String(t == null ? '' : t).replace(/&(quot|#34|#39|apos|lt|gt|amp);/g, (m, k) => ({ quot: '"', '#34': '"', '#39': "'", apos: "'", lt: '<', gt: '>', amp: '&' })[k]);
}
// shared by both batch reports: batch details, Phase 1 (IPQA), QC results so far with the tests still open
function labBatchHead(d, title, docNo, sub){
  const r = d.request;
  return `<div class="letterhead">Orange Kalbe Limited - Quality Control Department</div>
    <div class="sheet-head"><div><h2>${esc(title)}</h2><div class="small">${sub}</div></div>
      <div class="doc">${esc(docNo)}<br>Request No: ${esc(r.request_no)}<br>Status: ${esc(labStatusText(r.status))}</div></div>
    <h4>Batch details</h4>
    <table class="kv"><tr><th>Product</th><td>${esc(r.product_name)}</td><th>Batch No</th><td>${esc(r.batch_no)}</td></tr>
      <tr><th>Stage</th><td>${esc(r.stage)}</td><th>Tests required</th><td>${esc(r.test_required || '--')}</td></tr>
      <tr><th>Batch size</th><td>${r.batch_size ? esc(r.batch_size + ' ' + (r.batch_size_unit || '')) : '--'}</td><th>Sample sent</th><td>${r.sample_qty ? esc(r.sample_qty + ' ' + (r.sample_qty_unit || '')) : '--'}</td></tr>
      <tr><th>Mfg Date</th><td>${fmtMonthYear(r.mfg_date)}</td><th>Exp Date</th><td>${fmtMonthYear(r.exp_date)}</td></tr>
      <tr><th>Sample received by QC</th><td>${r.qc_received_at ? fmtDateTime(r.qc_received_at) : '--'}</td><th>Received by</th><td>${esc(r.qc_received_by || '--')}</td></tr></table>
    <h4>In-process (IPQA) results</h4>
    ${d.ipqa && d.ipqa.length ? `<table><tr><th>Parameter</th><th>Observed</th><th>Specification</th><th>Status</th></tr>
      ${d.ipqa.map(p => `<tr><td>${esc(htmlDecode(p.parameter))}</td><td>${esc(htmlDecode(p.value))} ${esc(p.value != null && /^[\d.]+$/.test(p.value) ? p.unit || '' : '')}</td><td>${esc(ipqaSpec(p))}</td><td><b>${esc(String(p.status || '').toUpperCase())}</b></td></tr>`).join('')}</table>`
      : `<p class="small">No IPQA check at this stage${r.ipqa_signed_by ? '' : ' (this stage goes straight to QC)'}.</p>`}
    ${r.qa_comments ? `<p class="small">QA Supervisor comments: ${esc(r.qa_comments)}</p>` : ''}`;
}
function labStatusText(st){ return { pending_ipqa: 'Pending IPQA', pending_qa_review: 'Pending QA review', rejected: 'Rejected by QA', pending_qc_notify: 'Sent to QC',
  sent_to_qc: 'Waiting for QC receipt', qc_received: 'In the QC lab', qc_released: 'QC released', qc_not_released: 'QC not released', qa_acknowledged: 'Closed (QA acknowledged)' }[st] || st; }
function labOpenTests(r){
  const done = new Set((r.results || []).map(x => String(x.analysis_id)));
  return r.assignments.filter(a => !a.cancelled && !(a.analysis_id && done.has(String(a.analysis_id)) && ['submitted', 'checked'].includes(a.analysis_status)))
    .map(a => `<tr class="muted"><td>${esc(TEST_TYPES[a.test_type] || a.test_type)}</td><td colspan="5">${a.analysis_id ? 'Worksheet #' + a.analysis_id + ': ' + esc((WS_STATUS[a.analysis_status] || [a.analysis_status])[0]) : 'Not started'} (analyst ${esc(a.analyst)})</td></tr>`).join('');
}
function labSignGrid(r, names, at){
  return `<div class="sign-grid">
      ${r.production_signed_by ? signBox('Requested by (Production)', r.production_signed_by, r.production_signed_at) : ''}
      ${r.ipqa_signed_by ? signBox('IPQA done by', r.ipqa_signed_by, r.ipqa_signed_at) : ''}
      ${r.qa_supervisor_signed_by ? signBox('Approved by (QA Supervisor)', r.qa_supervisor_signed_by, r.qa_signed_at) : ''}
      ${signBox('Received by (QC Supervisor)', r.qc_received_by, r.qc_received_at)}
      ${signBox('Performed by (analyst)', names('performed_by'), at('performed_at'))}
      ${signBox('Checked by (QC Supervisor)', names('checked_by'), at('checked_at'))}
      ${signBox('Approved by (QC Manager)', r.qc_manager, r.qc_manager_signed_at)}
      ${signBox('Reviewed by (QA Manager)', r.qa_manager, r.qa_manager_signed_at)}
    </div>`;
}
function labReportHtml(d){
  const r = d.request, f = formFor(r.stage, r.method_ref), results = r.results || [];
  const live = r.assignments.filter(a => !a.cancelled);
  const names = k => [...new Set(live.map(a => a[k]).filter(Boolean))].join(', ');
  const at = k => live.map(a => a[k]).filter(Boolean).sort().slice(-1)[0];
  const open = labOpenTests(r);
  const allPass = results.length && results.every(x => x.pass === true);
  const oos = results.filter(x => x.oos_status);
  return `<div class="sheet">
    ${labBatchHead(d, f[2], f[3], 'Summary report. Includes the Test Request Form "To be filled by QC" section (OKL/QAD/038/F1-00)')}
    <h4>QC results</h4>
    <table><tr><th>Test</th><th>API / parameter</th><th>Sample</th><th>Result</th><th>Specification</th><th>Verdict</th></tr>
      ${results.map(x => `<tr><td>${esc(testOfResult(x.result_name))}</td><td>${esc(x.api)}</td><td>${esc(x.sample_label)}</td><td><b>${esc(resText(x))}</b></td>
        <td>${esc(x.limit_text || '')}</td><td><b>${verdictText(x.pass)}</b></td></tr>`).join('')}
      ${open}
      ${!results.length && !open ? `<tr><td colspan="6">${r.qc_received_at ? 'No results yet.' : 'Not received by QC yet.'}</td></tr>` : ''}</table>
    ${oos.length ? `<h4>Out-of-specification entries</h4><table><tr><th>Result</th><th>Status</th><th>Outcome / investigation</th></tr>
      ${oos.map(x => `<tr><td>${esc(x.api)} ${esc(x.sample_label)}: ${esc(resText(x))}</td><td>${esc(x.oos_status)}</td><td>${esc((x.oos_outcome || '') + (x.oos_reference ? ' - ' + x.oos_reference : ''))}</td></tr>`).join('')}</table>` : ''}
    <h4>Conclusion</h4>
    <table class="kv"><tr><th>Results</th><td><b>${results.length ? (open ? (allPass ? 'Complies so far (tests still open)' : 'Does not comply with the specification') : (allPass ? 'Complies with the specification' : 'Does not comply with the specification')) : '--'}</b></td>
      <th>QC decision</th><td><b>${r.qc_decision ? (r.qc_decision === 'released' ? 'Released for further processing' : 'Not released for further processing') : 'Pending'}</b>${r.qc_comments ? '<div class="tiny">' + esc(r.qc_comments) + '</div>' : ''}</td></tr></table>
    ${labSignGrid(r, names, at)}
    ${r.qa_manager_comments ? `<p class="small">QA comments: ${esc(r.qa_manager_comments)}</p>` : ''}
    <p class="tiny" style="margin-top:14px">Generated by QSync from the stored record, as complete as the batch's current stage. The detailed report has every test's raw data and calculation. Signatures are electronic password sign-offs; the full history of every change is kept in QSync.</p>
  </div>`;
}
// detailed report: the summary's batch part, then every test of this batch with its raw values and calculation (this batch's samples only)
function labDetailHtml(d, sheets){
  const r = d.request, f = formFor(r.stage, r.method_ref), results = r.results || [];
  const live = r.assignments.filter(a => !a.cancelled);
  const names = k => [...new Set(live.map(a => a[k]).filter(Boolean))].join(', ');
  const at = k => live.map(a => a[k]).filter(Boolean).sort().slice(-1)[0];
  const ids = live.map(a => a.id);
  const notStarted = live.filter(a => !a.analysis_id);
  return `<div class="sheet">
    ${labBatchHead(d, 'Detailed Analysis Report', f[1] + ' / ' + f[3], 'Every test of this batch with its raw values, standards, calculation and sign-offs')}
    <h4>Results summary</h4>
    <table><tr><th>Test</th><th>API / parameter</th><th>Sample</th><th>Result</th><th>Specification</th><th>Verdict</th></tr>
      ${results.map(x => `<tr><td>${esc(testOfResult(x.result_name))}</td><td>${esc(x.api)}</td><td>${esc(x.sample_label)}</td><td><b>${esc(resText(x))}</b></td>
        <td>${esc(x.limit_text || '')}</td><td><b>${verdictText(x.pass)}${x.oos_status ? ' (OOS ' + esc(x.oos_status) + ')' : ''}</b></td></tr>`).join('')}
      ${labOpenTests(r) || (results.length ? '' : '<tr><td colspan="6">No results yet.</td></tr>')}</table>
    ${sheets.map(ws => printWorksheetHtml(ws, { only: ids, embedded: true })).join('')}
    ${notStarted.length ? `<h4>Tests not started</h4><p class="small">${notStarted.map(a => esc((TEST_TYPES[a.test_type] || a.test_type) + ' (analyst ' + a.analyst + ')')).join(', ')}</p>` : ''}
    <h4>Decision</h4>
    <table class="kv"><tr><th>QC decision</th><td><b>${r.qc_decision ? (r.qc_decision === 'released' ? 'Released for further processing' : 'Not released for further processing') : 'Pending'}</b>${r.qc_comments ? '<div class="tiny">' + esc(r.qc_comments) + '</div>' : ''}</td>
      <th>QA Manager</th><td>${r.qa_manager ? 'Acknowledged' + (r.qa_manager_comments ? ': ' + esc(r.qa_manager_comments) : '') : 'Pending'}</td></tr></table>
    ${labSignGrid(r, names, at)}
    <p class="tiny" style="margin-top:14px">Generated by QSync from the stored record, as complete as the batch's current stage. Worksheets that ran several batches show this batch's samples only. Results are those calculated and stored by the server. Signatures are electronic password sign-offs.</p>
  </div>`;
}
function viewLabReport(id){
  const d = labGet('/request?id=' + id);
  if (!d) return labWait('QC report', 'QC Laboratory');
  if (d.error) return labFail('QC report', 'QC Laboratory', d.error);
  return { title: `Summary report - ${d.request.request_no}`, crumb: 'QC Laboratory',
    html: `${pageHead(`${d.request.request_no} - summary report`, `As complete as the current stage: ${esc(labStatusText(d.request.status))}`, batchNav(id, 'summary'))}${labReportHtml(d)}` };
}
function viewLabDetail(id){
  const d = labGet('/request?id=' + id);
  if (!d) return labWait('Detailed report', 'QC Laboratory');
  if (d.error) return labFail('Detailed report', 'QC Laboratory', d.error);
  const sheetIds = [...new Set(d.request.assignments.filter(a => !a.cancelled && a.analysis_id).map(a => a.analysis_id))];
  const sheets = sheetIds.map(w => labGet('/worksheet?id=' + w));
  if (sheets.some(x => !x)) return labWait('Detailed report', 'QC Laboratory');
  const bad = sheets.find(x => x.error);
  if (bad) return labFail('Detailed report', 'QC Laboratory', bad.error);
  return { title: `Detailed report - ${d.request.request_no}`, crumb: 'QC Laboratory',
    html: `${pageHead(`${d.request.request_no} - detailed report`, `As complete as the current stage: ${esc(labStatusText(d.request.status))}`, batchNav(id, 'detail'))}${labDetailHtml(d, sheets)}` };
}

// the same buttons, in the same place, on every page of a batch; the page you are on is highlighted
function batchNav(id, here){
  const b = (key, href, label, icon) => key === here
    ? `<span class="btn btn-ink" aria-current="page">${icon} ${label}</span>`
    : `<a class="btn btn-ghost" href="${href}">${icon} ${label}</a>`;
  return `<button class="btn btn-ghost" onclick="window.print()">${I.print} Print</button>
    ${b('summary', '#/sheet/' + id, 'Summary report', I.doc)}${b('detail', '#/lab/detail/' + id, 'Detailed report', I.doc)}${b('lab', '#/lab/request/' + id, 'QC lab view', I.inbox)}
    <a class="btn btn-ghost" href="#/requests">${I.chevL} Back to requests</a>`;
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
route('/lab/detail/:id', p => viewLabDetail(p.id));

/* ============================================================ Relievers (040) ============================================================ */
// While someone is away (leave, travel, sick), another person signs in their role for the days set. The reliever uses their own
// login; their sign-offs show their own name, "as reliever for ...". Set by an admin, the QC Manager or the QA Manager.
const RELIEF_ROLES = [['qc_manager', 'QC Manager'], ['qc_supervisor', 'QC Supervisor'], ['qc_analyst', 'QC Analyst'], ['qa_manager', 'QA Manager'],
  ['qa_supervisor', 'QA Supervisor'], ['ipqa', 'IPQA'], ['production', 'Production']];
const reliefRole = k => (RELIEF_ROLES.find(r => r[0] === k) || [k, k])[1];
const RELIEF_STATE = { active: ['Active now', 'b-ok'], planned: ['Planned', 'b-warn'], ended: ['Ended', 'b-slate'], cancelled: ['Cancelled', 'b-slate'] };
function viewLabRelievers(){
  const d = labGet('/relievers');
  if (!d) return labWait('Relievers', 'Administration');
  if (d.error) return labFail('Relievers', 'Administration', d.error);
  const rows = d.relief || [];
  const body = rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Role</th><th>Away</th><th>Reliever</th><th>Days</th><th>Status</th><th></th></tr></thead><tbody>
      ${rows.map(x => `<tr><td class="strong">${esc(reliefRole(x.role))}</td><td>${esc(x.for)}</td><td>${esc(x.reliever)}</td>
        <td class="small">${fmtDate(x.starts_on)} to ${fmtDate(x.ends_on)}${x.reason ? `<div class="tiny muted">${esc(x.reason)}</div>` : ''}<div class="tiny muted">set by ${esc(x.created_by || '--')}${x.ended_at ? `, cancelled by ${esc(x.ended_by || '--')}` : ''}</div></td>
        <td><span class="badge ${(RELIEF_STATE[x.state] || ['', 'b-slate'])[1]}">${esc((RELIEF_STATE[x.state] || [x.state])[0])}</span></td>
        <td style="text-align:right">${d.can_manage && ['active', 'planned'].includes(x.state) ? `<button class="btn btn-ghost btn-sm" onclick="labReliefEnd(${x.id})">End now</button>` : ''}</td></tr>`).join('')}
      </tbody></table></div>`
    : `<div class="card-b">${emptyState('inbox', 'No relievers', 'No one is covering for anyone in the last 60 days or coming up.')}</div>`;
  return {
    title: 'Relievers', crumb: 'Administration',
    html: `${pageHead('Relievers', 'When someone is away, another person signs in their role for the days set, so work does not stop.',
              d.can_manage ? `<button class="btn btn-primary" onclick="labReliefNew()">${I.plus} Set a reliever</button>` : '')}
      <div class="notice" style="margin-bottom:16px">${I.info} <span>The reliever uses their own login and password; their sign-offs show their own name, "as reliever for" the person away.
        The usual rules stay: no one approves what they did themselves. It starts on the first day and ends after the last day (checked every 15 minutes).
        ${d.can_manage ? '' : ' An admin, the QC Manager or the QA Manager sets relievers.'}</span></div>
      <div class="card">${body}</div>`
  };
}
function labReliefNew(){
  const d = labCache['/relievers']; if (!d) return;
  const today = new Date(Date.now() + 3600e3).toISOString().slice(0, 10);   // Lagos date
  const holders = role => (d.holders || []).filter(h => h.role === role);
  openModal({ title: 'Set a reliever', sub: 'Someone signs in another person\'s role while they are away', size: 'narrow',
    body: `<div class="field"><label for="rfRole">Role</label><select class="inp" id="rfRole">${RELIEF_ROLES.map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select></div>
      <div class="field"><label for="rfFor">Who is away</label><select class="inp" id="rfFor"></select></div>
      <div class="field"><label for="rfRel">Reliever</label><select class="inp" id="rfRel"><option value="">Choose...</option>
        ${(d.people || []).map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="grid g2"><div class="field"><label for="rfFrom">First day</label><input class="inp" id="rfFrom" type="date" value="${today}"></div>
        <div class="field"><label for="rfTo">Last day</label><input class="inp" id="rfTo" type="date" value="${today}"></div></div>
      <div class="field"><label for="rfWhy">Reason (optional)</label><input class="inp" id="rfWhy" placeholder="e.g. annual leave"></div>
      <div class="err-msg hide" id="rfErr" style="color:var(--danger)"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="rfOk">Save</button>`,
    onMount: (w, close) => {
      const fill = () => { const hs = holders($('#rfRole', w).value);
        $('#rfFor', w).innerHTML = hs.length ? hs.map(h => `<option value="${h.id}">${esc(h.name)}</option>`).join('') : '<option value="">No one holds this role</option>'; };
      $('#rfRole', w).onchange = fill; fill();
      $('#rfOk', w).onclick = async () => {
        const er = $('#rfErr', w); er.classList.add('hide');
        try {
          await labPost('/relievers/save', { action: 'create', role: $('#rfRole', w).value, for_id: $('#rfFor', w).value, reliever_id: $('#rfRel', w).value,
            starts_on: $('#rfFrom', w).value, ends_on: $('#rfTo', w).value, reason: $('#rfWhy', w).value });
          close(); toast('Reliever set', 'They have been e-mailed.', 'ok'); labRefresh();
        } catch (e) { er.textContent = e.message; er.classList.remove('hide'); }
      };
    } });
}
async function labReliefEnd(id){
  const x = ((labCache['/relievers'] || {}).relief || []).find(r => r.id === id); if (!x) return;
  if (!await confirmDialog('End this reliever period?', `${esc(x.reliever)} will stop signing as ${esc(reliefRole(x.role))} for ${esc(x.for)} now.`, 'End now', 'danger')) return;
  try { await labPost('/relievers/save', { action: 'end', id }); toast('Reliever period ended', '', 'ok'); labRefresh(); }
  catch (e) { toast('Could not end it', e.message, 'err'); }
}
route('/lab/relievers', () => viewLabRelievers());
