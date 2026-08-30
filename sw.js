// KindCue service worker — installable + offline. App files are
// network-first (so a deploy always shows when online); pinned vendor
// scripts are cache-first (they never change once fetched).
const CACHE = 'kindcue-v1';
const APP_SHELL = [
  './', 'index.html', 'app.jsx', 'router.jsx', 'store.jsx', 'data.jsx', 'icons.jsx',
  'components.jsx', 'auth.jsx', 'tweaks-panel.jsx', 'manifest.json',
  'components/confetti.jsx', 'components/feelings.jsx', 'components/top-nav.jsx',
  'components/board-menu.jsx', 'components/share-modal.jsx', 'components/auth-modal.jsx',
  'screens/home.jsx', 'screens/templates.jsx', 'screens/about.jsx', 'screens/builder.jsx',
  'screens/preview.jsx', 'screens/library.jsx', 'screens/print.jsx', 'screens/image-search.jsx',
  'screens/import.jsx',
  'assets/icon-32.png', 'assets/icon-48.png', 'assets/icon-180.png', 'assets/icon-192.png', 'assets/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
function putCache(req, res) { caches.open(CACHE).then((c) => c.put(req, res)); }
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const sameOrigin = e.request.url.startsWith(self.location.origin);
  if (!sameOrigin) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
        if (res.ok || res.type === 'opaque') putCache(e.request, res.clone());
        return res;
      }).catch(() => cached))
    );
    return;
  }
  e.respondWith(
    fetch(e.request).then((res) => { if (res.ok) putCache(e.request, res.clone()); return res; })
      .catch(() => caches.match(e.request))
  );
});
