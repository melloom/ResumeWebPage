import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProjectHero from '../components/projects/ProjectHero/ProjectHero';
import ProjectList from '../components/projects/ProjectList/ProjectList';
import styles from './Projects.module.css';

const Projects = ({ userProjects = [], isLoading = false, onProjectDeleted }) => {
  const location = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <Helmet>
        <title>Projects - Melvin Peralta | Web Development Portfolio & Showcase</title>
        <meta name="description" content="Explore Melvin Peralta's portfolio of web development projects. Featured projects include RocketRAM, Vocalix, Long Home, GhostInbox, BrandSaaS, and more. Built with React, JavaScript, TypeScript, and modern web technologies." />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="keywords" content="Melvin Peralta, Projects, Portfolio, Web Development, React Projects, JavaScript Projects, Web Applications, Software Projects, Full-Stack Development, Frontend Development, GitHub Projects" />
        <meta name="author" content="Melvin Peralta" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://mellowsites.com/projects" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mellowsites.com/projects" />
        <meta property="og:title" content="Projects - Melvin Peralta | Web Development Portfolio & Showcase" />
        <meta property="og:description" content="Explore Melvin Peralta's portfolio of web development projects. Featured projects include RocketRAM, Vocalix, Long Home, GhostInbox, BrandSaaS, and more." />
        <meta property="og:image" content="https://mellowsites.com/screenshots/portfolio-portfolio-thumbnail.png" />
        <meta property="og:site_name" content="Melvin Peralta Portfolio" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://mellowsites.com/projects" />
        <meta name="twitter:title" content="Projects - Melvin Peralta | Web Development Portfolio & Showcase" />
        <meta name="twitter:description" content="Explore Melvin Peralta's portfolio of web development projects. Featured projects include RocketRAM, Vocalix, Long Home, GhostInbox, BrandSaaS, and more." />
        <meta name="twitter:image" content="https://mellowsites.com/screenshots/portfolio-portfolio-thumbnail.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Projects - Melvin Peralta",
            "description": "Portfolio of web development projects by Melvin Peralta",
            "url": "https://mellowsites.com/projects",
            "author": {
              "@type": "Person",
              "name": "Melvin Peralta"
            },
            "mainEntity": {
              "@type": "ItemList",
              "name": "Web Development Projects",
              "description": "Collection of web development projects"
            }
          })}
        </script>
      </Helmet>
      
      <div className={styles.projectsPage}>
        <ProjectHero />
        <ProjectList 
          userProjects={userProjects} 
          isLoading={isLoading} 
          onDeleteProject={onProjectDeleted}
        />
      </div>
    </>
  );
};

export default Projects; 