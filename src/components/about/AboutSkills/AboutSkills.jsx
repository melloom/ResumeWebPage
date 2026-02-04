import React from 'react';
import styles from './AboutSkills.module.css';

const AboutSkills = ({ categories }) => {
  return (
    <div className={styles.skillsContainer}>
      {categories.map((category, index) => (
        <div key={index} className={styles.skillCategory}>
          <h3 className={styles.categoryTitle}>{category.category}</h3>
          <div className={styles.skillsList}>
            {category.skills.map((skill, i) => (
              <div key={i} className={styles.skillItem}>
                <div className={styles.skillInfo}>
                  <span className={styles.skillName}>{skill.name}</span>
                  <span className={styles.skillLevel}>{skill.level}%</span>
                </div>
                <div className={styles.skillBarContainer}>
                  <div 
                    className={styles.skillBar}
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AboutSkills;
