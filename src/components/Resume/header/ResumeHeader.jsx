import React from 'react';
import { FaDownload, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaUserTie } from 'react-icons/fa';
import styles from './ResumeHeader.module.css';

const ResumeHeader = () => {
  return (
    <div className={styles.resumeHeader}>
      <div className={styles.headerBackground}></div>

      <div className={styles.headerContainer}>
        <div className={styles.nameSection}>
          <h1 className={styles.name}>Melvin Peralta</h1>
          <div className={styles.titleContainer}>
            <div className={styles.professionalTag}>
              <FaUserTie className={styles.tagIcon} />
              <span>Sales & Business Development Professional</span>
            </div>
            <div className={styles.professionalTagSecondary}>
              <span>Frontend Developer</span>
            </div>
          </div>
          <p className={styles.headerBio}>
            Results-driven professional combining expertise in sales strategy, team leadership,
            and client relationship management with emerging skills in web development.
          </p>
        </div>

        <div className={styles.contactSection}>
          <div className={styles.contactGrid}>
            <a href="mailto:Melvin.a.p.cruz@gmail.com" className={styles.contactItem}>
              <FaEnvelope className={styles.contactIcon} />
              <span>Melvin.a.p.cruz@gmail.com</span>
            </a>

            <a href="tel:6672009784" className={styles.contactItem}>
              <FaPhone className={styles.contactIcon} />
              <span>(667) 200-9784</span>
            </a>

            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <span>Maryland, USA</span>
            </div>

            <a
              href="https://www.linkedin.com/in/melvin-peralta-de-la-cruz-077557215"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactItem}
            >
              <FaLinkedin className={styles.contactIcon} />
              <span>LinkedIn Profile</span>
            </a>

            <a
              href="https://github.com/melloom"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactItem}
            >
              <FaGithub className={styles.contactIcon} />
              <span>GitHub Profile</span>
            </a>
          </div>

          <a
            href="/images/school/Resume/Resume.pdf"
              download="Melvin_Peralta_Resume_UPDATED_optimized.pdf"
            className={styles.downloadButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaDownload className={styles.downloadIcon} /> Download Resume PDF
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResumeHeader;
