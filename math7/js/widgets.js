/* Rawnaq Ed — explorables. Each one is  RE.widgets.name(host, opts)  and draws into host.
   Rule taken from the Rawnaq games: the cause must be seen and touched. Nothing here is a video. */
(function () {
  'use strict';
  var RE = window.RE, N = RE.N, el = RE.el, svg = RE.svg, W = RE.widgets;
  var INK = '#2B2840', BLUE = '#2F7FE0', ORANGE = '#F58A1F', GREEN = '#5CBF3A', RED = '#E8443A', SUN = '#FFD21F', SKY = '#BFE6FA', PAPER2 = '#FDEFD3', VIOLET = '#8A63D2', PINK = '#F06AA8';

  function slider(host, label, min, max, val, cb) {
    var row = el('label', { class: 'ctl' }), out = el('span', { class: 'val' }, String(val));
    var inp = el('input', { type: 'range', min: min, max: max, value: val, step: 1, dir: 'ltr' });
    row.appendChild(el('span', {}, label)); row.appendChild(inp); row.appendChild(out);
    inp.addEventListener('input', function () { out.textContent = inp.value; cb(Number(inp.value)); });
    host.appendChild(row);
    return { set: function (v) { inp.value = v; out.textContent = v; }, max: function (m) { inp.max = m; if (Number(inp.value) > m) { inp.value = m; out.textContent = m; } }, get: function () { return Number(inp.value); } };
  }
  function area(host, vbW, vbH) {
    var box = el('div', { class: 'lab-area' }), s = svg('svg', { viewBox: '0 0 ' + vbW + ' ' + vbH, role: 'img' });
    box.appendChild(s); host.appendChild(box);
    return { box: box, svg: s, clear: function () { while (s.firstChild) s.removeChild(s.firstChild); }, size: function (w, h) { s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); } };
  }
  function txt(s, x, y, str, o) {
    o = o || {};
    var t = svg('text', { x: x, y: y, 'text-anchor': o.anchor || 'middle', 'font-size': o.size || 16, 'font-weight': o.weight || 700, fill: o.fill || INK, direction: 'ltr', 'font-family': 'inherit' });
    t.textContent = str; s.appendChild(t); return t;
  }
  function readout(host) { var r = el('div', { class: 'readout' }); host.appendChild(r); return function (html) { r.innerHTML = RE.t(html); }; }
  function note(host) { var r = el('div', { class: 'say', hidden: '' }); host.appendChild(r); return function (html) { r.hidden = !html; r.innerHTML = RE.t(html || ''); }; }

  /* ---------- the dart board of the textbook (p. 23): four darts, one sum ---------- */
  W.darts = function (host, o) {
    /* opts: goal (the sum to reach), zones (the three values, centre first), name (the player of the story) */
    var goal = (o && o.goal) || 23, Z = (o && o.zones) || [12, 5, 1], who = (o && o.name) || 'سلمى', hits = [], A = area(host, 600, 300), out = readout(host), say = note(host);
    var again = el('button', { class: 'btn small white', type: 'button' }, 'أربعة سهام جديدة'); host.appendChild(el('div', { class: 'row center' })).appendChild(again);
    function draw() {
      A.clear(); var s = A.svg;
      var bg = svg('rect', { x: 0, y: 0, width: 600, height: 300, fill: PAPER2, rx: 14, style: 'cursor:pointer' }); s.appendChild(bg);
      bg.addEventListener('click', function (e) { hit(0, e); });
      [[130, SKY, Z[2]], [86, '#C9B6EE', Z[1]], [42, '#A8E08F', Z[0]]].forEach(function (r) {
        var c = svg('circle', { cx: 300, cy: 150, r: r[0], fill: r[1], stroke: INK, 'stroke-width': 3, style: 'cursor:pointer' });
        c.addEventListener('click', function (e) { hit(r[2], e); }); s.appendChild(c);
      });
      txt(s, 300, 157, Z[0], { size: 22 }).style.pointerEvents = 'none'; txt(s, 300, 92, Z[1], { size: 20 }).style.pointerEvents = 'none'; txt(s, 300, 46, Z[2], { size: 20 }).style.pointerEvents = 'none';
      txt(s, 60, 34, 'خارج الرقعة: 0', { size: 14, fill: '#5A5670' }).style.pointerEvents = 'none';
      hits.forEach(function (h) { var d = svg('circle', { cx: h.x, cy: h.y, r: 7, fill: RED, stroke: INK, 'stroke-width': 2.5 }); d.style.pointerEvents = 'none'; s.appendChild(d); });
      var sum = hits.reduce(function (a, h) { return a + h.v; }, 0);
      out(hits.length ? '`' + hits.map(function (h) { return h.v; }).join(' + ') + (hits.length === 4 ? ' = ' + sum : ' + ...') + '`' : RE.g('المس[ي] الرقعة لترمي سهماً. ل[كِ|كَ] أربعة سهام.'));
      if (hits.length === 4) say(sum === goal ? '<b>`' + goal + '` بالضبط</b>، مثل ' + who + '. هل يوجد ترتيب آخر للرميات يعطي المجموع نفسه؟ غيّر[ي] ترتيب السهام وجرّب[ي].' : 'المجموع `' + sum + '`. ' + who + ' حصلت على `' + goal + '`. جرّب[ي] من جديد.');
      else say('');
    }
    function hit(v, e) {
      if (hits.length >= 4) return;
      var p = A.svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; p = p.matrixTransform(A.svg.getScreenCTM().inverse());
      hits.push({ v: v, x: p.x, y: p.y }); draw();
    }
    /* the same throws by button, for a remote control */
    var byKey = el('div', { class: 'row center', style: 'margin-top:10px' });
    [[Z[0], 0, 22], [Z[1], 48, 78], [Z[2], 94, 122], [0, 0, 0]].forEach(function (z) {
      var bt = el('button', { class: 'choice', type: 'button' }, z[0] ? '<span class="m">' + z[0] + '</span>' : 'خارج الرقعة');
      bt.addEventListener('click', function () {
        if (hits.length >= 4) return;
        var an = Math.random() * 6.28, r = z[1] + Math.random() * (z[2] - z[1]);
        hits.push(z[0] ? { v: z[0], x: 300 + r * Math.cos(an), y: 150 + r * Math.sin(an) } : { v: 0, x: 40 + Math.random() * 60, y: 230 + Math.random() * 40 });
        draw();
      });
      byKey.appendChild(bt);
    });
    host.appendChild(byKey);
    again.addEventListener('click', function () { hits = []; draw(); }); draw();
  };

  /* ---------- the difference that does not move (ages, p. 26) ---------- */
  W.gap = function (host, o) {
    o = o || {}; var y0 = o.year || 2001, a0 = o.a || 13, b0 = o.b || 41, yr = y0, A = area(host, 640, 150), out = readout(host);
    function draw() {
      A.clear(); var s = A.svg, k = 600 / 80, x0 = 20, y = 90, i, a = a0 + yr - y0, b = b0 + yr - y0;
      s.appendChild(svg('line', { x1: x0, y1: y, x2: x0 + 80 * k, y2: y, stroke: INK, 'stroke-width': 2.5 }));
      for (i = 0; i <= 80; i += 5) { s.appendChild(svg('line', { x1: x0 + i * k, y1: y - 5, x2: x0 + i * k, y2: y + 5, stroke: INK, 'stroke-width': i % 10 ? 1 : 2 })); if (i % 10 === 0) txt(s, x0 + i * k, y + 26, String(i), { size: 13, fill: '#5A5670' }); }
      s.appendChild(svg('rect', { x: x0 + a * k, y: y - 34, width: (b - a) * k, height: 14, rx: 7, fill: SUN, stroke: INK, 'stroke-width': 2 }));
      txt(s, x0 + (a + b) / 2 * k, y - 42, 'الفرق ' + (b - a), { size: 15 });
      s.appendChild(svg('circle', { cx: x0 + a * k, cy: y, r: 9, fill: BLUE, stroke: INK, 'stroke-width': 2.5 })); txt(s, x0 + a * k, y - 14, String(a), { size: 14, fill: BLUE });
      s.appendChild(svg('circle', { cx: x0 + b * k, cy: y, r: 9, fill: ORANGE, stroke: INK, 'stroke-width': 2.5 })); txt(s, x0 + b * k, y - 14, String(b), { size: 14, fill: '#d97506' });
      var d = yr - y0;
      out('سنة ' + yr + ': <span class="c-orange">`' + b + '`</span> − <span class="c-blue">`' + a + '`</span> = <b>`' + (b - a) + '`</b>' + (d ? ' &nbsp; أي &nbsp; `(' + b0 + (d > 0 ? ' + ' : ' − ') + Math.abs(d) + ') − (' + a0 + (d > 0 ? ' + ' : ' − ') + Math.abs(d) + ') = ' + b0 + ' − ' + a0 + '`' : ''));
    }
    slider(host, 'السنة', y0 - a0, y0 + 30, yr, function (v) { yr = v; draw(); });
    draw();
  };

  /* ---------- a × (b + c): the split rectangle ---------- */
  W.array = function (host, o) {
    o = o || {}; var a = o.a || 3, b = o.b || 4, c = o.c || 2, A = area(host, 560, 260), out = readout(host);
    function draw() {
      A.clear(); var s = A.svg, cols = b + c, cell = Math.min(36, 520 / cols, 200 / a), x0 = (560 - cols * cell) / 2, y0 = 34, i, j;
      for (i = 0; i < a; i++) for (j = 0; j < cols; j++)
        s.appendChild(svg('circle', { cx: x0 + j * cell + cell / 2 + (j >= b ? 8 : -8), cy: y0 + i * cell + cell / 2, r: cell * .36, fill: j < b ? BLUE : ORANGE, stroke: INK, 'stroke-width': 2 }));
      txt(s, x0 + b * cell / 2 - 8, 22, String(b), { fill: BLUE, size: 20 }); txt(s, x0 + b * cell + c * cell / 2 + 8, 22, String(c), { fill: ORANGE, size: 20 });
      txt(s, x0 - 26, y0 + a * cell / 2 + 6, String(a), { size: 20 });
      out('`' + a + ' × (' + b + ' + ' + c + ')` = <span class="c-blue">`' + a + ' × ' + b + '`</span> + <span class="c-orange">`' + a + ' × ' + c + '`</span> = `' + (a * b) + ' + ' + (a * c) + ' = ' + a * (b + c) + '`');
    }
    slider(host, 'عدد الصفوف', 1, 6, a, function (v) { a = v; draw(); });
    slider(host, 'الأزرق', 1, 9, b, function (v) { b = v; draw(); });
    slider(host, 'البرتقالي', 1, 6, c, function (v) { c = v; draw(); });
    draw();
  };

  /* ---------- order of operations: touch the operation to do first ---------- */
  W.order = function (host, o) {
    var list = (o && o.exprs) || ['3 + 4 × 5'], at = 0, toks, line = el('div', { class: 'readout', style: 'font-size:30px;min-height:2.4em' }), say = note(host), hist = el('div', { class: 'muted', style: 'text-align:center;direction:ltr' });
    host.insertBefore(line, host.lastChild); host.appendChild(hist);
    var bar = el('div', { class: 'row center' }), nextB = el('button', { class: 'btn small sun', type: 'button' }, 'عبارة أخرى'), againB = el('button', { class: 'btn small white', type: 'button' }, 'من جديد');
    bar.appendChild(againB); bar.appendChild(nextB); host.appendChild(bar);
    var PR = { '+': 1, '-': 1, '×': 2, ':': 2 };
    function parse(e) { return e.match(/\d+|[+\-×:()]/g).map(function (t) { return /^\d+$/.test(t) ? Number(t) : t; }); }
    function isNum(t) { return typeof t === 'number'; }
    function show(ts) { return ts.map(function (t) { return t === '-' ? '−' : t; }).join(' ').replace(/\( /g, '(').replace(/ \)/g, ')'); }
    function render() {
      line.innerHTML = ''; var wrap = el('span', { class: 'expr' });
      toks.forEach(function (t, i) {
        if (PR[t]) { var b = el('button', { class: 'choice', type: 'button', style: 'padding:0 12px;margin:0 6px' }, t === '-' ? '−' : t); b.addEventListener('click', function () { tap(i); }); wrap.appendChild(b); }
        else wrap.appendChild(el('span', { style: 'margin:0 3px' }, String(t)));
      });
      line.appendChild(wrap);
      if (toks.length === 1) say(RE.g('وصلتِ|وصلتَ').replace(/.*/, RE.state.fem ? 'وصلتِ' : 'وصلتَ') + ' إلى النتيجة: <b>`' + toks[0] + '`</b>. كلّ عمليّة أُنجزت في دورها.');
    }
    function tap(i) {
      var op = toks[i], L = toks[i - 1], R = toks[i + 1], lo = toks[i - 2], ro = toks[i + 2];
      if (!isNum(L) || !isNum(R)) { say('هذه العمليّة تنتظر ما بين القوسين. <b>ما بين القوسين يُحسب أوّلاً.</b>'); return; }
      /* is there a bracket elsewhere that still holds an operation? brackets go first */
      var depth = 0, myDepth = 0, deepest = 0, k;
      for (k = 0; k < toks.length; k++) { if (toks[k] === '(') depth++; if (k === i) myDepth = depth; if (toks[k] === ')') depth--; deepest = Math.max(deepest, depth); }
      if (myDepth < deepest) { say('في العبارة قوسان. <b>نبدأ بما بين القوسين.</b>'); return; }
      if (PR[ro] && PR[ro] > PR[op]) { say('انتبه[ي]: بجانبها ' + (ro === '×' ? 'ضرب' : 'قسمة') + '. <b>الضرب والقسمة قبل الجمع والطرح.</b> لو بدأنا من هنا لتغيّرت النتيجة.'); return; }
      if (PR[lo] && (PR[lo] > PR[op] || (PR[lo] === PR[op] && !(lo === op && (op === '+' || op === '×'))))) {
        say(PR[lo] > PR[op] ? 'قبلها ' + (lo === '×' ? 'ضرب' : 'قسمة') + ' لم يُنجز بعد. <b>الضرب والقسمة أوّلاً.</b>' : 'عمليّتان من نفس الدرجة: <b>ننجزهما من اليسار إلى اليمين.</b>'); return;
      }
      if (op === '-' && L < R) { say('لا يمكن طرح ' + R + ' من ' + L + ' في الأعداد الصحيحة الطبيعيّة.'); return; }
      if (op === ':' && (R === 0 || L % R)) { say('هذه القسمة لا تعطي عدداً صحيحاً طبيعيّاً.'); return; }
      var v = op === '+' ? L + R : op === '-' ? L - R : op === '×' ? L * R : L / R;
      hist.innerHTML += (hist.innerHTML ? ' &nbsp;→&nbsp; ' : '') + show(toks);
      toks.splice(i - 1, 3, v);
      var p = toks.indexOf(v, Math.max(0, i - 2));
      if (toks[i - 2] === '(' && toks[i] === ')') toks.splice(i - 2, 3, v);
      say('`' + L + ' ' + (op === '-' ? '−' : op) + ' ' + R + ' = ' + v + '`');
      render();
    }
    function start() { toks = parse(list[at % list.length]); hist.innerHTML = ''; say(RE.g('المس[ي] العمليّة التي تُنجَز أوّلاً.')); render(); }
    nextB.addEventListener('click', function () { at++; start(); }); againB.addEventListener('click', start);
    if (list.length < 2) nextB.hidden = true;
    start();
  };

  /* ---------- a^n: the tree that multiplies ---------- */
  W.powtree = function (host, o) {
    o = o || {}; var a = o.a || 2, n = o.n == null ? 3 : o.n, A = area(host, 640, 300), out = readout(host);
    function draw() {
      A.clear(); var s = A.svg, lv, i, total = Math.pow(a, n), H = 300, top = 26, gap = n ? (H - 60) / n : 0;
      if (total > 250) { txt(s, 320, 150, a + '^' + n + ' = ' + RE.fmt(total), { size: 30 }); txt(s, 320, 190, 'أكثر من أن تُرسَم!', { size: 18, fill: '#5A5670' }); }
      else for (lv = 0; lv <= n; lv++) {
        var cnt = Math.pow(a, lv), y = top + lv * gap, r = Math.max(2.2, Math.min(11, 300 / cnt));
        for (i = 0; i < cnt; i++) {
          var x = 640 * (i + .5) / cnt;
          if (lv) { var px = 640 * (Math.floor(i / a) + .5) / (cnt / a); s.insertBefore(svg('line', { x1: px, y1: y - gap, x2: x, y2: y, stroke: INK, 'stroke-width': cnt > 60 ? .6 : 1.6 }), s.firstChild); }
          s.appendChild(svg('circle', { cx: x, cy: y, r: r, fill: lv === n ? SUN : [GREEN, BLUE, ORANGE, PINK, VIOLET, SKY][lv % 6], stroke: INK, 'stroke-width': cnt > 60 ? .8 : 2 }));
        }
      }
      var f = []; for (i = 0; i < n; i++) f.push(a);
      out('`' + a + '^' + n + '`' + (n > 1 ? ' = `' + f.join(' × ') + '`' : '') + ' = <b>`' + RE.fmt(total) + '`</b>' + (n === 0 ? ' &nbsp;(لم نضرب بعد: ورقة واحدة)' : ''));
    }
    slider(host, 'كلّ فرع ينقسم إلى', 2, 5, a, function (v) { a = v; draw(); });
    slider(host, 'عدد المرّات (الدليل)', 0, 7, n, function (v) { n = v; draw(); });
    draw();
  };

  /* ---------- rules of powers shown as rows of factors ---------- */
  W.factors = function (host, o) {
    o = o || {}; var mode = o.mode || 'mul', a = o.a || 2, b = o.b || 3, m = o.m || 3, n = o.n || 2, out = el('div', { class: 'readout', style: 'line-height:2.3' });
    host.appendChild(out);
    function run(v, k, cls) { var f = []; for (var i = 0; i < k; i++) f.push(v); return '<span class="' + cls + '">' + (f.join(' × ') || '1') + '</span>'; }
    function draw() {
      var h;
      if (mode === 'mul') h = '`' + a + '^' + m + ' × ' + a + '^' + n + '`<br><span class="expr">(' + run(a, m, 'c-blue') + ') × (' + run(a, n, 'c-orange') + ')</span><br>' + m + ' عوامل ثمّ ' + n + ' عوامل: المجموع <b>' + (m + n) + '</b><br>`' + a + '^' + m + ' × ' + a + '^' + n + ' = ' + a + '^' + (m + n) + '`';
      else if (mode === 'pow') { var g = []; for (var i = 0; i < n; i++) g.push('(' + run(a, m, i % 2 ? 'c-orange' : 'c-blue') + ')'); h = '`(' + a + '^' + m + ')^' + n + '`<br><span class="expr" style="white-space:normal">' + g.join(' × ') + '</span><br>' + n + ' مجموعات، في كلّ واحدة ' + m + ' عوامل: <b>' + n + ' × ' + m + ' = ' + (m * n) + '</b><br>`(' + a + '^' + m + ')^' + n + ' = ' + a + '^' + (m * n) + '`'; }
      else { var p = []; for (var j = 0; j < n; j++) p.push('(<span class="c-blue">' + a + '</span> × <span class="c-orange">' + b + '</span>)'); h = '`(' + a + ' × ' + b + ')^' + n + '`<br><span class="expr" style="white-space:normal">' + p.join(' × ') + '</span><br>نرتّب العوامل: <span class="expr">(' + run(a, n, 'c-blue') + ') × (' + run(b, n, 'c-orange') + ')</span><br>`(' + a + ' × ' + b + ')^' + n + ' = ' + a + '^' + n + ' × ' + b + '^' + n + '`'; }
      out.innerHTML = RE.t(h);
    }
    slider(host, mode === 'prod' ? 'العدد الأزرق' : 'العدد', 2, 9, a, function (v) { a = v; draw(); });
    if (mode === 'prod') slider(host, 'العدد البرتقالي', 2, 9, b, function (v) { b = v; draw(); });
    if (mode !== 'prod') slider(host, mode === 'mul' ? 'الدليل الأوّل' : 'الدليل الداخلي', 1, 5, m, function (v) { m = v; draw(); });
    slider(host, mode === 'mul' ? 'الدليل الثاني' : 'الدليل الخارجي', 1, 5, n, function (v) { n = v; draw(); });
    draw();
  };

  /* ---------- Euclidean division: bouquets and what is left ---------- */
  W.euclid = function (host, o) {
    o = o || {}; var a = o.a || 23, b = o.b || 5, A = area(host, 600, 300), out = readout(host);
    function draw() {
      A.clear(); var s = A.svg, q = Math.floor(a / b), r = a % b, rows = q + (r ? 1 : 0), d = Math.min(30, 520 / b, 270 / Math.max(rows, 1)), x0 = (600 - b * d) / 2, i, j;
      A.size(600, Math.max(120, rows * d + 30));
      for (i = 0; i < q; i++) {
        s.appendChild(svg('rect', { x: x0 - 4, y: 12 + i * d + 1, width: b * d + 8, height: d - 2, rx: d / 2.4, fill: '#DDF3D3', stroke: INK, 'stroke-width': 1.5 }));
        for (j = 0; j < b; j++) s.appendChild(svg('circle', { cx: x0 + j * d + d / 2, cy: 12 + i * d + d / 2, r: d * .3, fill: GREEN, stroke: INK, 'stroke-width': 1.5 }));
      }
      for (j = 0; j < r; j++) s.appendChild(svg('circle', { cx: x0 + j * d + d / 2, cy: 12 + q * d + d / 2, r: d * .3, fill: RED, stroke: INK, 'stroke-width': 1.5 }));
      out('`' + a + ' = ' + b + ' × ' + q + ' + ' + '`<span class="c-red">`' + r + '`</span> &nbsp; ' + (r ? 'الباقي <span class="c-red">`' + r + '`</span> أصغر من `' + b + '`' : '<b>الباقي صفر: `' + b + '` قاسم لـ `' + a + '`</b>'));
    }
    slider(host, (o && o.things) || 'عدد القطع', 1, o.maxA || 60, a, function (v) { a = v; draw(); });
    slider(host, (o && o.group) || 'في كلّ مجموعة', 1, o.maxB || 15, b, function (v) { b = v; draw(); });
    draw();
  };

  /* ---------- divisors: every rectangle you can build with n tiles ---------- */
  W.rects = function (host, o) {
    o = o || {}; var n = o.n || 12, w = 1, found = {}, A = area(host, 600, 240), out = readout(host), fd = el('div', { class: 'found' }), say = note(host), sn, sw;
    host.insertBefore(fd, host.lastChild);
    function draw() {
      A.clear(); var s = A.svg, rows = Math.ceil(n / w), r = n % w, d = Math.min(34, 560 / w, 400 / rows), x0 = (600 - w * d) / 2, i;
      A.size(600, rows * d + 20);
      for (i = 0; i < n; i++) {
        var row = Math.floor(i / w), last = r && row === rows - 1;
        s.appendChild(svg('rect', { x: x0 + (i % w) * d + 1, y: 10 + row * d + 1, width: d - 2, height: d - 2, rx: Math.min(6, d / 5), fill: last ? RED : (r ? SKY : GREEN), stroke: INK, 'stroke-width': d < 10 ? .6 : 1.6 }));
      }
      if (!r) { found[w] = found[n / w] = 1; out('مستطيل كامل: `' + n + ' = ' + w + ' × ' + (n / w) + '` &nbsp;←&nbsp; `' + w + '` و `' + (n / w) + '` قاسمان لـ `' + n + '`'); }
      else out('`' + n + ' = ' + w + ' × ' + Math.floor(n / w) + ' + ' + '`<span class="c-red">`' + r + '`</span> &nbsp; الصفّ الأخير ناقص: `' + w + '` ليس قاسماً لـ `' + n + '`');
      var all = N.divisors(n); fd.innerHTML = '';
      all.forEach(function (x) { fd.appendChild(el('span', { class: found[x] ? '' : 'miss' }, String(x))); });
      var got = all.filter(function (x) { return found[x]; }).length;
      say(got < all.length ? '' : all.length === 2 ? 'للعدد `' + n + '` مستطيل واحد فقط: صفّ واحد طويل. قاسماه `1` و `' + n + '` لا غير. <b>هذا عدد أوّليّ.</b>' : all.length === 1 ? 'العدد `1` له قاسم واحد فقط: نفسه.' : 'وجدتِ كلّ قواسم `'.replace('وجدتِ', RE.state.fem ? 'وجدتِ' : 'وجدتَ') + n + '`: عددها ' + all.length + '. لاحظ[ي] أنّها تأتي أزواجاً: كلّ مستطيل يعطي قاسمين.');
    }
    sn = slider(host, 'عدد البلاطات', 1, o.max || 48, n, function (v) { n = v; found = {}; w = Math.min(w, n); sw.max(n); sw.set(w); draw(); });
    sw = slider(host, 'بلاطات في كلّ صفّ', 1, n, w, function (v) { w = v; draw(); });
    draw();
  };

  /* ---------- divisibility by 4 and by 25: only the last two digits matter ---------- */
  W.last2 = function (host, o) {
    var d = (o && o.d) || 4, n = (o && o.n) || 2768, row = el('div', { class: 'ctl' }), inp = el('input', { class: 'ans wide', inputmode: 'numeric', value: n, 'aria-label': 'العدد' }), A = area(host, 600, 150), out = readout(host);
    row.appendChild(el('span', {}, RE.g('اكتب[ي] عدداً:'))); row.appendChild(inp); host.insertBefore(row, A.box);
    function draw() {
      var v = parseInt(RE.norm(inp.value), 10); if (!(v >= 0) || v > 99999999) { out('عدد صحيح طبيعيّ من فضلك.'); return; }
      n = v; var tail = n % 100, hund = Math.floor(n / 100), s = A.svg, r = tail % d, q = Math.floor(tail / d), i; A.clear();
      s.appendChild(svg('rect', { x: 20, y: 30, width: 250, height: 70, rx: 14, fill: PAPER2, stroke: INK, 'stroke-width': 2.5 }));
      txt(s, 145, 62, RE.fmt(hund * 100), { size: 24 }); txt(s, 145, 88, hund + ' × 100', { size: 15, fill: '#5A5670' });
      txt(s, 145, 126, 'كلّ مئة = ' + d + ' × ' + (100 / d) + '  ←  لا يبقى شيء', { size: 14, fill: '#3d9a1f' });
      txt(s, 298, 74, '+', { size: 28 });
      s.appendChild(svg('rect', { x: 326, y: 30, width: 254, height: 70, rx: 14, fill: r ? '#FBDDEA' : '#DDF3D3', stroke: INK, 'stroke-width': 2.5 }));
      txt(s, 453, 62, String(tail), { size: 24 }); txt(s, 453, 88, tail + ' = ' + d + ' × ' + q + ' + ' + r, { size: 15, fill: '#5A5670' });
      txt(s, 453, 126, 'الباقي يأتي من هنا فقط', { size: 14, fill: r ? RED : '#3d9a1f' });
      out('باقي قسمة `' + RE.fmt(n) + '` على `' + d + '` = باقي قسمة `' + tail + '` على `' + d + '` = <b class="' + (r ? 'c-red' : 'c-green') + '">`' + r + '`</b>' + (r ? '' : ' &nbsp;←&nbsp; يقبل القسمة على `' + d + '`'));
    }
    inp.addEventListener('input', draw); draw();
  };

  /* ---------- the sieve of Eratosthenes ---------- */
  W.sieve = function (host) {
    var say = note(host), grid = el('div', { class: 'grid100' }), cells = [], out = [], primes = [], busy = false, i;
    var box = el('div', { class: 'lab-area' }); box.appendChild(grid); host.appendChild(box);
    var again = el('button', { class: 'btn small white', type: 'button' }, 'من جديد'); host.appendChild(el('div', { class: 'row center' })).appendChild(again);
    function nextP() { for (var k = 2; k <= 100; k++) if (!out[k] && primes.indexOf(k) < 0) return k; return 0; }
    function finish() { for (var k = 2; k <= 100; k++) if (!out[k]) cells[k].classList.add('prime'); say('انتهى الغربال! ما بقي أصفر هو <b>الأعداد الأوّليّة الأصغر من 100</b>، وعددها 25.<br>لماذا توقّفنا عند 7؟ لأنّ العدد الأوّليّ الموالي هو 11، وأوّل مضاعف له لم يُشطب بعد هو `11 × 11 = 121`، وهو أكبر من 100.'); }
    function tap(k) {
      if (busy) return;
      if (!out[1]) { if (k !== 1) { say('نبدأ بالعدد `1`: له قاسم واحد فقط، فليس أوّليّاً. المس[ي]ه لنشطبه.'); return; } out[1] = 1; cells[1].classList.add('one'); say('`1` غير أوّليّ، شطبناه. الآن المس[ي] <b>أصغر عدد لم يُشطب</b>.'); return; }
      var p = nextP(); if (!p) return;
      if (k !== p) { say(out[k] ? 'هذا العدد مشطوب. المس[ي] أصغر عدد لم يُشطب بعد.' : primes.indexOf(k) >= 0 ? 'هذا عدد أوّليّ عرفناه. المس[ي] أصغر عدد لم يُلوَّن ولم يُشطب.' : 'ليس هو الأصغر. ابحث[ي] عن <b>أصغر</b> عدد لم يُشطب بعد.'); return; }
      primes.push(p); cells[p].classList.add('prime'); busy = true;
      var ms = [], m; for (m = 2 * p; m <= 100; m += p) ms.push(m);
      say('`' + p + '` أوّليّ. نشطب بقيّة مضاعفاته: `' + ms.slice(0, 4).join(' , ') + ' , ...`');
      ms.forEach(function (x, j) { setTimeout(function () { cells[x].classList.add('hit'); setTimeout(function () { cells[x].classList.remove('hit'); cells[x].classList.add('out'); out[x] = 1; }, 260); }, 40 * j); });
      setTimeout(function () { busy = false; var nx = nextP(); if (nx * nx > 100) finish(); }, 40 * ms.length + 320);
    }
    function start() {
      grid.innerHTML = ''; cells = []; out = []; primes = []; busy = false;
      for (i = 1; i <= 100; i++) (function (k) { var b = el('button', { type: 'button' }, String(k)); b.addEventListener('click', function () { tap(k); }); cells[k] = b; grid.appendChild(b); })(i);
      say('غربال إراتستان: نُسقط من الشبكة كلّ ما ليس أوّليّاً. ابدأ[ي] بلمس العدد `1`.');
    }
    again.addEventListener('click', start); start();
  };

  /* ---------- successive divisions: the practical method of the textbook ---------- */
  W.ladder = function (host, o) {
    var n = (o && o.n) || 120, cur, rows, row = el('div', { class: 'ctl' }), inp = el('input', { class: 'ans', inputmode: 'numeric', value: n, 'aria-label': 'العدد' }), tbl = el('div', { class: 'lab-area', style: 'direction:ltr' }), btns = el('div', { class: 'row center' }), out, say;
    row.appendChild(el('span', {}, 'العدد:')); row.appendChild(inp);
    host.appendChild(row); host.appendChild(tbl); host.appendChild(btns); out = readout(host); say = note(host);
    function draw() {
      var h = '<table style="margin:0 auto;border-collapse:collapse;font-weight:700;font-size:22px">';
      rows.forEach(function (r) { h += '<tr><td style="padding:0 16px;text-align:right">' + r[0] + '</td><td style="padding:0 16px;border-left:3px solid ' + INK + ';color:' + BLUE + '">' + r[1] + '</td></tr>'; });
      h += '<tr><td style="padding:0 16px;text-align:right">' + cur + '</td><td style="padding:0 16px;border-left:3px solid ' + INK + '">&nbsp;</td></tr></table>'; tbl.innerHTML = h;
      btns.innerHTML = '';
      if (cur === 1) { out('`' + n + ' = ' + rows.map(function (r) { return r[1]; }).sort(function (a, b) { return a - b; }).join(' × ') + '`' + (rows.length > 1 ? ' &nbsp;أي&nbsp; <b>`' + n + ' = ' + N.factorText(n) + '`</b>' : '')); if (rows.length === 1) say('`' + n + '` عدد أوّليّ: لا يُفكَّك أكثر.'); return; }
      out(RE.g('[اختاري|اختر] عدداً أوّليّاً يقسم `' + cur + '`'));
      var ps = [2, 3, 5, 7, 11, 13, 17, 19, 23]; if (N.isPrime(cur) && cur > 23) ps.push(cur);
      ps.forEach(function (p) { var b = el('button', { class: 'choice', type: 'button' }, String(p)); b.addEventListener('click', function () {
        if (cur % p) { say('`' + cur + ' = ' + p + ' × ' + Math.floor(cur / p) + ' + ' + (cur % p) + '`: الباقي ليس صفراً، إذن `' + p + '` ليس قاسماً لـ `' + cur + '`.' + (p === 3 ? ' (مجموع أرقامه ' + String(cur).split('').reduce(function (x, y) { return x + Number(y); }, 0) + ')' : '')); return; }
        rows.push([cur, p]); cur /= p; say(''); draw();
      }); btns.appendChild(b); });
    }
    function start() { var v = parseInt(RE.norm(inp.value), 10); if (!(v >= 2) || v > 999999) { out('عدد بين 2 و 999999 من فضلك.'); tbl.innerHTML = ''; btns.innerHTML = ''; return; } n = v; cur = n; rows = []; say(''); draw(); }
    inp.addEventListener('change', start); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') start(); });
    start();
  };

  /* ---------- the cake: squares that fit both sides (common divisors, GCD) ---------- */
  W.cake = function (host, o) {
    var pairs = (o && o.pairs) || [[39, 26]], pi = 0, a, b, s1 = 1, found = {}, A = area(host, 600, 300), out = readout(host), fd = el('div', { class: 'found' }), say = note(host), sl;
    host.insertBefore(fd, host.lastChild);
    if (pairs.length > 1) { var pick = el('div', { class: 'row center', style: 'margin-bottom:10px' }); pairs.forEach(function (p, i) { var bt = el('button', { class: 'choice', type: 'button' }, '<span class="m">' + p[0] + ' × ' + p[1] + '</span>'); bt.addEventListener('click', function () { pi = i; setup(); }); pick.appendChild(bt); }); host.insertBefore(pick, A.box); }
    function draw() {
      A.clear(); var s = A.svg, k = Math.min(560 / a, 300 / b), x0 = (600 - a * k) / 2, y0 = 10, fits = a % s1 === 0 && b % s1 === 0, i, j, nx = Math.floor(a / s1), ny = Math.floor(b / s1);
      A.size(600, b * k + 20);
      s.appendChild(svg('rect', { x: x0, y: y0, width: a * k, height: b * k, fill: fits ? '#DDF3D3' : '#FBDDEA', stroke: INK, 'stroke-width': 2.5 }));
      for (i = 0; i < nx; i++) for (j = 0; j < ny; j++) s.appendChild(svg('rect', { x: x0 + i * s1 * k, y: y0 + j * s1 * k, width: s1 * k, height: s1 * k, fill: fits ? GREEN : SUN, stroke: INK, 'stroke-width': s1 * k < 8 ? .5 : 1.5, 'fill-opacity': fits ? .85 : .9 }));
      if (fits) { found[s1] = 1; out('ضلع القطعة `' + s1 + '`: <b>' + (nx * ny) + ' قطعة</b> ولا يضيع شيء. `' + s1 + '` قاسم لـ `' + a + '` ولـ `' + b + '` معاً.'); }
      else out('ضلع القطعة `' + s1 + '`: <span class="c-red">يضيع جزء من الكعكة</span>. ' + (a % s1 ? '`' + a + ' = ' + s1 + ' × ' + nx + ' + ' + (a % s1) + '`' : '') + (a % s1 && b % s1 ? ' ، ' : '') + (b % s1 ? '`' + b + ' = ' + s1 + ' × ' + ny + ' + ' + (b % s1) + '`' : ''));
      var g = N.gcd(a, b), all = N.divisors(g); fd.innerHTML = '';
      all.forEach(function (x) { fd.appendChild(el('span', { class: found[x] ? '' : 'miss' }, String(x))); });
      say(all.every(function (x) { return found[x]; }) ? 'هذه كلّ <b>القواسم المشتركة</b> لـ `' + a + '` و `' + b + '`. أكبرها `' + g + '`: هو <b>القاسم المشترك الأكبر</b>، ونكتب `ق.م.أ (' + a + ' ; ' + b + ') = ' + g + '`.' + (g === 1 ? ' لا قاسم مشترك غير `1`: العددان <b>أوّليّان فيما بينهما</b>.' : '') : '');
    }
    function setup() { a = pairs[pi][0]; b = pairs[pi][1]; found = {}; s1 = 1; sl.max(Math.min(a, b)); sl.set(1); draw(); }
    sl = slider(host, 'ضلع القطعة المربّعة', 1, 10, 1, function (v) { s1 = v; draw(); });
    setup();
  };

  /* ---------- two jumpers on the number line: common multiples, LCM ---------- */
  W.jumps = function (host, o) {
    o = o || {}; var a = o.a || 4, b = o.b || 6, MAX = o.max || 60, A = area(host, 640, 190), out = readout(host);
    function draw() {
      A.clear(); var s = A.svg, k = 600 / MAX, x0 = 20, y = 100, i;
      s.appendChild(svg('line', { x1: x0, y1: y, x2: x0 + MAX * k, y2: y, stroke: INK, 'stroke-width': 2.5 }));
      for (i = 0; i <= MAX; i++) { var big = i % 5 === 0; s.appendChild(svg('line', { x1: x0 + i * k, y1: y - (big ? 7 : 4), x2: x0 + i * k, y2: y + (big ? 7 : 4), stroke: INK, 'stroke-width': big ? 2 : 1 })); if (i % 10 === 0) txt(s, x0 + i * k, y + 5, '', {}); }
      function arcs(step, up, col) { for (var m = 0; m + step <= MAX; m += step) { var x1 = x0 + m * k, x2 = x0 + (m + step) * k, h = Math.min(70, step * k * .9); s.appendChild(svg('path', { d: 'M' + x1 + ' ' + y + ' Q' + (x1 + x2) / 2 + ' ' + (y + (up ? -h : h)) + ' ' + x2 + ' ' + y, fill: 'none', stroke: col, 'stroke-width': 3 })); } }
      arcs(a, true, BLUE); arcs(b, false, ORANGE);
      var common = [];
      for (i = 0; i <= MAX; i++) {
        var ma = i % a === 0, mb = i % b === 0;
        if (ma && mb) { common.push(i); s.appendChild(svg('circle', { cx: x0 + i * k, cy: y, r: 9, fill: SUN, stroke: INK, 'stroke-width': 2.5 })); txt(s, x0 + i * k, y + 34, String(i), { size: 15 }); }
        else if (ma || mb) s.appendChild(svg('circle', { cx: x0 + i * k, cy: y, r: 4.5, fill: ma ? BLUE : ORANGE, stroke: INK, 'stroke-width': 1.2 }));
      }
      var l = N.lcm(a, b);
      out('مضاعفات مشتركة لـ <span class="c-blue">`' + a + '`</span> و <span class="c-orange">`' + b + '`</span>: `' + common.join(' ، ') + (l <= MAX ? ' ...`' : '`') + '<br>' + (l <= MAX ? 'أصغرها غير الصفر: <b>`م.م.أ (' + a + ' ; ' + b + ') = ' + l + '`</b>' : 'أوّل لقاء بعد الصفر يقع عند `' + l + '`، خارج هذا الخطّ.'));
    }
    slider(host, 'قفزة الأزرق', 2, 16, a, function (v) { a = v; draw(); });
    slider(host, 'قفزة البرتقالي', 2, 16, b, function (v) { b = v; draw(); });
    draw();
  };

  /* ---------- decimals on the graduated line, with a magnifier (qualification document, p. 9) ---------- */
  W.ruler = function (host, o) {
    o = o || {}; var from = o.from == null ? 10 : o.from, to = o.to || 15, t = o.t == null ? 24 : o.t, h = o.h || 0, A = area(host, 640, 250), out = readout(host);
    function fmtD(x) { return String(Math.round(x * 100) / 100).replace('.', ','); }
    function draw() {
      A.clear(); var s = A.svg, n = (to - from) * 10, k = 600 / n, x0 = 20, y = 70, i, v = from + t / 10 + h / 100;
      s.appendChild(svg('line', { x1: x0, y1: y, x2: x0 + n * k, y2: y, stroke: INK, 'stroke-width': 3 }));
      for (i = 0; i <= n; i++) { var big = i % 10 === 0; s.appendChild(svg('line', { x1: x0 + i * k, y1: y - (big ? 14 : i % 5 === 0 ? 9 : 6), x2: x0 + i * k, y2: y + (big ? 14 : 6), stroke: INK, 'stroke-width': big ? 3 : 1.4 })); if (big) txt(s, x0 + i * k, y + 36, String(from + i / 10), { size: 17 }); }
      var mx = x0 + (t + h / 10) * k;
      s.appendChild(svg('path', { d: 'M' + mx + ' ' + (y - 16) + ' l-9 -18 h18 z', fill: RED, stroke: INK, 'stroke-width': 2 }));
      /* magnifier: the tenth that holds the marker, cut in ten */
      var a = from + t / 10, zx = 120, zw = 400, zy = 185;
      s.appendChild(svg('path', { d: 'M' + (x0 + t * k) + ' ' + (y + 8) + ' L' + zx + ' ' + (zy - 22) + ' M' + (x0 + (t + 1) * k) + ' ' + (y + 8) + ' L' + (zx + zw) + ' ' + (zy - 22), stroke: '#5A5670', 'stroke-width': 1.2, 'stroke-dasharray': '5 4', fill: 'none' }));
      s.appendChild(svg('rect', { x: zx - 16, y: zy - 22, width: zw + 32, height: 62, rx: 12, fill: PAPER2, stroke: INK, 'stroke-width': 2 }));
      s.appendChild(svg('line', { x1: zx, y1: zy, x2: zx + zw, y2: zy, stroke: INK, 'stroke-width': 2.5 }));
      for (i = 0; i <= 10; i++) { s.appendChild(svg('line', { x1: zx + i * zw / 10, y1: zy - (i % 10 ? 6 : 11), x2: zx + i * zw / 10, y2: zy + (i % 10 ? 6 : 11), stroke: INK, 'stroke-width': i % 10 ? 1.4 : 2.5 })); }
      txt(s, zx, zy + 30, fmtD(a), { size: 14 }); txt(s, zx + zw, zy + 30, fmtD(a + 0.1), { size: 14 });
      s.appendChild(svg('circle', { cx: zx + h * zw / 10, cy: zy, r: 8, fill: RED, stroke: INK, 'stroke-width': 2 }));
      var w = Math.floor(v + 1e-9), near = Math.round(v + 1e-9);
      out('<b>`' + fmtD(v) + '`</b> = `' + w + '` + `{' + t % 10 + '/10}`' + (h ? ' + `{' + h + '/100}`' : '') + ' &nbsp;·&nbsp; `' + w + ' < ' + fmtD(v) + ' < ' + (w + 1) + '`' + (Math.abs(v - w) < 1e-9 ? '' : ' &nbsp;·&nbsp; أقرب عدد صحيح: `' + near + '`'));
    }
    slider(host, 'الأعشار', 0, (to - from) * 10 - 1, t, function (v) { t = v; draw(); });
    slider(host, 'المئات (العدسة)', 0, 9, h, function (v) { h = v; draw(); });
    draw();
  };

  /* ---------- a fraction as bars: wholes and what is left ---------- */
  W.frac = function (host, o) {
    o = o || {}; var n = o.n == null ? 7 : o.n, d = o.d || 4, A = area(host, 640, 150), out = readout(host);
    function draw() {
      A.clear(); var s = A.svg, bars = Math.max(1, Math.ceil(n / d)), gap = 14, bw = Math.min(190, (620 - gap * (bars - 1)) / bars), x0 = (640 - bars * bw - gap * (bars - 1)) / 2, i, j;
      for (i = 0; i < bars; i++) for (j = 0; j < d; j++) {
        var on = i * d + j < n;
        s.appendChild(svg('rect', { x: x0 + i * (bw + gap) + j * bw / d, y: 30, width: bw / d, height: 70, fill: on ? (i * d + d <= n ? GREEN : BLUE) : '#fff', stroke: INK, 'stroke-width': 2 }));
      }
      for (i = 0; i < bars; i++) txt(s, x0 + i * (bw + gap) + bw / 2, 128, i * d + d <= n ? '1' : (n - i * d) + '/' + d, { size: 15, fill: '#5A5670' });
      var q = Math.floor(n / d), r = n % d, g = N.gcd(n, d) || 1, val = n / d, dec = String(Math.round(val * 1000) / 1000).replace('.', ',');
      var h = '`{' + n + '/' + d + '}`';
      if (r === 0) h += ' = <b>`' + q + '`</b>'; else if (q > 0) h += ' = `' + q + ' + {' + r + '/' + d + '}`';
      if (g > 1 && r) h += ' = `{' + n / g + '/' + d / g + '}`';
      if (r) h += ' &nbsp;·&nbsp; `' + q + ' < {' + n + '/' + d + '} < ' + (q + 1) + '`';
      if (r && Math.abs(val * 1000 - Math.round(val * 1000)) < 1e-9) h += ' &nbsp;·&nbsp; `' + dec + '`';
      out(h + '<br><span class="muted">' + (n < d ? 'البسط أصغر من المقام: العدد أصغر من `1`' : n === d ? 'البسط يساوي المقام: العدد يساوي `1`' : 'البسط أكبر من المقام: العدد أكبر من `1`') + '</span>');
    }
    slider(host, 'البسط (ما نأخذه)', 0, 24, n, function (v) { n = v; draw(); });
    slider(host, 'المقام (إلى كم نقسم الواحد)', 1, 12, d, function (v) { d = v; draw(); });
    draw();
  };

  /* ---------- the opening of an angle ---------- */
  W.angle = function (host, o) {
    var a = (o && o.a) || 60, A = area(host, 640, 260), out = readout(host);
    function draw() {
      A.clear(); var s = A.svg, cx = 320, cy = 220, R = 190, rad = a * Math.PI / 180, x2 = cx + R * Math.cos(rad), y2 = cy - R * Math.sin(rad), col = a === 90 ? GREEN : a < 90 ? BLUE : ORANGE;
      if (a > 0) s.appendChild(svg('path', { d: 'M' + cx + ' ' + cy + ' L' + (cx + 60) + ' ' + cy + ' A60 60 0 0 0 ' + (cx + 60 * Math.cos(rad)) + ' ' + (cy - 60 * Math.sin(rad)) + ' Z', fill: col, 'fill-opacity': 0.35, stroke: 'none' }));
      if (a === 90) s.appendChild(svg('path', { d: 'M' + (cx + 26) + ' ' + cy + ' v-26 h-26', fill: 'none', stroke: INK, 'stroke-width': 2.5 }));
      s.appendChild(svg('line', { x1: cx, y1: cy, x2: cx + R + 40, y2: cy, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }));
      s.appendChild(svg('line', { x1: cx, y1: cy, x2: x2, y2: y2, stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round' }));
      s.appendChild(svg('circle', { cx: cx, cy: cy, r: 6, fill: INK }));
      txt(s, cx - 16, cy + 22, 'A', { size: 18 }); txt(s, cx + R + 30, cy + 24, 'B', { size: 18 }); txt(s, x2 + (a > 90 ? -18 : 18), y2 - 8, 'C', { size: 18 });
      out('`' + a + '°` &nbsp; <b class="' + (a === 90 ? 'c-green' : a < 90 ? 'c-blue' : 'c-orange') + '">' + (a === 0 ? 'زاوية منعدمة' : a < 90 ? 'زاوية حادّة (أصغر من `90°`)' : a === 90 ? 'زاوية قائمة (`90°` بالضبط)' : a < 180 ? 'زاوية منفرجة (بين `90°` و `180°`)' : 'زاوية مستقيمة (`180°`)') + '</b>');
    }
    slider(host, 'الفتحة', 0, 180, a, function (v) { a = v; draw(); });
    draw();
  };

  /* ---------- a triangle is half of its rectangle, wherever the apex goes ---------- */
  W.triarea = function (host, o) {
    o = o || {}; var b = o.b || 7, h = o.h || 2, p = o.p == null ? 3 : o.p, A = area(host, 640, 250), out = readout(host), sp;
    function draw() {
      A.clear(); var s = A.svg, k = Math.min(52, 580 / b, 190 / h), x0 = (640 - b * k) / 2, y0 = 20, i, j, px = Math.min(p, b);
      for (i = 0; i < b; i++) for (j = 0; j < h; j++) s.appendChild(svg('rect', { x: x0 + i * k, y: y0 + j * k, width: k, height: k, fill: '#fff', stroke: '#C9C4D6', 'stroke-width': 1 }));
      s.appendChild(svg('rect', { x: x0, y: y0, width: b * k, height: h * k, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '7 5' }));
      s.appendChild(svg('path', { d: 'M' + x0 + ' ' + (y0 + h * k) + ' L' + (x0 + b * k) + ' ' + (y0 + h * k) + ' L' + (x0 + px * k) + ' ' + y0 + ' Z', fill: SUN, 'fill-opacity': 0.85, stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
      s.appendChild(svg('line', { x1: x0 + px * k, y1: y0, x2: x0 + px * k, y2: y0 + h * k, stroke: RED, 'stroke-width': 2.5, 'stroke-dasharray': '4 4' }));
      txt(s, x0 + b * k / 2, y0 + h * k + 24, 'القاعدة ' + b, { size: 15 }); txt(s, x0 + px * k + 12, y0 + h * k / 2 + 5, String(h), { size: 15, fill: RED, anchor: 'start' });
      out('مساحة المستطيل: `' + b + ' × ' + h + ' = ' + b * h + '` &nbsp;·&nbsp; مساحة المثلّث: `(' + b + ' × ' + h + ') : 2 =` <b>`' + String(b * h / 2).replace('.', ',') + '`</b>');
    }
    slider(host, 'القاعدة', 2, 12, b, function (v) { b = v; sp.max(b); p = Math.min(p, b); draw(); });
    slider(host, 'الارتفاع', 1, 6, h, function (v) { h = v; draw(); });
    sp = slider(host, 'موضع الرأس', 0, b, p, function (v) { p = v; draw(); });
    draw();
  };
})();
