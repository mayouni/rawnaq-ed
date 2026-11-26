/* Rawnaq Ed — works with no network once opened: every file of the site is kept on the device.
   Change VERSION whenever the site changes (build-apk.ps1 does not use this file; it is for the web only). */
var VERSION = 'rawnaq-ed-0.9.1';
var FILES = ["./", "css/ed.css", "fonts/ReadexPro.ttf", "icons/icon-192.png", "icons/icon-512.png", "icons/icon.svg", "index.html", "js/aicha.js", "js/app.js", "js/content/ch0.js", "js/content/ch1-0.js", "js/content/ch1-a.js", "js/content/ch1-b.js", "js/content/ch1-c.js", "js/core.js", "js/cues.js", "js/play.js", "js/game.js", "js/lab.js", "js/pad.js", "js/remote.js", "js/sound.js", "js/tv.js", "js/viz-samples.js", "js/viz.js", "js/widgets.js", "manifest.webmanifest"];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  /* the network first, so a new version shows at once; with no network, the copy kept on the device */
  e.respondWith(fetch(e.request).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(e.request, copy); }); }
    return res;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});
