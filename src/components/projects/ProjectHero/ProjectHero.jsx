import React from 'react';
import { FaCode, FaLaptopCode, FaTools } from 'react-icons/fa';
import styles from './ProjectHero.module.css';

const ProjectHero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <FaCode className={styles.titleIcon} />
          <h1 className={styles.title}>Projects</h1>
        </div>
        <p className={styles.subtitle}>
          Building modern, scalable web applications with cutting-edge technologies
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <FaLaptopCode className={styles.featureIcon} />
            <span>Full-Stack Solutions</span>
          </div>
          <div className={styles.feature}>
            <FaTools className={styles.featureIcon} />
            <span>Modern Tech Stack</span>
          </div>
        </div>
      </div>
      <div className={styles.overlay}></div>
    </section>
  );
};

export default ProjectHero; 