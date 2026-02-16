import React, { useState, useEffect } from 'react';
import AIChat from '../components/ai/AIChat';
import AILabHub from '../components/ai/AILabHub';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './AILab.module.css';

const AILab = () => {
  const [currentView, setCurrentView] = useState('hub'); // 'hub' or 'chat'

  // Scroll to top once on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <section className={styles.aiLab}>
      {currentView === 'hub' ? (
        <AILabHub onLaunchChat={() => setCurrentView('chat')} />
      ) : (
        <div className={styles.chatView}>
          <button 
            className={styles.backButton}
            onClick={() => setCurrentView('hub')}
          >
            <FaArrowLeft /> Back to AI Lab Hub
          </button>
          <AIChat />
        </div>
      )}
    </section>
  );
};

export default AILab;
