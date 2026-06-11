const CACHE_NAME = 'atlasify-cache-v1';

// Install event: cache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first for HTML, Cache-first for static assets (images, CSS, JS)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude non-GET requests and browser extensions
  if (event.request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Identify static assets (images, css, js, fonts)
  const isStaticAsset = url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot|ico)$/) || url.hostname === 'basemaps.cartocdn.com';

  if (isStaticAsset) {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          // Cache the fetched response
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // Fallback if network fails and not in cache
          return new Response('Offline Asset', { status: 404 });
        });
      })
    );
  } else {
    // Network-first strategy for HTML and API requests
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback for HTML
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./');
        }
      })
    );
  }
});
