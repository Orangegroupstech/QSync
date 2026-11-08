/* Requests from a console (7 Nov 2026): "Make a procurement request" (spares or any other item, to Procurement) and "Submit overtime" (to HR),
   one design for every console. Loaded by a console's index.html before app.js; Engineering uses it first. Another console
   (QSync...) uses the same two forms with its own department, so the pages look and behave the same everywhere.

   The forms send to the same public addresses as the hosted forms, so the approvals, e-mails, Google Sheets and the HR
   overtime log are unchanged:
     POST <api>/webhook/procurement/intake?flow=engineering   {name, requirementDate, items: [{sku, itemDetail, category, materialType, purpose, quantity}]}
     POST <api>/webhook/procurement/intake                    {name, department, requirementDate, items: [{material, itemDetail, category, purpose, quantity, unit}]}
     POST <api>/webhook/employees/overtime-submit              {department, date, holiday, submitted_by, groups: [{start, end, duty, enroll_ids}]}

   oklRequests.requisition(cfg) and oklRequests.overtime(cfg) return { html, bind() } for a console page.
   cfg: { api, department, flow ('engineering' | 'dept'), requester, parts [{sku, description, brand, part_number}] (Engineering: the
          store list; picking one fills the description, the material type and the category, as the hosted form does),
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

  // the choices of the hosted requisition form (Procurement - Requisitions), kept the same
  const CATEGORIES = ['Spare part', 'Change part', 'Fabrication', 'Consumable', 'Tool / Equipment', 'Safety Equipment', 'Building Materials', 'Other'];
  const MATERIAL_TYPES = ['Electrical Part', 'Mechanical Part', 'Pneumatic Part', 'Accessories Part', 'Chemical', 'Tools'];
  const UNITS = ['Pieces', 'Sets', 'Pairs', 'Boxes', 'Packs', 'Rolls', 'Litres', 'Kg', 'Metres'];
  const TYPE_OF_SKU = { MP: 'Mechanical Part', EP: 'Electrical Part', PP: 'Pneumatic Part', AP: 'Accessories Part', CH: 'Chemical', TG: 'Tools' };

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

  /* ---------------- Make a request (requisition) ---------------- */
  const itemNew = () => ({ part: '', detail: '', category: '', type: '', purpose: '', qty: '', unit: 'Pieces' });
  function partOf(cfg, text) {
    const m = /^\s*([A-Z]{2}) ?(\d{3,4})\b/.exec(String(text || '').toUpperCase());
    return m ? (cfg.parts || []).find(p => p.sku === m[1] + ' ' + m[2]) : null;
  }
  // the materials this department has asked for before (server list, one per name); a picked name fills the rest, a near-miss spelling is corrected on send
  const CATS = {};
  const catOf = cfg => (CATS[cfg.department] && CATS[cfg.department].items) || [];
  const lev = (a, b) => { const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 9; let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; } return prev[n]; };
  const normName = t => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const exactCat = (cfg, t) => catOf(cfg).find(c => c.name.toLowerCase() === String(t || '').trim().toLowerCase());
  const nearCat = (cfg, t) => { const k = normName(t); if (k.length < 4) return null; return catOf(cfg).find(c => normName(c.name) === k) || catOf(cfg).find(c => { const d = lev(normName(c.name), k); return d > 0 && d <= 2; }) || null; };
  const infoDept = (cfg, t) => { t = String(t || '').trim(); if (!t) return ''; if (exactCat(cfg, t)) return 'Asked for before: the details are filled in.'; const n = nearCat(cfg, t); return n ? 'Did you mean "' + esc(n.name) + '"? It is used on send, so one item keeps one spelling.' : 'New item: it joins this department\'s list once requested.'; };
  async function loadCatalog(cfg, then) {
    if (cfg.flow === 'engineering' || !cfg.api || CATS[cfg.department]) return;
    CATS[cfg.department] = { items: [] };
    try {
      const res = await fetch(cfg.api + '/webhook/okl/catalog?department=' + encodeURIComponent(cfg.department), { headers: { Authorization: (function () { try { return sessionStorage.getItem('okl.token') || ''; } catch (e) { return ''; } })() } });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.items) { CATS[cfg.department] = { items: j.items }; if (then) then(); } else delete CATS[cfg.department];
    } catch (e) { delete CATS[cfg.department]; }
  }
  function itemHtml(cfg, it, i, n) {
    const eng = cfg.flow === 'engineering', p = eng ? partOf(cfg, it.part) : null;
    return `<div class="card rq-item" style="margin-bottom:10px"><div class="card-b">
      <div class="row between" style="margin-bottom:6px"><span class="strong">Item ${i + 1}</span>${n > 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-rq-rm="${i}">Remove</button>` : ''}</div>
      <div class="field"><label>${eng ? 'Part (from the store list, or type a new item)' : 'Material'}</label>
        <input class="inp" data-rq="part" data-i="${i}" list="rqParts" autocomplete="off" maxlength="160" value="${esc(it.part)}" placeholder="${eng ? 'Type the SKU or the part name' : 'Type to pick one asked for before, or a new item'}">
        ${!eng ? `<div class="tiny muted" data-rq-info="${i}">${infoDept(cfg, it.part)}</div>` : ''}
        ${eng ? `<div class="tiny muted" data-rq-info="${i}">${p ? 'Store part ' + esc(p.sku) + '.' : it.part.trim() ? 'Not in the store list: sent as a new item ("Others"); describe it below.' : ''}</div>` : ''}</div>
      <div class="field"><label>Description (specification, brand)${eng && !p ? '' : ' (optional)'}</label><input class="inp" data-rq="detail" data-i="${i}" maxlength="300" value="${esc(it.detail)}" placeholder="e.g. SKF 6205 2RS, 25 mm bore"></div>
      <div class="grid g2">
        <div class="field"><label>Category</label><select class="inp" data-rq="category" data-i="${i}">${opts(CATEGORIES, it.category, 'Choose...')}</select></div>
        ${eng ? `<div class="field"><label>Material type</label><select class="inp" data-rq="type" data-i="${i}">${opts(MATERIAL_TYPES, it.type, 'Choose...')}</select></div>`
              : `<div class="field"><label>Unit</label><select class="inp" data-rq="unit" data-i="${i}">${opts(UNITS, it.unit)}</select></div>`}
        <div class="field"><label>Quantity</label><input class="inp" type="number" min="1" step="1" data-rq="qty" data-i="${i}" value="${esc(it.qty)}"></div>
        <div class="field"><label>Why it is needed</label><input class="inp" data-rq="purpose" data-i="${i}" maxlength="300" value="${esc(it.purpose)}" placeholder="e.g. Kunlong #2 sealing jaw"></div>
      </div></div></div>`;
  }
  function requisition(cfg) {
    const st = state('req:' + cfg.department, () => ({ date: addDays(today(), 7), items: [itemNew()] }));
    const eng = cfg.flow === 'engineering';
    const html = `<form class="rq-form" id="rqForm" novalidate>
      <div class="card" style="margin-bottom:12px"><div class="card-b"><div class="grid g2">
        <div class="field"><label>Requested by</label><input class="inp" value="${esc(cfg.requester)}" disabled></div>
        <div class="field"><label for="rqDate">Needed by</label><input class="inp" type="date" id="rqDate" min="${today()}" value="${esc(st.date)}"></div></div>
        <div class="tiny muted">${esc(cfg.department)}. It goes for approval as the ${eng ? 'Engineering requisition (Engineering Manager, Operations Manager, Plant Manager)' : 'department requisition'}; you get the result by e-mail.</div></div></div>
      <div data-rq-items>${st.items.map((it, i) => itemHtml(cfg, it, i, st.items.length)).join('')}</div>
      <button type="button" class="btn btn-ghost" data-rq-add>${ic(cfg, 'plus')} Add another item</button>
      <datalist id="rqParts">${eng ? (cfg.parts || []).map(p => `<option value="${esc(p.sku + ' - ' + p.description)}">`).join('') : catOf(cfg).map(c => `<option value="${esc(c.name)}">`).join('')}</datalist>
      <div class="err-msg hide" data-rq-err style="margin-top:10px"></div>
      <div class="row job-actions" style="gap:10px;margin-top:12px"><button type="button" class="btn btn-primary btn-lg" data-rq-send>${ic(cfg, 'check')} Send for approval</button></div></form>`;
    function bind() {
      const box = $('#rqForm'); if (!box) return;
      const draw = () => { $('[data-rq-items]', box).innerHTML = st.items.map((it, i) => itemHtml(cfg, it, i, st.items.length)).join(''); wire(); };
      const wire = () => {
        $$('[data-rq]', box).forEach(el => { el.oninput = el.onchange = () => {
          const it = st.items[+el.dataset.i], k = el.dataset.rq; it[k] = el.value;
          if (k === 'part' && !eng) {
            const c = exactCat(cfg, el.value);
            if (c) {
              if (!it.detail || it.detail === it.autoDetail) { it.detail = it.autoDetail = c.detail; const dd = $(`[data-rq="detail"][data-i="${el.dataset.i}"]`, box); if (dd) dd.value = it.detail; }
              if (!it.category && c.category && CATEGORIES.includes(c.category)) { it.category = c.category; const x = $(`[data-rq="category"][data-i="${el.dataset.i}"]`, box); if (x) x.value = it.category; }
              if (c.unit && it.unit === 'Pieces' && UNITS.includes(c.unit)) { it.unit = c.unit; const x = $(`[data-rq="unit"][data-i="${el.dataset.i}"]`, box); if (x) x.value = it.unit; }
            }
            const info = $(`[data-rq-info="${el.dataset.i}"]`, box); if (info) info.innerHTML = infoDept(cfg, el.value);
          }
          if (k === 'part' && eng) {
            const p = partOf(cfg, el.value);
            if (p && !it.type && TYPE_OF_SKU[p.sku.slice(0, 2)]) { it.type = TYPE_OF_SKU[p.sku.slice(0, 2)]; const t = $(`[data-rq="type"][data-i="${el.dataset.i}"]`, box); if (t) t.value = it.type; }
            // the description comes from the store list (name, brand, part number), unless it was typed by hand
            if (p && (!it.detail || it.detail === it.autoDetail)) {
              it.detail = it.autoDetail = [p.description, p.brand, p.part_number ? 'P/N ' + p.part_number : ''].filter(Boolean).join(', ');
              const dd = $(`[data-rq="detail"][data-i="${el.dataset.i}"]`, box); if (dd) dd.value = it.detail;
            } else if (!p && it.autoDetail && it.detail === it.autoDetail) {
              it.detail = it.autoDetail = ''; const dd = $(`[data-rq="detail"][data-i="${el.dataset.i}"]`, box); if (dd) dd.value = '';
            }
            if (p && !it.category) { it.category = 'Spare part'; const c = $(`[data-rq="category"][data-i="${el.dataset.i}"]`, box); if (c) c.value = it.category; }
            const info = $(`[data-rq-info="${el.dataset.i}"]`, box);
            if (info) info.textContent = p ? 'Store part ' + p.sku + '.' : el.value.trim() ? 'Not in the store list: sent as a new item ("Others"); describe it below.' : '';
          } }; });
        $$('[data-rq-rm]', box).forEach(b => b.onclick = () => { st.items.splice(+b.dataset.rqRm, 1); draw(); });
      };
      $('#rqDate', box).onchange = e => { st.date = e.target.value; };
      $('[data-rq-add]', box).onclick = () => { st.items.push(itemNew()); draw(); const p = $$('[data-rq="part"]', box); p[p.length - 1].focus(); };
      wire();
      loadCatalog(cfg, () => { const dl = $('#rqParts'); if (dl) dl.innerHTML = catOf(cfg).map(c => `<option value="${esc(c.name)}">`).join(''); $$('[data-rq-info]', box).forEach(x => { const it = st.items[+x.dataset.rqInfo]; if (it) x.innerHTML = infoDept(cfg, it.part); }); });
      const send = $('[data-rq-send]', box);
      send.onclick = async () => {
        err(box, '');
        if (!st.date || st.date < today()) return err(box, 'Pick the date it is needed by (today or later).');
        if (st.items.length > 30) return err(box, 'At most 30 items in one request.');
        const items = [];
        for (let i = 0; i < st.items.length; i++) {
          const it = st.items[i], n = st.items.length > 1 ? 'Item ' + (i + 1) + ': ' : '', p = eng ? partOf(cfg, it.part) : null;
          if (!it.part.trim()) return err(box, n + (eng ? 'pick the part, or type the new item.' : 'name the material.'));
          if (eng && !p && it.detail.trim().length < 3) return err(box, n + 'describe the new item (specification, brand).');
          if (!it.category) return err(box, n + 'choose the category.');
          if (eng && !it.type) return err(box, n + 'choose the material type.');
          if (!(+it.qty >= 1) || +it.qty !== Math.floor(+it.qty) || +it.qty > 100000) return err(box, n + 'enter the quantity (a whole number).');
          if (it.purpose.trim().length < 3) return err(box, n + 'say why it is needed.');
          items.push(eng ? { sku: p ? p.sku : 'Others', itemDetail: (p ? (it.detail.trim() || p.description) : it.part.trim() + ' - ' + it.detail.trim()), category: it.category, materialType: it.type,
                             purpose: it.purpose.trim(), quantity: String(+it.qty) }
                         : { material: (exactCat(cfg, it.part) || nearCat(cfg, it.part) || { name: it.part.trim() }).name, itemDetail: it.detail.trim(), category: it.category, purpose: it.purpose.trim(), quantity: String(+it.qty), unit: it.unit });
        }
        if (!items.length) return err(box, 'Add at least one item.');
        send.disabled = true;
        try {
          const url = cfg.api + '/webhook/okl/request';           // the server checks who may raise it and takes the name and e-mail from the account
          const r = await post(url, { department: cfg.department, requirementDate: st.date, items });
          const batch = /Batch:\s*(\S+)/.exec(r.text || '');
          cfg.toast('Request sent for approval', items.length + ' item' + (items.length === 1 ? '' : 's') + (batch ? ' · ' + batch[1] : ''), 'ok', 7000);
          delete STATES['req:' + cfg.department];
          if (cfg.onSent) cfg.onSent();
        } catch (e) { err(box, 'Not sent: ' + e.message); send.disabled = false; }
      };
    }
    return { html, bind };
  }

  /* ---------------- Overtime ---------------- */
  const groupNew = () => ({ start: '', end: '', duty: '', ids: [] });
  const RESULT = { ok: 'saved', duplicate: 'already recorded for that day', not_in_department: 'not in this department', not_found: 'not found', bad_time: 'times not valid', repeated: 'ticked twice' };
  const mins = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; };
  // hours each person worked in the group (an end earlier than the start runs past midnight), or null when not set yet
  const hoursOf = g => { const a = mins(g.start), b = mins(g.end); if (a == null || b == null || a === b) return null; return Math.round(((b > a ? b - a : 1440 - a + b) / 60) * 100) / 100; };
  const dayType = st => { if (!st.date) return ''; if (st.holiday) return 'a public holiday'; const d = new Date(st.date + 'T12:00:00Z').getUTCDay(); return d === 0 || d === 6 ? 'a weekend' : 'a weekday'; };
  const inGroup = (st, id, except) => st.groups.findIndex((x, j) => j !== except && x.ids.includes(id)) + 1;    // 0 = in no other group
  function groupHtml(cfg, st, g, i, n) {
    const h = hoursOf(g);
    return `<div class="card ot-group" style="margin-bottom:10px"><div class="card-b">
      <div class="row between" style="margin-bottom:6px"><span class="strong">Group ${i + 1}</span>${n > 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-ot-rm="${i}">Remove</button>` : ''}</div>
      <div class="grid g3 ot-when">
        <div class="field"><label>From</label><input class="inp" type="time" data-ot="start" data-i="${i}" value="${esc(g.start)}"></div>
        <div class="field"><label>To</label><input class="inp" type="time" data-ot="end" data-i="${i}" value="${esc(g.end)}"><div class="tiny muted" data-ot-h="${i}">${h == null ? 'Earlier than "From"? It ends the next day.' : h + ' h each'}</div></div>
        <div class="field"><label>Work done</label><input class="inp" data-ot="duty" data-i="${i}" maxlength="150" value="${esc(g.duty)}" placeholder="e.g. Weekend PM on Kunlong #2"></div></div>
      <div class="field"><span class="lbl">Who worked <span class="muted" style="font-weight:500">(${g.ids.length} ticked)</span></span>
        ${(cfg.people || []).length > 12 ? `<input class="inp" type="search" data-ot-find="${i}" placeholder="Find a name..." style="margin-bottom:8px">` : ''}
        <div class="row" data-ot-chips="${i}" style="gap:6px;max-height:260px;overflow:auto">${(cfg.people || []).map(p => { const o = inGroup(st, p.enroll_id, i);
          return `<button type="button" class="chip big-chip ${g.ids.includes(p.enroll_id) ? 'on' : ''}" ${o ? 'disabled style="opacity:.45" title="Already in group ' + o + '"' : ''} data-ot-p="${esc(p.enroll_id)}" data-i="${i}">${esc(p.name)}${o ? ' <span class="tiny">(group ' + o + ')</span>' : ''}</button>`; }).join('')
          || '<span class="small muted">No active staff are listed for ' + esc(cfg.department) + '. HR keeps the staff list.</span>'}</div></div>
      </div></div>`;
  }
  function overtime(cfg) {
    const st = state('ot:' + cfg.department, () => ({ date: today(), holiday: false, groups: [groupNew()], results: null }));
    const html = `<form class="ot-form" id="otForm" novalidate>
      <div class="card" style="margin-bottom:12px"><div class="card-b"><div class="grid g2">
        <div class="field"><label for="otDate">Day of the overtime</label><input class="inp" type="date" id="otDate" max="${today()}" min="${addDays(today(), -31)}" value="${esc(st.date)}"></div>
        <div class="field"><label>Submitted by</label><input class="inp" value="${esc(cfg.requester)}" disabled></div></div>
        <label class="check"><input type="checkbox" id="otHol" ${st.holiday ? 'checked' : ''}><span>It was a public holiday<span class="hint">Weekends are worked out by themselves.</span></span></label>
        <div class="tiny muted" style="margin-top:6px">${esc(cfg.department)}. One group per time and task: tick everyone who worked those hours. It goes to the HR overtime log.</div></div></div>
      <div data-ot-groups>${st.groups.map((g, i) => groupHtml(cfg, st, g, i, st.groups.length)).join('')}</div>
      <div class="small muted" data-ot-sum style="margin:4px 0"></div>
      <button type="button" class="btn btn-ghost" data-ot-add>${ic(cfg, 'plus')} Add another group (other hours or task)</button>
      <div class="err-msg hide" data-rq-err style="margin-top:10px"></div>
      ${st.results ? `<div class="card" style="margin-top:12px"><div class="card-b"><div class="strong" style="margin-bottom:6px">Last submission</div>${st.results.map(r => `<div class="row between small" style="padding:3px 0;border-bottom:1px solid var(--line-2)"><span>${esc(r.name || r.enroll_id)}</span>
          <span class="${r.result === 'ok' ? '' : 'strong'}" style="${r.result === 'ok' ? '' : 'color:var(--danger)'}">${esc(RESULT[r.result] || r.result)}${r.hours != null ? ' · ' + esc(r.hours) + ' h' : ''}${r.day_type ? ' · ' + esc(r.day_type) : ''}</span></div>`).join('')}</div></div>` : ''}
      <div class="row job-actions" style="gap:10px;margin-top:12px"><button type="button" class="btn btn-primary btn-lg" data-ot-send>${ic(cfg, 'check')} Submit overtime</button></div></form>`;
    function bind() {
      const box = $('#otForm'); if (!box) return;
      const sum = () => { const ppl = st.groups.reduce((n, g) => n + g.ids.length, 0), tot = st.groups.reduce((n, g) => n + (hoursOf(g) || 0) * g.ids.length, 0);
        const e = $('[data-ot-sum]', box); if (e) e.textContent = ppl ? ppl + (ppl === 1 ? ' person, ' : ' people, ') + Math.round(tot * 100) / 100 + ' h in total. Recorded as ' + dayType(st) + '.' : ''; };
      const draw = () => { $('[data-ot-groups]', box).innerHTML = st.groups.map((g, i) => groupHtml(cfg, st, g, i, st.groups.length)).join(''); wire(); sum(); };
      const wire = () => {
        $$('[data-ot]', box).forEach(el => { el.oninput = el.onchange = () => { const g = st.groups[+el.dataset.i]; g[el.dataset.ot] = el.value;
          const h = hoursOf(g), e = $(`[data-ot-h="${el.dataset.i}"]`, box); if (e && el.dataset.ot !== 'duty') e.textContent = h == null ? 'Earlier than "From"? It ends the next day.' : h + ' h each'; sum(); }; });
        $$('[data-ot-find]', box).forEach(inp => inp.oninput = () => { const q = inp.value.trim().toLowerCase();
          $$(`[data-ot-chips="${inp.dataset.otFind}"] [data-ot-p]`, box).forEach(c => { c.style.display = !q || c.textContent.toLowerCase().includes(q) || c.classList.contains('on') ? '' : 'none'; }); });
        $$('[data-ot-p]', box).forEach(b => b.onclick = () => { const g = st.groups[+b.dataset.i], k = b.dataset.otP;
          g.ids = g.ids.includes(k) ? g.ids.filter(x => x !== k) : g.ids.concat(k); draw(); });
        $$('[data-ot-rm]', box).forEach(b => b.onclick = () => { st.groups.splice(+b.dataset.otRm, 1); draw(); });
      };
      $('#otDate', box).onchange = e => { st.date = e.target.value; sum(); };
      $('#otHol', box).onchange = e => { st.holiday = e.target.checked; sum(); };
      $('[data-ot-add]', box).onclick = () => { st.groups.push(groupNew()); draw(); };
      wire(); sum();
      const send = $('[data-ot-send]', box);
      send.onclick = async () => {
        err(box, '');
        if (!st.date || st.date > today() || st.date < addDays(today(), -31)) return err(box, 'Pick the day of the overtime (within the last 31 days).');
        const groups = [];
        for (let i = 0; i < st.groups.length; i++) {
          const g = st.groups[i], n = st.groups.length > 1 ? 'Group ' + (i + 1) + ': ' : '';
          if (!g.start || !g.end) return err(box, n + 'enter the start and end times.');
          if (g.start === g.end) return err(box, n + 'the start and end times are the same.');
          if (g.duty.trim().length < 3) return err(box, n + 'say what work was done.');
          if (!g.ids.length) return err(box, n + 'tick who worked.');
          groups.push({ start: g.start, end: g.end, duty: g.duty.trim(), enroll_ids: g.ids });
        }
        const seen = {}, twice = groups.flatMap(g => g.enroll_ids).find(id => (seen[id] = (seen[id] || 0) + 1) > 1);
        if (twice) return err(box, ((cfg.people || []).find(p => p.enroll_id === twice) || { name: twice }).name + ' is ticked in two groups. One entry per person per day.');
        send.disabled = true;
        try {
          const r = await post(cfg.api + '/webhook/okl/overtime', { department: cfg.department, date: st.date, holiday: st.holiday, groups });
          if (r.success === false && !(r.results || []).length) throw new Error(r.error || 'Not saved.');
          const bad = (r.results || []).filter(x => x.result !== 'ok');
          cfg.toast(r.saved ? 'Overtime submitted' : 'Nothing was saved', (r.saved || 0) + ' saved' + (bad.length ? ', ' + bad.length + ' not (see below)' : ''), bad.length ? 'err' : 'ok', 8000);
          const keep = { results: r.results || [] };
          delete STATES['ot:' + cfg.department];
          if (bad.length) Object.assign(state('ot:' + cfg.department, () => ({ date: st.date, holiday: st.holiday, groups: [groupNew()], results: null })), keep);
          else state('ot:' + cfg.department, () => ({ date: today(), holiday: false, groups: [groupNew()], results: keep.results }));
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
    rows.forEach(o => { const k = o.date + '|' + (o.submitted_by || ''); const g = by[k] = by[k] || { date: o.date, day_type: o.day_type, submitted_by: o.submitted_by, names: [], hours: 0, duty: o.duty, start: o.start, end: o.end }; g.names.push(o.name); g.hours += Number(o.hours) || 0; });
    const list = Object.values(by).sort((x, y) => String(y.date).localeCompare(String(x.date))), n = SHOW.ot ? list.length : 8;
    return `<div class="card" style="margin-top:18px"><div class="card-h"><div><h3>${esc(title || 'Overtime, last 31 days')}</h3></div></div>${list.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Day</th><th>Who</th><th>Time</th><th style="text-align:right">Total hours</th><th>Submitted by</th></tr></thead><tbody>${list.slice(0, n).map(g => `<tr>
      <td data-label="Day" class="small">${esc(String(g.date).slice(0, 10))}${g.day_type ? `<div class="tiny muted">${esc(String(g.day_type).replace('_', ' '))}</div>` : ''}</td>
      <td data-label="Who" class="small">${esc(g.names.length + (g.names.length === 1 ? ' person: ' : ' people: ') + g.names.slice(0, 3).join(', ') + (g.names.length > 3 ? ' and ' + (g.names.length - 3) + ' more' : ''))}</td>
      <td data-label="Time" class="mono small">${esc(String(g.start || '').slice(0, 5))} - ${esc(String(g.end || '').slice(0, 5))}</td><td data-label="Hours" style="text-align:right">${Math.round(g.hours * 100) / 100}</td>
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

  window.oklRequests = { requisition, overtime, page, recentRequisitions, recentOvertime, state, TITLES, LEDE, CATEGORIES, MATERIAL_TYPES };
})();
