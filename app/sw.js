const CACHE = "bangkok-sidekick-v37";
const FILES = ["./", "index.html", "styles.css", "app.js", "data.js", "chat.js", "manifest.webmanifest", "icons/favicon.svg", "icons/favicon.ico", "icons/favicon-32x32.png", "icons/logo.svg", "icons/apple-touch-icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "img/app-store-badge.png", "img/google-play-badge.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Network first so content updates arrive; fall back to cache offline.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return; // let analytics and other third-party requests pass straight through
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => {
    const copy = r.clone();
    if (new URL(e.request.url).origin === location.origin) caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request)));
});
