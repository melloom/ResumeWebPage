import React from 'react';
import { motion } from 'framer-motion';
import styles from './stackBuilder.module.css';

const TechCard = ({ tech, active, onToggle }) => (
  <motion.button
    onClick={onToggle}
    whileHover={{ scale: 1.05, y: -4 }}
    whileTap={{ scale: 0.97 }}
    animate={active ? { scale: 1.03, y: -2 } : { scale: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className={`${styles.techCard} ${active ? styles.techCardActive : ''}`}
    style={{
      background: active
        ? `linear-gradient(135deg, hsl(${tech.color} / 0.6), hsl(${tech.color} / 0.1))`
        : 'linear-gradient(135deg, hsl(220 20% 30% / 0.4), hsl(220 20% 20% / 0.2))',
    }}
  >
    {active && (
      <motion.div
        layoutId={`glow-${tech.id}`}
        className={styles.techGlow}
        style={{ background: `hsl(${tech.color} / 0.4)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.4 }}
      />
    )}

    <div
      className={styles.techInner}
      style={{
        background: active
          ? `linear-gradient(160deg, hsl(${tech.color} / 0.15), hsl(220 30% 8% / 0.9))`
          : 'hsl(220 30% 10% / 0.7)',
      }}
    >
      <span className={styles.techIcon}>{tech.icon}</span>
      <span
        className={styles.techName}
        style={{ color: active ? `hsl(${tech.color})` : 'hsl(220 20% 65%)' }}
      >
        {tech.name}
      </span>
      <motion.div
        className={styles.techDot}
        style={{ background: `hsl(${tech.color})` }}
        initial={false}
        animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  </motion.button>
);

export default TechCard;
