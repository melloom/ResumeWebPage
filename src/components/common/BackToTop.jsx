import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './BackToTop.module.css';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={styles.backToTop}
          aria-label="Back to top"
        >
          <FaArrowUp />
        </button>
      )}
    </>
  );
};

export default BackToTop;
