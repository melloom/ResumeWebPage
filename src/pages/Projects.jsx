import React from 'react';
import ProjectHero from '../components/projects/ProjectHero/ProjectHero';
import ProjectList from '../components/projects/ProjectList/ProjectList';
import styles from './Projects.module.css';

const Projects = ({ userProjects = [], isLoading = false, onProjectDeleted }) => {
  return (
    <div className={styles.projectsPage}>
      <ProjectHero />
      <ProjectList 
        userProjects={userProjects} 
        isLoading={isLoading} 
        onDeleteProject={onProjectDeleted}
      />
    </div>
  );
};

export default Projects; 