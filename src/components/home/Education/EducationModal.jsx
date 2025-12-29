import React, { useRef, useEffect, useState } from 'react';
import {
  FaGraduationCap, FaCalendarAlt, FaMapMarkerAlt,
  FaMedal, FaCertificate, FaBook, FaChalkboardTeacher,
  FaUsers, FaTimes
} from 'react-icons/fa';
import styles from './EducationModal.module.css';

const EducationModal = ({ isOpen, onClose, educationItem }) => {
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

  const [modalImageError, setModalImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleModalImageError = () => {
    console.error(`Failed to load modal image for: ${educationItem.name}`);
    setModalImageError(true);
  };

  useEffect(() => {
    if (educationItem) {
      setModalImageError(false);
      setImageLoaded(false);
    }
  }, [educationItem]);

  if (!isOpen || !educationItem) return null;

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

        <div className={styles.eduDetailContent}>
          <div 
            className={`${styles.eduDetailHeader} ${modalImageError ? styles.imageError : ''}`}
            style={{ 
              background: modalImageError 
                ? educationItem.color || '#2E3192' // Use the school color for fallback
                : `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url("${educationItem.image.replace(/ /g, '%20')}")`
            }}
          >
            {/* Hidden image loader to detect failures */}
            <img 
              src={educationItem.image}
              alt=""
              style={{ display: 'none' }}
              onError={handleModalImageError}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Make image more prominent */}
            <div className={styles.headerContentWrapper}>
              <div className={styles.headerTextContent}>
                <h2 className={styles.eduDetailTitle}>
                  {educationItem.degree}
                </h2>
                <div className={styles.eduDetailInstitution}>
                  {educationItem.name || educationItem.institution}
                </div>
                <div className={styles.eduDetailMeta}>
                  <div className={styles.eduDetailPeriod}>
                    <FaCalendarAlt />
                    <span>{educationItem.period}</span>
                  </div>
                  <div className={styles.eduDetailLocation}>
                    <FaMapMarkerAlt />
                    <span>{educationItem.location}</span>
                  </div>
                </div>
              </div>

              {/* Larger image */}
              {educationItem.image && (
                <div className={styles.modalImageContainer}>
                  <img
                    src={educationItem.image}
                    alt={`${educationItem.name || educationItem.institution}`}
                    className={styles.modalSchoolImage}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.eduDetailBody}>
            <div className={styles.eduOverview}>
              <h3 className={styles.detailSectionTitle}>Overview</h3>
              <p>{educationItem.summary || educationItem.description}</p>
            </div>

            {educationItem.achievements && (
              <div className={styles.eduAchievements}>
                <h3 className={styles.detailSectionTitle}>
                  <FaMedal className={styles.sectionIcon} />
                  Achievements
                </h3>
                <div className={styles.achievementsGrid}>
                  {educationItem.achievements.map((achievement, i) => (
                    <div key={i} className={styles.achievementCard}>
                      <FaCertificate className={styles.achievementIcon} />
                      <div>{achievement}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(educationItem.highlights || educationItem.projects) && (
              <div className={styles.eduHighlight}>
                <h3 className={styles.detailSectionTitle}>
                  <FaGraduationCap className={styles.sectionIcon} />
                  {educationItem.projects ? "Key Projects" : "Key Highlight"}
                </h3>
                <div className={styles.highlightBox}>
                  {educationItem.highlights && <p>{educationItem.highlights}</p>}
                  {educationItem.projects && (
                    <div className={styles.achievementsGrid}>
                      {educationItem.projects.map((project, i) => (
                        <div key={i} className={styles.achievementCard}>
                          <FaCertificate className={styles.achievementIcon} />
                          <div>{project}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {educationItem.courses && (
              <div className={styles.eduCourses}>
                <h3 className={styles.detailSectionTitle}>
                  <FaBook className={styles.sectionIcon} />
                  Key Courses
                </h3>
                <div className={styles.coursesGrid}>
                  {educationItem.courses.map((course, i) => (
                    <div key={i} className={styles.courseItem}>{course}</div>
                  ))}
                </div>
              </div>
            )}

            {educationItem.activities && (
              <div className={styles.eduAchievements}>
                <h3 className={styles.detailSectionTitle}>
                  <FaUsers className={styles.sectionIcon} />
                  Activities
                </h3>
                <div className={styles.achievementsGrid}>
                  {educationItem.activities.map((activity, i) => (
                    <div key={i} className={styles.achievementCard}>
                      <FaCertificate className={styles.achievementIcon} />
                      <div>{activity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.expertiseNote}>
              <FaChalkboardTeacher className={styles.expertiseIcon} />
              <p>
                This education demonstrates expertise in{" "}
                {educationItem.relevance || educationItem.status || "education, training, and professional development"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationModal;
