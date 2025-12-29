import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { preloadRouteComponent } from '../utils/routePreloader';
import Hero from '../components/home/Hero/Hero';
import AboutMe from '../components/home/AboutMe/AboutMe';
import Experience from '../components/home/Experience/Experience';
import Education from '../components/home/Education/Education';
import Contact from '../components/home/Contact/Contact';
import SideNav from '../components/navigation/SideNav';
import BackToTop from '../components/common/BackToTop';
import MobileNavDrawer from '../components/navigation/MobileNavDrawer';

function Home() {
  // Reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Make sure sections have proper IDs matching what SideNav is looking for
  useEffect(() => {
    // Log all section containers to help debugging
    console.log("Hero section:", document.getElementById('hero'));
    console.log("About section:", document.getElementById('about'));
    console.log("Experience container:", document.getElementById('experience-container'));
    console.log("Education container:", document.getElementById('education-container'));
    console.log("Contact container:", document.getElementById('contact-container'));
  }, []);

  // Define custom job titles - updated to show broader professional skills
  const jobTitles = [
    "Web Developer", 
    "IT Professional",
    "Frontend Engineer",
    "Customer Experience Specialist",
    "Technical Support Specialist",
    "JavaScript Developer",
    "UI/UX Enthusiast",
    "Problem Solver",
    "Digital Solutions Expert",
    "Project Coordinator"
  ];

  // Preload routes on mount for faster navigation
  useEffect(() => {
    // Preload key routes on homepage load after a short delay
    const timer = setTimeout(() => {
      preloadRouteComponent('/about');
      preloadRouteComponent('/resume');
      preloadRouteComponent('/contact');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Prefetch when user shows intent to navigate (mouse hover, touch, etc)
  const handleNavigationIntent = (path) => {
    preloadRouteComponent(path);
  };

  return (
    <>
      <Helmet>
        <title>Melvin Peralta | Professional Portfolio</title>
        <meta name="description" content="Professional portfolio of Melvin Peralta - Sales Development Representative with expertise in team leadership and client relationship management." />
      </Helmet>
      
      <SideNav />
      <BackToTop /> 
      <MobileNavDrawer />
      <main id="top">
        {/* Hero section with prefetch */}
        <section id="hero">
          <Hero
            name="Melvin Peralta"
            profileImage="/photo-1.jpg"
            jobTitles={jobTitles}
            onNavigationIntent={handleNavigationIntent} // Pass down the prefetch handler
          />
        </section>

        <AboutMe />

        <div id="experience-container" className="section-container">
          <Experience />
        </div>

        <div id="education-container" className="section-container">
          <Education />
        </div>

        <div id="contact-container" className="section-container">
          <Contact 
            onNavigationIntent={handleNavigationIntent} // Pass down the prefetch handler
          />
        </div>
        
        {/* Add a navigation preview section */}
        <section className="nav-preview-section">
          <div className="container">
            <div className="nav-preview-grid">
              {[
                { path: '/about', label: 'About Me', icon: 'FaUser' },
                { path: '/resume', label: 'Resume', icon: 'FaFileAlt' },
                { path: '/contact', label: 'Contact', icon: 'FaEnvelope' }
              ].map(item => (
                <Link 
                  key={item.path}
                  to={item.path}
                  className="nav-preview-card"
                  onMouseEnter={() => handleNavigationIntent(item.path)}
                  onTouchStart={() => handleNavigationIntent(item.path)}
                >
                  {/* Add content here */}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;