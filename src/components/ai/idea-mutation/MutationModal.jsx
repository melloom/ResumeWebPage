import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Lightbulb,
  Wrench,
  DollarSign,
  Target,
  Code2,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import styles from './IdeaMutationLab.module.css';

const colorTone = {
  emerald: { pill: styles.pillEmerald, bar: styles.barEmerald },
  blue: { pill: styles.pillBlue, bar: styles.barBlue },
  amber: { pill: styles.pillAmber, bar: styles.barAmber },
  red: { pill: styles.pillRed, bar: styles.barRed },
};

const getDifficulty = (score) => {
  if (score <= 3) return { label: 'Low', desc: 'Quick to build with standard tools', tone: 'emerald' };
  if (score <= 6) return { label: 'Medium', desc: 'Requires solid engineering effort', tone: 'blue' };
  if (score <= 8) return { label: 'High', desc: 'Complex architecture needed', tone: 'amber' };
  return { label: 'Very High', desc: 'Significant technical challenges', tone: 'red' };
};

const getRevenue = (score) => {
  if (score <= 3) return { label: 'Limited', desc: 'Hard to monetize effectively', tone: 'red' };
  if (score <= 6) return { label: 'Moderate', desc: 'Standard SaaS pricing possible', tone: 'amber' };
  if (score <= 8) return { label: 'Strong', desc: 'High willingness to pay', tone: 'blue' };
  return { label: 'Excellent', desc: 'Premium pricing potential', tone: 'emerald' };
};

const getCompetition = (score) => {
  if (score <= 3) return { label: 'Low', desc: 'Blue ocean opportunity', tone: 'emerald' };
  if (score <= 6) return { label: 'Moderate', desc: 'Some existing players', tone: 'blue' };
  if (score <= 8) return { label: 'High', desc: 'Crowded market space', tone: 'amber' };
  return { label: 'Very High', desc: 'Saturated market', tone: 'red' };
};

const viabilityScore = (difficulty, monetization, competition) => {
  const difficultyScore = 10 - difficulty;
  const competitionScore = 10 - competition;
  return Math.round(((difficultyScore + monetization + competitionScore) / 3) * 10) / 10;
};

const viabilityLabel = (score) => {
  if (score >= 8) return 'Excellent opportunity';
  if (score >= 6) return 'Strong potential';
  if (score >= 4) return 'Moderate viability';
  return 'Challenging opportunity';
};

const MetricDetail = ({ icon, label, score, insight }) => {
  const tone = colorTone[insight.tone];
  return (
    <div className={styles.metricDetail}>
      <div className={styles.metricDetailHead}>
        <div className={styles.metricDetailLabel}>
          <span className={styles.metricIcon}>{icon}</span>
          <span>{label}</span>
        </div>
        <div className={styles.metricDetailScore}>
          <span className={`${styles.metricPill} ${tone.pill}`}>{insight.label}</span>
          <span className={styles.metricNumber}>{score}/10</span>
        </div>
      </div>
      <div className={styles.metricBarWrap}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.5 }}
          className={`${styles.metricBar} ${tone.bar}`}
        />
      </div>
      <p className={styles.metricDesc}>{insight.desc}</p>
    </div>
  );
};

const stepsFromMutation = (mutation) => {
  const base = mutation?.stack || [];
  const steps = [
    `Validate problem/segment for "${mutation.idea}"`,
    `Ship MVP with ${base.slice(0, 2).join(' + ') || 'core stack'}`,
    'Launch to 10 design partners',
    'Instrument success metrics and iterate',
  ];
  return steps.slice(0, 4);
};

