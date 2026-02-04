import React from 'react';
import styles from './ContactInfo.module.css';

const ContactInfo = ({ icon, title, value, link, description }) => {
  return (
    <div className={styles.infoCard}>
      <div className={styles.iconContainer}>
        {icon}
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        
        {link ? (
          <a 
            href={link} 
            className={styles.cardValue} 
            target={link.startsWith('http') ? "_blank" : "_self"}
            rel={link.startsWith('http') ? "noopener noreferrer" : ""}
          >
            {value}
          </a>
        ) : (
          <p className={styles.cardValue}>{value}</p>
        )}
        
        <p className={styles.cardDescription}>{description}</p>
      </div>
    </div>
  );
};

export default ContactInfo;
