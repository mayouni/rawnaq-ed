/* Rawnaq Ed — the lab: a small Arabic command line where the computer does the calculating
   and the learner does the asking. Each command names the Softanza method (short form Q(n).Method()) with the
   same meaning, so what is typed here is a first reading of the library behind Rawnaq. */
(function () {
  'use strict';
  var RE = window.RE, N = RE.N;
  var BIG = 1000000000;
  /* keep a run of maths left to right inside an Arabic sentence */
  function L(s) { return '⁦' + s + '⁩'; }
  function nums(args, k) {
    var a = args.map(function (x) { return Number(RE.norm(x)); });
    if (a.length < k || a.slice(0, k).some(function (x) { return !(x >= 0) || x % 1 || x > BIG; })) throw 'أعداد صحيحة طبيعيّة من فضلك (حتّى مليار).';
    return a;
  }
  var CMDS = RE.labCommands = [
    { names: ['قواسم'], eg: 'قواسم 36', stz: function (a) { return 'Q(' + a[0] + ').Divisors()'; }, help: 'كلّ قواسم عدد',
      run: function (x) { var a = nums(x, 1); if (!a[0]) throw 'كلّ عدد مخالف للصفر قاسم للصفر: القائمة لا تنتهي!'; var d = N.divisors(a[0]); return L('{ ' + d.join(' ; ') + ' }') + '   ← ' + d.length + ' قواسم'; } },
    { names: ['أولي', 'أوّلي', 'اولي'], eg: 'أولي 97', stz: function (a) { return 'Q(' + a[0] + ').IsPrime()'; }, help: 'هل العدد أوّليّ؟',
      run: function (x) { var a = nums(x, 1), n = a[0]; if (N.isPrime(n)) return n + ' عدد أوّليّ.'; if (n < 2) return n + ' ليس أوّليّاً: العدد الأوّليّ أكبر من 1.'; var p = N.factors(n)[0]; return n + ' ليس أوّليّاً: ' + L(n + ' = ' + p + ' × ' + n / p); } },
    { names: ['فكك', 'فكّك', 'تفكيك'], eg: 'فكك 360', stz: function (a) { return 'Q(' + a[0] + ').PrimeFactors()'; }, help: 'تفكيك إلى جذاء عوامل أوّليّة',
      run: function (x) { var a = nums(x, 1); if (a[0] < 2) throw 'نفكّك الأعداد الأكبر من 1.'; return L(a[0] + ' = ' + N.factors(a[0]).join(' × ') + (N.isPrime(a[0]) ? '' : '   =   ' + N.factorText(a[0]))) + (N.isPrime(a[0]) ? '   (أوّليّ)' : ''); } },
    { names: ['قمأ', 'ق.م.أ', 'قما'], eg: 'قمأ 48 180', stz: function (a) { return 'Q(' + a[0] + ').GCD(' + a[1] + ')'; }, help: 'القاسم المشترك الأكبر',
      run: function (x) { var a = nums(x, 2), g = N.gcd(a[0], a[1]); if (!g) throw 'عددان مخالفان للصفر من فضلك.'; return 'ق.م.أ (' + L(a[0] + ' ; ' + a[1]) + ') = ' + g + (g === 1 ? '   ← أوّليّان فيما بينهما' : ''); } },
    { names: ['ممأ', 'م.م.أ', 'مما'], eg: 'ممأ 4 6', stz: function (a) { return 'Q(' + a[0] + ').LCM(' + a[1] + ')'; }, help: 'المضاعف المشترك الأصغر',
      run: function (x) { var a = nums(x, 2); if (!a[0] || !a[1]) throw 'عددان مخالفان للصفر من فضلك.'; return 'م.م.أ (' + L(a[0] + ' ; ' + a[1]) + ') = ' + N.lcm(a[0], a[1]); } },
    { names: ['مضاعفات'], eg: 'مضاعفات 7', stz: function (a) { return 'Q(' + a[0] + ').MultiplesUnder(' + a[0] * 12 + ')'; }, help: 'أوّل مضاعفات عدد',
      run: function (x) { var a = nums(x, 1); return N.multiples(a[0], 12).join(' ; ') + ' ; ...'; } },
    { names: ['قسمة'], eg: 'قسمة 203 15', stz: function (a) { return 'Q(' + a[0] + ').IsDivisibleBy(' + a[1] + ')'; }, help: 'القسمة الإقليديّة: الخارج والباقي',
      run: function (x) { var a = nums(x, 2); if (!a[1]) throw 'لا نقسم على صفر.'; var q = Math.floor(a[0] / a[1]), r = a[0] % a[1]; return L(a[0] + ' = ' + a[1] + ' × ' + q + ' + ' + r) + (r ? '' : '   ← ' + a[1] + ' قاسم لـ ' + a[0]); } },
    { names: ['أوليات', 'أوّليات', 'اوليات'], eg: 'أوليات 50', stz: function (a) { return 'PrimesUnder(' + a[0] + ')'; }, help: 'الأعداد الأوّليّة حتّى عدد',
      run: function (x) { var a = nums(x, 1); if (a[0] > 2000) throw 'حتّى 2000 من فضلك.'; var p = N.primesTo(a[0]); return L(p.join(' ; ')) + '   ← ' + p.length + ' عدداً'; } },
    { names: ['احسب', 'أحسب'], eg: 'احسب 5 + 5 × 2^3', help: 'حساب عبارة مع احترام الأولويّات',
      run: function (x) { var v = RE.evalExpr(x.join('')); if (isNaN(v)) throw 'لم أفهم العبارة. استعمل[ي] الأعداد و + − × : ^ والأقواس.'; return x.join(' ').replace(/\*/g, '×') + ' = ' + (v % 1 ? Math.round(v * 1000) / 1000 : RE.fmt(v)); } }
  ];
  RE.labRun = function (line) {
    var s = String(line).replace(/[؟?]/g, ' ').trim().replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); });
    if (!s) return null;
    var parts = s.split(/[\s،,;]+/), name = parts[0], args = parts.slice(1);
    var c = CMDS.filter(function (k) { return k.names.indexOf(name) >= 0; })[0];
    if (!c && /^[\d(]/.test(s)) { c = CMDS[CMDS.length - 1]; args = [s]; }
    if (!c) return { err: 'لا أعرف الأمر «' + name + '». جرّب[ي] أحد الأزرار أعلاه.' };
    try { return { out: c.run(args), stz: c.stz ? c.stz(args.map(RE.norm)) : null }; }
    catch (e) { return { err: typeof e === 'string' ? e : 'لم أفهم. مثال: ' + c.eg }; }
  };
})();
