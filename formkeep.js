/* Keep what someone is typing when the screen they are on is drawn again (loaded by each console's index.html, before app.js).
   A console draws a page again when data arrives: a page that refreshes itself, a list that finishes loading late, a save
   elsewhere on the page. Each draw rebuilds the page's boxes from the saved data, which used to clear what was being typed
   (4 Nov 2026: "What was done?" on a job emptied itself while the technician typed).

   render() calls oklFormKeep.take(root, path) before it replaces the page and oklFormKeep.put(snap, root, path) after.
   On the same address, every box that was changed and not saved gets its typed value back, with the cursor where it was.
   Saved means sent: api() calls oklFormKeep.sent(body) after a successful save, and a box whose value went in that save
   is drawn from the server again (an "add" form clears, a saved note shows as saved). A box the server changed under the
   person keeps what they typed: what they typed is what they are about to save.
   Boxes inside pop-ups (#layers) are not touched: pop-ups are not drawn again. */
(function () {
  'use strict';
  if (window.oklFormKeep) return;

  let sentVals = new Set(), sentAny = false;      // values saved since the page was last drawn
  let onScreen = null;                             // the address of the page now on screen (its boxes are what take() reads)

  function leaves(x, out) {
    if (x == null) return out;
    if (typeof x === 'object') { for (const k in x) leaves(x[k], out); return out; }
    out.add(String(x).trim());
    return out;
  }
  function sent(body) {
    sentAny = true;
    if (body != null) leaves(body, sentVals);
  }

  const SKIP = /^(?:hidden|file|submit|button|reset|image|password)$/i;
  function fields(root) {
    return root ? Array.from(root.querySelectorAll('input, textarea, select')).filter(el => !SKIP.test(el.type || '') && !el.closest('[data-nokeep]')) : [];
  }
  // a key that finds the same box in the new page: its id, else its name, else its data- attributes (and its place among boxes like it)
  function keys(list) {
    const seen = {}, out = [];
    for (const el of list) {
      let k = el.id ? '#' + el.id : el.name ? 'n:' + el.name + (el.type === 'radio' || el.type === 'checkbox' ? '=' + el.value : '') : '';
      if (!k) {
        const d = Array.from(el.attributes).filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' ');
        k = el.tagName + '[' + d + '][' + (el.getAttribute('placeholder') || '') + ']';
      }
      seen[k] = (seen[k] || 0) + 1;
      out.push(seen[k] > 1 ? k + '#' + seen[k] : k);
    }
    return out;
  }
  function selDefault(el) {
    const o = Array.from(el.options).filter(x => x.defaultSelected);
    if (el.multiple) return o.map(x => x.value).join('\n');
    return o.length ? o[o.length - 1].value : (el.options[0] ? el.options[0].value : '');
  }
  function selValue(el) { return el.multiple ? Array.from(el.selectedOptions).map(x => x.value).join('\n') : el.value; }
  function state(el) {
    if (el.type === 'checkbox' || el.type === 'radio') return { box: true, now: el.checked, was: el.defaultChecked };
    if (el.tagName === 'SELECT') return { now: selValue(el), was: selDefault(el) };
    return { now: el.value, was: el.defaultValue };
  }

  function take(root, path) {
    const snap = { path: onScreen, vals: {}, focus: null };   // the boxes belong to the page on screen, not to the one about to be drawn
    const list = fields(root), ks = keys(list);
    list.forEach((el, i) => {
      if (el.disabled || el.readOnly) return;
      const s = state(el);
      if (s.now === s.was) return;
      if (s.box ? sentAny : sentVals.has(String(s.now).trim())) return;     // saved: draw it from the server
      snap.vals[ks[i]] = s;
    });
    const a = document.activeElement, ai = a ? list.indexOf(a) : -1;
    if (ai >= 0) {
      snap.focus = ks[ai];
      try { snap.s0 = a.selectionStart; snap.s1 = a.selectionEnd; } catch (e) { /* not a text box */ }
    }
    sentVals = new Set(); sentAny = false;
    return snap;
  }

  function put(snap, root, path) {
    onScreen = path;
    if (!snap || snap.path !== path) return;
    const list = fields(root), ks = keys(list);
    list.forEach((el, i) => {
      const s = snap.vals[ks[i]];
      if (s && !el.disabled && !el.readOnly) {
        if (s.box) el.checked = s.now;
        else if (el.tagName === 'SELECT' && el.multiple) { const v = s.now.split('\n'); Array.from(el.options).forEach(o => { o.selected = v.includes(o.value); }); }
        else if (el.tagName !== 'SELECT' || Array.from(el.options).some(o => o.value === s.now)) el.value = s.now;
      }
      if (snap.focus === ks[i] && !el.disabled) {
        try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
        if (snap.s0 != null) { try { el.setSelectionRange(snap.s0, snap.s1); } catch (e) { /* not a text box */ } }
      }
    });
  }

  window.oklFormKeep = { take, put, sent };
})();