const MutationModal = ({ isOpen, onClose, mutation, sourceIdea, onMutateThis, onPinToOrigin }) => {
  if (!mutation) return null;
  const difficulty = getDifficulty(mutation.difficulty);
  const monetization = getRevenue(mutation.monetization);
  const competition = getCompetition(mutation.competition);
  const viability = viabilityScore(mutation.difficulty, mutation.monetization, mutation.competition);
  const steps = stepsFromMutation(mutation);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className={styles.modalShell}>
            <motion.div
              className={styles.modalPanel}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleBlock}>
                  <div className={styles.modalLabel}>
                    <Lightbulb size={16} /> Detailed Analysis
                  </div>
                  <h3 className={styles.modalTitle}>{mutation.idea}</h3>
                  {sourceIdea && (
                    <div className={styles.sourceIdea}>Based on: {sourceIdea}</div>
                  )}
                </div>
                <button className={styles.iconBtn} onClick={onClose} aria-label="Close mutation details">
                  <X size={16} />
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.modalColumns}>
                  <div className={styles.modalCol}>
                    <div className={styles.actionRow}>
                      <button
                        className={styles.primaryBtn}
                        type="button"
                        onClick={onMutateThis}
                        disabled={!onMutateThis}
                      >
                        Mutate this (5 new)
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        type="button"
                        onClick={onPinToOrigin}
                        disabled={!onPinToOrigin}
                      >
                        Pin as origin
                      </button>
                    </div>

                    <div className={styles.sectionHead}>
                      <TrendingUp size={16} />
                      <span>Viability metrics</span>
                    </div>
                    <div className={styles.metricDetailStack}>
                      <MetricDetail icon={<Wrench size={15} />} label="Build difficulty" score={mutation.difficulty} insight={difficulty} />
                      <MetricDetail icon={<DollarSign size={15} />} label="Revenue potential" score={mutation.monetization} insight={monetization} />
                      <MetricDetail icon={<Target size={15} />} label="Market competition" score={mutation.competition} insight={competition} />
                    </div>

                    <div className={styles.viabilityBox}>
                      <div className={styles.viabilityLabel}>Overall viability</div>
                      <div className={styles.viabilityScore}>{viability}/10</div>
                      <div className={styles.viabilityHint}>{viabilityLabel(viability)}</div>
                    </div>

                    <div className={styles.sectionHead}>
                      <TrendingUp size={16} />
                      <span>Execution plan</span>
                    </div>
                    <div className={styles.planList}>
                      {steps.map((step, i) => (
                        <div key={step + i} className={styles.planRow}>
                          <div className={styles.planIndex}>{i + 1}</div>
                          <div className={styles.planText}>{step}</div>
                        </div>
                      ))}
                    </div>

                    {mutation.targetAudience && (
                      <div className={styles.infoCardPurple}>
                        <div className={styles.infoCardHead}>
                          <Users size={14} /> <span>Target audience</span>
                        </div>
                        <div className={styles.infoCardBody}>{mutation.targetAudience}</div>
                      </div>
                    )}
                  </div>

                  <div className={styles.modalCol}>
                    <div className={styles.sectionHead}>
                      <Code2 size={16} />
                      <span>MVP tech stack</span>
                    </div>
                    <div className={styles.stackGrid}>
                      {mutation.stack?.map((tech, i) => (
                        <motion.div
                          key={tech + i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={styles.stackPill}
                        >
                          <span className={styles.stackDot} />
                          {tech}
                        </motion.div>
                      ))}
                    </div>

                    {mutation.pricing?.length ? (
                      <div className={styles.sectionBlock}>
                        <div className={styles.sectionHead}>
                          <DollarSign size={16} />
                          <span>Pricing strategy</span>
                        </div>
                        <div className={styles.bulletList}>
                          {mutation.pricing.map((price, i) => (
                            <div key={price + i} className={styles.bulletRow}>
                              <CheckCircle2 size={14} />
                              <span>{price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {mutation.successMetrics?.length ? (
                      <div className={styles.sectionBlock}>
                        <div className={styles.sectionHead}>
                          <TrendingUp size={16} />
                          <span>Success metrics</span>
                        </div>
                        <div className={styles.bulletList}>
                          {mutation.successMetrics.map((metric, i) => (
                            <div key={metric + i} className={styles.bulletRowGreen}>
                              <span className={styles.metricDot} />
                              <span>{metric}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {mutation.risks?.length ? (
                      <div className={styles.sectionBlock}>
                        <div className={styles.sectionHead}>
                          <AlertTriangle size={16} />
                          <span>Key risks</span>
                        </div>
                        <div className={styles.bulletList}>
                          {mutation.risks.map((risk, i) => (
                            <div key={risk + i} className={styles.bulletRowAmber}>
                              <AlertTriangle size={14} />
                              <span>{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className={styles.sectionBlock}>
                      <div className={styles.sectionHead}>
                        <TrendingUp size={16} />
                        <span>Confidence breakdown</span>
                      </div>
                      <div className={styles.confidenceGrid}>
                        <ConfidenceBar label="Build" score={10 - mutation.difficulty} tone={difficulty.tone} />
                        <ConfidenceBar label="Monetization" score={mutation.monetization} tone={monetization.tone} />
                        <ConfidenceBar label="Market fit" score={10 - mutation.competition} tone={competition.tone} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MutationModal;

const ConfidenceBar = ({ label, score, tone }) => {
  const barClass = colorTone[tone]?.bar || styles.barBlue;
  return (
    <div className={styles.confidenceItem}>
      <div className={styles.confidenceHead}>
        <span>{label}</span>
        <span className={styles.metricNumber}>{score}/10</span>
      </div>
      <div className={styles.metricBarWrap}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.5 }}
          className={`${styles.metricBar} ${barClass}`}
        />
      </div>
    </div>
  );
};
