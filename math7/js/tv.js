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
    /* a card that is a title and one long list or grid is cut inside that list */
    var host = b, lead = null, last = kids[kids.length - 1];
    if (kids.length && kids.length <= 2 && last.children.length > 3) { host = last; lead = kids.length === 2 ? kids[0] : null; kids = [].slice.call(host.children); }
    if (kids.length < 2) { b.style.maxHeight = room + 'px'; b.style.overflow = 'auto'; return [b]; }
    /* things side by side (a grid) count as one row */
    var rows = [], top = null;
    kids.forEach(function (k) { if (top === null || Math.abs(k.offsetTop - top) > 4) { rows.push({ els: [], h: 0 }); top = k.offsetTop; } var r = rows[rows.length - 1]; r.els.push(k); r.h = Math.max(r.h, outer(k)); });
    var body = rows.reduce(function (t, r) { return t + r.h; }, 0), chrome = Math.max(0, outer(b) - body), into;
    function fresh() { var box = shell(b); into = box; if (host !== b) { if (lead) box.appendChild(out.length ? lead.cloneNode(true) : lead); into = shell(host); box.appendChild(into); } return box; }
    cur = fresh(); used = chrome;
    rows.forEach(function (r) {
      if (used + r.h > (out.length ? room : firstRoom) && into.children.length) { out.push(cur); cur = fresh(); used = chrome; }
      r.els.forEach(function (k) { into.appendChild(k); }); used += r.h;
    });
    out.push(cur); return out;
  }

  /* ---- a lesson screen ----
     The half that holds the exercise never scrolls: when its content is taller than the half (a long statement,
     the feedback after an answer, the pad open under it), the whole half is drawn a little smaller until it fits.
     It is checked again whenever something appears in it. */
  var STEPS = [1, 0.94, 0.88, 0.82, 0.76, 0.7, 0.64, 0.58], watching = null, obs = null, busy = false;
  /* the meaning of a word is shown in a box that has, from the start, the room of the longest meaning:
     moving from one word to the next changes the words in the box and nothing else on the screen */
  function sizeDef(p) {
    var def = p.querySelector('.term-def'); if (!def || !def._all) return;
    var keep = def.innerHTML, mx = 0; def.style.minHeight = '';
    def._all.forEach(function (h) { def.innerHTML = h; mx = Math.max(mx, def.offsetHeight); });
    def.innerHTML = keep; def.style.minHeight = mx + 'px';
  }
  /* Zayn, «No Surprises»: a screen that was drawn smaller to hold something new is never drawn bigger again
     while it is on the glass: things appear, they do not make the others jump back and forth. */
  function fitPane(p, pad) {
    if (!p) return;
    var room = 0, open = pad && !pad.hidden && document.body.classList.contains('pad-on'); if (open) room = pad.offsetHeight + 6;
    busy = true;
    for (var i = p._zi || 0; i < STEPS.length; i++) {
      p.style.zoom = STEPS[i]; p.style.paddingBottom = room ? (room / STEPS[i]) + 'px' : ''; sizeDef(p);
      if (p.scrollHeight <= p.clientHeight + 2) break;
    }
    if (!open) p._zi = Math.min(i, STEPS.length - 1);
    p.scrollTop = 0;
    setTimeout(function () { busy = false; }, 0);
  }
  RE.tvStage = function () {
    var p = document.querySelector('.stage .pane.text'); if (!p) return;
    var pad = RE.pad && RE.pad.el ? RE.pad.el() : null;
    fitPane(p, pad);
    var f = document.querySelector('.stage .pane.fig');
    if (f) { for (var i = f._zi || 0; i < STEPS.length; i++) { f.style.zoom = STEPS[i]; if (f.scrollHeight <= f.clientHeight + 2) break; } f._zi = Math.min(i, STEPS.length - 1); }
    if (watching !== p) {
      if (obs) obs.disconnect();
      watching = p; obs = new MutationObserver(function () { if (!busy) requestAnimationFrame(function () { fitPane(p, RE.pad && RE.pad.el ? RE.pad.el() : null); }); });
      obs.observe(p, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
    }
  };

  /* the lab: the keys on one side, her answer on the other; each side is drawn smaller rather than cut */
  var labObs = null;
  RE.tvLab = function () {
    var card = document.querySelector('.tvlab .card.aicha'); if (!card) return;
    var th = card.querySelector('.thread'), keys = card.querySelector('.cmds, .tiles'), i;
    function fit() {
      if (th) { for (i = 0; i < STEPS.length; i++) { th.style.zoom = STEPS[i]; if (th.scrollHeight <= th.clientHeight + 2) break; } }
      if (keys) { for (i = 0; i < STEPS.length; i++) { keys.style.zoom = STEPS[i]; if (card.scrollHeight <= card.clientHeight + 2) break; } }
    }
    fit();
    if (labObs) labObs.disconnect();
    if (th) { labObs = new MutationObserver(function () { requestAnimationFrame(fit); }); labObs.observe(th, { childList: true }); }
  };

  /* a lesson screen has nowhere to scroll to: if anything moves it, it is put back */
  document.addEventListener('scroll', function (e) { var x = e.target; if (x && x.classList && (x.classList.contains('stage') || x.classList.contains('panes') || x.classList.contains('pane'))) { if (x.scrollLeft) x.scrollLeft = 0; if (x.scrollTop && !x.classList.contains('pane')) x.scrollTop = 0; } }, true);

  /* a box whose words must stay inside it and away from its frame: drawn smaller until they do */
  RE.tvBox = function (b) {
    if (!b || !b.clientHeight) return;
    function inside() {
      if (b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1) return false;
      var r = b.getBoundingClientRect(), ok = true;
      [].forEach.call(b.querySelectorAll('h1, h2, h3, p, .ico'), function (k) { var q = k.getBoundingClientRect(); if (q.height && (q.top < r.top + 6 || q.bottom > r.bottom - 6)) ok = false; });
      return ok;
    }
    for (var i = 0; i < STEPS.length; i++) { b.style.zoom = STEPS[i]; if (inside()) break; }
  };

  /* the letters of Rawnaq arrive a moment after the first screen and are wider than the ones they replace:
     the screen is measured again when they are there */
  try { if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(function () { setTimeout(function () { window.dispatchEvent(new HashChangeEvent('hashchange')); }, 50); }); } catch (e) { /* older engines measure once */ }

  RE.tvFit = function () {
    var old = document.querySelector('.tvbar'); if (old) old.remove();
    if (document.body.classList.contains('in-stage')) { RE.tvStage(); return; }
    var w = document.querySelector('#app > .wrap, main > .wrap, .wrap.page') || [].filter.call(document.querySelectorAll('.wrap'), function (x) { return !x.closest('.top'); })[0];
    if (w && w.classList.contains('tvlab')) { RE.tvLab(); return; }
    if (!w || w.classList.contains('tv-own') || w.querySelector('.tv-screen')) return;
    var key = location.hash, room = window.innerHeight - w.getBoundingClientRect().top - 74;
    var blocks = [].filter.call(w.children, function (b) { return b.offsetHeight > 0; }), parts = [];
    blocks.forEach(function (b) { if (outer(b) > room) { var p = split(b, room); if (p[0] !== b) { p.forEach(function (x) { w.insertBefore(x, b); }); b.remove(); } parts = parts.concat(p); } else parts.push(b); });
    var screens = [], cur = null, used = 0;
    /* a block that does not fit in what is left of a screen fills it with its first part, when much is left */
    var queue = parts.slice(), b2;
    while ((b2 = queue.shift())) (function (b) {
      var h = outer(b), left = room - used;
      if (cur && used + h > room && left > room * 0.4 && (b.querySelector('table') || b.children.length > 2 || (b.lastElementChild && b.lastElementChild.children.length > 3))) {
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
