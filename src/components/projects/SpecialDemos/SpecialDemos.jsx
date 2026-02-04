import React, { useState } from 'react';
import { FaGithub, FaExternalLinkAlt, FaCode, FaTag, FaStar } from 'react-icons/fa';
import styles from './SpecialDemos.module.css';

const SpecialDemos = () => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div 
      className={`${styles.card} ${isHovered ? styles.cardHovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.splitContainer}>
        {/* Single image that spans both halves */}
        <div className={styles.imageContainer}>
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
              loading="lazy"
            />
          )}
        </div>

        {/* Content halves aligned with image split */}
        <div className={styles.contentContainer}>
          {/* Left Half - Rosie's Kitchen */}
          <div className={styles.half}>
            <div className={styles.contentHalf}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectTitle}>Rosie's Kitchen</h3>
                <div className={styles.featuredBadge}>
                  <FaStar /> Featured
                </div>
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

          {/* Middle - FlavorHaven */}
          <div className={styles.half}>
            <div className={styles.contentHalf}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectTitle}>FlavorHaven Demo</h3>
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

          {/* Right - Tony's Pizza Shack */}
          <div className={styles.half}>
            <div className={styles.contentHalf}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectTitle}>Tony's Pizza Shack</h3>
              </div>
              
              <p className={styles.projectDescription}>Family-owned wood-fired pizza restaurant demo. Full restaurant experience with menu, ordering flow, and modern responsive design. Built with React, TypeScript, and Drizzle.</p>
              
              <div className={styles.links}>
                <a 
                  href="https://github.com/melloom/Pizza-Demo-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.link} ${styles.githubLink}`}
                  aria-label="View Tony's Pizza Shack source code on GitHub"
                >
                  <FaGithub /> GitHub
                </a>
                <a 
                  href="https://pizzashopdemos.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.link} ${styles.demoLink}`}
                  aria-label="View live demo of Tony's Pizza Shack"
                >
                  <FaExternalLinkAlt /> Live Demo
                </a>
              </div>
              
              <div className={styles.technologies}>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> React
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> TypeScript
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> Drizzle
                </span>
                <span className={styles.tech}>
                  <FaTag className={styles.techIcon} /> Vite
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
