/* OKL keep-the-place rule (21 Nov 2026). Loaded BEFORE every console's app.js, so the first drawing of a page can use it
   (it lived in shared.js, which loads last: a fast page drew before it existed -> "oklScrollAfterRender is not a function").
   RULE for every list: a click or a redraw on the same page leaves the page AND each list box (.tbl-wrap, the boxes with the
   fixed headings) where they were, so the clicked line stays under the finger. A new page starts at the top. */
(function () {
  'use strict';
  if (window.oklScrollAfterRender) return;
  let lastRenderPath = null;
  const boxTops = new Map();   // page | box -> [top, left] of each list box, kept while the person scrolls it
  const boxKey = b => {
    const id = b.id || b.getAttribute('data-key') || (b.querySelector('table[id]') || {}).id;
    return (lastRenderPath || location.hash || '#/') + '|' + (id || 'n' + Array.prototype.indexOf.call(document.querySelectorAll('.tbl-wrap'), b));
  };
  document.addEventListener('scroll', e => {
    const b = e.target;
    if (b && b.classList && b.classList.contains('tbl-wrap')) boxTops.set(boxKey(b), [b.scrollTop, b.scrollLeft]);
  }, true);
  const restoreBoxes = root => {
    const boxes = (root.matches && root.matches('.tbl-wrap') ? [root] : []).concat(Array.from(root.querySelectorAll ? root.querySelectorAll('.tbl-wrap') : []));
    for (const b of boxes) { const v = boxTops.get(boxKey(b)); if (v) { b.scrollTop = v[0]; b.scrollLeft = v[1]; } }
  };
  // a list box drawn again (whole page or only the list) goes back to where it was
  new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) restoreBoxes(n); })
    .observe(document.documentElement, { childList: true, subtree: true });
  window.oklScrollAfterRender = function (path) {
    const currentPath = String(path == null ? location.hash || '#/' : path);
    const same = currentPath === lastRenderPath;
    const top = same ? window.scrollY : 0;
    if (!same) boxTops.clear();
    lastRenderPath = currentPath;
    window.scrollTo({ top });
  };
})();
