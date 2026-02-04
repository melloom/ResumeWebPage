import React from 'react';
import styles from './PageTransition.module.css';

const PageTransition = ({ children }) => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
};

export default PageTransition; 