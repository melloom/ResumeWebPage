import React, { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import { installApp, isPwaInstallable } from '../../pwaRegistration';
import styles from './InstallPWA.module.css';

const InstallPWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if PWA is already installable on component mount
    setIsInstallable(isPwaInstallable());
    
    // Listen for PWA installable event
    const handlePwaInstallable = () => {
      setIsInstallable(true);
      // Show the install button after a delay to avoid immediate pop-up
      setTimeout(() => setIsVisible(true), 5000);
    };
    
    // Listen for beforeinstallprompt event via custom event dispatched in pwaRegistration.js
    window.addEventListener('pwaInstallable', handlePwaInstallable);
    
    // Cleanup
    return () => {
      window.removeEventListener('pwaInstallable', handlePwaInstallable);
    };
  }, []);
  
  // Don't show install button when on iOS since PWA installation works differently there
  useEffect(() => {
    // Check if the device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
      setIsInstallable(false);
    }
  }, []);

  const handleInstall = async () => {
    try {
      const installed = await installApp();
      
      if (installed) {
        // Hide the button after successful installation
        setIsInstallable(false);
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Installation error:', error);
    }
  };
  
  // Don't render if not installable or not visible
  if (!isInstallable || !isVisible) {
    return null;
  }
  
  return (
    <div className={styles.installContainer}>
      <button 
        className={styles.installButton} 
        onClick={handleInstall}
        aria-label="Install App"
      >
        <FaDownload className={styles.installIcon} />
        <span className={styles.installText}>Install App</span>
      </button>
    </div>
  );
};

export default InstallPWA;
