const CACHE = 'pullup-coach-v2';
const SHELL = ['./pullup-coach.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // CDN 리소스: 네트워크 우선
  if (url.hostname.includes('jsdelivr') || url.hostname.includes('mediapipe')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // HTML 파일: 항상 네트워크에서 최신 버전 가져오기
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // 나머지: 캐시 우선
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
