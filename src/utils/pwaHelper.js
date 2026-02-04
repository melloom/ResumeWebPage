// PWA Helper utilities to detect and handle PWA display mode

/**
 * Check if app is running in standalone/PWA mode
 */
export const isPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Prevent external links from breaking out of PWA
 */
export const handleExternalLinks = () => {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    
    if (!anchor) return;
    
    const href = anchor.getAttribute('href');
    const target = anchor.getAttribute('target');
    
    // Skip if it's not a link or already has target
    if (!href || target === '_blank' || target === '_self') return;
    
    // Check if it's an external link
    const isExternal = href.startsWith('http://') || 
                      href.startsWith('https://') ||
                      href.startsWith('mailto:') ||
                      href.startsWith('tel:');
    
    // If external link and in PWA mode, open in new window
    if (isExternal && isPWA()) {
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  });
};

/**
 * Initialize PWA helpers
 */
export const initPWA = () => {
  if (isPWA()) {
    console.log('Running in PWA mode');
    handleExternalLinks();
  }
};
