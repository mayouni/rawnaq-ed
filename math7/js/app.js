/* Rawnaq Ed — the pages. One HTML file, routes in the hash, nothing leaves the device. */
(function () {
  'use strict';
  var RE = window.RE, el = RE.el, t = RE.t;
  var root, navEl;
  var KIND = { intro: 'تمهيد', hook: 'لغز', explore: 'اكتشاف', rule: 'القاعدة', practice: 'تمرّن', make: 'اصنع[ي]' };
  var KTAG = { intro: 'plain', hook: 'pink', explore: 'blue', rule: '', practice: 'green', make: 'violet' };

  function icon(s, size) {
    return '<svg class="ico" viewBox="0 0 64 64" width="' + (size || 64) + '" height="' + (size || 64) + '" aria-hidden="true"><circle cx="32" cy="34" r="27" fill="#2B2840"/><circle cx="32" cy="30" r="27" fill="' + s.color + '" stroke="#2B2840" stroke-width="3"/>' +
      '<text x="32" y="' + (s.sym.length > 3 ? 35 : 38) + '" text-anchor="middle" font-size="' + (s.sym.length > 4 ? 13 : s.sym.length > 2 ? 17 : 24) + '" font-weight="700" fill="#2B2840" font-family="inherit" direction="' + (/[؀-ۿ]/.test(s.sym) ? 'rtl' : 'ltr') + '">' + s.sym + '</text></svg>';
  }
  /* where the same kind of exercise is found in the textbook: «على منوال كتابك، ص 41» */
  function srcLabel(src, whose) { whose = whose || 'كتابك'; return /^على منوال/.test(src) ? src.replace(/^على منوال\s*/, 'على منوال ' + whose + '، ') : whose + '، ' + src; }
  function pg(p) { return String(p).replace(/\s*–\s*/g, ' إلى '); }
  function sorted() { return RE.stations.slice().sort(function (a, b) { return a.order - b.order; }); }
  function seen(s) { return RE.state.beats[s.id] || (RE.state.beats[s.id] = []); }
  function complete(s) { var st = RE.stationStats(s); return st.total > 0 && st.done === st.total; }
  function page(title) { document.body.classList.remove('in-stage'); root.innerHTML = ''; window.scrollTo(0, 0); document.title = (title ? title + ' · ' : '') + 'رونق · رياضيات'; var w = el('div', { class: 'wrap' }); root.appendChild(w); return w; }
  function setNav(k) { [].forEach.call(navEl.querySelectorAll('a'), function (a) { a.classList.toggle('on', a.getAttribute('data-k') === k); }); }

  /* ---------------- home ---------------- */
  /* the road on a television: every station is a tile, the chosen one tells its story below. Nothing scrolls. */
  function tvHome() {
    setNav('home'); var w = page(''); w.classList.add('tv-own', 'tvhome');
    var due = RE.due(), all = sorted(), next = all.filter(function (s) { return !complete(s); })[0], lv = RE.level();
    var head = el('div', { class: 'tvhead' }, '<h1>' + t('أهلاً يا {name}').replace(/ يا\s*$/, '') + '</h1><a class="pill" href="#/notebook">المستوى <b class="m">' + lv.n + '</b> · <span class="m">★ ' + lv.stars + (lv.to ? ' / ' + lv.to : '') + '</span> · 🏅 <span class="m">' + Object.keys(RE.state.badges).length + '</span></a>');
    if (due.length) head.appendChild(el('a', { class: 'btn sun', href: '#/review' }, 'مراجعة اليوم · <span class="m">' + due.length + '</span>'));
    w.appendChild(head);
    var detail = el('div', { class: 'card tvdetail' });
    function show(s) { var st = RE.stationStats(s); detail.innerHTML = icon(s, 76) + '<div><h2>' + t(s.title) + '</h2><p>' + t(s.question) + '</p><span class="muted">كتابك، ص ' + pg(s.pages) + ' · حُلّ <span class="m">' + st.done + ' / ' + st.total + '</span></span></div>'; }
    RE.units.forEach(function (u) {
      w.appendChild(el('div', { class: 'tvrow-title' }, '<span class="num">' + u.num + '</span> ' + u.title));
      var row = el('div', { class: 'tiles-row' });
      all.filter(function (s) { return (s.unit || 'n') === u.id; }).forEach(function (s) {
        var a = el('a', { class: 'station tile' + (complete(s) ? ' done' : s === next ? ' next' : ''), href: '#/s/' + s.id, 'aria-label': RE.g(s.title).replace(/`/g, '') }, icon(s, 44) + '<span class="tn">' + t(s.title).replace(/:.*$/, '') + '</span>');
        a.addEventListener('focus', function () { show(s); }); row.appendChild(a);
      });
      w.appendChild(row);
    });
    w.appendChild(detail); show(next || all[0]);
  }
  function home() {
    if (RE.isTv) return tvHome();
    setNav('home'); var w = page('');
    var due = RE.due(), all = sorted(), next = all.filter(function (s) { return !complete(s); })[0];
    var started = Object.keys(RE.state.q).length > 0;
    w.appendChild(el('div', { class: 'hello' }, '<h1>' + t(started ? 'أهلاً بعودتك يا {name}' : 'أهلاً {name}') + '</h1><p>' + t(started
      ? 'الطريق كما تركت[ِ]ه. المحطّة الصفراء هي التالية، لكن الطريق مفتوح كلّه: ادخل[ي] من حيث تشاء[ين].'
      : 'هذا كتابك في الرياضيّات، لكن باللمس والتجريب. كلّ محطّة تبدأ بكلماتها وفكرتها وأين نجدها في الحياة، ثمّ لغز، ثمّ تكتشف[ين] القاعدة بيديك قبل أن تقرأ[ي]ها، ثمّ تحلّ[ين] تمارين على منوال تمارين كتابك، ولكلّ تمرين رسمه. لا وقت يجري، ولا خطأ يُحسب عليك: الخطأ هنا طريقة للفهم.') + '</p></div>'));
    var lv = RE.level(), days = RE.streak(), nb = Object.keys(RE.state.badges).length;
    w.appendChild(el('a', { class: 'card levelcard', href: '#/notebook' }, '<div class="lv-n"><span>المستوى</span><b>' + lv.n + '</b></div><div class="lv-main"><b>' + lv.title + '</b>' +
      '<div class="meter big"><i style="width:' + Math.round(lv.part * 100) + '%"></i></div><span class="muted">' + (lv.to ? '<span class="m">★ ' + lv.stars + ' / ' + lv.to + '</span> نحو المستوى التالي' : '<span class="m">★ ' + lv.stars + '</span>') + '</span></div>' +
      '<div class="lv-side"><span class="pill">📅 <span class="m">' + days + '</span> ' + (days === 1 ? 'يوم' : 'أيّام') + ' متتالية</span><span class="pill">🏅 <span class="m">' + nb + ' / ' + RE.badges.length + '</span> أوسمة</span></div>'));
    if (due.length) {
      var c = el('div', { class: 'card sky' }, '<span class="tag">مراجعة اليوم</span><h3 style="margin-top:8px">' + t(due.length + ' ' + (due.length > 10 ? 'سؤالاً' : 'أسئلة') + ' تنتظر أن تتذكّر[ي]ها') + '</h3><p class="muted">ما نسترجعه بعد أيّام يثبت في الذاكرة أكثر ممّا نعيده عشر مرّات في يوم واحد.</p>');
      c.appendChild(el('a', { class: 'btn sun', href: '#/review' }, 'أبدأ المراجعة')); w.appendChild(c);
    }
    var road = el('div', { class: 'road' });
    RE.units.forEach(function (u) {
      road.appendChild(el('div', { class: 'unit-title' }, '<span class="num">' + u.num + '</span><div><h2 style="margin:0">' + u.title + '</h2><span class="muted">كتاب الرياضيات 7، من الصفحة ' + pg(u.pages) + '</span></div>'));
      var grid = el('div', { class: 'stations' });
      all.filter(function (s) { return (s.unit || 'n') === u.id; }).forEach(function (s) {
        var st = RE.stationStats(s), sn = seen(s);
        var a = el('a', { class: 'station' + (complete(s) ? ' done' : s === next ? ' next' : ''), href: '#/s/' + s.id },
          '<span class="pg">ص ' + pg(s.pages) + '</span>' + icon(s) + '<h3>' + t(s.title) + '</h3><p class="q">' + t(s.question) + '</p>');
        var beads = el('div', { class: 'beads', title: 'مراحل المحطّة' });
        s.beats.forEach(function (b, i) { beads.appendChild(el('i', { class: sn.indexOf(i) >= 0 ? 'on' : '' })); });
        a.appendChild(beads);
        if (st.done) { var stars = 0; s.beats.forEach(function (b) { b.blocks.forEach(function (k) { if (k.t === 'q') stars += RE.starsOf(RE.state.q[k.id]); }); }); a.appendChild(el('div', { class: 'muted', style: 'font-size:13px;margin-top:4px' }, 'حُلّ <span class="m">' + st.done + ' / ' + st.total + '</span> &nbsp; <span class="m">★ ' + stars + '</span>')); }
        grid.appendChild(a);
      });
      road.appendChild(grid);
    });
    w.appendChild(road);
    foot(w);
  }
  function foot(w) { w.appendChild(el('footer', {}, 'رونق · رياضيات — على برنامج السنة السابعة من التعليم الأساسي وبترتيب كتابه الرسميّ. التمارين مكتوبة على منواله بأعداد مغايرة. كلّ ما تفعل[ينه|ه] هنا يبقى على هذا الجهاز.'.replace(/\[([^|]*)\|([^\]]*)\]/, function (_, f, m) { return RE.state.fem ? f : m; }) + (window.RENative ? '' : ' <a href="../index.html">عن المنصّة</a>'))); }

  /* ---------------- slides ----------------
     A station is played one screen at a time: the text or the exercise on one half, its drawing on the other.
     Each exercise, each explorable, each rule and each part of the introduction is one screen. */
  function slidesOf(s) {
    var out = [];
    s.beats.forEach(function (b, bi) {
      var pend = [], sticky = null;
      var flush = function (main, fig) { if (!pend.length && !main) return; out.push({ beat: bi, kind: b.kind, text: pend, main: main || null, fig: fig === undefined ? sticky : fig }); pend = []; };
      b.blocks.forEach(function (k) {
        if (k.t === 'h') { flush(); sticky = null; pend.push(k); }
        else if (k.t === 'p' || k.t === 'say') pend.push(k);
        else if (k.t === 'rule') { pend.push(k); flush(null, k.viz ? { viz: k.viz, key: k } : (b.kind === 'rule' ? null : sticky)); }
        else if (k.t === 'fig') sticky = { fig: k, key: k };
        else if (k.t === 'widget') { sticky = { widget: k, key: k }; flush(k); }
        else if (k.t === 'q') flush(k, k.viz && k.viz !== 'keep' ? { viz: k.viz, key: k } : (sticky || { viz: RE.vizAuto(k), key: k }));
        else if (k.t === 'make') flush(k, sticky);
        else if (k.t === 'terms') { flush(); out.push({ beat: bi, kind: b.kind, text: [], main: k, fig: { terms: k, key: k } }); }
        else if (k.t === 'idea') flush(k, k.viz ? { viz: k.viz, key: k } : null);
        else if (k.t === 'uses') flush(k, null);
      });
      flush();
    });
    return out;
  }
  var figCache = null, figOwner = null;
  /* the drawing of a screen. Explorables are kept alive while the learner stays in the station, so what she set stays set. */
  function figEl(src, owner) {
    if (figOwner !== owner) { figCache = new Map(); figOwner = owner; }
    if (figCache.has(src.key)) return figCache.get(src.key);
    var host;
    if (src.widget) { host = el('div', { class: 'vizbox live' }); try { RE.widgets[src.widget.name](host, src.widget.opts || {}); } catch (e) { host.textContent = 'تعذّر عرض هذا النشاط.'; if (window.console) console.error(src.widget.name, e); } }
    else if (src.fig) host = el('div', { class: 'vizbox rtl' }, src.fig.svg);
    else if (src.terms) host = el('div', { class: 'vizset' });
    else if (Array.isArray(src.viz)) {
      host = el('div', { class: 'vizset' });
      var figs = src.viz.map(function (v) { var f = RE.viz(v); f.hidden = true; host.appendChild(f); return f; }), dots = el('div', { class: 'vizdots' });
      var anyFor = src.viz.some(function (v) { return v.for; });
      host.showFor = function (blank) {
        var j = -1;
        src.viz.forEach(function (v, i) { if (j < 0 && v.for && v.for.indexOf(blank) >= 0) j = i; });
        if (j < 0) { j = Math.min(blank, figs.length - 1); if (anyFor && src.viz[j].for) { var free = src.viz.map(function (v, i) { return v.for ? -1 : i; }).filter(function (i) { return i >= 0; }); j = free.length ? free[Math.min(blank, free.length - 1)] : 0; } }
        host.show(j);
      };
      host.show = function (j) { figs.forEach(function (f, i) { f.hidden = i !== j; }); [].forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i === j); }); };
      if (figs.length > 1) { figs.forEach(function (f, i) { var d = el('button', { type: 'button', tabindex: -1, 'aria-label': 'الرسم ' + (i + 1) }, String(i + 1)); d.addEventListener('click', function () { host.show(i); }); dots.appendChild(d); }); host.appendChild(dots); }
      host.show(0);
    } else host = RE.viz(src.viz);
    figCache.set(src.key, host);
    return host;
  }
  function textBlock(b) {
    if (b.t === 'p') return el('p', {}, t(b.html));
    if (b.t === 'h') return el('h3', {}, t(b.html));
    if (b.t === 'say') return el('div', { class: 'say' }, t(b.html));
    if (b.t === 'rule') return el('div', { class: 'rule' }, t(b.html) + (b.src ? '<span class="src">' + (/^على منوال/.test(b.src) ? srcLabel(b.src) : b.src) + '</span>' : ''));
    return el('div');
  }
  function makeBox(b, s) {
    var box = el('div', { class: 'qbox' }, '<div class="qt">' + t(b.html) + '</div>');
    var old = RE.state.made.filter(function (m) { return m.id === b.id; })[0], ok = el('span', { class: 'muted' }), r = el('div', { class: 'qactions' });
    var keep = function (text) {
      RE.state.made = RE.state.made.filter(function (m) { return m.id !== b.id; });
      if (text) RE.state.made.push({ id: b.id, station: s.id, text: text, t: Date.now() });
      RE.save(); ok.textContent = text ? 'حُفظ في الدفتر.' : ''; if (text) { RE.fx('star'); RE.checkBadges(); }
    };
    if (RE.isTv) {
      /* a television has no comfortable keyboard: this part is said aloud to whoever sits beside her */
      box.appendChild(el('div', { class: 'say' }, RE.g('على التلفاز: قول[ي]ها بصوت مسموع لمن يجلس بجانبك، أو اكتب[ي]ها على كرّاسك.')));
      var said = el('button', { class: 'btn small', type: 'button' }, old ? 'قلتُها ✓' : 'قلتُها');
      said.addEventListener('click', function () { keep('(قيلت بصوت مسموع أمام الشاشة)'); said.textContent = 'قلتُها ✓'; });
      r.appendChild(said);
    } else {
      var ta = el('textarea', { rows: 3, 'aria-label': 'ما صنعتُه' }); ta.value = old ? old.text : '';
      var btn = el('button', { class: 'btn small', type: 'button' }, RE.g('احفظ[ي] في دفتري'));
      btn.addEventListener('click', function () { keep(ta.value.trim()); });
      box.appendChild(ta); r.appendChild(btn);
    }
    r.appendChild(ok); box.appendChild(r);
    return box;
  }

  /* ---------------- the stage: one screen of a station or of a review ----------------
     c = { key, title, sub, icon, slides, href(n), pills:[{label, at, on, seen}], end(host), exit } */
  function stage(c, n) {
    var total = c.slides.length; n = Math.max(0, Math.min(total, n || 0));
    root.innerHTML = ''; window.scrollTo(0, 0); document.body.classList.add('in-stage'); document.title = c.title + ' · رونق · رياضيات';
    var sl = c.slides[n], isEnd = n >= total;
    var st = el('div', { class: 'stage' }), top = el('div', { class: 'stage-top' }), panes = el('div', { class: 'panes' }), bot = el('div', { class: 'stage-bot' });
    top.appendChild(el('a', { class: 'back', href: c.exit || '#/', 'aria-label': 'الرجوع إلى الطريق' }, '→ الطريق'));
    top.appendChild(el('div', { class: 'stage-title' }, (c.icon || '') + '<b>' + c.title + '</b>'));
    if (c.pills) { var pills = el('div', { class: 'steps' }); c.pills.forEach(function (p) { pills.appendChild(el('a', { href: c.href(p.at), class: (!isEnd && sl.beat === p.beat ? 'on ' : '') + (p.seen ? 'seen' : ''), tabindex: RE.isTv ? -1 : 0 }, p.label)); }); top.appendChild(pills); }
    if (c.aicha) top.appendChild(el('a', { class: 'back aicha-btn', href: c.aicha, 'aria-label': 'اسألي عَايْشَه' }, RE.aichaFace + ' عَايْشَه'));
    top.appendChild(el('div', { class: 'stage-stars', title: 'نجومي' }, '★ <span data-stars>' + RE.totalStars() + '</span>'));
    st.appendChild(top);

    var text = el('section', { class: 'pane text' }), fig = el('section', { class: 'pane fig' });
    var next = el('a', { class: 'btn next', href: n < total ? c.href(n + 1) : (c.after || '#/') }, n < total - 1 || (n === total - 1 && c.end) ? 'التالي ←' : n === total - 1 ? 'إنهاء ←' : (c.afterLabel || 'إلى الطريق ←'));
    var ready = function (focus) { next.classList.add('go'); if (focus && RE.isTv) setTimeout(function () { next.focus({ preventScroll: true }); }, 450); };

    if (isEnd) { st.classList.add('solo'); c.end(text); next.setAttribute('href', c.after || '#/'); next.textContent = c.afterLabel || 'إلى الطريق ←'; ready(true); }
    else {
      var kindLabel = c.kindLabel ? c.kindLabel(sl) : '';
      if (kindLabel) text.appendChild(el('div', { class: 'slide-head' }, kindLabel));
      sl.text.forEach(function (b) { text.appendChild(textBlock(b)); });
      var m = sl.main, figHost = sl.fig ? figEl(sl.fig, c.key) : null;
      if (!m) ready(false);
      else if (m.t === 'q') {
        var fresh = !!c.fresh;
        if (fresh) { var rr = RE.rec(m.id); rr.tries = 0; rr.hints = 0; rr.shown = false; }
        var done0 = !fresh && RE.rec(m.id).ok;
        var qb = RE.question(m, { fresh: fresh, label: (sl.label || '') + (m.src ? (sl.label ? ' · ' : '') + srcLabel(m.src) : ''),
          onDone: function () { fig.classList.add('solved'); ready(true); if (c.onSolve) c.onSolve(sl, n); },
          onWrong: function (bad) { if (RE.isTv && bad) setTimeout(function () { bad.focus({ preventScroll: true }); }, 60); } });
        text.appendChild(qb);
        if (done0) { ready(false); fig.classList.add('solved'); }
        text.addEventListener('re-blank', function (e) { if (figHost && figHost.showFor) figHost.showFor(e.detail); });
      } else if (m.t === 'widget') { text.appendChild(el('div', { class: 'try' }, RE.g('جرّب[ي] في الرسم، ثمّ «التالي».'))); ready(false); }
      else if (m.t === 'make') { text.appendChild(makeBox(m, c.station)); ready(false); }
      else if (m.t === 'terms') {
        text.appendChild(el('h2', {}, 'كلمات هذه المحطّة')); text.appendChild(el('p', { class: 'muted' }, RE.g('المس[ي] كلّ كلمة لتر[ي|ى] رسمها.')));
        var list = el('div', { class: 'terms' }), showTerm = function (i, btn) {
          [].forEach.call(list.children, function (x) { x.classList.toggle('on', x === btn); });
          figHost.innerHTML = ''; if (m.items[i].viz) figHost.appendChild(RE.viz(m.items[i].viz));
          def.innerHTML = '<b>' + t(m.items[i].w) + '</b>' + t(m.items[i].d);
        }, def = el('div', { class: 'term-def', 'aria-live': 'polite' });
        m.items.forEach(function (it, i) {
          var b = el('button', { type: 'button', class: 'term' }, '<b>' + t(it.w) + '</b><span>' + t(it.d) + '</span>');
          b.addEventListener('focus', function () { showTerm(i, b); }); b.addEventListener('click', function () { showTerm(i, b); RE.fx('tap'); });
          list.appendChild(b);
        });
        text.appendChild(list); text.appendChild(def); showTerm(0, list.firstChild); ready(false);
      } else if (m.t === 'idea') { text.appendChild(el('h2', {}, 'الفكرة الكبرى')); text.appendChild(el('div', { class: 'idea' }, t(m.html))); ready(false); }
      else if (m.t === 'uses') {
        text.appendChild(el('h2', {}, 'أين نجدها في الحياة؟'));
        var us = el('div', { class: 'uses' }); m.items.forEach(function (u) { us.appendChild(el('div', { class: 'use' }, '<div class="use-ico">' + u.icon + '</div><h3>' + t(u.title) + '</h3><p>' + t(u.html) + '</p>')); });
        text.appendChild(us); ready(false);
      }
      if (figHost) fig.appendChild(figHost); else st.classList.add('solo');
    }
    panes.appendChild(text); if (!st.classList.contains('solo')) panes.appendChild(fig);
    st.appendChild(panes);

    bot.appendChild(n > 0 ? el('a', { class: 'btn white prev', href: c.href(n - 1) }, '→ السابق') : el('span', { class: 'prev' }));
    var track = el('div', { class: 'track', dir: 'rtl' });
    if (!isEnd) {
      var same = []; c.slides.forEach(function (x, i) { if (x.beat === sl.beat) same.push(i); });
      same.forEach(function (i) { var x = c.slides[i], q = x.main && x.main.t === 'q', ok = q && RE.state.q[x.main.id] && RE.state.q[x.main.id].ok; track.appendChild(el('i', { class: (i === n ? 'on ' : '') + (ok ? 'ok ' : '') + (q ? 'q' : '') })); });
      track.appendChild(el('span', { class: 'm' }, (same.indexOf(n) + 1) + ' / ' + same.length));
    }
    bot.appendChild(track); bot.appendChild(next); st.appendChild(bot);
    root.appendChild(st);
    if (c.onShow && !isEnd) c.onShow(sl, n);
    if (RE.coach && c.station) RE.coach(isEnd ? 'end' : 'screen', { station: c.station, n: n });
  }

  /* ---------------- a station ---------------- */
  var stCache = {};
  function station(id, n) {
    setNav('home');
    var s = RE.stations.filter(function (x) { return x.id === id; })[0]; if (!s) return home();
    var slides = stCache[id] || (stCache[id] = slidesOf(s)), sn = seen(s);
    if (n == null || isNaN(n)) {   /* come back where she left, else at the first screen not yet done */
      n = RE.state.pos[id];
      if (n == null) n = 0;
      if (n >= slides.length) n = 0;
    }
    var firstOf = {}; slides.forEach(function (x, i) { if (firstOf[x.beat] == null) firstOf[x.beat] = i; });
    stage({
      key: 'st:' + id, station: s, aicha: '#/lab/s/' + id, title: RE.g(s.title).replace(/`/g, ''), icon: icon(s, 34), slides: slides,
      href: function (k) { return '#/s/' + id + '/' + k; },
      pills: s.beats.map(function (b, i) { return { beat: i, at: firstOf[i] || 0, label: RE.g(b.label || KIND[b.kind]), seen: sn.indexOf(i) >= 0 }; }).filter(function (p) { return firstOf[p.beat] != null; }),
      kindLabel: function (sl) { var b = s.beats[sl.beat]; return '<span class="tag ' + KTAG[b.kind] + '">' + RE.g(b.label || KIND[b.kind]) + '</span> <span>' + t(b.title) + '</span>'; },
      onShow: function (sl, k) {
        RE.state.pos[id] = k;
        var last = true; for (var i = k + 1; i < slides.length; i++) if (slides[i].beat === sl.beat) last = false;
        if (last && sn.indexOf(sl.beat) < 0) sn.push(sl.beat);
        RE.save();
      },
      end: function (host) {
        var stt = RE.stationStats(s), stars = 0; slides.forEach(function (x) { if (x.main && x.main.t === 'q') stars += RE.starsOf(RE.state.q[x.main.id]); });
        var all = sorted(), nx = all[all.indexOf(s) + 1], full = stt.done === stt.total;
        host.appendChild(el('div', { class: 'finale' }, icon(s, 96) + '<h1>' + t(full ? 'أتممت[ِ] المحطّة!' : 'وصلت[ِ] إلى آخر المحطّة') + '</h1>' +
          '<p class="bigstars">★ <span class="m">' + stars + ' / ' + stt.total * 3 + '</span></p>' +
          '<p>' + t(full ? (stt.clean === stt.total ? 'كلّ الأسئلة من أوّل محاولة. عمل متقن.' : 'حُلّت كلّ الأسئلة: <span class="m">' + stt.clean + '</span> منها من أوّل محاولة. ما تعثّر سيعود في المراجعة ليثبت.') : 'بقي <span class="m">' + (stt.total - stt.done) + '</span> من الأسئلة دون حلّ. الطريق مفتوح: [عودي|عُد] إليها متى شئت[ِ].') + '</p>'));
        if (full) { RE.confetti(); RE.sound.play('fanfare'); RE.checkBadges(); }
        RE.state.pos[id] = 0; RE.save();
        this.after = nx ? '#/s/' + nx.id : '#/'; this.afterLabel = nx ? 'المحطّة التالية ←' : 'إلى الطريق ←';
      }
    }, n);
  }

  /* ---------------- review ---------------- */
  var revSet = null;
  function review(n) {
    setNav('home');
    if (n == null || isNaN(n) || !revSet) { revSet = RE.due().slice(0, 8); n = 0; }
    if (!revSet.length) { document.body.classList.remove('in-stage'); var w = page('المراجعة'); w.appendChild(el('div', { class: 'st-head' }, '<a class="back" href="#/">→ الطريق</a><h1>مراجعة اليوم</h1>')); w.appendChild(el('div', { class: 'card' }, '<p>' + t('لا شيء للمراجعة اليوم. [عودي|عُد] غداً، أو تقدّم[ي] في الطريق.') + '</p>')); return; }
    var slides = revSet.map(function (x) {
      var ss = stCache[x.station.id] || (stCache[x.station.id] = slidesOf(x.station)), home = ss.filter(function (sl) { return sl.main === x.q; })[0];
      return { beat: 0, kind: 'practice', text: [], main: x.q, label: RE.g(x.station.title).replace(/`/g, ''), fig: home ? home.fig : { viz: RE.vizAuto(x.q), key: x.q } };
    });
    stage({
      key: 'review', title: 'مراجعة اليوم', slides: slides, fresh: true, href: function (k) { return '#/review/' + k; },
      kindLabel: function () { return '<span class="tag">مراجعة</span>'; },
      end: function (host) {
        host.appendChild(el('div', { class: 'finale' }, '<div class="use-ico">🔁</div><h1>انتهت مراجعة اليوم</h1><p>' + t('ما أجبت[ِ] عنه بسهولة سيعود بعد مدّة أطول، وما تعثّر سيعود قريباً. هكذا تثبت الأشياء في الذاكرة.') + '</p>'));
        RE.state.reviewed = RE.today(); RE.save(); RE.sound.play('fanfare'); RE.checkBadges(); revSet = null;
      }
    }, n);
  }

  /* ---------------- notebook ---------------- */
  function notebook() {
    setNav('notebook'); var w = page('دفتري');
    w.appendChild(el('div', { class: 'hello' }, '<h1>' + t('دفتر {name}') + '</h1><p>' + t('ما اكتشفت[ِ]ه، وما صنعت[ِ]ه. القواعد تظهر هنا عندما تصل[ين] إليها في محطّتها.') + '</p>'));
    var days = Object.keys(RE.state.days).length, solved = 0; Object.keys(RE.state.q).forEach(function (k) { if (RE.state.q[k].ok) solved++; });
    w.appendChild(el('div', { class: 'card tint' }, '<div class="row"><span class="tag">★ ' + RE.totalStars() + '</span><span class="tag plain">' + RE.level().title + '</span><span class="tag plain">' + solved + ' سؤالاً محلولاً</span><span class="tag plain">' + days + (days === 1 ? ' يوم' : ' أيّام') + ' من العمل</span><span class="tag plain">' + RE.state.made.length + ' من صنعي</span></div>'));
    var bc = el('div', { class: 'card' }, '<h2>أوسمتي</h2>'), br = el('div', { class: 'badge-row' });
    RE.badges.forEach(function (b) { var got = RE.state.badges[b.id]; br.appendChild(el('div', { class: 'badge' + (got ? '' : ' off'), title: RE.g(b.how) }, '<div class="b-ico">' + b.icon + '</div>' + RE.g(b.title) + '<span>' + RE.g(b.how) + '</span>')); });
    bc.appendChild(br); w.appendChild(bc);
    var any = false;
    sorted().forEach(function (s) {
      var sn = seen(s), rules = [], words = [];
      s.beats.forEach(function (b, i) { if (b.kind === 'intro' && sn.indexOf(i) >= 0) b.blocks.forEach(function (k) { if (k.t === 'terms') words = words.concat(k.items); }); });
      s.beats.forEach(function (b, i) { if (b.kind === 'rule' && sn.indexOf(i) >= 0) b.blocks.forEach(function (k) { if (k.t === 'rule') rules.push(k); }); });
      var made = RE.state.made.filter(function (m) { return m.station === s.id; });
      if (!rules.length && !made.length && !words.length) return; any = true;
      var c = el('div', { class: 'card' }, '<div class="row">' + icon(s, 44) + '<h2 style="margin:0">' + t(s.title) + '</h2></div>');
      if (words.length) c.appendChild(el('div', { class: 'gloss' }, words.map(function (x) { return '<p><b>' + t(x.w) + ':</b> ' + t(x.d) + '</p>'; }).join('')));
      rules.forEach(function (r) { c.appendChild(el('div', { class: 'rule', style: 'margin-top:14px' }, t(r.html) + (r.src ? '<span class="src">' + r.src + '</span>' : ''))); });
      made.forEach(function (m) { c.appendChild(el('div', { class: 'say' }, '<span class="tag violet">من صنعي</span> ' + m.text.replace(/</g, '&lt;'))); });
      w.appendChild(c);
    });
    if (!any) w.appendChild(el('div', { class: 'card' }, '<p>' + t('الدفتر فارغ الآن. سيمتلئ بالقواعد كلّما تقدّمت[ِ] في الطريق.') + '</p>'));
    var pr = el('button', { class: 'btn white', type: 'button' }, RE.g('اطبع[ي] دفتري')); pr.addEventListener('click', function () { window.print(); });
    w.appendChild(el('div', { class: 'next-bar' })).appendChild(pr);
  }

  /* ---------------- lab ---------------- */
  function lab(mode, arg) { setNav('lab'); var w = page('المختبر'); RE.labPage(w, mode, arg); }

  /* ---------------- guardian ---------------- */
  function guardian() {
    setNav('guardian'); var w = page('لوحة الوليّ');
    w.appendChild(el('div', { class: 'hello' }, '<h1>لوحة الوليّ</h1><p>ما أنجزته ' + (RE.state.name || 'المتعلّمة') + '، وأين تحتاج إلى حديث قصير معك. هذه اللوحة تُقرأ من هذا الجهاز وحده.</p>'));
    var tb = '<table class="t"><tr><th>المحطّة</th><th>المراحل</th><th>الأسئلة</th><th>من أوّل محاولة</th><th>تلميحات</th></tr>', talk = [];
    sorted().forEach(function (s) {
      var st = RE.stationStats(s), sn = seen(s);
      tb += '<tr><td><b>' + t(s.title) + '</b><br><span class="muted">ص ' + pg(s.pages) + '</span></td><td><span class="m">' + sn.length + ' / ' + s.beats.length + '</span></td><td><div class="meter"><i style="width:' + (st.total ? 100 * st.done / st.total : 0) + '%"></i></div><span class="m">' + st.done + ' / ' + st.total + '</span></td><td><span class="m">' + (st.done ? Math.round(100 * st.clean / st.done) + '%' : '—') + '</span></td><td><span class="m">' + st.hints + '</span></td></tr>';
      st.hard.slice(0, 4).forEach(function (q) { talk.push({ s: s, q: q }); });
    });
    w.appendChild(el('div', { class: 'card' }, '<h2>التقدّم</h2><div style="overflow-x:auto">' + tb + '</table></div>'));
    var c2 = el('div', { class: 'card' }, '<h2>ما يستحقّ حديثاً</h2>');
    if (!talk.length) c2.appendChild(el('p', { class: 'muted' }, 'لا شيء بعد. تظهر هنا الأسئلة التي احتاجت أكثر من محاولة أو تلميحاً.'));
    else {
      c2.appendChild(el('p', { class: 'muted' }, 'هذه أسئلة احتاجت أكثر من محاولة. لا تشرح الحلّ: اطلب منها أن تشرح لك هي كيف فكّرت. الشرح بصوت عالٍ هو ما يثبّت الفهم.'));
      talk.slice(0, 12).forEach(function (x) { c2.appendChild(el('div', { class: 'qbox' }, '<div class="qn">' + t(x.s.title) + (x.q.src ? ' · ' + srcLabel(x.q.src, 'كتابها') : '') + '</div><div>' + t(x.q.text || '').replace(/\[\[[^\]]*\]\]/g, '<span class="m">....</span>') + '</div>')); });
    }
    w.appendChild(c2);
    var made = RE.state.made;
    if (made.length) { var c3 = el('div', { class: 'card' }, '<h2>ما صنعته</h2>'); made.forEach(function (m) { c3.appendChild(el('div', { class: 'say' }, m.text.replace(/</g, '&lt;'))); }); w.appendChild(c3); }
    w.appendChild(el('div', { class: 'card tint' }, '<h2>كيف تعمل هذه المنصّة</h2>' +
      '<p><b>الكتاب الرسمي هو المنهج.</b> كلّ محطّة تتبع صفحات الكتاب بترتيبها. التمارين مكتوبة على منوال تمارينه بأعداد مغايرة، وكلّ واحد يحمل رقم الصفحة التي فيها نوعه: من تحلّه هنا تجد في كتابها تمريناً من الصنف نفسه لتحلّه على كرّاسها.</p>' +
      '<p><b>ستّ مراحل في كلّ محطّة.</b> تمهيد يقدّم المصطلحات والفكرة العامّة وأين نجدها في الحياة، ثمّ لغز يثير السؤال، ثمّ اكتشاف باللمس، ثمّ القاعدة، ثمّ تمارين على منوال الكتاب، ثمّ شيء تصنعه هي.</p>' +
      '<p><b>لكلّ تمرين رسمه.</b> نصف الشاشة للتمرين ونصفها لرسم يُري بنيته: مستقيم مدرّج، شريط، مستطيل مقسوم، شجرة تفكيك. الرسم يساعد على التفكير ولا يكتب الجواب.</p>' +
      '<p><b>النجوم أثر عمل لا سباق.</b> ثلاث نجوم لجواب من أوّل محاولة، نجمتان بعد محاولة أخرى أو تلميح، نجمة بعد قراءة الحلّ. لا شيء يُخصم ولا شيء ينتهي وقته.</p>' +
      '<p><b>الخطأ لا يُعاقَب.</b> لا وقت يجري ولا نقاط تُخصم. الجواب الخاطئ يفتح سؤالاً، والتلميح يسأل ولا يعطي الحلّ. من تطلب الحلّ تراه، ثمّ يعود السؤال بعد أيّام لتحلّه وحدها.</p>' +
      '<p><b>المراجعة متباعدة.</b> ما حُلّ بسهولة يعود بعد أسبوع ثمّ بعد أسبوعين، وما تعثّر يعود في الغد. ربع ساعة كلّ يوم أنفع من ساعتين في يوم واحد.</p>' +
      '<p><b>لا شيء يغادر الجهاز.</b> لا حساب، لا إشهار، لا اتّصال. التقدّم محفوظ في هذا المتصفّح.</p>'));
    /* settings */
    var set = el('div', { class: 'card' }, '<h2>الإعدادات</h2>');
    var nm = el('input', { class: 'ans wide', 'data-kb': 'native', style: 'direction:rtl', value: RE.state.name, 'aria-label': 'الاسم' });
    var gsel = el('select', { class: 'ans wide', style: 'direction:rtl', 'aria-label': 'صيغة الخطاب' }, '<option value="1">خطاب المؤنّث</option><option value="0">خطاب المذكّر</option>'); gsel.value = RE.state.fem ? '1' : '0';
    var r1 = el('div', { class: 'ctl' }, '<span>الاسم</span>'); r1.appendChild(nm); r1.appendChild(gsel);
    var sv = el('button', { class: 'btn small', type: 'button' }, 'حفظ'); sv.addEventListener('click', function () { RE.state.name = nm.value.trim(); RE.state.fem = gsel.value === '1'; RE.save(); guardian(); }); r1.appendChild(sv);
    set.appendChild(r1);
    var ex = el('button', { class: 'btn small white', type: 'button' }, 'نسخة احتياطيّة من التقدّم');
    ex.addEventListener('click', function () { var a = el('a', { href: URL.createObjectURL(new Blob([JSON.stringify(RE.state, null, 1)], { type: 'application/json' })), download: 'rawnaq-ed-' + RE.today() + '.json' }); document.body.appendChild(a); a.click(); a.remove(); });
    var im = el('input', { type: 'file', accept: '.json,application/json', hidden: '' }), imb = el('button', { class: 'btn small white', type: 'button' }, 'استرجاع نسخة');
    imb.addEventListener('click', function () { im.click(); });
    im.addEventListener('change', function () { var f = im.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function () { try { var d = JSON.parse(rd.result); if (d && d.q) { RE.state = d; RE.save(); RE.load(); guardian(); } } catch (e) { alert('ملفّ غير صالح.'); } }; rd.readAsText(f); });
    var rs = el('button', { class: 'btn small white', type: 'button', style: 'color:#E8443A' }, 'البدء من جديد');
    rs.addEventListener('click', function () { if (confirm('يُمحى كلّ التقدّم المحفوظ على هذا الجهاز. هل أنت متأكّد؟')) { RE.reset(); guardian(); } });
    var r0 = el('div', { class: 'row', style: 'margin-top:14px' });
    [['snd', 'أصوات الأجوبة'], ['mus', 'موسيقى هادئة في الخلفيّة']].forEach(function (x) {
      var lb = el('label', { class: 'check' }), cb = el('input', { type: 'checkbox' }); cb.checked = RE.state[x[0]] !== false;
      cb.addEventListener('change', function () { RE.state[x[0]] = cb.checked; RE.save(); RE.sound.refresh(); syncSound(); });
      lb.appendChild(cb); lb.appendChild(document.createTextNode(' ' + x[1])); r0.appendChild(lb);
    });
    set.appendChild(r0);
    var r2 = el('div', { class: 'row', style: 'margin-top:14px' }); r2.appendChild(ex); r2.appendChild(imb); r2.appendChild(im); r2.appendChild(rs); set.appendChild(r2);
    w.appendChild(set);
  }

  /* ---------------- self-test: open  index.html#/selftest  after editing content ----------------
     Every question is answered with its own intended answer; a question that refuses it is listed. */
  function selftest() {
    var w = page('فحص المحتوى'), keep = JSON.stringify(RE.state), errs = [], n = 0, nf = 0, host = el('div', { style: 'display:none' }), ids = {}, fxKeep = RE.fx; RE.fx = null;
    document.body.appendChild(host);
    var tryViz = function (where, v) { if (!v) return; [].concat(v).forEach(function (x) { nf++; var h = RE.viz(x); if (h.getAttribute('data-err')) errs.push(where + ': رسم تعذّر: ' + h.getAttribute('data-err')); else if (/NaN|undefined/.test(h.innerHTML)) errs.push(where + ': في الرسم قيمة غير محسوبة'); }); };
    RE.stations.forEach(function (s) {
      if (!s.beats[0] || s.beats[0].kind !== 'intro') errs.push(s.id + ': لا تبدأ بتمهيد');
      try { slidesOf(s).forEach(function (sl) { if (sl.main && sl.main.t === 'q' && !sl.fig) errs.push(sl.main.id + ': بلا رسم'); if (sl.main && sl.main.t === 'q' && sl.main.viz == null) errs.push(sl.main.id + ': لم يُكتب له رسم (viz)'); }); } catch (e) { errs.push(s.id + ': ' + e.message); }
      s.beats.forEach(function (b) { b.blocks.forEach(function (k) {
        if (k.t === 'terms') k.items.forEach(function (it) { tryViz(s.id + ' / ' + it.w, it.viz); });
        if ((k.t === 'idea' || k.t === 'rule' || k.t === 'q') && k.viz && k.viz !== 'keep') tryViz(k.id || s.id + ' / ' + k.t, k.viz);
      }); });
    });
    RE.stations.forEach(function (s) { s.beats.forEach(function (b) { b.blocks.forEach(function (k) {
      try {
        if (k.t === 'widget') RE.widgets[k.name](host.appendChild(el('div')), k.opts || {});
        if (k.t !== 'q') return;
        n++; if (ids[k.id]) errs.push(k.id + ': معرّف مكرّر'); ids[k.id] = 1;
        var box = RE.question(k, { fresh: true, practiceOnly: true }); host.appendChild(box);
        [].forEach.call(box.querySelectorAll('.qt .ans'), function (i, ix) { i.value = k.show ? k.show[ix] : i.getAttribute('data-spec').replace(/^(set:|any:)/, '').split('|')[0]; });
        if (k.choices) (Array.isArray(k.answer) ? k.answer : [k.answer]).forEach(function (a) { box.querySelectorAll('.choice')[a].click(); });
        if (k.bins) [].slice.call(box.querySelectorAll('.chips .chip')).forEach(function (c, ci) { c.click(); box.querySelectorAll('.bin')[k.bins.items[ci][1]].click(); });
        var btn = box.querySelector('.btn.small.blue'); if (btn && !box.querySelector('.fb.ok')) btn.click();
        if (!box.querySelector('.fb.ok')) errs.push(k.id + ': الجواب المقصود لا يُقبل');
        if (/[`^]|\[\[/.test(box.querySelector('.qt').textContent)) errs.push(k.id + ': ترميز ظاهر في النصّ');
      } catch (e) { errs.push(s.id + ' / ' + (k.id || k.name) + ': ' + e.message); }
    }); }); });
    host.remove(); RE.state = JSON.parse(keep); RE.save(); RE.fx = fxKeep;
    w.appendChild(el('div', { class: 'card', id: 'selftest' }, '<h2>فحص المحتوى</h2><p>' + RE.stations.length + ' محطّات، ' + n + ' سؤالاً، ' + nf + ' رسماً. ' + (errs.length ? errs.length + ' ملاحظات:' : 'كلّ الأسئلة تقبل جوابها المقصود.') + '</p>' + errs.map(function (e) { return '<p class="m" style="display:block;white-space:normal">' + e + '</p>'; }).join('')));
  }

  function syncSound() {
    [['snd', 'sndBtn', '🔊', '🔇'], ['mus', 'musBtn', '🎵', '🎵']].forEach(function (x) { var b = document.getElementById(x[1]); if (!b) return; var on = RE.state[x[0]] !== false; b.textContent = on ? x[2] : x[3]; b.classList.toggle('off', !on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  /* every kind of figure on one page:  index.html#/viz */
  function gallery(id) {
    var st = id && RE.stations.filter(function (x) { return x.id === id; })[0];
    if (st) {   /* index.html#/viz/<station>: every exercise of a station beside its figures, to review them at a glance */
      var w2 = page('رسوم ' + st.id), g2 = el('div', { class: 'gallery' }); w2.appendChild(el('div', { class: 'hello' }, '<h1>' + t(st.title) + '</h1>')); w2.appendChild(g2);
      st.beats.forEach(function (b) { b.blocks.forEach(function (k) {
        var list = k.t === 'terms' ? k.items.map(function (it) { return { cap: '<b>' + t(it.w) + '</b>: ' + t(it.d), viz: it.viz }; }) : (k.viz && k.viz !== 'keep' ? [{ cap: '<b class="m">' + (k.id || k.t) + '</b> ' + t(String(k.text || k.html || '')).replace(/\[\[[^\]]*\]\]/g, ' ▢ '), viz: k.viz }] : []);
        list.forEach(function (x) { var c = el('div', { class: 'card' }, '<div style="font-size:13px;line-height:1.7">' + x.cap + '</div>'); [].concat(x.viz || []).forEach(function (v) { c.insertBefore(RE.viz(v), c.lastChild); }); g2.appendChild(c); });
      }); });
      return;
    }
    var w = page('الرسوم'); w.appendChild(el('div', { class: 'hello' }, '<h1>أنواع الرسوم</h1><p>دليلها في <span class="m">docs/VIZ.md</span></p>'));
    var grid = el('div', { class: 'gallery' }); w.appendChild(grid);
    var draw = function () { RE.vizSamples.forEach(function (v) { var c = el('div', { class: 'card' }, '<div class="m" style="font-size:13px;white-space:normal;word-break:break-all">' + JSON.stringify(v).replace(/</g, '&lt;').slice(0, 160) + '</div>'); c.insertBefore(RE.viz(v), c.firstChild); grid.appendChild(c); }); };
    if (RE.vizSamples) draw(); else { var sc = document.createElement('script'); sc.src = 'js/viz-samples.js'; sc.onload = draw; document.head.appendChild(sc); }
  }

  /* ---------------- router ---------------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, '').split('/');
    if (h[0] === 's') station(h[1], h[2] == null ? null : Number(h[2]));
    else if (h[0] === 'review') review(h[1] == null ? null : Number(h[1]));
    else if (h[0] === 'viz') gallery(h[1]);
    else if (h[0] === 'notebook') notebook();
    else if (h[0] === 'lab') lab(h[1], h[2]);
    else if (h[0] === 'guardian') guardian();
    else if (h[0] === 'selftest') selftest();
    else home();
    if (RE.afterRender) RE.afterRender();
  }
  window.addEventListener('DOMContentLoaded', function () {
    RE.load(); root = document.getElementById('app'); navEl = document.getElementById('nav');
    RE.fxStars = RE.totalStars(); RE.checkBadges(true);
    [['snd', 'sndBtn'], ['mus', 'musBtn']].forEach(function (x) { var b = document.getElementById(x[1]); if (b) b.addEventListener('click', function () { RE.state[x[0]] = RE.state[x[0]] === false; RE.save(); RE.sound.refresh(); syncSound(); if (RE.state[x[0]]) RE.sound.play('tap'); }); });
    syncSound();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.RENative) navigator.serviceWorker.register('sw.js').catch(function () { /* the site still works without it */ });
    window.addEventListener('hashchange', route); route();
  });
})();
