import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, memo } from 'react';
import ProjectCard from '../ProjectCard/ProjectCard';
import styles from './ProjectList.module.css';

// Lazy load SpecialDemos to reduce initial bundle size
const SpecialDemos = lazy(() => import('../SpecialDemos/SpecialDemos'));

// Memoized ProjectCard to prevent unnecessary re-renders
const MemoizedProjectCard = memo(ProjectCard, (prevProps, nextProps) => {
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.title === nextProps.project.title &&
    prevProps.project.image === nextProps.project.image &&
    prevProps.isLoading === nextProps.isLoading
  );
});

const ProjectList = ({ userProjects = [], isLoading: userProjectsLoading = false, onDeleteProject }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Available categories - memoized to prevent recreation
  const categories = useMemo(() => ['All', 'Tools', 'Apps', 'Websites', 'Demo', 'Other'], []);

  // Static projects data - moved outside component to prevent recreation
  const staticProjects = useMemo(() => [
    {
      id: 19,
      title: 'CodeGuardian',
      description: 'AI-Powered Code Review & Debugging Platform - An intelligent platform designed to streamline code review and debugging processes using artificial intelligence to help developers identify and resolve code issues more efficiently.',
      image: '/Codeguard.png',
      technologies: ['JavaScript', 'React', 'AI/ML', 'Node.js', 'Netlify', 'Firebase'],
      link: 'https://thecodeguard.netlify.app',
      github: 'https://github.com/melloom/code-guardian',
      category: 'Tools'
    },
    {
      id: 18,
      title: 'DevHub Connect',
      description: 'A modern developer community platform to showcase projects, discover collaborators, and keep the conversation going. Features an immersive landing experience, Firebase authentication, project discovery, Reddit-style community threads, realtime comments, messaging, feedback endpoints with Nodemailer, and a security-first middleware layer. Responsive UI with dark/light theming support.',
      image: '/devhub.png',
      technologies: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'Firebase', 'Express', 'React Query', 'Framer Motion'],
      link: 'https://devhub-connect.space',
      github: '',
      category: 'Apps'
    },
    {
      id: 17,
      title: 'Barber Demo Site',
      description: 'A professional barber shop website demo showcasing modern web design and development. Features a clean, responsive layout with appointment booking, service showcase, and customer testimonials.',
      image: '/Blade&Crown Demo.png',
      technologies: ['React', 'HTML5', 'CSS3', 'JavaScript'],
      link: 'https://barber-demo-site.replit.app/',
      github: 'https://github.com/melloom/Barber-Demo-Site',
      category: 'Demo'
    },
    {
      id: 16,
      title: 'FunnelFox',
      description: 'A lead generation web application built for web developers to discover, track, and manage potential clients. Searches the web for businesses, analyzes their websites for quality issues, and provides a CRM-style pipeline to manage outreach from discovery through conversion.',
      image: '/FunnelFoxTN.png',
      technologies: ['React', 'Vite', 'Tailwind CSS', 'Shadcn UI', 'Express.js', 'Node.js', 'PostgreSQL', 'Drizzle ORM'],
      link: 'https://funnelfox.org',
      github: '',
      category: 'Tools'
    },
    {
      id: 15,
      title: 'MellowQuote',
      description: 'A website pricing calculator I built for myself to streamline my quoting process. No more back-and-forth emails trying to figure out what a client needs — just send them the link and let them build their own quote. Features a multi-step wizard for single/multi-page sites, industry selection, features & add-ons, design complexity, and timeline preferences. Generates instant quotes with PDF delivery to my inbox.',
      image: '/mellowquotes.png',
      technologies: ['Next.js', 'React 18', 'TailwindCSS', 'Nodemailer', 'jsPDF', 'html2canvas', 'Netlify'],
      link: 'https://mellowquote.netlify.app',
      github: 'https://github.com/melloom/Website-Calc',
      category: 'Tools'
    },
    {
      id: 14,
      title: 'If I Was Honest',
      description: 'A private journaling and mental wellness app. Write honestly in a private, incognito space. Publish anonymously if you choose. Track your personal growth with reflection statuses — no likes, no comments, no social pressure. Features mood tracking, soft delete, and an anonymized public feed for gentle sharing.',
      image: '/Ifiwashonest.png',
      technologies: ['Next.js', 'Prisma', 'Turso', 'libSQL', 'NextAuth', 'Tailwind CSS', 'TypeScript'],
      link: 'https://thehonestproject.netlify.app',
      github: 'https://github.com/melloom/If-I-Was-Honest',
      category: 'Apps'
    },
    {
      id: 12,
      title: 'WiredLiving Blog',
      description: 'A personal blog about technology and modern living. Features fresh insights weekly, practical advice, and community-driven content about digital wellness and productivity.',
      image: '/wire.png',
      technologies: ['Next.js', 'NextAuth', 'Node.js', 'Vercel'],
      link: 'https://wiredliving.vercel.app',
      github: 'https://github.com/melloom/WiredLiving',
      category: 'Websites'
    },
    {
      id: 1,
      title: '🚀 RocketRAM',
      description: 'A complete PC performance tool project featuring both a modern cyberpunk-themed landing page and a powerful desktop application. The desktop app provides real-time system monitoring (CPU, RAM, Disk, Network), advanced process management, antivirus protection, smart cleaning, system optimization, auto-scheduling, and health scoring. Built with Electron for the desktop app and a fully responsive landing page with modern animations and particle effects. One unified project showcasing both the marketing site and the actual performance tool.',
      image: '/rocketram.png',
      technologies: ['Electron', 'Node.js', 'HTML5', 'CSS3', 'JavaScript', 'Netlify'],
      link: 'https://rocketram.netlify.app',
      github: 'https://github.com/melloom/RocketRAM',
      additionalGithub: 'https://github.com/melloom/RocketRam-Website',
      category: 'Tools'
    },
    {
      id: 2,
      title: 'Vocalix',
      description: 'A voice-first Reddit-like platform where anonymity empowers authenticity. Built with React, TypeScript, and Supabase. Features voice posts, audio reactions, live rooms, and community-driven content. Privacy-first with no email required, no tracking—just your voice, your thoughts, and real connections.',
      image: '/Vocalix.png',
      technologies: ['React', 'TypeScript', 'Vite', 'Supabase', 'Tailwind CSS', 'shadcn/ui', 'TanStack Query', 'React Router'],
      link: 'https://vocalix.netlify.app',
      github: 'https://github.com/melloom/Vocalix',
      category: 'Apps'
    },
    {
      id: 3,
      title: 'Long Home - Renovation Company',
      description: 'A modern marketing website for Long Home, a renovation company specializing in roofing and bathroom renovations across the Mid-Atlantic. Built with React, TypeScript, and Tailwind CSS. Features responsive design, service showcases, and professional branding.',
      image: '/longhome-website.png',
      technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'React Router'],
      link: 'https://2026longhome.netlify.app',
      github: 'https://github.com/melloom/LongHome',
      category: 'Demo'
    },
    {
      id: 13,
      title: 'Long Home Confirmation Helper',
      description: 'An Electron-based desktop widget designed to help Long Home team members efficiently handle appointment confirmation calls. Features step-by-step guidance through confirmation workflows, always-on-top draggable window, support for both Bath and Bathroom confirmation types, progress tracking, and a professional interface. Cross-platform support for Windows and macOS with a beautiful landing page for downloads.',
      image: '/0948d153-1159-4d6d-b149-005dac18e725.png',
      technologies: ['Electron', 'Node.js', 'HTML5', 'CSS3', 'JavaScript', 'Netlify'],
      link: 'https://quickconfirm.netlify.app',
      github: 'https://github.com/melloom/Confirmation-Widgit',
      category: 'Tools'
    },
    {
      id: 4,
      title: 'GhostInbox',
      description: 'An anonymous venting platform where creators can receive anonymous messages from their audience. Features creator dashboards, message management, AI-powered reply templates, and theme summarization. Built with React, TypeScript, and Supabase.',
      image: '/ghostinbox-website.png',
      technologies: ['React', 'TypeScript', 'Vite', 'Supabase', 'CSS', 'React Router'],
      link: 'https://ghost-inbox.vercel.app',
      github: 'https://github.com/melloom/GhostInbox',
      category: 'Apps'
    },
    {
      id: 5,
      title: 'BrandSaaS',
      description: 'A modern, AI-powered SaaS Name Generator with domain checking, favorites, export, and more. Built with React, Vite, and TypeScript.',
      image: '/BrandSaaS.png',
      technologies: ['React', 'Vite', 'TypeScript', 'Cohere API', 'Netlify', 'CSS Modules'],
      link: 'https://brandsaas.netlify.app',
      github: 'https://github.com/melloom/BrandSaaS.co',
      category: 'Apps'
    },
    {
      id: 6,
      title: 'mellowsites',
      description: 'My personal portfolio website built with React, showcasing my skills, experience, and projects. Features a modern, responsive design with dark/light mode and smooth animations.',
      image: '/mellowsites_melvin_peralta_fixed.png',
      technologies: ['React', 'Vite', 'CSS Modules', 'Netlify'],
      link: 'https://melvinworks.netlify.app',
      github: 'https://github.com/melloom/my-resume-website',
      category: 'Websites'
    },
    {
      id: 7,
      title: 'CloseLoop Training Platform',
      description: 'A comprehensive training platform for on-call phone backend and frontend support. Features include user authentication, training modules, and progress tracking.',
      image: '/closeloop-portfolio-thumbnail.png',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
      link: 'https://closeloop.netlify.app',
      github: 'https://github.com/melloom/closeloop',
      category: 'Apps'
    },
    {
      id: 8,
      title: 'Lockora Password Generator',
      description: 'A secure password generator and manager application. Features include password strength analysis, secure storage, and easy password generation.',
      image: '/lockora-portfolio-thumbnail.png',
      technologies: ['React', 'JavaScript', 'CSS', 'LocalStorage'],
      link: 'https://lockora.netlify.app',
      github: 'https://github.com/melloom/lockora',
      category: 'Tools'
    },
    {
      id: 9,
      title: 'MelHub Social Links',
      description: 'A centralized hub for all my social media and professional links. Features a clean, minimalist design with customizable themes and analytics.',
      image: '/melhub-portfolio-thumbnail.png',
      technologies: ['React', 'Vite', 'CSS', 'Netlify'],
      link: 'https://melhub.netlify.app',
      github: 'https://github.com/melloom/melhub',
      category: 'Websites'
    },
    {
      id: 10,
      title: 'NumixPro Calculator',
      description: 'An advanced calculator application with comprehensive mathematical functions and operations. Features a modern interface, scientific calculations, memory functions, and history tracking for complex mathematical computations.',
      image: '/numix.png',
      technologies: ['JavaScript', 'HTML5', 'CSS3', 'Netlify'],
      link: 'https://numixpro.netlify.app',
      github: 'https://github.com/melloom/Numix',
      category: 'Tools'
    },
    {
      id: 11,
      title: 'Would You Rather Survival',
      description: 'A chilling local horror adventure game where an all-knowing AI tests your survival instincts through impossible choices. Features psychological horror, adaptive AI personalities, and multiple game modes.',
      image: '/would you rather.png',
      technologies: ['JavaScript', 'React', 'CSS3', 'Vite'],
      link: 'https://wouldyouratherio.netlify.app',
      github: 'https://github.com/melloom/adventure-game',
      category: 'Apps'
    },
  ], []);

  // Handle project deletion - memoized
  const handleDeleteProject = useCallback((projectId) => {
    // Remove the project from the local state
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    
    // Call the parent's onDeleteProject callback if provided
    if (onDeleteProject) {
      onDeleteProject(projectId);
    }
  }, [onDeleteProject]);

  // Filter projects by category - memoized for performance
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') {
      return projects;
    }
    return projects.filter(project => project.category === activeCategory);
  }, [projects, activeCategory]);

  // Show loading state if user projects are still loading
  const isAnyLoading = isLoading || userProjectsLoading;

  // Combine projects: User projects first, then static projects
  useEffect(() => {
    const combinedProjects = [
      // User-added projects from Firebase (most recent first)
      ...userProjects.map(project => ({
        ...project,
        // Map Firebase project structure to match ProjectCard expectations
        technologies: project.technicalStack || [],
        link: project.liveLink || '',
        github: project.githubLink || '',
        image: project.imageUrl || '/images/default-project.jpg',
        category: project.category || 'Other'
      })),
      // Static projects
      ...staticProjects
    ];

    setProjects(combinedProjects);
    setIsLoading(false);
  }, [userProjects, staticProjects]);

  // Handle category change - memoized
  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
  }, []);

  return (
    <section className={styles.projectList}>
      {/* Category Filter Navigation */}
      <div className={styles.filterContainer}>
        <div className={styles.filterNav}>
          {categories.map(category => (
            <button
              key={category}
              className={`${styles.filterButton} ${activeCategory === category ? styles.active : ''}`}
              onClick={() => handleCategoryChange(category)}
              aria-label={`Filter projects by ${category}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.container}>
        {/* Special Demos Section - show only on All to keep Demo filter clean */}
        {activeCategory === 'All' && (
          <Suspense fallback={
            <div className={styles.loadingCard}>
              <div className={styles.cardSkeleton}></div>
            </div>
          }>
            <SpecialDemos />
          </Suspense>
        )}

        {isAnyLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No projects found</h3>
            <p>{activeCategory === 'All' ? 'Projects will appear here once they\'re added.' : `No ${activeCategory.toLowerCase()} projects found.`}</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <MemoizedProjectCard 
              key={project.id} 
              project={project} 
              isLoading={isAnyLoading}
              onDelete={handleDeleteProject}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default ProjectList; 