import React, { useState, useEffect } from 'react';
import { FaGithub, FaExternalLinkAlt, FaCode, FaStar, FaEye, FaCalendarAlt, FaTag, FaTrash, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { deleteProject } from '../../../services/projectService';
import styles from './ProjectCard.module.css';

const ProjectCard = ({ project, isLoading: parentLoading, onDelete }) => {
  const { isAuthenticated } = useAuth();
  const { 
    title, 
    description, 
    overview, 
    keyFeatures, 
    technicalStack,
    image, 
    technologies, 
    link, 
    github,
    liveLink,
    githubLink,
    imageUrl,
    createdAt
  } = project;
  
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
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
  const projectOverview = overview || description || '';

  // Remove mock data for project stats
  const projectStats = {
    stars: 0,
    views: 0,
    lastUpdated: createdAt || ''
  };

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

  const toggleDetails = (e) => {
    e.preventDefault();
    setShowDetails(!showDetails);
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
                aria-label={`View source code of ${title}`}
              >
                <FaGithub /> Code
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

        <button 
          className={styles.detailsButton}
          onClick={toggleDetails}
          aria-expanded={showDetails}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>

        {showDetails && (
          <div className={styles.details}>
            <div className={styles.detailSection}>
              <h4>Project Overview</h4>
              <p>{projectOverview}</p>
            </div>
            {keyFeatures && keyFeatures.length > 0 && (
            <div className={styles.detailSection}>
              <h4>Key Features</h4>
              <ul className={styles.featureList}>
                  {keyFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
              </ul>
            </div>
            )}
            <div className={styles.detailSection}>
              <h4>Technical Stack</h4>
              <div className={styles.techGrid}>
                {projectTechnologies.map((tech, index) => (
                  <div key={index} className={styles.techItem}>
                    <FaCode className={styles.techIcon} />
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>
            {createdAt && (
              <div className={styles.detailSection}>
                <h4>Created</h4>
                <p>{new Date(createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard; 