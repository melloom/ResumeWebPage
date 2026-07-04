import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { FaRocket, FaCode, FaPaintBrush, FaUsers, FaLightbulb } from 'react-icons/fa';
import styles from './AboutMe.module.css';

const AboutMe = React.forwardRef((_, ref) => {
  // InView hook for animation triggers
  const [inViewRef] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Refs for section elements
  const sectionRef = useRef(null);
  const imageColumnRef = useRef(null);

  // Detect mobile devices
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Combine refs (forwarded ref and inView ref)
  const setRefs = (element) => {
    // Handle the forwarded ref
    if (ref) {
      if (typeof ref === 'function') {
        ref(element);
      } else {
        ref.current = element;
      }
    }
    // Set the intersection observer ref
    inViewRef(element);
    // Also set our internal section ref
    if (sectionRef) {
      sectionRef.current = element;
    }
  };

  // Fix scrolling issues on mobile devices
  useEffect(() => {
    if (isMobile && sectionRef.current) {
      const section = sectionRef.current;

      // Use passive touch handlers to improve performance
      const handleTouch = (e) => {
        e.stopPropagation();
      };

      section.addEventListener('touchstart', handleTouch, { passive: true });
      section.addEventListener('touchmove', handleTouch, { passive: true });
      section.addEventListener('touchend', handleTouch, { passive: true });

      return () => {
        section.removeEventListener('touchstart', handleTouch);
        section.removeEventListener('touchmove', handleTouch);
        section.removeEventListener('touchend', handleTouch);
      };
    }
  }, [isMobile]);

  // Make profile image non-interactive on mobile to prevent issues
  useEffect(() => {
    if (isMobile && imageColumnRef.current) {
      const imageColumn = imageColumnRef.current;
      const images = imageColumn.querySelectorAll('img');

      // Disable all interaction with images
      images.forEach(img => {
        img.style.pointerEvents = 'none';
        img.style.touchAction = 'none';
        img.style.userSelect = 'none';
        img.style.webkitUserSelect = 'none';
        img.draggable = false;
      });

      // Also prevent interaction with the container
      imageColumn.style.pointerEvents = 'none';
      imageColumn.style.touchAction = 'none';
    }
  }, [isMobile]);

  return (
    <section className={styles.aboutWrapper} id="about">
      <div
        className={styles.aboutSection}
        ref={setRefs}
      >
        <div className={styles.aboutGlow}></div>

        <div className="container">
          {/* Section Header */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.aboutTitle}>About Me</h2>
            <p className={styles.aboutSubtitle}>
              <span className={styles.highlightText}>Full-Stack Developer</span> •{' '}
              <span className={styles.subtleText}>React & JavaScript</span> •{' '}
              <span className={styles.subtleText}>Modern Web Apps</span>
            </p>
          </div>

          <div className={styles.aboutContentGrid}>
            {/* Profile Image Column */}
            <div
              ref={imageColumnRef}
              className={styles.aboutImageColumn}
              aria-hidden={isMobile ? "true" : "false"}
            >
              <div className={styles.imageContainer}>
                <img
                  src="/photo-2.jpg"
                  alt="Melvin Peralta"
                  className={`${styles.profileImage} ${styles.active}`}
                  draggable="false"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/photo-1.jpg";
                  }}
                />
                <div className={styles.imageOverlay}></div>
              </div>

              <div className={styles.profileStats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>20+</div>
                  <div className={styles.statLabel}>Projects Built</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>5+</div>
                  <div className={styles.statLabel}>Technologies</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>100%</div>
                  <div className={styles.statLabel}>Passion for Code</div>
                </div>
              </div>
            </div>

            {/* Text Column */}
            <div className={styles.aboutTextColumn}>
              <div className={styles.aboutContent}>
                <h3 className={styles.aboutGreeting}>
                  Hello, I'm <span className={styles.nameHighlight}>Melvin Peralta</span>
                </h3>

                <div className={styles.taglineContainer}>
                  <div className={styles.taglineIcon}><FaRocket /></div>
                  <h4 className={styles.tagline}>Building Modern Web Applications</h4>
                </div>

                <div className={styles.aboutDescription}>
                  <p>
                    I'm a <span className={styles.highlight}>full-stack developer</span> passionate about creating innovative web solutions. This is my coding library where I showcase projects built with <span className={styles.highlight}>React, JavaScript, and modern web technologies</span>.
                  </p>

                  <p>
                    I specialize in building <span className={styles.highlight}>responsive, user-friendly applications</span> with clean code and thoughtful design. From interactive portfolios to complex web apps, I focus on creating seamless experiences that solve real problems.
                  </p>

                  <p>
                    My expertise includes <span className={styles.highlight}>React, JavaScript, TypeScript, Node.js, and Firebase</span>. I'm constantly learning and experimenting with new technologies to build better, faster, and more accessible web applications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Strengths Cards */}
          <div className={styles.strengthsSection}>
            <h3 className={styles.strengthsTitle}>Core Strengths</h3>

            <div className={styles.strengthsGrid}>
              <div className={styles.strengthCard}>
                <div className={styles.cardIcon}>
                  <FaRocket />
                </div>
                <h4 className={styles.cardTitle}>Fast & Performant</h4>
                <p className={styles.cardText}>
                  Focused on speed and performance from the start — optimized builds, lazy loading, and efficient rendering for a snappy user experience.
                </p>
              </div>

              <div className={styles.strengthCard}>
                <div className={styles.cardIcon}>
                  <FaCode />
                </div>
                <h4 className={styles.cardTitle}>Clean Code</h4>
                <p className={styles.cardText}>
                  Writing readable, maintainable code with clear structure. Component-based architecture and thoughtful abstractions keep projects scalable.
                </p>
              </div>

              <div className={styles.strengthCard}>
                <div className={styles.cardIcon}>
                  <FaPaintBrush />
                </div>
                <h4 className={styles.cardTitle}>Polished Design</h4>
                <p className={styles.cardText}>
                  Attention to detail in every interaction — smooth animations, responsive layouts, and consistent styling across all screen sizes.
                </p>
              </div>

              <div className={styles.strengthCard}>
                <div className={styles.cardIcon}>
                  <FaUsers />
                </div>
                <h4 className={styles.cardTitle}>User-Centered</h4>
                <p className={styles.cardText}>
                  Building with accessibility and usability in mind. Every feature is designed to serve real users with intuitive, inclusive interfaces.
                </p>
              </div>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className={styles.philosophy}>
            <div className={styles.philosophyContent}>
              <div className={styles.philosophyIcon}>
                <FaLightbulb />
              </div>
              <h3 className={styles.philosophyTitle}>My Professional Philosophy</h3>
              <blockquote className={styles.philosophyQuote}>
                "I believe great software comes from genuinely understanding the problem and caring about the people who use it. My approach combines technical rigor with a focus on simplicity to build things that are both powerful and intuitive."
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

AboutMe.displayName = 'AboutMe';

export default AboutMe;