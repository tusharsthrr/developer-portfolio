const CACHE_NAME = 'tushar-portfolio-cache-v9';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.min.css',
  './script.min.js',
  './chatbot.js',
  './chatbot.min.js',
  './hero-pfp.webp',
  './screenshot-drive-1.webp',
  './screenshot-drive-2.webp',
  './screenshot-drive-3.webp',
  './img-expert-talk.webp',
  './cert-participation.webp',
  './cert-postgre.webp',
  './assets/logo/tushar-pfp.svg',
  './assets/resume/Tushar_Kumar_Suthar_Resume.pdf',
  './robots.txt',
  './sitemap.xml',
  './404.html'
];

// Install Service Worker and cache core static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event listener with Cache-First strategy
self.addEventListener('fetch', event => {
  // Only handle HTTP/HTTPS protocols (avoid chrome-extension:// etc.)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Serve from cache and update dynamic caches in background if appropriate
          return cachedResponse;
        }

        return fetch(event.request).then(networkResponse => {
          // Check for valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            // Check if it's an external resource we want to cache (e.g. Google Fonts or Devicon icons)
            const isExternalAsset = event.request.url.includes('fonts.gstatic.com') ||
                                    event.request.url.includes('fonts.googleapis.com') ||
                                    event.request.url.includes('cdn.jsdelivr.net');
            
            if (isExternalAsset && networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // Offline fallback
          if (event.request.mode === 'navigate') {
            return caches.match('./404.html');
          }
        });
      })
  );
});
