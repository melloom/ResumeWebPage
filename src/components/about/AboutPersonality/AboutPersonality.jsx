import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import styles from './AboutPersonality.module.css';

const AboutPersonality = ({ traits }) => {
  return (
    <div className={styles.personalityContainer}>
      {traits.map((trait, index) => (
        <div key={index} className={styles.traitCard}>
          <div className={styles.traitHeader}>
            <FaCheckCircle className={styles.traitIcon} />
            <h3 className={styles.traitName}>{trait.trait}</h3>
          </div>
          <p className={styles.traitDescription}>{trait.description}</p>
        </div>
      ))}
    </div>
  );
};

export default AboutPersonality;
