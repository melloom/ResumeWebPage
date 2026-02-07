import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaBars, FaTimes, FaHome, FaFileAlt, FaEnvelope, FaUser, FaCode, FaShareAlt, FaSignOutAlt, FaPlus, FaBlog } from 'react-icons/fa';
import { preloadRouteComponent } from '../../utils/routePreloader';
import ShareButton from '../common/ShareButton';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

// Accept theme and toggleTheme as props instead of using context
const Header = ({ theme = 'dark', toggleTheme, onAddProject }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Track current path for active links and close menu on route change
  useEffect(() => {
    // Clear menu when route changes
    setIsMenuOpen(false);
    // Scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  // Handle scroll events to show/hide header and apply scrolled styles
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 70; // Amount of scroll before applying scrolled style
      const scrollDifference = 50; // Minimum difference to trigger hide/show

      // Apply scrolled styling
      setIsScrolled(currentScrollY > scrollThreshold);

      // Show/hide header based on scroll direction
      if (Math.abs(currentScrollY - lastScrollY) > scrollDifference) {
        // Don't hide when near the top
        if (currentScrollY < 150) {
          setIsHeaderVisible(true);
        } else {
          setIsHeaderVisible(currentScrollY < lastScrollY);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Preload components on hover/focus
  const handleLinkHover = (path) => {
    preloadRouteComponent(path);
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();
      if (result.success) {
        // Logout successful
        setIsMenuOpen(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle add project
  const handleAddProject = () => {
    if (onAddProject) {
      onAddProject();
    }
    setIsMenuOpen(false);
  };

  // Handle blog link with loading transition
  const handleBlogLink = () => {
    // Add loading state
    document.body.classList.add('loading-transition');
    
    // Navigate to blog after a short delay for transition effect
    setTimeout(() => {
      window.open('https://wiredliving.blog', '_blank');
      document.body.classList.remove('loading-transition');
    }, 300);
  };

  const isActive = (path) => location.pathname === path;
  const headerClass = `${styles.header} ${isScrolled ? styles.headerScrolled : ''} ${!isHeaderVisible ? styles.headerHidden : ''}`;

  // Add share function
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Melvin Peralta | Portfolio',
        text: 'Check out Melvin Peralta\'s professional portfolio',
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <header className={headerClass}>
        <div className={styles.container}>
          <Link 
            to="/" 
            className={styles.logo}
            onMouseEnter={() => handleLinkHover('/')}
            onFocus={() => handleLinkHover('/')}
          >
            <span className={styles.logoText}>Melvin Peralta</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <Link 
                  to="/" 
                  className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
                  onMouseEnter={() => handleLinkHover('/')}
                  onFocus={() => handleLinkHover('/')}
                >
                  <FaHome className={styles.navIcon} /> Home
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link 
                  to="/about" 
                  className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}
                  onMouseEnter={() => handleLinkHover('/about')}
                  onFocus={() => handleLinkHover('/about')}
                >
                  <FaUser className={styles.navIcon} /> About Me
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link 
                  to="/projects" 
                  className={`${styles.navLink} ${isActive('/projects') ? styles.active : ''}`}
                  onMouseEnter={() => handleLinkHover('/projects')}
                  onFocus={() => handleLinkHover('/projects')}
                >
                  <FaCode className={styles.navIcon} /> Projects
                </Link>
              </li>
              <li className={styles.navItem}>
                <button 
                  onClick={handleBlogLink}
                  className={`${styles.navLink} ${styles.blogLink}`}
                  aria-label="Visit my blog"
                >
                  <FaBlog className={styles.navIcon} /> My Blog
                </button>
              </li>
              <li className={styles.navItem}>
                <Link 
                  to="/resume" 
                  className={`${styles.navLink} ${isActive('/resume') ? styles.active : ''}`}
                  onMouseEnter={() => handleLinkHover('/resume')}
                  onFocus={() => handleLinkHover('/resume')}
                >
                  <FaFileAlt className={styles.navIcon} /> Resume
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link 
                  to="/contact" 
                  className={`${styles.navLink} ${isActive('/contact') ? styles.active : ''}`}
                  onMouseEnter={() => handleLinkHover('/contact')}
                  onFocus={() => handleLinkHover('/contact')}
                >
                  <FaEnvelope className={styles.navIcon} /> Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Controls Section */}
          <div className={styles.controls}>
            <button 
              onClick={handleShare}
              className={styles.shareButton}
              aria-label="Share this page"
            >
              <FaShareAlt />
            </button>
            <button 
              onClick={toggleTheme}
              className={`${styles.themeButton} ${theme === 'dark' ? styles.darkMode : styles.lightMode}`}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>

            {/* Add Project Button - Only show when authenticated */}
            {isAuthenticated && (
              <button 
                onClick={handleAddProject}
                className={styles.addProjectButton}
                aria-label="Add new project"
                title="Add new project to portfolio"
              >
                <FaPlus />
                <span>Add Project</span>
              </button>
            )}

            {/* Logout Button - Only show when authenticated */}
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className={`${styles.logoutButton} ${isLoggingOut ? styles.loading : ''}`}
                disabled={isLoggingOut}
                aria-label="Logout"
                title={`Logout (${user?.email})`}
              >
                {isLoggingOut ? (
                  <>
                    <div className={styles.spinner}></div>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </>
                )}
              </button>
            )}

            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={styles.mobileMenuWrapper}>
        {/* Overlay */}
        <div 
          className={`${styles.sidebarOverlay} ${isMenuOpen ? styles.visible : ''}`}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        ></div>
        
        {/* Sidebar Content */}
        <div className={`${styles.sidebarMenu} ${isMenuOpen ? styles.open : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>Menu</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Mobile Menu Links */}
          <nav className={styles.sidebarNav}>
            <ul className={styles.sidebarList}>
              <li className={styles.sidebarItem}>
                <Link 
                  to="/" 
                  className={`${styles.sidebarLink} ${isActive('/') ? styles.active : ''}`}
                >
                  <FaHome className={styles.sidebarIcon} /> Home
                </Link>
              </li>
              <li className={styles.sidebarItem}>
                <Link 
                  to="/about" 
                  className={`${styles.sidebarLink} ${isActive('/about') ? styles.active : ''}`}
                >
                  <FaUser className={styles.sidebarIcon} /> About Me
                </Link>
              </li>
              <li className={styles.sidebarItem}>
                <Link 
                  to="/projects" 
                  className={`${styles.sidebarLink} ${isActive('/projects') ? styles.active : ''}`}
                >
                  <FaCode className={styles.sidebarIcon} /> Projects
                </Link>
              </li>
              <li className={styles.sidebarItem}>
                <button 
                  onClick={handleBlogLink}
                  className={`${styles.sidebarLink} ${styles.blogLink}`}
                  aria-label="Visit my blog"
                >
                  <FaBlog className={styles.sidebarIcon} /> My Blog
                </button>
              </li>
              <li className={styles.sidebarItem}>
                <Link 
                  to="/resume" 
                  className={`${styles.sidebarLink} ${isActive('/resume') ? styles.active : ''}`}
                >
                  <FaFileAlt className={styles.sidebarIcon} /> Resume
                </Link>
              </li>
              <li className={styles.sidebarItem}>
                <Link 
                  to="/contact" 
                  className={`${styles.sidebarLink} ${isActive('/contact') ? styles.active : ''}`}
                >
                  <FaEnvelope className={styles.sidebarIcon} /> Contact
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Mobile Theme Toggle, Share, and Logout */}
          <div className={styles.sidebarFooter}>
            <div className={styles.mobileActions}>
              <div className={styles.mobileThemeToggle}>
                <span className={styles.themeLabel}>
                  {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </span>
                <button 
                  onClick={toggleTheme}
                  className={`${styles.themeButton} ${theme === 'dark' ? styles.darkMode : styles.lightMode}`}
                  aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>
              </div>
              
              <div className={styles.mobileShareButton}>
                <span className={styles.shareLabel}>Share this page</span>
                <button 
                  onClick={handleShare}
                  className={styles.sidebarShareBtn}
                  aria-label="Share this page"
                >
                  <FaShareAlt />
                </button>
              </div>

              {/* Mobile Add Project Button - Only show when authenticated */}
              {isAuthenticated && (
                <div className={styles.mobileAddProjectButton}>
                  <span className={styles.addProjectLabel}>Add Project</span>
                  <button 
                    onClick={handleAddProject}
                    className={styles.sidebarAddProjectBtn}
                    aria-label="Add new project"
                  >
                    <FaPlus />
                    <span>Add Project</span>
                  </button>
                </div>
              )}

              {/* Mobile Logout Button - Only show when authenticated */}
              {isAuthenticated && (
                <div className={styles.mobileLogoutButton}>
                  <span className={styles.logoutLabel}>Logout</span>
                  <button 
                    onClick={handleLogout}
                    className={`${styles.sidebarLogoutBtn} ${isLoggingOut ? styles.loading : ''}`}
                    disabled={isLoggingOut}
                    aria-label="Logout"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className={styles.spinner}></div>
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;