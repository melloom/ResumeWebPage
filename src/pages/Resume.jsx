import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaFileDownload } from 'react-icons/fa';
import SideNav from '../components/navigation/SideNav';
import BackToTop from '../components/common/BackToTop';
import MobileNavDrawer from '../components/navigation/MobileNavDrawer';
import ShareButton from '../components/common/ShareButton';
import ResumeHeader from '../components/Resume/header/ResumeHeader';
import ProfessionalSummary from '../components/Resume/ProfessionalSummary/ProfessionalSummary';
import ResumeSkills from '../components/Resume/ResumeSkills/ResumeSkills';
import ResumeExperience from '../components/Resume/ResumeExperience/ResumeExperience';
import ResumeEducation from '../components/Resume/ResumeEducation/ResumeEducation';
import ResumeCertifications from '../components/Resume/ResumeCertifications/ResumeCertifications';
import styles from './Resume.module.css';

const Resume = () => {
  // Reset scroll position on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants for staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const sectionVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Melvin Peralta | Professional Resume</title>
        <meta name="description" content="Professional resume of Melvin Peralta - Sales Development Representative with expertise in team leadership and client relationship management." />
      </Helmet>

      <SideNav />
      <BackToTop />
      <MobileNavDrawer />
      
      {/* Action buttons - Download and Share Resume - Positioned at bottom right */}
      <div className={styles.stickyActions}>
        <a 
          href="/images/school/Resume/Resume.pdf" 
          download="Melvin_Peralta_Resume.pdf"
          className={styles.stickyDownload}
          aria-label="Download Resume PDF"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFileDownload />
          <span>Download CV</span>
        </a>
        
        {/* Share Resume Button with explicit icon rendering */}
        <ShareButton 
          type="resume" 
          className={styles.stickyShare} 
          showLabel={true}
          title="Melvin Peralta | Professional Resume"
          text="Check out Melvin Peralta's professional resume!"
          forceShowIcon={true} // Add this prop to force icon display
        />
      </div>

      <main className={styles.resumePage} id="top">
        <div className={styles.resumeBackground}></div>
        
        <div className="container">
          <motion.div
            className={styles.resumeContainer}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Resume Header - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="resume-header">
              <ResumeHeader />
            </motion.div>
            
            {/* Professional Summary Section - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="summary">
              <ProfessionalSummary />
            </motion.div>
            
            {/* Experience Section - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="experience">
              <ResumeExperience />
            </motion.div>
            
            {/* Skills Section - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="skills">
              <ResumeSkills />
            </motion.div>
            
            {/* Education Section - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="education">
              <ResumeEducation />
            </motion.div>
            
            {/* Certifications Section - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="certifications">
              <ResumeCertifications />
            </motion.div>
            
            {/* Call to Action - Use a known ID */}
            <motion.div variants={sectionVariants} className={styles.resumeCta} id="contact">
              <p className={styles.ctaText}>
                Interested in discussing how my skills can contribute to your team?
              </p>
              <div className={styles.ctaButtons}>
                <a href="/contact" className={styles.ctaPrimary}>Contact Me</a>
                <a 
                  href="/images/school/Resume/Resume.pdf" 
                  download="Melvin_Peralta_Resume.pdf"
                  className={styles.ctaSecondary}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Resume;