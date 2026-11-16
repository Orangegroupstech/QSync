/* Requests from a console (7 Nov 2026): "Make a procurement request" (spares or any other item, to Procurement) and "Submit overtime" (to HR),
   one design for every console. Loaded by a console's index.html before app.js; Engineering uses it first. Another console
   (QSync...) uses the same two forms with its own department, so the pages look and behave the same everywhere.

   The forms send to the same public addresses as the hosted forms, so the approvals, e-mails, Google Sheets and the HR
   overtime log are unchanged:
     POST <api>/webhook/okl/request (the console forwards it to procurement/intake after checking the person and the rules, 077)
       Engineering: {department, requirementDate, items: [{sku, material, materialType, category, brand, specification, itemDetail, purpose, quantity}]}
       others:      {department, requirementDate, items: [{material, materialType, category, brand, specification, itemDetail, purpose, quantity, unit}]}
     POST <api>/webhook/employees/overtime-submit              {department, date, holiday, submitted_by, groups: [{start, end, duty, enroll_ids}]}

   oklRequests.requisition(cfg) and oklRequests.overtime(cfg) return { html, bind() } for a console page.
   cfg: { api, department, flow ('engineering' | 'dept'), requester, parts [{sku, description, brand, part_number}] (Engineering: the
          store list; picking one fills the material type, specification and brand),
          people [{enroll_id, name}] (overtime: the department's staff), icons, toast(title, msg, kind, ms), onSent() }
   The state of a form lives in the object returned by oklRequests.state(key), so a page drawn again keeps what was typed. */
