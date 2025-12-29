import React from 'react';
import styles from './LoadingScreen.module.css';
// Import any necessary icons...

const LoadingScreen = ({ isLoading, progress, message = 'Loading...' }) => {
  if (!isLoading) return null;

  // Ensure progress is a valid number
  const progressValue = typeof progress === 'number' && !isNaN(progress) ? progress : 0;
  
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        <div className={styles.spinner}></div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
        <p className={styles.loadingMessage}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
