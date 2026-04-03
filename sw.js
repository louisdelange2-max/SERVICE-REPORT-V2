const CACHE_NAME = "service-report-v8";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  if (url.hostname.includes("script.google.com") || url.hostname.includes("script.googleusercontent.com")) {
    event.respondWith(fetch(req));
    return;
  }
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy));
      return res;
    }))
  );
});