import React from 'react';
import styles from './AboutHobbies.module.css';

const AboutHobbies = ({ hobbies }) => {
  return (
    <div className={styles.hobbiesContainer}>
      {hobbies.map((hobby, index) => (
        <div key={index} className={styles.hobbyCard}>
          <div className={styles.hobbyIconContainer}>
            {hobby.icon}
          </div>
          <div className={styles.hobbyContent}>
            <h3 className={styles.hobbyName}>{hobby.name}</h3>
            <p className={styles.hobbyDescription}>{hobby.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AboutHobbies;
