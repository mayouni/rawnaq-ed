/* Rawnaq Ed — the playground of a figure («ساحة الرسم»), a chapter of the Minwal language.
   A drawing that only illustrates becomes a place to try: the learner changes one quantity of the drawing and
   reads, on the drawing and in one sentence, what that change does to the idea of the lesson.
   Each kind of figure declares three things, and nothing else is needed to make it a playground:
     vars : the quantities that may change, each with its name and its bounds;
     draw : the drawing for the present values, to scale;
     see  : the sentence that says what there is to notice — the reason this playground exists.
   A playground with nothing to notice is not written. In an exercise it opens only once the exercise is solved
   («ماذا لو؟»), so that it never answers in the learner's place.
   Controls are − and + keys: they work with a finger, a mouse and the arrows of a remote alike. */
(function () {
  'use strict';
  var RE = window.RE, el = RE.el, N = RE.N, MAKE = {};
  var INK = '#2B2840', RED = '#E8443A', FILL = '#FFF1B8', GREY = '#5A5670';

  function val(v) { var m = /^\s*(\d+)\s*([^\d؟?]*)$/.exec(String(v == null ? '' : v)); return m ? { n: +m[1], u: m[2].trim() } : null; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function dec(x) { return RE.fmt(String(Math.round(x * 100) / 100).replace('.', ',')); }
  function tx(x, y, s, c, size) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (size || 18) + '" font-weight="700" font-family="inherit" fill="' + (c || INK) + '" direction="ltr">' + s + '</text>'; }
  function poly(pts) { return '<polygon points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>'; }
  function ln(x1, y1, x2, y2, c, w, dash) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (c || INK) + '" stroke-width="' + (w || 3) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' stroke-linecap="round"/>'; }
  function frame(inner) { return el('div', { class: 'vizbox' }, '<svg class="viz" viewBox="0 0 480 300" role="img">' + inner + '</svg>'); }
  function grid(x0, y0, w, h, u) { var s = '', i; for (i = 1; i < w; i++) s += ln(x0 + i * u, y0, x0 + i * u, y0 + h * u, GREY, 1, '2 4'); for (i = 1; i < h; i++) s += ln(x0, y0 + i * u, x0 + w * u, y0 + i * u, GREY, 1, '2 4'); return s; }
  function sq(U) { return U ? ' ' + U + '²' : ''; }
  function un(U) { return U ? ' ' + U : ''; }

  /* ---------- shapes, drawn to scale ---------- */
  MAKE.shape = function (o) {
    var t = o.type || 'rect', a, b, c, U;
    if (t === 'rect') {
      a = val(o.w); b = val(o.h); if (!a || !b) return null; U = a.u || b.u;
      return { init: { w: a.n, h: b.n }, vars: [{ k: 'w', label: 'الطول', min: 1, max: 12, u: U }, { k: 'h', label: 'العرض', min: 1, max: 8, u: U }],
        draw: function (s) { var u = Math.min(36, 380 / s.w, 200 / s.h), x0 = (480 - s.w * u) / 2 + 10, y0 = 30 + (210 - s.h * u) / 2; return frame('<rect x="' + x0 + '" y="' + y0 + '" width="' + s.w * u + '" height="' + s.h * u + '" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3.5"/>' + grid(x0, y0, s.w, s.h, u) + tx(x0 + s.w * u / 2, y0 + s.h * u + 24, s.w + un(U)) + tx(x0 - 26, y0 + s.h * u / 2 + 6, s.h + un(U))); },
        see: function (s) { return RE.t('كلّ مربّع صغير وحدة. المساحة: `' + s.w + ' × ' + s.h + ' = ' + s.w * s.h + '`' + sq(U) + '. المحيط: `2 × (' + s.w + ' + ' + s.h + ') = ' + 2 * (s.w + s.h) + '`' + un(U) + '.' + (s.w === s.h ? ' البعدان متساويان: صار مربّعاً.' : '')); } };
    }
    if (t === 'square') {
      a = val(o.a); if (!a) return null; U = a.u;
      return { init: { a: a.n }, vars: [{ k: 'a', label: 'الضلع', min: 1, max: 8, u: U }],
        draw: function (s) { var u = Math.min(36, 200 / s.a), x0 = (480 - s.a * u) / 2, y0 = 30 + (210 - s.a * u) / 2; return frame('<rect x="' + x0 + '" y="' + y0 + '" width="' + s.a * u + '" height="' + s.a * u + '" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3.5"/>' + grid(x0, y0, s.a, s.a, u) + tx(240, y0 + s.a * u + 24, s.a + un(U)) + tx(x0 - 26, y0 + s.a * u / 2 + 6, s.a + un(U))); },
        see: function (s) { return RE.t('المساحة: `' + s.a + ' × ' + s.a + ' = ' + s.a * s.a + '`' + sq(U) + '. المحيط: `4 × ' + s.a + ' = ' + 4 * s.a + '`' + un(U) + '. إذا ضاعفنا الضلع صارت المساحة أربعة أضعاف.'); } };
    }
    if (t === 'tri') {
      a = val(o.b); b = val(o.h); if (!a || !b) return null; U = a.u || b.u;
      return { init: { b: a.n, h: b.n, p: Math.round((o.apex == null ? 0.6 : o.apex) * 10) }, vars: [{ k: 'b', label: 'القاعدة', min: 2, max: 12, u: U }, { k: 'h', label: 'الارتفاع', min: 1, max: 8, u: U }, { k: 'p', label: 'الرأس', min: 0, max: 10, show: false }],
        draw: function (s) {
          var u = Math.min(36, 380 / s.b, 180 / s.h), x0 = (480 - s.b * u) / 2, yb = 236, yt = yb - s.h * u, ax = x0 + s.p / 10 * s.b * u;
          return frame('<rect x="' + x0 + '" y="' + yt + '" width="' + s.b * u + '" height="' + s.h * u + '" fill="none" stroke="' + GREY + '" stroke-width="2" stroke-dasharray="3 6"/>' + poly([[ax, yt], [x0, yb], [x0 + s.b * u, yb]]) + ln(ax, yt, ax, yb, RED, 3, '7 6') + tx(240, yb + 28, s.b + un(U)) + tx(ax + (s.p > 7 ? -30 : 30), (yt + yb) / 2 + 6, s.h + un(U), RED));
        },
        see: function (s, ch) { return RE.t('المثلّث نصف المستطيل المنقّط. المساحة: `(' + s.b + ' × ' + s.h + ') : 2 = ' + dec(s.b * s.h / 2) + '`' + sq(U) + '.' + (ch === 'p' ? ' الرأس تحرّك والمساحة لم تتغيّر: القاعدة والارتفاع لم يتغيّرا.' : '')); } };
    }
    if (t === 'trap') {
      a = val(o.B); b = val(o.b); c = val(o.h); if (!a || !b || !c) return null; U = a.u || b.u || c.u;
      return { init: { B: a.n, b: b.n, h: c.n }, fix: function (s) { if (s.b > s.B) s.b = s.B; },
        vars: [{ k: 'B', label: 'القاعدة الكبرى', min: 2, max: 12, u: U }, { k: 'b', label: 'القاعدة الصغرى', min: 0, max: function (s) { return s.B; }, u: U }, { k: 'h', label: 'الارتفاع', min: 1, max: 8, u: U }],
        draw: function (s) {
          var u = Math.min(36, 380 / s.B, 170 / s.h), x0 = (480 - s.B * u) / 2, yb = 232, yt = yb - s.h * u, off = (s.B - s.b) * u * 0.35, top = s.b ? [[x0 + off, yt], [x0 + off + s.b * u, yt]] : [[x0 + off, yt]];
          return frame(poly(top.concat([[x0 + s.B * u, yb], [x0, yb]])) + ln(x0 + off, yt, x0 + off, yb, RED, 3, '7 6') + (s.b ? tx(x0 + off + s.b * u / 2, yt - 10, s.b + un(U)) : '') + tx(240, yb + 28, s.B + un(U)) + tx(x0 + off + 30, (yt + yb) / 2 + 6, s.h + un(U), RED));
        },
        see: function (s) { return RE.t('المساحة: `(' + s.B + ' + ' + s.b + ') × ' + s.h + ' : 2 = ' + dec((s.B + s.b) * s.h / 2) + '`' + sq(U) + '.' + (s.b === 0 ? ' القاعدة الصغرى اختفت: صار مثلّثاً، والقاعدة نفسها تعطي `' + s.B + ' × ' + s.h + ' : 2`.' : s.b === s.B ? ' القاعدتان متساويتان: صار متوازي أضلاع، ومساحته `' + s.B + ' × ' + s.h + '`.' : '')); } };
    }
    if (t === 'para') {
      a = val(o.b); b = val(o.h); if (!a || !b) return null; U = a.u || b.u;
      return { init: { b: a.n, h: b.n, s: 2 }, vars: [{ k: 'b', label: 'القاعدة', min: 2, max: 10, u: U }, { k: 'h', label: 'الارتفاع', min: 1, max: 8, u: U }, { k: 's', label: 'الميل', min: 0, max: 4, show: false }],
        draw: function (s) {
          var u = Math.min(36, 380 / (s.b + s.s), 170 / s.h), sh = s.s * u, x0 = (480 - s.b * u - sh) / 2, yb = 232, yt = yb - s.h * u;
          return frame(poly([[x0 + sh, yt], [x0 + sh + s.b * u, yt], [x0 + s.b * u, yb], [x0, yb]]) + ln(x0 + sh, yt, x0 + sh, yb, RED, 3, '7 6') + tx(x0 + s.b * u / 2, yb + 28, s.b + un(U)) + tx(x0 + sh + 30, (yt + yb) / 2 + 6, s.h + un(U), RED));
        },
        see: function (s, ch) { return RE.t('المساحة: `' + s.b + ' × ' + s.h + ' = ' + s.b * s.h + '`' + sq(U) + '.' + (s.s === 0 ? ' بلا ميل: هو مستطيل، والقاعدة نفسها.' : ch === 's' ? ' الميل تغيّر والمساحة لم تتغيّر: القاعدة والارتفاع لم يتغيّرا.' : '')); } };
    }
    if (t === 'circle') {
      a = val(o.r); if (!a) return null; U = a.u;
      return { init: { r: a.n }, vars: [{ k: 'r', label: 'الشعاع', min: 1, max: 9, u: U }],
        draw: function (s) { var R = s.r * 13; return frame('<circle cx="240" cy="150" r="' + R + '" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3.5"/>' + ln(240 - R, 150, 240, 150, GREY, 3, '7 6') + ln(240, 150, 240 + R, 150, RED, 3) + '<circle cx="240" cy="150" r="5" fill="' + INK + '"/>' + tx(240 + R / 2, 142, s.r + un(U), RED) + tx(240, 150 + R + 26, 'القطر ' + 2 * s.r + un(U), GREY, 16).replace('direction="ltr"', 'direction="rtl"')); },
        see: function (s) { return RE.t('القطر يمرّ بالمركز ويساوي شعاعين: `2 × ' + s.r + ' = ' + 2 * s.r + '`' + un(U) + '.'); } };
    }
    return null;
  };

  /* ---------- figures that already draw themselves from their numbers ---------- */
  function redraw(o, set) { return function (s) { var c = clone(o); delete c.note; delete c.ask; delete c.for; delete c.reveal; set(c, s); return RE.viz(c); }; }

  MAKE.frac = function (o) {
    var it = o.items || [], f = it[0], g = it[1]; if (!f || !(f.n >= 0) || !(f.d >= 1) || it.length > 2) return null;
    return { init: { n: f.n, d: f.d }, fix: function (s) { if (s.n > 2 * s.d) s.n = 2 * s.d; },
      vars: [{ k: 'n', label: 'البسط', min: 0, max: function (s) { return 2 * s.d; } }, { k: 'd', label: 'المقام', min: 1, max: 12 }],
      draw: redraw(o, function (c, s) { c.items[0].n = s.n; c.items[0].d = s.d; delete c.items[0].label; }),
      see: function (s, ch) {
        var me = '`{' + s.n + '/' + s.d + '}`', x = s.n < s.d ? me + ' أصغر من `1`: لم تُلوَّن كلّ أجزاء الوحدة.' : s.n === s.d ? me + ' يساوي `1`: كلّ أجزاء الوحدة ملوّنة.' : me + ' أكبر من `1`: وحدة واحدة لا تكفي.';
        if (g && g.d) { var l = s.n * g.d, r = g.n * s.d; x += ' و' + me + (l < r ? ' أصغر من ' : l > r ? ' أكبر من ' : ' يساوي ') + '`{' + g.n + '/' + g.d + '}`.'; }
        else if (ch === 'd') x += ' كلّما كبر المقام صغرت القطعة.';
        return RE.t(x);
      } };
  };
  MAKE.chain = function (o) {
    if (o.groups || !(o.a >= 2) || !(o.n >= 1)) return null;
    return { init: { a: o.a, n: o.n }, vars: [{ k: 'a', label: 'العامل', min: 2, max: 10 }, { k: 'n', label: 'الدليل', min: 1, max: 7 }],
      draw: redraw(o, function (c, s) { c.a = s.a; c.n = s.n; }),
      see: function (s) { var p = []; for (var i = 0; i < s.n; i++) p.push(s.a); return RE.t('الدليل `' + s.n + '` هو عدد العوامل: `' + s.a + '^' + s.n + ' = ' + (s.n > 1 ? p.join(' × ') + ' = ' : '') + RE.fmt(Math.pow(s.a, s.n)) + '`.'); } };
  };
  MAKE.hops = function (o) {
    if (!(o.a >= 2) || !(o.b >= 2)) return null;
    return { init: { a: o.a, b: o.b }, vars: [{ k: 'a', label: 'القافز الأوّل', min: 2, max: 9 }, { k: 'b', label: 'القافز الثاني', min: 2, max: 9 }],
      draw: redraw(o, function (c, s) { c.a = s.a; c.b = s.b; c.max = N.lcm(s.a, s.b) + Math.max(s.a, s.b); }),
      see: function (s) { var L = N.lcm(s.a, s.b), hi = Math.max(s.a, s.b), lo = Math.min(s.a, s.b); return RE.t('أوّل موضع يلتقيان فيه: `م.م.أ (' + s.a + ' ; ' + s.b + ') = ' + L + '`.' + (s.a === s.b ? ' القفزتان متساويتان: يلتقيان في كلّ قفزة.' : L === hi ? ' `' + hi + '` مضاعف للعدد `' + lo + '`: اللقاء عنده.' : L === s.a * s.b ? ' وهو هنا جداؤهما `' + s.a + ' × ' + s.b + '`.' : ' وهو أصغر من جدائهما `' + s.a * s.b + '`.')); } };
  };
  function divisorsOf(o, max) {
    if (!(o.n >= 2) || o.n > max) return null;
    return { init: { n: o.n }, vars: [{ k: 'n', label: 'العدد', min: 2, max: max }],
      draw: redraw(o, function (c, s) { c.n = s.n; }),
      see: function (s) { var d = N.divisors(s.n), r = Math.round(Math.sqrt(s.n)); return RE.t('قواسم `' + s.n + '`: `' + d.join(' ; ') + '`.' + (d.length === 2 ? ' قاسمان فقط: `' + s.n + '` عدد أوّليّ.' : r * r === s.n ? ' عدد قواسمه فرديّ: `' + s.n + ' = ' + r + ' × ' + r + '` مربّع كامل.' : '')); } };
  }
  MAKE.rects = function (o) { return divisorsOf(o, 48); };
  MAKE.divs = function (o) { return divisorsOf(o, 100); };
  MAKE.ftree = function (o) {
    if (!(o.n >= 2) || o.n > 200) return null;
    return { init: { n: o.n }, vars: [{ k: 'n', label: 'العدد', min: 2, max: 200 }],
      draw: redraw(o, function (c, s) { c.n = s.n; }),
      see: function (s) { var f = N.factors(s.n); return RE.t(f.length < 2 ? '`' + s.n + '` عدد أوّليّ: لا يقبل القسمة إلّا على `1` وعلى نفسه، فلا يتفكّك.' : 'نقسم على أصغر عدد أوّليّ ممكن، مرّة بعد مرّة: `' + s.n + ' = ' + f.join(' × ') + '`.'); } };
  };
  MAKE.array = function (o) {
    if (o.extra || o.split || !(o.rows >= 1) || !(o.cols >= 1)) return null;
    return { init: { r: o.rows, c: o.cols }, vars: [{ k: 'r', label: 'الصفوف', min: 1, max: 8 }, { k: 'c', label: 'في كلّ صفّ', min: 1, max: 12 }],
      draw: redraw(o, function (c, s) { c.rows = s.r; c.cols = s.c; }),
      see: function (s) { return RE.t('`' + s.r + '` صفوف في كلّ صفّ `' + s.c + '`: `' + s.r + ' × ' + s.c + ' = ' + s.r * s.c + '`. وهو نفسه `' + s.c + ' × ' + s.r + '`: ترتيب العاملين لا يغيّر الجداء.'); } };
  };
  MAKE.groups = function (o) {
    if (!(o.a >= 1) || !(o.b >= 2) || o.a > 60 || o.b > 12) return null;
    return { init: { a: o.a, b: o.b }, vars: [{ k: 'a', label: 'المقسوم', min: 1, max: 60 }, { k: 'b', label: 'القاسم', min: 2, max: 12 }],
      draw: redraw(o, function (c, s) { c.a = s.a; c.b = s.b; c.ask = false; }),
      see: function (s) { var q = Math.floor(s.a / s.b), r = s.a % s.b; return RE.t('`' + s.a + ' = ' + s.b + ' × ' + q + ' + ' + r + '`. ' + (r === 0 ? 'لا باقي: `' + s.b + '` قاسم للعدد `' + s.a + '`.' : 'الباقي `' + r + '` أصغر من القاسم `' + s.b + '`، دائماً.')); } };
  };
  MAKE.angle = function (o) {
    if (!(o.deg > 0) || o.deg >= 180) return null;
    return { init: { deg: Math.round(o.deg / 10) * 10 || 10 }, vars: [{ k: 'deg', label: 'الفتحة', min: 10, max: 170, step: 10, u: '°' }],
      draw: redraw(o, function (c, s) { c.deg = s.deg; }),
      see: function (s) { return RE.t(s.deg < 90 ? 'زاوية حادّة: أصغر من الزاوية القائمة `90°`.' : s.deg === 90 ? 'زاوية قائمة: `90°` بالضبط.' : 'زاوية منفرجة: أكبر من الزاوية القائمة `90°`.'); } };
  };

  RE.playKinds = MAKE;
  /* pane: the half of the screen that holds the drawing; spec: what the drawing shows; host: the drawing itself */
  RE.play = function (pane, spec, host) {
    if (!host || !host.parentNode) return;
    var box = host.parentNode, old = box.querySelector('.playbar'), d = null;
    if (old) { if (old._close) old._close(); old.remove(); }
    try { d = spec && !Array.isArray(spec) && spec.k && MAKE[spec.k] ? MAKE[spec.k](spec) : null; } catch (e) { d = null; }
    if (!d) return;
    if (pane) pane.classList.add('has-play');
    var bar = el('div', { class: 'playbar' }), open = el('button', { class: 'playbtn', type: 'button' }, '🖐 ' + RE.g('غيّر[ي] الرسم')), ctl = el('div', { class: 'playctl', hidden: '' }), see = el('div', { class: 'playsee', hidden: '', 'aria-live': 'polite' });
    var st = null, fig = null, H = 0, outs = [];
    function lim(x) { return typeof x === 'function' ? x(st) : x; }
    function draw(changed) {
      var n = d.draw(st); n.classList.add('playfig');
      if (H) { n.style.height = H + 'px'; var sv = n.querySelector('svg'); if (sv) { sv.style.height = '100%'; sv.style.width = '100%'; sv.style.maxHeight = 'none'; } }
      if (fig) fig.replaceWith(n); else box.insertBefore(n, host);
      fig = n; see.innerHTML = d.see(st, changed);
      outs.forEach(function (o) { o.el.textContent = o.v.show === false ? '⇄' : st[o.v.k] + (o.v.u ? (o.v.u === '°' ? '' : ' ') + o.v.u : ''); });
    }
    function close() {
      if (fig) { fig.remove(); fig = null; }
      host.hidden = false; ctl.hidden = see.hidden = true; open.hidden = false; st = null;
    }
    d.vars.forEach(function (v) {
      var g = el('span', { class: 'playvar', dir: 'ltr' }), minus = el('button', { type: 'button', class: 'pm', 'aria-label': v.label + ': أقلّ' }, '−'), out = el('span', { class: 'pv', dir: 'ltr' }), plus = el('button', { type: 'button', class: 'pm', 'aria-label': v.label + ': أكثر' }, '+');
      function step(k) { var nv = st[v.k] + k * (v.step || 1); if (nv < lim(v.min) || nv > lim(v.max)) return; st[v.k] = nv; if (d.fix) d.fix(st); draw(v.k); if (RE.fx) RE.fx('tap'); }
      minus.addEventListener('click', function () { step(-1); }); plus.addEventListener('click', function () { step(1); });
      g.appendChild(minus); g.appendChild(out); g.appendChild(plus); g.appendChild(el('b', { dir: 'rtl' }, v.label)); ctl.appendChild(g); outs.push({ el: out, v: v });
    });
    var back = el('button', { type: 'button', class: 'playbtn back' }, '↺ رسم الدرس');
    back.addEventListener('click', function () { close(); open.focus({ preventScroll: true }); if (RE.tvStage) RE.tvStage(); });
    ctl.appendChild(back);
    open.addEventListener('click', function () {
      H = host.offsetHeight; st = clone(d.init); host.hidden = true; open.hidden = true; ctl.hidden = see.hidden = false; draw();
      var f = ctl.querySelector('.pm:last-of-type'); if (f) f.focus({ preventScroll: true });
      if (RE.fx) RE.fx('tap'); if (RE.tvStage) RE.tvStage();
    });
    bar._close = close;
    bar.appendChild(open); bar.appendChild(ctl); bar.appendChild(see);
    box.insertBefore(bar, host.nextSibling);
  };
})();
