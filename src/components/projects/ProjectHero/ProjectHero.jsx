import React from 'react';
import { FaCode, FaLaptopCode, FaTools } from 'react-icons/fa';
import styles from './ProjectHero.module.css';

const ProjectHero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <FaCode className={styles.titleIcon} />
          <h1 className={styles.title}>My Projects</h1>
        </div>
        <p className={styles.subtitle}>
          Explore my portfolio of web development projects, showcasing my skills and experience in building modern web applications
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <FaLaptopCode className={styles.featureIcon} />
            <span>Modern Web Apps</span>
          </div>
          <div className={styles.feature}>
            <FaTools className={styles.featureIcon} />
            <span>Full-Stack Development</span>
          </div>
        </div>
      </div>
      <div className={styles.overlay}></div>
    </section>
  );
};

export default ProjectHero; 