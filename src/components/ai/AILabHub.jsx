import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaBrain, FaCode, FaPalette, FaDatabase, FaGlobe, FaCogs } from 'react-icons/fa';
import StackBuilderConsole from './stack-builder/StackBuilderConsole';
import IdeaMutationLab from './idea-mutation/IdeaMutationLab';
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
    status: 'active',
    path: '/code-review'
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
    id: 'stack-builder',
    title: 'Stack Builder Console',
    description: 'Build your tech stack with Melvin.',
    icon: FaCogs,
    status: 'active',
    path: '/ai-lab/stack-builder',
    toggles: ['Local LLM', 'Cloud AI', 'Supabase', 'Firebase', 'Turso', 'Docker', 'n8n'],
    outputs: ['Recommended structure', 'Folder layout', 'Dev workflow']
  },
  {
    id: 'idea-mutation',
    title: 'Idea Mutation Lab',
    description: 'Iterate and mutate ideas to discover stronger variations and angles',
    icon: FaBrain,
    status: 'active',
    path: '/ai-lab/idea-mutation'
  },
  {
    id: 'web-scraper',
    title: 'Metascan',
    description: 'Website intelligence tool for analyzing site structure and extracting metadata',
    icon: FaGlobe,
    status: 'active',
    path: '/scout-crawler'
  }
];

const AILabHub = ({ onLaunchChat }) => {
  const [selectedLab, setSelectedLab] = useState(null);
  const navigate = useNavigate();

  const statusWeight = { 'active': 0, 'coming-soon': 1, 'planned': 2 };
  const sortedLabs = [...labs].sort((a, b) => {
    const aw = statusWeight[a.status] ?? 3;
    const bw = statusWeight[b.status] ?? 3;
    return aw - bw;
  });

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
        {sortedLabs.map(lab => {
          const Icon = lab.icon;
          const handleClick = () => {
            if (lab.id === 'code-analyzer') {
              navigate('/code-review');
            } else if (lab.id === 'web-scraper') {
              navigate('/scout-crawler');
            } else if (lab.status === 'active') {
              setSelectedLab(lab);
            }
          };

          return (
            <div
              key={lab.id}
              className={`${styles.labCard} ${(lab.status === 'active' || lab.id === 'code-analyzer' || lab.id === 'web-scraper') ? styles.activeCard : ''}`}
              onClick={handleClick}
            >
              <div className={styles.labIcon}>
                {Icon ? <Icon /> : null}
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

      {selectedLab && selectedLab.id !== 'stack-builder' && selectedLab.id !== 'idea-mutation' && (
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

      {selectedLab && selectedLab.id === 'stack-builder' && (
        <StackBuilderConsole open onClose={() => setSelectedLab(null)} />
      )}

      {selectedLab && selectedLab.id === 'idea-mutation' && (
        <IdeaMutationLab open onClose={() => setSelectedLab(null)} />
      )}
    </div>
  );
};

export default AILabHub;
