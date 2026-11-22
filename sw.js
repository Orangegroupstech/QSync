/* OKL Console service worker (21 Nov 2026): only makes the console installable as an app.
   It caches nothing, so every page and every answer always comes fresh from the server.
   The Engineering console keeps its own worker (engineering/sw.js) for maintenance-call notifications. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
