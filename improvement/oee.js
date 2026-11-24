"use strict";
/* =====================================================================================
   OEE (migration 101, user 24 Nov 2026): Process Improvement > OEE.
   The monthly "Machine Hours & OEE <Month> <Year> REPORT.xlsx" workbooks are read HERE in the browser (SheetJS) and
   stored as they are (one row per batch run, its lost minutes per reason). OEE, the trend and the Pareto are worked out
   below from those rows and the names list (reason -> category, machine -> stage + group, product -> Solid/Liquid).
   Two templates: up to Jul 2026 three header rows (codes / section / reason) and one "Down Time" block (the names list
   says Machine or Operational); from Aug 2026 a section row above one header row, Down Time split by the file itself.
   tests: workflow/tests/oee_reader_test.js reads every workbook with this file (node).
   ===================================================================================== */

/* ---------------- Reader (no browser needed) ---------------- */
const OEE_SHEET = { Granulation: ['Granulation/Mixing', 'Granulation'], Compression: ['Compression', 'Compression'], Stripping: ['Primary Packaging', 'Stripping'],
  Blistering: ['Primary Packaging', 'Blistering'], Sachetting: ['Primary Packaging', 'Sachetting'], 'Secondary Packaging': ['Secondary Packaging', 'Cartoning'] };
const OEE_STAGES = ['Granulation/Mixing', 'Compression', 'Primary Packaging', 'Secondary Packaging'];
const OEE_IDS = { 'Date': 'date', 'Product': 'product', 'Batch Number': 'batch', 'Machine Name': 'machine' };
const OEE_METRIC = { 'Available Time': 'available', 'Production Total': 'produced', 'Speed': 'speed', 'Total Defect': 'defect', 'Total Finished Goods (Good Output)': 'good' };
const OEE_SEC = { 'IDLE': 'I', 'Planned Shutdown': 'P', 'Down Time': 'D', 'OPERATIONAL DOWNTIME': 'O', 'MACHINE DOWNTIME': 'M' };
const OEE_NOT_REASON = /^(Working Time|Planned Working|Operation Time|Availability|Output Theory|Performance Efficiency|Yield Product|O\.E\.E\.|MTBF|MTTR|Note|Total Unplanned Downtime|Total (Machine )?Breakdown)$/;
const OEE_MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

const oeeClean = v => v == null ? '' : String(v).replace(/\s+/g, ' ').trim();
const oeeKey = v => oeeClean(v).toLowerCase();
const oeeNum = v => typeof v === 'number' && isFinite(v) ? v : (typeof v === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(v) ? +v : 0);
function oeeDay(v){
  if (typeof v === 'number' && v > 30000 && v < 80000) return new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000).toISOString().slice(0, 10);
  if (v instanceof Date && !isNaN(v)) return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate())).toISOString().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(oeeClean(v));
  return m ? m[0] : '';
}
// rows = one sheet as arrays of cells (SheetJS header:1) -> { runs, fmt } or { error }
function oeeReadRows(rows, sheet){
  const cell = (r, j) => (rows[r] && rows[r][j] !== undefined ? rows[r][j] : null);
  let h = -1;
  for (let i = 0; i < Math.min(rows.length, 40) && h < 0; i++) if ((rows[i] || []).some(v => oeeClean(v) === 'Date')) h = i;
  if (h < 0) return { error: 'no "Date" heading in the first 40 rows' };
  const width = Math.max(...rows.slice(Math.max(0, h - 1), h + 3).map(r => (r || []).length));
  const dateCol = (rows[h] || []).findIndex(v => oeeClean(v) === 'Date');
  const fresh = oeeDay(cell(h + 1, dateCol)) !== '';          // Aug 2026 template: data straight under the one header row
  const cols = []; let cur = null;
  for (let j = 0; j < width; j++){
    const idv = oeeClean(cell(h, j));
    if (OEE_IDS[idv]) { cols.push({ j, id: OEE_IDS[idv] }); cur = null; continue; }
    if (fresh){
      const s = oeeClean(cell(h - 1, j));
      if (OEE_SEC[s]) cur = OEE_SEC[s];
      if (OEE_METRIC[idv]) { cols.push({ j, metric: OEE_METRIC[idv] }); cur = null; continue; }
      if (OEE_NOT_REASON.test(idv)) { cur = null; continue; }
      if (cur && idv) cols.push({ j, sec: cur, reason: idv });
    } else {
      const c = oeeClean(cell(h + 1, j)), r = oeeClean(cell(h + 2, j));
      if (c){
        if (OEE_METRIC[c]) { cols.push({ j, metric: OEE_METRIC[c] }); cur = null; continue; }
        if (OEE_SEC[c]) cur = OEE_SEC[c]; else { cur = null; continue; }
      }
      if (!cur || !r || r[0] === '(' || OEE_NOT_REASON.test(r) || !isNaN(+r) || /^[A-Z]'?(\s*-\s*[A-Z])?$/.test(r)) continue;
      cols.push({ j, sec: cur, reason: r });
    }
  }
  const runs = [];
  for (let i = h + 1; i < rows.length; i++){
    const date = oeeDay(cell(i, dateCol));
    if (!date) continue;
    const run = { sheet, date, product: '', batch: '', machine: '', available: 0, produced: 0, speed: 0, good: 0, defect: 0, losses: {} };
    for (const c of cols){
      const v = cell(i, c.j);
      if (c.id && c.id !== 'date') run[c.id] = oeeClean(v);
      else if (c.metric) run[c.metric] = oeeNum(v);
      else if (c.sec){ const n = oeeNum(v); if (n > 0){ const k = c.sec + '|' + c.reason; run.losses[k] = (run.losses[k] || 0) + n; } }
    }
    runs.push(run);
  }
  return { runs, fmt: fresh ? 'Aug 2026 template' : 'old template' };
}
// the month of a workbook: from its name ("... OEE September 2026 REPORT"), else the month most of its rows are in
function oeeMonthOf(fileName, runs){
  const m = /OEE\s+([A-Za-z]+)\s+(\d{4})/i.exec(fileName || '');
  if (m && OEE_MON[m[1].slice(0, 3).toLowerCase()]) return m[2] + '-' + String(OEE_MON[m[1].slice(0, 3).toLowerCase()]).padStart(2, '0') + '-01';
  const c = {}; (runs || []).forEach(r => { c[r.date.slice(0, 7)] = (c[r.date.slice(0, 7)] || 0) + 1; });
  const best = Object.keys(c).sort((a, b) => c[b] - c[a])[0];
  return best ? best + '-01' : '';
}
// a SheetJS workbook -> { month, file_name, runs, sheets: {name: runs}, fmt: {name: template}, skipped: [text] }
function oeeReadBook(XLSX, wb, fileName){
  const out = { file_name: fileName, runs: [], sheets: {}, fmt: {}, skipped: [] };
  for (const name of wb.SheetNames){
    if (/summary/i.test(name)) continue;
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: null, blankrows: true });
    const r = oeeReadRows(rows, name.trim());
    if (r.error) { out.skipped.push(name + ': ' + r.error); continue; }
    out.sheets[name.trim()] = r.runs.length; out.fmt[name.trim()] = r.fmt; out.runs.push(...r.runs);
  }
  out.month = out.runs.length ? oeeMonthOf(fileName, out.runs) : '';   // nothing read (e.g. Excel's ~$ lock file): not uploaded
  return out;
}

/* ---------------- Calculation (no browser needed) ---------------- */
// names = [[kind, raw, value, grp, sub]] -> lookup; a spelling that differs only by capitals, spaces or punctuation
// is the same name (user 24 Nov 2026: "Medik55" is Medik 55)
const oeeCompact = v => oeeKey(v).replace(/[^a-z0-9]/g, '');
function oeeNames(list){
  const N = { reason: {}, machine: {}, product: {}, c: { reason: {}, machine: {}, product: {} } };
  (list || []).forEach(([k, raw, value, grp, sub]) => { if (N[k]) { N[k][raw] = { raw, value, grp, sub }; N.c[k][oeeCompact(raw)] = N.c[k][oeeCompact(raw)] || N[k][raw]; } });
  N.get = (kind, v) => { const k = oeeKey(v); return k ? (N[kind][k] || N.c[kind][oeeCompact(k)] || null) : null; };
  return N;
}
// one stored run [id, sheet, date, product, batch, machine, available, produced, speed, good, defect, losses] -> worked out
function oeeCalcRun(a, N){
  const [id, sheet, date, prod, batch, mach, av, pd, sp, gd, df, L] = a;
  const st = OEE_SHEET[sheet] || ['Secondary Packaging', sheet];
  const mk = oeeKey(mach), pk = oeeKey(prod);
  const m = mk ? N.get('machine', mk) : { value: '(no name: ' + st[1] + ')', grp: st[0], sub: st[1] };
  const p = pk ? N.get('product', pk) : { value: '(no product)', grp: 'Solid' };
  const r = { id, sheet, date, month: String(date).slice(0, 7), batch: batch || '', rawMachine: mach || '', rawProduct: prod || '',
    machine: m ? m.value : oeeClean(mach), stage: m ? m.grp : st[0], sub: m ? m.sub : st[1], product: p ? p.value : oeeClean(prod), type: p ? p.grp : 'Solid',
    skip: !!(p && p.grp === 'Skip'), unknown: [], av: +av || 0, prod: +pd || 0, speed: +sp || 0, good: +gd || 0, def: +df || 0, idle: 0, planned: 0, ops: 0, mach: 0, stops: 0, un: [] };
  if (!m) r.unknown.push(['machine', mk, mach, sheet]);
  if (!p) r.unknown.push(['product', pk, prod, sheet]);
  for (const k of Object.keys(L || {})){
    const sec = k[0], reason = k.slice(2), v = +L[k] || 0;
    if (v <= 0) continue;
    if (sec === 'I') { r.idle += v; continue; }
    if (sec === 'P') { r.planned += v; continue; }
    let cat = sec === 'M' ? 'Machine' : 'Operational';
    if (sec === 'D'){
      const n = N.get('reason', reason);
      if (!n) r.unknown.push(['reason', oeeKey(reason), reason, sheet]);
      cat = n && n.grp === 'Machine' ? 'Machine' : 'Operational';   // a planned item over its time in the Down Time block = operational
    }
    if (cat === 'Machine') { r.mach += v; r.stops++; } else r.ops += v;
    r.un.push([cat, reason, v, oeeCompact(reason)]);   // [category, as written, minutes, one key for every spelling]
  }
  r.pw = r.av - r.idle - r.planned;
  r.op = Math.max(0, r.pw - r.ops - r.mach);
  r.theory = r.speed * r.op;
  r.capped = r.theory > 0 ? Math.min(r.prod, r.theory) : 0;
  r.flag = r.theory > 0 && r.prod > r.theory;        // over 100%: counted as 100% (user, 24 Nov 2026)
  r.perf = r.theory > 0 ? r.prod / r.theory : null;
  return r;
}
// a set of runs -> sums and A, P, Q, OEE (time-weighted)
function oeeSum(runs){
  const s = { n: 0, pw: 0, op: 0, theory: 0, capped: 0, good: 0, def: 0, ops: 0, mach: 0, stops: 0, flagged: 0 };
  for (const r of runs){
    s.n++; s.pw += r.pw; s.op += r.op; s.ops += r.ops; s.mach += r.mach; s.stops += r.stops; s.flagged += r.flag ? 1 : 0;
    if (r.theory > 0) { s.theory += r.theory; s.capped += r.capped; }
    s.good += r.good; s.def += r.def;
  }
  s.A = s.pw > 0 ? s.op / s.pw : null;
  s.P = s.theory > 0 ? s.capped / s.theory : null;
  s.Q = s.good + s.def > 0 ? s.good / (s.good + s.def) : null;
  s.OEE = s.A != null && s.P != null ? s.A * s.P * (s.Q == null ? 1 : s.Q) : null;
  s.MTBF = s.stops ? s.op / s.stops : null;
  s.MTTR = s.stops ? s.mach / s.stops : null;
  return s;
}
if (typeof module !== 'undefined') module.exports = { oeeReadRows, oeeReadBook, oeeMonthOf, oeeNames, oeeCalcRun, oeeSum, oeeCompact };

/* ---------------- Pages (browser only) ----------------
   Menu: Downtime > OEE dashboard (tabs Summary, Trend by month, Downtime analysis, Logs; Upload at the top) and
   Settings (tabs Downtime reasons, Machines, Products, RCA rules). One filter bar for every dashboard tab. */
