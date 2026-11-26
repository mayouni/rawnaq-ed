/* Rawnaq Ed on a television: nothing scrolls.
   A page written for the web is a long column. On the television it is cut into screens that each fit the
   glass, and «التالي / السابق» turn them like the screens of a lesson. Moving the focus never moves the page.
   A block taller than the screen is split: a table by its rows, a card by its paragraphs.
   Pages that draw their own television layout (class tv-own) are left alone. */
(function () {
  'use strict';
  var RE = window.RE, el = RE.el, at = {};
  if (!RE.isTv) { RE.tvFit = function () {}; return; }

  function outer(e) { var cs = getComputedStyle(e); return e.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); }
  function shell(b) { var c = b.cloneNode(false); c.removeAttribute('id'); return c; }

  /* cut one block that is taller than the room into several that fit */
  function split(b, room, firstRoom) {
    firstRoom = firstRoom || room;
    var table = b.querySelector('table'), out = [], cur, used, kids, i;
    if (table) {
      var rows = [].slice.call(table.querySelectorAll('tr')), head = rows[0] && rows[0].querySelector('th') ? rows.shift() : null;
      var rowH = rows.length ? Math.max.apply(null, rows.map(function (r) { return r.offsetHeight; })) : 40;
      var extra = outer(b) - table.offsetHeight + (head ? head.offsetHeight : 0), per = Math.max(2, Math.floor((room - extra) / rowH)), per1 = Math.max(1, Math.floor((firstRoom - extra) / rowH)), n = 0;
      var before = [], after = [], seen = false;
      [].slice.call(b.children).forEach(function (k) { if (k === table || k.contains(table)) seen = true; else (seen ? after : before).push(k); });
      for (i = 0; i < rows.length; i += n) {
        n = i === 0 ? per1 : per;
        cur = shell(b); if (i === 0) before.forEach(function (k) { cur.appendChild(k); }); else if (before[0]) cur.appendChild(before[0].cloneNode(true));
        var tb = shell(table); if (head) tb.appendChild(i === 0 ? head : head.cloneNode(true));
        rows.slice(i, i + n).forEach(function (r) { tb.appendChild(r); }); cur.appendChild(tb); out.push(cur);
      }
      if (after.length) { cur = shell(b); after.forEach(function (k) { cur.appendChild(k); }); out.push(cur); }
      return out;
    }
    kids = [].slice.call(b.children);
    if (kids.length < 2) { b.style.maxHeight = room + 'px'; b.style.overflow = 'auto'; return [b]; }
    var hs = kids.map(outer), pad = outer(b) - hs.reduce(function (s, h) { return s + h; }, 0), title = /^H\d$/.test(kids[0].tagName) ? kids[0] : null;
    cur = shell(b); used = pad;
    kids.forEach(function (k, j) {
      if (used + hs[j] > (out.length ? room : firstRoom) && cur.children.length > (title && out.length === 0 ? 1 : 0)) { out.push(cur); cur = shell(b); used = pad; if (title) { cur.appendChild(title.cloneNode(true)); used += hs[0]; } }
      cur.appendChild(k); used += hs[j];
    });
    out.push(cur); return out;
  }

  RE.tvFit = function () {
    var old = document.querySelector('.tvbar'); if (old) old.remove();
    if (document.body.classList.contains('in-stage')) return;
    var w = document.querySelector('#app > .wrap, main > .wrap, .wrap.page') || [].filter.call(document.querySelectorAll('.wrap'), function (x) { return !x.closest('.top'); })[0];
    if (!w || w.classList.contains('tv-own') || w.querySelector('.tv-screen')) return;
    var key = location.hash, room = window.innerHeight - w.getBoundingClientRect().top - 58;
    var blocks = [].filter.call(w.children, function (b) { return b.offsetHeight > 0; }), parts = [];
    blocks.forEach(function (b) { if (outer(b) > room) { var p = split(b, room); if (p[0] !== b) { p.forEach(function (x) { w.insertBefore(x, b); }); b.remove(); } parts = parts.concat(p); } else parts.push(b); });
    var screens = [], cur = null, used = 0;
    /* a block that does not fit in what is left of a screen fills it with its first part, when much is left */
    var queue = parts.slice(), b2;
    while ((b2 = queue.shift())) (function (b) {
      var h = outer(b), left = room - used;
      if (cur && used + h > room && left > room * 0.4 && (b.querySelector('table') || b.children.length > 2)) {
        var p = split(b, room, left);
        if (p.length > 1 && p[0] !== b) { p.forEach(function (x) { w.insertBefore(x, b); }); b.remove(); cur.appendChild(p[0]); used = room; queue = p.slice(1).concat(queue); return; }
      }
      if (!cur || used + h > room) { cur = el('div', { class: 'tv-screen' }); w.insertBefore(cur, b); screens.push(cur); used = 0; }
      cur.appendChild(b); used += h;
    })(b2);
    if (screens.length < 2) return;
    var bar = el('div', { class: 'tvbar' }), prev = el('button', { class: 'btn white', type: 'button' }, '→ السابق'), next = el('button', { class: 'btn next', type: 'button' }, 'التالي ←'), dots = el('span', { class: 'm' });
    function show(i, focus) {
      i = Math.max(0, Math.min(screens.length - 1, i)); at[key] = i;
      screens.forEach(function (s, j) { s.hidden = j !== i; });
      prev.disabled = i === 0; next.disabled = i === screens.length - 1; dots.textContent = (i + 1) + ' / ' + screens.length;
      if (focus) { var f = screens[i].querySelector('a[href], button:not([disabled]), select, input'); (f || (next.disabled ? prev : next)).focus({ preventScroll: true }); }
    }
    prev.addEventListener('click', function () { show(at[key] - 1, true); if (prev.disabled) next.focus(); else prev.focus(); });
    next.addEventListener('click', function () { show(at[key] + 1, true); if (next.disabled) prev.focus(); else next.focus(); });
    bar.appendChild(prev); bar.appendChild(dots); bar.appendChild(next); document.body.appendChild(bar);
    show(at[key] || 0);
  };
})();
