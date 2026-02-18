/**
 * Route preloading utility
 * Helps load page components before navigation
 */

// Map of routes to their lazy-loaded components
// This should match your lazy-loaded routes in App.jsx
const routeComponentMap = {
  '/': () => import('../pages/Home'),
  '/about': () => import('../pages/About'),
  '/resume': () => import('../pages/Resume'),
  '/contact': () => import('../pages/Contact'),
  '/projects': () => import('../pages/Projects'),
  '/autoscope': () => import('../pages/AutoScope'),
};

// Track which components have been preloaded
const preloadedComponents = new Set();

/**
 * Preloads a route's component when a user shows intent to navigate
 * @param {string} path The route path to preload
 * @returns {Promise<void>}
 */
export const preloadRouteComponent = (path) => {
  const loadComponent = routeComponentMap[path];
  
  // Don't preload if already done or component doesn't exist
  if (!loadComponent || preloadedComponents.has(path)) {
    return Promise.resolve();
  }
  
  // Mark as preloaded to avoid duplicate requests
  preloadedComponents.add(path);
  
  // Use Promise to allow chaining
  return new Promise((resolve) => {
    // Use requestIdleCallback if available, otherwise use setTimeout
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        loadComponent()
          .then(() => {
            console.log(`Preloaded component for path: ${path}`);
            resolve();
          })
          .catch(err => {
            console.error(`Error preloading ${path}:`, err);
            preloadedComponents.delete(path); // Allow retry on failure
            resolve();
          });
      }, { timeout: 1500 });
    } else {
      setTimeout(() => {
        loadComponent()
          .then(() => {
            console.log(`Preloaded component for path: ${path}`);
            resolve();
          })
          .catch(err => {
            console.error(`Error preloading ${path}:`, err);
            preloadedComponents.delete(path);
            resolve();
          });
      }, 300);
    }
  });
};

/**
 * Preload all route components on initial load
 * Call this function after the app has finished loading critical content
 */
export const preloadAllRouteComponents = () => {
  // Wait for the page to be fully loaded
  if (document.readyState === 'complete') {
    startPreloading();
  } else {
    window.addEventListener('load', () => {
      setTimeout(startPreloading, 1000);
    });
  }
};

function startPreloading() {
  // Get current path to avoid preloading the current page
  const currentPath = window.location.pathname;
  
  // Preload routes in order of likelihood to be visited
  const priorityRoutes = ['/about', '/resume', '/contact', '/'];
  
  // Create a priority queue for preloading
  const routesToPreload = priorityRoutes.filter(route => 
    route !== currentPath && !preloadedComponents.has(route)
  );
  
  // Stagger preloading to avoid network congestion
  routesToPreload.forEach((route, index) => {
    setTimeout(() => {
      preloadRouteComponent(route);
    }, index * 1000); // 1 second apart
  });
}
