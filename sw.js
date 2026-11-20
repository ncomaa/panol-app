// sw.js — guarda los archivos para que la app funcione sin internet.
const V = "panol-v1";
const ARCHIVOS = ["./", "./index.html", "./app.js", "./config.js", "./estilos.css", "./html5-qrcode.min.js", "./qrcode.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(ARCHIVOS))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