if (typeof route === 'function') (function(){
const COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];   // dataviz palette, fixed order
const OTHER = '#9a9a92', C_MACH = COLORS[0], C_OPS = COLORS[1];
const OEE = { d: null, err: '', loading: false, all: [], runs: [], N: null, rname: {},
  f: { from: '', to: '', stage: OEE_STAGES.filter(s => s !== 'Granulation/Mixing'), sub: [], machine: [], product: [], type: [] },   // [] = all
  by: 'stage', split: '', per: 'month', bEnd: '', bN: 10, bT: null, chart: 'pareto', pareto: 'all', ms: null, logQ: '', logOver: false, up: null, setQ: '', setCat: '', setStage: '' };
const pct = v => v == null ? '–' : (v * 100).toFixed(1) + '%';
const hrs = m => (m / 60).toFixed(1) + ' h';
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monLabel = ym => MON[+ym.slice(5, 7) - 1] + ' ' + ym.slice(2, 4);
// user 24 Nov 2026: trends by month, week or day (Period, in the filter card)
const PERIODS = { month: 'Month', week: 'Week', day: 'Day' };
const weekOf = day => { const d = new Date(day + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
const pk = r => OEE.per === 'day' ? r.date : OEE.per === 'week' ? weekOf(r.date) : r.month;
const pLabel = k => k.length === 7 ? monLabel(k) : (OEE.per === 'week' ? 'Wk ' : '') + (+k.slice(8, 10)) + ' ' + MON[+k.slice(5, 7) - 1];
const pTitle = k => k.length === 7 ? monLabel(k) : (OEE.per === 'week' ? 'Week of ' : '') + (+k.slice(8, 10)) + ' ' + MON[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4);
const TYPE_LABEL = { Solid: 'Solid', Liquid: 'Liquid', Skip: 'Not counted' };
const SPLIT_LABEL = { stage: 'stage', sub: 'group', machine: 'machine', product: 'product', type: 'type' };

async function load(){
  if (OEE.loading) return;
  OEE.loading = true; render();
  try {
    OEE.d = await api(PI_API + 'get?part=oee'); OEE.err = '';
    OEE.N = oeeNames(OEE.d.names);
    OEE.all = (OEE.d.runs || []).map(a => oeeCalcRun(a, OEE.N));
    OEE.runs = OEE.all.filter(r => !r.skip);
    // one name per reason: the names list, else the spelling written most often
    const seen = {};
    OEE.all.forEach(r => r.un.forEach(([, re, , ck]) => { const s = seen[ck] = seen[ck] || {}; s[re] = (s[re] || 0) + 1; }));
    OEE.rname = {};
    Object.keys(seen).forEach(ck => { const n = OEE.N.c.reason[ck]; OEE.rname[ck] = (n && n.value) || Object.keys(seen[ck]).sort((a, b) => seen[ck][b] - seen[ck][a])[0]; });
    const months = [...new Set(OEE.runs.map(r => r.month))].sort();
    if (months.length && !OEE.f.to){ OEE.f.to = months[months.length - 1]; OEE.f.from = months.find(m => m.slice(0, 4) === OEE.f.to.slice(0, 4)) || months[0]; }
  } catch (e) { OEE.err = e.message; }
  OEE.loading = false; render();
}
const reload = () => { OEE.d = null; load(); };
function wait(title){
  if (!OEE.d && !OEE.loading && !OEE.err) load();
  if (OEE.d) return null;
  return { title, crumb: 'Process Improvement', html: pageHead(title) + `<div class="card"><div class="card-b">${OEE.err
    ? `<div class="notice danger">${I.alert}<div>${esc(OEE.err)} <button class="btn btn-ghost btn-sm" id="oeeRetry">Try again</button></div></div>` : '<div class="small muted">Loading...</div>'}</div></div>`,
    bind(){ const b = $('#oeeRetry'); if (b) b.onclick = () => { OEE.err = ''; load(); }; } };
}
function filtered(skip){
  const f = OEE.f, ok = (k, v) => skip === k || !f[k].length || f[k].includes(v);
  return OEE.runs.filter(r => (!f.from || r.month >= f.from) && (!f.to || r.month <= f.to) && ok('stage', r.stage) && ok('sub', r.sub) && ok('machine', r.machine) && ok('product', r.product) && ok('type', r.type));
}
function unknownsOf(runs){
  const u = {};
  runs.forEach(r => r.unknown.forEach(([kind, key, raw, sheet]) => { const k = kind + '|' + oeeCompact(key); (u[k] = u[k] || { kind, key, raw, sheet, n: 0 }).n++; }));
  return Object.values(u);
}
const span = () => [...new Set(filtered().map(pk))].sort();   // the periods with data in the filters
const sumBy = (runs, key) => { const g = {}; runs.forEach(r => { (g[r[key]] = g[r[key]] || []).push(r); }); return g; };
const ns = v => `data-sort="${v == null ? '' : v}"`;

/* ---------------- Charts (plain SVG / HTML) ---------------- */
function legend(items){
  return `<div class="row" style="gap:14px;flex-wrap:wrap;margin-bottom:6px">${items.map(([n, c, line]) => `<span class="small" style="display:inline-flex;align-items:center;gap:6px"><span style="width:12px;height:${line ? 3 : 10}px;border-radius:2px;background:${c}"></span>${esc(n)}</span>`).join('')}</div>`;
}
function lineChart(months, series){
  const W = 760, H = 260, L = 44, R = 110, T = 14, B = 30, iw = W - L - R, ih = H - T - B;
  const x = i => L + (months.length < 2 ? iw / 2 : i * iw / (months.length - 1)), y = v => T + ih - v * ih;
  let g = '';
  for (let v = 0; v <= 1.0001; v += 0.2) g += `<line x1="${L}" x2="${L + iw}" y1="${y(v)}" y2="${y(v)}" stroke="#e6e6e1"/><text x="${L - 6}" y="${y(v) + 4}" font-size="11" text-anchor="end" fill="#6b6b66">${Math.round(v * 100)}%</text>`;
  const every = Math.max(1, Math.ceil(months.length / 12)), dot = months.length > 40 ? 2.5 : 4;
  months.forEach((m, i) => { if (i % every === 0) g += `<text x="${x(i)}" y="${H - 10}" font-size="11" text-anchor="middle" fill="#6b6b66">${pLabel(m)}</text>`; });
  series.forEach(s => {
    const pts = s.values.map((v, i) => v == null ? null : [x(i), y(Math.min(v, 1))]);
    let d = '', open = false;
    pts.forEach(p => { if (!p) { open = false; return; } d += (open ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); open = true; });
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2"/>`;
    pts.forEach((p, i) => { if (p) g += `<circle cx="${p[0]}" cy="${p[1]}" r="${dot}" fill="${s.color}" stroke="#fff" stroke-width="${dot > 3 ? 2 : 1}"><title>${esc(s.name)} · ${pTitle(months[i])}: ${pct(s.values[i])}${s.tip ? '\n' + esc(s.tip[i] || '') : ''}</title></circle>`; });
    const last = pts.map((p, i) => [p, i]).filter(z => z[0]).pop();
    if (last && series.length <= 4) g += `<text x="${last[0][0] + 8}" y="${last[0][1] + 4}" font-size="11" fill="#3b3b38">${esc(s.name)} ${pct(s.values[last[1]])}</text>`;
  });
  return (series.length > 1 ? legend(series.map(s => [s.name, s.color, true])) : '') + `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="Trend">${g}</svg>`;
}
// stacked columns per month: series = [{name, color, values (minutes)}]
function columns(months, series){
  const W = 760, H = 240, L = 48, R = 10, T = 14, B = 30, iw = W - L - R, ih = H - T - B;
  const tot = months.map((m, i) => series.reduce((t, s) => t + s.values[i], 0)), max = Math.max(60, ...tot) / 60;
  const step = Math.pow(10, Math.floor(Math.log10(max))), top = Math.ceil(max / step) * step, y = h => T + ih - h / top * ih;
  const bw = Math.min(46, iw / Math.max(1, months.length) * 0.6);
  let g = '';
  for (let v = 0; v <= top + 1e-9; v += top / 4) g += `<line x1="${L}" x2="${L + iw}" y1="${y(v)}" y2="${y(v)}" stroke="#e6e6e1"/><text x="${L - 6}" y="${y(v) + 4}" font-size="11" text-anchor="end" fill="#6b6b66">${Math.round(v)} h</text>`;
  months.forEach((m, i) => {
    const cx = L + (i + 0.5) * iw / months.length; let base = 0;
    series.forEach((s, k) => {
      const h = s.values[i] / 60; if (h <= 0) return;
      const y1 = y(base + h), y0 = y(base), ht = Math.max(0, y0 - y1 - (base > 0 ? 2 : 0));
      const isTop = k === series.length - 1 || series.slice(k + 1).every(z => z.values[i] <= 0);
      g += `<path d="${isTop ? `M${cx - bw / 2} ${y1 + ht}V${y1 + 4}q0 -4 4 -4h${bw - 8}q4 0 4 4V${y1 + ht}z` : `M${cx - bw / 2} ${y1}h${bw}v${ht}h${-bw}z`}" fill="${s.color}"><title>${pTitle(m)} · ${esc(s.name)}: ${h.toFixed(1)} h</title></path>`;
      if (bw < 16) {} else if (ht >= 15) g += `<text x="${cx}" y="${y1 + ht / 2 + 4}" font-size="10.5" text-anchor="middle" fill="#fff" font-weight="600">${h >= 10 ? h.toFixed(0) : h.toFixed(1)}</text>`;
      else if (h > 0 && months.length <= 14) g += `<text x="${cx + bw / 2 + 3}" y="${y1 + ht / 2 + 4}" font-size="10" fill="${s.color}">${h >= 10 ? h.toFixed(0) : h.toFixed(1)}</text>`;
      base += h;
    });
    if (tot[i] > 0 && series.length > 1 && bw >= 16) g += `<text x="${cx}" y="${y(tot[i] / 60) - 5}" font-size="10.5" text-anchor="middle" fill="#3b3b38" font-weight="650">${(tot[i] / 60).toFixed(0)} h</text>`;
    if (i % Math.max(1, Math.ceil(months.length / 12)) === 0) g += `<text x="${cx}" y="${H - 10}" font-size="11" text-anchor="middle" fill="#6b6b66">${pLabel(m)}</text>`;
  });
  return legend(series.map(s => [s.name, s.color])) + `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="Lost time by month">${g}</svg>`;
}
// horizontal bars: rows = [{label, segs: [[value, color, name]], right, key}]
function hbars(rows, opt){
  if (!rows.length) return '<div class="small muted">Nothing in this selection.</div>';
  const max = Math.max(...rows.map(r => r.segs.reduce((t, s) => t + s[0], 0))) || 1;
  return rows.map(r => `<div class="oee-par ${opt && opt.pick === r.key ? 'on' : ''}" ${r.key ? `data-par="${esc(r.key)}"` : ''} title="${esc(r.title || r.label)}">
      <div class="oee-par-name">${esc(r.label)}</div>
      <div class="oee-par-bar" style="display:flex;gap:2px">${r.segs.filter(s => s[0] > 0).map((s, i, a) => `<div style="width:${(s[0] / max * 100).toFixed(2)}%;background:${s[1]};border-radius:${i === a.length - 1 ? '0 4px 4px 0' : '0'}"></div>`).join('')}</div>
      <div class="oee-par-val mono">${r.right}</div></div>` + (r.after || '')).join('');
}
const meter = v => v == null ? '<span class="muted">–</span>' : `<div style="display:flex;align-items:center;gap:8px"><div style="flex:1;min-width:50px;height:8px;background:#eef0ee;border-radius:4px"><div style="width:${Math.min(100, v * 100).toFixed(1)}%;height:8px;background:${C_MACH};border-radius:0 4px 4px 0"></div></div><span class="mono">${pct(v)}</span></div>`;

/* ---------------- Dashboard: head, tabs, the one filter card ----------------
   user 24 Nov 2026: every filter at the top (several picks each), Granulation off until added, one table or chart per tab */
const DEF_STAGES = OEE_STAGES.filter(s => s !== 'Granulation/Mixing');   // no output in the files: it would pull availability up
const DASH_TABS = [['/oee', 'Summary'], ['/oee/logs', 'Logs'], ['/oee/trend', 'Trend'], ['/oee/downtime', 'Downtime analysis'], ['/oee/bdrb', 'BDRB']];
const MS_KEYS = { stage: 'Stage', sub: 'Group', machine: 'Machine', product: 'Product', type: 'Type' };
function msel(key, list){
  const cur = OEE.f[key], fmt = v => key === 'type' ? (TYPE_LABEL[v] || v) : v;
  const opts = [...new Set(list.concat(cur))];
  const miss = opts.filter(v => !cur.includes(v));
  const txt = !cur.length || !miss.length ? 'All' : cur.length === 1 ? fmt(cur[0]) : miss.length === 1 ? 'All but ' + fmt(miss[0]) : cur.length + ' picked';
  return `<div class="field oee-ms" style="margin:0;min-width:130px"><label>${MS_KEYS[key]}</label>
    <button type="button" class="inp oee-ms-btn" data-ms="${key}" title="${esc(cur.map(fmt).join(', ') || 'All')}"><span>${esc(txt)}</span><span class="muted">▾</span></button>
    <div class="oee-ms-pop" data-pop="${key}" ${OEE.ms === key ? '' : 'hidden'}>
      ${opts.length > 8 ? `<input class="inp" data-msq="${key}" placeholder="Search" style="margin-bottom:6px">` : ''}
      <div class="oee-ms-list">${opts.map(v => `<label class="oee-ms-opt"><input type="checkbox" data-msv="${key}" value="${esc(v)}" ${cur.includes(v) ? 'checked' : ''}> ${esc(fmt(v))}</label>`).join('')}</div>
      <div class="row" style="gap:6px;margin-top:8px"><button type="button" class="btn btn-ghost btn-sm" data-msall="${key}">All</button><button type="button" class="btn btn-ghost btn-sm" data-msnone="${key}">None</button><button type="button" class="btn btn-primary btn-sm" data-msx="${key}" style="margin-left:auto">Done</button></div>
    </div></div>`;
}
function dashFrame(cur, controls, body, bindMore){
  const f = OEE.f, months = [...new Set(OEE.runs.map(r => r.month))].sort();
  const opts = (key, order) => { const v = [...new Set(filtered(key).map(r => r[key]))]; return order ? order.filter(x => v.includes(x)) : v.sort((a, b) => a.localeCompare(b)); };
  const sel = (id, label, cur2, list, fmt) => `<div class="field" style="margin:0;min-width:110px"><label>${label}</label><select class="inp" id="${id}">${list.map(v => `<option value="${esc(v)}" ${v === cur2 ? 'selected' : ''}>${esc(fmt ? fmt(v) : v)}</option>`).join('')}</select></div>`;
  const unk = unknownsOf(filtered());
  const html = pageHead('OEE dashboard', 'Machine efficiency from the monthly OEE workbooks. The filters apply to every tab.',
      (OEE.d.can_edit ? `<a class="btn btn-primary" href="#/oee/upload">${I.arrowUp} Upload workbooks</a>` : '') + `<button class="btn btn-ghost" id="oeeXlsx">${I.arrowDown} Excel</button>`)
    + piTabs(cur, DASH_TABS)
    + (unk.length ? `<div class="notice warn" style="margin-bottom:12px">${I.alert}<div>${unk.length} name(s) in these months are not in the names list yet; they count under the sheet's stage until placed. <a href="#/settings">Place them in Settings</a></div></div>` : '')
    + `<div class="card oee-filters" style="margin-bottom:14px"><div class="card-b">
        <div class="row" style="gap:10px;flex-wrap:wrap;align-items:flex-end">
          ${sel('oF', 'From', f.from, months, monLabel)}${sel('oT', 'To', f.to, months, monLabel)}
          ${msel('stage', opts('stage', OEE_STAGES))}${msel('sub', opts('sub'))}${msel('machine', opts('machine'))}${msel('product', opts('product'))}${msel('type', ['Solid', 'Liquid'])}
          <button class="btn btn-ghost btn-sm" id="oClear" title="Back to every stage but Granulation, nothing else picked">Clear</button></div>
        ${controls ? `<div class="row oee-viewrow" style="gap:10px;flex-wrap:wrap;align-items:flex-end">${controls}</div>` : ''}
      </div></div>` + body;
  return { html, bind(){
    const set = (id, k) => { const e = $('#' + id); if (e) e.onchange = () => { OEE.f[k] = e.value; render(); }; };
    set('oF', 'from'); set('oT', 'to');
    $$('[data-ms]').forEach(b => b.onclick = e => { e.stopPropagation(); OEE.ms = OEE.ms === b.dataset.ms ? null : b.dataset.ms; $$('[data-pop]').forEach(p => { p.hidden = p.dataset.pop !== OEE.ms; }); const q = $(`[data-msq="${OEE.ms}"]`); if (q) q.focus(); });
    const apply = (key, vals) => {
      const all = [...new Set(opts(key, key === 'stage' ? OEE_STAGES : null).concat(OEE.f[key]))];
      OEE.f[key] = vals.length === all.length && key !== 'stage' ? [] : vals;
      if (key === 'stage' || key === 'sub'){ // picks further down that no longer fit go
        const keep = k => { const v = new Set(filtered(k).map(r => r[k])); OEE.f[k] = OEE.f[k].filter(x => v.has(x)); };
        if (key === 'stage') keep('sub'); keep('machine');
      }
      OEE.pick = null; render();
    };
    $$('[data-msv]').forEach(c => c.onchange = () => { const k = c.dataset.msv; apply(k, $$(`[data-msv="${k}"]`).filter(x => x.checked).map(x => x.value)); });
    $$('[data-msall]').forEach(b => b.onclick = () => { const k = b.dataset.msall; OEE.f[k] = k === 'stage' ? OEE_STAGES.slice() : []; apply(k, OEE.f[k]); });
    $$('[data-msnone]').forEach(b => b.onclick = () => { $$(`[data-msv="${b.dataset.msnone}"]`).forEach(x => { x.checked = false; }); });
    $$('[data-msx]').forEach(b => b.onclick = () => { OEE.ms = null; $$('[data-pop]').forEach(p => { p.hidden = true; }); });
    $$('[data-msq]').forEach(q => q.oninput = () => { const t = q.value.trim().toLowerCase(); $$('.oee-ms-opt', q.parentNode).forEach(l => { l.style.display = !t || l.textContent.toLowerCase().includes(t) ? '' : 'none'; }); });
    $('#oClear').onclick = () => { Object.assign(OEE.f, { stage: DEF_STAGES.slice(), sub: [], machine: [], product: [], type: [] }); OEE.pick = null; OEE.ms = null; render(); };
    $('#oeeXlsx').onclick = () => exportXlsx();
    if (bindMore) bindMore();
  } };
}
if (!window.__oeeMsClose){ window.__oeeMsClose = true;   // a click outside an open pick list closes it
  document.addEventListener('click', e => { if (OEE.ms && !(e.target.closest && e.target.closest('.oee-ms'))) { OEE.ms = null; $$('[data-pop]').forEach(p => { p.hidden = true; }); } }); }
const viewSel = (id, label, cur, pairs) => `<div class="field" style="margin:0;min-width:170px"><label>${label}</label><select class="inp" id="${id}">${pairs.map(([v, l]) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
const bindSel = (id, fn) => { const e = $('#' + id); if (e) e.onchange = () => { fn(e.value); render(); }; };
function empty(){
  return { title: 'OEE dashboard', crumb: 'Process Improvement', html: pageHead('OEE dashboard', 'Machine efficiency from the monthly OEE workbooks.')
    + `<div class="card"><div class="card-b">${emptyState('chart', 'No months uploaded yet', 'Upload the monthly "Machine Hours & OEE" workbooks first.', OEE.d.can_edit ? `<a class="btn btn-primary" href="#/oee/upload">Upload workbooks</a>` : '')}</div></div>` };
}
const statTile = (lbl, val, sub, info, href) => `<${href ? `a href="#${href}"` : 'div'} class="stat ${href ? 'link' : ''}" style="text-decoration:none;color:inherit"><div class="lbl">${lbl} ${info ? piInfo(info) : ''}</div><div class="val">${val}</div><div class="tiny muted">${sub || ''}</div></${href ? 'a' : 'div'}>`;
function tiles(runs){
  const s = oeeSum(runs);
  return `<div class="grid g4" style="margin-bottom:14px">
    ${statTile('OEE', pct(s.OEE), s.P == null ? 'no output in this selection (availability only)' : `${s.n} batch runs`, 'Availability x Performance x Quality, from the summed minutes and pieces of every run picked (not an average of the rows).')}
    ${statTile('Availability', pct(s.A), `${hrs(s.op)} running of ${hrs(s.pw)} planned`, 'Operation time / planned working time.\nPlanned working = available - idle - planned shutdown; operation = planned working - unplanned downtime.')}
    ${statTile('Performance', pct(s.P), s.flagged ? `${s.flagged} run(s) over 100%: counted as 100%` : 'no run over 100%', 'Pieces made / (speed x operation time).\nA run above 100% is counted as 100%; tap to list them (the speed set is likely too low).', s.flagged ? '/oee/logs?over' : '')}
    ${statTile('Quality', pct(s.Q), s.def ? '' : 'no defects recorded in the files', 'Good pieces / (good + defects).')}
    ${statTile('Unplanned downtime', hrs(s.ops + s.mach), `machine ${hrs(s.mach)} · operational ${hrs(s.ops)}`, 'Machine = the machine stopped (breakdowns, faults). Operational = waiting, changeovers over their time, lack of material, clearance.', '/oee/downtime')}
    ${statTile('MTBF', s.MTBF == null ? '–' : hrs(s.MTBF), `${s.stops} machine stop entries`, 'Mean time between failures = operation time / number of machine stops.\nOne stop = one machine-downtime reason with minutes on a batch row.')}
    ${statTile('MTTR', s.MTTR == null ? '–' : Math.round(s.MTTR) + ' min', 'per machine stop', 'Mean time to repair = machine downtime / number of machine stops.')}
    ${statTile('Planned shutdown', hrs(runs.reduce((t, r) => t + r.planned, 0)), `idle ${hrs(runs.reduce((t, r) => t + r.idle, 0))}`, 'Briefing, breaks, sanitation, planned set-up and changeover, PM. Not counted as an OEE loss.')}
  </div>`;
}

/* ---------------- Summary: the tiles and ONE table (View by) ---------------- */
const BY = { stage: 'Stage and group', sub: 'Group', machine: 'Machine', product: 'Product' };
function viewSummary(){
  const w = wait('OEE dashboard'); if (w) return w;
  if (!OEE.runs.length) return empty();
  const runs = filtered(), by = OEE.by;
  const cols = x => `<td class="num mono">${x.n}</td><td class="num mono" ${ns(x.pw)}>${hrs(x.pw)}</td><td class="num mono" ${ns(x.A)}>${pct(x.A)}</td><td class="num mono" ${ns(x.P)}>${pct(x.P)}</td><td class="num mono" ${ns(x.Q)}>${pct(x.Q)}</td>
    <td ${ns(x.OEE)} style="min-width:160px">${meter(x.OEE)}</td><td class="num mono" ${ns(x.ops + x.mach)}>${hrs(x.ops + x.mach)}</td><td class="num mono" ${ns(x.MTBF)}>${x.MTBF == null ? '–' : hrs(x.MTBF)}</td><td class="num mono" ${ns(x.MTTR)}>${x.MTTR == null ? '–' : Math.round(x.MTTR) + ' min'}</td><td class="num mono">${x.flagged || ''}</td>`;
  const head = first => `<thead><tr>${first}<th class="num">Runs</th><th class="num">Planned working</th><th class="num">Availability</th><th class="num">Performance</th><th class="num">Quality</th><th>OEE</th><th class="num">Unplanned</th><th class="num">MTBF</th><th class="num">MTTR</th><th class="num">Over 100%</th></tr></thead>`;
  let table;
  if (by === 'stage'){
    const byStage = sumBy(runs, 'stage');
    table = `<table class="tbl" data-nosort style="min-width:1000px">${head('<th>Stage / group</th>')}<tbody>${OEE_STAGES.filter(st => byStage[st]).map(st => {
      const subs = sumBy(byStage[st], 'sub');
      return `<tr><td class="strong">${esc(st)}</td>${cols(oeeSum(byStage[st]))}</tr>` + (Object.keys(subs).length > 1 ? Object.keys(subs).sort().map(k => `<tr class="clickable" data-by="sub" data-v="${esc(k)}"><td style="padding-left:26px">${esc(k)}</td>${cols(oeeSum(subs[k]))}</tr>`).join('') : '');
    }).join('')}</tbody></table>`;
  } else {
    const g = Object.entries(sumBy(runs, by)).map(([k, l]) => ({ k, st: l[0].stage, sub: l[0].sub, s: oeeSum(l) }))
      .sort((a, b) => OEE_STAGES.indexOf(a.st) - OEE_STAGES.indexOf(b.st) || a.sub.localeCompare(b.sub) || a.k.localeCompare(b.k));
    const extra = by === 'machine' ? '<th>Stage</th><th>Group</th>' : by === 'sub' ? '<th>Stage</th>' : '';
    table = `<table class="tbl" style="min-width:1050px">${head(`<th>${BY[by]}</th>${extra}`)}<tbody>${g.map(x => `<tr class="clickable" data-by="${by}" data-v="${esc(x.k)}"><td class="strong">${esc(x.k)}</td>${by === 'machine' ? `<td class="small">${esc(x.st)}</td><td class="small">${esc(x.sub)}</td>` : by === 'sub' ? `<td class="small">${esc(x.st)}</td>` : ''}${cols(x.s)}</tr>`).join('')}</tbody></table>`;
  }
  const fr = dashFrame('/oee', viewSel('oBy', 'View by', by, Object.entries(BY)),
    tiles(runs) + `<div class="card"><div class="card-h"><div><h3>By ${esc(BY[by].toLowerCase())}</h3><div class="sub">${by === 'stage' ? 'Tap a group to filter by it.' : 'Tap a heading to sort; tap a line to filter by it.'}</div></div></div><div class="tbl-wrap">${table}</div></div>`,
    () => { bindSel('oBy', v => { OEE.by = v; }); $$('[data-by]').forEach(tr => tr.onclick = () => { const k = tr.dataset.by, v = tr.dataset.v;
      OEE.f[k] = [v]; render(); }); });
  return { title: 'OEE dashboard', crumb: 'Process Improvement', keepScroll: true, html: fr.html, bind: fr.bind };
}

/* ---------------- Trend by month (Lines is a filter) ---------------- */
function trendSeries(runs, months){
  const sp = OEE.split;
  if (!sp){
    const per = months.map(m => oeeSum(runs.filter(r => pk(r) === m)));
    return [['OEE', 'OEE'], ['Availability', 'A'], ['Performance', 'P'], ['Quality', 'Q']].map(([n, k], i) => ({ name: n, key: k, color: COLORS[i], values: per.map(p => p[k]), total: oeeSum(runs)[k] }));
  }
  const tot = {}; runs.forEach(r => { tot[r[sp]] = (tot[r[sp]] || 0) + r.pw; });
  const groups = Object.keys(tot).sort((a, b) => tot[b] - tot[a]);
  const shown = (groups.length > 8 ? groups.slice(0, 7) : groups).sort((a, b) => sp === 'stage' ? OEE_STAGES.indexOf(a) - OEE_STAGES.indexOf(b) : a.localeCompare(b));
  const mk = (name, color, test) => { const per = months.map(m => oeeSum(runs.filter(r => pk(r) === m && test(r))));
    return { name, color, values: per.map(p => p.OEE), tip: per.map(p => `A ${pct(p.A)} · P ${pct(p.P)} · Q ${pct(p.Q)}`), total: oeeSum(runs.filter(test)).OEE }; };
  const out = shown.map((g, i) => mk(g, COLORS[i], r => r[sp] === g));
  if (groups.length > 8){ const rest = new Set(groups.slice(7)); out.push(mk('Other (' + rest.size + ')', OTHER, r => rest.has(r[sp]))); }
  return out;
}
function viewTrend(){
  const w = wait('OEE dashboard'); if (w) return w;
  if (!OEE.runs.length) return empty();
  const runs = filtered(), months = span(), series = trendSeries(runs, months);
  const head1 = OEE.split ? esc(SPLIT_LABEL[OEE.split][0].toUpperCase() + SPLIT_LABEL[OEE.split].slice(1)) + ' (OEE)' : 'Measure';
  const tbl = OEE.per === 'month'
    ? `<div class="tbl-wrap"><table class="tbl" style="min-width:${220 + months.length * 72}px"><thead><tr><th>${head1}</th>${months.map(m => `<th class="num">${pLabel(m)}</th>`).join('')}<th class="num">Whole period</th></tr></thead><tbody>
      ${series.map(se => `<tr><td><span class="oee-sw" style="background:${se.color}"></span>${esc(se.name)}</td>${se.values.map((v, i) => `<td class="num mono" ${ns(v)} title="${esc(se.tip ? se.tip[i] : '')}">${pct(v)}</td>`).join('')}<td class="num mono" ${ns(se.total)}><b>${pct(se.total)}</b></td></tr>`).join('')}
      </tbody></table></div>`
    : `<div class="tbl-wrap" style="max-height:520px"><table class="tbl" style="min-width:${180 + series.length * 110}px"><thead><tr><th>${PERIODS[OEE.per]}</th>${series.map(se => `<th class="num"><span class="oee-sw" style="background:${se.color}"></span>${esc(se.name)}</th>`).join('')}</tr></thead><tbody>
      ${months.map((m, i) => `<tr><td ${ns(m)}>${esc(pTitle(m))}</td>${series.map(se => `<td class="num mono" ${ns(se.values[i])} title="${esc(se.tip ? se.tip[i] : '')}">${pct(se.values[i])}</td>`).join('')}</tr>`).join('')}
      <tr><td ${ns('9999')}><b>Whole period</b></td>${series.map(se => `<td class="num mono" ${ns(se.total)}><b>${pct(se.total)}</b></td>`).join('')}</tr>
      </tbody></table></div>`;
  const fr = dashFrame('/oee/trend', viewSel('oPer', 'Period', OEE.per, Object.entries(PERIODS)) + viewSel('oSp', 'Lines', OEE.split, [['', 'OEE, availability, performance, quality']].concat(Object.entries(SPLIT_LABEL).map(([k, l]) => [k, 'OEE by ' + l]))),
    `<div class="card"><div class="card-h"><div><h3>Trend by ${PERIODS[OEE.per].toLowerCase()}</h3><div class="sub">${OEE.split ? 'OEE per ' + SPLIT_LABEL[OEE.split] + '; hover a point for availability, performance and quality' : 'OEE with its three parts'}</div></div></div>
      <div class="card-b">${lineChart(months, series)}<div style="margin-top:12px">${tbl}</div></div></div>`,
    () => { bindSel('oSp', v => { OEE.split = v; }); bindSel('oPer', v => { OEE.per = v; }); });
  return { title: 'OEE dashboard', crumb: 'Process Improvement', keepScroll: true, html: fr.html, bind: fr.bind };
}

/* ---------------- Downtime analysis: ONE chart (Chart), machine / operational as a filter ---------------- */
const CHARTS = { pareto: 'Pareto by reason', month: 'Lost time by month, week or day', machine: 'Machines with the most lost time' };
const wantCat = c => OEE.pareto === 'all' || OEE.pareto === c;
function paretoList(runs){
  const par = {}; let tot = 0;
  runs.forEach(r => r.un.forEach(([cat, , v, ck]) => {
    if (!wantCat(cat)) return;
    const k = cat + '|' + ck; const x = par[k] = par[k] || { key: k, cat, reason: OEE.rname[ck] || ck, min: 0, n: 0 }; x.min += v; x.n++; tot += v; }));
  return { par, tot, list: Object.values(par).sort((a, b) => b.min - a.min) };
}
function viewDowntime(){
  const w = wait('OEE dashboard'); if (w) return w;
  if (!OEE.runs.length) return empty();
  const runs = filtered(), months = span(), lg = legend([['Machine', C_MACH], ['Operational', C_OPS]].filter(([n]) => wantCat(n)));
  let card;
  if (OEE.chart === 'month'){
    const series = [['Machine', C_MACH, 'mach'], ['Operational', C_OPS, 'ops']].filter(([n]) => wantCat(n))
      .map(([name, color, k]) => ({ name, color, values: months.map(m => runs.filter(r => pk(r) === m).reduce((t, r) => t + r[k], 0)) }));
    card = `<h3>Unplanned downtime by ${PERIODS[OEE.per].toLowerCase()}</h3><div class="sub">Hours lost; each part is labelled, the total is above the column.</div></div></div><div class="card-b">${columns(months, series)}`;
  } else if (OEE.chart === 'machine'){
    const byM = Object.entries(sumBy(runs, 'machine')).map(([m, l]) => ({ m, s: oeeSum(l) })).map(x => Object.assign(x, { t: (wantCat('Machine') ? x.s.mach : 0) + (wantCat('Operational') ? x.s.ops : 0) }))
      .filter(x => x.t > 0).sort((a, b) => b.t - a.t).slice(0, 20);
    card = `<h3>Machines with the most unplanned downtime</h3><div class="sub">Top 20, biggest first</div></div></div><div class="card-b">${lg}${hbars(byM.map(x => ({ label: x.m, title: `${x.m}: machine ${hrs(x.s.mach)}, operational ${hrs(x.s.ops)}`,
      segs: [[wantCat('Machine') ? x.s.mach : 0, C_MACH], [wantCat('Operational') ? x.s.ops : 0, C_OPS]],
      right: OEE.pareto === 'all' ? `<span style="color:${C_MACH}">${(x.s.mach / 60).toFixed(1)}</span> + <span style="color:${C_OPS}">${(x.s.ops / 60).toFixed(1)}</span> = ${hrs(x.t)}` : hrs(x.t) })))}`;
  } else {
    const P = paretoList(runs);
    let list = P.list;
    if (list.length > 25){ const rest = list.slice(24); list = list.slice(0, 24); list.push({ key: 'other', cat: 'Other', reason: 'Other (' + rest.length + ' reasons)', min: rest.reduce((t, x) => t + x.min, 0), n: rest.reduce((t, x) => t + x.n, 0) }); }
    let cum = 0, cut = false;
    const rows = list.map((x, i) => { cum += x.min; const share = cum / P.tot, line = !cut && share >= 0.8 && i < list.length - 1; if (line) cut = true;
      return { key: x.key, label: x.reason, title: `${x.reason} (${x.cat}): ${hrs(x.min)}, ${x.n} time(s), ${(x.min / P.tot * 100).toFixed(1)}% · running total ${(share * 100).toFixed(0)}%`,
        segs: [[x.min, x.cat === 'Machine' ? C_MACH : x.cat === 'Operational' ? C_OPS : OTHER]], right: `${hrs(x.min)} <span class="muted">${(x.min / P.tot * 100).toFixed(0)}% · Σ${(share * 100).toFixed(0)}%</span>`,
        after: line ? '<div class="oee-cut">80% of the lost time is above this line</div>' : '' }; });
    OEE._par = P.par;
    card = `<h3>Pareto: unplanned downtime by reason</h3><div class="sub">${hrs(P.tot)} lost, biggest first. Tap a reason for its batch runs.</div></div></div><div class="card-b">${lg}${hbars(rows)}`;
  }
  const fr = dashFrame('/oee/downtime', viewSel('oCh', 'Chart', OEE.chart, Object.entries(CHARTS)) + (OEE.chart === 'month' ? viewSel('oPer', 'Period', OEE.per, Object.entries(PERIODS)) : '') + viewSel('oPk', 'Downtime', OEE.pareto, [['all', 'Machine and operational'], ['Machine', 'Machine only'], ['Operational', 'Operational only']]),
    `<div class="card"><div class="card-h"><div>${card}</div></div>`,
    () => {
      bindSel('oCh', v => { OEE.chart = v; }); bindSel('oPk', v => { OEE.pareto = v; }); bindSel('oPer', v => { OEE.per = v; });
      $$('[data-par]').forEach(b => b.onclick = () => { const k = b.dataset.par; if (k !== 'other') reasonModal(k, runs); });
    });
  return { title: 'OEE dashboard', crumb: 'Process Improvement', keepScroll: true, html: fr.html, bind: fr.bind };
}
function reasonModal(key, runs){
  const x = OEE._par[key]; if (!x) return;
  const list = runs.filter(r => r.un.some(([c, , , ck]) => c + '|' + ck === key)), mins = r => r.un.filter(([c, , , ck]) => c + '|' + ck === key).reduce((t, z) => t + z[2], 0);
  openModal({ title: x.reason, sub: `${x.cat} downtime · ${hrs(x.min)} over ${x.n} entries`, size: 'wide',
    body: `<div class="tbl-wrap" style="max-height:62vh"><table class="tbl"><thead><tr><th>Date</th><th>Machine</th><th>Product</th><th>Batch</th><th class="num">Minutes</th></tr></thead><tbody>
      ${list.map(r => `<tr><td>${esc(r.date)}</td><td>${esc(r.machine)}</td><td>${esc(r.product)}</td><td class="mono">${esc(r.batch)}</td><td class="num mono">${mins(r)}</td></tr>`).join('')}</tbody></table></div>` });
}

/* ---------------- Logs: every batch run (search and "over 100%" in the filter card) ---------------- */
function viewLogs(){
  const w = wait('OEE dashboard'); if (w) return w;
  if (!OEE.runs.length) return empty();
  if (/\?over/.test(location.hash)) { OEE.logOver = true; history.replaceState(null, '', '#/oee/logs'); }
  const q = OEE.logQ.trim().toLowerCase();
  const runs = filtered().filter(r => (!OEE.logOver || r.flag) && (!q || [r.machine, r.product, r.batch, r.date].join(' ').toLowerCase().includes(q)));
  const oeeOf = r => r.perf == null ? null : (r.pw > 0 ? r.op / r.pw : 0) * Math.min(1, r.perf) * (r.good + r.def > 0 ? r.good / (r.good + r.def) : 1);
  const fr = dashFrame('/oee/logs', `<div class="field" style="margin:0;min-width:240px"><label>Search</label><input class="inp" id="lgQ" placeholder="Machine, product, batch, date" value="${esc(OEE.logQ)}"></div>
      <label class="small" style="display:flex;gap:6px;align-items:center;padding-bottom:9px"><input type="checkbox" id="lgOver" ${OEE.logOver ? 'checked' : ''}> Only runs over 100% performance</label>`,
    `<div class="card"><div class="card-h"><div><h3>Batch runs</h3><div class="sub">${runs.length} rows. Tap a row for its lost minutes; tap a heading to sort.</div></div></div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:1150px"><thead><tr><th>Date</th><th>Group</th><th>Machine</th><th>Product</th><th>Batch</th><th class="num">Available</th><th class="num">Planned working</th><th class="num">Machine dt</th><th class="num">Operational dt</th><th class="num">Running</th><th class="num">Availability</th><th class="num">Performance</th><th class="num">OEE</th></tr></thead><tbody>
    ${runs.map(r => { const a = r.pw > 0 ? r.op / r.pw : null, o = oeeOf(r);
      return `<tr class="clickable" data-run="${r.id}"><td>${esc(r.date)}</td><td class="small">${esc(r.sub)}</td><td>${esc(r.machine)}</td><td>${esc(r.product)}</td><td class="mono small">${esc(r.batch)}</td>
        <td class="num mono">${r.av}</td><td class="num mono">${r.pw}</td><td class="num mono">${r.mach || ''}</td><td class="num mono">${r.ops || ''}</td><td class="num mono">${r.op}</td>
        <td class="num mono" ${ns(a)}>${pct(a)}</td><td class="num mono" ${ns(r.perf)}>${pct(r.perf)}${r.flag ? ' <span class="badge b-warn">capped</span>' : ''}</td><td class="num mono" ${ns(o)}>${pct(o)}</td></tr>`; }).join('') || '<tr><td colspan="13" class="muted">No runs.</td></tr>'}
    </tbody></table></div></div>`,
    () => {
      $('#lgOver').onchange = e => { OEE.logOver = e.target.checked; render(); };
      const qq = $('#lgQ'); qq.oninput = debounce(() => { OEE.logQ = qq.value; render(); setTimeout(() => { const e = $('#lgQ'); if (e) { e.focus(); e.setSelectionRange(e.value.length, e.value.length); } }, 0); }, 300);
      $$('[data-run]').forEach(tr => tr.onclick = () => runModal(OEE.runs.find(r => String(r.id) === tr.dataset.run)));
    });
  return { title: 'OEE dashboard', crumb: 'Process Improvement', keepScroll: true, html: fr.html, bind: fr.bind };
}

/* ---------------- BDRB: the weekly report (user 24 Nov 2026: "my team prepares this report every week") ----------------
   Slide 1 "OEE (%) Trend (Weekly)": OEE per week with the target, DT trend by month, A / P / Q / OEE per week.
   Slide 2 "Downtime Result": hours per section for the report week (operational / machine), weekly DT trend (wk 1, wk 2, current).
   Weeks are the 7 days ending on "Week ends on", stepping back 7 days at a time. */
const SECTIONS = ['Granulation', 'Compression', 'Stripping', 'Blistering', 'Sachetting', 'Secondary Packaging'];
const sectionOf = r => r.stage === 'Granulation/Mixing' ? 'Granulation' : r.stage === 'Primary Packaging' ? r.sub : r.stage;
const C_TOT = COLORS[2];
const addDays = (day, n) => { const d = new Date(day + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const dLabel = day => (+day.slice(8, 10)) + ' ' + MON[+day.slice(5, 7) - 1];
const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
// bars side by side per label; series = [{name, color, values}], fmt for the axis and the labels; target = a line across
function groupedBars(labels, series, opt){
  const o = opt || {}, W = 760, H = 290, L = 48, R = 12, T = 18, B = o.twoLine ? 46 : 32, iw = W - L - R, ih = H - T - B;
  const vals = series.flatMap(s => s.values).filter(v => v != null);
  let top = o.max || Math.max(1, ...vals, o.target || 0);
  if (!o.max){ const step = Math.pow(10, Math.floor(Math.log10(top))); top = Math.ceil(top / step * 2) * step / 2; }
  const y = v => T + ih - v / top * ih, gw = iw / Math.max(1, labels.length), bw = Math.min(40, gw * 0.75 / series.length);
  let g = '';
  for (let k = 0; k <= 5; k++){ const v = top * k / 5; g += `<line x1="${L}" x2="${L + iw}" y1="${y(v)}" y2="${y(v)}" stroke="#e6e6e1"/><text x="${L - 6}" y="${y(v) + 4}" font-size="11" text-anchor="end" fill="#6b6b66">${o.fmt ? o.fmt(v, true) : Math.round(v)}</text>`; }
  labels.forEach((lb, i) => {
    const x0 = L + i * gw + (gw - bw * series.length - 2 * (series.length - 1)) / 2;
    series.forEach((s, k) => {
      const v = s.values[i]; if (v == null) return;
      const x = x0 + k * (bw + 2), yt = y(v), h = Math.max(0, T + ih - yt);
      g += `<path d="${h > 4 ? `M${x} ${T + ih}V${yt + 4}q0 -4 4 -4h${bw - 8}q4 0 4 4V${T + ih}z` : `M${x} ${T + ih}h${bw}v${-h}h${-bw}z`}" fill="${s.color}"><title>${esc(lb.join ? lb.join(' ') : lb)} · ${esc(s.name)}: ${o.fmt ? o.fmt(v) : v}</title></path>`;
      g += `<text x="${x + bw / 2}" y="${yt - 5}" font-size="10.5" text-anchor="middle" fill="#3b3b38">${o.fmt ? o.fmt(v) : v}</text>`;
    });
    const cx = L + (i + 0.5) * gw;
    (lb.join ? lb : [lb]).forEach((t, j) => { g += `<text x="${cx}" y="${H - B + 16 + j * 13}" font-size="10.5" text-anchor="middle" fill="#6b6b66">${esc(t)}</text>`; });
  });
  if (o.target != null) g += `<line x1="${L}" x2="${L + iw}" y1="${y(o.target)}" y2="${y(o.target)}" stroke="${COLORS[1]}" stroke-width="2.5"/><text x="${L + iw - 4}" y="${y(o.target) - 6}" font-size="11" text-anchor="end" fill="#3b3b38">Target ${o.fmt ? o.fmt(o.target) : o.target}</text>`;
  return legend(series.map(s => [s.name, s.color]).concat(o.target != null ? [['Target', COLORS[1], true]] : [])) + `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="${esc(o.label || 'Bars')}">${g}</svg>`;
}
function viewBdrb(){
  const w = wait('OEE dashboard'); if (w) return w;
  if (!OEE.runs.length) return empty();
  const lastDay = OEE.runs.reduce((m, r) => r.date > m ? r.date : m, '');
  if (!OEE.bEnd) OEE.bEnd = lastDay;
  if (OEE.bT == null) OEE.bT = +(localStorage.getItem('okl.oee.target') || 75);
  const end = OEE.bEnd, n = OEE.bN, f = OEE.f;
  // the top filters apply, except the months (the report date decides) and, for the downtime parts, the stage and group
  const keep = (r, sections) => (sections || ((!f.stage.length || f.stage.includes(r.stage)) && (!f.sub.length || f.sub.includes(r.sub))))
    && (!f.machine.length || f.machine.includes(r.machine)) && (!f.product.length || f.product.includes(r.product)) && (!f.type.length || f.type.includes(r.type));
  const weeks = []; for (let i = n - 1; i >= 0; i--){ const e = addDays(end, -7 * i); weeks.push({ s: addDays(e, -6), e }); }
  const inW = (r, wk) => r.date >= wk.s && r.date <= wk.e;
  // user 24 Nov 2026: the weekly OEE of the report is Secondary Packaging only (as the team's slide); machine, product and type filters still apply
  const per = weeks.map(wk => oeeSum(OEE.runs.filter(r => inW(r, wk) && r.stage === 'Secondary Packaging' && keep(r, true))));
  const wLab = weeks.map(wk => [ordinal(+wk.s.slice(8, 10)) + ' ' + MON[+wk.s.slice(5, 7) - 1] + ' -', ordinal(+wk.e.slice(8, 10)) + ' ' + MON[+wk.e.slice(5, 7) - 1]]);
  const year = end.slice(0, 4), dtRuns = OEE.runs.filter(r => keep(r, true));
  const months = [...new Set(dtRuns.filter(r => r.month.slice(0, 4) === year && r.date <= end).map(r => r.month))].sort();
  const mSum = months.map(m => dtRuns.filter(r => r.month === m && r.date <= end).reduce((a, r) => { a.o += r.ops; a.m += r.mach; return a; }, { o: 0, m: 0 }));
  const h0 = v => Math.round(v / 60), h1 = v => (v / 60).toFixed(1);
  const cur = weeks[weeks.length - 1], wkRuns = dtRuns.filter(r => inW(r, cur));
  const sec = SECTIONS.map(sn => { const l = wkRuns.filter(r => sectionOf(r) === sn); const o = l.reduce((t, r) => t + r.ops, 0), m = l.reduce((t, r) => t + r.mach, 0); return { sn, o, m, t: o + m }; });
  const pt = sec.reduce((a, x) => ({ o: a.o + x.o, m: a.m + x.m, t: a.t + x.t }), { o: 0, m: 0, t: 0 });
  const sh = (a, b) => b > 0 ? Math.round(a / b * 100) + '%' : '0%';
  const last3 = weeks.slice(-3).map((wk, i, a) => ({ lab: i === a.length - 1 ? 'current' : 'wk ' + (i + 1), title: dLabel(wk.s) + ' - ' + dLabel(wk.e), ...dtRuns.filter(r => inW(r, wk)).reduce((t, r) => { t.o += r.ops; t.m += r.mach; return t; }, { o: 0, m: 0 }) }));
  const controls = `<div class="field" style="margin:0"><label>Week ends on ${piInfo('The report week is the 7 days ending on this day; earlier weeks step back 7 days at a time.')}</label><input class="inp" type="date" id="bEnd" value="${esc(end)}" max="${esc(lastDay)}"></div>`
    + viewSel('bN', 'Weeks shown', String(n), [['6', '6'], ['8', '8'], ['10', '10'], ['12', '12']])
    + `<div class="field" style="margin:0;width:110px"><label>Target OEE %</label><input class="inp" type="number" id="bT" min="1" max="100" value="${esc(OEE.bT)}"></div>
       <button class="btn btn-ghost" id="bPrint" style="margin-bottom:1px">${I.arrowDown} Print / PDF</button>`;
  // user 24 Nov 2026: not slides: the visuals one under the other on the page
  const card = (title, sub, body) => `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>${title}</h3><div class="sub">${sub}</div></div></div><div class="card-b">${body}</div></div>`;
  const fr = dashFrame('/oee/bdrb', controls,
    card('OEE trend (weekly), Secondary Packaging', `${n} weeks to ${esc(dLabel(end))} ${esc(year)}; Secondary Packaging only, whatever the stage filter; the machine, product and type filters apply`,
      groupedBars(wLab, [{ name: 'OEE (%)', color: COLORS[0], values: per.map(p => p.OEE == null ? null : Math.round(p.OEE * 100)) }], { max: 100, target: OEE.bT, fmt: v => Math.round(v) + '%', twoLine: true, label: 'OEE trend' }))
    + card('Availability, productivity, quality and OEE (weekly), Secondary Packaging', 'The same weeks, Secondary Packaging only',
      `<div class="tbl-wrap"><table class="tbl" data-nosort style="min-width:${160 + n * 100}px"><thead><tr><th></th>${wLab.map(l => `<th class="num">${esc(l.join(' '))}</th>`).join('')}</tr></thead><tbody>
        ${[['Availability', 'A'], ['Productivity', 'P'], ['Quality', 'Q'], ['OEE', 'OEE']].map(([lb, k]) => `<tr><td class="strong">${lb}</td>${per.map(p => `<td class="num mono">${p[k] == null ? '–' : Math.round(p[k] * 100) + '%'}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div>`)
    + card('DT trend (monthly)', `Hours lost in ${esc(year)} to ${esc(dLabel(end))}, every section`,
      groupedBars(months.map(m => MON[+m.slice(5, 7) - 1].toLowerCase()), [{ name: 'Operational', color: C_OPS, values: mSum.map(x => h0(x.o)) }, { name: 'Machine', color: C_MACH, values: mSum.map(x => h0(x.m)) }, { name: 'Total', color: C_TOT, values: mSum.map(x => h0(x.o + x.m)) }], { label: 'DT trend' }))
    + card(`Downtime result (week ${esc(dLabel(cur.s))} - ${esc(dLabel(cur.e))})`, 'Every section; the machine, product and type filters apply',
      `<div class="tbl-wrap"><table class="tbl" data-nosort style="min-width:620px"><thead><tr><th>Section</th><th class="num">Downtime (Hrs)</th><th class="num">Operational (Hrs)</th><th class="num">Machine (Hrs)</th><th class="num">Ops(%)</th><th class="num">Mach(%)</th></tr></thead><tbody>
        ${sec.map(x => `<tr><td>${esc(x.sn)}</td><td class="num mono">${h1(x.t)}</td><td class="num mono">${h1(x.o)}</td><td class="num mono">${h1(x.m)}</td><td class="num mono">${sh(x.o, x.t)}</td><td class="num mono">${sh(x.m, x.t)}</td></tr>`).join('')}
        <tr><td><b>Plant Total</b></td><td class="num mono"><b>${h0(pt.t)}</b></td><td class="num mono"><b>${h0(pt.o)}</b></td><td class="num mono"><b>${h0(pt.m)}</b></td><td class="num mono"><b>${sh(pt.o, pt.t)}</b></td><td class="num mono"><b>${sh(pt.m, pt.t)}</b></td></tr>
      </tbody></table></div>`)
    + card('Weekly DT trend', 'The last three weeks, hours',
      groupedBars(last3.map(x => [x.lab, x.title]), [{ name: 'Weekly DT machine', color: C_MACH, values: last3.map(x => h0(x.m)) }, { name: 'Weekly DT operational', color: C_OPS, values: last3.map(x => h0(x.o)) }, { name: 'Weekly DT total', color: C_TOT, values: last3.map(x => h0(x.o + x.m)) }], { twoLine: true, label: 'Weekly DT trend' })),
    () => {
      const e = $('#bEnd'); e.onchange = () => { if (e.value) { OEE.bEnd = e.value; render(); } };
      bindSel('bN', v => { OEE.bN = +v; });
      const t = $('#bT'); t.onchange = () => { const v = +t.value; if (v >= 1 && v <= 100) { OEE.bT = v; try { localStorage.setItem('okl.oee.target', String(v)); } catch (x) { /* ignore */ } render(); } };
      $('#bPrint').onclick = () => window.print();
    });
  return { title: 'OEE dashboard', crumb: 'Process Improvement', keepScroll: true, html: fr.html, bind: fr.bind };
}

function runModal(r){
  if (!r) return;
  const a = OEE.all.find(x => x.id === r.id), raw = (OEE.d.runs || []).find(x => x[0] === r.id), L = raw ? raw[11] : {};
  const SEC = { I: 'Idle', P: 'Planned shutdown', O: 'Operational', M: 'Machine', D: 'Down Time (old template)' };
  const lines = Object.entries(L || {}).filter(([, v]) => v > 0).sort((x, y) => 'IPODM'.indexOf(x[0][0]) - 'IPODM'.indexOf(y[0][0]) || y[1] - x[1]);
  openModal({ title: `${a.machine} · ${a.date}`, sub: `${a.product} · batch ${a.batch || '–'} · sheet ${a.sheet}`, size: 'wide',
    body: `<div class="oee-run"><table class="tbl" data-nosort style="width:100%;margin-bottom:14px"><tbody>
        <tr><td>Available</td><td class="mono">${a.av} min</td></tr><tr><td>Idle</td><td class="mono">${a.idle} min</td></tr><tr><td>Planned shutdown</td><td class="mono">${a.planned} min</td></tr>
        <tr><td>Planned working</td><td class="mono">${a.pw} min</td></tr><tr><td>Unplanned (machine / operational)</td><td class="mono">${a.mach} / ${a.ops} min</td></tr><tr><td>Running</td><td class="mono">${a.op} min</td></tr>
        <tr><td>Speed</td><td class="mono">${a.speed} pcs/min</td></tr><tr><td>Made / could make</td><td class="mono">${Math.round(a.prod).toLocaleString()} / ${Math.round(a.theory).toLocaleString()}</td></tr>
        <tr><td>Performance</td><td class="mono">${pct(a.perf)}${a.flag ? ' (counted as 100%)' : ''}</td></tr></tbody></table>
      <table class="tbl" data-nosort style="width:100%"><thead><tr><th>Lost minutes as written</th><th>Counted as</th><th class="num">Min</th></tr></thead><tbody>
        ${lines.map(([k, v]) => { const u = a.un.find(z => z[1] === k.slice(2)); return `<tr><td>${esc(k.slice(2))}</td><td class="small">${esc(SEC[k[0]])}${k[0] === 'D' && u ? ' → ' + u[0] : ''}</td><td class="num mono">${v}</td></tr>`; }).join('') || '<tr><td colspan="3" class="muted">None.</td></tr>'}
      </tbody></table></div>` });
}
async function exportXlsx(){
  try {
    const X = await loadXlsxLib(), wb = X.utils.book_new(), f = OEE.f, runs = filtered(), months = span(), r1 = v => v == null ? '' : Math.round(v * 1000) / 10;
    const add = (name, head, rows) => X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([head].concat(rows)), name);
    add('Filters', ['Filter', 'Value'], [['From', f.from], ['To', f.to], ['Stage', f.stage.join(', ') || 'All'], ['Group', f.sub.join(', ') || 'All'], ['Machine', f.machine.join(', ') || 'All'], ['Product', f.product.join(', ') || 'All'], ['Type', f.type.join(', ') || 'All']]);
    add('Machines', ['Machine', 'Stage', 'Group', 'Runs', 'Availability %', 'Performance %', 'Quality %', 'OEE %', 'Unplanned h', 'MTBF h', 'MTTR min'],
      Object.entries(sumBy(runs, 'machine')).map(([m, l]) => { const s = oeeSum(l); return [m, l[0].stage, l[0].sub, s.n, r1(s.A), r1(s.P), r1(s.Q), r1(s.OEE), Math.round((s.ops + s.mach) / 6) / 10, s.MTBF == null ? '' : Math.round(s.MTBF / 6) / 10, s.MTTR == null ? '' : Math.round(s.MTTR)]; }));
    add('Trend', ['Line', ...months.map(pTitle), 'Whole period'], trendSeries(runs, months).map(s => [s.name, ...s.values.map(r1), r1(s.total)]));
    const P = paretoList(runs); let cum = 0;
    add('Pareto', ['Reason', 'Category', 'Hours', 'Times', '% of lost time', 'Running %'], P.list.map(x => { cum += x.min; return [x.reason, x.cat, Math.round(x.min / 6) / 10, x.n, r1(x.min / P.tot), r1(cum / P.tot)]; }));
    add('Runs', ['Date', 'Stage', 'Group', 'Machine', 'Product', 'Type', 'Batch', 'Available min', 'Idle', 'Planned shutdown', 'Planned working', 'Operational downtime', 'Machine downtime', 'Running', 'Speed', 'Made', 'Could make', 'Performance %', 'Over 100%', 'Good', 'Defect'],
      runs.map(r => [r.date, r.stage, r.sub, r.machine, r.product, r.type, r.batch, r.av, r.idle, r.planned, r.pw, r.ops, r.mach, r.op, r.speed, r.prod, Math.round(r.theory), r1(r.perf), r.flag ? 'yes' : '', r.good, r.def]));
    X.writeFile(wb, 'OKL_OEE_' + f.from + '_to_' + f.to + '.xlsx');
  } catch (e) { toast('No file made', e.message, 'err', 6000); }
}
function loadXlsxLib(){
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error('The spreadsheet reader did not load.'));
    s.onerror = () => reject(new Error('Could not load the spreadsheet reader. Check your connection and try again.'));
    document.head.appendChild(s);
  });
}

/* ---------------- Names not known yet (upload and Settings) ---------------- */
const MACHINE_SUBS = () => [...new Set(Object.values(OEE.N.machine).map(m => m.sub).concat(Object.values(OEE_SHEET).map(s => s[1])))].sort();
// the known machines / products to pick from (one line each), and the closest to a new spelling
function knownOf(kind){
  const m = {}; Object.values(OEE.N[kind]).forEach(n => { if (!m[n.value]) m[n.value] = n; });
  return Object.values(m).sort((a, b) => kind === 'machine' ? OEE_STAGES.indexOf(a.grp) - OEE_STAGES.indexOf(b.grp) || a.value.localeCompare(b.value) : a.value.localeCompare(b.value));
}
function lev(a, b){ const d = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++){ let p = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++){ const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return d[b.length]; }
function closest(kind, raw){
  const c = oeeCompact(raw); let best = null, bs = 99;
  knownOf(kind).forEach(n => { const k = oeeCompact(n.value), d = lev(c, k); const sc = k.startsWith(c) || c.startsWith(k) ? Math.min(d, 1) : d; if (sc < bs) { bs = sc; best = n; } });
  return best && bs <= Math.max(1, Math.floor(c.length / 4)) ? best : null;
}
function unknownForm(unk){
  if (!unk.length) return '';
  const row = (u, i) => {
    const st = OEE_SHEET[u.sheet] || ['', ''];
    if (u.kind === 'reason') return `<tr data-unk="${i}"><td>Downtime reason</td><td><b>${esc(u.raw)}</b><div class="tiny muted">sheet ${esc(u.sheet)} · ${u.n} time(s)</div></td>
      <td colspan="3"><select class="inp" data-f="grp"><option value="">Machine or operational?</option><option value="Machine">Machine downtime (the machine stopped)</option><option value="Operational">Operational downtime (waiting, set-up, material...)</option></select></td></tr>`;
    const near = closest(u.kind, u.raw), known = knownOf(u.kind);
    const pickSel = `<select class="inp" data-f="pick"><option value="">New ${u.kind}: type its name</option>
      ${known.map(n => `<option value="${esc(n.value)}" ${near && near.value === n.value ? 'selected' : ''}>${esc(n.value)}${u.kind === 'machine' ? ' · ' + esc(n.sub) : n.grp === 'Skip' ? ' · not counted' : ''}</option>`).join('')}</select>
      <input class="inp" data-f="value" value="${esc(oeeClean(u.raw))}" placeholder="Name" style="margin-top:6px;${near ? 'display:none' : ''}">`;
    if (u.kind === 'machine') return `<tr data-unk="${i}"><td>Machine</td><td><b>${esc(u.raw)}</b><div class="tiny muted">sheet ${esc(u.sheet)} · ${u.n} row(s)</div></td><td>${pickSel}</td>
      <td><select class="inp" data-f="grp" ${near ? 'disabled' : ''}>${OEE_STAGES.map(s => `<option ${s === (near ? near.grp : st[0]) ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></td>
      <td><input class="inp" data-f="sub" list="oeeSubs" value="${esc(near ? near.sub : st[1])}" placeholder="Group (Stripping, FBD...)" ${near ? 'disabled' : ''}></td></tr>`;
    return `<tr data-unk="${i}"><td>Product</td><td><b>${esc(u.raw)}</b><div class="tiny muted">${u.n} row(s)</div></td><td>${pickSel}</td>
      <td><select class="inp" data-f="grp" ${near ? 'disabled' : ''}><option value="">Solid, liquid or not counted?</option>${['Solid', 'Liquid', 'Skip'].map(v => `<option value="${v}" ${near && near.grp === v ? 'selected' : ''}>${TYPE_LABEL[v]}</option>`).join('')}</select></td><td></td></tr>`;
  };
  return `<datalist id="oeeSubs">${MACHINE_SUBS().map(v => `<option value="${esc(v)}">`).join('')}</datalist>
    <div class="small muted" style="margin-bottom:6px">Pick the machine or product it is (the closest one is picked for you), or "New" to add it.</div>
    <div class="tbl-wrap"><table class="tbl" data-nosort style="min-width:820px"><thead><tr><th>Kind</th><th>In the file</th><th>It is</th><th>Stage / type / category</th><th>Group</th></tr></thead>
    <tbody>${unk.map(row).join('')}</tbody></table></div>`;
}
// a known one picked: its stage / group / type are filled in and fixed; "New": typed in
function bindUnknown(unk){
  $$('[data-unk]').forEach(tr => { const p = $('[data-f="pick"]', tr); if (!p) return; const u = unk[+tr.dataset.unk];
    p.onchange = () => { const n = knownOf(u.kind).find(k => k.value === p.value), v = $('[data-f="value"]', tr), g = $('[data-f="grp"]', tr), s = $('[data-f="sub"]', tr);
      v.style.display = n ? 'none' : ''; g.disabled = !!n; if (s) s.disabled = !!n;
      if (n) { g.value = n.grp; if (s) s.value = n.sub; } else if (u.kind === 'product') g.value = ''; }; });
}
function collectUnknown(unk){
  const out = [];
  for (const tr of $$('[data-unk]')){
    const u = unk[+tr.dataset.unk], g = k => { const e = $(`[data-f="${k}"]`, tr); return e ? e.value.trim() : ''; };
    const n = { kind: u.kind, raw: u.key, value: u.kind === 'reason' ? null : (g('pick') || g('value')), grp: g('grp'), sub: u.kind === 'machine' ? g('sub') : null };
    if (!n.grp || (u.kind !== 'reason' && !n.value) || (u.kind === 'machine' && !n.sub)) throw new Error('Fill in every line: "' + u.raw + '" is not complete.');
    out.push(n);
  }
  return out;
}
async function saveNames(names){
  if (!names.length) return true;
  try { await api(PI_API + 'save', { method: 'POST', body: { op: 'oee_names', names } }); return true; }
  catch (e) { toast('Names not saved', e.message, 'err', 7000); return false; }
}

/* ---------------- Upload ---------------- */
function viewUpload(){
  const w = wait('Upload OEE workbooks'); if (w) return w;
  const files = OEE.d.files || [], up = OEE.up, have = {}; files.forEach(f => { have[f.month.slice(0, 7)] = f; });
  let unk = [];
  if (up && up.books){
    const fake = up.books.flatMap(b => b.runs.map(r => oeeCalcRun([0, r.sheet, r.date, r.product, r.batch, r.machine, 0, 0, 0, 0, 0, r.losses], OEE.N))).filter(r => !r.skip);
    unk = unknownsOf(fake); up.unk = unk;
  }
  const nMonths = up && up.books ? up.books.filter(b => b.month).length : 0;
  return { title: 'Upload OEE workbooks', crumb: 'Process Improvement · OEE dashboard', keepScroll: true,
    html: pageHead('Upload OEE workbooks', 'The monthly "Machine Hours & OEE" workbooks. Uploading a month again replaces it (the file grows through the month).', `<a class="btn btn-ghost" href="#/oee">${I.chevL} Back to the dashboard</a>`)
      + (OEE.d.can_edit ? `<div class="card" style="margin-bottom:14px"><div class="card-b">
          <div class="field" style="margin:0"><label>Workbooks (.xlsx, several at once is fine)</label><input class="inp" type="file" id="oeeFiles" accept=".xlsx,.xlsm" multiple></div>
          ${up && up.reading ? '<div class="small muted" style="margin-top:10px">Reading the files...</div>' : ''}
          ${up && up.books ? `<div class="tbl-wrap" style="margin-top:12px"><table class="tbl" data-nosort style="min-width:700px"><thead><tr><th>File</th><th>Month</th><th>Batch runs per sheet</th><th></th></tr></thead><tbody>
            ${up.books.map(b => `<tr><td class="small">${esc(b.file_name)}</td><td>${b.month ? monLabel(b.month.slice(0, 7)) : '<span class="badge b-danger">month not found</span>'}</td>
              <td class="small">${Object.entries(b.sheets).map(([k, v]) => `${esc(k)} ${v}${b.fmt[k] === 'Aug 2026 template' ? '' : ' <span class="muted">(old template)</span>'}`).join(' · ')}${b.skipped.length ? `<div class="tiny" style="color:var(--danger)">Not read: ${esc(b.skipped.join('; '))}</div>` : ''}</td>
              <td class="small">${b.month && have[b.month.slice(0, 7)] ? `<span class="badge b-warn">replaces the copy of ${esc(piDay(have[b.month.slice(0, 7)].at))}</span>` : '<span class="badge b-info">new month</span>'}</td></tr>`).join('')}
            </tbody></table></div>
            ${unk.length ? `<h3 style="margin:16px 0 4px">${unk.length} name(s) not known yet</h3><div class="small muted" style="margin-bottom:8px">Say what each one is. The answer is kept, so the next file with the same name goes straight in.</div>${unknownForm(unk)}` : ''}
            <div class="row" style="margin-top:12px;gap:8px"><button class="btn btn-primary" id="oeeGo" ${up.busy ? 'disabled' : ''}>${up.busy ? esc(up.busy) : (unk.length ? 'Save the names and upload ' : 'Upload ') + nMonths + ' month(s)'}</button>
            <button class="btn btn-ghost" id="oeeCancel">Cancel</button></div>` : ''}
        </div></div>` : `<div class="notice info" style="margin-bottom:14px">${I.info}<div>You can see the months uploaded; uploading needs edit access to the OEE page.</div></div>`)
      + `<div class="card"><div class="card-h"><div><h3>Months uploaded</h3></div></div><div class="tbl-wrap"><table class="tbl" style="min-width:640px"><thead><tr><th>Month</th><th>File</th><th class="num">Batch runs</th><th>Uploaded</th></tr></thead><tbody>
        ${files.slice().reverse().map(f => `<tr><td ${ns(f.month)}>${monLabel(f.month.slice(0, 7))}</td><td class="small">${esc(f.file_name)}<div class="tiny muted">${Object.entries(f.sheets || {}).map(([k, v]) => esc(k) + ' ' + v).join(' · ')}</div></td><td class="num mono">${f.runs}</td><td class="small" ${ns(f.at)}>${esc(piDayHm(f.at))} · ${esc(f.by)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">Nothing uploaded yet.</td></tr>'}
        </tbody></table></div></div>`,
    bind(){
      const inp = $('#oeeFiles');
      if (inp) inp.onchange = async () => {
        const list = Array.from(inp.files || []); if (!list.length) return;
        OEE.up = { reading: true }; render();
        try {
          const X = await loadXlsxLib(), books = [];
          for (const file of list){ const wb = X.read(new Uint8Array(await file.arrayBuffer()), { type: 'array' }); books.push(oeeReadBook(X, wb, file.name)); }
          books.sort((a, b) => (a.month || '').localeCompare(b.month || ''));
          OEE.up = { books };
        } catch (e) { OEE.up = null; toast('Could not read the file', e.message, 'err', 7000); }
        render();
      };
      bindUnknown(unk);
      const c = $('#oeeCancel'); if (c) c.onclick = () => { OEE.up = null; render(); };
      const go = $('#oeeGo'); if (go) go.onclick = async () => {
        const up = OEE.up; let names;
        try { names = collectUnknown(up.unk || []); } catch (e) { toast('Not complete', e.message, 'warn', 6000); return; }
        up.busy = 'Saving...'; render();
        if (!await saveNames(names)) { up.busy = ''; render(); return; }
        const todo = up.books.filter(x => x.month); let done = 0;
        for (const b of todo){
          up.busy = `Uploading ${monLabel(b.month.slice(0, 7))} (${++done} of ${todo.length})...`; render();
          try { await api(PI_API + 'save', { method: 'POST', body: { op: 'oee_month', month: b.month, file_name: b.file_name, runs: b.runs } }); }
          catch (e) { toast(monLabel(b.month.slice(0, 7)) + ' not uploaded', e.message, 'err', 8000); OEE.up = null; reload(); return; }
        }
        toast('Uploaded', done + ' month(s) saved.', 'ok', 4000);
        OEE.up = null; reload();
      };
    } };
}

/* ---------------- Settings: downtime reasons, machines, products (OEE) and RCA rules ---------------- */
function settingsTabs(){
  const t = [];
  if (canOpen('/oee')) t.push(['/settings', 'Downtime reasons'], ['/settings/machines', 'Machines'], ['/settings/products', 'Products']);
  if (canOpen('/rca')) t.push(['/settings/rca', 'RCA rules']);
  return t;
}
function settingsFrame(cur, body, bind){
  return { title: 'Settings', crumb: 'Process Improvement', keepScroll: true,
    html: pageHead('Settings', 'How the OEE workbooks are read, and the rules that start an RCA.') + piTabs(cur, settingsTabs()) + body, bind };
}
function namesTab(kind){
  if (!canOpen('/oee')) { const t = settingsTabs()[0]; if (t) { go(t[0]); return { title: 'Settings', crumb: '', html: '' }; } return { title: 'Settings', crumb: '', html: notFound() }; }
  const w = wait('Settings'); if (w) return w;
  const N = OEE.N, ed = OEE.d.can_edit, unk = unknownsOf(OEE.runs), q = OEE.setQ.trim().toLowerCase();
  const cur = { reason: '/settings', machine: '/settings/machines', product: '/settings/products' }[kind];
  const runsBy = {}; OEE.all.forEach(r => { const k = kind === 'machine' ? r.machine : r.product; runsBy[k] = (runsBy[k] || 0) + 1; });
  let rows = '', head = '', filters = '', groups = [];
  if (kind === 'reason'){
    // one line per reason, every spelling of it together; old-template category from the list, newer files' own split
    const g = {};
    Object.values(N.reason).forEach(n => { const ck = oeeCompact(n.raw); g[ck] = g[ck] || { ck, spell: new Set(), raws: new Set(), entry: N.c.reason[ck], min: { Machine: 0, Operational: 0 }, file: { O: 0, M: 0 } }; g[ck].raws.add(n.raw); });
    OEE.all.forEach(r => { r.un.forEach(([cat, re, v, ck]) => { const x = g[ck] = g[ck] || { ck, spell: new Set(), raws: new Set(), entry: N.c.reason[ck], min: { Machine: 0, Operational: 0 }, file: { O: 0, M: 0 } }; x.spell.add(re); x.min[cat] += v; }); });
    OEE.d.runs.forEach(a => Object.keys(a[11] || {}).forEach(k => { if (k[0] === 'O' || k[0] === 'M') { const ck = oeeCompact(k.slice(2)); if (g[ck]) g[ck].file[k[0]]++; } }));
    groups = Object.values(g).map(x => Object.assign(x, { name: OEE.rname[x.ck] || (x.entry && (x.entry.value || x.entry.raw)) || x.ck, cat: x.entry ? x.entry.grp : '' }))
      .filter(x => (!OEE.setCat || x.cat === OEE.setCat || (OEE.setCat === 'none' && !x.cat)) && (!q || x.name.toLowerCase().includes(q) || [...x.spell].join(' ').toLowerCase().includes(q)))
      .sort((a, b) => (b.min.Machine + b.min.Operational) - (a.min.Machine + a.min.Operational) || a.name.localeCompare(b.name));
    filters = `<select class="inp" id="setCat" style="max-width:220px"><option value="">Every category</option>${['Machine', 'Operational', 'Planned', 'Idle'].map(c => `<option ${OEE.setCat === c ? 'selected' : ''}>${c}</option>`).join('')}<option value="none" ${OEE.setCat === 'none' ? 'selected' : ''}>Only in the newer files</option></select>`;
    head = '<th>Reason</th><th>Spellings in the files</th><th>Category (files before Aug 2026)</th><th>Files from Aug 2026 say</th><th class="num">Unplanned hours</th>';
    rows = groups.map((x, i) => `<tr><td class="strong">${esc(x.name)}</td><td class="small">${esc([...x.spell].join(' · ') || [...x.raws].join(' · '))}</td><td>${x.cat ? esc(x.cat) : '<span class="muted">–</span>'}</td>
      <td class="small">${x.file.M ? 'Machine ' + x.file.M + 'x ' : ''}${x.file.O ? 'Operational ' + x.file.O + 'x' : ''}${!x.file.M && !x.file.O ? '<span class="muted">–</span>' : ''}</td>
      <td class="num mono" ${ns(x.min.Machine + x.min.Operational)}>${hrs(x.min.Machine + x.min.Operational)}</td>${ed ? `<td><button class="btn btn-ghost btn-sm" data-ne="${i}">${I.edit} Change</button></td>` : ''}</tr>`).join('');
  } else {
    const byVal = {};
    Object.values(N[kind]).forEach(n => { const k = n.value; (byVal[k] = byVal[k] || { value: k, grp: n.grp, sub: n.sub, raws: [], seen: new Set() }).raws.push(n.raw); });
    OEE.all.forEach(r => { const x = byVal[kind === 'machine' ? r.machine : r.product], sp = kind === 'machine' ? r.rawMachine : r.rawProduct; if (x && sp) x.seen.add(oeeClean(sp)); });
    groups = Object.values(byVal).filter(x => (!OEE.setStage || x.grp === OEE.setStage) && (!q || (x.value + ' ' + x.raws.join(' ')).toLowerCase().includes(q)))
      .sort((a, b) => kind === 'machine' ? OEE_STAGES.indexOf(a.grp) - OEE_STAGES.indexOf(b.grp) || (a.sub || '').localeCompare(b.sub || '') || a.value.localeCompare(b.value) : a.value.localeCompare(b.value));
    const opts = kind === 'machine' ? OEE_STAGES : ['Solid', 'Liquid', 'Skip'];
    filters = `<select class="inp" id="setStage" style="max-width:220px"><option value="">${kind === 'machine' ? 'Every stage' : 'Every type'}</option>${opts.map(c => `<option value="${esc(c)}" ${OEE.setStage === c ? 'selected' : ''}>${esc(TYPE_LABEL[c] || c)}</option>`).join('')}</select>`;
    head = kind === 'machine' ? '<th>Machine</th><th>Stage</th><th>Group</th><th>Spellings in the files</th><th class="num">Batch runs</th>' : '<th>Product</th><th>Type</th><th>Spellings in the files</th><th class="num">Batch runs</th>';
    rows = groups.map((x, i) => `<tr><td class="strong">${esc(x.value)}</td><td>${esc(TYPE_LABEL[x.grp] || x.grp)}</td>${kind === 'machine' ? `<td>${esc(x.sub)}</td>` : ''}<td class="small">${esc([...new Set([...x.seen].concat(x.raws.filter(r => ![...x.seen].some(v => v.toLowerCase() === r))))].join(' · '))}</td><td class="num mono">${runsBy[x.value] || 0}</td>
      ${ed ? `<td><button class="btn btn-ghost btn-sm" data-ne="${i}">${I.edit} Change</button></td>` : ''}</tr>`).join('');
  }
  const note = { reason: 'One list for every downtime reason: spellings that differ only by capitals, spaces or punctuation are one reason. The category is used for the workbooks before August 2026, whose "Down Time" block is not split; from August 2026 the file itself says machine or operational.',
    machine: 'Each spelling in the files belongs to one machine, its stage and its group. A change applies to every month.', product: 'Not counted: rows of that product are left out of every figure (e.g. "None": no product on the day).' }[kind];
  return settingsFrame(cur,
    (unk.length && ed ? `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>Not in the list yet (${unk.length})</h3><div class="sub">Found in the months uploaded. Until placed, a machine counts under its sheet and a reason as operational.</div></div></div>
        <div class="card-b">${unknownForm(unk)}<button class="btn btn-primary" id="oeeUnkSave" style="margin-top:10px">Save these names</button></div></div>` : '')
    + `<div class="small muted" style="margin-bottom:10px">${note}</div>
      <div class="row" style="gap:10px;margin-bottom:10px;flex-wrap:wrap">${filters}<input class="inp" id="setQ" placeholder="Search" value="${esc(OEE.setQ)}" style="max-width:240px"><span class="small muted" style="margin-left:auto">${groups.length} shown</span></div>
      <div class="card"><div class="tbl-wrap"><table class="tbl" style="min-width:760px"><thead><tr>${head}${ed ? '<th></th>' : ''}</tr></thead><tbody>${rows || `<tr><td colspan="7" class="muted">Nothing matches.</td></tr>`}</tbody></table></div></div>`,
    () => {
      const sc = $('#setCat'); if (sc) sc.onchange = () => { OEE.setCat = sc.value; render(); };
      const ss = $('#setStage'); if (ss) ss.onchange = () => { OEE.setStage = ss.value; render(); };
      const qq = $('#setQ'); qq.oninput = debounce(() => { OEE.setQ = qq.value; render(); setTimeout(() => { const e = $('#setQ'); if (e) { e.focus(); e.setSelectionRange(e.value.length, e.value.length); } }, 0); }, 300);
      bindUnknown(unk);
      const us = $('#oeeUnkSave'); if (us) us.onclick = async () => {
        let names; try { names = collectUnknown(unk); } catch (e) { toast('Not complete', e.message, 'warn', 6000); return; }
        if (await saveNames(names)) { toast('Saved', names.length + ' name(s) placed.', 'ok', 3500); reload(); }
      };
      $$('[data-ne]').forEach(b => b.onclick = () => editName(kind, groups[+b.dataset.ne]));
    });
}
function editName(kind, x){
  const isR = kind === 'reason';
  const body = isR ? `<div class="field"><label>Shown as</label><input class="inp" id="neV" value="${esc(x.name)}"><div class="tiny muted">Spellings: ${esc([...x.spell, ...x.raws].filter((v, i, a) => a.indexOf(v) === i).join(' · '))}</div></div>
      <div class="field"><label>Category (files before Aug 2026)</label><select class="inp" id="neG">${['Machine', 'Operational', 'Planned', 'Idle'].map(v => `<option ${v === (x.cat || (x.file.M > x.file.O ? 'Machine' : 'Operational')) ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <div class="tiny muted">In the Down Time block, Planned and Idle count as operational (the planned time was overrun).</div></div>`
    : `<div class="field"><label>${kind === 'machine' ? 'Machine' : 'Product'}</label><input class="inp" id="neV" value="${esc(x.value)}"><div class="tiny muted">Spellings: ${esc(x.raws.join(' · '))}</div></div>
       <div class="field"><label>${kind === 'machine' ? 'Stage' : 'Type'}</label><select class="inp" id="neG">${(kind === 'machine' ? OEE_STAGES : ['Solid', 'Liquid', 'Skip']).map(v => `<option value="${esc(v)}" ${v === x.grp ? 'selected' : ''}>${esc(TYPE_LABEL[v] || v)}</option>`).join('')}</select></div>
       ${kind === 'machine' ? `<div class="field"><label>Group</label><input class="inp" id="neS" list="oeeSubs2" value="${esc(x.sub)}"><datalist id="oeeSubs2">${MACHINE_SUBS().map(v => `<option value="${esc(v)}">`).join('')}</datalist></div>` : ''}`;
  const close = openModal({ title: 'Change "' + (isR ? x.name : x.value) + '"', size: 'narrow', body, footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="neOk">Save</button>`,
    onMount: (wr) => { $('#neOk', wr).onclick = async () => {
      const v = $('#neV', wr).value.trim(), g = $('#neG', wr).value, s = $('#neS', wr);
      if (!v || (s && !s.value.trim())) { toast('Not complete', 'Fill in every box.', 'warn', 4000); return; }
      const raws = isR ? (x.raws.size ? [...x.raws] : [oeeKey([...x.spell][0])]) : x.raws;
      const names = raws.map(raw => ({ kind, raw, value: v, grp: g, sub: s ? s.value.trim() : null }));
      if (await saveNames(names)) { close(); toast('Saved', '', 'ok', 2500); reload(); }
    }; } });
}
function rcaRulesTab(){
  if (!canOpen('/rca')) return namesTab('reason');
  const { d, err } = piData('rca');
  if (!d) return piWait('Settings', 'Process Improvement', err, 'rca');
  const set = d.settings || {}, ed = d.can_edit;
  return settingsFrame('/settings/rca', `<div class="card" style="max-width:560px"><div class="card-h"><div><h3>The rules that start an RCA</h3><div class="sub">An RCA starts by itself when a machine stops this long, or stops for the same reason this many times within these days.</div></div></div>
    <div class="card-b"><div class="field"><label for="ruLong">A long stop (minutes, 5 to 1440)</label><input class="inp" id="ruLong" type="number" min="5" max="1440" value="${esc(set.long)}" ${ed ? '' : 'disabled'}></div>
      <div class="field"><label for="ruRep">Repeats (times, 2 to 20)</label><input class="inp" id="ruRep" type="number" min="2" max="20" value="${esc(set.repeat)}" ${ed ? '' : 'disabled'}></div>
      <div class="field"><label for="ruDays">Within (days, 1 to 90)</label><input class="inp" id="ruDays" type="number" min="1" max="90" value="${esc(set.days)}" ${ed ? '' : 'disabled'}></div>
      ${ed ? '<button class="btn btn-primary" id="ruGo">Save the rules</button>' : '<div class="small muted">Changing the rules needs edit access to the RCA pages.</div>'}</div></div>`,
    () => { const b = $('#ruGo'); if (b) b.onclick = () => piSave({ op: 'rca_rules', ca_long_stop_minutes: $('#ruLong').value.trim(), ca_repeat_count: $('#ruRep').value.trim(), ca_repeat_days: $('#ruDays').value.trim() }, ['Rules saved', 'They apply from the next check (every 30 minutes).']); });
}

route('/oee', viewSummary);
route('/oee/trend', viewTrend);
route('/oee/downtime', viewDowntime);
route('/oee/logs', viewLogs);
route('/oee/bdrb', viewBdrb);
route('/oee/upload', viewUpload);
route('/settings', () => namesTab('reason'));
route('/settings/machines', () => namesTab('machine'));
route('/settings/products', () => namesTab('product'));
route('/settings/rca', rcaRulesTab);
PI_HELP.push(['chart', 'OEE dashboard', [
  'Menu > <b>OEE dashboard</b>. <b>Upload workbooks</b> (top right, edit access): pick the monthly "Machine Hours & OEE" files, several at once. A name the console has not seen is asked once, then kept. Uploading a month again replaces it.',
  'Every filter is in the card at the top and applies to every tab; stage, group, machine, product and type take several picks. Granulation is left out until you tick it (no output in the files). <b>Clear</b> goes back to that.',
  '<b>Summary</b>: the tiles and one table, <b>View by</b> stage and group, group, machine or product (tap a heading to sort, a line to filter by it). <b>Logs</b>: every batch run, search and "only over 100%"; tap one for its lost minutes.',
  '<b>Trend</b>: <b>Period</b> = month, week or day; <b>Lines</b> = OEE with availability, performance and quality, or OEE per stage, group, machine or product. <b>Downtime analysis</b>: <b>Chart</b> = the Pareto by reason (80% line; tap a reason for its batch runs), lost time by month, or the machines that lose the most; <b>Downtime</b> = machine, operational or both.',
  '<b>BDRB</b>: the weekly report. <b>Week ends on</b> sets the report week (7 days to that day); <b>Weeks shown</b> and <b>Target OEE %</b> (kept on this computer). OEE per week with the target, DT by month, availability / productivity / quality / OEE per week, the downtime by section for the week and the last three weeks. <b>Print / PDF</b> prints it.',
  'Notes: OEE = availability x performance x quality from the summed minutes and pieces; a run over 100% performance counts as 100% (tap the Performance tile for the list). <b>Excel</b> downloads what is on screen.']]);
PI_HELP.push(['settings', 'Settings', [
  'Menu > <b>Settings</b>. <b>Downtime reasons</b>: one list, every spelling of a reason together; the category is used for workbooks before August 2026. <b>Machines</b>: machine, stage and group of each spelling. <b>Products</b>: solid, liquid or not counted.',
  'A name in the files that is not in the lists shows at the top to be placed. <b>RCA rules</b>: how long a stop, or how many repeats in how many days, starts an RCA.']]);
PI_HELP_PAGE['OEE dashboard'] = '/oee';
PI_HELP_PAGE['Settings'] = '/settings';
})();
