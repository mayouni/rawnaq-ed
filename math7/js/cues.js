/* Rawnaq Ed — cues: the words and the numbers of an exercise point at the drawing.
   Reading a problem is three acts: finding what is given, finding what is asked, and seeing both on the figure.
   Here each of them can be done with a finger or with the remote:
     - a word that names a part of the figure (شبه منحرف، قاعدة، ارتفاع، مساحة…) is a key: choosing it lights that part;
     - a number of the statement that is written on the figure is a key: choosing it lights its label and what it measures;
     - a bracket of the solution, (4 + 8), lights the things it adds;
     - «المعطيات» walks through everything given, one after the other; «المطلوب» shows what is asked.
   Nothing is written by hand for this: the words come from a small lexicon, the numbers from the figure's own labels.
   A key appears only when the figure has something to show for it, so no key is ever dead.
   Figures say what their parts are with data-role: every kind of figure in viz.js names what it draws
   (the numerator of a fraction, the common divisors, the remainder of a division, a column of the place-value table…).
   A part may carry several names; a label ends with the most precise one, and that is the part a number lights. */
(function () {
  'use strict';
  var RE = window.RE, el = RE.el;

  /* word -> role of a part of the figure. Longer phrases first. */
  var LEX = [
    [/قاعدت(ي|ا)(ه|ها)?|القاعدت(ين|ان)/, 'base top'],
    [/(ال)?قاعدة الكبرى|قاعدته الكبرى/, 'base'], [/(ال)?قاعدة الصغرى|قاعدته الصغرى/, 'top'],
    [/شبه منحرف|متوازي أضلاع|متوازي الأضلاع|(ال)?مثلّث|(ال)?مثلث|(ال)?مستطيل|(ال)?مربّع|(ال)?معيّن|(ال)?دائرة|(ال)?قرص|(ال)?مكعّب/, 'shape'],
    [/(ال)?ارتفاع(ه|ها)?/, 'height'], [/(ال)?قاعد(ة|ته|تها)/, 'base'],
    [/(ال)?مساح(ة|ته|تها)/, 'area'], [/(ال)?محيط(ه|ها)?/, 'perimeter'],
    [/(ال)?طول(ه|ها)?/, 'w'], [/(ال)?عرض(ه|ها)?/, 'h'],
    [/قطر(ا|ي)(ه|ها)|(ال)?قطر(ه|ها)?/, 'diag'], [/(ال)?شعاع(ه|ها)?/, 'radius'], [/(ال)?ضلع(ه|ها|ين|ان|اً|ًا)?|(ال)?أضلاع(ه|ها)?/, 'side'],
    [/(ال)?زاوي(ة|تين|تان)|(ال)?زوايا(ه|ها)?/, 'angle'], [/(ال)?رأس(ه|ها)?|(ال)?رؤوس(ه|ها)?/, 'vertex'], [/(ال)?مستطيل(ات)?/, 'rect'],
    /* divisors and multiples */
    [/(ال)?قاسم(ه|ها|هما)? (ال)?مشترك (ال)?أكبر|ق\.م\.أ/, 'gcd'], [/(ال)?مضاعف(ه|ها|هما)? (ال)?مشترك (ال)?أصغر|م\.م\.أ/, 'lcm'],
    [/(ال)?(قواسم|مضاعفات)(ه|ها|هما)? (ال)?مشتركة|(ال)?(قاسم|مضاعف)(اً|ًا)? (ال)?مشترك(اً|ًا)?|(ال)?مشترك(ة|اً|ًا)?/, 'common'],
    [/(ال)?مقسوم عليه/, 'divisor'], [/(ال)?قواسم(ه|ها|هما)?|(ال)?قاسم(ه|ها|ين|ان|اً|ًا)?/, 'divisor setA setB'],
    [/(ال)?مضاعفات(ه|ها|هما)?|(ال)?مضاعف(ه|ها|ين|ان|اً|ًا)?/, 'multA multB setA setB'], [/(ال)?قفز(ة|ات)/, 'hop multA multB'],
    /* powers and prime factors */
    [/(ال)?عوامل(ه|ها)? (ال)?أوّ?ليّ?ة|(ال)?عامل(اً|ًا)? (ال)?أوّ?ليّ?(اً|ًا)?|(ال)?أوّ?ليّ?(ة|ان|ين|اً|ًا)?/, 'prime'],
    [/(ال)?عوامل(ه|ها)?|(ال)?عامل(ين|ان|اً|ًا)?/, 'factor setA setB'],
    [/(ال)?دليل(ه|ها)?|(ال)?أسّ?(ه|ها)?/, 'exp'], [/(ال)?قوّ?(ة|ى)|قوّ?ت(ه|ها)/, 'power'],
    /* the four operations and Euclidean division */
    [/(ال)?مقسوم/, 'dividend'], [/(ال)?خارج(ه|ها)?/, 'quotient'], [/(ال)?باقي(ه|ها)?/, 'rest extra'],
    [/(ال)?ج[دذ]ا(ء|ؤ|ئ)(ه|ها|هما)?/, 'product'], [/(ال)?مجموع(ة|ات)/, 'group setA setB'], [/مجموع (ال)?أرقام(ه|ها)?|(ال)?مجموع(ه|ها|هما)?/, 'sum whole'], [/(ال)?فرق(ه|ها|هما)?/, 'diff'],
    [/(ال)?صفوف|(ال)?صفّ?(اً|ًا|ين|ان)?/, 'rows'], [/(ال)?أعمدة|(ال)?عمود(اً|ًا|ين|ان)?/, 'cols'],
    /* fractions, parts and the whole */
    [/(ال)?بسط(ه|ها)?/, 'num'], [/(ال)?مقام(ه|ها)?/, 'den'], [/(ال)?كسور|(ال)?كسر(ين|ان|اً|ًا)?/, 'frac'], [/(ال)?وحدة|(ال)?واحد(ة)?/, 'unit'],
    [/(ال)?جزء (ال)?صحيح/, 'int'], [/(ال)?جزء (ال)?عشريّ?/, 'dec'],
    [/(ال)?أجزاء من (ال)?(مائة|مئة)|جزء من (ال)?(مائة|مئة)/, 'hundredths'], [/(ال)?أجزاء من (ال)?ألف|جزء من (ال)?ألف/, 'thousandths'], [/(ال)?أعشار(اً|ًا)?/, 'tenths'],
    [/(ال)?أجزاء(ه|ها)?|(ال)?جزء(اً|ًا|ين|ان)?/, 'part'], [/الكلّ?/, 'whole'],
    /* digits and their places */
    [/رقم (ال)?آحاد(ه|ها)?|(ال)?آحاد(ه|ها)?/, 'units'], [/رقم (ال)?عشرات(ه|ها)?|(ال)?عشرات(ه|ها)?/, 'tens'], [/رقم (ال)?مئات(ه|ها)?|(ال)?مئات(ه|ها)?/, 'hundreds'], [/(ال)?آلاف|(ال)?ألوف/, 'thousands'],
    [/(ال)?فاصل(ة)?/, 'comma'], [/(ال)?رقم(ان|ين) (ال)?أخير(ان|ين)/, 'last'], [/(ال)?أرقام(ه|ها)?|(ال)?رقم(ين|ان|اً|ًا)?/, 'digit'],
    /* the graduated line, the stairs of units */
    [/(ال)?مستقيم (ال)?مدرّ?ج|(ال)?مستقيم/, 'axis'], [/(ال)?تدريج(ة|ات)?/, 'grad'], [/(ال)?نقاط|(ال)?نقط(ة|تين|تان)/, 'point'], [/(ال)?مجال/, 'zone'], [/(ال)?درج(ة|ات)/, 'step']
  ];
  function numOf(s) { var m = String(s).replace(/\s/g, '').replace(',', '.').match(/^-?\d+(\.\d+)?/); return m ? m[0] : null; }

  /* what the figure can show */
  function scan(fig) {
    var roles = {}, nums = {};
    [].forEach.call(fig.querySelectorAll('[data-role]'), function (e) { e.getAttribute('data-role').split(' ').forEach(function (r) { (roles[r] = roles[r] || []).push(e); }); });
    [].forEach.call(fig.querySelectorAll('svg text'), function (t) { var n = numOf(t.textContent); if (n != null && t.textContent.replace(/\s/g, '').length <= n.length + 4) (nums[n] = nums[n] || []).push(t); });
    return { roles: roles, nums: nums };
  }
  /* the parts lit by a key: 'r:height'  'n:4'  'n:4,8' */
  function targets(map, key) {
    var out = [];
    key.split('|').forEach(function (k) {
      var kind = k.charAt(0), v = k.slice(2);
      if (kind === 'r') v.split(' ').forEach(function (r) { out = out.concat(map.roles[r] || []); });
      else v.split(',').forEach(function (n) {
        (map.nums[n] || []).forEach(function (t) {
          out.push(t);
          /* a label that names a part brings that part with it: the 8 of the base lights the base itself.
             Of its names only the last, the most precise, counts: the 3 of one numerator must not light every numerator */
          var r = (t.getAttribute('data-role') || '').split(' ').pop();
          if (r) out = out.concat((map.roles[r] || []).filter(function (e) { return e.tagName !== 'text'; }));
        });
      });
    });
    return out;
  }
  var timer = null;
  function clear(fig) { [].forEach.call(fig.querySelectorAll('.cue-hit'), function (e) { e.classList.remove('cue-hit'); }); fig.classList.remove('cue-on'); }
  function light(fig, map, key, hold) {
    clearTimeout(timer); clear(fig);
    var t = targets(map, key); if (!t.length) return false;
    fig.classList.add('cue-on'); t.forEach(function (e) { e.classList.add('cue-hit'); });
    if (hold) timer = setTimeout(function () { clear(fig); }, hold);
    return true;
  }

  function keyEl(label, key, fig, map) {
    var b = el('button', { type: 'button', class: 'cue', 'data-cue': key }); b.textContent = label;
    b.addEventListener('focus', function () { light(fig, map, key); });
    b.addEventListener('blur', function () { clear(fig); });
    b.addEventListener('click', function () { light(fig, map, key, RE.isTv ? 0 : 2600); if (RE.fx) RE.fx('tap'); });
    b.addEventListener('mouseenter', function () { light(fig, map, key); }); b.addEventListener('mouseleave', function () { if (document.activeElement !== b) clear(fig); });
    return b;
  }
  /* turn the words and numbers of one text node into keys */
  function wrap(node, fig, map, found) {
    var s = node.nodeValue, parts = [], i = 0, inExpr = node.parentNode.closest && node.parentNode.closest('.expr, .m');
    while (i < s.length) {
      var rest = s.slice(i), hit = null, m, k;
      if (inExpr && (m = /^\(([^()]*)\)/.exec(rest))) {   /* a bracket of the solution: everything it holds, at once */
        var ns = (m[1].match(/\d+([.,]\d+)?/g) || []).map(numOf).filter(function (n) { return map.nums[n]; });
        if (ns.length > 1) hit = [m[0], 'n:' + ns.join(',')];
      }
      if (!hit && (m = /^\d+([.,]\d+)?/.exec(rest)) && !/[\d.,]$/.test(s.slice(0, i)) && map.nums[numOf(m[0])]) hit = [m[0], 'n:' + numOf(m[0])];
      if (!hit && !inExpr && (i === 0 || /[\s،.:؛(«]/.test(s.charAt(i - 1)) || /^[وفبلك]$/.test(s.slice(Math.max(0, i - 1), i)) && (i < 2 || /\s/.test(s.charAt(i - 2))))) {
        for (k = 0; k < LEX.length && !hit; k++) {
          m = new RegExp('^(?:' + LEX[k][0].source + ')[\\u064B-\\u0652]*(?![\\u0621-\\u064A\\u064B-\\u0652])').exec(rest);
          if (m && LEX[k][1] === 'shape' && /متر\s*$/.test(s.slice(0, i))) m = null;   /* «الصنتمتر المربّع» is a unit, not a square */
          if (m && LEX[k][1].split(' ').some(function (r) { return map.roles[r]; })) hit = [m[0], 'r:' + LEX[k][1]];
        }
      }
      if (hit) { parts.push(hit); i += hit[0].length; } else { if (typeof parts[parts.length - 1] === 'string') parts[parts.length - 1] += s.charAt(i); else parts.push(s.charAt(i)); i++; }
    }
    if (!parts.some(function (p) { return typeof p !== 'string'; })) return;
    var frag = document.createDocumentFragment();
    parts.forEach(function (p) { if (typeof p === 'string') frag.appendChild(document.createTextNode(p)); else { frag.appendChild(keyEl(p[0], p[1], fig, map)); found.push(p[1]); } });
    node.parentNode.replaceChild(frag, node);
  }

  /* called for each screen of a lesson, once the statement and its figure are on the page */
  RE.cues = function (text, fig) {
    if (!text || !fig || fig.querySelector('.vizbox.live')) return;   /* a figure the learner moves is its own explanation */
    var qt = text.querySelector('.qbox .qt'); if (!qt || qt.querySelector('.cue')) return;
    var map = scan(fig); if (!Object.keys(map.roles).length && !Object.keys(map.nums).length) return;
    var nodes = [], w = document.createTreeWalker(qt, NodeFilter.SHOW_TEXT, null), n, found = [];
    while ((n = w.nextNode())) if (!n.parentNode.closest('button, input, .ans, .qn')) nodes.push(n);
    nodes.forEach(function (x) { wrap(x, fig, map, found); });
    if (!found.length) return;
    /* the two questions every problem starts with */
    var given = found.filter(function (k, i) { return found.indexOf(k) === i && k.indexOf(',') < 0; }), bar = el('div', { class: 'cuebar' });
    var g = el('button', { type: 'button', class: 'cuebtn' }, '🔎 المعطيات'), a = el('button', { type: 'button', class: 'cuebtn' }, '🎯 المطلوب');
    g.addEventListener('click', function () {
      var keys = [].slice.call(qt.querySelectorAll('.cue')).filter(function (b, i, all) { return b.getAttribute('data-cue').indexOf(',') < 0 && all.map(function (x) { return x.getAttribute('data-cue'); }).indexOf(b.getAttribute('data-cue')) === i; });
      keys.forEach(function (b, i) { setTimeout(function () { [].forEach.call(qt.querySelectorAll('.cue.now'), function (x) { x.classList.remove('now'); }); b.classList.add('now'); light(fig, map, b.getAttribute('data-cue')); }, i * 1100); });
      setTimeout(function () { [].forEach.call(qt.querySelectorAll('.cue.now'), function (x) { x.classList.remove('now'); }); if (document.activeElement === g) clear(fig); }, keys.length * 1100 + 300);
    });
    a.addEventListener('click', function () {
      var blanks = [].slice.call(qt.querySelectorAll('.ans')); blanks.forEach(function (b) { b.classList.add('asked'); setTimeout(function () { b.classList.remove('asked'); }, 2600); });
      if (!light(fig, map, 'r:ask', 2600)) light(fig, map, 'r:area', 2600);
    });
    if (given.length > 1) bar.appendChild(g);
    if (map.roles.ask || qt.querySelector('.ans')) bar.appendChild(a);
    if (bar.children.length) qt.parentNode.insertBefore(bar, qt.nextSibling);
  };
})();
