import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import styles from './AboutInterests.module.css';

const AboutInterests = ({ interests }) => {
  return (
    <div className={styles.interestsContainer}>
      {interests.map((interest, index) => (
        <div key={index} className={styles.interestItem}>
          <FaCheckCircle className={styles.interestIcon} />
          <span>{interest}</span>
        </div>
      ))}
    </div>
  );
};

export default AboutInterests;
