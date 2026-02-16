import React, { useState } from 'react';
import { FaGithub, FaExternalLinkAlt, FaCode, FaTag, FaStar } from 'react-icons/fa';
import styles from './SpecialDemos.module.css';

const SpecialDemos = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [expandedDemo, setExpandedDemo] = useState(null); // 'rosie' or 'flavor' or null
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleExpandDemo = (demo) => {
    setExpandedDemo(expandedDemo === demo ? null : demo);
  };

  return (
    <div 
      className={`${styles.card} ${isHovered ? styles.cardHovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.splitContainer}>
        {/* Single image that spans both halves */}
        <div className={`${styles.imageContainer} ${expandedDemo ? styles.hideOnExpandMobile : ''}`}>
          {!imageLoaded && isLoading && (
            <div className={styles.imageLoader}>
              <div className={styles.spinner}></div>
            </div>
          )}
          {imageError ? (
            <div className={styles.fallbackImage}>
              <FaCode size={32} />
              <span>Special Demos</span>
            </div>
          ) : (
            <img 
              src="/Split%203.png" 
              alt="Special Demos - Rosie's Kitchen, FlavorHaven, Tony's Pizza Shack" 
              className={styles.splitImage} 
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="eager"
              decoding="async"
            />
          )}
        </div>

        {/* Content halves aligned with image split */}
        <div className={styles.contentContainer}>
          {/* Left Half - Rosie's Kitchen */}
          <div className={`${styles.half} ${expandedDemo === 'rosie' ? styles.expanded : expandedDemo ? styles.collapsed : ''}`}>
            <div className={styles.contentHalf}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectTitle}>Rosie's Kitchen</h3>
                <button 
                  className={styles.expandButton}
                  onClick={() => handleExpandDemo('rosie')}
                  aria-label={expandedDemo === 'rosie' ? 'Collapse Rosie\'s Kitchen' : 'Expand Rosie\'s Kitchen'}
                >
                  {expandedDemo === 'rosie' ? '−' : '+'}
                </button>
              </div>
              
              <p className={styles.projectDescription}>Single-page restaurant website demo with elegant design and smooth interactions. Features modern responsive layout, beautiful animations, interactive menu sections, and professional contact form.</p>
              
              <div className={styles.links}>
                <a 
                  href="https://github.com/melloom/cozy-corner-site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.link} ${styles.githubLink}`}
                  aria-label="View Rosie's Kitchen source code on GitHub"
                >
                  <FaGithub /> GitHub
                </a>
                <a 
                  href="https://rosiekitchen.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.link} ${styles.demoLink}`}
                  aria-label="View live demo of Rosie's Kitchen"
                >
                  <FaExternalLinkAlt /> Live Demo
                </a>
              </div>
              
              <div className={styles.technologies}>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> React
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> JavaScript
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> HTML5
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> CSS3
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.verticalDivider}></div>

          {/* Right Half - FlavorHaven */}
          <div className={`${styles.half} ${expandedDemo === 'flavor' ? styles.expanded : expandedDemo ? styles.collapsed : ''}`}>
            <div className={styles.contentHalf}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectTitle}>FlavorHaven Demo</h3>
                <button 
                  className={styles.expandButton}
                  onClick={() => handleExpandDemo('flavor')}
                  aria-label={expandedDemo === 'flavor' ? 'Collapse FlavorHaven' : 'Expand FlavorHaven'}
                >
                  {expandedDemo === 'flavor' ? '−' : '+'}
                </button>
              </div>
              
              <p className={styles.projectDescription}>Multi-page restaurant demonstration with advanced routing and dynamic content management. Showcases separate pages for menu, reservations, about us, and gallery with smooth navigation.</p>
              
              <div className={styles.links}>
                <a 
                  href="https://github.com/melloom/FlavorHaven-Multi-Page-Demo-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.link} ${styles.githubLink}`}
                  aria-label="View FlavorHaven source code on GitHub"
                >
                  <FaGithub /> GitHub
                </a>
                <a 
                  href="https://flavorhavendemo.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.link} ${styles.demoLink}`}
                  aria-label="View live demo of FlavorHaven"
                >
                  <FaExternalLinkAlt /> Live Demo
                </a>
              </div>
              
              <div className={styles.technologies}>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> React
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> Multi-Page
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> Routing
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> Dynamic
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.verticalDivider}></div>

          {/* Right Half - Tony's Pizza */}
          <div className={`${styles.half} ${expandedDemo === 'tony' ? styles.expanded : expandedDemo ? styles.collapsed : ''}`}>
            <div className={styles.contentHalf}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectTitle}>Tony's Pizza</h3>
                <button 
                  className={styles.expandButton}
                  onClick={() => handleExpandDemo('tony')}
                  aria-label={expandedDemo === 'tony' ? 'Collapse Tony\'s Pizza' : 'Expand Tony\'s Pizza'}
                >
                  {expandedDemo === 'tony' ? '−' : '+'}
                </button>
              </div>
              
              <p className={styles.projectDescription}>Classic pizza restaurant website with online ordering system. Features menu customization, real-time order tracking, and customer loyalty program integration.</p>
              
              <div className={styles.links}>
                <a 
                  href="https://github.com/melloom/tony-pizza-demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.link} ${styles.githubLink}`}
                  aria-label="View Tony's Pizza source code on GitHub"
                >
                  <FaGithub /> GitHub
                </a>
                <a 
                  href="https://tonypizzademo.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.link} ${styles.demoLink}`}
                  aria-label="View live demo of Tony's Pizza"
                >
                  <FaExternalLinkAlt /> Live Demo
                </a>
              </div>
              
              <div className={styles.technologies}>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> React
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> E-commerce
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> Ordering
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> Tracking
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialDemos;
