/* Rawnaq Ed — stars, levels, badges, and the small celebrations.
   Kept honest on purpose (Rawnaq's founding rules): nothing is lost by a mistake, nothing is timed,
   nothing expires, no reward is random. A star is a trace of work done:
     ★★★ right at the first try, without a hint · ★★ right after a retry or a hint · ★ after reading the solution.
   A question solved again in review can raise its stars, never lower them. */
(function () {
  'use strict';
  var RE = window.RE, el = RE.el, combo = 0;
  RE.starsOf = function (r) { return r && r.ok ? Math.max(r.best || 0, r.clean ? 3 : r.shown ? 1 : 2) : 0; };
  RE.totalStars = function () { var n = 0, q = RE.state.q; Object.keys(q).forEach(function (k) { n += RE.starsOf(q[k]); }); return n; };
  var LEVELS = [[0, 'في أوّل الطريق'], [30, 'مستكشف[ة]'], [80, 'حاسب[ة] ماهر[ة]'], [160, 'صيّاد[ة] الأنماط'], [280, 'باحث[ة]'], [450, 'مهندس[ة] الأعداد'], [650, 'رياضيّ[ة]'], [880, 'نجم[ة] الرياضيّات']];
  RE.level = function (stars) {
    var s = stars == null ? RE.totalStars() : stars, i = 0; while (i < LEVELS.length - 1 && s >= LEVELS[i + 1][0]) i++;
    var next = LEVELS[i + 1];
    return { n: i + 1, title: RE.g(LEVELS[i][1]), stars: s, from: LEVELS[i][0], to: next ? next[0] : null, part: next ? (s - LEVELS[i][0]) / (next[0] - LEVELS[i][0]) : 1 };
  };
  /* days in a row with at least one solved question, counted back from today (or yesterday: the day is not over) */
  RE.streak = function () {
    var d = new Date(), n = 0, key = function (x) { return x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2) + '-' + ('0' + x.getDate()).slice(-2); };
    if (!RE.state.days[key(d)]) d.setDate(d.getDate() - 1);
    while (RE.state.days[key(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  };
  function stationsDone() { return RE.stations.filter(function (s) { var st = RE.stationStats(s); return st.total > 0 && st.done === st.total; }).length; }
  var BADGES = RE.badges = [
    { id: 'first', icon: '✨', title: 'الخطوة الأولى', how: 'أوّل جواب صحيح', test: function () { return RE.totalStars() > 0; } },
    { id: 'c5', icon: '🎯', title: 'خمسة على التوالي', how: 'خمسة أجوبة صحيحة من أوّل محاولة، واحداً بعد الآخر', test: function () { return (RE.state.combo || 0) >= 5; } },
    { id: 'c10', icon: '🏹', title: 'عشرة على التوالي', how: 'عشرة أجوبة صحيحة من أوّل محاولة، واحداً بعد الآخر', test: function () { return (RE.state.combo || 0) >= 10; } },
    { id: 'st1', icon: '🚩', title: 'محطّة كاملة', how: 'كلّ أسئلة محطّة واحدة', test: function () { return stationsDone() >= 1; } },
    { id: 'st4', icon: '🗺️', title: 'أربع محطّات', how: 'كلّ أسئلة أربع محطّات', test: function () { return stationsDone() >= 4; } },
    { id: 'st8', icon: '🧭', title: 'نصف الطريق', how: 'كلّ أسئلة ثماني محطّات', test: function () { return stationsDone() >= 8; } },
    { id: 'stall', icon: '🏔️', title: 'الطريق كلّه', how: 'كلّ المحطّات', test: function () { return RE.stations.length > 0 && stationsDone() >= RE.stations.length; } },
    { id: 's50', icon: '⭐', title: 'خمسون نجمة', how: '50 نجمة', test: function () { return RE.totalStars() >= 50; } },
    { id: 's200', icon: '🌟', title: 'مئتا نجمة', how: '200 نجمة', test: function () { return RE.totalStars() >= 200; } },
    { id: 's500', icon: '💫', title: 'خمسمئة نجمة', how: '500 نجمة', test: function () { return RE.totalStars() >= 500; } },
    { id: 'd3', icon: '📅', title: 'ثلاثة أيّام', how: 'عمل في ثلاثة أيّام متتالية', test: function () { return RE.streak() >= 3; } },
    { id: 'd7', icon: '🗓️', title: 'أسبوع كامل', how: 'عمل في سبعة أيّام متتالية', test: function () { return RE.streak() >= 7; } },
    { id: 'rev', icon: '🔁', title: 'ذاكرة قويّة', how: 'مراجعة يوم كاملة', test: function () { return !!RE.state.reviewed; } },
    { id: 'make', icon: '🛠️', title: 'صانع[ة]', how: 'شيء من صنعك في الدفتر', test: function () { return RE.state.made.length > 0; } },
    { id: 'lab', icon: '🔬', title: 'في المختبر', how: 'أوّل سؤال تطرح[ينه|ه] على الحاسوب', test: function () { return !!RE.state.labbed; } },
    { id: 'teach', icon: '🎓', title: 'معلّم[ة] عَايْشَه', how: 'شيء علّمت[ِه|َه] لعَايْشَه فحفظته', test: function () { return (RE.state.kb || []).length > 0; } }
  ];
  var toastHost = null;
  RE.toast = function (html, cls) {
    if (!toastHost) { toastHost = el('div', { class: 'toasts', 'aria-live': 'polite' }); document.body.appendChild(toastHost); }
    var t = el('div', { class: 'toast ' + (cls || '') }, html); toastHost.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 500); }, 3600);
  };
  RE.confetti = function (n) {
    try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) { /* draw it */ }
    var host = el('div', { class: 'confetti', 'aria-hidden': 'true' }), cols = ['#FFD21F', '#E8443A', '#5CBF3A', '#2F7FE0', '#F06AA8', '#8A63D2', '#F58A1F'], i;
    for (i = 0; i < (n || 46); i++) host.appendChild(el('i', { style: 'left:' + Math.random() * 100 + '%;background:' + cols[i % cols.length] + ';animation-delay:' + Math.random() * 0.5 + 's;animation-duration:' + (1.6 + Math.random() * 1.4) + 's;transform:rotate(' + Math.random() * 360 + 'deg)' }));
    document.body.appendChild(host); setTimeout(function () { host.remove(); }, 3600);
  };
  RE.checkBadges = function (quiet) {
    var got = [];
    BADGES.forEach(function (b) { if (!RE.state.badges[b.id] && b.test()) { RE.state.badges[b.id] = RE.today(); got.push(b); } });
    if (got.length) { RE.save(); if (!quiet) got.forEach(function (b, i) { setTimeout(function () { RE.toast('<span class="big">' + b.icon + '</span><span><b>وسام جديد: ' + RE.g(b.title) + '</b><br>' + RE.g(b.how) + '</span>', 'badge'); RE.sound.play('badge'); }, 900 + i * 1500); }); }
    return got;
  };
  function refreshCounters() { [].forEach.call(document.querySelectorAll('[data-stars]'), function (e) { e.textContent = RE.totalStars(); }); }
  /* one door for every event worth a sound or a trace */
  RE.fx = function (name, d) {
    d = d || {};
    if (name === 'ok' || name === 'show') {
      var before = RE.level(RE.fxStars == null ? RE.totalStars() : RE.fxStars).n;
      if (name === 'ok' && d.clean) { combo++; if (combo > (RE.state.combo || 0)) { RE.state.combo = combo; RE.save(); } } else combo = 0;
      RE.sound.play(name, { clean: d.clean, combo: Math.max(0, combo - 1) });
      if (d.el) { var p = el('span', { class: 'plus' }, '+' + d.stars + ' ★'); d.el.appendChild(p); setTimeout(function () { p.remove(); }, 1400); }
      if (combo >= 3 && d.el) d.el.appendChild(el('span', { class: 'combo' }, combo + ' على التوالي!'));
      refreshCounters();
      var lv = RE.level(); RE.fxStars = lv.stars;
      if (lv.n > before) setTimeout(function () { RE.toast('<span class="big">🎉</span><span><b>مستوى جديد: ' + lv.title + '</b><br>' + lv.stars + ' نجمة</span>', 'badge'); RE.sound.play('fanfare'); RE.confetti(); }, 700);
      RE.checkBadges();
      return;
    }
    if (name === 'no') combo = 0;
    RE.sound.play(name, d);
  };
  /* keep the best stars of a question when it is solved again in review */
  var settle = RE.settle;
  RE.settle = function (id, clean) {
    var r = RE.rec(id), prev = RE.starsOf(r);
    settle(id, clean);
    r.best = Math.max(prev, clean ? 3 : r.shown ? 1 : 2); RE.save();
  };
})();
