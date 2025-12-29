// PWA Registration with enhanced handling for theme issues
let registration = null;
let deferredPrompt = null;

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      const swUrl = '/serviceWorker.js';

      // Preserve theme setting before service worker initialization
      const savedTheme = localStorage.getItem('theme') || 'dark';
      
      navigator.serviceWorker.register(swUrl)
        .then(reg => {
          registration = reg;
          console.log('Service worker registered:', reg);
          
          // Check if there's a waiting worker (update available)
          if (reg.waiting) {
            updateServiceWorker(reg.waiting);
          }
          
          // Handle new installations
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('New content is available; please refresh.');
                    // Notify the user about the update if needed
                  }
                }
              };
            }
          };
          
          // Restore theme after service worker initialization
          setTimeout(() => {
            localStorage.setItem('theme', savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
          }, 100);
        })
        .catch(error => {
          console.error('Error during service worker registration:', error);
        });
        
      // Handle controller changes (when skipWaiting() is called)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Controller changed - reloading for fresh content');
        // Restore theme setting
        localStorage.setItem('theme', savedTheme);
        // Reload the page to ensure all assets are refreshed
        if (!window.__reloading) {
          window.__reloading = true;
          window.location.reload();
        }
      });
    });
  }

  // Listen for the beforeinstallprompt event to capture the installation prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    console.log('App can be installed');
    // Optionally dispatch an event to notify components
    window.dispatchEvent(new CustomEvent('pwaInstallable'));
  });
};

// Force update of service worker
export const updateServiceWorker = (waitingWorker) => {
  if (waitingWorker) {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }
};

// Force cache clearing - use in dev tools or add a refresh button
export const clearServiceWorkerCache = () => {
  if (!registration) {
    return Promise.reject('No service worker registration found');
  }
  
  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data === 'Caches cleared successfully') {
        resolve(true);
      } else {
        reject('Cache clearing failed');
      }
    };
    
    if (registration.active) {
      registration.active.postMessage({
        type: 'CLEAR_CACHE'
      }, [messageChannel.port2]);
    } else {
      reject('No active service worker found');
    }
  });
};

// Add theme protection - call on app init
export const protectThemeSetting = () => {
  // Detect if theme was changed by service worker
  const currentTheme = localStorage.getItem('theme');
  const appliedTheme = document.documentElement.getAttribute('data-theme');
  
  if (currentTheme && currentTheme !== appliedTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }
};

// Add the missing installApp function for PWA installation
export const installApp = async () => {
  if (!deferredPrompt) {
    console.log('No installation prompt available');
    return false;
  }
  
  try {
    // Show the installation prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    // Clear the saved prompt since it can't be used again
    deferredPrompt = null;
    
    // Check if the user accepted
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the PWA installation');
      return true;
    } else {
      console.log('User dismissed the PWA installation');
      return false;
    }
  } catch (error) {
    console.error('Error during PWA installation:', error);
    return false;
  }
};

// Check if PWA is installable
export const isPwaInstallable = () => {
  return !!deferredPrompt;
};
