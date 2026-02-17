import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  FaGraduationCap, FaUniversity, FaCalendarAlt, FaMapMarkerAlt,
  FaMedal, FaBook, FaAward, FaTimes, FaTrophy, FaUsers, FaSchool
} from 'react-icons/fa';
import styles from './Education.module.css';
import { educationData } from '../../../data/educationData'; // Import from data file

const honors = [
  {
    id: 'honor-1',
    title: "Dean's List (GPA 3.8+)",
    institution: "Anne Arundel Community College",
    year: "2023-2024",
    description: "Recognized for outstanding academic achievement and maintaining a GPA above 3.8 during the academic year.",
    icon: <FaTrophy />
  },
  {
    id: 'honor-2',
    title: "Technical Excellence Award",
    institution: "Center of Applied Technology North",
    year: "2020",
    description: "Awarded for exceptional performance and mastery in technical coursework and hands-on projects.",
    icon: <FaMedal />
  },
  {
    id: 'honor-3',
    title: "Principal's Award for Academic Excellence",
    institution: "Meade Senior High School",
    year: "2020",
    description: "Presented for consistent academic excellence and leadership throughout high school.",
    icon: <FaAward />
  }
];

// Helper function to detect low-performance devices
const isLowPerformanceDevice = () => {
  return (
    typeof window !== 'undefined' && (
      window.navigator.userAgent.indexOf('Mobile') !== -1 ||
      window.navigator.userAgent.indexOf('Android') !== -1 ||
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
      (window.navigator.hardwareConcurrency && window.navigator.hardwareConcurrency <= 4)
    )
  );
};

