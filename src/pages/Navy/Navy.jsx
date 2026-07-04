import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
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
  FaFlag,
  FaUsers,
  FaCrosshairs,
  FaGraduationCap,
  FaAward,
  FaShip,
  FaGlobe,
  FaLock,
  FaDog,
  FaRunning,
  FaBullseye,
  FaHandshake,
  FaBookOpen
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './Navy.module.css';

const NAVY_RATINGS = [
  { code: 'ABE', title: "Aviation Boatswain's Mate (Launch/Recovery)" },
  { code: 'ABF', title: "Aviation Boatswain's Mate (Fuels)" },
  { code: 'ABH', title: "Aviation Boatswain's Mate (Handling)" },
  { code: 'AC', title: 'Air Traffic Controller' },
  { code: 'AD', title: "Aviation Machinist's Mate" },
  { code: 'AG', title: "Aerographer's Mate" },
  { code: 'AM', title: 'Aviation Structural Mechanic' },
  { code: 'AO', title: 'Aviation Ordnanceman' },
  { code: 'AS', title: 'Aviation Support Equipment Technician' },
  { code: 'AT', title: 'Aviation Electronics Technician' },
  { code: 'AW', title: 'Naval Aircrewman' },
  { code: 'AZ', title: 'Aviation Maintenance Administrationman' },
  { code: 'BM', title: "Boatswain's Mate" },
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
  { code: 'EM', title: "Electrician's Mate" },
  { code: 'EN', title: 'Engineman' },
  { code: 'EO', title: 'Equipment Operator' },
  { code: 'EOD', title: 'Explosive Ordnance Disposal Technician' },
  { code: 'ET', title: 'Electronics Technician' },
  { code: 'FC', title: 'Fire Controlman' },
  { code: 'FT', title: 'Fire Control Technician' },
  { code: 'GM', title: "Gunner's Mate" },
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
  { code: 'MM', title: "Machinist's Mate" },
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
  { code: 'SH', title: "Ship's Serviceman" },
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
};

const STORAGE_KEY = 'navy_military_service_data';

const MA_DUTIES = [
  { icon: <FaShieldAlt />, title: 'Force Protection', desc: 'Physical security operations for naval installations and personnel' },
  { icon: <FaLock />, title: 'Law Enforcement', desc: 'Military law enforcement, patrolling, and incident response' },
  { icon: <FaDog />, title: 'Military Working Dogs', desc: 'K-9 handling, detection operations, and canine training' },
  { icon: <FaCrosshairs />, title: 'Anti-Terrorism', desc: 'Force protection condition implementation and threat mitigation' },
  { icon: <FaUsers />, title: 'Access Control', desc: 'Installation entry control points and visitor management' },
  { icon: <FaBullseye />, title: 'Weapons Qualification', desc: 'Small arms qualification, tactical training, and marksmanship' },
  { icon: <FaGlobe />, title: 'Investigations', desc: 'Criminal investigations, evidence collection, and report writing' },
  { icon: <FaRunning />, title: 'Emergency Response', desc: 'Active shooter response, force protection drills, and readiness' },
];

const TRAINING_PIPELINE = [
  { phase: 'Boot Camp', location: 'RTC Great Lakes, IL', duration: '10 weeks', desc: 'Basic military training, discipline, and Navy fundamentals' },
  { phase: 'A School', location: 'San Antonio, TX', duration: '9 weeks', desc: 'Master-at-Arms rating-specific training in law enforcement and security' },
  { phase: 'Fleet Assignment', location: 'Duty Station', duration: 'Ongoing', desc: 'Real-world force protection and law enforcement operations' },
];

const CORE_VALUES = [
  { value: 'Honor', desc: 'I will bear true faith and allegiance. I will act with honesty and integrity in all my actions.', icon: <FaMedal /> },
  { value: 'Courage', desc: 'I will have the courage to meet the demands of my profession. I will support and defend the Constitution.', icon: <FaShieldAlt /> },
  { value: 'Commitment', desc: 'I will serve with the highest standards of competence and character. I am committed to the Navy and my shipmates.', icon: <FaHandshake /> },
];

