import React, { useState } from 'react';
import { clearServiceWorkerCache } from '../../pwaRegistration';
import { FaSync } from 'react-icons/fa';
import styles from './CacheBuster.module.css';

const CacheBuster = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState('');

  const handleClearCache = async () => {
    setIsClearing(true);
    setMessage('Clearing cache...');
    
    try {
      await clearServiceWorkerCache();
      setMessage('Cache cleared! Reloading...');
      
      // Force reload from server
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setMessage(`Failed to clear cache: ${error}`);
      setIsClearing(false);
    }
  };

  return (
    <div className={styles.cacheBuster}>
      <button 
        className={`${styles.clearButton} ${isClearing ? styles.clearing : ''}`}
        onClick={handleClearCache}
        disabled={isClearing}
        title="Clear cached data and reload"
      >
        <FaSync className={isClearing ? styles.rotating : ''} />
        <span>{isClearing ? 'Clearing...' : 'Force Refresh'}</span>
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default CacheBuster;
