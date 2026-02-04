import React, { useState, useEffect } from 'react';
import { FaGithub, FaExternalLinkAlt, FaCode, FaTag, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { deleteProject } from '../../../services/projectService';
import styles from './ProjectCard.module.css';

const ProjectCard = ({ project, isLoading: parentLoading, onDelete }) => {
  const { isAuthenticated } = useAuth();
  const { 
    title, 
    description, 
    technicalStack,
    image, 
    technologies, 
    link, 
    github,
    liveLink,
    githubLink,
    additionalGithub,
    imageUrl
  } = project;
  
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use the appropriate image source
  const projectImage = imageUrl || image || '/screenshots/portfolio-portfolio-thumbnail.png';
  
  // Use the appropriate links
  const projectLink = liveLink || link || '';
  const projectGithub = githubLink || github || '';
  
  // Use the appropriate technologies
  const projectTechnologies = technicalStack || technologies || [];
  
  // Use the appropriate description
  const projectDescription = description || '';

  // Check if this is a user-added project (has an id that's not a number)
  const isUserProject = project.id && typeof project.id === 'string' && project.id.length > 10;

  useEffect(() => {
    if (projectImage) {
      setIsLoading(true);
      setImageError(false);
    }
  }, [projectImage]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };


  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isUserProject) {
      alert('Static projects cannot be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const result = await deleteProject(project.id);
      
      if (result.success) {
        // Call the parent's onDelete callback to update the UI
        if (onDelete) {
          onDelete(project.id);
        }
      } else {
        alert('Failed to delete project. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('An error occurred while deleting the project.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className={`${styles.card} ${isHovered ? styles.cardHovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        {!imageLoaded && (isLoading || parentLoading) && (
          <div className={styles.imageLoader}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>Loading project preview...</span>
          </div>
        )}
        {imageError ? (
          <div className={styles.fallbackImage}>
            <FaCode size={48} />
            <span>{title}</span>
          </div>
        ) : (
          projectImage && (
            <img 
              src={projectImage} 
              alt={title} 
              className={styles.image} 
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              style={{ objectFit: 'contain' }}
            />
          )
        )}
        <div className={styles.imageOverlay}>
          <div className={styles.projectStats}>
            <div className={styles.stat}>
              <FaTag />
              <span>View Project</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.links}>
            {isAuthenticated && isUserProject && (
              <button
                className={`${styles.link} ${styles.deleteButton}`}
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label={`Delete ${title}`}
                title="Delete project"
              >
                {isDeleting ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <FaTrash />
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            {projectLink && (
              <a 
                href={projectLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`${styles.link} ${styles.demoLink}`}
                aria-label={`View live demo of ${title}`}
              >
                <FaExternalLinkAlt /> Demo
              </a>
            )}
            {projectGithub && (
              <a 
                href={projectGithub} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`${styles.link} ${styles.githubLink}`}
                aria-label={`View desktop app source code of ${title}`}
              >
                <FaGithub /> {additionalGithub ? 'Desktop App' : 'Code'}
              </a>
            )}
            {additionalGithub && (
              <a 
                href={additionalGithub} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`${styles.link} ${styles.githubLink}`}
                aria-label={`View landing page source code of ${title}`}
              >
                <FaGithub /> Landing Page
              </a>
            )}
          </div>
        </div>

        <p className={styles.description}>{projectDescription}</p>

        <div className={styles.technologies}>
          {projectTechnologies.map((tech, index) => (
            <span key={index} className={styles.tech}>
              <FaTag className={styles.techIcon} />
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 