const Navy = () => {
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
  const [editData, setEditData] = useState({ ...militaryData });
  const [ratingSearch, setRatingSearch] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(militaryData));
  }, [militaryData]);

  const handleSave = () => {
    const ratingObj = NAVY_RATINGS.find(r => r.code === editData.rating);
    const rankObj = NAVY_RANKS.find(r => r.grade === editData.rank);
    const updatedData = {
      ...editData,
      ratingTitle: ratingObj ? ratingObj.title : editData.ratingTitle,
      rankTitle: rankObj ? rankObj.title : editData.rankTitle,
    };
    setMilitaryData(updatedData);
    setIsEditing(false);
  };

  const filteredRatings = NAVY_RATINGS.filter(r =>
    r.code.toLowerCase().includes(ratingSearch.toLowerCase()) ||
    r.title.toLowerCase().includes(ratingSearch.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    }
  };

  const sectionVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <>
      <Helmet>
        <title>Navy Service - Melvin Peralta | United States Navy MA</title>
        <meta name="description" content="Melvin Peralta's U.S. Navy military service page. Master-at-Arms (MA) E-3 — force protection, law enforcement, and security operations." />
      </Helmet>

      <main className={styles.navyPage}>
        {/* Hero Banner */}
        <section className={styles.heroBanner}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={styles.heroText}
            >
              <div className={styles.heroEmblem}>
                <FaAnchor className={styles.heroAnchor} />
              </div>
              <h1 className={styles.heroTitle}>United States Navy</h1>
              <p className={styles.heroMotto}>"Non Sibi Sed Patriae" — Not for Self, but for Country</p>
              <div className={styles.heroBadges}>
                <span className={styles.heroBadge}>
                  <FaIdBadge /> {militaryData.rating} — {militaryData.ratingTitle}
                </span>
                <span className={styles.heroBadge}>
                  <FaStar /> {militaryData.rank} — {militaryData.rankTitle}
                </span>
                <span className={`${styles.heroBadge} ${styles.activeBadge}`}>
                  <FaFlag /> {militaryData.status}
                </span>
              </div>
            </motion.div>

            {isAuthenticated && (
              <button className={styles.editButton} onClick={() => { setEditData({ ...militaryData }); setIsEditing(true); }}>
                <FaEdit /> Edit Service Info
              </button>
            )}
          </div>
        </section>

        {/* Service Overview */}
        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHeader} variants={sectionVariants}>
            <h2><FaShip /> Service Overview</h2>
          </motion.div>
          <div className={styles.overviewGrid}>
            <motion.div className={styles.overviewCard} variants={cardVariants}>
              <div className={styles.overviewIcon}><FaAnchor /></div>
              <h3>Branch</h3>
              <p>{militaryData.branch}</p>
            </motion.div>
            <motion.div className={styles.overviewCard} variants={cardVariants}>
              <div className={styles.overviewIcon}><FaIdBadge /></div>
              <h3>Rating</h3>
              <p className={styles.ratingCode}>{militaryData.rating}</p>
              <span className={styles.ratingSubtitle}>{militaryData.ratingTitle}</span>
            </motion.div>
            <motion.div className={styles.overviewCard} variants={cardVariants}>
              <div className={styles.overviewIcon}><FaStar /></div>
              <h3>Pay Grade</h3>
              <p className={styles.ratingCode}>{militaryData.rank}</p>
              <span className={styles.ratingSubtitle}>{militaryData.rankTitle}</span>
            </motion.div>
            <motion.div className={`${styles.overviewCard} ${styles.statusCard}`} variants={cardVariants}>
              <div className={styles.overviewIcon}><FaFlag /></div>
              <h3>Status</h3>
              <p>
                <span className={styles.statusDot}></span>
                {militaryData.status}
              </p>
            </motion.div>
            {militaryData.dutyStation && (
              <motion.div className={styles.overviewCard} variants={cardVariants}>
                <div className={styles.overviewIcon}><FaMapMarkerAlt /></div>
                <h3>Duty Station</h3>
                <p>{militaryData.dutyStation}</p>
              </motion.div>
            )}
            {militaryData.serviceStart && (
              <motion.div className={styles.overviewCard} variants={cardVariants}>
                <div className={styles.overviewIcon}><FaCalendarAlt /></div>
                <h3>Service Start</h3>
                <p>{militaryData.serviceStart}</p>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Core Values */}
        <motion.section
          className={`${styles.section} ${styles.valuesSection}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHeader} variants={sectionVariants}>
            <h2><FaMedal /> Core Values</h2>
          </motion.div>
          <div className={styles.valuesGrid}>
            {CORE_VALUES.map((item, idx) => (
              <motion.div key={idx} className={styles.valueCard} variants={cardVariants}>
                <div className={styles.valueIcon}>{item.icon}</div>
                <h3>{item.value}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* MA Duties & Responsibilities */}
        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHeader} variants={sectionVariants}>
            <h2><FaShieldAlt /> Duties & Responsibilities</h2>
            <p className={styles.sectionSubtitle}>Master-at-Arms — The Navy's law enforcement and security professionals</p>
          </motion.div>
          <div className={styles.dutiesGrid}>
            {MA_DUTIES.map((duty, idx) => (
              <motion.div key={idx} className={styles.dutyCard} variants={cardVariants}>
                <div className={styles.dutyIcon}>{duty.icon}</div>
                <h4>{duty.title}</h4>
                <p>{duty.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Training Pipeline */}
        <motion.section
          className={`${styles.section} ${styles.trainingSection}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHeader} variants={sectionVariants}>
            <h2><FaGraduationCap /> Training Pipeline</h2>
          </motion.div>
          <div className={styles.timeline}>
            {TRAINING_PIPELINE.map((phase, idx) => (
              <motion.div key={idx} className={styles.timelineItem} variants={sectionVariants}>
                <div className={styles.timelineDot}>
                  <span>{idx + 1}</span>
                </div>
                <div className={styles.timelineContent}>
                  <h4>{phase.phase}</h4>
                  <div className={styles.timelineMeta}>
                    <span><FaMapMarkerAlt /> {phase.location}</span>
                    <span><FaCalendarAlt /> {phase.duration}</span>
                  </div>
                  <p>{phase.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Sailor's Creed */}
        <motion.section
          className={`${styles.section} ${styles.creedSection}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHeader} variants={sectionVariants}>
            <h2><FaBookOpen /> Sailor's Creed</h2>
          </motion.div>
          <motion.blockquote className={styles.creed} variants={sectionVariants}>
            <p>I am a United States Sailor.</p>
            <p>I will support and defend the Constitution of the United States of America, and I will obey the orders of those appointed over me.</p>
            <p>I represent the fighting spirit of the Navy and those who have gone before me to defend freedom and democracy around the world.</p>
            <p>I proudly serve my country's Navy combat team with Honor, Courage, and Commitment.</p>
            <p>I am committed to excellence and the fair treatment of all.</p>
          </motion.blockquote>
        </motion.section>

        {/* Edit Modal */}
        {isEditing && (
          <div className={styles.modalOverlay} onClick={() => setIsEditing(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3><FaEdit /> Edit Service Information</h3>
                <button onClick={() => setIsEditing(false)} className={styles.modalClose}><FaTimes /></button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Rating</label>
                  <input
                    type="text"
                    placeholder="Search ratings..."
                    value={ratingSearch}
                    onChange={e => setRatingSearch(e.target.value)}
                    className={styles.searchInput}
                  />
                  <div className={styles.ratingList}>
                    {filteredRatings.map(r => (
                      <button
                        key={r.code}
                        className={`${styles.ratingOption} ${editData.rating === r.code ? styles.selected : ''}`}
                        onClick={() => setEditData({ ...editData, rating: r.code, ratingTitle: r.title })}
                      >
                        <strong>{r.code}</strong> — {r.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Pay Grade</label>
                  <div className={styles.rankGrid}>
                    {NAVY_RANKS.map(r => (
                      <button
                        key={r.grade}
                        className={`${styles.rankOption} ${editData.rank === r.grade ? styles.selected : ''}`}
                        onClick={() => setEditData({ ...editData, rank: r.grade, rankTitle: r.title })}
                      >
                        <span className={styles.rankGrade}>{r.grade}</span>
                        <span className={styles.rankAbbr}>{r.abbr}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={editData.status}
                    onChange={e => setEditData({ ...editData, status: e.target.value })}
                    className={styles.selectInput}
                  >
                    <option value="Active Duty">Active Duty</option>
                    <option value="Reserve">Reserve</option>
                    <option value="Veteran">Veteran</option>
                    <option value="Individual Ready Reserve">Individual Ready Reserve</option>
                  </select>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Duty Station</label>
                    <input
                      type="text"
                      value={editData.dutyStation}
                      onChange={e => setEditData({ ...editData, dutyStation: e.target.value })}
                      placeholder="e.g., Naval Station Norfolk"
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Service Start</label>
                    <input
                      type="text"
                      value={editData.serviceStart}
                      onChange={e => setEditData({ ...editData, serviceStart: e.target.value })}
                      placeholder="e.g., January 2024"
                      className={styles.textInput}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}><FaTimes /> Cancel</button>
                <button onClick={handleSave} className={styles.saveBtn}><FaCheck /> Save</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Navy;
