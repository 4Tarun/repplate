// Bump VERSION on every deploy so phones pick up the new files.
const VERSION = 'rp-v3';
const SHELL = [
  './', './index.html', './css/app.css', './manifest.webmanifest',
  './js/app.js', './js/store.js', './js/calc.js', './js/charts.js',
  './js/data-gym.js', './js/data-diet.js', './js/firebase-config.js',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Never touch Firebase auth handler or Google APIs (Firestore has its own offline cache)
  if (url.pathname.startsWith('/__/')) return;
  const sameOrigin = url.origin === location.origin;
  const firebaseSdk = url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
  if (!sameOrigin && !firebaseSdk) return;

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  // stale-while-revalidate
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req);
    const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
