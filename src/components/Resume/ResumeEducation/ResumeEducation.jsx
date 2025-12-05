import React, { useState, useEffect } from 'react';
import { 
  FaGraduationCap, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaCertificate,
  FaBook,
  FaMedal,
  FaUniversity,
  FaClipboardCheck,
  FaSchool
} from 'react-icons/fa';
import { educationData } from '../../../data/educationData';
import styles from './ResumeEducation.module.css';

const ResumeEducation = () => {
  // Track image loading errors
  const [imageErrors, setImageErrors] = useState({});
  
  // Attempt different image paths for schools with errors
  useEffect(() => {
    Object.keys(imageErrors).forEach(schoolId => {
      if (imageErrors[schoolId]) {
        console.log(`Trying alternative image paths for: ${schoolId}`);
        
        const school = educationData.find(s => s.id === schoolId);
        if (school) {
          // Array of possible alternative paths to try
          const altPaths = [
            school.image.replace(' ', '-'), // Replace spaces with hyphens
            school.image.replace(' ', '_'), // Replace spaces with underscores
            school.image.toLowerCase(), // Try lowercase version
            `/images/school/${schoolId}.jpg`, // Try id-based filename
            `/images/school/${school.name.replace(/\s+/g, '-').toLowerCase()}.jpg` // Try name-based filename
          ];
          
          // Try loading each alternative path
          const img = new Image();
          let altIndex = 0;
          
          const tryNextAlt = () => {
            if (altIndex < altPaths.length) {
              img.src = altPaths[altIndex];
              console.log(`Trying alternative path: ${altPaths[altIndex]}`);
              altIndex++;
            }
          };
          
          img.onload = () => {
            console.log(`Successfully loaded: ${img.src}`);
            // Update the image in the data
            educationData.find(s => s.id === schoolId).image = img.src;
            // Clear the error
            setImageErrors(prev => ({...prev, [schoolId]: false}));
          };
          
          img.onerror = tryNextAlt;
          
          // Start trying alternative paths
          tryNextAlt();
        }
      }
    });
  }, [imageErrors]);
  
  // Add this at the beginning of the component, after the useState:
  useEffect(() => {
    // Specifically fix the Meade high school image
    const meadeSchool = educationData.find(s => s.id === 'meade');
    if (meadeSchool) {
      console.log("Attempting to preload Meade High School image:", meadeSchool.image);
      // Try the image path
      const img = new Image();
      img.onload = () => {
        console.log("Meade image loaded successfully!");
      };
      img.onerror = () => {
        console.error("Failed to load Meade image, trying direct path");
        // Try the direct path with exact casing and spacing
        const directPath = "/images/school/Meade-High-school.jpg";
        meadeSchool.image = directPath;
        // Force a re-render
        setImageErrors({...imageErrors});
      };
      img.src = meadeSchool.image;
    }
  }, []);
  
  // Update the handleImageError function:
  const handleImageError = (schoolId) => {
    console.error(`Failed to load image for school: ${schoolId}`);
    
    const school = educationData.find(s => s.id === schoolId);
    
    // Try fallbacks for Meade high school
    if (schoolId === 'meade') {
              if (school.image !== "/images/school/Meade-High-school.jpg") {
        console.log("Trying exact file path for Meade");
                  school.image = "/images/school/Meade-High-school.jpg";
        // Force re-render without setting error
        setImageErrors({...imageErrors});
        return;
      }
    }
    
    // If we get here, all attempts failed
    setImageErrors(prev => ({
      ...prev,
      [schoolId]: true
    }));
  };

  return (
    <section className={styles.educationSection}>
      <div className={styles.sectionBackground}></div>
      
      <h2 className={styles.sectionTitle}>
        <span className={styles.titleIcon}><FaGraduationCap /></span>
        Education
      </h2>
      
      <div className={styles.educationCards}>
        {educationData.map((school) => (
          <div className={styles.educationCard} key={school.id}>
            <div 
              className={styles.cardHeader} 
              style={{ 
                backgroundImage: imageErrors[school.id] 
                  ? `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9))` 
                  : `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url("${school.image.replace(/ /g, '%20')}")`
              }}
            >
              <div 
                className={styles.schoolBadge} 
                style={{ backgroundColor: school.color || '#6366f1' }}
              >
                {imageErrors[school.id] ? (
                  <FaSchool />
                ) : (
                  <FaUniversity />
                )}
              </div>
              <div className={styles.headerContent}>
                <h3 className={styles.schoolName}>{school.name}</h3>
                <div 
                  className={styles.schoolStatus} 
                  style={{ backgroundColor: school.color || '#6366f1' }}
                >
                  {school.status}
                </div>
              </div>
              
              {/* Hidden image loader to detect failures */}
              <img 
                src={school.image}
                alt=""
                style={{ display: 'none' }}
                onError={() => handleImageError(school.id)}
              />
            </div>
            
            <div className={styles.cardBody}>
              <div className={styles.degreeInfo}>
                <h4 className={styles.degree}>{school.degree}</h4>
                <div className={styles.schoolMeta}>
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
              
              <div className={styles.schoolDescription}>
                <p>{school.description}</p>
              </div>
              
              {school.achievements && school.achievements.length > 0 && (
                <div className={styles.achievementsSection}>
                  <h5 className={styles.sectionLabel}>
                    <FaMedal className={styles.sectionIcon} />
                    Key Achievements
                  </h5>
                  <ul className={styles.achievementsList}>
                    {school.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {school.courses && school.courses.length > 0 && (
                <div className={styles.coursesSection}>
                  <h5 className={styles.sectionLabel}>
                    <FaBook className={styles.sectionIcon} />
                    Notable Courses
                  </h5>
                  <div className={styles.coursesList}>
                    {school.courses.map((course, i) => (
                      <div key={i} className={styles.courseItem}>
                        <FaClipboardCheck className={styles.courseIcon} />
                        <span>{course}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeEducation;
