/* Rawnaq Ed — Aicha and the lab.
   Aicha is the companion who answers in the lab: with a sentence, with a figure, with her voice, and always with
   the Softanza line that carries the same question. She is rules and a small knowledge base read from the lessons
   themselves (terms, ideas, uses) plus what the learner teaches her. No model, no network: everything is on the device.
   Same build as Aicha in Marbooha (rules first, word-match knowledge, the device's own voice), in Arabic.

   Three parts: RE.stz (a small reader of Softanza number lines), RE.aicha (ask / speak / teach), RE.labPage (the page). */
(function () {
  'use strict';
  var RE = window.RE, N = RE.N, el = RE.el;
  var BIG = 1000000000;
  function L(s) { return '<bdi dir="ltr" class="m">' + s + '</bdi>'; }
  function list(a) { return '[ ' + a.join(', ') + ' ]'; }
  function bool(b) { return b ? 'TRUE' : 'FALSE'; }
  function sumDigits(n) { return String(n).split('').reduce(function (s, d) { return s + Number(d); }, 0); }

  /* ---------------- Softanza lines ----------------
     Q(n).Method(arg) and PrimesUnder(n), with the names and meanings of stzNumber in the Softanza library.
     ar: the question the line asks, in Arabic. viz: a figure of the answer when one helps. */
  var M = {
    Divisors: { n: 0, ar: function (a) { return 'ما قواسم ' + a + '؟'; }, f: function (a) { if (!a) throw 'للصفر قواسم لا تنتهي.'; return list(N.divisors(a)); }, viz: function (a) { return a <= 60 ? { k: 'rects', n: a } : null; } },
    IsPrime: { n: 0, ar: function (a) { return 'هل ' + a + ' عدد أوّليّ؟'; }, f: function (a) { return bool(N.isPrime(a)); }, viz: function (a) { return a > 1 && a <= 2000 ? { k: 'ftree', n: a } : null; } },
    PrimeFactors: { n: 0, ar: function (a) { return 'ما العوامل الأوّليّة للعدد ' + a + '؟'; }, f: function (a) { if (a < 2) throw 'نفكّك الأعداد الأكبر من 1.'; return list(N.factors(a).filter(function (p, i, f) { return f.indexOf(p) === i; })); }, viz: function (a) { return a <= 2000 ? { k: 'ftree', n: a } : null; },
      more: function (a) { return N.isPrime(a) ? '' : 'والتفكيك كاملاً: ' + RE.math('`' + a + ' = ' + N.factorText(a) + '`'); } },
    GCD: { n: 1, sym: true, ar: function (a, b) { return 'ما القاسم المشترك الأكبر للعددين ' + a + ' و ' + b + '؟'; }, f: function (a, b) { if (!a || !b) throw 'عددان مخالفان للصفر من فضلك.'; return N.gcd(a, b); },
      viz: function (a, b) { var da = N.divisors(a), db = N.divisors(b); return da.length <= 12 && db.length <= 12 ? { k: 'venn', a: da.map(String), b: db.map(String), la: 'قواسم ' + a, lb: 'قواسم ' + b, note: 'في الوسط القواسم المشتركة، وأكبرها ' + N.gcd(a, b) } : null; } },
    LCM: { n: 1, sym: true, ar: function (a, b) { return 'ما المضاعف المشترك الأصغر للعددين ' + a + ' و ' + b + '؟'; }, f: function (a, b) { if (!a || !b) throw 'عددان مخالفان للصفر من فضلك.'; return N.lcm(a, b); },
      viz: function (a, b) { var m = N.lcm(a, b); return a > 1 && b > 1 && m <= 60 ? { k: 'hops', a: a, b: b, max: m + 2 } : null; } },
    MultiplesUnder: { n: 1, ar: function (a, b) { return 'ما مضاعفات ' + a + ' حتّى ' + b + '؟'; }, f: function (a, b) { if (!a) throw 'مضاعفات الصفر كلّها صفر.'; if (b / a > 200) throw 'القائمة طويلة جدّاً. اختر[ي] حدّاً أصغر.'; var r = [], k; for (k = a; k <= b; k += a) r.push(k); return list(r); } },
    IsDivisibleBy: { n: 1, ar: function (a, b) { return 'هل ' + a + ' يقبل القسمة على ' + b + '؟'; }, f: function (a, b) { if (!b) throw 'لا نقسم على صفر.'; return bool(a % b === 0); },
      more: function (a, b) { return RE.math('`' + a + ' = ' + b + ' × ' + Math.floor(a / b) + (a % b ? ' + ' + a % b : '') + '`'); } },
    IsMultipleOf: { n: 1, ar: function (a, b) { return 'هل ' + a + ' مضاعف للعدد ' + b + '؟'; }, f: function (a, b) { if (!b) throw 'الصفر ليس له إلّا مضاعف واحد: الصفر.'; return bool(a % b === 0); } },
    IsEven: { n: 0, ar: function (a) { return 'هل ' + a + ' عدد زوجيّ؟'; }, f: function (a) { return bool(a % 2 === 0); } },
    IsOdd: { n: 0, ar: function (a) { return 'هل ' + a + ' عدد فرديّ؟'; }, f: function (a) { return bool(a % 2 === 1); } },
    Power: { n: 1, ar: function (a, b) { return 'كم يساوي ' + a + ' أسّ ' + b + '؟'; }, f: function (a, b) { var v = Math.pow(a, b); if (v > 1e15) throw 'عدد أكبر ممّا أستطيع كتابته بدقّة.'; return v; }, viz: function (a, b) { return a >= 2 && a <= 9 && b >= 2 && b <= 6 ? { k: 'chain', a: a, n: b } : null; } },
    SumOfDigits: { n: 0, ar: function (a) { return 'ما مجموع أرقام ' + a + '؟'; }, f: function (a) { return sumDigits(a); } },
    NumberOfDigits: { n: 0, ar: function (a) { return 'كم رقماً في العدد ' + a + '؟'; }, f: function (a) { return String(a).length; } }
  };
  var ALIAS = { Factors: 'Divisors', MultiplesUpTo: 'MultiplesUnder', MultiplesUntil: 'MultiplesUnder', Multiples: 'MultiplesUnder', IsDividableBy: 'IsDivisibleBy' };
  function int(s) { var v = Number(s); if (!(v >= 0) || v % 1 || v > BIG) throw 'أعداد صحيحة طبيعيّة من فضلك (حتّى مليار).'; return v; }
  function clean(code) { return String(code).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/^\s*\?\s*/, '').replace(/\s+/g, ''); }

  RE.stz = {
    methods: M,
    looksLike: function (s) { return /^\s*\??\s*(Q|StzNumberQ|PrimesUnder)\s*\(/i.test(String(s)); },
    /* -> { code, ar, out, more, viz } or { err } */
    run: function (raw) {
      var code = clean(raw), m;
      try {
        if ((m = /^PrimesUnder\((\d+)\)$/i.exec(code))) {
          var top = int(m[1]); if (top > 2000) throw 'حتّى 2000 من فضلك.';
          return { code: 'PrimesUnder(' + top + ')', ar: 'ما الأعداد الأوّليّة الأصغر من ' + top + '؟', out: list(N.primesTo(top - 1)) };
        }
        m = /^(?:Q|StzNumberQ)\((\d+)\)\.([A-Za-z]+)\((\d*)\)$/i.exec(code);
        if (!m) return { err: 'لم أستطع قراءة هذا السطر. شكله: ' + L('Q(36).Divisors()') + ' : العدد بين قوسين بعد Q، ثمّ نقطة، ثمّ اسم ما نطلبه، ثمّ قوسان.' };
        var name = Object.keys(M).concat(Object.keys(ALIAS)).filter(function (k) { return k.toLowerCase() === m[2].toLowerCase(); })[0];
        if (!name) return { err: 'لا أعرف ' + L('.' + m[2] + '()') + ' . أعرف: ' + L(Object.keys(M).join('  ')) };
        var d = M[ALIAS[name] || name], a = int(m[1]);
        if (d.n && m[3] === '') return { err: L('.' + name + '( )') + ' ينتظر عدداً بين قوسيه.' };
        if (!d.n && m[3] !== '') return { err: L('.' + name + '()') + ' لا يأخذ عدداً بين قوسيه.' };
        var b = d.n ? int(m[3]) : undefined;
        return { code: 'Q(' + a + ').' + name + '(' + (d.n ? b : '') + ')', key: (ALIAS[name] || name) + ':' + (d.sym && b < a ? b + ',' + a : a + ',' + (d.n ? b : '')), ar: d.ar(a, b), out: String(d.f(a, b)), more: d.more ? d.more(a, b) : '', viz: d.viz ? d.viz(a, b) : null };
      } catch (e) { return { err: typeof e === 'string' ? RE.g(e) : 'لم أستطع حساب هذا.' }; }
    }
  };

  /* ---------------- from an Arabic question to a Softanza line ---------------- */
  var ASK = [
    [/أولي(ة|ّة)?\s*(للعدد|ل)?/, /عوامل|فك/, function (n) { return 'Q(' + n[0] + ').PrimeFactors()'; }, 1],
    [/قاسم|ق\.?م\.?أ|قمأ/, /أكبر|اكبر|قمأ|ق\.م/, function (n) { return 'Q(' + n[0] + ').GCD(' + n[1] + ')'; }, 2],
    [/(مضاعف|م\.?م\.?أ|ممأ).*/, /أصغر|ممأ|م\.م/, function (n) { return 'Q(' + n[0] + ').LCM(' + n[1] + ')'; }, 2],
    [/مضاعف\s/, /هل/, function (n) { return 'Q(' + n[0] + ').IsMultipleOf(' + n[1] + ')'; }, 2],
    [/مضاعفات/, null, function (n) { return 'Q(' + n[0] + ').MultiplesUnder(' + (n[1] || n[0] * 12) + ')'; }, 1],
    [/قواسم|قاسمات/, null, function (n) { return 'Q(' + n[0] + ').Divisors()'; }, 1],
    [/فك|عوامل|تفكيك/, null, function (n) { return 'Q(' + n[0] + ').PrimeFactors()'; }, 1],
    [/(ال)?(أعداد|اعداد)\s+(ال)?(أولي|اولي|أوّلي)|أوليات|اوليات/, null, function (n) { return 'PrimesUnder(' + n[0] + ')'; }, 1],
    [/أولي|اولي|أوّلي/, null, function (n) { return 'Q(' + n[0] + ').IsPrime()'; }, 1],
    [/يقبل القسم|تقبل القسم|قابل للقسم|يقسم|قسمة/, null, function (n) { return 'Q(' + n[0] + ').IsDivisibleBy(' + n[1] + ')'; }, 2],
    [/زوجي/, null, function (n) { return 'Q(' + n[0] + ').IsEven()'; }, 1],
    [/فردي/, null, function (n) { return 'Q(' + n[0] + ').IsOdd()'; }, 1],
    [/مجموع أرقام|مجموع ارقام/, null, function (n) { return 'Q(' + n[0] + ').SumOfDigits()'; }, 1],
    [/أس|أسّ|قو[ّ]?ة/, null, function (n) { return 'Q(' + n[0] + ').Power(' + n[1] + ')'; }, 2]
  ];
  function toCode(s) {
    var n = (s.match(/\d+/g) || []).map(Number), i, r;
    for (i = 0; i < ASK.length; i++) { r = ASK[i]; if (r[2] && r[0].test(s) && (!r[1] || r[1].test(s)) && n.length >= r[3]) return r[2](n); }
    return null;
  }

  /* ---------------- what she knows: read from the lessons ---------------- */
  var STOP = 'ما هو هي هل في من على الى إلى عن أن ان هذا هذه ذلك التي الذي كل كلّ معنى يعني اشرحي اشرح لي عَايْشَه يا كيف لماذا متى اين أين عدد العدد عددين اعداد مثال'.split(' ');
  function nrm(s) { return String(s).replace(/<[^>]+>/g, ' ').replace(/[ً-ْٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/قواسم/g, 'قاسم').replace(/عوامل/g, 'عامل'); }
  var STOPN = STOP.map(nrm);
  function fold(s) {
    return nrm(s).replace(/[^؀-ۿa-zA-Z0-9]+/g, ' ').split(' ').map(function (w) { return w.replace(/^(وال|بال|لل|ال|و(?=.{4}))/, ''); })
      .filter(function (w) { return w.length > 2 && STOPN.indexOf(w) < 0; }).map(function (w) { return w.slice(0, 5); });
  }
  var KB = null;
  function kb() {
    if (KB) return KB; KB = [];
    (RE.stations || []).forEach(function (s) { s.beats.forEach(function (b) { if (b.kind !== 'intro') return; b.blocks.forEach(function (k) {
      if (k.t === 'terms') k.items.forEach(function (it) { KB.push({ kind: 'term', title: it.w, text: it.d, viz: it.viz, st: s }); });
      if (k.t === 'idea') KB.push({ kind: 'idea', title: 'الفكرة الكبرى في «' + RE.g(s.title).replace(/`/g, '') + '»', text: k.html, viz: k.viz, st: s, key: RE.g(s.title) });
      if (k.t === 'uses') KB.push({ kind: 'uses', title: 'أين نجد «' + RE.g(s.title).replace(/`/g, '') + '» في الحياة', text: k.items.map(function (u) { return u.icon + ' <b>' + u.title + ':</b> ' + u.html; }).join('<br>'), st: s, key: RE.g(s.title) + ' فائدة نستعمل حياة واقع ينفع نجد' });
    }); }); });
    KB.forEach(function (e) { e.ft = fold(e.key || e.title); e.fx = fold(e.text); });
    return KB;
  }
  function search(q, st) {
    var w = fold(q), best = null, bs = 0;
    if (!w.length) return null;
    var wantUse = /أين|اين|فائد|ينفع|نستعمل|الحياة|الواقع/.test(q), wantIdea = /فكرة|الفكرة/.test(q);
    (RE.state.kb || []).forEach(function (e) { var f = fold(e.q), sc = w.filter(function (x) { return f.indexOf(x) >= 0; }).length * 2; if (sc >= 2 && sc > bs && sc >= f.length) { bs = sc + 1; best = { kind: 'taught', title: e.q, text: e.a, day: e.day }; } });
    kb().forEach(function (e) {
      var sc = 0; w.forEach(function (x) { if (e.ft.indexOf(x) >= 0) sc += 2; else if (e.fx.indexOf(x) >= 0) sc += 1; });
      if (sc && e.kind === 'term') sc += e.ft.length <= w.length + 1 ? 1 : 0;
      if (sc && st && e.st === st) sc += 1;
      if (sc && wantUse) sc += e.kind === 'uses' ? 3 : -1;
      if (sc && wantIdea) sc += e.kind === 'idea' ? 3 : -1;
      if (sc >= 2 && sc > bs) { bs = sc; best = e; }
    });
    return best;
  }

  /* ---------------- her voice ---------------- */
  var native = window.RENative, synth = window.speechSynthesis, arVoice = null;
  function findVoice() { try { arVoice = (synth.getVoices() || []).filter(function (v) { return /^ar/i.test(v.lang); })[0] || null; } catch (e) { arVoice = null; } }
  if (synth) { findVoice(); try { synth.addEventListener('voiceschanged', findVoice); } catch (e) { /* older engines */ } }
  function canSpeak() { try { if (native && native.canSpeak) return !!native.canSpeak(); } catch (e) { return false; } return !!(synth && arVoice); }
  function plain(html) {
    return String(html).replace(/<br>/g, '. ').replace(/<[^>]+>/g, ' ').replace(/[\[\]{}`⁦⁩]/g, ' ').replace(/×/g, ' في ').replace(/\^/g, ' أسّ ').replace(/=/g, ' يساوي ').replace(/;/g, '، ')
      .replace(/\bTRUE\b/g, 'نعم').replace(/\bFALSE\b/g, 'لا').replace(/[A-Za-z_.()]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function speak(html, asked) {
    if ((!asked && RE.state.voice === false) || !canSpeak()) return;
    var s = plain(RE.g(String(html))).slice(0, 400); if (!s) return;
    try {
      if (native && native.speak) { native.speak(s); return; }
      synth.cancel(); var u = new SpeechSynthesisUtterance(s); u.voice = arVoice; u.lang = arVoice.lang; u.rate = 0.92; synth.speak(u);
    } catch (e) { /* silent: the text is on the screen */ }
  }
  function hush() { try { if (native && native.hush) native.hush(); else if (synth) synth.cancel(); } catch (e) { /* nothing to stop */ } }

  /* ---------------- the coach ----------------
     Aicha does not read the screen aloud. She speaks where a guardian sitting beside the learner would:
     a word when a station opens, the hint when one is asked, a nudge on a first miss, a short «well done»,
     the answer and its reason when it is shown, and a word at the end. A new screen always silences her. */
  var opened = {};
  function guiding() { return RE.state.voice !== false && canSpeak(); }
  RE.coach = function (kind, d) {
    if (!guiding()) return;
    var name = RE.state.name ? ' يا ' + RE.state.name : '';
    if (kind === 'screen') {
      hush();
      if (d.n === 0 && !opened[d.station.id]) { opened[d.station.id] = 1; speak('محطّة ' + RE.g(d.station.title).replace(/`/g, '') + '. نبدأ بكلماتها.'); }
    } else if (kind === 'hint') speak(d.text);
    else if (kind === 'wrong') { if (d.special) speak(d.special); else if (d.tries === 1) speak(d.text); else if (d.tries === 2) speak('خذ[ي] تلميحاً، ثمّ جرّب[ي] من جديد.'); }
    else if (kind === 'ok') {
      if (d.shown) speak('الجواب الصحيح هو ' + d.answer + '. ' + (d.explain || ''));
      else if (d.clean) { var c = RE.state.combo || 0; speak(d.msg + (c && c % 5 === 0 ? ' ' + c + ' على التوالي' + name + '!' : '')); }
      else speak(d.msg + ' ' + (d.explain || ''));
    } else if (kind === 'end') speak('أتممت[ِ] المحطّة. أحسنت[ِ]' + name + '!');
  };
  /* the button in the top bar: with her voice, or leading alone with the buttons */
  RE.syncVoice = function () {
    var b = document.getElementById('voiceBtn'); if (!b) return;
    b.hidden = !canSpeak(); b.innerHTML = '<span class="face">' + SPARK + '</span>'; b.classList.toggle('off', RE.state.voice === false); b.setAttribute('aria-pressed', String(RE.state.voice !== false));
    if (!b._wired) { b._wired = true; b.addEventListener('click', function () { RE.state.voice = RE.state.voice === false; RE.save(); hush(); RE.syncVoice(); if (RE.state.voice) speak('أنا معك[ِ].'); else if (RE.toast) RE.toast('عَايْشَه صامتة الآن. الأزرار بين يديك.'); }); }
  };
  window.addEventListener('hashchange', function () { setTimeout(RE.syncVoice, 60); });
  window.addEventListener('load', function () { setTimeout(RE.syncVoice, 400); setTimeout(RE.syncVoice, 2500); setTimeout(RE.syncVoice, 7000); });

  /* ---------------- the line that mirrors an answer ----------------
     When an exercise is solved, the computer's way of asking the same thing is shown under it, as one line.
     It is read off the exercise's own figure, so it never needs writing by hand. Nothing is asked of the learner:
     the line is there to become familiar. Whoever is curious opens it and changes its numbers. */
  function codeFor(q) {
    var v = [].concat(q.viz || [])[0], c = null, m1, m2;
    if (!v || v === 'keep' || !v.k) return null;
    if (v.k === 'ftree' && v.n) c = 'Q(' + v.n + ').PrimeFactors()';
    else if (v.k === 'hops' && v.a > 1 && v.b > 1) c = 'Q(' + v.a + ').LCM(' + v.b + ')';
    else if (v.k === 'venn' && (m1 = /قواسم (\d+)/.exec(v.la || '')) && (m2 = /قواسم (\d+)/.exec(v.lb || ''))) c = 'Q(' + m1[1] + ').GCD(' + m2[1] + ')';
    else if ((v.k === 'rects' || v.k === 'divs') && v.n) c = 'Q(' + v.n + ').Divisors()';
    else if (v.k === 'chain' && v.a && v.n) c = 'Q(' + v.a + ').Power(' + v.n + ')';
    if (!c) return null; var r = RE.stz.run(c); return r.err ? null : r;
  }
  RE.afterAnswer = function (q, fb) {
    var r = codeFor(q); if (!r) return;
    fb.appendChild(el('a', { class: 'codeline mini', href: '#/lab/code/' + encodeURIComponent(r.code), title: 'افتح السطر وغيّر أعداده' }, '<span>الحاسوب يسألها هكذا</span><bdi dir="ltr">' + r.code + '</bdi><bdi dir="ltr" class="res">→ ' + r.out + '</bdi>'));
  };

  /* ---------------- ask ---------------- */
  function codeAnswer(r, how) {
    if (r.err) return { say: r.err, miss: true };
    var yes = r.out === 'TRUE' ? 'نعم.' : r.out === 'FALSE' ? 'لا.' : '';
    return { say: (how ? how + ' ' : '') + '<b>' + r.ar + '</b> ' + (yes || 'الجواب:') + (yes ? '' : ' ' + L(r.out)) + (r.more ? '<br>' + r.more : ''), code: r.code, out: r.out, viz: r.viz, run: r };
  }
  function ask(text, st) {
    var s = String(text || '').trim(), c, hit, old;
    if (!s) return null;
    if (RE.stz.looksLike(s)) return codeAnswer(RE.stz.run(s));
    if (/^(السلام|سلام|مرحبا|أهلا|اهلا|صباح|مساء)/.test(s)) return { say: 'وعليكم السلام' + (RE.state.name ? ' يا ' + RE.state.name : '') + '! أنا عَايْشَه. اسأل[ي]ني عن عدد، أو عن كلمة من الدرس، أو اكتب[ي] لي سطراً بلغة Softanza.' };
    if (/من أنت|من انت|ما اسمك|عرّفي|عرفي بنفسك/.test(s)) return { say: 'أنا <b>عَايْشَه</b>، رفيقتك في المختبر. أحسب بسرعة، وأعرف كلمات دروسك، وأتعلّم ممّا تعلّم[ينني|ني] إيّاه. أمّا التفكير فهو ل[كِ|كَ]: أنا أجيب، وأنت[ِ] [تسألين|تسأل] «لماذا؟».' };
    if (/شكرا|شكراً|أحسنت|احسنت/.test(s)) return { say: 'على الرحب! سؤال آخر؟' };
    if ((c = toCode(s))) return codeAnswer(RE.stz.run(c), '');
    if (/^[\d(\s]/.test(s) && /[+\-−×*:\/^]/.test(s)) { old = RE.labRun('احسب ' + s); if (old && old.out) return { say: L(old.out) }; }
    old = RE.labRun(s); if (old && old.out) return { say: /[؀-ۿ]/.test(old.out) ? old.out : L(old.out), code: old.stz && RE.stz.run(old.stz).code };
    if ((hit = search(s, st))) {
      if (hit.kind === 'taught') return { say: 'أنت[ِ] علّمت[ِ]ني هذا يوم ' + hit.day + ':<br><b>' + hit.title.replace(/</g, '&lt;') + '</b><br>' + hit.text.replace(/</g, '&lt;') };
      return { say: '<b>' + RE.t(hit.title) + '</b><br>' + RE.t(hit.text), viz: hit.viz, from: hit.st };
    }
    return { say: 'هذا لا أعرفه. أعرف الأعداد (القواسم، المضاعفات، الأعداد الأوّليّة) وكلمات دروسك. إن كنت[ِ] [تعرفين|تعرف] الجواب فعلّم[ي]ني إيّاه، وسأحفظه.', miss: true, q: s };
  }
  RE.aicha = { ask: ask, speak: speak, hush: hush, canSpeak: canSpeak, search: search, toCode: toCode,
    teach: function (q, a) { (RE.state.kb = RE.state.kb || []).push({ q: q, a: a, day: RE.today() }); RE.save(); } };

  /* ---------------- translation challenges ----------------
     build: an Arabic question to write as a Softanza line with token tiles. read: a line to read back in Arabic. */
  var MISSIONS = RE.labMissions = [
    { id: 'b1', ar: 'ما قواسم 84؟', code: 'Q(84).Divisors()' },
    { id: 'b2', ar: 'هل 97 عدد أوّليّ؟', code: 'Q(97).IsPrime()' },
    { id: 'r1', read: 'Q(36).Divisors()', opts: ['ما قواسم 36؟', 'ما مضاعفات 36؟', 'هل 36 عدد أوّليّ؟'] },
    { id: 'b3', ar: 'ما العوامل الأوّليّة للعدد 360؟', code: 'Q(360).PrimeFactors()' },
    { id: 'b4', ar: 'ما القاسم المشترك الأكبر للعددين 48 و 180؟', code: 'Q(48).GCD(180)' },
    { id: 'b5', ar: 'ما المضاعف المشترك الأصغر للعددين 4 و 6؟', code: 'Q(4).LCM(6)' },
    { id: 'r2', read: 'Q(12).LCM(18)', opts: ['ما المضاعف المشترك الأصغر للعددين 12 و 18؟', 'ما القاسم المشترك الأكبر للعددين 12 و 18؟', 'هل 12 قاسم للعدد 18؟'] },
    { id: 'b6', ar: 'هل 203 يقبل القسمة على 7؟', code: 'Q(203).IsDivisibleBy(7)' },
    { id: 'b7', ar: 'ما مضاعفات 7 حتّى 50؟', code: 'Q(7).MultiplesUnder(50)' },
    { id: 'b8', ar: 'هل 1001 عدد زوجيّ؟', code: 'Q(1001).IsEven()' },
    { id: 'r3', read: 'Q(51).IsPrime()', opts: ['هل 51 عدد أوّليّ؟', 'ما قواسم 51؟', 'ما العوامل الأوّليّة للعدد 51؟'] },
    { id: 'b9', ar: 'ما الأعداد الأوّليّة الأصغر من 30؟', code: 'PrimesUnder(30)' },
    { id: 'b10', ar: 'كم يساوي 2 أسّ 10؟', code: 'Q(2).Power(10)' },
    { id: 'b11', ar: 'هل 91 مضاعف للعدد 13؟', code: 'Q(91).IsMultipleOf(13)' },
    { id: 'b12', ar: 'ما مجموع أرقام 9875؟', code: 'Q(9875).SumOfDigits()' }
  ];
  function tokens(code) { return code.match(/Q\(|PrimesUnder\(|\.[A-Za-z]+\(\)|\.[A-Za-z]+\(|\d+|\)/g); }
  function tilesFor(m, i) {
    var need = tokens(m.code), all = ['.Divisors()', '.IsPrime()', '.PrimeFactors()', '.GCD(', '.LCM(', '.IsDivisibleBy(', '.IsEven()', '.MultiplesUnder(', '.Power(', '.IsMultipleOf(', '.SumOfDigits()'], out = [], k = i;
    need.forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); });
    while (out.filter(function (x) { return x.charAt(0) === '.'; }).length < 4) { var c = all[(k * 5 + 3) % all.length]; k++; if (out.indexOf(c) < 0) out.push(c); }
    if (out.indexOf('Q(') < 0) out.push('Q('); if (out.indexOf(')') < 0) out.push(')');
    var nums = out.filter(function (x) { return /^\d/.test(x); }); if (nums.length < 2) out.push(String(Number(nums[0]) + (i % 2 ? 1 : 10)));
    /* a fixed order: the same challenge always shows the same keys */
    return out.sort(function (a, b) { var ra = /^Q|^Pr/.test(a) ? 0 : /^\d/.test(a) ? 1 : a === ')' ? 2 : 3, rb = /^Q|^Pr/.test(b) ? 0 : /^\d/.test(b) ? 1 : b === ')' ? 2 : 3; return ra - rb || (a < b ? -1 : 1); });
  }
  RE.labDone = function () { var d = RE.state.labDone || {}; return MISSIONS.filter(function (m) { return d[m.id]; }).length; };

  /* ---------------- the page ---------------- */
  var SPARK = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#FFD21F" stroke="#2B2840" stroke-width="3"/><path d="M24 9l3.8 10.2L38 23l-10.2 3.8L24 37l-3.8-10.2L10 23l10.2-3.8z" fill="#F06AA8" stroke="#2B2840" stroke-width="2.5" stroke-linejoin="round"/></svg>';
  RE.aichaFace = SPARK;

  function bubble(thread, who, html) { var b = el('div', { class: 'msg ' + who }, who === 'her' ? '<span class="face">' + SPARK + '</span>' : ''); var body = el('div', { class: 'body' }, html); b.appendChild(body); thread.appendChild(b); return body; }
  function answerInto(thread, a, opts) {
    var body = bubble(thread, 'her', RE.g(a.say));
    if (a.code) body.appendChild(el('div', { class: 'codeline' }, '<span>بلغة Softanza</span><bdi dir="ltr">' + a.code + '</bdi>' + (a.out ? '<bdi dir="ltr" class="res">→ ' + a.out + '</bdi>' : '')));
    if (a.viz) { var f = el('div', { class: 'msg-fig' }); try { [].concat(a.viz).slice(0, 1).forEach(function (v) { f.appendChild(RE.viz(v)); }); body.appendChild(f); } catch (e) { /* the sentence stands without its figure */ } }
    if (a.from) body.appendChild(el('a', { class: 'from', href: '#/s/' + a.from.id }, 'من محطّة «' + RE.t(a.from.title) + '»'));
    if (a.miss && a.q && opts && opts.teach) {
      var tb = el('button', { class: 'choice', type: 'button' }, RE.g('علّم[ي]ني الجواب'));
      tb.addEventListener('click', function () { opts.teach(a.q, body, tb); }); body.appendChild(tb);
    }
    if (canSpeak()) { var hear = el('button', { class: 'hear', type: 'button', 'aria-label': 'اسمع[ي] الجواب'.replace('[ي]', RE.state.fem ? 'ي' : '') }, '🔊'); hear.addEventListener('click', function () { speak(a.say, true); }); body.appendChild(hear); }
    thread.scrollTop = thread.scrollHeight;
    return body;
  }

  function talk(w, st) {
    var card = el('div', { class: 'card aicha' }), thread = el('div', { class: 'thread', 'aria-live': 'polite' }), chips = el('div', { class: 'cmds' }), line = el('div', { class: 'cmdline' });
    var inp = el('input', { type: 'text', 'data-kb': 'native', style: 'direction:rtl', placeholder: RE.g('اسأل[ي] عَايْشَه، أو اكتب[ي]: Q(36).Divisors()'), 'aria-label': 'سؤالك', autocomplete: 'off' }), go = el('button', { class: 'btn', type: 'button' }, 'اسأل[ي]'.replace('[ي]', RE.state.fem ? 'ي' : ''));
    var slot = null, cur = null, who = el('div', { class: 'lab-who' });
    function teach(q, body, btn) {
      btn.remove(); var ta = el('input', { type: 'text', class: 'ans wide', 'data-kb': 'native', style: 'direction:rtl', 'aria-label': 'الجواب الذي تعلّمه لعَايْشَه' }), ok = el('button', { class: 'btn', type: 'button' }, 'احفظيه');
      var row = el('div', { class: 'cmdline' }); row.appendChild(ta); row.appendChild(ok); body.appendChild(row); ta.focus();
      ok.addEventListener('click', function () { var a = ta.value.trim(); if (!a) return; RE.aicha.teach(q, a); row.remove(); RE.fx('star'); answerInto(thread, { say: 'حفظتُه. شكراً، صرتُ أعرف شيئاً جديداً منك[ِ]! اسأل[ي]ني عنه متى شئت[ِ].' }); });
    }
    function send(s) {
      s = String(s || '').trim(); if (!s) return;
      hush(); if (RE.isTv) thread.innerHTML = ''; bubble(thread, 'me', s.replace(/</g, '&lt;'));
      var a = ask(s, st) || { say: '...' };
      if (!RE.state.labbed) { RE.state.labbed = RE.today(); RE.save(); RE.checkBadges(); }
      RE.fx('page'); answerInto(thread, a, { teach: RE.isTv ? null : teach });
      if (slot) { slot.value = ''; slot.innerHTML = '&nbsp;'; } else inp.value = '';
    }
    if (RE.usePad) { slot = el('button', { type: 'button', class: 'ans slot wide', 'data-spec': 'lab', value: '', 'aria-label': 'الأعداد' }, '&nbsp;'); slot._done = function () { go.click(); }; }
    /* her first words, and what can be asked here */
    var hello = st ? 'أنت[ِ] في محطّة «' + RE.g(st.title) + '». عن أيّ كلمة منها [تسألين|تسأل]؟ أو جرّب[ي] عدداً.' : 'أهلاً' + (RE.state.name ? ' يا ' + RE.state.name : '') + '! اسأل[ي]ني عن عدد أو عن كلمة من دروسك.';
    bubble(thread, 'her', RE.t(hello));
    if (st) kb().filter(function (e) { return e.st === st && e.kind === 'term'; }).slice(0, 6).forEach(function (e) {
      var b = el('button', { class: 'choice', type: 'button' }, 'ما معنى «' + RE.t(e.title).replace(/\s*\([^)]*\)/, '') + '»؟'); b.addEventListener('click', function () { send('ما معنى ' + e.title); }); chips.appendChild(b);
    });
    if (st) { var u = el('button', { class: 'choice', type: 'button' }, 'أين نجده في الحياة؟'); u.addEventListener('click', function () { send('أين نجد ' + RE.g(st.title) + ' في الحياة'); }); chips.appendChild(u); }
    RE.labCommands.forEach(function (c) {
      var b = el('button', { class: 'choice', type: 'button', title: c.help }, slot ? c.names[0] : c.eg);
      b.addEventListener('click', function () {
        if (!slot) { send(c.eg); return; }
        cur = c; [].forEach.call(chips.children, function (x) { x.classList.toggle('sel', x === b); }); who.innerHTML = c.names[0] + ' <span class="muted">(' + c.help + ' · مثال: ' + c.eg + ')</span>'; RE.pad.open(slot);
      });
      chips.appendChild(b);
    });
    go.addEventListener('click', function () { if (slot && cur && slot.value) send(cur.names[0] + ' ' + slot.value.replace(/;/g, ' ')); else send(inp.value); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(inp.value); });
    if (slot) { who.innerHTML = RE.g('[اختاري|اختر] سؤالاً من الأزرار، ثمّ اكتب[ي] أعداده.'); line.appendChild(who); line.appendChild(slot); line.appendChild(go); }
    card.appendChild(thread); card.appendChild(chips); card.appendChild(line);
    /* free text: always there on a keyboard device; on the pad it is a second line, for words the buttons do not have */
    if (slot && RE.isTv) { /* the buttons are the whole keyboard here */ }
    else if (slot) { var l2 = el('div', { class: 'cmdline' }), g2 = el('button', { class: 'btn white', type: 'button' }, 'اسأل[ي] بالكلمات'.replace('[ي]', RE.state.fem ? 'ي' : '')); g2.addEventListener('click', function () { send(inp.value); }); l2.appendChild(inp); l2.appendChild(g2); card.appendChild(l2); }
    else { line.appendChild(inp); line.appendChild(go); }
    w.appendChild(card);
  }

  function translate(w) {
    var done = RE.state.labDone || (RE.state.labDone = {}), at = 0, i;
    for (i = 0; i < MISSIONS.length; i++) if (!done[MISSIONS[i].id]) { at = i; break; }
    var card = el('div', { class: 'card aicha' }); w.appendChild(card);
    function show(k) {
      at = (k + MISSIONS.length) % MISSIONS.length; var m = MISSIONS[at]; card.innerHTML = '';
      var dots = el('div', { class: 'mdots' }); MISSIONS.forEach(function (x, j) { var d = el('button', { type: 'button', class: (done[x.id] ? 'ok ' : '') + (j === at ? 'on' : ''), 'aria-label': 'التحدّي ' + (j + 1), tabindex: RE.isTv ? -1 : 0 }, String(j + 1)); d.addEventListener('click', function () { show(j); }); dots.appendChild(d); });
      card.appendChild(dots);
      var fb = el('div', { class: 'thread small', 'aria-live': 'polite' });
      function win(a) {
        var first = !done[m.id]; done[m.id] = RE.today(); RE.save(); RE.fx('star'); if (first && RE.labDone() === MISSIONS.length && RE.confetti) RE.confetti();
        RE.checkBadges(); fb.innerHTML = ''; answerInto(fb, a);
        var cnt = document.querySelector('.labtabs .m'); if (cnt) cnt.textContent = RE.labDone() + '/' + MISSIONS.length;
        [].forEach.call(dots.children, function (d, j) { d.classList.toggle('ok', !!done[MISSIONS[j].id]); });
        var nx = el('button', { class: 'btn next', type: 'button' }, 'التحدّي التالي ←'); nx.addEventListener('click', function () { show(at + 1); }); fb.appendChild(nx); if (RE.isTv) nx.focus();
      }
      if (m.read) {
        card.appendChild(el('h3', {}, RE.g('اقرأ[ي] السطر: ماذا يسأل؟')));
        card.appendChild(el('div', { class: 'codeline big' }, '<bdi dir="ltr">' + m.read + '</bdi>'));
        var box = el('div', { class: 'choices' });
        m.opts.slice().sort(function (a, b) { return (a.length * 7 + at) % 5 - (b.length * 7 + at) % 5; }).forEach(function (o) {
          var b = el('button', { class: 'choice', type: 'button' }, o);
          b.addEventListener('click', function () {
            if (o === m.opts[0]) { b.classList.add('ok'); win(codeAnswer(RE.stz.run(m.read), 'قراءة صحيحة.')); }
            else { b.classList.add('no'); RE.fx('no'); fb.innerHTML = ''; answerInto(fb, { say: 'ليس هذا. انظر[ي] إلى الكلمة التي بعد النقطة: هي التي تقول ما نطلبه من العدد.' }); }
          });
          box.appendChild(b);
        });
        card.appendChild(box); card.appendChild(fb); return;
      }
      card.appendChild(el('h3', {}, RE.g('اكتب[ي] هذا السؤال بلغة Softanza')));
      card.appendChild(el('p', { class: 'mission' }, m.ar));
      var built = [], lineEl = el('div', { class: 'codeline big build' }), keys = el('div', { class: 'tiles' }), acts = el('div', { class: 'cmdline' });
      function paint() { lineEl.innerHTML = '<bdi dir="ltr">' + (built.join('') || '<i>…</i>') + '</bdi>'; }
      tilesFor(m, at).forEach(function (tk) { var b = el('button', { class: 'tile', type: 'button', dir: 'ltr' }, tk); b.addEventListener('click', function () { if (built.length < 9) { built.push(tk); RE.fx('tap'); paint(); } }); keys.appendChild(b); });
      var del = el('button', { class: 'btn white', type: 'button' }, '⌫ امسح'), run = el('button', { class: 'btn', type: 'button' }, 'نفّذ[ي]'.replace('[ي]', RE.state.fem ? 'ي' : ''));
      del.addEventListener('click', function () { built.pop(); paint(); });
      run.addEventListener('click', function () {
        if (!built.length) return;
        var r = RE.stz.run(built.join('')), want = RE.stz.run(m.code);
        if (r.err) { RE.fx('no'); fb.innerHTML = ''; answerInto(fb, { say: r.err }); return; }
        if (r.code === want.code || (r.key && r.key === want.key)) { win(codeAnswer(r, 'هذا هو السطر.')); return; }
        /* a line that runs but asks something else: she answers it, and names the question it really asks */
        RE.fx('hint'); fb.innerHTML = ''; var a = codeAnswer(r, 'سطرك صحيح الكتابة، لكنّه يسأل سؤالاً آخر:'); a.say += '<br>والمطلوب: <b>' + m.ar + '</b>'; a.viz = null; answerInto(fb, a);
      });
      acts.appendChild(del); acts.appendChild(run); paint();
      card.appendChild(lineEl); card.appendChild(keys); card.appendChild(acts); card.appendChild(fb);
    }
    show(at);
  }

  function codeWindow(w, code) {
    var card = el('div', { class: 'card aicha' }), r0 = RE.stz.run(code);
    if (r0.err) { card.appendChild(el('p', {}, r0.err)); w.appendChild(card); return; }
    var parts = r0.code.split(/(\d+)/), vals = [], lineEl = el('div', { class: 'codeline big edit' }), fb = el('div', { class: 'thread small' });
    function current() { var k = 0; return parts.map(function (p) { return /^\d+$/.test(p) ? vals[k++].value || '0' : p; }).join(''); }
    function run() { fb.innerHTML = ''; answerInto(fb, codeAnswer(RE.stz.run(current()))); }
    card.appendChild(el('h3', {}, RE.g('غيّر[ي] عدداً، وانظر[ي] ماذا يجيب الحاسوب')));
    parts.forEach(function (p) {
      if (!/^\d+$/.test(p)) { lineEl.appendChild(el('bdi', { dir: 'ltr' }, p)); return; }
      var b;
      if (RE.usePad) { b = el('button', { type: 'button', class: 'ans slot num', 'data-spec': 'int', value: p, 'aria-label': 'عدد' }, p); b._done = run; b.addEventListener('click', function () { RE.pad.open(b); }); }
      else { b = el('input', { class: 'ans num', type: 'text', inputmode: 'numeric', value: p, size: 5, 'aria-label': 'عدد' }); b.addEventListener('change', run); b.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); }); }
      vals.push(b); lineEl.appendChild(b);
    });
    var go = el('button', { class: 'btn', type: 'button' }, 'نفّذ[ي]'.replace('[ي]', RE.state.fem ? 'ي' : '')); go.addEventListener('click', run);
    var back = el('button', { class: 'btn white', type: 'button' }, '→ إلى الدرس'); back.addEventListener('click', function () { history.back(); });
    var acts = el('div', { class: 'cmdline' }); acts.appendChild(back); acts.appendChild(go);
    card.appendChild(lineEl); card.appendChild(acts); card.appendChild(fb); w.appendChild(card); run();
  }

  /* #/lab  #/lab/s/<stationId>  #/lab/code/<line>  (#/lab/translate: the building challenges, for the curious) */
  RE.labPage = function (w, mode, arg) {
    var st = mode === 's' ? (RE.stations || []).filter(function (s) { return s.id === arg; })[0] : null, tr = mode === 'translate';
    var code = mode === 'code';
    if (RE.isTv) w.classList.add('tv-own', 'tvlab');
    var head = el('div', { class: 'hello aicha-head' }, '<span class="face big">' + SPARK + '</span><div><h1>' + (code ? 'سطر الحاسوب' : tr ? 'تحدّيات السطور' : 'المختبر مع عَايْشَه') + '</h1><p>' +
      RE.t(code ? 'هذا السطر يسأل الحاسوب السؤال نفسه الذي في تمرينك. لا شيء مطلوب هنا: غيّر[ي] عدداً إن شئت[ِ]، وتوقّع[ي] الجواب قبل أن [تنفّذي|تنفّذ].' : tr ? 'لمن [تحبّ|يحبّ] أن [تجرّب|يجرّب]: سؤال بالعربيّة، [تركّبين|تركّب] سطره قطعة قطعة.' : 'هنا عَايْشَه تحسب وأنت[ِ] [تسألين|تسأل]. انظر[ي] إلى الجواب، ثمّ اسأل[ي]: لماذا؟ وماذا لو غيّرتُ العدد؟') + '</p></div>');
    w.appendChild(head);
    var tabs = el('div', { class: 'steps labtabs' });
    if (st) tabs.appendChild(el('a', { href: '#/s/' + st.id }, RE.state.fem ? '→ عودي إلى الدرس' : '→ عُد إلى الدرس'));
    if (tr || code) tabs.appendChild(el('a', { href: '#/lab' }, '→ المختبر'));
    if (tabs.children.length) w.appendChild(tabs);
    if (code) { codeWindow(w, decodeURIComponent(arg || '')); return; }
    if (tr) translate(w); else talk(w, st);
    if (!tr && !RE.isTv) {
      var ideas = el('div', { class: 'card tint' }, '<h3>أسئلة تستحقّ البحث</h3>');
      ['ما أصغر عدد له بالضبط `10` قواسم؟ جرّب[ي] بالأمر «قواسم».', 'اطلب[ي] «أوليات 100» ثمّ «أوليات 200»: هل الأعداد الأوّليّة تكثر أم تقلّ كلّما كبرت الأعداد؟', '[اختاري|اختر] عددين واحسب[ي] «قمأ» و «ممأ» لهما، ثمّ اضرب[ي] النتيجتين. قارن[ي] مع جذاء العددين. هل هي صدفة؟ جرّب[ي] أزواجاً أخرى.', 'فكّك[ي] `1001` ثمّ `1001 × 1001`. ماذا يحدث للدلائل؟']
        .forEach(function (x) { ideas.appendChild(el('p', {}, '• ' + RE.t(x))); });
      w.appendChild(ideas);
    }
    if (!tr && !RE.isTv) w.appendChild(el('a', { class: 'muted', href: '#/lab/translate', style: 'display:block' }, 'لمن يحبّ: تحدّيات تركيب السطور (' + RE.labDone() + ' / ' + MISSIONS.length + ')'));
    if (!RE.isTv) w.appendChild(el('p', { class: 'muted' }, 'عَايْشَه تعمل على هذا الجهاز وحده: قواعد وحساب ومعرفة مأخوذة من دروسك وممّا تعلّمها إيّاه. السطور مكتوبة كما تُكتب في مكتبة Softanza، اللغة التي تُبنى عليها رونق.'));
  };
})();
