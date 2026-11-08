/* "My approvals" for every console (7 Nov 2026 unify round, ask 9). Loaded by each console's index.html before app.js.
   One list per console, from one server function (okl_waiting): the page shows its items and the number on the menu is its
   total, so the two cannot disagree. Four buckets: requests to approve, work assigned to me, things I raised that came back,
   and overdue items in my area.
     oklWaiting.count(module)      the number for the menu (0 until loaded; asks for a refresh now and then)
     oklWaiting.page(module)       { html } the My approvals page body (loading / error / the four sections)
     oklWaiting.refresh(module)    load again now
   A console passes its own name ('engineering', 'qsync', 'employees', 'procurement', 'production'). When the numbers change,
   the console's own render() is called (unless a dialog is open). */
(function () {
  'use strict';
  if (window.oklWaiting) return;
  const API = 'https://orangegroupsai.online/webhook/okl/waiting?module=';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const token = () => { try { return sessionStorage.getItem('okl.token') || ''; } catch (e) { return ''; } };
  const C = {};      // module -> { data, at, loading, error }
  const BUCKETS = [
    ['approve', 'To approve', 'Requests that need your decision.', 'check'],
    ['todo', 'Assigned to you', 'Work waiting for you to do.', 'play'],
    ['returned', 'Returned to you', 'Things you raised that were returned or rejected.', 'alert'],
    ['overdue', 'Overdue in your area', 'Waiting too long. Someone may need a nudge.', 'alert'],
  ];

  async function load(module) {
    const c = C[module] = C[module] || {};
    if (c.loading || !token()) return;
    c.loading = true;
    try {
      const res = await fetch(API + encodeURIComponent(module), { headers: { Authorization: token() } });
      if (res.status === 401) { c.error = 'Your session has expired. Please sign in again.'; }
      else {
        const j = await res.json();
        if (!res.ok || j.error) throw new Error(j.error || 'Could not load.');
        const before = JSON.stringify((c.data || {}).counts || null);
        c.data = j; c.error = '';
        if (before !== JSON.stringify(j.counts) && typeof window.render === 'function' && !(document.getElementById('layers') || {}).children?.length) { try { window.render(); } catch (e) { /* ignore */ } }
      }
    } catch (e) { c.error = c.data ? '' : (e.message || 'Could not load.'); }
    c.at = Date.now(); c.loading = false;
    if (window.render && !c.data && /(my-approvals|requests\/approvals)/.test(location.hash)) { try { window.render(); } catch (e) { /* ignore */ } }   // the page shows the error; a failing list never redraws other pages
  }
  function count(module) {
    const c = C[module] = C[module] || {};
    if (!c.loading && (!c.at || Date.now() - c.at > 60000)) load(module);
    return c.data ? Number(c.data.total || 0) : 0;
  }
  function ago(ts) {
    const d = new Date(ts); if (isNaN(d)) return '';
    const h = (Date.now() - d.getTime()) / 3600000;
    return h < 1 ? 'just now' : h < 24 ? Math.floor(h) + ' h ago' : Math.floor(h / 24) + ' day' + (Math.floor(h / 24) === 1 ? '' : 's') + ' ago';
  }
  const href = l => String(l || '').replace(/^\/([a-z]+)\//, (m, mod) => '../' + mod + '/');

  function page(module) {
    const c = C[module] = C[module] || {};
    if (!c.data && !c.error) { if (!c.loading) load(module); return { html: '<div class="card"><div class="card-b small muted">Loading...</div></div>' }; }
    if (!c.data) return { html: `<div class="card"><div class="card-b"><div class="empty"><h4>Could not load</h4><div class="small">${esc(c.error)}</div>
      <div style="margin-top:12px"><button class="btn btn-primary" onclick="oklWaiting.refresh('${esc(module)}')">Try again</button></div></div></div></div>` };
    const d = c.data, items = d.items || [];
    const chips = `<div class="row" style="gap:8px;margin-bottom:14px;flex-wrap:wrap">${BUCKETS.map(b => `<span class="badge ${d.counts[b[0]] ? (b[0] === 'overdue' || b[0] === 'returned' ? 'b-danger' : 'b-warn') : 'b-slate'}">${esc(b[1])}: ${d.counts[b[0]] || 0}</span>`).join('')}
      <button class="btn btn-ghost btn-sm" onclick="oklWaiting.refresh('${esc(module)}')">Refresh</button></div>`;
    if (!items.length) return { html: chips + `<div class="card"><div class="card-b"><div class="empty"><h4>Nothing is waiting for you</h4><div class="small">Requests to approve, work assigned to you, things that came back and overdue items in your area show here, and as a number on the menu.</div></div></div></div>` };
    const sec = b => {
      const list = items.filter(i => i.bucket === b[0]);
      if (!list.length) return '';
      return `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>${esc(b[1])} (${list.length})</h3><div class="sub">${esc(b[2])}</div></div></div><div class="card-b" style="padding-top:4px">
        ${list.map(i => `<div class="row between" style="gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line-2);flex-wrap:nowrap">
          <div style="min-width:0"><div><span class="badge b-slate" style="margin-right:6px">${esc(i.kind)}</span><span class="strong">${esc(i.title)}</span>${i.overdue && b[0] !== 'overdue' ? ' <span class="badge b-danger">Overdue</span>' : ''}</div>
            <div class="small muted" style="margin-top:3px">${esc(i.detail || '')}${i.who ? ' · ' + esc(i.who) : ''}${i.since ? ' · ' + esc(ago(i.since)) : ''}</div></div>
          <a class="btn btn-primary btn-sm" style="flex:0 0 auto" href="${esc(href(i.link))}">Open</a></div>`).join('')}</div></div>`;
    };
    return { html: chips + BUCKETS.map(sec).join('') };
  }

  // how many items of one kind (e.g. 'Overtime') wait: for a tab or a menu item of that page
  function kindCount(module, kind) { count(module); const c = C[module]; return c && c.data ? (c.data.items || []).filter(i => i.kind === kind && i.bucket === 'approve').length : 0; }

  window.oklWaiting = { count, kindCount, page, refresh: m => load(m), load };
  // keep the number fresh while a console is open
  setInterval(() => Object.keys(C).forEach(m => { if (!document.hidden) load(m); }), 90000);
})();
