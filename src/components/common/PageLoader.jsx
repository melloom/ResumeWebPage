import React, { useEffect, useState } from 'react';
import styles from './PageLoader.module.css';

const PageLoader = () => {
  const [isFastTransition, setIsFastTransition] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading page...');

  useEffect(() => {
    // Check if this is internal navigation
    const isInternal = sessionStorage.getItem('internalNavigation') === 'true';
    const isFast = sessionStorage.getItem('fastTransition') === 'true';
    
    if (isInternal) {
      setIsFastTransition(true);
      setLoadingMessage('Almost there...');
      
      // Clean up session flags
      setTimeout(() => {
        sessionStorage.removeItem('internalNavigation');
        sessionStorage.removeItem('fastTransition');
      }, 100);
    }
    
    // Simulate faster loading for internal navigation
    if (isFast) {
      document.body.classList.add('fast-transition');
      
      return () => {
        document.body.classList.remove('fast-transition');
      };
    }
  }, []);

  return (
    <div className={`${styles.pageLoader} ${isFastTransition ? styles.fastTransition : ''}`}>
      <div className={styles.loaderContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>{loadingMessage}</p>
      </div>
    </div>
  );
};

export default PageLoader;
