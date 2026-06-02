const CACHE_NAME = 'pulse-connect-v1';

// Static application assets to cache immediately upon app installation
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 🚀 INSTALL EVENT: Pre-cache the structural core of the application
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting()) // Forces immediate activation
  );
});

// 🧹 ACTIVATE EVENT: Clean up older cache versions during codebase deployments
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 Clearing legacy service worker cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 🔄 FETCH INTERCEPTION: Route assets safely across campus networks
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip tracking or advertising requests entirely (e.g., Google AdSense)
  if (url.hostname.includes('googlesyndication') || url.hostname.includes('doubleclick')) {
    return;
  }

  // Strategy A: Network-First for Supabase REST endpoints & API trends
  if (url.pathname.startsWith('/rest/v1') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request); // Fallback to cache only if network fails completely
        })
    );
    return;
  }

  // Strategy B: Stale-While-Revalidate for layouts, local routes, and design assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        // Cache the freshly fetched resource for subsequent visits
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => null); // Fail silently if offline

      // Instantly return the cached variant if it exists, otherwise wait for network fetch
      return cachedResponse || fetchPromise;
    })
  );
});