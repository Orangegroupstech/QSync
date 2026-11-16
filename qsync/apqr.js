/* =====================================================================================
   QSync: parameter trends (built like the APQR) and the Annual Product Quality Review (081, 16 Nov 2026).

   Trends: Reports and trends > Parameter trends: filters (product, IPQA or QC, stage, parameter) and a capability summary
   (one row per parameter: mean, SD, RSD, Cpk, the control-chart checks); a row opens its control chart (mean, 3-sigma limits,
   specification limits) and the APQR's "review of control chart" table. Product performance is its own tab.

   APQR: page /apqr (page qsync.apqr). The system calculates what it holds (batches, IPQA and QC trends with Cpk, compliance
   to specification, OOS, method changes, batches not released, last year's review); QA writes the rest (materials,
   facilities, monitoring, deviations, complaints ...). Download as Word (docx 8.5.0, loaded only when asked). Signatures
   are made outside the system (user, 16 Nov 2026). Data: POST qsync/lab/api/apqr (okl_qcl_apqr).

   Statistics (as the Excel / APQR): sample SD (n - 1); 3-sigma limits = mean +/- 3 SD; Cpk = min(USL - mean, mean - LSL) / 3 SD
   (one side when only one limit); Cpk >= 1.33 capable, 1.00 to 1.32 marginal, < 1.00 not capable (on the 2-decimal Cpk);
   a run = 8 or more points in a row on the same side of the mean.
   ===================================================================================== */

/* ---------------- statistics ---------------- */
function spcStats(values, lo, hi){
  const v = values.map(Number).filter(Number.isFinite), n = v.length;
  const L = lo === null || lo === undefined || lo === '' || !Number.isFinite(Number(lo)) ? null : Number(lo);
  const U = hi === null || hi === undefined || hi === '' || !Number.isFinite(Number(hi)) ? null : Number(hi);
  const out = { n, lo: L, hi: U, mean: null, sd: null, rsd: null, min: null, max: null, ucl: null, lcl: null, cpk: null, band: null,
                outside: [], run: 0, runAt: -1, oos: [] };
  if (!n) return out;
  const mean = v.reduce((a, b) => a + b, 0) / n;
  Object.assign(out, { mean, min: Math.min(...v), max: Math.max(...v) });
  v.forEach((x, i) => { if ((L !== null && x < L) || (U !== null && x > U)) out.oos.push(i); });
  if (n < 2) return out;
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1));
  Object.assign(out, { sd, rsd: mean ? sd / Math.abs(mean) * 100 : null, ucl: mean + 3 * sd, lcl: mean - 3 * sd });
  if (sd > 0){
    v.forEach((x, i) => { if (x > out.ucl || x < out.lcl) out.outside.push(i); });
    const sides = [U !== null ? (U - mean) / (3 * sd) : null, L !== null ? (mean - L) / (3 * sd) : null].filter(x => x !== null);
    if (sides.length){ out.cpk = Math.min(...sides); const c = Math.round(out.cpk * 100) / 100; out.band = c >= 1.33 ? 'capable' : c >= 1 ? 'marginal' : 'not'; }
  }
  let run = 0, side = 0;
  v.forEach((x, i) => { const s = x > mean ? 1 : x < mean ? -1 : 0; run = s !== 0 && s === side ? run + 1 : s !== 0 ? 1 : 0; side = s;
    if (run > out.run){ out.run = run; out.runAt = i - run + 1; } });
  return out;
}
const BAND = { capable: ['Capable', 'b-ok', 'Process is capable'], marginal: ['Marginal', 'b-warn', 'Marginally capable'], not: ['Not capable', 'b-danger', 'Process is not capable'] };
const CPK_RULE = 'Cpk < 1.00: process not capable. Cpk 1.00 to 1.32: marginal capability. Cpk >= 1.33: capable.';
// decimals of the values (at most 3), so the statistics are shown one or two places finer
function spcDp(values){ return Math.min(3, Math.max(0, ...values.map(x => (String(x).split('.')[1] || '').length))); }
const sfix = (v, dp) => (v === null || v === undefined || !Number.isFinite(Number(v)) ? '--' : Number(v).toFixed(dp));
// the three checks of the APQR's "review of control chart", in its words
function spcChecks(st, pts){
  const names = idx => idx.map(i => (pts[i] || {}).batch_no).filter(Boolean);
  const out = st.outside.length;
  return [
    ['3-sigma control limits', 'No data point should fall outside the established 3-sigma control limits.',
      st.sd === null ? 'Not enough values (at least 2).' : out ? `${out} data point${out > 1 ? 's' : ''} fell outside the 3-sigma control limits (${names(st.outside).join(', ')}).` : 'No data point fell outside the 3-sigma control limits.',
      st.sd === null ? '--' : out ? 'Does not comply' : 'Complies'],
    ['Cpk', CPK_RULE, st.cpk === null ? (st.lo === null && st.hi === null ? 'No specification limit' : 'Not enough values') : sfix(st.cpk, 2),
      st.band ? BAND[st.band][2] : '--'],
    ['Consecutive runs', 'No eight consecutive data points should plot on the same side of the center line.',
      st.run >= 8 ? `${st.run} consecutive data points plotted on one side of the center line (from batch ${(pts[st.runAt] || {}).batch_no || '?'}).` : 'There were no eight consecutive data points plotting on one side of the center line.',
      st.n < 2 ? '--' : st.run >= 8 ? 'Does not comply' : 'Complies']];
}

/* ---------------- the series (IPQA per stage; QC per test, API and stage) ---------------- */
const QC_TEST_NAMES = { assay: 'Assay', dissolution: 'Dissolution', content_uniformity: 'Content uniformity (AV)', density: 'Weight per mL', ph: 'pH',
  weight_variation: 'Weight variation', identification: 'Identification (retention time)', tamc: 'TAMC', tymc: 'TYMC' };
function qcTestName(t){ return QC_TEST_NAMES[t] || (typeof testOfResult === 'function' ? testOfResult(t) : String(t || '').replace(/_/g, ' ')); }
function trendSeriesAll(d){
  const num = p => p.value !== null && p.value !== undefined && p.value !== '' && Number.isFinite(Number(p.value));
  const ip = (d.ipqa_series || []).map(s => ({ key: 'i|' + s.product + '|' + s.stage + '|' + s.parameter, source: 'ipqa', product: s.product, stage: s.stage,
    name: s.parameter, unit: s.unit || '', lo: s.spec_min, hi: s.spec_max, limit: s.spec_min != null || s.spec_max != null ? `${s.spec_min ?? ''} to ${s.spec_max ?? ''} ${s.unit || ''}`.trim() : '',
    points: (s.points || []).filter(num) }));
  const qc = [];
  (d.qc_series || []).forEach(s => {
    const by = {};
    (s.points || []).filter(num).forEach(p => { (by[p.stage || 'Finished Product'] = by[p.stage || 'Finished Product'] || []).push(p); });
    const nm = qcTestName(s.test), withApi = s.api && String(s.api).toLowerCase() !== nm.toLowerCase() ? `${nm} (${s.api})` : nm;
    Object.entries(by).forEach(([stage, pts]) => qc.push({ key: 'q|' + s.product + '|' + s.test + '|' + s.api + '|' + stage, source: 'qc', product: s.product, stage,
      name: withApi, test: s.test, api: s.api, unit: s.unit === 'AV' ? '' : (s.unit || ''), lo: s.spec_min, hi: s.spec_max, limit: s.limit_text || '', points: pts }));
  });
  return ip.concat(qc).filter(s => s.points.length).map(s => Object.assign(s, { st: spcStats(s.points.map(p => p.value), s.lo, s.hi) }));
}

/* ---------------- the control chart (screen: theme colours; Word: fixed colours) ---------------- */
const CHART_SCREEN = { grid: 'var(--line, #E4E7EA)', text: 'var(--text-2, #565E6B)', line: 'var(--brand, #ED6B1F)', mean: 'var(--text, #1F2328)',
  sigma: 'var(--info, #2F6FB2)', spec: 'var(--danger, #C0392B)', bad: 'var(--danger, #C0392B)', warn: 'var(--warn, #B7791F)', surface: 'var(--surface, #fff)' };
