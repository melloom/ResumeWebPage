import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Melvin Peralta</title>
        <meta name="description" content="The page you are looking for cannot be found." />
      </Helmet>
      
      <div className={styles.notFoundContainer}>
        <div className={styles.content}>
          <h1 className={styles.errorCode}>404</h1>
          <h2 className={styles.errorTitle}>Page Not Found</h2>
          <p className={styles.errorMessage}>
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          
          <div className={styles.buttonContainer}>
            <Link to="/" className={styles.primaryButton}>
              <FaHome className={styles.buttonIcon} />
              Return to Home
            </Link>
            
            <button 
              onClick={() => window.history.back()} 
              className={styles.secondaryButton}
            >
              <FaArrowLeft className={styles.buttonIcon} />
              Go Back
            </button>
          </div>
        </div>
        
        <div className={styles.decoration}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
        </div>
      </div>
    </>
  );
};

export default NotFound;