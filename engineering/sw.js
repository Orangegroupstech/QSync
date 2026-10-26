/* Engineering console service worker: shows a notification for each new maintenance call.
   The push carries no text (payloadless Web Push); the worker asks the server for this browser's note with the key the
   console stored in the 'okl-push' cache when notifications were turned on. */
const API = 'https://orangegroupsai.online/webhook/engineering/push-note';
const FALLBACK = { title: 'Maintenance', body: 'Open the Engineering console to see what is new.', url: '/engineering/#/jobs', tag: 'okl-call' };

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let note = FALLBACK;
    try {
      const key = await (await caches.open('okl-push')).match('key');
      if (key) {
        const r = await fetch(API + '?k=' + encodeURIComponent(await key.text()), { cache: 'no-store' });
        if (r.ok) note = Object.assign({}, FALLBACK, await r.json());
      }
    } catch (err) { /* show the plain notice */ }
    await self.registration.showNotification(note.title, { body: note.body, tag: note.tag, renotify: true, icon: '../logo.png', data: { url: note.url } });
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || FALLBACK.url;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = wins.find(w => w.url.includes('/engineering/'));
    if (open) { await open.navigate(url); return open.focus(); }
    return self.clients.openWindow(url);
  })());
});