const CHART_PRINT = { grid: '#E4E7EA', text: '#444444', line: '#ED6B1F', mean: '#1F2328', sigma: '#2F6FB2', spec: '#C0392B', bad: '#C0392B', warn: '#B7791F', surface: '#FFFFFF' };
function spcChartSvg(pts, st, opt){
  opt = opt || {}; const C = opt.colors || CHART_SCREEN, W = opt.w || 760, H = opt.h || 280, Lm = 56, R = 70, T = 14, B = 34;
  const vals = pts.map(p => Number(p.value));
  const refs = [st.lo, st.hi, st.ucl, st.lcl, st.mean].filter(v => v !== null && v !== undefined && Number.isFinite(v));
  let mn = Math.min(...vals, ...refs), mx = Math.max(...vals, ...refs); if (mn === mx){ mn -= 1; mx += 1; }
  const pad = (mx - mn) * 0.08; mn -= pad; mx += pad;
  const x = i => Lm + (pts.length === 1 ? (W - Lm - R) / 2 : i * (W - Lm - R) / (pts.length - 1)), y = v => T + (mx - v) * (H - T - B) / (mx - mn);
  const dp = spcDp(vals), f = v => Number(v).toLocaleString('en-US', { maximumFractionDigits: Math.max(dp, 1) });
  const ticks = [0, 1, 2, 3, 4].map(k => mn + k * (mx - mn) / 4);
  // reference lines; their labels on the right are pushed apart (at least 12 px) so close lines stay readable
  const lines = [];
  const hl = (v, label, color, dash) => { if (v === null || v === undefined || !Number.isFinite(v)) return '';
    lines.push({ ty: y(v) + 4, label: `${label} ${f(v)}`, color });
    return `<line x1="${Lm}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${color}" stroke-width="${dash ? 1.2 : 1.5}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`; };
  const labels = () => { const ls = lines.slice().sort((a, b) => a.ty - b.ty);
    for (let i = 1; i < ls.length; i++) if (ls[i].ty - ls[i - 1].ty < 12) ls[i].ty = ls[i - 1].ty + 12;
    const over = ls.length ? ls[ls.length - 1].ty - (H - B + 4) : 0; if (over > 0) ls.forEach(l => { l.ty -= over; });
    return ls.map(l => `<text x="${W - R + 4}" y="${l.ty}" font-size="11" fill="${l.color}">${esc(l.label)}</text>`).join(''); };
  const out = new Set(st.outside), oos = new Set(st.oos);
  const run = st.run >= 8 ? new Set(Array.from({ length: st.run }, (_, k) => st.runAt + k)) : new Set();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${opt.px ? W : '100%'}" ${opt.px ? `height="${H}"` : ''} role="img" aria-label="Control chart" style="${opt.px ? '' : 'width:100%;height:auto;'}display:block;font-family:Arial,Helvetica,sans-serif">
    ${opt.px ? `<rect width="${W}" height="${H}" fill="${C.surface}"/>` : ''}
    ${ticks.map(v => `<line x1="${Lm}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${C.grid}" stroke-width="1"/><text x="${Lm - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="${C.text}">${f(v)}</text>`).join('')}
    ${hl(st.hi, 'USL', C.spec, '6 4')}${hl(st.lo, 'LSL', C.spec, '6 4')}${st.sd > 0 ? hl(st.ucl, '+3s', C.sigma, '2 3') + hl(st.lcl, '-3s', C.sigma, '2 3') : ''}${hl(st.mean, 'Mean', C.mean, '')}${labels()}
    <polyline points="${pts.map((p, i) => `${x(i)},${y(Number(p.value))}`).join(' ')}" fill="none" stroke="${C.line}" stroke-width="2" stroke-linejoin="round"/>
    ${pts.map((p, i) => { const cx = x(i), cy = y(Number(p.value)), bad = oos.has(i) || p.pass === false;
      const tip = `${p.batch_no || ''}${p.sample && p.sample !== p.batch_no ? ' (' + p.sample + ')' : ''} - ${fmtDate(p.at)}: ${f(p.value)}${bad ? ' - OUT OF SPECIFICATION' : out.has(i) ? ' - outside 3-sigma' : ''}`;
      return `<g>${opt.px ? '' : `<title>${esc(tip)}</title><circle cx="${cx}" cy="${cy}" r="10" fill="transparent"/>`}
        ${bad ? `<path d="M${cx - 5},${cy - 5}L${cx + 5},${cy + 5}M${cx + 5},${cy - 5}L${cx - 5},${cy + 5}" stroke="${C.bad}" stroke-width="2.5"/>`
          : `<circle cx="${cx}" cy="${cy}" r="${out.has(i) || run.has(i) ? 5 : 4}" fill="${out.has(i) || run.has(i) ? C.warn : C.line}" stroke="${C.surface}" stroke-width="2"/>`}</g>`; }).join('')}
    <text x="${Lm}" y="${H - 10}" font-size="11" fill="${C.text}">${esc(pts[0].batch_no || '')}</text>
    <text x="${W - R}" y="${H - 10}" text-anchor="end" font-size="11" fill="${C.text}">${esc(pts[pts.length - 1].batch_no || '')}</text>
    <text x="${(Lm + W - R) / 2}" y="${H - 10}" text-anchor="middle" font-size="11" fill="${C.text}">${pts.length} batch result${pts.length === 1 ? '' : 's'}, in order</text></svg>`;
}
function spcLegendHtml(){
  const k = (c, t, dash) => `<span class="row" style="gap:6px;display:inline-flex"><svg width="22" height="8"><line x1="0" x2="22" y1="4" y2="4" stroke="${c}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ''}/></svg>${t}</span>`;
  return `<div class="row tiny muted" style="gap:14px;flex-wrap:wrap;margin:6px 0 2px">${k(CHART_SCREEN.line, 'Batch results')}${k(CHART_SCREEN.mean, 'Mean')}${k(CHART_SCREEN.sigma, '3-sigma limits', '2 3')}${k(CHART_SCREEN.spec, 'Specification limits', '6 4')}
    <span>Larger amber point: outside 3-sigma or in a run of 8. Cross: out of specification.</span></div>`;
}

/* ================= Reports and trends: Parameter trends ================= */
let trendsF = { product: '', source: '', stage: '', param: '', sel: '' };
function trendsFiltered(d){
  const all = trendSeriesAll(d);
  const products = [...new Set(all.map(s => s.product))].sort();
  const prod = reportsState.product || (products.includes(trendsF.product) ? trendsF.product : products[0] || '');
  const ofProd = all.filter(s => s.product === prod);
  const bySrc = ofProd.filter(s => !trendsF.source || s.source === trendsF.source);
  const stages = [...new Set(bySrc.map(s => s.stage))].sort();
  const byStage = bySrc.filter(s => !trendsF.stage || s.stage === trendsF.stage);
  const params = [...new Set(byStage.map(s => s.name))].sort();
  const list = byStage.filter(s => !trendsF.param || s.name === trendsF.param);
  return { all, products, prod, stages, params, list };
}
function bandBadge(st){ return st.band ? `<span class="badge ${BAND[st.band][1]}">${BAND[st.band][0]}</span>` : '<span class="muted small">--</span>'; }
function checkMark(ok, na){ return na ? '<span class="muted">--</span>' : ok ? `<span class="badge b-ok">${I.check} OK</span>` : `<span class="badge b-danger">${I.alert} Check</span>`; }
function reportsParamTrendsHtml(d){
  const F = trendsFiltered(d);
  if (!F.all.length) return `<div class="card"><div class="card-b">${emptyState('chart', 'No values yet', 'Values appear as batches are tested.')}</div></div>`;
  const opt = (v, cur, label) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(label == null ? v : label)}</option>`;
  const cur = F.list.find(s => s.key === trendsF.sel) || F.list[0];
  const filters = `<div class="card" style="margin-bottom:16px"><div class="card-b filter-bar" style="padding:14px 18px"><div class="row" style="gap:10px;flex-wrap:wrap">
      ${reportsState.product ? `<span class="badge b-slate">${esc(F.prod)}</span>` : `<select class="inp" id="trProduct" style="width:auto;min-width:150px" aria-label="Product">${F.products.map(p => opt(p, F.prod)).join('')}</select>`}
      <select class="inp" id="trSource" style="width:auto" aria-label="Source">${opt('', trendsF.source, 'IPQA and QC')}${opt('ipqa', trendsF.source, 'In-process (IPQA)')}${opt('qc', trendsF.source, 'QC laboratory')}</select>
      <select class="inp" id="trStage" style="width:auto" aria-label="Stage">${opt('', trendsF.stage, 'All stages')}${F.stages.map(s => opt(s, trendsF.stage)).join('')}</select>
      <select class="inp" id="trParam" style="width:auto;min-width:180px" aria-label="Parameter">${opt('', trendsF.param, 'All parameters')}${F.params.map(s => opt(s, trendsF.param)).join('')}</select>
      <span class="small muted">${F.list.length} parameter${F.list.length === 1 ? '' : 's'}</span></div></div></div>`;
  const rows = F.list.map(s => { const st = s.st, dp = spcDp(s.points.map(p => p.value));
    return `<tr class="clickable ${cur && s.key === cur.key ? 'row-sel' : ''}" data-tr="${esc(s.key)}" style="${cur && s.key === cur.key ? 'background:var(--brand-50)' : ''}">
      <td class="strong">${esc(s.name)}<div class="tiny muted">${s.source === 'ipqa' ? 'IPQA' : 'QC'} - ${esc(s.stage)}</div></td><td class="tnum">${st.n}</td>
      <td class="tnum">${sfix(st.mean, dp + 1)}</td><td class="tnum">${sfix(st.sd, dp + 2)}</td><td class="tnum">${sfix(st.rsd, 2)}</td>
      <td class="tnum small">${sfix(st.min, dp)} to ${sfix(st.max, dp)}</td><td class="small">${esc(s.limit || '--')}</td>
      <td class="tnum strong">${sfix(st.cpk, 2)}</td><td>${bandBadge(st)}</td>
      <td>${checkMark(!st.outside.length, st.sd === null)}</td><td>${checkMark(st.run < 8, st.n < 2)}</td>
      <td class="tnum">${st.oos.length ? `<span class="badge b-danger">${st.oos.length}</span>` : '0'}</td></tr>`; }).join('');
  const summary = `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Capability summary ${qInfo('Each parameter over the batches in the period: mean, SD and RSD, and the Cpk (how far the batches stay from the limits).\n' + CPK_RULE + '\nTap a row for its control chart.')}</h3>
      <div class="sub">As in the Annual Product Quality Review. Tap a row for its control chart.</div></div></div>
      ${F.list.length ? `<div class="tbl-wrap"><table class="tbl" data-nosort><thead><tr><th>Parameter</th><th>Batches</th><th>Mean</th><th>SD</th><th>RSD %</th><th>Range</th><th>Specification</th><th>Cpk</th><th>Capability</th>
        <th>3-sigma ${qInfo('No result should fall outside mean +/- 3 SD.')}</th><th>Runs ${qInfo('No 8 results in a row on the same side of the mean.')}</th><th>Out of spec</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : `<div class="card-b">${emptyState('chart', 'Nothing matches these filters', '')}</div>`}</div>`;
  return filters + summary + (cur ? spcDetailHtml(cur) : '');
}
function spcDetailHtml(s){
  const st = s.st, pts = s.points, dp = spcDp(pts.map(p => p.value));
  const tile = (lbl, val, meta, acc) => `<div class="stat ${acc || 'acc-info'}"><div class="lbl">${lbl}</div><div class="val" style="font-size:20px">${val}</div><div class="meta">${meta || ''}</div></div>`;
  return `<div class="card"><div class="card-h"><div><h3>${esc(s.name)}</h3><div class="sub">${s.source === 'ipqa' ? 'In-process (IPQA)' : 'QC laboratory'} - ${esc(s.stage)} - ${esc(s.product)}${s.limit ? ' - specification ' + esc(s.limit) : ''}${s.unit ? ' - unit ' + esc(s.unit) : ''}</div></div></div>
    <div class="card-b">
      <div class="grid g4" style="margin-bottom:12px">${tile('Mean', sfix(st.mean, dp + 2), `${st.n} batch results`)}${tile('SD', sfix(st.sd, dp + 3), 'RSD ' + sfix(st.rsd, 2) + '%')}
        ${tile('3-sigma limits', `<span style="font-size:15px">${sfix(st.lcl, dp + 1)} to ${sfix(st.ucl, dp + 1)}</span>`, 'mean +/- 3 SD')}
        ${tile('Cpk', sfix(st.cpk, 2), st.band ? BAND[st.band][0] : (s.lo == null && s.hi == null ? 'no specification limit' : 'needs 2 or more values'), st.band === 'capable' ? 'acc-ok' : st.band === 'marginal' ? 'acc-warn' : st.band === 'not' ? 'acc-danger' : 'acc-info')}</div>
      ${st.n < 10 ? `<div class="notice" style="margin-bottom:10px">${I.info} Only ${st.n} result${st.n === 1 ? '' : 's'} so far: read the Cpk and the checks as a rough guide until there are more batches.</div>` : ''}
      ${spcChartSvg(pts, st)}${spcLegendHtml()}
      <h4 style="margin:14px 0 6px">Review of the control chart</h4>
      <div class="tbl-wrap"><table class="tbl" style="min-width:0" data-nosort><thead><tr><th>Check</th><th>Acceptance criteria</th><th>Result</th><th>Comment</th></tr></thead><tbody>
        ${spcChecks(st, pts).map(r => `<tr><td class="strong">${esc(r[0])}</td><td class="small">${esc(r[1])}</td><td class="small">${esc(r[2])}</td>
          <td>${/not|Does not/.test(r[3]) ? `<span class="badge b-danger">${esc(r[3])}</span>` : /Marginal/.test(r[3]) ? `<span class="badge b-warn">${esc(r[3])}</span>` : r[3] === '--' ? '--' : `<span class="badge b-ok">${esc(r[3])}</span>`}</td></tr>`).join('')}</tbody></table></div>
      <details style="margin-top:10px"><summary class="small">Show the values as a table</summary><div class="tbl-wrap"><table class="tbl" style="min-width:0" data-nosort><thead><tr><th>Batch</th><th>Date</th><th>Result</th><th>LSL</th><th>USL</th><th></th></tr></thead><tbody>
        ${pts.slice().reverse().map(p => `<tr><td class="mono small">${esc(p.batch_no)}${p.sample && p.sample !== p.batch_no ? ' (' + esc(p.sample) + ')' : ''}</td><td class="small">${fmtDate(p.at)}</td>
          <td class="tnum">${esc(p.value)} ${esc(s.unit)}</td><td class="tnum">${esc(s.lo ?? '--')}</td><td class="tnum">${esc(s.hi ?? '--')}</td>
          <td>${p.pass === false || st.oos.includes(pts.indexOf(p)) ? '<span class="badge b-danger">Out of spec</span>' : '<span class="badge b-ok">Pass</span>'}</td></tr>`).join('')}</tbody></table></div></details>
    </div></div>`;
}
function bindTrendsTab(){
  const on = (id, k) => { const el = $('#' + id); if (el) el.onchange = e => { trendsF[k] = e.target.value; if (k !== 'param') trendsF.param = ''; if (k === 'product') trendsF.stage = ''; trendsF.sel = ''; render(); }; };
  on('trProduct', 'product'); on('trSource', 'source'); on('trStage', 'stage'); on('trParam', 'param');
  $$('[data-tr]').forEach(tr => tr.onclick = () => { trendsF.sel = tr.getAttribute('data-tr'); render(); });
}