const Education = () => {
  // State management
  const lowPerformance = React.useMemo(() => isLowPerformanceDevice(), []);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [modalImageError, setModalImageError] = useState(false); // New state for modal image error
  const modalRef = useRef(null);

  // Intersection observer for animation triggers
  const { ref } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '150px 0px', // Start loading earlier
  });

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced modal handling
  const openSchoolModal = useCallback((school, e) => {
    if (e) e.stopPropagation();

    // Set school data
    setSelectedSchool(school);

    // Show modal
    setShowModal(true);
  }, []);

  // Close modal function
  const closeSchoolModal = useCallback(() => {
    // Hide modal first
    setShowModal(false);

    // Reset selected school
    setSelectedSchool(null);
  }, []);

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showModal) {
        closeSchoolModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, closeSchoolModal]);

  // Focus modal and scroll modal into view (20% from top)
  useEffect(() => {
    if (showModal && modalRef.current) {
      modalRef.current.focus();
      setTimeout(() => {
        const rect = modalRef.current.getBoundingClientRect();
        const modalTop = rect.top + window.scrollY;
        const offset = window.innerHeight * 0.20; // 20% from top
        window.scrollTo({
          top: modalTop - offset,
          behavior: 'smooth'
        });
      }, 0);
    }
  }, [showModal]);

  // Add this inside the Education component, before the return statement:
  useEffect(() => {
    // Special handling for Meade High School image which seems problematic
    const meadeSchool = educationData.find(s => s.id === 'meade');
    if (meadeSchool) {
      // Force load the image to check if it works
      const img = new Image();
      img.onload = () => {
        console.log(`Successfully loaded Meade image: ${img.src}`);
      };
      img.onerror = () => {
        console.error(`Failed to load Meade image: ${meadeSchool.image}`);
        console.log("Trying to load with direct path...");
        
        // Try the exact path as specified by the user
        const directPath = "/images/school/Meade-High-school.jpg";
        const directImg = new Image();
        directImg.onload = () => {
          console.log(`Successfully loaded with direct path: ${directPath}`);
          // Update the path in the educationData array
          educationData.find(s => s.id === 'meade').image = directPath;
          // Force a re-render
          setImageErrors({...imageErrors});
        };
        directImg.src = directPath;
      };
      img.src = meadeSchool.image;
    }
  }, []);

  const handleImageError = (schoolId) => {
    console.error(`Failed to load image for school: ${schoolId}`);
    
    // Special handling for Meade High School
    if (schoolId === 'meade') {
      const school = educationData.find(s => s.id === schoolId);
      if (school && school.imageFallbacks && school.imageFallbacks.length > 0) {
        // Try the first fallback
        console.log(`Trying fallback image for ${schoolId}: ${school.imageFallbacks[0]}`);
        school.image = school.imageFallbacks.shift();
        
        // Force re-render to try the new image
        setImageErrors({...imageErrors});
        return;
      }
    }
    
    // If no fallbacks or not Meade, mark as error
    setImageErrors(prev => ({
      ...prev,
      [schoolId]: true
    }));
  };

  // Add this function before the return statement
  const handleModalImageError = () => {
    console.error(`Failed to load modal image for: ${selectedSchool?.name}`);
    setModalImageError(true);
  };

  // Reset modal image error when opening a new modal
  useEffect(() => {
    if (showModal) {
      setModalImageError(false);
    }
  }, [showModal, selectedSchool]);

  return (
    <section ref={ref} className={styles.educationSection} id="education">
      <div className={styles.educationGlow}></div>

      <div className="container">
        <div
          className={styles.sectionHeader}
        >
          <h2 className={styles.sectionTitle}>Education & Training</h2>
          <div className={styles.titleDecoration}>
            <span className={styles.titleLine}></span>
            <span className={styles.titleDot}></span>
            <span className={styles.titleLine}></span>
          </div>
          <p className={styles.sectionSubtitle}>
            My academic journey and professional development path
          </p>
        </div>

        {/* Education Grid */}
        <div
          className={styles.educationGrid}
        >
          {educationData.map((school, index) => (
            <div
              key={school.id}
              className={styles.educationCard + " " + styles.educationCardEnhanced}
              style={{ '--card-color': school.color }}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardHeader}>
                  {/* Picture box for school image */}
                  <div className={styles.schoolImageContainer}>
                    {imageErrors[school.id] ? (
                      <div className={styles.schoolImageFallback}>
                        <FaSchool className={styles.fallbackIcon} />
                        <span className={styles.fallbackText}>{school.name.charAt(0)}</span>
                      </div>
                    ) : (
                      <img
                        src={school.image}
                        alt={school.name}
                        className={styles.schoolImage}
                        loading="lazy"
                        onError={() => handleImageError(school.id)}
                      />
                    )}
                    <div
                      className={styles.imageOverlay}
                      style={{
                        background: `linear-gradient(to bottom, transparent, ${school.color}dd)`
                      }}
                    ></div>
                  </div>

                  <div className={styles.schoolInfo}>
                    <h3 className={styles.schoolName}>{school.name}</h3>
                    <div className={styles.degreeWrapper}>
                      <FaUniversity className={styles.degreeIcon} />
                      <p className={styles.degree}>{school.degree}</p>
                    </div>

                    <div className={styles.metaInfo}>
                      <div className={styles.metaItem}>
                        <FaCalendarAlt className={styles.metaIcon} />
                        <span>{school.period}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <FaMapMarkerAlt className={styles.metaIcon} />
                        <span>{school.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.schoolDescription}>
                    {school.description}
                  </p>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.statusBadge}>
                    {school.status}
                  </span>
                  <button
                    className={styles.detailsButton}
                    onClick={(e) => openSchoolModal(school, e)}
                  >
                    View Detailed Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications & Honors Section */}
        <div className={styles.certificationsSection}>
          <h3 className={styles.certificationsTitle}>School Honors & Awards</h3>
          <div className={styles.certificationsGrid}>
            {honors.map(honor => (
              <div key={honor.id} className={styles.certCard}>
                <div className={styles.certIconBox}>
                  {honor.icon}
                </div>
                <div className={styles.certInfo}>
                  <div className={styles.certTitle}>{honor.title}</div>
                  <div className={styles.certIssuer}>{honor.institution}</div>
                  <div className={styles.certYear}>{honor.year}</div>
                  <div className={styles.certDescription}>{honor.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedSchool && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeSchoolModal}
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${selectedSchool.name}`}
            style={{
              zIndex: 2000, // ensure always above
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              ref={modalRef}
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 40 }}
              transition={{ duration: 0.22, type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{ '--modal-color': selectedSchool.color }}
              tabIndex="-1"
            >
              <button className={styles.closeModal} onClick={closeSchoolModal} aria-label="Close modal">
                <FaTimes />
              </button>

              <div className={styles.modalHeader} style={{
                backgroundImage: modalImageError || !selectedSchool.image
                  ? `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9))`
                  : `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url("${selectedSchool.image.replace(/ /g, '%20')}")`
              }}>
                {/* Hidden image loader to detect failures */}
                <img 
                  src={selectedSchool.image}
                  alt=""
                  style={{ display: 'none' }}
                  onError={handleModalImageError}
                />
                <div className={styles.headerContent}>
                  <div className={styles.schoolLogo}>
                    {modalImageError ? <FaSchool /> : <FaGraduationCap />}
                  </div>
                  <h2 className={styles.modalTitle}>{selectedSchool.name}</h2>
                  <div className={styles.modalStatus}>{selectedSchool.status}</div>
                </div>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Overview</h3>
                  <p>{selectedSchool.description}</p>
                </div>

                {selectedSchool.achievements && selectedSchool.achievements.length > 0 && (
                  <div className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}><FaMedal style={{marginRight: 8}}/>Achievements</h3>
                    <ul className={styles.modalList}>
                      {selectedSchool.achievements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedSchool.courses && (
                  <div className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}>Key Courses</h3>
                    <div className={styles.modalCourses}>
                      {selectedSchool.courses.map((course, i) => (
                        <div key={i} className={styles.modalCourseTag}>
                          {course}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedSchool.activities || selectedSchool.sports) && (
                  <div className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}>Extracurricular Activities</h3>
                    <ul className={styles.modalList}>
                      {selectedSchool.activities && selectedSchool.activities.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                      {selectedSchool.sports && selectedSchool.sports.map((item, i) => (
                        <li key={`sport-${i}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedSchool.projects && (
                  <div className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}>Notable Projects</h3>
                    <ul className={styles.modalList}>
                      {selectedSchool.projects.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Education;