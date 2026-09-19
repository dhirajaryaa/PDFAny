const CACHE = "pdfany-v1";
const PRECACHE = ["/", "/offline.html", "/manifest.webmanifest", "/logo.webp"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.allSettled(
        PRECACHE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response);
          } catch {
            // skip entries that fail (e.g. host without clean URLs during offline install)
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(navigationHandler(event.request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || /\.(png|webp|svg|ico|woff2?|css|js|webmanifest)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }
});

async function navigationHandler(request) {
  try {
    const response = await fetch(request);
    const copy = response.clone();
    const cache = await caches.open(CACHE);
    cache.put(request, copy);
    return response;
  } catch {
    return offlineFallback(request);
  }
}

async function offlineFallback(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const path = new URL(request.url).pathname;
  const htmlUrl = path === "/" ? "/index.html" : path.endsWith("/") ? `${path.slice(0, -1)}.html` : `${path}.html`;

  const html = await caches.match(htmlUrl);
  if (html) return html;

  return caches.match("/offline.html");
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match("/offline.html") || new Response("Offline", { status: 503 });
  }
}