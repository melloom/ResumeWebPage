import React from 'react';
import styles from './AboutTimeline.module.css';

const AboutTimeline = ({ events }) => {
  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineTrack}></div>
      
      {events.map((event, index) => (
        <div 
          key={index} 
          className={`${styles.timelineItem} ${
            index % 2 === 0 ? styles.timelineLeft : styles.timelineRight
          }`}
        >
          <div className={styles.timelineDot}></div>
          <div className={styles.timelineContent}>
            <div className={styles.yearBadge}>{event.year}</div>
            <h3 className={styles.eventTitle}>{event.title}</h3>
            <p className={styles.eventDescription}>{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AboutTimeline;