(function () {
  'use strict';
  if (window.oklRequests) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const today = () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);     // Lagos is UTC+1
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const ic = (cfg, k) => (cfg.icons && cfg.icons[k]) || '';
  const err = (box, msg) => { const e = $('[data-rq-err]', box); if (e) { e.textContent = msg || ''; e.classList.toggle('hide', !msg); if (msg && e.scrollIntoView) e.scrollIntoView({ block: 'nearest' }); } };

  // 077 (16 Nov 2026): one Material type list for every department (it replaced Category and Engineering's material type)
  const MATERIAL_TYPES = ['Mechanical part', 'Electrical part', 'Pneumatic part', 'Accessories part', 'Tools & equipment', 'Chemical / reagent',
    'Consumable', 'Lab glassware & supplies', 'Safety equipment', 'Packaging material', 'Fabrication', 'Building materials', 'Office & IT', 'Other'];
  const UNITS = ['Pieces', 'Sets', 'Pairs', 'Boxes', 'Packs', 'Rolls', 'Bottles', 'Cans', 'Tubes', 'Litres', 'Kg', 'Metres'];
  // a store unit (Production store, 066) as the request form says it
  const UNIT_OF_STORE = { pcs: 'Pieces', set: 'Sets', pair: 'Pairs', box: 'Boxes', pack: 'Packs', roll: 'Rolls', bottle: 'Bottles', can: 'Cans', tube: 'Tubes', L: 'Litres', kg: 'Kg', m: 'Metres' };
  const TYPE_OF_SKU = { MP: 'Mechanical part', EP: 'Electrical part', PP: 'Pneumatic part', AP: 'Accessories part', CH: 'Chemical / reagent', TG: 'Tools & equipment' };
  // "needed by" is at least 1 month ahead (the server checks the same: okl_proc_min_need_date): 31 Jan -> 28 Feb, as Postgres does
  const addMonth = iso => { const [y, m, d] = iso.split('-').map(Number); const ny = m === 12 ? y + 1 : y, nm = m === 12 ? 1 : m + 1;
    const last = new Date(Date.UTC(ny, nm, 0)).getUTCDate(); return ny + '-' + String(nm).padStart(2, '0') + '-' + String(Math.min(d, last)).padStart(2, '0'); };
  const fmtDate = iso => { const d = new Date(String(iso || '') + 'T12:00:00Z'); return isNaN(d) ? String(iso || '') : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); };

  // the look every console shares for these forms (the consoles' own stylesheets differ a little)
  (function () {
    if (document.getElementById('rqStyle')) return;
    const st = document.createElement('style'); st.id = 'rqStyle';
    st.textContent = '.rq-form .chip,.ot-form .chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,#ccd3cf);background:var(--surface,#fff);color:inherit;border-radius:20px;font:inherit;cursor:pointer}'
      + '.rq-form .big-chip,.ot-form .big-chip{padding:9px 16px;font-size:14px;min-height:42px}'
      + '.ot-form .chip.on{background:var(--brand-50,#FFF1E8);border-color:var(--brand,#ED6B1F);color:var(--brand-700,#B84E10);font-weight:600}'
      + '.ot-form .chip:disabled{cursor:not-allowed}'
      + '.rq-form .job-actions,.ot-form .job-actions{margin-top:12px}'
      + '@media (max-width:640px){.rq-form .job-actions,.ot-form .job-actions{position:sticky;bottom:56px;background:var(--bg,#fff);padding:10px 0;z-index:5}.rq-form .job-actions .btn,.ot-form .job-actions .btn{width:100%}}';
    document.head.appendChild(st);
  })();

  const STATES = {};
  function state(key, make) { if (!STATES[key]) STATES[key] = make(); return STATES[key]; }

  async function post(url, body) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: (function () { try { return sessionStorage.getItem('okl.token') || ''; } catch (e) { return ''; } })() }, body: JSON.stringify(body) });
    if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
    if (res.ok && window.oklFormKeep) window.oklFormKeep.sent(body);     // saved: the page drawn next shows the empty form, not what was sent
    const text = await res.text(); let json = null;
    try { json = JSON.parse(text); } catch (e) { /* the requisition answers in plain text */ }
    if (!res.ok) throw new Error((json && (json.error || json.message)) || 'The server refused it (' + res.status + '). Check every line and try again.');
    return json || { text };
  }
  const opts = (list, cur, first) => (first ? `<option value="">${esc(first)}</option>` : '') + list.map(v => `<option ${v === cur ? 'selected' : ''}>${esc(v)}</option>`).join('');

  /* ---------------- Make a request (requisition) ----------------
     077 (16 Nov 2026), every department: Material type (one list), Brand (needed for Engineering), Specification, "needed by" at
     least 1 month ahead, and at most 10 items per department per week (Monday to Sunday). The server checks the same rules. */
  const itemNew = () => ({ part: '', brand: '', spec: '', type: '', purpose: '', qty: '', unit: 'Pieces' });
  function partOf(cfg, text) {
    const m = /^\s*([A-Z]{2}) ?(\d{3,4})\b/.exec(String(text || '').toUpperCase());
    return m ? (cfg.parts || []).find(p => p.sku === m[1] + ' ' + m[2]) : null;
  }
  // the materials this department has asked for before (server list, one per name); a picked name fills the rest, a near-miss spelling is corrected on send.
  // The same answer carries the department's week (how many items are left) and the earliest "needed by" date.
  const CATS = {};
  const catOf = cfg => (CATS[cfg.department] && CATS[cfg.department].items) || [];
  const weekOf = cfg => (CATS[cfg.department] && CATS[cfg.department].week) || null;
  const minNeed = cfg => { const w = weekOf(cfg); return (w && w.min_need) || addMonth(today()); };
  // the months ahead come from Procurement > Settings (1 unless changed there)
  const leadTxt = cfg => { const w = weekOf(cfg), m = w && w.lead_months != null ? +w.lead_months : 1; return m === 0 ? 'From today' : 'At least ' + m + ' month' + (m === 1 ? '' : 's') + ' from today'; };
  const lev = (a, b) => { const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 9; let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; } return prev[n]; };
  const normName = t => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const exactCat = (cfg, t) => catOf(cfg).find(c => c.name.toLowerCase() === String(t || '').trim().toLowerCase());
  const nearCat = (cfg, t) => { const k = normName(t); if (k.length < 4) return null; return catOf(cfg).find(c => normName(c.name) === k) || catOf(cfg).find(c => { const d = lev(normName(c.name), k); return d > 0 && d <= 2; }) || null; };
  // a department's own store (cfg.store: Production, 066): "CF 001 - ..." or "cf001" is that material, sent by its code
  const storeOf = (cfg, t) => { const m = /^\s*([A-Z]{2}) ?(\d{3,4})\b/.exec(String(t || '').toUpperCase()); return m ? (cfg.store || []).find(x => x.code === m[1] + ' ' + m[2]) || null : null; };
  const storeLabel = x => x.code + ' - ' + x.name + (x.part_number ? ' (' + x.part_number + ')' : '');
  const infoDept = (cfg, t) => { t = String(t || '').trim(); if (!t) return '';
    const sx = storeOf(cfg, t); if (sx) return 'Store material <b>' + esc(sx.code) + '</b>' + (sx.stock != null ? ': ' + esc(sx.stock) + ' ' + esc(sx.unit) + ' in stock' : '') + (sx.order_qty ? ', suggested order ' + esc(sx.order_qty) : '') + '. Sent by its code, so the delivery is received against this request.'; if (exactCat(cfg, t)) return 'Asked for before: the details are filled in.'; const n = nearCat(cfg, t); return n ? 'Did you mean "' + esc(n.name) + '"? It is used on send, so one item keeps one spelling.' : 'New item: it joins this department\'s list once requested.'; };
  async function loadCatalog(cfg, then) {
    if (!cfg.api || !cfg.department || CATS[cfg.department]) return;
    CATS[cfg.department] = { items: [] };
    try {
      const res = await fetch(cfg.api + '/webhook/okl/catalog?department=' + encodeURIComponent(cfg.department), { headers: { Authorization: (function () { try { return sessionStorage.getItem('okl.token') || ''; } catch (e) { return ''; } })() } });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.items) { CATS[cfg.department] = { items: cfg.flow === 'engineering' ? [] : j.items, week: j.week || null }; if (then) then(); } else delete CATS[cfg.department];
    } catch (e) { delete CATS[cfg.department]; }
  }
  // "This week: 4 of 10 sent, 6 left" above the items
  function weekHtml(cfg, n) {
    const w = weekOf(cfg); if (!w) return '';
    const left = +w.left, over = n > left;
    return `<div class="notice ${over || !left ? 'warn' : 'info'}" style="margin-bottom:12px">${ic(cfg, 'info')}<div><b>This week (${esc(fmtDate(w.week_start))} to ${esc(fmtDate(w.week_end))}):</b>
      ${esc(cfg.department)} has sent ${esc(w.used)} of its ${esc(w.limit)} items, <b>${esc(left)} left</b>.${over ? ` This request has ${n}: remove ${n - left} or send them from Monday.` : ''}
      ${!left ? ' No more can be sent until Monday.' : ''}</div></div>`;
  }
  function itemHtml(cfg, it, i, n) {
    const eng = cfg.flow === 'engineering', p = eng ? partOf(cfg, it.part) : null;
    return `<div class="card rq-item" style="margin-bottom:10px"><div class="card-b">
      <div class="row between" style="margin-bottom:6px"><span class="strong">Item ${i + 1}</span>${n > 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-rq-rm="${i}">Remove</button>` : ''}</div>
      <div class="field"><label>${eng ? 'Part (from the store list, or type a new item)' : 'Material'}</label>
        <input class="inp" data-rq="part" data-i="${i}" list="rqParts" autocomplete="off" maxlength="160" value="${esc(it.part)}" placeholder="${eng ? 'Type the SKU or the part name' : 'Type to pick one asked for before, or a new item'}">
        ${!eng ? `<div class="tiny muted" data-rq-info="${i}">${infoDept(cfg, it.part)}</div>` : ''}
        ${eng ? `<div class="tiny muted" data-rq-info="${i}">${p ? 'Store part ' + esc(p.sku) + '.' : it.part.trim() ? 'Not in the store list: sent as a new item; give its specification below.' : ''}</div>` : ''}</div>
      <div class="grid g2">
        <div class="field"><label>Material type</label><select class="inp" data-rq="type" data-i="${i}">${opts(MATERIAL_TYPES, it.type, 'Choose...')}</select></div>
        <div class="field"><label>Brand${eng ? '' : ' (optional)'}</label><input class="inp" data-rq="brand" data-i="${i}" maxlength="120" value="${esc(it.brand)}" placeholder="e.g. SKF"></div>
      </div>
      <div class="field"><label>Specification${eng && !p ? '' : ' (optional)'}</label><input class="inp" data-rq="spec" data-i="${i}" maxlength="300" value="${esc(it.spec)}" placeholder="e.g. 6205 2RS, 25 mm bore"></div>
      <div class="grid g2">
        ${eng ? '' : `<div class="field"><label>Unit</label><select class="inp" data-rq="unit" data-i="${i}">${opts(UNITS, it.unit)}</select></div>`}
        <div class="field"><label>Quantity</label><input class="inp" type="number" min="1" step="1" data-rq="qty" data-i="${i}" value="${esc(it.qty)}"></div>
        <div class="field"${eng ? '' : ' style="grid-column:1/-1"'}><label>Why it is needed</label><input class="inp" data-rq="purpose" data-i="${i}" maxlength="300" value="${esc(it.purpose)}" placeholder="e.g. Kunlong #2 sealing jaw"></div>
      </div></div></div>`;
  }
  function requisition(cfg) {
    const st = state('req:' + cfg.department, () => ({ date: '', items: [itemNew()] }));
    if (!st.date || st.date < minNeed(cfg)) st.date = minNeed(cfg);
    const eng = cfg.flow === 'engineering';
    const html = `<form class="rq-form" id="rqForm" novalidate>
      <div data-rq-week>${weekHtml(cfg, st.items.length)}</div>
      <div class="card" style="margin-bottom:12px"><div class="card-b"><div class="grid g2">
        <div class="field"><label>Requested by</label><input class="inp" value="${esc(cfg.requester)}" disabled></div>
        <div class="field"><label for="rqDate">Needed by</label><input class="inp" type="date" id="rqDate" min="${esc(minNeed(cfg))}" value="${esc(st.date)}">
          <div class="tiny muted" data-rq-min>${esc(leadTxt(cfg))}: ${esc(fmtDate(minNeed(cfg)))} or later.</div></div></div>
        <div class="tiny muted">${esc(cfg.department)}. It goes for approval as the ${eng ? 'Engineering requisition (Engineering Manager, Operations Manager, Plant Manager)' : 'department requisition'}; you get the result by e-mail. At most 10 items a week per department.</div></div></div>
      <div data-rq-items>${st.items.map((it, i) => itemHtml(cfg, it, i, st.items.length)).join('')}</div>
      <button type="button" class="btn btn-ghost" data-rq-add>${ic(cfg, 'plus')} Add another item</button>
      <datalist id="rqParts">${eng ? (cfg.parts || []).map(p => `<option value="${esc(p.sku + ' - ' + p.description)}">`).join('') : (cfg.store || []).map(x => `<option value="${esc(storeLabel(x))}">`).join('') + catOf(cfg).filter(c => !storeOf(cfg, c.name)).map(c => `<option value="${esc(c.name)}">`).join('')}</datalist>
      <div class="err-msg hide" data-rq-err style="margin-top:10px"></div>
      <div class="row job-actions" style="gap:10px;margin-top:12px"><button type="button" class="btn btn-primary btn-lg" data-rq-send>${ic(cfg, 'check')} Send for approval</button></div></form>`;
    function bind() {
      const box = $('#rqForm'); if (!box) return;
      const showWeek = () => { const w = $('[data-rq-week]', box); if (w) w.innerHTML = weekHtml(cfg, st.items.length); };
      const draw = () => { $('[data-rq-items]', box).innerHTML = st.items.map((it, i) => itemHtml(cfg, it, i, st.items.length)).join(''); wire(); showWeek(); };
      // fill a field from a picked part / material, unless the person typed their own
      const fill = (it, i, key, v) => { const auto = 'auto_' + key;
        if (!it[key] || it[key] === it[auto]) { it[key] = it[auto] = v || ''; const x = $(`[data-rq="${key}"][data-i="${i}"]`, box); if (x) x.value = it[key]; } };
      const wire = () => {
        $$('[data-rq]', box).forEach(el => { el.oninput = el.onchange = () => {
          const i = el.dataset.i, it = st.items[+i], k = el.dataset.rq; it[k] = el.value;
          if (k !== 'part') return;
          const info = $(`[data-rq-info="${i}"]`, box);
          if (!eng && storeOf(cfg, el.value)) {
            const sx = storeOf(cfg, el.value);
            if (el.value.trim() !== storeLabel(sx) && /^\s*[A-Za-z]{2} ?\d{3,4}\s*$/.test(el.value)) { el.value = storeLabel(sx); it.part = el.value; }
            fill(it, i, 'spec', [sx.name, sx.part_number ? 'P/N ' + sx.part_number : ''].filter(Boolean).join(', '));
            fill(it, i, 'brand', sx.brand || '');
            fill(it, i, 'type', 'Consumable');
            if (UNIT_OF_STORE[sx.unit] && (it.unit === 'Pieces' || !it.unit)) { it.unit = UNIT_OF_STORE[sx.unit]; const x = $(`[data-rq="unit"][data-i="${i}"]`, box); if (x) x.value = it.unit; }
            if (info) info.innerHTML = infoDept(cfg, el.value);
          } else if (!eng) {
            const c = exactCat(cfg, el.value);
            if (c) {
              fill(it, i, 'spec', c.specification || (c.brand ? '' : c.detail));
              fill(it, i, 'brand', c.brand);
              if (MATERIAL_TYPES.includes(c.type)) fill(it, i, 'type', c.type);
              if (c.unit && it.unit === 'Pieces' && UNITS.includes(c.unit)) { it.unit = c.unit; const x = $(`[data-rq="unit"][data-i="${i}"]`, box); if (x) x.value = it.unit; }
            }
            if (info) info.innerHTML = infoDept(cfg, el.value);
          } else {
            // Engineering: the store list fills the type, specification (description, part number) and brand
            const p = partOf(cfg, el.value);
            fill(it, i, 'type', p ? TYPE_OF_SKU[p.sku.slice(0, 2)] || '' : '');
            fill(it, i, 'spec', p ? [p.description, p.part_number ? 'P/N ' + p.part_number : ''].filter(Boolean).join(', ') : '');
            fill(it, i, 'brand', p ? p.brand || '' : '');
            if (info) info.textContent = p ? 'Store part ' + p.sku + '.' : el.value.trim() ? 'Not in the store list: sent as a new item; give its specification below.' : '';
          } }; });
        $$('[data-rq-rm]', box).forEach(b => b.onclick = () => { st.items.splice(+b.dataset.rqRm, 1); draw(); });
      };
      $('#rqDate', box).onchange = e => { st.date = e.target.value; };
      $('[data-rq-add]', box).onclick = () => { st.items.push(itemNew()); draw(); const p = $$('[data-rq="part"]', box); p[p.length - 1].focus(); };
      wire();
      loadCatalog(cfg, () => {
        const dl = $('#rqParts'); if (dl && !eng) dl.innerHTML = (cfg.store || []).map(x => `<option value="${esc(storeLabel(x))}">`).join('') + catOf(cfg).filter(c => !storeOf(cfg, c.name)).map(c => `<option value="${esc(c.name)}">`).join('');
        $$('[data-rq-info]', box).forEach(x => { const it = st.items[+x.dataset.rqInfo]; if (it && !eng) x.innerHTML = infoDept(cfg, it.part); });
        const d = $('#rqDate', box), mn = minNeed(cfg);
        if (d) { d.min = mn; if (!st.date || st.date < mn) { st.date = mn; d.value = mn; } }
        const m = $('[data-rq-min]', box); if (m) m.textContent = leadTxt(cfg) + ': ' + fmtDate(mn) + ' or later.';
        showWeek();
      });
      const send = $('[data-rq-send]', box);
      send.onclick = async () => {
        err(box, '');
        const mn = minNeed(cfg);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(st.date || '')) return err(box, 'Pick the date it is needed by.');
        if (st.date < mn) return err(box, 'The "needed by" date must be ' + leadTxt(cfg).toLowerCase() + ': ' + fmtDate(mn) + ' or later.');
        if (st.items.length > 30) return err(box, 'At most 30 items in one request.');
        const w = weekOf(cfg);
        if (w && st.items.length > +w.left) return err(box, +w.left ? 'Only ' + w.left + ' more item' + (+w.left === 1 ? '' : 's') + ' can be sent this week (' + w.limit + ' per department, Monday to Sunday). Remove ' + (st.items.length - w.left) + ' or send them from Monday.' : 'This week\'s ' + w.limit + ' items for ' + cfg.department + ' are used. Send it from Monday.');
        const items = [];
        for (let i = 0; i < st.items.length; i++) {
          const it = st.items[i], n = st.items.length > 1 ? 'Item ' + (i + 1) + ': ' : '', p = eng ? partOf(cfg, it.part) : null;
          const brand = it.brand.trim().replace(/\s+/g, ' '), spec = it.spec.trim().replace(/\s+/g, ' ');
          if (!it.part.trim()) return err(box, n + (eng ? 'pick the part, or type the new item.' : 'name the material.'));
          if (!MATERIAL_TYPES.includes(it.type)) return err(box, n + 'choose the material type.');
          if (eng && brand.length < 2) return err(box, n + 'give the brand.');
          if (eng && !p && spec.length < 3) return err(box, n + 'give the new item\'s specification.');
          if (!(+it.qty >= 1) || +it.qty !== Math.floor(+it.qty) || +it.qty > 100000) return err(box, n + 'enter the quantity (a whole number).');
          if (it.purpose.trim().length < 3) return err(box, n + 'say why it is needed.');
          const detail = [spec, brand].filter(Boolean).join(', ');
          items.push(eng ? { sku: p ? p.sku : 'Others', material: (p ? p.sku + ' - ' + p.description : it.part.trim()).slice(0, 160), materialType: it.type, category: it.type,
                             brand, specification: spec, itemDetail: detail || (p ? p.description : it.part.trim()), purpose: it.purpose.trim(), quantity: String(+it.qty) }
                         : { material: storeOf(cfg, it.part) ? storeLabel(storeOf(cfg, it.part)).slice(0, 160) : (exactCat(cfg, it.part) || nearCat(cfg, it.part) || { name: it.part.trim() }).name,
                             materialType: it.type, category: it.type, brand, specification: spec, itemDetail: detail, purpose: it.purpose.trim(), quantity: String(+it.qty), unit: it.unit });
        }
        if (!items.length) return err(box, 'Add at least one item.');
        send.disabled = true;
        try {
          const url = cfg.api + '/webhook/okl/request';           // the server checks who may raise it, the date and the week, and takes the name and e-mail from the account
          const r = await post(url, { department: cfg.department, requirementDate: st.date, items });
          const batch = /Batch:\s*(\S+)/.exec(r.text || '');
          cfg.toast('Request sent for approval', items.length + ' item' + (items.length === 1 ? '' : 's') + (batch ? ' · ' + batch[1] : ''), 'ok', 7000);
          delete STATES['req:' + cfg.department];
          delete CATS[cfg.department];                            // the week's numbers changed
          if (cfg.onSent) cfg.onSent();
        } catch (e) { err(box, 'Not sent: ' + e.message); send.disabled = false; delete CATS[cfg.department]; loadCatalog(cfg, showWeek); }
      };
    }
    return { html, bind };
  }
  /* ---------------- Overtime ---------------- */
  const groupNew = () => ({ start: '', end: '', duty: '', ids: [] });
  const RESULT = { ok: 'saved', duplicate: 'already recorded for that day', not_in_department: 'not in this department', not_found: 'not found', bad_time: 'times not valid', repeated: 'ticked twice' };
  const mins = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; };
  // 16 Nov 2026 (078): only a night shift runs past midnight (an end earlier than the start is the next morning, at most 16 h).
  // Without "Night shift" the end must be after the start, as the server checks.
  const NIGHT_MAX = 16 * 60;
  const pastMidnight = g => { const a = mins(g.start), b = mins(g.end); return a != null && b != null && b < a; };
  // the day under "To" on a night shift: the next morning, unless the end typed is later the same evening (e.g. 18:00 to 23:30)
  const sameEvening = g => { const a = mins(g.start), b = mins(g.end); return a != null && b != null && b > a; };
  // hours each person worked in the group, or null when not set yet / not valid
  const hoursOf = (g, night) => { const a = mins(g.start), b = mins(g.end); if (a == null || b == null || a === b) return null;
    const m = b > a ? b - a : night ? 1440 - a + b : null; return m == null || (night && m > NIGHT_MAX) ? null : Math.round((m / 60) * 100) / 100; };
  const dayName = iso => { const d = new Date(String(iso || '') + 'T12:00:00Z'); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); };
  const dayType = st => { if (!st.date) return ''; const t = st.holiday ? 'a public holiday' : [0, 6].includes(new Date(st.date + 'T12:00:00Z').getUTCDay()) ? 'a weekend' : 'a weekday'; return st.night ? t + ' night shift' : t; };
  // the line under "To": the hours, or what is wrong with the times
  const hoursHint = (st, g) => { const h = hoursOf(g, st.night);
    if (h != null) return h + ' h each' + (st.night && pastMidnight(g) ? ' · ends ' + dayName(addDays(st.date, 1)) + ' morning' : '');
    if (!g.start || !g.end) return st.night ? 'An end earlier than "From" is the next morning.' : '';
    if (g.start === g.end) return 'The start and end are the same.';
    return st.night ? 'Longer than 16 hours: check the times.' : 'Ran past midnight? Tick "Night shift" above.'; };
  const inGroup = (st, id, except) => st.groups.findIndex((x, j) => j !== except && x.ids.includes(id)) + 1;    // 0 = in no other group
  function groupHtml(cfg, st, g, i, n) {
    const endDay = st.night && st.date ? dayName(sameEvening(g) ? st.date : addDays(st.date, 1)) : '';
    return `<div class="card ot-group" style="margin-bottom:10px"><div class="card-b">
      <div class="row between" style="margin-bottom:6px"><span class="strong">Group ${i + 1}</span>${n > 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-ot-rm="${i}">Remove</button>` : ''}</div>
      <div class="grid g3 ot-when">
        <div class="field"><label>From${st.night && st.date ? ` <span class="muted" style="font-weight:500">· ${esc(dayName(st.date))}</span>` : ''}</label><input class="inp" type="time" data-ot="start" data-i="${i}" value="${esc(g.start)}"></div>
        <div class="field"><label>To${endDay ? ` <span class="muted" style="font-weight:500" data-ot-endday="${i}">· ${esc(endDay)}</span>` : ''}</label><input class="inp" type="time" data-ot="end" data-i="${i}" value="${esc(g.end)}"><div class="tiny muted" data-ot-h="${i}">${esc(hoursHint(st, g))}</div></div>
        <div class="field"><label>Work done</label><input class="inp" data-ot="duty" data-i="${i}" maxlength="150" value="${esc(g.duty)}" placeholder="e.g. Weekend PM on Kunlong #2"></div></div>
      <div class="field"><span class="lbl">Who worked <span class="muted" style="font-weight:500" data-ot-n="${i}">(${g.ids.length} ticked)</span></span>
        ${(cfg.people || []).length > 12 ? `<input class="inp" type="search" data-ot-find="${i}" placeholder="Find a name..." style="margin-bottom:8px">` : ''}
        <div class="row" data-ot-chips="${i}" style="gap:6px;max-height:260px;overflow:auto">${(cfg.people || []).map(p => { const o = inGroup(st, p.enroll_id, i);
          return `<button type="button" class="chip big-chip ${g.ids.includes(p.enroll_id) ? 'on' : ''}" ${o ? 'disabled style="opacity:.45" title="Already in group ' + o + '"' : ''} data-ot-p="${esc(p.enroll_id)}" data-i="${i}">${esc(p.name)}${o ? ' <span class="tiny">(group ' + o + ')</span>' : ''}</button>`; }).join('')
          || '<span class="small muted">No active staff are listed for ' + esc(cfg.department) + '. HR keeps the staff list.</span>'}</div></div>
      </div></div>`;
  }
  function overtime(cfg) {
    const st = state('ot:' + cfg.department, () => ({ date: today(), holiday: false, night: false, groups: [groupNew()], results: null }));
    const endIso = () => st.date ? addDays(st.date, 1) : '';
    const html = `<form class="ot-form" id="otForm" novalidate>
      <div class="card" style="margin-bottom:12px"><div class="card-b"><div class="grid g3">
        <div class="field"><label for="otDate" data-ot-datelbl>${st.night ? 'Night shift started on' : 'Day of the overtime'}</label><input class="inp" type="date" id="otDate" max="${today()}" min="${addDays(today(), -31)}" value="${esc(st.date)}"></div>
        <div class="field ${st.night ? '' : 'hide'}" data-ot-endbox><label for="otEnd">Ended on (next morning)</label><input class="inp" type="date" id="otEnd" value="${esc(endIso())}" disabled></div>
        <div class="field"><label>Submitted by</label><input class="inp" value="${esc(cfg.requester)}" disabled></div></div>
        <label class="check"><input type="checkbox" id="otNight" ${st.night ? 'checked' : ''}><span>Night shift<span class="hint">Starts on the day picked and ends the next morning, e.g. 22:00 to 06:00. Logged as a night shift.</span></span></label>
        <label class="check"><input type="checkbox" id="otHol" ${st.holiday ? 'checked' : ''}><span>It was a public holiday<span class="hint">Weekends are worked out by themselves. For a night shift, this is the day it started.</span></span></label>
        <div class="tiny muted" style="margin-top:6px">${esc(cfg.department)}. One group per time and task: tick everyone who worked those hours. It goes to the HR overtime log.</div></div></div>
      <div data-ot-groups>${st.groups.map((g, i) => groupHtml(cfg, st, g, i, st.groups.length)).join('')}</div>
      <div class="small muted" data-ot-sum style="margin:4px 0"></div>
      <button type="button" class="btn btn-ghost" data-ot-add>${ic(cfg, 'plus')} Add another group (other hours or task)</button>
      <div class="err-msg hide" data-rq-err style="margin-top:10px"></div>
      ${st.results ? `<div class="card" style="margin-top:12px"><div class="card-b"><div class="strong" style="margin-bottom:6px">Last submission</div>${st.results.map(r => `<div class="row between small" style="padding:3px 0;border-bottom:1px solid var(--line-2)"><span>${esc(r.name || r.enroll_id)}</span>
          <span class="${r.result === 'ok' ? '' : 'strong'}" style="${r.result === 'ok' ? '' : 'color:var(--danger)'}">${esc(RESULT[r.result] || r.result)}${r.hours != null ? ' · ' + esc(r.hours) + ' h' : ''}${r.day_type ? ' · ' + esc(String(r.day_type).replace('_', ' ')) + (r.night ? ' night shift' : '') : ''}</span></div>`).join('')}</div></div>` : ''}
      <div class="row job-actions" style="gap:10px;margin-top:12px"><button type="button" class="btn btn-primary btn-lg" data-ot-send>${ic(cfg, 'check')} Submit overtime</button></div></form>`;
    function bind() {
      const box = $('#otForm'); if (!box) return;
      const sum = () => { const ppl = st.groups.reduce((n, g) => n + g.ids.length, 0), tot = st.groups.reduce((n, g) => n + (hoursOf(g) || 0) * g.ids.length, 0);
        const e = $('[data-ot-sum]', box); if (e) e.textContent = ppl ? ppl + (ppl === 1 ? ' person, ' : ' people, ') + Math.round(tot * 100) / 100 + ' h in total. Recorded as ' + dayType(st) + '.' : ''; };
      // 14 Nov 2026: ticking a name updates the chips where they are (the list keeps its scroll and its "Find a name")
      const chips = () => {
        $$('[data-ot-p]', box).forEach(c => { const i = +c.dataset.i, k = c.dataset.otP, o = inGroup(st, k, i), p = (cfg.people || []).find(x => x.enroll_id === k);
          c.classList.toggle('on', st.groups[i].ids.includes(k)); c.disabled = !!o; c.style.opacity = o ? '.45' : ''; c.title = o ? 'Already in group ' + o : '';
          c.innerHTML = esc(p ? p.name : k) + (o ? ' <span class="tiny">(group ' + o + ')</span>' : ''); });
        st.groups.forEach((g, i) => { const e = $(`[data-ot-n="${i}"]`, box); if (e) e.textContent = '(' + g.ids.length + ' ticked)'; });
      };
      const draw = () => { $('[data-ot-groups]', box).innerHTML = st.groups.map((g, i) => groupHtml(cfg, st, g, i, st.groups.length)).join(''); wire(); sum(); };
      const wire = () => {
        $$('[data-ot]', box).forEach(el => { el.oninput = el.onchange = () => { const g = st.groups[+el.dataset.i]; g[el.dataset.ot] = el.value;
          if (el.dataset.ot !== 'duty') { const i = el.dataset.i, e = $(`[data-ot-h="${i}"]`, box), d = $(`[data-ot-endday="${i}"]`, box);
            if (e) e.textContent = hoursHint(st, g);
            if (d) d.textContent = '· ' + dayName(sameEvening(g) ? st.date : endIso()); }
          sum(); }; });
        $$('[data-ot-find]', box).forEach(inp => inp.oninput = () => { const q = inp.value.trim().toLowerCase();
          $$(`[data-ot-chips="${inp.dataset.otFind}"] [data-ot-p]`, box).forEach(c => { c.style.display = !q || c.textContent.toLowerCase().includes(q) || c.classList.contains('on') ? '' : 'none'; }); });
        $$('[data-ot-p]', box).forEach(b => b.onclick = () => { const g = st.groups[+b.dataset.i], k = b.dataset.otP;
          g.ids = g.ids.includes(k) ? g.ids.filter(x => x !== k) : g.ids.concat(k); chips(); sum(); });   // in place: a redraw jumped back to the top
        $$('[data-ot-rm]', box).forEach(b => b.onclick = () => { st.groups.splice(+b.dataset.otRm, 1); draw(); });
      };
      // night shift: the second date (the next morning) shows, and each group's times carry their day
      const nightUi = () => { $('[data-ot-endbox]', box).classList.toggle('hide', !st.night); $('#otEnd', box).value = endIso();
        $('[data-ot-datelbl]', box).textContent = st.night ? 'Night shift started on' : 'Day of the overtime'; draw(); };
      $('#otDate', box).onchange = e => { st.date = e.target.value; nightUi(); };
      $('#otNight', box).onchange = e => { st.night = e.target.checked; nightUi(); };
      $('#otHol', box).onchange = e => { st.holiday = e.target.checked; sum(); };
      $('[data-ot-add]', box).onclick = () => { st.groups.push(groupNew()); draw(); };
      wire(); sum();
      const send = $('[data-ot-send]', box);
      send.onclick = async () => {
        err(box, '');
        if (!st.date || st.date > today() || st.date < addDays(today(), -31)) return err(box, st.night ? 'Pick the day the night shift started (within the last 31 days).' : 'Pick the day of the overtime (within the last 31 days).');
        const groups = [];
        for (let i = 0; i < st.groups.length; i++) {
          const g = st.groups[i], n = st.groups.length > 1 ? 'Group ' + (i + 1) + ': ' : '';
          if (!g.start || !g.end) return err(box, n + 'enter the start and end times.');
          if (g.start === g.end) return err(box, n + 'the start and end times are the same.');
          if (hoursOf(g, st.night) == null) return err(box, n + (st.night ? 'a night shift can run at most 16 hours into the next morning. Check the times.'
            : 'the end is before the start. If the work ran past midnight, tick "Night shift".'));
          if (g.duty.trim().length < 3) return err(box, n + 'say what work was done.');
          if (!g.ids.length) return err(box, n + 'tick who worked.');
          groups.push({ start: g.start, end: g.end, duty: g.duty.trim(), enroll_ids: g.ids });
        }
        const seen = {}, twice = groups.flatMap(g => g.enroll_ids).find(id => (seen[id] = (seen[id] || 0) + 1) > 1);
        if (twice) return err(box, ((cfg.people || []).find(p => p.enroll_id === twice) || { name: twice }).name + ' is ticked in two groups. One entry per person per day.');
        send.disabled = true;
        try {
          const r = await post(cfg.api + '/webhook/okl/overtime', { department: cfg.department, date: st.date, holiday: st.holiday, night: st.night, groups });
          if (r.success === false && !(r.results || []).length) throw new Error(r.error || 'Not saved.');
          const bad = (r.results || []).filter(x => x.result !== 'ok');
          cfg.toast(r.saved ? 'Overtime submitted' : 'Nothing was saved', (r.saved || 0) + ' saved' + (bad.length ? ', ' + bad.length + ' not (see below)' : ''), bad.length ? 'err' : 'ok', 8000);
          const keep = { results: r.results || [] };
          delete STATES['ot:' + cfg.department];
          if (bad.length) Object.assign(state('ot:' + cfg.department, () => ({ date: st.date, holiday: st.holiday, night: st.night, groups: [groupNew()], results: null })), keep);
          else state('ot:' + cfg.department, () => ({ date: today(), holiday: false, night: false, groups: [groupNew()], results: keep.results }));
          if (cfg.onSent) cfg.onSent();
        } catch (e) { err(box, 'Not submitted: ' + e.message); send.disabled = false; }
      };
    }
    return { html, bind };
  }

  /* ---------------- the page every console shows (same words, same order everywhere) ---------------- */
  const TITLES = { item: 'Make a procurement request', overtime: 'Submit overtime' };
  const LEDE = {
    item: 'Spare parts or any other item, to Procurement for approval. Pick a part from the list and its details fill in; type a new item and describe it.',
    overtime: 'Overtime worked by your department, to the HR overtime log. The HR Manager is told of the day\'s submissions at midday.',
  };
  const fmtDay = v => { const d = new Date(v); return isNaN(d) ? String(v || '') : d.toLocaleString('en-GB', { timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  // rows are the same shape in every console (each maps its own data to it):
  //   requisitions: [{batch_id, created_at, requester, requirement_date, status ('Decided' | 'With the ...'), decided, items: [{material, detail, qty, status}]}]
  //   overtime: [{date, day_type, name, start, end, hours, duty, submitted_by, status}]
  // long lists stay short: the newest few, "Show all" for the rest (a phone page must not run for screens)
  const SHOW = {};
  window.oklRqShow = k => { SHOW[k] = true; if (window.render) window.render(); };
  const more = (k, total, n) => total > n && !SHOW[k] ? `<div class="card-b" data-rq-more="${k}"><button type="button" class="btn btn-ghost btn-sm" onclick="oklRqShow('${k}')">Show all ${total}</button></div>` : '';
  function recentRequisitions(rows, title) {
    rows = rows || []; const n = SHOW.req ? rows.length : 8;
    return `<div class="card" style="margin-top:18px"><div class="card-h"><div><h3>${esc(title || 'Sent in the last 90 days')}</h3></div></div>${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Request</th><th>Items</th><th>Needed by</th><th>Status</th></tr></thead><tbody>${rows.slice(0, n).map(b => `<tr>
      <td data-label="Request" class="mono small">${esc(b.batch_id)}<div class="tiny muted">${esc(fmtDay(b.created_at))} · ${esc(b.requester || '')}</div></td>
      <td data-label="Items" class="small">${(b.items || []).map(i => `<div>${esc(i.material)}${i.detail ? ' · ' + esc(i.detail) : ''} × ${esc(i.qty)}${i.status ? ' <span class="tiny muted">(' + esc(i.status) + ')</span>' : ''}</div>`).join('')}</td>
      <td data-label="Needed by" class="small">${esc(b.requirement_date || '')}</td>
      <td data-label="Status"><span class="badge ${b.decided ? 'b-ok' : 'b-warn'}">${esc(b.status || '')}</span></td></tr>`).join('')}</tbody></table></div>${more('req', rows.length, n)}` : '<div class="card-b small muted">None yet.</div>'}</div>`;
  }
  // one line per day and submission (people, hours, who), not one row per person
  function recentOvertime(rows, title) {
    rows = rows || [];
    const by = {};
    rows.forEach(o => { const k = o.date + '|' + (o.submitted_by || ''); const g = by[k] = by[k] || { date: o.date, day_type: o.day_type, night: o.night === true, submitted_by: o.submitted_by, names: [], hours: 0, duty: o.duty, start: o.start, end: o.end }; g.names.push(o.name); g.hours += Number(o.hours) || 0; });
    // an end earlier than the start can only be a night shift (078): it ended the next morning
    const overnight = g => !!(g.start && g.end) && String(g.end).slice(0, 5) < String(g.start).slice(0, 5);
    const list = Object.values(by).sort((x, y) => String(y.date).localeCompare(String(x.date))), n = SHOW.ot ? list.length : 8;
    return `<div class="card" style="margin-top:18px"><div class="card-h"><div><h3>${esc(title || 'Overtime, last 31 days')}</h3></div></div>${list.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Day</th><th>Who</th><th>Time</th><th style="text-align:right">Total hours</th><th>Submitted by</th></tr></thead><tbody>${list.slice(0, n).map(g => `<tr>
      <td data-label="Day" class="small">${esc(String(g.date).slice(0, 10))}${g.day_type ? `<div class="tiny muted">${esc(String(g.day_type).replace('_', ' '))}${g.night || overnight(g) ? ' night shift' : ''}</div>` : ''}</td>
      <td data-label="Who" class="small">${esc(g.names.length + (g.names.length === 1 ? ' person: ' : ' people: ') + g.names.slice(0, 3).join(', ') + (g.names.length > 3 ? ' and ' + (g.names.length - 3) + ' more' : ''))}</td>
      <td data-label="Time" class="mono small">${esc(String(g.start || '').slice(0, 5))} - ${esc(String(g.end || '').slice(0, 5))}${overnight(g) ? ' <span class="tiny muted">+1 day</span>' : ''}</td><td data-label="Hours" style="text-align:right">${Math.round(g.hours * 100) / 100}</td>
      <td data-label="Submitted by" class="small">${esc(g.submitted_by || '')}</td></tr>`).join('')}</tbody></table></div>${more('ot', list.length, n)}` : '<div class="card-b small muted">None in the last 31 days.</div>'}</div>`;
  }
  /* page(kind, cfg, recent): kind 'item' | 'overtime'. cfg as for the forms, plus
       departments [names] and onDept(name) when the person may raise for more than one department (a picker shows first),
       lede (optional replacement text). Returns { title, lede, html, bind } for the console to put in its page frame. */
  function page(kind, cfg, recent) {
    // only one department to choose from: it is that one (no picker, and the request must still carry it)
    if (!cfg.department && (cfg.departments || []).length === 1) cfg = Object.assign({}, cfg, { department: cfg.departments[0] });
    const f = kind === 'overtime' ? overtime(cfg) : requisition(cfg);
    const many = (cfg.departments || []).length > 1;
    const picker = many ? `<div class="field" style="max-width:360px;margin-bottom:12px"><label for="rqDept">Department</label><select class="inp" id="rqDept"><option value="">Choose your department...</option>
      ${cfg.departments.map(x => `<option ${x === cfg.department ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>` : '';
    const body = many && !cfg.department ? '<div class="notice">Choose the department first: the request goes to that department\'s approvers.</div>'
      : f.html + (cfg.noRecent ? '' : kind === 'overtime' ? recentOvertime(recent, cfg.recentTitle) : recentRequisitions(recent, cfg.recentTitle));
    const bind = () => {
      const sel = $('#rqDept'); if (sel) sel.onchange = () => { if (cfg.onDept) cfg.onDept(sel.value); };
      if (!many || cfg.department) f.bind();
    };
    return { title: TITLES[kind], lede: cfg.lede || LEDE[kind], html: picker + body, bind };
  }

  // a request started from another page ("Request more" in the Production store): the form opens with these items filled in
  function prefill(department, items) {
    STATES['req:' + department] = { date: '', items: (items || []).map(x => Object.assign(itemNew(), x)) };   // the date: 1 month ahead (requisition)
  }
  window.oklRequests = { requisition, overtime, page, recentRequisitions, recentOvertime, state, prefill, TITLES, LEDE, MATERIAL_TYPES, UNIT_OF_STORE };
})();
