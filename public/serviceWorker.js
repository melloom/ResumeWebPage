// Cache names
const CACHE_NAME = 'melvin-peralta-portfolio-v2'; // Increment version to force cache refresh
const RUNTIME_CACHE = 'runtime-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/photo-1.jpg',
  '/icons/favicon.ico',
  '/icons/logo192.png',
  '/icons/logo512.png',
  '/icons/maskable_icon.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/safari-pinned-tab.svg',
  '/images/school/anne-arundel-cc.jpg',
  '/images/school/cat-north.jpg',
  '/images/school/Meade-hs.jpg',
  '/images/school/Resume/Resume.pdf'
];

// Install event - cache critical files but don't make it blocking
self.addEventListener('install', (event) => {
  // Use waitUntil to ensure the service worker won't install until caching is complete
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Skip waiting to ensure the new service worker activates immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement a network-first strategy for most resources
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip theme-related localStorage requests
  const url = new URL(event.request.url);
  if (url.pathname.includes('theme') || 
      event.request.url.includes('theme') || 
      event.request.headers.get('purpose') === 'theme-detection') {
    return;
  }

  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response as it can only be consumed once
        const responseToCache = response.clone();
        
        // Only cache successful responses from our origin
        if (response.status === 200 && event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME)
            .then(cache => {
              // Don't cache localStorage access or API responses
              if (!event.request.url.includes('localStorage') && 
                  !event.request.url.includes('/api/')) {
                cache.put(event.request, responseToCache);
              }
            });
        }
        
        return response;
      })
      .catch(() => {
        // Try to get from cache if network fails
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // For navigation requests, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Add message handler to force cache refresh when needed
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('All caches cleared');
      // Notify client that caches were cleared
      event.ports[0].postMessage('Caches cleared successfully');
    });
  }
});
