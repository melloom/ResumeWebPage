import React from 'react';
import styles from './AboutValues.module.css';

const AboutValues = ({ values }) => {
  return (
    <div className={styles.valuesContainer}>
      {values.map((value, index) => (
        <div key={index} className={styles.valueCard}>
          <div className={styles.valueIcon}>
            {value.icon}
          </div>
          <h3 className={styles.valueTitle}>{value.title}</h3>
          <p className={styles.valueDescription}>{value.description}</p>
        </div>
      ))}
    </div>
  );
};

export default AboutValues;
