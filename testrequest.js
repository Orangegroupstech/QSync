/* The "New test request" form (8 Nov 2026): ONE form for QSync and the Production console (no copies to drift apart).
   Loaded by a console's index.html before app.js. oklTestRequest.page(cfg) returns { html, bind() } for a console page.
   cfg: { api (base url), products [{name, shelfLifeMonths}] (optional: the QSync product list, used for the expiry shown),
          icons {box, send, info}, toast(title, msg, kind), pageHead(title, lede, actionsHtml), cancelHref, onDone(res) }
   The server (POST admin/api/requests) checks the person may raise it (qsync.requests submit) and works out the request number and
   the expiry itself; what the form shows is only a preview. */
(function () {
  'use strict';
  if (window.oklTestRequest) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r) => (r || document).querySelector(s);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const PRODUCTS_META = {
    Mixagrip: { prefix: 'A', type: 'OSD', defaultBatchSize: 1200000 },
    Procold: { prefix: 'B', type: 'OSD', defaultBatchSize: 1200000 },
    'Cannon Extra': { prefix: 'C', type: 'OSD', defaultBatchSize: 1200000 },
    'Medik 55': { prefix: 'D', type: 'OSD', defaultBatchSize: 1200000 },
    Cypron: { prefix: 'E', type: 'OSD', defaultBatchSize: 600000 },
    Corhinza: { prefix: 'F', type: 'OSD', defaultBatchSize: 600000 },
    'Cannon PM': { prefix: 'G', type: 'OSD', defaultBatchSize: 500000 },
    Zaiki: { prefix: 'H', type: 'OSD', defaultBatchSize: 1200000, noStages: ['Compression'] },
    Mintacid: { prefix: 'I', type: 'OLD' },
  };
  const UNIT_OPTIONS = { OSD: ['kg', 'tablets'], OLD: ['litres'] };
  const STAGE_OPTIONS = {
    OSD: ['Granulation', 'Finished Product'],      // primary packaging is not raised any more (QC, 29 Oct 2026); Compression is raised by IPQA
    OLD: ['Mixing', 'Finished Product'],           // filling/sacheting is skipped (QC, 30 Oct 2026)
  };
  const COMPRESSION_URL = 'https://orangegroupsai.online/webhook/test-request/ipqa?new=compression';
  const thisMonthLagos = () => { const p = {}; new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit' }).formatToParts(new Date()).forEach(x => { p[x.type] = x.value; }); return p.year + '-' + p.month; };
  const newToken = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  let subToken = '';

  function page(cfg) {
    const I = cfg.icons || {};
    const back = cfg.cancelHref || '#/requests';
    const options = Object.keys(PRODUCTS_META).map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
    const head = cfg.pageHead ? cfg.pageHead('Raise a test request', 'Complete the batch details below and submit to IPQA. A unique request number is generated automatically and the expiry date is calculated from the approved shelf life.', `<a class="btn btn-ghost" href="${back}">Cancel</a>`) : '';
    const html = `${head}
    <div class="grid g-2-1">
      <form id="reqForm" class="card" novalidate>
        <div class="card-b">
          <div class="sec-title">${I.box || ''} Product and batch</div>
          <div class="field"><label for="rqProduct">Product name<span class="req">*</span></label>
            <select class="inp" id="rqProduct"><option value="">-- Select a product --</option>${options}</select>
            <div class="err-msg hide" data-err="rqProduct"></div></div>
          <div class="field"><label for="rqBatch">Batch number<span class="req">*</span></label>
            <div class="inp-group"><div class="addon" id="rqPrefix" style="min-width:52px">--</div>
              <input class="inp" id="rqBatch" inputmode="numeric" maxlength="8" placeholder="e.g. 260345 - numeric part only"></div>
            <div class="err-msg hide" data-err="rqBatch"></div></div>
          <div class="grid g2">
            <div class="field"><label for="rqSize">Batch size<span class="req">*</span></label>
              <div class="inp-group"><input class="inp" id="rqSize" inputmode="numeric" placeholder="e.g. 1200000">
                <select class="inp fixed" id="rqUnit" style="max-width:130px" disabled><option value="">Unit</option></select></div>
              <div class="err-msg hide" data-err="rqSize"></div></div>
            <div class="field"><label for="rqMfg">Manufacturing date (month / year)<span class="req">*</span></label>
              <input class="inp" id="rqMfg" type="month"><div class="err-msg hide" data-err="rqMfg"></div></div>
          </div>
          <div class="field"><label for="rqExp">Expiry date (calculated)</label>
            <input class="inp" id="rqExp" type="text" readonly tabindex="-1" placeholder="Select a product and manufacturing date"><div class="hint" id="rqExpHint"></div></div>
          <div class="field"><label for="rqStage">Stage of manufacture<span class="req">*</span></label>
            <select class="inp" id="rqStage" disabled><option value="">-- Select a product first --</option></select>
            <div class="err-msg hide" data-err="rqStage"></div>
            <div class="hint">${I.info || ''}<span>Compression requests are raised by IPQA on the <a href="${COMPRESSION_URL}" target="_blank" rel="noopener">IPQA compression sheet</a>.</span></div></div>
        </div>
        <div class="card-f row end sticky-actions"><a class="btn btn-ghost" href="${back}">Cancel</a>
          <button class="btn btn-primary btn-lg" type="submit">${I.send || ''} Submit request</button></div>
      </form>
      <div class="stack"><div class="card"><div class="card-h"><h3>What happens next</h3></div><div class="card-b"><div class="timeline">
        <div class="tl-item current"><div class="tl-dot">1</div><div class="tl-t">You submit this request</div><div class="tl-m">A request number is generated and IPQA is notified by e-mail.</div></div>
        <div class="tl-item"><div class="tl-dot">2</div><div class="tl-t">IPQA records the results</div><div class="tl-m">Every value is checked against the approved specification.</div></div>
        <div class="tl-item"><div class="tl-dot">3</div><div class="tl-t">QA Supervisor reviews and releases</div><div class="tl-m">Approval notifies QC and generates the QSync sheet.</div></div>
      </div></div></div></div>
    </div>`;

    function bind() {
      const f = $('#reqForm'); if (!f) return;
      if (!subToken) subToken = newToken();
      const err = (id, msg) => { const i = $('#' + id, f), e = $('[data-err="' + id + '"]', f); if (i) i.classList.add('err'); if (e) { e.textContent = msg; e.classList.remove('hide'); } return false; };
      const clear = () => { f.querySelectorAll('.err-msg').forEach(e => { e.classList.add('hide'); e.textContent = ''; }); f.querySelectorAll('.inp.err').forEach(e => e.classList.remove('err')); };
      const expiry = () => {
        const out = $('#rqExp', f), hint = $('#rqExpHint', f), name = $('#rqProduct', f).value, mfg = $('#rqMfg', f).value;
        $('#rqMfg', f).max = thisMonthLagos();
        if (!name || !/^\d{4}-\d{2}$/.test(mfg) || mfg > thisMonthLagos()) { out.value = ''; hint.textContent = mfg > thisMonthLagos() ? 'The manufacturing month cannot be later than this month.' : ''; return; }
        const prod = (cfg.products || []).find(p => p.name === name), months = Number(prod && prod.shelfLifeMonths);
        if (!months) { out.value = ''; out.placeholder = 'Worked out when you submit'; hint.textContent = ''; return; }
        const [y, m] = mfg.split('-').map(Number), total = y * 12 + (m - 1) + months;
        out.value = MONTHS[total % 12] + ' ' + Math.floor(total / 12);
        hint.textContent = 'Calculated from the ' + months + '-month shelf life of ' + name + '.';
      };
      const productChanged = () => {
        const meta = PRODUCTS_META[$('#rqProduct', f).value], unit = $('#rqUnit', f), stage = $('#rqStage', f), size = $('#rqSize', f);
        $('#rqPrefix', f).textContent = meta ? meta.prefix : '--';
        if (size && (!size.value || size.dataset.auto === '1')) { const std = meta && meta.defaultBatchSize ? String(meta.defaultBatchSize) : ''; size.value = std; size.dataset.auto = std ? '1' : ''; }
        expiry();
        if (!meta) { unit.innerHTML = '<option value="">Unit</option>'; unit.disabled = true; stage.innerHTML = '<option value="">-- Select a product first --</option>'; stage.disabled = true; return; }
        unit.innerHTML = UNIT_OPTIONS[meta.type].map(u => `<option value="${u}">${u}</option>`).join(''); unit.disabled = false; unit.value = meta.type === 'OLD' ? 'litres' : 'tablets';
        stage.innerHTML = '<option value="">-- Select a stage --</option>' + STAGE_OPTIONS[meta.type].filter(s => !(meta.noStages || []).includes(s)).map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join(''); stage.disabled = false;
      };
      $('#rqProduct', f).onchange = productChanged;
      $('#rqSize', f).oninput = e => { e.target.dataset.auto = '0'; };
      $('#rqMfg', f).oninput = $('#rqMfg', f).onchange = expiry;
      f.onsubmit = async e => {
        e.preventDefault(); clear();
        const product = $('#rqProduct', f).value, meta = PRODUCTS_META[product];
        if (!product || !meta) return err('rqProduct', 'Select a product.');
        const suffix = $('#rqBatch', f).value.trim(); if (!/^[0-9]{1,8}$/.test(suffix)) return err('rqBatch', 'Enter 1 to 8 digits.');
        const size = $('#rqSize', f).value.trim(); if (!size || isNaN(Number(size)) || Number(size) <= 0) return err('rqSize', 'Enter a batch size greater than zero.');
        const unit = $('#rqUnit', f).value; if (!unit) return err('rqSize', 'Select a unit.');
        const stage = $('#rqStage', f).value; if (!stage) return err('rqStage', 'Select a stage.');
        const mfg = $('#rqMfg', f).value; if (!mfg) return err('rqMfg', 'Select a manufacturing month.');
        if (mfg > thisMonthLagos()) return err('rqMfg', 'Manufacturing date cannot be later than the current month.');
        const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
        try {
          const tok = (function () { try { return sessionStorage.getItem('okl.token') || ''; } catch (x) { return ''; } })();
          const body = { product_name: product, batch_no: $('#rqPrefix', f).textContent + suffix, batch_size: size, batch_size_unit: unit, mfg_date: mfg, stage, submission_token: subToken };
          const res = await fetch(cfg.api + '/webhook/admin/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: tok }, body: JSON.stringify(body) });
          const j = await res.json().catch(() => ({}));
          if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
          if (res.status === 403) throw new Error('You cannot raise a test request. Ask an admin to give you "submit" access to Test requests.');
          if (!res.ok || j.error) throw new Error(j.error || j.message || 'The server refused it. Check every field (the manufacturing month cannot be in the future) and try again.');
          subToken = '';
          if (cfg.toast) cfg.toast('Request submitted', (j.requestNo || 'Your request') + ' has been raised and IPQA/QC notified.', 'ok');
          if (window.oklFormKeep && window.oklFormKeep.sent) window.oklFormKeep.sent(body);
          if (cfg.onDone) await cfg.onDone(j);
        } catch (x) {
          if (cfg.toast) cfg.toast('Could not submit this request', x.message, 'err');
        } finally { btn.disabled = false; }
      };
    }
    return { html, bind };
  }
  window.oklTestRequest = { page, PRODUCTS_META };
})();
