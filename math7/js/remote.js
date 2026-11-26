/* Rawnaq Ed on a television: the remote control.
   An arrow moves to the nearest thing that can be chosen in that direction; the centre key chooses it;
   on a slider, left and right move the slider; an answer box opens Rawnaq's own pad (pad.js), never the
   system keyboard; back closes what is open, then returns to the road. Same rules as the remote of Hussein's car.
   Try it on a computer with  index.html?tv=1 . */
(function () {
  'use strict';
  var RE = window.RE;
  if (!RE.isTv) return;
  document.documentElement.classList.add('tv');
  var KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

  function padOpen() { return RE.pad.isOpen(); }
  function items() {
    var sc = padOpen() ? RE.pad.el() : document;
    return [].filter.call(sc.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]'), function (e) {
      return !e.disabled && !e.hidden && e.type !== 'file' && e.getAttribute('tabindex') !== '-1' && e.getClientRects().length > 0 && !(e.closest && e.closest('[hidden]'));
    });
  }
  function centre(e) { var r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function go(e) {
    e.focus({ preventScroll: true });
    if (padOpen()) return;
    e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function first() {
    var it = items(), h = window.innerHeight, best = null, bs = 1e9;
    it.forEach(function (e) { var c = centre(e), s = c[1] < 70 ? 1e6 + c[1] : Math.abs(c[1] - h * 0.4); if (s < bs) { bs = s; best = e; } });
    if (best) go(best);
  }
  /* the half of the screen that holds the text scrolls on its own */
  function scroller() { var p = document.querySelector('.stage .pane.text'); return p && p.scrollHeight > p.clientHeight + 4 ? p : null; }
  function move(dx, dy) {
    var it = items(), cur = document.activeElement;
    if (it.indexOf(cur) < 0) { first(); return; }
    var a = centre(cur), best = null, bs = 1e9, bd = 0;
    it.forEach(function (e) {
      if (e === cur) return;
      var c = centre(e), vx = c[0] - a[0], vy = c[1] - a[1], along = vx * dx + vy * dy, across = Math.abs(vx * dy) + Math.abs(vy * dx);
      if (along < 6) return;
      var s = along + across * 2.2; if (s < bs) { bs = s; best = e; bd = along; }
    });
    /* a long stretch of reading with nothing to choose: scroll through it instead of jumping over it */
    if (dy && !padOpen()) {
      var sc = scroller(), H = sc ? sc.clientHeight : window.innerHeight;
      var canScroll = sc ? (dy > 0 ? sc.scrollTop + sc.clientHeight < sc.scrollHeight - 4 : sc.scrollTop > 4) : !document.body.classList.contains('in-stage');
      var inText = sc && cur.closest && cur.closest('.pane.text'), off = best && sc && sc.contains(best) && (function () { var r = best.getBoundingClientRect(), p = sc.getBoundingClientRect(); return r.top > p.bottom - 10 || r.bottom < p.top + 10; })();
      if (canScroll && (!best || bd > H * 0.85 || (inText && off && bd > H * 0.6))) { (sc || window).scrollBy({ top: dy * H * 0.55, behavior: 'smooth' }); return; }
    }
    /* in a station, «down» from the last thing of a half of the screen always lands on «التالي»: the way forward is never a search */
    var pane = cur.closest && cur.closest('.stage .pane'), nx = document.querySelector('.stage .btn.next');
    if (pane && nx && dy > 0 && !padOpen() && (!best || !pane.contains(best))) best = nx;
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
    if (padOpen()) { if (d) { e.preventDefault(); move(d[0], d[1]); } return; }
    if (!d) return;
    var tag = cur && cur.tagName, range = tag === 'INPUT' && cur.type === 'range', typing = tag === 'TEXTAREA' || (tag === 'INPUT' && !range && cur.type !== 'checkbox');
    if ((range || typing) && d[0]) return;              /* left and right belong to the slider or to the text */
    e.preventDefault(); move(d[0], d[1]);
  }, true);

  /* the back key of the remote: the app asks this first */
  window.REBack = function () {
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
})();
