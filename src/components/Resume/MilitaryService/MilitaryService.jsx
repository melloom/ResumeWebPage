import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaAnchor,
  FaShieldAlt,
  FaStar,
  FaMedal,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaTimes,
  FaCheck,
  FaChevronRight,
  FaIdBadge,
  FaFlag
} from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import styles from './MilitaryService.module.css';

const NAVY_RATINGS = [
  { code: 'ABE', title: 'Aviation Boatswain\'s Mate (Launch/Recovery)' },
  { code: 'ABF', title: 'Aviation Boatswain\'s Mate (Fuels)' },
  { code: 'ABH', title: 'Aviation Boatswain\'s Mate (Handling)' },
  { code: 'AC', title: 'Air Traffic Controller' },
  { code: 'AD', title: 'Aviation Machinist\'s Mate' },
  { code: 'AG', title: 'Aerographer\'s Mate' },
  { code: 'AM', title: 'Aviation Structural Mechanic' },
  { code: 'AO', title: 'Aviation Ordnanceman' },
  { code: 'AS', title: 'Aviation Support Equipment Technician' },
  { code: 'AT', title: 'Aviation Electronics Technician' },
  { code: 'AW', title: 'Naval Aircrewman' },
  { code: 'AZ', title: 'Aviation Maintenance Administrationman' },
  { code: 'BM', title: 'Boatswain\'s Mate' },
  { code: 'BU', title: 'Builder' },
  { code: 'CE', title: 'Construction Electrician' },
  { code: 'CM', title: 'Construction Mechanic' },
  { code: 'CS', title: 'Culinary Specialist' },
  { code: 'CTI', title: 'Cryptologic Technician (Interpretive)' },
  { code: 'CTM', title: 'Cryptologic Technician (Maintenance)' },
  { code: 'CTN', title: 'Cryptologic Technician (Networks)' },
  { code: 'CTR', title: 'Cryptologic Technician (Collection)' },
  { code: 'CTT', title: 'Cryptologic Technician (Technical)' },
  { code: 'DC', title: 'Damage Controlman' },
  { code: 'EA', title: 'Engineering Aid' },
  { code: 'EM', title: 'Electrician\'s Mate' },
  { code: 'EN', title: 'Engineman' },
  { code: 'EO', title: 'Equipment Operator' },
  { code: 'EOD', title: 'Explosive Ordnance Disposal Technician' },
  { code: 'ET', title: 'Electronics Technician' },
  { code: 'FC', title: 'Fire Controlman' },
  { code: 'FT', title: 'Fire Control Technician' },
  { code: 'GM', title: 'Gunner\'s Mate' },
  { code: 'GS', title: 'Gas Turbine Systems Technician' },
  { code: 'HM', title: 'Hospital Corpsman' },
  { code: 'HT', title: 'Hull Maintenance Technician' },
  { code: 'IC', title: 'Interior Communications Electrician' },
  { code: 'IS', title: 'Intelligence Specialist' },
  { code: 'IT', title: 'Information Systems Technician' },
  { code: 'LN', title: 'Legalman' },
  { code: 'LS', title: 'Logistics Specialist' },
  { code: 'MA', title: 'Master-at-Arms' },
  { code: 'MC', title: 'Mass Communication Specialist' },
  { code: 'MM', title: 'Machinist\'s Mate' },
  { code: 'MN', title: 'Mineman' },
  { code: 'MR', title: 'Machinery Repairman' },
  { code: 'MT', title: 'Missile Technician' },
  { code: 'MU', title: 'Musician' },
  { code: 'ND', title: 'Navy Diver' },
  { code: 'OS', title: 'Operations Specialist' },
  { code: 'PS', title: 'Personnel Specialist' },
  { code: 'QM', title: 'Quartermaster' },
  { code: 'RP', title: 'Religious Program Specialist' },
  { code: 'RS', title: 'Retail Services Specialist' },
  { code: 'SB', title: 'Special Warfare Boat Operator' },
  { code: 'SH', title: 'Ship\'s Serviceman' },
  { code: 'SO', title: 'Special Warfare Operator' },
  { code: 'STG', title: 'Sonar Technician (Surface)' },
  { code: 'STS', title: 'Sonar Technician (Submarine)' },
  { code: 'SW', title: 'Steelworker' },
  { code: 'UT', title: 'Utilitiesman' },
  { code: 'YN', title: 'Yeoman' }
];

const NAVY_RANKS = [
  { grade: 'E-1', title: 'Seaman Recruit', abbr: 'SR' },
  { grade: 'E-2', title: 'Seaman Apprentice', abbr: 'SA' },
  { grade: 'E-3', title: 'Seaman', abbr: 'SN' },
  { grade: 'E-4', title: 'Petty Officer Third Class', abbr: 'PO3' },
  { grade: 'E-5', title: 'Petty Officer Second Class', abbr: 'PO2' },
  { grade: 'E-6', title: 'Petty Officer First Class', abbr: 'PO1' },
  { grade: 'E-7', title: 'Chief Petty Officer', abbr: 'CPO' },
  { grade: 'E-8', title: 'Senior Chief Petty Officer', abbr: 'SCPO' },
  { grade: 'E-9', title: 'Master Chief Petty Officer', abbr: 'MCPO' }
];

