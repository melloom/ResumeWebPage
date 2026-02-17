import React, { useState, useEffect } from 'react';
import AIChat from '../components/ai/AIChat';
import AILabHub from '../components/ai/AILabHub';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './AILab.module.css';

const AILab = () => {
  // Use hash to determine view - default to hub
  const [currentView, setCurrentView] = useState(() => {
    return window.location.hash === '#chat' ? 'chat' : 'hub';
  });

  // Update hash when view changes
  useEffect(() => {
    window.location.hash = currentView === 'chat' ? '#chat' : '';
  }, [currentView]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const newView = window.location.hash === '#chat' ? 'chat' : 'hub';
      setCurrentView(newView);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
          <AIChat autoStartVoice />
        </div>
      )}
    </section>
  );
};

export default AILab;
