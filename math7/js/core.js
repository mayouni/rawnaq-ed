/* Rawnaq Ed — core: store, text helpers, number helpers, question engine.
   Plain scripts on purpose: the site opens from the file system, with no server and no build step. */
(function () {
  'use strict';
  var RE = window.RE = { stations: [], units: [], widgets: {}, gens: {} };

  /* ---------------- store (stays on this device) ---------------- */
  var KEY = 'rawnaq-ed:v1';
  var blank = function () { return { v: 2, name: '', fem: true, q: {}, beats: {}, pos: {}, made: [], days: {}, badges: {}, snd: true, mus: true, started: Date.now() }; };
  RE.load = function () {
    var old = null;
    try { old = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { old = null; }
    RE.state = Object.assign(blank(), old || {});
    /* version 2 put an introduction in front of every station: the stages already seen move one place */
    if (old && !old.v) { Object.keys(RE.state.beats || {}).forEach(function (k) { RE.state.beats[k] = (RE.state.beats[k] || []).map(function (i) { return i + 1; }); }); RE.state.v = 2; }
  };
  RE.save = function () { try { localStorage.setItem(KEY, JSON.stringify(RE.state)); } catch (e) { /* private mode */ } };
  RE.reset = function () { RE.state = blank(); RE.save(); };
  RE.today = function () { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };

  /* ---------------- text ---------------- */
  /* Arabic addresses a girl and a boy differently. Content writes  اسحب[ي]  or  [أنتِ|أنتَ]
     and the reader's setting picks the form. */
  RE.g = function (s) {
    var fem = RE.state ? RE.state.fem : true;
    s = String(s);
    if (!RE.state || !RE.state.name) s = s.replace(/ يا \{name\}/g, '').replace(/دفتر \{name\}/g, 'دفتري').replace(/ ?\{name\}/g, '');
    /* the hamza changes its seat before the feminine ending: تقرأ + ي = تقرئي ، تشاء + ين = تشائين ، ترى + ين = ترين */
    if (fem) s = s.replace(/أ\[ي\]/g, 'ئي').replace(/ء\[ين\]/g, 'ئين').replace(/ى\[ين\]/g, 'ين');
    return s
      .replace(/(?<!\[)\[([^\[\]|]*)\|([^\[\]|]*)\](?!\])/g, function (_, f, m) { return fem ? f : m; })
      .replace(/\[(ي|ين|ة|ت|ِ)\]/g, function (_, f) { return fem ? f : ''; })
      .replace(/\{name\}/g, RE.state ? RE.state.name : '');   /* no name yet: the caller's sentence is written to read well without one */
  };
  /* Write maths as  `3 × (4 + 5)`  inside content: it becomes a left-to-right span, with ^ as a power. */
  RE.math = function (s) {
    return String(s).replace(/`([^`]+)`/g, function (_, e) {
      /* an Arabic name such as  ق.م.أ (48 ; 180) = 12  stays in the Arabic flow; only its numbers run left to right */
      var m = e.match(/^\s*([؀-ۿ][؀-ۿ.\s]*?)\s*\(([^)]*)\)\s*(=?)\s*(.*)$/);
      if (m) return '<span class="lbl">' + m[1] + ' (<span class="m">' + m[2] + '</span>)</span>' + (m[3] ? ' = ' : '') + (m[4] ? '<span class="expr">' + RE.pow(m[4]) + '</span>' : '');
      return '<span class="expr">' + RE.pow(e) + '</span>';
    });
  };
  /* a blank written next to an expression belongs to it:  `2^5 =` [[32]]  must stay on one left-to-right line */
  RE.joinBlanks = function (s) {
    var p = String(s).split('`'), i, m;
    if (p.length % 2 === 0) return s;
    for (i = 0; i < p.length; i += 2) {
      if (i > 0 && (m = p[i].match(/^(\s*\[\[[^\]]*\]\])+/))) { p[i - 1] += m[0]; p[i] = p[i].slice(m[0].length); if (i < p.length - 1 && !p[i].trim()) p[i] = ''; }
      if (i < p.length - 1 && (m = p[i].match(/(\[\[[^\]]*\]\]\s*)+$/))) { p[i + 1] = m[0] + p[i + 1]; p[i] = p[i].slice(0, p[i].length - m[0].length); }
    }
    return p.join('`').replace(/``/g, ' ');
  };
  RE.pow = function (e) {
    return String(e).replace(/\{([^{}\/]+)\/([^{}\/]+)\}/g, '<span class="frac"><span>$1</span><span>$2</span></span>').replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>').replace(/\^\s*([0-9a-zA-Z]+|\[\[[^\]]*\]\])/g, '<sup>$1</sup>');
  };
  RE.t = function (s) { return RE.math(RE.g(s)); };
  RE.el = function (tag, attrs, html) {
    var e = document.createElement(tag), k;
    for (k in attrs || {}) { if (k === 'class') e.className = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  };
  RE.svg = function (tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag), k;
    for (k in attrs || {}) e.setAttribute(k, attrs[k]);
    return e;
  };
  RE.fmt = function (n) { /* 12 345 as in the textbook */
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  /* ---------------- numbers ---------------- */
  var N = RE.N = {
    divisors: function (n) { var a = [], b = [], i; for (i = 1; i * i <= n; i++) if (n % i === 0) { a.push(i); if (i * i !== n) b.unshift(n / i); } return a.concat(b); },
    isPrime: function (n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; },
    factors: function (n) { var f = [], p = 2; while (n > 1 && p * p <= n) { while (n % p === 0) { f.push(p); n /= p; } p++; } if (n > 1) f.push(n); return f; },
    gcd: function (a, b) { while (b) { var t = a % b; a = b; b = t; } return a; },
    lcm: function (a, b) { return a / N.gcd(a, b) * b; },
    multiples: function (n, k) { var a = []; for (var i = 0; i < k; i++) a.push(n * i); return a; },
    primesTo: function (n) { var a = []; for (var i = 2; i <= n; i++) if (N.isPrime(i)) a.push(i); return a; },
    rnd: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    factorText: function (n) { /* 360 -> 2^3 × 3^2 × 5 */
      var f = N.factors(n), out = [], i = 0;
      while (i < f.length) { var j = i; while (f[j] === f[i]) j++; out.push(j - i > 1 ? f[i] + '^' + (j - i) : '' + f[i]); i = j; }
      return out.join(' × ');
    }
  };

  /* ---------------- answers ---------------- */
  RE.norm = function (s) {
    return String(s == null ? '' : s)
      .replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); })
      .replace(/[\s  ]/g, '').replace(/[×xX·]/g, '*').replace(/[÷:]/g, '/').replace(/[،;؛]/g, ',')
      .replace(/−/g, '-').toLowerCase();
  };
  /* a learner-written expression: digits, + - * / ^ and brackets only; anything else is refused */
  RE.evalExpr = function (raw) {
    var s = RE.norm(raw);
    if (!/^[\d+\-*\/^()]+$/.test(s) || /\d{10,}/.test(s)) return NaN;
    try { var v = Function('"use strict";return (' + s.replace(/\^/g, '**') + ')')(); return typeof v === 'number' && isFinite(v) ? v : NaN; }
    catch (e) { return NaN; }
  };
  /* spec forms:  12   |  set:1,2,3,6  |  any:a|b|c  |  expr:100 (any expression worth 100)  |  ? (the question's own check decides) */
  RE.checkBlank = function (spec, raw) {
    var v = RE.norm(raw);
    if (v === '') return false;
    if (spec === '?') return true;
    if (spec.indexOf('expr:') === 0) return /[+\-*\/^]/.test(v) && RE.evalExpr(v) === Number(spec.slice(5));
    if (spec.indexOf('set:') === 0) {
      var want = RE.norm(spec.slice(4)).split(',').sort().join(','), got = v.replace(/^[{(]|[})]$/g, '').split(',').filter(Boolean);
      var uniq = got.filter(function (x, i) { return got.indexOf(x) === i; }).sort().join(',');
      return uniq === want;
    }
    if (spec.indexOf('any:') === 0) return spec.slice(4).split('|').some(function (a) { return RE.norm(a) === v; });
    var a = RE.norm(spec), dec = /^-?\d+([.,]\d+)?$/;
    if (/^-?\d+$/.test(a) && /^-?\d+$/.test(v)) return Number(a) === Number(v);
    if (dec.test(a) && dec.test(v)) return Math.abs(parseFloat(a.replace(',', '.')) - parseFloat(v.replace(',', '.'))) < 1e-9;
    return a === v;
  };

  /* ---------------- question records ---------------- */
  RE.rec = function (id) { return RE.state.q[id] || (RE.state.q[id] = { tries: 0, hints: 0, ok: false, box: 0, due: 0, shown: false }); };
  var DAY = 86400000, GAPS = [0, 1, 3, 7, 16, 35];   /* spaced review: days until the next look */
  RE.settle = function (id, clean) {
    var r = RE.rec(id), first = !r.ok;
    r.ok = true; r.t = Date.now();
    if (first) r.clean = clean;
    r.box = clean ? Math.min((r.box || 0) + 1, GAPS.length - 1) : 1;
    r.due = Date.now() + GAPS[r.box] * DAY;
    var d = RE.today(); RE.state.days[d] = (RE.state.days[d] || 0) + 1;
    RE.save();
  };
  RE.allQuestions = function () {
    var out = [];
    RE.stations.forEach(function (s) { (s.beats || []).forEach(function (b) { (b.blocks || []).forEach(function (k) { if (k.t === 'q') out.push({ q: k, station: s }); }); }); });
    return out;
  };
  RE.due = function () {
    var now = Date.now();
    return RE.allQuestions().filter(function (x) { var r = RE.state.q[x.q.id]; return r && r.ok && r.due <= now && !x.q.once; });
  };
  RE.stationStats = function (s) {
    var qs = []; (s.beats || []).forEach(function (b) { (b.blocks || []).forEach(function (k) { if (k.t === 'q') qs.push(k); }); });
    var done = 0, clean = 0, hints = 0, tries = 0, hard = [];
    qs.forEach(function (q) {
      var r = RE.state.q[q.id]; if (!r) return;
      tries += r.tries; hints += r.hints;
      if (r.ok) { done++; if (r.clean) clean++; }
      if ((r.ok && !r.clean) || (!r.ok && r.tries > 0)) hard.push(q);
    });
    return { total: qs.length, done: done, clean: clean, hints: hints, tries: tries, hard: hard };
  };

  /* ---------------- question view ----------------
     q = { id, text, blanks-in-text [[spec]], or choices:[..] + answer:index|[indexes], or bins:{names:[], items:[[label, binIndex]]},
           hints:[..], explain, wrong:[{when:fn(values)|'value', say}], skill, src }                                        */
  var OKS = ['أحسنتِ|أحسنتَ', 'صحيح!', 'تمام، هكذا بالضبط.', 'جميل!', 'نعم!'];
  var TRY = ['ليس بعد. انظر[ي] مرّة أخرى، بهدوء.', 'قريب. ما الذي يمكن أن يكون قد انزلق؟', 'الخطأ هنا خطوة في الطريق. جرّب[ي] من جديد.'];
  RE.question = function (q, opts) {
    opts = opts || {};
    var r = RE.rec(q.id), box = RE.el('div', { class: 'qbox' }), inputs = [], selected = [], hintAt = 0, state = { done: false };
    if (opts.label) box.appendChild(RE.el('div', { class: 'qn' }, opts.label));
    var html = RE.t(RE.joinBlanks(q.text || '')).replace(/\[\[([^\]]*)\]\]/g, function (_, spec) {
      if (spec === '<' || spec === '>' || spec === '=') return '<button type="button" class="ans sign" data-spec="' + (spec === '<' ? '&lt;' : spec === '>' ? '&gt;' : '=') + '" value="" aria-label="علامة المقارنة">؟</button>';
      var wide = /^(set:|any:|expr:)/.test(spec) || spec.length > 6;
      /* on a television or a touch screen the box is a button that opens Rawnaq's own number pad: the system keyboard never comes up */
      if (RE.usePad) return '<button type="button" class="ans slot' + (wide ? ' wide' : '') + '" data-spec="' + spec.replace(/"/g, '&quot;') + '" value="" aria-label="الجواب">&nbsp;</button>';
      return '<input class="ans' + (wide ? ' wide' : '') + '" data-spec="' + spec.replace(/"/g, '&quot;') + '" inputmode="' + (/^[\d\-]+$/.test(spec) ? 'numeric' : /^[\d.,\-]+$/.test(spec) ? 'decimal' : 'text') + '" autocomplete="off" aria-label="الجواب">';
    });
    var qt = RE.el('div', { class: 'qt' }, html); box.appendChild(qt);
    inputs = [].slice.call(qt.querySelectorAll('.ans'));
    var setv = function (i, v) { i.value = v; if (i.tagName === 'BUTTON') i.textContent = v === '' ? ' ' : v; };
    inputs.forEach(function (i, k) {
      i.addEventListener('focus', function () { box.dispatchEvent(new CustomEvent('re-blank', { detail: k, bubbles: true })); });
      if (i.classList.contains('slot')) { i._q = { check: function () { check(); }, inputs: inputs }; return; }
      if (i.tagName !== 'BUTTON') return;
      i.addEventListener('click', function () { if (state.done) return; var o = ['<', '=', '>'], k = o.indexOf(i.value); i.value = o[(k + 1) % 3]; i.textContent = i.value; i.classList.remove('ok', 'no'); });
    });
    var multi = Array.isArray(q.answer);

    if (q.choices) {
      var cw = RE.el('div', { class: 'choices' });
      q.choices.forEach(function (c, i) {
        var b = RE.el('button', { class: 'choice', type: 'button' }, RE.t(c));
        b.addEventListener('click', function () {
          if (state.done) return;
          if (multi) { var k = selected.indexOf(i); if (k < 0) selected.push(i); else selected.splice(k, 1); }
          else selected = [i];
          [].forEach.call(cw.children, function (x, j) { x.classList.toggle('sel', selected.indexOf(j) >= 0); x.classList.remove('no'); });
          if (RE.fx) RE.fx('tap');
          if (!multi) check();
        });
        cw.appendChild(b);
      });
      box.appendChild(cw);
    }
    var binState = null;
    if (q.bins) {
      binState = { where: q.bins.items.map(function () { return -1; }), pick: -1 };
      var pool = RE.el('div', { class: 'chips' }), binsEl = RE.el('div', { class: 'bins' }), chipEls = [], binEls = [];
      q.bins.items.forEach(function (it, i) {
        var ar = /[؀-ۿ]/.test(it[0]), c = RE.el('button', { class: 'chip', type: 'button', style: ar ? 'direction:rtl' : '' }, ar ? RE.t(String(it[0])) : RE.pow(String(it[0])));
        c.addEventListener('click', function (ev) {
          ev.stopPropagation(); if (state.done) return;
          if (binState.where[i] >= 0) { binState.where[i] = -1; pool.appendChild(c); c.classList.remove('no', 'ok'); binState.pick = -1; }
          else binState.pick = binState.pick === i ? -1 : i;
          chipEls.forEach(function (x, j) { x.classList.toggle('sel', j === binState.pick); });
        });
        chipEls.push(c); pool.appendChild(c);
      });
      q.bins.names.forEach(function (name, b) {
        var be = RE.el('div', { class: 'bin', tabindex: 0, role: 'button' }, '<h4>' + RE.t(name) + '</h4>'), inner = RE.el('div', { class: 'chips' });
        be.appendChild(inner);
        var drop = function () {
          if (state.done || binState.pick < 0) return;
          binState.where[binState.pick] = b; inner.appendChild(chipEls[binState.pick]);
          chipEls[binState.pick].classList.remove('sel'); binState.pick = -1;
        };
        be.addEventListener('click', drop);
        be.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(); } });
        binEls.push(inner); binsEl.appendChild(be);
      });
      box.appendChild(RE.el('div', { class: 'muted' }, RE.g('المس[ي] بطاقة ثمّ المس[ي] الخانة التي تناسبها.')));
      box.appendChild(pool); box.appendChild(binsEl);
      binState.chips = chipEls;
    }

    var fb = RE.el('div', { class: 'fb', hidden: '' }), actions = RE.el('div', { class: 'qactions' });
    var say = function (cls, msg) { fb.hidden = false; fb.className = 'fb ' + cls; fb.innerHTML = RE.t(msg); };
    var needBtn = inputs.length || multi || q.bins;
    var okBtn = RE.el('button', { class: 'btn small blue', type: 'button' }, 'تحقّق');
    if (needBtn) actions.appendChild(okBtn);
    var hintBtn = RE.el('button', { class: 'linkbtn', type: 'button' }, 'تلميح');
    if (q.hints && q.hints.length) actions.appendChild(hintBtn);
    var showBtn = RE.el('button', { class: 'linkbtn', type: 'button', hidden: '' }, RE.g('أرِني الحلّ'));
    actions.appendChild(showBtn);
    box.appendChild(actions); box.appendChild(fb);

    function values() { return inputs.map(function (i) { return i.value; }); }
    function finish(clean, msg) {
      state.done = true; okBtn.hidden = hintBtn.hidden = showBtn.hidden = true;
      inputs.forEach(function (i) { if (i.tagName === 'BUTTON') i.disabled = true; else i.readOnly = true; });
      var stars = clean ? 3 : r.shown ? 1 : 2;
      say('ok', '<span class="stars" aria-label="' + stars + ' نجوم">' + '★★★'.slice(0, stars) + '<i>' + '★★★'.slice(stars) + '</i></span> ' + msg + (q.explain ? '<br>' + q.explain : ''));
      box.classList.add('done');
      if (!opts.practiceOnly) { RE.settle(q.id, clean); if (RE.fx) RE.fx(r.shown ? 'show' : 'ok', { clean: clean, stars: stars, el: fb }); }
      if (!opts.practiceOnly && RE.coach) RE.coach('ok', { clean: clean, shown: r.shown, msg: msg, explain: q.explain, say: q.say && q.say.explain, answer: q.choices && !multi ? q.choices[q.answer] : inputs.map(function (i) { return i.value; }).join(' ; ') });
      if (RE.afterAnswer) RE.afterAnswer(q, fb);
      if (opts.onDone) opts.onDone(clean);
    }
    function check() {
      if (state.done) return;
      var ok = true, vals = values();
      if (inputs.length) {
        if (vals.some(function (v) { return RE.norm(v) === ''; })) { say('hint', 'ما زالت هناك خانة فارغة.'); return; }
        inputs.forEach(function (i) { var good = RE.checkBlank(i.getAttribute('data-spec'), i.value); i.classList.toggle('ok', good); i.classList.toggle('no', !good); if (!good) ok = false; });
      }
      if (q.choices) {
        if (!selected.length) { say('hint', RE.g('[اختاري|اختر] جواباً أوّلاً.')); return; }
        var want = multi ? q.answer.slice().sort().join() : String(q.answer);
        ok = ok && selected.slice().sort().join() === want;
        [].forEach.call(box.querySelectorAll('.choice'), function (x, j) { if (selected.indexOf(j) >= 0) x.classList.add(ok ? 'ok' : 'no'); });
      }
      if (q.bins) {
        if (binState.where.indexOf(-1) >= 0) { say('hint', RE.g('ضع[ي] كلّ البطاقات في خاناتها أوّلاً.')); return; }
        q.bins.items.forEach(function (it, i) { var good = binState.where[i] === it[1]; binState.chips[i].classList.toggle('ok', good); binState.chips[i].classList.toggle('no', !good); if (!good) ok = false; });
      }
      if (q.check) { ok = !!q.check(vals.map(RE.norm)); inputs.forEach(function (i) { i.classList.toggle('ok', ok); i.classList.toggle('no', !ok); }); }
      r.tries++; RE.save();
      if (ok) { finish(r.tries === 1 && r.hints === 0 && !r.shown, '<b>' + RE.g('[' + N.pick(OKS) + ']').replace(/[\[\]]/g, '') + '</b>'); return; }
      var special = null;
      (q.wrong || []).forEach(function (w) {
        if (special) return;
        var hit = typeof w.when === 'function' ? w.when(vals.map(RE.norm), selected) : (vals.map(RE.norm).indexOf(RE.norm(w.when)) >= 0 || (q.choices && selected.indexOf(w.when) >= 0));
        if (hit) special = w.say;
      });
      var tryMsg = special || N.pick(TRY); say('think', tryMsg);
      if (RE.coach) RE.coach('wrong', { special: special, text: tryMsg, tries: r.tries });
      if (RE.fx && !opts.practiceOnly) RE.fx('no', { el: fb });
      if (r.tries >= 2) showBtn.hidden = false;
      if (opts.onWrong) opts.onWrong(box.querySelector('.ans.no, .choice.no, .chip.no'));
    }
    okBtn.addEventListener('click', check);
    inputs.forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter' && i.tagName === 'INPUT') check(); }); i.addEventListener('input', function () { i.classList.remove('ok', 'no'); }); });
    hintBtn.addEventListener('click', function () {
      if (RE.fx) RE.fx('hint');
      if (hintAt < q.hints.length) { r.hints++; RE.save(); say('hint', '<b>تلميح ' + (hintAt + 1) + ':</b> ' + q.hints[hintAt]); if (RE.coach) RE.coach('hint', { text: q.hints[hintAt], say: q.say && q.say.hints && q.say.hints[hintAt] }); hintAt++; }
      if (hintAt >= q.hints.length) { hintBtn.hidden = true; showBtn.hidden = false; }
    });
    showBtn.addEventListener('click', function () {
      r.shown = true;
      inputs.forEach(function (i, k) { var s = i.getAttribute('data-spec'); setv(i, String(q.show ? q.show[k] : s.replace(/^(set:|any:|expr:)/, '').split('|')[0])); i.classList.remove('no'); });
      if (q.choices) [].forEach.call(box.querySelectorAll('.choice'), function (x, j) { x.classList.remove('no', 'sel'); x.classList.toggle('ok', multi ? q.answer.indexOf(j) >= 0 : j === q.answer); });
      if (q.bins) q.bins.items.forEach(function (it, i) { box.querySelectorAll('.bin .chips')[it[1]].appendChild(binState.chips[i]); binState.chips[i].classList.remove('no', 'sel'); });
      finish(false, RE.g('هذا هو الحلّ. اقرأ[ي]ه بتمهّل، وسيعود هذا السؤال في المراجعة لتجرّب[ي]ه وحدك.'));
    });
    if (r.ok && !opts.fresh) { /* already solved before: show it settled, allow redo */
      var again = RE.el('button', { class: 'linkbtn', type: 'button' }, 'حُلَّ من قبل ✓ — أعيد[ي] المحاولة'.replace('[ي]', RE.state.fem ? 'ي' : ''));
      again.addEventListener('click', function () { box.replaceWith(RE.question(q, Object.assign({}, opts, { fresh: true }))); });
      box.insertBefore(again, actions);
    }
    /* Minwal, «nothing moves»: every sentence this exercise can say under itself is shown once, unseen, so that
       the screen can keep room for the longest one from the start (tv.js) */
    box._rehearse = function (measure) {
      if (state.done) return;
      var keep = [fb.hidden, fb.className, fb.innerHTML, showBtn.hidden], all = [], ex = q.explain ? '<br>' + q.explain : '';
      (q.hints || []).forEach(function (h, i) { all.push('<b>تلميح ' + (i + 1) + ':</b> ' + h); });
      (q.wrong || []).forEach(function (w) { if (typeof w.say === 'string') all.push(w.say); });
      all.push(TRY[1]);
      var end = ['<span class="stars">★★★</span> <b>تمام، هكذا بالضبط.</b>' + ex, '<span class="stars">★★★</span> ' + RE.g('هذا هو الحلّ. اقرأ[ي]ه بتمهّل، وسيعود هذا السؤال في المراجعة لتجرّب[ي]ه وحدك.') + ex];
      showBtn.hidden = false; fb.hidden = false; fb.className = 'fb ok';
      all.forEach(function (m) { fb.innerHTML = RE.t(m); measure(); });
      end.forEach(function (m) { fb.innerHTML = RE.t(m); if (RE.afterAnswer) RE.afterAnswer(q, fb); measure(); });
      fb.hidden = keep[0]; fb.className = keep[1]; fb.innerHTML = keep[2]; showBtn.hidden = keep[3];
    };
    return box;
  };
})();
