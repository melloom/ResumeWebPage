import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaFileAlt, FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';
import styles from './Hero.module.css';

const Hero = ({ name, profileImage, jobTitles = [], onNavigationIntent }) => {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  // Modified introduction text to be more flexible and not limit to a single role
  const introPrefix = "Specializing in";

  useEffect(() => {
    let timeout;
    
    // Handle typing effect
    const handleTyping = () => {
      const currentTitle = jobTitles[currentTitleIndex];
      const shouldComplete = !isDeleting && displayText === currentTitle;
      const shouldDelete = isDeleting && displayText === '';
      
      // If completed typing, pause before deleting
      if (shouldComplete) {
        timeout = setTimeout(() => setIsDeleting(true), 1500);
        return;
      }
      
      // If finished deleting, move to next title
      if (shouldDelete) {
        setIsDeleting(false);
        setCurrentTitleIndex((prev) => (prev + 1) % jobTitles.length);
        return;
      }
      
      // Set typing speeds
      const speed = isDeleting 
        ? typingSpeed / 2 // Delete faster
        : typingSpeed;
      
      // Update display text
      setDisplayText(prev => {
        if (isDeleting) {
          return prev.substring(0, prev.length - 1);
        } else {
          return currentTitle.substring(0, prev.length + 1);
        }
      });
      
      // Schedule next update
      timeout = setTimeout(handleTyping, speed);
    };
    
    timeout = setTimeout(handleTyping, typingSpeed);
    
    return () => clearTimeout(timeout);
  }, [currentTitleIndex, displayText, isDeleting, jobTitles, typingSpeed]);

  return (
    <div className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <div className={styles.hero}>
          <div className={styles.heroBackground}></div>
          
          <div className={styles.content}>
            <div className={styles.text}>
              <h1 className={styles.title}>{name}</h1>
              
              <div className={styles.jobTitleAnimation}>
                <span className={styles.staticPrefix}>{introPrefix}</span>
                <div className={styles.titleContainer}>
                  <span className={styles.jobTitle}>{displayText}</span>
                  <span className={`${styles.cursor} ${styles.blink}`}></span>
                </div>
              </div>
              
              <p className={styles.description}>
                Versatile professional with expertise across multiple domains. Combining technical knowledge with excellent communication skills to deliver exceptional results in any role.
              </p>
              
              {/* Mobile only image */}
              <div className={`${styles.image} ${styles.mobileOnlyImage}`}>
                <div className={styles.imageFrame}>
                  <img
                    src={profileImage}
                    alt={name}
                    className={styles.staticProfileImage}
                  />
                </div>
              </div>
              
              <div className={styles.cta}>
                <div className={styles.buttonsContainer}>
                  <div className={styles.navigationButtons}>
                    <Link 
                      to="/resume" 
                      className={styles.navButton}
                      onMouseEnter={() => onNavigationIntent?.('/resume')}
                    >
                      <FaFileAlt /> Resume
                    </Link>
                    <Link 
                      to="/contact" 
                      className={styles.navButton}
                      onMouseEnter={() => onNavigationIntent?.('/contact')}
                    >
                      <FaEnvelope /> Contact
                    </Link>
                  </div>
                  
                  <div className={styles.socialLinks}>
                    <a 
                      href="https://github.com/melloom" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.socialLink}
                    >
                      <FaGithub /> GitHub
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/melvin-peralta-de-la-cruz-077557215" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.socialLink}
                    >
                      <FaLinkedin /> LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop only image */}
            <div className={`${styles.image} ${styles.desktopOnlyImage}`}>
              <div className={styles.imageFrame}>
                <img
                  src={profileImage}
                  alt={name}
                  className={styles.staticProfileImage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;