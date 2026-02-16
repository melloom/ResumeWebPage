import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './stackBuilder.module.css';

const OutputCard = ({ title, content, index, accentColor }) => {
  const lines = useMemo(() => content.split('\n').map(l => l.trim()).filter(Boolean), [content]);
  const isList = useMemo(() => {
    const lower = title.toLowerCase();
    return lower.includes('workflow') || lower.includes('folder');
  }, [title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={styles.outputCard}
      style={{ background: `linear-gradient(135deg, hsl(${accentColor} / 0.35), hsl(220 20% 20% / 0.2))` }}
    >
      <div className={styles.outputInner}>
        <div className={styles.outputHeader}>
          <span className={styles.outputBadge} style={{ color: `hsl(${accentColor})`, borderColor: `hsl(${accentColor})` }}>{title}</span>
        </div>
        {isList ? (
          <ol className={styles.outputList}>
            {lines.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ol>
        ) : (
          <div className={styles.outputTextBlock}>
            {lines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OutputCard;
