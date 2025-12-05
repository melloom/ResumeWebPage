import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const scrollToSpecificElement = () => {
      // If there's a hash in the URL, try to scroll to that element
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({
              behavior: 'smooth'
            });
          }, 500); // Small delay to ensure DOM is fully loaded
          return true; // We handled the scroll
        }
      }
      return false; // We didn't handle any scroll
    };

    // Check for resume navigation
    const forceScrollTop = 
      sessionStorage.getItem('forceScrollTop') === 'true' || 
      pathname === '/resume';
    
    // Check for contact navigation
    const forceScrollTopContact = 
      sessionStorage.getItem('forceScrollTopContact') === 'true' || 
      pathname === '/contact';

    // Handle various scroll scenarios
    if (forceScrollTop || forceScrollTopContact) {
      // Force scroll to top for certain pages
      window.scrollTo(0, 0);
      
      // Clean up the flags
      sessionStorage.removeItem('forceScrollTop');
      sessionStorage.removeItem('forceScrollTopContact');
    } else {
      // Default behavior - try to scroll to hash or go to top
      const handled = scrollToSpecificElement();
      if (!handled) {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname, hash]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
