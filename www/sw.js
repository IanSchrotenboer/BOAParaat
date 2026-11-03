// Bewaart de app op het toestel, zodat hij snel opent en ook zonder internet werkt.
// Eerst uit de opslag tonen, op de achtergrond bijwerken (ook de lettertypen).
const CACHE = "boa-paraat-v44";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];
const FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== "GET" || (url.origin !== location.origin && !FONTS.test(req.url))) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: req.mode === "navigate" });
    const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const r = await net; if (r) return r;
    return req.mode === "navigate" ? (await c.match("./index.html")) : Response.error();
  }));
});
