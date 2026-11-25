/* Rawnaq Ed — sound. Everything is synthesised here with the Web Audio API: no sound files, nothing to download.
   Two layers, each with its own switch (kept in the learner's settings):
     effects — a soft note for a right answer, a low one for «not yet», keys, stars, a fanfare;
     ambience — a slow, quiet melody that keeps the room calm while she thinks.
   Nothing here rewards speed and nothing punishes: the «not yet» sound is gentle on purpose. */
(function () {
  'use strict';
  var RE = window.RE, ctx = null, out, sfx, mus, wet, timer = null, nextT = 0, step = 0, walk = 2;
  var C5 = 523.25, PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];
  function on(k) { return !RE.state || RE.state[k] !== false; }
  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      out = ctx.createGain(); out.gain.value = 0.9; out.connect(ctx.destination);
      sfx = ctx.createGain(); sfx.gain.value = 0.5; sfx.connect(out);
      mus = ctx.createGain(); mus.gain.value = 0.16; mus.connect(out);
      /* a little echo gives the ambience its space */
      var d = ctx.createDelay(1); d.delayTime.value = 0.42; var fb = ctx.createGain(); fb.gain.value = 0.34; wet = ctx.createGain(); wet.gain.value = 0.5;
      mus.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(out);
    }
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    return ctx;
  }
  function tone(f, at, dur, type, vol, dest, attack) {
    var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + at;
    o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.012)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfx); o.start(t); o.stop(t + dur + 0.05);
  }
  var semi = function (f, n) { return f * Math.pow(2, n / 12); };
  var FX = {
    move: function () { tone(880, 0, 0.05, 'sine', 0.05); },
    tap: function () { tone(587, 0, 0.07, 'triangle', 0.16); },
    key: function () { tone(698, 0, 0.06, 'triangle', 0.14); },
    del: function () { tone(392, 0, 0.07, 'triangle', 0.12); },
    page: function () { tone(440, 0, 0.09, 'sine', 0.1); tone(660, 0.05, 0.12, 'sine', 0.1); },
    hint: function () { tone(1046, 0, 0.5, 'sine', 0.14); tone(1568, 0.02, 0.4, 'sine', 0.05); },
    no: function () { tone(246.9, 0, 0.22, 'sine', 0.2); tone(220, 0.14, 0.3, 'sine', 0.18); },
    show: function () { tone(392, 0, 0.3, 'sine', 0.14); tone(523, 0.12, 0.4, 'sine', 0.12); },
    /* a right answer; a run of first-try answers climbs a little each time */
    ok: function (d) {
      var up = Math.min((d && d.combo) || 0, 7), base = semi(C5, up), clean = !d || d.clean;
      tone(base, 0, 0.3, 'triangle', 0.22); tone(semi(base, 4), 0.08, 0.3, 'triangle', 0.22); tone(semi(base, 7), 0.16, 0.42, 'triangle', 0.22);
      if (clean) { tone(semi(base, 12), 0.26, 0.6, 'sine', 0.16); tone(semi(base, 19), 0.3, 0.5, 'sine', 0.05); }
    },
    star: function () { tone(1318, 0, 0.12, 'sine', 0.1); tone(1760, 0.07, 0.2, 'sine', 0.1); },
    badge: function () { [0, 4, 7, 12].forEach(function (n, i) { tone(semi(C5, n), i * 0.09, 0.35, 'triangle', 0.2); }); tone(semi(C5, 16), 0.4, 0.8, 'sine', 0.16); },
    fanfare: function () {
      [0, 4, 7, 12, 7, 12, 16].forEach(function (n, i) { tone(semi(C5, n), i * 0.11, 0.3, 'triangle', 0.22); });
      [0, 4, 7, 12].forEach(function (n) { tone(semi(C5 / 2, n), 0.8, 1.4, 'sine', 0.12, sfx, 0.05); });
    }
  };
  /* ambience: a slow walk on five notes over a held bass, never the same twice */
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.1;
    while (nextT < ctx.currentTime + 1.2) {
      var at = Math.max(0, nextT - ctx.currentTime);
      if (step % 8 === 0) { var b = [130.81, 196.0, 174.61, 146.83][(step / 8) % 4]; tone(b, at, 7.5, 'sine', 0.5, mus, 1.2); tone(b * 1.5, at, 7.5, 'sine', 0.16, mus, 1.6); }
      if (step % 2 === 0 || Math.random() < 0.3) {
        walk = Math.max(0, Math.min(PENTA.length - 1, walk + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
        tone(PENTA[walk], at, 2.6, 'sine', 0.3, mus, 0.08); tone(PENTA[walk] * 2, at, 1.4, 'sine', 0.05, mus, 0.05);
      }
      step++; nextT += 0.95;
    }
  }
  function music() {
    var want = on('mus') && !document.hidden && !!ctx;
    if (want && !timer) { nextT = ctx.currentTime + 0.3; mus.gain.setTargetAtTime(0.16, ctx.currentTime, 0.4); timer = setInterval(schedule, 300); schedule(); }
    else if (!want && timer) { clearInterval(timer); timer = null; if (ctx) mus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2); }
  }
  RE.sound = {
    play: function (name, d) { if (!on('snd') || !FX[name]) return; if (!ensure()) return; try { FX[name](d); } catch (e) { /* a sound must never break a lesson */ } },
    refresh: function () { if (on('mus') || on('snd')) ensure(); music(); },
    names: Object.keys(FX)
  };
  /* browsers let sound start only after a first touch or key */
  var start = function () { if (on('mus') || on('snd')) { ensure(); music(); } };
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, start, { passive: true }); });
  document.addEventListener('visibilitychange', function () { if (ctx) { if (document.hidden) { music(); if (ctx.suspend) ctx.suspend(); } else { if (ctx.resume) ctx.resume(); music(); } } });
})();
