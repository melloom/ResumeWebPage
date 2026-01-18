// Clear service worker and caches for fresh start
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('Service worker unregistered');
    });
  });
}

// Clear all caches
caches.keys().then((cacheNames) => {
  cacheNames.forEach((cacheName) => {
    caches.delete(cacheName);
    console.log('Cache cleared:', cacheName);
  });
});
