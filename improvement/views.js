"use strict";
/* ============================================================
   Process Improvement console (23 Nov 2026, migration 097). Built, not launched: only people given its pages in Users see it.
   Overview (every open action), Downtime logs, RCAs (Log, Open RCAs, Effectiveness, one RCA), Gemba walks, 5S, Suggestions.
   Server: improvement/api/get?part=..., improvement/api/save {op, ...} (workflow OKL Process Improvement).
   ============================================================ */
const PI = { cache: {}, at: {}, loading: {}, err: {}, busy: false, rcaFilter: 'open', rcaQ: '', srcFilter: '', dt: { from: '', to: '' }, sgFilter: 'open' };
const PI_API = '/webhook/improvement/api/';
const PI_CATS = ['Man', 'Machine', 'Method', 'Material', 'Measurement', 'Environment'];
const PI_CAT_HINT = { Man: 'people: skills, training, how the task was done', Machine: 'the equipment itself: wear, design, settings',
  Method: 'the procedure or SOP', Material: 'the materials or parts used', Measurement: 'gauges, readings, inspection', Environment: 'temperature, humidity, dust, layout' };
const RCA_ST = { open: ['Open', 'b-warn'], in_progress: ['Actions in progress', 'b-info'], done: ['Done: watching', 'b-slate'], verified: ['Closed: effective', 'b-ok'],
  not_effective: ['Closed: not effective', 'b-danger'], not_solved: ['Closed: not solved', 'b-slate'], waived: ['No RCA needed', 'b-slate'] };
const ACT_ST = { open: 'Open', in_progress: 'In progress', stuck: 'Stuck', done: 'Done', na: 'Not needed' };
const ACT_KIND = { corrective: 'Corrective (fix this one)', preventive: 'Preventive (stop it coming back)', horizontal: 'Horizontal deployment', check: 'Periodic check',
  finding: 'Finding', action: 'Action' };
const S_NAMES = [['s1', 'Sort'], ['s2', 'Set in Order'], ['s3', 'Shine'], ['s4', 'Standardize'], ['s5', 'Sustain']];
const S_ST = { not_started: ['Not started', '#eef0ee', 'var(--text-3)'], in_progress: ['In progress', 'var(--warn-bg)', 'var(--warn)'], passed: ['Passed', 'var(--ok-bg)', 'var(--ok)'] };
const SG_ST = { new: ['New', 'b-warn'], accepted: ['Accepted', 'b-info'], in_progress: ['In progress', 'b-info'], done: ['Done', 'b-ok'], not_taken: ['Not taken', 'b-slate'] };
const FIVE_S_ORDER = ['sort', 'set', 'shine', 'standardize', 'sustain'];
const FIVE_S_NAME = { sort: 'Sort (S1)', set: 'Set in Order (S2)', shine: 'Shine (S3)', standardize: 'Standardize (S4)', sustain: 'Sustain (S5)' };

