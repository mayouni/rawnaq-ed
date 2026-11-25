/* One sample of every figure kind. Used by the gallery page (#/viz) and by  node tools/viz-samples.js */
var SAMPLES = [
  { k: 'line', from: 10, to: 15, minor: 5, marks: [{ v: 10.4, label: 'A' }, { v: '23/2' }, { v: 13.2, label: '?' }], hops: [{ from: 10, to: 12, label: '+2' }], zone: [11, 12], note: 'مستقيم مدرّج' },
  { k: 'line', from: 13, to: 14, step: 0.1, marks: [{ v: 13.4 }, { v: 13.27 }] },
  { k: 'bars', items: [{ label: 'الاثنين', v: 523 }, { label: 'الثلاثاء', v: 395, text: '?' }] },
  { k: 'place', nums: ['37806', '35960'] }, { k: 'place', nums: ['13,4', '13,27'] },
  { k: 'array', rows: 4, cols: 8, split: 6 }, { k: 'array', rows: 4, cols: 3, extra: 1 },
  { k: 'area', top: ['10', '2'], side: ['7'], cells: ['7 × 10', '?'] }, { k: 'area', top: ['20', '3'], side: ['10', '4'], cells: ['200', '30', '80', '?'] },
  { k: 'shape', type: 'rect', w: '5 cm', h: '4 cm' }, { k: 'shape', type: 'square', a: '3 cm' }, { k: 'shape', type: 'tri', b: '7 cm', h: '2 cm', names: ['B', 'A', 'C'] },
  { k: 'shape', type: 'rtri', a: '3', b: '4', c: '5', names: ['B', 'A', 'C'] }, { k: 'shape', type: 'trap', B: '8', b: '6', h: '4' }, { k: 'shape', type: 'para', b: '6', h: '2' },
  { k: 'shape', type: 'rhombus', d1: '6', d2: '4' }, { k: 'shape', type: 'circle', r: '2 cm' }, { k: 'shape', type: 'cube', n: 6 },
  { k: 'bar', whole: '3017', parts: ['?', '17'] }, { k: 'bar', whole: '203', parts: ['15', '15', '…', '15', '?'] },
  { k: 'bar', scale: true, rows: [{ label: 'الأب', parts: ['13', '28'] }, { label: 'محمّد', parts: ['13'], len: 0.32 }] },
  { k: 'groups', a: 23, b: 6 }, { k: 'groups', a: 203, b: 15 },
  { k: 'frac', items: [{ n: 7, d: 4 }, { n: 3, d: 5, label: '?' }] }, { k: 'frac', same: true, items: [{ n: 3, d: 4 }, { n: 6, d: 8 }, { n: 9, d: 12 }] },
  { k: 'chain', groups: [{ a: 5, n: 3 }, { a: 5, n: 4 }] }, { k: 'chain', a: 2, n: 10, groups: null }, { k: 'chain', groups: [{ a: 5, n: 4 }, { a: 5, n: 4 }, { a: 5, n: 4 }] },
  { k: 'ftree', n: 120, reveal: 1 }, { k: 'ftree', n: 4356 },
  { k: 'rects', n: 12 }, { k: 'divs', n: 36, hide: true }, { k: 'divs', n: 72 },
  { k: 'venn', a: [1, 3, 5, 9, 15, 45], b: [1, 2, 3, 5, 6, 10, 15, 30], la: 'قواسم 45', lb: 'قواسم 30', hide: true },
  { k: 'venn', a: ['2', '2', '2', '2', '3'], b: ['2', '2', '3', '3', '5'], la: '48', lb: '180' },
  { k: 'hops', a: 4, b: 6, max: 60 }, { k: 'hops', a: 12, b: 16, max: 60, hide: true },
  { k: 'stairs', from: 'm', to: 'cm' }, { k: 'stairs', units: ['h', 'mn', 's'], factor: 60, from: 's', to: 'mn' },
  { k: 'expr', e: '5 × (3 + 2^4) - 2 × 6' }, { k: 'expr', e: '17 = 5 × ? + ?', order: false },
  { k: 'digits', n: '2345', mode: 'sum' }, { k: 'digits', n: '28•0', mode: 'sum' }, { k: 'digits', n: '2768', mode: 'last2' }, { k: 'digits', n: '56790', mode: 'last' },
  { k: 'pyramid', rows: [['?'], ['14', '?', '8'], ['9', '5', '0', '?']] }, { k: 'grid', cells: [['', 'المداخيل', 'الدفوعات'], ['الاثنين', '523', '485'], ['الثلاثاء', '?', '395']], head: true, headCol: true },
  { k: 'seq', type: 'tri', n: 4 }, { k: 'seq', type: 'match', n: 3 }, { k: 'seq', type: 'odd', n: 3 }, { k: 'seq', type: 'sq', n: 4 },
  { k: 'dline', top: { label: 'km', vals: [0, 90, 120] }, bot: { label: 'mn', vals: [0, 60, '?'] } },
  { k: 'card', icon: '🚗', rows: [['السرعة', '90 km/h'], ['المسافة', '120 km'], ['المدّة', '?']] },
  { k: 'angle', deg: 40 }, { k: 'angle', deg: 90 }, { k: 'angle', deg: 130 },
  { k: 'triangle', names: ['A', 'B', 'C'], angles: ['90°', '?', '25°'], right: 0 }, { k: 'triangle', equi: true, angles: ['?', '?', '?'] },
  { k: 'note', html: ['`a^m × a^n = a^(m+n)`'] }
];
if (typeof window !== 'undefined' && window.RE) window.RE.vizSamples = SAMPLES;
if (typeof module !== 'undefined' && require.main === module) {
  process.argv[2] = '__none__';
  require('../../tools/check-content.js');
  var RE = global.RE, n0 = RE.checkErrs.length;
  SAMPLES.forEach(function (v, i) { if (v.groups === null) delete v.groups; RE.tryViz('sample ' + i + ' ' + v.k, v); });
  console.log(RE.checkErrs.slice(n0).join('\n') || 'all ' + SAMPLES.length + ' samples draw');
}
