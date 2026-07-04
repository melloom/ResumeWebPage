import React from 'react';
import { FaQuoteLeft, FaTrophy, FaChartLine, FaUsers, FaComment } from 'react-icons/fa';
import styles from './ProfessionalSummary.module.css';

const ProfessionalSummary = () => {
  return (
    <section className={styles.summarySection}>
      <div className={styles.decorativeElement}></div>
      <h2 className={styles.sectionTitle}>
        <span className={styles.titleIcon}><FaQuoteLeft /></span>
        Professional Summary
      </h2>
      
      <div className={styles.summaryContent}>
        <div className={styles.summaryTextContainer}>
          <div className={styles.summaryText}>
            <p className={styles.leadText}>
              Results-driven <span className={styles.accentText}>Sales & Web Development Professional</span> with a proven 
              track record of generating over <span className={styles.highlight}>$2 million in revenue</span> through 
              strategic client engagement. Skilled in building strong client relationships and 
              implementing effective lead generation strategies while transitioning into 
              modern web development with <span className={styles.highlight}>React</span>.
            </p>
            <p>
              Experienced in team leadership, having successfully supervised and mentored 
              a team of <span className={styles.highlight}>8 representatives</span> while optimizing outbound 
              campaigns and streamlining sales processes. Proficient in using CRM systems 
              to track performance metrics and make data-driven decisions that enhance both 
              client satisfaction and business outcomes.
            </p>
          </div>
          
          <div className={styles.focusAreas}>
            <h3 className={styles.focusTitle}>Areas of Expertise</h3>
            <div className={styles.focusGrid}>
              <div className={styles.focusItem}>
                <div className={styles.focusIconWrapper}>
                  <FaChartLine className={styles.focusIcon} />
                </div>
                <span>Revenue Generation</span>
              </div>
              <div className={styles.focusItem}>
                <div className={styles.focusIconWrapper}>
                  <FaUsers className={styles.focusIcon} />
                </div>
                <span>Team Leadership</span>
              </div>
              <div className={styles.focusItem}>
                <div className={styles.focusIconWrapper}>
                  <FaComment className={styles.focusIcon} />
                </div>
                <span>Client Relationship</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.highlightsBox}>
          <div className={styles.highlightTitle}>
            <FaTrophy className={styles.highlightIcon} />
            <h3>Key Achievements</h3>
          </div>
          <ul className={styles.highlightsList}>
            <li>
              <span className={styles.achievementMetric}>$2M+</span>
              <span className={styles.achievementDesc}>Revenue generated through strategic client engagement</span>
            </li>
            <li>
              <span className={styles.achievementMetric}>Promoted</span>
              <span className={styles.achievementDesc}>From contact agent to confirmer at Long Home Products</span>
            </li>
            <li>
              <span className={styles.achievementMetric}>25%</span>
              <span className={styles.achievementDesc}>Above-average conversion rate for 8-person texting team</span>
            </li>
            <li>
              <span className={styles.achievementMetric}>2024</span>
              <span className={styles.achievementDesc}>Started web development journey with React and modern JS</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalSummary;
