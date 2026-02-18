// Cache names
const CACHE_NAME = 'melvin-peralta-portfolio-v8'; // Increment version to force cache refresh
const RUNTIME_CACHE = 'runtime-cache-v1';
const OFFLINE_URL = '/offline.html';

// Error handling for service worker
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled promise rejection:', event.reason);
});

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

// Fetch event - only cache assets, skip ALL navigation requests
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // CRITICAL: Skip ALL navigation requests - let browser/Netlify handle routing
  if (event.request.mode === 'navigate') {
    return; // Don't intercept at all
  }
  
  // Skip external API calls - pass them through directly
  const isExternalAPI = url.hostname.includes('firebaseapp.com') ||
                       url.hostname.includes('googleapis.com') ||
                       url.hostname.includes('firebase.googleapis.com') ||
                       url.hostname.includes('identitytoolkit.googleapis.com') ||
                       url.hostname.includes('emailjs.com');
  
  // Also skip the dev server's own requests when in development
  const isDevServerRequest = url.hostname === 'localhost' || 
                            url.hostname === '127.0.0.1' ||
                            url.hostname.includes('.app.github.dev');
  
  if (isExternalAPI || isDevServerRequest) {
    return;
  }

  // Skip theme-related requests
  if (url.pathname.includes('theme') || 
      event.request.headers.get('purpose') === 'theme-detection') {
    return;
  }
  
  // For same-origin requests only
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-first strategy with cache fallback for assets only
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response as it can only be consumed once
        const responseToCache = response.clone();
        
        // Only cache successful responses from our origin
        if (response.status === 200 && url.origin === self.location.origin) {
          caches.open(CACHE_NAME)
            .then(cache => {
              // Don't cache localStorage access or API responses
              if (!url.pathname.includes('localStorage') && 
                  !url.pathname.includes('/api/')) {
                cache.put(event.request, responseToCache);
              }
            })
            .catch(err => console.warn('Cache write failed:', err));
        }
        
        return response;
      })
      .catch((error) => {
        // Log error for debugging
        console.warn('Fetch failed for', event.request.url, error);
        
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
            
            // For image requests that fail, return a transparent pixel
            if (event.request.destination === 'image') {
              return new Response('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', {
                status: 200,
                headers: { 'Content-Type': 'image/png' }
              });
            }
            
            // For script requests that fail, try to return a basic response
            if (event.request.destination === 'script') {
              return new Response('console.warn("Script failed to load, ServiceWorker fallback");', {
                status: 200,
                headers: { 'Content-Type': 'application/javascript' }
              });
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
