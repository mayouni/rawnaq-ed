/* Rawnaq Ed — the number pad. On a television and on a touch screen an answer box is a button, and this pad
   writes into it: the system keyboard never comes up and never hides the drawing. The pad sits under the
   exercise, on its half of the screen. It shows only the keys the answer needs.
   Try it on a computer with  index.html?pad=1  (or ?tv=1). */
(function () {
  'use strict';
  var RE = window.RE, isTv = false;
  try { isTv = !!(window.RENative && window.RENative.isTv()); } catch (e) { /* not inside the app */ }
  if (/[?&]tv=1/.test(location.search)) isTv = true;
  RE.isTv = isTv;
  var coarse = false; try { coarse = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-pointer: fine)').matches; } catch (e) { /* old browser */ }
  RE.usePad = isTv || coarse || /[?&]pad=1/.test(location.search) || !!window.RENative;

  var pad = null, rowsEl, prev, note, target = null;
  var D1 = ['1', '2', '3', '4', '5'], D2 = ['6', '7', '8', '9', '0'];
  function layout(spec) {
    if (/^expr:|^lab$/.test(spec)) return [D1, D2, ['+', '−', '×', ':', '^'], ['(', ')', spec === 'lab' ? ';' : ',', '⌫', 'تمّ']];
    if (/^set:/.test(spec)) return [D1, D2, [';', '⌫', 'تمّ']];
    return [D1, D2, [',', '⌫', 'تمّ']];
  }
  function build() {
    pad = RE.el('div', { class: 'pad', hidden: '', dir: 'ltr' });
    prev = RE.el('div', { class: 'pad-prev' }); rowsEl = RE.el('div', {}); note = RE.el('div', { class: 'pad-note', dir: 'rtl' });
    pad.appendChild(prev); pad.appendChild(rowsEl); pad.appendChild(note);
    document.body.appendChild(pad);
  }
  function fill(spec) {
    rowsEl.innerHTML = '';
    layout(spec).forEach(function (row) {
      var r = RE.el('div', { class: 'pad-row' });
      row.forEach(function (k) {
        var b = RE.el('button', { type: 'button', class: 'pad-key' + (k === 'تمّ' ? ' ok' : k === '⌫' ? ' del' : /\d/.test(k) ? '' : ' op'), 'data-k': k }, k);
        b.addEventListener('click', function () { press(k); }); r.appendChild(b);
      });
      rowsEl.appendChild(r);
    });
    note.innerHTML = /^set:/.test(spec) ? 'بين كلّ عددين المس[ي] <b dir="ltr">;</b>'.replace('[ي]', RE.state && RE.state.fem ? 'ي' : '') : spec === 'lab' ? 'بين عددين <b dir="ltr">;</b>' : '';
    note.hidden = !note.innerHTML;
  }
  function show() { var v = target ? target.value : ''; prev.textContent = v === '' ? ' ' : v; if (target) target.textContent = v === '' ? ' ' : v; }
  function press(k) {
    if (!target) return;
    if (k === 'تمّ') { done(); return; }
    target.value = k === '⌫' ? target.value.slice(0, -1) : (target.value.length < 40 ? target.value + (k === '−' ? '-' : k) : target.value);
    show(); if (RE.fx) RE.fx(k === '⌫' ? 'del' : 'key');
    target.classList.remove('ok', 'no');
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function open(slot) {
    if (!pad) build();
    if (target && target !== slot) target.classList.remove('typing');
    target = slot; fill(slot.getAttribute('data-spec') || '');
    pad.hidden = false; document.body.classList.add('pad-on'); slot.classList.add('typing'); show();
    slot.dispatchEvent(new CustomEvent('re-blank', { detail: (slot._q ? slot._q.inputs.indexOf(slot) : 0), bubbles: true }));
    setTimeout(function () { if (target === slot) slot.scrollIntoView({ block: 'center', inline: 'nearest' }); }, 20);
    if (RE.isTv) { var k = pad.querySelector('[data-k="3"]'); if (k) k.focus({ preventScroll: true }); }
  }
  function close() {
    if (!pad || pad.hidden) return null;
    pad.hidden = true; document.body.classList.remove('pad-on');
    var t = target; target = null;
    if (t) t.classList.remove('typing');
    return t;
  }
  /* «تمّ»: go to the next empty box of the same exercise; when none is left, check the answer */
  function done() {
    var t = close(); if (!t) return;
    t.dispatchEvent(new Event('change', { bubbles: true }));
    var q = t._q;
    if (q) {
      var next = q.inputs.filter(function (i) { return i !== t && i.classList.contains('slot') && !i.disabled && i.value === ''; })[0];
      if (next) { open(next); return; }
      var empty = q.inputs.some(function (i) { return i.value === ''; });
      if (!empty) { q.check(); return; }
    }
    if (t._done) t._done();
    if (RE.isTv && document.body.contains(t) && !t.disabled) t.focus({ preventScroll: true });
  }
  RE.pad = { open: open, close: function () { var t = close(); if (t && RE.isTv && document.body.contains(t)) t.focus({ preventScroll: true }); return !!t; }, isOpen: function () { return !!pad && !pad.hidden; }, el: function () { return pad; }, press: press, drop: function () { close(); } };
  if (!RE.usePad) return;
  document.documentElement.classList.add('use-pad');

  document.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('.ans.slot');
    if (s && !s.disabled) { open(s); return; }
    if (RE.pad.isOpen() && !(e.target.closest && e.target.closest('.pad'))) close();
  });
  /* a keyboard plugged into the tablet or the television still types */
  window.addEventListener('keydown', function (e) {
    if (!RE.pad.isOpen()) return;
    var map = { '*': '×', 'x': '×', '/': ':', '-': '−', '.': ',' }, k = map[e.key] || e.key;
    if (/^[0-9]$/.test(k) || (pad.querySelector('[data-k="' + k.replace(/"/g, '') + '"]') && k.length === 1)) { e.preventDefault(); press(k); }
    else if (e.key === 'Backspace') { e.preventDefault(); press('⌫'); }
    else if (e.key === 'Escape') { e.preventDefault(); RE.pad.close(); }
    else if (e.key === 'Enter' && !(document.activeElement && document.activeElement.classList.contains('pad-key'))) { e.preventDefault(); done(); }
  }, true);
})();
