const CACHE = "bangkok-sidekick-v41";
const FILES = ["./", "index.html", "styles.css", "app.js", "data.js", "chat.js", "update.js", "manifest.webmanifest", "icons/favicon.svg", "icons/favicon.ico", "icons/favicon-32x32.png", "icons/logo.svg", "icons/apple-touch-icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "img/app-store-badge.png", "img/google-play-badge.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); });   // no skipWaiting here: a new version waits until the user taps Update
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// The page asks a waiting new version to take over when the user taps "Update".
self.addEventListener("message", e => { if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting(); });
// Network first so content updates arrive; fall back to cache offline.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const path = new URL(e.request.url).pathname;
  if (path.endsWith("/sw.js") || path.endsWith("/changelog.json")) return; // version checks must always see the real files
  if (new URL(e.request.url).origin !== location.origin) return; // let analytics and other third-party requests pass straight through
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => {
    const copy = r.clone();
    if (new URL(e.request.url).origin === location.origin) caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request)));
});
