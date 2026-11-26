/* Rawnaq Ed on a television: the remote control.
   One rule decides every move, on every screen (Zayn: «Keyboard Sovereignty», the order follows what the eye sees):
     1. the same row or column first: an arrow goes to the nearest thing that lies in line with where we stand;
     2. only when nothing lies in line does it go to the nearest thing on that side;
     3. nothing in that direction: the focus stays where it is. It never jumps somewhere unexpected.
   The centre key chooses; an answer box opens Rawnaq's own pad (pad.js), never the system keyboard; a window
   that asks a question keeps the focus inside it; back closes what is open, then returns to the road.
   Try it on a computer with  index.html?tv=1 . */
(function () {
  'use strict';
  var RE = window.RE;
  if (!RE.isTv) return;
  document.documentElement.classList.add('tv');
  var KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

  function padOpen() { return RE.pad.isOpen(); }
  function modal() { return document.querySelector('.rq-modal'); }
  function scope() { return modal() || (padOpen() ? RE.pad.el() : document); }
  function items() {
    return [].filter.call(scope().querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]'), function (e) {
      return !e.disabled && !e.hidden && e.type !== 'file' && e.getAttribute('tabindex') !== '-1' && e.getClientRects().length > 0 && !(e.closest && e.closest('[hidden]'));
    });
  }
  function go(e) { e.focus({ preventScroll: true }); }
  function first() {
    var it = items(), h = window.innerHeight, best = null, bs = 1e9;
    it.forEach(function (e) { var r = e.getBoundingClientRect(), y = r.top + r.height / 2, s = y < 70 ? 1e6 + y : Math.abs(y - h * 0.4); if (s < bs) { bs = s; best = e; } });
    if (best) go(best);
  }
  /* the nearest thing in a direction: in line first, then on that side */
  function nearest(cur, it, dx, dy) {
    var a = cur.getBoundingClientRect(), best = null, bs = 1e9;
    it.forEach(function (e) {
      if (e === cur) return;
      var b = e.getBoundingClientRect(), gap, over, span, minor;
      if (dx) {
        if (dx > 0 ? b.left + b.width / 2 <= a.left + a.width / 2 + 2 : b.left + b.width / 2 >= a.left + a.width / 2 - 2) return;
        gap = dx > 0 ? b.left - a.right : a.left - b.right;
        over = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); span = Math.min(a.height, b.height);
        minor = Math.abs(b.top + b.height / 2 - a.top - a.height / 2);
      } else {
        if (dy > 0 ? b.top + b.height / 2 <= a.top + a.height / 2 + 2 : b.top + b.height / 2 >= a.top + a.height / 2 - 2) return;
        gap = dy > 0 ? b.top - a.bottom : a.top - b.bottom;
        over = Math.min(a.right, b.right) - Math.max(a.left, b.left); span = Math.min(a.width, b.width);
        minor = Math.abs(b.left + b.width / 2 - a.left - a.width / 2);
      }
      var inLine = over > span * 0.35, s;
      if (inLine) s = Math.max(0, gap) + minor * 0.2;
      else { if (gap < -4) return; s = 1e5 + gap + minor * 2.5; }
      if (s < bs) { bs = s; best = e; }
    });
    return { el: best, inLine: bs < 1e5 };
  }
  function move(dx, dy) {
    var it = items(), cur = document.activeElement;
    if (it.indexOf(cur) < 0) { first(); return; }
    var n = nearest(cur, it, dx, dy), best = n.el;
    /* in a station, «down» from the last thing of a half of the screen lands on «التالي»: the way forward is never a search */
    var pane = cur.closest && cur.closest('.stage .pane'), nx = document.querySelector('.stage .btn.next');
    if (pane && nx && dy > 0 && !padOpen() && !modal() && (!best || !pane.contains(best))) best = nx;
    if (best) { go(best); if (RE.sound) RE.sound.play('move'); }
  }

  /* a text field under the focus stays closed: the system keyboard comes only when the centre key asks for it */
  function isText(e) { return e && (e.tagName === 'TEXTAREA' || (e.tagName === 'INPUT' && !/^(range|checkbox|radio|file|button)$/.test(e.type))); }
  document.addEventListener('focusin', function (e) { if (isText(e.target) && !e.target._open) e.target.readOnly = true; });
  document.addEventListener('focusout', function (e) { if (isText(e.target)) { e.target._open = false; e.target.readOnly = true; } });
  window.addEventListener('keydown', function (e) {
    var d = KEYS[e.key], cur = document.activeElement;
    if (e.key === 'Enter' && isText(cur) && cur.readOnly) { e.preventDefault(); cur._open = true; cur.readOnly = false; cur.blur(); cur._open = true; cur.focus({ preventScroll: true }); return; }
    if (isText(cur) && cur.readOnly && d) { e.preventDefault(); move(d[0], d[1]); return; }
    if (padOpen() || modal()) { if (d) { e.preventDefault(); move(d[0], d[1]); } return; }
    if (!d) return;
    var tag = cur && cur.tagName, range = tag === 'INPUT' && cur.type === 'range', typing = tag === 'TEXTAREA' || (tag === 'INPUT' && !range && cur.type !== 'checkbox');
    if ((range || typing) && d[0]) return;              /* left and right belong to the slider or to the text */
    e.preventDefault(); move(d[0], d[1]);
  }, true);

  /* the back key of the remote: the app asks this first (Zayn: «The Right to Leave») */
  window.REBack = function () {
    var m = modal(); if (m && m._close) { m._close(); return true; }
    if (RE.pad.close()) return true;
    if (location.hash.replace(/^#\/?/, '') !== '') { location.hash = '#/'; return true; }
    return false;
  };
  /* each new screen starts with something chosen, so the first arrow press is never lost */
  RE.afterRender = function () {
    RE.pad.drop();
    if (RE.tvFit) RE.tvFit();
    if (RE.syncVoice) RE.syncVoice();
    setTimeout(function () {
      var w = document.querySelector('.stage .pane.text .ans:not([disabled]), .stage .pane.text .choice, .stage .pane.text .chip, .stage .pane.text .term, .stage .pane.fig input[type=range], .stage .btn.next, #app .station.next, #app a.station, #app .btn');
      if (w && w.getClientRects().length) w.focus({ preventScroll: true }); else first();
    }, 30);
  };
  RE.remote = { nearest: nearest, items: items };
})();
