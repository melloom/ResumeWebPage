import React, { useState, useEffect } from 'react';
import { FaHome, FaUser, FaBriefcase, FaGraduationCap, FaEnvelope, FaFileAlt, FaTools, FaCertificate, FaChevronRight } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { preloadRouteComponent } from '../../utils/routePreloader';
import styles from './MobileNavDrawer.module.css';

const MobileNavDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const isResumePage = location.pathname === '/resume';

  // Define section configurations based on current page
  const sections = isResumePage 
    ? [
        // Resume page sections
        { id: 'resume-header', icon: <FaFileAlt />, label: 'Overview' },
        { id: 'summary', icon: <FaUser />, label: 'Summary' },
        { id: 'experience', icon: <FaBriefcase />, label: 'Experience' },
        { id: 'skills', icon: <FaTools />, label: 'Skills' },
        { id: 'education', icon: <FaGraduationCap />, label: 'Education' },
        { id: 'certifications', icon: <FaCertificate />, label: 'Certifications' }
      ]
    : [
        // Home page sections
        { id: 'hero', icon: <FaHome />, label: 'Home' },
        { id: 'about', icon: <FaUser />, label: 'About' },
        { id: 'experience-container', icon: <FaBriefcase />, label: 'Experience' },
        { id: 'education-container', icon: <FaGraduationCap />, label: 'Education' },
        { id: 'contact-container', icon: <FaEnvelope />, label: 'Contact' }
      ];

  // Handle scrolling and detect current section
  useEffect(() => {
    const handleScroll = () => {
      // Get current scroll position
      const scrollPosition = window.scrollY + (window.innerHeight / 3);
      
      // Check if at very top of page
      if (window.scrollY < 100) {
        setActiveSection(isResumePage ? 'resume-header' : 'hero');
        return;
      }
      
      // Find current section
      let activeSectionFound = false;
      
      // Check sections in reverse order (bottom to top)
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = window.scrollY + rect.top;
          const sectionBottom = sectionTop + rect.height;
          
          // Check if scroll position is within this section
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(sections[i].id);
            activeSectionFound = true;
            break;
          }
        }
      }
      
      // If no section found and not at top, use first visible section
      if (!activeSectionFound && window.scrollY > 300) {
        for (let i = 0; i < sections.length; i++) {
          const section = document.getElementById(sections[i].id);
          if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              setActiveSection(sections[i].id);
              break;
            }
          }
        }
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Call once to set initial active section
    setTimeout(handleScroll, 300);
    
    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, isResumePage]);

  // Scroll to section function
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Set active section
      setActiveSection(id);
      
      // Close drawer after navigation with a slight delay for visual feedback
      setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }
  };

  // Toggle drawer
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Hide drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest(`.${styles.drawerToggle}`) && 
          !e.target.closest(`.${styles.drawer}`)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Preload the next page when the drawer is opened
  useEffect(() => {
    if (isOpen) {
      // Preload major routes when drawer is opened for quick navigation
      const pagesToPreload = ['/about', '/resume', '/contact'];
      pagesToPreload.forEach(route => {
        // Don't preload current page
        if (route !== location.pathname) {
          preloadRouteComponent(route);
        }
      });
    }
  }, [isOpen, location.pathname]);

  return (
    <div className={styles.mobileNavDrawer}>
      <button 
        className={`${styles.drawerToggle} ${isOpen ? styles.drawerOpen : ''}`}
        onClick={toggleDrawer}
        aria-label={isOpen ? "Close section navigation" : "Open section navigation"}
      >
        <FaChevronRight className={styles.toggleIcon} />
        <span className={styles.toggleLabel}>{isOpen ? "Close" : "Sections"}</span>
      </button>
      
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <ul className={styles.navList}>
          {sections.map((section) => (
            <li key={section.id} className={styles.navItem}>
              <button
                className={`${styles.navButton} ${activeSection === section.id ? styles.active : ''}`}
                onClick={() => scrollToSection(section.id)}
                aria-label={section.label}
                title={section.label}
              >
                <span className={styles.navIcon}>{section.icon}</span>
                <span className={styles.navLabel}>{section.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MobileNavDrawer;
