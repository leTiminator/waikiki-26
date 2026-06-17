// Offline cache for Waikiki '26. Bump VERSION to force an update after edits.
const VERSION = "waikiki-v19";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./BANNER2.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first so the app opens with no signal (e.g. at Kualoa).
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("open-meteo.com")) return; // live weather: always network, never cache
  // Network-first for the page itself so edits show on reload; fall back to cache offline.
  if (e.request.mode === "navigate" || e.request.destination === "document") {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then(h => h || caches.match("./index.html")))
    );
    return;
  }
  // Cache-first for static assets (icons, banner) — fast and offline-friendly.
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
