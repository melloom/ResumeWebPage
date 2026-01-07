import React from 'react';
import { FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, FaChevronRight, FaBuilding, FaAward, FaHandsHelping, FaCoffee } from 'react-icons/fa';
import { experienceData } from '../../../data/experienceData';
import styles from './ResumeExperience.module.css';

const ResumeExperience = () => {
  // Function to get appropriate icon based on job type
  const getJobIcon = (jobId) => {
    switch (jobId) {
      case 'community-volunteer':
        return <FaHandsHelping />;
      case 'dunkin':
      case 'cinnabon':
        return <FaCoffee />;
      default:
        return <FaBuilding />;
    }
  };

  // Function to determine timeline badge color class
  const getTimelineBadgeClass = (index) => {
    const classNames = [
      styles.timelineBadgePrimary,
      styles.timelineBadgeSuccess,
      styles.timelineBadgeInfo,
      styles.timelineBadgeWarning,
      styles.timelineBadgeDanger,
      styles.timelineBadgeSecondary
    ];
    return classNames[index % classNames.length];
  };

  return (
    <section className={styles.experienceSection}>
      <div className={styles.backgroundDecoration}></div>
      
      <h2 className={styles.sectionTitle}>
        <span className={styles.titleIcon}><FaBriefcase /></span>
        Professional Experience
      </h2>
      
      <div className={styles.timelineContainer}>
        <div className={styles.timelineCentral}></div>
        
        {experienceData.map((job, index) => (
          <div 
            className={`${styles.timelineItem} ${index % 2 === 0 ? styles.timelineLeft : styles.timelineRight}`} 
            key={job.id}
          >
            <div className={styles.timelineContent}>
              <div className={styles.timelineDate}>
                <FaCalendarAlt className={styles.dateIcon} />
                <span>{job.period}</span>
              </div>
              
              <div className={styles.timelineBody}>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <div className={styles.companyInfo}>
                  <div className={styles.companyName}>{job.company}</div>
                  <div className={styles.jobLocation}>
                    <FaMapMarkerAlt />
                    <span>{job.location}</span>
                  </div>
                </div>
                
                <div className={styles.jobDescription}>
                  <p>{job.description}</p>
                </div>
                
                <div className={styles.keyAchievements}>
                  <h4>
                    <FaAward className={styles.achievementIcon} />
                    Key Achievements
                  </h4>
                  <ul>
                    {job.achievements?.slice(0, 3).map((achievement, i) => (
                      <li key={i}>
                        <FaChevronRight className={styles.bulletIcon} />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={styles.skillTags}>
                  {job.skills?.slice(0, 5).map((skill, i) => (
                    <span key={i} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={`${styles.timelineBadge} ${getTimelineBadgeClass(index)}`}>
              {getJobIcon(job.id)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeExperience;
