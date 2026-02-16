import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Wrench, DollarSign, Target, Code2, RefreshCw, Zap } from 'lucide-react';
import styles from './IdeaMutationLab.module.css';

const Metric = ({ icon, label, value }) => {
  const tone = value > 7 ? styles.metricHigh : value > 4 ? styles.metricMid : styles.metricLow;
  return (
    <div className={`${styles.metric} ${tone}`}>
      <div className={styles.metricIcon}>{icon}</div>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  );
};

function MutationNode({ data }) {
  if (data.type === 'origin') {
    return (
      <div className={`${styles.nodeShell} ${styles.originNode}`}>
        <Handle type="source" position={Position.Right} className={styles.handle} />
        <Handle type="source" position={Position.Bottom} className={styles.handle} />
        <Handle type="source" position={Position.Top} className={styles.handle} />
        <Handle type="source" position={Position.Left} className={styles.handle} />

        <div className={styles.originBadge}>
          <Zap size={14} /> Source Idea
        </div>
        <div className={styles.originTitle}>{data.label}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.nodeShell} ${styles.mutationNode}`}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <button
        className={styles.regenButton}
        onClick={(e) => {
          e.stopPropagation();
          data.onRegenerate?.();
        }}
        title="Regenerate this mutation"
        type="button"
      >
        <RefreshCw size={14} />
      </button>

      <div className={styles.cardHeader} onClick={data.onClick} role="button" tabIndex={0}>
        <div className={styles.cardTitle}>{data.label}</div>
        <div className={styles.cardHint}>Click for full analysis</div>
      </div>

      <div className={styles.cardBody} onClick={data.onClick} role="button" tabIndex={0}>
        <div className={styles.metricGrid}>
          <Metric icon={<Wrench size={13} />} label="Difficulty" value={data.difficulty || 0} />
          <Metric icon={<DollarSign size={13} />} label="Revenue" value={data.monetization || 0} />
          <Metric icon={<Target size={13} />} label="Competition" value={data.competition || 0} />
        </div>

        {data.stack?.length ? (
          <div className={styles.stackBlock}>
            <div className={styles.stackLabel}>
              <Code2 size={14} /> Tech stack
            </div>
            <div className={styles.stackChips}>
              {data.stack.slice(0, 4).map((tech, i) => (
                <span key={tech + i} className={styles.chip}>
                  {tech}
                </span>
              ))}
              {data.stack.length > 4 && (
                <span className={styles.chipGhost}>+{data.stack.length - 4}</span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MutationNode;
