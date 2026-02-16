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
        <title>MellowSites | Web Design & Development Studio</title>
        <meta name="description" content="MellowSites crafts modern, performant websites and landing pages for businesses. Explore our web design, development, and optimization work." />
        <meta name="keywords" content="MellowSites, web design, web development, landing pages, websites for business, React developer, JavaScript, frontend" />
        <meta name="author" content="MellowSites" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://mellowsites.com/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mellowsites.com/" />
        <meta property="og:title" content="MellowSites | Web Design & Development Studio" />
        <meta property="og:description" content="MellowSites builds tailored websites and digital experiences for growing brands." />
        <meta property="og:image" content="https://mellowsites.com/photo-1.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="MellowSites" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://mellowsites.com/" />
        <meta name="twitter:title" content="MellowSites | Web Design & Development Studio" />
        <meta name="twitter:description" content="MellowSites builds tailored websites and digital experiences for growing brands." />
        <meta name="twitter:image" content="https://mellowsites.com/photo-1.jpg" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Structured Data - WebSite */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://mellowsites.com/",
            "name": "MellowSites",
            "alternateName": ["Mellow Sites", "MellowSites.com"]
          })}
        </script>

        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "url": "https://mellowsites.com/",
            "name": "MellowSites",
            "logo": "https://mellowsites.com/logo.png"
          })}
        </script>
      </Helmet>
      
      <SideNav />
      <BackToTop /> 
      <MobileNavDrawer />
      <main id="top">
        {/* Hero section with prefetch */}
        <section id="hero">
          <Hero
            name="MellowSites"
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