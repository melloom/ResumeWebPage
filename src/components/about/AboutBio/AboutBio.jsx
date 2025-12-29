import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';
import styles from './AboutBio.module.css';

const AboutBio = ({ sections }) => {
  return (
    <div className={styles.bioContainer}>
      <div className={styles.personalIntro}>
        <div className={styles.bioImageContainer}>
          <img 
            src="/about-me-pic.jpeg" 
            alt="Melvin Peralta" 
            className={styles.bioImage}
          />
          <div className={styles.imageDecoration}></div>
        </div>
        
        <div className={styles.bioQuote}>
          <FaQuoteLeft className={styles.quoteIcon} />
          <blockquote>
            I believe in building strong relationships through genuine connection and understanding. 
            My approach combines strategic business thinking with the technical skills needed to 
            succeed in today's digital landscape.
          </blockquote>
          <div className={styles.quoteName}>— Melvin Peralta</div>
        </div>
      </div>
      
      <div className={styles.bioSectionGrid}>
        {sections.map((section, index) => (
          <div key={index} className={styles.bioSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.iconContainer}>{section.icon}</div>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
            </div>
            <div className={styles.sectionContent}>
              <p>{section.content}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.personalPhilosophy}>
        <h3 className={styles.philosophyTitle}>My Personal Philosophy</h3>
        <p className={styles.philosophyText}>
          Success comes from a combination of preparation, perseverance, and the ability to build 
          meaningful connections. I strive to merge my sales expertise with growing technical skills, 
          creating value at the intersection of business development and technology implementation.
        </p>
        <p className={styles.philosophyText}>
          Whether I'm developing client relationships or coding new features, I approach each task 
          with dedication, attention to detail, and a commitment to continuous improvement.
        </p>
      </div>
    </div>
  );
};

export default AboutBio;
