import React from 'react';
import { FaUserTie, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './AboutHero.module.css';

const AboutHero = () => {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            The Person <span className={styles.gradient}>Behind The Resume</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            Get to know me beyond my professional achievements. I'm passionate about connecting with people,
            solving complex problems, and continuously growing both personally and professionally.
          </p>
          
          <div className={styles.heroCta}>
            <Link to="/resume" className={styles.ctaButton}>
              <FaUserTie className={styles.ctaIcon} />
              View My Resume
              <FaArrowRight className={styles.arrowIcon} />
            </Link>
          </div>
        </div>
        
        <div className={styles.heroImage}>
          <div className={styles.imageContainer}>
            <img 
              src="/about-me-pic.jpeg" 
              alt="Melvin Peralta - About Me"
              onError={(e) => {
                console.error("Failed to load profile image");
                e.target.src = "https://via.placeholder.com/500x400?text=About+Me";
              }}
            />
          </div>
          <div className={styles.decorCircle1}></div>
          <div className={styles.decorCircle2}></div>
        </div>
      </div>
    </div>
  );
};

export default AboutHero;