const DEFAULT_MILITARY_DATA = {
  branch: 'United States Navy',
  rating: 'MA',
  ratingTitle: 'Master-at-Arms',
  rank: 'E-3',
  rankTitle: 'Seaman',
  status: 'Active Duty',
  dutyStation: '',
  serviceStart: '',
  duties: [
    'Force protection and physical security operations',
    'Law enforcement and antiterrorism duties',
    'Military working dog handling and training',
    'Access control and base security management',
    'Investigations and incident response',
    'Weapons qualification and tactical training'
  ],
  coreValues: ['Honor', 'Courage', 'Commitment']
};

const STORAGE_KEY = 'navy_military_service_data';

const MilitaryService = () => {
  const { isAuthenticated } = useAuth();
  const [militaryData, setMilitaryData] = useState(() => {
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(militaryData);
  const [ratingSearch, setRatingSearch] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(militaryData));
  }, [militaryData]);

  const handleEdit = () => {
    setEditData({ ...militaryData });
    setRatingSearch('');
    setIsEditing(true);
  };

  const handleSave = () => {
    setMilitaryData({ ...editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleRatingChange = (ratingCode) => {
    const found = NAVY_RATINGS.find(r => r.code === ratingCode);
    if (found) {
      setEditData(prev => ({
        ...prev,
        rating: found.code,
        ratingTitle: found.title
      }));
    }
  };

  const handleRankChange = (grade) => {
    const found = NAVY_RANKS.find(r => r.grade === grade);
    if (found) {
      setEditData(prev => ({
        ...prev,
        rank: found.grade,
        rankTitle: found.title
      }));
    }
  };

  const filteredRatings = NAVY_RATINGS.filter(r =>
    r.code.toLowerCase().includes(ratingSearch.toLowerCase()) ||
    r.title.toLowerCase().includes(ratingSearch.toLowerCase())
  );

  const currentRank = NAVY_RANKS.find(r => r.grade === militaryData.rank);

  return (
    <section className={styles.militarySection}>
      <div className={styles.navyWatermark}></div>
      <div className={styles.navyStripe}></div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.titleIcon}><FaAnchor /></span>
          Military Service
        </h2>
        {isAuthenticated && !isEditing && (
          <button className={styles.editButton} onClick={handleEdit} aria-label="Edit military info">
            <FaEdit />
            <span>Edit</span>
          </button>
        )}
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
          <div className={styles.rankTitle}>{currentRank?.title || militaryData.rankTitle}</div>
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

      {(militaryData.dutyStation || militaryData.serviceStart) && (
        <div className={styles.serviceDetails}>
          {militaryData.dutyStation && (
            <div className={styles.detailItem}>
              <FaMapMarkerAlt className={styles.detailIcon} />
              <span className={styles.detailLabel}>Duty Station:</span>
              <span className={styles.detailValue}>{militaryData.dutyStation}</span>
            </div>
          )}
          {militaryData.serviceStart && (
            <div className={styles.detailItem}>
              <FaCalendarAlt className={styles.detailIcon} />
              <span className={styles.detailLabel}>Service Since:</span>
              <span className={styles.detailValue}>{militaryData.serviceStart}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.dutiesSection}>
        <h3 className={styles.dutiesTitle}>
          <FaMedal className={styles.dutiesTitleIcon} />
          Key Duties & Responsibilities
        </h3>
        <ul className={styles.dutiesList}>
          {militaryData.duties.map((duty, index) => (
            <motion.li
              key={index}
              className={styles.dutyItem}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <FaChevronRight className={styles.dutyBullet} />
              <span>{duty}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className={styles.coreValuesBar}>
        {militaryData.coreValues.map((value, index) => (
          <div key={index} className={styles.coreValue}>
            <FaStar className={styles.coreValueStar} />
            <span>{value}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            className={styles.editOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.editModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <FaAnchor className={styles.modalHeaderIcon} />
                  Edit Military Service
                </h3>
                <button className={styles.modalClose} onClick={handleCancel}>
                  <FaTimes />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Rating</label>
                  <input
                    type="text"
                    className={styles.formSearch}
                    placeholder="Search ratings..."
                    value={ratingSearch}
                    onChange={(e) => setRatingSearch(e.target.value)}
                  />
                  <div className={styles.ratingList}>
                    {filteredRatings.map(r => (
                      <button
                        key={r.code}
                        className={`${styles.ratingOption} ${editData.rating === r.code ? styles.ratingOptionActive : ''}`}
                        onClick={() => handleRatingChange(r.code)}
                      >
                        <span className={styles.ratingOptionCode}>{r.code}</span>
                        <span className={styles.ratingOptionTitle}>{r.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Pay Grade</label>
                  <div className={styles.rankOptions}>
                    {NAVY_RANKS.map(r => (
                      <button
                        key={r.grade}
                        className={`${styles.rankOption} ${editData.rank === r.grade ? styles.rankOptionActive : ''}`}
                        onClick={() => handleRankChange(r.grade)}
                      >
                        <span className={styles.rankOptionGrade}>{r.grade}</span>
                        <span className={styles.rankOptionTitle}>{r.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <select
                    className={styles.formSelect}
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Active Duty">Active Duty</option>
                    <option value="Reserve">Reserve</option>
                    <option value="Veteran">Veteran</option>
                    <option value="Inactive Ready Reserve">Inactive Ready Reserve</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Duty Station (optional)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Naval Station Norfolk"
                    value={editData.dutyStation}
                    onChange={(e) => setEditData(prev => ({ ...prev, dutyStation: e.target.value }))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Start (optional)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. 2024"
                    value={editData.serviceStart}
                    onChange={(e) => setEditData(prev => ({ ...prev, serviceStart: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={handleCancel}>
                  <FaTimes /> Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleSave}>
                  <FaCheck /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MilitaryService;
