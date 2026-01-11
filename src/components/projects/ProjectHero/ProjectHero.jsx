import React from 'react';
import { FaCode, FaLaptopCode, FaTools } from 'react-icons/fa';
import styles from './ProjectHero.module.css';

const ProjectHero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.eyebrow}>Featured work</span>
        <div className={styles.titleContainer}>
          <FaCode className={styles.titleIcon} />
          <h1 className={styles.title}>Projects</h1>
        </div>
        <p className={styles.subtitle}>
          Building modern, scalable web applications with cutting-edge technologies
        </p>
        <div className={styles.featureGrid}>
          <div className={`${styles.feature} ${styles.primaryFeature}`}>
            <FaLaptopCode className={styles.featureIcon} />
            <div>
              <span className={styles.featureLabel}>Full-Stack Solutions</span>
              <p className={styles.featureDesc}>Shipping polished products from idea to production.</p>
            </div>
          </div>
          <div className={styles.feature}>
            <FaTools className={styles.featureIcon} />
            <div>
              <span className={styles.featureLabel}>Modern Tech Stack</span>
              <p className={styles.featureDesc}>React, Next.js, TypeScript, cloud-first deployments.</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.overlay}></div>
    </section>
  );
};

export default ProjectHero; 