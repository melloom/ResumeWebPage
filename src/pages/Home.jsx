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
        <title>Melvin Peralta | Full-Stack Developer & Sales Professional Portfolio</title>
        <meta name="description" content="Professional portfolio of Melvin Peralta - Full-Stack Developer, AI Integrator, and Sales Development Professional. Explore my projects, skills, and experience in web development, React, JavaScript, and business development." />
        <meta name="keywords" content="Melvin Peralta, Full-Stack Developer, Web Developer, React Developer, JavaScript, Frontend Developer, Sales Professional, Portfolio, Web Development, Software Engineer, Maryland Developer" />
        <meta name="author" content="Melvin Peralta" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://mellowsites.com/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mellowsites.com/" />
        <meta property="og:title" content="Melvin Peralta | Full-Stack Developer & Sales Professional Portfolio" />
        <meta property="og:description" content="Professional portfolio of Melvin Peralta - Full-Stack Developer, AI Integrator, and Sales Development Professional. Explore my projects, skills, and experience." />
        <meta property="og:image" content="https://mellowsites.com/photo-1.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Melvin Peralta Portfolio" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://mellowsites.com/" />
        <meta name="twitter:title" content="Melvin Peralta | Full-Stack Developer & Sales Professional Portfolio" />
        <meta name="twitter:description" content="Professional portfolio of Melvin Peralta - Full-Stack Developer, AI Integrator, and Sales Development Professional." />
        <meta name="twitter:image" content="https://mellowsites.com/photo-1.jpg" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Structured Data - Home/Portfolio */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "mainEntity": {
              "@type": "Person",
              "@id": "https://mellowsites.com/#person",
              "name": "Melvin Peralta",
              "alternateName": "MellowSites",
              "url": "https://mellowsites.com/",
              "image": "https://mellowsites.com/photo-1.jpg",
              "jobTitle": "Full-Stack Developer & Sales Professional",
              "description": "Full-Stack Developer and Sales Development Professional with expertise in React, JavaScript, and business development",
              "knowsAbout": ["React", "JavaScript", "Web Development", "Sales Development", "Frontend Development", "HTML", "CSS"],
              "sameAs": [
                "https://www.linkedin.com/in/melvin-peralta-de-la-cruz-077557215",
                "https://github.com/melloom",
                "https://mellowsites.com/about",
                "https://mellowsites.com/resume"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressRegion": "Maryland",
                "addressCountry": "US"
              },
              "email": "Melvin.a.p.cruz@gmail.com"
            },
            "url": "https://mellowsites.com/",
            "name": "Melvin Peralta - Portfolio",
            "description": "Professional portfolio showcasing web development projects and skills"
          })}
        </script>
        
        {/* BreadcrumbList for better navigation understanding */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://mellowsites.com/"
              }
            ]
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