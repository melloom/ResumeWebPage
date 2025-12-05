import React, { useState, useEffect } from 'react';
import ProjectCard from '../ProjectCard/ProjectCard';
import styles from './ProjectList.module.css';

const ProjectList = ({ userProjects = [], isLoading: userProjectsLoading = false, onDeleteProject }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Static projects data
  const staticProjects = [
    {
      id: 1,
      title: 'Vocalix',
      description: 'A voice-first Reddit-like platform where anonymity empowers authenticity. Built with React, TypeScript, and Supabase. Features voice posts, audio reactions, live rooms, and community-driven content. Privacy-first with no email required, no tracking—just your voice, your thoughts, and real connections.',
      image: '/Vocalix.png',
      technologies: ['React', 'TypeScript', 'Vite', 'Supabase', 'Tailwind CSS', 'shadcn/ui', 'TanStack Query', 'React Router'],
      link: 'https://vocalix.netlify.app',
      github: 'https://github.com/melloom/Echo-Garden'
    },
    {
      id: 2,
      title: 'BrandSaaS',
      description: 'A modern, AI-powered SaaS Name Generator with domain checking, favorites, export, and more. Built with React, Vite, and TypeScript.',
      image: '/screenshots/BrandSaaS.png',
      technologies: ['React', 'Vite', 'TypeScript', 'Cohere API', 'Netlify', 'CSS Modules'],
      link: 'https://brandsaas.netlify.app',
      github: 'https://github.com/melloom/BrandSaaS.co'
    },
    {
      id: 3,
      title: 'Personal Portfolio',
      description: 'My personal portfolio website built with React, showcasing my skills, experience, and projects. Features a modern, responsive design with dark/light mode and smooth animations.',
      image: '/screenshots/portfolio-portfolio-thumbnail.png',
      technologies: ['React', 'Vite', 'CSS Modules', 'Netlify'],
      link: 'https://melvinworks.netlify.app',
      github: 'https://github.com/melloom/my-resume-website'
    },
    {
      id: 4,
      title: 'CloseLoop Training Platform',
      description: 'A comprehensive training platform for on-call phone backend and frontend support. Features include user authentication, training modules, and progress tracking.',
      image: '/screenshots/closeloop-portfolio-thumbnail.png',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
      link: 'https://closeloop.netlify.app',
      github: 'https://github.com/melloom/closeloop'
    },
    {
      id: 5,
      title: 'Lockora Password Generator',
      description: 'A secure password generator and manager application. Features include password strength analysis, secure storage, and easy password generation.',
      image: '/screenshots/lockora-portfolio-thumbnail.png',
      technologies: ['React', 'JavaScript', 'CSS', 'LocalStorage'],
      link: 'https://lockora.netlify.app',
      github: 'https://github.com/melloom/lockora'
    },
    {
      id: 6,
      title: 'MelHub Social Links',
      description: 'A centralized hub for all my social media and professional links. Features a clean, minimalist design with customizable themes and analytics.',
      image: '/screenshots/melhub-portfolio-thumbnail.png',
      technologies: ['React', 'Vite', 'CSS', 'Netlify'],
      link: 'https://melhub.netlify.app',
      github: 'https://github.com/melloom/melhub'
    },
    {
      id: 7,
      title: 'NumixPro Calculator',
      description: 'An advanced calculator application with comprehensive mathematical functions and operations. Features a modern interface, scientific calculations, memory functions, and history tracking for complex mathematical computations.',
      image: '/screenshots/numix.png',
      technologies: ['JavaScript', 'HTML5', 'CSS3', 'Netlify'],
      link: 'https://numixpro.netlify.app',
      github: 'https://github.com/melloom/Numix'
    },
    {
      id: 8,
      title: 'Would You Rather Survival',
      description: 'A chilling local horror adventure game where an all-knowing AI tests your survival instincts through impossible choices. Features psychological horror, adaptive AI personalities, and multiple game modes.',
      image: '/screenshots/would-you-rather-survival-thumbnail.png',
      technologies: ['JavaScript', 'React', 'CSS3', 'Vite'],
      link: 'https://wouldyouratherio.netlify.app',
      github: 'https://github.com/melloom/adventure-game'
    },
    {
      id: 9,
      title: 'WiredLiving Blog',
      description: 'A personal blog about technology and modern living. Features fresh insights weekly, practical advice, and community-driven content about digital wellness and productivity.',
      image: '/screenshots/WIREDLIVING.png',
      technologies: ['Next.js', 'NextAuth', 'Node.js', 'Vercel'],
      link: 'https://wiredliving.blog',
      github: 'https://github.com/melloom/Blog'
    }
  ];

  // Handle project deletion
  const handleDeleteProject = (projectId) => {
    // Remove the project from the local state
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    
    // Call the parent's onDeleteProject callback if provided
    if (onDeleteProject) {
      onDeleteProject(projectId);
    }
  };

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
        image: project.imageUrl || '/images/default-project.jpg'
      })),
      // Static projects
      ...staticProjects
    ];

    setProjects(combinedProjects);
    setIsLoading(false);
  }, [userProjects]);

  // Show loading state if user projects are still loading
  const isAnyLoading = isLoading || userProjectsLoading;

  return (
    <section className={styles.projectList}>
      <div className={styles.container}>
        {isAnyLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No projects found</h3>
            <p>Projects will appear here once they're added.</p>
          </div>
        ) : (
          projects.map(project => (
            <ProjectCard 
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