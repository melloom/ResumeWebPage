import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaAnchor,
  FaShieldAlt,
  FaStar,
  FaIdBadge,
  FaFlag,
  FaChevronRight
} from 'react-icons/fa';
import styles from './MilitaryService.module.css';

const STORAGE_KEY = 'navy_military_service_data';

const DEFAULT_MILITARY_DATA = {
  branch: 'United States Navy',
  rating: 'MA',
  ratingTitle: 'Master-at-Arms',
  rank: 'E-3',
  rankTitle: 'Seaman',
  status: 'Active Duty',
};

const MilitaryService = () => {
  const [militaryData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_MILITARY_DATA, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_MILITARY_DATA;
      }
    }
    return DEFAULT_MILITARY_DATA;
  });

  return (
    <section className={styles.militarySection}>
      <div className={styles.navyWatermark}></div>
      <div className={styles.navyStripe}></div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.titleIcon}><FaAnchor /></span>
          Military Service
        </h2>
      </div>

      <div className={styles.branchBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerEmblem}>
            <FaAnchor className={styles.emblemIcon} />
          </div>
          <div className={styles.bannerText}>
            <h3 className={styles.branchName}>{militaryData.branch}</h3>
            <p className={styles.branchMotto}>"Non Sibi Sed Patriae" — Not for Self, but for Country</p>
          </div>
          <div className={styles.bannerFlag}>
            <FaFlag className={styles.flagIcon} />
          </div>
        </div>
      </div>

      <div className={styles.serviceGrid}>
        <div className={styles.ratingCard}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardLabel}>
            <FaIdBadge className={styles.cardLabelIcon} />
            Rating
          </div>
          <div className={styles.ratingBadge}>
            <span className={styles.ratingCode}>{militaryData.rating}</span>
          </div>
          <div className={styles.ratingTitle}>{militaryData.ratingTitle}</div>
        </div>

        <div className={styles.rankCard}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardLabel}>
            <FaStar className={styles.cardLabelIcon} />
            Pay Grade / Rank
          </div>
          <div className={styles.rankBadge}>
            <span className={styles.rankGrade}>{militaryData.rank}</span>
          </div>
          <div className={styles.rankTitle}>{militaryData.rankTitle}</div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardLabel}>
            <FaShieldAlt className={styles.cardLabelIcon} />
            Status
          </div>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot}></span>
            {militaryData.status}
          </div>
        </div>
      </div>

      <div className={styles.coreValuesBar}>
        {['Honor', 'Courage', 'Commitment'].map((value, index) => (
          <div key={index} className={styles.coreValue}>
            <FaStar className={styles.coreValueStar} />
            <span>{value}</span>
          </div>
        ))}
      </div>

      <motion.div
        className={styles.viewFullPage}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Link to="/navy" className={styles.viewFullLink}>
          View Full Navy Service Page <FaChevronRight />
        </Link>
      </motion.div>
    </section>
  );
};

export default MilitaryService;
