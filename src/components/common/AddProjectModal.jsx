import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPlus, FaGithub, FaGlobe, FaCode, FaList, FaFileAlt, FaUpload, FaImage } from 'react-icons/fa';
import { addProject } from '../../services/projectService';
import styles from './AddProjectModal.module.css';

const AddProjectModal = ({ isOpen, onClose, onProjectAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    overview: '',
    keyFeatures: '',
    technicalStack: '',
    githubLink: '',
    liveLink: '',
    imageUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset form when modal opens
      setFormData({
        title: '',
        description: '',
        overview: '',
        keyFeatures: '',
        technicalStack: '',
        githubLink: '',
        liveLink: '',
        imageUrl: ''
      });
      setErrors({});
      setUploadedFile(null);
      setIsDragOver(false);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      
      // Validate file size (max 5MB for preview)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setUploadedFile(file);
      
      // Create a preview URL for display only
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imageUrl: e.target.result // This is just for preview, not stored
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (!formData.overview.trim()) {
      newErrors.overview = 'Project overview is required';
    }

    if (!formData.keyFeatures.trim()) {
      newErrors.keyFeatures = 'Key features are required';
    }

    if (!formData.technicalStack.trim()) {
      newErrors.technicalStack = 'Technical stack is required';
    }

    // At least one link should be provided
    if (!formData.githubLink.trim() && !formData.liveLink.trim()) {
      newErrors.githubLink = 'At least one link (GitHub or Live) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare project data
      const projectData = {
        title: formData.title,
        description: formData.description,
        overview: formData.overview,
        keyFeatures: formData.keyFeatures.split('\n').filter(feature => feature.trim()),
        technicalStack: formData.technicalStack.split(',').map(tech => tech.trim()),
        githubLink: formData.githubLink,
        liveLink: formData.liveLink,
        imageUrl: formData.imageUrl || '/screenshots/portfolio-portfolio-thumbnail.png' // Use uploaded image or default
      };

      // Add project to Firebase Firestore
      const result = await addProject(projectData);
      
      if (result.success) {
        // Call the callback to add the project to local state
        onProjectAdded(result.project);
        
        // Close modal
        onClose();
      } else {
        // Handle error
        console.error('Failed to add project:', result.error);
        // You could show an error message here
      }
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        <div className={styles.modalCard}>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
          
          <div className={styles.header}>
            <div className={styles.iconContainer}>
              <FaPlus className={styles.icon} />
            </div>
            <h1 className={styles.title}>Add New Project</h1>
            <p className={styles.subtitle}>Create a new project for your portfolio</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              {/* Project Title */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FaFileAlt className={styles.labelIcon} />
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter project title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                />
                {errors.title && (
                  <span className={styles.errorMessage}>{errors.title}</span>
                )}
              </div>

              {/* Project Description */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FaFileAlt className={styles.labelIcon} />
                  Short Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Brief description of the project"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                  rows="3"
                />
                {errors.description && (
                  <span className={styles.errorMessage}>{errors.description}</span>
                )}
              </div>

              {/* Project Overview */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FaFileAlt className={styles.labelIcon} />
                  Project Overview *
                </label>
                <textarea
                  name="overview"
                  placeholder="Detailed overview of the project"
                  value={formData.overview}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${errors.overview ? styles.inputError : ''}`}
                  rows="4"
                />
                {errors.overview && (
                  <span className={styles.errorMessage}>{errors.overview}</span>
                )}
              </div>

              {/* Key Features */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FaList className={styles.labelIcon} />
                  Key Features *
                </label>
                <textarea
                  name="keyFeatures"
                  placeholder="Enter key features (one per line)"
                  value={formData.keyFeatures}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${errors.keyFeatures ? styles.inputError : ''}`}
                  rows="4"
                />
                <small className={styles.helpText}>Enter each feature on a new line</small>
                {errors.keyFeatures && (
                  <span className={styles.errorMessage}>{errors.keyFeatures}</span>
                )}
              </div>

              {/* Technical Stack */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FaCode className={styles.labelIcon} />
                  Technical Stack *
                </label>
                <input
                  type="text"
                  name="technicalStack"
                  placeholder="React, Node.js, MongoDB, etc."
                  value={formData.technicalStack}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.technicalStack ? styles.inputError : ''}`}
                />
                <small className={styles.helpText}>Separate technologies with commas</small>
                {errors.technicalStack && (
                  <span className={styles.errorMessage}>{errors.technicalStack}</span>
                )}
              </div>

              {/* Project Image Upload */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FaImage className={styles.labelIcon} />
                  Project Image
                </label>
                <div 
                  className={`${styles.fileUploadArea} ${isDragOver ? styles.dragOver : ''} ${uploadedFile ? styles.hasFile : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedFile ? (
                    <div className={styles.uploadedFile}>
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className={styles.filePreview}
                      />
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>{uploadedFile.name}</span>
                        <span className={styles.fileSize}>
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button 
                        type="button" 
                        className={styles.removeFile}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUploadedFile();
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPrompt}>
                      <FaUpload className={styles.uploadIcon} />
                      <p>Drag & drop an image here or click to browse</p>
                      <small>Supports: JPG, PNG, GIF (Max 5MB)</small>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className={styles.fileInput}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Links Section */}
              <div className={styles.linksSection}>
                <h3 className={styles.sectionTitle}>Project Links</h3>
                
                <div className={styles.linkGroup}>
                  <label className={styles.label}>
                    <FaGithub className={styles.labelIcon} />
                    GitHub Repository
                  </label>
                  <input
                    type="url"
                    name="githubLink"
                    placeholder="https://github.com/username/project"
                    value={formData.githubLink}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.githubLink ? styles.inputError : ''}`}
                  />
                </div>

                <div className={styles.linkGroup}>
                  <label className={styles.label}>
                    <FaGlobe className={styles.labelIcon} />
                    Live Website
                  </label>
                  <input
                    type="url"
                    name="liveLink"
                    placeholder="https://your-project.com"
                    value={formData.liveLink}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                {errors.githubLink && (
                  <span className={styles.errorMessage}>{errors.githubLink}</span>
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Adding Project...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Add Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal; 