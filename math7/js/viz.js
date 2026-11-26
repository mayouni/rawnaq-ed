/* Rawnaq Ed — figures. Every exercise is shown next to a drawing; this file draws them.
   A figure is asked for with a small description:   { k: 'line', from: 10, to: 15, marks: [{ v: 10.4, label: 'A' }] }
   RE.viz(description) returns an element. The kinds and their fields are listed in docs/VIZ.md.
   Drawings are plain SVG built here, so they work offline, scale to any screen and need no image files. */
(function () {
  'use strict';
  var RE = window.RE, N = RE.N, svgEl = RE.svg, el = RE.el, G = {};
  var C = { ink: '#2B2840', ink2: '#5A5670', blue: '#2F7FE0', orange: '#F58A1F', green: '#5CBF3A', red: '#E8443A', sun: '#FFD21F', sky: '#BFE6FA', paper: '#FFF7E8', paper2: '#FDEFD3',
    violet: '#8A63D2', pink: '#F06AA8', sgreen: '#DDF3D3', ssun: '#FFF1B8', spink: '#FBDDEA', sviolet: '#E6DCF7', white: '#FFFFFF' };
  var PAL = [C.blue, C.orange, C.green, C.violet, C.pink, C.red], SOFT = [C.sky, C.ssun, C.sgreen, C.sviolet, C.spink, C.paper2];
  function col(c, i) { return c ? (C[c] || c) : PAL[(i || 0) % PAL.length]; }
  function soft(c, i) { return c ? (C[c] || c) : SOFT[(i || 0) % SOFT.length]; }
  function cv(w, h) { var s = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', class: 'viz' }); return s; }
  function add(s, tag, a) { var e = svgEl(tag, a); s.appendChild(e); return e; }
  function isAr(x) { return /[\u0621-\u064A]/.test(x); }   /* Arabic letters; the Arabic question mark alone does not turn a label right to left */
  function unk(x) { return /^\s*[?؟☐•]\s*$/.test(String(x)); }
  /* data-role names a part, so that a word or a number of the exercise can light it (cues.js).
     Several names are separated by spaces; a label ends with its most precise one (the part it measures, not the whole family). */
  function R(e, role) { if (e && role) e.setAttribute('data-role', role); return e; }
  function J() { return [].filter.call(arguments, function (x) { return x; }).join(' '); }
  /* text; a^b becomes a raised exponent; Arabic runs right to left */
  function T(s, x, y, str, o) {
    o = o || {}; str = String(str == null ? '' : str);
    var ar = isAr(str), size = o.size || 18, anchor = o.anchor || 'middle';
    var t = add(s, 'text', { x: x, y: y, 'text-anchor': anchor, 'font-size': size, 'font-weight': o.weight || 700, fill: o.fill || C.ink, direction: ar ? 'rtl' : 'ltr', 'font-family': 'inherit' });
    if (o.rot) t.setAttribute('transform', 'rotate(' + o.rot + ' ' + x + ' ' + y + ')');
    if (ar || str.indexOf('^') < 0) { t.textContent = str; return t; }
    var up = false;
    str.split(/\^(\([^)]*\)|[0-9a-zA-Z?]+)/).forEach(function (p, i) {
      if (!p) return;
      var a = {}; if (i % 2) { a['font-size'] = size * 0.66; a.dy = -size * 0.42; up = true; } else if (up) { a.dy = size * 0.42; up = false; }
      var ts = svgEl('tspan', a); ts.textContent = i % 2 ? p.replace(/^\(|\)$/g, '') : p; t.appendChild(ts);
    });
    return t;
  }
  function num(v) { if (typeof v === 'number') return v; var s = String(v).replace(/\s/g, '').replace(',', '.'), m = s.match(/^(-?[\d.]+)\/([\d.]+)$/); return m ? m[1] / m[2] : parseFloat(s); }
  function fmt(v) { return typeof v === 'number' ? RE.fmt(String(Math.round(v * 1000) / 1000).replace('.', ',')) : String(v); }
  function box(s, x, y, w, h, fill, o) { o = o || {}; return add(s, 'rect', { x: x, y: y, width: w, height: h, rx: o.rx == null ? 8 : o.rx, fill: fill || C.white, stroke: o.stroke || C.ink, 'stroke-width': o.sw || 3, 'stroke-dasharray': o.dash || '' }); }
  function cell(s, x, y, w, h, str, o) { o = o || {}; var q = unk(str), role = J(q && 'ask', o.role); R(box(s, x, y, w, h, q ? C.sun : (o.fill || C.white), o), role); if (str !== '' && str != null) R(T(s, x + w / 2, y + h / 2 + (o.size || 18) * 0.36, q ? '؟' : str, { size: o.size || 18, fill: o.ink }), role); }
  function brace(s, x1, x2, y, label, o) { /* a bracket under (or over) a span, with its label */
    o = o || {}; var d = o.up ? -1 : 1, c = col(o.color || 'ink2'), role = J(label != null && unk(label) && 'ask', o.role);
    R(add(s, 'path', { d: 'M' + x1 + ' ' + y + ' v' + 8 * d + ' H' + x2 + ' v' + -8 * d, fill: 'none', stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }), role);
    if (label != null) R(T(s, (x1 + x2) / 2, y + (o.up ? -14 : 28), label, { size: o.size || 16, fill: o.ink || C.ink }), role);
  }
  function arrow(s, x1, y1, x2, y2, c, w) {
    c = col(c || 'ink'); var a = Math.atan2(y2 - y1, x2 - x1), h = 9;
    add(s, 'line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': w || 3, 'stroke-linecap': 'round' });
    add(s, 'path', { d: 'M' + x2 + ' ' + y2 + ' L' + (x2 - h * Math.cos(a - 0.45)) + ' ' + (y2 - h * Math.sin(a - 0.45)) + ' L' + (x2 - h * Math.cos(a + 0.45)) + ' ' + (y2 - h * Math.sin(a + 0.45)) + 'Z', fill: c, stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round' });
  }
  function caption(s, w, y, str) { if (str) T(s, w / 2, y, RE.g(str), { size: 16, fill: C.ink2, weight: 600 }); }
  function niceStep(r) { var raw = r / 10, p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }

  /* ---------- line: a graduated line with points, jumps and a highlighted stretch ---------- */
  G.line = function (o) {
    var s = cv(480, 230), a = num(o.from), b = num(o.to), x0 = 34, x1 = 440, y = 140;
    var X = function (v) { return x0 + (num(v) - a) / (b - a) * (x1 - x0); };
    var step = o.step ? num(o.step) : niceStep(b - a), minor = o.minor || 1, n = Math.round((b - a) / step), i, j;
    if (o.zone) add(s, 'rect', { x: X(o.zone[0]), y: y - 11, width: X(o.zone[1]) - X(o.zone[0]), height: 22, fill: C.sun, rx: 8, opacity: .75, 'data-role': 'zone' });
    add(s, 'line', { x1: x0 - 16, y1: y, x2: x1 + 12, y2: y, stroke: C.ink, 'stroke-width': 3, 'stroke-linecap': 'round', 'data-role': 'axis' });
    add(s, 'path', { d: 'M' + (x1 + 24) + ' ' + y + ' l-12 -7 v14z', fill: C.ink, 'data-role': 'axis' });
    var every = n > 12 ? Math.ceil(n / 10) : 1;
    for (i = 0; i <= n; i++) {
      var v = a + i * step, x = X(v);
      add(s, 'line', { x1: x, y1: y - 11, x2: x, y2: y + 11, stroke: C.ink, 'stroke-width': 3, 'stroke-linecap': 'round', 'data-role': 'grad g' + i });
      if (o.labels !== false && i % every === 0 && !(o.labels === 'ends' && i > 0 && i < n)) R(T(s, x, y + 34, fmt(v), { size: n > 8 ? 14 : 17 }), 'grad g' + i);
      if (i < n) for (j = 1; j < minor; j++) { var xm = X(v + step * j / minor); add(s, 'line', { x1: xm, y1: y - 6, x2: xm, y2: y + 6, stroke: C.ink, 'stroke-width': 2, 'data-role': 'grad' }); }
    }
    (o.hops || []).forEach(function (h, k) {
      var xa = X(h.from), xb = X(h.to), c = col(h.color, k), top = y - 16 - Math.min(46, Math.abs(xb - xa) * 0.45);
      add(s, 'path', { d: 'M' + xa + ' ' + (y - 13) + ' Q' + (xa + xb) / 2 + ' ' + (2 * top - y + 13) + ' ' + xb + ' ' + (y - 13), fill: 'none', stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round', 'data-role': 'hop h' + k });
      add(s, 'path', { d: 'M' + xb + ' ' + (y - 12) + ' l' + (xb > xa ? -9 : 9) + ' -3 l' + (xb > xa ? 5 : -5) + ' -8z', fill: c, 'data-role': 'hop h' + k });
      if (h.label != null) R(T(s, (xa + xb) / 2, top - 6, h.label, { size: 15, fill: c }), J(unk(h.label) && 'ask', 'hop h' + k));
    });
    var last = -99, lvl = 0;
    (o.marks || []).slice().sort(function (p, q) { return num(p.v) - num(q.v); }).forEach(function (m, k) {
      var x = X(m.v), c = col(m.color, k), lab = m.label == null ? fmt(num(m.v)) : m.label;
      lvl = x - last < 46 ? (lvl + 1) % 3 : 0; last = x;
      var ty = y - 30 - lvl * 26;
      var q = unk(lab), w = Math.max(30, String(lab).length * 10 + 14), role = J(q && 'ask', 'point p' + k);
      add(s, 'line', { x1: x, y1: y, x2: x, y2: ty + 6, stroke: c, 'stroke-width': 2.5, 'data-role': role });
      add(s, 'circle', { cx: x, cy: y, r: 7.5, fill: c, stroke: C.ink, 'stroke-width': 2.5, 'data-role': role });
      R(box(s, x - w / 2, ty - 20, w, 26, q ? C.sun : C.white, { sw: 2.5, rx: 8 }), role); R(T(s, x, ty - 1, q ? '؟' : lab, { size: 16 }), role);
    });
    caption(s, 480, 214, o.note);
    return s;
  };

  /* ---------- bars: quantities side by side, each as long as it is big ---------- */
  G.bars = function (o) {
    var it = o.items || [], H = 30 + it.length * 62 + (o.note ? 26 : 0), s = cv(480, H), max = Math.max.apply(null, it.map(function (x) { return num(x.v) || 0; })) || 1;
    it.forEach(function (x, i) {
      var y = 14 + i * 62, w = Math.max(6, (num(x.v) || 0) / max * 340), txt = x.text == null ? fmt(num(x.v)) + (o.unit ? ' ' + o.unit : '') : x.text;
      if (x.label != null) R(T(s, isAr(String(x.label)) ? 466 : 14, y + 14, x.label, { size: 15, anchor: 'start', fill: C.ink2 }), 'b' + i);
      R(box(s, 14, y + 22, w, 28, col(x.color, i), { rx: 7 }), 'b' + i);
      R(T(s, 14 + w + 10, y + 43, unk(txt) ? '؟' : txt, { size: 17, anchor: 'start' }), J(unk(txt) && 'ask', 'b' + i));
    });
    caption(s, 480, H - 8, o.note);
    return s;
  };

  /* ---------- place: numbers written in the place-value table, comma under comma ---------- */
  G.place = function (o) {
    var nums = (o.nums || []).map(function (x) { return String(x).replace(/\s/g, ''); }), parts = nums.map(function (x) { return x.split(','); });
    var L = Math.max.apply(null, parts.map(function (p) { return p[0].length; })), R = Math.max.apply(null, parts.map(function (p) { return (p[1] || '').length; }));
    var cols = L + R, cw = Math.min(54, (R ? 420 : 440) / cols), gap = R ? 20 : 0, W = 480, x0 = (W - cols * cw - gap) / 2, hd = o.head === false ? 0 : 32;
    var H = 20 + hd + nums.length * 54 + (o.note ? 26 : 0), s = cv(W, H), i, r;
    var colX = function (k) { return x0 + k * cw + (k >= L ? gap : 0); };          /* k from 0 (leftmost) */
    var diff = -1, PN = { '0': 'units', '1': 'tens', '2': 'hundreds', '3': 'thousands', '-1': 'tenths', '-2': 'hundredths', '-3': 'thousandths' };
    if (o.cmp !== false && nums.length === 2) for (i = 0; i < cols && diff < 0; i++) { var d0 = digit(0, i), d1 = digit(1, i); if (d0 !== d1) diff = i; }
    function digit(row, k) { var p = parts[row]; if (k < L) { var ix = k - (L - p[0].length); return ix < 0 ? '' : p[0][ix]; } return (p[1] || '')[k - L] || ''; }
    for (i = 0; i < cols; i++) {
      var pw = L - 1 - i, name = pw >= 0 ? RE.fmt(Math.pow(10, pw)) : '0,' + new Array(-pw).join('0') + '1', role = J(pw >= 0 ? 'int' : 'dec', PN[pw], 'k' + i);
      if (hd) T(s, colX(i) + cw / 2, 24, name, { size: cols > 7 ? 10 : 12, fill: C.ink2 }).setAttribute('data-role', role);
      for (r = 0; r < nums.length; r++) cell(s, colX(i) + 2, 12 + hd + r * 54, cw - 4, 44, digit(r, i), { fill: i === diff ? C.ssun : (o.hi != null && o.hi === pw ? C.sky : C.white), size: 24, rx: 9, role: 'digit ' + role + ' x' + r + '_' + i });
    }
    if (R) for (r = 0; r < nums.length; r++) T(s, x0 + L * cw + gap / 2, 12 + hd + r * 54 + 44, ',', { size: 34 }).setAttribute('data-role', 'comma');
    caption(s, W, H - 8, o.note);
    return s;
  };

  /* ---------- array: dots in rows and columns; a split shows distribution ---------- */
  G.array = function (o) {
    var r = o.rows, c = o.cols, ex = o.extra || 0, sp = o.split || 0, d = Math.min(30, 400 / (c + (sp ? 1 : 0) + (ex ? 2 : 0)), 230 / r), R = d * 0.36;
    var W = 480, wAll = c * d + (sp ? d * 0.6 : 0) + (ex ? d * 1.6 : 0), x0 = (W - wAll) / 2 + 12, y0 = 46, H = y0 + r * d + 44, s = cv(W, H), i, j;
    var X = function (j) { return x0 + j * d + d / 2 + (sp && j >= sp ? d * 0.6 : 0); };
    for (i = 0; i < r; i++) for (j = 0; j < c; j++) add(s, 'circle', { cx: X(j), cy: y0 + i * d + d / 2, r: R, fill: sp && j >= sp ? C.orange : C.blue, stroke: C.ink, 'stroke-width': d > 14 ? 2 : 1, 'data-role': J('product', i === 0 && !sp && 'cols', j === 0 && 'rows', sp && 'part', sp && (j >= sp ? 'a2' : 'a1')) });
    for (i = 0; i < ex; i++) add(s, 'circle', { cx: X(c - 1) + d * 1.5, cy: y0 + i * d + d / 2, r: R, fill: C.red, stroke: C.ink, 'stroke-width': d > 14 ? 2 : 1, 'data-role': 'extra' });
    if (o.labels !== false) {
      if (sp) { brace(s, X(0) - R, X(sp - 1) + R, y0 - 8, sp, { up: true, ink: C.blue, role: 'cols part a1' }); brace(s, X(sp) - R, X(c - 1) + R, y0 - 8, c - sp, { up: true, ink: C.orange, role: 'cols part a2' }); }
      else brace(s, X(0) - R, X(c - 1) + R, y0 - 8, o.colLabel == null ? c : o.colLabel, { up: true, role: 'cols' });
      T(s, x0 - 16, y0 + r * d / 2 + 6, o.rowLabel == null ? r : o.rowLabel, { size: 16 }).setAttribute('data-role', J(unk(o.rowLabel == null ? r : o.rowLabel) && 'ask', 'rows'));
    }
    caption(s, W, H - 10, o.note);
    return s;
  };

  /* ---------- area: a rectangle cut into parts, sides labelled (not to scale) ---------- */
  G.area = function (o) {
    var top = [].concat(o.top || ['']), side = [].concat(o.side || ['']), W = 480, x0 = 86, y0 = 50, w = 350, h = Math.min(190, 70 + side.length * 60), s = cv(W, y0 + h + 44);
    var wt = top.map(function (t, i) { var v = o.scale === false ? 1 : num(t); return v > 0 ? v : 1; }), ws = side.map(function (t) { var v = o.scale === false ? 1 : num(t); return v > 0 ? v : 1; });
    var norm = function (a, total) { var sum = a.reduce(function (p, q) { return p + q; }, 0), min = total * 0.2; var out = a.map(function (v) { return Math.max(min, v / sum * total); }), s2 = out.reduce(function (p, q) { return p + q; }, 0); return out.map(function (v) { return v / s2 * total; }); };
    var cw = norm(wt, w), rh = norm(ws, h), x, y = y0, k = 0;
    side.forEach(function (sl, i) {
      x = x0;
      top.forEach(function (tl, j) {
        var txt = (o.cells || [])[k++], id = 'k' + (i * top.length + j);
        R(box(s, x, y, cw[j], rh[i], soft(null, i * top.length + j), { rx: 4 }), 'rect area product part t' + j + ' s' + i + ' ' + id);
        if (txt != null) { var q = unk(txt), role = J(q && 'ask', 'part', id); if (q) add(s, 'circle', { cx: x + cw[j] / 2, cy: y + rh[i] / 2, r: 17, fill: C.sun, stroke: C.ink, 'stroke-width': 2.5, 'data-role': role }); R(T(s, x + cw[j] / 2, y + rh[i] / 2 + 7, q ? '؟' : txt, { size: 18 }), role); }
        if (i === 0 && tl !== '') R(T(s, x + cw[j] / 2, y0 - 14, tl, { size: 18 }), J(unk(tl) && 'ask', 'dim t' + j));
        x += cw[j];
      });
      if (sl !== '') R(T(s, x0 - 14, y + rh[i] / 2 + 6, sl, { size: 18, anchor: 'end' }), J(unk(sl) && 'ask', 'dim s' + i));
      y += rh[i];
    });
    caption(s, W, y0 + h + 30, o.note);
    return s;
  };

  /* ---------- shape: a labelled geometric figure ---------- */
  G.shape = function (o) {
    var s = cv(480, 300), f = soft(o.fill || 'ssun'), st = { stroke: C.ink, 'stroke-width': 3.5, 'stroke-linejoin': 'round', fill: f }, t = o.type || 'rect';
    /* data-role names each part, so that a word of the exercise can light it (cues.js) */
    var P = function (pts) { return add(s, 'polygon', Object.assign({ points: pts.map(function (p) { return p.join(','); }).join(' '), 'data-role': 'shape area perimeter' }, st)); };
    var dash = function (x1, y1, x2, y2, role) { add(s, 'line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: C.red, 'stroke-width': 3, 'stroke-dasharray': '7 6', 'data-role': role || 'height' }); };
    /* an edge drawn again on top of the outline, unseen until it is pointed at */
    var E = function (a, b, role) { add(s, 'line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: 'transparent', 'stroke-width': 7, 'stroke-linecap': 'round', class: 'edge', 'data-role': role }); };
    var sq = function (x, y, dx, dy) { add(s, 'path', { d: 'M' + (x + dx) + ' ' + y + ' v' + dy + ' h' + -dx, fill: 'none', stroke: C.ink, 'stroke-width': 2 }); };
    var L = function (x, y, str, c, role) { if (str != null && str !== '') { var tx = T(s, x, y, str, { size: 18, fill: c }); if (role) tx.setAttribute('data-role', role); } };
    var nm = o.names || [];
    if (t === 'rect' || t === 'square') {
      var w = t === 'square' ? 170 : 280, h = t === 'square' ? 170 : 150, x = (480 - w) / 2, y = 56;
      add(s, 'rect', Object.assign({ x: x, y: y, width: w, height: h, 'data-role': 'shape area perimeter' }, st));
      E([x, y + h], [x + w, y + h], t === 'square' ? 'side' : 'w base'); E([x, y], [x, y + h], t === 'square' ? 'side' : 'h');
      L(240, y + h + 28, t === 'square' ? o.a : o.w, null, t === 'square' ? 'side' : 'w base'); L(x - 12 - String(o.h || o.a || '').length * 4.5, y + h / 2 + 6, t === 'square' ? '' : o.h, null, 'h');
      if (t === 'square') { E([x + w, y], [x + w, y + h], 'side'); E([x, y], [x + w, y], 'side'); L(x + w + 14 + String(o.a || '').length * 4.5, y + h / 2 + 6, o.a, null, 'side'); }
      L(x - 12, y - 6, nm[0]); L(x + w + 12, y - 6, nm[1]); L(x + w + 12, y + h + 22, nm[2]); L(x - 12, y + h + 22, nm[3]);
    } else if (t === 'tri') {
      var ax = o.apex == null ? 0.62 : o.apex, A = [90 + 300 * ax, 50], B = [90, 220], Cc = [390, 220];
      P([A, B, Cc]); dash(A[0], A[1], A[0], 220); sq(A[0], 220 - 12, 12, 12);
      E(B, Cc, 'base'); L(240, 252, o.b, null, 'base'); L(A[0] + 14 + String(o.h || '').length * 4.5, 145, o.h, C.red, 'height');
      L(A[0], 40, nm[0]); L(78, 240, nm[1]); L(402, 240, nm[2]);
    } else if (t === 'rtri') {
      P([[120, 50], [120, 220], [380, 220]]); sq(120, 208, 12, 12);
      E([120, 50], [120, 220], 'side height'); E([120, 220], [380, 220], 'side base'); E([120, 50], [380, 220], 'side');
      L(120 - 14 - String(o.a || '').length * 4.5, 140, o.a, null, 'height'); L(250, 250, o.b, null, 'base'); L(268, 122, o.c);
      L(120, 40, nm[0]); L(106, 240, nm[1]); L(394, 240, nm[2]);
    } else if (t === 'trap') {
      P([[170, 60], [330, 60], [410, 210], [80, 210]]); dash(170, 60, 170, 210); sq(170, 198, 12, 12);
      E([170, 60], [330, 60], 'top'); E([80, 210], [410, 210], 'base');
      L(250, 48, o.b, null, 'top'); L(245, 240, o.B, null, 'base'); L(170 + 14 + String(o.h || '').length * 4.5, 142, o.h, C.red, 'height');
    } else if (t === 'para') {
      P([[150, 70], [420, 70], [340, 210], [70, 210]]); dash(150, 70, 150, 210); sq(150, 198, 12, 12);
      E([70, 210], [340, 210], 'base'); L(205, 240, o.b, null, 'base'); L(150 + 14 + String(o.h || '').length * 4.5, 146, o.h, C.red, 'height');
    } else if (t === 'rhombus') {
      P([[240, 40], [400, 140], [240, 240], [80, 140]]); dash(80, 140, 400, 140, 'diag d1'); dash(240, 40, 240, 240, 'diag d2');
      L(320, 132, o.d1, C.red, 'd1'); L(240 + 14 + String(o.d2 || '').length * 4.5, 100, o.d2, C.red, 'd2');
    } else if (t === 'circle') {
      add(s, 'circle', Object.assign({ cx: 240, cy: 145, r: 100, 'data-role': 'shape area perimeter' }, st)); add(s, 'line', { x1: 240, y1: 145, x2: 340, y2: 145, stroke: C.red, 'stroke-width': 3, 'data-role': 'radius' });
      add(s, 'circle', { cx: 240, cy: 145, r: 5, fill: C.ink }); L(290, 136, o.r, C.red, 'radius'); L(228, 166, nm[0] || 'O');
    } else if (t === 'cube') {
      var n = Math.min(10, Math.max(1, Number(o.n) || 3)), a = 150, dx = 62, dy = 44, x2 = 130, y2 = 96, i;
      P([[x2, y2], [x2 + a, y2], [x2 + a, y2 + a], [x2, y2 + a]]);
      add(s, 'polygon', Object.assign({}, st, { points: [[x2, y2], [x2 + dx, y2 - dy], [x2 + a + dx, y2 - dy], [x2 + a, y2]].map(function (p) { return p.join(','); }).join(' '), fill: C.sky }));
      add(s, 'polygon', Object.assign({}, st, { points: [[x2 + a, y2], [x2 + a + dx, y2 - dy], [x2 + a + dx, y2 + a - dy], [x2 + a, y2 + a]].map(function (p) { return p.join(','); }).join(' '), fill: C.sgreen }));
      for (i = 1; i < n; i++) {
        var k = i / n, ln = function (x1, y1, x3, y3) { add(s, 'line', { x1: x1, y1: y1, x2: x3, y2: y3, stroke: C.ink, 'stroke-width': 1.5 }); };
        ln(x2 + a * k, y2, x2 + a * k, y2 + a); ln(x2, y2 + a * k, x2 + a, y2 + a * k);
        ln(x2 + a * k, y2, x2 + a * k + dx, y2 - dy); ln(x2 + dx * k, y2 - dy * k, x2 + a + dx * k, y2 - dy * k);
        ln(x2 + a + dx * k, y2 - dy * k, x2 + a + dx * k, y2 + a - dy * k); ln(x2 + a, y2 + a * k, x2 + a + dx, y2 + a * k - dy);
      }
      L(x2 + a / 2, y2 + a + 28, o.a == null ? n : o.a);
    }
    if (o.ask) { var aw = String(o.ask).length * 9 + 26, acx = t === 'trap' || t === 'para' ? 292 : 240; box(s, acx - aw / 2, t === 'tri' || t === 'rtri' ? 170 : 126, aw, 34, C.sun, { rx: 12, sw: 2.5 }).setAttribute('data-role', 'ask'); T(s, acx, (t === 'tri' || t === 'rtri' ? 170 : 126) + 23, o.ask, { size: 16 }).setAttribute('data-role', 'ask'); }
    caption(s, 480, 290, o.note);
    return s;
  };

  /* ---------- bar: the bar model. A whole, and the parts that make it. Rows compare quantities. ---------- */
  G.bar = function (o) {
    var rows = o.rows || [{ parts: o.parts || [], whole: o.whole, label: o.label, role: o.wholeRole }], W = 480, x0 = 20, w = 440, rowH = 96, s = cv(W, 16 + rows.length * rowH + (o.note ? 26 : 0));
    var tot = function (r) { return r.parts.reduce(function (a, p) { return a + weight(p); }, 0); };
    function weight(p) { var t = typeof p === 'object' ? p : { t: p }; if (t.w != null) return t.w; if (o.scale) { var v = num(t.t); return v > 0 ? v : 1; } return 1; }
    var max = Math.max.apply(null, rows.map(tot)) || 1;
    rows.forEach(function (r, ri) {
      var y = 16 + ri * rowH + 30, x = x0, k = 0;
      r.parts.forEach(function (p, i) {
        var t = typeof p === 'object' ? p : { t: p }, pw = Math.max(26, weight(p) / (rows.length > 1 || r.len ? max : tot(r)) * (r.len ? w * r.len : w)), dots = /^[…\.]+$/.test(String(t.t));
        cell(s, x, y, pw, 40, dots ? '…' : t.t, { fill: soft(t.c, dots ? 5 : k), dash: dots ? '6 5' : '', size: pw < 46 ? 13 : 17, rx: 6, role: J('part', t.role, 'w' + ri, 'p' + ri + '_' + i) }); if (!dots) k++;
        x += pw;
      });
      if (r.whole != null) brace(s, x0, x, y - 6, r.whole, { up: true, role: J('whole', r.role, 'w' + ri) });
      if (r.label != null) R(T(s, isAr(String(r.label)) ? x0 + w : x0, y + 62, r.label, { size: 15, anchor: 'start', fill: C.ink2 }), 'w' + ri);
      if (r.under != null) brace(s, x0, x, y + 46, r.under, { role: J('whole', r.role, 'w' + ri) });
    });
    caption(s, W, 16 + rows.length * rowH + 16, o.note);
    return s;
  };

  /* ---------- groups: Euclidean division seen. Full rows of b, and what is left ---------- */
  G.groups = function (o) {
    var a = o.a, b = o.b, q = Math.floor(a / b), r = a % b;
    if (a > 150 || b > 25) return G.bar({ whole: a, wholeRole: 'dividend', parts: [{ t: b + ' × ؟', w: 3, role: 'group quotient' }, { t: '?', w: 1, role: 'rest' }], note: o.note || (o.ask === false ? b + ' × ' + q + ' + ' + r : 'كم مرّة ' + b + ' ؟ وكم يبقى؟') });
    var rows = q + (r ? 1 : 0), d = Math.min(28, 400 / b, 220 / Math.max(rows, 1)), W = 480, x0 = (W - b * d) / 2, y0 = 40, s = cv(W, y0 + rows * d + 46), i;
    T(s, W / 2, 24, a + '  ←  ' + b + ' × ؟ + ؟', { size: 17 });
    for (i = 0; i < a; i++) {
      var rr = Math.floor(i / b), cc = i % b, full = rr < q;
      add(s, 'circle', { cx: x0 + cc * d + d / 2, cy: y0 + rr * d + d / 2, r: d * 0.36, fill: full ? C.green : C.red, stroke: C.ink, 'stroke-width': d > 14 ? 2 : 1, 'data-role': full ? J('dividend group', rr === 0 && 'divisor', 'g' + rr) : 'dividend rest' });
    }
    for (i = 0; i < q; i++) add(s, 'rect', { x: x0 - 3, y: y0 + i * d + 1, width: b * d + 6, height: d - 2, rx: d / 2, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, opacity: .5, 'data-role': 'group quotient g' + i });
    caption(s, W, y0 + rows * d + 30, o.note || 'كلّ صفّ أخضر مجموعة كاملة، والأحمر ما بقي');
    return s;
  };

  /* ---------- frac: fractions as coloured parts of unit bars, one row each ---------- */
  G.frac = function (o) {
    var it = o.items || [], units = Math.max.apply(null, it.map(function (f) { return Math.max(1, Math.ceil(f.n / f.d)); })), W = 480, x0 = 78, uw = Math.min(190, (W - x0 - 14) / units), rowH = 64, s = cv(W, 14 + it.length * rowH + (o.note ? 24 : 0));
    it.forEach(function (f, i) {
      var y = 14 + i * rowH, u, k, c = col(f.color, i), nu = o.same ? units : Math.max(1, Math.ceil(f.n / f.d)), pw = (uw - 8) / f.d;
      var lab = f.label == null ? null : String(f.label);
      if (lab != null && !/^\d+\/\d+$/.test(lab)) R(T(s, 38, y + 32, unk(lab) ? '؟' : lab, { size: 18 }), J(unk(lab) && 'ask', 'frac f' + i));
      else { var p = (lab || f.n + '/' + f.d).split('/'); R(T(s, 38, y + 22, p[0], { size: 18 }), 'frac num n' + i); add(s, 'line', { x1: 22, y1: y + 28, x2: 54, y2: y + 28, stroke: C.ink, 'stroke-width': 3, 'data-role': 'frac' }); R(T(s, 38, y + 47, p[1], { size: 18 }), 'frac den d' + i); }
      /* the unit bar is the denominator (its parts), the coloured parts are the numerator */
      for (u = 0; u < nu; u++) for (k = 0; k < f.d; k++) add(s, 'rect', { x: x0 + u * uw + k * pw, y: y + 8, width: pw, height: 38, fill: u * f.d + k < f.n ? c : C.white, stroke: C.ink, 'stroke-width': f.d > 12 ? 1.5 : 2.5, rx: 2, 'data-role': J(u === 0 && 'unit den d' + i, u * f.d + k < f.n && 'num n' + i, 'f' + i) });
    });
    caption(s, W, 14 + it.length * rowH + 14, o.note);
    return s;
  };

  /* ---------- chain: a power opened into its factors, counted by a bracket ---------- */
  G.chain = function (o) {
    var gs = o.groups || [{ a: o.a, n: o.n }], total = gs.reduce(function (t, g) { return t + Math.min(g.n, 7); }, 0), wrap = total > 9 && gs.length > 1;
    var W = 480, bw = wrap ? 40 : Math.min(44, 430 / Math.max(total + gs.length * 0.4, 1)), rowH = 92, s = cv(W, wrap ? 20 + gs.length * rowH : 150 + (o.note ? 20 : 0)), x, y = 30;
    var wOf = function (g) { return Math.min(g.n, 7) * bw; }, all = gs.reduce(function (t, g) { return t + wOf(g) + bw * 0.5; }, -bw * 0.5);
    x = wrap ? 0 : (W - all) / 2;
    gs.forEach(function (g, gi) {
      var n = Math.min(g.n, 7), cut = g.n > 7, w = n * bw, i, c = soft(g.c, gi);
      if (wrap) { x = (W - w) / 2; y = 24 + gi * rowH; }
      for (i = 0; i < n; i++) {
        var dots = cut && i === 4;
        cell(s, x + i * bw + 2, y, bw - 4, bw - 4, dots ? '…' : g.a, { fill: dots ? C.white : c, dash: dots ? '5 4' : '', size: String(g.a).length > 2 ? bw * 0.3 : bw * 0.42, rx: 7, role: 'factor g' + gi });
        if (i < n - 1) T(s, x + (i + 1) * bw, y + bw / 2 + 4, '×', { size: 11, fill: C.ink2 });
      }
      if (g.n === 0) R(T(s, x, y + bw / 2, '1', { size: 20 }), 'power g' + gi);
      brace(s, x + 2, x + Math.max(w, 30) - 2, y + bw + 2, g.label == null ? g.a + '^' + g.n : g.label, { size: 17, role: 'power exp g' + gi });
      if (!wrap && gi < gs.length - 1) T(s, x + w + bw * 0.25, y + bw / 2 + 5, o.op || '×', { size: 18, fill: C.red });
      if (wrap && gi < gs.length - 1) T(s, W / 2 + w / 2 + 22, y + bw / 2 + 5, o.op || '×', { size: 18, fill: C.red });
      x += w + bw * 0.5;
    });
    caption(s, W, wrap ? 20 + gs.length * rowH - 6 : 140, o.note);
    return s;
  };

  /* ---------- ftree: a number split step by step into prime factors ---------- */
  G.ftree = function (o) {
    var f = N.factors(o.n), show = o.reveal == null ? f.length : o.reveal, W = 480, stepY = Math.min(48, 250 / Math.max(f.length, 1)), stepX = Math.min(40, 300 / Math.max(f.length, 1));
    var H = 56 + (f.length - 1) * stepY + 54, s = cv(W, H), x = 150, y = 34, rest = o.n, i;
    var nid = 0, node = function (cx, cy, str, prime, hid, root) { var w = Math.max(40, String(str).length * 11 + 16), role = J(hid ? 'ask' : root ? 'root' : prime ? 'prime factor' : 'node', 'n' + nid++); R(box(s, cx - w / 2, cy - 17, w, 34, hid ? C.sun : prime ? C.sgreen : C.white, { rx: prime ? 17 : 9, sw: 2.5 }), role); R(T(s, cx, cy + 6, hid ? '؟' : str, { size: 17 }), role); };
    node(x, y, RE.fmt(o.n), false, false, true);
    for (i = 0; i < f.length - 1; i++) {
      var nx = x + stepX, ny = y + stepY, px = x - stepX * 0.9, hid = i >= show;
      add(s, 'line', { x1: x, y1: y + 17, x2: px, y2: ny - 17, stroke: C.ink, 'stroke-width': 2.5 }); add(s, 'line', { x1: x, y1: y + 17, x2: nx, y2: ny - 17, stroke: C.ink, 'stroke-width': 2.5 });
      rest = rest / f[i];
      node(px, ny, f[i], true, hid); node(nx, ny, RE.fmt(rest), N.isPrime(rest), hid);
      x = nx; y = ny;
    }
    caption(s, W, H - 10, o.note || 'الدوائر الخضراء أعداد أوّليّة: لا تنقسم أكثر');
    return s;
  };

  /* ---------- rects: every rectangle of unit tiles that holds exactly n tiles ---------- */
  G.rects = function (o) {
    var n = o.n, d = N.divisors(n), pairs = [], i; for (i = 0; i < d.length && d[i] * d[i] <= n; i++) pairs.push([d[i], n / d[i]]);
    var W = 480, u = Math.max(3, Math.min(16, 420 / Math.max.apply(null, pairs.map(function (p) { return p[1]; })))), y = 12, H = pairs.reduce(function (t, p) { return t + p[0] * u + 34; }, 14) + (o.note ? 20 : 0), s = cv(W, H);
    pairs.forEach(function (p, k) {
      var w = p[1] * u, h = p[0] * u, x = (W - w) / 2 - 30, a, b;
      for (a = 0; a < p[0]; a++) for (b = 0; b < p[1]; b++) add(s, 'rect', { x: x + b * u, y: y + a * u, width: u, height: u, fill: soft(null, k), stroke: C.ink, 'stroke-width': u > 8 ? 1.5 : .7, 'data-role': 'pair r' + k });
      add(s, 'rect', { x: x, y: y, width: w, height: h, fill: 'none', stroke: C.ink, 'stroke-width': 3, rx: 2, 'data-role': 'rect pair r' + k });
      R(T(s, x + w + 44, y + h / 2 + 6, o.hide ? '؟ × ؟' : p[0] + ' × ' + p[1], { size: 16 }), J(o.hide && 'ask', 'divisor pair r' + k));
      y += h + 34;
    });
    caption(s, W, H - 8, o.note);
    return s;
  };

  /* ---------- divs: the divisors of n in a row, joined two by two ---------- */
  G.divs = function (o) {
    var d = N.divisors(o.n), W = 480, bw = Math.min(52, 450 / d.length), x0 = (W - d.length * bw) / 2, y = 150, s = cv(W, 210), i;
    T(s, W / 2, 24, RE.fmt(o.n), { size: 22 });
    for (i = 0; i < d.length; i++) {
      var hid = o.hide && i > 0 && i < d.length - 1;
      cell(s, x0 + i * bw + 3, y, bw - 6, 36, hid ? '?' : d[i], { size: bw < 40 ? 13 : 17, rx: 8, role: 'divisor d' + i });
      var j = d.length - 1 - i;
      if (i < j) { var xa = x0 + i * bw + bw / 2, xb = x0 + j * bw + bw / 2, top = y - 12 - (j - i) * Math.min(22, 100 / d.length * 2); add(s, 'path', { d: 'M' + xa + ' ' + (y - 3) + ' C' + xa + ' ' + top + ' ' + xb + ' ' + top + ' ' + xb + ' ' + (y - 3), fill: 'none', stroke: PAL[i % PAL.length], 'stroke-width': 2.5, 'data-role': 'pair d' + i + ' d' + j }); }
      else if (i === j) add(s, 'circle', { cx: x0 + i * bw + bw / 2, cy: y - 10, r: 5, fill: C.red, 'data-role': 'pair d' + i });
    }
    caption(s, W, 204, o.note || 'كلّ قوس يصل قاسمين جذاؤهما ' + RE.fmt(o.n));
    return s;
  };

  /* ---------- venn: two collections and what they share ---------- */
  G.venn = function (o) {
    var A = (o.a || []).map(String), B = (o.b || []).map(String), rest = B.slice(), mid = [], onlyA = [];
    A.forEach(function (x) { var k = rest.indexOf(x); if (k >= 0) { mid.push(x); rest.splice(k, 1); } else onlyA.push(x); });
    var W = 480, s = cv(W, 290), vn = 0, best = null, bestRole = '';
    /* two full lists of divisors: the largest shared one is their gcd. Two lists of multiples: the smallest shared one is their lcm */
    var ints = function (l) { return l.length > 1 && l.every(function (x, i) { return /^\d+$/.test(x) && l.indexOf(x) === i; }); };
    var isDivs = function (l) { var m = Math.max.apply(null, l.map(Number)); return ints(l) && l.indexOf('1') >= 0 && l.every(function (x) { return m % Number(x) === 0; }); };
    var isMults = function (l) { var p = l.map(Number).filter(function (x) { return x > 0; }), m = Math.min.apply(null, p); return ints(l) && p.length > 1 && m > 1 && p.every(function (x) { return x % m === 0; }); };
    var midN = mid.map(Number).filter(function (x) { return x > 0; });
    if (midN.length && isDivs(A) && isDivs(B)) { best = String(Math.max.apply(null, midN)); bestRole = 'gcd'; }
    else if (midN.length && isMults(A) && isMults(B)) { best = String(Math.min.apply(null, midN)); bestRole = 'lcm'; }
    add(s, 'ellipse', { cx: 180, cy: 150, rx: 150, ry: 104, fill: C.sky, stroke: C.ink, 'stroke-width': 3, opacity: .85, 'data-role': 'setA' });
    add(s, 'ellipse', { cx: 300, cy: 150, rx: 150, ry: 104, fill: C.ssun, stroke: C.ink, 'stroke-width': 3, opacity: .7, 'data-role': 'setB' });
    add(s, 'ellipse', { cx: 180, cy: 150, rx: 150, ry: 104, fill: 'none', stroke: C.ink, 'stroke-width': 3, 'data-role': 'setA' });
    R(T(s, 96, 30, o.la || '', { size: 16, fill: C.blue }), 'setA'); R(T(s, 384, 30, o.lb || '', { size: 16, fill: '#b97a00' }), 'setB');
    var put = function (list, cx, cy, w, hid, role) {
      var per = Math.max(1, Math.min(list.length, w > 90 ? 3 : 2)), rows = Math.ceil(list.length / per), dy = Math.min(30, 150 / Math.max(rows, 1)), dx = Math.min(36, w / per);
      list.forEach(function (x, i) {
        var r = Math.floor(i / per), c = i % per, n = Math.min(per, list.length - r * per), px = cx + (c - (n - 1) / 2) * dx, py = cy + (r - (rows - 1) / 2) * dy;
        var rl = J(hid && 'ask', role, !hid && list === mid && x === best && bestRole, 'v' + vn++);
        if (hid) { add(s, 'circle', { cx: px, cy: py - 5, r: 13, fill: C.sun, stroke: C.ink, 'stroke-width': 2, 'data-role': rl }); R(T(s, px, py, '؟', { size: 14 }), rl); } else R(T(s, px, py, x, { size: String(x).length > 2 ? 14 : 17 }), rl);
      });
    };
    put(onlyA, 100, 156, 110, o.hide === 'all', 'setA'); put(mid, 240, 156, 70, !!o.hide, 'common setA setB'); put(rest, 380, 156, 110, o.hide === 'all', 'setB');
    caption(s, W, 280, o.note);
    return s;
  };

  /* ---------- hops: two jumpers on the number line; where both land is a common multiple ---------- */
  G.hops = function (o) {
    var a = o.a, b = o.b, max = o.max || N.lcm(a, b) * 2, W = 480, x0 = 22, x1 = 458, y = 130, s = cv(W, 250), X = function (v) { return x0 + v / max * (x1 - x0); }, i, first = N.lcm(a, b);
    add(s, 'line', { x1: x0, y1: y, x2: x1, y2: y, stroke: C.ink, 'stroke-width': 3, 'stroke-linecap': 'round', 'data-role': 'axis' });
    var st = max > 60 ? 10 : max > 30 ? 5 : 1;
    for (i = 0; i <= max; i++) { var maj = i % st === 0; if (max <= 80 || maj) add(s, 'line', { x1: X(i), y1: y - (maj ? 7 : 3), x2: X(i), y2: y + (maj ? 7 : 3), stroke: C.ink, 'stroke-width': maj ? 2 : 1 }); }
    for (i = a; i <= max; i += a) add(s, 'path', { d: 'M' + X(i - a) + ' ' + (y - 8) + ' Q' + X(i - a / 2) + ' ' + (y - 8 - Math.min(70, a / max * 420)) + ' ' + X(i) + ' ' + (y - 8), fill: 'none', stroke: C.blue, 'stroke-width': 3, 'data-role': 'multA' });
    for (i = b; i <= max; i += b) add(s, 'path', { d: 'M' + X(i - b) + ' ' + (y + 8) + ' Q' + X(i - b / 2) + ' ' + (y + 8 + Math.min(70, b / max * 420)) + ' ' + X(i) + ' ' + (y + 8), fill: 'none', stroke: C.orange, 'stroke-width': 3, 'data-role': 'multB' });
    for (i = 0; i <= max; i++) {
      var ca = i % a === 0, cb = i % b === 0;
      var role = J('common multA multB', i === first && 'lcm', 'c' + i);
      if (ca && cb) { add(s, 'circle', { cx: X(i), cy: y, r: 10, fill: C.sun, stroke: C.ink, 'stroke-width': 2.5, 'data-role': role }); if (!o.hide || i === 0) R(T(s, X(i), y + 5, i, { size: 10 }), role); }
      else if (ca || cb) add(s, 'circle', { cx: X(i), cy: y, r: 4, fill: ca ? C.blue : C.orange, 'data-role': ca ? 'multA' : 'multB' });
    }
    R(T(s, x0 + 6, 26, 'قفزات من ' + a, { size: 15, fill: C.blue, anchor: 'end' }), 'multA'); R(T(s, x0 + 6, 240, 'قفزات من ' + b, { size: 15, fill: '#c46a00', anchor: 'end' }), 'multB');
    T(s, x1, y + 26, max, { size: 13, fill: C.ink2 });
    return s;
  };

  /* ---------- stairs: units of measure as steps; each step is ×10 (or ×100, ×60) ---------- */
  G.stairs = function (o) {
    var u = o.units || ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], f = o.factor || 10, n = u.length, W = 480, sw = Math.min(64, 440 / n), sh = Math.min(30, 170 / n), x0 = (W - n * sw) / 2, y0 = 52, s = cv(W, y0 + n * sh + 86), i;
    var a = u.indexOf(o.from), b = u.indexOf(o.to);
    for (i = 0; i < n; i++) {
      var on = i === a || i === b;
      cell(s, x0 + i * sw + 2, y0 + i * sh, sw - 4, 34, u[i], { fill: i === a ? C.sky : i === b ? C.sun : C.white, size: 16, rx: 8, role: 'step' });
      if (i < n - 1) { var mx = x0 + (i + 1) * sw, my = y0 + i * sh + 17; add(s, 'path', { d: 'M' + (mx - 6) + ' ' + (my - 24) + ' q16 4 12 24', fill: 'none', stroke: C.ink2, 'stroke-width': 1.5 }); T(s, mx + 14, my - 22, '×' + f, { size: 11, fill: C.ink2 }); }
    }
    if (a >= 0 && b >= 0 && a !== b) {
      var steps = Math.abs(a - b), down = b > a, yb = y0 + n * sh + 30;
      arrow(s, x0 + a * sw + sw / 2, yb, x0 + b * sw + sw / 2, yb, down ? 'blue' : 'orange', 4);
      T(s, W / 2, yb + 30, steps + (steps === 1 ? ' درجة' : ' درجات') + ' ' + (down ? 'نزولاً: نضرب' : 'صعوداً: نقسم'), { size: 16, fill: down ? C.blue : '#c46a00' });
    }
    caption(s, W, 24, o.note || (f === 10 ? 'كلّ درجة إلى الأسفل: الوحدة أصغر بـ 10 مرّات' : 'كلّ درجة إلى الأسفل: الوحدة أصغر بـ ' + f + ' مرّة'));
    return s;
  };

  /* ---------- expr: an expression with the order of its operations numbered ---------- */
  G.expr = function (o) {
    var tk = String(o.e).replace(/\*/g, '×').replace(/\//g, ':').replace(/-/g, '−').match(/\d[\d ]*(?:,\d+)?|[+−×:^()=<>]|[?؟☐]|[a-zA-Z]+/g) || [];
    tk = tk.map(function (t) { return t.trim(); });
    var prec = { '+': 1, '−': 1, '×': 2, ':': 2, '^': 3 }, OPN = { '+': 'sum', '−': 'diff', '×': 'product', ':': 'quotient' }, st = [], order = {}, k = 0, i;
    var pop = function () { var t = st.pop(); if (t.t !== '(') order[t.i] = ++k; };
    tk.forEach(function (t, ix) {
      if (prec[t]) { while (st.length && st[st.length - 1].t !== '(' && (prec[st[st.length - 1].t] > prec[t] || (prec[st[st.length - 1].t] === prec[t] && t !== '^'))) pop(); st.push({ t: t, i: ix }); }
      else if (t === '(') st.push({ t: t, i: ix });
      else if (t === ')') { while (st.length && st[st.length - 1].t !== '(') pop(); st.pop(); }
    });
    while (st.length) pop();
    var widths = tk.map(function (t, ix) { var sup = ix > 0 && tk[ix - 1] === '^'; return t === '^' ? 0 : (sup ? 0.62 : 1) * (t.length * 0.62 + (prec[t] ? 0.7 : 0.25)); }), total = widths.reduce(function (a, b) { return a + b; }, 0);
    var W = 480, fs = Math.min(40, 440 / Math.max(total, 1)), x = (W - total * fs) / 2, y = 120, s = cv(W, 190 + (o.note ? 16 : 0));
    tk.forEach(function (t, ix) {
      var sup = ix > 0 && tk[ix - 1] === '^', w = widths[ix] * fs, cx = x + w / 2;
      if (t === '^') return;
      var isOp = !!prec[t], q = unk(t);
      /* an operation is named by its result: the sum is at the +, the power at the base and its exponent */
      var role = isOp ? OPN[t] + ' o' + ix : sup ? 'power exp o' + (ix - 1) : tk[ix + 1] === '^' ? 'power o' + (ix + 1) : '';
      if (q) { R(box(s, cx - fs * 0.4, y - fs * 0.85, fs * 0.8, fs, C.sun, { rx: 8, sw: 2.5 }), J('ask', role)); R(T(s, cx, y - fs * 0.12, '؟', { size: fs * 0.6 }), J('ask', role)); }
      else R(T(s, cx, sup ? y - fs * 0.45 : y, t, { size: sup ? fs * 0.62 : fs, fill: isOp ? C.ink2 : C.ink }), role);
      var ord = isOp ? order[ix] : (sup ? order[ix - 1] : 0);
      if (ord && o.order !== false) {
        var by = sup ? y - fs * 1.25 : y - fs * 1.05, first = ord === 1;
        add(s, 'circle', { cx: cx, cy: by, r: 13, fill: first ? C.sun : C.white, stroke: C.ink, 'stroke-width': 2.5, 'data-role': role }); R(T(s, cx, by + 5, ord, { size: 14 }), role);
      }
      x += w;
    });
    caption(s, W, 172, o.note == null ? (k > 1 && o.order !== false ? 'الأرقام الصغيرة: ترتيب إنجاز العمليّات' : '') : o.note);
    return s;
  };

  /* ---------- digits: a number shown digit by digit, for divisibility ---------- */
  G.digits = function (o) {
    var ds = String(o.n).replace(/\s/g, '').split(''), n = ds.length, W = 480, bw = Math.min(56, 440 / n), x0 = (W - n * bw) / 2, s = cv(W, 190), mode = o.mode || 'none', i, whole = ds.indexOf(',') < 0, PN = ['units', 'tens', 'hundreds', 'thousands'];
    for (i = 0; i < n; i++) {
      var hi = (mode === 'last' && i === n - 1) || (mode === 'last2' && i >= n - 2) || (mode === 'sum');
      cell(s, x0 + i * bw + 3, 36, bw - 6, 56, /[•*.]/.test(ds[i]) ? '?' : ds[i], { fill: hi ? (mode === 'sum' ? C.sky : C.ssun) : C.white, size: Math.min(30, bw * 0.6), rx: 10, role: J('digit', whole && PN[n - 1 - i], hi && mode !== 'sum' && 'last', 'd' + i) });
    }
    if (mode === 'sum') {
      var known = ds.every(function (d) { return /\d/.test(d); }), sum = ds.reduce(function (a, d) { return a + (Number(d) || 0); }, 0);
      R(T(s, W / 2, 132, ds.map(function (d) { return /\d/.test(d) ? d : '؟'; }).join(' + ') + ' = ' + (o.show && known ? sum : '؟'), { size: Math.min(22, 400 / (n * 2.2)) }), J(!(o.show && known) && 'ask', 'sum'));
      caption(s, W, 168, o.note || 'مجموع الأرقام يكشف القسمة على 3 وعلى 9');
    } else if (mode === 'last') { brace(s, x0 + (n - 1) * bw + 3, x0 + n * bw - 3, 98, null, { role: 'last' }); caption(s, W, 140, o.note || 'رقم الآحاد يكفي: للقسمة على 2 وعلى 5، وللزوجيّ والفرديّ'); }
    else if (mode === 'last2') { brace(s, x0 + (n - 2) * bw + 3, x0 + n * bw - 3, 98, null, { role: 'last' }); caption(s, W, 140, o.note || 'الرقمان الأخيران يكفيان: للقسمة على 4 وعلى 25'); }
    else caption(s, W, 140, o.note);
    return s;
  };

  /* ---------- pyramid: a number pyramid, top row first ---------- */
  G.pyramid = function (o) {
    var rows = o.rows || [], W = 480, n = Math.max.apply(null, rows.map(function (r) { return r.length; })), bw = Math.min(84, 440 / n), bh = 44, s = cv(W, 16 + rows.length * bh + (o.note ? 34 : 8));
    rows.forEach(function (r, i) { var x0 = (W - r.length * bw) / 2; r.forEach(function (c, j) { cell(s, x0 + j * bw + 2, 12 + i * bh, bw - 4, bh - 6, c, { fill: soft(null, i), size: 18, role: 'y' + i + '_' + j }); }); });
    caption(s, W, 16 + rows.length * bh + 18, o.note);
    return s;
  };

  /* ---------- grid: a table ---------- */
  G.grid = function (o) {
    var rows = o.cells || [], n = Math.max.apply(null, rows.map(function (r) { return r.length; })), W = 480, bw = Math.min(o.w || 110, 456 / n), bh = Math.min(46, 250 / rows.length), x0 = (W - n * bw) / 2, s = cv(W, 14 + rows.length * bh + (o.note ? 34 : 6));
    rows.forEach(function (r, i) { r.forEach(function (c, j) {
      var head = (o.head && i === 0) || (o.headCol && j === 0), str = String(c == null ? '' : c);
      cell(s, x0 + j * bw + 1.5, 10 + i * bh, bw - 3, bh - 4, c, { fill: head ? C.sky : C.white, size: Math.min(18, bw / Math.max(str.length, 3) * (isAr(str) ? 1.5 : 1.7)), rx: 6, sw: 2.5, role: J(head && 'head', 'y' + i + '_' + j) });
    }); });
    caption(s, W, 14 + rows.length * bh + 20, o.note);
    return s;
  };

  /* ---------- seq: growing patterns ---------- */
  G.seq = function (o) {
    var n = o.n || 4, type = o.type || 'tri', W = 480, cw = (W - 16) / n, s = cv(W, 200), k, i, j, role;
    for (k = 1; k <= n; k++) {
      var cx = 8 + (k - 0.5) * cw, base = 140, u = Math.min(20, (cw - 12) / (type === 'match' ? k + 0.6 : k)); role = 'term t' + k;
      if (type === 'tri') for (i = 0; i < k; i++) for (j = 0; j <= i; j++) add(s, 'circle', { cx: cx + (j - i / 2) * u, cy: base - (k - 1 - i) * u * 0.9, r: u * 0.36, fill: C.blue, stroke: C.ink, 'stroke-width': 1.5, 'data-role': role });
      else if (type === 'sq') for (i = 0; i < k; i++) for (j = 0; j < k; j++) add(s, 'circle', { cx: cx + (j - (k - 1) / 2) * u, cy: base - i * u, r: u * 0.36, fill: Math.max(i, j) === k - 1 ? C.orange : C.blue, stroke: C.ink, 'stroke-width': 1.5, 'data-role': role });
      else if (type === 'odd') for (i = 0; i < k; i++) for (j = 0; j < 2 * (k - i) - 1; j++) add(s, 'rect', { x: cx + (j - (2 * (k - i) - 1) / 2) * u * 0.62, y: base - i * u * 0.62 - u * 0.3, width: u * 0.62, height: u * 0.62, fill: SOFT[i % 5], stroke: C.ink, 'stroke-width': 1.5, 'data-role': role });
      else if (type === 'match') { var x = cx - k * u / 2, h = u * 0.87; for (i = 0; i < k; i++) { var up = i % 2 === 0, xa = x + i * u / 2; add(s, 'polygon', { points: up ? [xa, base, xa + u, base, xa + u / 2, base - h].join(' ') : [xa, base - h, xa + u, base - h, xa + u / 2, base].join(' '), fill: C.ssun, stroke: C.red, 'stroke-width': 3, 'stroke-linejoin': 'round', 'data-role': role }); } }
      R(T(s, cx, 176, (o.labels || [])[k - 1] == null ? k : o.labels[k - 1], { size: 15, fill: C.ink2 }), J(unk((o.labels || [])[k - 1]) && 'ask', role));
    }
    caption(s, W, 196, o.note);
    return s;
  };

  /* ---------- card: the data of a word problem, laid out ---------- */
  G.card = function (o) {
    var rows = o.rows || [], W = 480, top = o.icon ? 92 : 24, s = cv(W, top + rows.length * 50 + (o.note ? 34 : 10));
    if (o.icon) { add(s, 'circle', { cx: W / 2, cy: 46, r: 38, fill: C.ssun, stroke: C.ink, 'stroke-width': 3 }); var t = add(s, 'text', { x: W / 2, y: 62, 'text-anchor': 'middle', 'font-size': 44 }); t.textContent = o.icon; }
    rows.forEach(function (r, i) {
      var y = top + i * 50, q = unk(r[1]), role = J(q && 'ask', 'row r' + i);
      R(box(s, 20, y, 440, 42, q ? C.ssun : C.white, { rx: 12, sw: 2.5 }), role);
      R(T(s, 446, y + 28, r[0], { size: 17, anchor: isAr(String(r[0])) ? 'start' : 'end', weight: 600 }), role);
      if (q) { add(s, 'circle', { cx: 54, cy: y + 21, r: 15, fill: C.sun, stroke: C.ink, 'stroke-width': 2.5, 'data-role': role }); R(T(s, 54, y + 27, '؟', { size: 17 }), role); } else R(T(s, 34, y + 28, r[1], { size: 18, anchor: isAr(String(r[1])) ? 'end' : 'start' }), role);
    });
    caption(s, W, top + rows.length * 50 + 22, o.note);
    return s;
  };

  /* ---------- dline: two lines that move together (distance and time, price and quantity) ---------- */
  G.dline = function (o) {
    var a = o.top, b = o.bot, vals = a.vals.map(num), max = Math.max.apply(null, vals.filter(isFinite)) || 1, W = 480, x0 = 70, x1 = 440, s = cv(W, 200);
    var known = vals.every(isFinite), X = function (i) { return known ? x0 + vals[i] / max * (x1 - x0) : x0 + i / (vals.length - 1) * (x1 - x0); };
    [[a, 62, C.blue, 'rowA'], [b, 132, C.orange, 'rowB']].forEach(function (r) {
      add(s, 'line', { x1: x0, y1: r[1], x2: x1 + 12, y2: r[1], stroke: r[2], 'stroke-width': 4, 'stroke-linecap': 'round', 'data-role': r[3] });
      R(T(s, 36, r[1] + 6, r[0].label || '', { size: 15, fill: r[2] }), r[3]);
      r[0].vals.forEach(function (v, i) {
        var x = X(i), q = unk(v), up = r[1] < 100, role = J(q && 'ask', r[3], 'c' + i);   /* a value brings its column: the two values that go together */
        add(s, 'line', { x1: x, y1: 62, x2: x, y2: 132, stroke: C.ink2, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', 'data-role': 'c' + i });
        add(s, 'circle', { cx: x, cy: r[1], r: 6, fill: C.white, stroke: C.ink, 'stroke-width': 2.5, 'data-role': r[3] + ' c' + i });
        if (q) { add(s, 'circle', { cx: x, cy: up ? r[1] - 26 : r[1] + 28, r: 14, fill: C.sun, stroke: C.ink, 'stroke-width': 2.5, 'data-role': role }); R(T(s, x, (up ? r[1] - 26 : r[1] + 28) + 6, '؟', { size: 16 }), role); }
        else R(T(s, x, up ? r[1] - 16 : r[1] + 30, fmt(v), { size: 16 }), role);
      });
    });
    caption(s, W, 190, o.note);
    return s;
  };

  /* ---------- angle ---------- */
  G.angle = function (o) {
    var deg = o.deg, W = 480, s = cv(W, 250), ox = 150, oy = 200, L = 230, r = deg * Math.PI / 180, x2 = ox + L * Math.cos(r), y2 = oy - L * Math.sin(r);
    if (deg > 90) ox = 240;
    x2 = ox + (deg > 90 ? 180 : L) * Math.cos(r); y2 = oy - (deg > 90 ? 180 : L) * Math.sin(r);
    var ar = 54, lx = ox + ar * Math.cos(r), ly = oy - ar * Math.sin(r);
    if (deg === 90) add(s, 'rect', { x: ox, y: oy - 26, width: 26, height: 26, fill: C.ssun, stroke: C.ink, 'stroke-width': 2.5, 'data-role': 'angle' });
    else add(s, 'path', { d: 'M' + ox + ' ' + oy + ' L' + (ox + ar) + ' ' + oy + ' A' + ar + ' ' + ar + ' 0 ' + (deg > 180 ? 1 : 0) + ' 0 ' + lx + ' ' + ly + 'Z', fill: C.ssun, stroke: C.ink, 'stroke-width': 2.5, 'data-role': 'angle' });
    add(s, 'line', { x1: ox, y1: oy, x2: ox + (deg > 90 ? 180 : L), y2: oy, stroke: C.ink, 'stroke-width': 4, 'stroke-linecap': 'round', 'data-role': 'side' });
    add(s, 'line', { x1: ox, y1: oy, x2: x2, y2: y2, stroke: C.blue, 'stroke-width': 4, 'stroke-linecap': 'round', 'data-role': 'side' });
    var m = r / 2; T(s, ox + 84 * Math.cos(m), oy - 84 * Math.sin(m) + 6, o.label == null ? deg + '°' : o.label, { size: 18 }).setAttribute('data-role', J(unk(o.label) && 'ask', 'angle'));
    caption(s, W, 238, o.note);
    return s;
  };

  /* ---------- triangle: a triangle with its three angles and vertex names ---------- */
  G.triangle = function (o) {
    var W = 480, s = cv(W, 270), pts = o.right != null ? [[110, 60], [110, 210], [390, 210]] : (o.equi ? [[240, 40], [110, 222], [370, 222]] : [[190, 46], [80, 214], [400, 214]]);
    var an = o.angles || [], nm = o.names || ['A', 'B', 'C'], sd = o.sides || [];
    if (o.right != null) { var k = o.right; pts = [pts[(4 - k) % 3], pts[(5 - k) % 3], pts[(3 - k) % 3]]; }   /* the right angle sits at the bottom-left corner */
    add(s, 'polygon', { points: pts.map(function (p) { return p.join(','); }).join(' '), fill: C.ssun, stroke: C.ink, 'stroke-width': 3.5, 'stroke-linejoin': 'round', 'data-role': 'shape area perimeter' });
    var cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    pts.forEach(function (p, i) {
      var dx = p[0] - cx, dy = p[1] - cy, d = Math.sqrt(dx * dx + dy * dy);
      R(T(s, p[0] + dx / d * 20, p[1] + dy / d * 20 + 6, nm[i] || '', { size: 19, fill: C.blue }), 'vertex v' + i);
      if (o.right === i) add(s, 'rect', { x: 110, y: 196, width: 14, height: 14, fill: 'none', stroke: C.ink, 'stroke-width': 2, 'data-role': 'angle a' + i });
      if (an[i] != null) { var q = unk(an[i]), ax = p[0] - dx / d * 44, ay = p[1] - dy / d * 44, role = J(q && 'ask', 'angle a' + i); if (q) add(s, 'circle', { cx: ax, cy: ay, r: 15, fill: C.sun, stroke: C.ink, 'stroke-width': 2.5, 'data-role': role }); R(T(s, ax, ay + 6, q ? '؟' : an[i], { size: 16 }), role); }
      var p2 = pts[(i + 1) % 3];
      /* as in G.shape: each side drawn again on top of the outline, unseen until it is pointed at */
      add(s, 'line', { x1: p[0], y1: p[1], x2: p2[0], y2: p2[1], stroke: 'transparent', 'stroke-width': 7, 'stroke-linecap': 'round', class: 'edge', 'data-role': 'side s' + i });
      if (sd[i] != null) T(s, (p[0] + p2[0]) / 2 + ((p[0] + p2[0]) / 2 - cx) * 0.28, (p[1] + p2[1]) / 2 + ((p[1] + p2[1]) / 2 - cy) * 0.28 + 6, sd[i], { size: 16, fill: C.red }).setAttribute('data-role', J(unk(sd[i]) && 'ask', 'side s' + i));
    });
    caption(s, W, 258, o.note);
    return s;
  };

  /* ---------- note: a formula or a sentence, written large ---------- */
  G.note = function (o) { return el('div', { class: 'viz-note' }, (o.icon ? '<div class="viz-ico">' + o.icon + '</div>' : '') + [].concat(o.html || o.lines || []).map(function (l) { return '<div>' + RE.t(l) + '</div>'; }).join('')); };
  /* ---------- svg: a drawing written by hand ---------- */
  G.svg = function (o) { var d = el('div', { class: 'viz-raw' }, o.svg); return d; };
  /* ---------- w: one of the explorables (widgets.js), live ---------- */
  G.w = function (o) { var d = el('div', { class: 'viz-w' }); RE.widgets[o.name](d, o.opts || {}); return d; };

  RE.vizKinds = G;
  RE.viz = function (spec) {
    var host = el('div', { class: 'vizbox' });
    try { host.appendChild(G[spec.k](spec)); if (spec.k === 'w') host.classList.add('live'); }
    catch (e) { host.appendChild(G.note({ html: '…' })); host.setAttribute('data-err', (spec && spec.k) + ': ' + e.message); if (window.console) console.error('viz', spec, e); }
    return host;
  };
  /* when a question names no figure: draw the order of operations of its first expression, else its data */
  RE.vizAuto = function (q) {
    var m = String(q.text || '').match(/`([^`]*\d[^`]*[+\-−×:][^`]*)`/), e = m && m[1].replace(/=.*$/, '').replace(/\{[^}]*\}/g, '');
    if (e && /\d\s*[+\-−×:^]\s*[\d(]/.test(e) && !/[\[\]]/.test(e)) return { k: 'expr', e: e };
    return { k: 'note', icon: '✏️', html: ['[خذي|خذ] ورقة وقلماً: ارسم[ي] ما تفهم[ين]ه من السؤال.'] };
  };
})();
