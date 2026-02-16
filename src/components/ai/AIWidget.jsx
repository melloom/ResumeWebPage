import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaRobot, FaTimes, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import AIChat from './AIChat';
import styles from './AIWidget.module.css';

const ROUTE_PAGE_SUMMARY = {
  '/': 'Home — hero, about, experience, education, contact',
  '/about': 'About — Melvin\'s story, approach, values, work style',
  '/projects': 'Projects — filterable grid of Melvin\'s projects with details',
  '/resume': 'Resume — experience, skills, education, certifications',
  '/contact': 'Contact — ways to reach Melvin, form, Calendly',
  '/ai-lab': 'AI Lab — full-screen chat and voice assistant',
};

const PATH_LABELS = {
  '/': 'Home',
  '/about': 'About',
  '/projects': 'Projects',
  '/resume': 'Resume',
  '/contact': 'Contact',
  '/ai-lab': 'AI Lab',
};

const QUICK_ACTIONS = [
  { label: 'Summarize page', message: 'Summarize what this page is about and what I can do here.' },
  { label: 'Help with form', message: 'I need help filling out a form on this page. What should I prepare?' },
  { label: 'Explain section', message: 'Explain this section in simple terms and how it relates to Melvin\'s work.' },
];

const AIWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedPath, setSuggestedPath] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const chatRef = useRef(null);

  const route = location.pathname || '/';
  const hideWidget = route === '/ai-lab';
  const pageSummary = ROUTE_PAGE_SUMMARY[route] ?? `Page: ${route}`;
  const pageContext = { route, pageSummary };

  const handleQuickAction = (message) => {
    if (chatRef.current?.sendMessage) {
      chatRef.current.sendMessage(message);
    }
  };

  const handleSuggestNavigation = (path) => {
    setSuggestedPath(path);
  };

  const handleGoToPage = () => {
    if (suggestedPath) {
      navigate(suggestedPath);
      setSuggestedPath(null);
      setIsOpen(false);
    }
  };

  if (hideWidget) return null;

  return (
    <>
      <button
        type="button"
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI assistant"
      >
        <FaRobot className={styles.fabIcon} />
        <span className={styles.fabLabel}>Ask Mellow</span>
      </button>

      <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`} aria-hidden={!isOpen}>
        <div className={styles.backdrop} onClick={() => setIsOpen(false)} aria-hidden="true" />
        <div className={styles.card} role="dialog" aria-label="AI chat">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Melvin&apos;s AI</span>
            <div className={styles.cardHeaderActions}>
              <button
                type="button"
                className={styles.cardReset}
                onClick={() => chatRef.current?.resetChat?.()}
                aria-label="Reset chat"
                title="Reset chat"
              >
                <FaTrash />
              </button>
              <button
                type="button"
                className={styles.cardClose}
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className={styles.chips}>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                className={styles.chip}
                onClick={() => handleQuickAction(action.message)}
              >
                {action.label}
              </button>
            ))}
          </div>

          {suggestedPath && (
            <div className={styles.goToBar}>
              <button
                type="button"
                className={styles.goToBtn}
                onClick={handleGoToPage}
              >
                <FaExternalLinkAlt />
                <span>Go to {PATH_LABELS[suggestedPath] ?? suggestedPath}</span>
              </button>
              <button
                type="button"
                className={styles.goToDismiss}
                onClick={() => setSuggestedPath(null)}
                aria-label="Dismiss"
              >
                <FaTimes />
              </button>
            </div>
          )}

          <div className={styles.chatWrap}>
            <AIChat
              ref={chatRef}
              pageContext={pageContext}
              compact
              autoStartVoice
              onSuggestNavigation={handleSuggestNavigation}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AIWidget;
