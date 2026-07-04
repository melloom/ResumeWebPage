import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaPhoneAlt,
  FaArrowRight,
  FaHeart,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaGraduationCap,
  FaTools,
  FaShareAlt
} from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();
  const isContactPage = location.pathname === '/contact';

  const handleSectionNavigation = (sectionId, fallbackPath) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      const path = fallbackPath.split('#')[0];
      navigate(path);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
    }
  };

  // Simple share function to match styling approach of other links
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Melvin Peralta | Portfolio',
        text: 'Check out Melvin Peralta\'s professional portfolio',
        url: window.location.href,
      })
      .catch(() => {});
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGradient}></div>

      <div className="container">
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <Link to="/" className={styles.footerLogo}>
              <span>Melvin Peralta</span>
            </Link>
            <p className={styles.footerTagline}>
              Full-stack developer crafting modern web experiences with React, JavaScript, and a focus on clean design.
            </p>
            <div className={styles.contactInfo}>
              <a href="mailto:contact@mellowsites.com" className={styles.contactLink}>
                <FaEnvelope /> contact@mellowsites.com
              </a>
              <a href="tel:6672009784" className={styles.contactLink}>
                <FaPhoneAlt /> (667) 200-9784
              </a>
              <div className={styles.contactLink}>
                <FaMapMarkerAlt /> Maryland, USA
              </div>
            </div>
          </div>

          <div className={styles.footerNavs}>
            <div className={styles.footerNav}>
              <h3 className={styles.footerHeading}>Quick Links</h3>
              <ul className={styles.footerLinks}>
                <li>
                  <Link
                    to="/"
                    className={location.pathname === '/' ? styles.active : ''}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects"
                    className={location.pathname === '/projects' ? styles.active : ''}
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to="/resume"
                    className={location.pathname === '/resume' ? styles.active : ''}
                  >
                    Resume
                  </Link>
                </li>
                <li>
                  <button
                    className={styles.footerLinkButton}
                    onClick={() => handleSectionNavigation('about', '/')}
                  >
                    About Me
                  </button>
                </li>
                {/* Only show Contact link if not on the Contact page */}
                {!isContactPage && (
                  <li>
                    <Link
                      to="/contact"
                    >
                      Contact
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div className={styles.footerNav}>
              <h3 className={styles.footerHeading}>Professional</h3>
              <ul className={styles.footerLinks}>
                <li>
                  <button
                    className={styles.footerLinkButton}
                    onClick={() => handleSectionNavigation('experience', '/resume#experience')}
                  >
                    <FaCalendarAlt className={styles.linkIcon} /> Work Experience
                  </button>
                </li>
                <li>
                  <button
                    className={styles.footerLinkButton}
                    onClick={() => handleSectionNavigation('education', '/#education')}
                  >
                    <FaGraduationCap className={styles.linkIcon} /> Education
                  </button>
                </li>
                <li>
                  <button
                    className={styles.footerLinkButton}
                    onClick={() => handleSectionNavigation('skills', '/resume#skills')}
                  >
                    <FaTools className={styles.linkIcon} /> Skills
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Only show Contact CTA section if not on the Contact page */}
          {!isContactPage ? (
            <div className={styles.footerCTA}>
              <h3 className={styles.footerHeading}>Get In Touch</h3>
              <p>Ready to discuss opportunities? Reach out today!</p>
              <Link
                to="/contact"
                className={styles.footerButton}
              >
                Contact Me <FaArrowRight className={styles.buttonArrow} />
              </Link>
            </div>
          ) : (
            <div className={styles.footerCTA}>
              <h3 className={styles.footerHeading}>Connect With Me</h3>
              <p>Follow me on social media to stay updated with my latest projects and insights.</p>
              <div className={styles.ctaSocial}>
                <a href="https://github.com/melloom" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <FaGithub /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/melvin-peralta-de-la-cruz-077557215" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FaLinkedin /> LinkedIn
                </a>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>&copy; {currentYear} Melvin Peralta. All rights reserved.</p>
          </div>
          <div className={styles.social}>
            <a href="https://github.com/melloom" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="https://www.linkedin.com/in/melvin-peralta-de-la-cruz-077557215" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="mailto:contact@mellowsites.com" aria-label="Email">
              <FaEnvelope />
            </a>
            <button 
              onClick={handleShare} 
              className={styles.socialBtn} 
              aria-label="Share"
            >
              <FaShareAlt />
            </button>
          </div>
          <div className={styles.footerCredit}>
            <p>Made with <FaHeart className={styles.heartIcon} /> in Maryland, USA</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;