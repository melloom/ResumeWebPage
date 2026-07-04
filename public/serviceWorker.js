// Cache names
const CACHE_NAME = 'melvin-peralta-portfolio-v11';
const OFFLINE_URL = '/offline.html';

// Error handling for service worker
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled promise rejection:', event.reason);
});

// Assets to cache immediately on install (static assets only, NOT index.html)
const ASSETS_TO_CACHE = [
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

// Map of request destinations to expected MIME type prefixes
const EXPECTED_MIME_TYPES = {
  script: 'application/javascript',
  style: 'text/css',
  font: 'font/',
  image: 'image/',
};

// Install event - cache critical files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
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
      return self.clients.claim();
    })
  );
});

/**
 * Check if a response has the correct MIME type for its request.
 * Prevents caching HTML fallback pages as JS/CSS assets.
 */
function hasValidMimeType(request, response) {
  const contentType = response.headers.get('content-type') || '';
  const destination = request.destination;

  // If we know what type is expected, validate it
  if (destination && EXPECTED_MIME_TYPES[destination]) {
    const expected = EXPECTED_MIME_TYPES[destination];
    if (!contentType.includes(expected)) {
      return false;
    }
  }

  // Also check by URL extension as a fallback
  const url = new URL(request.url);
  const ext = url.pathname.split('.').pop();
  if (ext === 'js' && !contentType.includes('javascript') && !contentType.includes('ecmascript')) {
    return false;
  }
  if (ext === 'css' && !contentType.includes('css')) {
    return false;
  }

  return true;
}

// Fetch event - network-first with MIME validation
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // CRITICAL: Skip ALL navigation requests - let browser/Netlify handle routing
  if (event.request.mode === 'navigate') {
    return;
  }

  // Skip SPA route paths (no file extension)
  const pathname = url.pathname;
  if (pathname !== '/' && !pathname.includes('.') && url.origin === self.location.origin) {
    return;
  }
  
  // Skip external API calls
  const isExternalAPI = url.hostname.includes('firebaseapp.com') ||
                       url.hostname.includes('googleapis.com') ||
                       url.hostname.includes('firebase.googleapis.com') ||
                       url.hostname.includes('identitytoolkit.googleapis.com') ||
                       url.hostname.includes('emailjs.com');
  
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

  // Network-first strategy with MIME type validation
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Validate MIME type before caching
        if (response.status === 200 && hasValidMimeType(event.request, response)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              if (!url.pathname.includes('localStorage') && 
                  !url.pathname.includes('/api/')) {
                cache.put(event.request, responseToCache);
              }
            })
            .catch(err => console.warn('Cache write failed:', err));
        }
        
        // Even if MIME is wrong, return the network response as-is
        // (the browser will handle the error naturally)
        return response;
      })
      .catch((error) => {
        console.warn('Fetch failed for', event.request.url, error);
        
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              // Double-check cached response MIME type
              if (hasValidMimeType(event.request, cachedResponse)) {
                return cachedResponse;
              }
              // Bad cached response — delete it
              caches.open(CACHE_NAME).then(cache => cache.delete(event.request));
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
            
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Message handler for cache management
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
      if (event.ports[0]) {
        event.ports[0].postMessage('Caches cleared successfully');
      }
    });
  }
});
