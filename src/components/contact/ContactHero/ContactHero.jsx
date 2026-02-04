import React, { useEffect } from 'react';
import { FaEnvelope, FaArrowRight, FaComment, FaVideo, FaPhone } from 'react-icons/fa';
import styles from './ContactHero.module.css';

const ContactHero = () => {
  // Handle smooth scroll to contact form section
  const scrollToForm = (e) => {
    e.preventDefault();
    const formSection = document.getElementById('contact-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Initialize Calendly scripts
  useEffect(() => {
    // Add Calendly CSS
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (link.parentNode) document.head.removeChild(link);
      if (script.parentNode) document.body.removeChild(script);
    };
  }, []);

  // Open Calendly popup for Zoom meeting
  const openZoomScheduling = (e) => {
    e.preventDefault();
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/melvin-a-p-cruz/30min'
      });
    }
  };

  // Open Calendly popup for Phone call
  const openPhoneScheduling = (e) => {
    e.preventDefault();
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/melvin-a-p-cruz/phone-call'
      });
    }
  };
  
  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Let's Start a <span className={styles.gradient}>Conversation</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            I'd love to hear from you! Whether you have a question, want to discuss 
            a potential opportunity, or just want to say hello, I'm here to help.
          </p>
          
          <div className={styles.heroCta}>
            <div className={styles.ctaButtonGroup}>
              <button 
                onClick={scrollToForm} 
                className={styles.ctaButton}
              >
                <FaEnvelope className={styles.ctaIcon} />
                Send Me a Message
                <FaArrowRight className={styles.arrowIcon} />
              </button>
              
              <div className={styles.scheduleButtons}>
                <button onClick={openZoomScheduling} className={styles.scheduleButton}>
                  <FaVideo className={styles.scheduleIcon} />
                  Schedule Zoom
                </button>
                <button onClick={openPhoneScheduling} className={styles.scheduleButton}>
                  <FaPhone className={styles.scheduleIcon} />
                  Schedule Call
                </button>
              </div>
            </div>
            
            <div className={styles.response}>
              <div className={styles.responseIconWrapper}>
                <FaComment className={styles.responseIcon} />
              </div>
              <div className={styles.responseText}>
                <span className={styles.responseHighlight}>Quick Response</span>
                <span>I typically respond within 24-48 hours</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.heroImage}>
          <div className={styles.imageContainer}>
            <img 
              src="/photo-4.jpg" 
              alt="Melvin Peralta" 
              className={styles.profileImage}
              onError={(e) => {
                console.error("Failed to load profile image");
                e.target.src = "https://via.placeholder.com/500x400?text=Profile+Photo";
              }}
            />
          </div>
          <div className={styles.decorCircle1}></div>
          <div className={styles.decorCircle2}></div>
        </div>
      </div>
    </div>
  );
};

export default ContactHero;