function piKey(part, q){ return part + (q ? '?' + q : ''); }
async function piLoad(part, q){
  const k = piKey(part, q);
  if (PI.loading[k]) return;
  PI.loading[k] = true;
  try { PI.cache[k] = await api(PI_API + 'get?part=' + part + (q ? '&' + q : '')); PI.err[k] = ''; PI.at[k] = Date.now(); }
  catch (e) { PI.err[k] = e.message; }
  PI.loading[k] = false; render();
}
// the data of a page (loaded once, fresh after 60 s or after a change)
function piData(part, q){
  const k = piKey(part, q);
  if (!PI.loading[k] && (!PI.cache[k] && !PI.err[k] || (PI.cache[k] && Date.now() - (PI.at[k] || 0) > 60000))) piLoad(part, q);
  return { d: PI.cache[k], err: PI.err[k] };
}
async function piSave(body, okMsg){
  if (PI.busy) return null;
  PI.busy = true;
  try {
    const r = await api(PI_API + 'save', { method: 'POST', body });
    if (okMsg) toast(okMsg[0], okMsg[1] || '', 'ok', 3500);
    PI.at = {};                      // everything reloads
    return r;
  } catch (e) { toast('Not saved', e.message, 'err', 7000); return null; }
  finally { PI.busy = false; render(); }
}
function piWait(title, crumb, err, part, q){
  return { title, crumb, html: pageHead(title) + `<div class="card"><div class="card-b">${err
    ? `<div class="notice danger">${I.alert}<div>${esc(err)} <button class="btn btn-ghost btn-sm" onclick="PI.err['${piKey(part, q)}']='';piLoad('${part}','${q || ''}')">Try again</button></div></div>`
    : '<div class="small muted">Loading...</div>'}</div></div>` };
}
const piDay = ts => { if (!ts) return ''; const d = new Date(ts); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' }); };
const piDayHm = ts => { if (!ts) return ''; const d = new Date(ts); return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Lagos' }); };
const piMin = m => m == null ? '--' : m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min';
const piBadge = (pair) => `<span class="badge ${pair[1]}">${esc(pair[0])}</span>`;
const piInfo = t => (typeof oklInfo === 'function' ? oklInfo(t) : '');
const piToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
function piTabs(cur, tabs){ return `<div class="tabs" style="margin-bottom:14px">${tabs.map(([h, l]) => `<a class="tab ${h === cur ? 'on' : ''}" href="#${h}">${l}</a>`).join('')}</div>`; }
// 101 (user 24 Nov 2026): the old Downtime logs page is the Stops tab: every stop, the way into an RCA
const RCA_TABS = () => (canOpen('/rca/stops') ? [['/rca/stops', 'Stops']] : []).concat([['/rca', 'Log'], ['/rca/open', 'Open RCAs'], ['/rca/effect', 'Effectiveness']]);
function piPeopleList(list){ return `<datalist id="piPeople">${(list || []).map(n => `<option value="${esc(n)}">`).join('')}</datalist>`; }

/* ---------------- actions (one list for every source) ---------------- */
function piActStatus(a){
  const c = a.status === 'done' ? 'b-ok' : a.status === 'na' ? 'b-slate' : a.status === 'stuck' ? 'b-danger' : a.overdue ? 'b-danger' : a.status === 'in_progress' ? 'b-info' : 'b-warn';
  return `<span class="badge ${c}">${esc(ACT_ST[a.status] || a.status)}${a.overdue && !['done', 'na'].includes(a.status) ? ' · overdue' : ''}</span>`;
}
function piActRows(list, opts){
  opts = opts || {};
  if (!list.length) return `<div class="small muted" style="padding:8px 0">${opts.empty || 'None yet.'}</div>`;
  return `<div class="tbl-wrap"><table class="tbl" style="min-width:640px"><thead><tr>${opts.source ? '<th>From</th>' : ''}<th>What</th><th>Owner</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>
    ${list.map(a => `<tr>${opts.source ? `<td class="small">${esc(a.source_label || a.source)}</td>` : ''}
      <td><div class="strong">${esc(a.title)}</div>${a.asset_name ? `<div class="tiny muted">Machine: ${esc(a.asset_name)}</div>` : ''}${a.detail ? `<div class="small muted" style="margin-top:2px">${esc(a.detail)}</div>` : ''}
        ${a.commitment ? `<div class="small" style="margin-top:2px"><b>Management:</b> ${esc(a.commitment)}${a.commitment_owner ? ' (' + esc(a.commitment_owner) + (a.commitment_due ? ', ' + esc(piDay(a.commitment_due)) : '') + ')' : ''}</div>` : ''}
        ${a.routine ? `<div class="small" style="margin-top:2px">Periodic check: <b>${esc(a.routine.title)}</b> · done ${a.routine.done_30} of ${a.routine.due_30} in the last 30 days ${piInfo('How often the periodic check this action made was actually done.\nAn RCA whose fix depends on a check is only as good as the check.')}</div>` : ''}
        ${a.note ? `<div class="tiny muted" style="margin-top:2px">${esc(a.note)}</div>` : ''}</td>
      <td class="small">${esc(a.owner || '')}</td><td class="small">${a.due_date ? esc(piDay(a.due_date)) : ''}</td><td>${piActStatus(a)}</td>
      <td style="text-align:right">${opts.can ? `<button class="btn btn-ghost btn-sm" data-act-edit="${a.id}">Update</button>` : opts.go ? `<a class="btn btn-ghost btn-sm" href="#${opts.go(a)}">Open</a>` : ''}</td></tr>`).join('')}
    </tbody></table></div>`;
}
// add or update an action. base = {source, source_id, kind?}; a = the action (update) or null
function piActEdit(a, base, ctx){
  ctx = ctx || {};
  const kind = (a && a.kind) || base.kind || 'action';
  const gemba = (a ? a.source : base.source) === 'gemba';
  openModal({ title: a ? 'Update the action' : (gemba ? 'New finding' : 'New ' + (ACT_KIND[kind] || 'action').toLowerCase()), size: 'wide',
    body: `${piPeopleList(ctx.people)}
      ${!gemba && (a ? a.source : base.source) === 'rca' ? `<div class="field"><label>Kind</label><select class="inp" id="aKind">${['corrective', 'preventive', 'horizontal', 'check'].map(k => `<option value="${k}" ${k === kind ? 'selected' : ''}>${esc(ACT_KIND[k])}</option>`).join('')}</select></div>` : ''}
      <div class="field"><label>${gemba ? 'What we saw' : 'What is to be done'}</label><textarea class="inp" id="aTitle" rows="2" maxlength="500">${esc((a && a.title) || '')}</textarea></div>
      ${gemba ? `<div class="grid g2"><div class="field"><label>Area</label><input class="inp" id="aArea" maxlength="120" value="${esc((a && a.area) || '')}"></div>
          <div class="field"><label>Category</label><select class="inp" id="aCat">${['', 'SOP', '5S', 'Safety', 'Quality', 'Equipment', 'People', 'Material', 'Other'].map(c => `<option ${c === ((a && a.category) || '') ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
        <div class="field"><label>Our action</label><textarea class="inp" id="aDetail" rows="2" maxlength="2000">${esc((a && a.detail) || '')}</textarea></div>
        <div class="grid g3"><div class="field"><label>Management commitment</label><input class="inp" id="aCom" maxlength="1000" value="${esc((a && a.commitment) || '')}"></div>
          <div class="field"><label>Commitment owner</label><input class="inp" id="aComO" list="piPeople" maxlength="120" value="${esc((a && a.commitment_owner) || '')}"></div>
          <div class="field"><label>Commitment due</label><input class="inp" type="date" id="aComD" value="${esc((a && a.commitment_due) || '')}"></div></div>` : ''}
      <div id="aAssetBox" class="field ${kind === 'horizontal' ? '' : 'hide'}"><label>Look-alike machine</label><select class="inp" id="aAsset"><option value="">Choose...</option>${(ctx.assets || []).map(x => `<option value="${esc(x.code)}" ${a && a.asset_code === x.code ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
      <div id="aRoutineBox" class="field ${kind === 'check' ? '' : 'hide'}"><label>The periodic check ${piInfo('Pick the check in Engineering > Periodic checks that keeps this fix in place.\nNot made yet? Make it there first (owner, days, time), then pick it here; this page then shows how often it is done.')}</label>
        <select class="inp" id="aRoutine"><option value="">Not chosen yet</option>${(ctx.routines || []).map(x => `<option value="${x.id}" ${a && a.routine_id === x.id ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}</select>
        <div class="tiny" style="margin-top:4px"><a href="../engineering/#/checks" target="_blank" rel="noopener">Engineering > Periodic checks</a></div></div>
      <div class="grid g3"><div class="field"><label>${gemba ? 'Action owner' : 'Owner'}</label><input class="inp" id="aOwner" list="piPeople" maxlength="120" value="${esc((a && a.owner) || '')}"></div>
        <div class="field"><label>Due</label><input class="inp" type="date" id="aDue" value="${esc((a && a.due_date) || '')}"></div>
        <div class="field"><label>Status</label><select class="inp" id="aSt">${Object.keys(ACT_ST).map(k => `<option value="${k}" ${k === ((a && a.status) || 'open') ? 'selected' : ''}>${ACT_ST[k]}</option>`).join('')}</select></div></div>
      <div class="field"><label>Note (done: what shows it; not needed: why)</label><input class="inp" id="aNote" maxlength="1000" value="${esc((a && a.note) || '')}"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="aSave">Save</button>`,
    onMount: (w, close) => {
      const k = $('#aKind', w);
      if (k) k.onchange = () => { $('#aAssetBox', w).classList.toggle('hide', k.value !== 'horizontal'); $('#aRoutineBox', w).classList.toggle('hide', k.value !== 'check'); };
      $('#aSave', w).onclick = async () => {
        const v = id => { const el = $('#' + id, w); return el ? el.value : undefined; };
        const body = Object.assign({ op: 'action_save', id: a ? a.id : null, source: a ? a.source : base.source, source_id: a ? a.source_id : base.source_id,
          kind: v('aKind') || kind, title: v('aTitle'), owner: v('aOwner'), due_date: v('aDue'), status: v('aSt'), note: v('aNote') },
          (v('aKind') || kind) === 'horizontal' ? { asset: v('aAsset') } : {}, (v('aKind') || kind) === 'check' ? { routine_id: v('aRoutine') } : {},
          gemba ? { area: v('aArea'), category: v('aCat'), detail: v('aDetail'), commitment: v('aCom'), commitment_owner: v('aComO'), commitment_due: v('aComD') } : {});
        if (await piSave(body, ['Saved'])) close();
      };
    } });
}
function piBindActs(list, ctx){
  $$('[data-act-edit]').forEach(b => b.onclick = () => { const a = list.find(x => String(x.id) === b.dataset.actEdit); if (a) piActEdit(a, null, ctx); });
}

/* ---------------- Overview ---------------- */
function viewPiOverview(){
  const { d, err } = piData('overview');
  if (!d) return piWait('Process Improvement', 'Overview', err, 'overview');
  const c = d.counts || {}, acts = (d.actions || []).filter(a => !PI.srcFilter || a.source === PI.srcFilter);
  const stat = (lbl, val, sub, href) => `<a class="stat" href="#${href}" style="text-decoration:none;color:inherit"><div class="lbl">${lbl}</div><div class="val">${val}</div><div class="tiny muted">${sub || ''}</div></a>`;
  const nw = c.next_walk;
  const goTo = a => a.source === 'rca' ? '/rca/' + a.source_id : a.source === 'gemba' ? '/gemba/' + a.source_id : a.source === '5s' ? '/5s' : '/suggestions';
  const srcs = [['', 'All'], ['rca', 'RCAs'], ['gemba', 'Gemba'], ['5s', '5S'], ['suggestion', 'Suggestions']];
  return { title: 'Overview', crumb: 'Process Improvement', html: pageHead('Process Improvement', 'Root causes, Gemba walks, 5S and improvement ideas: what is open and who has it.')
    + `<div class="grid g4" style="margin-bottom:16px">
        ${canOpen('/rca') ? stat('Open RCAs', c.rca_open || 0, 'open, in progress or being watched', '/rca/open') : ''}
        ${canOpen('/gemba') ? stat('Next Gemba', nw ? esc(piDay(nw.at)) : '--', nw ? esc((nw.walk_no ? 'Walk ' + nw.walk_no + ' ' : '') + nw.what + ': ' + nw.title) : 'nothing planned', nw ? '/gemba/' + nw.id : '/gemba') : ''}
        ${canOpen('/5s') ? stat('5S: Sort passed', (c.rooms_sort || 0) + ' / ' + (c.rooms || 0), 'rooms', '/5s') : ''}
        ${canOpen('/suggestions') ? stat('New suggestions', c.sugg_new || 0, 'waiting for a decision', '/suggestions') : ''}</div>
      <div class="card"><div class="card-h"><div><h3>Open actions ${piInfo('Every action not done yet, from every RCA, Gemba walk, 5S room and suggestion you can see.\nOverdue ones are red. Open one to update it where it belongs.')}</h3>
        <div class="sub">${(d.actions || []).length} open · ${(d.actions || []).filter(a => a.overdue).length} overdue</div></div></div>
        <div class="card-b"><div class="row" style="gap:6px;margin-bottom:10px;flex-wrap:wrap">${srcs.map(([k, l]) => `<button class="chip ${PI.srcFilter === k ? 'on' : ''}" data-src="${k}">${l}</button>`).join('')}</div>
        ${piActRows(acts, { source: true, go: goTo, empty: 'Nothing open.' })}</div></div>`,
    bind(){ $$('[data-src]').forEach(b => b.onclick = () => { PI.srcFilter = b.dataset.src; render(); }); } };
}

/* ---------------- Downtime logs ---------------- */
function piBars(list, total){
  const max = Math.max(1, ...list.map(x => x.minutes));
  return list.map(x => `<div style="display:flex;gap:10px;align-items:center;margin:5px 0" class="small">
      <div style="flex:0 0 38%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(x.name)}">${esc(x.name)}</div>
      <div style="flex:1;background:var(--surface-3, #f1f2f0);border-radius:4px;height:14px"><div style="width:${Math.round(x.minutes / max * 100)}%;background:var(--brand);height:14px;border-radius:4px"></div></div>
      <div class="mono" style="flex:0 0 120px;text-align:right">${piMin(x.minutes)} <span class="muted">(${x.times}x${total ? ', ' + Math.round(x.minutes / total * 100) + '%' : ''})</span></div></div>`).join('') || '<div class="small muted">No stops.</div>';
}
function viewPiDowntime(){
  const q = (PI.dt.from ? 'from=' + PI.dt.from : '') + (PI.dt.to ? (PI.dt.from ? '&' : '') + 'to=' + PI.dt.to : '');
  const { d, err } = piData('downtime', q);
  if (!d) return piWait('RCAs', 'Process Improvement', err, 'downtime', q);
  const rows = d.rows || [], total = rows.reduce((s, r) => s + (r.minutes || 0), 0);
  const kind = r => r.kind === 'job' ? `<a href="../engineering/#/jobs/${esc(r.job_id)}" target="_blank" rel="noopener" class="badge b-info">Job ${esc(r.job_id)}</a>`
    : r.kind === 'stop' ? '<span class="badge b-slate">Floor stop (no job)</span>' : `<span class="badge b-warn">${esc(r.note || 'Production report')}</span>`;
  return { title: 'RCAs', crumb: 'Process Improvement', keepScroll: true,
    html: pageHead('RCAs', 'Stops: every machine stop of the period (Engineering jobs, floor stops no job covers, report stops that are not jobs). Start an RCA from a line.')
      + piTabs('/rca/stops', RCA_TABS())
      + `<div class="card" style="margin-bottom:14px"><div class="card-b row" style="gap:10px;flex-wrap:wrap;align-items:flex-end">
          <div class="field" style="margin:0"><label>From</label><input class="inp" type="date" id="dtFrom" value="${esc(d.from)}"></div>
          <div class="field" style="margin:0"><label>To</label><input class="inp" type="date" id="dtTo" value="${esc(d.to)}"></div>
          <button class="btn btn-primary" id="dtGo">Show</button>
          <div class="small muted" style="margin-left:auto">${rows.length} stops · ${piMin(total)} ${piInfo('Lost time on the machines in the period.\nA stop counted in an Engineering job is counted once (the floor stop it came from is not added again).')}</div></div></div>
      <div class="card"><div class="tbl-wrap"><table class="tbl" style="min-width:760px"><thead><tr><th>When</th><th>Machine</th><th>Reason</th><th>Minutes</th><th>Source</th><th>RCA</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr><td class="small" data-sort="${esc(r.at)}">${esc(r.kind === 'report' ? piDay(r.at) : piDayHm(r.at))}</td><td>${esc(r.asset_name || r.asset || '(not known)')}</td><td class="small">${esc(r.reason || '')}</td>
          <td class="mono">${r.minutes}</td><td>${kind(r)}</td>
          <td>${r.rca ? `<a href="#/rca/${r.rca.id}">${esc(r.rca.rca_no)}</a>` : d.can_rca && r.asset ? `<button class="btn btn-ghost btn-sm" data-dt-rca="${i}">Start an RCA</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">No stops in this period.</td></tr>'}
        </tbody></table></div></div>`,
    bind(){
      $('#dtGo').onclick = () => { PI.dt = { from: $('#dtFrom').value, to: $('#dtTo').value }; render(); };
      $$('[data-dt-rca]').forEach(b => b.onclick = async () => {
        const r = rows[+b.dataset.dtRca];
        if (!await confirmDialog('Start an RCA?', `<b>${esc(r.asset_name || r.asset)}</b>: ${esc(r.reason || '')} (${r.minutes} min, ${esc(piDayHm(r.at))}).<br>The RCA starts open, with this stop in it.`, 'Start the RCA')) return;
        const res = await piSave({ op: 'rca_new', event: r }, ['RCA started']);
        if (res && res.id) go('/rca/' + res.id);
      });
    } };
}

/* ---------------- RCAs ---------------- */
function piRcaProgress(x){
  const steps = [['What happened', (x.times || 0) > 0 || x.rule === 'manual'], ['Observation', !!x.pic_observation], ['Causes', (x.causes || []).length > 0],
    ['Root cause', !!x.root_cause], ['Actions', x.actions_total > 0 && x.actions_done === x.actions_total], ['Verified', ['verified', 'not_effective', 'not_solved', 'waived'].includes(x.status)]];
  const n = steps.filter(s => s[1]).length;
  return { n, of: steps.length, html: `<div class="row" style="gap:4px;flex-wrap:wrap">${steps.map(([l, ok]) => `<span class="tiny" style="padding:2px 7px;border-radius:10px;background:${ok ? 'var(--ok-bg)' : '#eef0ee'};color:${ok ? 'var(--ok)' : 'var(--text-3)'}">${ok ? '&#10003; ' : ''}${l}</span>`).join('')}</div>` };
}
function viewPiRcaLog(mode){
  const { d, err } = piData('rca');
  if (!d) return piWait('RCAs', 'Process Improvement', err, 'rca');
  const can = d.can_edit, set = d.settings || {};
  const openSt = ['open', 'in_progress', 'done'];
  let list = (d.rcas || []);
  if (mode === 'open') list = list.filter(x => openSt.includes(x.status));
  else if (PI.rcaFilter === 'open') list = list.filter(x => openSt.includes(x.status));
  else if (PI.rcaFilter === 'closed') list = list.filter(x => !openSt.includes(x.status));
  const q = PI.rcaQ.trim().toLowerCase();
  if (q) list = list.filter(x => [x.rca_no, x.asset_name, x.reason, x.trigger, x.root_cause].join(' ').toLowerCase().includes(q));
  const head = pageHead('RCAs', `Root cause analysis. New ones start by themselves: a stop of ${set.long} min or more, or the same reason ${set.repeat} times in ${set.days} days on a machine.`,
    can ? `<button class="btn btn-ghost" id="rcaNew">${I.plus} RCA by hand</button>${mode !== 'open' ? `<button class="btn btn-ghost" id="rcaClean">Start clean from today</button>` : ''}` : '');
  let body;
  if (mode === 'open') {
    body = list.length ? `<div class="grid g2">${list.map(x => { const p = piRcaProgress(x);
      return `<a class="card" href="#/rca/${x.id}" style="text-decoration:none;color:inherit;display:block"><div class="card-b">
        <div class="row between" style="gap:8px"><div><span class="mono small muted">${esc(x.rca_no)}</span> <b>${esc(x.asset_name || x.asset)}</b></div>${piBadge(RCA_ST[x.status] || [x.status, ''])}</div>
        <div class="small" style="margin:6px 0">${esc(x.trigger || x.reason)}</div>
        <div class="small muted" style="margin-bottom:8px">${x.times} time${x.times === 1 ? '' : 's'}, ${piMin(x.minutes)} lost · started ${esc(piDay(x.created_at))}${x.actions_total ? ` · actions ${x.actions_done}/${x.actions_total}` : ''}${x.actions_overdue ? ` · <span style="color:var(--danger)">${x.actions_overdue} overdue</span>` : ''}</div>
        ${p.html}</div></a>`; }).join('')}</div>`
      : `<div class="card"><div class="card-b">${emptyState('check', 'No open RCAs', 'New ones appear here by themselves when a machine stops long or often.')}</div></div>`;
  } else {
    body = `<div class="row" style="gap:6px;margin-bottom:10px;flex-wrap:wrap">${[['open', 'Open'], ['closed', 'Closed'], ['all', 'All']].map(([k, l]) => `<button class="chip ${PI.rcaFilter === k ? 'on' : ''}" data-rf="${k}">${l}</button>`).join('')}
        <input class="inp" id="rcaQ" placeholder="Search machine, reason, root cause" value="${esc(PI.rcaQ)}" style="max-width:280px;margin-left:auto"></div>
      <div class="card"><div class="tbl-wrap"><table class="tbl" style="min-width:820px"><thead><tr><th>RCA</th><th>Machine</th><th>Problem</th><th>Times</th><th>Lost</th><th>Root cause</th><th>Status</th><th>Started</th></tr></thead><tbody>
      ${list.map(x => `<tr class="clickable" onclick="go('/rca/${x.id}')"><td class="mono strong">${esc(x.rca_no)}</td><td>${esc(x.asset_name || x.asset)}</td><td class="small">${esc(x.reason)}${x.rule === 'manual' ? ' <span class="tiny muted">(by hand)</span>' : ''}</td>
        <td class="mono">${x.times}</td><td class="mono small">${piMin(x.minutes)}</td><td class="small">${esc(String(x.root_cause || '').slice(0, 80))}</td><td>${piBadge(RCA_ST[x.status] || [x.status, ''])}</td><td class="small">${esc(piDay(x.created_at))}</td></tr>`).join('')
        || '<tr><td colspan="8" class="muted">None.</td></tr>'}</tbody></table></div></div>`;
  }
  return { title: 'RCAs', crumb: 'Process Improvement', keepScroll: true, html: head + piTabs(mode === 'open' ? '/rca/open' : '/rca', RCA_TABS()) + body,
    bind(){
      $$('[data-rf]').forEach(b => b.onclick = () => { PI.rcaFilter = b.dataset.rf; render(); });
      const qq = $('#rcaQ'); if (qq) qq.oninput = debounce(() => { PI.rcaQ = qq.value; render(); setTimeout(() => { const e = $('#rcaQ'); if (e) { e.focus(); e.setSelectionRange(e.value.length, e.value.length); } }, 0); }, 300);
      const nb = $('#rcaNew'); if (nb) nb.onclick = piRcaNew;
      const cl = $('#rcaClean'); if (cl) cl.onclick = () => openModal({ title: 'Start clean from today', size: 'narrow',
        body: `<p class="small">Every RCA that is open, in progress or being watched (${(d.rcas || []).filter(x => openSt.includes(x.status)).length}) is closed as <b>Closed: not solved</b>. Nothing is deleted: they stay in the Log with this note.</p>
          <p class="small">From now on the rules look only at stops from today. A machine that keeps failing still starts a new RCA.</p>
          <div class="field"><label>Why (kept on each one)</label><input class="inp" id="clNote" maxlength="300" placeholder="e.g. Starting the RCA tracker afresh"></div>`,
        footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-danger" id="clGo">Close them and start clean</button>`,
        onMount: (w, close) => { $('#clGo', w).onclick = async () => { const r = await piSave({ op: 'rca_clean', note: $('#clNote', w).value }, ['Started clean']); if (r) { toast('Started clean', r.closed + ' RCAs closed as not solved.', 'ok', 5000); close(); } }; } });
    } };
}
function piRcaNew(){
  const assets = (window.PI_ASSETS || []);
  openModal({ title: 'RCA by hand', sub: 'For a problem the rules did not pick up (e.g. from a Gemba walk or an operator fix).',
    body: `<div class="field"><label>Machine</label><select class="inp" id="nAsset"><option value="">Choose...</option>${assets.map(a => `<option value="${esc(a.code)}">${esc(a.name)}</option>`).join('')}</select></div>
      <div class="field"><label>The problem (the reason repeats are matched on)</label><input class="inp" id="nReason" maxlength="120" placeholder="e.g. Sealing temperature drift"></div>
      <div class="field"><label>Problem statement (optional)</label><input class="inp" id="nTrig" maxlength="300"></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="nGo">Start the RCA</button>`,
    onMount: (w, close) => {
      if (!assets.length) piLoadAssets().then(() => { const s = $('#nAsset', w); if (s) s.innerHTML = '<option value="">Choose...</option>' + (window.PI_ASSETS || []).map(a => `<option value="${esc(a.code)}">${esc(a.name)}</option>`).join(''); });
      $('#nGo', w).onclick = async () => { const r = await piSave({ op: 'rca_new', asset: $('#nAsset', w).value, reason: $('#nReason', w).value, trigger: $('#nTrig', w).value }, ['RCA started']); if (r && r.id) { close(); go('/rca/' + r.id); } };
    } });
}
async function piLoadAssets(){ try { const r = await api('/webhook/engineering/api/equipment'); window.PI_ASSETS = (r.assets || []).filter(a => a.status === 'Active').map(a => ({ code: a.code, name: a.name })).sort((a, b) => a.name.localeCompare(b.name)); } catch (e) { window.PI_ASSETS = []; } }

const PI_DRAFT = {};   // what is typed on an RCA, kept across redraws until saved
function viewPiRca(id){
  const q = 'id=' + id;
  const { d, err } = piData('rca_one', q);
  if (!d) return piWait('RCA', 'Process Improvement', err, 'rca_one', q);
  const x = d.rca, can = d.can_edit, ctx = { people: d.people, routines: d.routines, assets: x.look_alikes };
  const dr = PI_DRAFT[id] || (PI_DRAFT[id] = { obs: x.pic_observation || '', causes: (x.causes || []).map(c => Object.assign({}, c)), whys: (x.whys || []).slice(), root: x.root_cause || '', dirty: false });
  while (dr.whys.length < 5) dr.whys.push('');
  const closed = ['verified', 'not_effective', 'not_solved', 'waived'].includes(x.status);
  const ro = !can || closed ? 'disabled' : '';
  const p = piRcaProgress(x);
  const acts = x.actions || [];
  const byKind = k => acts.filter(a => a.kind === k);
  const kindCard = (k, sub, extra) => `<div style="margin-bottom:14px"><div class="row between" style="margin-bottom:4px"><div class="strong">${esc(ACT_KIND[k])} <span class="small muted" style="font-weight:400">${sub}</span></div>
      <div class="row" style="gap:6px">${extra || ''}${can && !closed ? `<button class="btn btn-ghost btn-sm" data-add-kind="${k}">${I.plus} Add</button>` : ''}</div></div>${piActRows(byKind(k), { can: can && !closed, empty: 'None.' })}</div>`;
  const evs = x.events || [];
  const statusBtns = !can ? '' : closed
    ? `<button class="btn btn-ghost" data-st="open">Reopen</button>`
    : (x.status === 'done'
        ? `<button class="btn btn-primary" data-st="verified">Effective: close it</button><button class="btn btn-ghost" data-st="not_effective">Not effective</button><button class="btn btn-ghost" data-st="in_progress">Back to actions</button>`
        : `<button class="btn btn-primary" data-st="done">Done: start watching</button>`)
      + `<button class="btn btn-ghost" data-st="not_solved">Closed: not solved</button>${x.status === 'open' ? `<button class="btn btn-ghost" data-st="waived">No RCA needed</button>` : ''}`;
  const html = `<div class="row between" style="margin-bottom:12px"><a class="btn btn-ghost btn-sm" href="#/rca/open">${I.chevL} Open RCAs</a><span class="mono small muted">${esc(x.rca_no)}</span></div>
    <div class="card" style="margin-bottom:14px"><div class="card-b">
      <div class="row between" style="align-items:flex-start;gap:10px"><div><h2 style="margin:0;font-size:20px">${esc(x.asset_name || x.asset)}</h2>
        <div class="small muted" style="margin-top:4px">${esc(x.area || '')} · ${x.rule === 'long' ? 'one long stop' : x.rule === 'repeat' ? 'repeated stops' : 'started by hand'} · ${x.times} time${x.times === 1 ? '' : 's'}, ${piMin(x.minutes)} lost</div></div>${piBadge(RCA_ST[x.status] || [x.status, ''])}</div>
      <div style="margin-top:10px"><b>Problem:</b> ${esc(x.trigger || x.reason)}</div>
      ${x.came_after ? `<div class="notice warn" style="margin-top:10px">${I.alert}<div>This came back after <b>${esc(x.came_after.rca_no)}</b> (${esc((RCA_ST[x.came_after.status] || [x.came_after.status])[0])}). Its root cause: ${esc(x.came_after.root_cause || 'not written')}.</div></div>` : ''}
      ${closed && x.close_note ? `<div class="small" style="margin-top:8px"><b>Closed${x.closed_by ? ' by ' + esc(x.closed_by) : ''}:</b> ${esc(x.close_note)}</div>` : ''}
      <div style="margin-top:12px">${p.html}</div></div></div>

    <div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>1. What happened (Engineering) ${piInfo('The stops and jobs in this RCA, with what the technicians recorded.\nIt is read from Engineering as it is now: fill the jobs in Engineering, not here.')}</h3><div class="sub">${evs.length} stop${evs.length === 1 ? '' : 's'}</div></div></div>
      <div class="tbl-wrap"><table class="tbl" style="min-width:700px"><thead><tr><th>When</th><th>Lost</th><th>Reason</th><th>What Engineering found and did</th></tr></thead><tbody>
      ${evs.map(e => `<tr><td class="small">${esc(piDayHm(e.at))}${e.job_id ? `<div><a href="../engineering/#/jobs/${esc(e.job_id)}" target="_blank" rel="noopener" class="tiny">${esc(e.job_id)}</a></div>` : '<div class="tiny muted">floor stop</div>'}</td>
        <td class="mono small">${e.minutes != null ? piMin(e.minutes) : '--'}</td><td class="small">${esc(e.reason || '')}${e.failure_category ? '<div class="tiny muted">' + esc(e.failure_category) + '</div>' : ''}</td>
        <td class="small">${e.cause ? '<b>Cause:</b> ' + esc(e.cause) + '<br>' : ''}${e.work_done ? esc(e.work_done) : '<span class="muted">Not filled in yet</span>'}${e.technicians ? '<div class="tiny muted">' + esc(e.technicians) + '</div>' : ''}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No stop attached (started by hand).</td></tr>'}
      </tbody></table></div></div>

    <div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>2. Observation of the PIC ${piInfo('What you, the person in charge of the RCA, saw at the machine yourself.\nGo and look (Gemba): facts first, not opinions.')}</h3></div></div>
      <div class="card-b"><textarea class="inp" id="rObs" rows="3" maxlength="3000" ${ro} placeholder="What you saw at the machine">${esc(dr.obs)}</textarea></div></div>

    <div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>3. Causes ${piInfo('Every cause that could play a part, each under one of the 6M.\nList them all first; the root cause is chosen from them in step 4.')}</h3><div class="sub">Man, Machine, Method, Material, Measurement, Environment</div></div>
        ${ro ? '' : `<button class="btn btn-ghost btn-sm" id="rCauseAdd">${I.plus} Add a cause</button>`}</div>
      <div class="card-b">${dr.causes.map((c, i) => `<div class="row" style="gap:8px;margin-bottom:6px;flex-wrap:nowrap">
          <select class="inp" data-cc="${i}" style="flex:0 0 150px" ${ro}>${PI_CATS.map(k => `<option ${k === c.cat ? 'selected' : ''} title="${esc(PI_CAT_HINT[k])}">${k}</option>`).join('')}</select>
          <input class="inp" data-ct="${i}" maxlength="300" value="${esc(c.text)}" ${ro} placeholder="${esc(PI_CAT_HINT[c.cat] || '')}">
          ${ro ? '' : `<button class="btn-icon" data-cx="${i}" aria-label="Remove">${I.x}</button>`}</div>`).join('') || '<div class="small muted">No causes yet.</div>'}</div></div>

    <div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>4. Root cause ${piInfo('Ask "why?" until the answer is something you can act on so it does not come back (often 3 to 5 times).\nThe last answer is usually the root cause.')}</h3><div class="sub">5 whys, then the root cause</div></div></div>
      <div class="card-b">${dr.whys.map((w, i) => `<div class="row" style="gap:8px;margin-bottom:6px;flex-wrap:nowrap"><span class="small strong" style="flex:0 0 56px">Why ${i + 1}</span><input class="inp" data-why="${i}" maxlength="300" value="${esc(w)}" ${ro}></div>`).join('')}
        <div class="field" style="margin-top:10px"><label>Root cause</label><textarea class="inp" id="rRoot" rows="2" maxlength="2000" ${ro}>${esc(dr.root)}</textarea></div>
        ${ro ? '' : `<button class="btn btn-primary" id="rSave" ${dr.dirty ? '' : ''}>Save steps 2 to 4</button> <span class="small muted">${dr.dirty ? 'Not saved yet' : ''}</span>`}</div></div>

    <div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>5. Actions ${piInfo('Corrective fixes this machine now. Preventive stops it coming back (an SOP, a part, a check).\nHorizontal deployment carries the same fix to the look-alike machines: one line each, done or marked not needed with the reason. A periodic check keeps the fix in place.')}</h3>
        <div class="sub">The RCA can be marked done only when every action is done or not needed</div></div></div>
      <div class="card-b">${kindCard('corrective', 'fix this one')}${kindCard('preventive', 'stop it coming back')}
        ${kindCard('horizontal', 'the same fix on look-alike machines', can && !closed && (x.look_alikes || []).length ? `<button class="btn btn-ghost btn-sm" id="rHz">Pick look-alike machines</button>` : '')}
        ${kindCard('check', 'a periodic check that keeps the fix in place')}</div></div>

    <div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>6. Verify ${piInfo('Done: the fix is in. The RCA is then watched: the Effectiveness tab shows if the same problem comes back on this machine.\nClose it as effective when it has held; not effective when it came back. Closed: not solved closes it without a fix (it stays in the Log).')}</h3></div></div>
      <div class="card-b"><div class="row" style="gap:8px;flex-wrap:wrap">${statusBtns}</div>
        ${x.done_at ? `<div class="small muted" style="margin-top:8px">Done ${esc(piDay(x.done_at))}${x.since_done != null ? ' · stopped again ' + x.since_done + ' time(s) since' : ''}.</div>` : ''}</div></div>`;
  return { title: x.rca_no, crumb: 'RCAs', keepScroll: true, html: piPeopleList(d.people) + html,
    bind(){
      const mark = () => { dr.dirty = true; };
      const o = $('#rObs'); if (o) o.oninput = () => { dr.obs = o.value; mark(); };
      const rt = $('#rRoot'); if (rt) rt.oninput = () => { dr.root = rt.value; mark(); };
      $$('[data-why]').forEach(el => el.oninput = () => { dr.whys[+el.dataset.why] = el.value; mark(); });
      $$('[data-ct]').forEach(el => el.oninput = () => { dr.causes[+el.dataset.ct].text = el.value; mark(); });
      $$('[data-cc]').forEach(el => el.onchange = () => { dr.causes[+el.dataset.cc].cat = el.value; mark(); render(); });
      $$('[data-cx]').forEach(el => el.onclick = () => { dr.causes.splice(+el.dataset.cx, 1); mark(); render(); });
      const ca = $('#rCauseAdd'); if (ca) ca.onclick = () => { dr.causes.push({ cat: 'Machine', text: '' }); mark(); render(); };
      const sv = $('#rSave'); if (sv) sv.onclick = async () => {
        const r = await piSave({ op: 'rca_save', id: x.id, pic_observation: dr.obs, causes: dr.causes.filter(c => c.text.trim()), whys: dr.whys.filter(w => w.trim()), root_cause: dr.root }, ['Saved']);
        if (r) delete PI_DRAFT[id];
      };
      $$('[data-add-kind]').forEach(b => b.onclick = () => piActEdit(null, { source: 'rca', source_id: x.id, kind: b.dataset.addKind }, ctx));
      piBindActs(acts, ctx);
      const hz = $('#rHz'); if (hz) hz.onclick = () => {
        const have = new Set(byKind('horizontal').map(a => a.asset_code));
        openModal({ title: 'Horizontal deployment', sub: 'The same fix on the look-alike machines: one action each.',
          body: `<div class="field"><label>What to apply</label><input class="inp" id="hzT" maxlength="400" value="${esc('Apply the fix of ' + x.rca_no + (dr.root ? ': ' + dr.root.slice(0, 200) : ''))}"></div>
            <div class="grid g2" style="gap:6px">${x.look_alikes.map(m => `<label class="small"><input type="checkbox" value="${esc(m.code)}" ${have.has(m.code) ? 'disabled checked' : ''}> ${esc(m.name)}</label>`).join('')}</div>`,
          footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="hzGo">Add</button>`,
          onMount: (w, close) => { $('#hzGo', w).onclick = async () => {
            const picks = $$('input[type=checkbox]:not([disabled]):checked', w).map(c => c.value);
            for (const code of picks) await piSave({ op: 'action_save', source: 'rca', source_id: x.id, kind: 'horizontal', asset: code, title: $('#hzT', w).value });
            toast('Added', picks.length + ' machine(s)', 'ok'); close(); }; } });
      };
      $$('[data-st]').forEach(b => b.onclick = async () => {
        const st = b.dataset.st, needNote = ['not_solved', 'waived', 'not_effective', 'verified', 'done'].includes(st);
        if (dr.dirty && !await confirmDialog('Not saved', 'Steps 2 to 4 have changes not saved. Go on without them?', 'Go on')) return;
        if (!needNote) { await piSave({ op: 'rca_status', id: x.id, status: st }, ['Updated']); return; }
        openModal({ title: (RCA_ST[st] || [st])[0], size: 'narrow',
          body: `<div class="field"><label>${['not_solved', 'waived'].includes(st) ? 'Why (required)' : 'Note (optional)'}</label><input class="inp" id="stN" maxlength="300"></div>`,
          footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="stGo">Save</button>`,
          onMount: (w, close) => { $('#stGo', w).onclick = async () => { if (await piSave({ op: 'rca_status', id: x.id, status: st, note: $('#stN', w).value }, ['Updated'])) close(); }; } });
      });
    } };
}

function viewPiEffect(){
  const { d, err } = piData('effect');
  if (!d) return piWait('RCAs', 'Process Improvement', err, 'effect');
  const s = d.summary || {}, list = d.rcas || [];
  const closedChecked = (s.verified || 0) + (s.not_effective || 0);
  const verdict = x => x.verdict === 'came_back' ? `<span class="badge b-danger">Came back ${x.after_n}x</span>` : x.verdict === 'watching' ? `<span class="badge b-warn">Watching: day ${x.days_since} of 30</span>` : `<span class="badge b-ok">Held ${x.days_since} days</span>`;
  const rate = (n, m, d2) => m ? (n / Math.max(1, d2) * 30).toFixed(1) : '0';
  return { title: 'RCA effectiveness', crumb: 'Process Improvement', html: pageHead('RCAs', 'Did the fix hold? After an RCA is done, the same problem on the same machine is looked for.')
    + piTabs('/rca/effect', RCA_TABS())
    + `<div class="grid g4" style="margin-bottom:14px">
        <div class="stat"><div class="lbl">Held ${piInfo('Done or closed, and the same problem has not come back on that machine for 30 days or more.')}</div><div class="val">${s.held || 0}</div></div>
        <div class="stat"><div class="lbl">Came back</div><div class="val">${s.came_back || 0}</div></div>
        <div class="stat"><div class="lbl">Watching ${piInfo('Done less than 30 days ago and not back yet.')}</div><div class="val">${s.watching || 0}</div></div>
        <div class="stat"><div class="lbl">Closed effective ${piInfo('Of the RCAs closed as effective or not effective, the share closed as effective.')}</div><div class="val">${closedChecked ? Math.round((s.verified || 0) / closedChecked * 100) + '%' : '--'}</div><div class="tiny muted">${s.verified || 0} of ${closedChecked}</div></div></div>
      <div class="card"><div class="tbl-wrap"><table class="tbl" style="min-width:860px"><thead><tr><th>RCA</th><th>Machine / problem</th><th>Done</th><th>Before ${piInfo('The stops in the RCA: how many, the time lost, and per 30 days over the period they happened in.')}</th><th>After ${piInfo('The same problem on the same machine after the RCA was done: how many, the time lost, per 30 days since.')}</th><th>Result</th><th>Status</th></tr></thead><tbody>
      ${list.map(x => `<tr class="clickable" onclick="go('/rca/${x.id}')"><td class="mono strong">${esc(x.rca_no)}</td><td><b>${esc(x.asset_name || x.asset)}</b><div class="small muted">${esc(x.reason)}</div></td>
        <td class="small">${esc(piDay(x.t0))}</td><td class="small">${x.before_n}x · ${piMin(x.before_min)}<div class="tiny muted">${rate(x.before_n, x.before_n, x.before_days)} per 30 days</div></td>
        <td class="small">${x.after_n}x · ${piMin(x.after_min)}<div class="tiny muted">${rate(x.after_n, x.after_n, x.days_since)} per 30 days${x.first_back ? ' · first back ' + esc(piDay(x.first_back)) : ''}</div></td>
        <td>${verdict(x)}</td><td>${piBadge(RCA_ST[x.status] || [x.status, ''])}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">No RCA is done yet.</td></tr>'}
      </tbody></table></div></div>` };
}

/* ---------------- Gemba ---------------- */
function viewPiGemba(){
  const { d, err } = piData('gemba');
  if (!d) return piWait('Gemba walks', 'Process Improvement', err, 'gemba');
  const can = d.can_edit, walks = d.walks || [];
  const st = { planned: ['Planned', 'b-slate'], visited: ['Visited: review due', 'b-warn'], reviewed: ['Reviewed', 'b-ok'], cancelled: ['Cancelled', 'b-slate'] };
  const gate = { open: ['Gate open', 'b-slate'], passed: ['Gate passed', 'b-ok'], not_passed: ['Gate not passed', 'b-danger'] };
  return { title: 'Gemba walks', crumb: 'Process Improvement', html: pageHead('Gemba walks', 'Managers walk one area on one theme: a visit, then a review a week later. The next theme starts when the review passes.',
      can ? `<button class="btn btn-primary" id="gNew">${I.plus} New walk</button>` : '')
    + `<div class="card"><div class="tbl-wrap"><table class="tbl" style="min-width:820px"><thead><tr><th>Walk</th><th>Theme</th><th>Area</th><th>Visit</th><th>Review</th><th>Findings</th><th>Status</th></tr></thead><tbody>
      ${walks.map(g => { const f = g.findings || [], open = f.filter(a => !['done', 'na'].includes(a.status)).length;
        return `<tr class="clickable" onclick="go('/gemba/${g.id}')"><td class="strong">${g.walk_no ? 'Walk ' + g.walk_no : ''}</td><td><b>${esc(g.title)}</b><div class="tiny muted">${esc(g.managers || '')}</div></td>
          <td class="small">${esc(g.area || '')}</td><td class="small">${esc(piDayHm(g.visit_at))}</td><td class="small">${esc(piDayHm(g.review_at))}</td>
          <td class="small">${f.length}${open ? ` <span class="muted">(${open} open)</span>` : ''}</td><td>${piBadge(st[g.status] || [g.status, ''])} ${piBadge(gate[g.gate] || [g.gate, ''])}</td></tr>`; }).join('') || '<tr><td colspan="7" class="muted">No walks yet.</td></tr>'}
      </tbody></table></div></div>`,
    bind(){ const n = $('#gNew'); if (n) n.onclick = () => piGembaEdit(null); } };
}
function piGembaEdit(g){
  const loc = ts => { if (!ts) return ''; const d = new Date(new Date(ts).getTime() + 3600000); return d.toISOString().slice(0, 16); };   // Lagos = UTC+1
  const toIso = v => v ? v + ':00+01:00' : '';
  openModal({ title: g ? 'Edit the walk' : 'New Gemba walk', size: 'wide',
    body: `<div class="grid g3"><div class="field"><label>Walk no.</label><input class="inp" id="gNo" inputmode="numeric" value="${esc((g && g.walk_no) || '')}"></div>
        <div class="field" style="grid-column:span 2"><label>Theme</label><input class="inp" id="gT" maxlength="200" value="${esc((g && g.title) || '')}" placeholder="e.g. 5S: Sort (S1)"></div></div>
      <div class="grid g3"><div class="field"><label>Area</label><input class="inp" id="gA" value="${esc((g && g.area) || '')}"></div>
        <div class="field"><label>Department</label><input class="inp" id="gD" value="${esc((g && g.department) || '')}"></div>
        <div class="field"><label>5S walk: score up to ${piInfo('For a 5S walk, the S it checks. The walk score then covers that S and the ones before it (they are stacked).')}</label><select class="inp" id="gS"><option value="">Not a 5S walk</option>${FIVE_S_ORDER.map(k => `<option value="${k}" ${g && g.five_s === k ? 'selected' : ''}>${FIVE_S_NAME[k]}</option>`).join('')}</select></div></div>
      <div class="field"><label>Visiting managers</label><input class="inp" id="gM" value="${esc((g && g.managers) || '')}"></div>
      <div class="field"><label>Hosts</label><input class="inp" id="gH" value="${esc((g && g.hosts) || 'Process Improvement')}"></div>
      <div class="field"><label>Scope (what to look at)</label><textarea class="inp" id="gSc" rows="3">${esc((g && g.scope) || '')}</textarea></div>
      <div class="grid g4"><div class="field"><label>Visit</label><input class="inp" type="datetime-local" id="gV" value="${esc(loc(g && g.visit_at))}"></div>
        <div class="field"><label>Review</label><input class="inp" type="datetime-local" id="gR" value="${esc(loc(g && g.review_at))}"></div>
        <div class="field"><label>Status</label><select class="inp" id="gSt">${[['planned', 'Planned'], ['visited', 'Visited'], ['reviewed', 'Reviewed'], ['cancelled', 'Cancelled']].map(([k, l]) => `<option value="${k}" ${((g && g.status) || 'planned') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label>Gate ${piInfo('Passed at the review: the next theme can start. Not passed: the review is repeated (the next walks move back).')}</label><select class="inp" id="gG">${[['open', 'Open'], ['passed', 'Passed'], ['not_passed', 'Not passed']].map(([k, l]) => `<option value="${k}" ${((g && g.gate) || 'open') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
      <div class="field"><label>Notes</label><textarea class="inp" id="gN" rows="2">${esc((g && g.notes) || '')}</textarea></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="gGo">Save</button>`,
    onMount: (w, close) => { $('#gGo', w).onclick = async () => {
      const v = id => $('#' + id, w).value;
      const r = await piSave({ op: 'gemba_save', id: g ? g.id : null, walk_no: v('gNo'), title: v('gT'), area: v('gA'), department: v('gD'), five_s: v('gS'), managers: v('gM'),
        hosts: v('gH'), scope: v('gSc'), visit_at: toIso(v('gV')), review_at: toIso(v('gR')), status: v('gSt'), gate: v('gG'), notes: v('gN'), focus: v('gT') }, ['Saved']);
      if (r) { close(); if (!g && r.id) go('/gemba/' + r.id); } }; } });
}
const PI_SCORE = {};   // walk id -> {visit: {...}, review: {...}} being typed
function viewPiWalk(id){
  const { d, err } = piData('gemba');
  if (!d) return piWait('Gemba walk', 'Process Improvement', err, 'gemba');
  const g = (d.walks || []).find(x => String(x.id) === String(id));
  if (!g) return { title: 'Gemba walk', crumb: 'Gemba', html: `<div class="card"><div class="card-b">${emptyState('alert', 'No such walk', '')}</div></div>` };
  const can = d.can_edit, f = g.findings || [];
  let score = '';
  if (g.five_s) {
    const upto = FIVE_S_ORDER.indexOf(g.five_s), checks = (d.checks || []).filter(c => FIVE_S_ORDER.indexOf(c.pillar) <= upto);
    const S = PI_SCORE[g.id] || (PI_SCORE[g.id] = { visit: Object.assign({}, ((g.scores || {}).visit || {}).scores || {}), review: Object.assign({}, ((g.scores || {}).review || {}).scores || {}) });
    const sum = (stage, pil) => checks.filter(c => c.pillar === pil).reduce((s, c) => s + (+S[stage][c.key] || 0), 0);
    const sel = (stage, c) => `<select class="inp" data-sc="${stage}|${c.key}" style="padding:4px 6px;width:70px" ${can ? '' : 'disabled'}>${['', '0', '1', '2'].map(v => `<option ${String(S[stage][c.key] ?? '') === v ? 'selected' : ''}>${v}</option>`).join('')}</select>`;
    score = `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>5S walk score ${piInfo('0 = no, 1 = partly, 2 = yes, for each check. Score at the visit, then again at the review.\nOnly the S of this walk and the ones before it are scored (stacked). Pass = the full score at the review.')}</h3>
        <div class="sub">Up to ${esc(FIVE_S_NAME[g.five_s])}</div></div>${can ? `<button class="btn btn-primary btn-sm" id="scSave">Save the score</button>` : ''}</div>
      <div class="tbl-wrap"><table class="tbl" style="min-width:620px"><thead><tr><th>S</th><th>Check</th><th>Visit</th><th>Review</th></tr></thead><tbody>
      ${checks.map(c => `<tr><td class="small">${esc(FIVE_S_NAME[c.pillar])}</td><td class="small">${esc(c.text)}</td><td>${sel('visit', c)}</td><td>${sel('review', c)}</td></tr>`).join('')}
      ${FIVE_S_ORDER.slice(0, upto + 1).map(pil => { const max = checks.filter(c => c.pillar === pil).length * 2, rv = sum('review', pil);
        return `<tr><td colspan="2" class="strong small">${esc(FIVE_S_NAME[pil])}: ${sum('visit', pil)} → ${rv} of ${max}</td><td colspan="2">${rv === max ? '<span class="badge b-ok">Passed</span>' : '<span class="badge b-slate">Not yet</span>'}</td></tr>`; }).join('')}
      </tbody></table></div></div>`;
  }
  return { title: g.title, crumb: 'Gemba', keepScroll: true,
    html: `<div class="row between" style="margin-bottom:12px"><a class="btn btn-ghost btn-sm" href="#/gemba">${I.chevL} Gemba walks</a>${can ? `<button class="btn btn-ghost btn-sm" id="gEdit">${I.edit} Edit the walk</button>` : ''}</div>
      <div class="card" style="margin-bottom:14px"><div class="card-b">
        <h2 style="margin:0 0 6px;font-size:20px">${g.walk_no ? 'Walk ' + g.walk_no + ': ' : ''}${esc(g.title)}</h2>
        <div class="grid g2 small" style="gap:4px 18px"><div><b>Area:</b> ${esc(g.area || '')}</div><div><b>Department:</b> ${esc(g.department || '')}</div>
          <div><b>Visit:</b> ${esc(piDayHm(g.visit_at))}</div><div><b>Review:</b> ${esc(piDayHm(g.review_at))}</div>
          <div><b>Managers:</b> ${esc(g.managers || '')}</div><div><b>Hosts:</b> ${esc(g.hosts || '')}</div>
          <div><b>Status:</b> ${esc(g.status)}</div><div><b>Gate:</b> ${esc(g.gate.replace('_', ' '))}</div></div>
        ${g.scope ? `<div class="small" style="margin-top:8px"><b>Scope:</b> ${esc(g.scope)}</div>` : ''}${g.notes ? `<div class="small muted" style="margin-top:6px">${esc(g.notes)}</div>` : ''}</div></div>
      <div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>Findings ${piInfo('Raise each finding at the visit: what we saw, what management commits to, and our action with its owner and date.\nAt the review, mark each one done, in progress or stuck.')}</h3><div class="sub">${f.length} raised · ${f.filter(a => a.status === 'done').length} closed</div></div>
        ${can ? `<button class="btn btn-ghost btn-sm" id="fAdd">${I.plus} Add a finding</button>` : ''}</div>
        <div class="card-b">${piActRows(f, { can, empty: 'No findings yet.' })}</div></div>${score}`,
    bind(){
      const ctx = { people: d.people };
      const e = $('#gEdit'); if (e) e.onclick = () => piGembaEdit(g);
      const a = $('#fAdd'); if (a) a.onclick = () => piActEdit(null, { source: 'gemba', source_id: g.id, kind: 'finding' }, ctx);
      piBindActs(f, ctx);
      $$('[data-sc]').forEach(s => s.onchange = () => { const [st, k] = s.dataset.sc.split('|'); if (s.value === '') delete PI_SCORE[g.id][st][k]; else PI_SCORE[g.id][st][k] = +s.value; render(); });
      const ss = $('#scSave'); if (ss) ss.onclick = async () => {
        const S = PI_SCORE[g.id];
        const ok1 = await piSave({ op: 'score', walk_id: g.id, stage: 'visit', scores: S.visit });
        const ok2 = ok1 && await piSave({ op: 'score', walk_id: g.id, stage: 'review', scores: S.review }, ['Score saved']);
        if (ok2) delete PI_SCORE[g.id];
      };
    } };
}

/* ---------------- 5S ---------------- */
function viewPi5s(){
  const { d, err } = piData('5s');
  if (!d) return piWait('5S', 'Process Improvement', err, '5s');
  const can = d.can_edit, areas = d.areas || [];
  const all = areas.flatMap(a => a.rooms);
  const pct = (list, s) => list.length ? Math.round(list.filter(r => r[s] === 'passed').length / list.length * 100) : 0;
  const cell = (r, s) => { const v = S_ST[r[s]] || S_ST.not_started;
    return `<td style="text-align:center"><button class="chip" ${can ? `data-cyc="${r.id}|${s}|${r[s]}"` : 'disabled'} style="background:${v[1]};color:${v[2]};border-color:transparent;font-size:11.5px" title="${can ? 'Tap to change' : ''}">${v[0]}</button></td>`; };
  return { title: '5S', crumb: 'Process Improvement', keepScroll: true,
    html: pageHead('5S', 'Every room against the five S. A driver leads each area; each room has an owner. Tap a box to move it on: Not started, In progress, Passed.',
      can ? `<button class="btn btn-ghost" id="arNew">${I.plus} Area</button>` : '')
    + `<div class="grid g5" style="margin-bottom:14px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">${S_NAMES.map(([s, n]) => `<div class="stat"><div class="lbl">${n}</div><div class="val">${pct(all, s)}%</div><div class="tiny muted">${all.filter(r => r[s] === 'passed').length} of ${all.length} rooms passed</div></div>`).join('')}</div>`
    + areas.map(a => `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>${esc(a.name)}</h3><div class="sub">Driver ${esc(a.driver || '--')} · backup ${esc(a.backup || '--')} · ${esc(a.manager || '')} · ${a.rooms.length} rooms</div></div>
        ${can ? `<div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-ar="${a.id}">${I.edit} Area</button><button class="btn btn-ghost btn-sm" data-rm-new="${a.id}">${I.plus} Room</button></div>` : ''}</div>
      <div class="tbl-wrap"><table class="tbl" style="min-width:760px"><thead><tr><th>Room</th><th>Owner</th>${S_NAMES.map(([, n]) => `<th style="text-align:center">${n}</th>`).join('')}<th>Actions</th></tr></thead><tbody>
      ${a.rooms.map(r => { const open = (r.actions || []).filter(x => !['done', 'na'].includes(x.status)).length;
        return `<tr><td>${can ? `<a href="javascript:void 0" data-rm="${r.id}">${esc(r.name)}</a>` : esc(r.name)}${r.note ? `<div class="tiny muted">${esc(r.note)}</div>` : ''}</td><td class="small">${esc(r.owner || '')}</td>
          ${S_NAMES.map(([s]) => cell(r, s)).join('')}<td class="small">${(r.actions || []).length ? `<a href="javascript:void 0" data-rm="${r.id}">${(r.actions || []).length}${open ? ` (${open} open)` : ''}</a>` : can ? `<a href="javascript:void 0" data-rm="${r.id}">add</a>` : ''}</td></tr>`; }).join('')}
      <tr><td colspan="2" class="small strong">Passed</td>${S_NAMES.map(([s]) => `<td style="text-align:center" class="small strong">${pct(a.rooms, s)}%</td>`).join('')}<td></td></tr>
      </tbody></table></div></div>`).join(''),
    bind(){
      const next = { not_started: 'in_progress', in_progress: 'passed', passed: 'not_started' };
      $$('[data-cyc]').forEach(b => b.onclick = () => { const [id, s, cur] = b.dataset.cyc.split('|'); piSave({ op: 'room_s', id: +id, s, value: next[cur] }); });
      const areaEdit = a => openModal({ title: a ? 'Edit the area' : 'New area',
        body: `<div class="field"><label>Area</label><input class="inp" id="arN" value="${esc((a && a.name) || '')}"></div><div class="grid g3"><div class="field"><label>Driver</label><input class="inp" id="arD" list="piPeople" value="${esc((a && a.driver) || '')}"></div>
          <div class="field"><label>Backup driver</label><input class="inp" id="arB" list="piPeople" value="${esc((a && a.backup) || '')}"></div><div class="field"><label>Manager (role)</label><input class="inp" id="arM" value="${esc((a && a.manager) || '')}"></div></div>${piPeopleList(d.people)}`,
        footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="arGo">Save</button>`,
        onMount: (w, close) => { $('#arGo', w).onclick = async () => { if (await piSave({ op: 'area', id: a ? a.id : null, name: $('#arN', w).value, driver: $('#arD', w).value, backup: $('#arB', w).value, manager: $('#arM', w).value }, ['Saved'])) close(); }; } });
      const n = $('#arNew'); if (n) n.onclick = () => areaEdit(null);
      $$('[data-ar]').forEach(b => b.onclick = () => areaEdit(areas.find(a => String(a.id) === b.dataset.ar)));
      const roomEdit = (r, areaId) => openModal({ title: r ? r.name : 'New room', size: 'wide',
        body: `<div class="grid g3"><div class="field"><label>Room</label><input class="inp" id="rmN" value="${esc((r && r.name) || '')}"></div>
            <div class="field"><label>Area</label><select class="inp" id="rmA">${areas.map(a => `<option value="${a.id}" ${String(a.id) === String(r ? r.area_id : areaId) ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>
            <div class="field"><label>Room owner</label><input class="inp" id="rmO" list="piPeople" value="${esc((r && r.owner) || '')}"></div></div>
          <div class="field"><label>Note</label><input class="inp" id="rmNo" value="${esc((r && r.note) || '')}"></div>${piPeopleList(d.people)}
          ${r ? `<div class="row between" style="margin-top:10px"><div class="strong">Actions for this room</div><button class="btn btn-ghost btn-sm" id="rmAct">${I.plus} Add an action</button></div>${piActRows(r.actions || [], { can, empty: 'None.' })}
            <label class="small" style="display:block;margin-top:10px"><input type="checkbox" id="rmOff"> This room is no longer in the 5S programme</label>` : ''}`,
        footer: `<button class="btn btn-ghost" data-close>Close</button><button class="btn btn-primary" id="rmGo">Save</button>`,
        onMount: (w, close) => {
          $('#rmGo', w).onclick = async () => { if (await piSave(Object.assign({ op: 'room', id: r ? r.id : null, area_id: $('#rmA', w).value, name: $('#rmN', w).value, owner: $('#rmO', w).value, note: $('#rmNo', w).value },
            r && $('#rmOff', w).checked ? { active: false } : {}), ['Saved'])) close(); };
          const ad = $('#rmAct', w); if (ad) ad.onclick = () => { close(); piActEdit(null, { source: '5s', source_id: r.id }, { people: d.people }); };
          $$('[data-act-edit]', w).forEach(b => b.onclick = () => { const x = (r.actions || []).find(y => String(y.id) === b.dataset.actEdit); close(); piActEdit(x, null, { people: d.people }); });
        } });
      $$('[data-rm]').forEach(b => b.onclick = () => roomEdit(all.find(r => String(r.id) === b.dataset.rm)));
      $$('[data-rm-new]').forEach(b => b.onclick = () => roomEdit(null, b.dataset.rmNew));
    } };
}

/* ---------------- Suggestions ---------------- */
function viewPiSugg(){
  const { d, err } = piData('sugg');
  if (!d) return piWait('Suggestions', 'Process Improvement', err, 'sugg');
  const can = d.can_edit;
  let list = d.suggestions || [];
  if (PI.sgFilter === 'open') list = list.filter(s => ['new', 'accepted', 'in_progress'].includes(s.status));
  else if (PI.sgFilter !== 'all') list = list.filter(s => s.status === PI.sgFilter);
  return { title: 'Suggestions', crumb: 'Process Improvement', keepScroll: true,
    html: pageHead('Suggestions', 'Improvement ideas from anyone: the idea, why it helps, now and after. Each gets a decision and, when accepted, a department that takes it on.',
      can ? `<button class="btn btn-primary" id="sgNew">${I.plus} New suggestion</button>` : '')
    + `<div class="row" style="gap:6px;margin-bottom:10px;flex-wrap:wrap">${[['open', 'Open'], ['new', 'New'], ['done', 'Done'], ['not_taken', 'Not taken'], ['all', 'All']].map(([k, l]) => `<button class="chip ${PI.sgFilter === k ? 'on' : ''}" data-sf="${k}">${l}</button>`).join('')}</div>`
    + (list.length ? list.map(s => `<div class="card" style="margin-bottom:10px"><div class="card-b">
        <div class="row between" style="gap:8px;flex-wrap:wrap"><div><span class="mono small muted">${esc(s.sug_no)}</span> <b>${esc(s.name)}</b> <span class="small muted">${esc([s.department, s.team_lead && 'lead ' + s.team_lead, piDay(s.raised_on), s.impact].filter(Boolean).join(' · '))}</span></div>
          <div class="row" style="gap:6px">${piBadge(SG_ST[s.status] || [s.status, ''])}${can ? `<button class="btn btn-ghost btn-sm" data-sg-dec="${s.id}">Decide</button><button class="btn btn-ghost btn-sm" data-sg-ed="${s.id}">${I.edit}</button>` : ''}</div></div>
        <div style="margin-top:8px;white-space:pre-wrap">${esc(s.idea)}</div>
        <div class="grid g3 small" style="margin-top:8px;gap:8px">${s.benefits ? `<div><b>Benefits</b><div style="white-space:pre-wrap">${esc(s.benefits)}</div></div>` : ''}${s.current_state ? `<div><b>Now</b><div style="white-space:pre-wrap">${esc(s.current_state)}</div></div>` : ''}${s.future_state ? `<div><b>After</b><div style="white-space:pre-wrap">${esc(s.future_state)}</div></div>` : ''}</div>
        ${s.owner_dept || s.decision_note || s.savings ? `<div class="small" style="margin-top:8px">${s.owner_dept ? '<b>Taken on by:</b> ' + esc(s.owner_dept) + ' ' : ''}${s.decision_note ? '· ' + esc(s.decision_note) + ' ' : ''}${s.savings ? '· <b>Savings:</b> ' + esc(s.savings) : ''}</div>` : ''}
        ${(s.actions || []).length || (can && ['accepted', 'in_progress'].includes(s.status)) ? `<div style="margin-top:8px">${piActRows(s.actions || [], { can, empty: 'No actions yet.' })}${can ? `<button class="btn btn-ghost btn-sm" data-sg-act="${s.id}" style="margin-top:6px">${I.plus} Action</button>` : ''}</div>` : ''}
      </div></div>`).join('') : `<div class="card"><div class="card-b">${emptyState('edit', 'No suggestions here', can ? 'Type in the ideas from the suggestion forms with "New suggestion".' : '')}</div></div>`),
    bind(){
      const all = d.suggestions || [];
      $$('[data-sf]').forEach(b => b.onclick = () => { PI.sgFilter = b.dataset.sf; render(); });
      const edit = s => openModal({ title: s ? s.sug_no : 'New suggestion', size: 'wide',
        body: `<div class="grid g3"><div class="field"><label>Name</label><input class="inp" id="sN" maxlength="120" value="${esc((s && s.name) || '')}"></div>
            <div class="field"><label>Department</label><input class="inp" id="sD" list="sgDepts" value="${esc((s && s.department) || '')}"><datalist id="sgDepts">${(d.departments || []).map(x => `<option value="${esc(x)}">`).join('')}</datalist></div>
            <div class="field"><label>Team lead / manager</label><input class="inp" id="sL" value="${esc((s && s.team_lead) || '')}"></div></div>
          <div class="grid g3"><div class="field"><label>Date</label><input class="inp" type="date" id="sR" value="${esc((s && s.raised_on) || piToday())}"></div>
            <div class="field"><label>Impact area</label><select class="inp" id="sI"><option value=""></option>${['Process', 'People', 'Productivity', 'Quality', 'Cost savings', 'Safety', 'Other'].map(x => `<option ${s && s.impact === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div></div>
          <div class="field"><label>The idea</label><textarea class="inp" id="sId" rows="3">${esc((s && s.idea) || '')}</textarea></div>
          <div class="grid g3"><div class="field"><label>Benefits</label><textarea class="inp" id="sB" rows="3">${esc((s && s.benefits) || '')}</textarea></div>
            <div class="field"><label>Current state</label><textarea class="inp" id="sC" rows="3">${esc((s && s.current_state) || '')}</textarea></div>
            <div class="field"><label>Future state</label><textarea class="inp" id="sF" rows="3">${esc((s && s.future_state) || '')}</textarea></div></div>`,
        footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="sGo">Save</button>`,
        onMount: (w, close) => { $('#sGo', w).onclick = async () => { const v = id => $('#' + id, w).value;
          if (await piSave({ op: 'sugg_save', id: s ? s.id : null, name: v('sN'), department: v('sD'), team_lead: v('sL'), raised_on: v('sR'), impact: v('sI'), idea: v('sId'), benefits: v('sB'), current_state: v('sC'), future_state: v('sF') }, ['Saved'])) close(); }; } });
      const n = $('#sgNew'); if (n) n.onclick = () => edit(null);
      $$('[data-sg-ed]').forEach(b => b.onclick = () => edit(all.find(s => String(s.id) === b.dataset.sgEd)));
      $$('[data-sg-dec]').forEach(b => b.onclick = () => { const s = all.find(x => String(x.id) === b.dataset.sgDec);
        openModal({ title: 'Decide: ' + s.sug_no,
          body: `<div class="field"><label>Status</label><select class="inp" id="dS">${Object.keys(SG_ST).map(k => `<option value="${k}" ${k === s.status ? 'selected' : ''}>${SG_ST[k][0]}</option>`).join('')}</select></div>
            <div class="field"><label>Department that takes it on (accepted)</label><input class="inp" id="dO" list="sgDepts2" value="${esc(s.owner_dept || '')}"><datalist id="sgDepts2">${(d.departments || []).map(x => `<option value="${esc(x)}">`).join('')}</datalist></div>
            <div class="field"><label>Note (not taken: why)</label><input class="inp" id="dN" value="${esc(s.decision_note || '')}"></div>
            <div class="field"><label>Savings (when done)</label><input class="inp" id="dSv" value="${esc(s.savings || '')}" placeholder="e.g. Vendor 3,200,000; done for 1,980,000"></div>`,
          footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="dGo">Save</button>`,
          onMount: (w, close) => { $('#dGo', w).onclick = async () => { if (await piSave({ op: 'sugg_status', id: s.id, status: $('#dS', w).value, owner_dept: $('#dO', w).value, decision_note: $('#dN', w).value, savings: $('#dSv', w).value }, ['Saved'])) close(); }; } }); });
      $$('[data-sg-act]').forEach(b => b.onclick = () => piActEdit(null, { source: 'suggestion', source_id: +b.dataset.sgAct }, {}));
      piBindActs(all.flatMap(s => s.actions || []), {});
    } };
}

/* ---------------- How to use ---------------- */
const PI_HELP = [
  ['check', 'Overview: open actions', [
    'Menu > <b>Overview</b>: every action not done yet from RCAs, Gemba walks, 5S rooms and suggestions, overdue ones in red. Filter by where they come from; <b>Open</b> takes you to it.']],
  ['chart', 'RCAs: stops', [
    'RCAs > <b>Stops</b>. Pick the period, <b>Show</b>. Every stop: Engineering jobs, floor stops no job covers, and the OKL report stops that stayed on Machine issues (operator fixes, not a machine issue).',
    '<b>Start an RCA</b> on a line opens an RCA with that stop in it. Where the time went (Pareto) is on the OEE dashboard.']],
  ['wrench', 'RCAs: log, open, one RCA', [
    'RCAs start by themselves (a long stop, or the same reason several times on a machine), from a downtime line, or <b>RCA by hand</b>. <b>Log</b> lists all; <b>Open RCAs</b> shows the work with its progress. <b>Settings</b> > <b>RCA rules</b> (edit access) sets how long a stop, or how many repeats in how many days, starts one.',
    'One RCA, top to bottom: 1 what happened (read from Engineering), 2 your observation, 3 causes under the 6M, 4 the 5 whys and the root cause (<b>Save steps 2 to 4</b>), 5 actions, 6 verify.',
    'Actions: <b>corrective</b> (fix this one), <b>preventive</b> (stop it coming back), <b>horizontal deployment</b> (<b>Pick look-alike machines</b>: one line each), <b>periodic check</b> (pick the check in Engineering; its done-of-due shows here).',
    '<b>Done: start watching</b> when every action is done or not needed. Then <b>Effective: close it</b> or <b>Not effective</b>. <b>Closed: not solved</b> closes one without a fix; nothing is ever deleted.',
    '<b>Start clean from today</b> (Log): closes every open RCA as not solved and makes the rules look only at stops from now on.']],
  ['chart', 'RCA effectiveness', [
    'RCAs > <b>Effectiveness</b>: for each RCA that is done or closed, did the same problem come back on that machine after it? Before and after, per 30 days. <b>Held</b> = not back for 30 days or more.']],
  ['users', 'Gemba walks', [
    'Menu > <b>Gemba walks</b>: the plan, walk by walk. Open one: <b>Add a finding</b> at the visit (what we saw, the management commitment, our action, owners, dates); at the review update each one.',
    '<b>Edit the walk</b>: dates, status (visited, reviewed) and the gate (passed: the next theme can start). A 5S walk has the <b>5S walk score</b>: 0, 1 or 2 per check at the visit and at the review.']],
  ['layers', '5S rooms', [
    'Menu > <b>5S</b>: every room of every area against Sort, Set in Order, Shine, Standardize and Sustain. Tap a box to move it on: Not started, In progress, Passed.',
    'Tap a room for its owner, a note and its actions. <b>Area</b> and <b>Room</b> add or change them; a room that leaves the programme is ticked off, not deleted.']],
  ['edit', 'Suggestions (improvement ideas)', [
    'Menu > <b>Suggestions</b>: <b>New suggestion</b> types in an idea (name, department, impact, the idea, benefits, now and after).',
    '<b>Decide</b>: accepted (and the department that takes it on), in progress, done (with the savings), or not taken (with why). Actions on a suggestion show on the Overview too.']],
];
const PI_HELP_PAGE = { 'Overview: open actions': true, 'RCAs: stops': '/rca/stops', 'RCAs: log, open, one RCA': '/rca', 'RCA effectiveness': '/rca', 'Gemba walks': '/gemba', '5S rooms': '/5s', 'Suggestions (improvement ideas)': '/suggestions' };
const PI_HELP_MINE = () => PI_HELP.filter(h => { const g = PI_HELP_PAGE[h[1]]; return g === true || (!!g && canOpen(g)); });
function viewPiHelp(){
  const mine = PI_HELP_MINE();
  return { title: 'How to use', crumb: 'Help', html: pageHead('How to use', 'The short version of each task.')
    + `<div class="grid g2">${mine.map(([ic, t, steps]) => `<div class="card"><div class="card-h"><div><h3>${I[ic] || ''} ${esc(t)}</h3></div></div>
        <div class="card-b"><ol class="small" style="margin:0;padding-left:18px;line-height:1.55">${steps.map(x => `<li style="margin-bottom:4px">${x}</li>`).join('')}</ol></div></div>`).join('')}</div>` };
}

route('/overview', viewPiOverview);
route('/rca/stops', viewPiDowntime);
route('/downtime', () => { go('/rca/stops'); return { title: 'RCAs', crumb: '', html: '' }; });   // old links
route('/rca', () => viewPiRcaLog('log'));
route('/rca/open', () => viewPiRcaLog('open'));
route('/rca/effect', viewPiEffect);
route('/rca/:id', p => viewPiRca(p.id));
route('/gemba', viewPiGemba);
route('/gemba/:id', p => viewPiWalk(p.id));
route('/5s', viewPi5s);
route('/suggestions', viewPiSugg);
route('/help', viewPiHelp);
route('/', () => { location.replace('#/overview'); return { title: '', crumb: '', html: '' }; });
