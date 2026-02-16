import React, { useState } from 'react';
import { FaRobot, FaBrain, FaCode, FaPalette, FaDatabase, FaGlobe } from 'react-icons/fa';
import styles from './AILabHub.module.css';

const labs = [
  {
    id: 'chat-assistant',
    title: 'AI Chat Assistant',
    description: 'Chat with Melvin\'s AI assistant about his portfolio, skills, and experience',
    icon: FaRobot,
    status: 'active',
    path: '/ai-lab/chat'
  },
  {
    id: 'code-analyzer',
    title: 'Melvin\'s Code Review Copilot',
    description: 'Deep-dive Melvin\'s repos for quality, style, and optimization opportunities',
    icon: FaCode,
    status: 'coming-soon',
    path: '/ai-lab/code-analyzer'
  },
  {
    id: 'design-generator',
    title: 'Studio Palette by Melvin',
    description: 'Spin up on-brand UI explorations and component kits for Melvin\'s projects',
    icon: FaPalette,
    status: 'coming-soon',
    path: '/ai-lab/design-generator'
  },
  {
    id: 'data-insights',
    title: 'Portfolio Pulse',
    description: 'Monitor portfolio performance and surface engagement signals for Melvin\'s work',
    icon: FaDatabase,
    status: 'planned',
    path: '/ai-lab/analytics'
  },
  {
    id: 'content-creator',
    title: 'Storysmith for Melvin',
    description: 'Draft blog posts, case studies, and updates that spotlight Melvin\'s work',
    icon: FaBrain,
    status: 'planned',
    path: '/ai-lab/content'
  },
  {
    id: 'web-scraper',
    title: 'Scout Crawler',
    description: 'Gather research and competitive intel to inform Melvin\'s next build',
    icon: FaGlobe,
    status: 'planned',
    path: '/ai-lab/scraper'
  }
];

const AILabHub = ({ onLaunchChat }) => {
  const [selectedLab, setSelectedLab] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { text: 'Active', class: styles.active },
      'coming-soon': { text: 'Coming Soon', class: styles.comingSoon },
      'planned': { text: 'Planned', class: styles.planned }
    };
    
    const config = statusConfig[status] || statusConfig.planned;
    return <span className={`${styles.statusBadge} ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className={styles.labHub}>
      <div className={styles.header}>
        <h1>AI Lab Hub</h1>
        <p>Explore Melvin's AI-powered experiments and tools</p>
      </div>

      <div className={styles.labsGrid}>
        {labs.map(lab => {
          const Icon = lab.icon;
          return (
            <div
              key={lab.id}
              className={`${styles.labCard} ${lab.status === 'active' ? styles.activeCard : ''}`}
              onClick={() => lab.status === 'active' && setSelectedLab(lab)}
            >
              <div className={styles.labIcon}>
                <Icon />
              </div>
              <div className={styles.labInfo}>
                <h3>{lab.title}</h3>
                <p>{lab.description}</p>
                {getStatusBadge(lab.status)}
              </div>
            </div>
          );
        })}
      </div>

      {selectedLab && (
        <div className={styles.labModal}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton}
              onClick={() => setSelectedLab(null)}
            >
              ×
            </button>
            <h2>{selectedLab.title}</h2>
            <p>{selectedLab.description}</p>
            <button 
              className={styles.launchButton}
              onClick={() => {
                if (selectedLab.id === 'chat-assistant') {
                  onLaunchChat();
                } else {
                  // Handle other labs when they're ready
                  alert(`${selectedLab.title} will be available soon!`);
                }
                setSelectedLab(null);
              }}
            >
              Launch {selectedLab.title}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILabHub;
