import React, { useRef, useEffect } from 'react';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaMedal,
  FaCheckCircle, FaToolbox, FaTrophy,
  FaQuoteRight, FaChartLine, FaTimes
} from 'react-icons/fa';
import styles from './ExperienceModal.module.css';

const ExperienceModal = ({ isOpen, onClose, experienceItem }) => {
  const modalRef = useRef(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Lock body scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      // Unlock scrolling when component unmounts
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !experienceItem) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close details"
        >
          <FaTimes className={styles.closeIcon} />
        </button>

        <div className={styles.jobDetailContent}>
          <div
            className={styles.jobDetailHeader}
            style={{ background: experienceItem.color }}
          >
            <div className={styles.headerTextContent}>
              <h2 className={styles.jobDetailTitle}>{experienceItem.title}</h2>
              <div className={styles.jobDetailCompany}>{experienceItem.company}</div>
              <div className={styles.jobDetailMeta}>
                <div className={styles.jobDetailPeriod}>
                  <FaCalendarAlt />
                  <span>{experienceItem.period}</span>
                </div>
                <div className={styles.jobDetailLocation}>
                  <FaMapMarkerAlt />
                  <span>{experienceItem.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.jobDetailBody}>
            <div className={styles.jobOverview}>
              <h3 className={styles.detailSectionTitle}>Overview</h3>
              <p>{experienceItem.summary || experienceItem.description}</p>
            </div>

            {experienceItem.achievements && (
              <div className={styles.jobKeyAchievements}>
                <h3 className={styles.detailSectionTitle}>
                  <FaMedal className={styles.sectionIcon} />
                  Key Achievements
                </h3>
                <div className={styles.achievementsGrid}>
                  {experienceItem.achievements.map((achievement, i) => (
                    <div key={i} className={styles.achievementCard}>
                      <FaCheckCircle className={styles.achievementIcon} />
                      <div>{achievement}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {experienceItem.highlights && (
              <div className={styles.jobHighlight}>
                <h3 className={styles.detailSectionTitle}>
                  <FaTrophy className={styles.sectionIcon} />
                  Notable Highlight
                </h3>
                <div className={styles.highlightBox}>
                  <FaQuoteRight className={styles.quoteIcon} />
                  <p>{experienceItem.highlights}</p>
                </div>
              </div>
            )}

            {experienceItem.skills && (
              <div className={styles.jobSkills}>
                <h3 className={styles.detailSectionTitle}>
                  <FaToolbox className={styles.sectionIcon} />
                  Skills Applied
                </h3>
                <div className={styles.skillsGrid}>
                  {experienceItem.skills.map((skill, i) => (
                    <div key={i} className={styles.skillItem}>{skill}</div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.expertiseNote}>
              <FaChartLine className={styles.expertiseIcon} />
              <p>
                This experience demonstrates expertise in{" "}
                {experienceItem.relevance || "sales, business development, and professional relationship building"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceModal;