/* ================= Reports and trends: Product performance ================= */
function reportsProductPerfHtml(d){
  const series = trendSeriesAll(d);
  const cap = p => { const c = { capable: 0, marginal: 0, not: 0 }; series.filter(s => s.product === p && s.st.band).forEach(s => { c[s.st.band]++; }); return c; };
  return `<div class="card"><div class="card-h"><div><h3>Product performance</h3><div class="sub">IPQA first pass, QC results, out-of-specification entries, the time QC takes to release, and how many parameters are capable (Cpk). Tap a product for its parameter trends.</div></div></div>
    ${(d.products || []).length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Product</th><th>Requests</th><th>IPQA first pass</th><th>QC results passed</th><th>OOS</th><th>Released / not</th><th>QC receipt to release</th>
      <th>Parameters by Cpk ${qInfo('How many of the product\'s parameters are capable, marginal or not capable in the period.\n' + CPK_RULE)}</th></tr></thead><tbody>
      ${d.products.map(p => { const ip = p.ipqa_tested ? Math.round(p.ipqa_first_pass / p.ipqa_tested * 100) : null, qc = p.qc_results ? Math.round(p.qc_pass / p.qc_results * 100) : null, c = cap(p.product);
        const barc = r => `<div class="row" style="gap:8px"><div class="bar ${r >= 95 ? 'ok' : r >= 80 ? 'warn' : 'danger'}" style="width:66px"><i style="width:${r}%"></i></div><span class="tnum small strong">${r}%</span></div>`;
        return `<tr class="clickable" data-pp="${esc(p.product)}"><td class="strong">${esc(p.product)}</td><td class="tnum">${p.requests}</td><td>${ip == null ? '<span class="muted">--</span>' : barc(ip) + `<div class="tiny muted">${p.ipqa_first_pass} of ${p.ipqa_tested}</div>`}</td>
          <td>${qc == null ? '<span class="muted">--</span>' : barc(qc) + `<div class="tiny muted">${p.qc_pass} of ${p.qc_results}</div>`}</td><td class="tnum">${p.oos ? `<span class="badge b-danger">${p.oos}</span>` : '0'}</td>
          <td class="tnum">${p.released} / ${p.not_released}</td><td class="tnum">${hrs(p.avg_release_h)}</td>
          <td class="small">${c.capable + c.marginal + c.not ? `<span class="badge b-ok">${c.capable} capable</span> ${c.marginal ? `<span class="badge b-warn">${c.marginal} marginal</span>` : ''} ${c.not ? `<span class="badge b-danger">${c.not} not</span>` : ''}` : '<span class="muted">--</span>'}</td></tr>`; }).join('')}</tbody></table></div>`
      : `<div class="card-b">${emptyState('chart', 'No data', '')}</div>`}</div>`;
}
function bindProductPerf(){
  $$('[data-pp]').forEach(tr => tr.onclick = () => { trendsF = { product: tr.getAttribute('data-pp'), source: '', stage: '', param: '', sel: '' }; reportsTab = 'trends'; render(); });
}

/* ================= APQR ================= */
let apqrList = null, apqrListLoading = false, apqrDoc = null, apqrLoading = '';
const APQR_LOCAL = k => 'okl.apqr.' + k;
function apqrKey(product, year){ return product + '|' + year; }
function apqrApi(body){ return api('/webhook/qsync/lab/api/apqr', { method: 'POST', body }); }
const OKL_ADDRESS = 'Orange Kalbe Limited, 66/68 Town Planning, Ilupeju, Lagos.';

function viewApqrList(){
  if (!apqrList && !apqrListLoading){
    apqrListLoading = true;
    apqrApi({ action: 'list' }).then(d => { apqrList = d; }).catch(e => { apqrList = { error: e.message }; }).finally(() => { apqrListLoading = false; render(); });
  }
  const head = pageHead('Annual product review (APQR)', 'One review per product and year. The system fills in what it holds (batches, trends, Cpk, OOS, method changes); QA writes the rest, then downloads it as a Word document.');
  if (!apqrList) return { title: 'Annual product review', crumb: 'Records', html: head + `<div class="card"><div class="card-b">${emptyState('doc', 'Loading...', '')}</div></div>` };
  if (apqrList.error) return { title: 'Annual product review', crumb: 'Records', html: head + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(apqrList.error))}</div></div>` };
  const L = apqrList, av = L.available || [];
  const products = [...new Set(av.map(a => a.product))].sort(), years = [...new Set(av.map(a => a.year))].sort((a, b) => b - a);
  const start = `<div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>${L.can_edit ? 'Start or open a review' : 'Open a review'}</h3><div class="sub">Pick the product and the year under review.</div></div></div>
    <div class="card-b"><div class="row" style="gap:10px;flex-wrap:wrap;align-items:flex-end">
      <div class="field" style="margin:0"><label for="apProd">Product</label><select class="inp" id="apProd">${products.map(p => `<option>${esc(p)}</option>`).join('')}</select></div>
      <div class="field" style="margin:0"><label for="apYear">Year</label><select class="inp" id="apYear">${years.map(y => `<option>${y}</option>`).join('')}</select></div>
      <button class="btn btn-primary" id="apOpen">${I.doc} Open</button><span class="small muted" id="apHint"></span></div></div></div>`;
  const list = `<div class="card"><div class="card-h"><div><h3>Reviews</h3><div class="sub">Drafts and final reviews</div></div></div>
    ${(L.reviews || []).length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Product</th><th>Year</th><th>Status</th><th>Last saved</th><th>Made final</th></tr></thead><tbody>
      ${L.reviews.map(r => `<tr class="clickable" onclick="go('/apqr/${r.year}/${encodeURIComponent(r.product)}')"><td class="strong">${esc(r.product)}</td><td class="tnum">${r.year}</td>
        <td>${r.status === 'final' ? '<span class="badge b-ok">Final</span>' : '<span class="badge b-warn">Draft</span>'}</td><td class="small">${esc(r.updated_by || '')}<div class="tiny muted">${fmtDateTime(r.updated_at)}</div></td>
        <td class="small">${r.finalised_at ? esc(r.finalised_by || '') + `<div class="tiny muted">${fmtDateTime(r.finalised_at)}</div>` : '--'}</td></tr>`).join('')}</tbody></table></div>`
      : `<div class="card-b">${emptyState('doc', 'No reviews yet', L.can_edit ? 'Pick a product and year above to start one.' : '')}</div>`}</div>`;
  return { title: 'Annual product review', crumb: 'Records', html: head + start + list, bind(){
    const hint = () => { const p = $('#apProd').value, y = Number($('#apYear').value), a = av.find(x => x.product === p && x.year === y);
      $('#apHint').textContent = a ? `${a.batches} batch${a.batches === 1 ? '' : 'es'} in the system for ${y}` : `no batches of ${p} in the system for ${y}`; };
    if ($('#apProd')){ $('#apProd').onchange = hint; $('#apYear').onchange = hint; hint();
      $('#apOpen').onclick = () => go(`/apqr/${$('#apYear').value}/${encodeURIComponent($('#apProd').value)}`); }
  } };
}

/* ---- the sections: numbered as in the QA template (2025 Cannon Extra APQR) ----
   kind: 'text' (QA writes; a calculated first draft where there is one), 'table' (rows QA fills), 'auto' (calculated, shown as is). */
function apqrSeries(D){ return trendSeriesAll(D.trends || {}).filter(s => s.test !== 'identification' && !['tamc', 'tymc'].includes(s.test)); }
function apqrIncluded(D, C){ const ex = new Set((C && C.exclude) || []); return apqrSeries(D).filter(s => !ex.has(s.key)); }
function seriesLabel(s){ return s.source === 'ipqa' ? `${s.name} (${s.stage})` : s.name + (s.stage && s.stage !== 'Finished Product' ? ` (${s.stage})` : ''); }
const T = (head, rows) => ({ head, rows });
function apqrYearSpan(D){ const b = D.batches || []; if (!b.length) return `${D.year}`;
  const m = x => new Date(x).toLocaleString('en-GB', { month: 'long', timeZone: 'Africa/Lagos' }); return `${m(b[0].first_at)} and ${m(b[b.length - 1].first_at)} ${D.year}`; }
function apqrCount(n){ return n + ' batch' + (n === 1 ? '' : 'es'); }
const APQR_SECTIONS = [
  { key: 'approval', title: 'APQR approval sheet', kind: 'table', note: 'Names and designations. Signatures and dates are made on the printed copy.',
    tables: () => [Object.assign(T(['Name', 'Designation', 'Signature', 'Date'], [['', 'QA Supervisor', '', '']]), { title: 'Prepared by' }),
      Object.assign(T(['Name', 'Designation', 'Signature', 'Date'], [['', 'Quality Control Manager', '', ''], ['', 'Production Manager', '', ''], ['', 'Engineering Manager', '', ''], ['', 'QA Assistant Manager', '', '']]), { title: 'Reviewed by' }),
      Object.assign(T(['Name', 'Designation', 'Signature', 'Date'], [['', 'QA Manager', '', ''], ['', 'Superintendent Pharmacist', '', '']]), { title: 'Approved by' })] },
  { key: 'intro', title: 'Introduction', kind: 'text',
    text: D => `The objective of this Annual Product Quality Review (APQR) is to compile and evaluate the process and analytical data generated during the review period in order to assess the overall performance, consistency, and state of control of the manufacturing process for ${D.product}.\n\nThis review covers ${apqrCount((D.batches || []).length)} of ${D.product} tested between ${apqrYearSpan(D)}. It is intended to verify the process capability, product quality and compliance with established specifications, and to identify opportunities for continuous improvement.` },
  { key: 'description', title: 'Description of product', kind: 'table',
    tables: D => { const pi = D.product_info || {}, apis = D.apis || [], form = (apis[0] || {}).dosage_form || '';
      const sl = pi.shelf_life_months ? (pi.shelf_life_months % 12 === 0 ? `${pi.shelf_life_months / 12} years` : `${pi.shelf_life_months} months`) : '';
      return [T(['Item', 'Detail'], [['Product Name', D.product], ['Manufacturing Location', OKL_ADDRESS], ['Dosage Form', form ? form.charAt(0).toUpperCase() + form.slice(1) : ''], ['Batch Size', ''], ['Shelf Life', sl],
        ['Label Claim', apis.length ? `Each ${form || 'unit'} contains: ` + apis.map(a => `${a.api} ${a.label_claim_mg ?? ''} mg`).join('; ') : ''], ['Description', ''], ['Therapeutic Category', ''], ['Route of Administration', ''],
        ['Batch Manufacturing Record (BMR) Reference Number', ''], ['Product Specification Reference Number', ((D.refs || {}).spec_refs || []).join(', ')]])]; } },
  { key: 'prev_actions', title: 'Review of actions from preceding product review report', kind: 'table',
    note: 'Filled from last year\'s recommendations when last year\'s review is in the system.',
    tables: D => { const r = (((D.previous || {}).content || {}).recs) || [];
      return [T(['Sr. No.', 'Recommendations', 'Responsibility', 'Timeline', 'Status'], r.length ? r.map((x, i) => [String(i + 1), x[0] || '', x[1] || '', x[2] || '', '']) : [['1', '', '', '', '']])]; } },
  { key: 'performance', title: 'Product performance overview', kind: 'text',
    text: D => { const o = (D.oos || []).length, nr = (D.not_released || []).length;
      return `${D.product} was tested on ${apqrCount((D.batches || []).length)} during the review period.\n\n` +
        (o ? `${o} out-of-specification (OOS) result${o > 1 ? 's were' : ' was'} recorded (see Out of specification results).` : 'No Out-of-Specification (OOS) results were recorded during the review period.') + '\n\n' +
        (nr ? `${nr} batch${nr > 1 ? 'es were' : ' was'} not released by QC (see Batch rejections).` : 'All batches decided by QC during the period were released.') +
        '\n\nRaw materials and packaging materials, vendor qualification, stability and the purified water system: describe here.'; } },
  { key: 'batches', title: 'List of batches of product under review', kind: 'auto' },
  { key: 'rationale', title: 'Product parameter selection rationale', kind: 'text',
    text: (D, C) => { const s = apqrIncluded(D, C), ip = [...new Set(s.filter(x => x.source === 'ipqa').map(x => x.name))], qc = [...new Set(s.filter(x => x.source === 'qc').map(x => x.name))];
      return `The key parameters for this review are:\n\nIn-process (IPQA): ${ip.join(', ') || 'none'}.\nQuality control: ${qc.join(', ') || 'none'}.`; } },
  { key: 'materials', title: 'Key input materials / supplier performance', kind: 'table', note: 'Not in the system yet: from the stores and QC raw material records.',
    tables: () => [Object.assign(T(['Active Pharmaceutical Ingredient (API)', 'Source', 'Compliance With Specification', 'Total Quantity Used'], [['', '', 'Complies', '']]), { title: 'Active ingredients' }),
      Object.assign(T(['Excipient', 'Source', 'Compliance With Specification', 'Total Quantity Used'], [['', '', 'Complies', '']]), { title: 'Excipients' }),
      Object.assign(T(['Primary Packaging Material', 'Source', 'Compliance With Specification', 'Total Quantity Used'], [['', '', 'Complies', '']]), { title: 'Primary packaging' }),
      Object.assign(T(['Secondary Packaging Material', 'Source', 'Compliance With Specification', 'Total Quantity Used'], [['', '', 'Complies', '']]), { title: 'Secondary packaging' }),
      Object.assign(T(['Key Input Material that failed', 'Lot/Batch Number', 'Reason for Failure'], [['Nil', 'Nil', 'Nil']]), { title: 'Materials that failed analysis' }),
      Object.assign(T(['Materials', 'Batch No', 'Manufacturer', 'Approval Status'], [['', '', '', 'Approved']]), { title: 'Raw material batches used' }),
      Object.assign(T(['Material', 'Batch No', 'Parameter', 'Result', 'Specification'], [['', '', '', '', '']]), { title: 'Analytical results of raw materials used' }),
      Object.assign(T(['Change Number', 'Description', 'Status of Change', 'Date of implementation / batch'], [['Nil', 'Nil', 'Nil', 'Nil']]), { title: 'Input material, specification or supplier changes' })],
    text: () => 'Reference: Approved vendor list.' },
  { key: 'facilities', title: 'Facilities', kind: 'table',
    tables: () => [Object.assign(T(['Sr. No.', 'Equipment', 'I.D. Number', 'Location', 'Date of Qualification', 'Outcome of Qualification'], [['1', '', '', '', '', 'Qualified']]), { title: 'Critical process equipment' }),
      Object.assign(T(['Sr. No.', 'Equipment Name', 'Reference Number', 'Date of Validation', 'Outcome of Validation'], [['1', 'Purified Water System', '', '', 'Validated'], ['2', 'AHU System', '', '', 'Validated']]), { title: 'Critical utilities: validation' }),
      Object.assign(T(['Change Number', 'Description', 'Status of Change', 'Date of implementation / first batch after change'], [['Nil', 'Nil', 'Nil', 'Nil']]), { title: 'Changes associated with utilities' })],
    text: () => 'The above reports have been reviewed and were found to be satisfactory.' },
  { key: 'monitoring', title: 'Monitoring', kind: 'table',
    tables: D => { const y = D.year, q = ['January - March', 'April - June', 'July - September', 'October - December'];
      return [Object.assign(T(['Review Period Dates', 'Environmental Monitoring Trend Report Reference'], q.map((p, i) => [`${p}, ${y}`, `${['1st', '2nd', '3rd', '4th'][i]} Quarter Environmental Monitoring Trend Report`])), { title: 'Environmental monitoring' }),
        Object.assign(T(['Review Period Dates', 'Water Monitoring Report Reference'], q.map((p, i) => [`${p}, ${y}`, `${['1st', '2nd', '3rd', '4th'][i]} Quarter ${y} Water Quality Report`])), { title: 'Water system' })]; },
    text: () => 'Environmental monitoring: the reports show the bio-burden of process and non-process areas within the acceptable limit.\n\nWater system: the trend reports continue to be satisfactory.\n\nHVAC system: describe the qualification status.' },
  { key: 'trends', title: 'Manufacturing trends', kind: 'auto' },
  { key: 'yield', title: 'Yield / reconciliation limits', kind: 'table', note: 'Not in the system yet: from the batch packaging records.',
    tables: () => [T(['Batch No.', 'Yield Result (%)', 'LSL', 'USL'], [['', '', '95.00', '102.00']])], text: () => 'Discussion: ' },
  { key: 'compliance', title: 'Laboratory QC analytical release testing data review', kind: 'auto' },
  { key: 'capability', title: 'Evaluation of process capability', kind: 'text',
    text: (D, C) => { const s = apqrIncluded(D, C).filter(x => x.st.cpk !== null);
      if (!s.length) return 'No parameter has enough results with a specification limit to calculate a Cpk.';
      return `The process capability of the ${apqrCount((D.batches || []).length)} of ${D.product} for the key quality attributes is presented below.\n\n` + s.map(x => {
        const c = sfix(x.st.cpk, 2), ph = x.st.band === 'capable' ? 'demonstrates capability to consistently meet' : x.st.band === 'marginal' ? 'demonstrates marginal capability to consistently meet' : 'is not capable of consistently meeting';
        return `${seriesLabel(x)}: The Cpk value of ${c} indicates that the process ${ph} the established ${x.name.toLowerCase()} specification.`; }).join('\n'); } },
  { key: 'oos', title: 'Out of specification results', kind: 'auto' },
  { key: 'method_changes', title: 'Changes to analytical methods / specifications', kind: 'auto' },
  { key: 'lab_dev', title: 'Laboratory deviations', kind: 'text', text: D => `There were nil deviations to standard laboratory practice that impacted the analytical testing of ${D.product} during the review period.` },
  { key: 'process_dev', title: 'Process deviations / exceptions', kind: 'text', text: D => `A review of the process deviations recorded for ${D.product} during the review period was conducted. ` },
  { key: 'planned_changes', title: 'Planned process changes', kind: 'text', text: () => 'There were no planned process changes during the review period.' },
  { key: 'regulatory', title: 'New regulatory applications', kind: 'text', text: () => 'There were no new regulatory applications and variations to registered details submitted or granted during the review period.' },
  { key: 'control_changes', title: 'Control of changes', kind: 'text', text: () => 'There were no changes implemented during the review period.' },
  { key: 'rejections', title: 'Batch rejections / reprocess', kind: 'text',
    text: D => { const nr = D.not_released || [];
      return (nr.length ? `Batch rejections: ${nr.length} batch${nr.length > 1 ? 'es were' : ' was'} not released by QC: ${nr.map(x => `${x.batch_no} (${x.stage})`).join(', ')}.` : 'Batch rejections: there were no batch rejections recorded during the review period.') +
        '\n\nBatch reprocessing: there was no batch reprocessing recorded during the review period.'; } },
  { key: 'validation', title: 'Process validation status', kind: 'table', textFirst: true, tables: () => [T(['Report Reference', 'Title'], [['', '']])], text: () => 'Process validation of the product: ' },
  { key: 'retained', title: 'Retained sample examination', kind: 'text',
    text: D => `Samples from all the ${apqrCount((D.batches || []).length)} tested in the review period were retained. The most recent visual inspection of retained samples showed good condition of storage, with no sign of deterioration.` },
  { key: 'complaints', title: 'Complaints, returns and recalls', kind: 'text', text: () => 'Complaints: there was no customer complaint received during the review period.\n\nReturns / recalls: there were no recalls during the review period.' },
  { key: 'vendors', title: 'Technical agreement of vendors', kind: 'table', textFirst: true, tables: () => [T(['Sr. No.', 'Name of Vendor', 'Services Rendered', 'Status'], [['1', '', '', 'Satisfactory']])],
    text: () => 'List of vendors and technical agreement status for the year under review.' },
  { key: 'summary', title: 'Summary and recommendations', kind: 'text', textFirst: true,
    text: (D, C) => { const s = apqrIncluded(D, C).filter(x => x.st.band), g = b => s.filter(x => x.st.band === b).map(x => `${seriesLabel(x)} (Cpk ${sfix(x.st.cpk, 2)})`);
      const cap = g('capable'), mar = g('marginal'), not = g('not');
      return [cap.length ? `The process demonstrated good capability for ${cap.join(', ')}, indicating that these parameters were consistently controlled with adequate margin from their specification limits.` : '',
        mar.length ? `${mar.join(', ')} showed marginal capability, indicating increased process variability and reduced margin to the specification limits.` : '',
        not.length ? `${not.join(', ')} ${not.length > 1 ? 'were' : 'was'} not capable and require${not.length > 1 ? '' : 's'} investigation and corrective action.` : '',
        'The following actions are recommended:'].filter(Boolean).join('\n\n'); },
    tables: (D, C) => { const s = apqrIncluded(D, C).filter(x => x.st.band && x.st.band !== 'capable');
      return [Object.assign(T(['Recommendation', 'Responsibility', 'Timeline'], s.length ? s.map(x => [`Continue trend analysis of ${seriesLabel(x)} and evaluate the causes of its variability.`, 'QA/QC/PRD', `Q2 ${D.year + 1}`]) : [['Continued trend analysis of the key parameters in the next review period.', 'QA', `${D.year + 1}`]]), { title: 'Recommendations (carried into next year\'s review)', recs: true })]; } },
  { key: 'comparison', title: 'Comparison with the previous review', kind: 'auto' },
  { key: 'conclusion', title: 'Conclusion', kind: 'text', text: () => 'Overall, the process demonstrated satisfactory performance for the evaluated parameters. Ongoing trend analysis and adherence to the recommended actions and validated process parameters will support sustained process control and timely identification of any emerging variability.' },
  { key: 'revision', title: 'Revision history', kind: 'table', tables: () => [T(['Document No.', 'Supersedes', 'Revision No.'], [['', '', '00']])] }];

/* ---- calculated blocks (screen and Word use the same rows) ---- */
function apqrBatchRows(D){ return (D.batches || []).map((b, i) => [String(i + 1), D.product, b.batch_no, fmtDate(b.first_at), (b.stages || []).join(', '),
  b.decision === 'released' ? 'Released' : b.decision === 'not_released' ? 'Not released' : 'Not decided yet']); }
const APQR_BATCH_HEAD = ['Sr. No.', 'Product Name', 'Batch Number', 'First tested', 'Stages tested', 'QC decision'];
function apqrSeriesTables(s){
  const st = s.st, dp = spcDp(s.points.map(p => p.value));
  const res = T(['Batch No.', 'Result' + (s.unit ? ` (${s.unit})` : ''), 'Lower Specification Limit (LSL)', 'Upper Specification Limit (USL)'],
    s.points.map(p => [p.batch_no + (p.sample && p.sample !== p.batch_no ? ` (${p.sample})` : ''), String(p.value), s.lo == null ? '--' : String(s.lo), s.hi == null ? '--' : String(s.hi)]));
  const stats = T(['Statistic', 'Value'], [['Std Deviation (s)', sfix(st.sd, dp + 3)], ['Mean', sfix(st.mean, dp + 3)], ...(s.hi != null ? [['Upper Specification Limit (USL)', String(s.hi)]] : []),
    ...(s.lo != null ? [['Lower Specification Limit (LSL)', String(s.lo)]] : []), ['3-sigma Upper', sfix(st.ucl, dp + 2)], ['3-sigma Lower', sfix(st.lcl, dp + 2)], ['RSD (%)', sfix(st.rsd, 2)], ['Cpk', sfix(st.cpk, 2)]]);
  const review = T(['Sr. No.', 'Parameter', 'Acceptance Criteria', 'Result', 'Comment'], spcChecks(st, s.points).map((r, i) => [String(i + 1), ...r]));
  return { res, stats, review, title: (s.source === 'ipqa' ? 'In-process trend result for ' : 'Quality control trend result for ') + seriesLabel(s) };
}
function apqrMicroTable(D){
  const m = trendSeriesAll(D.trends || {}).filter(s => ['tamc', 'tymc'].includes(s.test)); if (!m.length) return null;
  const batches = [...new Set(m.flatMap(s => s.points.map(p => p.batch_no)))];
  const val = (s, b) => { const p = s.points.filter(x => x.batch_no === b); return p.length ? p.map(x => x.value).join(' / ') : '--'; };
  return T(['Batch No.', ...m.map(s => s.name + (s.unit ? ` (${s.unit})` : ''))], batches.map(b => [b, ...m.map(s => val(s, b))]).concat([['Specification', ...m.map(s => s.limit || '--')]]));
}
function apqrComplianceTable(D){
  const s = trendSeriesAll(D.trends || {}).filter(x => x.source === 'qc' && ['assay', 'dissolution', 'content_uniformity'].includes(x.test) && x.stage === 'Finished Product');
  if (!s.length) return null;
  const batches = [...new Set(s.flatMap(x => x.points.map(p => p.batch_no)))];
  const perBatch = (x, b) => { const v = x.points.filter(p => p.batch_no === b).map(p => Number(p.value)); return v.length ? v.reduce((a, c) => a + c, 0) / v.length : null; };
  const dps = s.map(x => spcDp(x.points.map(p => p.value)));
  const rows = batches.map(b => [b, ...s.map((x, i) => sfix(perBatch(x, b), dps[i]))]);
  const col = i => batches.map(b => perBatch(s[i], b)).filter(v => v !== null);
  const agg = (lbl, fn) => [lbl, ...s.map((x, i) => { const c = col(i); return c.length ? sfix(fn(c), dps[i] + (lbl === 'Mean' ? 2 : 0)) : '--'; })];
  return T(['Batch No.', ...s.map(x => `${x.name}: ${x.limit || ''}`)], rows.concat([agg('Minimum', c => Math.min(...c)), agg('Maximum', c => Math.max(...c)), agg('Mean', c => c.reduce((a, v) => a + v, 0) / c.length)]));
}
function apqrComparison(D, C){
  const P = D.previous; if (!P || !P.trends) return null;
  const now = apqrIncluded(D, C), prev = trendSeriesAll(P.trends);
  const rows = [['Number of batches', String(P.batches || '--'), String((D.batches || []).length)]];
  now.filter(s => s.st.cpk !== null).forEach(s => { const p = prev.find(x => x.key === s.key); rows.push([`Cpk: ${seriesLabel(s)}`, p && p.st.cpk !== null ? sfix(p.st.cpk, 2) : '--', sfix(s.st.cpk, 2)]); });
  return T(['Item', `${P.year} APQR`, `${D.year} APQR`], rows);
}

// when last year's review is not in the system: a table QA fills (saved as section "comparison")
function compTables(D){ return secTables({ key: 'comparison', tables: () => [T(['S/N', `${D.year - 1} APQR`, `${D.year} APQR`], [['1', 'No of Batches Produced: ', `No of Batches Produced: ${(D.batches || []).length} Batches`]])] }); }
/* ---- the editor ---- */
function apqrContent(){ return apqrDoc.content; }
function apqrEditable(){ return !!(apqrDoc && apqrDoc.can_edit && (!apqrDoc.review || apqrDoc.review.status !== 'final')); }
function secText(sec){ const c = (apqrContent().sections || {})[sec.key] || {}; return c.text != null ? c.text : sec.text ? sec.text(apqrDoc.data, apqrContent()) : ''; }
function secTables(sec){ const c = (apqrContent().sections || {})[sec.key] || {}, def = sec.tables ? sec.tables(apqrDoc.data, apqrContent()) : [];
  return c.tables ? def.map((t, i) => Object.assign({}, t, c.tables[i] ? { head: c.tables[i].head || t.head, rows: c.tables[i].rows } : {})).concat(c.tables.slice(def.length)) : def; }
function setSec(key, patch){ const c = apqrContent(); c.sections = c.sections || {}; c.sections[key] = Object.assign({}, c.sections[key] || {}, patch); apqrDirty(); }
function apqrDirty(){
  apqrDoc.dirty = true;
  const s = $('#apState'); if (s) s.innerHTML = '<span class="badge b-warn">Not saved</span>';
  try { localStorage.setItem(APQR_LOCAL(apqrKey(apqrDoc.product, apqrDoc.year)), JSON.stringify({ at: new Date().toISOString(), base: apqrDoc.review ? apqrDoc.review.updated_at : null, content: apqrDoc.content })); } catch (e) { /* storage off: the Save button still works */ }
}
function apqrTableHtml(t, edit, path){
  const head = `<tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}${edit ? '<th></th>' : ''}</tr>`;
  const body = t.rows.map((r, ri) => `<tr>${t.head.map((h, ci) => `<td>${edit ? `<input class="inp" style="min-width:90px" data-cell="${esc(path)}|${ri}|${ci}" value="${esc(r[ci] ?? '')}">` : esc(r[ci] ?? '')}</td>`).join('')}
    ${edit ? `<td><button class="btn-icon" title="Remove this row" data-delrow="${esc(path)}|${ri}">${I.x}</button></td>` : ''}</tr>`).join('');
  return `${t.title ? `<h4 style="margin:12px 0 6px">${esc(t.title)}</h4>` : ''}<div class="tbl-wrap"><table class="tbl" style="min-width:0" data-nosort><thead>${head}</thead><tbody>${body}</tbody></table></div>
    ${edit ? `<button class="btn btn-ghost btn-sm" style="margin-top:6px" data-addrow="${esc(path)}">${I.plus} Add a row</button>` : ''}`;
}
function roTable(t, title){ return apqrTableHtml(Object.assign({}, t, title ? { title } : {}), false, ''); }
function apqrAutoHtml(sec){
  const D = apqrDoc.data, C = apqrContent(), edit = apqrEditable();
  if (sec.key === 'batches'){ const r = apqrBatchRows(D); return r.length ? roTable(T(APQR_BATCH_HEAD, r)) + `<p class="small" style="margin-top:8px">${apqrCount(r.length)} of ${esc(D.product)} were tested during the review period of ${D.year}.</p>`
    : emptyState('doc', 'No batches in the system for this year', ''); }
  if (sec.key === 'trends'){
    const all = apqrSeries(D), ex = new Set(C.exclude || []);
    const pick = all.length ? `<details ${edit ? 'open' : ''} style="margin-bottom:10px"><summary class="small strong">Parameters in this review (${all.filter(s => !ex.has(s.key)).length} of ${all.length})</summary>
      <div class="grid g2" style="margin-top:8px">${all.map(s => `<label class="row small" style="gap:8px"><input type="checkbox" data-series="${esc(s.key)}" ${ex.has(s.key) ? '' : 'checked'} ${edit ? '' : 'disabled'}>
        ${esc(s.source === 'ipqa' ? 'IPQA' : 'QC')}: ${esc(seriesLabel(s))} <span class="muted">(${s.st.n})</span></label>`).join('')}</div></details>` : emptyState('chart', 'No results in the system for this year', '');
    const blocks = apqrIncluded(D, C).map(s => { const t = apqrSeriesTables(s);
      return `<div style="border-top:1px solid var(--line);padding-top:12px;margin-top:12px"><h4 style="margin:0 0 6px">${esc(t.title)}</h4>
        <div class="grid g2" style="align-items:start"><div>${roTable(t.res)}</div><div>${roTable(t.stats)}</div></div>
        <div style="margin-top:10px">${spcChartSvg(s.points, s.st)}</div>${roTable(t.review, 'Review of the control chart')}</div>`; }).join('');
    const micro = apqrMicroTable(D);
    return pick + blocks + (micro ? `<div style="border-top:1px solid var(--line);padding-top:12px;margin-top:12px">${roTable(micro, 'Quality control trend result for MLT (microbial limit test)')}</div>` : '');
  }
  if (sec.key === 'compliance'){ const t = apqrComplianceTable(D);
    return `<p class="small">${apqrCount((D.batches || []).length)} of ${esc(D.product)} were tested during the review period.</p>` + (t ? roTable(t, 'Compliance to specification (finished product, mean of each batch)') : '<p class="small muted">No finished product QC results in the system for this year.</p>'); }
  if (sec.key === 'oos'){ const o = D.oos || [];
    return o.length ? roTable(T(['Batch', 'Test', 'Result', 'Limit', 'Status', 'Outcome / reference'], o.map(x => [x.batch_no, `${qcTestName(x.test)} ${x.api || ''} ${x.sample || ''}`.trim(), `${x.value ?? '--'} ${x.unit || ''}`, x.limit_text || '', x.status || '', [x.outcome, x.reference].filter(Boolean).join(' - ')])))
      : '<p class="small">No Out-of-Specification (OOS) results were recorded during the review period. All analytical test results obtained were within the established specifications.</p>'; }
  if (sec.key === 'method_changes'){ const m = D.method_changes || [];
    return m.length ? roTable(T(['Test', 'API', 'Version', 'Method / specification', 'Change', 'Approved'], m.map(x => [qcTestName(x.test), x.api, 'v' + x.version, [x.method_ref, x.spec_ref].filter(Boolean).join(' / '), x.change_note || '', fmtDate(x.approved_at)])))
      : '<p class="small">There were no changes to analytical test methods or specifications during the review period.</p>'; }
  if (sec.key === 'comparison'){ const t = apqrComparison(D, C);
    return t ? roTable(t) : `<p class="small muted">There is no ${D.year - 1} review of ${esc(D.product)} in the system. Write the comparison below if you have last year's figures.</p>`; }
  return '';
}
function apqrSectionHtml(sec, i){
  const edit = apqrEditable(), D = apqrDoc.data, c = (apqrContent().sections || {})[sec.key] || {};
  let body = sec.note ? `<div class="small muted" style="margin-bottom:8px">${esc(sec.note)}</div>` : '';
  if (sec.kind === 'auto'){
    body += apqrAutoHtml(sec);
    if (sec.key === 'comparison' && !apqrComparison(D, apqrContent())) body += apqrTableHtml(compTables(D)[0], edit, sec.key + '|0');
  } else {
    let tb = '', tx = '';
    if (sec.tables) secTables(sec).forEach((t, ti) => { tb += apqrTableHtml(t, edit, sec.key + '|' + ti); });
    if (sec.text){
      const txt = secText(sec), calc = c.text != null && sec.text;
      tx = edit ? `<textarea class="inp" rows="${Math.min(14, Math.max(3, txt.split('\n').length + 1))}" style="margin-top:10px;width:100%" data-text="${esc(sec.key)}">${esc(txt)}</textarea>
          ${calc ? `<button class="btn btn-ghost btn-sm" style="margin-top:4px" data-reset="${esc(sec.key)}">${I.undo} Use the calculated text again</button>` : ''}`
        : `<div class="small" style="margin-top:10px;white-space:pre-wrap">${esc(txt)}</div>`;
    }
    body += sec.textFirst ? tx + tb : tb + tx;
  }
  return `<div class="card" style="margin-bottom:14px" id="ap-sec-${sec.key}"><div class="card-h"><div><h3>${i + 1}. ${esc(sec.title)}</h3>
    <div class="sub">${sec.kind === 'auto' ? 'Calculated by the system' : sec.text && sec.text.length && sec.kind === 'text' ? 'Written by QA (first draft from the system)' : 'Written by QA'}</div></div></div><div class="card-b">${body}</div></div>`;
}
function tableAt(path){
  const [key, ti] = path.split('|'), sec = APQR_SECTIONS.find(s => s.key === key) || { key, tables: () => [] };
  const ts = key === 'comparison' ? compTables(apqrDoc.data) : secTables(sec);
  return { key, ti: Number(ti), ts };
}
function saveTables(key, ts){ setSec(key, { tables: ts.map(t => ({ head: t.head, rows: t.rows })) }); }
function rerenderSection(key){
  const i = APQR_SECTIONS.findIndex(s => s.key === key), el = $('#ap-sec-' + key); if (i < 0 || !el) return;
  el.outerHTML = apqrSectionHtml(APQR_SECTIONS[i], i); bindApqrEditor();
}
function bindApqrEditor(){
  $$('[data-cell]').forEach(inp => inp.oninput = () => { const [k, ti, ri, ci] = inp.getAttribute('data-cell').split('|'), a = tableAt(k + '|' + ti);
    const ts = a.ts.map(t => ({ head: t.head.slice(), rows: t.rows.map(r => r.slice()), title: t.title })); ts[a.ti].rows[Number(ri)][Number(ci)] = inp.value; saveTables(k, ts); });
  $$('[data-addrow]').forEach(b => b.onclick = () => { const a = tableAt(b.getAttribute('data-addrow')), ts = a.ts.map(t => ({ head: t.head.slice(), rows: t.rows.map(r => r.slice()), title: t.title }));
    ts[a.ti].rows.push(ts[a.ti].head.map((h, i) => /^(Sr\. ?No\.?|S\/N)$/i.test(h) && i === 0 ? String(ts[a.ti].rows.length + 1) : '')); saveTables(a.key, ts); rerenderSection(a.key); });
  $$('[data-delrow]').forEach(b => b.onclick = () => { const p = b.getAttribute('data-delrow').split('|'), a = tableAt(p[0] + '|' + p[1]), ts = a.ts.map(t => ({ head: t.head.slice(), rows: t.rows.map(r => r.slice()), title: t.title }));
    ts[a.ti].rows.splice(Number(p[2]), 1); saveTables(a.key, ts); rerenderSection(a.key); });
  $$('[data-text]').forEach(t => t.oninput = () => setSec(t.getAttribute('data-text'), { text: t.value }));
  $$('[data-reset]').forEach(b => b.onclick = () => { const k = b.getAttribute('data-reset'); const c = apqrContent(); if (c.sections && c.sections[k]) delete c.sections[k].text; apqrDirty(); rerenderSection(k); });
  $$('[data-series]').forEach(cb => cb.onchange = () => { const c = apqrContent(), ex = new Set(c.exclude || []), k = cb.getAttribute('data-series');
    if (cb.checked) ex.delete(k); else ex.add(k); c.exclude = [...ex]; apqrDirty(); ['trends', 'rationale', 'capability', 'summary', 'comparison'].forEach(rerenderSection); });
}
function loadApqr(product, year){
  const k = apqrKey(product, year);
  if (apqrLoading === k) return;
  apqrLoading = k;
  apqrApi({ action: 'get', product, year }).then(d => {
    if (d.error) throw new Error(d.error);
    apqrDoc = { product, year: Number(year), data: d.data, review: d.review, can_edit: !!d.can_edit, content: JSON.parse(JSON.stringify((d.review && d.review.content) || {})), dirty: false, local: null };
    try { const l = JSON.parse(localStorage.getItem(APQR_LOCAL(k)) || 'null');
      if (l && l.content && (l.base || null) === (d.review ? d.review.updated_at : null) && JSON.stringify(l.content) !== JSON.stringify(apqrDoc.content)) apqrDoc.local = l;
      else if (l) localStorage.removeItem(APQR_LOCAL(k)); } catch (e) { /* no storage */ }
  }).catch(e => { apqrDoc = { product, year: Number(year), error: e.message }; }).finally(() => { apqrLoading = ''; render(); });
}
function viewApqr(year, product){
  if (!apqrDoc || apqrDoc.product !== product || apqrDoc.year !== Number(year)){ loadApqr(product, year);
    return { title: 'Annual product review', crumb: 'Records', html: pageHead(`APQR: ${product} ${year}`, '') + `<div class="card"><div class="card-b">${emptyState('doc', 'Loading...', 'Gathering the year\'s results.')}</div></div>` }; }
  if (apqrDoc.error) return { title: 'Annual product review', crumb: 'Records', html: pageHead(`APQR: ${product} ${year}`, '') + `<div class="card"><div class="card-b">${emptyState('alert', 'Could not load', esc(apqrDoc.error), `<button class="btn btn-ghost" onclick="apqrDoc=null;render()">Try again</button>`)}</div></div>` };
  const R = apqrDoc.review, fin = R && R.status === 'final', edit = apqrEditable();
  const actions = `<button class="btn btn-ghost" onclick="go('/apqr')">${I.chevL} All reviews</button>
    ${edit ? `<button class="btn btn-primary" id="apSave">${I.check} Save</button>` : ''}
    <button class="btn btn-ghost" id="apWord">${I.download} Download Word</button>
    ${apqrDoc.can_edit ? (fin ? `<button class="btn btn-ghost" id="apReopen">${I.undo} Reopen</button>` : `<button class="btn btn-ghost" id="apFinal">${I.lock} Make final</button>`) : ''}`;
  const status = `<div class="card" style="margin-bottom:14px"><div class="card-b row between" style="gap:10px;flex-wrap:wrap">
      <div class="small"><span id="apState">${fin ? '<span class="badge b-ok">Final</span>' : R ? '<span class="badge b-warn">Draft</span>' : '<span class="badge b-slate">Not saved yet</span>'}</span>
        ${R ? ` Last saved by ${esc(R.updated_by || '')}, ${fmtDateTime(R.updated_at)}` : ''}${fin ? ` - made final by ${esc(R.finalised_by || '')}, ${fmtDateTime(R.finalised_at)}: the figures are frozen as they were then.` : ' - the figures are live: they change as results are added until the review is made final.'}</div>
      ${edit ? `<div class="field" style="margin:0;min-width:220px"><label for="apDocNo" class="tiny">Document No.</label><input class="inp" id="apDocNo" value="${esc(apqrContent().doc_no || '')}" placeholder="e.g. OKL/APQR/51001/26"></div>` : apqrContent().doc_no ? `<span class="small mono">${esc(apqrContent().doc_no)}</span>` : ''}</div></div>
    ${apqrDoc.local ? `<div class="notice" style="margin-bottom:14px">${I.info} <span>Changes made on this computer on ${fmtDateTime(apqrDoc.local.at)} were not saved. <button class="btn btn-ghost btn-sm" id="apRestore">Bring them back</button> <button class="btn btn-ghost btn-sm" id="apDiscard">Discard them</button></span></div>` : ''}`;
  const toc = `<div class="card" style="margin-bottom:14px"><div class="card-b small" style="columns:2 220px">${APQR_SECTIONS.map((s, i) => `<div><a href="javascript:void(0)" data-goto="${s.key}">${i + 1}. ${esc(s.title)}</a>${s.kind === 'auto' ? ' <span class="tiny muted">(system)</span>' : ''}</div>`).join('')}</div></div>`;
  return { title: 'Annual product review', crumb: 'Records',
    html: pageHead(`APQR: ${esc(product)} ${esc(year)}`, `Annual Product Quality Review, January to December ${esc(year)}.`, actions) + status + toc + APQR_SECTIONS.map((s, i) => apqrSectionHtml(s, i)).join(''),
    bind(){
      bindApqrEditor();
      $$('[data-goto]').forEach(a => a.onclick = () => { const el = $('#ap-sec-' + a.getAttribute('data-goto')); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      const dn = $('#apDocNo'); if (dn) dn.oninput = () => { apqrContent().doc_no = dn.value; apqrDirty(); };
      const rs = $('#apRestore'); if (rs) rs.onclick = () => { apqrDoc.content = apqrDoc.local.content; apqrDoc.local = null; apqrDoc.dirty = true; render(); };
      const dc = $('#apDiscard'); if (dc) dc.onclick = () => { try { localStorage.removeItem(APQR_LOCAL(apqrKey(product, year))); } catch (e) { /* none */ } apqrDoc.local = null; render(); };
      const sv = $('#apSave'); if (sv) sv.onclick = () => apqrSend('save');
      const fi = $('#apFinal'); if (fi) fi.onclick = async () => { if (await confirmDialog('Make this review final?', 'The figures are frozen as they are now and the text can no longer be changed (QA can reopen it with a reason). Signatures are still made on the printed copy.', 'Make final')) apqrSend('final'); };
      const ro = $('#apReopen'); if (ro) ro.onclick = () => openModal({ title: 'Reopen this review', size: 'narrow', body: `<div class="field"><label for="apWhy">Why does it need to change?</label><textarea class="inp" id="apWhy" rows="3"></textarea></div>`,
        footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="apWhyOk">Reopen</button>`,
        onMount: (w, close) => { $('#apWhyOk', w).onclick = () => { const r = $('#apWhy', w).value.trim(); if (!r) return toast('A reason is needed', '', 'err'); close(); apqrSend('reopen', r); }; } });
      const wd = $('#apWord'); if (wd) wd.onclick = () => apqrWord().catch(e => toast('Could not make the Word file', e.message, 'err'));
    } };
}
async function apqrSend(action, reason){
  const body = { action, product: apqrDoc.product, year: apqrDoc.year, reason: reason || '' };
  if (action !== 'reopen'){
    const sum = APQR_SECTIONS.find(s => s.key === 'summary');
    apqrContent().recs = ((secTables(sum)[0] || {}).rows || []).filter(r => (r[0] || '').trim());   // next year's "Review of actions from preceding review"
    body.content = apqrContent(); if (apqrDoc.review) body.updated_at = apqrDoc.review.updated_at;
  }
  try {
    const r = await apqrApi(body); if (r.error) throw new Error(r.error);
    try { localStorage.removeItem(APQR_LOCAL(apqrKey(apqrDoc.product, apqrDoc.year))); } catch (e) { /* none */ }
    toast(action === 'final' ? 'The review is final' : action === 'reopen' ? 'The review is open again' : 'Saved', '', 'ok');
    apqrList = null; const p = apqrDoc.product, y = apqrDoc.year; apqrDoc = null; loadApqr(p, y);
  } catch (e) { toast('Not saved', e.message, 'err'); }
}
window.addEventListener('beforeunload', e => { if (apqrDoc && apqrDoc.dirty){ e.preventDefault(); e.returnValue = ''; } });

/* ---- Word (docx 8.5.0 from jsDelivr, loaded only here) ---- */
const DOCX_URL = 'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js';
let docxLoading = null;
function loadDocx(){
  if (window.docx) return Promise.resolve(window.docx);
  if (!docxLoading) docxLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = DOCX_URL; s.onload = () => (window.docx ? res(window.docx) : rej(new Error('the Word library did not load')));
    s.onerror = () => { docxLoading = null; rej(new Error('the Word library could not be downloaded; check the connection')); }; document.head.appendChild(s); });
  return docxLoading;
}
function svgToPng(svg, w, h){
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    img.onload = () => { const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const g = c.getContext('2d'); g.scale(2, 2); g.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
      c.toBlob(b => (b ? b.arrayBuffer().then(res) : rej(new Error('chart'))), 'image/png'); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('could not draw a chart')); };
    img.src = url;
  });
}
async function apqrWord(){
  const btn = $('#apWord'); if (btn){ btn.disabled = true; btn.textContent = 'Preparing...'; }
  try {
    const X = await loadDocx(), D = apqrDoc.data, C = apqrContent(), P = apqrDoc.product, Y = apqrDoc.year;
    const font = 'Arial', border = { style: X.BorderStyle.SINGLE, size: 4, color: '999999' }, borders = { top: border, bottom: border, left: border, right: border };
    const run = (t, o) => new X.TextRun(Object.assign({ text: String(t == null ? '' : t), font, size: 20 }, o || {}));
    const para = (t, o) => String(t || '').split('\n').filter(l => l.trim()).map(l => new X.Paragraph(Object.assign({ children: [run(l)], spacing: { after: 100 } }, o || {})));
    const h1 = (n, t) => new X.Paragraph({ children: [run(`${n}. ${t.toUpperCase()}`, { bold: true, size: 24, color: 'C2410C' })], heading: X.HeadingLevel.HEADING_1, spacing: { before: 280, after: 120 } });
    const h2 = t => new X.Paragraph({ children: [run(t, { bold: true, size: 21 })], heading: X.HeadingLevel.HEADING_2, spacing: { before: 160, after: 80 } });
    const table = t => new X.Table({ width: { size: 100, type: X.WidthType.PERCENTAGE }, rows: [
      new X.TableRow({ tableHeader: true, children: t.head.map(h => new X.TableCell({ borders, shading: { type: X.ShadingType.CLEAR, fill: 'F2E3D5', color: 'auto' }, children: [new X.Paragraph({ children: [run(h, { bold: true, size: 18 })] })] })) }),
      ...t.rows.map(r => new X.TableRow({ children: t.head.map((h, i) => new X.TableCell({ borders, children: [new X.Paragraph({ children: [run(r[i] ?? '', { size: 18 })] })] })) }))] });
    const gap = () => new X.Paragraph({ children: [], spacing: { after: 80 } });
    const kids = [];
    // cover
    kids.push(new X.Paragraph({ children: [], spacing: { before: 1800 } }),
      ...['ANNUAL PRODUCT QUALITY REVIEW', 'REPORT', 'of', P.toUpperCase()].map((t, i) => new X.Paragraph({ alignment: X.AlignmentType.CENTER, spacing: { after: 160 }, children: [run(t, { bold: i !== 2, size: i === 3 ? 40 : 32 })] })),
      new X.Paragraph({ alignment: X.AlignmentType.CENTER, spacing: { before: 400, after: 160 }, children: [run(`Review Period: January - December, ${Y}`, { size: 24 })] }),
      new X.Paragraph({ alignment: X.AlignmentType.CENTER, children: [run('ORANGE KALBE LIMITED, LAGOS.', { bold: true, size: 24 })] }),
      ...(C.doc_no ? [new X.Paragraph({ alignment: X.AlignmentType.CENTER, spacing: { before: 200 }, children: [run('Document No.: ' + C.doc_no, { size: 20 })] })] : []),
      new X.Paragraph({ children: [new X.PageBreak()] }));
    for (let i = 0; i < APQR_SECTIONS.length; i++){
      const sec = APQR_SECTIONS[i]; kids.push(h1(i + 1, sec.title));
      if (sec.kind !== 'auto'){
        const tw = [], xw = sec.text ? para(secText(sec)) : [];
        secTables(sec).forEach(t => { if (t.title) tw.push(h2(t.title)); tw.push(table(t), gap()); });
        kids.push(...(sec.textFirst ? xw.concat(tw) : tw.concat(xw)));
        continue;
      }
      if (sec.key === 'batches'){ const r = apqrBatchRows(D); if (r.length) kids.push(table(T(APQR_BATCH_HEAD, r)), gap()); kids.push(...para(`${apqrCount(r.length)} of ${P} were tested during the review period of ${Y}.`)); }
      if (sec.key === 'trends'){
        const inc = apqrIncluded(D, C);
        if (!inc.length) kids.push(...para('No results in the system for this year.'));
        const ip = inc.filter(s => s.source === 'ipqa'), qc = inc.filter(s => s.source === 'qc');
        for (const [hd, list] of [['In-process controls', ip], ['Quality control', qc]]){
          if (!list.length) continue; kids.push(h2(hd));
          for (const s of list){
            const t = apqrSeriesTables(s); kids.push(h2(t.title), table(t.res), gap(), table(t.stats), gap());
            const W = 760, H = 280, png = await svgToPng(spcChartSvg(s.points, s.st, { colors: CHART_PRINT, px: true, w: W, h: H }), W, H);
            kids.push(new X.Paragraph({ children: [new X.ImageRun({ data: png, transformation: { width: 600, height: Math.round(600 * H / W) } })] }),
              new X.Paragraph({ children: [run(`Control chart for ${P}: ${seriesLabel(s)}`, { italics: true, size: 18 })], spacing: { after: 120 } }),
              h2('Review of the control chart'), table(t.review), gap());
          }
        }
        const m = apqrMicroTable(D); if (m) kids.push(h2('Quality control trend result for MLT (microbial limit test)'), table(m), gap());
      }
      if (sec.key === 'compliance'){ const t = apqrComplianceTable(D); kids.push(...para(`${apqrCount((D.batches || []).length)} of ${P} were tested during the review period.`));
        if (t) kids.push(h2('Compliance to specification'), table(t), gap()); }
      if (sec.key === 'oos'){ const o = D.oos || [];
        if (o.length) kids.push(table(T(['Batch', 'Test', 'Result', 'Limit', 'Status', 'Outcome / reference'], o.map(x => [x.batch_no, `${qcTestName(x.test)} ${x.api || ''} ${x.sample || ''}`.trim(), `${x.value ?? '--'} ${x.unit || ''}`, x.limit_text || '', x.status || '', [x.outcome, x.reference].filter(Boolean).join(' - ')]))), gap());
        else kids.push(...para('No Out-of-Specification (OOS) results were recorded during the review period. All analytical test results obtained were within the established specifications.')); }
      if (sec.key === 'method_changes'){ const m = D.method_changes || [];
        if (m.length) kids.push(table(T(['Test', 'API', 'Version', 'Method / specification', 'Change', 'Approved'], m.map(x => [qcTestName(x.test), x.api, 'v' + x.version, [x.method_ref, x.spec_ref].filter(Boolean).join(' / '), x.change_note || '', fmtDate(x.approved_at)]))), gap());
        else kids.push(...para('There were no changes to analytical test methods or specifications during the review period.')); }
      if (sec.key === 'comparison'){ const t = apqrComparison(D, C);
        if (t) kids.push(table(t), gap());
        else compTables(D).forEach(x => kids.push(table(x), gap())); }
    }
    const footer = new X.Footer({ children: [new X.Paragraph({ alignment: X.AlignmentType.CENTER, children: [run(`${C.doc_no ? C.doc_no + '   -   ' : ''}APQR ${P} ${Y}   -   Page `, { size: 16 }), new X.TextRun({ children: [X.PageNumber.CURRENT], font, size: 16 }),
      run(' of ', { size: 16 }), new X.TextRun({ children: [X.PageNumber.TOTAL_PAGES], font, size: 16 })] })] });
    const doc = new X.Document({ creator: 'QSync', title: `APQR ${P} ${Y}`, styles: { default: { document: { run: { font, size: 20 } } } },
      sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } }, footers: { default: footer }, children: kids }] });
    const blob = await X.Packer.toBlob(doc), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `APQR ${P} ${Y}${apqrDoc.review && apqrDoc.review.status === 'final' ? '' : ' (draft)'}.docx`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  } finally { if (btn){ btn.disabled = false; btn.innerHTML = `${I.download} Download Word`; } }
}

route('/apqr', () => viewApqrList());
route('/apqr/:year/*product', p => viewApqr(p.year, p.product));
