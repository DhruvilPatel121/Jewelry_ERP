const CACHE_NAME = 'jewelry-erp-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.png',
];

// // Install event - cache resources
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       return cache.addAll(urlsToCache);
//     })
//   );
//   self.skipWaiting();
// });

// // Activate event - clean up old caches
// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheName !== CACHE_NAME) {
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
//   self.clients.claim();
// });

// // Fetch event - serve from cache, fallback to network
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       // Cache hit - return response
//       if (response) {
//         return response;
//       }

//       // Clone the request
//       const fetchRequest = event.request.clone();

//       return fetch(fetchRequest).then((response) => {
//         // Check if valid response
//         if (!response || response.status !== 200 || response.type !== 'basic') {
//           return response;
//         }

//         // Clone the response
//         const responseToCache = response.clone();

//         caches.open(CACHE_NAME).then((cache) => {
//           cache.put(event.request, responseToCache);
//         });

//         return response;
//       });
//     })
//   );
// });






self.addEventListener('fetch', (event) => {
  // 🚫 Ignore non-http(s) requests (chrome-extension, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // 🚫 Do not cache invalid responses
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        // 🚫 Prevent caching HTML for JS/CSS files
        const contentType = networkResponse.headers.get('content-type') || '';
        if (
          event.request.url.includes('/assets/') &&
          contentType.includes('text/html')
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
